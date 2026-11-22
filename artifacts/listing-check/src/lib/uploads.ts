import { useSyncExternalStore } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { getGetCheckQueryKey, uploadCheckPhoto } from "@workspace/api-client-react";
import { apiError } from "./helpers";

/**
 * Background photo uploads.
 *
 * Analysis takes a few seconds per photo, so uploads run outside the step
 * screen: the seller can move on to the next photo while earlier ones are
 * still being analyzed. Results land in the check query when they finish,
 * even if the seller has already left that step (a component-level mutation
 * would drop the result in that case).
 */
export type UploadState =
  | { status: "pending"; startedAt: number }
  | { status: "error"; message: string; httpStatus: number | null };

const states = new Map<string, UploadState>();
const listeners = new Set<() => void>();
let version = 0;
const key = (checkId: string, stepId: string) => `${checkId}:${stepId}`;
const emit = () => {
  version++;
  listeners.forEach((l) => l());
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** Latest upload attempt per step wins; an older, slower response is ignored. */
const attempts = new Map<string, number>();

export function startUpload(qc: QueryClient, checkId: string, stepId: string, imageDataUrl: string) {
  const k = key(checkId, stepId);
  const attempt = (attempts.get(k) ?? 0) + 1;
  attempts.set(k, attempt);
  states.set(k, { status: "pending", startedAt: Date.now() });
  emit();
  uploadCheckPhoto(checkId, { stepId, imageDataUrl })
    .then(() => {
      if (attempts.get(k) !== attempt) return;
      states.delete(k);
      emit();
      return qc.invalidateQueries({ queryKey: getGetCheckQueryKey(checkId) });
    })
    .catch((e: unknown) => {
      if (attempts.get(k) !== attempt) return;
      const err = apiError(e);
      states.set(k, { status: "error", message: err.message, httpStatus: err.status });
      emit();
    });
}

export function clearUploadError(checkId: string, stepId: string) {
  const k = key(checkId, stepId);
  if (states.get(k)?.status === "error") {
    states.delete(k);
    emit();
  }
}

export function useUploadState(checkId: string, stepId: string): UploadState | undefined {
  useSyncExternalStore(subscribe, () => version);
  return states.get(key(checkId, stepId));
}

export function usePendingCount(checkId: string): number {
  useSyncExternalStore(subscribe, () => version);
  let n = 0;
  for (const [k, s] of states) if (k.startsWith(`${checkId}:`) && s.status === "pending") n++;
  return n;
}

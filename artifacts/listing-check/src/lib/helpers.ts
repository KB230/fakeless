import { useSyncExternalStore } from "react";

export const BASE = import.meta.env.BASE_URL;
export const asset = (p: string) => `${BASE}${p.replace(/^\//, "")}`;
export const voiceUrl = (id: string) => `${BASE}api/voice/prompts/${id}/audio`;

export function apiError(e: unknown): { status: number | null; message: string } {
  const err = e as { status?: number; data?: { error?: string } | null; message?: string } | null;
  return {
    status: typeof err?.status === "number" ? err.status : null,
    message: err?.data?.error || err?.message || "Something went wrong. Try again.",
  };
}

// 1280px keeps stitching and tag text legible for the vision model while
// cutting upload size (and time on mobile data) by roughly a third.
export async function downscaleImage(file: File, max = 1280, quality = 0.82): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("That file could not be read as an image."));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("Image processing is not supported in this browser.");
    ctx.drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* In-memory store of local previews: live photos are not stored on the server */
const previews = new Map<string, string>();
const listeners = new Set<() => void>();
let version = 0;
export function setPreview(checkId: string, stepId: string, dataUrl: string) {
  previews.set(`${checkId}:${stepId}`, dataUrl);
  version++;
  listeners.forEach((l) => l());
}
export function usePreview(checkId: string, stepId: string): string | undefined {
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
  return previews.get(`${checkId}:${stepId}`);
}

/* Track first user gesture for autoplay rules */
let gestured = false;
if (typeof window !== "undefined") {
  const mark = () => {
    gestured = true;
  };
  window.addEventListener("pointerdown", mark, { once: true, capture: true });
  window.addEventListener("keydown", mark, { once: true, capture: true });
}
export const hasGesture = () => gestured;

export const STEP_LABEL: Record<string, string> = {
  logo: "Logo",
  wash_tag_front: "Wash tag, front",
  wash_tag_back: "Wash tag, back",
  zipper: "Zipper",
  seam_tape: "Seam tape",
};

export const CONDITION_LABEL: Record<string, string> = {
  new_with_tags: "New with tags",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

export const money = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD" }).format(n);

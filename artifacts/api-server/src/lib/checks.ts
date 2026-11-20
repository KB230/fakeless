import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import {
  checkPhotosTable,
  checksTable,
  db,
  type CheckPhotoRow,
  type CheckRow,
} from "@workspace/db";
import {
  GetCheckResponse,
  type Check,
  type CheckDecision,
  type PhotoObservation,
  type StepId,
} from "@workspace/api-zod";
import { getProfileById } from "../config/profiles";
import { decide } from "./rules";

export async function loadCheck(
  id: string,
): Promise<{ check: CheckRow; photos: CheckPhotoRow[] } | null> {
  const [check] = await db.select().from(checksTable).where(eq(checksTable.id, id));
  if (!check) return null;
  const photos = await db
    .select()
    .from(checkPhotosTable)
    .where(eq(checkPhotosTable.checkId, id));
  return { check, photos };
}

export function serializeCheck(check: CheckRow, photos: CheckPhotoRow[]): Check {
  return GetCheckResponse.parse({
    id: check.id,
    mode: check.mode,
    demoCaseId: check.demoCaseId,
    profileId: check.profileId,
    condition: check.condition,
    askingPrice: check.askingPrice,
    currency: check.currency,
    washTagPresent: check.washTagPresent,
    status: check.status,
    decision: check.decision ?? null,
    photos: photos
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((p) => ({
        id: p.id,
        stepId: p.stepId,
        imageUrl: p.imageUrl,
        observation: p.observation,
        createdAt: p.createdAt,
      })),
    publishedAt: check.publishedAt,
    listingId: check.listingId,
    createdAt: check.createdAt,
  });
}

export async function upsertPhoto(
  checkId: string,
  stepId: StepId,
  observation: PhotoObservation,
  imageUrl: string | null,
): Promise<CheckPhotoRow> {
  await db
    .delete(checkPhotosTable)
    .where(and(eq(checkPhotosTable.checkId, checkId), eq(checkPhotosTable.stepId, stepId)));
  const [row] = await db
    .insert(checkPhotosTable)
    .values({ id: randomUUID(), checkId, stepId, imageUrl, observation })
    .returning();
  return row!;
}

/** Runs the backend rules and records the decision on the check. */
export async function evaluateAndRecord(checkId: string): Promise<Check> {
  const loaded = await loadCheck(checkId);
  if (!loaded) throw new Error("Check not found");
  const { check, photos } = loaded;
  const profile = getProfileById(check.profileId);
  if (!profile) throw new Error(`Unknown profile ${check.profileId}`);

  const observations: Partial<Record<StepId, PhotoObservation>> = {};
  for (const p of photos) observations[p.stepId as StepId] = p.observation as PhotoObservation;

  const decision: CheckDecision = decide({
    profile,
    mode: check.mode as "live" | "demo",
    washTagPresent: check.washTagPresent,
    observations,
  });

  const [updated] = await db
    .update(checksTable)
    .set({
      status: decision.outcome,
      decision: { ...decision, decidedAt: decision.decidedAt.toISOString() },
    })
    .where(eq(checksTable.id, checkId))
    .returning();
  return serializeCheck(updated!, photos);
}

/** Any change to evidence invalidates a previous decision (and its pass). */
export async function resetDecision(checkId: string): Promise<void> {
  await db
    .update(checksTable)
    .set({ status: "in_progress", decision: null })
    .where(and(eq(checksTable.id, checkId)));
}

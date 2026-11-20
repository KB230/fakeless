import type { ProductProfile } from "@workspace/api-zod";
import { arcteryxBetaLt } from "./arcteryx-beta-lt";

/**
 * Product profile registry. To add a clothing model, create a profile file
 * next to this one (copy arcteryx-beta-lt.ts as a template), put its
 * reference photos under artifacts/listing-check/public/references/<model>/,
 * and add it to this list.
 */
export const PROFILES: ProductProfile[] = [arcteryxBetaLt];

export function getProfileById(id: string): ProductProfile | undefined {
  return PROFILES.find((p) => p.id === id);
}

export function profileDisplayName(p: ProductProfile): string {
  return `${p.brand} ${p.model}`;
}

import type { Category, ProductProfile, ScreeningTier, TierResolution } from "@workspace/api-zod";
import { arcteryxBetaLt } from "./arcteryx-beta-lt";
import { nikeAf1White } from "./nike-af1-07-white";
import { tnfNuptse } from "./tnf-nuptse";
import { tnfBackpack } from "./tnf-backpack";
import {
  basicScreening,
  handbagsChecklist,
  hatsChecklist,
  outerwearChecklist,
  sneakersChecklist,
  streetwearChecklist,
} from "./categories";

export { PROFILE_SET_VERSION } from "./define";

/**
 * Profile registry: model-specific profiles, category checklists and the
 * basic screening profile. To add a clothing model, create a profile file
 * (copy arcteryx-beta-lt.ts), put its references under
 * artifacts/listing-check/public/references/<model>/, and list it here.
 */
export const PROFILES: ProductProfile[] = [
  arcteryxBetaLt,
  nikeAf1White,
  tnfNuptse,
  tnfBackpack,
  sneakersChecklist,
  streetwearChecklist,
  outerwearChecklist,
  handbagsChecklist,
  hatsChecklist,
  basicScreening,
];

const CATEGORY_DEFS: Array<Omit<Category, "modelProfileIds">> = [
  { id: "sneakers", name: "Sneakers", examples: "Trainers, basketball and running shoes", checklistProfileId: sneakersChecklist.id, supported: true },
  { id: "streetwear", name: "Streetwear", examples: "Hoodies, tees, sweatshirts", checklistProfileId: streetwearChecklist.id, supported: true },
  { id: "outerwear", name: "Outerwear", examples: "Shell jackets, puffers, coats", checklistProfileId: outerwearChecklist.id, supported: true },
  { id: "handbags", name: "Handbags and leather goods", examples: "Bags, backpacks, wallets, belts", checklistProfileId: handbagsChecklist.id, supported: true },
  { id: "hats", name: "Hats and caps", examples: "Baseball caps, fitted caps, beanies", checklistProfileId: hatsChecklist.id, supported: true },
  { id: "other", name: "Something else", examples: "Anything outside these categories", checklistProfileId: basicScreening.id, supported: false },
];

export const CATEGORIES: Category[] = CATEGORY_DEFS.map((c) => ({
  ...c,
  modelProfileIds: PROFILES.filter((p) => p.kind === "model" && p.categoryId === c.id).map((p) => p.id),
}));

export function getProfileById(id: string): ProductProfile | undefined {
  return PROFILES.find((p) => p.id === id);
}

export function profileDisplayName(p: ProductProfile): string {
  return p.kind === "model" ? `${p.brand} ${p.model}` : p.model;
}

export const TIER_TITLE: Record<ScreeningTier, string> = {
  model_specific: "Model-specific check",
  category_checklist: "Category checklist",
  basic_photo: "Basic photo screening",
};

/**
 * The backend chooses the screening tier:
 * - model_specific: an enabled live model profile with sourced references
 * - category_checklist: a supported category without such a profile
 * - basic_photo: anything outside the supported categories
 */
export function resolveTier(categoryId: string, profileId?: string | null): TierResolution {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category || !category.supported) {
    return {
      tier: "basic_photo",
      profileId: basicScreening.id,
      categoryId: "other",
      title: TIER_TITLE.basic_photo,
      note: "This item is outside the supported categories. Photos are checked for usability and readable text only; the brand and model are not verified.",
    };
  }
  const model = profileId ? getProfileById(profileId) : undefined;
  if (model && model.kind === "model" && model.categoryId === category.id && model.liveEnabled) {
    return {
      tier: "model_specific",
      profileId: model.id,
      categoryId: category.id,
      title: TIER_TITLE.model_specific,
      note: `Photos are compared against sourced references for the ${profileDisplayName(model)}.`,
    };
  }
  const why =
    model && model.kind === "model"
      ? `The ${profileDisplayName(model)} profile only has demo references, so it can't be used for a live model check.`
      : "There is no live profile for this exact model yet.";
  return {
    tier: "category_checklist",
    profileId: category.checklistProfileId,
    categoryId: category.id,
    title: TIER_TITLE.category_checklist,
    note: `${why} You'll get the ${category.name.toLowerCase()} checklist: photo usability, visible text and codes, and expected details. The model itself won't be verified.`,
  };
}

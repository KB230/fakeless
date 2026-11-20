import type {
  ExpectedCode,
  InspectionStep,
  PresenceQuestion,
  ProductProfile,
  ReferencePhoto,
  SourceLink,
} from "@workspace/api-zod";

/**
 * Version of the profile/checklist configuration. Bump it whenever a profile,
 * step, presence question or voice instruction changes, so stored decisions
 * can be traced back to the config that produced them.
 */
export const PROFILE_SET_VERSION = "2026-11-20.1";

export type RetakeKind = "blurry" | "cropped" | "angle" | "missing";
export const RETAKE_KINDS: RetakeKind[] = ["blurry", "cropped", "angle", "missing"];

export interface StepDef {
  id: string;
  title: string;
  /** Used in retake prompts: "The {noun} is blurry." */
  noun: string;
  /** Spoken and shown capture instruction. */
  instruction: string;
  /** Short hint appended to every retake prompt for this step. */
  retakeInstruction: string;
  required: boolean;
  presenceQuestionId?: string;
  readsText?: boolean;
  compareCodes?: boolean;
  framingTips?: string[];
  comparisonFocus?: string[];
  references?: ReferencePhoto[];
}

export interface ProfileDef {
  id: string;
  kind: ProductProfile["kind"];
  categoryId: string | null;
  liveEnabled?: boolean;
  brand: string;
  model: string;
  generation: string;
  colorway?: string | null;
  category: string;
  referenceStatus: ProductProfile["referenceStatus"];
  referenceNote: string;
  sources?: SourceLink[];
  expectedCodes?: ExpectedCode[];
  presenceQuestions?: PresenceQuestion[];
  steps: StepDef[];
}

export const captureVoicePromptId = (profileId: string, stepId: string) =>
  `${profileId}.${stepId}`;
export const retakeVoicePromptId = (profileId: string, stepId: string, kind: RetakeKind) =>
  `${profileId}.${stepId}.retake_${kind}`;

export function retakeText(step: Pick<StepDef, "noun" | "retakeInstruction">, kind: RetakeKind): string {
  switch (kind) {
    case "blurry":
      return `The ${step.noun} is blurry. Hold the phone still, tap to focus, and try again. ${step.retakeInstruction}`;
    case "cropped":
      return `Part of the ${step.noun} is cut off or too far away. ${step.retakeInstruction}`;
    case "angle":
      return `The ${step.noun} was taken from an angle or in light we can't use. Shoot straight on, avoid glare and shadows, and try again. ${step.retakeInstruction}`;
    case "missing":
      return `We still need the ${step.noun}. ${step.retakeInstruction}`;
  }
}

/** Step definitions keyed by `${profileId}.${stepId}`, for retake prompts. */
export const STEP_DEFS = new Map<string, StepDef>();

export function defineProfile(def: ProfileDef): ProductProfile {
  const steps: InspectionStep[] = def.steps.map((s) => {
    STEP_DEFS.set(`${def.id}.${s.id}`, s);
    return {
      id: s.id,
      title: s.title,
      instruction: s.instruction,
      retakeInstruction: s.retakeInstruction,
      voicePromptId: captureVoicePromptId(def.id, s.id),
      framingTips: s.framingTips ?? [],
      required: s.required,
      presenceQuestionId: s.presenceQuestionId ?? null,
      readsText: s.readsText ?? false,
      compareCodes: s.compareCodes ?? false,
      comparisonFocus: s.comparisonFocus ?? [],
      references: s.references ?? [],
    };
  });
  return {
    id: def.id,
    kind: def.kind,
    version: PROFILE_SET_VERSION,
    categoryId: def.categoryId,
    liveEnabled: def.liveEnabled ?? false,
    brand: def.brand,
    model: def.model,
    generation: def.generation,
    colorway: def.colorway ?? null,
    category: def.category,
    referenceStatus: def.referenceStatus,
    referenceNote: def.referenceNote,
    sources: def.sources ?? [],
    expectedCodes: def.expectedCodes ?? [],
    presenceQuestions: def.presenceQuestions ?? [],
    steps,
  };
}

/* Shared presence questions */
export const WASH_TAG_QUESTION: PresenceQuestion = {
  id: "wash_tag",
  question: "Does the item have an inside wash or care tag?",
  help: "Usually sewn into an inside side seam. If yes, you will photograph the front and the back of it.",
  expected: true,
  absentNote: "Items in this category normally have one. If you answer No, the listing will go to manual review.",
};

export const SIZE_TAG_QUESTION: PresenceQuestion = {
  id: "size_tag",
  question: "Does the item have an inside size tag?",
  help: "A printed or sewn tag with the size, usually inside the tongue or collar, or on the sweatband.",
  expected: true,
  absentNote: "Items in this category normally have one. If you answer No, the listing will go to manual review.",
};

/** Category checklists never use model references. */
export const CATEGORY_REFERENCE_NOTE =
  "Category checklist: photos are checked for usability, visible text and codes, and the presence of expected details. There is no model reference, so the exact model is not verified.";

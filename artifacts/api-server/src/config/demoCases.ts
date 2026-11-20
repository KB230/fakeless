import type { DemoCase, PhotoObservation, StepId } from "@workspace/api-zod";

/**
 * Demo cases use pre-recorded sample observations (no uploads, no vision
 * call) and are evaluated by the same backend rules as live checks.
 * Photos are demo images served by the web app. Demo checks are stored with
 * mode = "demo" and never count toward live stats or live publishing.
 */

interface DemoCaseDef extends DemoCase {
  condition: "new_with_tags" | "like_new" | "good" | "fair";
  askingPrice: number;
  washTagPresent: boolean;
  photos: Partial<Record<StepId, { imageUrl: string; observation: PhotoObservation }>>;
}

const goodQuality = (note: string) => ({ usable: true, issues: [], note });

const LOGO_OK: PhotoObservation = {
  quality: goodQuality("Full logo and wordmark in frame, sharp, even light."),
  extractedText: "AVIAN",
  codes: [],
  visibleDetails: [
    "Embroidered bird emblem with uppercase wordmark centered below",
    "Even stitch density, clean letter edges",
    "Letter spacing and alignment consistent with the reference",
  ],
  differences: [],
  comparisonReliable: true,
  uncertaintyNote: null,
  summary: "Logo and wordmark match the demo reference in lettering, spacing and alignment.",
};

const TAG_FRONT_OK_TEXT = [
  "MADE IN BANGLADESH",
  "RN 98765 | CA# 43210",
  "STYLE CODE: LC-SAMPLE-29090",
  "SHELL: 100% NYLON",
  "MACHINE WASH COLD / GENTLE CYCLE",
].join("\n");

const TAG_FRONT_OK: PhotoObservation = {
  quality: goodQuality("Tag laid flat, all lines legible."),
  extractedText: TAG_FRONT_OK_TEXT,
  codes: [
    { value: "LC-SAMPLE-29090", codeType: "style_code", purposeIdentified: true, confidence: "high" },
    { value: "98765", codeType: "rn_number", purposeIdentified: true, confidence: "high" },
    { value: "43210", codeType: "ca_number", purposeIdentified: true, confidence: "high" },
  ],
  visibleDetails: ["Style code line labeled 'STYLE CODE'", "Crisp black print on satin"],
  differences: [],
  comparisonReliable: true,
  uncertaintyNote: null,
  summary: "Style code is readable and labeled.",
};

const TAG_BACK_OK: PhotoObservation = {
  quality: goodQuality("Reverse side flat and legible."),
  extractedText: "CARE INSTRUCTIONS / ENTRETIEN\nDO NOT BLEACH\nTUMBLE DRY LOW\nDO NOT IRON",
  codes: [],
  visibleDetails: ["Multilingual care text", "Five laundering symbols"],
  differences: [],
  comparisonReliable: true,
  uncertaintyNote: null,
  summary: "Care text and symbols are legible.",
};

const ZIPPER_OK: PhotoObservation = {
  quality: goodQuality("Pull tab and top of zipper in frame."),
  extractedText: "",
  codes: [],
  visibleDetails: ["Coated matte black zipper", "Rubberized pull tab", "Zipper garage at top"],
  differences: [],
  comparisonReliable: true,
  uncertaintyNote: null,
  summary: "Zipper hardware and placement are consistent with the demo reference.",
};

const SEAM_OK: PhotoObservation = {
  quality: goodQuality("Straight run of seam tape, in focus."),
  extractedText: "",
  codes: [],
  visibleDetails: ["Narrow, even seam tape", "Clean adhesion along both edges"],
  differences: [],
  comparisonReliable: true,
  uncertaintyNote: null,
  summary: "Seam tape width and placement look consistent with the demo reference.",
};

const TAG_FRONT_BLURRY: PhotoObservation = {
  quality: {
    usable: false,
    issues: ["blurry"],
    note: "Motion blur across the tag; the code line can't be read.",
  },
  extractedText: "MADE IN ... / STYLE ...",
  codes: [],
  visibleDetails: ["White care tag visible but out of focus"],
  differences: [],
  comparisonReliable: false,
  uncertaintyNote: "Text is not legible, so the code could not be compared.",
  summary: "The wash tag photo is too blurry to read the code.",
};

const TAG_FRONT_MISMATCH: PhotoObservation = {
  quality: goodQuality("Tag flat, sharp, every line legible."),
  extractedText: [
    "MADE IN CHINA",
    "RN 11223",
    "STYLE CODE: LC-SAMPLE-71143",
    "100% POLYESTER",
    "WASH WARM",
  ].join("\n"),
  codes: [
    { value: "LC-SAMPLE-71143", codeType: "style_code", purposeIdentified: true, confidence: "high" },
    { value: "11223", codeType: "rn_number", purposeIdentified: true, confidence: "high" },
  ],
  visibleDetails: ["Style code line labeled 'STYLE CODE'", "Slightly glossy tag stock"],
  differences: [],
  comparisonReliable: true,
  uncertaintyNote: null,
  summary: "Style code is clearly readable.",
};

export const DEMO_CASES: DemoCaseDef[] = [
  {
    id: "pass",
    title: "Clean jacket, all evidence present",
    description:
      "Sharp photos of the logo, both sides of the wash tag, zipper and seam tape. The sample style code matches the demo reference. Ends with a mock publish.",
    expectedOutcome: "passed",
    profileId: "arcteryx-beta-lt",
    condition: "like_new",
    askingPrice: 240,
    washTagPresent: true,
    photos: {
      logo: { imageUrl: "demo/logo.jpg", observation: LOGO_OK },
      wash_tag_front: { imageUrl: "demo/wash-tag-front.jpg", observation: TAG_FRONT_OK },
      wash_tag_back: { imageUrl: "demo/wash-tag-back.jpg", observation: TAG_BACK_OK },
      zipper: { imageUrl: "demo/zipper.jpg", observation: ZIPPER_OK },
      seam_tape: { imageUrl: "demo/seam-tape.jpg", observation: SEAM_OK },
    },
  },
  {
    id: "blurry-tag",
    title: "Blurry wash tag",
    description:
      "Everything else is fine, but the front of the wash tag is too blurry to read. The seller gets a spoken retake prompt (when voice is configured) and the same instruction on screen.",
    expectedOutcome: "retake_requested",
    profileId: "arcteryx-beta-lt",
    condition: "good",
    askingPrice: 195,
    washTagPresent: true,
    photos: {
      logo: { imageUrl: "demo/logo.jpg", observation: LOGO_OK },
      wash_tag_front: { imageUrl: "demo/wash-tag-blurry.jpg", observation: TAG_FRONT_BLURRY },
      wash_tag_back: { imageUrl: "demo/wash-tag-back.jpg", observation: TAG_BACK_OK },
      zipper: { imageUrl: "demo/zipper.jpg", observation: ZIPPER_OK },
      seam_tape: { imageUrl: "demo/seam-tape.jpg", observation: SEAM_OK },
    },
  },
  {
    id: "code-mismatch",
    title: "Readable style code that doesn't match",
    description:
      "The wash tag is sharp and the style code is clearly labeled, but it conflicts with the reference for this release. The listing goes to manual review.",
    expectedOutcome: "manual_review",
    profileId: "arcteryx-beta-lt",
    condition: "new_with_tags",
    askingPrice: 160,
    washTagPresent: true,
    photos: {
      logo: { imageUrl: "demo/logo.jpg", observation: LOGO_OK },
      wash_tag_front: { imageUrl: "demo/wash-tag-mismatch-front.jpg", observation: TAG_FRONT_MISMATCH },
      wash_tag_back: { imageUrl: "demo/wash-tag-back.jpg", observation: TAG_BACK_OK },
      zipper: { imageUrl: "demo/zipper.jpg", observation: ZIPPER_OK },
      seam_tape: { imageUrl: "demo/seam-tape.jpg", observation: SEAM_OK },
    },
  },
];

export function getDemoCase(id: string): DemoCaseDef | undefined {
  return DEMO_CASES.find((c) => c.id === id);
}

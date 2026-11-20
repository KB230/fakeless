import type { DemoCase, PhotoObservation } from "@workspace/api-zod";
import { resolveTier } from "./profiles";

/**
 * Demo cases use pre-recorded sample observations (no uploads, no vision
 * call) and are evaluated by the same backend rules as live checks.
 * Photos are demo images served by the web app. Demo checks are stored with
 * mode = "demo" and never count toward live stats or live publishing.
 */

interface DemoCaseDef extends DemoCase {
  categoryId: string;
  tierNote: string;
  condition: "new_with_tags" | "like_new" | "good" | "fair";
  askingPrice: number;
  presence: Record<string, boolean>;
  photos: Partial<Record<string, { imageUrl: string; observation: PhotoObservation }>>;
}

const MODEL_DEMO = {
  tier: "model_specific" as const,
  categoryId: "outerwear",
  tierNote:
    "Demo: compared against the Arc'teryx Beta LT DEMO reference set and sample code. Live checks for this model use the outerwear checklist.",
};

/** Observation helper for category/basic demo photos (no model reference). */
const categoryObs = (o: {
  note: string;
  text?: string;
  codes?: PhotoObservation["codes"];
  details: string[];
  summary: string;
}): PhotoObservation => ({
  quality: { usable: true, issues: [], note: o.note },
  extractedText: o.text ?? "",
  codes: o.codes ?? [],
  visibleDetails: o.details,
  differences: [],
  comparisonReliable: false,
  uncertaintyNote: "Category check: no model reference.",
  summary: o.summary,
});

const sneakerTier = resolveTier("sneakers");
const basicTier = resolveTier("other");

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
    ...MODEL_DEMO,
    profileId: "arcteryx-beta-lt",
    condition: "like_new",
    askingPrice: 240,
    presence: { wash_tag: true },
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
    ...MODEL_DEMO,
    profileId: "arcteryx-beta-lt",
    condition: "good",
    askingPrice: 195,
    presence: { wash_tag: true },
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
    ...MODEL_DEMO,
    profileId: "arcteryx-beta-lt",
    condition: "new_with_tags",
    askingPrice: 160,
    presence: { wash_tag: true },
    photos: {
      logo: { imageUrl: "demo/logo.jpg", observation: LOGO_OK },
      wash_tag_front: { imageUrl: "demo/wash-tag-mismatch-front.jpg", observation: TAG_FRONT_MISMATCH },
      wash_tag_back: { imageUrl: "demo/wash-tag-back.jpg", observation: TAG_BACK_OK },
      zipper: { imageUrl: "demo/zipper.jpg", observation: ZIPPER_OK },
      seam_tape: { imageUrl: "demo/seam-tape.jpg", observation: SEAM_OK },
    },
  },
  {
    id: "basic-screening",
    title: "Something else, basic photo screening",
    description:
      "A canvas backpack is outside the supported categories, so it gets basic photo screening: usable photos and readable text, with no model or category verification.",
    expectedOutcome: "photo_check_complete",
    tier: "basic_photo",
    categoryId: "other",
    tierNote: basicTier.note,
    profileId: basicTier.profileId,
    condition: "good",
    askingPrice: 45,
    presence: { brand_label: true },
    photos: {
      full_item: {
        imageUrl: "demo/other-full.jpg",
        observation: categoryObs({
          note: "Whole item in frame, even light.",
          details: ["Tan canvas backpack, upright", "Top handle and two front pockets visible"],
          summary: "The whole backpack is visible and the photo is usable.",
        }),
      },
      brand_label: {
        imageUrl: "demo/other-label.jpg",
        observation: categoryObs({
          note: "Label sharp and straight on.",
          text: "FIELDLINE",
          details: ["Woven label sewn on the front", "Uppercase wordmark"],
          summary: "The brand label reads FIELDLINE.",
        }),
      },
      any_tag: {
        imageUrl: "demo/other-tag.jpg",
        observation: categoryObs({
          note: "Tag flat, every line legible.",
          text: "FIELDLINE\n100% COTTON CANVAS\nSPOT CLEAN ONLY\nMADE IN INDIA\nSAMPLE 0042",
          codes: [{ value: "SAMPLE 0042", codeType: "unknown", purposeIdentified: false, confidence: "high" }],
          details: ["Printed care label", "Material and care lines"],
          summary: "Care label text is readable. One code is printed without a label saying what it is.",
        }),
      },
    },
  },
  {
    id: "sneakers-category",
    title: "Sneakers, category check",
    description:
      "No live profile exists for this sneaker model, so the sneaker checklist runs: both shoes, box label, size tag, insole, outsole and stitching. Photos are usable and the expected size tag is there.",
    expectedOutcome: "photo_check_complete",
    tier: "category_checklist",
    categoryId: "sneakers",
    tierNote: sneakerTier.note,
    profileId: sneakerTier.profileId,
    condition: "like_new",
    askingPrice: 120,
    presence: { size_tag: true, box_label: true },
    photos: {
      side_profile: {
        imageUrl: "demo/sneakers-side.jpg",
        observation: categoryObs({
          note: "Both shoes in frame, toe to heel.",
          details: ["White and grey low-top pair", "Leather upper with grey overlays", "Embossed text on the heel"],
          summary: "Both shoes are fully visible from the side.",
        }),
      },
      box_label: {
        imageUrl: "demo/sneakers-box-label.jpg",
        observation: categoryObs({
          note: "Label flat and sharp.",
          text: "STRIDEWORK\nSAMPLE LABEL\nSTYLE: SW-SAMPLE-0001\nSIZE US 10 / EU 44\nCOLOR: WHITE/GREY",
          codes: [{ value: "SW-SAMPLE-0001", codeType: "style_code", purposeIdentified: true, confidence: "high" }],
          details: ["Printed label with barcode", "Size and colour lines"],
          summary: "Box label is readable, including a labeled style code.",
        }),
      },
      size_tag: {
        imageUrl: "demo/sneakers-size-tag.jpg",
        observation: categoryObs({
          note: "Tag straight on, every character legible.",
          text: "STRIDEWORK\nUS 10  UK 9  EU 44  CM 28\nMADE IN VIETNAM\nSAMPLE-0001",
          codes: [{ value: "SAMPLE-0001", codeType: "unknown", purposeIdentified: false, confidence: "high" }],
          details: ["Sewn tag inside the tongue", "Size in four systems"],
          summary: "Size tag is readable: US 10 / EU 44.",
        }),
      },
      insole: {
        imageUrl: "demo/sneakers-insole.jpg",
        observation: categoryObs({
          note: "Insole visible from above, logo in focus.",
          text: "STRIDEWORK",
          details: ["Printed wordmark on the heel area of the insole"],
          summary: "Insole and printed wordmark are visible.",
        }),
      },
      outsole: {
        imageUrl: "demo/sneakers-outsole.jpg",
        observation: categoryObs({
          note: "Whole sole in frame.",
          details: ["Grey rubber outsole", "Herringbone tread pattern", "Even wear"],
          summary: "The whole outsole is visible.",
        }),
      },
      stitching: {
        imageUrl: "demo/sneakers-stitching.jpg",
        observation: categoryObs({
          note: "Individual stitches sharp.",
          details: ["Even stitch spacing along the toe cap", "No loose threads visible"],
          summary: "Stitching is clearly visible.",
        }),
      },
    },
  },
];

export function getDemoCase(id: string): DemoCaseDef | undefined {
  return DEMO_CASES.find((c) => c.id === id);
}

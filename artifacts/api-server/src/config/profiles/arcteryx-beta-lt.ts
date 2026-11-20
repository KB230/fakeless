import { defineProfile, WASH_TAG_QUESTION } from "./define";

/**
 * Arc'teryx Beta LT jacket — the DEMO model-specific profile (outerwear).
 *
 * No documented model-specific reference photos or style codes have been
 * supplied yet, so this profile uses clearly labeled DEMO reference images and
 * SAMPLE codes, and `liveEnabled` is false. Live checks that pick this model
 * get the outerwear category checklist instead; only demo cases use this
 * profile, and it can never pass a live check.
 *
 * To make it live-capable: replace the reference images with documented photos
 * for a specific release, set `referenceStatus: "documented"`, replace
 * `expectedCodes` with documented codes (`isSample: false`) and set
 * `liveEnabled: true`.
 */
export const arcteryxBetaLt = defineProfile({
  id: "arcteryx-beta-lt",
  kind: "model",
  categoryId: "outerwear",
  liveEnabled: false,
  brand: "Arc'teryx",
  model: "Beta LT Jacket",
  generation: "Release not yet documented (demo reference set)",
  colorway: "Demo reference: dark green",
  category: "Technical shell jacket",
  referenceStatus: "demo",
  referenceNote:
    "Reference photos are illustrative demo images and the style code is a sample code. This profile is used by the demo only; live checks for this model use the outerwear checklist until documented references are added.",
  sources: [
    { label: "Arc'teryx official counterfeit guidance", url: "https://arcteryx.com/us/en/help/counterfeit" },
  ],
  expectedCodes: [
    {
      code: "LC-SAMPLE-29090",
      codeType: "style_code",
      description: "Sample style code used by the demo reference set",
      isSample: true,
    },
  ],
  presenceQuestions: [WASH_TAG_QUESTION],
  steps: [
    {
      id: "logo",
      title: "Logo and wordmark",
      noun: "logo photo",
      instruction:
        "Lay the jacket flat on a table. Hold your phone parallel to the chest and move in until the full bird logo and the wordmark below it fill the frame, with a little fabric showing on every side.",
      retakeInstruction: "Fit the full bird logo and the whole wordmark in frame.",
      required: true,
      framingTips: [
        "Whole bird logo and full wordmark in frame",
        "Phone parallel to the fabric, not tilted",
        "Even light, no flash glare on the embroidery",
      ],
      comparisonFocus: [
        "Letterforms and lettering weight",
        "Letter spacing",
        "Apostrophe shape and position",
        "Alignment of wordmark under the logo",
        "How the logo is applied (embroidery or print) and stitch density",
      ],
      references: [
        {
          imageUrl: "references/beta-lt/logo.jpg",
          caption: "Chest logo and wordmark, straight on",
          source: "Demo reference image (illustrative, not documented)",
          isDemo: true,
        },
      ],
    },
    {
      id: "wash_tag_front",
      title: "Wash tag, front",
      noun: "front of the wash tag",
      instruction:
        "Find the care tag inside the jacket. Lay the wash tag flat and move closer until the entire code is in frame, including every printed letter and digit.",
      retakeInstruction: "Lay the wash tag flat and move closer until the entire code is in frame.",
      required: true,
      presenceQuestionId: "wash_tag",
      readsText: true,
      compareCodes: true,
      framingTips: ["Lay the tag flat", "Every printed letter and digit in frame", "Close enough that the code is sharp"],
      comparisonFocus: ["Style or model code (only when its label identifies it)", "Print sharpness and alignment"],
      references: [
        {
          imageUrl: "references/beta-lt/wash-tag-front.jpg",
          caption: "Care tag front with style code line",
          source: "Demo reference image with a sample code",
          isDemo: true,
        },
      ],
    },
    {
      id: "wash_tag_back",
      title: "Wash tag, back",
      noun: "back of the wash tag",
      instruction:
        "Turn the wash tag over. Lay it flat and capture the back side, making sure every printed letter and digit is in frame and sharp.",
      retakeInstruction: "Lay the tag flat and make sure every printed letter and digit is in frame.",
      required: true,
      presenceQuestionId: "wash_tag",
      readsText: true,
      compareCodes: true,
      framingTips: ["Flip the tag over and lay it flat", "Every printed letter and digit in frame"],
      comparisonFocus: ["Printed text and care symbols", "Any additional codes"],
      references: [
        {
          imageUrl: "references/beta-lt/wash-tag-back.jpg",
          caption: "Care tag reverse side",
          source: "Demo reference image (illustrative)",
          isDemo: true,
        },
      ],
    },
    {
      id: "zipper",
      title: "Zipper hardware",
      noun: "zipper photo",
      instruction:
        "Photograph the main front zipper straight on. Include the pull tab and the top of the zipper, in good light, close enough to see any markings.",
      retakeInstruction: "Show the pull tab and the top of the zipper straight on.",
      required: true,
      framingTips: ["Pull tab and top of zipper in frame", "Straight on, good light"],
      comparisonFocus: ["Markings on the slider and pull", "Pull tab construction", "Zipper coating and placement"],
      references: [
        {
          imageUrl: "references/beta-lt/zipper.jpg",
          caption: "Front zipper and pull tab",
          source: "Demo reference image (illustrative)",
          isDemo: true,
        },
      ],
    },
    {
      id: "seam_tape",
      title: "Interior seam tape",
      noun: "seam tape photo",
      instruction:
        "Open the jacket and find the taped seam inside the shoulder. Move close and photograph a straight run of seam tape, in focus and evenly lit.",
      retakeInstruction: "Show a straight run of seam tape, close and evenly lit.",
      required: true,
      framingTips: ["Inside the shoulder seam", "A straight run of tape, close and in focus"],
      comparisonFocus: ["Tape width and consistency", "Edge adhesion and placement along the seam"],
      references: [
        {
          imageUrl: "references/beta-lt/seam-tape.jpg",
          caption: "Seam tape along interior seam",
          source: "Demo reference image (illustrative)",
          isDemo: true,
        },
      ],
    },
  ],
});

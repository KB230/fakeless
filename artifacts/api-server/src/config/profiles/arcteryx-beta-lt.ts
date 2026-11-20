import type { ProductProfile } from "@workspace/api-zod";
import {
  captureInstruction,
  captureVoicePromptId,
} from "../voicePrompts";

/**
 * Arc'teryx Beta LT jacket profile.
 *
 * No documented model-specific reference photos or style codes have been
 * supplied yet, so this profile uses clearly labeled DEMO reference images and
 * SAMPLE codes. Live checks against a demo profile are routed to manual review
 * ("reference evidence insufficient") — they can never pass on demo evidence.
 *
 * To make this profile live-capable: replace the reference images with
 * documented photos for a specific release, set `referenceStatus` to
 * "documented", and replace `expectedCodes` with documented style/model codes
 * (`isSample: false`).
 */
export const arcteryxBetaLt: ProductProfile = {
  id: "arcteryx-beta-lt",
  brand: "Arc'teryx",
  model: "Beta LT Jacket",
  generation: "Release not yet documented (demo reference set)",
  colorway: "Demo reference: dark green",
  category: "Technical shell jacket",
  referenceStatus: "demo",
  referenceNote:
    "Reference photos are illustrative demo images and the style code is a sample code. Live checks with this profile go to manual review until documented references for a specific release are added.",
  sources: [
    {
      label: "Arc'teryx official counterfeit guidance",
      url: "https://arcteryx.com/us/en/help/counterfeit",
    },
  ],
  expectedCodes: [
    {
      code: "LC-SAMPLE-29090",
      codeType: "style_code",
      description: "Sample style code used by the demo reference set",
      isSample: true,
    },
  ],
  washTag: { expected: true, requireBothSides: true },
  steps: [
    {
      id: "logo",
      title: "Logo and wordmark",
      instruction: captureInstruction("logo"),
      voicePromptId: captureVoicePromptId("logo"),
      framingTips: [
        "Whole bird logo and full wordmark in frame",
        "Phone parallel to the fabric, not tilted",
        "Even light, no flash glare on the embroidery",
      ],
      required: true,
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
      instruction: captureInstruction("wash_tag_front"),
      voicePromptId: captureVoicePromptId("wash_tag_front"),
      framingTips: [
        "Lay the tag flat",
        "Every printed letter and digit in frame",
        "Close enough that the code is sharp",
      ],
      required: true,
      comparisonFocus: [
        "Style or model code (only when its label identifies it)",
        "Print sharpness and alignment",
      ],
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
      instruction: captureInstruction("wash_tag_back"),
      voicePromptId: captureVoicePromptId("wash_tag_back"),
      framingTips: [
        "Flip the tag over and lay it flat",
        "Every printed letter and digit in frame",
      ],
      required: true,
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
      instruction: captureInstruction("zipper"),
      voicePromptId: captureVoicePromptId("zipper"),
      framingTips: [
        "Pull tab and top of zipper in frame",
        "Straight on, good light",
      ],
      required: true,
      comparisonFocus: [
        "Markings on the slider and pull",
        "Pull tab construction",
        "Zipper coating and placement",
      ],
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
      instruction: captureInstruction("seam_tape"),
      voicePromptId: captureVoicePromptId("seam_tape"),
      framingTips: [
        "Inside the shoulder seam",
        "A straight run of tape, close and in focus",
      ],
      required: true,
      comparisonFocus: [
        "Tape width and consistency",
        "Edge adhesion and placement along the seam",
      ],
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
};

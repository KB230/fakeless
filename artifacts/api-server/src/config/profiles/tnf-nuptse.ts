import { defineProfile } from "./define";

/**
 * The North Face Nuptse puffer jacket — live model-specific profile.
 *
 * Reference photos: the authentic halves of the team's TNF Nuptse legit-check
 * comparison set (Thrifted.com "How to Spot Fake The North Face", with images
 * credited there to LegitGrails and Legit Check App by Ch). No style codes are
 * documented for this profile, so codes are read and shown but not compared.
 */
const REF = (file: string, caption: string) => ({
  imageUrl: `references/tnf-nuptse/${file}`,
  caption,
  source: "Authentic jacket, TNF Nuptse legit-check set",
  isDemo: false,
});

export const tnfNuptse = defineProfile({
  id: "tnf-nuptse",
  kind: "model",
  categoryId: "outerwear",
  liveEnabled: true,
  brand: "The North Face",
  model: "Nuptse Puffer Jacket",
  generation: "1996 Retro Nuptse and current releases",
  colorway: null,
  category: "Puffer jacket",
  referenceStatus: "documented",
  referenceNote:
    "Compared against photos of an authentic Nuptse for the chest logo, down label and hang tag. Other steps are screened for warning signs. No style codes are documented for this profile, so codes are read but not compared.",
  sources: [
    { label: "Thrifted.com: How to Spot Fake The North Face", url: "https://thrifted.com" },
    { label: "LegitGrails: The North Face Nuptse jacket fake vs real", url: "https://legitgrails.com/blogs/the-north-face/the-north-face-nuptse-jacket-fake-vs-real" },
  ],
  expectedCodes: [],
  presenceQuestions: [
    {
      id: "hang_tag",
      question: "Does the jacket still have its cardboard hang tag?",
      help: "The removable tag attached when the jacket is new.",
      expected: false,
      absentNote: "That's fine. Answering No skips the hang tag photo.",
    },
    {
      id: "down_label",
      question: "Is there a small white down or product label inside, near the bottom hem?",
      help: "A small printed label, often with RDS and DL# lines.",
      expected: true,
      absentNote: "Nuptse jackets normally have one. If you answer No, the listing will go to manual review.",
    },
  ],
  steps: [
    {
      id: "full_item",
      title: "Full jacket",
      noun: "full jacket photo",
      instruction: "Lay the jacket flat, front up and zipped, and step back until the whole jacket fits in the frame.",
      retakeInstruction: "Fit the whole jacket in the frame, laid flat.",
      required: false,
      framingTips: ["Whole jacket in frame", "Zipped and laid flat"],
      comparisonFocus: [
        "chest logo sits level and in the expected spot on the left chest",
        "baffles are even in size and stitched in straight lines",
      ],
    },
    {
      id: "chest_logo",
      title: "Chest logo",
      noun: "chest logo photo",
      instruction: "Move close to the embroidered logo on the chest, straight on, until THE NORTH FACE text and the half dome fill the frame.",
      retakeInstruction: "Fill the frame with the chest logo, straight on and sharp.",
      required: true,
      readsText: true,
      framingTips: ["Whole logo in frame", "Phone parallel to the jacket", "Even light"],
      comparisonFocus: [
        "half-dome shape is aligned straight with the text, not tilted",
        "THE, NORTH and FACE are left-aligned with each other in a straight column",
        "letters use thick, dense thread with clean edges; counterfeit lettering is thinner or puffier and uneven",
        "spacing between the dome segments matches the reference",
      ],
      references: [REF("chest-logo.jpg", "Authentic chest logo")],
    },
    {
      id: "sleeve_700",
      title: "700 fill text on the sleeve",
      noun: "sleeve text photo",
      instruction: "If there's 700 text on the sleeve or shoulder, move close until it fills the frame. Skip this if your jacket doesn't have it.",
      retakeInstruction: "Move closer to the 700 text until it's sharp.",
      required: false,
      readsText: true,
      framingTips: ["Whole text in frame", "Straight on"],
      comparisonFocus: ["700 lettering uses thick thread with bold, clear edges; thin or fuzzy lettering is a warning sign"],
    },
    {
      id: "zipper",
      title: "Zipper pull",
      noun: "zipper photo",
      instruction: "Photograph the main zipper pull straight on, close enough to read any text stamped on the metal.",
      retakeInstruction: "Move closer to the zipper pull so the stamped text is readable.",
      required: true,
      readsText: true,
      framingTips: ["Whole pull in frame", "Avoid reflections"],
      comparisonFocus: [
        "zipper pull is thick and sturdy, widening around the hole; a narrow, thin pull is a warning sign",
        "text stamped on the metal is bold and wide, not thin",
      ],
    },
    {
      id: "down_label",
      title: "Down / product label",
      noun: "down label photo",
      instruction: "Find the small white label inside near the bottom hem. Hold it flat and straight on so every line is readable.",
      retakeInstruction: "Hold the label flat and straight on so every line is readable.",
      required: true,
      presenceQuestionId: "down_label",
      readsText: true,
      framingTips: ["Whole label in frame", "Flat and straight on"],
      comparisonFocus: [
        "text is printed in bold black; counterfeit labels use smaller, thinner, greyer text",
        "the label is a smooth fabric of normal size; a smaller label in a more textured material is a warning sign",
        "the DL# line format matches the reference (a short alphanumeric lot code); a long brand-style code is a warning sign",
      ],
      references: [REF("down-label.jpg", "Authentic down / product label")],
    },
    {
      id: "hologram",
      title: "Hologram tag",
      noun: "hologram photo",
      instruction: "If there's a holographic security tag inside, photograph it straight on so its edges and corners are visible.",
      retakeInstruction: "Show the whole hologram tag, edges and corners in frame.",
      required: false,
      framingTips: ["Whole tag with all four corners", "Tilt slightly so the hologram shows"],
      comparisonFocus: [
        "corners of the holographic tag have small cuts; corners without cuts are a warning sign",
        "hologram looks sharp and reflective, not dull or flat",
      ],
    },
    {
      id: "hang_tag",
      title: "Hang tag",
      noun: "hang tag photo",
      instruction: "Photograph the front of the cardboard hang tag straight on, in even light.",
      retakeInstruction: "Show the whole hang tag front, straight on, evenly lit.",
      required: true,
      presenceQuestionId: "hang_tag",
      readsText: true,
      framingTips: ["Whole tag in frame", "No glare"],
      comparisonFocus: [
        "mountain image is sharp and high resolution; a blurry or low-resolution image is a warning sign",
        "the lower panel is a dark navy blue, not near-black",
        "logo and NUPTSE text are crisp and centered",
      ],
      references: [REF("hang-tag.jpg", "Authentic Nuptse hang tag")],
    },
  ],
});

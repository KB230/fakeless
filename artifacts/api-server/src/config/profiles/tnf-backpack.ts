import { defineProfile } from "./define";

/**
 * The North Face daypacks (Borealis, Jester, Recon, Vault) — live
 * model-specific profile built from documented product features and published
 * legit-check guides. There are no reference photos yet, so every step is
 * screened against the warning-sign checklist (the rules treat model steps
 * without references that way). Style codes are recognized (NF0A...) and shown,
 * but not compared, because they vary by model and color.
 *
 * Documented features (thenorthface.com product pages): YKK zippers, sternum
 * strap with a whistle buckle on the Borealis, reflective details, bungee
 * compression, style codes beginning NF0A (e.g. Borealis NF0A52SE).
 */
export const TNF_STYLE_CODE_PATTERN = /^NF0A[0-9A-Z]{4}([0-9A-Z]{3})?$/;

export const tnfBackpack = defineProfile({
  id: "tnf-backpack",
  kind: "model",
  categoryId: "handbags",
  liveEnabled: true,
  brand: "The North Face",
  model: "Daypack (Borealis, Jester, Recon, Vault)",
  generation: "Current daypack line",
  colorway: null,
  category: "Backpack",
  referenceStatus: "documented",
  referenceNote:
    "Checked against documented North Face product features (YKK zippers, whistle sternum buckle, NF0A style codes) and published logo warning signs. There are no reference photos for this profile yet, so the photos are screened for warning signs rather than compared side by side.",
  sources: [
    { label: "The North Face: Borealis Backpack (YKK zippers, style NF0A52SE)", url: "https://www.thenorthface.com/en-us/p/bags-and-gear/backpacks/mens-backpacks-298772/borealis-backpack-NF0A52SE" },
    { label: "The North Face: Borealis Patch Backpack (whistle sternum buckle, style NF0A8KE7)", url: "https://www.thenorthface.com/en-us/p/bags-and-gear/backpacks/mens-backpacks-298772/borealis-patch-backpack-NF0A8KE7" },
    { label: "Legit Check App: How to spot fake The North Face (logo letter spacing and line weight)", url: "https://legitcheck.app/category/guides/the-north-face/" },
    { label: "LegitGrails: The North Face Nuptse fake vs real (zipper pull and tag corners)", url: "https://legitgrails.com/blogs/the-north-face/the-north-face-nuptse-jacket-fake-vs-real" },
  ],
  expectedCodes: [],
  presenceQuestions: [
    {
      id: "interior_tag",
      question: "Is there a sewn-in label inside the main compartment?",
      help: "A small fabric label with the style number (starts with NF0A), materials and country of manufacture, usually along an inside seam.",
      expected: true,
      absentNote: "North Face backpacks normally have one. If you answer No, the listing will go to manual review.",
    },
    {
      id: "hang_tag",
      question: "Does the backpack still have its cardboard hang tag?",
      help: "The removable tag attached when new.",
      expected: false,
      absentNote: "That's fine. Answering No skips the hang tag photo.",
    },
  ],
  steps: [
    {
      id: "full_front",
      title: "Full front",
      noun: "full front photo",
      instruction: "Stand the backpack upright and step back until the whole front, including the top handle and the bungee cords if it has them, fits in the frame.",
      retakeInstruction: "Fit the whole backpack front, top handle included, in the frame.",
      required: true,
      framingTips: ["Whole pack in frame", "Standing upright", "Plain background"],
      comparisonFocus: [
        "logo sits level and centered where the model normally places it",
        "bungee cord crisscross (Borealis and Jester) is evenly threaded through matching loops",
        "panels are symmetrical and seams run straight",
        "reflective accents are present on models that have them",
      ],
    },
    {
      id: "front_logo",
      title: "Logo close-up",
      noun: "logo photo",
      instruction: "Move close to The North Face logo on the front, straight on, until the text and the half dome fill the frame.",
      retakeInstruction: "Fill the frame with the logo, straight on and sharp.",
      required: true,
      readsText: true,
      framingTips: ["Whole logo in frame", "Phone parallel to the fabric", "Even light"],
      comparisonFocus: [
        "misspelling in THE NORTH FACE (objective)",
        "letters in FACE placed too close together",
        "the line inside the half-dome logo is thicker than the dome segments around it",
        "letters such as the E in THE or the N in NORTH look heavier than the rest",
        "THE, NORTH and FACE not lined up on the left edge, or the dome tilted relative to the text",
        "thin, fuzzy or puffy embroidery thread instead of dense, clean stitching",
      ],
    },
    {
      id: "zipper_pulls",
      title: "Zipper sliders and pulls",
      noun: "zipper photo",
      instruction: "Photograph the main compartment zipper slider straight on, close enough to read any letters stamped on the metal, with the pull cord in frame.",
      retakeInstruction: "Move closer so the letters on the zipper slider are readable.",
      required: true,
      readsText: true,
      framingTips: ["Slider face straight on", "Avoid reflections"],
      comparisonFocus: [
        "North Face daypacks use YKK zippers: a slider whose face is clearly visible and readable but shows no YKK marking (objective)",
        "YKK lettering that is misspelled, shallow or blurry",
        "flimsy, thin or narrow zipper pulls, or pull cords that are frayed or loosely crimped",
        "zipper tape sewn in crooked or wavy",
      ],
    },
    {
      id: "interior_tag",
      title: "Inside label",
      noun: "inside label photo",
      instruction: "Open the main compartment and find the sewn-in label. Lay it flat and photograph it straight on so the style number and every line are readable.",
      retakeInstruction: "Lay the label flat and move closer until every line is readable.",
      required: true,
      presenceQuestionId: "interior_tag",
      readsText: true,
      framingTips: ["Whole label in frame", "Flat and straight on", "No glare"],
      comparisonFocus: [
        "style number begins with NF0A; a style number in another format is a warning sign",
        "misspelled words on the label (objective)",
        "smudged, faint or uneven print; crooked text lines",
        "country of manufacture or material lines missing from a fully visible label (objective)",
      ],
    },
    {
      id: "straps_back",
      title: "Straps and back panel",
      noun: "straps photo",
      instruction: "Turn the backpack around and photograph the shoulder straps and back panel, with the sternum strap buckle in frame.",
      retakeInstruction: "Show both shoulder straps and the sternum buckle in one frame.",
      required: true,
      framingTips: ["Both straps and the buckle in frame", "Even light"],
      comparisonFocus: [
        "Borealis models have a sternum strap with a built-in whistle buckle; a plain buckle on a model listed as a Borealis is a warning sign",
        "strap anchor points are reinforced with dense bar-tack stitching; thin single rows of stitching are a warning sign",
        "padded back panel looks even and stitched in straight lines",
        "logo or brand marks on the buckles are crisp, not blurry",
      ],
    },
    {
      id: "hologram",
      title: "Hologram or security tag",
      noun: "hologram photo",
      instruction: "If there's a small holographic or security tag inside, photograph it straight on with its edges and corners visible. Skip this if there isn't one.",
      retakeInstruction: "Show the whole hologram tag, edges and corners in frame.",
      required: false,
      framingTips: ["Whole tag with all corners", "Tilt slightly so the hologram shows"],
      comparisonFocus: [
        "hologram looks sharp and reflective, not dull, flat or printed",
        "tag corners are cut cleanly; ragged or square-cut corners are a warning sign",
      ],
    },
    {
      id: "hang_tag",
      title: "Hang tag",
      noun: "hang tag photo",
      instruction: "Photograph the front and printed details of the cardboard hang tag straight on.",
      retakeInstruction: "Show the whole hang tag, straight on, every line readable.",
      required: true,
      presenceQuestionId: "hang_tag",
      readsText: true,
      framingTips: ["Whole tag in frame", "No glare"],
      comparisonFocus: [
        "style number on the hang tag matches the inside label (objective if they differ)",
        "model name on the tag matches the backpack being listed",
        "sharp, high-resolution printing; blurry images or off colors are warning signs",
      ],
    },
  ],
});

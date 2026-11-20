import {
  CATEGORY_REFERENCE_NOTE,
  defineProfile,
  SIZE_TAG_QUESTION,
  WASH_TAG_QUESTION,
} from "./define";

/**
 * Category-level checklists. They contain no brand codes, serial formats or
 * reference images: decisions rely only on photo usability, visible text and
 * the presence or absence of expected details.
 *
 * Adding a category = add a profile here, add it to CATEGORIES in index.ts.
 * The wizard renders whatever steps and presence questions a profile has.
 */

const category = (id: string, name: string) => ({
  kind: "category" as const,
  categoryId: id,
  brand: "Any brand",
  model: `${name} checklist`,
  generation: "Category-level checklist",
  category: name,
  referenceStatus: "none" as const,
  referenceNote: CATEGORY_REFERENCE_NOTE,
});

/*
 * Counterfeit warning signs per photo type (passed to the vision model as
 * comparisonFocus). Brand-agnostic and limited to what a photo can show.
 * Adapted from public authentication guides: LegitGrails "How to Spot Fake
 * vs. Real Shoes", Vereev's wallet photo guide, and Designer Second Hand
 * Vienna's "6 signs of authenticity". Weight, feel, smell, material and
 * function are deliberately excluded: a photo can't show them.
 */
const STITCHING_SIGNS = [
  "uneven stitch length or spacing",
  "crooked or wandering stitch lines",
  "loose, frayed or doubled-back threads",
  "visible glue residue along seams or edges",
];
const LOGO_SIGNS = [
  "misspelled brand name or wordmark",
  "wrong or inconsistent font, uneven font weight",
  "uneven letter spacing or crooked alignment",
  "blurry, fuzzy or bleeding edges on the logo",
  "logo off-center or tilted relative to seams",
];
const EMBROIDERY_SIGNS = [
  "thin or sparse embroidery with base fabric showing through",
  "frayed or fuzzy embroidery edges",
  "flattened or simplified shapes and outlines",
];
const PRINT_SIGNS = ["cracked, peeling or patchy print", "print that sits misaligned across seams"];
const TAG_SIGNS = [
  "misspelled words in printed text (objective)",
  "smudged, blurry or bleeding print",
  "crooked or misaligned text lines, uneven font weight",
  "missing standard lines such as size, country of manufacture, or a style or serial number (objective only if the whole tag is visible)",
  "printed text that contradicts itself (objective)",
  "cheap-looking or frayed tag edges",
];
const HARDWARE_SIGNS = [
  "shallow, uneven or blurry engraving",
  "rough or unfinished edges on metal parts",
  "inconsistent plating or finish, flaking color",
  "misspelled engraved text (objective)",
];
const HOLOGRAM_SIGNS = ["hologram or security sticker that looks dull, flat or blurry instead of sharp and reflective"];

const TAG_TIPS = ["Lay the tag flat", "Every printed letter and digit in frame", "Straight on, no glare"];

export const sneakersChecklist = defineProfile({
  ...category("sneakers", "Sneakers"),
  id: "category-sneakers",
  presenceQuestions: [
    SIZE_TAG_QUESTION,
    {
      id: "box_label",
      question: "Do you have the original box with its label?",
      help: "The printed label is usually on one end of the box.",
      expected: false,
      absentNote: "That's fine. Answering No skips the box label photo.",
    },
  ],
  steps: [
    {
      id: "side_profile",
      comparisonFocus: ["silhouette or toe shape that looks lopsided between the two shoes", "visible glue or excess material where the upper meets the sole", ...STITCHING_SIGNS.slice(0, 2)],
      title: "Both shoes, side profile",
      noun: "side profile photo",
      instruction: "Place both shoes side by side on a flat surface. Step back until both shoes fit in the frame from toe to heel, shot straight from the side.",
      retakeInstruction: "Fit both shoes, toe to heel, in the frame from the side.",
      required: true,
      framingTips: ["Both shoes, toe to heel", "Camera level with the shoes", "Plain background"],
    },
    {
      id: "box_label",
      comparisonFocus: [...TAG_SIGNS, "box label print that is blurry or pixelated, barcode area smudged"],
      title: "Box label",
      noun: "box label",
      instruction: "Hold the phone straight on to the box label and move closer until every printed line on the label is in frame and sharp.",
      retakeInstruction: "Fill the frame with the box label, straight on, every line readable.",
      required: true,
      presenceQuestionId: "box_label",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "size_tag",
      comparisonFocus: TAG_SIGNS,
      title: "Inside size tag",
      noun: "size tag photo",
      instruction: "Hold the size tag flat and straight on so every letter and number is readable. It's usually inside the tongue or the collar.",
      retakeInstruction: "Hold the size tag flat and straight on so every letter and number is readable.",
      required: true,
      presenceQuestionId: "size_tag",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "insole",
      comparisonFocus: [...LOGO_SIGNS, "insole logo print that is cracked or rubbed off on an unworn shoe"],
      title: "Insole and logo",
      noun: "insole photo",
      instruction: "Look down into one shoe and photograph the insole, including any printed logo, in good light.",
      retakeInstruction: "Show the insole from above, logo area in focus.",
      required: true,
      readsText: true,
      framingTips: ["Shoot from directly above", "Logo area in focus"],
    },
    {
      id: "outsole",
      comparisonFocus: ["soft or blurry molded text and tread edges", "excess rubber flashing or glue around the sole edge", "logo on the sole that is misspelled or misshapen"],
      title: "Outsole",
      noun: "outsole photo",
      instruction: "Turn one shoe over and photograph the whole outsole from directly above, heel to toe.",
      retakeInstruction: "Show the whole outsole, heel to toe, from directly above.",
      required: true,
      framingTips: ["Whole sole in frame", "Even light, no shadows across the tread"],
    },
    {
      id: "stitching",
      comparisonFocus: STITCHING_SIGNS,
      title: "Stitching close-up",
      noun: "stitching close-up",
      instruction: "Move close to a stitched seam on the upper, such as the toe cap or heel, until individual stitches are sharp.",
      retakeInstruction: "Move closer to one seam until individual stitches are sharp.",
      required: true,
      framingTips: ["One seam, close up", "Tap to focus on the thread"],
    },
  ],
});

export const streetwearChecklist = defineProfile({
  ...category("streetwear", "Streetwear"),
  id: "category-streetwear",
  presenceQuestions: [
    {
      id: "neck_tag",
      question: "Does the item have a neck tag or printed neck label?",
      help: "Sewn in or printed inside the back of the collar.",
      expected: false,
      absentNote: "That's fine. Answering No skips the neck tag photo.",
    },
    WASH_TAG_QUESTION,
  ],
  steps: [
    {
      id: "full_front",
      comparisonFocus: ["graphic or logo placed noticeably off-center or crooked", ...PRINT_SIGNS],
      title: "Full front",
      noun: "full front photo",
      instruction: "Lay the item flat, front side up, smooth out wrinkles, and step back until the whole garment fits in the frame.",
      retakeInstruction: "Fit the whole garment in the frame, laid flat.",
      required: true,
      framingTips: ["Whole garment in frame", "Laid flat, smoothed out"],
    },
    {
      id: "neck_tag",
      comparisonFocus: [...TAG_SIGNS, ...LOGO_SIGNS.slice(0, 2)],
      title: "Neck tag",
      noun: "neck tag photo",
      instruction: "Open the collar and photograph the neck tag or printed label straight on, close enough that every letter is readable.",
      retakeInstruction: "Show the whole neck tag straight on, every letter readable.",
      required: true,
      presenceQuestionId: "neck_tag",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "wash_tag_front",
      comparisonFocus: TAG_SIGNS,
      title: "Wash tag, front",
      noun: "front of the wash tag",
      instruction: "Find the care tag inside the side seam. Lay it flat and move closer until every printed letter and digit is in frame.",
      retakeInstruction: "Lay the wash tag flat and move closer until every line is in frame.",
      required: true,
      presenceQuestionId: "wash_tag",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "wash_tag_back",
      comparisonFocus: TAG_SIGNS,
      title: "Wash tag, back",
      noun: "back of the wash tag",
      instruction: "Turn the wash tag over, lay it flat, and capture the back side with every printed line in frame.",
      retakeInstruction: "Lay the tag flat and make sure every printed line is in frame.",
      required: true,
      presenceQuestionId: "wash_tag",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "graphic",
      comparisonFocus: [...LOGO_SIGNS, ...EMBROIDERY_SIGNS, ...PRINT_SIGNS],
      title: "Main graphic or logo print",
      noun: "graphic close-up",
      instruction: "Move close to the main graphic or logo print so its edges and print texture are sharp.",
      retakeInstruction: "Fill the frame with the graphic, sharp and evenly lit.",
      required: true,
      readsText: true,
      framingTips: ["Whole graphic or logo in frame", "Even light, no glare on the print"],
    },
    {
      id: "hem_stitching",
      comparisonFocus: STITCHING_SIGNS,
      title: "Hem or cuff stitching",
      noun: "stitching close-up",
      instruction: "Move close to the hem or a cuff until individual stitches are sharp.",
      retakeInstruction: "Move closer to the hem or cuff until individual stitches are sharp.",
      required: true,
      framingTips: ["One hem or cuff, close up", "Tap to focus on the thread"],
    },
  ],
});

export const outerwearChecklist = defineProfile({
  ...category("outerwear", "Outerwear"),
  id: "category-outerwear",
  presenceQuestions: [WASH_TAG_QUESTION],
  steps: [
    {
      id: "full_item",
      comparisonFocus: ["logo or panels placed noticeably off-center or asymmetric", "puckered or wavy seams across the body"],
      title: "Full item",
      noun: "full item photo",
      instruction: "Lay the jacket flat, front up and zipped, and step back until the whole jacket fits in the frame.",
      retakeInstruction: "Fit the whole jacket in the frame, laid flat.",
      required: true,
      framingTips: ["Whole jacket in frame", "Zipped and laid flat"],
    },
    {
      id: "logo",
      comparisonFocus: [...LOGO_SIGNS, ...EMBROIDERY_SIGNS],
      title: "Logo close-up",
      noun: "logo photo",
      instruction: "Hold your phone parallel to the fabric and move in until the logo and any wordmark fill the frame.",
      retakeInstruction: "Fit the whole logo and wordmark in frame, straight on.",
      required: true,
      readsText: true,
      framingTips: ["Whole logo in frame", "Phone parallel to the fabric"],
    },
    {
      id: "wash_tag_front",
      comparisonFocus: TAG_SIGNS,
      title: "Wash tag, front",
      noun: "front of the wash tag",
      instruction: "Find the care tag inside the jacket. Lay the wash tag flat and move closer until every printed letter and digit is in frame.",
      retakeInstruction: "Lay the wash tag flat and move closer until every line is in frame.",
      required: true,
      presenceQuestionId: "wash_tag",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "wash_tag_back",
      comparisonFocus: TAG_SIGNS,
      title: "Wash tag, back",
      noun: "back of the wash tag",
      instruction: "Turn the wash tag over, lay it flat, and capture the back side with every printed line in frame.",
      retakeInstruction: "Lay the tag flat and make sure every printed line is in frame.",
      required: true,
      presenceQuestionId: "wash_tag",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "zipper",
      comparisonFocus: [...HARDWARE_SIGNS, "zipper tape that is wavy or sewn crooked"],
      title: "Zipper pull and slider",
      noun: "zipper photo",
      instruction: "Photograph the main zipper pull and slider straight on, close enough to see any markings.",
      retakeInstruction: "Show the zipper pull and slider straight on, close up.",
      required: true,
      readsText: true,
      framingTips: ["Pull and slider in frame", "Straight on, good light"],
    },
    {
      id: "seam_tape",
      comparisonFocus: ["seam tape lifting, bubbling or peeling", "tape of uneven width or wandering off the seam", ...STITCHING_SIGNS.slice(2)],
      title: "Interior seam tape",
      noun: "seam tape photo",
      instruction: "Open the jacket, find a taped seam inside, and photograph a straight run of tape up close. If the jacket has no taped seams, photograph an inside seam.",
      retakeInstruction: "Show a straight run of inside seam, close and evenly lit.",
      required: true,
      framingTips: ["Inside the shoulder seam", "Close and in focus"],
    },
  ],
});

export const handbagsChecklist = defineProfile({
  ...category("handbags", "Handbags and leather goods"),
  id: "category-handbags",
  presenceQuestions: [
    {
      id: "interior_tag",
      question: "Is there an interior tag, date code or serial area?",
      help: "Often a leather tab, heat stamp or printed label inside a pocket or along a seam.",
      expected: false,
      absentNote: "That's fine. Answering No skips this photo.",
    },
  ],
  steps: [
    {
      id: "full_front",
      comparisonFocus: ["pattern that doesn't line up across seams or is cut off at a seam", "leftover or excess material around pulls, tabs or edges", "lopsided shape or uneven handles"],
      title: "Full front",
      noun: "full front photo",
      instruction: "Stand the bag upright on a table and step back until the whole front, including the handles or strap, fits in the frame.",
      retakeInstruction: "Fit the whole bag front, with handles, in the frame.",
      required: true,
      framingTips: ["Whole bag in frame", "Plain background"],
    },
    {
      id: "brand_stamp",
      comparisonFocus: [...LOGO_SIGNS, "stamp that is shallow, uneven in depth or smeared"],
      title: "Brand stamp or logo",
      noun: "brand stamp photo",
      instruction: "Move close to the brand stamp or logo, straight on, until every letter is sharp.",
      retakeInstruction: "Fill the frame with the stamp or logo, straight on and sharp.",
      required: true,
      readsText: true,
      framingTips: ["Straight on", "Angle a light so the stamp is readable"],
    },
    {
      id: "interior_tag",
      comparisonFocus: [...TAG_SIGNS, "date code or serial stamp that is faint, crooked or uneven in depth"],
      title: "Interior tag or code area",
      noun: "interior tag photo",
      instruction: "Open the bag and photograph the interior tag, date code or serial area up close, so every character is readable.",
      retakeInstruction: "Move closer to the interior tag so every character is readable.",
      required: true,
      presenceQuestionId: "interior_tag",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "hardware",
      comparisonFocus: HARDWARE_SIGNS,
      title: "Hardware close-up",
      noun: "hardware photo",
      instruction: "Photograph a zipper pull, clasp or buckle up close, including any engraving.",
      retakeInstruction: "Move closer to the hardware so any engraving is sharp.",
      required: true,
      readsText: true,
      framingTips: ["One piece of hardware, close up", "Avoid reflections"],
    },
    {
      id: "stitching",
      comparisonFocus: [...STITCHING_SIGNS, "rough, cracked or uneven edge paint at edges and corners"],
      title: "Stitching close-up",
      noun: "stitching close-up",
      instruction: "Move close to a stitched edge or handle seam until individual stitches are sharp.",
      retakeInstruction: "Move closer to one seam until individual stitches are sharp.",
      required: true,
      framingTips: ["One seam, close up", "Tap to focus on the thread"],
    },
    {
      id: "second_stamp",
      comparisonFocus: [...TAG_SIGNS.slice(0, 3), "stamp text that contradicts the main brand stamp (objective)"],
      title: "Second stamp or hidden label",
      noun: "second stamp photo",
      instruction: "If there's a second heat stamp, hidden code or inner label, photograph it straight on so every character is readable. Skip this if there isn't one.",
      retakeInstruction: "Move closer to the second stamp, straight on, every character readable.",
      required: false,
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "packaging",
      comparisonFocus: ["blurry, smudged or misspelled printing on the dust bag, card or box", "logo on packaging that is off-center or misshapen"],
      title: "Dust bag, card or box",
      noun: "packaging photo",
      instruction: "If you have the dust bag, authenticity card, box or receipt, photograph it with any print or logo in frame. Packaging can be bought separately, so it supports the item photos but never replaces them.",
      retakeInstruction: "Show the packaging with its print or logo in frame and sharp.",
      required: false,
      readsText: true,
      framingTips: ["Print or logo in frame", "Even light"],
    },
  ],
});

export const hatsChecklist = defineProfile({
  ...category("hats", "Hats and caps"),
  id: "category-hats",
  presenceQuestions: [{ ...SIZE_TAG_QUESTION, question: "Does the hat have inside brand and size tags?", help: "Usually sewn along the inside back or side of the crown." }],
  steps: [
    {
      id: "front_logo",
      comparisonFocus: [...LOGO_SIGNS, ...EMBROIDERY_SIGNS],
      title: "Front logo",
      noun: "front logo photo",
      instruction: "Hold the hat facing you and move in until the front logo fills most of the frame, straight on.",
      retakeInstruction: "Fill the frame with the front logo, straight on.",
      required: true,
      readsText: true,
      framingTips: ["Logo straight on", "Even light"],
    },
    {
      id: "inside_tags",
      comparisonFocus: [...TAG_SIGNS, ...HOLOGRAM_SIGNS],
      title: "Inside brand and size tags",
      noun: "inside tag photo",
      instruction: "Turn the hat over. Hold the brand and size tags flat and straight on so every letter and number is readable.",
      retakeInstruction: "Hold the tags flat and straight on so every letter and number is readable.",
      required: true,
      presenceQuestionId: "size_tag",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "underbrim",
      comparisonFocus: ["blurry or bleeding print on the seam taping", "repeating taping text that is misspelled or unevenly spaced", ...HOLOGRAM_SIGNS],
      title: "Underbrim and sweatband",
      noun: "underbrim photo",
      instruction: "Turn the hat upside down and photograph the underside of the brim and the sweatband together.",
      retakeInstruction: "Show the underbrim and sweatband together, evenly lit.",
      required: true,
      framingTips: ["Underbrim and sweatband in one frame"],
    },
    {
      id: "back_closure",
      comparisonFocus: ["blurry or misspelled text on the closure", ...EMBROIDERY_SIGNS.slice(0, 2), ...STITCHING_SIGNS.slice(0, 2)],
      title: "Back closure",
      noun: "back closure photo",
      instruction: "Photograph the back of the hat so the closure, such as a snap, strap or buckle, is in frame and sharp.",
      retakeInstruction: "Show the whole back closure, close and sharp.",
      required: true,
      readsText: true,
      framingTips: ["Whole closure in frame"],
    },
  ],
});

/** Basic photo screening for anything outside the supported categories. */
export const basicScreening = defineProfile({
  id: "basic-photo",
  kind: "basic",
  categoryId: "other",
  brand: "Any brand",
  model: "Basic photo screening",
  generation: "Outside the supported categories",
  category: "Other item",
  referenceStatus: "none",
  referenceNote:
    "Basic photo screening: photos are checked for usability and visible text only. No category checklist or model reference applies.",
  presenceQuestions: [
    {
      id: "brand_label",
      question: "Does the item have a visible brand label or logo?",
      help: "Any sewn label, stamp, print or tag that shows the brand.",
      expected: false,
      absentNote: "That's fine. Answering No skips the label photo.",
    },
  ],
  steps: [
    {
      id: "full_item",
      title: "Full item",
      noun: "full item photo",
      instruction: "Place the item on a plain surface and step back until the whole item fits in the frame.",
      retakeInstruction: "Fit the whole item in the frame on a plain surface.",
      required: true,
      framingTips: ["Whole item in frame", "Plain background"],
    },
    {
      id: "brand_label",
      comparisonFocus: [...LOGO_SIGNS, ...TAG_SIGNS.slice(0, 3)],
      title: "Brand label or logo",
      noun: "brand label photo",
      instruction: "Move close to the brand label or logo, straight on, until every letter is readable.",
      retakeInstruction: "Fill the frame with the label, straight on, every letter readable.",
      required: true,
      presenceQuestionId: "brand_label",
      readsText: true,
      framingTips: TAG_TIPS,
    },
    {
      id: "any_tag",
      comparisonFocus: TAG_SIGNS,
      title: "Any other tag or label",
      noun: "tag photo",
      instruction: "If the item has a care, size or material tag, lay it flat and photograph it so every line is readable. Skip this if there isn't one.",
      retakeInstruction: "Lay the tag flat and move closer until every line is readable.",
      required: false,
      readsText: true,
      framingTips: TAG_TIPS,
    },
  ],
});

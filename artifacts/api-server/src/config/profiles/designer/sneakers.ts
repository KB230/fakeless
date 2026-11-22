import { defineProfile, SIZE_TAG_QUESTION } from "../define";
import { BOX_LABEL_QUESTION, DESIGNER_REFERENCE_NOTE, SRC, step } from "./shared";

/** Designer sneaker profiles (sneakers category). */

const sneaker = {
  kind: "model" as const,
  categoryId: "sneakers",
  liveEnabled: true,
  referenceStatus: "documented" as const,
  colorway: null,
  category: "Sneakers",
};

export const SIDE = (extra: string[]) =>
  step("side_profile", "Side profile", "side profile photo",
    "Place one shoe on a flat surface and photograph it straight from the side, toe to heel.",
    "Fit the whole shoe, toe to heel, in the frame from the side.",
    ["visible glue stains along the sole or midsole", ...extra],
    { framingTips: ["Whole shoe, toe to heel", "Camera level with the shoe", "Plain background"] });

export const SIZE_TAG = (extra: string[]) =>
  step("size_tag", "Inside size tag", "size tag photo",
    "Find the size tag inside the shoe (tongue or side wall) and photograph it flat and straight on so every line is readable.",
    "Hold the size tag flat and straight on so every letter and number is readable.",
    ["misspelled words or country of manufacture (objective)", "blurry, oversized or crooked print", ...extra],
    { presenceQuestionId: "size_tag", readsText: true, compareCodes: true, framingTips: ["Whole tag in frame", "Flat and straight on", "No glare"] });

export const BOX_LABEL = step("box_label", "Box label", "box label",
  "Photograph the label on the end of the box straight on, close enough that every line is readable.",
  "Fill the frame with the box label, straight on, every line readable.",
  ["style code and size don't match the size tag inside the shoe (objective if they differ)", "faded, thin or blurry label print"],
  { presenceQuestionId: "box_label", readsText: true, framingTips: ["Whole label in frame", "Straight on"] });

export const balenciagaTripleS = defineProfile({
  ...sneaker,
  id: "balenciaga-triple-s",
  brand: "Balenciaga",
  model: "Triple S",
  generation: "Italy- and China-made production",
  referenceNote: DESIGNER_REFERENCE_NOTE("Genuine Triple S pairs are made in Italy and in China, so the country of manufacture is not a warning sign."),
  sources: [SRC.lgTripleS],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE(["midsole stitches large, widely spaced and lying flat", "sole layers misaligned"]),
    step("toe_size", "Toe size number", "toe photo",
      "Photograph the toe from above so the embroidered size number on the toe is sharp.",
      "Move closer to the size number on the toe.",
      [
        "the size is embroidered on the toe; a printed size number is a warning sign",
        "the two digits sit at different heights, or touch each other (objective)",
        "toe mesh coarse with large holes",
      ],
      { readsText: true, framingTips: ["Size number fills the frame", "Shoot from directly above"] }),
    step("tongue", "Tongue logo", "tongue photo",
      "Photograph the tongue straight on so the Triple S logo and the top edge of the tongue are in frame.",
      "Fill the frame with the tongue logo, straight on.",
      ["logo printed flat on a shiny surface instead of standing out from the tongue", "tongue top edge straight instead of curved", "thin, easily folded tongue"],
      { readsText: true, framingTips: ["Tongue fills the frame", "Straight on"] }),
    step("heel", "Heel", "heel photo",
      "Photograph the back of the shoe straight on so the heel loop and the text are in frame.",
      "Show the heel loop and heel text, straight on.",
      ["heel loop sitting low with a large visible stitch underneath; authentic stitch is almost hidden", "heel text off-center", "loose threads in the lower heel mesh"],
      { readsText: true, framingTips: ["Whole heel in frame", "Straight on"] }),
    step("insole", "Insole", "insole photo",
      "Pull out the insole and photograph its top from directly above.",
      "Show the insole from above with the print in focus.",
      ["Balenciaga name missing or poorly printed on the front of the insole (missing is objective)", "rough insole edges"],
      { readsText: true, framingTips: ["Whole insole in frame", "Shoot from directly above"] }),
    SIZE_TAG(["the style code alone proves nothing: counterfeits copy real codes"]),
    BOX_LABEL,
  ],
});

export const gucciAce = defineProfile({
  ...sneaker,
  id: "gucci-ace",
  brand: "Gucci",
  model: "Ace",
  generation: "Ace low-top (embroidered and plain)",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [SRC.lgAce],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE(["skinny overall shape with a flat toe cap; authentic toe caps curve upward", "gaps in the leather stitching"]),
    step("web_stripe", "Web stripe and bee", "stripe photo",
      "Photograph the green-red-green stripe and any embroidery (bee, snake) close up.",
      "Move closer to the stripe and embroidery.",
      [
        "shiny stripe fabric or a bright, light red and green; authentic stripe is matte and darker",
        "bee embroidery narrow, asymmetric or in mismatched thread",
      ],
      { framingTips: ["Stripe and embroidery in frame", "Even light"] }),
    step("heel", "Heel counter", "heel photo",
      "Photograph the back of the shoe so the GUCCI heel counter is straight on.",
      "Show the heel counter straight on.",
      ["GUCCI letters thick and evenly wide; authentic letters are thin and widely spaced", "a shiny, bubbled print texture on the heel counter", "erratic stitching around the heel counter"],
      { readsText: true, framingTips: ["Heel counter fills the frame", "Straight on"] }),
    step("insole", "Insole", "insole photo",
      "Photograph the insole print from directly above.",
      "Show the insole from above with the print in focus.",
      ["washed-out insole print", "extra text between GUCCI and the size number", "GG text printed black where it should be brown"],
      { readsText: true, framingTips: ["Shoot from directly above", "Logo area in focus"] }),
    step("outsole", "Outsole", "outsole photo",
      "Turn the shoe over and photograph the sole from directly above.",
      "Show the whole outsole from directly above.",
      ["outsole script with uniform letter widths and a bulky R", "shiny rubber where the sole should be matte"],
      { readsText: true, framingTips: ["Whole sole in frame", "Even light"] }),
    SIZE_TAG([
      "documented genuine serials are 12 digits; a short serial (around 7 digits) is a warning sign",
      "a serial that can be found online doesn't prove anything; fakes use real serials",
    ]),
    BOX_LABEL,
  ],
});

export const goldenGooseSuperStar = defineProfile({
  ...sneaker,
  id: "golden-goose-super-star",
  brand: "Golden Goose",
  model: "Super-Star",
  generation: "Current Super-Star (distressed leather, star patch)",
  referenceNote: DESIGNER_REFERENCE_NOTE("Some pairs carry an NFC tag and many don't; NFC can't be checked from a photo and is not used."),
  sources: [SRC.lgSuperStar],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE(["heel counter of constant width; authentic heel counters widen toward the end", "holographic shine on the heel tab visible from the side"]),
    step("star", "Star patch", "star photo",
      "Photograph the star on the side of the shoe straight on.",
      "Fill the frame with the star, straight on.",
      ["the top point of the star cut off (objective)", "frayed star edges, or glitter that looks completely uniform"],
      { framingTips: ["Whole star in frame", "Straight on"] }),
    step("tongue_label", "Tongue label", "tongue label photo",
      "Photograph the label on the tongue straight on.",
      "Fill the frame with the tongue label, straight on.",
      ["label rectangular instead of square", "label stitched with white thread instead of black", "letters bold and heavily slanted"],
      { readsText: true, framingTips: ["Whole label in frame", "Straight on"] }),
    step("insole", "Insole", "insole photo",
      "Photograph the insole from directly above.",
      "Show the insole from above with the print in focus.",
      ["SUPERSTAR text oversized, nearly touching the edges of its black rectangle", "faded, textured background instead of pitch black", "shallow, unclear size numbers"],
      { readsText: true, framingTips: ["Shoot from directly above", "Print in focus"] }),
    step("outsole", "Outsole", "outsole photo",
      "Turn the shoe over and photograph the sole edge and tread from directly above.",
      "Show the whole outsole from directly above.",
      ["few large, pointed zig-zags instead of many small, rounded ones"],
      { framingTips: ["Whole sole in frame", "Even light"] }),
    SIZE_TAG(["the style code on the tongue label should match the box"]),
    BOX_LABEL,
  ],
});

export const diorB23 = defineProfile({
  ...sneaker,
  id: "dior-b23",
  brand: "Dior",
  model: "B23 (Oblique)",
  generation: "B23 high-top and low-top",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [SRC.lgB23],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE([
      "Dior Oblique lettering pitch black on a stark white background; authentic is softer black on creamy white",
      "lining looks solid white instead of slightly see-through",
      "sloppy, asymmetric panel stitching",
    ]),
    step("outsole_logo", "Outsole logo", "outsole photo",
      "Turn the shoe over and photograph the sole and its rubber Dior logo from directly above.",
      "Show the sole and its logo from directly above.",
      ["rubber logo square instead of rectangular, or with visible gaps between letters", "dragonfly details faintly drawn instead of molded"],
      { readsText: true, framingTips: ["Whole sole in frame", "Even light"] }),
    step("heel", "Heel", "heel photo",
      "Photograph the back of the shoe straight on.",
      "Show the heel straight on.",
      ["tall, thin heel counter; authentic is shorter and wider", "loose heel loop stitching"],
      { framingTips: ["Whole heel in frame", "Straight on"] }),
    step("insole", "Insole", "insole photo",
      "Photograph the insole from directly above.",
      "Show the insole from above with the print in focus.",
      ["pale white insole where authentic is beige", "heavy insole lettering that fills most of the space"],
      { readsText: true, framingTips: ["Shoot from directly above", "Print in focus"] }),
    SIZE_TAG(["faint, thin sizing print"]),
    BOX_LABEL,
  ],
});

export const DESIGNER_SNEAKERS = [balenciagaTripleS, gucciAce, goldenGooseSuperStar, diorB23];

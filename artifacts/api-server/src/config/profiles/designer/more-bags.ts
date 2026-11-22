import type { SourceLink } from "@workspace/api-zod";
import { defineProfile } from "../define";
import { LV_DATE_CODE_QUESTION, LV_DATE_CODE_SIGNS } from "./bags";
import {
  DESIGNER_REFERENCE_NOTE,
  FULL_TIPS,
  PACKAGING_QUESTION,
  packagingStep,
  STAMP_TIPS,
  step,
  STITCH_TIPS,
} from "./shared";

/**
 * Second batch of designer handbag and leather-goods profiles (20 items),
 * built from LegitGrails guides read in November 2026. Same conventions as
 * ./shared.ts: "(objective)" only for photo-verifiable facts; contradictory
 * guide claims are left out or phrased neutrally. Steps are kept lean: four
 * to five required photos, the rest optional.
 */

const LG = (path: string, label: string): SourceLink => ({ label: `LegitGrails: ${label}`, url: `https://legitgrails.com/blogs/${path}` });

const bag = {
  kind: "model" as const,
  categoryId: "handbags",
  liveEnabled: true,
  referenceStatus: "documented" as const,
  colorway: null,
};

const HW_TIPS = ["One piece of hardware, close up", "Avoid reflections"];

const full = (what: string, focus: string[]) =>
  step("full_front", "Full front", "full front photo",
    `Place the ${what} on a table and photograph the whole front, handles or strap included.`,
    `Fit the whole ${what} in the frame.`,
    focus, { framingTips: FULL_TIPS });

const label = (title: string, instruction: string, focus: string[], required = true) =>
  step("interior_label", title, "label photo", instruction,
    "Move closer so every letter on the label is sharp.",
    focus, { readsText: true, required, framingTips: STAMP_TIPS });

const hardware = (instruction: string, focus: string[], required = true) =>
  step("hardware", "Hardware close-up", "hardware photo", instruction,
    "Move closer so the engraving on the hardware is sharp.",
    focus, { readsText: true, required, framingTips: HW_TIPS });

const stitching = (instruction: string, focus: string[], required = false) =>
  step("stitching", "Stitching close-up", "stitching close-up", instruction,
    "Move closer to one seam until individual stitches are sharp.",
    focus, { required, framingTips: STITCH_TIPS });

const lvDateCode = step("date_code", "Date code", "date code photo",
  "Find the stamped date code inside (usually on a small leather tab in a pocket) and photograph it straight on.",
  "Move closer so all six characters of the date code are readable.",
  LV_DATE_CODE_SIGNS,
  { presenceQuestionId: "date_code", readsText: true, framingTips: STAMP_TIPS });

const LV_HEAT_STAMP_SIGNS = [
  "misspelling of LOUIS VUITTON, PARIS or MADE IN (objective)",
  "letters thin, scratched-looking or unevenly pressed; authentic letters are pressed in evenly with a narrow I and round O",
  "an oversized, pixelated or broken ® next to LOUIS VUITTON",
  "MADE IN line set in italics or with wide letter spacing",
];

/* ------------------------------------------------------------------ */
/* Louis Vuitton                                                      */
/* ------------------------------------------------------------------ */

export const lvKeepall = defineProfile({
  ...bag,
  id: "lv-keepall",
  brand: "Louis Vuitton",
  model: "Keepall (Monogram)",
  generation: "Keepall 45 / 50 / 55 / 60, with or without Bandoulière",
  category: "Duffle bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("The guide covers the Keepall 55; other sizes share the same construction."),
  sources: [LG("louis-vuitton/real-vs-fake-louis-vuitton-keepall-55-bag-legit-check", "Louis Vuitton Keepall 55 real vs fake")],
  presenceQuestions: [LV_DATE_CODE_QUESTION, PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "authentic outline is rounded; a pentagon-like outline is a warning sign",
      "Keepall sizes are 45, 50, 55 and 60 (the width in cm); a size number outside that set (objective, when printed on the bag)",
      "monogram cut off or misaligned at the seams",
    ]),
    label("Heat stamp", "Open the bag and photograph the LOUIS VUITTON heat stamp inside, straight on.", LV_HEAT_STAMP_SIGNS),
    lvDateCode,
    hardware("Photograph the main zipper pull and the end of the zipper so the engraving and teeth are sharp.", [
      "zipper pull wide, oversized or squared off",
      "a visible gap between the two sides at the end of the zipper",
      "crooked or widely spaced zipper teeth",
      "shallow engraving or grainy, matte metal",
    ]),
    stitching("Photograph where a handle attaches to the bag so the stitches are sharp.", [
      "thin thread in long, sloppy stitches; authentic handle stitching is tight with thick thread",
      "an oversized leather fold at the handle base",
    ], true),
    packagingStep(),
  ],
});

export const lvAlma = defineProfile({
  ...bag,
  id: "lv-alma",
  brand: "Louis Vuitton",
  model: "Alma (Monogram, Damier or Epi)",
  generation: "Alma BB / PM / MM",
  category: "Top-handle bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("louis-vuitton/louis-vuitton-alma-fake-vs-real-guide", "Louis Vuitton Alma fake vs real")],
  presenceQuestions: [LV_DATE_CODE_QUESTION, {
    id: "padlock",
    question: "Does it come with its padlock and keys?",
    help: "The Alma is sold with a small brass padlock.",
    expected: false,
    absentNote: "That's fine. Answering No skips the padlock photo.",
  }, PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "pattern lines up across seams; a mismatched pattern at a seam is a warning sign",
      "pattern squares small and crowded instead of evenly spaced",
      "canvas overly dark or faded",
    ]),
    label("Heat stamp", "Open the bag and photograph the LOUIS VUITTON stamp on the leather tag inside, straight on.", [
      ...LV_HEAT_STAMP_SIGNS,
      "visible stitching around the tag; authentic stitching blends in",
    ]),
    lvDateCode,
    step("handles", "Handle attachments", "handle photo",
      "Photograph where both handles attach to the bag, close enough to read any engraving.",
      "Move closer to the handle attachments so any engraving is readable.",
      [
        "LOUIS VUITTON misspelled on the handle attachment (objective)",
        "the leather pieces where the handles attach differ in size from each other",
        "thin, uneven handle stitching; dull, light-colored, thick handles",
      ], { readsText: true, framingTips: HW_TIPS }),
    step("padlock", "Padlock", "padlock photo",
      "Photograph the front of the padlock straight on.",
      "Move closer so the padlock lettering is sharp.",
      ["toy-like lock with large letters", "shallow engraving or a misspelling (objective)"],
      { presenceQuestionId: "padlock", readsText: true, framingTips: HW_TIPS }),
    step("lining", "Interior", "interior photo", "Open the bag and photograph the lining in good light.", "Show the lining clearly.",
      ["pinkish lining where a rosy red is expected (allow for lighting)"], { required: false }),
    packagingStep(["box with misspelled text or a washed-out logo"]),
  ],
});

export const lvPochetteMetis = defineProfile({
  ...bag,
  id: "lv-pochette-metis",
  brand: "Louis Vuitton",
  model: "Pochette Métis",
  generation: "M44875 Monogram, M44876 Reverse, East West M46279 / M46595",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("Documented style codes are M44875, M44876, M46279, M46595 and M45773, but codes are copied, so they are context only."),
  sources: [LG("louis-vuitton/how-to-authenticate-louis-vuitton-pochette-metis-real-vs-fake-guide", "How to authenticate the Pochette Métis")],
  presenceQuestions: [LV_DATE_CODE_QUESTION, PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "LV print on the strap off-center; strap buckle not square with rounded corners",
      "canvas grain that looks glossy and mechanically repeating",
    ]),
    label("Heat stamp", "Open the bag and photograph the LOUIS VUITTON PARIS stamp inside, straight on.", [
      ...LV_HEAT_STAMP_SIGNS,
      "foil that sits on top of the leather and catches the light instead of being pressed in",
      "creasing or pinching around the stamp, or doubled, fuzzy letter edges",
    ]),
    step("date_code", "Date code", "date code photo",
      "Bags made before March 2021 have a stamped code on a leather tab inside the back zip pocket. Photograph it straight on.",
      "Move closer so all six characters of the date code are readable.",
      [...LV_DATE_CODE_SIGNS, "an ink-printed code instead of a heat-pressed one on a pre-2021 bag"],
      { presenceQuestionId: "date_code", readsText: true, framingTips: STAMP_TIPS }),
    hardware("Photograph the S-lock on the front straight on, including the ® mark.", [
      "the ® on the S-lock is thin, oversized or missing",
      "rivets around the lock at different heights",
      "softened, blurry casting or visible casting seams",
    ]),
    step("zipper", "Zipper pull", "zipper photo",
      "Photograph the back zip pocket's pull and slider so the lettering is readable.",
      "Move closer to the zipper pull so the lettering is sharp.",
      ["distorted letter widths or a smeared VUITTON on the pull", "zipper teeth out of line"],
      { required: false, readsText: true, framingTips: HW_TIPS }),
    packagingStep(["dust bag bright white or grey instead of warm pale yellow with a brown drawstring", "dust bag logo off-center or thinly printed"]),
  ],
});

export const lvWallet = defineProfile({
  ...bag,
  id: "lv-wallet",
  brand: "Louis Vuitton",
  model: "Monogram wallet (Zippy, Sarah, Victorine and similar)",
  generation: "Monogram canvas wallets",
  category: "Wallet",
  referenceNote: DESIGNER_REFERENCE_NOTE("Built from a general Louis Vuitton wallet guide; checks are shared across wallet models."),
  sources: [LG("louis-vuitton/real-vs-fake-louis-vuitton-wallet-legit-check", "Louis Vuitton wallet real vs fake")],
  presenceQuestions: [LV_DATE_CODE_QUESTION, PACKAGING_QUESTION],
  steps: [
    full("wallet", [
      "canvas color leaning orange instead of a subtle brownish beige",
      "monogram lines crowded together",
      "lettering stretched, tilted or wavy",
    ]),
    label("Heat stamp", "Open the wallet and photograph the LOUIS VUITTON stamp inside, straight on.", LV_HEAT_STAMP_SIGNS),
    lvDateCode,
    step("interior", "Inside the wallet", "interior photo",
      "Open the wallet fully and photograph all the card slots and pockets.",
      "Open the wallet fully so every pocket is in frame.",
      ["extra pockets that the model doesn't have", "loose card slots"], { framingTips: ["Wallet fully open", "Even light"] }),
    hardware("Photograph the zipper pull or snap button close up.", [
      "silvery, reflective pull with whitish engraving instead of gold with deep lettering",
      "crooked zipper teeth or an oversized slider",
    ]),
    packagingStep(),
  ],
});

export const lvInitialesBelt = defineProfile({
  ...bag,
  id: "lv-initiales-belt",
  brand: "Louis Vuitton",
  model: "LV Initiales belt",
  generation: "30 mm and 40 mm, reversible",
  category: "Belt",
  referenceNote: DESIGNER_REFERENCE_NOTE("The code on the back is a style and size reference, not a number unique to the belt."),
  sources: [LG("louis-vuitton/real-vs-fake-louis-vuitton-belt-lv-initiales-legit-check", "Louis Vuitton Initiales belt real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    step("full_belt", "Full belt", "full belt photo",
      "Lay the belt flat and photograph the whole length, buckle included.",
      "Fit the whole belt in the frame.",
      ["strap print blurred or faded by the texture", "print letters bold instead of slender"], { framingTips: FULL_TIPS }),
    step("buckle_front", "LV buckle", "buckle photo",
      "Photograph the LV buckle straight on so its corners and screws are sharp.",
      "Fill the frame with the LV buckle.",
      [
        "bulky buckle with square corners; authentic corners are rounded",
        "the large screw not sitting precisely on top of the buckle; small screws rounded instead of flat and set deep",
        "thick, bold, irregular LV letters",
      ], { framingTips: HW_TIPS }),
    step("strap_stamp", "Back code stamp", "code stamp photo",
      "Turn the belt over and photograph the code and MADE IN stamp on the back, straight on.",
      "Move closer so every character of the code is readable.",
      [
        "the back code is two letters and four digits; a different layout is a warning sign",
        "bold, oversized code font; authentic is pale and slender",
        "misspelled MADE IN line (objective)",
      ], { readsText: true, framingTips: STAMP_TIPS }),
    stitching("Move close to the strap edge stitching.", ["glossy thread where authentic thread is matte"]),
    packagingStep(["box orange brighter than usual, with thin lettering"]),
  ],
});

/* ------------------------------------------------------------------ */
/* Chanel and Hermès                                                  */
/* ------------------------------------------------------------------ */

const CHANEL_SERIAL = step("serial", "Serial sticker or plate", "serial photo",
  "Find the serial sticker or metal plate inside and photograph it straight on so every character is readable.",
  "Move closer so every character of the serial is readable.",
  [
    "sticker serials are all digits: 6 digits (about 1984–1986), 7 digits (1986–2005) or 8 digits (2005 to 2020–2022). A sticker code with letters, or fewer than 6 or more than 8 digits (objective)",
    "metal plates (from 2021) carry a mix of letters and digits",
    "square, large serial digits; authentic digits are smaller and rounded",
    "a bold double CC above the digits; authentic is thin and pale",
  ],
  { presenceQuestionId: "serial", readsText: true, framingTips: STAMP_TIPS });

const CHANEL_SERIAL_Q = {
  id: "serial",
  question: "Is there a serial sticker or a small metal serial plate inside?",
  help: "Older pieces have a sticker inside; pieces from 2021 have a small engraved metal plate.",
  expected: true,
  absentNote: "Most Chanel bags have one. If you answer No, the listing will go to manual review.",
};

export const chanelBoy = defineProfile({
  ...bag,
  id: "chanel-boy",
  brand: "Chanel",
  model: "Boy Bag",
  generation: "Old Medium, Small, New Medium, Large",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("Guides disagree on caviar grain size, so grain is not used as a warning sign."),
  sources: [LG("chanel/chanel-boy-bag-fake-vs-real-guide", "Chanel Boy Bag fake vs real")],
  presenceQuestions: [CHANEL_SERIAL_Q, PACKAGING_QUESTION],
  steps: [
    full("bag", ["outline more rectangular than square", "quilting misaligned across the flap and body"]),
    hardware("Photograph the CC plaque on the front straight on, including the screws.", [
      "the four corner squares of the plaque uneven in size",
      "CC strokes thick and crowding the plate",
      "central logo off-center or in the wrong font",
      "oversized, obvious screws; authentic screws are small and blend in",
    ]),
    label("Interior stamp", "Open the flap and photograph the CHANEL stamp inside, straight on.", [
      "CHANEL or MADE IN misspelled (objective)",
      "label stitching sloppy or not securing the label",
    ]),
    CHANEL_SERIAL,
    stitching("Move close to the quilting stitches on the back.", ["skipped, loose or wandering quilting stitches"]),
    packagingStep(),
  ],
});

export const chanelWoc = defineProfile({
  ...bag,
  id: "chanel-woc",
  brand: "Chanel",
  model: "Wallet on Chain (WOC)",
  generation: "Classic WOC, caviar or lambskin",
  category: "Chain wallet",
  referenceNote: DESIGNER_REFERENCE_NOTE("Guides disagree on caviar grain size, so grain is not used as a warning sign."),
  sources: [LG("chanel/real-vs-fake-chanel-wallet-on-chain-legit-check", "Chanel Wallet on Chain real vs fake")],
  presenceQuestions: [CHANEL_SERIAL_Q, PACKAGING_QUESTION],
  steps: [
    full("wallet", [
      "flap edge sitting very close to the bottom edge; authentic leaves a wider gap",
      "wavy side edges instead of straight ones",
    ]),
    step("back_pocket", "Back pocket", "back pocket photo",
      "Turn the WOC over and photograph the back pocket so the quilting on and around it is in frame.",
      "Show the whole back pocket and the quilting around it.",
      ["quilting on the back pocket that doesn't line up with the quilting around it (objective, when the seam is clearly in frame)"],
      { framingTips: ["Straight on", "Whole pocket in frame"] }),
    hardware("Photograph the CC turnlock straight on.", [
      "the right C passes over the left C at the top; the reverse overlap is a warning sign",
      "small CC with tight spacing; a yellowish tone",
    ]),
    label("Interior stamp", "Open the flap and photograph the CHANEL and MADE IN stamp inside.", [
      "CHANEL or MADE IN misspelled (objective)",
      "bold, thick, squarish letters; authentic lettering is thin with wider spacing",
    ]),
    CHANEL_SERIAL,
    packagingStep(),
  ],
});

const HERMES_STAMP_SIGNS = [
  "three lines reading HERMÈS, PARIS, MADE IN FRANCE that step down in width; a misspelling, a missing accent on HERMÈS or a missing line (objective)",
  "a bottom line nearly as wide as the top line",
  "foil riding over the grain or letters with missing sections; block set high or off-center",
];

export const hermesKelly = defineProfile({
  ...bag,
  id: "hermes-kelly",
  brand: "Hermès",
  model: "Kelly",
  generation: "Kelly 25 / 28 / 32 / 35, Sellier and Retourne",
  category: "Top-handle bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("The guide contradicts itself on lettering weight, so letter weight is not used as a warning sign."),
  sources: [LG("hermes/real-vs-fake-hermes-kelly-bag-legit-check", "Hermès Kelly real vs fake")],
  presenceQuestions: [{
    id: "lock_keys",
    question: "Do you have the padlock and keys?",
    help: "Kellys come with a padlock and keys in a leather clochette.",
    expected: false,
    absentNote: "That's fine. Answering No skips the padlock photo.",
  }, PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "base too wide for the top; authentic is boat-shaped, wide at the bottom and narrower at the top",
      "rounded corners; authentic corners are sharp",
      "a bulky, embossed-looking flap instead of a flat, crisp one",
    ]),
    hardware("Photograph the turn-lock closure and the strap plates straight on, screws included.", [
      "solid, covered screw heads; authentic screw heads are hollowed out",
      "thick strap plate with blurred detail",
      "HERMÈS PARIS misspelled or missing on the plate (objective)",
    ]),
    label("Heat stamp", "Lift the flap and photograph the HERMÈS PARIS MADE IN FRANCE stamp, straight on.", HERMES_STAMP_SIGNS),
    step("padlock", "Padlock and key", "padlock photo",
      "Photograph the padlock and key together, close up.",
      "Move closer so the padlock and key detail is sharp.",
      ["a tiny lock with straight edges", "a key with shallow, poorly defined cuts", "padlock and key numbers that differ (locks and keys can be swapped, so this goes to review)"],
      { presenceQuestionId: "lock_keys", readsText: true, framingTips: HW_TIPS }),
    stitching("Move close to the handle stitching.", ["loose, tiny stitches in thin thread", "asymmetric sewing on the handle"], true),
    packagingStep(["box should be orange; anything printed inside the box is a warning sign"]),
  ],
});

export const hermesEvelyne = defineProfile({
  ...bag,
  id: "hermes-evelyne",
  brand: "Hermès",
  model: "Evelyne",
  generation: "Evelyne TPM / PM / GM (Evelyne III)",
  category: "Crossbody bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("The silhouette is not a reliable separator for the Evelyne; the perforated H and the stamps are."),
  sources: [LG("hermes/real-vs-fake-hermes-evelyne", "Hermès Evelyne real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    step("perforated_h", "Perforated H", "perforated H photo",
      "Photograph the perforated H on the front straight on, close enough to see each hole.",
      "Move closer so every hole in the H is sharp.",
      [
        "holes oval or of different sizes within one stroke; authentic holes are round and equal",
        "pale, torn cut edges inside the holes",
        "pairs of holes nearly touching, or gaps about double width",
        "a wobbly outer oval",
      ], { framingTips: ["Straight on", "Even light, no shadows across the holes"] }),
    step("leather", "Leather grain", "leather close-up",
      "Move close to the leather until the grain is sharp.",
      "Move closer until the grain is sharp.",
      ["grain that follows a repeating diagonal lattice; authentic cells vary in size and shape"], { framingTips: ["Side light shows the texture"] }),
    label("Heat stamp", "Photograph the three-line HERMÈS stamp on the leather tab straight on.", HERMES_STAMP_SIGNS),
    step("blind_stamp", "Blind stamp", "blind stamp photo",
      "Photograph the small pressed blind stamp on the leather tab with light from the side.",
      "Move closer and angle a light so the blind stamp shows.",
      ["characters pressed very deep with the grain flattened and burnished rims", "characters so tall they fill the tab"],
      { readsText: true, framingTips: STAMP_TIPS }),
    stitching("Move close to the tab stitching.", ["a stitch line that wanders or loosens at the corners"]),
    packagingStep(["dust bag print sitting on top of the fabric as a solid film instead of letting the weave show through", "H on the dust bag nearly touching its ring"]),
  ],
});

/* ------------------------------------------------------------------ */
/* Gucci, Dior, Prada                                                 */
/* ------------------------------------------------------------------ */

const GUCCI_SERIAL = step("serial_tag", "Serial tag", "serial tag photo",
  "Find the small leather tag inside with rows of numbers and photograph it straight on.",
  "Move closer so every number on the tag is readable.",
  ["serial digits bold and large", "letters or a date code on the serial tag", "a serial alone proves nothing: fakes copy real numbers"],
  { required: false, readsText: true, framingTips: STAMP_TIPS });

export const gucciDionysus = defineProfile({
  ...bag,
  id: "gucci-dionysus",
  brand: "Gucci",
  model: "Dionysus",
  generation: "GG Supreme canvas and leather",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("gucci/gucci-dionysus-gg-bag-authentication-guide", "Gucci Dionysus authentication guide")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "a sharp, boxy square outline; authentic is rectangular",
      "pale beige GG print with high contrast; authentic print is dark beige and blends in",
    ]),
    step("sides", "Side edges", "side photo",
      "Photograph one side of the bag so the edges are in frame.",
      "Show the side edges clearly.",
      ["bag edges left exposed; authentic black edge guards cover the edges fully"], { framingTips: ["Side on", "Even light"] }),
    hardware("Photograph the metal closure on the front straight on.", ["dark hardware with black streaks; authentic is an even antique silver", "narrow or asymmetric engraving"]),
    label("Interior label", "Open the bag and photograph the GUCCI label inside, straight on.", [
      "GUCCI or MADE IN ITALY misspelled (objective)",
      "roughly cut label with uneven stitches",
      "small, tightly spaced label lettering",
    ]),
    GUCCI_SERIAL,
    packagingStep(),
  ],
});

export const gucciJackie = defineProfile({
  ...bag,
  id: "gucci-jackie-1961",
  brand: "Gucci",
  model: "Jackie 1961",
  generation: "GG Supreme and leather",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("gucci/real-vs-fake-gucci-jackie-1961-handbag-legit-check", "Gucci Jackie 1961 real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "print ground looking white or grey instead of a warm light brown-grey",
      "large, thin print letters; authentic letters are rounder, smaller and closer",
    ]),
    hardware("Photograph the metal buckle closure straight on.", [
      "narrow, matte, rose-gold-toned buckle; authentic is wider and reflective",
      "small, tight, scratched lettering on the hardware",
    ]),
    step("handle", "Handle", "handle photo",
      "Photograph where the handle attaches, close up.",
      "Move closer to the handle base.",
      ["matte handle leather; authentic is glossy", "loose, sloppy handle stitching"], { framingTips: STITCH_TIPS }),
    label("Interior tag", "Open the bag and photograph the GUCCI tag inside, straight on.", [
      "GUCCI or MADE IN ITALY misspelled (objective)",
      "light, nearly textureless tag with faint lettering",
      "sloppy tag stitching",
    ]),
    GUCCI_SERIAL,
    packagingStep(),
  ],
});

export const diorBookTote = defineProfile({
  ...bag,
  id: "dior-book-tote",
  brand: "Dior",
  model: "Book Tote",
  generation: "Embroidered Oblique and other embroideries",
  category: "Tote",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("dior/real-vs-fake-dior-book-tote-legit-check", "Dior Book Tote real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("tote", [
      "fuzzy print with the wrong size or colors",
      "a thin, wavy cord along the edges; authentic has a thick, straight cord on three sides",
      "small, hard-to-read print letters",
    ]),
    step("embroidery", "Embroidery close-up", "embroidery photo",
      "Move close to the embroidery until individual threads are sharp.",
      "Move closer until the threads are sharp.",
      ["white thread in a pattern that repeats identically; authentic uses beige thread in irregular lines"], { framingTips: STITCH_TIPS }),
    step("handle", "Handle", "handle photo",
      "Photograph one handle along its length.",
      "Show one handle clearly.",
      ["a handle with a single central line; authentic handles show two lines joined in the middle", "black handle stitching instead of cream"],
      { framingTips: ["Whole handle in frame"] }),
    label("Interior label", "Photograph the CHRISTIAN DIOR label inside the tote, straight on.", [
      "CHRISTIAN DIOR, PARIS or MADE IN ITALY misspelled or missing on a fully visible label (objective)",
      "thick, widely spaced letters; a wavy PARIS",
      "faded label letters or shiny label thread",
    ]),
    packagingStep(),
  ],
});

export const pradaGalleria = defineProfile({
  ...bag,
  id: "prada-galleria",
  brand: "Prada",
  model: "Galleria",
  generation: "Saffiano leather, all sizes",
  category: "Top-handle bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("prada/real-vs-fake-prada-galleria-bag-legit-check", "Prada Galleria real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "narrower at the bottom than the top; authentic is wider at the bottom",
      "handle attachments tilted",
    ]),
    step("logo_plate", "Logo plate", "logo photo",
      "Photograph the PRADA MILANO logo plate straight on.",
      "Fill the frame with the logo plate.",
      [
        "PRADA or MILANO misspelled (objective)",
        "the R in PRADA has a right leg that kicks outward with a notched end; a straight leg is a warning sign",
        "thin, pale, asymmetric lettering or sloppy stitching around the plate",
      ], { readsText: true, framingTips: HW_TIPS }),
    hardware("Photograph a zipper puller and a metal foot on the base, close up.", [
      "short, wide puller with rough cutouts",
      "flat, bronze-colored base feet with illegible engraving",
    ]),
    label("Interior label", "Open the bag and photograph the metal label in the interior pocket.", [
      "small, asymmetric metal label in a different font",
      "thin, nearly invisible pocket stitching",
    ]),
    packagingStep(),
  ],
});

/* ------------------------------------------------------------------ */
/* Celine, Loewe, Bottega Veneta, Balenciaga                          */
/* ------------------------------------------------------------------ */

export const celineLuggage = defineProfile({
  ...bag,
  id: "celine-luggage",
  brand: "Celine",
  model: "Luggage tote",
  generation: "Nano / Micro / Mini",
  category: "Tote",
  referenceNote: DESIGNER_REFERENCE_NOTE("The logo style dates the bag: the accented CÉLINE logo was used until 2018."),
  sources: [LG("celine/real-vs-fake-celine-luggage-bag-legit-check", "Celine Luggage real vs fake"), LG("celine", "Celine guides (logo change, date codes)")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "oversized side wings with an exaggerated shape",
      "flat, poorly defined side ornaments",
    ]),
    step("logo_stamp", "Logo stamp", "logo stamp photo",
      "Photograph the CELINE logo stamp on the front straight on.",
      "Move closer so every letter of the logo is sharp.",
      [
        "CELINE or PARIS misspelled (objective)",
        "the I visibly smaller than the N, or inconsistent letter sizes",
        "a thin PARIS line",
      ], { readsText: true, framingTips: STAMP_TIPS }),
    step("date_code", "Date code", "date code photo",
      "Open the bag and photograph the stamped date code on the inside leather, straight on.",
      "Move closer so every character of the date code is readable.",
      [
        "Celine date codes read like F-SL-2241: in the four digits, the 1st and 3rd are the week and the 2nd and 4th the year (week 24 of 2021)",
        "a code dated September 2018 or later on a bag with the old accented CÉLINE logo (objective, when both are clearly readable)",
        "a correct-looking code does not prove authenticity",
      ], { readsText: true, required: false, framingTips: STAMP_TIPS }),
    hardware("Photograph the zipper and the leather puller close up.", [
      "puller with rounded edges; authentic puller edges are square",
      "crooked, widely spaced zipper teeth",
    ]),
    label("Interior label", "Photograph the label inside the bag straight on.", [
      "label with no stitching over its edge, cut as one solid piece",
      "small label with tiny, hard-to-read letters",
    ], false),
    packagingStep(),
  ],
});

export const loewePuzzle = defineProfile({
  ...bag,
  id: "loewe-puzzle",
  brand: "Loewe",
  model: "Puzzle bag",
  generation: "Small / Medium / Mini",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("loewe/real-vs-fake-loewe-puzzle-bag-legit-check", "Loewe Puzzle real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", ["puzzle panel lines that blend into the background instead of standing out boldly", "panels smaller than usual"]),
    hardware("Photograph the zipper puller close up so its shape and lettering are clear.", [
      "wide puller with a rounded side; authentic is narrow and pointed",
      "thin, tightly spaced puller lettering",
      "uneven zipper teeth",
    ]),
    step("anagram", "Anagram logo", "anagram photo",
      "Photograph the Anagram logo straight on (metal or embossed).",
      "Fill the frame with the Anagram logo.",
      ["engraved Anagram that doesn't fill its metal square", "embossed Anagram oversized with little fine detail"], { framingTips: HW_TIPS }),
    label("Interior label and serial tag", "Open the bag and photograph the interior label and the serial tag.", [
      "LOEWE misspelled on the label (objective)",
      "label cut oddly at the bottom",
      "serial tag fully rounded at the bottom with a peeling top layer; authentic is curved with defined corners",
    ]),
    stitching("Photograph the handle and its stitching close up.", ["bubbly or peeling handle surface", "sloppy handle stitching"]),
    packagingStep(),
  ],
});

export const bottegaJodie = defineProfile({
  ...bag,
  id: "bottega-jodie",
  brand: "Bottega Veneta",
  model: "Jodie",
  generation: "Mini / Teen / Large, intrecciato",
  category: "Hobo bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("bottega-veneta/real-vs-fake-bottega-veneta-jodie-legit-check", "Bottega Veneta Jodie real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "the Jodie has no exterior logo; a visible logo on the outside (objective)",
      "weave that buckles or shows gaps",
      "a gap between the knot and the handle base, or a sewn seam where the handle meets the body",
    ]),
    step("weave", "Weave close-up", "weave photo",
      "Move close to the woven leather until individual strips are sharp.",
      "Move closer until the strips are sharp.",
      ["thick, shiny strips that show a different underside color", "uneven strand widths"], { framingTips: ["Weave fills the frame"] }),
    hardware("Photograph the zipper pull inside, close up.", [
      "pull tab without an even triangle cutout at its end",
      "pull and base in different colors",
    ]),
    label("Interior stamp", "Photograph the BOTTEGA VENETA stamp inside straight on.", [
      "BOTTEGA VENETA or MADE IN ITALY misspelled (objective)",
      "evenly weighted, widely spaced or oversized stamp letters; authentic is a compact serif with varying stroke thickness",
    ]),
    packagingStep(["oversized dust bag for a Mini Jodie", "bright green dust bag print instead of deep green"]),
  ],
});

export const balenciagaCity = defineProfile({
  ...bag,
  id: "balenciaga-city",
  brand: "Balenciaga",
  model: "City / Le City",
  generation: "Classic City (2003 onward) and Le City",
  category: "Top-handle bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("The tag's season letter is not confirmed for Le City, so Le City tags are not dated from the letter."),
  sources: [LG("balenciaga/real-vs-fake-balenciaga-city-bag-legit-check", "Balenciaga City real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "a hard rectangle with small corner triangles",
      "stiff, shiny leather instead of soft, matte, distressed leather",
      "thick, visible, sloppy stitching",
    ]),
    hardware("Photograph a rivet and the back of a zipper pull close up.", [
      "rivets with a square or shallow half-moon notch; authentic notches are rounded U shapes (bags up to about 2005 have smooth rivets, which are fine)",
      "zipper pull marking that doesn't match the era: Lampo on older bags, a single B later, a double B on recent pulls",
      "crooked, spaced-out zipper teeth or a bulky pull",
    ]),
    label("Interior tag", "Open the bag and photograph the leather tag inside so every character is readable.", [
      "current tags show four groups: style number, color number, one season letter and a line number (e.g. 432835 6260 B 535269); a different layout is a warning sign",
      "MADE IN ITALY missing or misspelled (objective)",
      "thick, uneven characters; on metal plates, digits engraved with a single line instead of a double line",
    ]),
    step("pocket", "Inside zip pocket", "pocket photo",
      "Photograph the inside zip pocket so its edge and the pocket label are in frame.",
      "Show the inside pocket edge and label clearly.",
      ["zipper tape sewn straight onto the fabric where older bags have leather trim", "an oversized pocket label with thick letters"],
      { required: false, framingTips: ["Pocket edge in frame", "Good light inside"] }),
    step("handles", "Handles", "handle photo",
      "Photograph both handles where they meet the bag.",
      "Show both handles and their wrap clearly.",
      ["bulky handles with a wide rope wrap"], { required: false }),
    packagingStep(),
  ],
});

/* ------------------------------------------------------------------ */
/* Saint Laurent, Fendi, Miu Miu                                      */
/* ------------------------------------------------------------------ */

export const yslSacDeJour = defineProfile({
  ...bag,
  id: "ysl-sac-de-jour",
  brand: "Saint Laurent",
  model: "Sac de Jour",
  generation: "Nano / Baby / Small / Medium",
  category: "Top-handle bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("saint-laurent/real-vs-fake-saint-laurent-sac-de-jour-bag-legit-check", "Saint Laurent Sac de Jour real vs fake"), LG("saint-laurent", "Saint Laurent guides (lettering)")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "the leather tag hangs from the left handle attachment; a tag on the right is a warning sign",
      "wide, bulky, heavily textured handles",
      "rounded panels instead of linear, precise sections",
    ]),
    label("Interior stamp", "Open the bag and photograph the SAINT LAURENT PARIS stamp inside, straight on.", [
      "SAINT LAURENT or PARIS misspelled (objective)",
      "PARIS should be much smaller than SAINT LAURENT; a PARIS almost as tall is a warning sign",
      "a text line that tilts at its edges",
      "wide, short letters; authentic letters are slim and tall",
    ]),
    hardware("Photograph the padlock charm and the magnetic closure close up.", [
      "silver-toned padlock with faint engraving",
      "closure that looks completely flat or has a holographic sheen",
    ]),
    stitching("Photograph a seam along a panel edge.", ["uneven, loose or misaligned stitching"]),
    packagingStep(),
  ],
});

export const fendiPeekaboo = defineProfile({
  ...bag,
  id: "fendi-peekaboo",
  brand: "Fendi",
  model: "Peekaboo",
  generation: "Peekaboo and Peekaboo X-Lite",
  category: "Top-handle bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("Built from the Peekaboo X-Lite guide; the classic Peekaboo shares the turn lock and side construction."),
  sources: [LG("fendi/real-vs-fake-peekaboo-x-lite-bag-legit-check", "Fendi Peekaboo X-Lite real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", ["little difference in width between top and bottom; authentic is wide at the bottom and narrower at the top", "contrasting thread or asymmetric stitching"]),
    hardware("Photograph the turn lock and the metal plate on the flap, straight on.", [
      "a metal rectangle that sits over the flap instead of passing through the leather",
      "screws darker than the surrounding metal",
      "MADE IN ITALY nearly unreadable on the hardware",
      "small, narrow lock",
    ]),
    step("sides", "Side button", "side photo",
      "Photograph the FF button on the side and its buttonhole.",
      "Show the side button and buttonhole clearly.",
      ["buttonhole cut as a thin slit too small to fasten", "small, flat FF button with bold letters"], { framingTips: HW_TIPS }),
    step("bottom", "Bottom", "bottom photo",
      "Turn the bag over and photograph the base.",
      "Show the whole base clearly.",
      ["a black edge outline that is almost absent", "oversized stitches along the base"], { required: false }),
    label("Interior label", "Open the bag and photograph the interior label straight on.", [
      "FENDI, ROMA or MADE IN ITALY misspelled (objective)",
      "reflective, smooth metal label instead of a faded, matte one",
    ]),
    packagingStep(["box print thick, bold and glossy"]),
  ],
});

export const miuMiuWander = defineProfile({
  ...bag,
  id: "miu-miu-wander",
  brand: "Miu Miu",
  model: "Wander matelassé",
  generation: "5BC125, 5BC153, Hobo 5BP078",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("Miu Miu issues no per-unit serial or date code; the white factory tag is shared by many bags."),
  sources: [LG("miu-miu/real-vs-fake-miu-miu-wander-bag", "Miu Miu Wander real vs fake")],
  presenceQuestions: [{
    id: "product_card",
    question: "Do you have the product card that came with the bag?",
    help: "A small printed card with a product code like 5BC125_AN88_F0002.",
    expected: false,
    absentNote: "That's fine. Answering No skips the card photo.",
  }, PACKAGING_QUESTION],
  steps: [
    step("front_logo", "MIU MIU logo", "logo photo",
      "Photograph the metal MIU MIU logo on the front straight on, with the phone level.",
      "Fill the frame with the logo, straight on and level.",
      [
        "on authentic bags the gap between the i and u is about one fifth of the letter height and no wider than the gap between m and i; a gap near one third of the letter height, the widest in the word, is a warning sign",
        "a split m and slit u appear on genuine bags too, so they are not warning signs",
      ], { readsText: true, framingTips: ["Straight on", "Phone level with the logo"] }),
    step("patch", "Interior logo patch", "patch photo",
      "Open the bag and photograph the leather logo patch inside so its border stitching is sharp.",
      "Move closer so the stitches around the patch are sharp.",
      ["border stitches about half the letter height long and wavy; authentic stitches are about a quarter of the letter height, steady and parallel to the edge", "about half as many border stitches along the same edge as genuine"],
      { framingTips: STITCH_TIPS }),
    step("factory_tag", "Factory tag and origin label", "tag photo",
      "Photograph the small white tag and the MADE IN label in the lining.",
      "Move closer so the tag and label text are readable.",
      ["the white tag carries one to three digits (a factory code, not a serial)", "genuine bags are reported MADE IN ITALY or MADE IN TURKEY"],
      { readsText: true, required: false, framingTips: STAMP_TIPS }),
    step("product_card", "Product card", "card photo",
      "Photograph the product card straight on so the code is readable.",
      "Move closer so the product code is readable.",
      ["product code format is like 5BC125_AN88_F0002, where the last block is the color; a color block that doesn't match the bag's color (objective, when readable)"],
      { presenceQuestionId: "product_card", readsText: true, framingTips: STAMP_TIPS }),
    packagingStep(),
  ],
});

export const MORE_DESIGNER_BAGS = [
  lvKeepall,
  lvAlma,
  lvPochetteMetis,
  lvWallet,
  lvInitialesBelt,
  chanelBoy,
  chanelWoc,
  hermesKelly,
  hermesEvelyne,
  gucciDionysus,
  gucciJackie,
  diorBookTote,
  pradaGalleria,
  celineLuggage,
  loewePuzzle,
  bottegaJodie,
  balenciagaCity,
  yslSacDeJour,
  fendiPeekaboo,
  miuMiuWander,
];

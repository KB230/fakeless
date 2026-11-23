import type { SourceLink } from "@workspace/api-zod";
import { defineProfile, SIZE_TAG_QUESTION, WASH_TAG_QUESTION, type StepDef } from "../define";
import { LV_DATE_CODE_QUESTION, LV_DATE_CODE_SIGNS } from "./bags";
import { BOX_LABEL, SIDE, SIZE_TAG } from "./sneakers";
import {
  BOX_LABEL_QUESTION,
  DESIGNER_REFERENCE_NOTE,
  FULL_TIPS,
  PACKAGING_QUESTION,
  packagingStep,
  STAMP_TIPS,
  step,
  STITCH_TIPS,
} from "./shared";

/**
 * Third batch (23 items), built from LegitGrails guides read in November
 * 2026. Lessons from the live photo test are applied here: every sign states
 * what fakes show AND what genuine items show, so it can't be read backwards,
 * and "(objective)" is limited to facts a photo can settle. Colour, shine and
 * foil tone are avoided where the guides themselves say they are not tells.
 */

const LG = (path: string, label: string): SourceLink => ({ label: `LegitGrails: ${label}`, url: `https://legitgrails.com/blogs/${path}` });
const HW_TIPS = ["One piece of hardware, close up", "Avoid reflections"];

const model = { kind: "model" as const, liveEnabled: true, referenceStatus: "documented" as const, colorway: null };
const bag = { ...model, categoryId: "handbags" };

const full = (what: string, focus: string[]): StepDef =>
  step("full_front", "Full front", "full front photo",
    `Place the ${what} on a table and photograph the whole front, handles or strap included.`,
    `Fit the whole ${what} in the frame.`, focus, { framingTips: FULL_TIPS });
const label = (title: string, instruction: string, focus: string[], required = true): StepDef =>
  step("interior_label", title, "label photo", instruction,
    "Move closer so every letter on the label is sharp.", focus, { readsText: true, required, framingTips: STAMP_TIPS });
const hardware = (instruction: string, focus: string[], required = true): StepDef =>
  step("hardware", "Hardware close-up", "hardware photo", instruction,
    "Move closer so the engraving on the hardware is sharp.", focus, { readsText: true, required, framingTips: HW_TIPS });
const stitching = (instruction: string, focus: string[], required = false): StepDef =>
  step("stitching", "Stitching close-up", "stitching close-up", instruction,
    "Move closer to one seam until individual stitches are sharp.", focus, { required, framingTips: STITCH_TIPS });
const lvDateCode = (extra: string[] = []): StepDef =>
  step("date_code", "Date code", "date code photo",
    "Find the stamped date code inside (on a small leather tab or pressed into the lining near a pocket) and photograph it straight on.",
    "Move closer so all six characters of the date code are readable.",
    [...LV_DATE_CODE_SIGNS, ...extra],
    { presenceQuestionId: "date_code", readsText: true, framingTips: STAMP_TIPS });

/* ------------------------------------------------------------------ */
/* Louis Vuitton                                                      */
/* ------------------------------------------------------------------ */

export const lvOnTheGo = defineProfile({
  ...bag,
  id: "lv-onthego",
  brand: "Louis Vuitton",
  model: "OnTheGo",
  generation: "GM / MM / PM, Monogram Giant and Empreinte",
  category: "Tote",
  referenceNote: DESIGNER_REFERENCE_NOTE("Replicas copy the silhouette closely, so the checks focus on hardware, the heat stamp and the date code."),
  sources: [LG("louis-vuitton/real-vs-fake-louis-vuitton-onthego", "Louis Vuitton OnTheGo real vs fake")],
  presenceQuestions: [LV_DATE_CODE_QUESTION, PACKAGING_QUESTION],
  steps: [
    full("tote", ["Empreinte versions: fakes show smooth, flat LV letters cut off from the grain; genuine grain continues unbroken through the letters"]),
    hardware("Photograph the snap hook on the strap and an interior zipper pull close up.", [
      "fakes show a thin-line LV on the snap hook; genuine shows a deep, broad LV",
      "fakes show a raised ringed rivet at the hook corner; genuine shows a flush corner circle",
      "fakes show a flat bent strip linking the zipper pull; genuine shows a rounded bar link",
    ]),
    label("Heat stamp", "Open the tote and photograph the LOUIS VUITTON heat stamp patch inside, straight on.", [
      "misspelling of LOUIS VUITTON, PARIS or MADE IN (objective)",
      "fakes show a ® about a third taller than the capital letters; genuine shows a ® about as tall as the capitals",
      "fakes show short, widely spaced dots around the patch border; genuine shows longer dashes running close to the edge",
    ]),
    lvDateCode([
      "the OnTheGo launched in 2019 and moved to a chip in March 2021: a code that decodes to 2022 or later on this model (objective)",
      "fakes show thin, widely spaced code characters; genuine shows bold, compact characters",
    ]),
    packagingStep(),
  ],
});

export const lvCapucines = defineProfile({
  ...bag,
  id: "lv-capucines",
  brand: "Louis Vuitton",
  model: "Capucines",
  generation: "Mini / BB / MM / GM",
  category: "Top-handle bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("Made-in country (France, Spain, Italy or USA) and metal vs leather initials both vary on genuine bags, so neither is a warning sign."),
  sources: [LG("louis-vuitton/real-vs-fake-louis-vuitton-capucines", "Louis Vuitton Capucines real vs fake")],
  presenceQuestions: [LV_DATE_CODE_QUESTION, PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "fakes show creases radiating from the initials' arm anchors and a puckered seam; genuine shows flat leather and a level seam",
      "fakes show an L foot that thins to a slanted tip; genuine shows an even-width L foot with a square-cut tip",
    ]),
    hardware("Photograph the snap hook and the zipper pull close up so the engraving is sharp.", [
      "fakes show a gate pin in a different metal from the hook; genuine shows a pin in the hook's own metal, seated flush",
      "fakes show a narrow oval hook opening, widest near the top; genuine shows a wide pear-shaped opening, widest near the bottom",
      "fakes show LOUIS VUITTON set low and to one side on the zipper pull; genuine shows both words centered with even margins",
    ]),
    label("Heat stamp", "Photograph the LOUIS VUITTON PARIS MADE IN stamp inside the bag, straight on.", [
      "misspelling of LOUIS VUITTON, PARIS or MADE IN (objective)",
      "fakes show a large ® floating above the line; genuine shows a small ® tucked against the final N, top at cap height",
    ]),
    lvDateCode([
      "the Capucines code is pressed into the lining next to the inner zip pocket, not on a separate tab",
      "fakes show a code printed in foil on top of the leather; genuine shows a code pressed below the surface with slightly broken strokes",
    ]),
    stitching("Photograph a corner of the bag where the stitching follows the curve.", [
      "fakes show stitching that crowds the edge on the corner curve; genuine keeps a constant margin from the edge through the curve",
      "fakes show longer stitches that spread on the turn; genuine shows short, evenly spaced stitches",
    ], true),
    packagingStep(),
  ],
});

export const lvCoussin = defineProfile({
  ...bag,
  id: "lv-coussin",
  brand: "Louis Vuitton",
  model: "Coussin",
  generation: "PM / MM / BB, puffy Monogram lambskin (debuted October 2020)",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("The cushioning check applies to Monogram-embossed lambskin; denim and Damier Azur Coussins are flat by design."),
  sources: [LG("louis-vuitton/real-vs-fake-louis-vuitton-coussin", "Louis Vuitton Coussin real vs fake")],
  presenceQuestions: [LV_DATE_CODE_QUESTION, PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "lambskin versions: fakes show a flat panel with outlined motifs; genuine shows leather domed between the Monogram motifs, catching side light",
      "fakes show hard, carved motif outlines; genuine motifs slope softly into the leather with short creases at petal tips",
    ]),
    label("Heat stamp", "Open the bag and photograph the LOUIS VUITTON heat stamp inside, straight on.", [
      "misspelling of LOUIS VUITTON, PARIS or MADE IN (objective)",
      "fakes show an upright oval O and a narrow N; genuine shows a round O and an N about as wide",
    ]),
    lvDateCode([
      "the Coussin debuted in October 2020 and moved to a chip in March 2021: a code dated before October 2020 or after 2021 (objective)",
    ]),
    hardware("Photograph the chain or strap hardware close up.", [
      "misspelled or blurred LOUIS VUITTON engraving (objective if misspelled)",
    ], false),
    packagingStep(),
  ],
});

export const lvMultiPochette = defineProfile({
  ...bag,
  id: "lv-multi-pochette",
  brand: "Louis Vuitton",
  model: "Multi Pochette Accessoires",
  generation: "Monogram pochette set with coin pouch",
  category: "Crossbody bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("The guide relies partly on colour, which other guides say isn't a reliable tell, so colour signs are soft only."),
  sources: [LG("louis-vuitton/louis-vuitton-multi-pochette-accessories-real-vs-fake-guide", "Louis Vuitton Multi Pochette real vs fake")],
  presenceQuestions: [LV_DATE_CODE_QUESTION, {
    id: "coin_pouch",
    question: "Do you have the small round coin pouch?",
    help: "The set includes a small round zipped coin pouch.",
    expected: false,
    absentNote: "That's fine. Answering No skips the coin pouch photo.",
  }, PACKAGING_QUESTION],
  steps: [
    full("pochettes", [
      "fakes show straight-sided rectangles; genuine pochettes are wider at the bottom, narrower at the top, with curved bottom edges",
      "fakes show a yellowish or orange print; genuine print is beige and blends with the canvas (allow for lighting)",
    ]),
    step("lv_tag", "Leather LV tag", "tag photo",
      "Photograph the leather LV tag on the strap straight on.",
      "Move closer to the leather tag.",
      ["fakes show a small tag with large letters and bright yellow stitching; genuine shows a larger tag with letters in the background colour and muted stitching"],
      { readsText: true, framingTips: STAMP_TIPS }),
    lvDateCode(),
    step("coin_pouch", "Coin pouch", "coin pouch photo",
      "Photograph the round coin pouch from the front and side.",
      "Show the whole coin pouch clearly.",
      ["fakes show sharp corners on the pouch; genuine shows smoothly rounded corners", "fakes show thin pouch sides; genuine shows thicker sides with more room inside"],
      { presenceQuestionId: "coin_pouch", framingTips: FULL_TIPS }),
    hardware("Photograph a strap buckle or clasp close up.", ["fakes show thick, heavy lettering on the hardware; genuine shows fine lettering"], false),
    packagingStep(),
  ],
});

/* ------------------------------------------------------------------ */
/* Chanel and Hermès                                                  */
/* ------------------------------------------------------------------ */

const CHANEL_SERIAL_Q = {
  id: "serial",
  question: "Is there a serial sticker or a small metal serial plate inside?",
  help: "Older pieces have a sticker inside; pieces from 2021 have a small engraved metal plate.",
  expected: true,
  absentNote: "Most Chanel bags have one. If you answer No, the listing will go to manual review.",
};
const chanelSerial = step("serial", "Serial sticker or plate", "serial photo",
  "Find the serial sticker or metal plate inside and photograph it straight on so every character is readable.",
  "Move closer so every character of the serial is readable.",
  [
    "sticker serials are all digits, 6 to 8 long; a sticker code with letters, or fewer than 6 or more than 8 digits (objective)",
    "metal plates (from 2021) carry a mix of letters and digits",
  ],
  { presenceQuestionId: "serial", readsText: true, framingTips: STAMP_TIPS });

export const chanel19 = defineProfile({
  ...bag,
  id: "chanel-19",
  brand: "Chanel",
  model: "Chanel 19",
  generation: "Small / Large / Maxi",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("chanel/how-to-tell-if-chanel-19-bag-is-real", "How to tell if a Chanel 19 is real")],
  presenceQuestions: [CHANEL_SERIAL_Q, PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "fakes show quilting lines that break where panels meet; genuine quilting lines up across panels",
      "fakes show a flat top edge; genuine shows pointed top corners with a peak in the middle",
    ]),
    hardware("Photograph the CC turn-lock and the logo plate screws straight on.", [
      "fakes show an oversized CC turn-lock; genuine shows a smaller, rounder, symmetrical CC",
      "fakes show noticeably large screws on the logo plate; genuine shows tiny screws",
    ]),
    label("Interior label", "Open the flap and photograph the CHANEL label and any engraving inside.", [
      "CHANEL or MADE IN misspelled (objective)",
      "fakes show thick, heavy label letters; genuine shows thinner, engraved-looking letters",
      "fakes show interior engraving tilted to one side; genuine shows small engraving centered below the hole",
    ]),
    chanelSerial,
    step("chain", "Chain and handle join", "chain photo",
      "Photograph where the chain meets the bag.",
      "Show the chain attachment clearly.",
      ["fakes show the chain's connection loop exposed at the attachment; genuine hides that connection"],
      { required: false, framingTips: HW_TIPS }),
    packagingStep(),
  ],
});

export const chanelDeauville = defineProfile({
  ...bag,
  id: "chanel-deauville",
  brand: "Chanel",
  model: "Deauville tote (pearl strap)",
  generation: "Canvas Deauville",
  category: "Tote",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("chanel/real-vs-fake-chanel-deauville-pearl-tote-bag-legit-check", "Chanel Deauville pearl tote real vs fake")],
  presenceQuestions: [CHANEL_SERIAL_Q, PACKAGING_QUESTION],
  steps: [
    full("tote", [
      "fakes show small, bright white pearls; genuine shows larger ivory pearls",
      "fakes show narrow handles; genuine shows wider handles",
      "fakes show small, narrow, uneven front lettering; genuine shows larger, even lettering",
    ]),
    label("Interior label", "Open the tote and photograph the interior label and the zipper.", [
      "CHANEL misspelled (objective)",
      "fakes show a thick label with rounded corners; genuine shows a wider, squarer label",
      "fakes show zipper teeth spaced far apart; genuine shows closely spaced teeth",
    ]),
    chanelSerial,
    step("handle_join", "Handle attachment", "handle photo",
      "Photograph where a handle attaches to the tote.",
      "Show the handle attachment clearly.",
      ["fakes show an asymmetric, narrow handle attachment; genuine shows a symmetrical attachment"],
      { framingTips: HW_TIPS }),
    packagingStep(),
  ],
});

export const hermesConstance = defineProfile({
  ...bag,
  id: "hermes-constance",
  brand: "Hermès",
  model: "Constance",
  generation: "Mini / 18 / 24",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("The date stamp is a letter (in a circle, a square or no frame) on the back of the strap before 2015 and inside the right wall after."),
  sources: [LG("hermes/real-vs-fake-hermes-constance-bag-legit-check", "Hermès Constance real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "fakes show seams splitting at the bottom corners; genuine corner seams are intact",
      "fakes show excess wax visible along the edges; genuine edges are evenly waxed with no excess",
    ]),
    hardware("Photograph the H clasp from the front, then its back and the underside of the bar.", [
      "fakes show rounded corners on the H clasp; genuine shows sharp, defined edges",
      "fakes show no HERMÈS marking under the bar; genuine shows it discreetly at the underside corner",
      "fakes show no thin plate screwed to the back of the clasp; genuine shows a thin plate with flathead screws",
    ]),
    label("Heat stamp", "Open the flap and photograph the HERMÈS PARIS MADE IN FRANCE stamp straight on.", [
      "HERMÈS, PARIS or MADE IN FRANCE misspelled or missing on a fully visible stamp (objective)",
      "fakes show an oversized or unfoiled stamp; genuine shows a foiled stamp in proportion to the bag",
    ]),
    step("blind_stamp", "Date stamp", "date stamp photo",
      "Photograph the small pressed date letter: on the back of the strap (before 2015) or inside the right wall near the top corner stitch (from 2015). Angle a light from the side.",
      "Move closer and angle a light so the letter shows.",
      ["fakes place the date stamp somewhere else; genuine places it on the strap back or inside the right wall", "year letter in a circle = 1971–1996, square = 1997–2014, plain = 2015 onward"],
      { readsText: true, framingTips: STAMP_TIPS }),
    stitching("Photograph a saddle-stitched edge close up.", ["fakes show crooked saddle stitching that wanders off line; genuine stitching runs straight and aligned"]),
    packagingStep(["box should be orange with a ribbon; anything printed inside the box is a warning sign (objective)"]),
  ],
});

/* ------------------------------------------------------------------ */
/* Gucci and Prada                                                    */
/* ------------------------------------------------------------------ */

export const gucciHorsebit = defineProfile({
  ...bag,
  id: "gucci-horsebit-1955",
  brand: "Gucci",
  model: "Horsebit 1955",
  generation: "GG Supreme shoulder bag",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("Gucci serial tags identify the style, not the bag, so a correct serial proves nothing."),
  sources: [LG("gucci/gucci-horsebit-bag-fake-vs-real-guide", "Gucci Horsebit bag fake vs real")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "fakes show a small flap that sits lopsided; genuine shows a larger, even flap",
      "fakes show a narrow base with the top wider than the bottom; genuine shows a rectangular body with a wider base",
    ]),
    hardware("Photograph the Horsebit hardware and the leather around it straight on.", [
      "fakes show a square leather patch around the Horsebit; genuine shows a rectangular, not square, patch",
      "fakes show Double G letters spaced apart; genuine shows larger Gs set close together",
    ]),
    label("Interior label", "Open the bag and photograph the GUCCI label inside, straight on.", [
      "GUCCI or MADE IN ITALY misspelled (objective)",
      "fakes show a small, squarish label; genuine shows a larger, rectangular label",
    ]),
    step("serial_tag", "Serial tag", "serial tag photo",
      "Photograph the serial tag inside so every character is readable.",
      "Move closer so every character is readable.",
      ["fakes show the square Data Matrix code on the black tag partly hidden by a seam; genuine shows the whole square clearly"],
      { required: false, readsText: true, framingTips: STAMP_TIPS }),
    packagingStep(),
  ],
});

const PRADA_LOGO_SIGNS = [
  "PRADA or MILANO misspelled (objective)",
  "fakes show an R whose bowl and leg join into a closed loop; genuine shows an open R with a gap between bowl and leg",
  "fakes show a narrow N that almost reads as H; genuine shows a wide diagonal N",
];

export const pradaCleo = defineProfile({
  ...bag,
  id: "prada-cleo",
  brand: "Prada",
  model: "Cleo",
  generation: "Brushed leather Cleo",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("prada/real-vs-fake-prada-cleo-bag-legit-check", "Prada Cleo real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "fakes show oversized, blocky bottom corners; genuine corners curve smoothly into the edges",
      "fakes show short side peaks along the top; genuine shows full, rounded side peaks",
    ]),
    step("logo_plate", "Logo and buckle", "logo photo",
      "Photograph the PRADA logo and the strap buckle straight on.",
      "Fill the frame with the logo and buckle.",
      [...PRADA_LOGO_SIGNS, "fakes show a rounder, narrower handle attachment; genuine shows a flatter, wider one"],
      { readsText: true, framingTips: HW_TIPS }),
    step("closure", "Magnetic closure", "closure photo",
      "Photograph the magnetic closure from the side.",
      "Show the closure from the side.",
      ["fakes show a thick closure sitting on top of the leather; genuine shows a thin closure set into the leather"],
      { required: false, framingTips: HW_TIPS }),
    label("Interior metal label", "Open the bag and photograph the metal PRADA label inside.", [
      "PRADA or MILANO misspelled (objective)",
      "fakes show a thick label with rounded corners; genuine shows a thinner label with sharp corners",
    ]),
    stitching("Photograph the handle stitching close up.", ["fakes show handle stitching that strays from the double row; genuine shows a clean double row"]),
    packagingStep(),
  ],
});

export const pradaCahier = defineProfile({
  ...bag,
  id: "prada-cahier",
  brand: "Prada",
  model: "Cahier",
  generation: "Leather Cahier with metal lettering",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("Prada issues no per-unit serial; the digits on the white cloth tag are a shared factory code. Shape, colour and metal tone are copied well and are not used."),
  sources: [LG("prada/real-vs-fake-prada-cahier", "Prada Cahier real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    step("front_letters", "Front PRADA letters", "letter photo",
      "Photograph the metal PRADA letters on the front strap straight on.",
      "Fill the frame with the metal letters.",
      [...PRADA_LOGO_SIGNS, "fakes show an A with a hairline left stroke and pointed serifs; genuine shows a solid left stroke with flat, blunt feet"],
      { readsText: true, framingTips: HW_TIPS }),
    label("Interior plaque", "Open the bag and photograph the interior plaque straight on.", [
      "PRADA or MILANO misspelled (objective)",
      "fakes show heavy, flared wedge serifs on the P and R; genuine shows slim, flat serifs",
      "fakes show an R leg that thickens toward its foot; genuine shows a straight, even R leg",
    ]),
    step("factory_tag", "White cloth tag", "cloth tag photo",
      "Photograph the small white numbered cloth tag inside.",
      "Move closer so the number is readable.",
      ["fakes show curly digits whose strokes swell and thin; genuine shows plain rounded digits of one stroke width", "fakes show digits almost touching; genuine shows a clear gap between digits", "fakes can show a smooth printed-paper tag; genuine shows a woven fabric tag"],
      { required: false, readsText: true, framingTips: STAMP_TIPS }),
    hardware("Photograph the back of a zipper slider.", ["genuine sliders carry the zipper maker's name, not Prada's; a misspelled maker name (objective)"], false),
    packagingStep(["dust bag reading DAL1913 as one word; genuine reads DAL 1913 with a space", "an extra gap between L and A in MILANO on the dust bag"]),
  ],
});

/* ------------------------------------------------------------------ */
/* Celine, Saint Laurent, Fendi                                       */
/* ------------------------------------------------------------------ */

const CELINE_DATE_CODE = step("date_code", "Date code", "date code photo",
  "Find the date code embossed on the small leather label inside and photograph it straight on.",
  "Move closer so every character of the date code is readable.",
  [
    "Celine date codes read like F-SL-2241: one letter, two letters, then four digits",
    "fakes show thick, bold code characters; genuine shows narrow, thin characters",
    "a code dated September 2018 or later on a bag with the old accented CÉLINE logo (objective, when both are readable)",
  ],
  { required: false, readsText: true, framingTips: STAMP_TIPS });

export const celineAva = defineProfile({
  ...bag,
  id: "celine-ava",
  brand: "Celine",
  model: "Ava",
  generation: "Triomphe canvas and leather Ava",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("celine/real-vs-fake-celine-ava-bag-legit-check", "Celine Ava real vs fake"), LG("celine/how-to-tell-if-a-celine-bag-is-real", "How to tell if a Celine bag is real")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "fakes show a thick, wide handle; genuine shows a slim, narrow handle",
      "fakes show wide leather tabs covering little of the handle; genuine tabs are narrower and cover more of it",
    ]),
    step("logo", "CELINE logo", "logo photo",
      "Photograph the CELINE logo straight on.",
      "Fill the frame with the logo.",
      ["CELINE misspelled (objective)", "fakes show a squared-off N; genuine shows an N whose ends are cut diagonally"],
      { readsText: true, framingTips: HW_TIPS }),
    hardware("Photograph the strap clip and the zipper.", [
      "fakes show strap clips built from several parts; genuine clips are one seamless piece of metal",
      "fakes show uneven zipper teeth; genuine teeth are even",
    ]),
    CELINE_DATE_CODE,
    stitching("Photograph a seam close up.", ["fakes show uneven, loose stitching; genuine stitching is even and tight"]),
    packagingStep(),
  ],
});

export const celineBeltBag = defineProfile({
  ...bag,
  id: "celine-belt-bag",
  brand: "Celine",
  model: "Belt Bag",
  generation: "Nano / Micro / Mini",
  category: "Top-handle bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("celine/real-vs-fake-celine-belt-bag-legit-check", "Celine Belt Bag real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "fakes show a small flap with rounded corners; genuine shows a larger flap with sharp corners",
      "fakes show uneven cut-out edges along the sides; genuine cut-outs are straight and even",
    ]),
    hardware("Photograph the buckle and its lettering straight on.", [
      "CELINE misspelled (objective)",
      "fakes show a narrow, squarish, thick buckle; genuine shows a rectangular buckle",
      "fakes show bold, tightly spaced letters; genuine shows thin letters with wider spacing",
    ]),
    step("zipper", "Zipper and puller", "zipper photo",
      "Photograph the pocket zipper and its puller.",
      "Show the zipper and puller clearly.",
      ["fakes show crooked zipper teeth; genuine teeth are straight and equal", "fakes show a small puller; genuine shows a larger puller"],
      { framingTips: HW_TIPS }),
    CELINE_DATE_CODE,
    stitching("Photograph a seam close up.", ["fakes show loose, asymmetric stitching or thread that clashes with the leather; genuine thread matches and stitches are tight"]),
    packagingStep(),
  ],
});

export const yslEnvelope = defineProfile({
  ...bag,
  id: "ysl-envelope",
  brand: "Saint Laurent",
  model: "Envelope",
  generation: "Grain de poudre Envelope",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("saint-laurent/real-vs-fake-saint-laurent-envelope-bag-legit-check", "Saint Laurent Envelope real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", ["fakes show very small grains spaced widely apart; genuine shows larger, rounder grains packed tightly"]),
    step("chain", "Chain", "chain photo",
      "Photograph a section of the chain and its connector.",
      "Show the chain and connector clearly.",
      ["fakes show thinner, smaller connector lettering; genuine shows a curb chain with flat-faced links and a lettered metal connector"],
      { readsText: true, framingTips: HW_TIPS }),
    step("snap", "Snap under the flap", "snap photo",
      "Lift the flap and photograph the snap underneath straight on.",
      "Move closer to the snap lettering.",
      ["SAINT LAURENT misspelled (objective)", "genuine debosses SAINT LAURENT in sans-serif capitals with the N and T touching; fakes show the letters separate or in one generic typeface"],
      { readsText: true, framingTips: STAMP_TIPS }),
    label("Interior label", "Open the bag and photograph the SAINT LAURENT PARIS label straight on.", [
      "SAINT LAURENT or PARIS misspelled (objective)",
      "fakes show a smooth, plastic-looking label with pale, thin letters; genuine shows a grained label with bold letters",
    ]),
    packagingStep(),
  ],
});

export const yslNiki = defineProfile({
  ...bag,
  id: "ysl-niki",
  brand: "Saint Laurent",
  model: "Niki",
  generation: "Niki medium / baby",
  category: "Shoulder bag",
  referenceNote: DESIGNER_REFERENCE_NOTE("Hardware finish and colour vary by season and supplier on genuine bags, so shape-based signs carry more weight than finish."),
  sources: [LG("saint-laurent/real-vs-fake-ysl-niki-medium-bag-legit-check", "YSL Niki medium real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", ["fakes show uneven, unfinished corners on the logo plate; genuine shows square, crisp corners"]),
    step("chain", "Chain and ring", "chain photo",
      "Photograph the chain and the ring where it meets the bag.",
      "Show the chain and ring clearly.",
      ["fakes show a flat chain; genuine shows thick, rounded links", "fakes show a flat ring with straight lettering; genuine shows a rounded ring with lettering that follows the curve"],
      { readsText: true, framingTips: HW_TIPS }),
    step("closure", "Magnetic closure", "closure photo",
      "Lift the flap and photograph the magnetic closure lettering.",
      "Move closer to the closure lettering.",
      ["fakes show shallow, small lettering; genuine shows deep, wide engraved letters"],
      { readsText: true, required: false, framingTips: HW_TIPS }),
    label("Interior tag", "Open the bag and photograph the MADE IN ITALY tag straight on.", [
      "MADE IN ITALY misspelled (objective)",
      "fakes show a wide tag with rounded corners and large text; genuine shows a pointed-corner tag with small, smooth text",
    ]),
    step("zipper", "Zipper puller", "puller photo", "Photograph the zipper puller.", "Show the puller clearly.",
      ["fakes show a short, wide, bulky puller; genuine shows a narrow, long puller"], { required: false, framingTips: HW_TIPS }),
    packagingStep(),
  ],
});

export const fendiFirst = defineProfile({
  ...bag,
  id: "fendi-first",
  brand: "Fendi",
  model: "Fendigraphy / First",
  generation: "Fendi First small / midi",
  category: "Clutch",
  referenceNote: DESIGNER_REFERENCE_NOTE("The small black 'RFID label removable' tag is copied by fakes, so it proves nothing."),
  sources: [LG("fendi/real-vs-fake-fendi-first-bag-legit-check", "Fendi First real vs fake")],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    full("bag", [
      "fakes show a shallow, small leather fold around the closure; genuine shows a deep, rounded fold",
      "fakes show jagged, uneven edges; genuine shows smooth edges and even lines",
    ]),
    hardware("Photograph the F clasp and its screws close up.", [
      "FENDI misspelled (objective)",
      "fakes show shallow, thin FENDI lettering; genuine shows deeper, thicker lettering",
    ]),
    step("lining", "FF lining", "lining photo",
      "Open the bag and photograph the FF jacquard lining.",
      "Show the lining pattern clearly.",
      ["fakes show a loose weave where the FF pattern looks broken up; genuine shows a tight weave with small, symmetrical FF symbols"],
      { framingTips: ["Lining fills the frame", "Good light inside"] }),
    label("Interior label", "Photograph the FENDI MADE IN ITALY label inside.", [
      "FENDI or MADE IN ITALY misspelled (objective)",
      "fakes show overly thick text and thick, uneven label stitching; genuine shows thinner text and tight, symmetrical stitching",
    ]),
    stitching("Photograph the handle stitching close up.", ["fakes show thread that differs in colour from the leather, or a peeling top layer; genuine thread matches and the leather is intact"]),
    packagingStep(),
  ],
});

/* ------------------------------------------------------------------ */
/* Sneakers                                                           */
/* ------------------------------------------------------------------ */

const sneaker = { ...model, categoryId: "sneakers", category: "Sneakers" };

const NIKE_TAG_SIGNS = [
  "the 13-character code beside the tag QR never uses the letters I, L, O or U; a code containing one (objective)",
  "recent tags print www.nike.com/patentsvirtualmarking; a misspelling (objective)",
  "Nike makes this shoe in Vietnam, Indonesia and China, so the country alone proves nothing",
];
const NIKE_BOX_SIGNS = [
  "the box UPC matches the tag UPC once leading zeros and the small two-digit add-on are ignored; a different number (objective, when both are readable)",
  "the box QR code differs from the tag QR code on genuine pairs",
];

export const jordan1High = defineProfile({
  ...sneaker,
  id: "jordan-1-high",
  brand: "Nike Jordan",
  model: "Air Jordan 1 High OG",
  generation: "High OG (style 555088-xxx and newer)",
  referenceNote: DESIGNER_REFERENCE_NOTE("Swoosh placement and tongue tag details vary by release; compare only against the same release."),
  sources: [LG("jordan/a-general-jordan-legit-check-guide-real-vs-fake-jordan", "General Jordan legit check guide"), LG("jordan", "Jordan guides (style codes)")],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE([
      "fakes show a boxy toe and a sole that lifts off the ground along its length; genuine shows a gentle toe curve with the sole flat except at the toe",
      "fakes show a short, wide toe box with a thick toe cap; genuine shows a longer toe box with a narrower cap",
    ]),
    step("heel", "Heel", "heel photo",
      "Photograph the back of the shoe straight on.",
      "Show the whole heel straight on.",
      ["fakes show a bulky heel bulging just above the sole; genuine shows a gentle hourglass shape from behind", "fakes show uneven, off-center double stitching on the heel tab; genuine stitches sit directly above each other"],
      { framingTips: ["Whole heel in frame", "Straight on"] }),
    step("outsole", "Outsole", "outsole photo",
      "Turn the shoe over and photograph the sole from above.",
      "Show the whole sole from above.",
      ["fakes show an off-font NIKE, a blunt Swoosh tip and uneven stars; genuine shows a pointed Swoosh and evenly spaced stars"],
      { readsText: true, framingTips: ["Whole sole in frame"] }),
    SIZE_TAG([...NIKE_TAG_SIGNS, "High OG style codes usually start 555088 (kids 575441), then a three-digit colourway code"]),
    { ...BOX_LABEL, comparisonFocus: [...(BOX_LABEL.comparisonFocus ?? []), ...NIKE_BOX_SIGNS] },
  ],
});

export const nikeDunkLow = defineProfile({
  ...sneaker,
  id: "nike-dunk-low",
  brand: "Nike",
  model: "Dunk Low",
  generation: "Dunk Low, Dunk Low SP and SB",
  referenceNote: DESIGNER_REFERENCE_NOTE("Insoles help less than people think, and QR size changes with tag generation; compare only against the same release."),
  sources: [LG("nike/how-to-authenticate-nike-dunk", "Fake vs real Nike Dunks")],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE(["fakes show a bulky shape with a flat bottom edge and a tall, smooth midsole; genuine shows a curved midsole edge with a slightly raised toe tip"]),
    step("toe", "Toe box", "toe photo",
      "Photograph the toe box from above so the perforations are sharp.",
      "Show the toe box from above.",
      ["fakes show small holes that barely go through, in uneven rows; genuine shows larger, cleanly punched holes in even rows"],
      { framingTips: ["Shoot from above"] }),
    step("heel", "Heel embroidery", "heel photo",
      "Photograph the heel tab straight on so the NIKE embroidery is sharp.",
      "Show the heel tab straight on.",
      ["fakes show a bulky heel tab with tightly packed thin stitches and malformed NIKE letters; genuine shows evenly spaced stitches and even letters"],
      { readsText: true, framingTips: ["Heel tab fills the frame"] }),
    SIZE_TAG(NIKE_TAG_SIGNS),
    { ...BOX_LABEL, comparisonFocus: [...(BOX_LABEL.comparisonFocus ?? []), ...NIKE_BOX_SIGNS, "fakes can print the right model and style code but another shoe's barcode"] },
  ],
});

export const yeezy350 = defineProfile({
  ...sneaker,
  id: "yeezy-350-v2",
  brand: "Adidas Yeezy",
  model: "Yeezy Boost 350 V2",
  generation: "All 350 V2 colourways",
  referenceNote: DESIGNER_REFERENCE_NOTE("Size tags vary between genuine releases, so the tag is a weak check on its own."),
  sources: [LG("yeezy/how-to-spot-fake-adidas-yeezy-boost-350-v2-yeezy-350-v2-fake-vs-real", "Yeezy Boost 350 V2 fake vs real"), LG("yeezy/how-to-spot-fake-yeezy", "How to spot fake Yeezy")],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE(["fakes show a distorted knit stripe and a weak heel curve; genuine shows a clean stripe and a distinct curve up to the heel tab"]),
    step("outsole", "Boost window and outsole", "outsole photo",
      "Turn the shoe over and photograph the sole, including the Boost window and logo.",
      "Show the whole sole and Boost window.",
      ["fakes show small, flat Boost pellets; genuine shows large, bumpy, glossy pellets", "fakes show a thin Boost logo with blunt characters; genuine shows a thick logo with sharp tips"],
      { readsText: true, framingTips: ["Whole sole in frame"] }),
    step("insole", "Insole", "insole photo",
      "Pull out the insole if it comes out and photograph the print.",
      "Show the insole print clearly.",
      ["fakes show a blurred or missing trefoil; genuine shows a crisp trefoil", "fakes show grainy texture and thick outlines at the heel; genuine shows a smooth texture and thin, sharp outlines"],
      { readsText: true, framingTips: ["Shoot from above"] }),
    step("laces", "Laces", "lace photo",
      "Photograph both laces side by side, including the tips.",
      "Show both laces and tips.",
      ["fakes show laces of different length or shade, or tips without an adidas logo; genuine laces match and both tips carry the logo"],
      { required: false, framingTips: ["Both laces in frame"] }),
    SIZE_TAG([]),
    BOX_LABEL,
  ],
});

export const balenciagaSpeed = defineProfile({
  ...sneaker,
  id: "balenciaga-speed",
  brand: "Balenciaga",
  model: "Speed Trainer",
  generation: "Speed and Speed 2.0 sock sneakers",
  referenceNote: DESIGNER_REFERENCE_NOTE("Balenciaga makes sneakers in Italy and China, so country alone is not a warning sign."),
  sources: [LG("balenciaga/how-to-spot-fake-balenciaga-speed-trainers", "How to spot fake Balenciaga Speed Trainers")],
  presenceQuestions: [BOX_LABEL_QUESTION],
  steps: [
    SIDE(["fakes show visible glue where the sock meets the sole; genuine shows a clean join", "fakes place the sock logo too close to or too far from the midsole with blurred letters; genuine places it cleanly with sharp lines"]),
    step("heel", "Heel logo", "heel photo",
      "Photograph the lower heel logo straight on.",
      "Show the heel logo clearly.",
      ["BALENCIAGA misspelled (objective)", "fakes show thin, uneven letters with a larger, lower first A; genuine shows even, deeply stamped letters"],
      { readsText: true, framingTips: ["Heel logo fills the frame"] }),
    step("outsole", "Outsole logo", "outsole photo",
      "Turn the shoe over and photograph the logo on the sole.",
      "Show the sole logo clearly.",
      ["fakes show thick, tightly spaced or mangled letters; genuine shows thin, sharp letters with normal spacing"],
      { readsText: true, framingTips: ["Sole logo in frame"] }),
    step("sticker", "Size sticker", "sticker photo",
      "Photograph the size sticker or label inside the shoe.",
      "Move closer so the sticker text is readable.",
      ["fakes show a large sticker without a glossy laminated finish; genuine shows a smaller laminated sticker with the European size"],
      { readsText: true, required: false, framingTips: STAMP_TIPS }),
    BOX_LABEL,
  ],
});

/* ------------------------------------------------------------------ */
/* Streetwear and hats                                                */
/* ------------------------------------------------------------------ */

const garment = { ...model, categoryId: "streetwear" };
const fullGarment = (focus: string[]): StepDef =>
  step("full_garment", "Full garment", "full garment photo",
    "Lay the garment flat and photograph the whole front.", "Fit the whole garment in the frame.", focus, { framingTips: FULL_TIPS });
const neckTag = (focus: string[]): StepDef =>
  step("neck_tag", "Neck tag", "neck tag photo",
    "Photograph the brand tag inside the neck straight on.", "Move closer so every letter on the neck tag is sharp.",
    focus, { readsText: true, framingTips: ["Whole tag in frame", "Flat and straight on"] });
const washTag = (focus: string[]): StepDef =>
  step("wash_tag", "Wash and care tags", "care tag photo",
    "Photograph the wash and care tags straight on so every line is readable.", "Lay the tags flat and move closer until every line is readable.",
    ["misspelled words (objective)", ...focus], { presenceQuestionId: "wash_tag", readsText: true, framingTips: STAMP_TIPS });

export const balenciagaHoodie = defineProfile({
  ...garment,
  id: "balenciaga-hoodie",
  brand: "Balenciaga",
  model: "Logo hoodie (Est. 1917)",
  generation: "Embroidered logo hoodies",
  category: "Hoodie",
  referenceNote: DESIGNER_REFERENCE_NOTE("The model number at the bottom of the wash tag can be searched online, but fakes copy it."),
  sources: [LG("balenciaga/how-to-spot-fake-balenciaga-hoodie-est-1917-balenciaga-hoodie-real-vs-fake", "Balenciaga hoodie real vs fake")],
  presenceQuestions: [WASH_TAG_QUESTION],
  steps: [
    fullGarment([]),
    step("chest_logo", "Chest logo", "logo photo",
      "Photograph the embroidered chest logo straight on.",
      "Fill the frame with the logo.",
      ["BALENCIAGA misspelled (objective)", "fakes show messy stitching with letters touching; genuine shows clean, separate letters", "fakes show rounded letter corners, e.g. on the B; genuine shows square corners"],
      { readsText: true, framingTips: ["Logo fills the frame"] }),
    neckTag(["fakes show loose threads at the tag's top corners; genuine shows two tight corner tacks", "fakes show off-center lettering; genuine lettering is straight and centered"]),
    washTag(["fakes show a narrow, long wash label; genuine shows a relatively wide label"]),
  ],
});

export const bapeSharkHoodie = defineProfile({
  ...garment,
  id: "bape-shark-hoodie",
  brand: "A Bathing Ape (BAPE)",
  model: "Shark full-zip hoodie",
  generation: "Shark hoodies",
  category: "Hoodie",
  referenceNote: DESIGNER_REFERENCE_NOTE("Genuine and fake labels both read Made in Japan, so origin proves nothing."),
  sources: [LG("bape/how-to-spot-a-fake-bape-shark-hoodie-bape-hoodie-real-vs-fake", "BAPE Shark hoodie real vs fake")],
  presenceQuestions: [WASH_TAG_QUESTION],
  steps: [
    fullGarment([]),
    neckTag([
      "fakes show uneven corner stitching; genuine shows even corner stitching in white thread",
      "fakes show an Ape face with an open, visible weave; genuine shows dense embroidery",
      "fakes show misshapen letters and widely spaced numerals in 1993; genuine shows thin, evenly spaced characters",
    ]),
    washTag(["fakes show large, loose loops along the top edge; genuine shows small, tight loops", "fakes show thick, bold black text; genuine shows a finer text weight"]),
    step("gold_tag", "Gold tag and sleeve tag", "tag photo",
      "Photograph the small gold tag and the sleeve tag.",
      "Move closer to the tags.",
      ["fakes show a glittery, coarse gold tag, often stitched at the side; genuine shows a matte, flat, fine-grained tag", "fakes show a bold, blotchy ® outline on the sleeve tag; genuine shows a thin, clean ® circle"],
      { required: false, framingTips: STAMP_TIPS }),
    step("zipper", "Zipper", "zipper photo",
      "Photograph the zipper pull and teeth close up.",
      "Move closer to the zipper.",
      ["fakes show a narrow zipper with plastic parts and soft, uneven 'bape' lettering; genuine shows a wide zipper with metal details and crisp lettering"],
      { readsText: true, framingTips: ["Zipper pull fills the frame"] }),
  ],
});

export const palmAngelsTee = defineProfile({
  ...garment,
  id: "palm-angels-tee",
  brand: "Palm Angels",
  model: "Logo tee or hoodie (Kill The Bear)",
  generation: "Kill The Bear and logo pieces",
  category: "Tee / hoodie",
  referenceNote: DESIGNER_REFERENCE_NOTE("Built from the Kill The Bear tee guide; it says the same checks apply to the hoodies."),
  sources: [LG("palm-angels/palm-angels-kill-the-bear-t-shirt-real-vs-fake-guide", "Palm Angels Kill The Bear real vs fake")],
  presenceQuestions: [WASH_TAG_QUESTION],
  steps: [
    fullGarment(["fakes show a rough, blurry bear print with fat lettering; genuine shows a sharp bear and slim, clean lettering"]),
    step("back_logo", "Back logo", "back logo photo",
      "Photograph the back logo straight on.",
      "Fill the frame with the back logo.",
      ["PALM ANGELS misspelled (objective)", "fakes show squeezed, stretched letters, some touching; genuine shows evenly spaced, separate letters"],
      { readsText: true, framingTips: ["Logo fills the frame"] }),
    neckTag(["fakes show letters running together with overlong tails; genuine shows every letter clear and standing alone"]),
    washTag(["fakes show text far from the sewn edge with stitching almost covering it; genuine shows text near the edge with space around the stitches"]),
  ],
});

export const lvBeanie = defineProfile({
  ...model,
  id: "lv-beanie",
  categoryId: "hats",
  brand: "Louis Vuitton",
  model: "Beanie",
  generation: "Knit beanies with woven or embroidered logo",
  category: "Beanie",
  referenceNote: DESIGNER_REFERENCE_NOTE("Most genuine beanies are made in Italy or France; other origins go to a person rather than failing."),
  sources: [LG("louis-vuitton/real-vs-fake-louis-vuitton-beanie-the-ultimate-guide", "Louis Vuitton beanie real vs fake")],
  presenceQuestions: [],
  steps: [
    step("front_logo", "Front logo", "logo photo",
      "Photograph the front logo straight on.",
      "Fill the frame with the logo.",
      ["LOUIS VUITTON misspelled (objective)", "fakes show blurry, uneven stitching, an off-center L or a lopsided O; genuine shows a crisp, even logo", "fakes show a logo that sits on top like a sticker; genuine logo is knitted or woven into the beanie"],
      { readsText: true, framingTips: ["Logo fills the frame"] }),
    step("inside_tag", "Inside tags", "tag photo",
      "Turn the beanie inside out and photograph the brand tag and care tag.",
      "Move closer so both tags are readable.",
      ["fakes show an oversized tag with blurry text; genuine shows sharp foil lettering on a precise tag", "fakes show no code, or random characters, on the care tag; genuine shows a discreet code", "MADE IN line other than Italy or France"],
      { readsText: true, framingTips: STAMP_TIPS }),
    step("knit", "Knit close-up", "knit photo",
      "Move close to the knit until individual stitches are sharp.",
      "Move closer to the knit.",
      ["fakes show a thin, uneven knit; genuine shows a thick, even knit"],
      { required: false, framingTips: STITCH_TIPS }),
  ],
});

export const BATCH3_BAGS = [
  lvOnTheGo, lvCapucines, lvCoussin, lvMultiPochette,
  chanel19, chanelDeauville, hermesConstance,
  gucciHorsebit, pradaCleo, pradaCahier,
  celineAva, celineBeltBag, yslEnvelope, yslNiki, fendiFirst,
];
export const BATCH3_SNEAKERS = [jordan1High, nikeDunkLow, yeezy350, balenciagaSpeed];
export const BATCH3_APPAREL = [balenciagaHoodie, bapeSharkHoodie, palmAngelsTee, lvBeanie];

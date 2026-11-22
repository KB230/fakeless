import type { SourceLink } from "@workspace/api-zod";
import { defineProfile, SIZE_TAG_QUESTION, WASH_TAG_QUESTION } from "../define";
import { BOX_LABEL, SIDE, SIZE_TAG } from "./sneakers";
import { BOX_LABEL_QUESTION, DESIGNER_REFERENCE_NOTE, FULL_TIPS, STAMP_TIPS, step, STITCH_TIPS } from "./shared";

/**
 * Second batch of designer sneakers (5), streetwear (4) and a cap (1),
 * built from LegitGrails guides read in November 2026. Conventions as in
 * ./shared.ts.
 */

const LG = (path: string, label: string): SourceLink => ({ label: `LegitGrails: ${label}`, url: `https://legitgrails.com/blogs/${path}` });

const model = { kind: "model" as const, liveEnabled: true, referenceStatus: "documented" as const, colorway: null };
const sneaker = { ...model, categoryId: "sneakers", category: "Sneakers" };
const garment = { ...model, categoryId: "streetwear" };

/* ------------------------------------------------------------------ */
/* Sneakers                                                           */
/* ------------------------------------------------------------------ */

export const mcqueenOversized = defineProfile({
  ...sneaker,
  id: "mcqueen-oversized",
  brand: "Alexander McQueen",
  model: "Oversized Sneaker",
  generation: "Leather oversized sneaker",
  referenceNote: DESIGNER_REFERENCE_NOTE("Every pair of this model carries the same style number, so a correct number proves nothing."),
  sources: [LG("alexander-mcqueen/alexander-mcqueen-sneakers-fake-vs-real", "Alexander McQueen sneakers fake vs real")],
  presenceQuestions: [BOX_LABEL_QUESTION],
  steps: [
    SIDE([
      "midsole stitching that continues past the point where the sole texture changes from smooth to grainy; authentic stitching stops exactly there",
      "a straight heel line without the authentic heel bump",
      "a bulky rubber sole",
    ]),
    step("heel", "Heel tab", "heel photo",
      "Photograph the back of the shoe straight on so the heel tab and its logo are in frame.",
      "Show the heel tab and logo, straight on.",
      ["a rounded top edge on the heel tab; authentic tabs have a straight top line", "faded, oversized or loosely spaced heel logo letters"],
      { readsText: true, framingTips: ["Whole heel tab in frame", "Straight on"] }),
    step("tongue", "Tongue", "tongue photo",
      "Photograph the outside of the tongue, then the printed text inside it.",
      "Show the tongue logo and the inner tongue print clearly.",
      [
        "inner tongue print shows a six-digit style number and the size (e.g. 553770, 38½); a missing print (objective)",
        "inner print set close to the tongue edge, lighter, or in a different font",
        "outer tongue logo oversized or off-center",
      ], { readsText: true, compareCodes: false, framingTips: STAMP_TIPS }),
    step("outsole", "Outsole", "outsole photo",
      "Turn the shoe over and photograph the sole from directly above.",
      "Show the whole outsole from above.",
      ["an oversized logo on the outsole"], { readsText: true, required: false, framingTips: ["Whole sole in frame"] }),
    BOX_LABEL,
  ],
});

export const balenciagaTrack = defineProfile({
  ...sneaker,
  id: "balenciaga-track",
  brand: "Balenciaga",
  model: "Track",
  generation: "Track and Track.2",
  referenceNote: DESIGNER_REFERENCE_NOTE("Track is made mainly in Italy and China, so country of manufacture is not a warning sign on its own."),
  sources: [LG("balenciaga/how-to-spot-fake-balenciaga-track-sneakers", "Balenciaga Track real vs fake")],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE(["wide, stretched-looking silhouette", "messy stitching with visible needle holes"]),
    step("toe", "Toe and size number", "toe photo",
      "Photograph the toe from above so the size number and BB logo are sharp.",
      "Move closer to the toe.",
      ["bulky, faded front size number; authentic is sharp and slender", "small, uneven or deeply cut BB logo"],
      { readsText: true, framingTips: ["Toe fills the frame", "Shoot from above"] }),
    step("heel", "Heel labels", "heel photo",
      "Photograph the back of the shoe so the heel label and the Track tag are in frame.",
      "Show the heel label and Track tag clearly.",
      ["dull, off-center or cramped heel lettering", "Track tag with oversized letters or an odd shape"],
      { readsText: true, framingTips: ["Whole heel in frame"] }),
    step("laces", "Laces", "lace photo", "Photograph the laces close up.", "Move closer to the laces.",
      ["laces leaning yellow instead of vibrant orange, or with large irregular dots"], { required: false }),
    SIZE_TAG(["tongue tag with different care symbols or messy stitching", "codes are copied on fakes; a correct number proves nothing"]),
    BOX_LABEL,
  ],
});

export const louboutinSneakers = defineProfile({
  ...sneaker,
  id: "louboutin-sneakers",
  brand: "Christian Louboutin",
  model: "Spike sneakers (Louis, Louis Junior and similar)",
  generation: "Spike sneakers",
  referenceNote: DESIGNER_REFERENCE_NOTE("The box label names style, color and size; boxes get swapped, so a correct label proves nothing."),
  sources: [LG("christian-louboutin/how-to-spot-real-vs-fake-christian-louboutin-sneakers", "Christian Louboutin sneakers real vs fake")],
  presenceQuestions: [BOX_LABEL_QUESTION],
  steps: [
    SIDE(["spikes overly long, bulky or with glue around them", "big, loose or curving stitches"]),
    step("insole", "Insole and size stamp", "insole photo",
      "Photograph the insole from above so the Louboutin logo, size and MADE IN ITALY are readable.",
      "Show the insole stamp clearly.",
      [
        "MADE IN ITALY missing from a fully visible stamp (objective)",
        "half sizes written as .5 instead of ½",
        "CHRISTIAN not in a different font from LOUBOUTIN, or a C that isn't cursive",
        "poorly stamped, hard-to-read logo",
      ], { readsText: true, framingTips: ["Shoot from above", "Stamp in focus"] }),
    step("heel", "Heel and rear", "heel photo",
      "Photograph the back of the shoe so the stitching and perforations are sharp.",
      "Show the heel and rear stitching clearly.",
      ["unevenly spaced perforation holes", "messy rear stitching"], { framingTips: ["Whole heel in frame"] }),
    step("outsole", "Red outsole", "outsole photo",
      "Turn the shoe over and photograph the red sole from above.",
      "Show the whole sole from above.",
      ["an overly shiny sole or uneven Louboutin text on the sole (allow for wear)"], { readsText: true, framingTips: ["Whole sole in frame"] }),
    { ...BOX_LABEL, comparisonFocus: [
      "the box label reference is a seven-digit style plus a four-character color, e.g. 3130694 BK01",
      "box top: white with Christian Louboutin centered and Paris at the bottom right",
      "box misspellings (objective)",
      "a red inside lid with a logo; authentic box interiors are plain white",
      "size on the box that doesn't match the shoes",
    ] },
  ],
});

export const gucciRhyton = defineProfile({
  ...sneaker,
  id: "gucci-rhyton",
  brand: "Gucci",
  model: "Rhyton",
  generation: "Gucci logo and GG Supreme prints",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("gucci/gucci-rhyton-gucci-print-sneakers-legit-check-guide", "Gucci Rhyton legit check guide")],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE(["an upturned, curved toe cap; authentic is straighter and the shoe longer", "a dramatic sole curve"]),
    step("tongue", "Tongue tag", "tongue photo",
      "Photograph the tongue and its tag straight on.",
      "Show the tongue tag clearly.",
      ["small tongue numbers or a different font", "bold embroidered logo letters or crude tag stitching"],
      { readsText: true, framingTips: STAMP_TIPS }),
    step("insole", "Insole", "insole photo",
      "Photograph the insole from directly above.",
      "Show the insole print clearly.",
      ["insole print too light instead of dark grey", "black stitching where authentic insole stitching is white"],
      { readsText: true, framingTips: ["Shoot from above"] }),
    step("outsole", "Outsole", "outsole photo", "Turn the shoe over and photograph the sole from above.", "Show the whole sole from above.",
      ["stars off-center in their boxes", "loosely spaced outsole letters"], { required: false, readsText: true }),
    SIZE_TAG([]),
    { ...BOX_LABEL, comparisonFocus: [
      ...(BOX_LABEL.comparisonFocus ?? []),
      "box label text printed black and washed out instead of brown",
      "a photo of the shoe on the label instead of a small line drawing",
    ] },
  ],
});

export const offWhiteNike = defineProfile({
  ...sneaker,
  id: "off-white-nike",
  brand: "Nike x Off-White",
  model: "Off-White collaboration sneakers",
  generation: "Jordan 1, Dunk, Air Force 1, Air Max and similar",
  referenceNote: DESIGNER_REFERENCE_NOTE("Size tag fields are copied field by field on fakes; a matching tag proves little. The box UPC must match the size tag UPC."),
  sources: [LG("off-white/how-to-spot-real-vs-fake-off-white", "How to spot real vs fake Off-White"), LG("off-white", "Off-White guides (style codes)")],
  presenceQuestions: [SIZE_TAG_QUESTION, BOX_LABEL_QUESTION],
  steps: [
    SIDE(["printed side text set too small, too high or at an angle", "AIR text on the midsole too small, too high or tilted"]),
    step("zip_tie", "Zip tie", "zip tie photo",
      "Photograph the plastic zip tie straight on so its print is readable.",
      "Move closer so the zip tie print is readable.",
      ["uneven or off-center zip tie print (zip tie color varies by release, so color is not a sign)"],
      { required: false, readsText: true, framingTips: STAMP_TIPS }),
    step("inner_text", "Inner side text", "inner side photo",
      "Photograph the printed text on the inner side of the shoe.",
      "Move closer so the inner text is sharp.",
      ["inner-side text too small, too high or at an angle"], { readsText: true, framingTips: STAMP_TIPS }),
    SIZE_TAG(["documented Off-White style codes include AQ0818-148, AQ0818-100, CV9388-100, CT8480-001, DH8565-100, CT0856-100, AO4606-700, CI1173-400 and AJ4585-101"]),
    { ...BOX_LABEL, comparisonFocus: [
      ...(BOX_LABEL.comparisonFocus ?? []),
      "the UPC on the box label must match the UPC on the size tag (objective, when both are readable)",
    ] },
  ],
});

/* ------------------------------------------------------------------ */
/* Streetwear and caps                                                */
/* ------------------------------------------------------------------ */

const neckTag = (focus: string[]) =>
  step("neck_tag", "Neck tag", "neck tag photo",
    "Photograph the brand tag inside the neck straight on.",
    "Move closer so every letter on the neck tag is sharp.",
    focus, { readsText: true, framingTips: ["Whole tag in frame", "Flat and straight on"] });

const washTag = (focus: string[]) =>
  step("wash_tag", "Wash and care tags", "care tag photo",
    "Photograph the wash and care tags (both sides) straight on so every line is readable.",
    "Lay the tags flat and move closer until every line is readable.",
    ["misspelled words (objective)", ...focus],
    { presenceQuestionId: "wash_tag", readsText: true, framingTips: STAMP_TIPS });

const fullGarment = (focus: string[]) =>
  step("full_garment", "Full garment", "full garment photo",
    "Lay the garment flat and photograph the whole front.",
    "Fit the whole garment in the frame.",
    focus, { framingTips: FULL_TIPS });

export const supremeBoxLogo = defineProfile({
  ...garment,
  id: "supreme-box-logo-hoodie",
  brand: "Supreme",
  model: "Box Logo hooded sweatshirt",
  generation: "Box Logo hoodie, Made in Canada",
  category: "Hoodie",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("supreme/how-to-legit-check-supreme-box-logo-hoodies", "How to legit check Supreme Box Logo hoodies")],
  presenceQuestions: [WASH_TAG_QUESTION],
  steps: [
    fullGarment(["box logo not centered over the front pocket"]),
    step("box_logo", "Box logo", "box logo photo",
      "Photograph the box logo straight on, close enough to see the stitching.",
      "Fill the frame with the box logo.",
      [
        "Supreme misspelled (objective)",
        "letters crowded together, especially S, u and p",
        "the inside of the p not an even oval",
        "thick letters or very dense stitching inside the letters",
      ], { readsText: true, framingTips: ["Logo fills the frame", "Straight on"] }),
    neckTag([
      "MADE IN CANADA tag missing under the neck label (objective, when the neck area is fully visible)",
      "logo tag and Made in Canada tag sewn very close together",
      "little space above the size marking",
    ]),
    washTag(["bold text in the wrong font; a short, wide wash tag"]),
    step("side_tag", "Side tag", "side tag photo",
      "Photograph the small tag on the side seam straight on.",
      "Move closer so the side tag is readable.",
      ["squashed, messy text; authentic is a wide rectangle with an italic, slightly stretched logo"],
      { required: false, readsText: true, framingTips: STAMP_TIPS }),
  ],
});

export const chromeHeartsHoodie = defineProfile({
  ...garment,
  id: "chrome-hearts-hoodie",
  brand: "Chrome Hearts",
  model: "Hoodie (zip or pullover)",
  generation: "Made in USA hoodies",
  category: "Hoodie",
  referenceNote: DESIGNER_REFERENCE_NOTE("The RN number on the wash tag names the company and is copied on fakes."),
  sources: [LG("chrome-hearts/real-vs-fake-chrome-hearts-hoodie-how-to-verify-authenticity-like-a-pro", "Chrome Hearts hoodie real vs fake")],
  presenceQuestions: [WASH_TAG_QUESTION],
  steps: [
    fullGarment(["loose threads, uneven seams or glue marks"]),
    step("logo", "Chest and sleeve graphics", "graphic photo",
      "Photograph the main chest graphic or embroidery close up.",
      "Move closer to the graphic.",
      ["sloppy, misaligned embroidery with jagged edges", "thin embroidery or wrong cross and dagger proportions"],
      { readsText: true, framingTips: ["Graphic fills the frame"] }),
    neckTag(["CHROME HEARTS or MADE IN USA misspelled (objective)", "irregular fonts or overly bold text; misplaced Made in USA line"]),
    washTag(["thick, hard-to-read CHROME HEARTS on the wash tag; overly bold 100% COTTON", "oversized Korean text"]),
    step("barcode_tag", "Barcode tag", "barcode tag photo",
      "If there's a barcode tag, photograph it straight on. Skip this if there isn't one.",
      "Move closer so the barcode tag is readable.",
      ["thin CH, numbers and dash; authentic CH is thick", "size or model number that differs between the barcode tag, wash tag and neck tag (objective)"],
      { required: false, readsText: true, framingTips: STAMP_TIPS }),
    step("hardware", "Drawcord tips", "drawcord photo",
      "Photograph the drawcord tips or zipper pull close up.",
      "Move closer to the hardware.",
      ["plain, unengraved drawcord tips; authentic tips are engraved with brand motifs such as the cross"],
      { required: false, framingTips: ["Hardware fills the frame"] }),
  ],
});

export const essentialsHoodie = defineProfile({
  ...garment,
  id: "fear-of-god-essentials-hoodie",
  brand: "Fear of God Essentials",
  model: "Essentials hoodie",
  generation: "Logo hoodie with hood rubber badge",
  category: "Hoodie",
  referenceNote: DESIGNER_REFERENCE_NOTE("Fabric composition varies by season, so it is a soft sign only."),
  sources: [LG("fear-of-god/how-to-spot-real-vs-fake-fear-of-god-essentials-hoodie", "Fear of God Essentials hoodie real vs fake")],
  presenceQuestions: [WASH_TAG_QUESTION],
  steps: [
    fullGarment(["chest logo too large or too small for the hoodie size"]),
    step("front_logo", "Front logo", "logo photo",
      "Photograph the ESSENTIALS logo straight on.",
      "Fill the frame with the logo.",
      ["ESSENTIALS misspelled (objective)", "wide letter spacing or bold letters", "a thick middle stroke in the N"],
      { readsText: true, framingTips: ["Logo fills the frame", "Straight on"] }),
    step("hood_badge", "Hood rubber badge", "badge photo",
      "Photograph the rubber badge on the hood close up.",
      "Move closer to the rubber badge.",
      ["thin, shallow ESSENTIALS text; authentic is thick and deeply embossed", "badge stitching sticking out"],
      { readsText: true, framingTips: ["Badge fills the frame"] }),
    neckTag(["thick letters with stitching problems"]),
    washTag(["font weight that changes within one line", "a composition label that differs from the season's documented blend (reported genuine: 80% cotton, 20% polyester)"]),
  ],
});

export const offWhiteHoodie = defineProfile({
  ...garment,
  id: "off-white-hoodie",
  brand: "Off-White",
  model: "Hoodie or tee",
  generation: "Arrows, Diag and graphic pieces",
  category: "Hoodie / tee",
  referenceNote: DESIGNER_REFERENCE_NOTE("Off-White cuts are wide on purpose; fit is not a warning sign. Label style changes by season."),
  sources: [LG("off-white/off-white-hoodie-real-vs-fake-guide", "Off-White hoodie real vs fake")],
  presenceQuestions: [WASH_TAG_QUESTION],
  steps: [
    fullGarment(["blurred print edges, distorted text, or flat-looking 3D arrows", "small print text that loses its shape"]),
    neckTag([
      "thin, loosely woven neck label with wide, uneven end stitches",
      "label style that doesn't fit the season: green MAIN LABEL around FW16, grey MAIN LABEL from FW20, hands-and-face logo from SS20",
    ]),
    washTag([
      "care text small, light and set high",
      "product code on the wash tag that differs from the barcode card (objective, when both are readable)",
      "older genuine hoodie codes begin OMBB; tee codes begin OMAA",
    ]),
    step("security_label", "Security label", "security label photo",
      "If there's a small QR-code security label under the main label, photograph it straight on.",
      "Move closer so the QR label is sharp.",
      ["many pieces since about 2018 carry a QR security label; older pieces may not, so absence is a soft sign only"],
      { required: false, readsText: true, framingTips: STAMP_TIPS }),
  ],
});

export const gucciCap = defineProfile({
  ...model,
  id: "gucci-gg-cap",
  categoryId: "hats",
  brand: "Gucci",
  model: "GG canvas baseball cap",
  generation: "GG Supreme canvas caps",
  category: "Baseball cap",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [LG("gucci/real-vs-fake-gucci-cap-legit-check", "Gucci cap real vs fake")],
  presenceQuestions: [],
  steps: [
    step("front", "Front panel", "front photo",
      "Photograph the front of the cap straight on so the GG print and the center seam are in frame.",
      "Show the front panel and seam clearly.",
      ["GG symbols spaced apart; authentic Gs sit close together and are rounder", "print that doesn't line up where the two front panels meet", "a center stitch that runs sideways", "shiny material instead of matte canvas"],
      { framingTips: ["Front fills the frame", "Straight on"] }),
    step("strap", "Back strap", "strap photo",
      "Photograph the back strap and buckle, inside and out.",
      "Show the strap and buckle clearly.",
      ["a Gucci logo printed on the strap; authentic straps are plain on the outside", "strap lettering on the outside instead of the inside", "textured or embossed buckle ring"],
      { readsText: true, framingTips: ["Strap and buckle in frame"] }),
    step("inside_label", "Inside label", "label photo",
      "Turn the cap over and photograph the label inside straight on.",
      "Move closer so the label is readable.",
      ["GUCCI misspelled (objective)", "small, thick label letters; distorted letters with an uneven outline", "dotted red stitching instead of a uniform line"],
      { readsText: true, framingTips: STAMP_TIPS }),
    step("wash_tag", "Wash tag", "wash tag photo",
      "Photograph the wash tag inside the cap.",
      "Move closer so the wash tag is readable.",
      ["carelessly cut tag with lettering running sideways", "narrow tag with thin, faded lettering"],
      { required: false, readsText: true, framingTips: STAMP_TIPS }),
    step("visor", "Visor stitching", "visor photo",
      "Photograph the visor from above so its stitching outline is sharp.",
      "Show the visor stitching clearly.",
      ["thin, asymmetric visor outline"], { required: false, framingTips: STITCH_TIPS }),
  ],
});

export const MORE_DESIGNER_SNEAKERS = [mcqueenOversized, balenciagaTrack, louboutinSneakers, gucciRhyton, offWhiteNike];
export const DESIGNER_STREETWEAR = [supremeBoxLogo, chromeHeartsHoodie, essentialsHoodie, offWhiteHoodie, gucciCap];

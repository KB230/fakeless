import { defineProfile } from "../define";
import { DESIGNER_REFERENCE_NOTE, FULL_TIPS, PACKAGING_QUESTION, packagingStep, SRC, STAMP_TIPS, step, STITCH_TIPS } from "./shared";

/**
 * Designer belt profiles (handbags & leather goods category).
 * Buckle shine is deliberately NOT a warning sign: the guides contradict each
 * other (and one Ferragamo page contradicts itself) on whether genuine
 * buckles are shinier or more matte.
 */

const belt = {
  kind: "model" as const,
  categoryId: "handbags",
  liveEnabled: true,
  referenceStatus: "documented" as const,
  colorway: null,
  category: "Belt",
};

const FULL_BELT = (name: string) =>
  step("full_belt", "Full belt", "full belt photo",
    `Lay the ${name} flat and straight on a table and photograph the whole length, buckle included.`,
    "Fit the whole belt, buckle included, in the frame.",
    [
      "edges with bubbles, chips or peeling paint",
      "stitching that wanders or has split stitches along the strap",
    ],
    { framingTips: FULL_TIPS });

export const hermesHBelt = defineProfile({
  ...belt,
  id: "hermes-h-belt",
  brand: "Hermès",
  model: "H belt (Constance buckle, reversible strap)",
  generation: "32 mm and 38 mm",
  referenceNote: DESIGNER_REFERENCE_NOTE(),
  sources: [SRC.lgHermesBelt, SRC.libasHermes],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    FULL_BELT("belt"),
    step("buckle_front", "H buckle front", "buckle photo",
      "Photograph the H buckle straight on so its corners and edges are sharp.",
      "Fill the frame with the H buckle, straight on.",
      ["rounded buckle corners; authentic corners are crisp and edges well defined", "scratches, pitting or uneven plating on a new buckle"],
      { framingTips: ["Buckle fills the frame", "Avoid reflections"] }),
    step("buckle_back", "Buckle back", "buckle back photo",
      "Turn the buckle over and photograph the back so any engraving is readable.",
      "Move closer to the back of the buckle so the engraving is sharp.",
      ["HERMÈS engraving missing from the back of the buckle (objective, when the whole back is visible)", "HERMÈS spelled without the accent on the second E (objective)"],
      { readsText: true, framingTips: STAMP_TIPS }),
    step("strap_stamp", "Strap stamps", "strap stamp photo",
      "Photograph the end of the strap where HERMÈS PARIS MADE IN FRANCE, the size and the blind stamp are pressed.",
      "Move closer to the strap end so every stamp is readable.",
      [
        "HERMÈS, PARIS and MADE IN FRANCE present and correctly spelled (objective)",
        "Hermès marks belt sizes in centimeters only (for example 85 or 90); a size in inches or letter sizes is a warning sign (objective)",
        "lettering thin, small or unevenly stamped",
        "year letter frame: circle = 1971–1996, square = 1997–2014, plain letter = 2015 onward (T=2015, X=2016, A=2017, C=2018, D=2019, Y=2020, Z=2021, U=2022, B=2023, W=2024, K=2025)",
      ],
      { readsText: true, framingTips: STAMP_TIPS }),
    step("stitching", "Strap stitching", "stitching close-up",
      "Move close to the strap edge until individual stitches are sharp.",
      "Move closer to one edge until individual stitches are sharp.",
      ["stitches uneven, split or nicked; authentic stitching is straight and symmetrical"],
      { framingTips: STITCH_TIPS }),
    packagingStep(["box should be orange with a brown ribbon printed with the Hermès logo; printing inside the box is a warning sign", "thin H and circle on the dust bag"]),
  ],
});

export const gucciGgSupremeBelt = defineProfile({
  ...belt,
  id: "gucci-gg-supreme-belt",
  brand: "Gucci",
  model: "GG Supreme belt (Double G buckle)",
  generation: "GG Supreme canvas strap",
  referenceNote: DESIGNER_REFERENCE_NOTE("The code on the strap can be searched online; a code that turns up a different product is a warning sign, but a matching code never passes a belt on its own."),
  sources: [SRC.lgSupremeBelt],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    FULL_BELT("belt"),
    step("buckle_front", "Double G buckle", "buckle photo",
      "Photograph the Double G buckle straight on.",
      "Fill the frame with the Double G buckle, straight on.",
      ["the two Gs look flat or their crossings are blurry; authentic crossings are crisp and smooth", "buckle that looks beige-toned rather than the stated metal finish"],
      { framingTips: ["Buckle fills the frame", "Avoid reflections"] }),
    step("strap_pattern", "GG Supreme pattern", "pattern photo",
      "Move close to the GG Supreme canvas on the strap.",
      "Move closer to the strap pattern until it is sharp.",
      ["GG monogram faded, unevenly spaced or blurry", "thread color that clashes with the pattern; genuine stitches blend in"],
      { framingTips: ["Pattern fills the frame", "Even light"] }),
    step("strap_stamp", "Inside stamp and code", "strap stamp photo",
      "Turn the strap over and photograph the stamp with GUCCI, MADE IN ITALY and the product code straight on.",
      "Move closer to the stamp so the code is readable.",
      [
        "GUCCI or MADE IN ITALY misspelled (objective)",
        "MADE IN ITALY in a font that doesn't match the rest of the stamp",
        "the stamp carries a product code (documented example: 411924 KGDHN 214351); a missing code on a fully visible stamp is a warning sign",
        "back of the strap yellowish instead of reddish-brown (allow for lighting)",
      ],
      { readsText: true, framingTips: STAMP_TIPS }),
    packagingStep(),
  ],
});

export const ferragamoGanciniBelt = defineProfile({
  ...belt,
  id: "ferragamo-gancini-belt",
  brand: "Salvatore Ferragamo",
  model: "Gancini belt",
  generation: "Reversible and fixed Gancini buckle belts",
  referenceNote: DESIGNER_REFERENCE_NOTE("Guides disagree on buckle thickness and shine, so those are not used as warning signs."),
  sources: [SRC.lgFerragamoBelt],
  presenceQuestions: [PACKAGING_QUESTION],
  steps: [
    FULL_BELT("belt"),
    step("buckle_front", "Gancini buckle", "buckle photo",
      "Photograph the Gancini buckle straight on, then slightly from the side so its depth shows.",
      "Fill the frame with the Gancini buckle.",
      ["buckle looks flat instead of rounded and three-dimensional", "oversized, prominent lettering on the buckle"],
      { readsText: true, framingTips: ["Buckle fills the frame", "Avoid reflections"] }),
    step("buckle_back", "Buckle back", "buckle back photo",
      "Turn the buckle over and photograph any engraving on the back.",
      "Move closer to the back of the buckle so the engraving is sharp.",
      ["engraved lettering filled in black instead of matching the metal", "MADE IN ITALY scratched in large, square letters rather than finely engraved", "misspelled SALVATORE FERRAGAMO or MADE IN ITALY (objective)"],
      { readsText: true, framingTips: STAMP_TIPS }),
    step("strap_stamp", "Strap stamp and serial", "strap stamp photo",
      "Photograph the inside of the strap where the brand, size and serial number are printed.",
      "Move closer to the strap stamp so the serial is readable.",
      ["smudged, faint or crooked print", "no serial layout is documented, so the number itself is not checked"],
      { readsText: true, framingTips: STAMP_TIPS }),
    packagingStep(["box lettering silver and raised instead of flat white", "box surface completely smooth instead of textured red"]),
  ],
});

export const DESIGNER_BELTS = [hermesHBelt, gucciGgSupremeBelt, ferragamoGanciniBelt];

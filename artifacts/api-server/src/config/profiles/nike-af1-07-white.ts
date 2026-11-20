import { defineProfile, SIZE_TAG_QUESTION } from "./define";

/**
 * Nike Air Force 1 '07 Low, White/White — live model-specific profile.
 *
 * Reference photos: the authentic halves of the team's AF1 White legit-check
 * comparison set (Dype "How To Spot FAKE Nike Air Force 1 White" guide).
 * Style codes: Nike product pages (men's CW2288-111, women's DD8959-100), plus
 * the grade-school DH2920-111 and the older men's 315122-111 code shown on the
 * guide's size tags. Counterfeits often copy a valid code, so a code match
 * alone never passes a listing: every visual check has to agree too.
 */
const REF = (file: string, caption: string) => ({
  imageUrl: `references/af1-white/${file}`,
  caption,
  source: "Authentic pair, AF1 White legit-check set (Dype guide)",
  isDemo: false,
});

export const AF1_STYLE_CODE_PATTERN = /^([A-Z]{2}\d{4}|\d{6})-\d{3}$/;

export const nikeAf1White = defineProfile({
  id: "nike-af1-07-white",
  kind: "model",
  categoryId: "sneakers",
  liveEnabled: true,
  brand: "Nike",
  model: "Air Force 1 '07 Low",
  generation: "Current retail release",
  colorway: "White/White",
  category: "Sneakers",
  referenceStatus: "documented",
  referenceNote:
    "Compared against photos of an authentic pair and documented style codes. A matching style code alone is not enough: counterfeits often copy a valid code, so every visual check has to agree too.",
  sources: [
    { label: "Nike: Air Force 1 '07 Men's, White/White, style CW2288-111", url: "https://www.nike.com/t/air-force-1-07-mens-shoes-jBrhbr/CW2288-111" },
    { label: "Nike: Air Force 1 '07 Women's, White/White, style DD8959-100", url: "https://www.nike.com/t/air-force-1-07-womens-shoes-z49q2j/DD8959-100" },
    { label: "Dype: How To Spot FAKE Nike Air Force 1 White (legit-check guide; Dype app)", url: "https://apps.apple.com/us/app/id1477240004" },
  ],
  expectedCodes: [
    { code: "CW2288-111", codeType: "style_code", description: "Men's Air Force 1 '07, White/White (Nike product page)", isSample: false },
    { code: "DD8959-100", codeType: "style_code", description: "Women's Air Force 1 '07, White/White (Nike product page)", isSample: false },
    { code: "DH2920-111", codeType: "style_code", description: "Grade-school Air Force 1, White/White (authentic size tag in the reference set)", isSample: false },
    { code: "315122-111", codeType: "style_code", description: "Older men's Air Force 1 '07 White/White code. Counterfeits frequently copy it.", isSample: false },
  ],
  presenceQuestions: [
    SIZE_TAG_QUESTION,
    {
      id: "box_label",
      question: "Do you have the original box with its label?",
      help: "The printed label is on one end of the box.",
      expected: false,
      absentNote: "That's fine. Answering No skips the box label photo.",
    },
  ],
  steps: [
    {
      id: "side_profile",
      title: "Side profile",
      noun: "side profile photo",
      instruction: "Place one shoe on a flat surface and photograph it straight from the side, toe to heel, so the whole swoosh and the AIR text on the midsole are in frame.",
      retakeInstruction: "Fit the whole shoe, toe to heel, in the frame from the side.",
      required: true,
      framingTips: ["Whole shoe, toe to heel", "Camera level with the shoe", "Plain background"],
      comparisonFocus: [
        "overall shape and toe box height compared to the reference",
        "swoosh size and position relative to the panels",
        "panel stitching runs straight and evenly spaced",
      ],
      references: [REF("side-profile.jpg", "Authentic side profile")],
    },
    {
      id: "swoosh",
      title: "Swoosh close-up",
      noun: "swoosh close-up",
      instruction: "Move in on the swoosh from the side until the whole swoosh and its stitching fill the frame.",
      retakeInstruction: "Fill the frame with the whole swoosh, straight on.",
      required: true,
      framingTips: ["Whole swoosh in frame", "Straight on, even light"],
      comparisonFocus: [
        "swoosh thickness: authentic is wide with a natural curve; counterfeits are thinner with an abrupt, late curve that leaves a larger gap",
        "swoosh tip is pointed and straight, not crooked",
        "stitching around the swoosh sits evenly at the same depth; counterfeit stitches vary, some sunk and some raised",
      ],
      references: [
        REF("swoosh-curve.jpg", "Authentic swoosh curve and thickness"),
        REF("swoosh-stitching.jpg", "Authentic swoosh stitching"),
      ],
    },
    {
      id: "heel",
      title: "Heel tab embroidery",
      noun: "heel photo",
      instruction: "Photograph the back of the shoe straight on, then move closer until the NIKE logo, swoosh and AIR text on the heel tab fill the frame.",
      retakeInstruction: "Move closer to the heel tab so the NIKE AIR embroidery is sharp.",
      required: true,
      framingTips: ["NIKE swoosh and AIR all in frame", "Straight on, no glare"],
      comparisonFocus: [
        "embroidery is dense and raised with visible depth; counterfeit embroidery looks flat, thin or sunken",
        "loose threads or fuzzy edges around NIKE and the swoosh",
        "letter A of AIR is tall; the legs of the R are even",
        "AIR letters sit straight, not crooked",
        "heel tab outline curves smoothly instead of angular cuts",
      ],
      references: [
        REF("heel-rear.jpg", "Authentic heel, straight on"),
        REF("heel-embroidery.jpg", "Authentic heel embroidery close-up"),
      ],
    },
    {
      id: "toe_box",
      title: "Toe box",
      noun: "toe box photo",
      instruction: "Photograph the toe box from above so all the perforation holes and the stitching around the toe cap are in frame.",
      retakeInstruction: "Show the whole toe box from above, every perforation hole sharp.",
      required: true,
      framingTips: ["All perforations in frame", "Shoot from directly above"],
      comparisonFocus: [
        "perforation holes are small and evenly spaced in a regular pattern; counterfeit holes are punched wider and spaced irregularly",
        "the lowest perforation hole sits well away from the toe stitching",
        "toe cap stitching is dense and slightly raised",
      ],
      references: [REF("toe-box.jpg", "Authentic toe box perforations and stitching")],
    },
    {
      id: "lace_tag",
      title: "Metal AF1 lace tag",
      noun: "lace tag photo",
      instruction: "Move close to the metal AF1 tag on the laces, straight on, in normal indoor light without flash.",
      retakeInstruction: "Move closer to the AF1 lace tag, straight on, no flash.",
      required: false,
      readsText: true,
      framingTips: ["Whole metal tag in frame", "No flash; note that lighting changes the shine"],
      comparisonFocus: [
        "metal is a muted silver tone, not bronze or gold and not mirror-shiny (allow for lighting)",
        "surface is smooth with no scratches or dents",
        "AF1 lettering has crisp, straight edges",
        "the tag has a slight curve rather than being completely flat",
        "stitching rows on the tongue below the tag: authentic shows multiple dense rows",
      ],
      references: [REF("lace-tag.jpg", "Authentic metal AF1 lace tag")],
    },
    {
      id: "size_tag",
      title: "Inside size tag",
      noun: "size tag photo",
      instruction: "Look inside the shoe for the size tag. Hold it flat and straight on so every line, the style code and the QR code are readable.",
      retakeInstruction: "Hold the size tag flat and straight on so every letter and number is readable.",
      required: true,
      presenceQuestionId: "size_tag",
      readsText: true,
      compareCodes: true,
      framingTips: ["Whole tag in frame", "Flat and straight on", "No glare across the text"],
      comparisonFocus: [
        "font is consistently thick with even letter spacing; counterfeit tags use thin fonts with uneven gaps (for example between C and H in HECHO)",
        "country of manufacture is printed in full on every language line, not cut off",
        "the www.nike.com/patentsvirtualmarking line has even spacing with no letters overlapping",
        "the style code is printed as two letters plus four digits, or six digits, then a dash and three digits",
      ],
      references: [REF("size-tag.jpg", "Authentic size tag")],
    },
    {
      id: "box_label",
      title: "Box label",
      noun: "box label",
      instruction: "Photograph the label on the end of the box straight on, close enough that every line is readable.",
      retakeInstruction: "Fill the frame with the box label, straight on, every line readable.",
      required: true,
      presenceQuestionId: "box_label",
      readsText: true,
      framingTips: ["Whole label in frame", "Straight on"],
      comparisonFocus: [
        "style code and size match the size tag inside the shoe (objective if they differ)",
        "print is solid and dark; counterfeit labels look faded, thin or low-opacity",
        "colorway line reads WHITE/WHITE with consistent letter weight",
      ],
    },
    {
      id: "midsole_air",
      title: "Midsole AIR text",
      noun: "midsole photo",
      instruction: "Move close to the AIR lettering on the side of the midsole near the heel so the letters and the line next to them are sharp.",
      retakeInstruction: "Move closer to the AIR text on the midsole until it's sharp.",
      required: false,
      readsText: true,
      framingTips: ["AIR and the line beside it in frame", "Side light shows the depth"],
      comparisonFocus: [
        "the line beside AIR ends with a slight angled slope, not a squared-off 90 degree end",
        "midsole stitching above AIR is neat, even and deeply sewn",
      ],
      references: [REF("midsole-air.jpg", "Authentic midsole AIR lettering")],
    },
    {
      id: "outsole",
      title: "Outsole",
      noun: "outsole photo",
      instruction: "Turn the shoe over and photograph the sole from directly above, including the pivot circle and the toe area.",
      retakeInstruction: "Show the whole outsole from directly above, evenly lit.",
      required: true,
      readsText: true,
      framingTips: ["Whole sole in frame", "Even light across the tread"],
      comparisonFocus: [
        "no size numbers or other numerals molded into the sole (objective: retail pairs have none)",
        "fine, fibrous texture in the tread rings; counterfeit texture is coarser",
        "star pattern at the toe is not oversized or thick",
        "Nike logo on the sole includes a legible registered mark",
      ],
      references: [REF("outsole.jpg", "Authentic outsole")],
    },
    {
      id: "insole",
      title: "Insole print",
      noun: "insole photo",
      instruction: "Look down into the shoe and photograph the insole print from above in good light.",
      retakeInstruction: "Show the insole from above, logo area in focus.",
      required: false,
      readsText: true,
      framingTips: ["Shoot from directly above", "Logo area in focus"],
      comparisonFocus: [
        "insole print has sharp edges with clear gaps between design elements; counterfeit prints look smudged or clumped (allow for normal wear)",
      ],
    },
    {
      id: "tongue",
      title: "Tongue label",
      noun: "tongue label photo",
      instruction: "Photograph the woven label on the front of the tongue straight on.",
      retakeInstruction: "Fill the frame with the tongue label, straight on.",
      required: false,
      readsText: true,
      framingTips: ["Whole label in frame", "Straight on"],
      comparisonFocus: [
        "logo and text are centered with a small margin at the top of the label",
        "no visible outline stitching around the letters and logo",
      ],
    },
  ],
});

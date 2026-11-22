import type { PresenceQuestion, SourceLink } from "@workspace/api-zod";
import type { StepDef } from "../define";

/**
 * Shared building blocks for the designer profiles.
 *
 * Every designer profile is built from published third-party legit-check
 * guides (authentication services and resellers such as LegitGrails and
 * FASHIONPHILE), read in full in November 2026. None of them is a brand
 * specification and none ships reference photos, so — like the North Face
 * daypack profile — each step is screened against a warning-sign checklist
 * instead of a side-by-side comparison.
 *
 * Conventions used in comparisonFocus:
 * - "(objective)" is used only for things a photo can verify without
 *   judgment: misspellings, required text that is clearly absent, a code
 *   whose format cannot exist, or two labels on the same item that disagree.
 * - Where the guides contradict each other (buckle shine, letter thickness),
 *   the sign is phrased neutrally or left out rather than picking a side.
 * - Single-source claims are kept subjective: they can be shown to a
 *   reviewer but never block a listing on their own.
 */

export const DESIGNER_REFERENCE_NOTE = (extra = "") =>
  `Checked against warning signs and features documented in published legit-check guides (third-party authenticators, not the brand). There are no reference photos for this profile, so photos are screened for warning signs rather than compared side by side. A clean result is not an authentication.${extra ? ` ${extra}` : ""}`;

/** Compact step constructor. */
export function step(
  id: string,
  title: string,
  noun: string,
  instruction: string,
  retakeInstruction: string,
  comparisonFocus: string[],
  opts: Partial<Omit<StepDef, "id" | "title" | "noun" | "instruction" | "retakeInstruction" | "comparisonFocus">> = {},
): StepDef {
  return {
    id,
    title,
    noun,
    instruction,
    retakeInstruction,
    comparisonFocus,
    required: opts.required ?? true,
    ...opts,
  };
}

export const PACKAGING_QUESTION: PresenceQuestion = {
  id: "packaging",
  question: "Do you have the original dust bag, box or authenticity card?",
  help: "Any of the packaging or paperwork that came with the item.",
  expected: false,
  absentNote: "That's fine. Many pre-owned items are sold without packaging. Answering No skips the packaging photo.",
};

export const BOX_LABEL_QUESTION: PresenceQuestion = {
  id: "box_label",
  question: "Do you have the original box with its label?",
  help: "The printed label is usually on one end of the box.",
  expected: false,
  absentNote: "That's fine. Answering No skips the box label photo.",
};

/** Generic packaging step; brand-specific signs are appended per profile. */
export function packagingStep(extraSigns: string[] = []): StepDef {
  return step(
    "packaging",
    "Dust bag, box or card",
    "packaging photo",
    "Lay the dust bag, box or card flat and photograph the printed logo and any text straight on.",
    "Fill the frame with the printed logo and text, straight on.",
    [
      "misspelled brand name or address on the packaging (objective)",
      "blurry, smudged or uneven printing on the dust bag, card or box",
      ...extraSigns,
      "packaging is sold separately, so correct packaging never proves the item itself is genuine",
    ],
    { presenceQuestionId: "packaging", readsText: true, framingTips: ["Whole logo and text in frame", "Flat, no wrinkles across the text"] },
  );
}

export const STITCH_TIPS = ["One seam, close up", "Tap to focus on the thread"];
export const STAMP_TIPS = ["Straight on", "Angle a light from the side so the stamp is readable", "No glare"];
export const FULL_TIPS = ["Whole item in frame", "Plain background", "Even light"];

/* Sources (pages read in full or in large part, November 2026). */
export const SRC = {
  lgSpeedy: { label: "LegitGrails: How to legit check Louis Vuitton Speedy", url: "https://legitgrails.com/blogs/louis-vuitton/how-to-legit-check-louis-vuitton-speedy-bag" },
  fpSpeedy: { label: "FASHIONPHILE: How to spot a fake Louis Vuitton Speedy", url: "https://www.fashionphile.com/blogs/academy/how-to-spot-a-fake-louis-vuitton-speedy" },
  lgNeverfull: { label: "LegitGrails: How to spot a fake Louis Vuitton Neverfull MM", url: "https://legitgrails.com/blogs/louis-vuitton/how-to-spot-a-fake-louis-vuitton-neverfull-mm" },
  fpNeverfull: { label: "FASHIONPHILE: Authenticating the Neverfull", url: "https://www.fashionphile.com/blogs/academy/authenticating-the-neverfull" },
  fpLvDate: { label: "FASHIONPHILE: Louis Vuitton date codes", url: "https://www.fashionphile.com/blogs/academy/louis-vuitton-date-codes" },
  ccLvChip: { label: "Collector's Cage: Louis Vuitton date code vs microchip (2021 switch)", url: "https://collectorscage.com/blogs/authentication/louis-vuitton-date-code-vs-microchip-the-complete-buyers-guide-to-auth" },
  lgChanel: { label: "LegitGrails: How to spot a fake Chanel bag", url: "https://legitgrails.com/blogs/chanel/how-to-spot-a-fake-chanel-bag" },
  fpChanel: { label: "FASHIONPHILE: Chanel serial codes decoded", url: "https://www.fashionphile.com/blogs/academy/chanel-serial-codes-decoded" },
  lgBirkin: { label: "LegitGrails: Real vs fake Birkin", url: "https://legitgrails.com/blogs/hermes/hermes-birkin-bag-authentication-guide" },
  libasHermes: { label: "Libas Collective: Hermès blind stamp checker (year-letter chart)", url: "https://www.libascollective.com/tools/hermes-blind-stamp-checker" },
  lgMarmont: { label: "LegitGrails: Gucci Marmont bag fake vs real", url: "https://legitgrails.com/blogs/gucci/gucci-marmont-bag-fake-vs-real-guide" },
  fpMarmont: { label: "FASHIONPHILE: Authenticate the Gucci Marmont", url: "https://www.fashionphile.com/blogs/academy/authenticate-gucci-marmont" },
  lgSaddle: { label: "LegitGrails: Dior Saddle bag real vs fake", url: "https://legitgrails.com/blogs/dior/dior-saddle-bag-real-vs-fake-guide-how-to-legit-check-dior-saddle-bag" },
  lgLadyDior: { label: "LegitGrails: Lady Dior authentication guide", url: "https://legitgrails.com/blogs/dior/dior-lady-bag-authentication-guide" },
  fpLadyDior: { label: "FASHIONPHILE: Authenticating the Lady Dior", url: "https://www.fashionphile.com/blogs/academy/authenticating-the-lady-dior" },
  lgPrada2005: { label: "LegitGrails: How to spot a fake Prada Re-Edition 2005", url: "https://legitgrails.com/blogs/prada/how-to-spot-a-fake-prada-re-edition-2005-nylon-shoulder-bag" },
  fpPrada: { label: "FASHIONPHILE: How to spot a fake Prada bag (Re-Edition 2000, zipper brands)", url: "https://www.fashionphile.com/blogs/academy/how-to-spot-a-fake-prada-bag" },
  lgGoyardSL: { label: "LegitGrails: Goyard Saint Louis PM real vs fake", url: "https://legitgrails.com/blogs/goyard/real-vs-fake-goyard-saint-louis-tote-pm-legit-check" },
  lgGoyard: { label: "LegitGrails: How to authenticate a Goyard bag", url: "https://legitgrails.com/blogs/goyard/how-to-spot-real-vs-fake-goyard-bags" },
  lgGoyardSerial: { label: "LegitGrails: Goyard serial number format", url: "https://legitgrails.com/pages/goyard-serial-number-checker" },
  lgBaguette: { label: "LegitGrails: Fendi Baguette real vs fake", url: "https://legitgrails.com/blogs/fendi/real-vs-fake-fendi-baguette-bag-legit-check" },
  fpBaguette: { label: "FASHIONPHILE: How to authenticate a Fendi Baguette", url: "https://www.fashionphile.com/blogs/academy/authenticate-a-fendi-baguette" },
  lgCassette: { label: "LegitGrails: Bottega Veneta Padded Cassette real vs fake", url: "https://legitgrails.com/blogs/bottega-veneta/real-vs-fake-bottega-veneta-padded-cassette-bag-legit-check" },
  lgLoulou: { label: "LegitGrails: YSL Loulou medium real vs fake", url: "https://legitgrails.com/blogs/saint-laurent/real-vs-fake-ysl-loulou-medium-bag-legit-check" },
  fpLoulou: { label: "FASHIONPHILE: Authenticate the Loulou satchel", url: "https://www.fashionphile.com/blogs/academy/authenticate-the-loulou-satchel" },
  lgKate: { label: "LegitGrails: YSL Kate fake vs real", url: "https://www.legitgrails.com/blogs/saint-laurent/ysl-kate-bag-fake-vs-real-guide" },
  lgHermesBelt: { label: "LegitGrails: Hermès belt real vs fake", url: "https://legitgrails.com/blogs/hermes/real-vs-fake-hermes-belt-legit-check" },
  lgSupremeBelt: { label: "LegitGrails: Gucci GG Supreme belt authentication", url: "https://legitgrails.com/blogs/gucci/gucci-supreme-belt-authentication-guide" },
  lgFerragamoBelt: { label: "LegitGrails: Salvatore Ferragamo belt real vs fake", url: "https://legitgrails.com/blogs/salvatore-ferragamo/real-vs-fake-salvatore-ferragamo-belt-legit-check" },
  lgTripleS: { label: "LegitGrails: Balenciaga Triple S real vs fake", url: "https://legitgrails.com/blogs/balenciaga/how-to-spot-fake-balenciaga-triple-s-balenciaga-shoes-real-vs-fake" },
  lgAce: { label: "LegitGrails: Gucci Ace sneakers fake vs real", url: "https://legitgrails.com/blogs/gucci/fake-vs-real-gucci-ace-sneakers-guide" },
  lgSuperStar: { label: "LegitGrails: Golden Goose Super-Star real vs fake", url: "https://legitgrails.com/blogs/golden-goose/real-vs-fake-golden-goose-super-star-sneakers-legit-check" },
  lgB23: { label: "LegitGrails: How to legit check Dior B23", url: "https://legitgrails.com/blogs/dior/how-to-legit-check-dior-b23" },
  lgCanadaGoose: { label: "LegitGrails: How to spot a fake Canada Goose jacket", url: "https://legitgrails.com/blogs/canada-goose/how-to-spot-a-fake-canada-goose-jacket" },
  lgBurberryCoat: { label: "LegitGrails: Fake vs real Burberry coat", url: "https://legitgrails.com/blogs/burberry/fake-vs-real-burberry-coat-how-to-spot-the-differences" },
  laMaya70: { label: "LegitApp: How to authenticate the Moncler Maya 70", url: "https://legitapp.com/blog/how-to-authenticate-the-moncler-maya-70-short-down-jacket" },
} satisfies Record<string, SourceLink>;

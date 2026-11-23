import { DESIGNER_BAGS } from "./bags";
import { DESIGNER_BELTS } from "./belts";
import { DESIGNER_OUTERWEAR } from "./outerwear";
import { DESIGNER_SNEAKERS } from "./sneakers";
import { MORE_DESIGNER_BAGS } from "./more-bags";
import { DESIGNER_STREETWEAR, MORE_DESIGNER_SNEAKERS } from "./more-apparel";
import { BATCH3_APPAREL, BATCH3_BAGS, BATCH3_SNEAKERS } from "./batch3";

/**
 * 76 designer and streetwear model profiles built from published legit-check
 * guides. See ./shared.ts for sourcing rules and the meaning of "(objective)".
 */
export const DESIGNER_PROFILES = [
  ...DESIGNER_BAGS,
  ...MORE_DESIGNER_BAGS,
  ...BATCH3_BAGS,
  ...DESIGNER_BELTS,
  ...DESIGNER_SNEAKERS,
  ...MORE_DESIGNER_SNEAKERS,
  ...BATCH3_SNEAKERS,
  ...DESIGNER_OUTERWEAR,
  ...DESIGNER_STREETWEAR,
  ...BATCH3_APPAREL,
];

/** Sneaker profiles whose box label and size tag must agree. */
export const DESIGNER_SNEAKER_IDS = [...DESIGNER_SNEAKERS, ...MORE_DESIGNER_SNEAKERS, ...BATCH3_SNEAKERS].map((p) => p.id);

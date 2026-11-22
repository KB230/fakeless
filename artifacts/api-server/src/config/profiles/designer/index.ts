import { DESIGNER_BAGS } from "./bags";
import { DESIGNER_BELTS } from "./belts";
import { DESIGNER_OUTERWEAR } from "./outerwear";
import { DESIGNER_SNEAKER_IDS, DESIGNER_SNEAKERS } from "./sneakers";

/**
 * 23 designer model profiles built from published legit-check guides.
 * See ./shared.ts for sourcing rules and the meaning of "(objective)".
 */
export const DESIGNER_PROFILES = [
  ...DESIGNER_BAGS,
  ...DESIGNER_BELTS,
  ...DESIGNER_SNEAKERS,
  ...DESIGNER_OUTERWEAR,
];

export { DESIGNER_SNEAKER_IDS };

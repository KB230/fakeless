# Fakeless

Mobile-first counterfeit screening step for clothing resellers: before publishing a listing, the seller photographs logo, wash tag, zipper and seam tape; a vision model returns structured observations and backend rules decide Passed listing checks / Retake requested / Manual review.

## Run & Operate

- Workflows: `artifacts/api-server: API Server` (Express, /api) and `artifacts/listing-check: web` (React/Vite, /)
- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate hooks + Zod from OpenAPI
- `pnpm --filter @workspace/db run push` — push DB schema (dev only)
- Secrets: `OPENAI_API_KEY` (live photo analysis; user's own key), `ELEVENLABS_API_KEY` (voice prompts). Optional env: `OPENAI_VISION_MODEL` (default gpt-5), `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`.

## Where things live

- API contract: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/checks.ts` (checks, check_photos)
- Product profiles (add new clothing models here): `artifacts/api-server/src/config/profiles/`
- Designer profiles (23 models: LV, Chanel, Hermès, Gucci, Dior, Prada, Goyard, Fendi, Bottega, Saint Laurent bags; Hermès/Gucci/Ferragamo belts; Balenciaga/Gucci/Golden Goose/Dior sneakers; Canada Goose/Burberry/Moncler outerwear): `config/profiles/designer/`. Built from published third-party legit-check guides (LegitGrails, FASHIONPHILE, LegitApp, Libas Collective, Collector's Cage) read Nov 2026; no reference photos, so steps are screened for warning signs like the TNF daypack. "(objective)" only marks photo-verifiable facts; contradictory guide claims (e.g. buckle shine) are left out. Sneaker box label vs size tag and Burberry care label vs size tag are cross-checked in `rules.ts`.
- Reference/demo images: `artifacts/listing-check/public/references/<model>/`, `public/demo/`
- Decision rules: `artifacts/api-server/src/lib/rules.ts`; vision prompt/schema: `lib/vision.ts`; TTS: `lib/voice.ts`
- Demo cases (pre-recorded observations): `artifacts/api-server/src/config/demoCases.ts`
- Voice prompt whitelist (same text shown on screen): `artifacts/api-server/src/config/voicePrompts.ts`

## Architecture decisions

- Vision model only observes; outcome is decided by backend rules (retake > manual review > pass).
- Publishing gate is server-side: `/checks/:id/publish` 409s unless status and recorded decision are "passed"; any new evidence resets the decision.
- Checks carry `mode` live|demo; demo checks never count in live stats/lists and their publish is labeled mock demo.
- Live model checks never pass against DEMO references or sample codes. Model requests without a live profile use their category checklist. Category/basic completion is explicitly not model verification.
- Live photo bytes are not stored; only observations. The client keeps its own previews.
- TTS only synthesizes whitelisted prompt ids (no arbitrary text), cached in memory.

## Product

- Home with EUIPO 2022 statistic, "Start a listing check" and "Try a demo"
- Seller flow: profile + condition + price → logo → wash tag question/front/back → zipper → seam tape → result
- Demo: no-upload cases (pass+mock publish, blurry tag retake, style-code mismatch review, basic screening, sneakers category check, sneakers label mismatch)
- Warning signs: each category step has brand-agnostic `comparisonFocus` warning signs (stitching, logo/font, tag print, hardware, embroidery, holograms) in `config/profiles/categories.ts`. The vision model returns `warningSigns` tagged objective/subjective. Objective signs → manual review; subjective signs are shown to the reviewer but never block. Sneakers also cross-check box label vs size tag (US size + labeled style code) in `rules.ts`.

## Gotchas

- The sample outerwear profile uses DEMO reference images and sample codes; it is excluded from live model verification. Live model checks require sourced references and an enabled profile.

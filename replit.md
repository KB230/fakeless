# Fakeless

Mobile-first counterfeit screening step for clothing resellers: before publishing a listing, the seller photographs logo, wash tag, zipper and seam tape; a vision model returns structured observations and backend rules decide Passed listing checks / Retake requested / Manual review.

## Run & Operate

- Workflows: `artifacts/api-server: API Server` (Express, /api) and `artifacts/listing-check: web` (React/Vite, /)
- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate hooks + Zod from OpenAPI
- `pnpm --filter @workspace/db run push` — push DB schema (dev only)
- Secrets: `OPENAI_API_KEY` (live photo analysis; user's own key), `ELEVENLABS_API_KEY` (voice prompts). Optional env: `OPENAI_VISION_MODEL` (default gpt-5), `OPENAI_REASONING_EFFORT` (default: `low` for text steps, `minimal` for visual steps), `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`.
- Local web build on a Mac: the workspace strips darwin binaries (Replit/Render are Linux), so `vite build` needs `@rollup/rollup-darwin-arm64`, `lightningcss-darwin-arm64` and `@tailwindcss/oxide-darwin-arm64` installed elsewhere and passed via `NODE_PATH`.

## Where things live

- API contract: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/checks.ts` (checks, check_photos)
- Product profiles (add new clothing models here): `artifacts/api-server/src/config/profiles/`
- Designer profiles (53 models): `config/profiles/designer/` — `bags.ts`/`more-bags.ts` (33 bags, wallets, LV belt), `belts.ts` (Hermès, Gucci, Ferragamo), `sneakers.ts`/`more-apparel.ts` (9 sneakers, 4 hoodies/tees, Gucci cap), `outerwear.ts` (Canada Goose, Burberry, Moncler). Built from published third-party legit-check guides (LegitGrails, FASHIONPHILE, LegitApp, Libas Collective, Collector's Cage) read Nov 2026; no reference photos, so steps are screened for warning signs like the TNF daypack. "(objective)" only marks photo-verifiable facts; contradictory guide claims (e.g. buckle shine) are left out. Sneaker box label vs size tag and Burberry care label vs size tag are cross-checked in `rules.ts`.
- Reference/demo images: `artifacts/listing-check/public/references/<model>/`, `public/demo/`
- Decision rules: `artifacts/api-server/src/lib/rules.ts`; vision prompt/schema: `lib/vision.ts`; TTS: `lib/voice.ts`
- Demo cases (pre-recorded observations): `artifacts/api-server/src/config/demoCases.ts`
- Voice prompt whitelist (same text shown on screen): `artifacts/api-server/src/config/voicePrompts.ts`

## Architecture decisions

- Vision model only observes; outcome is decided by backend rules (retake > manual review > pass).
- Best effort: the vision model marks an imperfect photo usable whenever the feature can still be inspected. Results (findings + evidence score) are returned even when some photos still need a retake; missing photos only block passing.
- Evidence score (`evidenceScore` in `rules.ts`): research-weighted likelihood ratios from 50% neutral odds (clean text step ×1.6, clean visual step ×1.25, soft sign ×0.75, clear sign ×0.12, code/label mismatch ×0.2–0.25, code match ×1.15), capped 5–95%, pulled toward 50% when few required photos are usable, with low/medium/high confidence. Not trained on outcome data; tune the `LR` table once reviewed outcomes exist. Scores under 50% (medium/high confidence) go to manual review.
- Speed: reasoning effort is low/minimal per step, reference images are cached, client photos are 1280px, and uploads run in the background (`listing-check/src/lib/uploads.ts`) so sellers keep shooting while earlier photos are analyzed.
- Publishing gate is server-side: `/checks/:id/publish` 409s unless status and recorded decision are "passed"; any new evidence resets the decision.
- Checks carry `mode` live|demo; demo checks never count in live stats/lists and their publish is labeled mock demo.
- Live model checks never pass against DEMO references or sample codes. Model requests without a live profile use their category checklist. Category/basic completion is explicitly not model verification.
- Live photo bytes are not stored; only observations. The client keeps its own previews.
- TTS only synthesizes whitelisted prompt ids (no arbitrary text), cached in memory.

## Product

- Home with EUIPO 2022 statistic, "Start a listing check" and "Try a demo"
- Seller flow: category + searchable model list + condition + price → one "what does your item have?" screen → photo steps (skippable; "what we check" folded away) → review (waits for background analysis) → result with evidence score, confidence, coverage and top factors
- Demo: no-upload cases (pass+mock publish, blurry tag retake, style-code mismatch review, basic screening, sneakers category check, sneakers label mismatch)
- Warning signs: each category step has brand-agnostic `comparisonFocus` warning signs (stitching, logo/font, tag print, hardware, embroidery, holograms) in `config/profiles/categories.ts`. The vision model returns `warningSigns` tagged objective/subjective. Objective signs → manual review; subjective signs are shown to the reviewer but never block. Sneakers also cross-check box label vs size tag (US size + labeled style code) in `rules.ts`.

## Gotchas

- The sample outerwear profile uses DEMO reference images and sample codes; it is excluded from live model verification. Live model checks require sourced references and an enabled profile.

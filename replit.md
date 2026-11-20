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
- Demo: three no-upload cases (pass+mock publish, blurry tag retake, style-code mismatch review)

## Gotchas

- The sample outerwear profile uses DEMO reference images and sample codes; it is excluded from live model verification. Live model checks require sourced references and an enabled profile.

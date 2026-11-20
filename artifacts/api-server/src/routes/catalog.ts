import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { checksTable, db } from "@workspace/db";
import {
  GetProfileParams,
  GetStatsSummaryResponse,
  GetVoiceStatusResponse,
  ListDemoCasesResponse,
  ListProfilesResponse,
  ListVoicePromptsResponse,
  ListCategoriesResponse,
  ResolveScreeningTierQueryParams,
  ResolveScreeningTierResponse,
  RunDemoCaseParams,
} from "@workspace/api-zod";
import { CATEGORIES, PROFILES, getProfileById, resolveTier } from "../config/profiles";
import { DEMO_CASES, getDemoCase } from "../config/demoCases";
import { VOICE_PROMPTS } from "../config/voicePrompts";
import { evaluateAndRecord, upsertPhoto } from "../lib/checks";
import { synthesize, voiceAvailable, VoiceUnavailableError } from "../lib/voice";
import { visionConfigured } from "../lib/vision";

const router: IRouter = Router();

router.get("/profiles", (_req, res) => {
  // Public profile discovery only exposes models that are ready for real checks.
  // Demo-only profiles stay available to their sample cases, not live setup.
  res.json(ListProfilesResponse.parse(PROFILES.filter(
    (profile) => profile.kind !== "model" || (profile.liveEnabled && profile.referenceStatus === "documented"),
  )));
});

router.get("/profiles/:profileId", (req, res) => {
  const { profileId } = GetProfileParams.parse(req.params);
  const profile = getProfileById(profileId);
  if (!profile) {
    res.status(404).json({ error: "Profile not found." });
    return;
  }
  // Keep the existing outerwear demo intact without presenting a specific
  // brand as the focus of Fakeless in public demo screens or API payloads.
  if (profile.kind === "model" && profile.referenceStatus === "demo") {
    res.json({
      ...profile,
      brand: "Sample",
      model: "Outerwear example",
      generation: "Illustrative demo set",
      colorway: null,
      category: "Outerwear",
      referenceNote: "Illustrative sample references and codes, used only in demo cases.",
      sources: [],
    });
    return;
  }
  res.json(profile);
});

router.get("/categories", (_req, res) => {
  res.json(ListCategoriesResponse.parse(CATEGORIES));
});

router.get("/screening-tier", (req, res) => {
  const parsed = ResolveScreeningTierQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "categoryId is required." });
    return;
  }
  res.json(ResolveScreeningTierResponse.parse(resolveTier(parsed.data.categoryId, parsed.data.profileId)));
});

router.get("/demo-cases", (_req, res) => {
  res.json(
    ListDemoCasesResponse.parse(
      DEMO_CASES.map(({ id, title, description, expectedOutcome, tier, profileId }) => ({
        id,
        title,
        description,
        expectedOutcome,
        tier,
        profileId,
      })),
    ),
  );
});

router.post("/demo-cases/:caseId/run", async (req, res) => {
  const { caseId } = RunDemoCaseParams.parse(req.params);
  const demo = getDemoCase(caseId);
  if (!demo) {
    res.status(404).json({ error: "Demo case not found." });
    return;
  }
  const id = randomUUID();
  await db.insert(checksTable).values({
    id,
    mode: "demo",
    demoCaseId: demo.id,
    tier: demo.tier,
    tierNote: demo.tierNote,
    categoryId: demo.categoryId,
    profileId: demo.profileId,
    condition: demo.condition,
    askingPrice: demo.askingPrice,
    currency: "USD",
    presence: demo.presence,
  });
  for (const [stepId, photo] of Object.entries(demo.photos)) {
    if (photo) await upsertPhoto(id, stepId, photo.observation, photo.imageUrl);
  }
  res.json(await evaluateAndRecord(id));
});

router.get("/voice/status", (_req, res) => {
  res.json(
    GetVoiceStatusResponse.parse({ available: voiceAvailable(), provider: "ElevenLabs" }),
  );
});

router.get("/voice/prompts", (_req, res) => {
  res.json(
    ListVoicePromptsResponse.parse(
      Object.entries(VOICE_PROMPTS).map(([id, text]) => ({ id, text })),
    ),
  );
});

router.get("/voice/prompts/:promptId/audio", async (req, res) => {
  const promptId = String(req.params.promptId);
  const text = VOICE_PROMPTS[promptId];
  if (!text) {
    res.status(404).json({ error: "Unknown prompt." });
    return;
  }
  try {
    const audio = await synthesize(promptId, text);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(audio);
  } catch (err) {
    if (err instanceof VoiceUnavailableError) {
      res.status(503).json({ error: err.message });
      return;
    }
    throw err;
  }
});

router.get("/stats/summary", async (_req, res) => {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      passed: sql<number>`count(*) filter (where ${checksTable.status} = 'passed')::int`,
      photoCheckComplete: sql<number>`count(*) filter (where ${checksTable.status} = 'photo_check_complete')::int`,
      retakeRequested: sql<number>`count(*) filter (where ${checksTable.status} = 'retake_requested')::int`,
      manualReview: sql<number>`count(*) filter (where ${checksTable.status} = 'manual_review')::int`,
      inProgress: sql<number>`count(*) filter (where ${checksTable.status} = 'in_progress')::int`,
      published: sql<number>`count(*) filter (where ${checksTable.publishedAt} is not null)::int`,
    })
    .from(checksTable)
    .where(eq(checksTable.mode, "live"));
  res.json(GetStatsSummaryResponse.parse({ ...row, visionConfigured: visionConfigured() }));
});

export default router;

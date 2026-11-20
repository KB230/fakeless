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
  RunDemoCaseParams,
  type StepId,
} from "@workspace/api-zod";
import { PROFILES, getProfileById } from "../config/profiles";
import { DEMO_CASES, getDemoCase } from "../config/demoCases";
import { VOICE_PROMPTS } from "../config/voicePrompts";
import { evaluateAndRecord, upsertPhoto } from "../lib/checks";
import { synthesize, voiceAvailable, VoiceUnavailableError } from "../lib/voice";
import { visionConfigured } from "../lib/vision";

const router: IRouter = Router();

router.get("/profiles", (_req, res) => {
  res.json(ListProfilesResponse.parse(PROFILES));
});

router.get("/profiles/:profileId", (req, res) => {
  const { profileId } = GetProfileParams.parse(req.params);
  const profile = getProfileById(profileId);
  if (!profile) {
    res.status(404).json({ error: "Profile not found." });
    return;
  }
  res.json(profile);
});

router.get("/demo-cases", (_req, res) => {
  res.json(
    ListDemoCasesResponse.parse(
      DEMO_CASES.map(({ id, title, description, expectedOutcome, profileId }) => ({
        id,
        title,
        description,
        expectedOutcome,
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
    profileId: demo.profileId,
    condition: demo.condition,
    askingPrice: demo.askingPrice,
    currency: "USD",
    washTagPresent: demo.washTagPresent,
  });
  for (const [stepId, photo] of Object.entries(demo.photos)) {
    if (photo) await upsertPhoto(id, stepId as StepId, photo.observation, photo.imageUrl);
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

import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, desc, eq, isNull } from "drizzle-orm";
import { checksTable, db } from "@workspace/db";
import {
  CreateCheckBody,
  EvaluateCheckParams,
  GetCheckParams,
  ListChecksQueryParams,
  ListChecksResponse,
  PublishListingParams,
  PublishListingResponse,
  SetWashTagPresenceBody,
  SetWashTagPresenceParams,
  UploadCheckPhotoBody,
  UploadCheckPhotoParams,
  UploadCheckPhotoResponse,
} from "@workspace/api-zod";
import { getProfileById, profileDisplayName } from "../config/profiles";
import {
  evaluateAndRecord,
  loadCheck,
  resetDecision,
  serializeCheck,
  upsertPhoto,
} from "../lib/checks";
import {
  analyzePhoto,
  VisionFailedError,
  VisionNotConfiguredError,
} from "../lib/vision";

const router: IRouter = Router();

router.get("/checks", async (req, res) => {
  const q = ListChecksQueryParams.parse(req.query);
  const rows = await db
    .select()
    .from(checksTable)
    .where(eq(checksTable.mode, "live"))
    .orderBy(desc(checksTable.createdAt))
    .limit(q.limit ?? 10);
  res.json(
    ListChecksResponse.parse(
      rows.map((r) => {
        const p = getProfileById(r.profileId);
        return {
          id: r.id,
          profileId: r.profileId,
          profileName: p ? profileDisplayName(p) : r.profileId,
          status: r.status,
          askingPrice: r.askingPrice,
          currency: r.currency,
          createdAt: r.createdAt,
          publishedAt: r.publishedAt,
        };
      }),
    ),
  );
});

router.post("/checks", async (req, res) => {
  const parsed = CreateCheckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid check details." });
    return;
  }
  const body = parsed.data;
  if (!getProfileById(body.profileId)) {
    res.status(400).json({ error: "Unknown product profile." });
    return;
  }
  const [row] = await db
    .insert(checksTable)
    .values({
      id: randomUUID(),
      mode: "live",
      profileId: body.profileId,
      condition: body.condition,
      askingPrice: body.askingPrice,
      currency: body.currency ?? "USD",
    })
    .returning();
  res.status(201).json(serializeCheck(row!, []));
});

router.get("/checks/:checkId", async (req, res) => {
  const { checkId } = GetCheckParams.parse(req.params);
  const loaded = await loadCheck(checkId);
  if (!loaded) {
    res.status(404).json({ error: "Check not found." });
    return;
  }
  res.json(serializeCheck(loaded.check, loaded.photos));
});

router.post("/checks/:checkId/photos", async (req, res) => {
  const { checkId } = UploadCheckPhotoParams.parse(req.params);
  const parsed = UploadCheckPhotoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid photo upload." });
    return;
  }
  const { stepId, imageDataUrl } = parsed.data;
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(imageDataUrl)) {
    res.status(400).json({ error: "Photo must be a JPEG, PNG or WebP image." });
    return;
  }
  const loaded = await loadCheck(checkId);
  if (!loaded) {
    res.status(404).json({ error: "Check not found." });
    return;
  }
  if (loaded.check.mode !== "live") {
    res.status(400).json({ error: "Demo checks don't accept uploads." });
    return;
  }
  if (loaded.check.publishedAt) {
    res.status(409).json({ error: "This listing is already published." });
    return;
  }
  const profile = getProfileById(loaded.check.profileId)!;
  const step = profile.steps.find((s) => s.id === stepId);
  if (!step) {
    res.status(400).json({ error: "This step doesn't apply to the selected profile." });
    return;
  }

  try {
    const observation = await analyzePhoto(profile, step, imageDataUrl);
    const row = await upsertPhoto(checkId, stepId, observation, null);
    await resetDecision(checkId);
    res.json(
      UploadCheckPhotoResponse.parse({
        id: row.id,
        stepId: row.stepId,
        imageUrl: null,
        observation: row.observation,
        createdAt: row.createdAt,
      }),
    );
  } catch (err) {
    if (err instanceof VisionNotConfiguredError || err instanceof VisionFailedError) {
      res.status(503).json({ error: err.message });
      return;
    }
    throw err;
  }
});

router.put("/checks/:checkId/wash-tag", async (req, res) => {
  const { checkId } = SetWashTagPresenceParams.parse(req.params);
  const { present } = SetWashTagPresenceBody.parse(req.body);
  const loaded = await loadCheck(checkId);
  if (!loaded) {
    res.status(404).json({ error: "Check not found." });
    return;
  }
  if (loaded.check.mode !== "live" || loaded.check.publishedAt) {
    res.status(409).json({ error: "This check can't be changed." });
    return;
  }
  const [row] = await db
    .update(checksTable)
    .set({ washTagPresent: present, status: "in_progress", decision: null })
    .where(eq(checksTable.id, checkId))
    .returning();
  res.json(serializeCheck(row!, loaded.photos));
});

router.post("/checks/:checkId/evaluate", async (req, res) => {
  const { checkId } = EvaluateCheckParams.parse(req.params);
  const loaded = await loadCheck(checkId);
  if (!loaded) {
    res.status(404).json({ error: "Check not found." });
    return;
  }
  if (loaded.check.publishedAt) {
    res.json(serializeCheck(loaded.check, loaded.photos));
    return;
  }
  res.json(await evaluateAndRecord(checkId));
});

/**
 * Server-side publishing gate: only a check whose backend-recorded decision is
 * "passed" can be (mock) published. The atomic conditional update prevents
 * publishing a check whose evidence changed after the pass.
 */
router.post("/checks/:checkId/publish", async (req, res) => {
  const { checkId } = PublishListingParams.parse(req.params);
  const loaded = await loadCheck(checkId);
  if (!loaded) {
    res.status(404).json({ error: "Check not found." });
    return;
  }
  const { check } = loaded;
  if (check.publishedAt && check.listingId) {
    res.json(
      PublishListingResponse.parse({
        checkId,
        listingId: check.listingId,
        publishedAt: check.publishedAt,
        mode: check.mode,
        message: publishMessage(check.mode),
      }),
    );
    return;
  }
  const decisionOutcome = (check.decision as { outcome?: string } | null)?.outcome;
  if (check.status !== "passed" || decisionOutcome !== "passed") {
    req.log.warn({ checkId, status: check.status }, "Publish blocked: no recorded pass");
    res.status(409).json({
      error:
        "Publishing is blocked: this listing doesn't have a recorded \"Passed listing checks\" result.",
    });
    return;
  }
  const listingId = `${check.mode === "demo" ? "DEMO" : "LST"}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const [row] = await db
    .update(checksTable)
    .set({ publishedAt: new Date(), listingId })
    .where(
      and(
        eq(checksTable.id, checkId),
        eq(checksTable.status, "passed"),
        isNull(checksTable.publishedAt),
      ),
    )
    .returning();
  if (!row) {
    res.status(409).json({ error: "Publishing is blocked: the check changed. Run the listing check again." });
    return;
  }
  res.json(
    PublishListingResponse.parse({
      checkId,
      listingId: row.listingId,
      publishedAt: row.publishedAt,
      mode: row.mode,
      message: publishMessage(row.mode),
    }),
  );
});

function publishMessage(mode: string): string {
  return mode === "demo"
    ? "Demo listing published (mock). Nothing was posted to a real marketplace."
    : "Listing published (mock). In a marketplace integration this is where the listing would go live.";
}

export default router;

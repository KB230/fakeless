/**
 * Photo evaluation harness: runs the real vision analysis and decision rules
 * (no database, no web app) on folders of labeled photos, and reports how
 * genuine and fake sets score, which warning signs fired, and how long each
 * photo took.
 *
 * Layout:  $TEST_DIR/<profile-id>/<step-id>__real.jpg and <step-id>__fake.jpg
 *          (either label may be missing; steps without a photo count as missing)
 *
 * Run from artifacts/api-server (needs OPENAI_API_KEY in the repo's .env):
 *   TEST_DIR=/path/to/photos pnpm run eval:photos
 * Optional env: ONLY=lv-speedy,dior-saddle  CONCURRENCY=6  OUT=/path/results.json
 *               OPENAI_REASONING_EFFORT, VISION_VOTES (see src/lib/vision.ts)
 *
 * Keep test photos out of the repo: guide and marketplace photos are
 * copyrighted, and real seller photos are private.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { PhotoObservation } from "@workspace/api-zod";
import { getProfileById } from "../src/config/profiles";
import { decide } from "../src/lib/rules";
import { analyzePhoto } from "../src/lib/vision";

const ROOT = process.env["TEST_DIR"];
if (!ROOT) {
  console.error("Set TEST_DIR to a folder of <profile-id>/<step-id>__real.jpg and __fake.jpg photos.");
  process.exit(1);
}
const ONLY = process.env["ONLY"]?.split(",");
const CONCURRENCY = Number(process.env["CONCURRENCY"] ?? 6);
const OUT = process.env["OUT"] ?? path.join(ROOT, "results.json");

async function pool<T>(tasks: (() => Promise<T>)[], n: number): Promise<T[]> {
  const out: T[] = [];
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < tasks.length) {
      const k = i++;
      out[k] = await tasks[k]!();
    }
  }));
  return out;
}

type PhotoResult = { step: string; ms: number; error?: string; obs?: PhotoObservation };
const results: Record<string, unknown>[] = [];
const items = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && (!ONLY || ONLY.includes(d.name)))
  .map((d) => d.name)
  .sort();

for (const id of items) {
  const profile = getProfileById(id);
  if (!profile) {
    console.log(`skip ${id}: no profile with that id`);
    continue;
  }
  for (const label of ["real", "fake"] as const) {
    const files = readdirSync(path.join(ROOT, id)).filter((f) => f.endsWith(`__${label}.jpg`));
    if (files.length === 0) continue;
    const steps = files.map((f) => f.split("__")[0]!).filter((s) => profile.steps.some((x) => x.id === s));
    const presence: Record<string, boolean> = {};
    for (const q of profile.presenceQuestions) {
      const used = profile.steps.some((s) => s.presenceQuestionId === q.id && steps.includes(s.id));
      presence[q.id] = used ? true : q.expected;
    }
    const t0 = Date.now();
    const photos = await pool(steps.map((stepId) => async (): Promise<PhotoResult> => {
      const step = profile.steps.find((s) => s.id === stepId)!;
      const data = readFileSync(path.join(ROOT, id, `${stepId}__${label}.jpg`)).toString("base64");
      const t = Date.now();
      try {
        const obs = await analyzePhoto(profile, step, `data:image/jpeg;base64,${data}`);
        return { step: stepId, ms: Date.now() - t, obs };
      } catch (e) {
        return { step: stepId, ms: Date.now() - t, error: (e as Error).message };
      }
    }), CONCURRENCY);
    const wall = Date.now() - t0;
    const observations: Record<string, PhotoObservation> = {};
    for (const p of photos) if (p.obs) observations[p.step] = p.obs;
    const d = decide({ profile, tier: "model_specific", mode: "live", presence, observations });
    const signs = photos.flatMap((p) => (p.obs?.warningSigns ?? []).map((w) => `${p.step}:${w.kind === "objective" ? "CLEAR" : "soft"}:${w.indicator}`));
    const unusable = photos.filter((p) => p.obs && !p.obs.quality.usable).map((p) => `${p.step}(${p.obs!.quality.issues.join("/")})`);
    const errors = photos.filter((p) => p.error).map((p) => `${p.step}: ${p.error}`);
    const ms = photos.map((p) => p.ms);
    const sec = (n: number) => `${Math.round(n / 100) / 10}s`;
    console.log(
      `${id.padEnd(24)} ${label.padEnd(4)} outcome=${d.outcome.padEnd(16)} score=${String(d.evidence?.percent ?? "-").padStart(3)}% ` +
      `conf=${d.evidence?.confidence ?? "-"} photos=${photos.length} avg=${sec(ms.reduce((a, b) => a + b, 0) / ms.length)} ` +
      `max=${sec(Math.max(...ms))} wall=${sec(wall)} clear=${signs.filter((s) => s.includes(":CLEAR:")).length} soft=${signs.filter((s) => s.includes(":soft:")).length}` +
      (unusable.length ? ` unusable=${unusable.join(",")}` : "") +
      (errors.length ? ` ERR=${errors.join(" | ")}` : ""),
    );
    results.push({
      id, label, outcome: d.outcome, evidence: d.evidence, reasons: d.reasons, signs, unusable, errors, wall,
      photos: photos.map((p) => ({ step: p.step, ms: p.ms, summary: p.obs?.summary, text: p.obs?.extractedText, quality: p.obs?.quality, signs: p.obs?.warningSigns })),
    });
  }
}

const prev = existsSync(OUT) ? (JSON.parse(readFileSync(OUT, "utf8")) as { id: string }[]) : [];
writeFileSync(OUT, JSON.stringify([...prev.filter((r) => !items.includes(r.id)), ...results], null, 2));
console.log(`saved ${OUT}`);

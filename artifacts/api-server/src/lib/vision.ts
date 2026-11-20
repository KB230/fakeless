import OpenAI from "openai";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  InspectionStep,
  PhotoObservation,
  ProductProfile,
} from "@workspace/api-zod";
import { logger } from "./logger";

export class VisionNotConfiguredError extends Error {
  constructor() {
    super(
      "Live photo analysis isn't configured yet. An OpenAI API key needs to be added to the app's secrets. The demo still works.",
    );
  }
}

export class VisionFailedError extends Error {}

const MODEL = process.env["OPENAI_VISION_MODEL"] ?? "gpt-5";

let client: OpenAI | null = null;
export function visionConfigured(): boolean {
  return !!process.env["OPENAI_API_KEY"];
}
function getClient(): OpenAI {
  if (!visionConfigured()) throw new VisionNotConfiguredError();
  client ??= new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });
  return client;
}

// Reference photos live in the web app's public folder.
const PUBLIC_DIR_CANDIDATES = [
  path.resolve(process.cwd(), "../listing-check/public"),
  path.resolve(process.cwd(), "artifacts/listing-check/public"),
  path.resolve(process.cwd(), "../listing-check/dist/public"),
];

async function loadReferenceDataUrl(rel: string): Promise<string | null> {
  for (const dir of PUBLIC_DIR_CANDIDATES) {
    try {
      const buf = await readFile(path.join(dir, rel));
      const ext = path.extname(rel).toLowerCase();
      const mime = ext === ".png" ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      // try next
    }
  }
  return null;
}

const OBSERVATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "quality",
    "extractedText",
    "codes",
    "visibleDetails",
    "differences",
    "comparisonReliable",
    "uncertaintyNote",
    "summary",
  ],
  properties: {
    quality: {
      type: "object",
      additionalProperties: false,
      required: ["usable", "issues", "note"],
      properties: {
        usable: { type: "boolean" },
        issues: {
          type: "array",
          items: {
            type: "string",
            enum: ["blurry", "cropped", "bad_angle", "too_dark", "glare", "wrong_subject", "too_far"],
          },
        },
        note: { type: "string" },
      },
    },
    extractedText: { type: "string" },
    codes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["value", "codeType", "purposeIdentified", "confidence"],
        properties: {
          value: { type: "string" },
          codeType: {
            type: "string",
            enum: ["style_code", "model_number", "rn_number", "ca_number", "date_code", "unknown"],
          },
          purposeIdentified: { type: "boolean" },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
    },
    visibleDetails: { type: "array", items: { type: "string" } },
    differences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["feature", "description", "severity"],
        properties: {
          feature: { type: "string" },
          description: { type: "string" },
          severity: { type: "string", enum: ["minor", "meaningful"] },
        },
      },
    },
    comparisonReliable: { type: "boolean" },
    uncertaintyNote: { type: ["string", "null"] },
    summary: { type: "string" },
  },
} as const;

function buildInstructions(profile: ProductProfile, step: InspectionStep, hasReference: boolean): string {
  const isTag = step.id === "wash_tag_front" || step.id === "wash_tag_back";
  return [
    "You are a careful visual inspector assisting a resale marketplace. You report only what is visible. You never declare an item authentic or counterfeit; you return structured observations and the platform's rules decide the outcome.",
    `Product profile: ${profile.brand} ${profile.model} — ${profile.generation}${profile.colorway ? `, colorway: ${profile.colorway}` : ""}.`,
    `Inspection step: ${step.title}. What the seller was asked to capture: ${step.instruction}`,
    `Details to compare: ${step.comparisonFocus.join("; ")}.`,
    hasReference
      ? "The FIRST image is the seller's photo. The images after it are reference photos for this step. Compare the seller's photo to the references only where the angle and quality allow."
      : "Only the seller's photo is provided; no reference image is available for comparison, so set comparisonReliable to false and explain in uncertaintyNote.",
    "Photo quality: set quality.usable=false if the required subject is blurry, cropped/partly out of frame, too far away, at an unusable angle, too dark, obscured by glare, or not the requested subject. List every issue. Be strict for text: if any printed characters needed for a code are not legible, mark blurry or cropped.",
    isTag
      ? "Text: transcribe ALL printed text verbatim into extractedText, line by line. For each alphanumeric code, add an entry in codes. Set purposeIdentified=true ONLY when a printed label or unambiguous context identifies what the code is (e.g. 'STYLE', 'STYLE NO', 'MODEL', 'RN', 'CA'). Use codeType 'unknown' and purposeIdentified=false when you cannot tell what a code is. Do not guess."
      : "Text: transcribe any visible lettering verbatim into extractedText (empty string if none). Leave codes empty unless a code is printed.",
    "Differences: list visible differences from the reference. severity 'meaningful' only for clear construction, lettering, spacing, logo application or hardware differences that are visible in a clear photo; 'minor' for small variation plausibly caused by lighting, angle or wear. Do not invent differences you cannot see.",
    "comparisonReliable: true only if the seller photo and reference show the same feature from a comparable angle at enough detail for a fair comparison. Otherwise false, with a short uncertaintyNote explaining why.",
    "summary: one or two plain sentences for the seller.",
  ].join("\n");
}

export async function analyzePhoto(
  profile: ProductProfile,
  step: InspectionStep,
  imageDataUrl: string,
): Promise<PhotoObservation> {
  const openai = getClient();
  const refUrls = (
    await Promise.all(step.references.map((r) => loadReferenceDataUrl(r.imageUrl)))
  ).filter((u): u is string => !!u);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: buildInstructions(profile, step, refUrls.length > 0) },
        {
          role: "user",
          content: [
            { type: "text", text: "Seller photo:" },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
            ...(refUrls.length > 0
              ? [
                  { type: "text" as const, text: "Reference photo(s):" },
                  ...refUrls.map((url) => ({
                    type: "image_url" as const,
                    image_url: { url, detail: "high" as const },
                  })),
                ]
              : []),
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "photo_observation", strict: true, schema: OBSERVATION_SCHEMA },
      },
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new VisionFailedError("The vision model returned no observations.");
    return JSON.parse(content) as PhotoObservation;
  } catch (err) {
    if (err instanceof VisionFailedError) throw err;
    logger.error({ err }, "Vision analysis failed");
    const status = (err as { status?: number }).status;
    if (status === 401) {
      throw new VisionFailedError("Photo analysis key was rejected. Check the OpenAI API key in the app's secrets.");
    }
    throw new VisionFailedError("Photo analysis is temporarily unavailable. Please try again.");
  }
}

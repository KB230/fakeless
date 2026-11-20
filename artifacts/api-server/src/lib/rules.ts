import type {
  CheckDecision,
  CheckMode,
  DecisionReason,
  PhotoObservation,
  PhotoQualityIssue,
  ProductProfile,
  RetakeRequest,
  ScreeningTier,
  StepSummary,
  WashTagComparison,
  WarningSign,
  EvidenceScore,
} from "@workspace/api-zod";
import { retakeMessage, retakeVoicePromptId, type RetakeKind } from "../config/voicePrompts";
import { AF1_STYLE_CODE_PATTERN } from "../config/profiles/nike-af1-07-white";

/**
 * Documented style-code formats per model profile. A code that matches the
 * format on that profile's tag counts as a style code even when the tag
 * doesn't print a "STYLE" label (Nike size tags don't).
 */
const STYLE_CODE_PATTERNS: Record<string, RegExp> = {
  "nike-af1-07-white": AF1_STYLE_CODE_PATTERN,
};

function withDocumentedCodeTypes(profile: ProductProfile, obs: PhotoObservation): PhotoObservation {
  const pattern = STYLE_CODE_PATTERNS[profile.id];
  if (!pattern) return obs;
  return {
    ...obs,
    codes: obs.codes.map((c) =>
      pattern.test(c.value.trim().toUpperCase().replace(/\s+/g, ""))
        ? { ...c, codeType: "style_code" as const, purposeIdentified: true }
        : c,
    ),
  };
}

export const DISCLAIMER =
  "This result screens the photos you supplied for visible discrepancies. It is not an authentication, and the marketplace can still request a human review.";

export const PHOTO_CHECK_HEADLINE = "Photo check complete · Model verification unavailable";

/** Outcomes after which the (mock) listing may be published. */
export const PUBLISHABLE_OUTCOMES = new Set(["passed", "photo_check_complete"]);

const COMPARABLE_CODE_TYPES = new Set(["style_code", "model_number"]);

export interface RulesInput {
  profile: ProductProfile;
  tier: ScreeningTier;
  mode: CheckMode;
  presence: Record<string, boolean>;
  observations: Partial<Record<string, PhotoObservation>>;
}

function issueToKind(issues: PhotoQualityIssue[]): RetakeKind {
  if (issues.includes("blurry")) return "blurry";
  if (issues.includes("cropped") || issues.includes("too_far")) return "cropped";
  return "angle";
}

const ISSUE_LABEL: Record<PhotoQualityIssue, string> = {
  blurry: "blurry",
  cropped: "cropped",
  bad_angle: "unusable angle",
  too_dark: "too dark",
  glare: "glare",
  wrong_subject: "wrong subject",
  too_far: "too far away",
};

const normalizeCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");

/**
 * Backend decision rules. The vision model only supplies observations; the
 * outcome is decided here, with the same rules for every tier.
 *
 * Order: any missing/unusable required photo -> retake_requested;
 * otherwise any review reason -> manual_review;
 * otherwise passed (model-specific) or photo_check_complete (category/basic).
 *
 * Model comparison (visible differences, code matching) only happens in the
 * model-specific tier. Category and basic tiers rely only on photo usability,
 * visible text, and presence of expected details.
 */
export function decide(inputArg: RulesInput): CheckDecision {
  let input = inputArg;
  const { profile, tier, mode, presence } = input;
  const observations: RulesInput["observations"] = Object.fromEntries(
    Object.entries(input.observations).map(([k, o]) => [k, o ? withDocumentedCodeTypes(profile, o) : o]),
  );
  input = { ...input, observations };
  const modelTier = tier === "model_specific";
  const reasons: DecisionReason[] = [];
  const retakes: RetakeRequest[] = [];
  const steps: StepSummary[] = [];

  // Live checks can never pass on demo references or sample codes.
  if (modelTier && mode === "live" && profile.referenceStatus !== "documented") {
    reasons.push({
      code: "reference_insufficient",
      stepId: null,
      message:
        "This product profile only has demo reference photos and sample codes, so the photos can't be confirmed against documented references for this release.",
    });
  }

  // Expected details the seller reported absent -> manual review.
  for (const q of profile.presenceQuestions) {
    if (presence[q.id] === false && q.expected) {
      const firstStep = profile.steps.find((s) => s.presenceQuestionId === q.id);
      reasons.push({
        code: "tag_absent",
        stepId: firstStep?.id ?? null,
        message: `The seller answered No to "${q.question}" Items like this normally have it, so a person should look before it goes live.`,
      });
    }
  }

  for (const step of profile.steps) {
    const question = step.presenceQuestionId
      ? profile.presenceQuestions.find((q) => q.id === step.presenceQuestionId)
      : undefined;
    if (question && presence[question.id] === false) {
      steps.push({
        stepId: step.id,
        status: question.expected ? "review" : "skipped",
        note: question.expected
          ? "Seller reported this detail is missing; it is normally present."
          : "Seller reported this detail is absent; not required.",
      });
      continue;
    }

    const obs = observations[step.id];
    if (!obs) {
      if (step.required) {
        retakes.push({
          stepId: step.id,
          issue: "missing",
          message: retakeMessage(profile.id, step.id, "missing"),
          voicePromptId: retakeVoicePromptId(profile.id, step.id, "missing"),
        });
        reasons.push({ code: "missing_photo", stepId: step.id, message: `${step.title}: photo missing.` });
        steps.push({ stepId: step.id, status: "missing", note: "No photo yet." });
      } else {
        steps.push({ stepId: step.id, status: "skipped", note: "Optional step skipped." });
      }
      continue;
    }

    if (!obs.quality.usable) {
      const kind = issueToKind(obs.quality.issues);
      const issueText = obs.quality.issues.map((i) => ISSUE_LABEL[i]).join(", ") || "unusable";
      retakes.push({
        stepId: step.id,
        issue: issueText,
        message: retakeMessage(profile.id, step.id, kind),
        voicePromptId: retakeVoicePromptId(profile.id, step.id, kind),
      });
      reasons.push({
        code: "unusable_photo",
        stepId: step.id,
        message: `${step.title}: photo is ${issueText}. ${obs.quality.note}`.trim(),
      });
      steps.push({ stepId: step.id, status: "retake", note: `Retake: ${issueText}.` });
      continue;
    }

    if (!modelTier || (step.references.length === 0 && !step.compareCodes)) {
      steps.push({
        stepId: step.id,
        status: "ok",
        note: step.readsText
          ? obs.extractedText.trim()
            ? "Usable photo; text and codes recorded."
            : "Usable photo; no readable text found."
          : "Usable photo; visible details recorded.",
      });
      continue;
    }

    if (step.compareCodes) {
      // Code comparison is handled across all code steps below.
      steps.push({ stepId: step.id, status: "ok", note: "Readable photo; text extracted." });
      continue;
    }

    const meaningful = obs.differences.filter((d) => d.severity === "meaningful");
    if (meaningful.length > 0) {
      for (const d of meaningful) {
        reasons.push({
          code: "construction_difference",
          stepId: step.id,
          message: `${step.title}: ${d.feature} — ${d.description}`,
        });
      }
      steps.push({ stepId: step.id, status: "review", note: `${meaningful.length} meaningful visible difference(s).` });
      continue;
    }
    if (!obs.comparisonReliable) {
      reasons.push({
        code: "comparison_unreliable",
        stepId: step.id,
        message: `${step.title}: a reliable comparison wasn't possible. ${obs.uncertaintyNote ?? ""}`.trim(),
      });
      steps.push({ stepId: step.id, status: "review", note: obs.uncertaintyNote ?? "Comparison not reliable from this photo." });
      continue;
    }
    steps.push({
      stepId: step.id,
      status: "ok",
      note: obs.differences.length > 0 ? "Only minor differences visible." : "No visible discrepancies against the reference.",
    });
  }

  const washTag = modelTier ? compareCodes(input, retakes, reasons, steps) : null;

  applyWarningSigns(input, reasons, steps);
  crossCheckLabels(input, reasons, steps);
  const evidence = evidenceScore(input, steps);

  let outcome: CheckDecision["outcome"];
  let headline: string;
  if (retakes.length > 0) {
    outcome = "retake_requested";
    headline =
      retakes.length === 1
        ? "Retake requested: one photo needs another try."
        : `Retake requested: ${retakes.length} photos need another try.`;
  } else if (reasons.length > 0) {
    outcome = "manual_review";
    headline = "Manual review: this listing needs a person to look at it before it goes live.";
  } else if (modelTier) {
    outcome = "passed";
    headline = "Passed listing checks: the required evidence supports continuing.";
  } else {
    outcome = "photo_check_complete";
    headline = PHOTO_CHECK_HEADLINE;
  }

  return {
    outcome,
    tier,
    headline,
    // When a retake is pending, only the photo problems are actionable.
    reasons:
      outcome === "retake_requested"
        ? reasons.filter((r) => r.code === "missing_photo" || r.code === "unusable_photo")
        : reasons,
    retakes,
    washTag,
    steps,
    evidence: outcome === "retake_requested" ? null : evidence,
    decidedAt: new Date(),
    disclaimer: DISCLAIMER,
  };
}

/**
 * Evidence score: the share of usable photo checks that showed no warning
 * signs, visible differences or conflicts. It is computed from the checks,
 * not guessed by the model, and it is not a probability of authenticity.
 */
function evidenceScore(input: RulesInput, steps: StepSummary[]): EvidenceScore | null {
  let total = 0;
  let consistent = 0;
  for (const s of steps) {
    const obs = input.observations[s.stepId];
    if (!obs || !obs.quality.usable || s.status === "skipped" || s.status === "missing" || s.status === "retake") continue;
    total++;
    const hasSigns = (s.warningSigns?.length ?? 0) > 0;
    if (s.status === "ok" && !hasSigns) consistent++;
  }
  if (total === 0) return null;
  const percent = Math.round((consistent / total) * 100);
  return {
    consistent,
    total,
    percent,
    label: `${consistent} of ${total} photo checks showed no warning signs. This is the share of checks passed, not a probability that the item is authentic.`,
  };
}

/** Model-specific tier only: compare readable, labeled codes to the profile's expected codes. */
function compareCodes(
  input: RulesInput,
  retakes: RetakeRequest[],
  reasons: DecisionReason[],
  steps: StepSummary[],
): WashTagComparison | null {
  const { profile, mode, presence, observations } = input;
  const codeSteps = profile.steps.filter((s) => s.compareCodes);
  if (codeSteps.length === 0) return null;
  const firstId = codeSteps[0]!.id;
  const expectedCodes = profile.expectedCodes
    .filter((c) => COMPARABLE_CODE_TYPES.has(c.codeType))
    .map((c) => c.code);

  const qid = codeSteps[0]!.presenceQuestionId;
  if (qid && presence[qid] === false) {
    return { observedCode: null, expectedCodes, rawText: null, result: "tag_absent" };
  }

  const tagObs = codeSteps.map((s) => observations[s.id]).filter((o): o is PhotoObservation => !!o);
  const usableTagObs = tagObs.filter((o) => o.quality.usable);
  const rawText = tagObs.map((o) => o.extractedText.trim()).filter(Boolean).join("\n---\n") || null;
  const tagRetake = retakes.some((r) => codeSteps.some((s) => s.id === r.stepId));

  if (tagRetake || usableTagObs.length === 0) {
    return { observedCode: null, expectedCodes, rawText, result: "not_compared" };
  }
  const codes = usableTagObs.flatMap((o) => o.codes);
  const identified = codes.filter((c) => c.purposeIdentified && COMPARABLE_CODE_TYPES.has(c.codeType));
  const unidentified = codes.filter((c) => !c.purposeIdentified || c.codeType === "unknown");
  const codesAreSamples = profile.expectedCodes.length > 0 && profile.expectedCodes.every((c) => c.isSample);

  if (identified.length > 0) {
    const observed = identified[0]!.value;
    if (mode === "live" && (codesAreSamples || expectedCodes.length === 0)) {
      // Never compare a real tag against sample codes.
      return { observedCode: observed, expectedCodes, rawText, result: "not_compared" };
    }
    const expectedNorm = new Set(expectedCodes.map(normalizeCode));
    const matched = identified.find((c) => expectedNorm.has(normalizeCode(c.value)));
    if (matched) return { observedCode: matched.value, expectedCodes, rawText, result: "match" };
    reasons.push({
      code: "code_mismatch",
      stepId: firstId,
      message: `Readable style code "${observed}" does not match the expected code${expectedCodes.length > 1 ? "s" : ""} for this release (${expectedCodes.join(", ")}).`,
    });
    markStep(steps, firstId, "review", "Style code conflicts with the reference.");
    return { observedCode: observed, expectedCodes, rawText, result: "mismatch" };
  }
  if (unidentified.length > 0) {
    reasons.push({
      code: "code_type_uncertain",
      stepId: firstId,
      message: `A code ("${unidentified[0]!.value}") is readable, but what it identifies can't be determined from the tag, so it wasn't compared.`,
    });
    markStep(steps, firstId, "review", "Code purpose unclear.");
    return { observedCode: unidentified[0]!.value, expectedCodes, rawText, result: "uncertain" };
  }
  reasons.push({
    code: "code_not_found",
    stepId: firstId,
    message: "No style or model code could be read on the tag, even though the photos are clear.",
  });
  markStep(steps, firstId, "review", "No style or model code found.");
  return { observedCode: null, expectedCodes, rawText, result: "uncertain" };
}

function markStep(steps: StepSummary[], stepId: string, status: StepSummary["status"], note: string) {
  const s = steps.find((x) => x.stepId === stepId);
  if (s) {
    s.status = status;
    s.note = note;
  }
}

/**
 * Counterfeit warning signs reported by the vision model (or demo
 * observations) for usable photos. Objective signs (a misspelled brand word,
 * a required tag line clearly absent, contradicting printed text) send the
 * listing to manual review. Subjective signs (stitching looks uneven,
 * embroidery looks thin) never block on their own; they are shown to the
 * seller and reviewer as "things to look at". Applies to every tier.
 */
function applyWarningSigns(input: RulesInput, reasons: DecisionReason[], steps: StepSummary[]) {
  const { profile, observations } = input;
  for (const step of profile.steps) {
    const obs = observations[step.id];
    const summary = steps.find((s) => s.stepId === step.id);
    if (!obs || !obs.quality.usable || !summary || summary.status === "retake" || summary.status === "skipped") continue;
    const signs: WarningSign[] = obs.warningSigns ?? [];
    if (signs.length === 0) continue;
    summary.warningSigns = signs;
    const objective = signs.filter((w) => w.kind === "objective");
    for (const w of objective) {
      reasons.push({
        code: "warning_sign",
        stepId: step.id,
        message: `${step.title}: ${w.indicator}. ${w.observed}`,
      });
    }
    if (objective.length > 0) {
      summary.status = "review";
      summary.note = `${objective.length} clear warning sign${objective.length > 1 ? "s" : ""} visible.`;
    } else if (summary.status === "ok") {
      summary.note = `${summary.note} ${signs.length} thing${signs.length > 1 ? "s" : ""} a reviewer may want to look at.`;
    }
  }
}

/**
 * Cross-photo checks: two labels on the same item must agree. Server-side
 * config keyed by profile id; values are compared as strings only when both
 * photos are usable and the value is clearly readable on both.
 */
const LABEL_CROSS_CHECKS: Record<string, { a: string; b: string; label: string }[]> = {
  "category-sneakers": [{ a: "box_label", b: "size_tag", label: "box label and size tag" }],
  "nike-af1-07-white": [{ a: "box_label", b: "size_tag", label: "box label and size tag" }],
};

const US_SIZE = /\bUS\s*(?:M(?:EN'?S)?\s*)?(\d{1,2}(?:\.5)?)\b/i;

function readUsSize(text: string): string | null {
  const m = text.match(US_SIZE);
  return m ? m[1]! : null;
}

function labeledStyleCodes(obs: PhotoObservation): string[] {
  return obs.codes
    .filter((c) => c.purposeIdentified && COMPARABLE_CODE_TYPES.has(c.codeType))
    .map((c) => c.value);
}

function crossCheckLabels(input: RulesInput, reasons: DecisionReason[], steps: StepSummary[]) {
  const { profile, observations, presence } = input;
  for (const cc of LABEL_CROSS_CHECKS[profile.id] ?? []) {
    const stepA = profile.steps.find((s) => s.id === cc.a);
    const stepB = profile.steps.find((s) => s.id === cc.b);
    if (!stepA || !stepB) continue;
    if ((stepA.presenceQuestionId && presence[stepA.presenceQuestionId] === false) ||
        (stepB.presenceQuestionId && presence[stepB.presenceQuestionId] === false)) continue;
    const a = observations[cc.a];
    const b = observations[cc.b];
    if (!a?.quality.usable || !b?.quality.usable) continue;

    const mismatches: string[] = [];
    const sizeA = readUsSize(a.extractedText);
    const sizeB = readUsSize(b.extractedText);
    if (sizeA && sizeB && sizeA !== sizeB) mismatches.push(`size (US ${sizeA} vs US ${sizeB})`);

    const codesA = labeledStyleCodes(a);
    const codesB = labeledStyleCodes(b);
    if (codesA.length > 0 && codesB.length > 0) {
      const normB = new Set(codesB.map(normalizeCode));
      if (!codesA.some((c) => normB.has(normalizeCode(c)))) {
        mismatches.push(`style code ("${codesA[0]}" vs "${codesB[0]}")`);
      }
    }
    if (mismatches.length === 0) continue;

    reasons.push({
      code: "label_mismatch",
      stepId: cc.b,
      message: `The ${cc.label} show a different ${mismatches.join(" and ")}. On a genuine item these normally match.`,
    });
    markStep(steps, cc.a, "review", `Doesn't match the ${stepB.title.toLowerCase()}: ${mismatches.join(", ")}.`);
    markStep(steps, cc.b, "review", `Doesn't match the ${stepA.title.toLowerCase()}: ${mismatches.join(", ")}.`);
  }
}

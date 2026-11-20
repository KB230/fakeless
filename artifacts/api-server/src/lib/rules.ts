import type {
  CheckDecision,
  CheckMode,
  DecisionReason,
  PhotoObservation,
  PhotoQualityIssue,
  ProductProfile,
  RetakeRequest,
  StepId,
  StepSummary,
  WashTagComparison,
} from "@workspace/api-zod";
import {
  retakeMessage,
  retakeVoicePromptId,
  type RetakeKind,
} from "../config/voicePrompts";

export const DISCLAIMER =
  "This result screens the photos you supplied for visible discrepancies. It is not an authentication, and the marketplace can still request a human review.";

const WASH_TAG_STEPS: StepId[] = ["wash_tag_front", "wash_tag_back"];
const COMPARABLE_CODE_TYPES = new Set(["style_code", "model_number"]);

export interface RulesInput {
  profile: ProductProfile;
  mode: CheckMode;
  washTagPresent: boolean | null;
  observations: Partial<Record<StepId, PhotoObservation>>;
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
 * outcome is decided here.
 *
 * Order: any missing/unusable required photo -> retake_requested;
 * otherwise any review reason -> manual_review; otherwise passed.
 */
export function decide(input: RulesInput): CheckDecision {
  const { profile, mode, washTagPresent, observations } = input;
  const reasons: DecisionReason[] = [];
  const retakes: RetakeRequest[] = [];
  const steps: StepSummary[] = [];

  const tagAbsent = washTagPresent === false;
  const usesDemoReferences = profile.referenceStatus === "demo";

  // Live checks can never pass on demo references or sample codes.
  if (mode === "live" && usesDemoReferences) {
    reasons.push({
      code: "reference_insufficient",
      stepId: null,
      message:
        "This product profile only has demo reference photos and sample codes, so the photos can't be confirmed against documented references for this release.",
    });
  }

  for (const step of profile.steps) {
    const isTagStep = WASH_TAG_STEPS.includes(step.id);
    if (isTagStep && tagAbsent) {
      steps.push({
        stepId: step.id,
        status: profile.washTag.expected ? "review" : "skipped",
        note: profile.washTag.expected
          ? "Seller reported no wash tag; this profile expects one."
          : "No wash tag; not required for this profile.",
      });
      continue;
    }
    const required =
      step.required &&
      !(step.id === "wash_tag_back" && !profile.washTag.requireBothSides);

    const obs = observations[step.id];
    if (!obs) {
      if (required) {
        retakes.push({
          stepId: step.id,
          issue: "missing",
          message: retakeMessage(step.id, "missing"),
          voicePromptId: retakeVoicePromptId(step.id, "missing"),
        });
        reasons.push({
          code: "missing_photo",
          stepId: step.id,
          message: `${step.title}: photo missing.`,
        });
        steps.push({ stepId: step.id, status: "missing", note: "No photo yet." });
      } else {
        steps.push({ stepId: step.id, status: "skipped", note: "Optional step skipped." });
      }
      continue;
    }

    if (!obs.quality.usable) {
      const kind = issueToKind(obs.quality.issues);
      const issueText =
        obs.quality.issues.map((i) => ISSUE_LABEL[i]).join(", ") || "unusable";
      retakes.push({
        stepId: step.id,
        issue: issueText,
        message: retakeMessage(step.id, kind),
        voicePromptId: retakeVoicePromptId(step.id, kind),
      });
      reasons.push({
        code: "unusable_photo",
        stepId: step.id,
        message: `${step.title}: photo is ${issueText}. ${obs.quality.note}`.trim(),
      });
      steps.push({ stepId: step.id, status: "retake", note: `Retake: ${issueText}.` });
      continue;
    }

    if (isTagStep) {
      // Wash tag code comparison is handled across both sides below.
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
      steps.push({
        stepId: step.id,
        status: "review",
        note: `${meaningful.length} meaningful visible difference(s).`,
      });
      continue;
    }
    if (!obs.comparisonReliable) {
      reasons.push({
        code: "comparison_unreliable",
        stepId: step.id,
        message: `${step.title}: a reliable comparison wasn't possible. ${obs.uncertaintyNote ?? ""}`.trim(),
      });
      steps.push({
        stepId: step.id,
        status: "review",
        note: obs.uncertaintyNote ?? "Comparison not reliable from this photo.",
      });
      continue;
    }
    steps.push({
      stepId: step.id,
      status: "ok",
      note:
        obs.differences.length > 0
          ? "Only minor differences visible."
          : "No visible discrepancies against the reference.",
    });
  }

  // Wash tag
  let washTag: WashTagComparison | null = null;
  const profileHasTagSteps = profile.steps.some((s) => WASH_TAG_STEPS.includes(s.id));
  const expectedCodes = profile.expectedCodes
    .filter((c) => COMPARABLE_CODE_TYPES.has(c.codeType))
    .map((c) => c.code);

  if (profileHasTagSteps) {
    if (tagAbsent) {
      washTag = { observedCode: null, expectedCodes, rawText: null, result: "tag_absent" };
      if (profile.washTag.expected) {
        reasons.push({
          code: "tag_absent",
          stepId: "wash_tag_front",
          message:
            "The seller reported no inside wash or care tag, but this profile expects one.",
        });
      }
    } else {
      const tagObs = WASH_TAG_STEPS.map((s) => observations[s]).filter(
        (o): o is PhotoObservation => !!o,
      );
      const usableTagObs = tagObs.filter((o) => o.quality.usable);
      const rawText =
        tagObs.map((o) => o.extractedText.trim()).filter(Boolean).join("\n---\n") || null;
      const tagRetake = retakes.some((r) => WASH_TAG_STEPS.includes(r.stepId));

      if (tagRetake || usableTagObs.length === 0) {
        washTag = { observedCode: null, expectedCodes, rawText, result: "not_compared" };
      } else {
        const codes = usableTagObs.flatMap((o) => o.codes);
        const identified = codes.filter(
          (c) => c.purposeIdentified && COMPARABLE_CODE_TYPES.has(c.codeType),
        );
        const unidentified = codes.filter(
          (c) => !c.purposeIdentified || c.codeType === "unknown",
        );
        const codesAreSamples =
          profile.expectedCodes.length > 0 && profile.expectedCodes.every((c) => c.isSample);

        if (identified.length > 0) {
          const observed = identified[0]!.value;
          if (mode === "live" && (codesAreSamples || expectedCodes.length === 0)) {
            // Never compare a real tag against sample codes.
            washTag = { observedCode: observed, expectedCodes, rawText, result: "not_compared" };
          } else {
            const expectedNorm = new Set(expectedCodes.map(normalizeCode));
            const matchedCode = identified.find((c) => expectedNorm.has(normalizeCode(c.value)));
            if (matchedCode) {
              washTag = { observedCode: matchedCode.value, expectedCodes, rawText, result: "match" };
            } else {
              washTag = { observedCode: observed, expectedCodes, rawText, result: "mismatch" };
              reasons.push({
                code: "code_mismatch",
                stepId: "wash_tag_front",
                message: `Readable style code "${observed}" does not match the expected code${expectedCodes.length > 1 ? "s" : ""} for this release (${expectedCodes.join(", ")}).`,
              });
              markStep(steps, "wash_tag_front", "review", "Style code conflicts with the reference.");
            }
          }
        } else if (unidentified.length > 0) {
          washTag = {
            observedCode: unidentified[0]!.value,
            expectedCodes,
            rawText,
            result: "uncertain",
          };
          reasons.push({
            code: "code_type_uncertain",
            stepId: "wash_tag_front",
            message: `A code ("${unidentified[0]!.value}") is readable, but what it identifies can't be determined from the tag, so it wasn't compared.`,
          });
          markStep(steps, "wash_tag_front", "review", "Code purpose unclear.");
        } else {
          washTag = { observedCode: null, expectedCodes, rawText, result: "uncertain" };
          reasons.push({
            code: "code_not_found",
            stepId: "wash_tag_front",
            message: "No style or model code could be read on the wash tag, even though the photos are clear.",
          });
          markStep(steps, "wash_tag_front", "review", "No style or model code found.");
        }
      }
    }
  }

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
  } else {
    outcome = "passed";
    headline = "Passed listing checks: the required evidence supports continuing.";
  }

  return {
    outcome,
    headline,
    // When a retake is pending, only the photo problems are actionable.
    reasons:
      outcome === "retake_requested"
        ? reasons.filter((r) => r.code === "missing_photo" || r.code === "unusable_photo")
        : reasons,
    retakes,
    washTag,
    steps,
    decidedAt: new Date(),
    disclaimer: DISCLAIMER,
  };
}

function markStep(
  steps: StepSummary[],
  stepId: StepId,
  status: StepSummary["status"],
  note: string,
) {
  const s = steps.find((x) => x.stepId === stepId);
  if (s) {
    s.status = status;
    s.note = note;
  }
}

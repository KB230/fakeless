import type { StepId } from "@workspace/api-zod";

/**
 * Every spoken prompt is whitelisted here. The same text is always shown on
 * screen, so the flow stays usable when audio is unavailable. Only these ids
 * can be synthesized (no arbitrary text-to-speech from clients).
 */

export type RetakeKind = "blurry" | "cropped" | "angle" | "missing";

const CAPTURE: Record<StepId, string> = {
  logo: "Lay the jacket flat on a table. Hold your phone parallel to the chest and move in until the full bird logo and the wordmark below it fill the frame, with a little fabric showing on every side.",
  wash_tag_front:
    "Find the care tag inside the jacket. Lay the wash tag flat and move closer until the entire code is in frame, including every printed letter and digit.",
  wash_tag_back:
    "Turn the wash tag over. Lay it flat and capture the back side, making sure every printed letter and digit is in frame and sharp.",
  zipper:
    "Photograph the main front zipper straight on. Include the pull tab and the top of the zipper, in good light, close enough to see any markings.",
  seam_tape:
    "Open the jacket and find the taped seam inside the shoulder. Move close and photograph a straight run of seam tape, in focus and evenly lit.",
};

const STEP_NOUN: Record<StepId, string> = {
  logo: "logo photo",
  wash_tag_front: "front of the wash tag",
  wash_tag_back: "back of the wash tag",
  zipper: "zipper photo",
  seam_tape: "seam tape photo",
};

const RETAKE_HINT: Record<StepId, string> = {
  logo: "Fit the full bird logo and the whole wordmark in frame.",
  wash_tag_front:
    "Lay the wash tag flat and move closer until the entire code is in frame.",
  wash_tag_back:
    "Lay the tag flat and make sure every printed letter and digit is in frame.",
  zipper: "Show the pull tab and the top of the zipper straight on.",
  seam_tape: "Show a straight run of seam tape, close and evenly lit.",
};

function retakeText(step: StepId, kind: RetakeKind): string {
  const noun = STEP_NOUN[step];
  switch (kind) {
    case "blurry":
      return `The ${noun} is blurry. Hold the phone still, tap to focus, and try again. ${RETAKE_HINT[step]}`;
    case "cropped":
      return `Part of the ${noun} is cut off or too far away. ${RETAKE_HINT[step]}`;
    case "angle":
      return `The ${noun} was taken from an angle or in light we can't use. Shoot straight on, avoid glare and shadows, and try again. ${RETAKE_HINT[step]}`;
    case "missing":
      return `We still need the ${noun}. ${RETAKE_HINT[step]}`;
  }
}

const STEPS: StepId[] = [
  "logo",
  "wash_tag_front",
  "wash_tag_back",
  "zipper",
  "seam_tape",
];
const KINDS: RetakeKind[] = ["blurry", "cropped", "angle", "missing"];

export const captureVoicePromptId = (step: StepId) => `capture_${step}`;
export const retakeVoicePromptId = (step: StepId, kind: RetakeKind) =>
  `retake_${step}_${kind}`;

export const VOICE_PROMPTS: Record<string, string> = Object.fromEntries([
  ...STEPS.map((s) => [captureVoicePromptId(s), CAPTURE[s]]),
  ...STEPS.flatMap((s) =>
    KINDS.map((k) => [retakeVoicePromptId(s, k), retakeText(s, k)]),
  ),
]);

export function captureInstruction(step: StepId): string {
  return CAPTURE[step];
}

export function retakeMessage(step: StepId, kind: RetakeKind): string {
  return retakeText(step, kind);
}

import { PROFILES } from "./profiles";
import {
  captureVoicePromptId,
  RETAKE_KINDS,
  retakeText,
  retakeVoicePromptId,
  STEP_DEFS,
  type RetakeKind,
} from "./profiles/define";

/**
 * Every spoken prompt is whitelisted here, built from the profile config.
 * The same text is always shown on screen, so the flow stays usable when audio
 * is unavailable. Only these ids can be synthesized.
 */
export const VOICE_PROMPTS: Record<string, string> = Object.fromEntries(
  PROFILES.flatMap((p) =>
    p.steps.flatMap((s) => {
      const def = STEP_DEFS.get(`${p.id}.${s.id}`)!;
      return [
        [captureVoicePromptId(p.id, s.id), s.instruction],
        ...RETAKE_KINDS.map((k) => [retakeVoicePromptId(p.id, s.id, k), retakeText(def, k)]),
      ];
    }),
  ),
);

export function retakeMessage(profileId: string, stepId: string, kind: RetakeKind): string {
  const def = STEP_DEFS.get(`${profileId}.${stepId}`);
  if (!def) return `Please retake this photo.`;
  return retakeText(def, kind);
}

export { retakeVoicePromptId, type RetakeKind };

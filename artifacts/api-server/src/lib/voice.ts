import { logger } from "./logger";

/**
 * ElevenLabs text-to-speech for whitelisted capture/retake prompts.
 * The key stays server-side. Audio is cached in memory per prompt id.
 */
const VOICE_ID = process.env["ELEVENLABS_VOICE_ID"] ?? "21m00Tcm4TlvDq8ikWAM";
const MODEL_ID = process.env["ELEVENLABS_MODEL_ID"] ?? "eleven_turbo_v2_5";

const cache = new Map<string, Buffer>();

export class VoiceUnavailableError extends Error {}

function apiKey(): string | undefined {
  return process.env["ELEVENLABS_API_KEY"];
}

export function voiceAvailable(): boolean {
  return !!apiKey();
}

export async function synthesize(promptId: string, text: string): Promise<Buffer> {
  const cached = cache.get(promptId);
  if (cached) return cached;
  const key = apiKey();
  if (!key) throw new VoiceUnavailableError("Voice guidance is not configured.");

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ text, model_id: MODEL_ID }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.warn({ status: res.status, body: body.slice(0, 300) }, "ElevenLabs TTS failed");
    throw new VoiceUnavailableError("Voice guidance is temporarily unavailable.");
  }
  const buf = Buffer.from(await res.arrayBuffer());
  cache.set(promptId, buf);
  return buf;
}

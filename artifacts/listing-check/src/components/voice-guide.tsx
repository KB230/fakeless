import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import {
  useGetVoiceStatus,
  getGetVoiceStatusQueryKey,
  useListVoicePrompts,
  getListVoicePromptsQueryKey,
} from "@workspace/api-client-react";
import { hasGesture, voiceUrl } from "@/lib/helpers";

const played = new Set<string>();

export function VoiceGuide({
  promptId,
  fallbackText,
  autoPlay = true,
  playKey,
}: {
  promptId: string;
  fallbackText?: string;
  autoPlay?: boolean;
  playKey?: string;
}) {
  const { data: status } = useGetVoiceStatus({ query: { queryKey: getGetVoiceStatusQueryKey(), staleTime: 60_000 } });
  const { data: prompts } = useListVoicePrompts({ query: { queryKey: getListVoicePromptsQueryKey(), staleTime: 300_000 } });
  const text = prompts?.find((p) => p.id === promptId)?.text ?? fallbackText ?? "";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "failed">("idle");
  const available = status?.available === true;

  const play = () => {
    audioRef.current?.pause();
    const a = new Audio(voiceUrl(promptId));
    audioRef.current = a;
    setState("loading");
    a.onplaying = () => setState("playing");
    a.onended = () => setState("idle");
    a.onerror = () => setState("failed");
    a.play().catch(() => setState("failed"));
  };
  const playRef = useRef(play);
  playRef.current = play;

  const key = playKey ?? promptId;
  useEffect(() => {
    if (!available || !autoPlay || !hasGesture() || played.has(key)) return;
    played.add(key);
    playRef.current();
  }, [available, autoPlay, key]);

  useEffect(() => () => audioRef.current?.pause(), []);

  return (
    <div className="rounded-xl border border-foreground/10 bg-card/80 p-3 backdrop-blur-xl" data-testid={`voice-${promptId}`}>
      <div className="flex items-start gap-3">
        {available && state !== "failed" ? (
          <button
            onClick={play}
            aria-label="Replay spoken instruction"
            data-testid={`button-replay-${promptId}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground transition-transform active:scale-90"
          >
            {state === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Volume2 className={`h-5 w-5 ${state === "playing" ? "animate-pulse" : ""}`} />
            )}
          </button>
        ) : (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <VolumeX className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 pt-0.5">
          <p className="text-[15px] leading-snug">{text}</p>
          {status && (!available || state === "failed") && (
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              Audio unavailable — follow the written instructions
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

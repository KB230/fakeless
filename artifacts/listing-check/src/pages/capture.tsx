import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, ImageUp, Loader2, ArrowRight, ArrowLeft, RotateCcw, CheckCircle2, AlertTriangle, ScanLine, ChevronDown } from "lucide-react";
import {
  useGetCheck,
  getGetCheckQueryKey,
  useGetProfile,
  getGetProfileQueryKey,
  useSetDetailPresence,
  useEvaluateCheck,
  type InspectionStep,
  type CheckPhoto,
  type ProductProfile,
  type Check,
  type PresenceQuestion,
} from "@workspace/api-client-react";
import { Shell, Eyebrow, RefPhoto, Skel, ErrorPanel, btnPrimary, btnInk, btnGhost } from "@/components/bits";
import { VoiceGuide } from "@/components/voice-guide";
import { apiError, downscaleImage, setPreview, usePreview, CONDITION_LABEL, money } from "@/lib/helpers";
import { clearUploadError, startUpload, usePendingCount, useUploadState } from "@/lib/uploads";

type Stage = { kind: "step"; step: InspectionStep } | { kind: "questions"; questions: PresenceQuestion[] } | { kind: "review" };

export default function Capture() {
  const { id = "" } = useParams<{ id: string }>();
  const check = useGetCheck(id, { query: { enabled: !!id, queryKey: getGetCheckQueryKey(id) } });
  const pid = check.data?.profileId ?? "";
  const profile = useGetProfile(pid, { query: { enabled: !!pid, queryKey: getGetProfileQueryKey(pid) } });

  if (check.isLoading || (pid && profile.isLoading))
    return <Shell back="/"><Skel className="h-6 w-40" /><Skel className="mt-4 h-10" /><Skel className="mt-6 h-72" /></Shell>;
  if (check.isError) return <Shell back="/"><ErrorPanel message={apiError(check.error).message} onRetry={() => check.refetch()} /></Shell>;
  if (profile.isError) return <Shell back="/"><ErrorPanel message={apiError(profile.error).message} onRetry={() => profile.refetch()} /></Shell>;
  if (!check.data || !profile.data) return null;
  if (check.data.mode === "demo")
    return (
      <Shell back="/demo">
        <ErrorPanel message="This is a demo check. Demo checks use sample photos and never take uploads." />
        <Link href={`/check/${id}/result`} className={btnInk + " mt-4"} data-testid="link-demo-result">See the demo result</Link>
      </Shell>
    );
  return <Flow check={check.data} profile={profile.data} />;
}

function Flow({ check, profile }: { check: Check; profile: ProductProfile }) {
  const [, nav] = useLocation();
  const search = useSearch();

  // One screen for every "do you have…?" question, then the photo steps,
  // skipping photos of details the seller said are absent.
  const stages: Stage[] = useMemo(() => {
    const out: Stage[] = [];
    if (profile.presenceQuestions.length > 0) out.push({ kind: "questions", questions: profile.presenceQuestions });
    for (const s of profile.steps) {
      if (s.presenceQuestionId && check.presence[s.presenceQuestionId] === false) continue;
      out.push({ kind: "step", step: s });
    }
    out.push({ kind: "review" });
    return out;
  }, [profile.steps, profile.presenceQuestions, check.presence]);

  const photoFor = (stepId: string) => check.photos.find((p) => p.stepId === stepId);
  const stageDone = (s: Stage) =>
    s.kind === "questions" ? s.questions.every((q) => typeof check.presence[q.id] === "boolean") : s.kind === "step" ? !!photoFor(s.step.id) : false;

  const [pos, setPos] = useState(0);
  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    const want = new URLSearchParams(search).get("step");
    const target = want ? stages.findIndex((s) => s.kind === "step" && s.step.id === want) : -1;
    const first = stages.findIndex((s) => !stageDone(s));
    setPos(target >= 0 ? target : first >= 0 ? first : stages.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idx = Math.min(pos, stages.length - 1);
  const stage = stages[idx];
  const go = (n: number) => { setPos(Math.max(0, Math.min(stages.length - 1, n))); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <Shell back="/" title={profile.model}>
      <aside className="mb-5 rounded-xl border border-primary/25 bg-card p-3 text-sm" data-testid="capture-tier-note">{check.tierNote}</aside>
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <Eyebrow>{profile.brand} · {CONDITION_LABEL[check.condition]} · {money(check.askingPrice, check.currency)}</Eyebrow>
          <span className="font-mono text-[11px] text-muted-foreground">{idx + 1}/{stages.length}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {stages.map((s, i) => (
            <button key={i} onClick={() => go(i)} aria-label={`Go to step ${i + 1}`} data-testid={`button-progress-${i}`}
              className="h-3 flex-1 py-1">
              <span className={`block h-1 rounded-full transition-colors ${i === idx ? "bg-primary" : stageDone(s) ? "bg-secondary" : "bg-foreground/15"}`} />
            </button>
          ))}
        </div>
      </div>

      <div key={idx} className="rise">
        {stage.kind === "step" && (
          <StepView check={check} step={stage.step} photo={photoFor(stage.step.id)}
            onNext={() => go(idx + 1)} onBack={idx > 0 ? () => go(idx - 1) : undefined} />
        )}
        {stage.kind === "questions" && (
          <Questions check={check} questions={stage.questions} onDone={() => go(idx + 1)} />
        )}
        {stage.kind === "review" && (
          <ReviewStage check={check} stages={stages} onJump={go} onDone={() => nav(`/check/${check.id}/result`)} />
        )}
      </div>
    </Shell>
  );
}

function StepView({ check, step, photo, onNext, onBack }: {
  check: Check; step: InspectionStep; photo?: CheckPhoto; onNext: () => void; onBack?: () => void;
}) {
  const qc = useQueryClient();
  const preview = usePreview(check.id, step.id);
  const upload = useUploadState(check.id, step.id);
  const pending = upload?.status === "pending";
  const camRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);
  const isTag = step.readsText;

  const onFile = async (f?: File | null) => {
    if (!f) return;
    setLocalErr(null);
    clearUploadError(check.id, step.id);
    setFlash((n) => n + 1);
    try {
      const dataUrl = await downscaleImage(f);
      setPreview(check.id, step.id, dataUrl);
      startUpload(qc, check.id, step.id, dataUrl);
    } catch (e) {
      setLocalErr(e instanceof Error ? e.message : "Could not read that image.");
    }
  };
  const err = upload?.status === "error" ? upload : null;
  const obs = pending ? undefined : photo?.observation;
  const usable = obs?.quality.usable;
  const submitted = !!photo || pending;

  return (
    <div>
      <Eyebrow>Step · {step.title}{step.required ? "" : " · optional"}</Eyebrow>
      <h1 className="font-display mt-1 text-3xl font-extrabold leading-tight">{step.title}</h1>
      <div className="mt-4"><VoiceGuide promptId={step.voicePromptId} fallbackText={step.instruction} /></div>
      {isTag && <p className="mt-2 text-sm font-medium">Include every printed letter and digit, edge to edge.</p>}

      {step.references.length > 0 && (
        <div className="mt-5">
          <Eyebrow>Reference</Eyebrow>
          <div className={`mt-2 grid gap-2 ${step.references.length > 1 ? "grid-cols-2" : ""}`}>
            {step.references.map((r, i) => <RefPhoto key={i} r={r} />)}
          </div>
        </div>
      )}

      {step.framingTips.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5 text-xs" aria-label="Framing tips">
          {step.framingTips.map((t, i) => <li key={i} className="rounded-full border border-foreground/10 bg-card px-2.5 py-1">{t}</li>)}
        </ul>
      )}

      {/* Capture frame */}
      <div className="relative mt-4 overflow-hidden rounded-2xl border-2 border-secondary bg-secondary">
        <div className="relative aspect-[4/3]">
          {preview ? (
            <img src={preview} alt="Your photo" className="h-full w-full object-cover" data-testid={`img-preview-${step.id}`} />
          ) : photo ? (
            <div className="grid h-full place-items-center text-center text-sm text-secondary-foreground/70">Photo analyzed earlier.<br />Preview not kept on this device.</div>
          ) : (
            <div className="grid h-full place-items-center text-secondary-foreground/60"><ScanLine className="h-12 w-12" strokeWidth={1.2} /></div>
          )}
          {["left-3 top-3 border-l-2 border-t-2", "right-3 top-3 border-r-2 border-t-2", "left-3 bottom-3 border-l-2 border-b-2", "right-3 bottom-3 border-r-2 border-b-2"].map((c) => (
            <span key={c} className={`pointer-events-none absolute h-6 w-6 border-primary ${c}`} />
          ))}
          {flash > 0 && <span key={flash} className="pointer-events-none absolute inset-0 bg-background animate-out fade-out duration-500 fill-mode-forwards" />}
          {pending && (
            <div className="absolute inset-0 bg-secondary/40">
              <div className="scan absolute inset-x-0 h-1/4 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-secondary/85 px-3 py-2 font-mono text-xs text-secondary-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing · you can keep going
              </div>
            </div>
          )}
        </div>
      </div>

      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" data-testid={`input-camera-${step.id}`}
        onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" data-testid={`input-upload-${step.id}`}
        onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button onClick={() => camRef.current?.click()} className={submitted ? btnGhost + " h-14" : btnPrimary} data-testid={`button-take-photo-${step.id}`}>
          {submitted || preview ? <RotateCcw className="h-5 w-5" /> : <Camera className="h-5 w-5" />} {submitted || preview ? "Retake photo" : "Take photo"}
        </button>
        <button onClick={() => fileRef.current?.click()} aria-label="Upload a photo" data-testid={`button-upload-${step.id}`}
          className="grid h-14 w-14 place-items-center rounded-2xl border border-foreground/15 bg-card active:scale-95">
          <ImageUp className="h-5 w-5" />
        </button>
      </div>

      {localErr && <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{localErr}</p>}
      {err && (
        <div className="rise mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4" data-testid="panel-upload-error">
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-destructive" />{err.httpStatus === 503 ? "Photo analysis isn't available" : "Upload failed"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{err.message}</p>
          {preview && err.httpStatus !== 503 && (
            <button onClick={() => { clearUploadError(check.id, step.id); startUpload(qc, check.id, step.id, preview); }} className={btnInk + " mt-3 h-12 text-sm"} data-testid="button-retry-upload">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          )}
          {err.httpStatus === 503 && <Link href="/demo" className={btnInk + " mt-3 h-12 text-sm"} data-testid="link-try-demo-503">Try the demo instead</Link>}
        </div>
      )}

      {obs && <Observation obs={obs} isTag={isTag} />}

      {step.comparisonFocus.length > 0 && (
        <details className="group mt-4 rounded-xl border border-foreground/10 bg-card p-3 text-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
            What we check in this photo ({step.comparisonFocus.length})
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">{step.comparisonFocus.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </details>
      )}

      <div className="mt-6 flex gap-2">
        {onBack && <button onClick={onBack} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-foreground/15 bg-card" aria-label="Previous step" data-testid="button-prev"><ArrowLeft className="h-5 w-5" /></button>}
        <button onClick={onNext} className={submitted && usable !== false ? btnPrimary : btnInk} data-testid="button-next">
          {!submitted ? (step.required ? "Skip for now" : "Skip optional photo") : obs && !usable ? "Continue without retaking" : "Next"} <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      {!submitted && step.required && <p className="mt-2 text-xs text-muted-foreground">You can skip it. The result will still use every other photo, but it can't pass without this one.</p>}
    </div>
  );
}

function Observation({ obs, isTag }: { obs: CheckPhoto["observation"]; isTag: boolean }) {
  const q = obs.quality;
  const signs = obs.warningSigns ?? [];
  return (
    <div className="rise mt-4 space-y-3" data-testid="panel-observation">
      <div className={`${q.usable ? "ok" : "retake"} rounded-2xl p-4`} style={{ background: "hsl(var(--o-bg))", color: "hsl(var(--o))" }}>
        <p className="flex items-center gap-2 font-display font-bold">
          {q.usable ? <CheckCircle2 className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
          {q.usable ? (q.issues.length > 0 ? "Usable, with some issues" : "Photo is usable") : "Photo needs a retake"}
        </p>
        {q.issues.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{q.issues.map((i) => <span key={i} className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-[11px]">{i.replace("_", " ")}</span>)}</div>}
        <p className="mt-1.5 text-sm text-foreground/80">{q.note}</p>
      </div>
      <div className="rounded-2xl border border-foreground/10 bg-card p-4 text-sm">
        <p>{obs.summary}</p>
        {signs.length > 0 && (
          <div className="mt-3"><Eyebrow>Warning signs seen</Eyebrow>
            <ul className="mt-1 space-y-1.5">{signs.map((w, i) => (
              <li key={i} className="flex gap-2"><span className={`mt-0.5 h-fit rounded px-1.5 font-mono text-[10px] font-semibold ${w.kind === "objective" ? "bg-destructive/15 text-destructive" : "bg-muted"}`}>{w.kind === "objective" ? "clear" : "soft"}</span><span><b>{w.indicator}:</b> {w.observed}</span></li>
            ))}</ul></div>
        )}
        {isTag && (
          <div className="mt-3">
            <Eyebrow>Text read from the photo</Eyebrow>
            <pre className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-muted p-2.5 font-mono text-xs" data-testid="text-extracted">{obs.extractedText || "(no text read)"}</pre>
            {obs.codes.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{obs.codes.map((c, i) => (
              <span key={i} className="rounded-md border border-foreground/15 px-2 py-1 font-mono text-[11px]">{c.value} · {c.codeType.replace("_", " ")} · {c.confidence}</span>
            ))}</div>}
          </div>
        )}
        {obs.differences.length > 0 && (
          <div className="mt-3"><Eyebrow>Differences from reference</Eyebrow>
            <ul className="mt-1 space-y-1.5">{obs.differences.map((d, i) => (
              <li key={i} className="flex gap-2"><span className={`mt-0.5 h-fit rounded px-1.5 font-mono text-[10px] font-semibold ${d.severity === "meaningful" ? "bg-destructive/15 text-destructive" : "bg-muted"}`}>{d.severity}</span><span><b>{d.feature}:</b> {d.description}</span></li>
            ))}</ul></div>
        )}
      </div>
    </div>
  );
}

function Questions({ check, questions, onDone }: { check: Check; questions: PresenceQuestion[]; onDone: () => void }) {
  const qc = useQueryClient();
  const set = useSetDetailPresence();
  const [busy, setBusy] = useState<string | null>(null);
  const answer = (q: PresenceQuestion, present: boolean) => {
    setBusy(q.id);
    set.mutate({ checkId: check.id, data: { questionId: q.id, present } }, {
      onSuccess: (updated) => qc.setQueryData(getGetCheckQueryKey(check.id), updated),
      onSettled: () => setBusy(null),
    });
  };
  const allAnswered = questions.every((q) => typeof check.presence[q.id] === "boolean");
  return (
    <div>
      <Eyebrow>Before the photos</Eyebrow>
      <h1 className="font-display mt-1 text-3xl font-extrabold leading-tight">What does your item have?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Answer these once and we'll skip any photos that don't apply.</p>
      <div className="mt-5 space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="rounded-2xl border border-foreground/10 bg-card p-4" data-testid={`question-${q.id}`}>
            <p className="font-medium">{q.question}</p>
            <p className="mt-1 text-xs text-muted-foreground">{q.help}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => answer(q, v)} disabled={busy === q.id} data-testid={`button-presence-${q.id}-${v ? "yes" : "no"}`}
                  className={`h-12 rounded-xl border-2 font-display text-lg font-bold transition-transform active:scale-95 disabled:opacity-50 ${check.presence[q.id] === v ? "border-primary bg-primary/10" : "border-foreground/10 bg-background"}`}>
                  {busy === q.id && set.variables?.data.present === v ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : v ? "Yes" : "No"}
                </button>
              ))}
            </div>
            {check.presence[q.id] === false && <p className="mt-2 text-xs text-muted-foreground" data-testid="text-no-tag-consequence">{q.absentNote}</p>}
          </div>
        ))}
      </div>
      {set.isError && <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{apiError(set.error).message}</p>}
      <button onClick={onDone} disabled={!allAnswered} className={btnPrimary + " mt-6"} data-testid="button-questions-done">
        Start photos <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function ReviewStage({ check, stages, onJump, onDone }: { check: Check; stages: Stage[]; onJump: (i: number) => void; onDone: () => void }) {
  const qc = useQueryClient();
  const evaluate = useEvaluateCheck();
  const pendingCount = usePendingCount(check.id);
  const missing = stages.filter((s) => s.kind === "step" && s.step.required && !check.photos.some((p) => p.stepId === s.step.id));
  const run = () =>
    evaluate.mutate({ checkId: check.id }, {
      onSuccess: (c) => { qc.setQueryData(getGetCheckQueryKey(check.id), c); onDone(); },
    });
  return (
    <div>
      <Eyebrow>Final step</Eyebrow>
      <h1 className="font-display mt-1 text-3xl font-extrabold">Ready for the check</h1>
      <div className="mt-5 divide-y divide-foreground/10 overflow-hidden rounded-2xl border border-foreground/10 bg-card">
        {stages.map((s, i) => <ReviewRow key={i} check={check} stage={s} onClick={() => onJump(i)} />)}
      </div>
      {missing.length > 0 && <p className="mt-3 text-sm text-muted-foreground">You can run the check now. We'll analyze every photo you took; missing photos are listed in the result and keep the listing from passing until they're added.</p>}
      {evaluate.isError && <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{apiError(evaluate.error).message}</p>}
      <button onClick={run} disabled={evaluate.isPending || pendingCount > 0} className={btnPrimary + " mt-6"} data-testid="button-run-check">
        {pendingCount > 0 ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing {pendingCount} photo{pendingCount === 1 ? "" : "s"}…</>
          : evaluate.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Running listing check</>
          : <>Run listing check <ArrowRight className="h-5 w-5" /></>}
      </button>
    </div>
  );
}

function ReviewRow({ check, stage, onClick }: { check: Check; stage: Stage; onClick: () => void }) {
  const upload = useUploadState(check.id, stage.kind === "step" ? stage.step.id : "");
  if (stage.kind === "review") return null;
  const label = stage.kind === "questions" ? "Item details" : stage.step.title;
  const photo = stage.kind === "step" ? check.photos.find((p) => p.stepId === stage.step.id) : undefined;
  const done = stage.kind === "questions" ? stage.questions.every((q) => typeof check.presence[q.id] === "boolean") : !!photo;
  const status =
    stage.kind === "questions" ? (done ? "answered" : "unanswered")
    : upload?.status === "pending" ? "analyzing"
    : upload?.status === "error" ? "upload failed"
    : photo ? (photo.observation.quality.usable ? ((photo.observation.warningSigns?.length ?? 0) > 0 ? "signs noted" : "usable") : "issues")
    : stage.step.required ? "missing" : "optional";
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 p-4 text-left active:bg-muted" data-testid={`row-review-${stage.kind === "step" ? stage.step.id : "questions"}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-full ${done ? "bg-secondary text-secondary-foreground" : "border-2 border-dashed border-foreground/25"}`}>
        {upload?.status === "pending" ? <Loader2 className="h-4 w-4 animate-spin" /> : done && <CheckCircle2 className="h-4 w-4" />}
      </span>
      <span className="flex-1 font-medium">{label}</span>
      <span className="font-mono text-[11px] text-muted-foreground">{status}</span>
    </button>
  );
}

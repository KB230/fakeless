import { Link, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Send, RotateCcw, ShieldAlert } from "lucide-react";
import {
  useGetCheck,
  getGetCheckQueryKey,
  useGetProfile,
  getGetProfileQueryKey,
  usePublishListing,
  type Check,
  type CheckPhoto,
  type ReferencePhoto,
  type StepId,
} from "@workspace/api-client-react";
import { Shell, Eyebrow, OUTCOME, DemoBanner, RefPhoto, NoPhoto, Skel, ErrorPanel, btnPrimary, btnInk, btnGhost } from "@/components/bits";
import { VoiceGuide } from "@/components/voice-guide";
import { apiError, asset, usePreview, STEP_LABEL, CONDITION_LABEL, money } from "@/lib/helpers";

const STEP_STATUS: Record<string, string> = { ok: "bg-[hsl(158_40%_88%)] text-[hsl(164_64%_26%)]", retake: "bg-[hsl(42_90%_84%)] text-[hsl(32_90%_32%)]", review: "bg-[hsl(248_50%_90%)] text-[hsl(250_48%_44%)]", missing: "bg-muted text-muted-foreground", skipped: "bg-muted text-muted-foreground" };
const WASH_RESULT: Record<string, string> = { match: "Codes match", mismatch: "Code does not match", uncertain: "Could not confirm code", not_compared: "Not compared", tag_absent: "No wash tag" };

export default function Result() {
  const { id = "" } = useParams<{ id: string }>();
  const check = useGetCheck(id, { query: { enabled: !!id, queryKey: getGetCheckQueryKey(id) } });
  const pid = check.data?.profileId ?? "";
  const profile = useGetProfile(pid, { query: { enabled: !!pid, queryKey: getGetProfileQueryKey(pid) } });

  if (check.isLoading) return <Shell back="/"><Skel className="h-48" /><Skel className="mt-4 h-24" /><Skel className="mt-4 h-64" /></Shell>;
  if (check.isError || !check.data) return <Shell back="/"><ErrorPanel message={apiError(check.error).message} onRetry={() => check.refetch()} /></Shell>;
  const c = check.data;
  const isDemo = c.mode === "demo";
  const d = c.decision;

  if (!d)
    return (
      <Shell back="/">
        {isDemo && <DemoBanner />}
        <div className="rounded-2xl border border-foreground/10 bg-card p-6 text-center">
          <p className="font-display text-xl font-bold">No decision yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Finish the photo steps and run the listing check.</p>
          {!isDemo && <Link href={`/check/${c.id}`} className={btnPrimary + " mt-5"} data-testid="link-continue-check">Continue the check</Link>}
        </div>
      </Shell>
    );

  const o = OUTCOME[d.outcome];
  const refsFor = (stepId: string): ReferencePhoto[] => profile.data?.steps.find((s) => s.id === stepId)?.references ?? [];
  const titleFor = (stepId: string) => profile.data?.steps.find((s) => s.id === stepId)?.title ?? STEP_LABEL[stepId] ?? stepId;

  return (
    <Shell back={isDemo ? "/demo" : "/"}>
      {isDemo && <DemoBanner />}

      <section className={`${o.cls} rise relative overflow-hidden rounded-3xl p-6`} style={{ background: "hsl(var(--o-bg))" }} data-testid="panel-outcome">
        <div className="stamp absolute -right-3 top-5 rounded-lg border-[3px] px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest" style={{ borderColor: "hsl(var(--o))", color: "hsl(var(--o))" }}>
          {isDemo ? "Demo" : o.short}
        </div>
        <o.Icon className="h-10 w-10" style={{ color: "hsl(var(--o))" }} strokeWidth={2.2} />
        <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(var(--o))" }} data-testid="text-outcome-label">{o.label}</p>
        <h1 className="font-display mt-1 text-[28px] font-extrabold leading-tight" data-testid="text-headline">{d.headline}</h1>
        <p className="mt-3 font-mono text-[11px] text-foreground/60">
          {c.mode === "demo"
            ? `${c.categoryId === "outerwear" ? "Outerwear" : "Sample item"} · `
            : profile.data ? `${profile.data.category} · ` : ""}
          {CONDITION_LABEL[c.condition]} · {money(c.askingPrice, c.currency)}
        </p>
      </section>

      {d.evidence && (
        <section className="mt-3 rounded-2xl border border-foreground/10 bg-card p-4" data-testid="panel-evidence">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Authenticity evidence score</p>
              <p className="font-display text-4xl font-extrabold leading-none" data-testid="text-evidence-percent">{d.evidence.percent}%</p>
            </div>
            <div className="text-right font-mono text-xs text-muted-foreground">
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${d.evidence.confidence === "high" ? "bg-[hsl(158_40%_88%)] text-[hsl(164_64%_26%)]" : d.evidence.confidence === "medium" ? "bg-[hsl(42_90%_84%)] text-[hsl(32_90%_32%)]" : "bg-muted"}`} data-testid="text-evidence-confidence">
                {d.evidence.confidence} confidence
              </span>
              <p className="mt-1">{d.evidence.coveragePercent}% of photos covered</p>
            </div>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={`Authenticity evidence score ${d.evidence.percent} percent`}>
            <div className="h-full rounded-full" style={{ width: `${d.evidence.percent}%`, background: d.evidence.percent >= 75 ? "hsl(158 55% 38%)" : d.evidence.percent >= 45 ? "hsl(38 90% 50%)" : "hsl(0 70% 50%)" }} />
          </div>
          {d.evidence.factors.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs" data-testid="list-evidence-factors">
              {d.evidence.factors.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${f.direction === "supports" ? "bg-[hsl(158_55%_38%)]" : f.direction === "weakens" ? "bg-[hsl(38_90%_50%)]" : "bg-[hsl(0_70%_50%)]"}`} />
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-muted-foreground" data-testid="text-evidence-label">{d.evidence.label}</p>
        </section>
      )}

      <p className="mt-3 flex gap-2 rounded-xl bg-card/80 p-3 text-xs text-muted-foreground" data-testid="text-disclaimer">
        <ShieldAlert className="h-4 w-4 shrink-0" />{d.disclaimer}
      </p>

      {d.outcome === "retake_requested" && d.retakes.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold">{d.retakes.length === 1 ? "One photo still needed" : `${d.retakes.length} photos still needed`}</h2>
          <p className="mt-1 text-sm text-muted-foreground">The score above already uses every usable photo. Add these to complete the check.</p>
          <div className="mt-3 space-y-3">
            {d.retakes.map((r, i) => (
              <div key={r.stepId} className="rounded-2xl border-2 border-[hsl(42_90%_60%)] bg-card p-4" data-testid={`card-retake-${r.stepId}`}>
                <Eyebrow>{titleFor(r.stepId)} · {r.issue.replace("_", " ")}</Eyebrow>
                <p className="mt-1 text-sm">{r.message}</p>
                <div className="mt-3"><VoiceGuide promptId={r.voicePromptId} fallbackText={r.message} autoPlay={i === 0} playKey={`retake-${c.id}-${r.stepId}`} /></div>
                {isDemo ? (
                  <p className="mt-3 rounded-lg bg-muted p-2.5 font-mono text-[11px]">Demo outcome. In a live check the seller would retake this photo here.</p>
                ) : (
                  <Link href={`/check/${c.id}?step=${r.stepId}`} className={btnInk + " mt-3"} data-testid={`link-retake-${r.stepId}`}>
                    <RotateCcw className="h-5 w-5" /> {r.issue === "missing" ? "Add" : "Retake"} {titleFor(r.stepId).toLowerCase()}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {d.reasons.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold">Why</h2>
          <ul className="mt-3 space-y-2">
            {d.reasons.map((r, i) => (
              <li key={i} className="rounded-xl border border-foreground/10 bg-card p-3 text-sm" data-testid={`text-reason-${i}`}>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{r.code.replace(/_/g, " ")}{r.stepId ? ` · ${titleFor(r.stepId)}` : ""}</span>
                <p className="mt-0.5">{r.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.washTag && (
        <section className="mt-6 rounded-2xl bg-secondary p-4 text-secondary-foreground" data-testid="panel-washtag">
          <div className="flex items-center justify-between">
            <Eyebrow><span className="text-secondary-foreground/70">Wash tag code</span></Eyebrow>
            <span className="rounded bg-secondary-foreground/15 px-2 py-0.5 font-mono text-[11px] font-semibold">{WASH_RESULT[d.washTag.result]}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div><p className="font-mono text-[10px] uppercase opacity-60">Observed</p><p className="font-mono text-lg font-semibold" data-testid="text-observed-code">{d.washTag.observedCode ?? "none"}</p></div>
            <div><p className="font-mono text-[10px] uppercase opacity-60">Expected</p><p className="font-mono text-lg font-semibold">{d.washTag.expectedCodes.join(", ") || "none"}</p></div>
          </div>
          {profile.data?.expectedCodes.some((e) => e.isSample) && <p className="mt-2 font-mono text-[10px] text-primary">Expected codes include sample codes, not documented ones.</p>}
          {d.washTag.rawText && (
            <>
              <p className="mt-3 font-mono text-[10px] uppercase opacity-60">Raw text read</p>
              <pre className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-secondary-foreground/10 p-2.5 font-mono text-xs">{d.washTag.rawText}</pre>
            </>
          )}
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-display text-xl font-bold">Step by step</h2>
        <div className="mt-3 space-y-4">
          {d.steps.map((s) => (
            <div key={s.stepId} className="rounded-2xl border border-foreground/10 bg-card p-3" data-testid={`card-step-${s.stepId}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{titleFor(s.stepId)}</p>
                <span className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${STEP_STATUS[s.status]}`}>{s.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
              {s.warningSigns && s.warningSigns.length > 0 && (
                <ul className="mt-2 space-y-1.5" data-testid={`list-warning-signs-${s.stepId}`}>
                  {s.warningSigns.map((w, i) => (
                    <li key={i} className={`rounded-lg border p-2.5 text-xs ${w.kind === "objective" ? "border-[hsl(250_48%_44%)]/40 bg-[hsl(248_50%_95%)]" : "border-foreground/10 bg-muted"}`}>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider">
                        {w.kind === "objective" ? "Clear warning sign" : "Reviewer may want to look"}
                      </span>
                      <p className="mt-0.5 font-semibold">{w.indicator}</p>
                      <p className="text-muted-foreground">{w.observed}</p>
                    </li>
                  ))}
                </ul>
              )}
              {(!s.warningSigns || s.warningSigns.length === 0) && s.status === "ok" && (
                <p className="mt-1 text-xs text-muted-foreground">No visible warning signs in this photo.</p>
              )}
              {c.photos.find(p => p.stepId === s.stepId)?.observation && (() => {
                const obs = c.photos.find(p => p.stepId === s.stepId)!.observation;
                return <div className="mt-3 space-y-2 text-sm">
                  <p>{obs.summary}</p>
                  {obs.extractedText && <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-3 font-mono text-xs">{obs.extractedText}</pre>}
                  {obs.codes.length > 0 && <ul className="text-xs text-muted-foreground">{obs.codes.map((code, i) => <li key={i}>{code.value} · {code.codeType.replaceAll("_", " ")} · {code.confidence} confidence</li>)}</ul>}
                  {c.tier !== "model_specific" && <p className="text-xs text-muted-foreground">Observations only. No model reference or code validation.</p>}
                </div>;
              })()}
              {s.status !== "skipped" && (
                <Compare check={c} stepId={s.stepId} photo={c.photos.find((p) => p.stepId === s.stepId)} refs={refsFor(s.stepId)} />
              )}
            </div>
          ))}
        </div>
      </section>

      <details className="mt-6 rounded-2xl border border-foreground/10 bg-card p-4 text-sm" data-testid="panel-how-we-check">
        <summary className="cursor-pointer font-semibold">How we choose what to check</summary>
        <p className="mt-2 text-muted-foreground">
          Each photo step looks for warning signs adapted from public authentication guides: stitching, logo and font
          consistency, tag printing, hardware engraving, and labels that should agree with each other. Clear,
          checkable signs (a misspelled brand word, a size tag that contradicts the box label) send a listing to a
          person. Quality judgments are shown as notes and never block on their own. Weight, feel, smell and price are
          not used, and these are screening signals, not verdicts.
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Examples of what we look for</p>
        <div className="mt-2 grid grid-cols-1 gap-3" data-testid="gallery-warning-examples">
          {[
            { src: "examples/embroidery-hologram-comparisons.jpg", caption: "Authentic vs counterfeit: counterfeit embroidery is thinner and frayed, and counterfeit holograms look dull and flat." },
            { src: "examples/bag-pull-comparison.jpg", caption: "Leftover material around a bag pull is a visible construction warning sign." },
            { src: "examples/handbag-photo-checklist.jpg", caption: "The close-ups that matter for bags: overall shape, brand logo, inside label, hardware engravings." },
          ].map((ex) => (
            <figure key={ex.src}>
              <img src={asset(ex.src)} alt={ex.caption} loading="lazy" className="w-full rounded-xl border border-foreground/10 bg-muted object-contain" />
              <figcaption className="mt-1 text-[11px] leading-snug text-muted-foreground">{ex.caption}</figcaption>
            </figure>
          ))}
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
          <li><a className="underline" href="https://legitgrails.com" target="_blank" rel="noreferrer">LegitGrails, How to Spot Fake vs. Real Shoes</a></li>
          <li><a className="underline" href="https://vereev.com" target="_blank" rel="noreferrer">Vereev, wallet authentication photo guide</a></li>
          <li>Designer Second Hand Vienna, How to spot fake designer items: 6 signs of authenticity</li>
        </ul>
      </details>

      <PublishBlock check={c} />

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Link href="/" className={btnGhost} data-testid="link-done-home">Home</Link>
        <Link href={isDemo ? "/demo" : "/check/new"} className={btnGhost} data-testid="link-another">{isDemo ? "Other demos" : "New check"}</Link>
      </div>
    </Shell>
  );
}

function Compare({ check, stepId, photo, refs }: { check: Check; stepId: StepId; photo?: CheckPhoto; refs: ReferencePhoto[] }) {
  const local = usePreview(check.id, stepId);
  const src = photo?.imageUrl ? asset(photo.imageUrl) : local;
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <div>
        <p className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">{check.mode === "demo" ? "Sample photo" : "Your photo"}</p>
        {src ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <img src={src} alt="Seller photo" className="h-full w-full object-cover" />
            {check.mode === "demo" && <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">DEMO</span>}
          </div>
        ) : <NoPhoto label={photo ? "Photo not stored" : "No photo"} />}
      </div>
      <div>
        <p className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Reference</p>
        {refs[0] ? <RefPhoto r={refs[0]} compact /> : <NoPhoto label="No reference" />}
        {refs[0] && <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{refs[0].caption} · {refs[0].source}</p>}
      </div>
    </div>
  );
}

function PublishBlock({ check }: { check: Check }) {
  const qc = useQueryClient();
  const publish = usePublishListing();
  const isDemo = check.mode === "demo";
  const passed = check.decision?.outcome === "passed" || check.decision?.outcome === "photo_check_complete";
  const published = publish.data ?? (check.publishedAt ? { message: `Listing ${check.listingId ?? ""} was published.`, listingId: check.listingId } : null);

  if (published)
    return (
      <div className="ok rise mt-6 rounded-2xl p-4" style={{ background: "hsl(var(--o-bg))" }} data-testid="panel-published">
        <p className="font-display text-lg font-bold" style={{ color: "hsl(var(--o))" }}>{isDemo ? "Mock demo publish complete" : "Listing published"}</p>
        <p className="mt-1 text-sm">{published.message}</p>
        {check.decision?.outcome === "photo_check_complete" && <p className="mt-2 text-xs">Photo checked · model not verified. Not an authentication.</p>}
        {published.listingId && <p className="mt-1 font-mono text-[11px] text-muted-foreground">Listing {published.listingId}</p>}
      </div>
    );

  return (
    <div className="mt-6">
      <button
        disabled={!passed || publish.isPending}
        onClick={() => publish.mutate({ checkId: check.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCheckQueryKey(check.id) }) })}
        className={btnPrimary} data-testid="button-publish">
        {publish.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : passed ? <Send className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        {isDemo ? "Publish listing (mock demo publish)" : "Publish listing (mock)"}
      </button>
      {!passed && (
        <p className="mt-2 text-center text-xs text-muted-foreground" data-testid="text-publish-locked">
          Mock publishing unlocks after a pass or completed photo check. {check.decision?.outcome === "manual_review" ? "A person must review this listing before continuing." : "Retake the requested photo and run the check again."}
        </p>
      )}
      {publish.isError && <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive" data-testid="text-publish-error">{apiError(publish.error).message}</p>}
    </div>
  );
}

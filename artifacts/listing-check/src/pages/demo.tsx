import { useLocation } from "wouter";
import { Loader2, Play } from "lucide-react";
import { useListDemoCases, getListDemoCasesQueryKey, useRunDemoCase } from "@workspace/api-client-react";
import { Shell, Eyebrow, OutcomeChip, Skel, ErrorPanel } from "@/components/bits";
import { apiError } from "@/lib/helpers";

export default function Demo() {
  const [, nav] = useLocation();
  const cases = useListDemoCases({ query: { queryKey: getListDemoCasesQueryKey() } });
  const run = useRunDemoCase();

  return (
    <Shell back="/">
      <div className="mb-4 inline-flex rounded bg-primary px-2 py-0.5 font-mono text-[11px] font-bold text-primary-foreground">DEMO</div>
      <h1 className="font-display text-3xl font-extrabold">Five sample checks</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Sample photos and sample codes, run through the same decision rules as a live check. No camera, no uploads.
      </p>
      <div className="mt-6 space-y-3">
        {cases.isLoading ? (
          [0, 1, 2].map((i) => <Skel key={i} className="h-36" />)
        ) : cases.isError ? (
          <ErrorPanel message={apiError(cases.error).message} onRetry={() => cases.refetch()} />
        ) : !cases.data?.length ? (
          <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">No demo cases available.</p>
        ) : (
          cases.data.map((c, i) => {
            const busy = run.isPending && run.variables?.caseId === c.id;
            return (
              <div key={c.id} className="rise rounded-2xl border border-foreground/10 bg-card p-4" style={{ animationDelay: `${i * 0.06}s` }} data-testid={`card-demo-${c.id}`}>
                <div className="flex items-center justify-between gap-2">
                  <Eyebrow>Case {String(i + 1).padStart(2, "0")}</Eyebrow>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">expects <OutcomeChip status={c.expectedOutcome} /></span>
                </div>
                <p className="mt-2 font-display text-lg font-bold leading-tight">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <button disabled={run.isPending} data-testid={`button-run-demo-${c.id}`}
                  onClick={() => run.mutate({ caseId: c.id }, { onSuccess: (chk) => nav(`/check/${chk.id}/result`) })}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground active:scale-[.98] disabled:opacity-50">
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Running sample evidence</> : <><Play className="h-4 w-4" /> Run this demo</>}
                </button>
              </div>
            );
          })
        )}
        {run.isError && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{apiError(run.error).message}</p>}
      </div>
    </Shell>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Check as CheckIcon, ArrowRight, Loader2 } from "lucide-react";
import {
  useListProfiles,
  getListProfilesQueryKey,
  useCreateCheck,
  type ItemCondition,
} from "@workspace/api-client-react";
import { Shell, Eyebrow, Skel, ErrorPanel, btnPrimary } from "@/components/bits";
import { apiError, CONDITION_LABEL } from "@/lib/helpers";

export default function Setup() {
  const [, nav] = useLocation();
  const profiles = useListProfiles({ query: { queryKey: getListProfilesQueryKey() } });
  const create = useCreateCheck();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [price, setPrice] = useState("");
  const priceNum = Number(price);
  const valid = !!profileId && !!condition && price !== "" && priceNum >= 0 && Number.isFinite(priceNum);

  const submit = () => {
    if (!valid) return;
    create.mutate(
      { data: { profileId: profileId!, condition: condition!, askingPrice: priceNum, currency: "USD" } },
      { onSuccess: (c) => nav(`/check/${c.id}`) },
    );
  };

  return (
    <Shell back="/">
      <Eyebrow>New check · Setup</Eyebrow>
      <h1 className="font-display mt-2 text-3xl font-extrabold">What are you listing?</h1>

      <h2 className="mt-6 font-mono text-xs font-semibold uppercase tracking-wider">1 · Product profile</h2>
      <div className="mt-2 space-y-2">
        {profiles.isLoading ? (
          <><Skel className="h-24" /><Skel className="h-24" /></>
        ) : profiles.isError ? (
          <ErrorPanel message={apiError(profiles.error).message} onRetry={() => profiles.refetch()} />
        ) : !profiles.data?.length ? (
          <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">No product profiles are available yet.</p>
        ) : (
          profiles.data.map((p) => {
            const on = p.id === profileId;
            return (
              <button key={p.id} onClick={() => setProfileId(p.id)} data-testid={`button-profile-${p.id}`}
                className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all active:scale-[.99] ${on ? "border-primary bg-card" : "border-foreground/10 bg-card/60"}`}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{p.brand} · {p.category}</p>
                    <p className="font-display text-lg font-bold leading-tight">{p.model}</p>
                    <p className="text-sm text-muted-foreground">{p.generation}{p.colorway ? ` · ${p.colorway}` : ""}</p>
                  </div>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${on ? "border-primary bg-primary text-primary-foreground" : "border-foreground/20"}`}>
                    {on && <CheckIcon className="h-4 w-4" />}
                  </span>
                </div>
                {p.referenceStatus === "demo" ? (
                  <div className="mt-3 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-2.5 text-xs">
                    <span className="font-mono font-semibold text-primary">Demo references and sample codes</span>
                    <p className="mt-0.5 text-muted-foreground">{p.referenceNote}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground"><span className="font-mono font-semibold text-foreground">Documented references</span> · {p.referenceNote}</p>
                )}
              </button>
            );
          })
        )}
      </div>

      <h2 className="mt-7 font-mono text-xs font-semibold uppercase tracking-wider">2 · Condition</h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(Object.keys(CONDITION_LABEL) as ItemCondition[]).map((c) => (
          <button key={c} onClick={() => setCondition(c)} data-testid={`button-condition-${c}`}
            className={`h-14 rounded-2xl border-2 text-sm font-semibold transition-all active:scale-95 ${condition === c ? "border-secondary bg-secondary text-secondary-foreground" : "border-foreground/10 bg-card"}`}>
            {CONDITION_LABEL[c]}
          </button>
        ))}
      </div>

      <h2 className="mt-7 font-mono text-xs font-semibold uppercase tracking-wider">3 · Asking price</h2>
      <label className="mt-2 flex h-16 items-center gap-2 rounded-2xl border-2 border-foreground/10 bg-card px-4 focus-within:border-primary">
        <span className="font-display text-2xl text-muted-foreground">$</span>
        <input inputMode="decimal" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
          placeholder="245.00" data-testid="input-price" className="w-full bg-transparent font-display text-2xl font-bold outline-none" />
        <span className="font-mono text-xs text-muted-foreground">USD</span>
      </label>
      <p className="mt-1.5 text-xs text-muted-foreground">Shown as listing context only. Price does not affect the result.</p>

      {create.isError && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive" data-testid="text-create-error">{apiError(create.error).message}</p>}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-foreground/10 bg-background/90 p-4 backdrop-blur">
        <div className="mx-auto max-w-xl">
          <button onClick={submit} disabled={!valid || create.isPending} data-testid="button-create-check" className={btnPrimary}>
            {create.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Begin photo steps <ArrowRight className="h-5 w-5" /></>}
          </button>
        </div>
      </div>
    </Shell>
  );
}

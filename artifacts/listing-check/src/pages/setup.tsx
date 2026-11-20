import { useState } from "react";
import { useLocation } from "wouter";
import { Check as CheckIcon, ArrowRight, Loader2 } from "lucide-react";
import {
  useListProfiles,
  getListProfilesQueryKey,
  useCreateCheck,
  useListCategories,
  useResolveScreeningTier,
  getResolveScreeningTierQueryKey,
  type ItemCondition,
} from "@workspace/api-client-react";
import { Shell, Eyebrow, Skel, ErrorPanel, btnPrimary } from "@/components/bits";
import { apiError, CONDITION_LABEL } from "@/lib/helpers";

export default function Setup() {
  const [, nav] = useLocation();
  const profiles = useListProfiles({ query: { queryKey: getListProfilesQueryKey() } });
  const create = useCreateCheck();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const categories = useListCategories();
  const tierParams = { categoryId, ...(profileId ? { profileId } : {}) };
  const tier = useResolveScreeningTier(tierParams, { query: { enabled: !!categoryId, queryKey: getResolveScreeningTierQueryKey(tierParams) } });
  const liveProfilesForCategory = profiles.data?.filter(p => p.kind === "model" && p.categoryId === categoryId && p.liveEnabled && p.referenceStatus === "documented") ?? [];
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [price, setPrice] = useState("");
  const priceNum = Number(price);
  const valid = !!categoryId && !!tier.data && !tier.isFetching && !!condition && price !== "" && priceNum >= 0 && Number.isFinite(priceNum);

  const submit = () => {
    if (!valid) return;
    create.mutate(
      { data: { categoryId, profileId, condition: condition!, askingPrice: priceNum, currency: "USD" } },
      { onSuccess: (c) => nav(`/check/${c.id}`) },
    );
  };

  return (
    <Shell back="/">
      <Eyebrow>New check · Setup</Eyebrow>
      <h1 className="font-display mt-2 text-3xl font-extrabold">What are you listing?</h1>

      <h2 className="mt-6 font-mono text-xs font-semibold uppercase tracking-wider">1 · Category</h2>
      <p className="mt-2 text-sm text-muted-foreground">Use your own clothes. Pick a category to see the available screening tier before taking photos.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {categories.isLoading ? <Skel className="h-20" /> : categories.isError ? <ErrorPanel message={apiError(categories.error).message} onRetry={() => categories.refetch()} /> : categories.data?.map(c => (
          <button key={c.id} onClick={() => { setCategoryId(c.id); setProfileId(null); }} data-testid={`button-category-${c.id}`} aria-pressed={categoryId === c.id}
            className={`min-h-24 rounded-xl border p-3 text-left ${categoryId === c.id ? "border-primary bg-primary/10" : "border-foreground/15 bg-card"}`}>
            <strong className="block text-sm">{c.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{c.examples}</span>
          </button>
        ))}
      </div>
      {categoryId && <button onClick={() => setProfileId(null)} aria-pressed={!profileId} className="mt-4 min-h-11 text-sm underline">Use the category checklist / no exact model</button>}
      <div className="mt-2 space-y-2">
        {!categoryId ? null : profiles.isLoading ? (
          <><Skel className="h-24" /><Skel className="h-24" /></>
        ) : profiles.isError ? (
          <ErrorPanel message={apiError(profiles.error).message} onRetry={() => profiles.refetch()} />
        ) : !profiles.data?.length ? (
          <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">No product profiles are available yet.</p>
        ) : (
          liveProfilesForCategory.map((p) => {
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
      {categoryId && !profiles.isLoading && !profiles.isError && liveProfilesForCategory.length === 0 && (
        <p className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          No documented model-specific references are available for this category yet. Continue with the category checklist; demo examples are kept separate.
        </p>
      )}
      {categoryId && <div className="mt-4 rounded-xl border border-primary/30 bg-card p-4" data-testid="panel-screening-tier">
        {tier.isLoading || tier.isFetching ? <p>Finding your screening tier…</p> : tier.isError ? <ErrorPanel message={apiError(tier.error).message} onRetry={() => tier.refetch()} /> : tier.data && <>
          <h2 className="font-display text-2xl">{tier.data.title}</h2><p className="mt-2 text-sm text-muted-foreground">{tier.data.note}</p>
          <p className="mt-2 text-xs text-muted-foreground">This is photo screening, not authentication. Photo analysis needs a configured server-side OpenAI key.</p>
        </>}
      </div>}

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

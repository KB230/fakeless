import { Link } from "wouter";
import { ArrowRight, ExternalLink, PlayCircle, Info } from "lucide-react";
import {
  useGetStatsSummary,
  getGetStatsSummaryQueryKey,
  useListChecks,
  getListChecksQueryKey,
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { Shell, Eyebrow, OutcomeChip, Skel, ErrorPanel, btnPrimary, btnGhost } from "@/components/bits";
import { money, apiError } from "@/lib/helpers";
import { MarketplaceNetwork } from "@/components/marketplace-network";

const EUIPO =
  "https://euipo.europa.eu/tunnel-web/secure/webdav/guest/document_library/observatory/documents/reports/IP_youth_scoreboard_study_2022/executiveSummary/executive_summary_2022_en.pdf";

export default function Home() {
  const stats = useGetStatsSummary({ query: { queryKey: getGetStatsSummaryQueryKey() } });
  const params = { limit: 5 };
  const checks = useListChecks(params, { query: { queryKey: getListChecksQueryKey(params) } });
  const s = stats.data;

  return (
    <Shell>
      <section className="rise">
        <Eyebrow>Step 4 of 5 · Before you publish</Eyebrow>
        <h1 className="font-display mt-3 text-[40px] font-extrabold leading-[0.98] sm:text-5xl" data-testid="text-headline">
          Catch counterfeit warning signs before you list.
        </h1>
        <p className="mt-4 text-[15px] text-muted-foreground">
          An estimated $467 billion in counterfeit goods crossed borders worldwide in 2021. Online marketplaces are one route to buyers. Fakeless helps marketplaces flag warning signs before an item gets listed.
        </p>
        <a
          href="https://www.oecd.org/en/publications/mapping-global-trade-in-fakes-2025_94d3b29f-en.html"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4"
          data-testid="link-source-counterfeit-trade"
        >
          Source: OECD–EUIPO, Mapping Global Trade in Fakes 2025 (2021 estimate)
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      </section>

      <section className="rise mt-6 overflow-hidden rounded-3xl bg-secondary text-secondary-foreground" style={{ animationDelay: ".08s" }}>
        <div className="p-5">
          <div className="flex items-end gap-2">
            <span className="font-display text-[84px] font-extrabold leading-[0.8] text-primary">52%</span>
            <span className="pb-1 font-mono text-[11px] uppercase tracking-widest opacity-70">EUIPO · 2022</span>
          </div>
          <p className="mt-4 text-[15px] leading-snug" data-testid="text-statistic">
            In a 2022 EUIPO survey, 52% of young EU respondents said they had bought at least one counterfeit product online in the previous 12 months.
          </p>
          <a href={EUIPO} target="_blank" rel="noopener noreferrer" data-testid="link-source-euipo"
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs underline underline-offset-4 opacity-80 hover:opacity-100">
            Source: EUIPO 2022 IP and Youth Scoreboard <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </section>

      <section className="rise mt-6 space-y-3" style={{ animationDelay: ".14s" }}>
        <Link href="/check/new" data-testid="link-start-check" className={btnPrimary}>
          Start a listing check <ArrowRight className="h-5 w-5" />
        </Link>
        <Link href="/demo" data-testid="link-try-demo" className={btnGhost + " h-14 text-base"}>
          <PlayCircle className="h-5 w-5" /> Try a demo
        </Link>
        {s && !s.visionConfigured && (
          <p className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5 text-xs text-muted-foreground" data-testid="text-vision-not-configured">
            <Info className="mt-0.5 h-4 w-4 shrink-0" /> Live photo analysis is not configured yet. The demo still works.
          </p>
        )}
      </section>

      <MarketplaceNetwork />

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Live check outcomes</h2>
          <Eyebrow>{s ? `${s.total} total` : ""}</Eyebrow>
        </div>
        {stats.isLoading ? (
          <Skel className="mt-3 h-28" />
        ) : stats.isError ? (
          <div className="mt-3"><ErrorPanel message={apiError(stats.error).message} onRetry={() => stats.refetch()} /></div>
        ) : s ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { l: "Passed", v: s.passed, c: "ok" },
              { l: "Retake", v: s.retakeRequested, c: "retake" },
              { l: "Review", v: s.manualReview, c: "review" },
            ].map((x) => (
              <div key={x.l} className={`${x.c} rounded-2xl p-3`} style={{ background: "hsl(var(--o-bg))", color: "hsl(var(--o))" }} data-testid={`stat-${x.l.toLowerCase()}`}>
                <div className="font-display text-3xl font-extrabold">{x.v}</div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider">{x.l}</div>
              </div>
            ))}
            <p className="col-span-3 font-mono text-[11px] text-muted-foreground">
              {s.inProgress} in progress · {s.published} published
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Recent live checks</h2>
        <div className="mt-3 divide-y divide-foreground/10 overflow-hidden rounded-2xl border border-foreground/10 bg-card">
          {checks.isLoading ? (
            [0, 1, 2].map((i) => <div key={i} className="p-4"><Skel className="h-10" /></div>)
          ) : checks.isError ? (
            <div className="p-3"><ErrorPanel message={apiError(checks.error).message} onRetry={() => checks.refetch()} /></div>
          ) : !checks.data?.length ? (
            <div className="p-6 text-center">
              <p className="font-display font-bold">The bench is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Your first live check will show up here.</p>
            </div>
          ) : (
            checks.data.map((c) => (
              <Link key={c.id} href={c.status === "in_progress" ? `/check/${c.id}` : `/check/${c.id}/result`}
                data-testid={`row-check-${c.id}`} className="flex items-center gap-3 p-4 active:bg-muted">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.profileName}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {money(c.askingPrice, c.currency)} · {format(new Date(c.createdAt), "MMM d, HH:mm")}
                    {c.publishedAt ? " · published" : ""}
                  </p>
                </div>
                <OutcomeChip status={c.status} />
              </Link>
            ))
          )}
        </div>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        Background reading:{" "}
        <a href="https://arcteryx.com/us/en/help/counterfeit" target="_blank" rel="noopener noreferrer" data-testid="link-arcteryx" className="underline underline-offset-4">
          Arc'teryx counterfeit guidance
        </a>
        . This step screens for visible discrepancies only; it does not authenticate items.
      </p>
    </Shell>
  );
}

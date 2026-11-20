import { useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { ArrowUpRight, ArrowDown, Plus, Minus, ScanLine, Play } from "lucide-react";
import { useGetStatsSummary, getGetStatsSummaryQueryKey, useListChecks, getListChecksQueryKey } from "@workspace/api-client-react";
import { OutcomeChip } from "@/components/bits";
import { MarketplaceNetwork } from "@/components/marketplace-network";
import { apiError, asset, money } from "@/lib/helpers";
import "./home-aura.css";

const EUIPO = "https://euipo.europa.eu/tunnel-web/secure/webdav/guest/document_library/observatory/documents/reports/IP_youth_scoreboard_study_2022/executiveSummary/executive_summary_2022_en.pdf";
const OECD = "https://www.oecd.org/en/publications/mapping-global-trade-in-fakes-2025_94d3b29f-en.html";
const categories = [
  ["Sneakers", "Record both shoes, box label when present, inside size tag, insole, outsole and stitching. Codes are transcribed, not validated against invented formats."],
  ["Streetwear", "Capture the full front, neck label, both sides of the care tag, graphic and hem stitching. A missing expected care tag requires manual review."],
  ["Outerwear", "Capture the full jacket, logo, both sides of the care tag, zipper and inside seams. Model comparison requires documented references."],
  ["Handbags and leather goods", "Record the full front, brand stamp, interior code area when present, hardware and stitching. Appearance alone cannot establish authenticity."],
  ["Hats and caps", "Photograph the front logo, inside brand and size tags, underbrim, sweatband and closure. The check records visible evidence, not proof of origin."],
];

export default function Home() {
  const stats = useGetStatsSummary({ query: { queryKey: getGetStatsSummaryQueryKey() } });
  const params = { limit: 5 };
  const checks = useListChecks(params, { query: { queryKey: getListChecksQueryKey(params) } });
  const [openCategory, setOpenCategory] = useState<number | null>(2);
  const s = stats.data;
  return (
    <main className="aura" id="aura-top" style={{ "--aura-textile": `url("${asset("images/fakeless-aura-textile.jpg")}")` } as CSSProperties}>
      <div className="aura-wrap">
        <nav className="aura-nav" aria-label="Main navigation">
          <Link className="aura-wordmark" href="/" aria-label="Fakeless home">fakeless<span>.</span></Link>
          <div className="aura-navlinks">
            <a href="#aura-checks">What we check</a><a href="#aura-method">The approach</a>
            <Link href="/check/new" className="aura-navcheck">Start a check <ArrowUpRight size={16} /></Link>
          </div>
        </nav>
      </div>
      <section className="aura-hero">
        <div className="aura-wrap aura-reveal">
          <div className="aura-hero-meta aura-mono"><span>A closer look. Before it goes live.</span><span>Evidence before assumption / 001</span></div>
          <h1 data-testid="text-headline">Catch counterfeit<br className="aura-desktop-break" /> warning signs<br /> <em>before you list.</em></h1>
          <div className="aura-hero-bottom">
            <div>
              <p className="aura-hero-copy">An estimated $467 billion in counterfeit goods crossed borders worldwide in 2021. Online marketplaces are one route to buyers. Fakeless helps marketplaces flag warning signs before an item gets listed.</p>
              <a className="aura-source" href={OECD} target="_blank" rel="noopener noreferrer" data-testid="link-source-counterfeit-trade">OECD–EUIPO · 2025 report, 2021 estimate <ArrowUpRight size={12} /></a>
              <div className="aura-actions">
                <Link className="aura-button" href="/check/new" data-testid="link-start-check">Start a listing check <ArrowUpRight size={17} /></Link>
                <Link className="aura-button secondary" href="/demo" data-testid="link-try-demo"><Play size={13} /> Try a demo</Link>
              </div>
            </div>
            <div className="aura-caption aura-mono">Study 001 — construction detail<br />Look closer. Leave a record.</div>
          </div>
          <div className="aura-hero-foot aura-mono"><span><i className="aura-dot" /> A screening tool. Not authentication.</span><a href="#aura-checks">Explore the details <ArrowDown size={11} /></a></div>
        </div>
      </section>
      <section className="aura-wrap aura-section" aria-labelledby="aura-context-title">
        <div className="aura-section-head"><span className="aura-mono">01 / The bigger picture</span><h2 id="aura-context-title">The problem is real.<br /><em>The details matter.</em></h2></div>
        <div className="aura-stat-grid">
          <article className="aura-stat"><div className="aura-stat-number">52<span>%</span></div><p data-testid="text-statistic">Of young EU respondents surveyed said they had bought at least one counterfeit product online in the previous 12 months, knowingly or unknowingly.</p><a className="aura-source" href={EUIPO} target="_blank" rel="noopener noreferrer" data-testid="link-source-euipo">EUIPO · IP and Youth Scoreboard, 2022 <ArrowUpRight size={12} /></a></article>
          <article className="aura-stat"><div className="aura-stat-number">62<span>%</span></div><p>Clothing, footwear and leather goods made up 62% of seized counterfeit goods worldwide.</p><a className="aura-source" href={OECD} target="_blank" rel="noopener noreferrer">OECD–EUIPO · Mapping Global Trade in Fakes, 2025 <ArrowUpRight size={12} /></a></article>
        </div>
      </section>
      <section className="aura-wrap aura-section" id="aura-checks" aria-labelledby="aura-checks-title">
        <div className="aura-section-head"><span className="aura-mono">02 / The field of view</span><h2 id="aura-checks-title">What Fakeless checks<span className="aura-accent">.</span></h2></div>
        <div className="aura-checks-layout">
          <div className="aura-evidence-art" role="img" aria-label="Illustrative monochrome textile and zipper study, not an analysis reference"><i className="aura-corner tl" /><i className="aura-corner br" /><div className="aura-art-label aura-mono">Look beyond the label.<span>Illustrative textile study / Not a check result</span></div></div>
          <div>{categories.map(([name, detail], index) => <div className="aura-category" key={name}><button onClick={() => setOpenCategory(openCategory === index ? null : index)} aria-expanded={openCategory === index} aria-controls={`aura-category-${index}`}><span className="aura-mono">0{index + 1}</span><span>{name}</span>{openCategory === index ? <Minus /> : <Plus />}</button>{openCategory === index && <p id={`aura-category-${index}`}>{detail}</p>}</div>)}<p className="aura-category-note">Coverage varies by item. We show your screening tier before photos, rather than imply every item has an exact reference match.</p></div>
        </div>
      </section>
      <section className="aura-wrap aura-section" id="aura-method" aria-labelledby="aura-method-title">
        <div className="aura-section-head"><span className="aura-mono">03 / Know the limits</span><div><h2 id="aura-method-title">Not every item.<br /><em>The same depth.</em></h2><p className="aura-tiers-intro">Three levels of screening. The evidence available determines how far a check can go. None is a certificate of authenticity.</p></div></div>
        {[
          ["01 / When a reference exists", "Model-specific", "Enabled live profiles compare visible details with documented references for the exact model. Demo references are never used to verify real listings."],
          ["02 / When the category is known", "Category", "Check photo usability, read visible text and codes, and record expected details. No exact model-reference match is implied."],
          ["03 / When coverage is limited", "Basic", "For items outside the supported categories, record photo quality and visible evidence. Limited coverage means limited conclusions."],
        ].map(([label, title, text]) => <article className="aura-tier" key={title}><span className="aura-mono">{label}</span><h3>{title}</h3><p>{text}</p></article>)}
      </section>
      <section className="aura-process"><div className="aura-wrap aura-section">
        <div className="aura-section-head"><span className="aura-mono">04 / Before you publish</span><h2>A better record.<br />Not another guess.</h2></div>
        <div className="aura-step-list"><article className="aura-step"><span className="aura-mono">01 — Capture</span><h3>Show the small things.</h3><p>Use your phone camera or upload photos of your own clothes. Capture labels, logos, hardware and construction. Blurry details need a retake, not a confident answer.</p></article><article className="aura-step"><span className="aura-mono">02 — Review</span><h3>See what needs a pause.</h3><p>Review the findings and screening tier, retake missing evidence, and seek expert help when a concern remains. Publishing here is a mock marketplace action.</p></article></div>
      </div></section>
      <section className="aura-wrap aura-network-section"><MarketplaceNetwork /></section>
      <section className="aura-wrap aura-section" aria-labelledby="aura-live-title">
        <div className="aura-live-head"><h2 id="aura-live-title">On the record.</h2><span className="aura-mono">Live checks / Demo excluded</span></div>
        <div className="aura-live-grid"><div><h3>Live check outcomes</h3>
          {stats.isLoading ? <p role="status">Loading outcomes…</p> : stats.isError ? <p role="alert">{apiError(stats.error).message} <button onClick={() => stats.refetch()}>Retry</button></p> : s && <>
            <div className="aura-counts">{[["Passed", s.passed], ["Photo checked", s.photoCheckComplete], ["Retake", s.retakeRequested], ["Review", s.manualReview]].map(([label, count]) => <div key={label}><strong>{count}</strong><span>{label}</span></div>)}</div>
            <p className="aura-live-note">{s.inProgress} in progress · {s.published} mock published · {s.total} total<br />A completed photo check does not mean an item is authentic.</p>
          </>}
        </div><div><h3>Recent live checks</h3>
          {checks.isLoading ? <p role="status">Loading checks…</p> : checks.isError ? <p role="alert">{apiError(checks.error).message} <button onClick={() => checks.refetch()}>Retry</button></p> : checks.data?.length ? <div className="aura-recent">{checks.data.map(c => <Link key={c.id} href={c.status === "in_progress" ? `/check/${c.id}` : `/check/${c.id}/result`}><div><strong>{c.profileName}</strong><small>{money(c.askingPrice, c.currency)} · {new Date(c.createdAt).toLocaleDateString()}</small></div><OutcomeChip status={c.status} /></Link>)}</div> : <div className="aura-empty"><ScanLine size={32} strokeWidth={1} /><div><h4>The bench is empty.</h4><p>No live checks yet. Your first check will appear here.</p></div></div>}
        </div></div>
        {s && !s.visionConfigured && <p className="aura-live-note" data-testid="text-vision-not-configured">Live photo analysis is not configured yet. You can explore the capture flow; photo analysis needs a server-side OpenAI key. The five sample demos work without a key.</p>}
      </section>
      <section className="aura-wrap aura-cta"><span className="aura-mono">The next listing deserves a closer look.</span><h2>Less assumption.<br /><em>More evidence.</em></h2><Link className="aura-button" href="/check/new">Start a listing check <ArrowUpRight size={17} /></Link><p>Fakeless screens for visible discrepancies only. It does not authenticate items, certify originality or replace a qualified expert.</p></section>
      <footer className="aura-wrap aura-footer"><Link className="aura-wordmark" href="/">fakeless<span>.</span></Link><p>For the details worth documenting. For the questions worth asking.<br />Evidence before listing. Never a guarantee of authenticity.</p><a href={OECD} target="_blank" rel="noopener noreferrer" className="aura-source">OECD–EUIPO counterfeit trade report <ArrowUpRight size={12} /></a></footer>
    </main>
  );
}

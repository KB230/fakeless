import "./_aura.css";
import { useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Minus, X, ScanLine, Play } from "lucide-react";
import { useGetStatsSummary, getGetStatsSummaryQueryKey, useListChecks, getListChecksQueryKey } from "./_api";

// Redesign of the extracted Current homepage. Its offline resource hooks are
// preserved: no fabricated live checks, no authentication or analysis calls.
const EUIPO = "https://euipo.europa.eu/tunnel-web/secure/webdav/guest/document_library/observatory/documents/reports/IP_youth_scoreboard_study_2022/executiveSummary/executive_summary_2022_en.pdf";
const OECD = "https://www.oecd.org/en/publications/mapping-global-trade-in-fakes-2025_94d3b29f-en.html";
const categories = [
  { name: "Sneakers", detail: "Record the shape, stitching, tongue label, size tag and outsole. Available model references can add context; a matching reference is not guaranteed." },
  { name: "Streetwear", detail: "Look closely at print placement, embroidery, neck labels, care tags and seams. Document details that a buyer would otherwise miss." },
  { name: "Outerwear", detail: "Capture the logo, wash tag, zipper and seam tape. Compare model-specific details only when a suitable reference is available." },
  { name: "Handbags and leather goods", detail: "Record hardware, lining, stitching, stamps and labels. Material appearance alone cannot establish authenticity." },
  { name: "Hats and caps", detail: "Photograph the embroidery, inside labels, construction and fastening. The check records visible details, not proof of origin." },
];

export function Aura() {
  const stats = useGetStatsSummary({ query: { queryKey: getGetStatsSummaryQueryKey() } });
  const params = { limit: 5 };
  const checks = useListChecks(params, { query: { queryKey: getListChecksQueryKey(params) } });
  const [openCategory, setOpenCategory] = useState<number | null>(2);
  const demoRef = useRef<HTMLDialogElement>(null);
  const s = stats.data;

  return (
    <main className="aura" id="aura-top">
      <div className="aura-wrap">
        <nav className="aura-nav" aria-label="Main navigation">
          <a className="aura-wordmark" href="#aura-top" aria-label="Fakeless home">fakeless<span>.</span></a>
          <div className="aura-navlinks">
            <a href="#aura-checks">What we check</a>
            <a href="#aura-method">The approach</a>
            <a href="/check/new" target="_top" className="aura-navcheck">Start a check <ArrowUpRight size={16} /></a>
          </div>
        </nav>
      </div>

      <section className="aura-hero">
        <div className="aura-wrap aura-reveal">
          <div className="aura-hero-meta aura-mono"><span>A closer look. Before it goes live.</span><span>Evidence before assumption / 001</span></div>
          <h1 data-testid="text-headline">Catch counterfeit<br className="aura-desktop-break" /> warning signs<br /> <em>before you list.</em></h1>
          <div className="aura-hero-bottom">
            <div>
              <p className="aura-hero-copy">Good listings start with a closer look. Record the visible details, spot discrepancies and know what still needs a second opinion.</p>
              <div className="aura-actions">
                <a className="aura-button" href="/check/new" target="_top" data-testid="link-start-check">Start a listing check <ArrowUpRight size={17} /></a>
                <button className="aura-button secondary" onClick={() => demoRef.current?.showModal()} data-testid="link-try-demo"><Play size={13} /> Try a demo</button>
              </div>
            </div>
            <div className="aura-caption aura-mono">Study 001 — construction detail<br />Look closer. Leave a record.</div>
          </div>
          <div className="aura-hero-foot aura-mono"><span><i className="aura-dot" /> A screening tool. Not authentication.</span><span>Explore the details <ArrowDown size={11} style={{ display: "inline", marginLeft: 8 }} /></span></div>
        </div>
      </section>

      <section className="aura-wrap aura-section" aria-labelledby="aura-context-title">
        <div className="aura-section-head">
          <span className="aura-mono">01 / The bigger picture</span>
          <h2 id="aura-context-title">The problem is real.<br /><em>The details matter.</em></h2>
        </div>
        <div className="aura-stat-grid">
          <article className="aura-stat">
            <div className="aura-stat-number">52<span>%</span></div>
            <p data-testid="text-statistic">Of young EU respondents surveyed said they had bought at least one counterfeit product online in the previous 12 months, knowingly or unknowingly.</p>
            <a className="aura-source" href={EUIPO} target="_blank" rel="noopener noreferrer" data-testid="link-source-euipo">EUIPO · IP and Youth Scoreboard, 2022 <ArrowUpRight size={12} /></a>
          </article>
          <article className="aura-stat">
            <div className="aura-stat-number">62<span>%</span></div>
            <p>Of global counterfeit seizures in 2020–21 involved clothing, footwear and leather goods. The categories resellers handle every day.</p>
            <a className="aura-source" href={OECD} target="_blank" rel="noopener noreferrer">OECD–EUIPO · Mapping Global Trade in Fakes, 2025 <ArrowUpRight size={12} /></a>
          </article>
        </div>
      </section>

      <section className="aura-wrap aura-section" id="aura-checks" aria-labelledby="aura-checks-title">
        <div className="aura-section-head"><span className="aura-mono">02 / The field of view</span><h2 id="aura-checks-title">What Fakeless checks<span style={{ color: "var(--a-accent)" }}>.</span></h2></div>
        <div className="aura-checks-layout">
          <div className="aura-evidence-art" role="img" aria-label="Monochrome macro study of fabric folds and zipper construction">
            <i className="aura-corner tl" /><i className="aura-corner br" />
            <div className="aura-art-label aura-mono">Look beyond the label.<span>Illustrative textile study / Not a check result</span></div>
          </div>
          <div>
            {categories.map((category, index) => (
              <div className="aura-category" key={category.name}>
                <button onClick={() => setOpenCategory(openCategory === index ? null : index)} aria-expanded={openCategory === index} aria-controls={`aura-category-${index}`}>
                  <span className="aura-mono">0{index + 1}</span><span>{category.name}</span>{openCategory === index ? <Minus /> : <Plus />}
                </button>
                {openCategory === index && <p id={`aura-category-${index}`}>{category.detail}</p>}
              </div>
            ))}
            <p className="aura-category-note">Coverage varies by item. We tell you the available screening tier, rather than imply every item has an exact reference match.</p>
          </div>
        </div>
      </section>

      <section className="aura-wrap aura-section" id="aura-method" aria-labelledby="aura-method-title">
        <div className="aura-section-head">
          <span className="aura-mono">03 / Know the limits</span>
          <div><h2 id="aura-method-title">Not every item.<br /><em>The same depth.</em></h2><p className="aura-tiers-intro">Three levels of screening. The evidence available determines how far a check can go. None is a certificate of authenticity.</p></div>
        </div>
        {[
          ["01 / When a reference exists", "Model-specific", "Visible details are compared with an available reference for the identified model. This is the most specific tier, not a guarantee of authenticity."],
          ["02 / When the category is known", "Category", "Construction, labels and expected details are screened at category level. No exact model-reference match is implied."],
          ["03 / When coverage is limited", "Basic", "Photo quality and visible evidence are recorded. Limited coverage means limited conclusions; further review may be needed."],
        ].map(([label, title, text]) => <article className="aura-tier" key={title}><span className="aura-mono">{label}</span><h3>{title}</h3><p>{text}</p></article>)}
      </section>

      <section className="aura-process">
        <div className="aura-wrap aura-section">
          <div className="aura-section-head"><span className="aura-mono">04 / Before you publish</span><h2>A better record.<br />Not another guess.</h2></div>
          <div className="aura-step-list">
            <article className="aura-step"><span className="aura-mono">01 — Capture</span><h3>Show the small things.</h3><p>Add clear, close-up photos of the details requested for your item: labels, logos, hardware or construction. Blurry details need a retake, not a confident answer.</p></article>
            <article className="aura-step"><span className="aura-mono">02 — Review</span><h3>See what needs a pause.</h3><p>Review the visible findings and the screening tier. Record what was checked, retake missing evidence, and seek expert help when a concern remains.</p></article>
          </div>
        </div>
      </section>

      <section className="aura-wrap aura-section" aria-labelledby="aura-live-title">
        <div className="aura-live-head"><h2 id="aura-live-title">On the record.</h2><span className="aura-mono">Prototype / Empty mock data</span></div>
        <div className="aura-live-grid">
          <div>
            <h3>Live check outcomes</h3>
            {stats.isError ? <p>Outcomes could not load. <button onClick={() => stats.refetch()}>Retry</button></p> : <div className="aura-counts" aria-label="No live check outcomes">
              {[["Photo check complete", s.photoCheckComplete], ["Retake requested", s.retakeRequested], ["Needs review", s.manualReview]].map(([label, count]) => <div key={label}><strong>{count}</strong><span>{label}</span></div>)}
            </div>}
            <p className="aura-live-note">{s.inProgress} in progress · {s.published} published · {s.total} total<br />A completed photo check does not mean an item is authentic.</p>
          </div>
          <div>
            <h3>Recent live checks</h3>
            {checks.isError ? <p>Recent checks could not load. <button onClick={() => checks.refetch()}>Retry</button></p> : <div className="aura-empty"><ScanLine size={32} strokeWidth={1} /><div><h4>The bench is empty.</h4><p>No live checks yet. Your first check will appear here.</p></div></div>}
          </div>
        </div>
        {!s.visionConfigured && <p className="aura-live-note" data-testid="text-vision-not-configured">Live photo analysis is not configured in this prototype. The demo is illustrative only; no photos are analysed.</p>}
      </section>

      <section className="aura-wrap aura-cta">
        <span className="aura-mono">The next listing deserves a closer look.</span>
        <h2>Less assumption.<br /><em>More evidence.</em></h2>
        <a className="aura-button" href="/check/new" target="_top">Start a listing check <ArrowUpRight size={17} /></a>
        <p>Fakeless screens for visible discrepancies only. It does not authenticate items, certify originality or replace a qualified expert.</p>
      </section>
      <footer className="aura-wrap aura-footer">
        <a className="aura-wordmark" href="#aura-top">fakeless<span>.</span></a>
        <p>For the details worth documenting. For the questions worth asking.<br />Evidence before listing. Never a guarantee of authenticity.</p>
        <a href="https://arcteryx.com/us/en/help/counterfeit" target="_blank" rel="noopener noreferrer" className="aura-source" data-testid="link-arcteryx">Arc’teryx counterfeit guidance <ArrowUpRight size={12} /></a>
      </footer>

      <dialog ref={demoRef} className="aura-dialog" onClick={(event) => { if (event.target === event.currentTarget) demoRef.current?.close(); }} aria-labelledby="aura-demo-title">
        <header><span className="aura-mono">Illustrative demo / Not a live result</span><button className="aura-close" aria-label="Close demo" onClick={() => demoRef.current?.close()}><X size={22} /></button></header>
        <h2 id="aura-demo-title">A closer look at<br /><em>an outerwear check.</em></h2>
        <p>A sample evidence checklist, not an assessment of a real garment. This example uses category screening: no exact model reference is available.</p>
        {[["Logo detail", "Record embroidery and placement"], ["Wash tag", "Capture both sides, in focus"], ["Zipper", "Show the pull and hardware markings"], ["Seam tape", "Photograph the inside construction"]].map(([label, note]) => <div className="aura-demo-row" key={label}><span>{label}</span><span>{note}</span></div>)}
        <p style={{ marginTop: 22 }}>If a detail is unclear, request a retake. If a discrepancy remains, pause and seek an expert opinion. No authenticity verdict is issued.</p>
        <button className="aura-button" onClick={() => demoRef.current?.close()}>Back to the homepage <ArrowRight size={16} /></button>
      </dialog>
    </main>
  );
}

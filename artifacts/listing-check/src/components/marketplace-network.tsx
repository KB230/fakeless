import { useState } from "react";
import "./marketplace-network.css";

const marketplaces = [
  { name: "eBay", x: 50, y: 13 },
  { name: "Depop", x: 76, y: 24 },
  { name: "Mercari", x: 87, y: 50 },
  { name: "Vinted", x: 76, y: 76 },
  { name: "Facebook", x: 50, y: 87 },
  { name: "Whatnot", x: 24, y: 76 },
  { name: "Poshmark", x: 13, y: 50 },
  { name: "Etsy", x: 24, y: 24 },
];

/** Decorative concept diagram, not a list of connected integrations. */
export function MarketplaceNetwork() {
  const [paused, setPaused] = useState(false);
  return (
    <section className={`marketplace-network ${paused ? "network-paused" : ""}`} aria-labelledby="network-title">
      <div className="network-heading">
        <span className="network-kicker">A closer look, before the listing</span>
        <h2 id="network-title">Many marketplaces.<br /><em>One screening step.</em></h2>
        <p>A vision for safer resale: put visible evidence before the listing, wherever your sellers sell.</p>
      </div>

      <div className="network-stage" role="img" aria-label="Concept illustration: Fakeless at the center of eBay, Depop, Mercari, Vinted, Facebook, Whatnot, Poshmark and Etsy. These are not connected integrations.">
        <svg className="network-lines" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <radialGradient id="network-fade">
              <stop offset="0%" stopColor="#b6c5a0" stopOpacity=".5" />
              <stop offset="100%" stopColor="#b6c5a0" stopOpacity=".08" />
            </radialGradient>
          </defs>
          {Array.from({ length: 230 }, (_, i) => {
            const angle = i * 2.399963;
            const radius = 10 + Math.sqrt(i / 230) * 57;
            return <circle key={i} cx={50 + Math.cos(angle) * radius} cy={50 + Math.sin(angle) * radius * .84} r={i % 5 === 0 ? .27 : .17} fill="#d1d4ca" opacity={.1 + (i % 7) * .035} />;
          })}
          <circle cx="50" cy="50" r="37" className="network-orbit" />
          <circle cx="50" cy="50" r="26" className="network-orbit network-orbit-inner" />
          {marketplaces.map((m, i) => (
            <g key={m.name}>
              <line x1="50" y1="50" x2={m.x} y2={m.y} stroke="url(#network-fade)" strokeWidth=".24" />
              <path d={`M ${m.x} ${m.y} L 50 50`} className="network-signal" style={{ animationDelay: `${i * -.6}s` }} />
            </g>
          ))}
        </svg>
        <div className="network-hub" aria-hidden="true"><span>f.</span><small>FAKELESS</small></div>
        {marketplaces.map((m) => (
          <div key={m.name} className="network-node" style={{ left: `${m.x}%`, top: `${m.y}%` }} aria-hidden="true">
            <span>{m.name}</span>
          </div>
        ))}
      </div>

      <div className="network-foot">
        <p><span className="network-status-dot" /> Ecosystem concept · Integrations not connected</p>
        <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>
          {paused ? "Play motion" : "Pause motion"}
        </button>
      </div>
    </section>
  );
}

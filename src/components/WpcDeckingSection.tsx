"use client";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuoteCta from "./QuoteCta";

/**
 * WPC Decking — bijela kartica sa panelom lijevo, izbor boje desno.
 * Klik na krug mijenja samo tri stvari: sliku panela, ime varijante i
 * akcentnu boju. Kartica, naslov i specifikacije se ne pomjeraju.
 *
 * Akcentne boje su uzete iz samih uzoraka (ton grebena, ne dna zlijeba),
 * pa svaka ostaje u istoj porodici kao --brand-brown.
 */
type Variant = {
  id: string;
  name: string;
  accent: string;
  swatch: string;
  panel: string;
};

const variants: Variant[] = [
  {
    id: "grafit",
    name: "Grafit",
    accent: "#72796f",
    swatch: "/images/wpc/swatch-grafit.webp",
    panel: "/images/wpc/panel-grafit.webp",
  },
  {
    id: "smedji-hrast",
    name: "Smeđi hrast",
    accent: "#7e5f46",
    swatch: "/images/wpc/swatch-smedji-hrast.webp",
    panel: "/images/wpc/panel-smedji-hrast.webp",
  },
  {
    id: "antracyt",
    name: "Antracyt",
    accent: "#464948",
    swatch: "/images/wpc/swatch-antracyt.webp",
    panel: "/images/wpc/panel-antracyt.webp",
  },
  {
    id: "svijetlo-smedja",
    name: "Svijetlo smeđa",
    accent: "#756041",
    swatch: "/images/wpc/swatch-svijetlo-smedja.webp",
    panel: "/images/wpc/panel-svijetlo-smedja.webp",
  },
];

const specs = [
  ["Visina profila", "26 mm"],
  ["Širina", "218 mm"],
  ["Širina lamele", "36,7 mm"],
];

/**
 * Presjek profila. Mjere su u jedinicama viewBoxa jednakim milimetrima:
 * 5 lamela po 36,7 mm i 4 zlijeba po 8,6 mm daju tacno 218 mm.
 */
function CrossSection() {
  const LAMELA = 36.7;
  const ZLIJEB = 8.6;
  const X0 = 12;
  const Y0 = 30;
  const H = 26;
  const lamele = [0, 1, 2, 3, 4].map((i) => X0 + i * (LAMELA + ZLIJEB));
  const kraj = X0 + 218;

  return (
    <svg className="wpc-section-svg" viewBox="0 0 300 100" role="img" aria-label="Presjek WPC profila sa mjerama">
      <g className="wpc-profile">
        {lamele.map((x) => (
          <rect key={x} x={x} y={Y0} width={LAMELA} height={H} rx="1.5" />
        ))}
      </g>
      <g className="wpc-dim">
        {/* sirina jedne lamele */}
        <line x1={X0} y1="20" x2={X0 + LAMELA} y2="20" />
        <line x1={X0} y1="16" x2={X0} y2="24" />
        <line x1={X0 + LAMELA} y1="16" x2={X0 + LAMELA} y2="24" />
        <text x={X0 + LAMELA / 2} y="11" textAnchor="middle">36,7 mm</text>

        {/* ukupna sirina */}
        <line x1={X0} y1="72" x2={kraj} y2="72" />
        <line x1={X0} y1="68" x2={X0} y2="76" />
        <line x1={kraj} y1="68" x2={kraj} y2="76" />
        <text x={(X0 + kraj) / 2} y="88" textAnchor="middle">218 mm</text>

        {/* visina profila */}
        <line x1={kraj + 12} y1={Y0} x2={kraj + 12} y2={Y0 + H} />
        <line x1={kraj + 8} y1={Y0} x2={kraj + 16} y2={Y0} />
        <line x1={kraj + 8} y1={Y0 + H} x2={kraj + 16} y2={Y0 + H} />
        <text x={kraj + 22} y={Y0 + H / 2} dominantBaseline="middle">26 mm</text>
      </g>
    </svg>
  );
}

export default function WpcDeckingSection() {
  const [activeId, setActiveId] = useState(variants[0].id);
  const active = variants.find((v) => v.id === activeId) ?? variants[0];

  return (
    <section
      className="wpc-section"
      aria-labelledby="wpc-title"
      style={{ ["--wpc-accent" as string]: active.accent }}
    >
      <div className="wpc-card">
        <div className="wpc-card-media">
          <AnimatePresence initial={false}>
            <motion.div
              key={active.id}
              className="wpc-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <Image
                src={active.panel}
                alt={`WPC Decking panel — ${active.name}`}
                fill
                sizes="(max-width: 900px) 70vw, 320px"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="wpc-card-caption">
          <small>WPC Decking</small>
          <strong>{active.name}</strong>
        </div>
      </div>

      <div className="wpc-copy">
        <span className="wpc-lead">PRIRODA U VAŠEM DOMU</span>
        <h2 id="wpc-title">WPC Decking</h2>
        <QuoteCta className="cta-dot wpc-cta">
          <i /> Pogledaj ponudu
        </QuoteCta>

        <div className="wpc-swatches" role="radiogroup" aria-label="Boja panela">
          {variants.map((v) => {
            const isActive = v.id === active.id;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={v.name}
                className={`wpc-swatch${isActive ? " is-active" : ""}`}
                onClick={() => setActiveId(v.id)}
              >
                <Image src={v.swatch} alt="" width={320} height={320} />
                {isActive && (
                  <motion.span
                    layoutId="wpc-ring"
                    className="wpc-swatch-ring"
                    aria-hidden="true"
                    style={{ borderColor: v.accent }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="wpc-section-detail">
          <CrossSection />
          <dl className="wpc-specs">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

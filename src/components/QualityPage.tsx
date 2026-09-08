"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

const qualityImages = {
  clickLock: "/images/quality/quality-click-lock-wide.webp",
  authentic: "/images/quality/quality-authentic-decor.webp",
  precision: "/images/quality/quality-precision-fit.webp",
  resistance: "/images/quality/quality-resistance-room.webp",
  maintenance: "/images/quality/quality-easy-maintenance.webp",
  longLife: "/images/quality/quality-long-life.webp",
  wear: "/images/quality/quality-wear-layer.webp",
  core: "/images/quality/quality-stable-core.webp",
  materials: "/images/quality/quality-selected-materials.webp",
  interior: "/images/quality/quality-main-interior.webp",
};


const accordionItems = [
  { title: "Provjereni proizvođači", copy: "U ponudi okupljamo kolekcije proizvođača poznatih po pouzdanoj izradi, stabilnim materijalima i dosljednom kvalitetu završne obrade." },
  { title: "Otpornost i dugovječnost", copy: "Pouzdane kolekcije za domove i poslovne prostore, odabrane za svakodnevno korištenje i dug vijek trajanja.", stat: "20+", statLabel: "godina iskustva", image: qualityImages.clickLock },
  { title: "Stručna podrška", copy: "Pomažemo pri izboru dekora, klase otpornosti, debljine i potrebne količine poda za konkretan prostor." },
];

export function QualityAccordionSection() {
  const [open, setOpen] = useState(1);
  return (
    <section className="quality-section quality-accordion" aria-labelledby="quality-intro-title">
      {/* Isti slog kao izjava o firmi: natpis, serif recenica lijevo, podnozje. */}
      <div className="quality-statement">
        <span className="qs-label">VIŠE O KVALITETU</span>
        <h2 id="quality-intro-title">
          Kvalitet poda počinje od materijala, <em>završava se osjećajem doma.</em>
        </h2>
        <p className="qs-lede">
          Pažljivo biramo kolekcije koje spajaju trajnost, preciznu izradu i bezvremenski izgled.
        </p>
        <div className="qs-foot">
          <span className="qs-kicker">
            <i aria-hidden="true" />
            2000 — DANAS · ISKUSTVO U PODNIM OBLOGAMA
          </span>
        </div>
      </div>
      <div className="quality-accordion-list">
            {accordionItems.map((item, index) => {
              const isOpen = open === index;
              const id = `quality-panel-${index}`;
              return <div className={`quality-accordion-item${isOpen ? " is-open" : ""}`} key={item.title}>
                <button className="quality-accordion-trigger" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? -1 : index)}>
                  <span className="quality-number">0{index + 1}</span><span className="quality-trigger-copy"><strong>{item.title}</strong></span><ChevronDown aria-hidden="true" />
                </button>
                <div className="quality-accordion-panel" id={id} role="region" aria-hidden={!isOpen}>
                  <div className="quality-panel-inner">
                    {item.image && <Image src={item.image} alt="Detalj preciznog click-lock spoja podnih dasaka" width={620} height={460} />}
                    <div className="quality-panel-copy">{item.stat && <div className="quality-stat"><b>{item.stat}</b><span>{item.statLabel}</span></div>}<p>{item.copy}</p></div>
                    {item.image && <Link className="quality-outline-link" href="/proizvodi">Istražite kolekcije <ArrowRight size={16} /></Link>}
                  </div>
                </div>
              </div>;
            })}
      </div>
    </section>
  );
}

const standards = [[qualityImages.wear, "Otpornost na habanje", "Detalj površine i ruba laminata"], [qualityImages.core, "Stabilna konstrukcija", "Presjek naslaganih podnih dasaka"], [qualityImages.materials, "Pouzdano porijeklo", "Tri odabrana uzorka poda"]] as const;
export default function QualityPage() { return <main className="quality-page"><QualityAccordionSection /></main>; }

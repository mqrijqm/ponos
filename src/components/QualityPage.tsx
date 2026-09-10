"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import Znak from "./landing/Znak";

const qualityImages = {
  clickLock: "/images/quality/quality-click-lock-warm.webp",
  deckingTerrace: "/images/quality/quality-decking-terrace.webp",
  samplesDesk: "/images/quality/quality-samples-desk.webp",
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
  { title: "Provjereni proizvođači", copy: "U ponudi okupljamo kolekcije proizvođača poznatih po pouzdanoj izradi, stabilnim materijalima i dosljednom kvalitetu završne obrade.", image: qualityImages.clickLock, alt: "Presjek dvije podne daske sa click-lock spojem" },
  { title: "Otpornost i dugovječnost", copy: "Pouzdane kolekcije za domove i poslovne prostore, odabrane za svakodnevno korištenje i dug vijek trajanja.", stat: "20+", statLabel: "godina iskustva", image: qualityImages.deckingTerrace, alt: "WPC decking pod na natkrivenoj terasi" },
  { title: "Stručna podrška", copy: "Pomažemo pri izboru dekora, klase otpornosti, debljine i potrebne količine poda za konkretan prostor.", image: qualityImages.samplesDesk, alt: "Uzorci podova i metar na stolu pri odabiru dekora" },
];

export function QualityAccordionSection() {
  const [open, setOpen] = useState(1);
  return (
    <section className="quality-section quality-accordion" aria-labelledby="quality-intro-title">
      {/* Slog lijevo, popis desno — dvije kolone koje se na uskom slazu jedna
          ispod druge. */}
      <div className="quality-split">
      {/* Isti slog kao izjava o firmi: serif recenica lijevo, podnozje.
          Na telefonu podnozje ide na vrh kao traka — CSS ga preslaze, pa
          redoslijed u kodu ostaje onaj koji siri ekran i dalje crta. */}
      <div className="quality-statement">
        <h2 id="quality-intro-title">
          Kvalitet poda počinje od materijala, <em>završava se osjećajem doma.</em>
        </h2>
        <p className="qs-lede">
          Pažljivo biramo kolekcije koje spajaju trajnost, preciznu izradu i bezvremenski izgled.
        </p>
        {/* Isti znak koji stoji uz uvodnu recenicu. Za sada samo na telefonu:
            na sirokom ekranu slog ove sekcije nije diran. */}
        <Znak className="qs-znak" />
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
                    {item.image && <Image src={item.image} alt={item.alt} width={1160} height={506} />}
                    <div className="quality-panel-copy">{item.stat && <div className="quality-stat"><b>{item.stat}</b><span>{item.statLabel}</span></div>}<p>{item.copy}</p></div>
                  </div>
                </div>
              </div>;
            })}
      </div>
      </div>
    </section>
  );
}

const standards = [[qualityImages.wear, "Otpornost na habanje", "Detalj površine i ruba laminata"], [qualityImages.core, "Stabilna konstrukcija", "Presjek naslaganih podnih dasaka"], [qualityImages.materials, "Pouzdano porijeklo", "Tri odabrana uzorka poda"]] as const;
export default function QualityPage() { return <main className="quality-page"><QualityAccordionSection /></main>; }

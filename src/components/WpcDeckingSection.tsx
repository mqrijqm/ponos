"use client";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * WPC Decking — kartica sa panelom lijevo, izbor boje desno.
 * Klik na krug mijenja samo dvije stvari: sliku panela i ime varijante.
 * Kartica se ne pomjera.
 *
 * Natpis, naslov, dugme, crtez presjeka i tabela mjera su izasli; ostaje
 * ono sto ova sekcija radi a nijedna druga ne moze — pokaze dasku u boji
 * koju neko izabere.
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

export default function WpcDeckingSection() {
  const [activeId, setActiveId] = useState(variants[0].id);
  const active = variants.find((v) => v.id === activeId) ?? variants[0];

  return (
    <section
      className="wpc-section"
      aria-label="WPC Decking — izbor boje"
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
      </div>
    </section>
  );
}

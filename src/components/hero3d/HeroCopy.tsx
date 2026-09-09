"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { usePrefersReducedMotion } from "../hero/hooks";

/**
 * Naslov i podnaslov preko canvasa. Ista struktura kao natpis koji je hero
 * nosio ranije: rijec po rijec, svaka krece zamucena i malo nize, pa se u
 * istom pokretu izostri, spusti i postane puna. Izlaz je isti obrnuto i brze
 * — rijeci se zamute i podignu navise.
 *
 * Razlika je u okidacu: nije vrijeme, nego scroll. Natpis ceka da se daske
 * odvoje i smire, pa tek onda ulazi — i ostaje do kraja sekvence. Roditelj to
 * javlja kroz `faza`, i to samo kad se pređe prag, ne na svaki piksel scrolla,
 * inace bi svaki otkucaj bio novi render.
 *
 * TEKST JE PLACEHOLDER — upisi svoj u NASLOV i PODNASLOV ispod.
 */

const NASLOV = "Ovdje ide naslov heroja";
const PODNASLOV = "Ovdje ide podnaslov, jedna rečenica";

/** Malo iznad vertikalne sredine ekrana. */
const OD_VRHA = "42%";

/* Ulaz je mek i razvucen, izlaz kraci i sa manjim korakom izmedu rijeci. */
const ULAZ = { duration: 1.05, stagger: 0.12, ease: "power3.out" } as const;
const IZLAZ = { duration: 0.6, stagger: 0.07, ease: "power2.in" } as const;

const ULAZ_OD = { opacity: 0, y: 18, filter: "blur(10px)" } as const;
const IZLAZ_NA = { opacity: 0, y: -16, filter: "blur(9px)" } as const;

/** `skriven` je i pocetno stanje: natpis ceka daske. */
export type Faza = "skriven" | "vidljiv";

function Rijeci({ tekst, klasa }: { tekst: string; klasa: string }) {
  const rijeci = tekst.split(" ");
  return (
    <>
      {rijeci.map((rijec, i) => (
        <span key={`${rijec}-${i}`}>
          <span data-rijec className={klasa}>
            {rijec}
          </span>
          {/* Razmak stoji van spana — inline element se lomi samo na njemu. */}
          {i < rijeci.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export default function HeroCopy({ faza }: { faza: Faza }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mirno = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rijeci = wrap.querySelectorAll<HTMLElement>("[data-rijec]");
    if (!rijeci.length) return;

    /* Bez animacije natpis samo stoji, i ostaje — nema ni ulaza ni izlaza. */
    if (mirno) {
      gsap.set(rijeci, { opacity: 1, y: 0, filter: "none" });
      return;
    }

    if (faza === "vidljiv") {
      gsap.to(rijeci, { opacity: 1, y: 0, filter: "blur(0px)", ...ULAZ, overwrite: true });
    } else {
      /* Vracanje uz scroll: rijeci se zamute i podignu, pa cekaju iznova. */
      gsap.to(rijeci, { ...IZLAZ_NA, ...IZLAZ, overwrite: true });
    }
  }, [faza, mirno]);

  return (
    <div
      ref={wrapRef}
      className="hero3d-copy"
      style={{ top: OD_VRHA }}
    >
      <h1 className="hero3d-title">
        <Rijeci tekst={NASLOV} klasa="hero3d-word" />
      </h1>
      <p className="hero3d-sub">
        <Rijeci tekst={PODNASLOV} klasa="hero3d-word" />
      </p>
    </div>
  );
}

export { ULAZ_OD };

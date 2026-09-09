"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import QuoteCta from "./QuoteCta";
import { usePrefersReducedMotion } from "./hero/hooks";

/**
 * Dugme preko heroja. Naslov je otisao u HeroText — tamo ulazi rijec po
 * rijec, pa mu je i mjesto u sopstvenoj komponenti.
 *
 * Komponenta ne mjeri nista sama: `scrollProgress` (0-1) joj daje roditelj, a
 * dugme se pojavi kad on pređe CTA_AT.
 */

/** Napredak (0-1) na kojem dugme ulazi. */
const CTA_AT = 0.88;

const COPY = {
  cta: "Vidi ponudu",
};

export default function HeroOverlay({ scrollProgress = 0 }) {
  const ctaWrapRef = useRef(null); // nosi pojavljivanje (opacity + y)
  const reducedMotion = usePrefersReducedMotion();

  /* Pamti sta je vec prikazano, da isti prelaz ne krene dvaput. */
  const shown = useRef({ cta: false });

  useEffect(() => {
    const toggle = (element, key, visible, offset) => {
      if (!element || shown.current[key] === visible) return;
      shown.current[key] = visible;

      if (reducedMotion) {
        gsap.set(element, { opacity: visible ? 1 : 0, y: 0 });
        return;
      }
      gsap.to(element, {
        opacity: visible ? 1 : 0,
        y: visible ? 0 : offset,
        duration: visible ? 0.8 : 0.4,
        ease: "power3.out",
        overwrite: true,
      });
    };

    // dugme: izrazitiji slide-up, da se primijeti kad kasno uleti
    toggle(ctaWrapRef.current, "cta", scrollProgress > CTA_AT, 28);
  }, [scrollProgress, reducedMotion]);

  return (
    /*
      Sloj pokriva cijeli kadar, ali ne hvata misa - `pointerEvents: none` pusta
      klik i scroll kroz sebe. Samo dugme vraca `auto`, inace se ne bi moglo
      kliknuti.
    */
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // Natpisi stoje visoko u kadru, odmah ispod navbara: tamo im daske
        // ne prolaze kroz slova. 82px je fiksni navbar.
        justifyContent: "flex-start",
        /* Razmak nosi naslov nize od dugmeta: u zavrsnom kadru tako pada ispod
           daske koja prolazi kroz sredinu, umjesto preko nje. Dugme ostaje na
           svom mjestu. */
        gap: "clamp(62px, 15vh, 150px)",
        padding: "calc(82px + clamp(46px, 8.5vh, 108px)) 24px 0",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <div
        ref={ctaWrapRef}
        style={{ zIndex: 6, opacity: 0, transform: "translateY(28px)", pointerEvents: "auto" }}
      >
        {/*
          Isto dugme kao u navbaru: ista komponenta i ista `.cta-dot` klasa,
          pa i isti modal za ponudu. Ovdje se samo vraca `pointerEvents`,
          koji sloj iznad gasi.
        */}
        <QuoteCta className="cta-dot cta-on-video" label="Zatraži ponudu">
          <i /> {COPY.cta}
        </QuoteCta>
      </div>

    </div>
  );
}

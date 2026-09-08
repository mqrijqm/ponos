"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import QuoteCta from "./QuoteCta";
import { usePrefersReducedMotion } from "./hero/hooks";

/**
 * Natpisi preko heroja: naslov ulazi na sredini sekvence, dugme tek pred kraj -
 * kad su daske vec u vazduhu i ima smisla ponuditi sljedeci korak.
 *
 * Komponenta ne mjeri nista sama. Napredak joj daje roditelj (VideoHero), koji
 * ga cita iz samog snimka — tako natpisi prate kadar, a ne scroll.
 *
 * VAZNO za roditelja: `scrollProgress` se NE smije slati na svaku promjenu.
 * Roditelj ga mijenja samo kad pređe jedan od pragova ispod, inace bi svaki
 * otkucaj snimka bio novi render. Vidi HERO_OVERLAY_STOPS.
 */

/** Napredak sekvence (0-1) na kojem se svaki element pojavljuje. */
const TITLE_AT = 0.42;
const CTA_AT = 0.88;

/**
 * Pragovi za roditelja: on salje novi `scrollProgress` samo kad ga napredak
 * pređe, u bilo kom smjeru. Izvezeno da brojevi zive na jednom mjestu.
 */
export const HERO_OVERLAY_STOPS = [TITLE_AT, CTA_AT];

const COPY = {
  title: "Prostor počinje ovdje",
  cta: "Vidi ponudu",
};

const BRAND = "#8b7e6e"; // ista boja kao --brand-muted u globals.css

export default function HeroOverlay({ scrollProgress = 0 }) {
  const titleRef = useRef(null);
  const ctaWrapRef = useRef(null); // nosi pojavljivanje (opacity + y)
  const reducedMotion = usePrefersReducedMotion();

  /* Pamti sta je vec prikazano, da isti prelaz ne krene dvaput. */
  const shown = useRef({ title: false, cta: false });

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

    // naslov: mekan fade, jedva primjetno odozdo
    toggle(titleRef.current, "title", scrollProgress > TITLE_AT, 18);
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
        gap: "clamp(14px, 1.8vw, 22px)",
        padding: "calc(82px + clamp(16px, 3vh, 40px)) 24px 0",
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
        <QuoteCta className="cta-dot" label="Zatraži ponudu">
          <i /> {COPY.cta}
        </QuoteCta>
      </div>

      <h1
        ref={titleRef}
        style={{
          zIndex: 5,
          margin: 0,
          // Sitan razmaknut sans: naslov nosi kadar, ne velicina slova.
          // Na uskom ekranu ide na 12px da razmak ne pokida rijeci.
          fontSize: "clamp(12px, 1.15vw, 17px)",
          fontWeight: 600,
          lineHeight: 1.4,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: BRAND,
          fontFamily: "var(--font-manrope), Arial, Helvetica, sans-serif",
          opacity: 0,
          transform: "translateY(18px)",
        }}
      >
        {COPY.title}
      </h1>
    </div>
  );
}

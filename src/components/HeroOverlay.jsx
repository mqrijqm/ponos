"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { usePrefersReducedMotion } from "./hero/hooks";

/**
 * Natpisi preko heroja: naslov se pojavi na pocetku sekvence, dugme tek na
 * kraju - kad daske vec stoje u sobi i ima smisla ponuditi sljedeci korak.
 *
 * Komponenta ne slusa scroll sama. Napredak joj daje roditelj (ScrollSequenceHero)
 * koji ga ionako racuna za sekvencu; dvije komponente koje mjere isti scroll
 * uvijek se raziđu za koji frejm.
 *
 * VAZNO za roditelja: `scrollProgress` se NE smije slati na svaki frejm scrolla.
 * Hero namjerno drzi napredak u refu, a ne u stateu - state bi znacio novi
 * render 190 puta po prevrtanju. Zato roditelj mijenja state samo kad napredak
 * pređe jedan od pragova ispod. Vidi HERO_OVERLAY_STOPS.
 */

/** Napredak sekvence (0-1) na kojem se svaki element pojavljuje. */
const TITLE_AT = 0.08;
const CTA_AT = 0.88;

/**
 * Pragovi za roditelja: on salje novi `scrollProgress` samo kad ga napredak
 * pređe, u bilo kom smjeru. Izvezeno da brojevi zive na jednom mjestu.
 */
export const HERO_OVERLAY_STOPS = [TITLE_AT, CTA_AT];

const COPY = {
  // Ostatak sajta je na ijekavici ("Pogledaj Katalog", "Kontaktiraj Nas"),
  // pa je i ovo "Otkrij", ne "Otkryj".
  title: "Prostor počinje ovdje",
  cta: "Otkrij više",
  href: "/proizvodi/laminati",
};

const BRAND = "#8b7e6e";       // ista boja kao --brand-muted u globals.css
const BRAND_HOVER = "#6d6251"; // tamnija, za hover

export default function HeroOverlay({ scrollProgress = 0 }) {
  const titleRef = useRef(null);
  const ctaWrapRef = useRef(null); // nosi pojavljivanje (opacity + y)
  const buttonRef = useRef(null);  // nosi hover (podizanje za 2px)
  const [hovered, setHovered] = useState(false);
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

  /* Hover je na samom dugmetu, odvojen od pojavljivanja: da se dvije
     animacije ne otimaju oko iste `y` vrijednosti. */
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    gsap.to(button, {
      backgroundColor: hovered ? BRAND_HOVER : BRAND,
      y: hovered && !reducedMotion ? -2 : 0,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, [hovered, reducedMotion]);

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
        justifyContent: "center",
        gap: "clamp(20px, 3vw, 38px)",
        padding: "0 24px",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <h1
        ref={titleRef}
        style={{
          zIndex: 5,
          margin: 0,
          // 64px je gornja granica; na uskom ekranu bi fiksnih 64px prelomilo
          // naslov u tri reda preko cijele sobe
          fontSize: "clamp(2rem, 5.4vw, 64px)",
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          color: BRAND,
          fontFamily: "var(--font-comfortaa), system-ui, sans-serif",
          opacity: 0,
          transform: "translateY(18px)",
        }}
      >
        {COPY.title}
      </h1>

      <div
        ref={ctaWrapRef}
        style={{ zIndex: 6, opacity: 0, transform: "translateY(28px)" }}
      >
        <a
          ref={buttonRef}
          href={COPY.href}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          style={{
            display: "inline-block",
            padding: "13px 44px",
            background: BRAND,
            color: "#fff",
            border: "none",
            borderRadius: 999,
            fontFamily: "var(--font-comfortaa), system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            cursor: "pointer",
            pointerEvents: "auto",
            willChange: "transform",
          }}
        >
          {COPY.cta}
        </a>
      </div>
    </div>
  );
}

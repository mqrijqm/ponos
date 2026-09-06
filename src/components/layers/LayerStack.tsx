"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

import { useInView, useIsMobile, usePrefersReducedMotion } from "../hero/hooks";
import { BACKGROUND, SCROLL_LENGTH_VH } from "./layer-config";

/**
 * Eksplodirani presjek daske laminata.
 *
 * Sekcija je namjerno prazna - nema ni naslova ni teksta, samo pet slojeva u
 * bijelom prostoru i numerisani markeri. Sadrzaj markera se dopisuje u
 * `layer-config.ts` (polja `naziv` i `opis` u LAYERS).
 *
 * Scroll radi na klasican sticky nacin: sekcija je visoka SCROLL_LENGTH_VH, a
 * unutar nje stoji zalijepljen ekran. Koliko je od te razlike prescrollano - to
 * je progres razdvajanja.
 */
const LayerScene = dynamic(() => import("./LayerScene"), { ssr: false });

export default function LayerStack() {
  const sectionRef = useRef<HTMLElement>(null);

  const { inView, everInView } = useInView(sectionRef);
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `${SCROLL_LENGTH_VH}vh`, background: BACKGROUND }}
    >
      {/* boja je OVDJE, u CSS-u - scena se crta sa alfa kanalom preko toga */}
      <div
        className="sticky top-0 h-svh w-full overflow-hidden"
        style={{ background: BACKGROUND }}
      >
        {everInView && (
          <LayerScene
            sectionRef={sectionRef}
            animated={!reducedMotion}
            isMobile={isMobile}
            active={inView}
          />
        )}
      </div>
    </section>
  );
}

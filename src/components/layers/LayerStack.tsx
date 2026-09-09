"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef } from "react";

import { useInView, useIsMobile, usePrefersReducedMotion } from "../hero/hooks";
import { BACKGROUND, LAYERS, SCROLL_LENGTH_VH } from "./layer-config";

/**
 * Eksplodirani presjek daske laminata.
 *
 * Scroll radi na klasican sticky nacin: sekcija je visoka SCROLL_LENGTH_VH, a
 * unutar nje stoji zalijepljen ekran. Koliko je od te razlike prescrollano - to
 * je progres razdvajanja.
 *
 * Ispod scene stoji legenda sa istim brojevima koji iskacu na modelu. Markeri
 * na daski nose natpis samo na sirokom ekranu i tek kad ima mjesta pored nje;
 * legenda ga nosi uvijek, pa se na telefonu iz brojeva zna sta je koji sloj.
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
      // is-fullbleed: scena i markeri idu preko cijele sirine ekrana, bez
      // bocne margine koju sekcijama inace daje --page-gutter — inace se
      // natpis krajnjeg desnog markera odsijeca na toj ivici.
      className="is-fullbleed relative w-full"
      style={{ height: `${SCROLL_LENGTH_VH}vh`, background: BACKGROUND }}
    >
      {/* boja je OVDJE, u CSS-u - scena se crta sa alfa kanalom preko toga */}
      <div
        className="sticky top-0 flex h-svh w-full flex-col overflow-hidden"
        style={{ background: BACKGROUND }}
      >
        {/* min-h-0 je uslov da se platno steze — bez njega flex dijete ne ide ispod svog sadrzaja. */}
        <div className="relative min-h-0 flex-1">
          {everInView && (
            <LayerScene
              sectionRef={sectionRef}
              animated={!reducedMotion}
              isMobile={isMobile}
              active={inView}
            />
          )}
        </div>

        <ol className="layer-legend">
          {LAYERS.map((layer, i) => (
            <li key={layer.id}>
              {/* Isti znak koji stoji i na modelu, da se red i marker povezu. */}
              <Image
                src={`/images/layers/markers/marker-${i + 1}.svg`}
                alt={`${i + 1}.`}
                width={22}
                height={22}
              />
              <b>{layer.naziv}</b>
              <span>{layer.oznaka}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

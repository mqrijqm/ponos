"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { usePrefersReducedMotion } from "./hero/hooks";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sekcija "Na jednom mjestu" se zaustavi dok se sama ne sastavi.
 *
 * Redoslijed je namjeran: prvo natpis, pa "PONOS PROSTORA" — toliko dugo da se
 * stigne procitati — i tek onda plocice uskacu u kadar. Da idu zajedno, oko bi
 * otislo na slike i naslov bi prosao neprocitan.
 *
 * Plocice ulaze brzo i sa preklapanjem (stagger je kraci od trajanja jednog
 * ulaska), pa djeluju kao jedan pokret a ne kao sedam odvojenih.
 */

/** Koliko scrolla sekcija drzi dok se sastavlja. */
const PIN_LENGTH_VH = 120;

export default function HomeHeroReveal({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const copy = section.querySelector(".home-hero-copy");
    const title = section.querySelector(".home-hero-title");
    const tiles = section.querySelectorAll(".detail-tile");
    if (!copy || !title || !tiles.length) return;

    /*
      Bez animacije nema ni pina ni skrivanja - sve stoji odmah. Pocetno stanje
      se postavlja tek ovdje, u JS-u: da skripta zakaze, sekcija se vidi cijela
      umjesto da ostane prazna.
    */
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.set([copy, title], { opacity: 0, y: 34 });
      gsap.set(tiles, { opacity: 0, scale: 0.62, y: 26 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${PIN_LENGTH_VH}%`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(copy, { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" })
        .to(title, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, ">0.25")
        // plocice tek kad je naslov procitan; brzo i u preklapanju
        .to(
          tiles,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.7)",
            stagger: { each: 0.09, from: "center" },
          },
          ">0.5",
        )
        // prazan hod na kraju: sastavljena sekcija ostane da se vidi
        .to({}, { duration: 0.7 });
    }, section);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="home-hero">
      {children}
    </section>
  );
}

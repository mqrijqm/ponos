"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { usePrefersReducedMotion } from "./hero/hooks";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sekcija "Na jednom mjestu" se sastavi kad udje u kadar.
 *
 * Iznad nje stoji prazan ekran rezervisan za hero, pa se do ove sekcije dolazi
 * scrollom. Zato okidac nije otvaranje stranice — animacija bi prosla dok je
 * niko ne gleda i sekcija bi docekala oko vec sastavljena.
 *
 * Sekcija se ne pinuje: scroll samo kaze kada da krene, dalje ide sama u
 * svom ritmu. Pin bi zaustavio stranicu odmah poslije heroja.
 *
 * Redoslijed je namjeran: prvo natpis, pa "PONOS PROSTORA" — toliko dugo da se
 * stigne procitati — i tek onda plocice uskacu u kadar. Da idu zajedno, oko bi
 * otislo na slike i naslov bi prosao neprocitan.
 *
 * Plocice ulaze brzo i sa preklapanjem (stagger je kraci od trajanja jednog
 * ulaska), pa djeluju kao jedan pokret a ne kao sedam odvojenih.
 */

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
      Bez animacije nema ni skrivanja - sve stoji odmah. Pocetno stanje se
      postavlja tek ovdje, u JS-u: da skripta zakaze, sekcija se vidi cijela
      umjesto da ostane prazna.
    */
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.set([copy, title], { opacity: 0, y: 34 });
      gsap.set(tiles, { opacity: 0, scale: 0.62, y: 26 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            /* Kad je gornja cetvrtina sekcije u kadru — dovoljno rano da natpis
               ne uleti procitan, dovoljno kasno da se ne desi izvan ekrana. */
            start: "top 75%",
            once: true,
          },
        })
        .to(copy, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" })
        .to(title, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, ">-0.35")
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
          ">-0.2",
        );
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="home-hero">
      {children}
    </section>
  );
}

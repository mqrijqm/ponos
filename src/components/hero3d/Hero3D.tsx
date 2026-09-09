"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useInView, useIsMobile, usePrefersReducedMotion } from "../hero/hooks";
import HeroCopy, { Faza } from "./HeroCopy";
import { EKRANA_SCROLLA } from "./floor-config";

gsap.registerPlugin(ScrollTrigger);

/**
 * HERO: pod koji se na scroll raspada.
 *
 * Sekcija je visoka nekoliko ekrana, scena u njoj je sticky, i ta razdaljina
 * scrolla je cijela sekvenca — pod cio, daske se odvajaju i dizu, kamera se
 * gura naprijed kroz prostor. Stranica se ne zakljucava; scroll samo dobija
 * razdaljinu.
 *
 * Canvas se ucitava odvojeno od stranice (`dynamic`, bez SSR-a) i montira tek
 * kad sekcija dođe blizu kadra — three.js je najteži paket na sajtu i ne smije
 * stajati na putu prvom ekranu. Kad hero ode sa ekrana, canvas se demontira i
 * grafička ostaje slobodna za ostatak stranice.
 */

const FloorScene = dynamic(() => import("./FloorScene"), {
  ssr: false,
  loading: () => null,
});

/*
  Natpis ceka daske: ulazi kad se dizanje zavrsi (0.6) i ostaje do kraja.
  Dva praga, ne jedan — bez razmaka bi na granici treperio gore-dolje.
*/
const NATPIS_ULAZI = 0.62;
const NATPIS_ODLAZI = 0.55;

export default function Hero3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const napredak = useRef(0);
  const uzakEkran = useIsMobile();
  const mirno = usePrefersReducedMotion();
  const { inView } = useInView(sectionRef, "300px");
  const [faza, setFaza] = useState<Faza>("skriven");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /* Bez animacije: krajnje stanje, bez scrolla koji nesto vrti. */
    if (mirno) {
      napredak.current = 1;
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      /* Prvi ekran sekcije je sama scena; ostatak visine je razdaljina sekvence. */
      end: () => `+=${window.innerHeight * EKRANA_SCROLLA}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        napredak.current = self.progress;
        /*
          Faza se mijenja samo na pragu, i to sa razmakom izmedu izlaza i
          ulaza — bez tog razmaka bi natpis na granici treperio gore-dolje.
          React na istu vrijednost ne renderuje ponovo.
        */
        if (self.progress > NATPIS_ULAZI) setFaza("vidljiv");
        else if (self.progress < NATPIS_ODLAZI) setFaza("skriven");
      },
    });

    return () => trigger.kill();
  }, [mirno]);

  return (
    <section
      ref={sectionRef}
      className="hero3d is-fullbleed"
      style={{ height: mirno ? "100svh" : `${(1 + EKRANA_SCROLLA) * 100}svh` }}
      aria-label="Laminatne daske se odvajaju od poda i lebde u prostoru"
    >
      <div className="hero3d-stage">
        {inView && <FloorScene napredak={napredak} uzakEkran={uzakEkran} mirno={mirno} />}
        {/*
          Natpis ne hvata misa; scroll i klik prolaze kroz njega. Bez animacije
          nema sta da ceka, pa je odmah vidljiv — to se racuna ovdje, a ne kroz
          setState u efektu, koji bi bio jedan render vise bez potrebe.
        */}
        <HeroCopy faza={mirno ? "vidljiv" : faza} />
      </div>
    </section>
  );
}

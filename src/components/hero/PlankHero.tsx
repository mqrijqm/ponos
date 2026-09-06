"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

import { HERO_CTA, HERO_LOGO, HERO_SIZE } from "./hero-content";
import { SCROLL_PAGES } from "./plank-config";
import { useInView, useIsMobile, usePrefersReducedMotion } from "./hooks";

/**
 * Canvas se ucitava tek na klijentu i tek kad je hero blizu ekrana.
 * Logo je obican HTML pa LCP ne ceka na three.js.
 */
const PlankScene = dynamic(() => import("./PlankScene"), { ssr: false });

/** Boja u logo SVG-u je zapecena; filter je pretvara u cisto bijelo. */
const WHITE_OUT = "[filter:brightness(0)_invert(1)]";

const CENTERED =
  "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6";

function Logo({ white }: { white?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={HERO_LOGO.src}
      alt={HERO_LOGO.alt}
      width={HERO_LOGO.width}
      height={HERO_LOGO.height}
      fetchPriority="high"
      style={{ width: HERO_SIZE.logoWidth }}
      className={`h-auto max-w-full ${white ? WHITE_OUT : ""}`}
    />
  );
}

function CtaButton() {
  return (
    <a
      href={HERO_CTA.href}
      className="pointer-events-auto block transition-transform duration-200 hover:scale-[1.03]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_CTA.src}
        alt={HERO_CTA.alt}
        width={HERO_CTA.width}
        height={HERO_CTA.height}
        style={{ width: HERO_SIZE.ctaWidth }}
        className="h-auto max-w-full"
      />
    </a>
  );
}

export default function PlankHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  const { inView, everInView } = useInView(sectionRef);
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  return (
    /*
      Sekcija je visoka (SCROLL_PAGES + 1) ekrana, a sadrzaj u njoj je sticky.
      Scroll je obican scroll stranice - hero ga samo cita, ne otima ga. Zato
      radi i kad je na stranici Lenis ili GSAP ScrollTrigger.
    */
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `calc(${SCROLL_PAGES + 1} * 100svh)` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-white">
        {everInView && (
          <PlankScene
            animated={!reducedMotion}
            isMobile={isMobile}
            active={inView}
            sectionRef={sectionRef}
            introRef={introRef}
          />
        )}

        {/* ---------------------------------------------------------------
            UVODNI FRAME. Nestaje prije nego stigne prva daska. Sadrzaj,
            putanje i velicine su u hero-content.ts.
            pointer-events-none je namjerno: klik prolazi kroz blok, samo
            dugme ga hvata.

            Kad je animacija iskljucena, ovaj isti blok stoji preko gotovog
            poda, pa logo ide u bijelo da se vidi preko drveta. Dugme je vec
            bijela pilula, njemu ne treba nista.
        ---------------------------------------------------------------- */}
        <div
          ref={introRef}
          className={`${CENTERED} will-change-[opacity,transform]`}
          style={{ gap: HERO_SIZE.gap }}
        >
          <Logo white={reducedMotion} />
          <CtaButton />
        </div>
      </div>
    </section>
  );
}

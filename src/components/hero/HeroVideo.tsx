"use client";

import { useEffect, useRef, useState } from "react";

import { useQuote } from "../QuoteProvider";
import { usePrefersReducedMotion } from "./hooks";

/**
 * Hero: snimak na kojem se panel u sredini mijenja, natpis i dugme dolaze
 * preko njega.
 *
 * Vrijeme se ne broji tajmerom nego se cita sa snimka. Snimak mijenja
 * proizvod svakih ~0.73s; rezovi izmjereni na fajlu stoje na 1.47, 2.17,
 * 2.90, 3.67, 4.40, 5.90, 6.67, 8.17 i 8.93 sekundi. Natpis i dugme ulaze
 * tacno na prva dva reza, pa promjena proizvoda i pojava teksta padaju u isti
 * kadar umjesto da se sudaraju.
 *
 * Zato `timeupdate`, a ne `setTimeout`: tajmer krene od trenutka montiranja,
 * a snimak od trenutka kad ga browser pusti — to nije isto ako je fajl jos u
 * mrezi ili ako je kartica bila u pozadini.
 */

/** Rez na kojem ulazi natpis. */
const REZ_NATPIS = 1.47;
/** Sljedeci rez — dugme. */
const REZ_DUGME = 2.17;

/**
 * Ako snimak ne krene (iOS stednja baterije, blokiran autoplay), natpis ne
 * smije ostati nevidljiv. Poslije ovoliko cekanja se pusta bez snimka.
 */
const REZERVA_MS = 2600;

type Faza = 0 | 1 | 2;

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [faza, setFaza] = useState<Faza>(0);
  const reducedMotion = usePrefersReducedMotion();
  const { openQuote } = useQuote();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /*
      Bez animacije snimak stoji na poster kadru. Faza se tu ne postavlja —
      racuna se pri renderu (`prikazanaFaza`), pa ovdje ostaje samo pauza.
    */
    if (reducedMotion) {
      video.pause();
      return;
    }

    const naVrijeme = () => {
      const t = video.currentTime;
      /*
        Faza ide samo naprijed. Snimak se vrti u krug, pa se poslije prvog
        kruga vraca na nulu — bez ovoga bi dugme nestalo na svakom ponavljanju.
      */
      setFaza((prije) => {
        const sad: Faza = t >= REZ_DUGME ? 2 : t >= REZ_NATPIS ? 1 : 0;
        return sad > prije ? sad : prije;
      });
    };

    video.addEventListener("timeupdate", naVrijeme);
    const rezerva = window.setTimeout(() => {
      if (video.paused || video.currentTime === 0) setFaza(2);
    }, REZERVA_MS);

    return () => {
      video.removeEventListener("timeupdate", naVrijeme);
      window.clearTimeout(rezerva);
    };
  }, [reducedMotion]);

  /* Bez animacije nema ni cekanja na rez: natpis i dugme stoje odmah. */
  const prikazanaFaza: Faza = reducedMotion ? 2 : faza;

  /* `is-fullbleed`: sekcija je izuzeta iz --page-gutter, snimak ide do ivice. */
  return (
    <section
      className="hero-video is-fullbleed"
      aria-label="MT PONOS — podne obloge"
    >
      <div className={`hv-frame faza-${prikazanaFaza}`}>
        <video
          ref={videoRef}
          className="hv-video"
          poster="/video/hero-poster.webp"
          /* muted + playsInline: bez njih iOS ne pusta sam. */
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        {/* Zatamnjenje pri dnu: bijeli natpis pada preko svijetlog panela. */}
        <div className="hv-scrim" aria-hidden="true" />
        <div className="hv-overlay">
          <h1 className="hv-title">
            <span>PONOS</span>
            <span>PROSTORA</span>
          </h1>
          <button type="button" className="hv-cta" onClick={() => openQuote()}>
            {/*
              Oval je SVG, ne border-radius: rastegne se tacno preko dugmeta
              koliko god natpis bio sirok, a `non-scaling-stroke` drzi liniju
              na 1px i kad se elipsa razvuce.
            */}
            <svg
              className="hv-cta-oval"
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <ellipse
                cx="100"
                cy="30"
                rx="99"
                ry="29"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span>Pogledaj ponudu</span>
            <svg
              className="hv-cta-strelica"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                d="M4 12L12 4M12 4H5.5M12 4V10.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

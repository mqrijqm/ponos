"use client";

import { useEffect, useRef, useState } from "react";

import HeroOverlay, { HERO_OVERLAY_STOPS } from "../HeroOverlay";
import { usePrefersReducedMotion } from "./hooks";

/**
 * HERO: snimak sobe u kojoj se hrastove daske podizu ka kameri.
 *
 * Snimak se pusta, ne prevrce. Ranije je stajao razlozen na frejmove koje je
 * scroll birao kadar po kadar — to je znacilo da tecnost slike zavisi od toga
 * kako neko skroluje, i pet megabajta slika koje sve moraju stici prije nego
 * sto pokret postane gladak. Ovako dekodira video kartica, a fajl je tri puta
 * manji.
 *
 * Kretanje pocinje na prvi scroll, ne na ucitavanje: gost koji tek stize prvo
 * vidi mirnu sobu, a snimak krece kad pokaze da gleda. Poslije toga scroll vise
 * nije potreban — snimak ide do kraja sam.
 */

/** Napredak snimka (0-1) na kojem natpisi ulaze — isto sto i prije. */
export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  /*
    Napredak za natpise. Mijenja se samo kad pređe prag na kojem natpis ulazi
    ili izlazi — `timeupdate` stize nekoliko puta u sekundi i svaki bi inace
    bio novi render.
  */
  const [overlayProgress, setOverlayProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /* Bez animacije snimak stoji na prvom kadru; natpise u tom slucaju rjesava
       render ispod, pa ovdje nema sta da se prijavi. */
    if (reducedMotion) return;

    const napreduj = () => {
      const trajanje = video.duration;
      if (!trajanje || Number.isNaN(trajanje)) return;
      const next = video.currentTime / trajanje;
      setOverlayProgress((prev) =>
        HERO_OVERLAY_STOPS.some((stop) => prev > stop !== next > stop) ? next : prev,
      );
    };

    /*
      Prvi scroll pusta snimak i vise se ne slusa. `play()` vraca obecanje koje
      zna da bude odbijeno (kartica u pozadini, stroga pravila autoplaya) — u
      tom slucaju ostaje poster i natpisi se ne pojavljuju sami, pa se pusta
      jos jednom kad se stranica vrati u prvi plan.
    */
    let trazen = false;   // gost je skrolovao
    let pusten = false;   // snimak stvarno ide

    const probaj = () => {
      if (!trazen || pusten) return;
      pusten = true;
      video.play().catch(() => {
        pusten = false;
      });
    };

    /*
      Scroll samo zabiljezi zelju; pustanje ide cim snimak ima dovoljno
      podataka. Bez toga bi `play()` na praznom baferu cekao da se napuni i
      kadar bi krenuo sa zakasnjenjem od pola sekunde ili vise.
    */
    const pusti = () => {
      trazen = true;
      window.removeEventListener("scroll", pusti);
      if (video.readyState >= 3) probaj();
    };

    const naVidljivost = () => {
      if (!document.hidden) probaj();
    };

    window.addEventListener("scroll", pusti, { passive: true, once: true });
    document.addEventListener("visibilitychange", naVidljivost);
    video.addEventListener("canplay", probaj);
    video.addEventListener("canplaythrough", probaj);
    video.addEventListener("timeupdate", napreduj);
    /* Skidanje krece odmah, da snimak doceka prvi scroll vec napunjen. */
    video.load();

    return () => {
      window.removeEventListener("scroll", pusti);
      document.removeEventListener("visibilitychange", naVidljivost);
      video.removeEventListener("canplay", probaj);
      video.removeEventListener("canplaythrough", probaj);
      video.removeEventListener("timeupdate", napreduj);
    };
  }, [reducedMotion]);

  return (
    <section
      className="hero-sequence is-fullbleed relative w-full"
      aria-label="Hrastove daske se podižu u praznoj sobi"
    >
      <div className="relative flex h-svh w-full items-center justify-center overflow-hidden">
        {/* Odnos i ponasanje kadra su u .hero-stage-frame u globals.css. */}
        <div className="hero-stage-frame">
          {/*
            muted + playsInline idu zajedno: bez njih mobilni browseri odbiju da
            pokrenu snimak i ostane samo poster. `preload="auto"` jer snimak
            treba da bude spreman u trenutku prvog scrolla, a ne da se tek tada
            krene skidati.
          */}
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            poster="/images/hero-planks-poster.webp"
            preload="auto"
            muted
            playsInline
            style={{ pointerEvents: "none" }}
            aria-hidden="true"
          >
            <source src="/videos/hero-planks.webm" type="video/webm" />
            <source src="/videos/hero-planks.mp4" type="video/mp4" />
          </video>

          {/* Natpisi preko kadra; sloj ne hvata misa osim na dugmetu. */}
          <HeroOverlay scrollProgress={reducedMotion ? 1 : overlayProgress} />
        </div>
      </div>
    </section>
  );
}

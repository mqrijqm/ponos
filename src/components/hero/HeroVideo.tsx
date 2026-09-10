"use client";

import { useEffect, useRef, useState } from "react";

import OvalDugme from "../landing/OvalDugme";
import { useQuote } from "../QuoteProvider";
import { useMediaQuery, usePrefersReducedMotion } from "./hooks";

/**
 * Hero: snimak na kojem se panel u sredini mijenja, natpis i dugme dolaze
 * preko njega.
 *
 * Vrijeme se ne broji tajmerom nego se cita sa snimka. Snimak mijenja
 * proizvod svakih ~0.83s; rezovi izmjereni na fajlu stoje na 0.83, 1.73,
 * 2.57, 3.30, 4.17, 5.00 i 6.73 sekunde. Natpis i dugme ulaze tacno na rez,
 * pa promjena proizvoda i pojava teksta padaju u isti kadar umjesto da se
 * sudaraju.
 *
 * Brojevi vaze za `public/video/hero.*` — kad se snimak zamijeni, treba ih
 * ponovo izmjeriti, inace tekst ulazi nasred kadra.
 *
 * Zato `timeupdate`, a ne `setTimeout`: tajmer krene od trenutka montiranja,
 * a snimak od trenutka kad ga browser pusti — to nije isto ako je fajl jos u
 * mrezi ili ako je kartica bila u pozadini.
 */

/**
 * Rez na kojem ulazi natpis. Trazeno je da se pojavi oko tri sekunde od
 * pocetka; snimak ide 1.7x svoje brzine, pa tri sekunde gledanja padnu na
 * 5.1s snimka — a najblizi rez je onaj na 5.00, dakle 2.9s stvarnog vremena.
 */
const REZ_NATPIS = 5;
/** Sljedeci rez — dugme, oko 4s od pocetka. */
const REZ_DUGME = 6.73;

/**
 * Ako snimak ne krene (iOS stednja baterije, blokiran autoplay), natpis ne
 * smije ostati nevidljiv. Poslije ovoliko cekanja se pusta bez snimka —
 * duze nego sto natpis inace ceka, da rezerva ne pretekne rez.
 */
const REZERVA_MS = 3600;

/**
 * Koliko brze snimak ide od svoje brzine. Rezovi se ne pomjeraju — mjere se
 * u vremenu snimka (`currentTime`), koje ide istim redom, samo brze; mijenja
 * se koliko se ceka na njih, ne gdje su.
 */
const BRZINA = 1.7;

/** Udio scrolla kroz sekciju na kojem kadar dostigne punu mjeru. */
const KRAJ_ZUMA = 0.62;
/** Udio na kojem ulaze natpis i dugme — tek kad je kadar narastao. */
const PRAG_NATPISA = 0.66;

type Faza = 0 | 1 | 2;

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sekcijaRef = useRef<HTMLElement>(null);
  const okvirRef = useRef<HTMLDivElement>(null);
  const [faza, setFaza] = useState<Faza>(0);
  const reducedMotion = usePrefersReducedMotion();
  const sirokEkran = useMediaQuery("(min-width: 1024px)");
  const { openQuote } = useQuote();

  /*
    Siroki ekran: snimak raste pod scrollom.
    ────────────────────────────────────────
    Sekcija je visoka vise od ekrana, a sloj u njoj je sticky — dok se prolazi
    kroz tu visinu nista se ne pomjera osim samog kadra. Kadar pocinje malen i
    udaljen i raste do pune mjere; natpis i dugme cekaju da naraste.

    Napredak ne ide kroz React state: to bi bio novi render cijelog stabla na
    svaki piksel scrolla. Upisuje se kao CSS promjenljiva na okvir, a racuna
    se iz zive pozicije sekcije na svaki frejm — sekcije ispod mijenjaju visinu
    dok se slike ucitavaju, pa jednom izmjerene pozicije ne bi valjale.
  */
  useEffect(() => {
    if (!sirokEkran) return;
    const sekcija = sekcijaRef.current;
    const okvir = okvirRef.current;
    if (!sekcija || !okvir) return;

    /* Bez animacije: kadar odmah pun, natpis i dugme odmah tu. */
    if (reducedMotion) {
      okvir.style.setProperty("--hv-p", "1");
      okvir.classList.add("uvecan");
      return;
    }

    let raf = 0;
    const izmjeri = () => {
      const r = sekcija.getBoundingClientRect();
      const put = r.height - window.innerHeight;
      const p = put <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / put));
      /* Rast se zavrsi prije kraja sekcije, pa kadar ostane pun na ekranu
         prije nego sto sekcija ode. */
      okvir.style.setProperty("--hv-p", String(Math.min(1, p / KRAJ_ZUMA)));
      okvir.classList.toggle("uvecan", p >= PRAG_NATPISA);
    };
    const naScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(izmjeri);
    };

    izmjeri();
    window.addEventListener("scroll", naScroll, { passive: true });
    window.addEventListener("resize", naScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", naScroll);
      window.removeEventListener("resize", naScroll);
      okvir.style.removeProperty("--hv-p");
      okvir.classList.remove("uvecan");
    };
  }, [sirokEkran, reducedMotion]);

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

    /* Brzina se gubi kad browser ucita novi izvor, pa se postavlja i sada i
       na `loadedmetadata`. */
    const ubrzaj = () => {
      video.playbackRate = BRZINA;
    };
    ubrzaj();
    video.addEventListener("loadedmetadata", ubrzaj);

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
      video.removeEventListener("loadedmetadata", ubrzaj);
      window.clearTimeout(rezerva);
    };
  }, [reducedMotion]);

  /* Bez animacije nema ni cekanja na rez: natpis i dugme stoje odmah. */
  const prikazanaFaza: Faza = reducedMotion ? 2 : faza;

  /* `is-fullbleed`: sekcija je izuzeta iz --page-gutter, snimak ide do ivice. */
  return (
    <section
      ref={sekcijaRef}
      className="hero-video is-fullbleed"
      aria-label="MT PONOS — podne obloge"
    >
      {/* Sloj koji na sirokom ekranu stoji dok sekcija prolazi (sticky). Na
          telefonu ne radi nista — snimak tamo nosi svoju visinu. */}
      <div className="hv-stage">
        <div ref={okvirRef} className={`hv-frame faza-${prikazanaFaza}`}>
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
            <OvalDugme
              natpis="Pogledaj ponudu"
              className="hv-cta"
              onClick={() => openQuote()}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

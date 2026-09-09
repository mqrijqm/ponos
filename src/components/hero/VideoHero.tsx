"use client";

import { useEffect, useRef, useState } from "react";

import HeroOverlay, { HERO_OVERLAY_STOPS } from "../HeroOverlay";
import { usePrefersReducedMotion } from "./hooks";

/**
 * HERO: snimak sobe u kojoj se hrastove daske podizu ka kameri.
 *
 * Snimak se pusta, ne prevrce, i tok je ovakav:
 *
 *   mirno     → prvi scroll pusta snimak i zakljucava stranicu
 *   naprijed  → stranica stoji dok snimak ne dođe do kraja
 *   gotovo    → scroll je opet slobodan, kadar stoji na posljednjem frejmu
 *   nazad     → scroll navise sa vrha stranice vrti snimak unatrag
 *
 * Zakljucavanje ide preko `ponos:scroll-lock`, istog dogadaja kojim se sluzi i
 * StatsScroll — Lenis ga hvata i stane, pa nema dva mehanizma za istu stvar.
 *
 * Unatrag se ne vrti preko `playbackRate`: negativna brzina nije podrzana.
 * Umjesto toga se `currentTime` pomjera unazad, onoliko koliko tocak da.
 */

/** Koliko sekundi snimka odmota jedna jedinica scrolla pri vrtnji unatrag. */
const NAZAD_PO_JEDINICI = 0.0022;

type Stanje = "mirno" | "naprijed" | "gotovo" | "nazad";

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

    /* Bez animacije snimak stoji na prvom kadru; natpise rjesava render ispod. */
    if (reducedMotion) return;

    let stanje: Stanje = "mirno";
    let trazen = false;

    /*
      Brava mora drzati i ono sto Lenis ne vidi. `ponos:scroll-lock` zaustavi
      Lenis, ali tocak, dodir, razmaknica i strelice i dalje pomjeraju stranicu
      — pa se ti dogadaji odbijaju dok snimak traje. `passive: false` je uslov
      da se `preventDefault` uopste primi.
    */
    const TIPKE_SCROLLA = new Set([
      " ", "PageDown", "PageUp", "End", "Home", "ArrowDown", "ArrowUp",
    ]);
    const odbij = (e: Event) => e.preventDefault();
    const odbijTipku = (e: KeyboardEvent) => {
      const meta = e.target as HTMLElement | null;
      /* U polju za unos razmaknica je slovo, ne scroll. */
      if (meta && /^(INPUT|TEXTAREA|SELECT)$/.test(meta.tagName)) return;
      if (TIPKE_SCROLLA.has(e.key)) e.preventDefault();
    };

    let zakljucano = false;
    const zakljucaj = () => {
      if (zakljucano) return;
      zakljucano = true;
      window.dispatchEvent(new Event("ponos:scroll-lock"));
      window.addEventListener("wheel", odbij, { passive: false });
      window.addEventListener("touchmove", odbij, { passive: false });
      window.addEventListener("keydown", odbijTipku, { passive: false });
    };
    const otkljucaj = () => {
      if (!zakljucano) return;
      zakljucano = false;
      window.dispatchEvent(new Event("ponos:scroll-unlock"));
      window.removeEventListener("wheel", odbij);
      window.removeEventListener("touchmove", odbij);
      window.removeEventListener("keydown", odbijTipku);
    };

    const napreduj = () => {
      const trajanje = video.duration;
      if (!trajanje || Number.isNaN(trajanje)) return;
      const next = video.currentTime / trajanje;
      setOverlayProgress((prev) =>
        HERO_OVERLAY_STOPS.some((stop) => prev > stop !== next > stop) ? next : prev,
      );
    };

    /* ── naprijed: prvi scroll pusta i zakljucava ─────────────── */

    /*
      Ako snimak ne krene za ovoliko, brava pada sama i stranica se pusta.
      Bez toga bi gost na sporoj vezi stajao zakljucan pred posterom.
    */
    const ROK_POCETKA = 2500;
    let rokPocetka: ReturnType<typeof setTimeout> | undefined;

    /*
      Snimak nije krenuo: ili je pustanje odbijeno (iOS u stednji struje odbija
      i nijemi autoplay), ili se predugo puni. Stranica se otkljucava, natpisi
      se prikazuju do kraja da hero ne ostane samo poster bez teksta, a `trazen`
      pada — pa sljedeci scroll pokusava iznova.
    */
    const odustani = () => {
      clearTimeout(rokPocetka);
      stanje = "mirno";
      trazen = false;
      otkljucaj();
      setOverlayProgress(1);
    };

    /*
      Spremnost se ne ceka. iOS Safari ne postuje `preload="auto"` — dok se
      pustanje ne zatrazi skida samo metapodatke, pa `readyState` nikad ne
      stigne do 3 niti `canplay` ikad padne. Uslov na spremnost je zato bio
      mrtav cvor: na telefonu je zauvijek ostajao poster. Sada `play()` ide
      odmah — taj poziv je ono sto punjenje i pokrece — a `ROK_POCETKA` pusta
      stranicu ako se snimak ipak ne javi.
    */
    const probaj = () => {
      if (!trazen || stanje !== "mirno") return;
      stanje = "naprijed";
      zakljucaj();
      clearTimeout(rokPocetka);
      rokPocetka = setTimeout(() => {
        if (stanje === "naprijed" && video.paused) odustani();
      }, ROK_POCETKA);
      video.play().catch(odustani);
    };

    /*
      Okidac je sam pokret tocka, a ne `scroll` koji stize poslije njega: da se
      ceka scroll, stranica bi vec bila odmakla stotinjak piksela prije nego sto
      brava stigne, pa bi kadar odskocio.
    */
    const pusti = () => {
      trazen = true;
      probaj();
    };
    const pustiNaTocak = (e: WheelEvent) => {
      if (e.deltaY > 0) pusti();
    };
    const pustiNaDodir = () => pusti();

    const naKraj = () => {
      stanje = "gotovo";
      otkljucaj();
    };

    /*
      Sigurnosna kocnica: ako se snimak iz bilo kog razloga ne zavrsi (izgubljen
      `ended`, greska u dekodiranju), stranica se otkljucava sama nesto poslije
      njegovog trajanja. Bolje raniji scroll nego zarobljen gost.
    */
    let kocnica: ReturnType<typeof setTimeout> | undefined;
    /*
      Racuna se na `playing`, a ne na `play`: `play` padne cim se pustanje
      zatrazi, jos dok se snimak puni, pa bi kocnica na sporoj vezi otkucala
      prerano. `playing` stize i poslije svakog dopunjavanja, pa se rok tada
      racuna nanovo.
    */
    const naPocetak = () => {
      clearTimeout(rokPocetka);
      clearTimeout(kocnica);
      const ostalo = (video.duration || 8) - video.currentTime;
      kocnica = setTimeout(() => {
        if (stanje === "naprijed") naKraj();
      }, (ostalo + 1.5) * 1000);
    };

    /* ── nazad: scroll navise sa vrha vrti snimak unatrag ─────── */

    const naTocak = (e: WheelEvent) => {
      if (e.deltaY >= 0) {
        if (stanje === "nazad") stanje = "gotovo";
        return;
      }
      /* Samo sa vrha stranice i samo kad je snimak vec odgledan. */
      if (window.scrollY > 4) return;
      if (stanje !== "gotovo" && stanje !== "nazad") return;

      if (stanje === "gotovo") {
        stanje = "nazad";
        video.pause();
      }

      const novo = video.currentTime + e.deltaY * NAZAD_PO_JEDINICI;
      if (novo <= 0) {
        video.currentTime = 0;
        stanje = "mirno";
        trazen = false; // sljedeci scroll nadolje pusta snimak iznova
      } else {
        video.currentTime = novo;
      }
      napreduj();
    };

    const naVidljivost = () => {
      if (!document.hidden) probaj();
    };

    window.addEventListener("scroll", pusti, { passive: true });
    window.addEventListener("wheel", pustiNaTocak, { passive: true });
    window.addEventListener("touchmove", pustiNaDodir, { passive: true });
    window.addEventListener("wheel", naTocak, { passive: true });
    document.addEventListener("visibilitychange", naVidljivost);
    video.addEventListener("canplay", probaj);
    video.addEventListener("canplaythrough", probaj);
    video.addEventListener("playing", naPocetak);
    video.addEventListener("ended", naKraj);
    video.addEventListener("timeupdate", napreduj);
    /* Skidanje krece odmah, da snimak doceka prvi scroll vec napunjen. */
    video.load();

    return () => {
      clearTimeout(kocnica);
      clearTimeout(rokPocetka);
      /* Demontiranje nikad ne smije ostaviti stranicu zakljucanom. */
      otkljucaj();
      window.removeEventListener("scroll", pusti);
      window.removeEventListener("wheel", pustiNaTocak);
      window.removeEventListener("touchmove", pustiNaDodir);
      window.removeEventListener("wheel", naTocak);
      document.removeEventListener("visibilitychange", naVidljivost);
      video.removeEventListener("canplay", probaj);
      video.removeEventListener("canplaythrough", probaj);
      video.removeEventListener("playing", naPocetak);
      video.removeEventListener("ended", naKraj);
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

"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useIsMobile, usePrefersReducedMotion } from "./hooks";
import {
  BACKGROUND,
  FRAME_COUNT,
  HANDOFF,
  HANDOFF_BACKDROP,
  MOBILE_FRAME_STEP,
  PRELOAD_BATCH,
  SCROLL_LENGTH_VH,
  SEQUENCE_SPAN,
  framePath,
} from "./sequence-config";

gsap.registerPlugin(ScrollTrigger);

/** Ziva scena se ucitava tek na klijentu i tek kad joj se priblizi red. */
const FloatingPlanks = dynamic(() => import("./FloatingPlanks"), { ssr: false });

/**
 * HERO: snimak razlozen na frejmove, koji scroll pretace kadar po kadar.
 *
 * Scroll ne pusta video nego bira frejm - zato nema dugmadi, nema cekanja da se
 * video sinhronizuje i nema razlike izmedju brzog i sporog scrolla. Sekcija je
 * visoka SCROLL_LENGTH_VH i pinovana, pa se kadar drzi na mjestu dok se prevrce.
 *
 * Pred kraj snimak se pretapa u zivu three.js scenu (FloatingPlanks). Ispod nje
 * stoji prvi kadar snimka kao slika sobe, pa se pri prelazu mijenjaju samo
 * daske - soba ostaje ista i rez se ne vidi.
 */
export default function ScrollSequenceHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [sceneMounted, setSceneMounted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!canvas || !section || !stage) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    /*
      UCITAVANJE. Svi frejmovi se trazе odmah, ali se crta onaj koji je stigao:
      prvi kadar se pojavi za desetak milisekundi, ostatak dotece u pozadini.
      Slike stoje u nizu i nikad se ne mijenjaju - nema ni jednog novog objekta
      po frejmu scrolla.
    */
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    const loaded = new Array<boolean>(FRAME_COUNT).fill(false);
    const state = { frame: 0 };
    // na telefonu se preskace svaki drugi frejm
    const step = isMobile ? MOBILE_FRAME_STEP : 1;

    /** Crta trenutni frejm preko cijelog kadra, po principu "cover". */
    const draw = () => {
      const index = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(state.frame / step) * step),
      );
      // dok trazeni frejm jos nije stigao, ostaje posljednji nacrtani
      if (!loaded[index]) return;
      const image = images[index];

      const width = canvas.width;
      const height = canvas.height;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;

      context.fillStyle = BACKGROUND;
      context.fillRect(0, 0, width, height);
      context.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
    };

    /** Piksela u canvasu, ograniceno na 2x - preko toga se ne vidi razlika. */
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      draw();
    };

    /*
      Frejmovi se traze u naletima, a ne svih 190 odjednom: browser drzi malo
      otvorenih veza, pa bi u jednom naletu posljednji frejmovi cekali iza
      prvih. Ovako pocetak sekvence stigne prvi - a to je i ono sto se prvo
      gleda. Nalet krece cim se prethodni zavrsi.
    */
    let cancelled = false;
    const loadBatch = (from: number) => {
      if (cancelled || from >= FRAME_COUNT) return;
      const until = Math.min(from + PRELOAD_BATCH * step, FRAME_COUNT);
      let pending = 0;
      for (let i = from; i < until; i += step) {
        const image = new Image();
        image.decoding = "async";
        pending++;
        image.onload = image.onerror = () => {
          loaded[i] = true;
          // prvi kadar se crta cim stigne, da hero ne stoji prazan
          if (i === 0 || Math.round(state.frame / step) * step === i) draw();
          if (--pending === 0) loadBatch(until);
        };
        image.src = framePath(i);
        images[i] = image;
      }
      if (pending === 0) loadBatch(until);
    };
    loadBatch(0);

    resize();
    window.addEventListener("resize", resize);

    /*
      PRETAPANJE. Opacity se vodi preko refova, ne preko React state-a: state bi
      znacio novi render na svaki frejm scrolla. State postoji samo za jedno
      pitanje - da li je scena uopste montirana.
    */
    const applyHandoff = (sequenceProgress: number) => {
      const t = gsap.utils.clamp(
        0,
        1,
        (sequenceProgress - HANDOFF.start) / (1 - HANDOFF.start),
      );
      canvas.style.opacity = String(1 - t);
      if (sceneRef.current) sceneRef.current.style.opacity = String(t);
    };

    if (reducedMotion) {
      // bez animacije: posljednji kadar odmah, bez pina i bez zive scene
      state.frame = FRAME_COUNT - 1;
      draw();
      return () => {
        cancelled = true;
        window.removeEventListener("resize", resize);
      };
    }

    /*
      gsap.context, a ne goli gsap.to: `ctx.revert()` vraca i pin, i spacer, i
      sve stilove koje je ScrollTrigger postavio. Bez toga u razvoju, gdje React
      montira dvaput, drugi pin izmjeri pocetak dok je prvi jos zalijepljen - pa
      se kadar zaglavi stotinjak piksela nize.
    */
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${SCROLL_LENGTH_VH - 100}%`,
        scrub: true,
        pin: stage,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // snimak se odvrti u prvom dijelu pina, pa stane na posljednjem kadru
          const sequence = gsap.utils.clamp(0, 1, self.progress / SEQUENCE_SPAN);
          state.frame = sequence * (FRAME_COUNT - 1);
          draw();
          if (sequence >= HANDOFF.mount) setSceneMounted(true);
          applyHandoff(sequence);
        },
      });
    }, section);

    // sekcija je visoka i stoji na vrhu stranice; refresh poravna mjere kad se
    // ostatak stranice slegne (fontovi, slike ispod heroja)
    ScrollTrigger.refresh();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      ctx.revert();
      for (const image of images) if (image) image.src = "";
    };
  }, [reducedMotion, isMobile]);

  return (
    /*
      Sekcija je visoka tacno koliko i kadar. Duzinu scrolla dodaje ScrollTrigger
      svojim spacerom (pinSpacing) - ako bi je i sekcija nosila, ista visina bi
      se racunala dvaput i pin bi se otkacio prije kraja.
    */
    <section
      ref={sectionRef}
      className="hero-sequence is-fullbleed relative w-full"
      style={{ background: BACKGROUND }}
      aria-label="Hrastove daske se podižu u praznoj sobi"
    >
      <div
        ref={stageRef}
        className="relative flex h-svh w-full items-center justify-center overflow-hidden"
        style={{ background: BACKGROUND }}
      >
        {/* Odnos i ponasanje kadra su u .hero-stage-frame u globals.css. */}
        <div className="hero-stage-frame">
          {/* Soba ispod zive scene: prvi kadar snimka, bez podignutih dasaka. */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HANDOFF_BACKDROP})` }}
            aria-hidden="true"
          />

          {sceneMounted && (
            <div ref={sceneRef} className="absolute inset-0" style={{ opacity: 0 }}>
              <FloatingPlanks animated={!reducedMotion} />
            </div>
          )}

          {/* Snimak stoji navrh i gasi se tek na kraju scrolla. */}
          <canvas
            ref={canvasRef}
            data-hero-sequence=""
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}

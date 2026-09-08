"use client";
import { ReactLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<{
    lenis?: {
      raf: (time: number) => void;
      stop: () => void;
      start: () => void;
      on: (event: string, callback: () => void) => void;
      off: (event: string, callback: () => void) => void;
    };
  } | null>(null);
  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    const stopScroll = () => lenisRef.current?.lenis?.stop();
    const startScroll = () => lenisRef.current?.lenis?.start();
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    /*
      ScrollTrigger mora da racuna po Lenisovoj zaglađenoj poziciji, ne po
      sirovoj. Ako se ne poveze, pin mjeri jednu poziciju a pinovana animacija
      drugu — pri brzom scrollu se raziđu, pa kadar krene da odlazi dok
      sekvenca jos sustize.

      Instancu postavlja ReactLenis pri svom renderu, sto zna da bude poslije
      ovog efekta. Zato se ne cita jednom nego se saceka prvi frejm u kojem
      postoji — inace veza tiho izostane.
    */
    let vezani: { off: (e: string, cb: () => void) => void } | null = null;
    let raf = 0;
    const vezi = () => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) {
        raf = requestAnimationFrame(vezi);
        return;
      }
      lenis.on("scroll", ScrollTrigger.update);
      vezani = lenis;
      ScrollTrigger.refresh();
    };
    vezi();

    window.addEventListener("ponos:scroll-lock", stopScroll);
    window.addEventListener("ponos:scroll-unlock", startScroll);
    return () => {
      cancelAnimationFrame(raf);
      gsap.ticker.remove(update);
      vezani?.off("scroll", ScrollTrigger.update);
      window.removeEventListener("ponos:scroll-lock", stopScroll);
      window.removeEventListener("ponos:scroll-unlock", startScroll);
    };
  }, []);
  return (
    <ReactLenis
      root
      ref={lenisRef as never}
      // anchors: klik na link sa # (logo -> #top, kartica -> #kalkulator)
      // klizi umjesto da skoci
      options={{ autoRaf: false, lerp: 0.1, anchors: true }}
    >
      {children}
    </ReactLenis>
  );
}

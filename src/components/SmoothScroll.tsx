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
    const lenis = lenisRef.current?.lenis;
    const stopScroll = () => lenisRef.current?.lenis?.stop();
    const startScroll = () => lenisRef.current?.lenis?.start();
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenis?.on("scroll", ScrollTrigger.update);
    window.addEventListener("ponos:scroll-lock", stopScroll);
    window.addEventListener("ponos:scroll-unlock", startScroll);
    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
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

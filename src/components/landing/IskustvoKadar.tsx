"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Kvadratni kadar na sredini sekcije o iskustvu — raste dok se lista.
 *
 * Rast nosi CSS: ovdje se samo upisuje `--isk-r` (0 → 1), a sirinu iz toga
 * racuna `.isk-kadar`. Tako se po frejmu mijenja jedan broj, a ne stil.
 *
 * Mjeri se samo `top` okvira, ne i visina: visina zavisi od sirine, sirina
 * od broja, a broj bi onda zavisio od visine — kadar bi sam sebi pomjerao
 * racunicu i tresao se. Gornja ivica stoji, jer je iznad nje samo naslov.
 */
export default function IskustvoKadar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Ko je iskljucio kretanje, dobija kadar odmah u punoj mjeri.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--isk-r", "1");
      return;
    }

    let frejm = 0;
    const racunaj = () => {
      frejm = 0;
      const vrh = el.getBoundingClientRect().top;
      const h = window.innerHeight;
      // 0 dok je vrh kadra na dnu ekrana, 1 kad se popne do gornje petine.
      const r = (h - vrh) / (h * 0.85);
      el.style.setProperty("--isk-r", String(Math.min(1, Math.max(0, r))));
    };
    const naPomjeraj = () => {
      if (!frejm) frejm = requestAnimationFrame(racunaj);
    };

    racunaj();
    window.addEventListener("scroll", naPomjeraj, { passive: true });
    window.addEventListener("resize", naPomjeraj);
    return () => {
      window.removeEventListener("scroll", naPomjeraj);
      window.removeEventListener("resize", naPomjeraj);
      cancelAnimationFrame(frejm);
    };
  }, []);

  return (
    <div className="isk-kadar" ref={ref}>
      <Image
        src="/images/iskustvo-soba.webp"
        alt="Dnevni boravak sa podom iz ponude MT PONOS"
        width={800}
        height={800}
      />
    </div>
  );
}

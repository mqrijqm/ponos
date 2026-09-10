"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Kvadratni kadar koji raste dok se lista. Stoji na dva mjesta na
 * naslovnoj, pa oblik zivi ovdje a ne dvaput prepisan.
 *
 * Rast nosi CSS: ovdje se samo upisuje `--kr` (0 → 1), a sirinu iz toga
 * racuna pravilo sekcije. Tako se po frejmu mijenja jedan broj, a ne stil.
 *
 * Mjeri se samo `top` okvira, ne i visina: visina zavisi od sirine, sirina
 * od broja, a broj bi onda zavisio od visine — kadar bi sam sebi pomjerao
 * racunicu i tresao se. Gornja ivica stoji, jer je iznad nje samo naslov.
 *
 * `pocetak` je gdje rast krece, mjereno visinom ekrana: 0.55 znaci da se
 * nista ne desava dok se kadar ne popne do sredine ekrana — sekcija se
 * prvo smiri, pa tek onda kadar krene. `duzina` je koliko ekrana treba da
 * dodje do pune mjere.
 */
export default function KadarRaste({
  src,
  alt,
  klasa,
  pocetak = 0.55,
  duzina = 0.5,
}: {
  src: string;
  alt: string;
  klasa: string;
  pocetak?: number;
  duzina?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Ko je iskljucio kretanje, dobija kadar odmah u punoj mjeri.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--kr", "1");
      return;
    }

    let frejm = 0;
    const racunaj = () => {
      frejm = 0;
      const vrh = el.getBoundingClientRect().top;
      const h = window.innerHeight;
      const r = (h * pocetak - vrh) / (h * duzina);
      el.style.setProperty("--kr", String(Math.min(1, Math.max(0, r))));
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
  }, [pocetak, duzina]);

  return (
    <div className={klasa} ref={ref}>
      <Image src={src} alt={alt} width={1000} height={1000} />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { catalog, productImage } from "@/data/catalog";

/**
 * Pet laminata u nizu, svaki kao blok prepolovljen na dvoje: dekor lijevo,
 * broj i ime kolekcije desno.
 *
 * Blokovi se pojavljuju jedan za drugim. Svih pet stane na ekran odjednom,
 * pa sam ulazak u vidno polje nije dovoljan da se poredaju — zato svaki
 * nosi zastoj po svom mjestu u nizu.
 *
 * Artikli nisu prepisani nego uzeti iz kataloga, po kodu. Pet kodova je
 * biran po boji: bijeli, zlatni, sivi, srednji hrast i tamna cokolada —
 * da se niz vidi kao raspon, a ne kao pet puta isti pod. Svaki je i iz
 * druge kolekcije, pa se imena desno ne ponavljaju.
 */
const izbor = ["5953", "K450", "K4386", "K470", "K635"];
const laminati = izbor
  .map((k) => catalog.find((p) => p.code === k))
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

export default function PregledLaminata() {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const blokovi = Array.from(el.children) as HTMLElement[];

    // Ko je iskljucio kretanje, dobija svih pet odmah.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      blokovi.forEach((b) => b.classList.add("je-tu"));
      return;
    }

    const oko = new IntersectionObserver(
      (zapisi) => {
        zapisi.forEach((z) => {
          if (!z.isIntersecting) return;
          z.target.classList.add("je-tu");
          oko.unobserve(z.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    blokovi.forEach((b) => oko.observe(b));
    return () => oko.disconnect();
  }, []);

  return (
    <section className="pregled is-fullbleed" aria-labelledby="pregled-naslov">
      {/* Tacka je predah izmedju dvije rijeci gore i niza ispod. */}
      <span className="pg-tacka" aria-hidden="true" />

      <ol className="pg-lista" ref={ref}>
        {laminati.map((p, i) => (
          <li
            key={p.code}
            className="pg-blok"
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <Link href={`/proizvodi/artikli/${encodeURIComponent(p.code)}`}>
              <span className="pg-slika">
                <Image
                  src={productImage(p)}
                  alt={`${p.brand} ${p.name}, dekor`}
                  fill
                  sizes="(max-width: 767px) 50vw, 260px"
                />
              </span>
              <span className="pg-info">
                <b>{String(i + 1).padStart(2, "0")}</b>
                <span>{p.collection}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <h2 id="pregled-naslov" className="pg-naslov">
        Laminati
      </h2>
    </section>
  );
}

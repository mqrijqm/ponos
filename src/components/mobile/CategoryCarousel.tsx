import Image from "next/image";
import Link from "next/link";

import { categories } from "@/data/catalog";

/**
 * Kategorije na naslovnoj, kao vodoravna traka kroz koju se prevlaci prstom.
 *
 * Mreza na telefonu tjera na dvije uske kolone ili na dugu kolonu jedne ispod
 * druge; ovako svaka kategorija dobija punu, uspravnu sliku, a traka sama
 * kazuje da ima jos — prva i zadnja su odsjecene na ivici ekrana.
 *
 * Nema strelica: prevlacenje je jedini nacin, isto kao na referenci. Snap se
 * hvata za lijevu ivicu kartice, pa se traka nikad ne zaustavi na pola slike.
 *
 * Vidljiva je samo pod 768px — sirok ekran ima svoje sekcije proizvoda i ova
 * traka mu ne treba. Skrivanje je u globals.css, da raspored ne visi o JS-u.
 */
/* Bez natpisa iznad trake: "Asortiman / Pet grupa proizvoda" nosi izjava
   tacno iznad nje, pa bi ovdje isto stajalo drugi put. Ostaju slike. */
export default function CategoryCarousel() {
  return (
    <section className="m-band m-cats" aria-label="Ponuda po grupama">
      {/*
        `tabIndex` nije greska: traka koja se scrolluje mora biti dostupna i
        tastaturom, inace sadrzaj iza prve kartice ostane nedohvatljiv.
      */}
      <ul className="m-rail" tabIndex={0} aria-label="Kategorije proizvoda">
        {categories.map((c) => (
          <li key={c.slug} className="m-rail-item">
            <Link href={`/proizvodi/${c.slug}`}>
              <span className="m-rail-media">
                <Image
                  src={c.image}
                  alt={`${c.title} — ${c.kicker}`}
                  fill
                  sizes="72vw"
                />
              </span>
              <span className="m-rail-caption">{c.title}</span>
            </Link>
            {/*
              Znak akcije stoji uz laminate jer su oba akcijska artikla iz
              kataloga laminati — kad to prestane da vazi, prestaje i znak.

              Van je kartice, ne u njoj: link u linku nije dozvoljen, a i
              vodi na drugo mjesto (/akcija) nego sama kartica.
            */}
            {c.slug === "laminati" && (
              <Link href="/akcija" className="m-rail-akcija">
                <Image
                  src="/images/akcija-ponuda.svg"
                  alt="Akcijska ponuda"
                  width={493}
                  height={135}
                />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

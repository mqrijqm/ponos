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
export default function CategoryCarousel() {
  return (
    <section className="m-band m-cats" aria-labelledby="m-cats-title">
      <div className="m-band-head">
        <span className="m-label">ASORTIMAN</span>
        {/* "Pet grupa proizvoda, jedan salon." je preuzela velika izjava iznad
            (EditorialStatement); ovdje bi ista recenica stajala drugi put. */}
        <h2 id="m-cats-title" className="m-heading">
          Grupe proizvoda.
        </h2>
      </div>

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
          </li>
        ))}
      </ul>
    </section>
  );
}

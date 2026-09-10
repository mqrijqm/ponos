import Image from "next/image";
import Link from "next/link";

import { categories } from "@/data/catalog";

/**
 * Sekcija "Asortiman" — prvo sto stoji ispod snimka.
 *
 * Slog je iz predloska (muzejska stranica sa remek-djelima): natpis i
 * krupno ime sekcije na sredini, pa razmaknuta mreza u kojoj svaka stavka
 * nosi ime, kurzivni podnaslov, sliku i jos jedan kurzivni red ispod nje.
 *
 * Mreza nije niz jednakih kartica: stavke su namjerno razbacane po dvije
 * kolone i jedna po redu ide sira, uvucena zdesna. Raspored nosi CSS
 * (`.as-mreza`), preko `nth-child` — ovdje je samo spisak.
 *
 * Kategorije se ne prepisuju nego uzimaju iz kataloga; ovdje stoji samo
 * ono cega u katalogu nema — kratak red ispod slike. U predlosku je na tom
 * mjestu godina nastanka; kod nas mjera po kojoj se kategorija pamti.
 */
const detalj: Record<string, string> = {
  laminati: "8 – 12 mm",
  "spc-vinyl-decking": "unutra i napolju",
  parketi: "po narudžbi",
  "zidni-paneli": "2750 × 615 mm",
  lajsne: "2,4 – 2,5 m",
};

export default function Asortiman() {
  return (
    <section className="asortiman is-fullbleed" aria-labelledby="asortiman-naslov">
      <p className="as-natpis">Ponuda artikala</p>
      <h2 id="asortiman-naslov" className="as-naslov">
        Asortiman
      </h2>

      <div className="as-mreza">
        {/*
          U predlosku na ovom mjestu stoji "Filter +". Kod nas filter nema
          sta da filtrira na naslovnoj, pa isto mjesto nosi prolaz na
          cijeli katalog — natpis koji nesto radi umjesto natpisa koji
          samo lici na dugme.
        */}
        <Link href="/proizvodi" className="as-sve">
          Sve kategorije +
        </Link>

        {categories.map((c) => (
          <article className="as-stavka" key={c.slug}>
            <Link href={`/proizvodi/${c.slug}`}>
              <h3>{c.title}</h3>
              <span className="as-podnaslov">{c.kicker}</span>
              <span className="as-slika">
                <Image
                  src={c.image}
                  alt={`${c.title} — iz ponude MT PONOS`}
                  fill
                  sizes="(max-width: 767px) 45vw, 320px"
                />
              </span>
              <span className="as-detalj">{detalj[c.slug]}</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

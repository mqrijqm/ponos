import Image from "next/image";
import Link from "next/link";

import { categories } from "@/data/catalog";

/**
 * Sekcija "Asortiman" — prvo sto stoji ispod snimka.
 *
 * Slog je iz predloska (muzejska stranica sa remek-djelima): natpis i ime
 * sekcije na sredini, pa razmaknuta mreza u kojoj su stavke namjerno
 * razbacane po dvije kolone, a svaka treca ide sira, uvucena zdesna.
 * Raspored nosi CSS (`.as-mreza`), preko `nth-child`.
 *
 * Svaka stavka ide redom kao u predlosku: ime grupe, kurzivni red ispod
 * njega, pa slika, pa jos jedan red ispod slike. Preko same slike ne stoji
 * nista.
 */

/*
  Red ispod slike; jedina stvar koje u katalogu nema. U predlosku je na tom
  mjestu godina nastanka slike, kod nas mjera po kojoj se grupa pamti.

  Najvise tri rijeci — duze od toga se lomi u dva reda i razbija ritam
  mreze, jer stavke u istom redu ne pocinju na istoj visini.
*/
const detalj: Record<string, string> = {
  laminati: "8 – 12 mm",
  "spc-vinyl-decking": "SPC i WPC",
  parketi: "Tarkett, po narudžbi",
  "zidni-paneli": "2750 × 615 mm",
  lajsne: "PVC i MDF",
};

export default function Asortiman() {
  return (
    <section
      className="asortiman is-fullbleed"
      aria-labelledby="asortiman-naslov"
    >
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

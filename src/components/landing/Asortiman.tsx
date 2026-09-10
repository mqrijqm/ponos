import Image from "next/image";
import Link from "next/link";

import { categories } from "@/data/catalog";

/**
 * Sekcija "Asortiman" — prvo sto stoji ispod snimka.
 *
 * Slog je iz predloska (muzejska stranica sa remek-djelima): natpis i
 * krupno ime sekcije na sredini, pa razmaknuta mreza u kojoj su stavke
 * namjerno razbacane po dvije kolone, a svaka treca ide sira, uvucena
 * zdesna. Raspored nosi CSS (`.as-mreza`), preko `nth-child`.
 *
 * Iznad slike ne stoji nista. Ime grupe je pisano preko slike, tako da ga
 * ivica slike sijece na pola — pola na kadru, pola na podlozi. Ispod slike
 * ostaje jedan red: mjera po kojoj se grupa pamti.
 */

/*
  Dvije stvari kojih u katalogu nema.

  `rijec` je ime preko slike — jedna rijec, ne puni naziv grupe: pisani rez
  se na dvije rijeci raspadne, a i pola te rijeci lezi na podlozi, pa mora
  biti kratka. Puni naziv nosi `aria-label` veze, da se ne izgubi za citac
  ekrana i za pretragu.

  `detalj` je red ispod slike. U predlosku je na tom mjestu godina nastanka
  slike; kod nas mjera po kojoj se grupa pamti.
*/
const rijec: Record<string, string> = {
  laminati: "Laminat",
  "spc-vinyl-decking": "Decking",
  parketi: "Parket",
  "zidni-paneli": "Paneli",
  lajsne: "Lajsne",
};
const detalj: Record<string, string> = {
  laminati: "8 – 12 mm",
  "spc-vinyl-decking": "SPC vinyl i WPC",
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
            <Link href={`/proizvodi/${c.slug}`} aria-label={c.title}>
              <span className="as-okvir">
                <span className="as-slika">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 45vw, 320px"
                  />
                </span>
                <span className="as-rijec">{rijec[c.slug]}</span>
              </span>
              <span className="as-detalj">{detalj[c.slug]}</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

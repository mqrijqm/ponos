import Image from "next/image";
import Link from "next/link";

import { catalog, productImage } from "@/data/catalog";

/**
 * Prvi blok ispod heroja: traka artikala.
 *
 * Artikli nisu prepisani nego uzeti iz kataloga — isti koji stoje i na
 * /proizvodi. Kad se katalog promijeni, promijeni se i ovdje; dva spiska
 * istih artikala razidju se prvi put kad neko doda cetvrti.
 *
 * Kartica nosi samo dekor — bez natpisa i bez oznake. Ime artikla i
 * kolekcija stoje na /proizvodi i na stranici artikla; ovdje bi natpisi
 * preko slika potukli ono zbog cega red i postoji — sam dekor. Ime i dalje
 * postoji za citac ekrana, kroz `alt` fotografije.
 */

/*
  Dio artikala ima zvanicnu fotografiju koja je izrez na bijelom: proizvod
  lebdi u sredini, a gore i dole ostane prazno. U traci, gdje kartice stoje
  jedna uz drugu, to se vidi kao rupa u nizu — susjedna slika ispuni kvadrat,
  ova ne. Zato ih traka preskace; na /proizvodi i na stranici artikla ostaju,
  tamo kartica ima natpis i prazno oko izreza ne smeta.

  Spisak je po `code`, ne po kategoriji: nije stvar toga sta je artikal nego
  kako je slikan. Kad stigne fotografija koja ispuni kvadrat, izbaci kod
  odavde i artikal se sam vrati u traku.
*/
const izrezNaBijelom = new Set([
  "INDO-154",
  "INDO-40",
  "INDO-09",
  "INDO-220",
  "WPC-A",
  "WPC-G",
  "WPC-SH",
  "WPC-SS",
  "MDF-W60-S",
]);

const artikli = catalog.filter((p) => !izrezNaBijelom.has(p.code));

export default function LandingUvod() {
  return (
    <section className="uvod is-fullbleed" aria-label="Šta radimo">
      {/*
        Traka ide sama, u krug. Zato dva puta isti spisak: kad prvi prodje,
        drugi je vec na njegovom mjestu, pa se sastav ne vidi. Kopija je samo
        slika — za citac ekrana i tastaturu je nema, inace bi svaki artikal
        bio naveden dvaput.
      */}
      <div className="uvod-traka" role="group" aria-label="Artikli iz ponude">
        <div className="uvod-kartice">
          {[0, 1].map((krug) =>
            artikli.map((p) => (
              <Link
                key={`${krug}-${p.code}`}
                href={`/proizvodi/artikli/${encodeURIComponent(p.code)}`}
                className="uvod-kartica"
                aria-hidden={krug === 1 ? true : undefined}
                tabIndex={krug === 1 ? -1 : undefined}
              >
                <Image
                  src={productImage(p)}
                  alt={
                    krug === 1
                      ? ""
                      : `${p.brand} ${p.name}, zvanična fotografija proizvoda`
                  }
                  fill
                  sizes="(max-width: 767px) 42vw, 220px"
                />
              </Link>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

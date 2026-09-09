import Image from "next/image";
import Link from "next/link";

import { catalog, productImage } from "@/data/catalog";

/**
 * Prvi blok ispod heroja: recenica o firmi sa strelicom, pa dva artikla.
 *
 * Artikli nisu prepisani nego uzeti iz kataloga — ista tri koja stoje i na
 * /proizvodi. Kad se katalog promijeni, promijeni se i ovdje; dva spiska
 * istih artikala razidju se prvi put kad neko doda cetvrti.
 *
 * Kartica nosi samo dekor i oznaku. Ime artikla i kolekcija stoje na
 * /proizvodi i na stranici artikla; ovdje bi tri natpisa preko tri slike
 * potukla ono zbog cega red i postoji — sam dekor. Ime i dalje postoji za
 * citac ekrana, kroz `alt` fotografije.
 */

/*
  Cijeli katalog, redom kako stoji i na /proizvodi. Traka ih nosi sve — nema
  izbora "prvih koliko", pa nema ni spiska koji treba odrzavati uz katalog.
*/
const artikli = catalog;

export default function LandingUvod() {
  return (
    <section className="uvod is-fullbleed" aria-label="Šta radimo">
      <div className="uvod-red">
        <p className="uvod-tekst">
          Specijalizovan je za veleprodaju i maloprodaju, dostavu i ugradnju
          laminata, parketa, vinila i deckinga.
        </p>
        {/* Krug sa strelicom vodi na katalog — isto odrediste kao i kartice. */}
        <Link
          href="/proizvodi"
          className="uvod-strelica"
          aria-label="Pogledaj proizvode"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M4 12L12 4M12 4H5.5M12 4V10.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="square"
            />
          </svg>
        </Link>
      </div>

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
                {p.badge && <span className="uvod-oznaka">{p.badge}</span>}
              </Link>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

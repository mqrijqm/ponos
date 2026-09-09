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
        {/*
          Znak se okrece oko svoje ose i vodi na katalog — isto odrediste kao
          i kartice ispod. Crta se u kodu, ne kroz <Image>: tako se okrece bez
          jos jednog zahtjeva i bez skoka dok se fajl ceka.
        */}
        <Link
          href="/proizvodi"
          className="uvod-znak"
          aria-label="Pogledaj proizvode"
        >
          <svg viewBox="0 0 266 286" fill="currentColor" aria-hidden="true">
            <path d="M266 0H82V69H266V0Z" />
            <path d="M0 0L0 182H72L72 0H0Z" />
            <path d="M194 77V262H266V77H194Z" />
            <path d="M186 77H82V147H186V77Z" />
            <path d="M82 155H187V198H92C86.4772 198 82 193.523 82 188V155Z" />
            <path d="M72 190H0V262H72V190Z" />
            <path d="M72.0005 190L115.302 262H28.6992L72.0005 190Z" />
            <path d="M124.196 262H187V190H124.196V262Z" />
            <path d="M124.373 262L81.6133 190H167.132L124.373 262Z" />
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

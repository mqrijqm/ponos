import Image from "next/image";
import Link from "next/link";

import { catalog, productImage } from "@/data/catalog";

/**
 * Prvi blok ispod heroja: recenica o firmi sa strelicom, pa tri artikla.
 *
 * Artikli nisu prepisani nego uzeti iz kataloga — ista tri koja stoje i na
 * /proizvodi. Kad se katalog promijeni, promijeni se i ovdje; dva spiska
 * istih artikala razidju se prvi put kad neko doda cetvrti.
 *
 * Kartica nosi natpis preko slike, ne ispod nje kao u mrezi na /proizvodi:
 * ovdje su tri kartice u redu i natpis ispod bi ih razvukao u stub teksta.
 */

/* Prva tri laminata iz kataloga — Herringbone serija, sva tri sa oznakom. */
const artikli = catalog.filter((p) => p.category === "laminati").slice(0, 3);

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

      <div className="uvod-kartice">
        {artikli.map((p) => (
          <Link
            key={p.code}
            href={`/proizvodi/artikli/${encodeURIComponent(p.code)}`}
            className="uvod-kartica"
          >
            <Image
              src={productImage(p)}
              alt={`${p.brand} ${p.name}, zvanična fotografija proizvoda`}
              fill
              sizes="(max-width: 767px) 33vw, 25vw"
            />
            {p.badge && <span className="uvod-oznaka">{p.badge}</span>}
            {/*
              Natpis lezi na fotografiji, koja zna biti gotovo bijela; bez
              zatamnjenja ispod njega bijela slova se izgube u dekoru.
            */}
            <span className="uvod-natpis">
              <b>{p.name}</b>
              <i>{p.collection}</i>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

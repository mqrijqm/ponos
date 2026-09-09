"use client";

import { useMemo, useState } from "react";

import { CatalogItem } from "@/data/catalog";
import ProductGrid from "./ProductGrid";

/**
 * Artikli jedne kategorije, sa alatkama iznad mreze.
 *
 * Broj artikala i dugme za filter stoje sami u redu iznad mreze i nose isti
 * oblik kao CTA drugdje na sajtu. Ranije je broj bio natpis od 10px stisnut uz
 * pasus u istom redu, pa se gubio.
 *
 * Ne treba ga mijesati sa `CatalogBrowser` — to je cijeli katalog na /proizvodi,
 * sa karticama po kategoriji. Ovdje je kategorija vec izabrana, pa se filtrira
 * unutar nje.
 *
 * Vrijednosti filtera se ne pisu rukom nego citaju iz samih artikala — ista
 * sekcija tako radi i za laminate i za lajsne. Grupa u kojoj postoji samo jedan
 * izbor se ne prikazuje: nema sta da se filtrira.
 */

/** 1 artikal, 2–4 artikla, 5+ artikala — i isto se ponavlja od 21 nadalje. */
function artikala(n: number) {
  const zadnja = n % 10;
  const zadnjeDvije = n % 100;
  if (zadnja === 1 && zadnjeDvije !== 11) return "artikal";
  if (zadnja >= 2 && zadnja <= 4 && (zadnjeDvije < 12 || zadnjeDvije > 14)) return "artikla";
  return "artikala";
}

/** Debljine se sortiraju kao brojevi — "10 mm" inace padne prije "8 mm". */
function poBroju(a: string, b: string) {
  return Number.parseFloat(a.replace(",", ".")) - Number.parseFloat(b.replace(",", "."));
}

export default function CategoryCatalog({
  items,
  note,
}: {
  items: CatalogItem[];
  /** Napomena ispod alatki. Sitna je i namjerno ne odvlaci paznju sa mreze. */
  note?: string;
}) {
  const [otvoren, setOtvoren] = useState(false);
  const [marka, setMarka] = useState<string | null>(null);
  const [debljina, setDebljina] = useState<string | null>(null);

  const marke = useMemo(() => [...new Set(items.map((i) => i.brand))], [items]);
  const debljine = useMemo(() => {
    const skup = new Set<string>();
    for (const i of items) if (i.thickness) skup.add(i.thickness);
    return [...skup].sort(poBroju);
  }, [items]);

  const vidljivi = items.filter(
    (i) => (!marka || i.brand === marka) && (!debljina || i.thickness === debljina),
  );

  const imaFiltera = marke.length > 1 || debljine.length > 1;
  const aktivnih = (marka ? 1 : 0) + (debljina ? 1 : 0);
  const ponisti = () => {
    setMarka(null);
    setDebljina(null);
  };

  return (
    <>
      <div className="catalog-bar">
        <div className="catalog-tools">
          {/* Broj nije dugme — samo dijeli oblik sa njim, da red stoji kao cjelina. */}
          <span className="cta-dot catalog-count">
            <i /> {vidljivi.length} {artikala(vidljivi.length)}
          </span>
          {imaFiltera && (
            <button
              type="button"
              className={`cta-dot catalog-filter${otvoren ? " is-open" : ""}`}
              aria-expanded={otvoren}
              onClick={() => setOtvoren((prije) => !prije)}
            >
              <i /> Filter{aktivnih ? ` · ${aktivnih}` : ""}
            </button>
          )}
        </div>

        {otvoren && (
          <div className="catalog-filter-panel">
            {marke.length > 1 && (
              <div className="catalog-filter-group">
                <span>Marka</span>
                <button
                  type="button"
                  className={`catalog-chip${marka === null ? " is-active" : ""}`}
                  onClick={() => setMarka(null)}
                >
                  Sve
                </button>
                {marke.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`catalog-chip${marka === m ? " is-active" : ""}`}
                    onClick={() => setMarka(marka === m ? null : m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
            {debljine.length > 1 && (
              <div className="catalog-filter-group">
                <span>Debljina</span>
                <button
                  type="button"
                  className={`catalog-chip${debljina === null ? " is-active" : ""}`}
                  onClick={() => setDebljina(null)}
                >
                  Sve
                </button>
                {debljine.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`catalog-chip${debljina === d ? " is-active" : ""}`}
                    onClick={() => setDebljina(debljina === d ? null : d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {note && <p className="catalog-note">{note}</p>}
      </div>

      {/*
        Dvije grupe filtera mogu se medjusobno iskljuciti (Kaindl nema daske od
        12 mm), pa prazan rezultat mora imati svoj ekran — inace mreza samo
        nestane i izgleda kao kvar.
      */}
      {vidljivi.length ? (
        <ProductGrid items={vidljivi} />
      ) : (
        <p className="catalog-none">
          Nema artikala za izabrane filtere.{" "}
          <button type="button" onClick={ponisti}>
            Poništi filtere
          </button>
        </p>
      )}
    </>
  );
}

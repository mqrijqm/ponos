"use client";
import { useMemo, useState } from "react";
import ProductGrid from "./ProductGrid";
import { catalog, categories } from "@/data/catalog";

/**
 * Cijeli katalog na jednom mjestu. Zamjenjuje nekadasnju /proizvodi
 * medjustranicu — nema vise koraka izmedju navigacije i artikala.
 */
export default function CatalogBrowser({
  initialCategory = "sve",
}: {
  initialCategory?: string;
}) {
  const [active, setActive] = useState(initialCategory);
  const items = useMemo(
    () => (active === "sve" ? catalog : catalog.filter((x) => x.category === active)),
    [active],
  );
  const counts = useMemo(() => {
    const map: Record<string, number> = { sve: catalog.length };
    for (const c of categories)
      map[c.slug] = catalog.filter((x) => x.category === c.slug).length;
    return map;
  }, []);

  return (
    <section className="catalog-section" aria-labelledby="katalog-title">
      <div className="catalog-head">
        <h2 id="katalog-title" className="sr-only">
          Katalog artikala
        </h2>
        <span>
          {items.length} {items.length === 1 ? "artikal" : "artikala"}
        </span>
        <p>
          Šifre i kolekcije preuzete iz aktuelne ponude MT PONOS. Cijenu i
          dostupnost provjerite upitom.
        </p>
      </div>
      <div className="catalog-filters" role="tablist" aria-label="Kategorije">
        <button
          role="tab"
          aria-selected={active === "sve"}
          className={active === "sve" ? "is-active" : ""}
          onClick={() => setActive("sve")}
        >
          Sve <i>{counts.sve}</i>
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            role="tab"
            aria-selected={active === c.slug}
            className={active === c.slug ? "is-active" : ""}
            onClick={() => setActive(c.slug)}
          >
            {c.title} <i>{counts[c.slug]}</i>
          </button>
        ))}
      </div>
      {items.length ? (
        <ProductGrid items={items} />
      ) : (
        <div className="catalog-empty">
          <h3>Dostupno po narudžbi.</h3>
          <p>
            Za aktuelne dekore, cijene i rok isporuke kontaktirajte prodajni tim.
          </p>
        </div>
      )}
    </section>
  );
}

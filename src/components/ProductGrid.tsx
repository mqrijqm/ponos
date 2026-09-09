import Image from "next/image";
import Link from "next/link";
import { CatalogItem, productImage } from "@/data/catalog";

/**
 * Mreza artikala. Kartica nosi samo sliku, ime i kolekciju — sifra, debljina,
 * dostupnost i cijena cekaju na stranici artikla. Ranije su sva cetiri reda
 * teksta stajala ispod slike, pa je mreza bila gusca od fotografija u njoj.
 */
export default function ProductGrid({
  items,
  /**
   * Na telefonu se mreza pretvara u vodoravnu traku kroz koju se prevlaci.
   * Koristi se za povezane artikle, gdje je red od cetiri kartice u dvije
   * kolone samo jos jedan stub teksta. Sirok ekran je i dalje mreza.
   */
  rail = false,
}: {
  items: CatalogItem[];
  rail?: boolean;
}) {
  return (
    <div className={`catalog-grid${rail ? " is-rail" : ""}`}>
      {items.map((p) => (
        <article className="catalog-card" key={p.code}>
          {/* Jedan link za cijelu karticu: slika i natpis vode na isto mjesto. */}
          <Link
            href={`/proizvodi/artikli/${encodeURIComponent(p.code)}`}
            className="catalog-link"
          >
            <span className="catalog-image">
              <Image
                src={productImage(p)}
                alt={`${p.brand} ${p.name}, zvanična fotografija proizvoda`}
                fill
                sizes="(max-width:600px) 50vw, 25vw"
              />
              {p.badge && <span className="catalog-badge">{p.badge}</span>}
            </span>
            <h2>{p.name}</h2>
            <small>{p.collection}</small>
          </Link>
        </article>
      ))}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CatalogItem, productImage } from "@/data/catalog";
export default function ProductGrid({ items }: { items: CatalogItem[] }) {
  return (
    <div className="catalog-grid">
      {items.map((p) => (
        <article className="catalog-card" key={p.code}>
          <Link
            href={`/artikli/${encodeURIComponent(p.code)}`}
            className="catalog-image"
          >
            <Image
              src={productImage(p)}
              alt={`${p.brand} ${p.name}, zvanična fotografija proizvoda`}
              fill
              sizes="(max-width:600px) 50vw, 25vw"
            />
            {p.badge && <span>{p.badge}</span>}
          </Link>
          <small>
            {p.brand} · {p.collection}
          </small>
          <h2>
            <Link href={`/artikli/${encodeURIComponent(p.code)}`}>
              {p.name}
            </Link>
          </h2>
          <p>
            {p.code}
            {p.thickness ? ` · ${p.thickness}` : ""}
          </p>
          <Link
            className="detail-link"
            href={`/artikli/${encodeURIComponent(p.code)}`}
          >
            Detalji <ArrowRight size={15} />
          </Link>
        </article>
      ))}
    </div>
  );
}

import Image from "next/image";

/**
 * Detalj jednog artikla: tekst lijevo, tekstura preko cijele desne
 * polovine. Sve dolazi iz jednog objekta, pa ista sekcija radi za
 * bilo koji proizvod — dovoljno je proslijediti drugi `product`.
 */
export type ShowcaseProduct = {
  brand: string;
  name: string;
  code: string;
  specs: [string, string][];
  texture: string;
  textureAlt: string;
  room: string;
  roomAlt: string;
  brandLogo: string;
  brandLogoAlt: string;
};

export const wickedHarvestOak: ShowcaseProduct = {
  brand: "Krono Original",
  name: "Wicked Harvest Oak",
  code: "2218",
  specs: [
    ["Kolekcija", "Herringbone 8"],
    ["Dekor", "Wicked Harvest Oak"],
    ["Tip", "Laminat"],
    ["Klasa upotrebe", "AC4 / 32"],
    ["Debljina", "8 mm"],
    ["Dimenzije daske", "665 × 133 mm"],
    ["Sistem spoja", "1clic2go pure+"],
    ["Struktura površine", "Natural Wood Structure"],
  ],
  texture: "/images/product/wicked-harvest-oak-texture.webp",
  textureAlt: "Laminat Wicked Harvest Oak položen u riblju kost",
  room: "/images/product/wicked-harvest-oak-room.webp",
  roomAlt: "Dnevni boravak sa podom u riblja kost dezenu",
  brandLogo: "/images/product/logo-krono-original.png",
  brandLogoAlt: "Krono Original",
};

export default function ProductShowcase({
  product = wickedHarvestOak,
}: {
  product?: ShowcaseProduct;
}) {
  return (
    <section className="product-showcase is-fullbleed" aria-labelledby="showcase-title">
      <div className="showcase-panel">
        <div className="showcase-copy">
          <span className="showcase-brand">{product.brand}</span>
          <h2 id="showcase-title">{product.name}</h2>
          <p className="showcase-code">Šifra proizvoda: {product.code}</p>

          <hr className="showcase-rule" />

          <dl className="showcase-specs">
            {product.specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="showcase-foot">
          <Image
            className="showcase-brand-logo"
            src={product.brandLogo}
            alt={product.brandLogoAlt}
            width={420}
            height={168}
          />
          {/* Ugaona linija stoji izvan slike, gore lijevo. */}
          <figure className="showcase-room">
            <span className="showcase-room-corner" aria-hidden="true" />
            <Image src={product.room} alt={product.roomAlt} width={440} height={438} />
          </figure>
        </div>
      </div>

      <div className="showcase-media">
        <Image src={product.texture} alt={product.textureAlt} fill sizes="(max-width: 900px) 100vw, 50vw" />
      </div>
    </section>
  );
}

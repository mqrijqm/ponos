import Image from "next/image";

/**
 * Detalj jednog artikla: tekst na jednoj polovini, tekstura preko cijele
 * druge. Sve dolazi iz jednog objekta, pa ista sekcija radi za bilo koji
 * proizvod — dovoljno je proslijediti drugi `product`. Sa `mirrored` strane
 * zamjene mjesta, da dva uzastopna detalja ne izgledaju kao isti kadar.
 */
export type ShowcaseProduct = {
  brand: string;
  name: string;
  /** Sifra artikla. Izostavljena kad je proizvod serija, a ne jedan dekor. */
  code?: string;
  /** Opis iznad specifikacija. Krono ga nema, novije serije ga imaju. */
  description?: string;
  specs: [string, string][];
  texture: string;
  textureAlt: string;
  room: string;
  roomAlt: string;
  /** Logo robne marke. Serije bez logotipa umjesto njega nose `wordmark`. */
  brandLogo?: string;
  brandLogoAlt?: string;
  /** Dva reda teksta u dnu, kad marka nema logotip. */
  wordmark?: [string, string];
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

export const naturalFloor: ShowcaseProduct = {
  brand: "SPC Vinyl",
  name: "Natural Floor Collection",
  specs: [
    ["Kolekcija", "Natural Floor"],
    ["Tip proizvoda", "SPC Vinyl"],
    ["Debljina", "4 mm"],
    ["Fuga", "Mikro V fuga"],
    ["Vodootpornost", "100%"],
    ["Otpornost", "AC4 / 34"],
    ["Podno grijanje", "Da"],
    ["Struktura", "Prirodna drvena tekstura"],
    ["Lakše postavljanje", "Brza instalacija"],
    ["Reciklabilnost", "Ekološki prihvatljivo"],
  ],
  texture: "/images/product/natural-floor-texture.webp",
  textureAlt: "SPC vinyl pod iz Natural Floor kolekcije, prirodna drvena tekstura",
  room: "/images/product/natural-floor-detail.webp",
  roomAlt: "Detalj daske iz Natural Floor kolekcije",
  wordmark: ["SPC Vinyl", "Natural Floor"],
};

export default function ProductShowcase({
  product = wickedHarvestOak,
  mirrored = false,
  titleId = "showcase-title",
}: {
  product?: ShowcaseProduct;
  mirrored?: boolean;
  /** Svaki detalj na stranici mora imati svoj id — inace se naslovi sudaraju. */
  titleId?: string;
}) {
  return (
    <section
      className={`product-showcase is-fullbleed${mirrored ? " is-mirrored" : ""}`}
      aria-labelledby={titleId}
    >
      <div className="showcase-panel">
        <div className="showcase-copy">
          <span className="showcase-brand">{product.brand}</span>
          <h2 id={titleId}>{product.name}</h2>
          {product.code && <p className="showcase-code">Šifra proizvoda: {product.code}</p>}
          {product.description && <p className="showcase-description">{product.description}</p>}

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
          {product.brandLogo ? (
            <Image
              className="showcase-brand-logo"
              src={product.brandLogo}
              alt={product.brandLogoAlt ?? product.brand}
              width={420}
              height={168}
            />
          ) : (
            product.wordmark && (
              <p className="showcase-wordmark">
                <span>{product.wordmark[0]}</span>
                <b>{product.wordmark[1]}</b>
              </p>
            )
          )}
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

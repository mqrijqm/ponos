"use client";

import Image from "next/image";

import styles from "./LaminatiGridSection.module.css";

/**
 * Sest Kaindl laminata u mirnom gridu 3x2.
 *
 * Zamijenio je horizontalni carousel: kod carousela je svaka slika bila siroka
 * traka pa je u kadar stalo dvoje-troje, a odnos stranica se mijenjao od karte
 * do karte. Ovdje su sve slike KVADRATNE (aspect-ratio 1/1) i svih sest se vidi
 * odjednom - dekori se tako mogu porediti, sto je i poenta.
 *
 * Slike su lokalne kopije iz public/images/official-products/kaindl/, iste kao
 * na /proizvodi/laminati.
 */
const products = [
  {
    code: "37813",
    name: "Laminat 37813",
    collection: "Classic Touch",
    description: "8 mm · Brušeni hrast",
    image:
      "/images/official-products/kaindl/1766434285_csm_37813_Dielenkreuz_3828c92c2f.jpg",
    price: "5.49 USD / Sq. Ft.",
    badge: "Novo",
  },
  {
    code: "K4386",
    name: "Laminat K4386",
    collection: "Classic Touch",
    description: "8 mm · Dielenkreuz",
    image:
      "/images/official-products/kaindl/1766434163_csm_K4386_Dielenkreuz_9405a17277.jpg",
    price: "5.49 USD / Sq. Ft.",
  },
  {
    code: "K4898",
    name: "Laminat K4898",
    collection: "Natural Touch",
    description: "8 mm · Prirodni hrast",
    image: "/images/official-products/kaindl/1766433935_K4898.jpg",
    price: "5.49 USD / Sq. Ft.",
  },
  {
    code: "34352",
    name: "Laminat 34352",
    collection: "Classic Touch",
    description: "8 mm · Dielenkreuz",
    image:
      "/images/official-products/kaindl/1766430936_csm_34352_Dielenkreuz_8eca9ff40c.jpg",
    price: "4.99 USD / Sq. Ft.",
    badge: "Akcija",
  },
  {
    code: "34268",
    name: "Laminat 34268",
    collection: "Easy Touch",
    description: "8 mm · Moderna tekstura",
    image:
      "/images/official-products/kaindl/1766430485_csm_34268_Dielenkreuz_7bd7a14b46.jpg",
    price: "5.29 USD / Sq. Ft.",
    badge: "Novo",
  },
  {
    code: "34011",
    name: "Laminat 34011",
    collection: "Authentic Touch",
    description: "7 mm · Autentični hrast",
    image:
      "/images/official-products/kaindl/1766430184_csm_34011_Dielenkreuz_d7725f363e.jpg",
    price: "5.19 USD / Sq. Ft.",
    badge: "Novo",
  },
];

const ALL_LAMINATES = "/proizvodi/laminati";

/** "5.49 USD / Sq. Ft." -> ["5.49 USD", "/ Sq. Ft."], da jedinica ide sivo. */
function splitPrice(price) {
  const at = price.indexOf("/");
  return at < 0 ? [price, ""] : [price.slice(0, at).trim(), price.slice(at)];
}

export default function LaminatiGridSection() {
  return (
    <section className={styles.section} aria-labelledby="laminati-grid-naslov">
      <div className={styles.inner}>
        {/* div, ne <header>: globalni CSS sajta stilizuje taj tag (svoja
            pozadina, svoj raspored) pa bi ga pokupila i ova sekcija. */}
        <div className={styles.head}>
          <span className={styles.eyebrow}>KAINDL</span>
          <h2 className={styles.title} id="laminati-grid-naslov">
            Laminati iz aktuelne kolekcije
          </h2>
        </div>

        <div className={styles.grid}>
          {products.map((product) => {
            const [amount, unit] = splitPrice(product.price);

            return (
              <a
                key={product.code}
                className={styles.card}
                href={`/proizvodi/artikli/${product.code}`}
              >
                {/*
                  Kvadrat se drzi preko aspect-ratio na omotacu, a slika ide
                  object-fit: cover - fotografije dekora nisu sve istog odnosa
                  stranica, pa bez ovoga red ispadne nazubljen.
                */}
                <div className={styles.media}>
                  <Image
                    src={product.image}
                    alt={`Dekor ${product.name}, kolekcija ${product.collection}`}
                    fill
                    className={styles.image}
                    sizes="(max-width: 600px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                  {product.badge && (
                    <span
                      className={`${styles.badge} ${
                        product.badge === "Akcija" ? styles.badgeAkcija : styles.badgeNovo
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className={styles.info}>
                  <h3 className={styles.name}>{product.name}</h3>
                  <span className={styles.collection}>{product.collection}</span>
                  <p className={styles.description}>{product.description}</p>
                  <p className={styles.price}>
                    <strong>{amount}</strong> <span>{unit}</span>
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        <div className={styles.foot}>
          <a className={styles.all} href={ALL_LAMINATES}>
            Svi laminati <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

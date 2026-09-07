"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import styles from "./KaindlCarousel.module.css";

/**
 * Horizontalni carousel Kaindl laminata.
 *
 * Karte se smjenjuju usko/siroko - to je jedino sto ritmizuje traku kad nema
 * strelica. Sirina se cita iz `featured` ako je zadata, inace se smjenjuje po
 * indeksu, pa se red nikad ne raspadne u niz istih kartica.
 *
 * Slike su lokalne kopije iz public/images/official-products/kaindl/ (iste kao
 * na starom sajtu) - preko next/image, da ih Next optimizuje i servira u
 * modernom formatu.
 */
const products = [
  {
    id: "37813",
    name: "Laminat 37813",
    collection: "Classic Touch",
    description: "8 mm · Brušeni hrast",
    image:
      "/images/official-products/kaindl/1766434285_csm_37813_Dielenkreuz_3828c92c2f.jpg",
    price: "5.49 USD / Sq. Ft.",
    badge: "Novo",
  },
  {
    id: "K4386",
    name: "Laminat K4386",
    collection: "Classic Touch",
    description: "8 mm · Dielenkreuz",
    image:
      "/images/official-products/kaindl/1766434163_csm_K4386_Dielenkreuz_9405a17277.jpg",
    price: "5.49 USD / Sq. Ft.",
    featured: true,
  },
  {
    id: "K4898",
    name: "Laminat K4898",
    collection: "Natural Touch",
    description: "8 mm · Prirodni hrast",
    image: "/images/official-products/kaindl/1766433935_K4898.jpg",
    price: "5.49 USD / Sq. Ft.",
  },
  {
    id: "34352",
    name: "Laminat 34352",
    collection: "Classic Touch",
    description: "8 mm · Dielenkreuz",
    image:
      "/images/official-products/kaindl/1766430936_csm_34352_Dielenkreuz_8eca9ff40c.jpg",
    price: "4.99 USD / Sq. Ft.",
    badge: "Akcija",
    featured: true,
  },
  {
    id: "34268",
    name: "Laminat 34268",
    collection: "Easy Touch",
    description: "8 mm · Moderna tekstura",
    image:
      "/images/official-products/kaindl/1766430485_csm_34268_Dielenkreuz_7bd7a14b46.jpg",
    price: "5.29 USD / Sq. Ft.",
    badge: "Novo",
  },
  {
    id: "34011",
    name: "Laminat 34011",
    collection: "Authentic Touch",
    description: "7 mm · Autentični hrast",
    image:
      "/images/official-products/kaindl/1766430184_csm_34011_Dielenkreuz_d7725f363e.jpg",
    price: "5.19 USD / Sq. Ft.",
    badge: "Novo",
  },
];

const PRODUCTS_URL = "https://mt-ponos-novi.vercel.app/proizvodi/laminati";

/** "02", "06" - paginator je uvijek dvocifren, da ne poskakuje u sirini. */
const pad = (n) => String(n).padStart(2, "0");

/** "5.49 USD / Sq. Ft." -> ["5.49 USD", "/ Sq. Ft."], da jedinica ide sivo. */
function splitPrice(price) {
  const at = price.indexOf("/");
  return at < 0 ? [price, ""] : [price.slice(0, at).trim(), price.slice(at)];
}

export default function KaindlCarousel() {
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(1);
  const [progress, setProgress] = useState(0);

  /**
   * Koja je karta "trenutna": prva cija desna ivica jos nije prosla lijevu
   * ivicu okvira. Racuna se iz stvarnih pozicija djece, ne iz fiksne sirine -
   * karte nisu iste sirine pa dijeljenje ne bi radilo.
   */
  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;
    setProgress(max > 0 ? track.scrollLeft / max : 0);

    const cards = track.children;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card.offsetLeft + card.offsetWidth > track.scrollLeft + 1) {
        setCurrent(i + 1);
        return;
      }
    }
  }, []);

  return (
    <section className={styles.section} aria-labelledby="kaindl-naslov">
      {/*
        div, ne <header>/<footer>: globalni CSS sajta stilizuje te tagove
        (tamna traka, druga pozadina) pa bi ih pokupila i ova sekcija.
      */}
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>KAINDL</span>
          <h2 className={styles.title} id="kaindl-naslov">
            Laminati iz aktuelne kolekcije
          </h2>
        </div>

        <p className={styles.hint} aria-hidden="true">
          <span className={styles.dots}>
            <i />
            <i />
            <i />
          </span>
          scroli
        </p>
      </div>

      {/*
        tabIndex: bez njega se traka ne moze prelistati tastaturom. Nema
        strelica po dizajnu, pa je ovo jedini nemis nacin.
      */}
      <div
        className={styles.track}
        ref={trackRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="group"
        aria-label="Kaindl laminati, prelistajte vodoravno"
      >
        {products.map((product, index) => {
          const large = product.featured ?? index % 2 === 1;
          const [amount, unit] = splitPrice(product.price);

          return (
            <article
              key={product.id}
              className={`${styles.card} ${large ? styles.large : styles.small}`}
            >
              <div className={styles.media}>
                <Image
                  src={product.image}
                  alt={`Dekor ${product.name}, kolekcija ${product.collection}`}
                  fill
                  className={styles.image}
                  sizes={large ? "(max-width: 600px) 280px, 400px" : "(max-width: 600px) 140px, 180px"}
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
                <span className={styles.collection}>{product.collection}</span>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
                <p className={styles.price}>
                  <strong>{amount}</strong> <span>{unit}</span>
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.foot}>
        <div className={styles.paginator}>
          <strong>{pad(current)}</strong>
          <span>/{pad(products.length)}</span>
        </div>

        <div className={styles.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(progress, 0.06)})` }} />
        </div>

        <a className={styles.cta} href={PRODUCTS_URL}>
          Svi laminati
        </a>
      </div>
    </section>
  );
}

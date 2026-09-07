"use client";

import styles from "./VideoHeroSection.module.css";

/**
 * Video hero za /proizvodi/zidni-paneli.
 *
 * VIDEO JE USPRAVAN - 720x1280, ne 1280x720. Zato se ne renda kao 16:9 traka
 * preko cijele sirine: da bi uspravan snimak popunio sirok kadar, moralo bi mu
 * se odsjeci oko dvije trecine visine. Umjesto toga stoji u svom odnosu
 * stranica, centriran, ogranicen visinom ekrana - pa se vidi cijeli.
 *
 * Ako jednom stigne pravi 16:9 snimak, promijeni --ratio u CSS-u na 16 / 9.
 */

const VIDEO = {
  src: "/videos/zidni-paneli-hero.mp4",
  poster: "/images/zidni-paneli-poster.jpg",
  width: 720,
  height: 1280,
};

const COPY = {
  title: "Akustični Zidni Paneli",
  description:
    "Premium kolekcija za ambijent, zvučnu izolaciju i interijerne detalje.",
  primary: { label: "Pogledaj Katalog", href: "/proizvodi/laminati" },
  secondary: { label: "Kontaktiraj Nas", href: "/kontakt" },
};

export default function VideoHeroSection() {
  return (
    <section className={styles.section} aria-labelledby="zidni-paneli-naslov">
      <div className={styles.stage}>
        {/*
          muted + playsInline su OBAVEZNI zajedno sa autoPlay - bez njih
          mobilni browseri odbiju da pokrenu snimak i ostane samo poster.
          preload="metadata": ne skida se 2.6 MB dok se ne krene reprodukcija.
        */}
        <video
          className={styles.video}
          src={VIDEO.src}
          poster={VIDEO.poster}
          width={VIDEO.width}
          height={VIDEO.height}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label="Prikaz akustičnih zidnih panela"
        >
          {/* ako browser ne moze da pusti snimak, ostaje poster kao slika */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIDEO.poster} alt="Akustični zidni paneli" />
        </video>
      </div>

      <div className={styles.copy}>
        <h1 className={styles.title} id="zidni-paneli-naslov">
          {COPY.title}
        </h1>
        <p className={styles.description}>{COPY.description}</p>

        <div className={styles.actions}>
          <a className={`${styles.button} ${styles.primary}`} href={COPY.primary.href}>
            {COPY.primary.label}
          </a>
          <a className={`${styles.button} ${styles.secondary}`} href={COPY.secondary.href}>
            {COPY.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}

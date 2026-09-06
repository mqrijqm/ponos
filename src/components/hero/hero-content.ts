/**
 * SVE STO SE MIJENJA BEZ DIRANJA KODA je ovdje: putanje do asseta, tekst,
 * boje i raspon scrolla.
 */

// ------------------------------------------------------------------- asseti

/**
 * Logo lockup. U SVG-u su i "MT PONOS" i slogan, sve kao krive - dakle nema
 * fonta koji treba ucitati, ali zato alt tekst mora nositi cijelu poruku.
 */
export const HERO_LOGO = {
  src: "/hero/logo-mt-ponos.svg",
  /** Prave dimenzije iz SVG-a, drze odnos stranica dok se slika ucitava. */
  width: 729,
  height: 287,
  alt: "MT PONOS — stvaramo prostor koji traje",
};

/**
 * Dugme u uvodnom frejmu, ispod loga. Slova su u SVG-u kao krive,
 * pa alt nosi tekst. Originalu je viewBox stegnut na samu pilulu - imao je
 * 186px praznog prostora sa svake strane.
 */
export const HERO_CTA = {
  src: "/hero/cta-button.svg",
  width: 340,
  height: 104,
  alt: "Vidi ponudu",
  href: "#ponuda",
};

// ----------------------------------------------------------------- velicine

/**
 * Velicine uvodnog bloka. Obicne CSS duzine, mijenjaj slobodno.
 * clamp(min, skalira se sa sirinom ekrana, max).
 */
export const HERO_SIZE = {
  logoWidth: "clamp(200px, 30vw, 440px)",
  ctaWidth: "clamp(150px, 15vw, 220px)",
  /** Razmak izmedju loga i dugmeta. */
  gap: "clamp(20px, 3vw, 44px)",
};

// -------------------------------------------------------------------- tekst

// -------------------------------------------------------------------- boje

/** #7B593E je ista boja koja je i u logo SVG-u - ako je mijenjas, mijenjaj i tamo. */
export const HERO_COLORS = {
  brand: "#7B593E",
};

// ------------------------------------------------------------------- scroll

/**
 * Podjela scrolla, sve u 0-1 gdje je 1 kraj heroja.
 *
 *   0    0.05        0.18                                          1
 *   |-----|== uvodni blok nestaje ==|                              |
 *   |        0.10 |==== daske ulaze i sjedaju ====|                |
 *   |                                      0.55 |== listanje ======|
 *
 * Faze se namjerno preklapaju, da nigdje nema praznog ekrana.
 *
 * Ukupno trajanje se ne podesava ovdje nego preko SCROLL_PAGES u
 * plank-config.ts - ovo su samo odnosi unutar tog trajanja.
 */
export const SCROLL = {
  /** Od kad uvodni blok krece da nestaje. */
  textOutStart: 0.05,
  /** Do kad je potpuno nestao. */
  textOutEnd: 0.18,
  /** Od kad prve daske ulaze u kadar. */
  assemblyStart: 0.1,
  /** Do kad je pod sklopljen; odatle pocinje listanje duz redova. */
  assemblyEnd: 0.55,
  /** Koliko piksela uvodni blok odleti prema gore dok nestaje. */
  textRise: 56,
};

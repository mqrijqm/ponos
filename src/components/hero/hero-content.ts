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

// ------------------------------------------------------------------- scroll

/**
 * TRAJANJE FAZA, u ekranima scrolla. OVDJE se podesava koliko sta traje -
 * brojka je "koliko visina ekrana korisnik skroluje kroz ovu fazu".
 *
 * Ranije su ovdje stajali razlomci 0-1, pa je svako produzenje jedne faze
 * pomjeralo sve ostale. Ovako je svaka faza nezavisna, a razlomci se racunaju.
 */
export const PHASES = {
  /** Uvodni blok (logo + dugme) stoji pa nestaje. */
  intro: 0.45,
  /** Daske ulijecu i sjedaju u pod. */
  assembly: 1.15,
  /** Listanje duz redova sklopljenog poda. */
  pan: 0.8,
  /** FAZA A - dvije daske se izdvajaju iz reda, ostale nestaju. */
  lift: 1.0,
  /** FAZA B i C - dvije daske lebde, iscrtavaju se linije i tekst. */
  showcase: 1.6,
};

/** Ukupan scroll heroja, u ekranima. Iz njega se racuna visina sekcije. */
export const SCROLL_SCREENS =
  PHASES.intro + PHASES.assembly + PHASES.pan + PHASES.lift + PHASES.showcase;

/** Ekrani -> udio u ukupnom scrollu (0-1). */
const at = (screens: number) => screens / SCROLL_SCREENS;

const introEnd = PHASES.intro;
const assemblyEnd = introEnd + PHASES.assembly;
const panEnd = assemblyEnd + PHASES.pan;
const liftEnd = panEnd + PHASES.lift;

/**
 * Podjela scrolla, sve u 0-1 gdje je 1 kraj heroja. Racuna se iz PHASES -
 * ne diraj brojke ovdje, mijenjaj PHASES.
 *
 *   |= uvodni blok =|                                                    |
 *   |    |==== daske ulaze i sjedaju ====|                               |
 *   |                        |== listanje ==|                            |
 *   |                                       |== izdvajanje ==|           |
 *   |                                                        |= lebde =| |
 *
 * Faze se namjerno preklapaju, da nigdje nema praznog ekrana.
 */
export const SCROLL = {
  /** Od kad uvodni blok krece da nestaje. */
  textOutStart: at(0.1),
  /** Do kad je potpuno nestao. */
  textOutEnd: at(introEnd),
  /** Od kad prve daske ulaze u kadar. */
  assemblyStart: at(0.25),
  /** Do kad je pod sklopljen; odatle pocinje listanje. */
  assemblyEnd: at(assemblyEnd),
  /** Kraj listanja; odatle se dvije daske izdvajaju (FAZA A). */
  panEnd: at(panEnd),
  /** Kraj izdvajanja; odatle daske samo lebde (FAZA B). */
  liftEnd: at(liftEnd),
  /** Koliko piksela uvodni blok odleti prema gore dok nestaje. */
  textRise: 56,
};

// ------------------------------------------------- FAZA C: oznake na daskama

/**
 * TEKST NA DASKAMA. Jedna stavka po izdvojenoj dasci, redom kojim su navedene
 * u SHOWCASE_PLANKS (plank-config.ts). Mijenjaj slobodno - ide u verzal sam.
 */
export const PLANK_LABELS = [
  "Otpornost na habanje klase AC4",
  "Vodootporni HDF sa klik sistemom",
];

/**
 * Oblik i mjesto pokazivaca. Sve u pikselima, osim `label` koji je udio
 * sirine/visine ekrana.
 *
 *     crtica na dasci (okomita na liniju)
 *         |
 *     ----+----______
 *                    [] kvadratic
 *                       TEKST
 *
 * OZNAKA STOJI NA FIKSNOM MJESTU U KADRU, linija je ta koja prati dasku. Tako
 * tekst uvijek pada na mirnu, tamnu povrsinu - da ide na fiksni razmak od
 * sidrista, zavrsio bi preko svijetle daske gdje se bijeli tekst ne vidi.
 *
 * `label` bira gdje: 0 je lijeva/gornja ivica, 1 desna/donja.
 */
export const MARKER = {
  desktop: {
    tick: 22,
    square: 7,
    gap: 16,
    size: 11,
    /**
     * Obje sjede u crnim klinovima izmedju dasaka. Ako se poslije mijenjaju
     * poze dasaka, ove dvije tacke se mijenjaju zajedno sa njima.
     */
    label: [
      { x: 0.66, y: 0.86 },
      { x: 0.14, y: 0.1 },
    ],
    below: false,
  },
  mobile: {
    tick: 16,
    square: 6,
    gap: 10,
    size: 10,
    /** Na uskom ekranu tekst ide ispod kvadratica, na vrh i dno kadra. */
    label: [
      { x: 0.5, y: 0.12 },
      { x: 0.5, y: 0.87 },
    ],
    below: true,
  },
};

/**
 * Kako se raspodjeljuje otkrivanje unutar FAZE C.
 *
 * `start` i `end` su udjeli scrolla (0-1) unutar faze lebdenja. `stagger` je
 * kasnjenje druge daske za prvom - bez njega se obje linije crtaju istovremeno
 * i izgleda kao da je jedan potez, ne dva podatka.
 */
export const MARKER_REVEAL = {
  start: 0.12,
  end: 0.62,
  stagger: 0.22,
  /** Do kojeg dijela otkrivanja se crta linija; ostatak je fade teksta. */
  lineShare: 0.6,
};

// -------------------------------------------------------------------- boje

/** #7B593E je ista boja koja je i u logo SVG-u - ako je mijenjas, mijenjaj i tamo. */
export const HERO_COLORS = {
  brand: "#7B593E",
  /** Pozadina heroja dok se pod sklapa. */
  background: "#ffffff",
  /**
   * Pozadina zavrsne sekcije. Neutralno tamna, bez toplog tona - da svijetla
   * daska odskoci, a antracit ne propadne u nju.
   */
  showcaseBackground: "#17191C",
  /** Boja linija i teksta preko tamne pozadine. */
  marker: "#F2EFEA",
  /**
   * Tamni obrub oko linije i teksta. Daske lebde, pa oznaka prije ili kasnije
   * predje preko alpske bijele - bez ovoga bijeli tekst tamo nestane.
   */
  markerHalo: "rgba(10, 11, 13, 0.62)",
};

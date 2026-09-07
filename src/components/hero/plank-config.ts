/**
 * Sve brojke scene na jednom mjestu, da se podesavanje radi ovdje
 * a ne po komponentama.
 *
 * Razmjera: 1 jedinica scene = 0.2 m.
 * Prava daska laminata 1220 x 190 x 8 mm  ->  6.1 x 0.95 x 0.04 jedinica.
 */

import { MARKER_REVEAL, SCROLL, SCROLL_SCREENS } from "./hero-content";

export const METERS_PER_UNIT = 0.2;

export const PLANK = {
  length: 6.1, // X - duzina daske
  thickness: 0.04, // Y - debljina
  width: 0.95, // Z - sirina
  /** Segmenti po duzini, da normal mapa ima gustinu na kojoj radi. */
  segments: [48, 1, 8] as [number, number, number],
  /** Razmak izmedju dasaka u sklopljenom podu (fuga). */
  gap: 0.003,
};

/**
 * JEDNA tekstura za sve daske. Zrno je svuda isto, boja nije.
 *
 * Mapa boje je desaturisana (scripts/prepare-plank-color.mjs). Original
 * diff.webp je jako narandzast, a boja materijala se sa mapom MNOZI - moze da
 * oduzme, ne i da izjednaci kanale. Na narandzastoj mapi antracit ispadne
 * braon. Na sivoj mapi je material.color jedina boja u igri.
 *
 * normal.png i rough.png su originalne i one nose zrno.
 */
export const PLANK_TEXTURE = {
  /**
   * Koliko metara stvarnog poda pokriva jedan otisak. Namjerno vise od stvarnih
   * ~2 m: na tacnoj razmjeri jedna nasa daska pokrije tacno jednu dasku iz
   * fotografije pa uvijek pokupi i celni spoj. Sa 3.2 se uzima kraci isjecak -
   * vlakna se malo izduze, ali daska ostaje cista.
   */
  physicalSize: 3.2,
  /** Koliko se dasaka vidi popreko u otisku - offset se hvata na sredinu jedne. */
  strips: 9,
};

/**
 * Prosjecna vrijednost rough.png, izmjerena: 96/255. Treba jer three MNOZI
 * material.roughness sa mapom. Mapa je tamna, pa da bi se stiglo do stvarne
 * hrapavosti od 0.6 mnozilac mora biti veci od 1 (0.6 / 0.377 = 1.6). Three
 * mnozi pa tek onda odsijeca na 1.0, tako da je to ispravno - ne greska.
 */
export const ROUGH_MAP_MEAN = 0.377;

export type DecorName =
  | "svijetli_hrast"
  | "orah"
  | "antracit"
  | "sivi_hrast"
  | "bijeli_jasen"
  | "alpska_bijela";

export type Decor = {
  /** Boja dekora. Mnozi se sa sivom mapom, pa je ovo stvarno boja daske. */
  color: string;
  /** Hrapavost 0.55-0.70: laminat je mat do polumat. Nize = sjajnije. */
  roughness: number;
  /** Tamni dekori - nikad dva jedan do drugog u rasporedu ispod. */
  dark?: boolean;
};

/**
 * ==========================================================================
 * PALETA DEKORA - ovdje se mijenjaju boje dasaka.
 * ==========================================================================
 *
 * Antracit i sivi hrast su HLADNI tonovi, svijetli hrast i orah TOPLI. Zato je
 * svjetlo u sceni neutralno bijelo (PlankScene.tsx): cim se na izvor stavi topli
 * tint, sivi dekori odu u prljavo bez.
 */
export const DECORS: Record<DecorName, Decor> = {
  // neutralniji od pocetnog #DAB080 - onaj je u renderu ispadao drecavo
  // breskvast; ista svjetlina, manje zasicenja
  svijetli_hrast: { color: "#CDB395", roughness: 0.60 },
  orah: { color: "#7F5837", roughness: 0.58, dark: true },
  antracit: { color: "#334144", roughness: 0.68, dark: true },
  sivi_hrast: { color: "#69655C", roughness: 0.66 },
  bijeli_jasen: { color: "#CDC6BB", roughness: 0.64 },
  /** Cisto bijeli dekor. Postoji zbog zavrsnice - odskace na tamnoj pozadini. */
  alpska_bijela: { color: "#E4E0DA", roughness: 0.62 },
};

/**
 * ==========================================================================
 * RASPORED - red po red u sklopljenom podu. Ovdje se mijenja izgled poda.
 * ==========================================================================
 *
 * Tri pravila, i dev provjera ispod vice u konzolu ako se neko prekrsi:
 *   1. nikad dvije susjedne daske iste boje
 *   2. nikad dvije tamne (antracit, orah) jedna do druge
 *   3. antracit je akcenat - najvise dvije daske u cijelom podu
 *
 * Na uskom ekranu se vidi samo prvih MOBILE_PLANK_COUNT redova, zato je jedan
 * antracit rano (indeks 3) a drugi kasno (indeks 14) - i mobilni kadar dobije
 * svoj akcenat.
 */
export const DECOR_ORDER: DecorName[] = [
  "svijetli_hrast", "orah", "bijeli_jasen", "antracit", "sivi_hrast",
  "orah", "svijetli_hrast", "sivi_hrast", "orah", "alpska_bijela",
  "svijetli_hrast", "sivi_hrast", "orah", "bijeli_jasen", "antracit",
  "svijetli_hrast", "sivi_hrast", "orah", "bijeli_jasen", "sivi_hrast",
];

/** Najvise koliko antracit dasaka smije biti u podu. */
const MAX_ANTRACIT = 2;

/** Provjera pravila rasporeda. Radi samo u razvoju - u produkciji je nema. */
function checkDecorOrder(order: DecorName[]) {
  const problems: string[] = [];

  for (let i = 1; i < order.length; i++) {
    if (order[i] === order[i - 1]) {
      problems.push(`daske ${i - 1} i ${i}: dvije iste boje jedna do druge (${order[i]})`);
    } else if (DECORS[order[i]].dark && DECORS[order[i - 1]].dark) {
      problems.push(`daske ${i - 1} i ${i}: dvije tamne jedna do druge (${order[i - 1]} + ${order[i]})`);
    }
  }

  const antracit = order.filter((d) => d === "antracit").length;
  if (antracit > MAX_ANTRACIT) {
    problems.push(`antracit je akcenat: ${antracit} dasaka, dozvoljeno je ${MAX_ANTRACIT}`);
  }

  if (problems.length) {
    console.warn(["DECOR_ORDER krsi pravila rasporeda:", ...problems].join("\n  "));
  }
}

if (process.env.NODE_ENV !== "production") checkDecorOrder(DECOR_ORDER);

export function texturePaths() {
  return {
    map: "/textures/laminate/color_desat.webp",
    normalMap: "/textures/laminate/normal.png",
    roughnessMap: "/textures/laminate/rough.png",
  };
}

/**
 * Pocetno stanje jedne daske. Umjesto sirove pozicije cuva se SMJER iz kojeg
 * daska ulazi - tacka se onda racuna na elipsi tik izvan kadra (vidi ENTRY),
 * pa daska ima najkraci moguci put a na startu se ipak ne vidi.
 */
export type PlankDef = {
  decor: DecorName;
  /** Smjer ulaska u radijanima: 0 = desno, PI/2 = odozgo. */
  angle: number;
  /** Koliko je izvan te elipse, 1 = tacno na njoj. */
  distance: number;
  /** Dubina na startu - koliko je blizu kameri. */
  z: number;
  rotation: [number, number, number];
  scale: number;
  /** Pomak teksture, da se ne vidi da je svuda isti otisak. */
  uv: [number, number];
};

/**
 * Elipsa tik izvan kadra sa koje daske ulaze. Poluosa je u jedinicama scene i
 * prati oblik ekrana - siroka za desktop, visoka za mobilni. Ako se vidi vrh
 * daske na scroll = 0, povecaj odgovarajucu poluosu.
 */
export const ENTRY = {
  desktop: { x: 16, y: 12 },
  mobile: { x: 12, y: 18 },
};

/** Koliko se redova vidi na uskom ekranu - prvih toliko iz DECOR_ORDER. */
export const MOBILE_PLANK_COUNT = 12;

/** Deterministicki pseudo-random iz indeksa - isti raspored na svakom renderu. */
function noise(index: number, salt: number) {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Zlatni ugao ravnomjerno razbacuje smjerove - nema dvije daske iz istog ugla. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Pocetna stanja se racunaju iz indeksa umjesto da se rucno kucaju - lista
 * dekora moze da raste a da raspored ostane ravnomjeran.
 */
export const PLANKS: PlankDef[] = DECOR_ORDER.map((decor, i) => {
  return {
    decor,
    angle: i * GOLDEN_ANGLE + (noise(i, 1) - 0.5) * 0.6,
    distance: 1 + noise(i, 2) * 0.3,
    z: (noise(i, 3) - 0.5) * 6,
    rotation: [
      (noise(i, 4) - 0.5) * 0.9,
      (noise(i, 5) - 0.5) * 1.2,
      (noise(i, 6) - 0.5) * 0.7,
    ],
    scale: 1 + noise(i, 7) * 0.28,
    uv: [noise(i, 8), i + noise(i, 9)],
  };
});

/**
 * Kamera se opisuje uglom i rastojanjem, ne sirovom pozicijom - tako se
 * krajnji kadar moze zadati kao "tacno odozgo" bez racunanja koordinata.
 */
export type CameraKeyframe = {
  /** Ugao iznad ravni poda, u stepenima. 90 = tacno odozgo. */
  elevation: number;
  /** Vidno polje. Manje = ravnija slika, manje perspektivnog suzavanja. */
  fov: number;
  /** Pomak kamere u stranu. */
  offsetX: number;
  /** Visina tacke u koju kamera gleda. */
  targetY: number;
  /**
   * Rastojanje od te tacke. "fit" znaci: izracunaj tako da cijeli pod
   * stane u kadar, kakav god da je oblik ekrana.
   */
  distance: number | "fit";
};

export type CameraView = {
  from: CameraKeyframe;
  to: CameraKeyframe;
  /** Koliko kamera "obidje" u stranu na sredini puta. */
  orbit: number;
};

/**
 * Uspravan ekran ima mnogo uzi horizontalni vidokrug, pa daska od 6.1 jedinica
 * ne stane u isti kadar - zato dva kadra.
 *
 * Krajnji kadar je namjerno elevation 90 uz uzak fov: kamera je okomita na pod
 * i perspektiva je prakticno ponistena, pa daske citaju kao paralelne trake
 * iste sirine, bez trapeza.
 */
export const CAMERA: { desktop: CameraView; mobile: CameraView } = {
  desktop: {
    from: { elevation: 9, fov: 40, offsetX: 0, targetY: 1.2, distance: 15.2 },
    to: { elevation: 90, fov: 22, offsetX: 0, targetY: 0, distance: "fit" },
    orbit: 1,
  },
  mobile: {
    from: { elevation: 11, fov: 50, offsetX: 0, targetY: 1.2, distance: 24.5 },
    to: { elevation: 90, fov: 26, offsetX: 0, targetY: 0, distance: "fit" },
    orbit: 0.4,
  },
};

/**
 * Kako pod stoji u krajnjem kadru.
 *
 *   "cover"   - pod popunjava cijeli kadar, vanjske daske ispadaju van ivica.
 *               Trake idu od ivice do ivice, pozadina se na kraju ne vidi.
 *   "contain" - cijeli pod stane u kadar, pozadina ostaje vidljiva okolo.
 *
 * margin ispod 1 znaci da pod prelazi preko ivica kadra (bleed) na sve cetiri
 * strane. 1 = tacno do ivica, iznad 1 = ostaje prostora okolo.
 */
export const FLOOR_FIT: { mode: "cover" | "contain"; margin: number } = {
  mode: "cover",
  margin: 0.92,
};

/** Gabariti sklopljenog poda, gledano odozgo. */
export function floorSpan(count: number, isMobile: boolean) {
  const across = count * PLANK.width + (count - 1) * PLANK.gap;
  return isMobile ? { x: across, z: PLANK.length } : { x: PLANK.length, z: across };
}

/** Rastojanje kamere na kojem pod sjedne u kadar zadatog oblika. */
export function fitDistance(fov: number, aspect: number, spanX: number, spanZ: number) {
  const half = Math.tan((fov * Math.PI) / 360);
  const forHeight = (spanZ * FLOOR_FIT.margin) / (2 * half);
  const forWidth = (spanX * FLOOR_FIT.margin) / (2 * half * aspect);
  // dalje = sve stane; blize = popunjava kadar i visak ispada van
  return FLOOR_FIT.mode === "contain"
    ? Math.max(forHeight, forWidth)
    : Math.min(forHeight, forWidth);
}

/**
 * Ukupno kasnjenje izmedju prve i posljednje daske, kao dio faze sklapanja.
 * Racuna se na ukupan raspon, ne po dasci - tako dodavanje redova ne razvuce
 * animaciju.
 */
export const STAGGER_SPREAD = 0.45;

/**
 * Koliko ekrana scrolla traje hero. Zbir svih faza - podesava se preko PHASES
 * u hero-content.ts, ne ovdje.
 */
export const SCROLL_PAGES = SCROLL_SCREENS;

/** Vremenska konstanta glacanja scrolla, u sekundama. Manje = odzivnije. */
export const SCROLL_DAMPING = 0.12;

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Progres sklapanja 0-1. Krece dok tekst jos nestaje, da nema prazne pauze
 * izmedju dvije faze, i zavrsava se prije kraja - ostatak je listanje.
 */
export function assemblyProgress(offset: number) {
  return clamp((offset - SCROLL.assemblyStart) / (SCROLL.assemblyEnd - SCROLL.assemblyStart));
}

/** Progres listanja 0-1, izmedju sklapanja i izdvajanja. */
export function panProgress(offset: number) {
  return clamp((offset - SCROLL.assemblyEnd) / (SCROLL.panEnd - SCROLL.assemblyEnd));
}

/** FAZA A - progres izdvajanja dvije daske iz reda, 0-1. */
export function liftProgress(offset: number) {
  return clamp((offset - SCROLL.panEnd) / (SCROLL.liftEnd - SCROLL.panEnd));
}

/** FAZA B - progres lebdenja poslije izdvajanja, 0-1. */
export function showcaseProgress(offset: number) {
  return clamp((offset - SCROLL.liftEnd) / (1 - SCROLL.liftEnd));
}

/**
 * FAZA C - otkrivanje jedne oznake, 0-1. Druga daska kasni za prvom
 * (MARKER_REVEAL.stagger), pa se dvije linije ne crtaju kao jedan potez.
 */
export function markerProgress(showcase: number, slot: number) {
  const { start, end, stagger } = MARKER_REVEAL;
  const from = start + slot * stagger;
  return clamp((showcase - from) / Math.max(end - from, 0.0001));
}

/** Progres jedne daske - isti scroll, ali svaka krece sa svojim kasnjenjem. */
export function plankProgress(progress: number, index: number, count: number) {
  const start = count > 1 ? (index / (count - 1)) * STAGGER_SPREAD : 0;
  return easeOutCubic(clamp((progress - start) / (1 - STAGGER_SPREAD)));
}

/**
 * Koliko se pod pomjeri tokom listanja, u jedinicama scene. Mora biti manje od
 * dubine poda (broj redova x 0.96) umanjene za vidljivi dio, inace se prelista
 * do ivice.
 */
export const PAN_DISTANCE = { desktop: 12, mobile: 8 };

/** Pomak poda u fazi listanja: od jednog kraja ka drugom. */
export function panOffset(panProgress: number, isMobile: boolean) {
  const distance = isMobile ? PAN_DISTANCE.mobile : PAN_DISTANCE.desktop;
  return lerp(distance / 2, -distance / 2, easeOutCubic(clamp(panProgress)));
}

/**
 * Krajnje stanje jedne daske - redovi centrirani oko nule, pomjereni za `pan`.
 *
 * Na uskom ekranu je pod okrenut za 90 stepeni. Nije radi izgleda nego radi
 * geometrije: da bi pod prelazio preko ivica uspravnog ekrana sa vodoravnim
 * daskama, trebalo bi ih 14+ (duzina daske mora prekriti usku stranu, pa se
 * na visoku stranu nakupi mnogo redova). Okrenut pod isto izlazi van sve
 * cetiri ivice, ali sa 5 dasaka.
 */
export function finalTransform(index: number, count: number, isMobile: boolean, pan: number) {
  const offset = (index - (count - 1) / 2) * (PLANK.width + PLANK.gap) + pan;
  return isMobile
    ? { position: [offset, 0, 0] as [number, number, number], rotationY: Math.PI / 2 }
    : { position: [0, 0, offset] as [number, number, number], rotationY: 0 };
}

/**
 * Pocetna pozicija daske: tacka na elipsi tik izvan kadra, u smjeru koji je
 * zadat u PLANKS. Odatle daska ulazi ka centru.
 */
export function startPosition(def: PlankDef, isMobile: boolean): [number, number, number] {
  const entry = isMobile ? ENTRY.mobile : ENTRY.desktop;
  return [
    Math.cos(def.angle) * entry.x * def.distance,
    Math.sin(def.angle) * entry.y * def.distance,
    def.z,
  ];
}


// ------------------------------------------------- ZAVRSNICA (faze A, B, C)

/**
 * Koje daske ostaju na kraju. Indeksi u DECOR_ORDER, redom kojim im pripadaju
 * tekstovi iz PLANK_LABELS.
 *
 * Oba moraju biti manja od MOBILE_PLANK_COUNT - na uskom ekranu se ostale ni
 * ne renderuju, pa daska koja nije u prvih 12 na mobilnom ne bi ni postojala.
 */
export const SHOWCASE_PLANKS = [3, 9];

/**
 * Gdje daska zavrsi kad se izdvoji iz reda.
 *
 * Kamera je na kraju listanja TACNO iznad poda i gleda nadolje, i tu ostaje do
 * kraja - zato se ovdje racuna u ekranskim pojmovima:
 *
 *   x   desno je +          (svijet X)
 *   z   dolje je +          (svijet Z; gore je -)
 *   y   podizanje ka kameri (veci broj = daska blize = veca u kadru)
 *   spin  rotacija u ravni ekrana, u stepenima; 0 = daska lezi vodoravno
 *   tilt  blagi nagib, da daska nije savrseno paralelna sa ekranom nego
 *         hvata perspektivu (jedan kraj blize od drugog)
 */
export type ShowcasePose = {
  x: number;
  y: number;
  z: number;
  spin: number;
  tiltX: number;
  tiltZ: number;
};

/**
 * DVIJE POZE. Namjerno nesimetricne: razlicit ugao, razlicita visina i pomak
 * od centra, pa kompozicija ide po dijagonali umjesto da se ogleda.
 *
 * Druga daska je visa (blize kameri) - ona prelazi PREKO prve i baca sjenku
 * na nju.
 *
 * Mobilni: daske su uspravnije (spin oko 90 znaci da idu odozgo nadolje, jer
 * je na uskom ekranu i sam pod okrenut za 90 stepeni) i manje su rotirane -
 * na uskom kadru veci ugao ih izbaci van ivica prije nego se vide.
 */
export const SHOWCASE: { desktop: ShowcasePose[]; mobile: ShowcasePose[] } = {
  desktop: [
    { x: -0.76, y: 2.0, z: -0.3, spin: -34, tiltX: 7, tiltZ: -5 },
    { x: -0.23, y: 2.4, z: 0.31, spin: 26, tiltX: -6, tiltZ: 6 },
  ],
  mobile: [
    { x: -0.4, y: 1.1, z: -0.5, spin: 78, tiltX: 5, tiltZ: -4 },
    { x: 0.45, y: 2.0, z: 0.7, spin: 103, tiltX: -5, tiltZ: 5 },
  ],
};

/**
 * Koliko daske "lebde" tokom FAZE B, u jedinicama scene i stepenima.
 *
 * Parallax: dvije daske se pomjeraju razlicitom brzinom (druga sporije i u
 * suprotnom smjeru), pa se odnos medju njima mijenja i kadar ne stoji mrtav.
 */
export const FLOAT = {
  /** Pomak gore-dolje po dasci, kroz cijelu fazu. */
  drift: [0.55, -0.38],
  /** Pomak lijevo-desno po dasci. */
  sway: [-0.22, 0.3],
  /** Koliko stepeni se daska jos okrene kroz fazu. */
  turn: [2.4, -3.1],
  /** Koliko se jos priblizi kameri kroz fazu. */
  rise: [0.18, 0.3],
};

/** Koliko daleko ispod poda odu ostale daske dok nestaju. */
export const FADE_DEPTH = 4.5;

/**
 * Tacka na dasci iz koje izlazi pokazivac, u lokalnim koordinatama daske.
 * X je duz duzine (0 = sredina), Y je gornja povrsina.
 *
 * Namjerno nije u sredini: pokazivac iz centra daske izgleda kao naslov, a iz
 * pomjerene tacke kao oznaka na crtezu.
 */
export const MARKER_ANCHOR: [number, number, number][] = [
  // Prva je namjerno daleko od sredine: sredinu tamne daske prekriva svijetla,
  // pa bi sidriste ispalo "na" pogresnoj dasci.
  [1.7, PLANK.thickness / 2, 0.12],
  [-0.6, PLANK.thickness / 2, -0.1],
];

const RAD = Math.PI / 180;

/**
 * Krajnje stanje jedne izdvojene daske, sa vec ukljucenim lebdenjem.
 * `slot` je redni broj u SHOWCASE_PLANKS, `float` je progres FAZE B.
 */
export function showcaseTransform(slot: number, isMobile: boolean, float: number) {
  const pose = (isMobile ? SHOWCASE.mobile : SHOWCASE.desktop)[slot];
  const f = easeOutCubic(clamp(float));

  return {
    position: [
      pose.x + FLOAT.sway[slot] * f,
      pose.y + FLOAT.rise[slot] * f,
      pose.z + FLOAT.drift[slot] * f,
    ] as [number, number, number],
    rotation: [
      pose.tiltX * RAD,
      (pose.spin + FLOAT.turn[slot] * f) * RAD,
      pose.tiltZ * RAD,
    ] as [number, number, number],
  };
}

/**
 * Da li je daska jedna od izdvojenih, i koja po redu. -1 ako nije.
 */
export function showcaseSlot(index: number) {
  return SHOWCASE_PLANKS.indexOf(index);
}

/**
 * Unutar ovog poluprecnika (u ravni ekrana) daska baca sjenku. Dalje od toga
 * ne - sjenka daske koja je van kadra inace padne unutar kadra.
 */
export const SHADOW_RADIUS = 9;

/**
 * Da li ijedna daska trenutno baca sjenku.
 *
 * Treba jer VSM sjenke ostavljaju blijede mrlje po ravni-hvatacu kad je mapa
 * sjenki prazna, pa se ta ravan gasi dok nema nijednog bacaca.
 */
export function anyPlankCasts(progress: number, count: number, isMobile: boolean) {
  for (let i = 0; i < count; i++) {
    const t = plankProgress(progress, i, count);
    const start = startPosition(PLANKS[i], isMobile);
    if (Math.hypot(lerp(start[0], 0, t), lerp(start[1], 0, t)) < SHADOW_RADIUS) {
      return true;
    }
  }
  return false;
}

/**
 * Sve brojke scene na jednom mjestu, da se podesavanje radi ovdje
 * a ne po komponentama.
 *
 * Razmjera: 1 jedinica scene = 0.2 m.
 * Prava daska laminata 1220 x 190 x 8 mm  ->  6.1 x 0.95 x 0.04 jedinica.
 */

import { SCROLL } from "./hero-content";

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

export type TextureSetName = "laminate" | "wood" | "synthetic";

export type TextureSet = {
  /** Folder u public/textures/ */
  dir: TextureSetName;
  /** Koliko metara stvarnog poda pokriva jedan otisak teksture (Poly Haven skala). */
  physicalSize: number;
  /**
   * true ako daske u samoj teksturi idu vertikalno - onda UV rotiramo 90 stepeni
   * da vlakna prate duzinu nase daske, a ne sirinu.
   */
  rotated: boolean;
  /**
   * Koliko dasaka/lamela se vidi popreko u teksturi. Ako je zadato, offset se
   * "hvata" na sredinu jedne od njih pa daska ne pokupi fugu iz teksture.
   */
  strips?: number;
  /** Mnozi se sa diffuse mapom - za smirivanje presaturiranih setova. */
  tint?: string;
};

export const TEXTURE_SETS: Record<TextureSetName, TextureSet> = {
  // Hrastov laminat, daske idu horizontalno, ~9 redova po otisku.
  // physicalSize je namjerno veci od stvarnih ~2 m: na stvarnoj razmjeri jedna
  // nasa daska pokrije tacno jednu duzinu iz fotografije, pa uvijek pokupi i
  // celni spoj. Sa 3.2 uzimamo kraci isjecak - vlakna se malo izduze, ali
  // daska ostaje cista.
  laminate: { dir: "laminate", physicalSize: 3.2, rotated: false, strips: 9 },
  // Parket, daske idu vertikalno, ~10 kolona - isti razlog za razmjeru.
  wood: { dir: "wood", physicalSize: 3, rotated: true, strips: 10 },
  // Uske lamele, vertikalno. Pregusto da se poravnava, i presaturirano pa se tonira.
  synthetic: { dir: "synthetic", physicalSize: 2, rotated: true, tint: "#c9c2b8" },
};

export function texturePaths(set: TextureSetName) {
  return {
    map: `/textures/${set}/diff.webp`,
    normalMap: `/textures/${set}/normal.png`,
    roughnessMap: `/textures/${set}/rough.png`,
  };
}

/**
 * Pocetno stanje jedne daske. Umjesto sirove pozicije cuva se SMJER iz kojeg
 * daska ulazi - tacka se onda racuna na elipsi tik izvan kadra (vidi ENTRY),
 * pa daska ima najkraci moguci put a na startu se ipak ne vidi.
 */
export type PlankDef = {
  set: TextureSetName;
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

/**
 * RASPORED DEKORA - red po red u sklopljenom podu, odozgo nadolje.
 * Ovdje se mijenja izgled poda. Tamne (synthetic) su namjerno razmaknute
 * da ne prave blok.
 *
 * Na uskom ekranu se koristi samo prvih MOBILE_PLANK_COUNT redova.
 */
export const PLANK_SETS: TextureSetName[] = [
  "laminate", "wood", "laminate", "synthetic", "wood",
  "laminate", "wood", "synthetic", "laminate", "wood",
  "laminate", "synthetic", "wood", "laminate", "wood",
  "synthetic", "laminate", "wood", "laminate", "synthetic",
];

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
export const PLANKS: PlankDef[] = PLANK_SETS.map((set, i) => {
  return {
    set,
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
 * Koliko ekrana scrolla traje hero. Ovo je glavna rucica za trajanje:
 * 1.6 znaci da se cijela sekvenca odvrti kroz 1.6 visine ekrana.
 */
export const SCROLL_PAGES = 2.6;

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

/** Progres listanja 0-1, poslije sklapanja. */
export function panProgress(offset: number) {
  return clamp((offset - SCROLL.assemblyEnd) / (1 - SCROLL.assemblyEnd));
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

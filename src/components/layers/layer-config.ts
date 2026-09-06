/**
 * SVE BROJKE SEKCIJE SA SLOJEVIMA su ovdje - debljine, razmaci, kamera,
 * raspon scrolla i sadrzaj markera. Komponente iznad ovoga samo crtaju.
 *
 * Gabarit daske je 4 x 2 jedinice (X x Z), debljine su po Y. Slojevi su
 * poredani odozgo nadolje, kao u stvarnoj dasci laminata.
 */

import * as THREE from "three";

// ---------------------------------------------------------------- pozadina

/**
 * Pozadina sekcije. Scena se crta sa alfa kanalom, pa boja dolazi iz CSS-a na
 * sticky kontejneru - ovdje, na jednom mjestu.
 *
 * Krem je ista boja koju nosi cijela stranica (--c u globals.css). Cisto
 * bijelo bi se preko krem stranice vidjelo kao svijetla traka sa ostrom
 * ivicom gore i dolje. Za bijelo stavi "#ffffff".
 */
export const BACKGROUND = "#f5f3ee";

// ------------------------------------------------------------------ gabarit

/** Tlocrt daske. Isti za svih pet slojeva. */
export const PLANK_SIZE = { width: 4, depth: 2 };

// ---------------------------------------------------------------- materijali

/**
 * Kako se sloj crta.
 *
 *   "folija"  - providan sloj, meshPhysicalMaterial sa transmisijom
 *   "teksture"- boja + normala (+ roughness) iz public/textures
 *   "ravna"   - jedna boja, bez teksture
 */
export type MaterialDef =
  | {
      vrsta: "folija";
      boja: string;
      transmission: number;
      thickness: number;
      roughness: number;
      ior: number;
      /** boju koju svjetlo pokupi dok prolazi kroz sloj */
      attenuationColor: string;
      /** na kojoj duzini puta se ta boja skupi - manje = izrazenije */
      attenuationDistance: number;
    }
  | {
      vrsta: "teksture";
      map: string;
      normalMap: string;
      /** dekor namjerno nema roughness mapu - drvo se smiruje jednom vrijednoscu */
      roughnessMap?: string;
      /** koliko JEDINICA SCENE pokriva jedan otisak teksture; vece = krupnije zrno */
      tile: number;
      /** koristi se samo kad nema roughnessMap */
      roughness: number;
      /** jacina reljefa iz normale, 1 = kako je snimljeno */
      normalScale: number;
      /** mnozi se sa mapom boje, za smirivanje presaturiranih setova */
      boja?: string;
    }
  | { vrsta: "ravna"; boja: string; roughness: number };

// -------------------------------------------------------------------- slojevi

export type LayerId = "overlay" | "dekor" | "hdf" | "balans" | "pluta";

export type LayerDef = {
  id: LayerId;
  /** za anotaciju; marker za sada pokazuje samo broj */
  naziv: string;
  /** OVDJE SE DOPISUJE TEKST ANOTACIJE - prazno znaci da marker ostaje samo broj */
  opis: string;
  /** debljina po Y, u jedinicama scene */
  debljina: number;
  materijal: MaterialDef;
  /**
   * Koliko se sloj podigne u razdvojenom stanju.
   *
   * RAZLIKA IZMEDJU DVA SUSJEDNA OFFSETA = VIDLJIVI RAZMAK izmedju njih,
   * jer se u sklopljenom stanju slojevi dodiruju. Trenutno: 0.50, 0.55,
   * 0.45, 0.40 odozgo nadolje. Pluta je na nuli - ona ostaje na mjestu.
   */
  offsetY: number;
  /** Tacka na desnoj ivici sloja, u koordinatama samog sloja. Tu stoji marker. */
  anchor: [number, number, number];
  /** Ima li pero i utor. Bez toga je sloj obican kvadar. */
  profil: boolean;
};

/**
 * PET SLOJEVA, ODOZGO NADOLJE.
 *
 * Debljine su namjerno u odnosu kao na presjeku stvarne daske: HDF jezgro nosi
 * skoro dvije trecine, overlay je tanak koliko se moze vidjeti.
 */
export const LAYERS: LayerDef[] = [
  {
    id: "overlay",
    naziv: "Overlay",
    opis: "",
    debljina: 0.02,
    materijal: {
      vrsta: "folija",
      // jedva primjetan hladan ton, da se folija odvoji od toplog drveta ispod
      boja: "#e8f0f4",
      transmission: 0.9,
      thickness: 0.05,
      roughness: 0.05,
      ior: 1.4,
      // Bez ovoga je folija na bijeloj pozadini prakticno nevidljiva. Svjetlo
      // koje prodje kroz nju pokupi hladan ton, a clearcoat doda ostar odsjaj -
      // tek onda se cita kao staklo, a ne kao rupa.
      attenuationColor: "#a9c6d6",
      attenuationDistance: 0.5,
    },
    offsetY: 1.9,
    anchor: [2.35, 0.06, 0],
    profil: false,
  },
  {
    id: "dekor",
    naziv: "Dekor",
    opis: "",
    debljina: 0.04,
    materijal: {
      vrsta: "teksture",
      // jedini sloj sa vidljivim drvetom; teksture su vec u projektu iz heroja
      map: "/textures/laminate/diff.webp",
      normalMap: "/textures/laminate/normal.png",
      tile: 9,
      roughness: 0.55,
      normalScale: 0.7,
    },
    offsetY: 1.4,
    anchor: [2.35, 0.07, 0],
    profil: true,
  },
  {
    id: "hdf",
    naziv: "HDF jezgro",
    opis: "",
    debljina: 0.18,
    materijal: {
      vrsta: "teksture",
      map: "/textures/layers/hdf/color.webp",
      normalMap: "/textures/layers/hdf/normal.png",
      roughnessMap: "/textures/layers/hdf/rough.png",
      tile: 0.9,
      roughness: 1,
      normalScale: 0.9,
    },
    offsetY: 0.85,
    anchor: [2.35, 0.14, 0],
    profil: true,
  },
  {
    id: "balans",
    naziv: "Balans sloj",
    opis: "",
    debljina: 0.03,
    materijal: { vrsta: "ravna", boja: "#D9C4B4", roughness: 0.9 },
    offsetY: 0.4,
    anchor: [2.35, 0.06, 0],
    profil: false,
  },
  {
    id: "pluta",
    naziv: "Pluta",
    opis: "",
    debljina: 0.06,
    materijal: {
      vrsta: "teksture",
      map: "/textures/layers/cork/color.webp",
      normalMap: "/textures/layers/cork/normal.png",
      roughnessMap: "/textures/layers/cork/rough.png",
      tile: 1.1,
      roughness: 1,
      normalScale: 1,
      // desaturisana pluta ispadne blijedo roze i stopi se sa balans slojem
      // iznad; ovaj tint je vraca u toplu smedju i razdvaja ta dva sloja
      boja: "#c79c72",
    },
    offsetY: 0,
    anchor: [2.35, 0.08, 0],
    profil: false,
  },
];

/** Ukupna debljina sklopljene daske. */
export const STACK_HEIGHT = LAYERS.reduce((sum, layer) => sum + layer.debljina, 0);

/**
 * Y centra sloja u SKLOPLJENOM stanju. Slojevi se dodiruju bez razmaka, a
 * cijeli paket je centriran oko nule - na progresu 0 to je jedna puna daska.
 */
export function stackedY(index: number) {
  let above = 0;
  for (let i = 0; i < index; i++) above += LAYERS[i].debljina;
  return STACK_HEIGHT / 2 - above - LAYERS[index].debljina / 2;
}

// ------------------------------------------------------------- pero i utor

/**
 * Profil pera i utora, sve kao UDIO DEBLJINE sloja - zato isti oblik radi i na
 * HDF-u (0.18) i na tanjem dekoru (0.04).
 */
export const TONGUE = {
  /** visina pera */
  height: 0.35,
  /**
   * Koliko pero izlazi iz tijela daske.
   *
   * 0.9 debljine, ne 0.4: na dasci od 4 jedinice je pero od 0.4 * 0.18 svega
   * desetak piksela na ekranu, a profil je ono zbog cega sekcija postoji.
   * Klik-sistemi na stvarnom laminatu ionako izlaze otprilike koliko je ploca
   * debela. Spusti na 0.4 ako ti treba doslovna proporcija.
   */
  length: 0.9,
  /** koliko je vrh pera zakosen, kao udio visine pera */
  chamfer: 0.22,
  /**
   * Utor je za ovoliko veci od pera sa svake strane. Ogranicava se i na 6%
   * debljine: na tankom dekoru bi fiksnih 0.005 pojelo usne oko utora.
   */
  tolerance: 0.005,
};

/**
 * Blago obaranje ivica. Bez njega ivice presjeka hvataju aliasing - na bijeloj
 * pozadini se to vidi kao treperava stepenasta linija.
 */
export const BEVEL = { size: 0.004, thickness: 0.004, segments: 2 };

/**
 * Presjek sa perom i utorom, izvucen po Z.
 *
 * Crta se u XY: X je duzina daske (4), Y je debljina. Desna ivica ima pero koje
 * izlazi iz sredine debljine, lijeva ima ogledalni utor. ExtrudeGeometry onda
 * taj presjek izvuce po Z na dubinu 2.
 *
 * Bevel SIRI geometriju prema van - za bevelSize po X i Y, za bevelThickness po
 * Z - pa se shape unaprijed smanji za toliko. Tako gabarit ostaje tacno
 * 4 x debljina x 2, isti kao kod obicnih kvadara.
 */
export function createProfileGeometry(thickness: number) {
  // na tankim slojevima bi puni bevel pojeo sam profil, pa se ogranicava
  const bevelSize = Math.min(BEVEL.size, thickness * 0.08);
  const bevelThickness = Math.min(BEVEL.thickness, thickness * 0.08);

  const halfW = PLANK_SIZE.width / 2 - bevelSize;
  const halfT = thickness / 2 - bevelSize;
  const depth = PLANK_SIZE.depth - 2 * bevelThickness;

  const tongueHeight = thickness * TONGUE.height;
  const tongueLength = thickness * TONGUE.length;
  const chamfer = tongueHeight * TONGUE.chamfer;
  const tolerance = Math.min(TONGUE.tolerance, thickness * 0.06);

  const half = tongueHeight / 2;
  const grooveHalf = half + tolerance;
  const grooveDepth = tongueLength + tolerance;

  const shape = new THREE.Shape();
  // donja povrsina, slijeva nadesno do ramena ispod pera
  shape.moveTo(-halfW, -halfT);
  shape.lineTo(halfW - tongueLength, -halfT);
  shape.lineTo(halfW - tongueLength, -half);
  // pero: donja strana, zakosen vrh, gornja strana
  shape.lineTo(halfW - chamfer, -half);
  shape.lineTo(halfW, -half + chamfer);
  shape.lineTo(halfW, half - chamfer);
  shape.lineTo(halfW - chamfer, half);
  shape.lineTo(halfW - tongueLength, half);
  // rame iznad pera pa gornja povrsina nazad ulijevo
  shape.lineTo(halfW - tongueLength, halfT);
  shape.lineTo(-halfW, halfT);
  // utor: usjecen u lijevu ivicu, ogledalno peru
  shape.lineTo(-halfW, grooveHalf);
  shape.lineTo(-halfW + grooveDepth, grooveHalf);
  shape.lineTo(-halfW + grooveDepth, -grooveHalf);
  shape.lineTo(-halfW, -grooveHalf);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 1,
    bevelEnabled: true,
    bevelSize,
    bevelThickness,
    bevelSegments: BEVEL.segments,
    bevelOffset: 0,
  });

  // ExtrudeGeometry izvlaci od z=0 nadesno; pomjeramo da bude centrirano
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/**
 * Obican kvadar, za slojeve bez profila.
 *
 * UV se prepisuje planarnom projekcijom po dominantnoj osi normale, u
 * JEDINICAMA SCENE - isto kao sto ExtrudeGeometry radi sam od sebe. Bez toga
 * bi bocne stranice (4 x 0.06 kod plute) dobile UV od 0 do 1 na obje ose i
 * tekstura bi se na njima razvukla u trake.
 */
export function createSlabGeometry(thickness: number) {
  const geometry = new THREE.BoxGeometry(PLANK_SIZE.width, thickness, PLANK_SIZE.depth);

  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const uv = geometry.attributes.uv;

  for (let i = 0; i < position.count; i++) {
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const nz = Math.abs(normal.getZ(i));
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    if (ny >= nx && ny >= nz) uv.setXY(i, x, z); // gornja i donja povrsina
    else if (nx >= nz) uv.setXY(i, z, y); // celne stranice
    else uv.setXY(i, x, y); // bocne stranice
  }
  uv.needsUpdate = true;

  return geometry;
}

// --------------------------------------------------------------------- kamera

export type CameraKeyframe = {
  /** ugao iznad ravni daske, u stepenima; 0 = tacno sa strane */
  elevation: number;
  /** zaokret oko daske, u stepenima; 0 = frontalno */
  azimuth: number;
  /** vidno polje; manje = ravnija slika */
  fov: number;
  /** visina tacke u koju kamera gleda */
  targetY: number;
  /** manje = kamera blize, kadar tjesnji. 1 = sve tacno stane. */
  framing: number;
};

/**
 * Pocetak je skoro frontalan i nizak - tada pet slojeva citaju kao jedna daska.
 * Kraj je izometrijski: vidi se i gornja povrsina i bocni presjeci sa profilom.
 *
 * Na uskom ekranu je framing manji (kamera blize) i fov nesto siri, jer se
 * razdvojeni paket uspravno bolje uklapa u visok kadar.
 */
export const CAMERA: Record<"desktop" | "mobile", { from: CameraKeyframe; to: CameraKeyframe }> = {
  desktop: {
    from: { elevation: 5, azimuth: 0, fov: 30, targetY: 0, framing: 0.94 },
    to: { elevation: 23, azimuth: 28, fov: 30, targetY: 0.95, framing: 0.84 },
  },
  mobile: {
    from: { elevation: 6, azimuth: 0, fov: 36, targetY: 0, framing: 0.88 },
    to: { elevation: 21, azimuth: 26, fov: 36, targetY: 0.95, framing: 0.8 },
  },
};

// --------------------------------------------------------------------- scroll

/**
 * Visina sekcije u procentima ekrana. Ovo je glavna rucica za TRAJANJE:
 * 320 znaci da se cijela sekvenca odvrti kroz tri ekrana scrolla.
 */
export const SCROLL_LENGTH_VH = 320;

/** Koliko scena kasni za scrollom, u sekundama. Manje = odzivnije, vise = mekse. */
export const SCROLL_SMOOTHING = 0.12;

/** Do ovog progresa se slojevi razdvajaju. Poslije toga stoje razdvojeni. */
export const SEPARATE_END = 0.85;

/** Ukupno kasnjenje izmedju prvog i posljednjeg sloja, kao udio faze razdvajanja. */
export const STAGGER_SPREAD = 0.35;

/** Markeri se pale tek kad su slojevi razdvojeni. */
export const MARKERS = { start: SEPARATE_END, end: 1, stagger: 0.5 };

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Progres razdvajanja 0-1 iz progresa scrolla. */
export const separateProgress = (offset: number) => clamp(offset / SEPARATE_END);

/**
 * Progres jednog sloja. Isti scroll, ali svaki sloj krece sa svojim kasnjenjem -
 * gornji prvi, donji posljednji.
 */
export function layerProgress(progress: number, index: number) {
  const start = (index / (LAYERS.length - 1)) * STAGGER_SPREAD;
  return easeOutCubic(clamp((progress - start) / (1 - STAGGER_SPREAD)));
}

/** Y sloja na zadatom progresu razdvajanja. */
export function layerY(index: number, progress: number) {
  return stackedY(index) + LAYERS[index].offsetY * layerProgress(progress, index);
}

/** Prozirnost markera - pale se poslije razdvajanja, jedan po jedan odozgo. */
export function markerOpacity(offset: number, index: number) {
  const span = MARKERS.end - MARKERS.start;
  const start = MARKERS.start + (index / (LAYERS.length - 1)) * span * MARKERS.stagger;
  const duration = span * (1 - MARKERS.stagger);
  return easeOutCubic(clamp((offset - start) / duration));
}

/**
 * Najveci X koji mora stati u kadar: nije ivica daske (2) nego marker uz nju.
 * Bez ovoga se na uskom ekranu brojevi odsijeku van kadra.
 */
export const CONTENT_HALF_WIDTH =
  Math.max(PLANK_SIZE.width / 2, ...LAYERS.map((layer) => layer.anchor[0])) + 0.2;

/**
 * Rastojanje kamere na kojem cijela daska sjedne u kadar.
 *
 * Dva uslova, uzima se dalji od njih:
 *
 *   1. sfera oko paketa - radi za bilo koji ugao kamere, a paket se tokom
 *      razdvajanja produzi po visini, sto je uracunato. Ovo vodi na sirokom
 *      ekranu i na njega djeluje `framing`.
 *   2. cista sirina sa markerima - ovo vodi na uskom, uspravnom ekranu, gdje
 *      je vodoravno vidno polje mnogo uze od uspravnog.
 */
export function fitDistance(fov: number, aspect: number, progress: number, framing: number) {
  const height = lerp(STACK_HEIGHT, STACK_HEIGHT + LAYERS[0].offsetY, progress);
  const radius = 0.5 * Math.hypot(PLANK_SIZE.width, PLANK_SIZE.depth, height);

  const vertical = (fov * Math.PI) / 180;
  const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * aspect);

  const forSphere = (radius / Math.sin(Math.min(vertical, horizontal) / 2)) * framing;
  const forWidth = (CONTENT_HALF_WIDTH / Math.tan(horizontal / 2)) * 1.05;
  return Math.max(forSphere, forWidth);
}

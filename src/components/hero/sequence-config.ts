/**
 * SVE BROJKE HEROJA SA SEKVENCOM su ovdje. Komponente iznad ovoga samo crtaju.
 *
 * Hero je snimak sobe u kojoj se hrastove daske podizu ka kameri, razlozen na
 * WebP frejmove. Scroll ne pusta video nego direktno bira frejm - zato nema ni
 * dugmeta za pauzu ni cekanja da se video "odlijepi" od scrolla.
 */

/** Koliko frejmova ima u public/frames (f_001.webp ... f_190.webp). */
export const FRAME_COUNT = 190;

/** Putanja jednog frejma. Brojevi su dopunjeni nulama na tri mjesta. */
export function framePath(index: number) {
  return `/frames/f_${String(index + 1).padStart(3, "0")}.webp`;
}

/**
 * Visina sekcije u procentima ekrana - glavna rucica za TRAJANJE.
 *
 * 350 znaci da se cijela sekvenca odvrti kroz tri i po ekrana scrolla: 190
 * frejmova na oko 3150px scrolla je ~17px po frejmu, sto je dovoljno gusto da
 * pokret izgleda neprekidno, a nije toliko sporo da se cini zaglavljeno.
 */
export const SCROLL_LENGTH_VH = 350;

/*
  Odnos stranica kadra (16:9) i ponasanje na uspravnom prozoru zive u CSS-u,
  u .hero-stage-frame — tamo ih media query moze mijenjati bez re-rendera.
*/

/**
 * Koliki dio pina odvrti snimak. Ostatak pina drzi zivu scenu na ekranu, da se
 * ne preda i odmah odskroluje — bez toga se scena vidi jedva jedan tren.
 */
export const SEQUENCE_SPAN = 0.78;

/**
 * Kad se snimak predaje zivoj sceni, mjereno NAPRETKOM SNIMKA (0-1), ne
 * napretkom cijele sekcije.
 *
 * `mount` je ranije od `start` namjerno: three.js scena treba nekoliko frejmova
 * da se sastavi i ucita teksturu, pa se montira prije nego sto zatreba. Prelaz
 * ide od `start` do posljednjeg kadra.
 */
export const HANDOFF = { mount: 0.9, start: 0.97 };

/**
 * Pozadina ispod zive scene: prvi frejm snimka, soba bez podignutih dasaka.
 *
 * Zbog njega prelaz ne "sijece" - soba ostaje ista, mijenjaju se samo daske,
 * sa snimljenih na one koje scena crta uzivo.
 */
export const HANDOFF_BACKDROP = framePath(0);

/** Boja iza svega; ista krem koju nosi ostatak stranice (--c u globals.css). */
export const BACKGROUND = "#f5f3ee";

/**
 * DASKE ZIVE SCENE.
 *
 * Pozicije i uglovi su prepisani sa posljednjeg frejma snimka, pa scena krece
 * otprilike tamo gdje je snimak stao. `phase` i `drift` razvlace lebdenje da
 * daske ne disu uglas.
 *
 *   position - [x, y, z] u jedinicama scene, kamera gleda u koordinatni pocetak
 *   rotation - [x, y, z] u radijanima; X naginje lice daske ka kameri, bez
 *              njega se daska vidi sa ivice i cita kao letva
 *   drift    - amplituda lebdenja po Y
 *   phase    - pomak u sinusu, da svaka daska krene sa svog mjesta
 */
export const PLANKS = [
  { position: [-1.95, 1.15, 0.2], rotation: [0.34, 0.12, -0.46], drift: 0.07, phase: 0.0 },
  { position: [-0.15, 1.42, -0.5], rotation: [0.42, -0.05, -0.14], drift: 0.06, phase: 1.1 },
  { position: [2.35, 1.55, -0.2], rotation: [0.46, 0.08, 0.22], drift: 0.08, phase: 2.2 },
  { position: [1.75, 0.55, 0.3], rotation: [0.3, -0.1, -0.16], drift: 0.06, phase: 3.0 },
  { position: [-0.35, 0.1, 0.5], rotation: [0.26, 0.14, 0.2], drift: 0.07, phase: 4.1 },
  { position: [-2.45, -0.6, 0.4], rotation: [0.2, -0.07, 0.12], drift: 0.06, phase: 5.0 },
  { position: [-0.65, -0.5, 0.8], rotation: [0.24, 0.05, -0.1], drift: 0.05, phase: 0.6 },
  { position: [1.55, -0.95, 0.1], rotation: [0.18, 0.09, 0.3], drift: 0.07, phase: 1.7 },
  { position: [3.15, -1.05, 0.7], rotation: [0.22, -0.12, 0.08], drift: 0.05, phase: 2.8 },
] as const;

/** Gabarit jedne daske: duga, uska i tanka, kao na snimku. */
export const PLANK_SIZE = { length: 2.0, width: 0.48, thickness: 0.05 };

/** Kamera zive scene. Isti kadar u koji snimak stize. */
export const CAMERA = { position: [0, 0.1, 8.4], fov: 32 } as const;

/**
 * Na uskom ekranu se uzima svaki drugi frejm: pola prometa (oko 2 MB umjesto
 * 3.9), a pokret ostaje gladak jer je i sam kadar manji.
 */
export const MOBILE_FRAME_STEP = 2;

/** Koliko frejmova ide u jednom naletu ucitavanja. */
export const PRELOAD_BATCH = 12;

/** Koliko traje jedan ciklus lebdenja, u sekundama. */
export const FLOAT_PERIOD = 7;

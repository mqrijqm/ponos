/**
 * SVE BROJKE HEROJA SA SEKVENCOM su ovdje. Komponente iznad ovoga samo crtaju.
 *
 * Hero je snimak sobe u kojoj se hrastove daske podizu ka kameri, razlozen na
 * WebP frejmove. Scroll ne pusta video nego direktno bira frejm - zato nema ni
 * dugmeta za pauzu ni cekanja da se video "odlijepi" od scrolla.
 */

/** Koliko frejmova ima u public/frames (f_001.webp ... f_168.webp). */
export const FRAME_COUNT = 168;

/** Putanja jednog frejma. Brojevi su dopunjeni nulama na tri mjesta. */
export function framePath(index: number) {
  return `/frames/f_${String(index + 1).padStart(3, "0")}.webp`;
}

/**
 * Visina sekcije u procentima ekrana - glavna rucica za TRAJANJE.
 *
 * 350 znaci da se cijela sekvenca odvrti kroz tri i po ekrana scrolla: 168
 * frejmova na oko 3150px scrolla je ~19px po frejmu, sto je dovoljno gusto da
 * pokret izgleda neprekidno, a nije toliko sporo da se cini zaglavljeno.
 */
export const SCROLL_LENGTH_VH = 350;

/*
  Odnos stranica kadra (16:9) i ponasanje na uspravnom prozoru zive u CSS-u,
  u .hero-stage-frame — tamo ih media query moze mijenjati bez re-rendera.
*/

/**
 * Poster ispod platna: prvi kadar snimka, soba prije nego se daske podignu.
 * Stoji dok prvi frejm ne stigne, da hero ne pocne kao prazna krem povrsina.
 */
export const POSTER_FRAME = framePath(0);

/** Boja iza svega; ista krem koju nosi ostatak stranice (--c u globals.css). */
export const BACKGROUND = "#f5f3ee";

/**
 * Na uskom ekranu se uzima svaki drugi frejm: pola prometa (oko 2 MB umjesto
 * 3.9), a pokret ostaje gladak jer je i sam kadar manji.
 */
export const MOBILE_FRAME_STEP = 2;

/** Koliko frejmova ide u jednom naletu ucitavanja. */
export const PRELOAD_BATCH = 12;


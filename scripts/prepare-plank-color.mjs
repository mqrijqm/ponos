/**
 * Pravi desaturisanu mapu boje za daske u herou.
 *
 *   public/textures/laminate/diff.webp  ->  public/textures/laminate/color_desat.webp
 *
 * ZASTO: originalni diff.webp je jako narandzast (prosjek kanala 156 / 129 / 99).
 * Boja materijala u three.js se MNOZI sa mapom - moze da oduzme, ne i da
 * izjednaci kanale. Na narandzastoj mapi sivi dekor (antracit, sivi hrast)
 * nikad ne ispadne siv nego prljavo braon. Na sivoj mapi je material.color
 * jedina boja u igri, pa paleta iz DECORS radi tacno onako kako je zadata.
 *
 * normal.png i rough.png se NE DIRAJU - one nose zrno i one ostaju originalne.
 *
 * Grayscale sam po sebi obara i srednju svjetlinu i kontrast. Zato poslije
 * njega ide linearna korekcija:
 *
 *   novo = GAIN * staro + offset,   offset se racuna tako da prosjek padne na TARGET_MEAN
 *
 * GAIN iznad 1 vraca kontrast (zrno, cvorovi, celni spojevi) - bez toga mapa
 * ispadne ravna kao karton. TARGET_MEAN je visok namjerno: mapa treba da bude
 * svijetla podloga koja boju iz DECORS samo modulise, a ne da je gasi. Na
 * prosjeku 133 (koliko da grayscale ostavi) svaki dekor bi ispao dvije nijanse
 * tamniji nego sto je zadat.
 *
 * Pokretanje: pnpm prepare:plank-color
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

import sharp from "sharp";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(PROJECT_ROOT, "public", "textures", "laminate");
const SOURCE = path.join(DIR, "diff.webp");
const OUTPUT = path.join(DIR, "color_desat.webp");

/** Ovdje se podesava izgled mape. */
const TARGET_MEAN = 200; // 0-255, srednja svjetlina gotove mape
const GAIN = 1.15; // >1 vraca kontrast izgubljen desaturacijom
const QUALITY = 82; // tekstura je sitno zrno - iznad ovoga fajl raste brze nego detalj

/** Prava statistika sive - sharp .stats() cita ULAZ, ne rezultat pipeline-a. */
async function greyStats(input) {
  const { data } = await sharp(input).greyscale().toColourspace("b-w").raw().toBuffer({ resolveWithObject: true });

  let sum = 0;
  let min = 255;
  let max = 0;
  for (const v of data) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const mean = sum / data.length;

  let variance = 0;
  for (const v of data) variance += (v - mean) ** 2;

  return { mean, sd: Math.sqrt(variance / data.length), min, max, clipped: 0 };
}

async function main() {
  const meta = await sharp(SOURCE).metadata();
  const before = await greyStats(SOURCE);

  // linear(a, b) racuna a*v + b nad sRGB vrijednostima - tacno ono sto treba
  // jer se mapa i cita kao sRGB
  const offset = TARGET_MEAN - GAIN * before.mean;

  const encoded = await sharp(SOURCE)
    .greyscale()
    .linear(GAIN, offset)
    // b-w spusta WebP na jedan kanal; three je i dalje cita kao sivu sRGB mapu
    .toColourspace("b-w")
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer();

  writeFileSync(OUTPUT, encoded);
  const after = await greyStats(OUTPUT);

  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  const line = (name, s) =>
    `  ${name.padEnd(12)} prosjek ${s.mean.toFixed(1).padStart(5)}  kontrast (sd) ${s.sd.toFixed(1).padStart(5)}  raspon ${s.min}-${s.max}`;

  console.log(`\ncolor_desat.webp  <-  diff.webp  (${meta.width}x${meta.height})`);
  console.log(line("prije", before));
  console.log(line("poslije", after));
  console.log(`  velicina     ${kb(encoded.length)}`);

  if (after.sd < before.sd) {
    console.log(`\n  PAZI: kontrast je pao. Podigni GAIN u ovoj skripti.`);
  }
  if (after.max >= 255) {
    console.log(`  Napomena: najsvjetliji pikseli su na 255 (odsjeceni highlight).`);
  }
}

main().catch((error) => {
  console.error(`\ngreska: ${error.message}`);
  process.exit(1);
});

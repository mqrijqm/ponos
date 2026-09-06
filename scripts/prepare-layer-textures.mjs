/**
 * Priprema tekstura za sekciju "eksplodirani slojevi" (LayerStack).
 *
 * Iz svakog .zip seta uzima SAMO tri mape i pravi:
 *
 *   public/textures/layers/<set>/color.webp   1024px, WebP q85
 *   public/textures/layers/<set>/normal.png    512px, PNG lossless, RGB
 *   public/textures/layers/<set>/rough.png     512px, PNG lossless, siva
 *
 * Zasto normala i roughness nisu na 1024: obje idu bez gubitaka, a iverica i
 * pluta su cist visokofrekventni sum koji se ne da spakovati. Na 1024 set
 * ispadne ~3.4 MB (normala sama 2.4 MB), na 512 ispadne ~1.0 MB. Za povecanje
 * nazad na 1024 promijeni `size` u MAPS ispod.
 *
 * NormalGL, ne NormalDX. DX ima obrnut Y kanal pa svjetlo pada naopako -
 * udubljenja izgledaju kao ispupcenja.
 *
 * AmbientOcclusion, Displacement, .blend, .usdc, .mtlx i .tres se nikad ni ne
 * raspakuju: zip se cita u memoriji i vade se samo ta tri unosa.
 *
 * Zahtijeva:  pnpm add -D sharp
 * Pokretanje: node scripts/prepare-layer-textures.mjs
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

import sharp from "sharp";

// ---------------------------------------------------------------- konfiguracija

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ROOT = path.join(PROJECT_ROOT, "public", "textures", "layers");

/** Gdje se traze zipovi, redom. Prvi u kojem se fajl nadje pobjeduje. */
const SEARCH_DIRS = [PROJECT_ROOT, path.join(homedir(), "Downloads")];

/**
 * Ime izlaznog foldera -> zip i prefiks unosa unutar njega.
 *
 * Chipboard002 je namjerno izabran umjesto 003: tamniji je i sitnijeg zrna,
 * pa blize lici na gusto HDF jezgro. 003 (svjetliji, duze iverje) se ne koristi.
 */
const SETS = {
  // `saturation` se primjenjuje SAMO na mapu boje. Oba seta su u originalu jako
  // narandzasta i u sceni citaju kao plastika; ovim se vracaju u smedje i
  // pjeskasto. 1 = original, nize = mirnije. Tint u materijalu to ne moze
  // uraditi jer boja materijala samo MNOZI mapu - moze oduzeti, ne i izjednaciti
  // kanale.
  hdf: { zip: "Chipboard002_2K-JPG.zip", prefix: "Chipboard002_2K-JPG", saturation: 0.62 },
  cork: { zip: "Cork001_2K-JPG.zip", prefix: "Cork001_2K-JPG", saturation: 0.5 },
};

/**
 * Sufiks unosa u zipu -> ime izlaznog fajla, nacin obrade i stranica.
 *
 * OVDJE SE SMANJUJU FAJLOVI. Boja je jedina lossy mapa pa je jeftina; normala i
 * roughness idu bez gubitaka i one nose skoro svu tezinu. Spustanje `size` na
 * 512 za te dvije cetvrtini fajl, a na ovako sitnom zrnu (iverica, pluta) se
 * razlika jedva vidi - to je rucica ako set mora stati u budzet.
 */
const MAPS = [
  { suffix: "_Color.jpg", out: "color.webp", kind: "color", size: 1024 },
  { suffix: "_NormalGL.jpg", out: "normal.png", kind: "normal", size: 512 },
  { suffix: "_Roughness.jpg", out: "rough.png", kind: "rough", size: 512 },
];

/** Kvalitet WebP-a za boju. Normale i roughness idu bez gubitka. */
const COLOR_QUALITY = 85;

/** Ciljna velicina jednog seta (tri fajla). Samo za izvjestaj, ne prekida rad. */
const BUDGET_BYTES = 800 * 1024;

// ------------------------------------------------------------------- citanje zipa

/**
 * Minimalan citac zipa - dovoljan da se iz velikog arhiva izvuku tri unosa
 * bez raspakivanja ostatka na disk.
 *
 * Cita centralni direktorijum sa kraja fajla i vraca mapu ime -> lokacija.
 */
function readCentralDirectory(buf) {
  const EOCD_SIG = 0x06054b50;
  const ENTRY_SIG = 0x02014b50;

  // EOCD je na kraju, iza njega moze biti jos do 64 KB komentara
  let eocd = -1;
  const limit = Math.max(0, buf.length - 22 - 0xffff);
  for (let i = buf.length - 22; i >= limit; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("nije validan zip - nema end-of-central-directory zapisa");

  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  const entries = new Map();
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== ENTRY_SIG) throw new Error("ostecen centralni direktorijum zipa");

    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const nameLength = buf.readUInt16LE(p + 28);
    const extraLength = buf.readUInt16LE(p + 30);
    const commentLength = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLength);

    entries.set(name, { method, compressedSize, localOffset });
    p += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

/** Vraca sadrzaj jednog unosa. Podrzava samo store (0) i deflate (8) - to je sve sto zipovi tekstura koriste. */
function readEntry(buf, entry) {
  // lokalno zaglavlje ima svoje duzine imena i extra polja, i one se
  // razlikuju od onih u centralnom direktorijumu
  const nameLength = buf.readUInt16LE(entry.localOffset + 26);
  const extraLength = buf.readUInt16LE(entry.localOffset + 28);
  const start = entry.localOffset + 30 + nameLength + extraLength;
  const data = buf.subarray(start, start + entry.compressedSize);

  if (entry.method === 0) return Buffer.from(data);
  if (entry.method === 8) return inflateRawSync(data);
  throw new Error(`nepoznata kompresija u zipu: ${entry.method}`);
}

// ---------------------------------------------------------------------- obrada

/**
 * Jedna mapa: resize pa upis u ciljni format.
 *
 * Boja ide u WebP - to je fotografija, gubici se ne vide.
 * Normala ide u PNG bez gubitaka: lossy kompresija pomjera R i G kanale, a to
 * su X i Y nagiba povrsine - svjetlo onda pocne da "pliva" po povrsini.
 * Roughness je jedna vrijednost po pikselu pa ide kao 8-bitni sivi PNG.
 */
function encode(input, kind, size, saturation) {
  const pipeline = sharp(input).resize(size, size, { fit: "fill", kernel: "lanczos3" });

  if (kind === "color") {
    return pipeline
      .modulate({ saturation })
      .webp({ quality: COLOR_QUALITY, effort: 6 })
      .toBuffer();
  }

  if (kind === "normal") {
    // `palette: false` je OBAVEZAN. Bez njega sharp sam odluci da je paletni PNG
    // manji pa svede sliku na 256 boja - fajl padne sa 2.3 MB na 950 KB, ali to
    // vise nije normala nego banding. Normala nosi XYZ nagiba u RGB kanalima i
    // svaki od 16 miliona odnosa je stvarni podatak.
    return pipeline
      .removeAlpha()
      .png({ compressionLevel: 9, effort: 10, palette: false })
      .toBuffer();
  }

  // greyscale() sam po sebi i dalje pise RGB PNG (tri identicna kanala);
  // toColourspace("b-w") je ono sto fajl stvarno spusti na PNG tip 0.
  return pipeline
    .greyscale()
    .toColourspace("b-w")
    .png({ compressionLevel: 9, effort: 10, palette: false })
    .toBuffer();
}

/** Tip boje iz PNG IHDR zaglavlja - da izvjestaj potvrdi da je siva stvarno siva. */
const PNG_COLOR_TYPE = { 0: "siva", 2: "RGB", 3: "paleta", 4: "siva+alfa", 6: "RGBA" };

function describe(buffer, out) {
  if (!out.endsWith(".png")) return "webp";
  return PNG_COLOR_TYPE[buffer[25]] ?? `tip ${buffer[25]}`;
}

function findZip(name) {
  for (const dir of SEARCH_DIRS) {
    const candidate = path.join(dir, name);
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`nije nadjen ${name} — trazeno u:\n  ${SEARCH_DIRS.join("\n  ")}`);
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function processSet(setName, { zip, prefix, saturation }) {
  const zipPath = findZip(zip);
  const buf = readFileSync(zipPath);
  const entries = readCentralDirectory(buf);

  const outDir = path.join(OUT_ROOT, setName);
  mkdirSync(outDir, { recursive: true });

  console.log(`\n${setName}  <-  ${path.basename(zipPath)}`);

  let total = 0;
  for (const { suffix, out, kind, size } of MAPS) {
    const entryName = prefix + suffix;
    const entry = entries.get(entryName);
    if (!entry) {
      throw new Error(
        `u ${zip} nema unosa ${entryName}\nsadrzi: ${[...entries.keys()].join(", ")}`,
      );
    }

    // gotov bafer se upisuje kakav jeste - propustanje kroz sharp jos jednom
    // bi WebP kodiralo dva puta
    const encoded = await encode(readEntry(buf, entry), kind, size, saturation);
    writeFileSync(path.join(outDir, out), encoded);

    total += encoded.length;
    console.log(
      `  ${out.padEnd(12)} ${String(size).padStart(5)}px ${kb(encoded.length).padStart(9)}` +
        `  ${describe(encoded, out).padEnd(7)} <- ${entryName}`,
    );
  }

  console.log(
    `  ${"ukupno".padEnd(18)} ${kb(total).padStart(9)}` +
      (total > BUDGET_BYTES ? `  iznad cilja od ${kb(BUDGET_BYTES)} — spusti size u MAPS` : "  u cilju"),
  );
  return total;
}

async function main() {
  mkdirSync(OUT_ROOT, { recursive: true });

  let grand = 0;
  for (const [setName, config] of Object.entries(SETS)) {
    grand += await processSet(setName, config);
  }

  console.log(`\nsve zajedno: ${kb(grand)}`);
  console.log(`izlaz: ${path.relative(PROJECT_ROOT, OUT_ROOT)}`);
}

main().catch((error) => {
  console.error(`\ngreska: ${error.message}`);
  process.exit(1);
});

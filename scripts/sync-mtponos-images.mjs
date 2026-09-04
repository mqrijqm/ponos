import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = "https://mtponos.com/";
const pages = {
  krono: "krono.php",
  kaindl: "kaindl.php",
  tarkett: "tarket-laminati.php",
  spc_decking: "decking.php",
  parket: "parket.php",
  zidni_paneli: "zidni-paneli.php",
  pvc_lajsne: "pvc-lajsne.php",
  mdf_lajsne: "mdf-lajsne.php",
};
const excluded = /\/(logo|logobijeli|call|whatsapp|krono\.png|kaindl\.png|kronobaner|kaindlbanner|002-hourglass|001-wood|003-easy-installation)/i;
const output = path.resolve("public/images/official-products");
const records = [];
const seen = new Set();

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

for (const [category, pagePath] of Object.entries(pages)) {
  const page = await context.newPage();
  const sourcePage = new URL(pagePath, base).href;
  await page.goto(sourcePage, { waitUntil: "networkidle" });
  const images = await page.locator("img").evaluateAll((elements) =>
    elements.map((image) => {
      let parent = image.parentElement;
      while (parent && (parent.innerText || "").trim().length < 4) parent = parent.parentElement;
      return {
        url: image.currentSrc || image.src,
        alt: image.alt || "",
        width: image.naturalWidth,
        height: image.naturalHeight,
        context: (parent?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 300),
      };
    }),
  );

  const categoryDir = path.join(output, category);
  await mkdir(categoryDir, { recursive: true });
  for (const image of images) {
    if (image.width < 450 || image.height < 400 || excluded.test(image.url) || seen.has(image.url)) continue;
    const url = new URL(image.url);
    const originalName = decodeURIComponent(path.basename(url.pathname));
    const safeName = originalName.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-");
    const response = await context.request.get(image.url);
    if (!response.ok()) continue;
    await writeFile(path.join(categoryDir, safeName), await response.body());
    seen.add(image.url);
    records.push({
      category,
      file: `/images/official-products/${category}/${safeName}`,
      source: image.url,
      sourcePage,
      alt: image.alt,
      context: image.context,
      width: image.width,
      height: image.height,
    });
  }
  await page.close();
}

await browser.close();
await writeFile(
  path.join(output, "manifest.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), source: base, count: records.length, images: records }, null, 2)}\n`,
);
console.log(`Preuzeto ${records.length} jedinstvenih produktnih slika.`);

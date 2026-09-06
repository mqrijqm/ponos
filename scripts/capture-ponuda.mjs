import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'https://mt-ponos.vercel.app';
const OUT = path.resolve('ponuda-assets');
fs.mkdirSync(OUT, { recursive: true });

const DESKTOP = {
  viewport: { width: 1440, height: 1024 },
  deviceScaleFactor: 2,
};
const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

const shots = [
  { name: '01-hero', route: '/', heading: /Pronađite pod koji/i, device: 'desktop' },
  { name: '01-hero-mobile', route: '/', heading: /Pronađite pod koji/i, device: 'mobile' },
  { name: '04-kalkulator', route: '/', heading: /Koliko poda vam je potrebno/i, device: 'desktop' },
  { name: '04-kalkulator-mobile', route: '/', heading: /Koliko poda vam je potrebno/i, device: 'mobile' },
  { name: '07-lokacije', route: '/', heading: /Posjetite nas u Banjoj Luci/i, device: 'desktop' },
  { name: '09-proces', route: '/', heading: /Lakši izbor/i, device: 'desktop', optional: true },
  { name: '02-proizvodi-grid', route: '/proizvodi', heading: /Podovi i završni detalji/i, device: 'desktop' },
  { name: '02b-product-stories', route: '/proizvodi', heading: /Pod se ne bira samo pogledom/i, device: 'desktop', optional: true },
  { name: '03-laminati', route: '/proizvodi/laminati', heading: null, device: 'desktop', optional: true },
  { name: '05-upit-forma', route: '/kontakt', heading: /upit/i, anchor: '#upit', device: 'desktop', optional: true },
  { name: '08-vizualizator-gate', route: '/vizualizator', heading: /Vizualizator nije dostupan/i, device: 'desktop' },
  { name: '08-vizualizator-gate-mobile', route: '/vizualizator', heading: /Vizualizator nije dostupan/i, device: 'mobile' },
];

const captured = [];
const missing = [];
const browser = await chromium.launch();

for (const shot of shots) {
  const context = await browser.newContext(shot.device === 'mobile' ? MOBILE : DESKTOP);
  const page = await context.newPage();

  try {
    const url = BASE + shot.route + (shot.anchor || '');
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });

    if (!response || !response.ok()) {
      missing.push(`${shot.name} — ruta ${shot.route} nedostupna (${response?.status() ?? 'bez odgovora'})`);
      continue;
    }

    await page.addStyleTag({
      content: '*{animation:none!important;transition:none!important;scroll-behavior:auto!important}',
    });
    await page.evaluate(() => document.fonts?.ready).catch(() => {});

    let target = null;
    if (shot.heading) {
      const heading = page.getByRole('heading', { name: shot.heading }).first();
      if (await heading.count()) {
        await heading.scrollIntoViewIfNeeded();
        target = heading.locator('xpath=ancestor-or-self::section[1]');
        if (!(await target.count())) {
          target = heading.locator('xpath=ancestor::*[self::main or self::article or self::div][1]');
        }
      }
    }

    await page.waitForTimeout(600);
    const file = path.join(OUT, `${shot.name}.png`);

    if (target && await target.count()) {
      await target.first().screenshot({ path: file });
    } else if (shot.heading) {
      missing.push(`${shot.name} — sekcija "${shot.heading}" nije nađena na ${shot.route}`);
      continue;
    } else {
      await page.screenshot({ path: file, fullPage: true });
    }

    captured.push(`${shot.name}.png`);
  } catch (error) {
    missing.push(`${shot.name} — greška: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await context.close();
  }
}

await browser.close();

const mockNeeded = [
  'Ponuda 2 · interni panel (upiti) — ekran ne postoji, treba mock',
  'Ponuda 2 · admin (proizvodi/cijene) — ekran ne postoji, treba mock',
  'Ponuda 2 · lista za ponudu (korpa) — ako nije dodano, treba mock',
  'Ponuda 2 · naruči uzorak (dugme + modal) — ako nije dodano, treba mock',
  'Ponuda 3 · vizualizator (radni ekran) — ne postoji, mock ili Swiss Krono referenca',
  'Ponuda 3 · poređenje varijanti / dijeljenje — ne postoji, treba mock',
  'Ponuda 1 · filteri kataloga — ako ne postoje, koristiti 09-proces.png',
];

fs.writeFileSync(
  path.join(OUT, 'README-CAPTURE.md'),
  `# Ponuda assets\n\nBASE_URL: ${BASE}\nDatum: ${new Date().toISOString().slice(0, 10)}\n\n` +
    `## Snimljeno\n${captured.map((file) => `- ${file}`).join('\n') || '- (ništa)'}\n\n` +
    `## Nije snimljeno / greške\n${missing.map((entry) => `- ${entry}`).join('\n') || '- (ništa)'}\n\n` +
    `## Fali na sajtu — treba mock (ne može screenshot)\n${mockNeeded.map((entry) => `- ${entry}`).join('\n')}\n`,
);

console.log('Snimljeno:', captured.length, '| Problema:', missing.length, '| Folder:', OUT);

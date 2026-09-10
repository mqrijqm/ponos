export type CatalogItem = {
  code: string;
  name: string;
  brand: string;
  collection: string;
  thickness?: string;
  badge?: "Novo" | "Akcija";
  category: string;
  texture: number;
};

/* ------------------------------------------------------------------
   CIJENE I PAKOVANJE

   PAZNJA: vrijednosti ispod su PRIVREMENE (placeholder). Postavljene su
   po kategoriji da bi kalkulator radio; nisu stvarne cijene MT PONOS-a.

   Kad stignu pravi podaci:
   - opsta pravila po kategoriji -> categoryPricing
   - odstupanje za pojedinacni artikal -> pricingOverrides (kljuc je `code`)
------------------------------------------------------------------- */
export type Pricing = {
  /** KM po jedinici (m2, odnosno duzni metar za lajsne) */
  price: number;
  /** m2 (ili duznih metara) po paketu */
  packageCoverage: number;
  unit: "m²" | "m¹";
  /** da li kalkulator povrsine ima smisla za ovu kategoriju */
  areaBased: boolean;
};

const categoryPricing: Record<string, Pricing> = {
  laminati: { price: 24, packageCoverage: 2.22, unit: "m²", areaBased: true },
  "spc-vinyl-decking": { price: 39, packageCoverage: 2.257, unit: "m²", areaBased: true },
  parketi: { price: 72, packageCoverage: 3.03, unit: "m²", areaBased: true },
  "zidni-paneli": { price: 85, packageCoverage: 1.69, unit: "m²", areaBased: true },
  lajsne: { price: 9, packageCoverage: 2.4, unit: "m¹", areaBased: false },
};

const pricingOverrides: Record<string, Partial<Pricing>> = {
  // "5953": { price: 26.5, packageCoverage: 2.13 },
};

const fallbackPricing: Pricing = {
  price: 24,
  packageCoverage: 2.22,
  unit: "m²",
  areaBased: true,
};

export function pricingFor(item: CatalogItem): Pricing {
  const base = categoryPricing[item.category] ?? fallbackPricing;
  return { ...base, ...pricingOverrides[item.code] };
}

/** Debljina utice na cijenu laminata — dok nema pravih podataka, gruba skala. */
export function priceFor(item: CatalogItem): number {
  const { price } = pricingFor(item);
  const mm = Number.parseFloat((item.thickness ?? "").replace(",", "."));
  if (item.category !== "laminati" || Number.isNaN(mm)) return price;
  if (mm >= 12) return Math.round(price * 1.42 * 10) / 10;
  if (mm >= 10) return Math.round(price * 1.2 * 10) / 10;
  return price;
}
export const catalog: CatalogItem[] = [
  {
    code: "5953",
    name: "Laminat 5953",
    brand: "Krono Original",
    collection: "Herringbone",
    thickness: "8 mm",
    badge: "Novo",
    category: "laminati",
    texture: 0,
  },
  {
    code: "K476",
    name: "Laminat K476",
    brand: "Krono Original",
    collection: "Herringbone",
    thickness: "8 mm",
    badge: "Novo",
    category: "laminati",
    texture: 1,
  },
  {
    code: "8573-H",
    name: "Laminat 8573",
    brand: "Krono Original",
    collection: "Herringbone",
    thickness: "8 mm",
    badge: "Novo",
    category: "laminati",
    texture: 2,
  },
  {
    code: "K326-H",
    name: "Laminat K326",
    brand: "Krono Original",
    collection: "Herringbone",
    thickness: "8 mm",
    badge: "Novo",
    category: "laminati",
    texture: 3,
  },
  {
    code: "K470",
    name: "Laminat K470",
    brand: "Krono Original",
    collection: "Kronostep",
    thickness: "12 mm",
    category: "laminati",
    texture: 4,
  },
  {
    code: "K450",
    name: "Laminat K450",
    brand: "Krono Original",
    collection: "Floordreams Vario",
    thickness: "12 mm",
    category: "laminati",
    texture: 5,
  },
  {
    code: "K278",
    name: "Laminat K278",
    brand: "Krono Original",
    collection: "Kronostep",
    thickness: "12 mm",
    badge: "Akcija",
    category: "laminati",
    texture: 1,
  },
  {
    code: "K635",
    name: "Laminat K635",
    brand: "Krono Original",
    collection: "Supreme Vario",
    thickness: "10 mm",
    category: "laminati",
    texture: 2,
  },
  {
    code: "37813",
    name: "Laminat 37813",
    brand: "Kaindl",
    collection: "Classic Touch",
    thickness: "8 mm",
    badge: "Novo",
    category: "laminati",
    texture: 0,
  },
  {
    code: "K4386",
    name: "Laminat K4386",
    brand: "Kaindl",
    collection: "Classic Touch",
    thickness: "8 mm",
    category: "laminati",
    texture: 3,
  },
  {
    code: "K4898",
    name: "Laminat K4898",
    brand: "Kaindl",
    collection: "Natural Touch",
    thickness: "8 mm",
    category: "laminati",
    texture: 4,
  },
  {
    code: "34352",
    name: "Laminat 34352",
    brand: "Kaindl",
    collection: "Classic Touch",
    thickness: "8 mm",
    badge: "Akcija",
    category: "laminati",
    texture: 5,
  },
  {
    code: "34268",
    name: "Laminat 34268",
    brand: "Kaindl",
    collection: "Easy Touch",
    thickness: "8 mm",
    badge: "Novo",
    category: "laminati",
    texture: 0,
  },
  {
    code: "34011",
    name: "Laminat 34011",
    brand: "Kaindl",
    collection: "Authentic Touch",
    thickness: "7 mm",
    badge: "Novo",
    category: "laminati",
    texture: 1,
  },
  {
    code: "7488",
    name: "Miram",
    brand: "Natural Floor",
    collection: "SPC Vinyl",
    thickness: "4 mm",
    category: "spc-vinyl-decking",
    texture: 0,
  },
  {
    code: "7489",
    name: "Atera",
    brand: "Natural Floor",
    collection: "SPC Vinyl",
    thickness: "4 mm",
    category: "spc-vinyl-decking",
    texture: 1,
  },
  {
    code: "7491",
    name: "Vela",
    brand: "Natural Floor",
    collection: "SPC Vinyl",
    thickness: "4 mm",
    category: "spc-vinyl-decking",
    texture: 4,
  },
  {
    code: "7490",
    name: "Abris",
    brand: "Natural Floor",
    collection: "SPC Vinyl",
    thickness: "4 mm",
    category: "spc-vinyl-decking",
    texture: 5,
  },
  {
    code: "WPC-A",
    name: "WPC Decking Antracyt",
    brand: "WPC",
    collection: "Decking",
    category: "spc-vinyl-decking",
    texture: 3,
  },
  {
    code: "WPC-G",
    name: "WPC Decking Grafit",
    brand: "WPC",
    collection: "Decking",
    category: "spc-vinyl-decking",
    texture: 2,
  },
  {
    code: "WPC-SH",
    name: "WPC Decking Smeđi hrast",
    brand: "WPC",
    collection: "Decking",
    category: "spc-vinyl-decking",
    texture: 1,
  },
  {
    code: "WPC-SS",
    name: "WPC Decking svijetlo smeđa",
    brand: "WPC",
    collection: "Decking",
    category: "spc-vinyl-decking",
    texture: 0,
  },
  {
    code: "INDO-154",
    name: "INDO Arbiton PVC 154 Oak",
    brand: "Arbiton",
    collection: "INDO 70 mm",
    thickness: "2,5 m",
    category: "lajsne",
    texture: 1,
  },
  {
    code: "INDO-40",
    name: "INDO Arbiton PVC 40 Bijela mat",
    brand: "Arbiton",
    collection: "INDO 70 mm",
    thickness: "2,5 m",
    category: "lajsne",
    texture: 4,
  },
  {
    code: "INDO-09",
    name: "INDO Arbiton PVC 09 Dark Oak",
    brand: "Arbiton",
    collection: "INDO 70 mm",
    thickness: "2,5 m",
    category: "lajsne",
    texture: 3,
  },
  {
    code: "INDO-220",
    name: "INDO Arbiton PVC 220 Crna mat",
    brand: "Arbiton",
    collection: "INDO 70 mm",
    thickness: "2,5 m",
    category: "lajsne",
    texture: 3,
  },
  {
    code: "MDF-60",
    name: "Profifloor Elegant MDF 60",
    brand: "Profifloor",
    collection: "Elegant",
    thickness: "15 × 60 mm / 2,4 m",
    category: "lajsne",
    texture: 4,
  },
  {
    code: "MDF-80",
    name: "Profifloor Elegant MDF 80",
    brand: "Profifloor",
    collection: "Elegant",
    thickness: "15 × 80 mm / 2,4 m",
    category: "lajsne",
    texture: 4,
  },
  {
    code: "MDF-W60-S",
    name: "Profifloor Elegant Wood MDF 60 — Sivi hrast",
    brand: "Profifloor",
    collection: "Elegant",
    thickness: "2,4 m",
    category: "lajsne",
    texture: 2,
  },
  {
    code: "MDF-W60-N",
    name: "Profifloor Elegant Wood MDF 60 — Natur hrast",
    brand: "Profifloor",
    collection: "Elegant",
    thickness: "2,4 m",
    category: "lajsne",
    texture: 1,
  },
];
export const categories = [
  {
    slug: "laminati",
    title: "Laminati",
    kicker: "Krono Original · Kaindl",
    desc: "Laminatni podovi poznatih evropskih proizvođača, različitih kolekcija, debljina i dekora.",
    image: "/images/official-products/krono/1766440549_5953-prostor.jpg",
  },
  {
    slug: "spc-vinyl-decking",
    title: "SPC Vinyl i WPC Decking",
    kicker: "Za enterijer i eksterijer",
    desc: "Vodootporni SPC podovi za enterijer i postojane WPC decking daske za terase i ograde.",
    image: "/images/kategorije/decking-terasa-plocice.webp",
  },
  {
    slug: "parketi",
    title: "Tarkett parketi",
    kicker: "100% drveni pod",
    desc: "Višeslojni gotovi parketi po narudžbi, spremni za korišćenje odmah nakon ugradnje.",
    image: "/images/kategorije/parket-hrast.webp",
  },
  {
    slug: "zidni-paneli",
    title: "Akustični zidni paneli",
    kicker: "Novo u ponudi",
    desc: "Dekorativni paneli sa filcom za poboljšanje akustike doma ili kancelarije, dimenzija 2750 × 615 × 21 mm.",
    image: "/images/official-products/zidni_paneli/music_room_real.jpg",
  },
  {
    slug: "lajsne",
    title: "Podne lajsne",
    kicker: "PVC · MDF",
    desc: "INDO i Korner PVC lajsne te Profifloor Elegant MDF lajsne za uredan završetak poda.",
    image: "/images/official-products/mdf_lajsne/mdf-lajsna.jpg",
  },
];
export const texture = (n: number) =>
  `/images/textures/${["nordic", "honey", "smoked", "walnut", "white", "greige"][n % 6]}.png`;

const officialProductImages: Record<string, string> = {
  "5953": "/images/official-products/krono/1766440549_5953-8mm.jpg",
  K476: "/images/official-products/krono/1766440407_K476-8mm.jpg",
  "8573-H": "/images/official-products/krono/1766440191_8573-8mm.jpg",
  "K326-H": "/images/official-products/krono/1766440103_K326-8mm.jpg",
  K470: "/images/official-products/krono/1766439886_K470-krono.jpg",
  K450: "/images/official-products/krono/1766439718_K450-12mm4Vfuge.jpg",
  K278: "/images/official-products/krono/1766439585_K278-krono.jpg",
  K635: "/images/official-products/krono/1766438794_K635-10mm-krono.jpg",
  "37813": "/images/official-products/kaindl/1766434285_csm_37813_Dielenkreuz_3828c92c2f.jpg",
  K4386: "/images/official-products/kaindl/1766434163_csm_K4386_Dielenkreuz_9405a17277.jpg",
  K4898: "/images/official-products/kaindl/1766433935_K4898.jpg",
  "34352": "/images/official-products/kaindl/1766430936_csm_34352_Dielenkreuz_8eca9ff40c.jpg",
  "34268": "/images/official-products/kaindl/1766430485_csm_34268_Dielenkreuz_7bd7a14b46.jpg",
  "34011": "/images/official-products/kaindl/1766430184_csm_34011_Dielenkreuz_d7725f363e.jpg",
  "7488": "/images/official-products/spc_decking/miram.jpg",
  "7489": "/images/official-products/spc_decking/aterra.jpg",
  "7491": "/images/official-products/spc_decking/vela.jpg",
  "7490": "/images/official-products/spc_decking/abris.jpg",
  "WPC-A": "/images/official-products/spc_decking/Wpc-Decking-Antracyt.jpg",
  "WPC-G": "/images/official-products/spc_decking/Wpc-Decking-Grafit.jpg",
  "WPC-SH": "/images/official-products/spc_decking/Wpc-Decking-Smedi-Hrast.jpg",
  "WPC-SS": "/images/official-products/spc_decking/Wpc-Decking-Svijetlo-Smeda.jpg",
  "INDO-154": "/images/official-products/pvc_lajsne/oak.jpg",
  "INDO-40": "/images/official-products/pvc_lajsne/bijela-mat.jpg",
  "INDO-09": "/images/official-products/pvc_lajsne/dark-oak.jpg",
  "INDO-220": "/images/official-products/pvc_lajsne/crna-mat.jpg",
  "MDF-60": "/images/official-products/mdf_lajsne/mdf6015x60.jpg",
  "MDF-80": "/images/official-products/mdf_lajsne/mdf8015x80.jpg",
  "MDF-W60-S": "/images/official-products/mdf_lajsne/MDF60sivihrast.jpg",
  "MDF-W60-N": "/images/official-products/mdf_lajsne/MDF60naturhrast.jpg",
};

export const productImage = (product: CatalogItem) =>
  officialProductImages[product.code] ?? texture(product.texture);

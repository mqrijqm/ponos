import type { MetadataRoute } from "next";
import { catalog, categories } from "@/data/catalog";
const base = "https://mt-ponos.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/proizvodi", "/o-nama", "/kontakt", "/savjeti", "/priznanja", "/akcija"];
  return [
    ...staticRoutes.map((route) => ({ url: base + route, lastModified: new Date(), changeFrequency: "monthly" as const, priority: route === "" ? 1 : 0.7 })),
    ...categories.map((category) => ({ url: `${base}/proizvodi/${category.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...catalog.map((product) => ({ url: `${base}/artikli/${encodeURIComponent(product.code)}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}

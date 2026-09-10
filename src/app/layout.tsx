import type { Metadata } from "next";
import localFont from "next/font/local";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import PoruciCursor from "@/components/PoruciCursor";
import QuoteProvider from "@/components/QuoteProvider";
// Dva fonta se ucitavaju: Lora nosi serif/naglasena mjesta, Comfortaa natpis
// preko heroja. Sve ostalo sto je sans ide na Arial (sistemski, nista se ne
// skida) - vidi globals.css.
const lora = localFont({
  src: [
    { path: "../fonts/Lora-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Lora-Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/Lora-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Lora-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  display: "swap",
  variable: "--font-lora",
});
/*
  SK Gothenburg Rounded — krupan slog: natpis na herou, izjava o firmi,
  brojevi koraka. Stigao je umjesto Aurene, koja je imala samo 95 glifova,
  ciste ASCII: nasa slova (č, ć, ž, š, đ) padala su na Arial iza nje, pa je
  svaka druga rijec bila u drugom rezu.

  Podrezan na latinicu sa Latin Extended-A, gdje ta slova i stoje: 25 kB
  umjesto 40, i nista se ne gubi — sajt je na jednom jeziku.

  PAZNJA: fajl je skinut kao "Demo / Trial" (befonts.com). Prije nego sajt
  ode uzivo treba puna licenca od autora.
*/
const gothenburg = localFont({
  src: [
    {
      path: "../fonts/SKGothenburgRounded-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-gothenburg",
});
/* Samo srednja debljina i samo latinica: natpis preko heroja je jedini
   tekst u ovom fontu, pa nema smisla skidati cijelu familiju. */
const comfortaa = Comfortaa({
  subsets: ["latin-ext"],
  weight: ["500"],
  display: "swap",
  variable: "--font-comfortaa",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://mt-ponos.vercel.app"),
  title: "Podne obloge i laminati | MT PONOS Banja Luka",
  description:
    "Pregledajte laminate, parkete, SPC Vinyl i druge podne obloge. Izračunajte potrebnu količinu i zatražite ponudu MT PONOS u Banjoj Luci.",
  alternates: { canonical: "/" },
  icons: {
    icon: "/icon-ponos.png",
    shortcut: "/icon-ponos.png",
    apple: "/apple-icon-ponos.png",
  },
  openGraph: {
    title: "Podne obloge i laminati | MT PONOS Banja Luka",
    description:
      "Pregledajte podne obloge, izračunajte količinu i zatražite ponudu.",
    type: "website",
    locale: "bs_BA",
    images: ["/images/hero/hero-interior.jpg"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bs">
      <body className={`${lora.variable} ${comfortaa.variable} ${gothenburg.variable}`}>
        <QuoteProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <PoruciCursor />
        </QuoteProvider>
      </body>
    </html>
  );
}

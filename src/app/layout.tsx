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
/* Aurena — serif sa natpisa u herou i nigdje drugdje. Rez je podrezan na
   latinicu bez nasih slova (č, ć, ž, š, đ ih font nema), pa je 5 kB. */
const aurena = localFont({
  src: [{ path: "../fonts/Aurena-Regular.woff2", weight: "400", style: "normal" }],
  display: "swap",
  variable: "--font-aurena",
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
      <body className={`${lora.variable} ${comfortaa.variable} ${aurena.variable}`}>
        <QuoteProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <PoruciCursor />
        </QuoteProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import PoruciCursor from "@/components/PoruciCursor";
import QuoteProvider from "@/components/QuoteProvider";
/*
  Mansory nosi sav slog koji nije Arial: naslove, krupne recenice na
  naslovnoj, brojeve koraka. Dosao je umjesto dva reza — Lore, koja je
  bila klasican citalacki serif, i SK Gothenburga, koji je nosio krupan
  slog. Jedan rez za cijelu stranicu umjesto dva koja se nigdje ne sretnu.

  Ima samo uspravnu tezinu: gdje je serif kurziv (par natpisa uz slike),
  browser ga sam iskosi. Podebljanog serifa na sajtu nema.

  Podrezan na latinicu sa Latin Extended-A: 18 kB umjesto cetiri Lorina
  fajla od 180 kB ukupno.
*/
const mansory = localFont({
  src: [{ path: "../fonts/Mansory-Regular.woff2", weight: "400", style: "normal" }],
  display: "swap",
  variable: "--font-mansory",
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
      <body className={`${mansory.variable} ${comfortaa.variable}`}>
        <QuoteProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <PoruciCursor />
        </QuoteProvider>
      </body>
    </html>
  );
}

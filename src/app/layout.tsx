import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import PoruciCursor from "@/components/PoruciCursor";
import QuoteProvider from "@/components/QuoteProvider";
/*
  Playfair Display nosi sav slog koji nije Arial: naslove, imena grupa,
  krupne recenice. Dosao je umjesto Mansory, koja je bila geometrijski
  display rez — ovo je visokokontrastni serif sa tankim potezima i
  kuglicama na zavrsecima, kakav je i predlozak za "Asortiman".

  Uspravni i kurzivni rez: kurziv nosi imena grupa preko slika i redove
  ispod njih. `latin-ext` je zbog nasih slova (c, s, z sa kvacicama).

  Sajt sada ima dva reza ukupno — ovaj i Arial. Comfortaa je izasla sa
  Mansory: nosila je jedan natpis preko snimka, koji je i sam presao na
  serif, pa se skidala ni za sta.
*/
const playfair = Playfair_Display({
  subsets: ["latin-ext"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
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
      <body className={playfair.variable}>
        <QuoteProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <PoruciCursor />
        </QuoteProvider>
      </body>
    </html>
  );
}

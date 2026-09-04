import type { Metadata } from "next";
import { Archivo, Bodoni_Moda, Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-bodoni",
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-archivo",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://mt-ponos.vercel.app"),
  title: "Podne obloge i laminati | MT PONOS Banja Luka",
  description:
    "Pregledajte laminate, parkete, SPC Vinyl i druge podne obloge. Izračunajte potrebnu količinu i zatražite ponudu MT PONOS u Banjoj Luci.",
  alternates: { canonical: "/" },
  icons: {
    icon: "/logo-ponos.svg",
    shortcut: "/logo-ponos.svg",
    apple: "/logo-ponos.svg",
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
      <body className={`${manrope.variable} ${newsreader.variable} ${bodoni.variable} ${archivo.variable}`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import QuoteProvider from "@/components/QuoteProvider";
// Jedini font koji se ucitava. Sve sto je bilo sans ide na Arial (sistemski,
// nista se ne skida); Lora nosi serif/naglasena mjesta - vidi globals.css.
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
      <body className={lora.variable}>
        <QuoteProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </QuoteProvider>
      </body>
    </html>
  );
}

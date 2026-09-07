import CatalogBrowser from "@/components/CatalogBrowser";
import { Footer, Header, PageHero } from "@/components/SiteChrome";
import CalculatorCta from "@/components/CalculatorCta";
import LaminatiGridSection from "@/components/LaminatiGridSection";
export const metadata = {
  title: "Proizvodi | MT PONOS",
  description:
    "Kompletan asortiman MT PONOS: laminati, parketi, SPC Vinyl i WPC decking, zidni paneli i podne lajsne.",
};
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          kicker="NAŠA PONUDA"
          title="Podovi i završni detalji za svaki prostor."
          copy="Cijeli asortiman na jednom mjestu — laminati evropskih proizvođača, prirodni parketi, vodootporni podovi, decking, zidni paneli i lajsne."
        />
        <LaminatiGridSection />
        <CalculatorCta />
        <CatalogBrowser />
      </main>
      <Footer />
    </>
  );
}

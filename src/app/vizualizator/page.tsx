import { Footer, Header } from "@/components/SiteChrome";

export const metadata = {
  title: "Vizualizator | MT PONOS",
  description: "Informacija o dostupnosti opcije vizualizatora.",
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="visualizer-unavailable">
        <div>
          <span>VIZUALIZATOR</span>
          <h1>Vizualizator nije dostupan u ovoj ponudi.</h1>
          <p>
            Za ovu opciju pogledajte priloženu Ponudu br. 3.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

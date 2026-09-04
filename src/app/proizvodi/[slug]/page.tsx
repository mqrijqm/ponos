import { notFound } from "next/navigation";
import Image from "next/image";
import ProductGrid from "@/components/ProductGrid";
import { Footer, Header, PageHero } from "@/components/SiteChrome";
import { catalog, categories } from "@/data/catalog";
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categories.find((x) => x.slug === slug);
  return {
    title: `${c?.title ?? "Proizvodi"} | MT PONOS`,
    description: c?.desc,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categories.find((x) => x.slug === slug);
  if (!c) notFound();
  const items = catalog.filter((x) => x.category === slug);
  return (
    <>
      <Header />
      <main>
        <PageHero kicker={c.kicker} title={c.title} copy={c.desc} />
        {slug === "spc-vinyl-decking" && (
          <section className="flooring-editorial">
            <div className="flooring-editorial-intro">
              <span className="eyebrow">MATERIJALI ZA ENTERIJER I EKSTERIJER</span>
              <h2>Dvije pouzdane opcije za prostore koji traže više.</h2>
            </div>
            <article className="decking-story">
              <span className="flooring-index">01</span>
              <h3>WPC Decking</h3>
              <p>
                WPC Decking podovi za terase i daske za ograde idealno su
                rješenje ukoliko tražite prirodan i postojan izgled. Izuzetno
                su otporni na vanjske uticaje, vodootporni su i imaju UV
                zaštitu. Odlikuje ih jednostavnost ugradnje i održavanja.
              </p>
              <p>
                WPC daske, nastale kombinacijom prirodnih sastojaka sa
                termoplastičnim polimerima, nude prirodan izgled drveta bez
                potrebe za održavanjem istog. Decking podove moguće je naručiti
                u našim poslovnim objektima u Dervišima i Lazarevu.
              </p>
            </article>
            <div className="spc-layout">
              <div className="spc-illustration">
                <Image
                  src="/forest-detail.svg"
                  alt="Stilizovani crtež šume"
                  width={400}
                  height={320}
                />
              </div>
              <article className="spc-story">
                <span className="flooring-index">02</span>
                <h3>SPC Vinyl</h3>
                <p>
                  Kolekcija inspirisana prirodnim ljepotama šume. Prigušene boje
                  i struktura drveta osiguravaju sklad i jedinstvenu atmosferu.
                  Pod je ekološki prihvatljiv i u potpunosti se može reciklirati.
                </p>
                <p>
                  Natural Floor kolekcija idealna je za podno grijanje i
                  efikasno provodi toplotu bez promjene svojih parametara.
                  Inovativna jezgra sačinjena je od 80% prirodnih komponenti, uz
                  polimere koji podu daju otpornost na udarce i oštećenja,
                  stabilne dimenzije i jednostavnu ugradnju.
                </p>
              </article>
              <aside className="spc-features" aria-label="Karakteristike SPC Vinyl poda">
                <span className="eyebrow">KARAKTERISTIKE</span>
                <ul>
                {[
                  "Debljina 4 mm i mikro V fuga",
                  "Prilagođen za podno grijanje",
                  "100% vodootpornost",
                  "Vrhunska otpornost na udarce i oštećenja",
                  "Stabilne dimenzije bez obzira na temperaturu",
                  "Ekološki prihvatljiv i razgradiv",
                  "Jednostavna i brza instalacija",
                  "Apsorpcija zvuka",
                  "Struktura drveta sa izgledom prirodnih materijala",
                  "Širok spektar primjena",
                  "Otpornost na mikroogrebotine i habanje",
                  "Površinska čvrstoća klase 34",
                  "Paket: 2,257 m²",
                  ].map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </aside>
            </div>
          </section>
        )}
        {slug === "parketi" && (
          <section className="editorial-copy">
            <h2>Višeslojna konstrukcija, prirodan osjećaj.</h2>
            <p>
              Tarkett parket je 100% drveni pod višeslojne konstrukcije. Gotov
              je, fabrički lakiran i spreman za korišćenje odmah nakon ugradnje.
              Ponuda se radi po narudžbi.
            </p>
          </section>
        )}
        {slug === "zidni-paneli" && (
          <section className="editorial-copy">
            <h2>Mirniji prostor, topliji zid.</h2>
            <p>
              Paneli sa filcom efikasno apsorbuju zvuk i smanjuju odjek.
              Dekorativni su, vodootporni, lagani i jednostavni za instalaciju i
              čišćenje.
            </p>
          </section>
        )}
        {items.length ? (
          <section className="catalog-section">
            <div className="catalog-head">
              <span>{items.length} artikala</span>
              <p>
                Šifre i kolekcije preuzete iz aktuelne ponude MT PONOS. Cijenu i
                dostupnost provjerite upitom.
              </p>
            </div>
            <ProductGrid items={items} />
          </section>
        ) : (
          <section className="editorial-copy">
            <h2>Dostupno po narudžbi.</h2>
            <p>
              Za aktuelne dekore, cijene i rok isporuke kontaktirajte prodajni
              tim.
            </p>
            <a className="primary" href="/kontakt#upit">
              Zatraži ponudu
            </a>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

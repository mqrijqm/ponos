import { notFound } from "next/navigation";
import Image from "next/image";
import LayerStack from "@/components/layers/LayerStack";
import ProductGrid from "@/components/ProductGrid";
import QuoteCta from "@/components/QuoteCta";
import { Footer, Header, PageHero } from "@/components/SiteChrome";
import { catalog, categories } from "@/data/catalog";
/*
  Duzi uvod po stranici. Kratki `desc` iz kataloga sluzi listama i meta opisu;
  ovdje stoji tekst koji stranica zaista nosi, prenesen sa mtponos.com.
*/
const pageLead: Record<string, string> = {
  parketi:
    "Višeslojni gotovi parketi izrađeni od pravog drveta, spremni za korišćenje odmah nakon ugradnje. Gornji sloj plemenitog drveta nosi izgled i osjećaj prirodnog poda, dok slojevi ispod njega drže dasku stabilnom i pri promjenama vlage i temperature.",
  lajsne:
    "Lajsna je posljednji potez na podu — sakriva dilatacionu fugu uza zid i spaja pod sa prostorijom. U ponudi su PVC lajsne INDO i Korner, te MDF lajsne iz kolekcije Profifloor Elegant, u više visina i dekora.",
  "zidni-paneli":
    "Akustični paneli sa filcem apsorbuju zvuk i smanjuju odjek, pa prostor djeluje mirnije i toplije. Uz to su dekorativni element zida — drvene lamele na filcanoj podlozi, dimenzija 2750 × 615 × 21 mm.",
};

/** Natpis uz crtu u dnu zaglavlja. */
const pageFoot: Record<string, string> = {
  parketi: "100% DRVENI POD",
  lajsne: "PVC · MDF · ZAVRŠNA OBRADA",
  "zidni-paneli": "AKUSTIKA I DEKOR",
};

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
        <PageHero
          kicker={c.kicker}
          title={c.title}
          copy={c.desc}
          lead={pageLead[slug] ?? c.desc}
          foot={pageFoot[slug]}
        />
        {/*
          Eksplodirani presjek daske - prva sekcija sadrzaja na /proizvodi/parketi.
          Stoji odmah iznad teksta o visesloju, jer ga taj tekst opisuje.
          Sve brojke i sadrzaj markera su u components/layers/layer-config.ts.
        */}
        {slug === "parketi" && <LayerStack />}
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
        {slug === "lajsne" && (
          <section className="flooring-editorial">
            <div className="flooring-editorial-intro">
              <span className="eyebrow">ZAVRŠNA OBRADA PODA</span>
              <h2>Uredan spoj poda i zida.</h2>
            </div>
            <article className="decking-story">
              <span className="flooring-index">01</span>
              <h3>PVC lajsne — INDO i Korner</h3>
              <p>
                INDO lajsna visine 70 mm savremeno je i praktično rješenje za
                završnu obradu podova. Kroz kanal u profilu kablovi se potpuno
                sakrivaju, pa prostor ostaje uredan, a montaža na četiri načina
                i fleksibilne ivice prate i nesavršen spoj zida i poda.
              </p>
              <p>
                Korner lajsna visine 60 mm izrađena je od livenog PVC-a sa
                fleksibilnim gumenim rubovima: naliježe sigurno i na neravan
                zid i štiti ivicu laminata od habanja i oštećenja. Folija
                vjerno prenosi teksturu prirodnog drveta.
              </p>
            </article>
            <div className="spc-layout">
              <article className="spc-story">
                <span className="flooring-index">02</span>
                <h3>MDF lajsne — Profifloor Elegant</h3>
                <p>
                  Kolekcija Profifloor Elegant donosi MDF lajsne u više visina i
                  boja. Bijele lajsne su zadnjih godina hit u interijerima, a uz
                  njih stoje i drveni dekori — sivi, natur i svijetli hrast.
                </p>
                <p>
                  Ugradne visine su 6, 8 ili 10 cm, u ravnom ili reljefnom
                  profilu, a montaža ide ljepilom ili nosačima usidrenim u zid.
                  MDF ne preporučujemo u prostorima izloženim vlazi.
                </p>
              </article>
              <aside className="spc-features" aria-label="Karakteristike lajsni">
                <span className="eyebrow">KARAKTERISTIKE</span>
                <ul>
                  {[
                    "INDO PVC: 70 × 26 mm, dužina 2500 mm",
                    "Korner PVC: visina 60 mm, liveni PVC",
                    "Kanal za skrivanje kablova",
                    "Montaža na četiri načina",
                    "Fleksibilne ivice za neravne zidove",
                    "MDF Elegant: 6, 8 i 10 cm",
                    "Ravan ili reljefni profil",
                    "Bijela i drveni dekori hrasta",
                    "Montaža ljepilom ili nosačima",
                    "MDF nije za vlažne prostore",
                  ].map((f) => <li key={f}>{f}</li>)}
                </ul>
              </aside>
            </div>
          </section>
        )}
        {slug === "zidni-paneli" && (
          <section className="flooring-editorial">
            <div className="flooring-editorial-intro">
              <span className="eyebrow">AKUSTIKA I DEKOR U JEDNOM</span>
              <h2>Mirniji prostor, topliji zid.</h2>
            </div>
            <div className="spc-layout">
              <article className="spc-story">
                <span className="flooring-index">01</span>
                <h3>Zidni akustični paneli</h3>
                <p>
                  Paneli sa filcom savršeno su rješenje za sve koji žele
                  poboljšati akustiku svog doma ili kancelarije. Apsorbuju zvuk
                  i smanjuju odjek, pa prostor dobija mirniju i prijatniju
                  atmosferu.
                </p>
                <p>
                  Uz akustiku, paneli su i dekorativni element zida — lamele od
                  drveta na filcanoj podlozi daju toplinu prostoru i lako se
                  uklapaju u dnevni boravak, spavaću sobu, kancelariju ili
                  ugostiteljski prostor. Dimenzije panela su 2750 × 615 × 21 mm.
                </p>
              </article>
              <aside className="spc-features" aria-label="Prednosti akustičnih panela">
                <span className="eyebrow">PREDNOSTI</span>
                <ul>
                  {[
                    "Efikasna apsorpcija zvuka i manji odjek",
                    "Dekorativni element zida",
                    "Potpuno vodootporni",
                    "Lagani i izdržljivi",
                    "Jednostavna montaža",
                    "Lako održavanje i čišćenje",
                    "Ekološki certifikati",
                    "Dimenzije 2750 × 615 × 21 mm",
                  ].map((f) => <li key={f}>{f}</li>)}
                </ul>
              </aside>
            </div>
            <div className="panel-gallery">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <figure key={n}>
                  <Image
                    src={`/images/paneli/panel-${n}.webp`}
                    alt={`Akustični zidni panel, dekor ${n}`}
                    width={800}
                    height={800}
                  />
                </figure>
              ))}
            </div>
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
        ) : slug === "parketi" ? (
          /*
            Dva teksta stoje jedan pored drugog, razdvojena uspravnom linijom.
            Naslovi i pasusi dijele isti stil, pa su obje kolone iste tezine.
          */
          <section className="editorial-split">
            <article>
              <h2>Dostupno po narudžbi.</h2>
              <p>
                Za aktuelne dekore, cijene i rok isporuke kontaktirajte prodajni
                tim.
              </p>
              <p>
                Ponuda se sastavlja po narudžbi: birate dekor i količinu, a
                cijenu i rok potvrđujemo prije nego što narudžba ode dalje.
              </p>
              <p>
                Ako još ne znate koliko vam treba, izmjerite dužinu i širinu
                prostorije i pošaljite dimenzije uz upit — količinu sa rezervom
                za otpad računamo zajedno.
              </p>
            </article>
            <article>
              <h2>Višeslojna konstrukcija, prirodan osjećaj.</h2>
              <p>
                Tarkett parket je 100% drveni pod višeslojne konstrukcije. Gotov
                je, fabrički lakiran i spreman za korišćenje odmah nakon ugradnje
                — bez brušenja i lakiranja na licu mjesta.
              </p>
              <p>
                Gornji sloj je pravo drvo, pa svaka daska nosi svoj crtež godova
                i čvorova. Pod se čita kao prirodan materijal, a ne kao otisak
                dezena — dvije daske nikada nisu iste.
              </p>
              <QuoteCta className="cta-dot">
                <i /> Vidi ponudu
              </QuoteCta>
            </article>
          </section>
        ) : (
          <section className="editorial-copy">
            <h2>Dostupno po narudžbi.</h2>
            <p>
              Za aktuelne dekore, cijene i rok isporuke kontaktirajte prodajni
              tim.
            </p>
            <a className="cta-dot" href="/kontakt#upit">
              <i /> Zatraži ponudu
            </a>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

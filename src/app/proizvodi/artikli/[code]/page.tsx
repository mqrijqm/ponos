import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/SiteChrome";
import { catalog, categories, productImage, pricingFor } from "@/data/catalog";
import ProductGrid from "@/components/ProductGrid";
import { Ponuda2Gate } from "@/components/Ponuda2Gate";
import CalculatorCta from "@/components/CalculatorCta";
import QuoteCta from "@/components/QuoteCta";
import SpecsAccordion from "@/components/mobile/SpecsAccordion";
export function generateStaticParams() {
  return catalog.map((p) => ({ code: p.code }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const p = catalog.find((x) => x.code === decodeURIComponent(code));
  return {
    title: `${p?.name ?? "Artikal"} | MT PONOS`,
    description: p
      ? `${p.brand}, ${p.collection}, šifra ${p.code}. Provjerite cijenu i dostupnost u MT PONOS.`
      : "",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const p = catalog.find((x) => x.code === decodeURIComponent(code));
  if (!p) notFound();
  const category = categories.find((c) => c.slug === p.category);
  const related = catalog
    .filter((x) => x.category === p.category && x.code !== p.code)
    .slice(0, 4);
  return (
    <>
      <Header />
      <main>
        <section className="product-detail">
          <div className="product-visual">
            <Image
              src={productImage(p)}
              alt={`${p.brand} ${p.name}, zvanična fotografija proizvoda`}
              fill
              priority
              sizes="60vw"
            />
            <small>Fotografija iz zvaničnog MT PONOS asortimana</small>
          </div>
          <div className="product-info">
            <div className="crumb">
              <Link href="/proizvodi">Proizvodi</Link> /{" "}
              <Link href={`/proizvodi/${p.category}`}>{category?.title ?? p.category}</Link>
            </div>
            <span className="eyebrow">{p.brand}</span>
            <h1>{p.name}</h1>
            <p className="lead">{p.collection}</p>
            {/* Isti podaci dvaput: sklopljeni redovi na telefonu, tabela na
                sirokom ekranu. CSS pokazuje tacno jedno od dva. */}
            <SpecsAccordion item={p} />
            <dl>
              <div>
                <dt>Šifra</dt>
                <dd>{p.code}</dd>
              </div>
              {p.thickness && (
                <div>
                  <dt>Dimenzija / debljina</dt>
                  <dd>{p.thickness}</dd>
                </div>
              )}
              <div>
                <dt>Dostupnost i cijena</dt>
                <dd>Provjeriti u poslovnici</dd>
              </div>
            </dl>
            <p className="product-note">
              Podaci o nazivu, šifri i kolekciji prate objavljeni asortiman MT
              PONOS. Fotografija proizvoda preuzeta je sa zvanične MT PONOS
              stranice.
            </p>
            <div className="product-actions">
              <Ponuda2Gate feature="lista" className="product-gate primary">
                Dodaj u listu za ponudu
              </Ponuda2Gate>
              <Ponuda2Gate feature="uzorak" className="product-gate secondary">
                Naruči uzorak
              </Ponuda2Gate>
              <QuoteCta code={p.code} className="cta-dot">
                <i /> Zatraži ponudu
              </QuoteCta>
            </div>
          </div>
        </section>
        {pricingFor(p).areaBased && <CalculatorCta item={p} />}
        <section className="catalog-section">
          <h2>Slični artikli</h2>
          <ProductGrid items={related} rail />
        </section>
      </main>
      <Footer />
    </>
  );
}

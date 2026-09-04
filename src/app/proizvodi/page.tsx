import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/catalog";
import { Footer, Header, PageHero } from "@/components/SiteChrome";
export const metadata = {
  title: "Proizvodi | MT PONOS",
  description:
    "Laminati, parketi, SPC Vinyl, WPC decking, zidni paneli i podne lajsne iz ponude MT PONOS.",
};
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          kicker="NAŠA PONUDA"
          title="Podovi i završni detalji za svaki prostor."
          copy="Istražite aktuelni asortiman MT PONOS: laminate evropskih proizvođača, prirodne parkete, vodootporne podove, decking, zidne panele i lajsne."
        />
        <section className="product-stories" aria-labelledby="product-stories-title">
          <div className="product-stories-head">
            <span className="eyebrow">MATERIJAL · KONSTRUKCIJA · NIJANSA</span>
            <h2 id="product-stories-title">Pod se ne bira samo pogledom.</h2>
            <p>
              Pravi izbor spaja ton drveta, stabilnost sistema i osjećaj
              materijala u prostoru.
            </p>
          </div>
          <article className="product-story story-tone">
            <span className="story-number">01 / NIJANSE</span>
            <div>
              <h3>Toplina ili dubina?</h3>
              <p>
                Svjetliji dekori otvaraju prostor, dok tamniji unose mir i
                izražen arhitektonski karakter.
              </p>
              <Link href="/proizvodi/laminati">Uporedite dekore <ArrowRight size={15} /></Link>
            </div>
            <Image src="/images/product-stories/two-finishes.webp" alt="Dvije podne daske u svijetloj i tamnoj nijansi drveta" width={482} height={613} />
          </article>
          <article className="product-story story-build">
            <span className="story-number">02 / SISTEM</span>
            <div>
              <h3>Detalj koji drži cjelinu.</h3>
              <p>
                Kvalitetan spoj i pravilno odabrana konstrukcija čine pod
                stabilnim, urednim i jednostavnim za ugradnju.
              </p>
              <Link href="/savjeti">Savjeti za izbor <ArrowRight size={15} /></Link>
            </div>
            <Image src="/images/product-stories/floor-construction.webp" alt="Presjek poda i dvije uspravljene podne daske" width={482} height={602} />
          </article>
          <article className="product-story story-touch">
            <span className="story-number">03 / DODIR</span>
            <div>
              <h3>Odaberite nijansu uživo.</h3>
              <p>
                Struktura, mat završnica i ton najbolje se procjenjuju na
                stvarnom uzorku, u svjetlu vašeg prostora.
              </p>
              <Link href="/kontakt">Posjetite poslovnicu <ArrowRight size={15} /></Link>
            </div>
            <Image src="/images/product-stories/hand-samples.webp" alt="Ruke koje drže dva uzorka drvenih podnih obloga" width={482} height={602} />
          </article>
        </section>
        <section className="category-grid">
          {categories.map((c, i) => (
            <Link
              href={`/proizvodi/${c.slug}`}
              className="category-tile"
              key={c.slug}
            >
              <Image
                src={c.image}
                alt={c.title}
                fill
                sizes="(max-width:700px) 100vw, 50vw"
              />
              <div>
                <span>
                  0{i + 1} / {c.kicker}
                </span>
                <h2>{c.title}</h2>
                <p>{c.desc}</p>
                <b>
                  Pogledaj ponudu <ArrowRight size={16} />
                </b>
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}

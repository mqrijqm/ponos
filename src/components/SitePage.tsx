"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CatalogItem, categories } from "@/data/catalog";
import Calculator, { calculableItems } from "./Calculator";
import { useQuote } from "./QuoteProvider";
import { track } from "@/lib/analytics";
import { Footer, ProductsNav } from "./SiteChrome";
import QualityPage from "./QualityPage";
import PlankHero from "./hero/PlankHero";
import LaminatiGridSection from "./LaminatiGridSection";
import WpcDeckingSection from "./WpcDeckingSection";
import EditorialStatement from "./EditorialStatement";
import ProductShowcase from "./ProductShowcase";
import BasketMenu from "./BasketMenu";

/* Pool tekstura kroz koje se pločice smjenjuju. Prvih pet su starije
   .jpg fotografije, ostalo su kvadratni .webp krupni planovi. */
const heroDetails = [
  ...[1, 2, 3, 4, 5].map((n) => `/images/hero/detail-${n}.jpg`),
  ...[6, 7, 8, 9, 10, 11, 12, 13].map((n) => `/images/hero/detail-${n}.webp`),
];
const heroDetailAlts = [
  "Krupni plan teksture prirodnog hrasta",
  "Detalj spoja laminatnih panela",
  "Profil višeslojne podne obloge",
  "Mat završna obrada drvenog poda",
  "Uzorci podnih obloga u različitim nijansama drveta",
  "Krupni plan svijetlog hrastovog dekora",
  "Struktura drveta sa naglašenim godovima",
  "Topla smeđa nijansa podne obloge",
  "Fina tekstura mat završne obrade",
  "Detalj čvora u hrastovom dekoru",
  "Svijetli dekor sa mekim prelazima",
  "Krupni plan uzdužne strukture drveta",
  "Zasićena smeđa tekstura podne daske",
];

type ProcessStep = {
  number: string;
  title: string;
  description: string;
  image?: string;
  alt?: string;
};

const processSteps: ProcessStep[] = [
  {
    number: "1.",
    title: "Izmjerite prostor",
    description: "Izmjerite dužinu i širinu prostorije za informativni proračun.",
    image: "/images/process/step-01-measure.webp",
    alt: "Metar razvučen preko laminata u svijetlom dnevnom boravku",
  },
  {
    number: "2.",
    title: "Uporedite artikle",
    description: "Pregledajte dekore, kolekcije i tehničke karakteristike.",
    image: "/images/process/step-02-compare.webp",
    alt: "Tri daske u različitim dekorima poređane jedna preko druge",
  },
  {
    number: "3.",
    title: "Zatražite ponudu",
    description: "Pošaljite izabrani proizvod i potrebnu količinu našem prodajnom timu.",
    image: "/images/process/step-03-quote.webp",
    alt: "Sto u salonu podova sa uzorcima, blokom i tabletom",
  },
];

function HeroDetail({ slot, className = "" }: { slot: number; className?: string }) {
  const [imageIndex, setImageIndex] = useState(slot);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    const rotate = () => {
      timer = setTimeout(() => {
        setImageIndex((current) => {
          const offset = 1 + Math.floor(Math.random() * (heroDetails.length - 1));
          return (current + offset) % heroDetails.length;
        });
        rotate();
      }, 1100 + slot * 160 + Math.random() * 550);
    };
    rotate();
    return () => clearTimeout(timer);
  }, [slot]);

  return (
    <div className={`detail-tile ${className}`.trim()}>
      <AnimatePresence initial={false}>
        <motion.div
          key={imageIndex}
          className="detail-tile-frame"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          <Image
            src={heroDetails[imageIndex]}
            alt={heroDetailAlts[imageIndex]}
            fill
            sizes="(max-width: 767px) 132px, 12vw"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function SitePage() {
  const [menu, setMenu] = useState(false);
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const [calcItem, setCalcItem] = useState<CatalogItem>(calculableItems[0]);
  const { openQuote } = useQuote();
  return (
    <>
      <header className="home-sticky-header is-visible">
        <a
          className="brand brand-image"
          href="#top"
          aria-label="MT PONOS — početna"
        >
          <Image
            src="/logo-ponos.svg"
            alt="MT PONOS — podne obloge"
            width={300}
            height={79}
            priority
          />
        </a>
        <nav>
          <ProductsNav />
          {[
            ["Vizualizator", "/vizualizator"],
            ["O nama", "/o-nama"],
            ["Kontakt", "/kontakt"],
          ].map(([label, href]) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <button
          className="header-cta cta-dot"
          onClick={() => openQuote()}
        >
          <i /> Vidi ponudu
        </button>
        <BasketMenu />
        <button
          className="menu"
          aria-label="Otvori meni"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
        {menu && (
          <div className="mobile-nav">
            <a onClick={() => setMenu(false)} href="/proizvodi">Sva ponuda</a>
            {categories.map((c) => (
              <a
                key={c.slug}
                className="mobile-sub"
                onClick={() => setMenu(false)}
                href={`/proizvodi/${c.slug}`}
              >
                {c.title}
              </a>
            ))}
            {[
              ["Vizualizator", "/vizualizator"],
              ["O nama", "/o-nama"],
              ["Kontakt", "/kontakt"],
            ].map(([label, href]) => (
              <a onClick={() => setMenu(false)} key={label} href={href}>
                {label}
              </a>
            ))}
          </div>
        )}
      </header>
      <main id="top">
        <PlankHero />
        {/* Druga sekcija u nizu, jos neodredjena. */}
        <section className="placeholder-section" aria-hidden="true" data-placeholder="2" />
        <span id="naslovna" />
        <span id="podovi" />
        <span id="o-nama" />
        <section className="home-hero">
          <div className="home-hero-top">
            <div className="home-hero-copy">
              <strong>NA JEDNOM MJESTU</strong>
              <p>Laminat, podne obloge, parket, vinil podovi &amp; zidni paneli.</p>
            </div>
          </div>
          <div className="home-hero-panel">
            <div className="detail-strip">
              <div className="detail-group">
                <HeroDetail slot={0} />
                <HeroDetail slot={1} />
              </div>
              <HeroDetail slot={2} />
              <HeroDetail slot={3} />
              <HeroDetail slot={4} />
              <div className="detail-group">
                <HeroDetail slot={5} />
                <HeroDetail slot={6} />
              </div>
            </div>
            <h1 className="home-hero-title">
              <span>PONOS</span>
              <b>PROSTORA</b>
            </h1>
          </div>
        </section>
        <EditorialStatement />
        <section className="how process-section">
          <div className="how-heading">
            <span className="eyebrow">KAKO FUNKCIONIŠE</span>
          </div>
          <div
            className="process-accordion"
            style={{
              gridTemplateColumns: processSteps
                .map((_, index) => (index === activeProcessStep ? "1.7fr" : ".65fr"))
                .join(" "),
            }}
          >
            {processSteps.map((step, index) => {
              const isActive = index === activeProcessStep;
              return (
                <motion.button
                  key={step.number}
                  type="button"
                  className={`process-card${isActive ? " is-active" : ""}`}
                  aria-expanded={isActive}
                  onClick={() => setActiveProcessStep(index)}
                  onFocus={() => setActiveProcessStep(index)}
                  onMouseEnter={() => setActiveProcessStep(index)}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {step.image && (
                    <span className="process-card-media">
                      <Image
                        src={step.image}
                        alt={step.alt ?? ""}
                        fill
                        sizes="(max-width: 767px) 100vw, 38vw"
                        priority={index === 0}
                      />
                    </span>
                  )}
                  <span className="process-card-copy">
                    <b>{step.number}</b>
                    <strong>{step.title}</strong>
                    <span className="process-card-description">{step.description}</span>
                    <span className="process-card-indicator" aria-hidden="true">
                      <Image src="/images/process/card-corner-mark.png" alt="" width={96} height={96} />
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
        <section id="kalkulator" className="calculator-section">
          <div>
            <span className="eyebrow">PRECIZNIJI UPIT</span>
            <h2>Izračunajte potrebnu količinu.</h2>
            <p>
              Unesite dimenzije prostorije. Računamo rezervu, broj cijelih
              paketa i informativnu vrijednost materijala za trenutno odabrani
              pod.
            </p>
          </div>
          <Calculator
            item={calcItem}
            showPicker
            onItemChange={setCalcItem}
            onRequestQuote={(result) => {
              track("calculator_completed");
              openQuote(calcItem, result);
            }}
          />
        </section>
        <section className="how legacy-how">
          <div>
            <span className="eyebrow">KAKO FUNKCIONIŠE</span>
          </div>
          {[
            [
              "1.",
              "Izmjerite prostor",
              "Izmjerite dužinu i širinu prostorije za informativni proračun.",
            ],
            [
              "2.",
              "Uporedite artikle",
              "Pregledajte dekore, kolekcije i tehničke karakteristike.",
            ],
            [
              "3.",
              "Zatražite ponudu",
              "Pošaljite izabrani proizvod i potrebnu količinu našem prodajnom timu.",
            ],
          ].map((x) => (
            <article key={x[0]}>
              <b>{x[0]}</b>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
            </article>
          ))}
        </section>
        <ProductShowcase />
        <WpcDeckingSection />
        <QualityPage />
        <LaminatiGridSection />
      </main>
      <Footer />
    </>
  );
}

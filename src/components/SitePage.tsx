"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, ShoppingBasket, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CatalogItem, categories } from "@/data/catalog";
import Calculator, { calculableItems } from "./Calculator";
import { useQuote } from "./QuoteProvider";
import { track } from "@/lib/analytics";
import { Footer, ProductsNav } from "./SiteChrome";
import QualityPage from "./QualityPage";

const heroDetails = [1, 2, 3, 4, 5].map(
  (number) => `/images/hero/detail-${number}.jpg`,
);
const heroDetailAlts = [
  "Krupni plan teksture prirodnog hrasta",
  "Detalj spoja laminatnih panela",
  "Profil višeslojne podne obloge",
  "Mat završna obrada drvenog poda",
  "Uzorci podnih obloga u različitim nijansama drveta",
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
    image: "/images/process/step-01-measure.png",
    alt: "Osoba mjeri prostoriju sa drvenim podom",
  },
  {
    number: "2.",
    title: "Uporedite artikle",
    description: "Pregledajte dekore, kolekcije i tehničke karakteristike.",
  },
  {
    number: "3.",
    title: "Zatražite ponudu",
    description: "Pošaljite izabrani proizvod i potrebnu količinu našem prodajnom timu.",
  },
];

const trustPoints = [
  "Više od 20 godina iskustva",
  "Veleprodaja i maloprodaja",
  "Proizvodi dostupni na lageru",
  "Stručno savjetovanje pri izboru",
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
  const [headerVisible, setHeaderVisible] = useState(false);
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const [calcItem, setCalcItem] = useState<CatalogItem>(calculableItems[0]);
  const { openQuote } = useQuote();
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const proslo = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setHeaderVisible(proslo);
        if (!proslo) setMenu(false);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <header
        className={`home-sticky-header${headerVisible ? " is-visible" : ""}`}
        aria-hidden={!headerVisible}
        inert={!headerVisible ? true : undefined}
      >
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
            ["Savjeti", "/savjeti"],
            ["Kontakt", "/kontakt"],
          ].map(([label, href]) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <button
          className="header-cta header-cta-svg"
          aria-label="Vidi ponudu"
          onClick={() => openQuote()}
        >
          <Image src="/cta-dugme.svg" alt="" width={340} height={104} priority />
        </button>
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
              ["Savjeti", "/savjeti"],
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
        {/* Rezervisano za novi hero — sadrzaj dolazi kasnije. */}
        <section className="placeholder-section" aria-hidden="true" data-placeholder="1" />
        {/* Druga sekcija u nizu, jos neodredjena. */}
        <section className="placeholder-section" aria-hidden="true" data-placeholder="2" />
        <span id="naslovna" />
        <span id="podovi" />
        <span id="o-nama" />
        <span id="savjeti" />
        <section ref={heroRef} className="home-hero">
          <div className="home-hero-interior">
            <Image
              src="/images/hero/hero-interior.jpg"
              alt="Savremeni svijetli dnevni boravak sa prirodnim drvenim podom"
              fill
              priority
              sizes="100vw"
            />
            <div className="home-hero-copy">
              <strong>KOLEKCIJA PODOVA</strong>
              <p>Materijali birani za dugotrajne, skladne i tople prostore.</p>
            </div>
            <span className="home-hero-basket" aria-label="Korpica">
              <ShoppingBasket size={22} strokeWidth={1.6} />
            </span>
          </div>
          <div className="home-hero-panel">
            <div className="detail-strip">
              <div className="detail-group detail-group-left">
                <HeroDetail slot={0} />
                <HeroDetail slot={1} />
              </div>
              <HeroDetail slot={2} className="detail-single" />
              <div className="detail-group detail-group-right">
                <HeroDetail slot={3} />
                <HeroDetail slot={4} />
              </div>
            </div>
            <h1 className="home-hero-title">
              <span>PONOS</span>
              <b>PROSTORA</b>
            </h1>
          </div>
        </section>
        <section id="kalkulator" className="calculator-section">
          <div>
            <span className="eyebrow">PRECIZNIJI UPIT</span>
            <h2>Koliko poda vam je potrebno?</h2>
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
                      <Image src="/logo-ponos-mark.svg" alt="" width={32} height={32} />
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
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
        <section className="trust">
          <div className="trust-inner">
            <span className="eyebrow">ZAŠTO MT PONOS</span>
            <h2>Podovi se biraju za godine koje dolaze.</h2>
            <ul className="trust-list">
              {trustPoints.map((point, index) => (
                <li key={point}>
                  <span>{`0${index + 1}`}</span>
                  <p>{point}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <QualityPage />
      </main>
      <Footer />
    </>
  );
}

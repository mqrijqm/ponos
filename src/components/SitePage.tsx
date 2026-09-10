"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CatalogItem } from "@/data/catalog";
import Calculator, { calculableItems } from "./Calculator";
import { useQuote } from "./QuoteProvider";
import { track } from "@/lib/analytics";
import { Footer, ProductsNav } from "./SiteChrome";
import QualityPage from "./QualityPage";
import WpcDeckingSection from "./WpcDeckingSection";
import EditorialStatement from "./EditorialStatement";
import ProductShowcase, { miram } from "./ProductShowcase";
import BasketMenu from "./BasketMenu";
import { useMediaQuery } from "./hero/hooks";
import HeroVideo from "./hero/HeroVideo";
import CategoryCarousel from "./mobile/CategoryCarousel";
import LandingUvod from "./landing/LandingUvod";
import OvalDugme from "./landing/OvalDugme";
import Traka from "./landing/Traka";
import HomeHeroReveal from "./HomeHeroReveal";
import MobileMenu from "./MobileMenu";
import StatementSlider from "./mobile/StatementSlider";

/* Pool tekstura kroz koje se pločice smjenjuju. Prvih pet su starije
   .jpg fotografije, ostalo su kvadratni .webp krupni planovi. */
/* Kartica koja vodi na drugu stranicu mora biti next/link, a ne <a>. */
const MotionLink = motion.create(Link);

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
  /**
   * Gdje kartica vodi. `href` je obican link (kalkulator ispod, stranica
   * ponude), a korak 3 nema odrediste — otvara isti panel kao dugme
   * "Vidi ponudu" u navbaru.
   */
  href?: string;
};

const processSteps: ProcessStep[] = [
  {
    number: "1.",
    title: "Izmjerite prostor",
    description: "Izmjerite dužinu i širinu prostorije za informativni proračun.",
    image: "/images/process/step-01-measure.webp",
    alt: "Metar razvučen preko laminata u svijetlom dnevnom boravku",
    href: "#kalkulator",
  },
  {
    number: "2.",
    title: "Uporedite artikle",
    description: "Pregledajte dekore, kolekcije i tehničke karakteristike.",
    image: "/images/process/step-02-compare.webp",
    alt: "Tri daske u različitim dekorima poređane jedna preko druge",
    href: "/proizvodi",
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
  /*
    Na telefonu snimak ide ispod trake, pa traka nad njim nema podlogu i sve
    u njoj je bijelo. Cim snimak prodje, podloga se vraca — preko kremastog i
    tamnog sadrzaja ispod bijeli znak se ne bi vidio.

    Na sirokom ekranu snimak stoji u stranici, ispod trake, pa je traka tamo
    uvijek puna.
  */
  const [prekoSnimka, setPrekoSnimka] = useState(false);
  const uzakEkran = useMediaQuery("(max-width: 1023px)");

  useEffect(() => {
    /* Sirok ekran nema sta da prati; vrijednost se tamo i ne koristi
       (vidi `naSnimku` ispod), pa se ovdje samo izlazi. */
    if (!uzakEkran) return;
    let raf = 0;
    const izmjeri = () => {
      const hero = document.querySelector(".hero-video");
      if (!hero) return;
      /* Prag je dno snimka manje visina trake — traka se zatamni tacno kad
         snimak izadje ispod nje. */
      setPrekoSnimka(hero.getBoundingClientRect().bottom > 64);
    };
    const naScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(izmjeri);
    };
    naScroll();
    window.addEventListener("scroll", naScroll, { passive: true });
    window.addEventListener("resize", naScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", naScroll);
      window.removeEventListener("resize", naScroll);
    };
  }, [uzakEkran]);

  /* Traka je providna samo na uskom ekranu i samo dok je snimak pod njom. */
  const naSnimku = uzakEkran && prekoSnimka;

  return (
    <>
      {/*
        Traka je uvijek puna. Providna je bila samo dok je stranica pocinjala
        herojem preko cijelog ekrana; sada je prvi sadrzaj kremast, pa bi
        providna traka ostala bez podloge i ne bi se citala.
      */}
      <header
        className={`home-sticky-header is-visible${naSnimku ? "" : " is-solid"}`}
      >
        <a
          className="brand brand-image"
          href="#top"
          aria-label="MT PONOS — početna"
        >
          <Image
            src={naSnimku ? "/logo-ponos-light.svg" : "/logo-ponos.svg"}
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
        <MobileMenu open={menu} onClose={() => setMenu(false)} />
      </header>
      <main id="top">
        <HeroVideo />
        <span id="naslovna" />
        <span id="podovi" />
        <span id="o-nama" />
        {/*
          Otvaranje stranice ide redom sa predloska: recenica sa strelicom i
          tri artikla, traka, izjava, par slika, pa "Kako funkcionise".
          Ispod toga stranica nastavlja onako kako je i bila.
        */}
        <LandingUvod />
        <Traka tekst="Ono što čini svaki dom." />
        <EditorialStatement />
        {/*
          Ponuda odmah ispod izjave: uspravne slike po grupama, kroz koje se
          prevlaci prstom. Ovdje je ranije stajao par slika koji se nije dao
          listati — jedan enterijer i traka teksture, bez veze sa ostatkom
          ponude.
        */}
        <CategoryCarousel />
        {/* Sekcija o kvalitetu je bila pri dnu, iza dva prikaza proizvoda i
            klizaca; sada stoji odmah iza ponude, prije "Kako funkcionise". */}
        <QualityPage />
        <section className="how process-section">
          <div className="how-heading">
            <span className="eyebrow">KAKO FUNKCIONIŠE</span>
            {/* Isto dugme kao na herou, samo smedje — vodi na isto mjesto. */}
            <OvalDugme
              natpis="Pogledaj ponudu"
              className="how-cta"
              onClick={() => openQuote()}
            />
          </div>
          {/* Tri jednaka kvadrata; ranije su se sirine mijenjale sa aktivnom
              karticom, pa je red poskakivao na svaki prelaz misa. */}
          <div className="process-accordion">
            {processSteps.map((step, index) => {
              const isActive = index === activeProcessStep;
              // Kartica se otvara na hover i fokus; klik je vodi dalje.
              const shared = {
                className: `process-card${isActive ? " is-active" : ""}`,
                onFocus: () => setActiveProcessStep(index),
                onMouseEnter: () => setActiveProcessStep(index),
                transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
                "aria-expanded": isActive,
              };
              /*
                Kartica je link na svakoj sirini. Na telefonu je ranije bila
                obican <div> sa nevidljivim dugmetom preko sebe, jer je slika
                cekala dodir; sada je slika tamo uvijek vidljiva, pa nema sta
                da se otvara — dodir vodi tamo gdje kartica i pokazuje.

                Sidro na istoj stranici ostaje obican <a>, da ga Lenis uhvati i
                klizne do njega; prelazak na drugu stranicu ide kroz next/link.
              */
              const Card = !step.href
                ? motion.button
                : step.href.startsWith("#")
                  ? motion.a
                  : MotionLink;
              const target = step.href
                ? { href: step.href }
                : { type: "button" as const, onClick: () => openQuote() };
              return (
                <Card key={step.number} {...shared} {...target}>
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
                </Card>
              );
            })}
          </div>
        </section>
        {/*
          Traka nosi naslov kalkulatora koji stoji odmah ispod nje. Natpis
          "Precizniji upit", isti taj naslov i pasus o dimenzijama su izasli —
          bili su tri reda teksta ispred polja koja to isto traze.
        */}
        <Traka tekst="Izračunajte potrebnu količinu" />
        <section id="kalkulator" className="calculator-section">
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
        {/* Isti detalj kao Krono, samo preslikan — tekstura lijevo. */}
        <ProductShowcase product={miram} mirrored titleId="showcase-miram" />
        <StatementSlider />
        {/*
          "Na jednom mjestu" zatvara stranicu, tik iznad podnozja. Bila je
          prva sekcija ispod heroja; sada je zadnja, pa se plocice i natpis
          sastavljaju kao zavrsna rijec. Okidac je isti — sekcija krece kad
          udje u kadar (HomeHeroReveal), sto na dnu radi jednako kao na vrhu.
        */}
        <HomeHeroReveal>
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
            {/* h2, ne h1: isti natpis nosi hero na vrhu, a dva h1 sa istim
                tekstom su jedan naslov previse. Izgled se ne mijenja —
                stilovi idu po klasi. */}
            <h2 className="home-hero-title">
              <span>PONOS</span>
              <b>PROSTORA</b>
            </h2>
          </div>
        </HomeHeroReveal>
      </main>
      <Footer />
    </>
  );
}

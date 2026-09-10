"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { CatalogItem } from "@/data/catalog";
import Calculator, { calculableItems } from "./Calculator";
import { useQuote } from "./QuoteProvider";
import { track } from "@/lib/analytics";
import { Footer, ProductsNav } from "./SiteChrome";
import QualityPage from "./QualityPage";
import WpcDeckingSection from "./WpcDeckingSection";
import Asortiman from "./landing/Asortiman";
import BasketMenu from "./BasketMenu";
import HeroVideo from "./hero/HeroVideo";
import CategoryCarousel from "./mobile/CategoryCarousel";
import OvalDugme from "./landing/OvalDugme";
import Traka from "./landing/Traka";
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
  /*
    Pocinje na `true` — dakle bez podloge. Stranica se otvara na vrhu, gdje je
    snimak tacno pod trakom; a i sirina ekrana i polozaj snimka se mogu
    izmjeriti tek u browseru, poslije prvog iscrtavanja.

    Ranije je pocinjala na `false`: prvi kadar je onda bio kremasta traka
    preko snimka, koja bi tek u sljedecem frejmu nestala. Na telefonu se to
    vidjelo kao bijela traka na videu pri svakom otvaranju stranice.

    Obrnuta greska ne postoji na oko: na sirokom ekranu je traka takodje
    kremasta, pa jedan frejm bez podloge preko kremastog heroja ne mijenja
    sliku.
  */
  const [naSnimku, setNaSnimku] = useState(true);

  useEffect(() => {
    let raf = 0;
    const izmjeri = () => {
      /* Sirina se cita ovdje, ne kroz hook: hook prvi render uvijek vrati
         `false`, pa bi traka opet bljesnula puna prije nego se popravi. */
      const usko = window.matchMedia("(max-width: 1023px)").matches;
      const hero = document.querySelector(".hero-video");
      /* Prag je dno snimka manje visina trake — traka se zatamni tacno kad
         snimak izadje ispod nje. Na sirokom ekranu snimak stoji u stranici,
         ispod trake, pa je traka tamo uvijek puna. */
      setNaSnimku(!!hero && usko && hero.getBoundingClientRect().bottom > 64);
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
  }, []);

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
      </header>
      {/*
        Meni stoji izvan zaglavlja, iako ga zaglavlje otvara. Unutra je nosio
        njegova pravila: dok je traka providna preko snimka, sve u njoj je
        bijelo — pa je i spisak u meniju bio bijel, na kremastoj podlozi
        preklopa. Preklop je ionako `fixed` preko cijelog ekrana; zaglavlju
        ne pripada ni po izgledu ni po znacenju.
      */}
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
      <main id="top">
        <HeroVideo />
        <span id="naslovna" />
        <span id="podovi" />
        <span id="o-nama" />
        {/*
          Ispod snimka je stajala traka artikala koja se vrti sama, traka sa
          jednom recenicom, pa izjava o asortimanu. Sve troje je izaslo:
          ista takva traka slika stoji na dnu stranice, a izjava je govorila
          ono sto sekcija ispod sada pokazuje.
        */}
        <Asortiman />
        {/*
          Ponuda odmah ispod izjave: uspravne slike po grupama, kroz koje se
          prevlaci prstom. Ovdje je ranije stajao par slika koji se nije dao
          listati — jedan enterijer i traka teksture, bez veze sa ostatkom
          ponude.
        */}
        <CategoryCarousel />
        {/* Sekcija o kvalitetu je bila pri dnu, iza dva prikaza proizvoda i
            klizaca; sada stoji odmah iza ponude. */}
        <QualityPage />
        {/*
          Racunica ide odmah iza kvaliteta: popis 01-03 zavrsava "strucnom
          podrskom", a prvo sto ta podrska radi jeste da izracuna koliko poda
          treba. Traka nosi naslov kalkulatora koji stoji odmah ispod nje —
          natpis "Precizniji upit" i pasus o dimenzijama su izasli, bili su
          tri reda teksta ispred polja koja to isto traze.
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
        {/*
          Snimak preko cijele sirine, odmah poslije racunice. Bez natpisa i
          bez dugmeta: stranica je do ovdje vec sve rekla, ovo je predah.

          `muted` i `playsInline` nisu ukras — bez njih iOS ne pusta snimak
          sam. `poster` drzi mjesto dok fajl ne stigne, da se stranica ne
          trza ispod prsta.
        */}
        <section className="video-traka is-fullbleed" aria-label="WPC decking na terasi">
          <video
            className="video-traka-snimak"
            poster="/video/decking-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
          >
            <source src="/video/decking.webm" type="video/webm" />
            <source src="/video/decking.mp4" type="video/mp4" />
          </video>
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
        {/*
          Ovdje su stajala dva prikaza artikla — Wicked Harvest Oak i Miram —
          jedan uz drugi, sa WPC-om izmedju. Tri puna kadra proizvoda zaredom
          na telefonu su bila duza od ostatka stranice; ostaje WPC, koji nosi
          izbor boje i time radi nesto sto kartica u traci ne moze.

          Komponenta `ProductShowcase` je i dalje u kodu, samo je naslovna ne
          zove.
        */}
        <WpcDeckingSection />
        {/*
          "Kako se odluciti" je bilo odmah iza kvaliteta, prije racunice; sada
          zatvara stranicu zajedno sa izjavama — tri koraka i rijec o firmi
          stoje na kraju, kad je ponuda vec vidjena.
        */}
        <section className="how process-section">
          <div className="how-heading">
            <span className="eyebrow">KAKO SE ODLUČITI ZA KUPOVINU?</span>
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
              /*
                Sirok ekran: kartica se otvara pod misem i na fokus, klik vodi
                dalje. Telefon nema misa, pa se otvara dodirom — prvi dodir
                otvara, drugi vodi. Hover i fokus se tamo ne slusaju: dodir
                usput da i fokus, pa bi se kartica otvorila prije nego sto
                klik stigne i prvi dodir bi vec odveo sa stranice.
              */
              const uzak = () => window.matchMedia("(max-width: 900px)").matches;
              const otvoriPrvim = (dogadjaj: { preventDefault: () => void }) => {
                if (isActive || !uzak()) return false;
                dogadjaj.preventDefault();
                setActiveProcessStep(index);
                return true;
              };
              const shared = {
                className: `process-card${isActive ? " is-active" : ""}`,
                onFocus: () => {
                  if (!uzak()) setActiveProcessStep(index);
                },
                onMouseEnter: () => {
                  if (!uzak()) setActiveProcessStep(index);
                },
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
                ? { href: step.href, onClick: otvoriPrvim }
                : {
                    type: "button" as const,
                    onClick: (dogadjaj: React.MouseEvent) => {
                      if (!otvoriPrvim(dogadjaj)) openQuote();
                    },
                  };
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
        <StatementSlider />
        {/*
          Stranicu zatvara traka detalja. Iznad plocica su stajali natpis
          "Na jednom mjestu", recenica o asortimanu i jos jedan "PONOS
          PROSTORA" — isti onaj koji vec stoji preko snimka na vrhu. Tri
          natpisa u sekciji koja nema sta da kaze osim da pokaze materijal.

          Ostaju slike, ali se sada vrte same, u krug, kao traka artikala
          ispod heroja. Nema ni okidaca na scroll ni nasumicnog smjenjivanja
          po plocici: traka ide i kad se do nje dodje i kad se prodje pored.
        */}
        <section className="detalji is-fullbleed" aria-label="Detalji podnih obloga">
          <div className="detalji-traka">
            {/*
              Spisak dva puta: kad prvi krug izadje, drugi je vec na njegovom
              mjestu. Kopija je samo slika — za citac ekrana je nema, inace bi
              svaki detalj bio naveden dvaput.
            */}
            <div className="detalji-plocice">
              {[0, 1].map((krug) =>
                heroDetails.map((src, i) => (
                  <span className="detalji-plocica" key={`${krug}-${src}`}>
                    <Image
                      src={src}
                      alt={krug === 1 ? "" : heroDetailAlts[i]}
                      fill
                      sizes="(max-width: 767px) 42vw, 200px"
                    />
                  </span>
                )),
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

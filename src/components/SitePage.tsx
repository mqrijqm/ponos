"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { CatalogItem } from "@/data/catalog";
import Calculator, { calculableItems } from "./Calculator";
import { useQuote } from "./QuoteProvider";
import { track } from "@/lib/analytics";
import { Footer, ProductsNav } from "./SiteChrome";
import WpcDeckingSection from "./WpcDeckingSection";
import Asortiman from "./landing/Asortiman";
import Iskustvo from "./landing/Iskustvo";
import Predah from "./landing/Predah";
import PregledLaminata from "./landing/PregledLaminata";
import BasketMenu from "./BasketMenu";
import HeroVideo from "./hero/HeroVideo";
import Traka from "./landing/Traka";
import MobileMenu from "./MobileMenu";

export default function SitePage() {
  const [menu, setMenu] = useState(false);
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

          Sada snimak vodi u sekciju o iskustvu — jedan krupan naslov i
          malo teksta, sa mnogo vazduha — pa tek onda u ponudu.
        */}
        <Iskustvo />
        <Predah />
        <PregledLaminata />
        <Asortiman />
        {/*
          Poslije ponude stranica ide na racunicu, pa na izbor boje decka, i
          tu staje. Sekcija o kvalitetu, snimak terase, tri koraka, izjave i
          traka detalja su izasli — naslovna je bila duza od svega sto ima
          da kaze.

          Traka nosi naslov kalkulatora koji stoji odmah ispod nje.
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
        <WpcDeckingSection />
      </main>
      <Footer />
    </>
  );
}

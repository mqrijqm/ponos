"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { useQuote } from "./QuoteProvider";
import BasketMenu from "./BasketMenu";
import OvalDugme from "./landing/OvalDugme";

/**
 * Meni preko cijelog ekrana. Ranije je to bila trakica koja se spustala ispod
 * zaglavlja i ostavljala pola stranice vidljivim iza sebe; sada preuzima cijeli
 * ekran, pa nema sta da odvlaci paznju sa osam stavki.
 *
 * Klasa je `menu-overlay`, a ne `mobile-menu` — pod tim imenom vec stoji stari
 * <details> meni u zaglavlju unutrasnjih stranica.
 */

/*
  Natpisi su ovdje ispisani, a ne uzeti iz `categories`: u meniju stoje puna
  imena ("Tarkett parketi", "Akustični zidni paneli"), dok katalog nosi kraca
  ("Parketi", "Zidni paneli").
*/
const STAVKE: [naziv: string, href: string][] = [
  ["Laminati", "/proizvodi/laminati"],
  ["SPC Vinyl i WPC Decking", "/proizvodi/spc-vinyl-decking"],
  ["Tarkett parketi", "/proizvodi/parketi"],
  ["Akustični zidni paneli", "/proizvodi/zidni-paneli"],
  ["Podne lajsne", "/proizvodi/lajsne"],
  ["Vizualizator", "/vizualizator"],
  ["O nama", "/o-nama"],
  ["Kontakt", "/kontakt"],
];

/** Razmak izmedju ulazaka stavki, u sekundama. */
const KORAK = 0.2;

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { openQuote } = useQuote();

  useEffect(() => {
    if (!open) return;

    /*
      Dvije brave za dvije stvari: klasa zaustavlja obican scroll stranice, a
      dogadaj zaustavlja Lenis — on vozi svoju petlju i za `overflow: hidden`
      ne zna. Isti par koristi i hero dok snimak traje.
    */
    document.documentElement.classList.add("menu-open");
    window.dispatchEvent(new Event("ponos:scroll-lock"));

    const naTipku = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", naTipku);

    return () => {
      document.documentElement.classList.remove("menu-open");
      window.dispatchEvent(new Event("ponos:scroll-unlock"));
      window.removeEventListener("keydown", naTipku);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="menu-overlay" role="dialog" aria-modal="true" aria-label="Meni">
      <div className="menu-overlay-head">
        <Link href="/" onClick={onClose} aria-label="MT PONOS — početna">
          <Image src="/logo-ponos.svg" alt="MT PONOS — podne obloge" width={300} height={79} />
        </Link>
        <button
          type="button"
          className="menu-overlay-close"
          aria-label="Zatvori meni"
          onClick={onClose}
        >
          <X />
        </button>
      </div>

      <nav className="menu-overlay-list">
        {STAVKE.map(([naziv, href], i) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            /* Kasnjenje raste po stavci — spisak ulazi odozdo, jedna po jedna. */
            style={{ animationDelay: `${i * KORAK}s` }}
          >
            {naziv}
          </Link>
        ))}
      </nav>

      {/*
        Korpa je izasla iz zaglavlja — tamo su na telefonu ostali samo znak i
        hamburger — pa svoje mjesto ima ovdje, kao red menija.
      */}
      <div className="menu-overlay-basket">
        <BasketMenu />
      </div>

      {/* Isti oval kao svako drugo dugme na sajtu — ranije je ovdje stajao
          taman pravougaonik, jedini takav na stranici. */}
      <div className="menu-overlay-foot">
        <OvalDugme
          natpis="Pogledaj ponudu"
          className="menu-overlay-cta"
          onClick={() => {
            onClose();
            openQuote();
          }}
        />
      </div>
    </div>
  );
}

/**
 * Hamburger sa svojim stanjem, za zaglavlja koja ga nemaju (unutrasnje
 * stranice). Naslovna vec drzi `menu` u SitePage, pa tamo ide sam `MobileMenu`.
 */
export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="menu"
        aria-label="Otvori meni"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu />
      </button>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}

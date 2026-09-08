import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import { categories } from "@/data/catalog";
import QuoteCta from "./QuoteCta";
import BasketMenu from "./BasketMenu";

/** Padajuci meni za "Proizvodi" — bez JS-a, otvara se na hover i na fokus. */
export function ProductsNav() {
  return (
    <div className="nav-dropdown">
      <Link href="/proizvodi">
        Proizvodi <ChevronDown size={13} aria-hidden="true" />
      </Link>
      <div className="nav-dropdown-panel">
        {/* Bez "Sva ponuda" — sam naslov "Proizvodi" vec vodi tamo. */}
        {categories.map((c) => (
          <Link key={c.slug} href={`/proizvodi/${c.slug}`}>
            {c.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link
      className={`brand brand-image${light ? " light" : ""}`}
      href="/"
      aria-label="MT PONOS — početna"
    >
      <Image
        src={light ? "/logo-ponos-light.svg" : "/logo-ponos.svg"}
        alt="MT PONOS — podne obloge"
        width={300}
        height={79}
        priority
      />
    </Link>
  );
}
export function Header() {
  return (
    <header className="site-header">
      <Wordmark />
      <nav>
        <ProductsNav />
        <Link href="/vizualizator">Vizualizator</Link>
        <Link href="/o-nama">O nama</Link>
        <Link href="/kontakt">Kontakt</Link>
      </nav>
      <QuoteCta className="header-cta cta-dot">
        <i /> Vidi ponudu
      </QuoteCta>
      <BasketMenu />
      <details className="mobile-menu">
        <summary aria-label="Otvori meni">
          <Menu />
        </summary>
        <div>
          {categories.map((c) => (
            <Link key={c.slug} href={`/proizvodi/${c.slug}`} className="mobile-sub">
              {c.title}
            </Link>
          ))}
          <Link href="/vizualizator">Vizualizator</Link>
          <Link href="/o-nama">O nama</Link>
          <Link href="/kontakt">Kontakt</Link>
        </div>
      </details>
    </header>
  );
}
function LegacyFooter() {
  return (
    <footer className="site-footer">
      <nav className="footer-primary" aria-label="Navigacija u podnožju">
        <Link href="/proizvodi">Proizvodi</Link>
        <Link href="/o-nama">O nama</Link>
      </nav>
      <div className="footer-mark">
        <Wordmark light />
      </div>
      <nav className="footer-secondary" aria-label="Korisni linkovi">
        <Link href="/kontakt">Kontakt</Link>
        <Link href="/vizualizator">Vizualizator</Link>
      </nav>
      <address className="footer-contact">
        <span>MT Ponos d.o.o.</span>
        <span>Banja Luka, RS</span>
        <strong>Kontaktirajte nas</strong>
        <a href="tel:+38751386386">T: &nbsp;+387 51 386 386</a>
        <a href="mailto:info@mtponos.com">info@mtponos.com</a>
      </address>
      <small className="footer-copyright">
        © {new Date().getFullYear()} MT PONOS. Sva prava zadržana.
      </small>
      <small className="footer-credit">
        Koncept i izrada Studio BLink
      </small>
    </footer>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <nav className="footer-nav" aria-label="Navigacija u podnožju">
          <Link href="/proizvodi">Proizvodi</Link>
          <Link href="/o-nama">O nama</Link>
          <Link href="/vizualizator">Vizualizator</Link>
          <Link href="/kontakt">Kontakt</Link>
        </nav>
        <div className="footer-brand-column">
          <Wordmark light />
          <p>MT Ponos d.o.o.<br />Banja Luka, RS</p>
        </div>
        <address className="footer-contact-column">
          <span className="footer-contact-eyebrow">KONTAKT</span>
          <a className="footer-phone" href="tel:+38751386386">+387 51 386 386</a>
          <a className="footer-email" href="mailto:info@mtponos.com">info@mtponos.com</a>
          <div className="footer-hours">
            <span>Pon–pet: 08:00–19:00</span>
            <span>Subota: 08:00–16:00</span>
          </div>
        </address>
      </div>
      <div className="footer-bottom">
        <small>© 2026 MT PONOS. Sva prava zadržana.</small>
        <small>Koncept i izrada Studio BLink</small>
      </div>
    </footer>
  );
}
export function PageHero({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-hero">
      <div className="crumb">
        <Link href="/">Početna</Link>
        <ArrowRight size={13} />
        {title}
      </div>
      <span className="eyebrow">{kicker}</span>
      <h1>{title}</h1>
      <p>{copy}</p>
    </section>
  );
}

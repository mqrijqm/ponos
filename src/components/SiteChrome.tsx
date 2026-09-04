import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, Phone } from "lucide-react";
export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link
      className={`brand brand-image${light ? " light" : ""}`}
      href="/"
      aria-label="MT PONOS — početna"
    >
      <Image
        src="/logo-ponos.svg"
        alt="MT PONOS — podne obloge"
        width={300}
        height={83}
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
        <Link href="/">Naslovna</Link>
        <Link href="/proizvodi">Proizvodi</Link>
        <Link href="/vizualizator">Vizualizator</Link>
        <Link href="/o-nama">O nama</Link>
        <Link href="/savjeti">Savjeti</Link>
        <Link href="/kontakt">Kontakt</Link>
      </nav>
      <a className="phone" href="tel:+38751386386">
        <Phone size={16} /> +387 51 386 386
      </a>
      <Link className="header-cta" href="/kontakt#upit">
        Zatraži ponudu
      </Link>
      <details className="mobile-menu">
        <summary aria-label="Otvori meni">
          <Menu />
        </summary>
        <div>
          <Link href="/proizvodi">Proizvodi</Link>
          <Link href="/vizualizator">Vizualizator</Link>
          <Link href="/o-nama">O nama</Link>
          <Link href="/savjeti">Savjeti</Link>
          <Link href="/kontakt">Kontakt</Link>
        </div>
      </details>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <nav className="footer-primary" aria-label="Navigacija u podnožju">
        <Link href="/proizvodi">Proizvodi</Link>
        <Link href="/o-nama">O nama</Link>
        <Link href="/savjeti">Savjeti</Link>
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

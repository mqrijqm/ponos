import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { categories } from "@/data/catalog";
import QuoteCta from "./QuoteCta";
import FooterKartica from "./FooterKartica";
import BasketMenu from "./BasketMenu";
import { MobileMenuButton } from "./MobileMenu";

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
      <MobileMenuButton />
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      {/*
        Slog je iz predloska koji je Marija dala: red sa lokacijom i
        kontaktom sitnim verzalom, pa serifna navigacija, pa poziv na
        kontakt u dva reda i mala kartica sa slikom. Crte izmedju blokova
        nisu <hr> nego `border-top` na bloku koji dolazi — jedan element
        manje po razmaku.

        Kartica na dnu se mijenja sama i nosi tackice, kao u predlosku;
        oblik i mjere su u `FooterKartica`.
      */}
      <div className="ft-meta">
        <div className="ft-kolona">
          <span className="ft-natpis">Lokacija</span>
          <address>
            Put srpskih branilaca 47,
            <br />
            Derviši, 78000 Banja Luka,
            <br />
            Republika Srpska
          </address>
        </div>
        <div className="ft-kolona">
          <span className="ft-natpis">Kontakt</span>
          <a href="tel:+38751386386">+387 51 386 386</a>
          <a href="mailto:info@mtponos.com">info@mtponos.com</a>
        </div>
      </div>

      <nav className="ft-nav" aria-label="Navigacija u podnožju">
        <Link href="/proizvodi">Proizvodi</Link>
        <Link href="/vizualizator">Vizualizator</Link>
        <Link href="/akcija">Akcija</Link>
        <Link href="/o-nama">O nama</Link>
      </nav>

      <Link href="/kontakt" className="ft-poziv">
        Kontaktirajte
        <br />
        nas
      </Link>

      <FooterKartica />

      <div className="ft-dno">
        <span>© {new Date().getFullYear()} MT PONOS. Sva prava zadržana.</span>
        <span>Koncept i izrada Studio BLink</span>
      </div>
    </footer>
  );
}
/**
 * Zaglavlje stranice proizvoda, u slogu izjave sa naslovne: natpis, serif
 * recenica lijevo, podnozje sa crtom i strelicom. Beige podloga ostaje samo
 * ovdje — sadrzaj ispod je bijel, pa se vrh stranice jasno odvaja.
 */
export function PageHero({
  kicker,
  title,
  copy,
  lead,
  foot,
  href = "#katalog",
}: {
  kicker: string;
  title: string;
  copy: string;
  /** Duzi uvodni tekst kad ga stranica ima; inace se koristi `copy`. */
  lead?: React.ReactNode;
  /** Natpis uz crtu u dnu. */
  foot?: string;
  href?: string;
}) {
  return (
    <section className="page-hero">
      <div className="crumb">
        <Link href="/">Početna</Link>
        <ArrowRight size={13} />
        {title}
      </div>

      <div className="page-hero-inner">
        <span className="ph-label">{kicker}</span>
        <h1>{title}</h1>
        <p className="ph-lead">{lead ?? copy}</p>

        <div className="ph-foot">
          <span className="ph-kicker">
            <i aria-hidden="true" />
            {foot ?? "MT PONOS · BANJA LUKA"}
          </span>
          <Link className="ph-arrow" href={href} aria-label="Pogledaj ponudu">
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

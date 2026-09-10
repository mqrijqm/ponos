import Link from "next/link";

/**
 * Znak koji se okrece oko svoje ose. Stoji na dva mjesta — uz uvodnu
 * recenicu i u sekciji o kvalitetu — pa oblik zivi ovdje, a ne dvaput
 * prepisan; kad se putanje promijene, promijene se na oba mjesta.
 *
 * Crta se u kodu, ne kroz <Image>: tako se okrece bez jos jednog zahtjeva
 * i bez skoka dok se fajl ceka. Vodi na katalog.
 */
export default function Znak({ className }: { className?: string }) {
  return (
    <Link
      href="/proizvodi"
      className={`uvod-znak${className ? ` ${className}` : ""}`}
      aria-label="Pogledaj proizvode"
    >
      <svg viewBox="0 0 266 286" fill="currentColor" aria-hidden="true">
        <path d="M266 0H82V69H266V0Z" />
        <path d="M0 0L0 182H72L72 0H0Z" />
        <path d="M194 77V262H266V77H194Z" />
        <path d="M186 77H82V147H186V77Z" />
        <path d="M82 155H187V198H92C86.4772 198 82 193.523 82 188V155Z" />
        <path d="M72 190H0V262H72V190Z" />
        <path d="M72.0005 190L115.302 262H28.6992L72.0005 190Z" />
        <path d="M124.196 262H187V190H124.196V262Z" />
        <path d="M124.373 262L81.6133 190H167.132L124.373 262Z" />
      </svg>
    </Link>
  );
}

"use client";

import Link from "next/link";

/**
 * Dugme u ovalu, sa strelicom.
 *
 * Oval je SVG, ne `border-radius`: elipsa se razvlaci preko cijelog dugmeta
 * koliko god natpis bio dug i ostaje elipsa, dok zaobljeni pravougaonik ima
 * prave stranice i pod natpisom se to vidi. `non-scaling-stroke` drzi liniju
 * na 1px i kad se elipsa razvuce.
 *
 * Boju i mjere nosi klasa koja se doda spolja (`hv-cta` preko snimka,
 * `how-cta` na kremu) — ovdje je samo oblik.
 */
export default function OvalDugme({
  natpis,
  className = "",
  onClick,
  href,
}: {
  natpis: string;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const sadrzaj = (
    <>
      <svg
        className="oval-dugme-elipsa"
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <ellipse
          cx="100"
          cy="30"
          rx="99"
          ry="29"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span>{natpis}</span>
      <svg className="oval-dugme-strelica" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M4 12L12 4M12 4H5.5M12 4V10.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="square"
        />
      </svg>
    </>
  );

  const klase = `oval-dugme ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={klase}>
        {sadrzaj}
      </Link>
    );
  }
  return (
    <button type="button" className={klase} onClick={onClick}>
      {sadrzaj}
    </button>
  );
}

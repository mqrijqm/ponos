"use client";

import Link from "next/link";

/**
 * Dugme u ovalu, sa strelicom.
 *
 * Oblik nosi CSS (`.oval-dugme`): elipsa je `border-radius: 50%`, strelica je
 * maska iza natpisa. Ovdje je samo natpis i to da li je dugme ili link — da
 * elipsa i strelica ne stoje u dvije verzije, ovdje kao SVG i u CSS-u za
 * zatecenu `.cta-dot` dugmad po sajtu.
 *
 * Boju daje klasa koja se doda spolja: `hv-cta` je bijela preko snimka, sve
 * ostalo uzima smedju.
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
  const klase = `oval-dugme ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={klase}>
        <span>{natpis}</span>
      </Link>
    );
  }
  return (
    <button type="button" className={klase} onClick={onClick}>
      <span>{natpis}</span>
    </button>
  );
}

"use client";
import { catalog } from "@/data/catalog";
import { useQuote } from "./QuoteProvider";

/**
 * Jedini nacin na koji se traži ponuda na cijelom sajtu. Otvara isti modal
 * svugdje — u navbaru bez artikla, na stranici artikla sa predodabranim.
 */
export default function QuoteCta({
  code,
  className,
  label,
  children,
}: {
  code?: string;
  className?: string;
  label?: string;
  children: React.ReactNode;
}) {
  const { openQuote } = useQuote();
  const item = code ? catalog.find((x) => x.code === code) : undefined;
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => openQuote(item ?? undefined)}
    >
      {children}
    </button>
  );
}

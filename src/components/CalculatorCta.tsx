"use client";
import { Calculator as CalcIcon, ArrowRight } from "lucide-react";
import { CatalogItem } from "@/data/catalog";
import { useQuote } from "./QuoteProvider";

/**
 * Traka koja otvara master kalkulator. Stoji na katalogu i na stranici
 * artikla — kalkulator je isti, mijenja se samo predodabrani artikal.
 */
export default function CalculatorCta({ item }: { item?: CatalogItem }) {
  const { openCalculator } = useQuote();
  return (
    <section className="calc-cta">
      <div>
        <span className="eyebrow">PRECIZNIJI UPIT</span>
        <h2>
          {item
            ? "Izračunajte količinu za ovaj pod."
            : "Izračunajte koliko poda vam treba."}
        </h2>
        <p>
          Unesite dimenzije prostorije — dobijate rezervu, broj cijelih paketa i
          informativnu vrijednost, pa upit ide sa gotovim proračunom.
        </p>
      </div>
      <button className="primary" onClick={() => openCalculator(item)}>
        <CalcIcon size={17} /> Otvori kalkulator <ArrowRight size={17} />
      </button>
    </section>
  );
}

"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CatalogItem, pricingFor } from "@/data/catalog";
import Calculator, { CalcResult, calculableItems } from "./Calculator";
import QuoteForm, { QuotePrefill } from "./QuoteForm";
import { track } from "@/lib/analytics";

type Step = "calculator" | "form";

type QuoteApi = {
  /** Otvara kalkulator u modalu. Bez artikla uzima prvi iz kataloga. */
  openCalculator: (item?: CatalogItem) => void;
  /** Preskace kalkulator i otvara odmah formu za upit. */
  openQuote: (item?: CatalogItem, result?: CalcResult) => void;
  close: () => void;
};

const Ctx = createContext<QuoteApi | null>(null);

/** Poziva se iz bilo koje komponente ispod providera. */
export function useQuote() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuote mora biti unutar <QuoteProvider>");
  return ctx;
}

function prefillFrom(
  item: CatalogItem | null,
  result: CalcResult | null,
): QuotePrefill | undefined {
  if (!item) return undefined;
  const pricing = pricingFor(item);
  return {
    product: `${item.name} (${item.code})`,
    area: result ? `${result.total.toFixed(2)} m²` : undefined,
    quantity: result
      ? `${result.packages} paketa / ${result.coverage.toFixed(2)} ${pricing.unit}`
      : undefined,
  };
}

export default function QuoteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [result, setResult] = useState<CalcResult | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const openCalculator = useCallback((next?: CatalogItem) => {
    setItem(next ?? calculableItems[0] ?? null);
    setResult(null);
    setStep("calculator");
    setOpen(true);
    track("calculator_opened");
  }, []);

  const openQuote = useCallback(
    (next?: CatalogItem, calc?: CalcResult) => {
      setItem(next ?? null);
      setResult(calc ?? null);
      setStep("form");
      setOpen(true);
      track("quote_started");
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const api = useMemo<QuoteApi>(
    () => ({ openCalculator, openQuote, close }),
    [openCalculator, openQuote, close],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={step === "calculator" ? "Proračun količine" : "Upit"}
              className="quote-modal"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
            >
              <button
                className="modal-close"
                aria-label="Zatvori"
                onClick={close}
              >
                <X />
              </button>
              {step === "calculator" && item ? (
                <>
                  <span className="eyebrow">PRECIZNIJI UPIT</span>
                  <h2 id="quote-title">Koliko poda vam je potrebno?</h2>
                  <p>
                    Unesite dimenzije prostorije. Računamo rezervu, broj cijelih
                    paketa i informativnu vrijednost materijala.
                  </p>
                  <Calculator
                    item={item}
                    showPicker
                    onItemChange={setItem}
                    onRequestQuote={(calc) => {
                      track("calculator_completed");
                      setResult(calc);
                      setStep("form");
                    }}
                  />
                </>
              ) : (
                <>
                  {/* Bez naslova i uvodnog reda: panel se otvara na dugme koje
                      je vec reklo sta radi, pa forma pocinje odmah. Ime za
                      citac ekrana nosi `aria-label` na samom panelu. */}
                  <span className="eyebrow">
                    {item ? "PERSONALIZOVANA PONUDA" : "UPIT"}
                  </span>
                  <QuoteForm
                    context="quote"
                    autoFocus
                    prefill={prefillFrom(item, result)}
                    onDone={close}
                  />
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

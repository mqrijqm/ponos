"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ShoppingBasket, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { catalog, productImage } from "@/data/catalog";
import { Ponuda2Modal } from "./Ponuda2Gate";

/**
 * Korpa u navbaru. Prvi klik otvara panel s lijeve strane sa artiklima,
 * svaki sljedeci klik unutar panela otvara poruku da korpa jos nije
 * omogucena u ovoj ponudi.
 *
 * Sadrzaj panela je demonstracija — nema prave logike korpe iza njega.
 */
const stavke = catalog.slice(0, 3);

export default function BasketMenu() {
  const [otvoren, setOtvoren] = useState(false);
  const [poruka, setPoruka] = useState(false);
  /* Navbar ima transform, a transformisani predak postaje containing block
     za `position: fixed` potomke — zato panel ide u portal na <body>.
     Portal smije tek nakon hidracije, pa se server snapshot vraca false. */
  const montiran = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!otvoren) return;
    const naEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOtvoren(false);
    };
    document.addEventListener("keydown", naEscape);
    return () => document.removeEventListener("keydown", naEscape);
  }, [otvoren]);

  return (
    <>
      <button
        type="button"
        className="nav-basket"
        aria-label="Korpica"
        aria-expanded={otvoren}
        onClick={() => setOtvoren(true)}
      >
        <ShoppingBasket size={19} strokeWidth={1.6} />
      </button>

      {montiran &&
        createPortal(
          <AnimatePresence>
            {otvoren && (
              <>
                <motion.div
                  className="basket-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onMouseDown={() => setOtvoren(false)}
                />
                <motion.aside
                  className="basket-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Korpa"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                >
                  <header className="basket-head">
                    <span className="eyebrow">KORPA</span>
                    <button
                      type="button"
                      className="basket-close"
                      aria-label="Zatvori korpu"
                      onClick={() => setOtvoren(false)}
                    >
                      <X size={18} />
                    </button>
                  </header>

                  <ul className="basket-list">
                    {stavke.map((item) => (
                      <li key={item.code}>
                        <button type="button" onClick={() => setPoruka(true)}>
                          <Image
                            src={productImage(item)}
                            alt=""
                            width={120}
                            height={120}
                          />
                          <span>
                            <small>{item.brand}</small>
                            <strong>{item.name}</strong>
                            <em>
                              {item.collection} · šifra {item.code}
                            </em>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="basket-foot">
                    <button
                      type="button"
                      className="cta-dot"
                      onClick={() => setPoruka(true)}
                    >
                      <i /> Nastavi na plaćanje
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {montiran &&
        createPortal(
          <Ponuda2Modal
            feature="korpa"
            open={poruka}
            onClose={() => setPoruka(false)}
          />,
          document.body,
        )}
    </>
  );
}

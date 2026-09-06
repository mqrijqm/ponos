"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const copy = {
  lista: {
    title: "Lista za ponudu nije dostupna u ovoj ponudi.",
    text: "Za ovu mogućnost pogledajte priloženu Ponudu br. 2.",
  },
  uzorak: {
    title: "Naručivanje uzorka nije dostupno u ovoj ponudi.",
    text: "Za ovu mogućnost pogledajte priloženu Ponudu br. 2.",
  },
  poredjenje: {
    title: "Poređenje dekora nije dostupno u ovoj ponudi.",
    text: "Za ovu mogućnost pogledajte priloženu Ponudu br. 2.",
  },
} as const;

export function Ponuda2Gate({
  feature,
  children,
  className = "",
}: {
  feature: keyof typeof copy;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const content = copy[feature];

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && (
        <div
          className="modal-backdrop offer2-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="offer2-modal" role="dialog" aria-modal="true" aria-labelledby={`offer2-${feature}`}>
            <button className="modal-close" aria-label="Zatvori" onClick={() => setOpen(false)}>
              <X />
            </button>
            <CheckCircle2 className="offer2-icon" aria-hidden="true" />
            <span className="eyebrow">PONUDA BR. 2</span>
            <h3 id={`offer2-${feature}`}>{content.title}</h3>
            <p>{content.text}</p>
            <div className="offer2-actions">
              <button type="button" className="offer2-close" onClick={() => setOpen(false)}>
                Zatvori
              </button>
              <a href="/kontakt" className="offer2-contact" onClick={() => setOpen(false)}>
                Kontakt
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

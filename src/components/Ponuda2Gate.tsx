"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const copy = {
  lista: {
    eyebrow: "PONUDA BR. 2",
    title: "Lista za ponudu nije dostupna u ovoj ponudi.",
    text: "Za ovu mogućnost pogledajte priloženu Ponudu br. 2.",
  },
  uzorak: {
    eyebrow: "PONUDA BR. 2",
    title: "Naručivanje uzorka nije dostupno u ovoj ponudi.",
    text: "Za ovu mogućnost pogledajte priloženu Ponudu br. 2.",
  },
  poredjenje: {
    eyebrow: "PONUDA BR. 2",
    title: "Poređenje dekora nije dostupno u ovoj ponudi.",
    text: "Za ovu mogućnost pogledajte priloženu Ponudu br. 2.",
  },
  korpa: {
    eyebrow: "PAKET USLUGA BR. 3",
    title: "Korpa nije omogućena u ovoj ponudi.",
    text: "Korpa sa online plaćanjem dolazi u Paketu usluga br. 3 — uz naplatu karticom, praćenje narudžbe i automatsku potvrdu na e-mail. Do tada narudžbe idu kroz upit za ponudu, a naš tim potvrđuje količinu, cijenu i rok isporuke.",
  },
} as const;

export type GateFeature = keyof typeof copy;

/** Modal se moze otvoriti i bez dugmeta — npr. iz korpe u navbaru. */
export function Ponuda2Modal({
  feature,
  open,
  onClose,
}: {
  feature: GateFeature;
  open: boolean;
  onClose: () => void;
}) {
  const content = copy[feature];

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop offer2-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="offer2-modal" role="dialog" aria-modal="true" aria-labelledby={`offer2-${feature}`}>
        <button className="modal-close" aria-label="Zatvori" onClick={onClose}>
          <X />
        </button>
        <CheckCircle2 className="offer2-icon" aria-hidden="true" />
        <span className="eyebrow">{content.eyebrow}</span>
        <h3 id={`offer2-${feature}`}>{content.title}</h3>
        <p>{content.text}</p>
        <div className="offer2-actions">
          <button type="button" className="offer2-close" onClick={onClose}>
            Zatvori
          </button>
          <a href="/kontakt" className="offer2-contact" onClick={onClose}>
            Kontakt
          </a>
        </div>
      </div>
    </div>
  );
}

export function Ponuda2Gate({
  feature,
  children,
  className = "",
}: {
  feature: GateFeature;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <Ponuda2Modal feature={feature} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

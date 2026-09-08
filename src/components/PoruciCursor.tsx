"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Okrugli "Poruči" znak koji zamjenjuje strelicu iznad slika artikala.
 *
 * Ne ide kroz CSS `cursor: url(...)`: znak je 294px, a browseri kursor sijeku
 * na oko 128px i onda ga ili smanje do necitljivosti ili odbiju. Zato je ovo
 * obican element koji prati misa, dok pravi kursor nad tim slikama nestaje.
 *
 * Slike se ne diraju — sluša se cijeli dokument i pita `closest()`, pa svaka
 * nova sekcija sa slikom artikla samo doda svoj selektor u listu ispod.
 */

/** Nad cim se znak pojavljuje. */
const CILJEVI = [
  ".showcase-media",
  ".showcase-room",
  ".wpc-card-media",
  ".catalog-image",
  ".panel-gallery figure",
  ".detail-tile",
].join(",");

export default function PoruciCursor() {
  const znakRef = useRef<HTMLDivElement>(null);
  const [vidljiv, setVidljiv] = useState(false);

  useEffect(() => {
    /* Na dodir nema kursora — znak bi samo visio na zadnjem dodirnutom mjestu. */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const znak = znakRef.current;
    if (!znak) return;

    let x = 0;
    let y = 0;
    let raf = 0;

    /* Pozicija se pise u rAF-u, ne na svaki `mousemove`: pokreta ima i po
       stotinu u sekundi, a ekran se ionako osvjezava rjeđe. */
    const crtaj = () => {
      raf = 0;
      znak.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const naPokret = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(crtaj);

      const nadCiljem = !!(e.target as Element | null)?.closest?.(CILJEVI);
      setVidljiv((prije) => (prije === nadCiljem ? prije : nadCiljem));
    };

    /* Kad mis izađe iz prozora znak ostaje zaglavljen uz ivicu — sakrij ga. */
    const naIzlaz = () => setVidljiv(false);

    document.addEventListener("mousemove", naPokret, { passive: true });
    document.addEventListener("mouseleave", naIzlaz);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", naPokret);
      document.removeEventListener("mouseleave", naIzlaz);
    };
  }, []);

  return (
    <div
      ref={znakRef}
      className={`poruci-cursor${vidljiv ? " is-vidljiv" : ""}`}
      aria-hidden="true"
    />
  );
}

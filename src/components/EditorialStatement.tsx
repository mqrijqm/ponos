"use client";

import OvalDugme from "./landing/OvalDugme";
import { useQuote } from "./QuoteProvider";

/**
 * Izjava o firmi: jedna recenica i dugme ispod nje.
 *
 * Recenica je mirna — stoji u svojoj boji od trenutka kad se vidi. Ranije se
 * otkrivala rijec po rijec dok sekcija prolazi kroz ekran, a to je trazilo
 * sekciju visoku 2.6 ekrana i pinovan sloj u njoj: dvije trecine te visine
 * bile su prazan hod da bi tekst imao kroz sta da se otkriva. Sada je sekcija
 * visoka koliko i njen sadrzaj, pa recenica stoji odmah ispod trake umjesto
 * da se ceka.
 *
 * Natpis "MT PONOS · BANJA LUKA" i link "Podovi koji stvaraju dom" su izasli.
 * Ostaje recenica i dugme — isto ono sa heroja, samo smedje.
 */
const PRIJE = "Pet grupa proizvoda, jedan salon. Cijeli asortiman na";
const ISTAKNUTO = "jednom mjestu";
const POSLIJE =
  "— laminati evropskih proizvođača, prirodni parketi, vodootporni podovi, decking, zidni paneli i lajsne.";

export default function EditorialStatement() {
  const { openQuote } = useQuote();

  return (
    <section className="editorial-statement is-fullbleed" aria-label="O kompaniji">
      <div className="es-inner">
        <p className="es-text">
          {PRIJE} <span className="es-word-accent">{ISTAKNUTO}</span> {POSLIJE}
        </p>
        <OvalDugme
          natpis="Pogledaj ponudu"
          className="oval-smedje"
          onClick={() => openQuote()}
        />
      </div>
    </section>
  );
}

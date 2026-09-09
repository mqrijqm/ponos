"use client";

import { useState } from "react";

/**
 * Jedna izjava odjednom, autor ispod, strelice u dnu sekcije.
 *
 * VAZNO: ovdje NEMA recenzija kupaca — nemamo ni jednu pravu. Umjesto
 * izmisljenih citata stoje izjave same firme i cinjenice koje se vec nalaze
 * na sajtu (bonitetne ocjene, asortiman, usluga). Kad stignu prave recenzije,
 * mijenja se samo spisak ispod: `{ tekst, autor }`.
 */

type Izjava = { tekst: string; autor: string };

const IZJAVE: Izjava[] = [
  {
    tekst:
      "Osnovani smo u Banjoj Luci 2000. godine. Od prvog dana fokus je na kvalitetnim laminatnim podovima, korektnom odnosu prema kupcu i znanju koje olakšava izbor poda.",
    autor: "MT PONOS · od 2000. godine",
  },
  {
    tekst:
      "Bonitetna ocjena AA+ potvrđuje finansijsku stabilnost, transparentno i odgovorno poslovanje prema kupcima, partnerima i dobavljačima — četiri godine zaredom.",
    autor: "Bonitetna izvrsnost 2023–2026",
  },
  {
    tekst:
      "Od namjene prostora i klase otpornosti do nijanse i formata daske — kupac dobija pomoć pri izboru, obračun količine i organizaciju dostave prema dogovoru.",
    autor: "Prodajni tim, Derviši i Lazarevo",
  },
];

export default function StatementSlider() {
  const [i, setI] = useState(0);
  const izjava = IZJAVE[i];

  /* Krug u oba smjera: sa prve strelica nazad vodi na posljednju izjavu. */
  const pomjeri = (smjer: number) =>
    setI((prije) => (prije + smjer + IZJAVE.length) % IZJAVE.length);

  return (
    <section className="m-band m-quotes" aria-labelledby="m-quotes-title">
      <span className="m-label">IZ NAŠE PRAKSE</span>
      <h2 id="m-quotes-title" className="sr-only">
        Iz naše prakse
      </h2>

      {/*
        `aria-live` javlja citacu ekrana da se tekst promijenio — bez toga
        strelice mijenjaju sadrzaj koji on nikad ne procita.
      */}
      <blockquote className="m-quote" aria-live="polite">
        <p>„{izjava.tekst}”</p>
        <cite>— {izjava.autor}</cite>
      </blockquote>

      <div className="m-quote-nav">
        <button type="button" onClick={() => pomjeri(-1)} aria-label="Prethodna izjava">
          ←
        </button>
        <span className="m-quote-count" aria-hidden="true">
          {i + 1} / {IZJAVE.length}
        </span>
        <button type="button" onClick={() => pomjeri(1)} aria-label="Sljedeća izjava">
          →
        </button>
      </div>
    </section>
  );
}

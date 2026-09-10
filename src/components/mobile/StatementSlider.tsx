"use client";

import { useState } from "react";

import OvalDugme from "../landing/OvalDugme";

/**
 * Jedna izjava odjednom: natpis u traci, tekst, pa dugme i strelice u dnu.
 *
 * `autor` se ne ispisuje — potpis ispod svake izjave je izasao iz sloga —
 * ali ostaje uz tekst: kad stignu prave recenzije, ime govornika je jedino
 * sto ih razlikuje od ovih firminih recenica.
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
      {/* Natpis u traci izmedju dvije crte — isto kao godine u sekciji o
          kvalitetu i naslov "Kako se odluciti" ispod nje. */}
      <div className="m-quotes-traka">
        <span className="m-label">IZ NAŠE PRAKSE</span>
      </div>
      <h2 id="m-quotes-title" className="sr-only">
        Iz naše prakse
      </h2>

      {/*
        `aria-live` javlja citacu ekrana da se tekst promijenio — bez toga
        strelice mijenjaju sadrzaj koji on nikad ne procita.

        Bez navodnika i bez potpisa ispod: izjave su firmine, ne tudje, pa su
        se navodnici citali kao citat nekog treceg. Ko govori kazuje natpis u
        traci iznad.
      */}
      <blockquote className="m-quote" aria-live="polite">
        <p>{izjava.tekst}</p>
      </blockquote>

      <div className="m-quote-foot">
        <OvalDugme natpis="Više o nama" href="/o-nama" className="m-quote-cta" />
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
      </div>
    </section>
  );
}

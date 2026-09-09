"use client";

import { useState } from "react";

/**
 * Tamna traka iznad podnozja: natpis, polje za email sa linijom ispod (ne
 * okvir) i tekstualni CTA desno.
 *
 * Sto se dogada sa unosom: isto sto i sa upitom u QuoteForm — cuva se lokalno
 * na uredaju i to se korisniku kaze otvoreno. Sajt je prototip i nema
 * posiljaoca poste iza sebe, pa traka ne smije obecavati da je nesto poslano.
 */
export default function QuoteBand() {
  const [email, setEmail] = useState("");
  const [sacuvano, setSacuvano] = useState(false);

  const posalji = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem(
      `mtponos-kontakt-${Date.now()}`,
      JSON.stringify({ email, kontekst: "traka" }),
    );
    setSacuvano(true);
  };

  return (
    <section className="m-cta-band" aria-labelledby="m-cta-title">
      <span className="m-label m-label-light" id="m-cta-title">
        PONUDA NA EMAIL
      </span>

      {sacuvano ? (
        <p className="m-cta-done">
          Sačuvano na ovom uređaju. Sajt je prototip — adresa nije poslana
          prodajnom timu. Za pravi upit pozovite +387 51 386 386.
        </p>
      ) : (
        <form className="m-cta-form" onSubmit={posalji}>
          <input
            type="email"
            name="email"
            required
            placeholder="Vaša email adresa"
            aria-label="Email adresa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">POŠALJI</button>
        </form>
      )}
    </section>
  );
}

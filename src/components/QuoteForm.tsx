"use client";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export type QuotePrefill = {
  /** naziv i sifra artikla, npr. "Laminat 5953 (5953)" */
  product?: string;
  /** ukupna povrsina sa rezervom, vec formatirana */
  area?: string;
  /** broj paketa i pokrivenost, vec formatirano */
  quantity?: string;
};

/**
 * Jedna forma za oba konteksta:
 *  - "quote"   = upit za ponudu, nosi proizvod i proracun iz kalkulatora
 *  - "inquiry" = opsti upit sa /kontakt, bez proizvoda
 */
export default function QuoteForm({
  context = "quote",
  prefill,
  onDone,
  autoFocus = false,
}: {
  context?: "quote" | "inquiry";
  prefill?: QuotePrefill;
  onDone?: () => void;
  autoFocus?: boolean;
}) {
  const [sent, setSent] = useState(false);
  const isQuote = context === "quote";

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    localStorage.setItem(
      `mtponos-${isQuote ? "upit" : "kontakt"}-${Date.now()}`,
      JSON.stringify({ ...data, kontekst: context }),
    );
    setSent(true);
  }

  if (sent) {
    return (
      <div className={isQuote ? "success" : "success-inline"}>
        <CheckCircle2 />
        {isQuote && <span>UPIT JE SAČUVAN</span>}
        <h2>{isQuote ? "Hvala — podaci su spremni." : "Upit je sačuvan."}</h2>
        <p>
          Ovo je prototip: upit je sačuvan samo lokalno na vašem uređaju i nije
          poslan prodajnom timu.
        </p>
        <button
          onClick={() => {
            setSent(false);
            onDone?.();
          }}
        >
          {onDone ? "Zatvori" : "Novi upit"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label>
        Ime i prezime
        <input required name="ime" autoFocus={autoFocus} />
      </label>
      <div className="form-row">
        <label>
          Telefon
          <input required name="telefon" type="tel" />
        </label>
        <label>
          E-mail
          <input required name="email" type="email" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Grad
          <input name="grad" defaultValue="Banja Luka" />
        </label>
        {prefill?.area && (
          <label>
            Površina prostorije
            <input name="povrsina" value={prefill.area} readOnly />
          </label>
        )}
      </div>
      {prefill?.product && (
        <label>
          Odabrani proizvod
          <input name="proizvod" value={prefill.product} readOnly />
        </label>
      )}
      {prefill?.quantity && (
        <label>
          Potrebna količina
          <input name="kolicina" value={prefill.quantity} readOnly />
        </label>
      )}
      <label>
        Poruka
        <textarea
          name="poruka"
          rows={3}
          placeholder={
            isQuote
              ? "Napomena uz upit (opciono)"
              : "Kako vam možemo pomoći?"
          }
        />
      </label>
      <fieldset>
        <legend>Preferirani način kontakta</legend>
        {["Telefon", "Viber", "E-mail"].map((x) => (
          <label key={x}>
            <input
              type="radio"
              name="kontakt"
              value={x}
              defaultChecked={x === "Telefon"}
            />
            {x}
          </label>
        ))}
      </fieldset>
      <label className="consent">
        <input required type="checkbox" name="privatnost" />
        Saglasan/na sam da MT PONOS koristi ove podatke isključivo radi odgovora
        na upit.
      </label>
      <button type="submit">
        {isQuote ? "Sačuvaj demo upit" : "Pošaljite upit"} <ArrowRight size={17} />
      </button>
    </form>
  );
}

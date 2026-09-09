"use client";
import { CheckCircle2 } from "lucide-react";
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

  /* Sazetak onoga sto se trazi. Ranije su proizvod, povrsina i kolicina bili
     tri read-only polja — tri prazna okvira koja se ne popunjavaju i samo
     produzuju formu. Sada stoje kao jedan red teksta, a u formu idu skriveni,
     pa se u upitu i dalje salju. */
  const sazetak = [prefill?.product, prefill?.area, prefill?.quantity].filter(
    Boolean,
  );

  return (
    <form className="upit-forma" onSubmit={submit}>
      {sazetak.length > 0 && (
        <p className="upit-sazetak">
          {sazetak.map((x, i) => (
            <span key={i}>{x}</span>
          ))}
        </p>
      )}
      {prefill?.product && (
        <input type="hidden" name="proizvod" value={prefill.product} />
      )}
      {prefill?.area && (
        <input type="hidden" name="povrsina" value={prefill.area} />
      )}
      {prefill?.quantity && (
        <input type="hidden" name="kolicina" value={prefill.quantity} />
      )}

      <label>
        Ime i prezime
        <input required name="ime" autoFocus={autoFocus} />
      </label>
      <label>
        Telefon
        <input required name="telefon" type="tel" />
      </label>
      <label>
        E-mail
        <input required name="email" type="email" />
      </label>
      <label>
        Poruka
        <textarea
          name="poruka"
          rows={3}
          placeholder={
            isQuote ? "Napomena uz upit (opciono)" : "Kako vam možemo pomoći?"
          }
        />
      </label>
      <label className="consent">
        <input required type="checkbox" name="privatnost" />
        Saglasan/na sam da MT PONOS koristi ove podatke isključivo radi odgovora
        na upit.
      </label>
      <button type="submit" className="oval-dugme">
        <span>{isQuote ? "Sačuvaj demo upit" : "Pošaljite upit"}</span>
      </button>
    </form>
  );
}

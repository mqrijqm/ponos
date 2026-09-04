"use client";
import { useState } from "react";
import { CheckCircle2, MapPin, Phone } from "lucide-react";
import { Footer, Header, PageHero } from "@/components/SiteChrome";
export default function Page() {
  const [sent, setSent] = useState(false);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    localStorage.setItem(
      `mtponos-kontakt-${Date.now()}`,
      JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    );
    setSent(true);
  }
  return (
    <>
      <Header />
      <main>
        <PageHero
          kicker="BANJA LUKA"
          title="Razgovarajmo o vašem prostoru."
          copy="Provjerite dostupnost, zatražite cijenu ili donesite mjere u jednu od dvije poslovnice."
        />
        <section className="contact-page">
          <div className="location-cards">
            <article>
              <MapPin />
              <small>Sjedište · veleprodaja · maloprodaja</small>
              <h2>Put srpskih branilaca 47</h2>
              <p>Derviši, 78000 Banja Luka</p>
              <a href="tel:+38751386380">
                <Phone size={15} /> +387 51 386 380
              </a>
              <a href="tel:+38751386386">
                <Phone size={15} /> +387 51 386 386
              </a>
            </article>
            <article>
              <MapPin />
              <small>Poslovnica Lazarevo · maloprodaja</small>
              <h2>Branka Popovića 41</h2>
              <p>78000 Banja Luka</p>
              <a href="tel:+38751370330">
                <Phone size={15} /> +387 51 370 330
              </a>
            </article>
            <div className="hours">
              <b>Radno vrijeme</b>
              <span>Ponedjeljak–petak: 08:00–19:00</span>
              <span>Subota: 08:00–16:00</span>
              <span>Nedjelja: zatvoreno</span>
            </div>
          </div>
          <div id="upit" className="contact-form">
            {sent ? (
              <div className="success-inline">
                <CheckCircle2 />
                <h2>Upit je sačuvan.</h2>
                <p>
                  Ovo je prototip — podaci su sačuvani samo na ovom uređaju i
                  nisu poslani kompaniji.
                </p>
                <button onClick={() => setSent(false)}>Novi upit</button>
              </div>
            ) : (
              <>
                <span className="eyebrow">UPIT ZA PONUDU</span>
                <h2>Pošaljite nam osnovne informacije.</h2>
                <form onSubmit={submit}>
                  <label>
                    Ime i prezime
                    <input required name="ime" />
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
                  <label>
                    Proizvod ili šifra
                    <input
                      name="proizvod"
                      defaultValue={
                        typeof window !== "undefined"
                          ? (new URLSearchParams(window.location.search).get(
                              "proizvod",
                            ) ?? "")
                          : ""
                      }
                    />
                  </label>
                  <label>
                    Površina prostora
                    <input name="povrsina" placeholder="npr. 28 m²" />
                  </label>
                  <label>
                    Poruka
                    <textarea name="poruka" rows={5} />
                  </label>
                  <label className="consent">
                    <input type="checkbox" required />
                    Saglasan/na sam da se podaci koriste radi odgovora na upit.
                  </label>
                  <button type="submit">Sačuvaj demo upit</button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import { MapPin, Phone } from "lucide-react";
import { Footer, Header, PageHero } from "@/components/SiteChrome";
import QuoteForm from "@/components/QuoteForm";
export default function Page() {
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
            <span className="eyebrow">UPIT</span>
            <h2>Pošaljite nam osnovne informacije.</h2>
            <QuoteForm context="inquiry" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Layers3,
  MapPin,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Product, products } from "@/data/products";
import { track } from "@/lib/analytics";
import { Footer } from "./SiteChrome";

const heroDetails = [1, 2, 3, 4, 5].map(
  (number) => `/images/hero/detail-${number}.jpg`,
);
const heroDetailAlts = [
  "Krupni plan teksture prirodnog hrasta",
  "Detalj spoja laminatnih panela",
  "Profil višeslojne podne obloge",
  "Mat završna obrada drvenog poda",
  "Uzorci podnih obloga u različitim nijansama drveta",
];

function HeroDetail({ slot, className = "" }: { slot: number; className?: string }) {
  const [imageIndex, setImageIndex] = useState(slot);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    const rotate = () => {
      timer = setTimeout(() => {
        setImageIndex((current) => {
          const offset = 1 + Math.floor(Math.random() * (heroDetails.length - 1));
          return (current + offset) % heroDetails.length;
        });
        rotate();
      }, 2600 + slot * 470 + Math.random() * 1300);
    };
    rotate();
    return () => clearTimeout(timer);
  }, [slot]);

  return (
    <div className={`detail-tile ${className}`.trim()}>
      <AnimatePresence initial={false}>
        <motion.div
          key={imageIndex}
          className="detail-tile-frame"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <Image
            src={heroDetails[imageIndex]}
            alt={heroDetailAlts[imageIndex]}
            fill
            sizes="(max-width: 767px) 132px, 12vw"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function SitePage() {
  const [menu, setMenu] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const [quote, setQuote] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selected, setSelected] = useState<Product>(products[0]);
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(4);
  const [extra, setExtra] = useState(0);
  const [waste, setWaste] = useState(10);
  const calc = useMemo(() => {
    const area = Math.max(0, length * width + extra),
      total = area * (1 + waste / 100),
      packages = Math.ceil(total / selected.packageCoverage);
    return {
      area,
      total,
      packages,
      value: packages * selected.packageCoverage * selected.price,
    };
  }, [length, width, extra, waste, selected]);
  useEffect(() => {
    if (quote) {
      document.body.style.overflow = "hidden";
      track("quote_started");
    } else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [quote]);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeaderVisible(!entry.isIntersecting);
        if (entry.isIntersecting) setMenu(false);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  function openQuote(p = selected) {
    setSelected(p);
    setSuccess(false);
    setQuote(true);
  }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    localStorage.setItem(
      `mtponos-upit-${Date.now()}`,
      JSON.stringify({
        ...data,
        product: selected.code,
        area: calc.total,
        packages: calc.packages,
        requestId: `MTP-${Date.now().toString(36).toUpperCase()}`,
      }),
    );
    track("quote_submitted");
    setSuccess(true);
  }
  return (
    <>
      <header
        className={`home-sticky-header${headerVisible ? " is-visible" : ""}`}
        aria-hidden={!headerVisible}
        inert={!headerVisible ? true : undefined}
      >
        <a
          className="brand brand-image"
          href="#top"
          aria-label="MT PONOS — početna"
        >
          <Image
            src="/logo-ponos.svg"
            alt="MT PONOS — podne obloge"
            width={300}
            height={83}
            priority
          />
        </a>
        <nav>
          {[
            ["Naslovna", "/"],
            ["Podovi", "/proizvodi"],
            ["Vizualizator", "/vizualizator"],
            ["O nama", "/o-nama"],
            ["Savjeti", "/savjeti"],
            ["Kontakt", "/kontakt"],
          ].map(([label, href]) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a
          className="phone"
          href="tel:+38751386386"
          onClick={() => track("phone_clicked")}
        >
          <Phone size={16} /> +387 51 386 386
        </a>
        <button className="header-cta" onClick={() => openQuote()}>
          Zatraži ponudu
        </button>
        <button
          className="menu"
          aria-label="Otvori meni"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
        {menu && (
          <div className="mobile-nav">
            {[
              ["Naslovna", "/"],
              ["Podovi", "/proizvodi"],
              ["Vizualizator", "/vizualizator"],
              ["O nama", "/o-nama"],
              ["Savjeti", "/savjeti"],
              ["Kontakt", "/kontakt"],
            ].map(([label, href]) => (
              <a onClick={() => setMenu(false)} key={label} href={href}>
                {label}
              </a>
            ))}
          </div>
        )}
      </header>
      <main id="top">
        <span id="naslovna" />
        <span id="podovi" />
        <span id="o-nama" />
        <span id="savjeti" />
        <section ref={heroRef} className="home-hero">
          <div className="home-hero-interior">
            <Image
              src="/images/hero/hero-interior.jpg"
              alt="Savremeni svijetli dnevni boravak sa prirodnim drvenim podom"
              fill
              priority
              sizes="100vw"
            />
            <a className="home-hero-logo" href="#top" aria-label="MT PONOS — početna">
              <Image
                src="/logo-ponos.svg?hero=svgg-20260904"
                alt="PONOS — podne obloge"
                width={300}
                height={83}
                priority
                unoptimized
              />
            </a>
            <div className="home-hero-copy">
              <strong>KOLEKCIJA PODOVA</strong>
              <b>laminati • parketi • vinil</b>
              <p>Materijali birani za dugotrajne, skladne i tople prostore.</p>
            </div>
            <span className="home-hero-year">2026</span>
          </div>
          <div className="home-hero-panel">
            <div className="detail-strip">
              <div className="detail-group detail-group-left">
                <HeroDetail slot={0} />
                <HeroDetail slot={1} />
              </div>
              <HeroDetail slot={2} className="detail-single" />
              <div className="detail-group detail-group-right">
                <HeroDetail slot={3} />
                <HeroDetail slot={4} />
              </div>
            </div>
            <h1 className="home-hero-title"><span>PONOS</span><b>PROSTORA</b></h1>
          </div>
        </section>
        <section id="kalkulator" className="calculator-section">
          <div>
            <span className="eyebrow">PRECIZNIJI UPIT</span>
            <h2>Koliko poda vam je potrebno?</h2>
            <p>
              Unesite dimenzije prostorije. Računamo rezervu, broj cijelih
              paketa i informativnu vrijednost materijala za trenutno odabrani
              pod.
            </p>
            <div className="calc-product">
              <Image
                src={selected.texture}
                alt="Tekstura poda u kalkulatoru"
                width={120}
                height={120}
              />
              <span>
                <small>{selected.manufacturer}</small>
                <b>{selected.name}</b>
                <em>
                  {selected.code} · {selected.packageCoverage} m²/paket
                </em>
              </span>
            </div>
          </div>
          <div className="calculator">
            <div className="calc-inputs">
              <label>
                Dužina prostorije (m)
                <input
                  min="0"
                  step="0.1"
                  type="number"
                  value={length}
                  onChange={(e) => setLength(+e.target.value)}
                />
              </label>
              <label>
                Širina prostorije (m)
                <input
                  min="0"
                  step="0.1"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(+e.target.value)}
                />
              </label>
              <label>
                Dodatna površina (m²)
                <input
                  min="0"
                  step="0.1"
                  type="number"
                  value={extra}
                  onChange={(e) => setExtra(+e.target.value)}
                />
              </label>
              <fieldset>
                <legend>Otpad / rezerva</legend>
                {[5, 10, 15].map((n) => (
                  <label key={n}>
                    <input
                      type="radio"
                      name="waste"
                      checked={waste === n}
                      onChange={() => setWaste(n)}
                    />
                    {n}%
                  </label>
                ))}
              </fieldset>
            </div>
            <div className="calc-results">
              <span>
                Površina prostorije <b>{calc.area.toFixed(2)} m²</b>
              </span>
              <span>
                Potrebno sa rezervom <b>{calc.total.toFixed(2)} m²</b>
              </span>
              <span>
                Broj paketa <b>{calc.packages}</b>
              </span>
              <span>
                Informativna vrijednost <b>{calc.value.toFixed(2)} KM</b>
              </span>
            </div>
            <p>
              Proračun je informativnog karaktera. Konačnu količinu potrebno je
              potvrditi prije narudžbe.
            </p>
            <button
              onClick={() => {
                track("calculator_completed");
                openQuote();
              }}
            >
              Zatraži ponudu sa proračunom <ArrowRight size={17} />
            </button>
          </div>
        </section>
        <section className="benefits">
          <div>
            <span className="eyebrow">OD IDEJE DO ODLUKE</span>
            <h2>
              Lakši izbor. <em>Sigurnija odluka.</em>
            </h2>
          </div>
          <div className="benefit-grid">
            {[
              [Layers3, "Uporedite vrste, boje i dekore"],
              [ShieldCheck, "Dobijte stručnu preporuku"],
              [Calculator, "Izračunajte potrebnu količinu"],
              [Send, "Pošaljite kompletan upit prodajnom timu"],
            ].map(([Icon, t], i) => {
              const C = Icon as typeof Layers3;
              return (
                <article key={String(t)}>
                  <span>0{i + 1}</span>
                  <C />
                  <h3>{String(t)}</h3>
                </article>
              );
            })}
          </div>
        </section>
        <section className="how">
          <div>
            <span className="eyebrow">KAKO FUNKCIONIŠE</span>
            <h2>Tri jednostavna koraka</h2>
          </div>
          {[
            [
              "01",
              "Izmjerite prostor",
              "Izmjerite dužinu i širinu prostorije za informativni proračun.",
            ],
            [
              "02",
              "Uporedite artikle",
              "Pregledajte dekore, kolekcije i tehničke karakteristike.",
            ],
            [
              "03",
              "Zatražite ponudu",
              "Pošaljite izabrani proizvod i potrebnu količinu našem prodajnom timu.",
            ],
          ].map((x) => (
            <article key={x[0]}>
              <b>{x[0]}</b>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
            </article>
          ))}
        </section>
        <section className="trust">
          <ShieldCheck />
          <h2>Podovi se biraju za godine koje dolaze.</h2>
          <div>
            {[
              "Više od 20 godina iskustva",
              "Veleprodaja i maloprodaja",
              "Proizvodi dostupni na lageru",
              "Stručno savjetovanje pri izboru",
            ].map((x) => (
              <span key={x}>
                <CheckCircle2 size={18} />
                {x}
              </span>
            ))}
          </div>
        </section>
        <section id="kontakt" className="contact">
          <div>
            <span className="eyebrow">KONTAKT I LOKACIJE</span>
            <h2>Posjetite nas u Banjoj Luci.</h2>
            <p>
              Za provjeru dostupnosti, savjet pri izboru ili ponudu — javite nam
              se ili donesite mjere u jednu od naših poslovnica.
            </p>
            <a href="mailto:info@mtponos.com">info@mtponos.com</a>
            <div className="contact-actions">
              <a href="tel:+38751386386" onClick={() => track("phone_clicked")}>
                <Phone size={17} /> Pozovite nas
              </a>
              <button onClick={() => openQuote()}>
                <Send size={17} /> Pošaljite upit
              </button>
            </div>
          </div>
          <div className="locations">
            <article>
              <MapPin />
              <div>
                <small>Sjedište, veleprodaja i maloprodaja</small>
                <h3>Put srpskih branilaca 47</h3>
                <p>
                  Derviši, Banja Luka
                  <br />
                  +387 51 386 380
                  <br />
                  +387 51 386 386
                </p>
                <a
                  target="_blank"
                  href="https://maps.google.com/?q=Put+srpskih+branilaca+47+Banja+Luka"
                  onClick={() => track("location_clicked")}
                >
                  Otvori lokaciju <ArrowRight size={15} />
                </a>
              </div>
            </article>
            <article>
              <MapPin />
              <div>
                <small>Poslovnica Lazarevo</small>
                <h3>Branka Popovića 41</h3>
                <p>
                  Banja Luka
                  <br />
                  +387 51 370 330
                </p>
                <a
                  target="_blank"
                  href="https://maps.google.com/?q=Branka+Popovica+41+Banja+Luka"
                  onClick={() => track("location_clicked")}
                >
                  Otvori lokaciju <ArrowRight size={15} />
                </a>
              </div>
            </article>
            <div className="hours">
              <b>Radno vrijeme</b>
              <span>Ponedjeljak–petak: 08:00–19:00</span>
              <span>Subota: 08:00–16:00</span>
              <span>Nedjelja: zatvoreno</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AnimatePresence>
        {quote && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && setQuote(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quote-title"
              className="quote-modal"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
            >
              <button
                className="modal-close"
                aria-label="Zatvori upit"
                onClick={() => setQuote(false)}
              >
                <X />
              </button>
              {success ? (
                <div className="success">
                  <CheckCircle2 />
                  <span>UPIT JE SAČUVAN</span>
                  <h2>Hvala — podaci su spremni.</h2>
                  <p>
                    Ovo je prototip: upit je sačuvan samo lokalno na vašem
                    uređaju i nije poslan prodajnom timu.
                  </p>
                  <button onClick={() => setQuote(false)}>Zatvori</button>
                </div>
              ) : (
                <>
                  <span className="eyebrow">PERSONALIZOVANA PONUDA</span>
                  <h2 id="quote-title">Recite nam šta vam je potrebno.</h2>
                  <p>
                    Podaci se u ovoj demo verziji čuvaju samo lokalno. Nema
                    slanja e-maila bez povezanog backend sistema.
                  </p>
                  <form onSubmit={submit}>
                    <label>
                      Ime i prezime
                      <input required name="ime" autoFocus />
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
                      <label>
                        Površina prostorije
                        <input
                          name="povrsina"
                          value={`${calc.total.toFixed(2)} m²`}
                          readOnly
                        />
                      </label>
                    </div>
                    <label>
                      Odabrani proizvod
                      <input
                        name="proizvod"
                        value={`${selected.name} (${selected.code})`}
                        readOnly
                      />
                    </label>
                    <label>
                      Potrebna količina
                      <input
                        name="kolicina"
                        value={`${calc.packages} paketa / ${(calc.packages * selected.packageCoverage).toFixed(2)} m²`}
                        readOnly
                      />
                    </label>
                    <label>
                      Poruka
                      <textarea name="poruka" rows={3} />
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
                      Saglasan/na sam da MT PONOS koristi ove podatke isključivo
                      radi odgovora na upit.
                    </label>
                    <button type="submit">
                      Sačuvaj demo upit <ArrowRight size={17} />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

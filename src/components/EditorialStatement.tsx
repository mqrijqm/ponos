"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion, MotionValue } from "framer-motion";

/**
 * Full-bleed editorial traka. Tekst pocinje jedva vidljiv i otkriva se
 * rijec po rijec dok sekcija prolazi kroz viewport — ne kao jedan fade,
 * nego kao val koji ide slijeva nadesno.
 *
 * Raspon svake rijeci se preklapa sa susjednim (FAKTOR), pa nema
 * stepenastog utiska. Uz prefers-reduced-motion tekst je odmah pun.
 */
const PRIJE = "MT PONOS iz Banje Luke specijalizovan je za veleprodaju i maloprodaju,";
const ISTAKNUTO = "dostavu i ugradnju";
const POSLIJE = "laminata, parketa, vinila i deckinga.";

const PALE = 0.18;
const FAKTOR = 2.4;
/* Otkrivanje se zavrsi prije kraja pinovanja, pa pun tekst ostane
   nekoliko stotina piksela scrolla na ekranu prije nego sekcija ode. */
const KRAJ_OTKRIVANJA = 0.72;

type Rijec = { tekst: string; istaknuta: boolean };

const rijeci: Rijec[] = [
  ...PRIJE.split(" ").map((t) => ({ tekst: t, istaknuta: false })),
  ...ISTAKNUTO.split(" ").map((t) => ({ tekst: t, istaknuta: true })),
  ...POSLIJE.split(" ").map((t) => ({ tekst: t, istaknuta: false })),
];

function Rijec({
  rijec,
  progress,
  pocetak,
  kraj,
  mirno,
}: {
  rijec: Rijec;
  progress: MotionValue<number>;
  pocetak: number;
  kraj: number;
  mirno: boolean;
}) {
  const opacity = useTransform(progress, [pocetak, kraj], [PALE, 1]);
  return (
    <>
      <motion.span
        className={rijec.istaknuta ? "es-word es-word-accent" : "es-word"}
        style={mirno ? undefined : { opacity }}
      >
        {rijec.tekst}
      </motion.span>
      {/* pravi razmak van spana — inline element se lomi samo na razmaku */}
      {" "}
    </>
  );
}

export default function EditorialStatement() {
  const ref = useRef<HTMLElement>(null);
  const mirno = useReducedMotion() ?? false;

  /* Sekcija je visoka nekoliko ekrana, a sadrzaj u njoj je sticky.
     Dok se prolazi kroz tu visinu slika stoji na mjestu — to je
     "stani pa listaj". Scroll se ne otima, samo mu se da razdaljina.

     Napredak se mjeri iz zive pozicije sekcije na svaki frame, a ne
     kroz useScroll — sekcije iznad mijenjaju visinu dok se slike
     ucitavaju, pa bi jednom izmjerene pozicije bile pogresne. */
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const izmjeri = () => {
      const r = el.getBoundingClientRect();
      const put = r.height - window.innerHeight;
      scrollYProgress.set(put <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / put)));
    };
    const naScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(izmjeri);
    };
    izmjeri();
    window.addEventListener("scroll", naScroll, { passive: true });
    window.addEventListener("resize", naScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", naScroll);
      window.removeEventListener("resize", naScroll);
    };
  }, [scrollYProgress]);

  const korak = KRAJ_OTKRIVANJA / rijeci.length;

  return (
    <section ref={ref} className="editorial-statement is-fullbleed" aria-label="O kompaniji">
      <div className="es-pin">
        <p className="es-text">
          {rijeci.map((r, i) => (
            <Rijec
              key={`${r.tekst}-${i}`}
              rijec={r}
              progress={scrollYProgress}
              pocetak={i * korak}
              kraj={Math.min(KRAJ_OTKRIVANJA, i * korak + korak * FAKTOR)}
              mirno={mirno}
            />
          ))}
        </p>
      </div>
    </section>
  );
}

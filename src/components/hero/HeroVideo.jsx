"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "./hooks";

/**
 * HERO: snimak preko cijelog prvog ekrana, u petlji.
 *
 * Tok je ovakav:
 *
 *   sekcija ulazi u kadar  → postavlja se izvor i krece skidanje (lazy)
 *   snimak stigne          → pojavljuje se preko postera i vrti se u petlji
 *   scroll dalje od heroja → snimak se pauzira, ne trosi ni struju ni CPU
 *   scroll nazad           → nastavlja odakle je stao
 *   snimak pukne           → ostaje statična slika
 *
 * Vidljivost mjeri IntersectionObserver, ne slusac scrolla: browser ga racuna
 * sam, van glavne nitke, pa ne kuca na svaki piksel scrolla.
 *
 * Sadrzaj preko kadra (natpisi, dugme) ide kao `children`.
 */

/**
 * Prag na kojem se prelazi na laksi snimak — isto sto i `innerWidth < 768`,
 * samo kroz `matchMedia`, koji ne mjeri sirinu na svakom citanju.
 */
const UZAK_EKRAN = "(max-width: 767px)";

/** Koliko prije ulaska u kadar snimak krece da se skida. */
const RANO = "200px";

/** Koliko sekcije mora biti vidljivo da bi snimak isao. */
const DOSTA_VIDLJIVO = 0.1;

export default function HeroVideo({
  /* MP4 izvori — obavezni, jedini koje svaki browser sigurno cita. */
  srcDesktop,
  srcMobile,
  /* WebM izvori — opcioni; koriste se samo ako ih browser ume dekodirati. */
  webmDesktop = null,
  webmMobile = null,
  /* Slika koja stoji dok snimak ne stigne. */
  poster,
  /* Slika koja ostaje ako snimak pukne; po pravilu ista kao poster. */
  fallbackImage = poster,
  /** Opis kadra za citace ekrana. */
  label = "",
  children,
}) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  /* Snimak ima prvi kadar — tek tada se pojavljuje preko postera. */
  const [spreman, setSpreman] = useState(false);
  /* Skidanje je puklo: ostaje statična slika. */
  const [greska, setGreska] = useState(false);

  /* ── izvor i lazy skidanje ────────────────────────────────── */

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    /*
      Izvor se bira ovdje, a ne kroz <source> u markupu: da fajlovi stoje u
      HTML-u, browser bi krenuo da skida prvi na koji naiđe jos prije nego sto
      bi ijedan JS stigao da izabere — pa bi laksi snimak bio drugo skidanje,
      a ne jedino.
    */
    const uzak = window.matchMedia(UZAK_EKRAN).matches;
    const webm = uzak ? webmMobile : webmDesktop;
    const mp4 = uzak ? srcMobile : srcDesktop;

    /* WebM samo ako ga browser zaista dekodira — Safari do 14 ne. */
    const umijeWebm =
      Boolean(webm) && video.canPlayType('video/webm; codecs="vp9"') !== "";
    const zeljeni = umijeWebm ? webm : mp4;
    if (!zeljeni) return;

    /*
      Telefon je cesto na mobilnoj vezi, pa unaprijed skida samo zaglavlje;
      ostatak krece kad pustanje pocne. Desktop skida odmah, da kadar krene
      bez cekanja.
    */
    video.preload = uzak ? "metadata" : "auto";

    /*
      Sirina se mjeri jednom, pri prvom skidanju. Da se izvor mijenja i na
      kasnije promjene sirine (rotacija telefona, razvlacenje prozora), isti
      kadar bi se skinuo dva puta i vratio se na pocetak.
    */
    const skini = () => {
      if (video.getAttribute("src") === zeljeni) return;
      video.src = zeljeni;
      video.load();
    };

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting) return;
        /* Skida se jednom; dalju vidljivost prati drugi posmatrac ispod. */
        obs.disconnect();
        skini();
      },
      { rootMargin: RANO },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [srcDesktop, srcMobile, webmDesktop, webmMobile]);

  /* ── pustanje i pauza po vidljivosti ──────────────────────── */

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    /* Iskljucene animacije: kadar stoji na prvom frejmu, bez petlje. */
    if (reducedMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          /*
            Odbijeno pustanje nije greska: iOS u stednji struje odbija i nijemi
            autoplay. Tada ostaje poster, a dodir po kadru (ispod) snimak
            pusta — gest korisnika Safari uvijek postuje.
          */
          video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: DOSTA_VIDLJIVO },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [reducedMotion]);

  /* ── spremnost, greska, dodir ─────────────────────────────── */

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!video) return;

    const naSpreman = () => setSpreman(true);
    /*
      Samo tvrda greska gasi snimak. Spora veza se ne racuna ovdje — dok se
      snimak puni, poster ionako stoji na njegovom mjestu, pa nema sta da se
      mijenja; a rok bi ubio snimak koji bi za sekundu ipak stigao.
    */
    const naGresku = () => setGreska(true);
    const naDodir = () => {
      if (video.paused && !reducedMotion) video.play().catch(() => {});
    };

    /* Ako je prvi kadar stigao prije nego sto se slusac zakacio. */
    if (video.readyState >= 2) setSpreman(true);

    video.addEventListener("loadeddata", naSpreman);
    video.addEventListener("error", naGresku);
    section?.addEventListener("pointerdown", naDodir, { passive: true });

    return () => {
      video.removeEventListener("loadeddata", naSpreman);
      video.removeEventListener("error", naGresku);
      section?.removeEventListener("pointerdown", naDodir);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      /* `.is-fullbleed` vadi sekciju iz bocnog paddinga stranice. */
      className="hero-sequence is-fullbleed relative w-full"
      aria-label={label}
    >
      {/*
        `h-svh`, ne `h-screen`: na telefonu je 100vh visi od onoga sto se vidi,
        pa bi dno kadra zavrsilo ispod trake browsera.
      */}
      <div className="relative h-svh w-full overflow-hidden bg-[var(--cream,#f3efe9)]">
        {/*
          Poster stoji od prvog frejma HTML-a — `priority` ga skida uporedo sa
          stranicom, pa prvi ekran nikad nije prazan. Snimak se pojavljuje
          preko njega, tako da nema treptaja pri zamjeni.
        */}
        {poster && (
          <Image
            src={poster}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        {/* Snimak je otpao: ostaje slika, sa opisom za citace ekrana. */}
        {greska && fallbackImage && (
          <Image
            src={fallbackImage}
            alt={label}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}

        {/*
          muted + playsInline idu zajedno: bez njih mobilni browseri odbiju da
          pokrenu snimak. Bez `src` u markupu — postavlja ga efekat iznad, po
          sirini ekrana, kad sekcija uđe u kadar.
        */}
        {!greska && (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
              spreman ? "opacity-100" : "opacity-0"
            }`}
            poster={poster}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* Sadrzaj preko kadra; sloj ne hvata misa osim gdje sam vrati. */}
        {children && (
          <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

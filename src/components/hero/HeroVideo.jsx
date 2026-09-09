"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { usePrefersReducedMotion } from "./hooks";

gsap.registerPlugin(ScrollTrigger);

/**
 * HERO: snimak koji se ne pusta sam — pomjera ga scroll.
 *
 * Tok je ovakav:
 *
 *   sekcija ulazi u kadar  → postavlja se izvor i krece skidanje (lazy)
 *   scroll nadolje         → daske se dizu, kadar prati poziciju scrolla
 *   scroll nagore          → isto unatrag, do prvog frejma
 *   scroll dalje od heroja → nista se ne racuna
 *   snimak pukne           → ostaje statična slika
 *
 * Stranica se ne zakljucava: sekcija je visoka dva ekrana, kadar u njoj je
 * sticky, i taj drugi ekran scrolla je razdaljina kroz koju snimak prolazi.
 *
 * Snimak stoji pauziran cijelo vrijeme — kadar se mijenja samo pomjeranjem
 * `currentTime`. Zato je fajl kodiran sa keyframeom svakih 6 frejmova: na
 * obicnom snimku (keyframe svakih 250) svaki skok bi trazio dekodiranje
 * desetak sekundi unatrag i scroll bi trzao.
 */

/**
 * Prag na kojem se prelazi na laksi snimak — isto sto i `innerWidth < 768`,
 * samo kroz `matchMedia`, koji ne mjeri sirinu na svakom citanju.
 */
const UZAK_EKRAN = "(max-width: 767px)";

/** Koliko prije ulaska u kadar snimak krece da se skida. */
const RANO = "200px";

/**
 * Koliko ekrana scrolla odmota cijeli snimak. Manji broj = brzi snimak:
 * jedan ekran je dvostruko brze od dva, koliko bi bio mirniji raspored.
 */
const EKRANA_SCROLLA = 1;

/**
 * Koliko kadar sustize scroll. Lenis vec zaglađuje sam scroll, ovo samo
 * skrati skokove pri naglom trzaju tocka.
 */
const SUSTIZANJE = 0.18;

/** Manje od pola frejma razlike se ne trazi — skok se ne bi ni vidio. */
const NAJMANJI_SKOK = 1 / 48;

/**
 * Visina bijelog prelaza na dnu kadra. Sekcija ispod je krem (`--cream`), pa
 * prelaz ide u istu boju — do bijele bi na spoju ostala vidljiva linija.
 */
const PRELAZ = "clamp(140px, 26svh, 300px)";

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
      Skakanje po snimku ne moze nad samim zaglavljem: da bi se kadar pomjerao,
      fajl mora biti tu. Telefon zato dobija laksi fajl, ali ga skida cijelog.
    */
    video.preload = "auto";

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
        obs.disconnect();
        skini();
      },
      { rootMargin: RANO },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [srcDesktop, srcMobile, webmDesktop, webmMobile]);

  /* ── scroll pomjera kadar ─────────────────────────────────── */

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    /* Iskljucene animacije: kadar stoji na prvom frejmu, scroll ga ne dira. */
    if (reducedMotion) return;

    /* Gdje kadar treba da bude i gdje je stvarno — sustize ga po frejmu. */
    let cilj = 0;
    let gdje = 0;
    let raf = 0;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      /* Prvi ekran sekcije je sam kadar; scroll kroz ostatak vrti snimak. */
      end: () => `+=${window.innerHeight * EKRANA_SCROLLA}`,
      /* Bez ovoga bi promjena visine prozora ostavila stari raspon. */
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const trajanje = video.duration;
        if (trajanje) cilj = self.progress * trajanje;
      },
    });

    const kadar = () => {
      raf = requestAnimationFrame(kadar);
      if (!video.duration) return;

      gdje += (cilj - gdje) * SUSTIZANJE;
      /* Na kraju sustizanja se sjeda tacno na cilj, da ne ostane zujanje. */
      if (Math.abs(cilj - gdje) < 0.002) gdje = cilj;

      if (Math.abs(video.currentTime - gdje) < NAJMANJI_SKOK) return;
      /*
        `fastSeek` sjeda na najblizi keyframe umjesto da dekodira do tacne
        sekunde — a keyframe je svakih 0.25s, pa se razlika ne vidi. Chrome ga
        nema, tamo ide obicno postavljanje.
      */
      if (typeof video.fastSeek === "function") video.fastSeek(gdje);
      else video.currentTime = gdje;
    };
    raf = requestAnimationFrame(kadar);

    return () => {
      cancelAnimationFrame(raf);
      trigger.kill();
    };
  }, [reducedMotion]);

  /* ── spremnost, greska, prvi kadar ────────────────────────── */

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!video) return;

    /*
      Snimak se nikad ne pusta, ali mobilni Safari ne nacrta ni jedan kadar
      dok se pustanje jednom ne zatrazi — ostao bi prazan okvir preko postera.
      Zato se pusti i odmah pauzira: to natjera dekoder da izbaci prvi kadar.
      Ako pustanje bude odbijeno, isto radi prvi dodir po sekciji.
    */
    const probudi = () => {
      video
        .play()
        .then(() => video.pause())
        .catch(() => {});
    };

    const naSpreman = () => {
      setSpreman(true);
      probudi();
    };
    /*
      Samo tvrda greska gasi snimak. Spora veza se ne racuna ovdje — dok se
      snimak puni, poster ionako stoji na njegovom mjestu, pa nema sta da se
      mijenja; a rok bi ubio snimak koji bi za sekundu ipak stigao.
    */
    const naGresku = () => setGreska(true);

    if (video.readyState >= 2) naSpreman();

    video.addEventListener("loadeddata", naSpreman);
    video.addEventListener("error", naGresku);
    section?.addEventListener("pointerdown", probudi, { passive: true });

    return () => {
      video.removeEventListener("loadeddata", naSpreman);
      video.removeEventListener("error", naGresku);
      section?.removeEventListener("pointerdown", probudi);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      /* `.is-fullbleed` vadi sekciju iz bocnog paddinga stranice. */
      className="hero-sequence is-fullbleed relative w-full"
      /*
        Visina sekcije je razdaljina scrolla kroz koju snimak prolazi, plus
        ekran koji kadar zauzima. Bez animacije nema sta da se odmota, pa
        sekcija ostaje na jednom ekranu i ne pravi mrtav scroll.
      */
      style={{
        height: reducedMotion ? "100svh" : `${(1 + EKRANA_SCROLLA) * 100}svh`,
      }}
      aria-label={label}
    >
      {/*
        Kadar stoji dok scroll prolazi kroz visinu sekcije. `h-svh`, ne
        `h-screen`: na telefonu je 100vh visi od onoga sto se vidi, pa bi dno
        kadra zavrsilo ispod trake browsera.
      */}
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-[var(--cream,#f3efe9)]">
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
          dodirnu snimak. Bez `src` u markupu — postavlja ga efekat iznad, po
          sirini ekrana, kad sekcija uđe u kadar. Nema `autoPlay` ni `loop`:
          kadar pomjera scroll, snimak sam nikad ne ide.
        */}
        {!greska && (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
              spreman ? "opacity-100" : "opacity-0"
            }`}
            poster={poster}
            muted
            playsInline
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/*
          Dno kadra se gubi u boju sekcije ispod, pa se prelaz na nju ne vidi
          kao rez. Stoji iznad snimka, ispod natpisa, i ne hvata misa.
        */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: PRELAZ,
            /*
              Tri stanice, ne dvije: linearni prelaz iz prozirnog u punu boju
              daje vidljivu ivicu na pola puta, jer oko ne cita alfu linearno.
            */
            background:
              "linear-gradient(to bottom, rgba(245, 243, 238, 0) 0%, rgba(245, 243, 238, 0.55) 58%, var(--cream, #f5f3ee) 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

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

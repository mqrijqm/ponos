"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { usePrefersReducedMotion } from "./hooks";

/**
 * Natpis preko heroja. Ulazi rijec po rijec: svaka krece zamucena i malo
 * nize, pa se u istom pokretu izostri, spusti na svoje mjesto i postane puna.
 * Poslije nekoliko sekundi izlazi po istom principu, samo obrnuto i brze —
 * rijeci se zamute i podignu navise.
 *
 * Nema naglog pojavljivanja: sve tri stvari (blur, pomjeraj, vidljivost) idu
 * kroz isti prelaz, pa se rijec ne "upali" nego izostri.
 *
 * Sloj ne hvata misa (`pointerEvents: none`) — klik i scroll prolaze kroz
 * njega do snimka i dugmeta ispod.
 */

const TEKST = "Stvaramo prostor koji traje";

/** Malo iznad vertikalne sredine ekrana. */
const OD_VRHA = "44%";

/* Ulaz je mek i razvucen, izlaz krace i sa manjim korakom izmedu rijeci. */
const ULAZ = { duration: 1.05, stagger: 0.14, ease: "power3.out" };
const IZLAZ = { duration: 0.62, stagger: 0.09, ease: "power2.in" };

/** Koliko sekundi pun natpis stoji na ekranu prije izlaza. */
const ZADRZI = 2.6;

/* Koliko rijec putuje i koliko je zamucena na krajevima prelaza. */
const ULAZ_OD = { opacity: 0, y: 18, filter: "blur(10px)" };
const IZLAZ_NA = { opacity: 0, y: -16, filter: "blur(9px)" };

export default function HeroText() {
  const wrapRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const rijeci = wrap.querySelectorAll("[data-rijec]");
    if (!rijeci.length) return;

    /* Bez animacije natpis samo stoji — nema ni ulaza ni izlaza. */
    if (reducedMotion) {
      gsap.set(rijeci, { opacity: 1, y: 0, filter: "none" });
      return;
    }

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(rijeci, ULAZ_OD, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      ...ULAZ,
    }).to(rijeci, { ...IZLAZ_NA, ...IZLAZ }, `+=${ZADRZI}`);

    /*
      Natpis krece kad hero uđe u kadar, a ne pri montiranju: da krene odmah,
      na sporoj vezi bi se odvrtio jos dok se prvi kadar snimka puni. Pri
      povratku na vrh stranice ide iznova.
    */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tl.restart();
        else tl.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(wrap);

    return () => {
      observer.disconnect();
      tl.kill();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        top: OD_VRHA,
        left: 0,
        right: 0,
        /* Sredina natpisa stoji na 44%, ne njegov vrh. */
        transform: "translateY(-50%)",
        padding: "0 24px",
        textAlign: "center",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-comfortaa), var(--font-manrope), sans-serif",
          fontWeight: 500,
          /* Citljiv, ali ne veci od kadra: na uskom ekranu 21px, na sirokom 42. */
          fontSize: "clamp(21px, 2.9vw, 42px)",
          lineHeight: 1.25,
          letterSpacing: "0.005em",
          color: "#8b7e6e",
          /*
            Svijetli halo, ne obris: taupe na svijetlom drvetu daje kontrast
            oko 2.8:1, a slova se gube u godovima i naslonima iza. Halo ih
            odvoji od detalja bez da se vidi kao sjena i bez diranja boje.
          */
          textShadow: "0 1px 20px rgba(255, 253, 250, 0.6)",
        }}
      >
        {TEKST.split(" ").map((rijec, i) => (
          <span key={`${rijec}-${i}`}>
            <span
              data-rijec
              style={{
                display: "inline-block",
                opacity: 0,
                /* Bez ovoga browser prekucava sloj na svakom frejmu blura. */
                willChange: "filter, transform, opacity",
              }}
            >
              {rijec}
            </span>
            {/* Razmak stoji van spana — inline element se lomi samo na njemu. */}
            {i < TEKST.split(" ").length - 1 ? " " : null}
          </span>
        ))}
      </h1>
    </div>
  );
}

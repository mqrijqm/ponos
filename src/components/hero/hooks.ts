"use client";

import { useEffect, useState } from "react";

/**
 * Prati media query, sa SSR-safe pocetnom vrijednoscu.
 *
 * Na serveru nema `matchMedia`, pa prvi render uvijek ide po `initial` — tek
 * poslije montiranja se vrijednost popravi. Zato je siroki raspored ono sto
 * stigne u HTML-u, a uski se ukljuci u browseru.
 */
export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Korisnik je u sistemu iskljucio animacije. */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Uzi ekran - manje dasaka, nizi DPR. */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

/**
 * Prati da li je element u vidnom polju. Vraca dvije stvari:
 * - `inView`  - trenutno stanje, gasi render petlju kad hero ode sa ekrana
 * - `everInView` - da li je ikad bio vidljiv, da se canvas montira tek tada
 *   (lazy load) i da se poslije ne demontira nazad
 */
export function useInView<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  rootMargin = "300px",
) {
  const [inView, setInView] = useState(false);
  const [everInView, setEverInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setEverInView(true);
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return { inView, everInView };
}

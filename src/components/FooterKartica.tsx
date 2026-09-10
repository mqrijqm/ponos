"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Kartica na dnu podnozja — mijenja se sama, u krug.
 *
 * U predlosku ispod kartice stoje tackice, jer je to niz kroz koji se
 * lista. Ovdje se lista sam, na svake cetiri sekunde, a tackice ostaju i
 * rade: ko hoce da preskoci, ne mora da ceka.
 *
 * Slika nije `fill` nego ima svoje mjere: kartica je posljednja stvar na
 * stranici i ne isplati se da ceka na racun visine.
 *
 * Sve su isjecene u kvadrat i na kadar koji nesto kazuje i kad je sirok
 * 76px — puna fotografija bi u toj mjeri pokazala ugao stolice.
 *
 * Svaka nosi `id` pored `slug`-a: dvije kartice vode na istu stranicu
 * (decking i SPC vinyl su jedna grupa), pa slug nije jedinstven i ne
 * moze biti kljuc.
 */
const kartice = [
  {
    id: "decking",
    slug: "spc-vinyl-decking",
    naslov: "Vanjski decking",
    tekst:
      "Daske za terase i dvorišta. Ne trunu i ne cijepaju se — voda, mraz i sunce ih ne diraju.",
    slika: "/images/footer/decking-terasa.webp",
  },
  {
    id: "parket",
    slug: "parketi",
    naslov: "Hrastov parket",
    tekst:
      "Tarkett višeslojni parket, po narudžbi. Gotov pod, spreman za hodanje odmah nakon ugradnje.",
    slika: "/images/footer/parket-kvadrat.webp",
  },
  {
    id: "paneli",
    slug: "zidni-paneli",
    naslov: "Akustični paneli",
    tekst:
      "Zidni paneli sa filcom. Smiruju zvuk u prostoriji i mijenjaju je bez ijednog građevinskog radnika.",
    slika: "/images/footer/paneli-kvadrat.webp",
  },
  {
    id: "laminat",
    slug: "laminati",
    naslov: "Laminat u riblju kost",
    tekst:
      "Krono Original i Kaindl, od 8 do 12 mm. Klasican slog koji se ne mijenja sa modom.",
    slika: "/images/footer/laminat-kvadrat.webp",
  },
  {
    id: "spc",
    slug: "spc-vinyl-decking",
    naslov: "SPC vinyl",
    tekst:
      "Vodootporan pod za kupatilo i kuhinju. Ne buba se, ne ljusti i podnosi paru.",
    slika: "/images/footer/spc-kvadrat.webp",
  },
  {
    id: "lajsne",
    slug: "lajsne",
    naslov: "Podne lajsne",
    tekst:
      "INDO PVC i Profifloor MDF. Zavrsetak poda koji se vidi tek kad fali.",
    slika: "/images/footer/lajsne-kvadrat.webp",
  },
];

export default function FooterKartica() {
  const [i, setI] = useState(0);

  useEffect(() => {
    // Ko je iskljucio kretanje, taj ne dobija ni ovo — ostaje prva kartica.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % kartice.length), 4000);
    return () => clearInterval(t);
  }, []);

  const k = kartice[i];
  return (
    <div className="ft-kartica-red">
      <Link href={`/proizvodi/${k.slug}`} className="ft-kartica">
        <Image src={k.slika} alt="" width={320} height={320} />
        <div>
          <h3>{k.naslov}</h3>
          <p>{k.tekst}</p>
        </div>
      </Link>
      <div className="ft-tackice">
        {kartice.map((x, n) => (
          <button
            key={x.id}
            type="button"
            className={n === i ? "je-tu" : undefined}
            aria-label={x.naslov}
            aria-current={n === i}
            onClick={() => setI(n)}
          />
        ))}
      </div>
    </div>
  );
}

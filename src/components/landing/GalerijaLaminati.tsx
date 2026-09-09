import Image from "next/image";
import Link from "next/link";

/**
 * Dvije slike u paru: enterijer preko skoro cijele sirine i uska traka
 * teksture uz njega. Ispod njih natpis i strelica.
 *
 * Uska traka nije ukras — ona je isti pod izbliza. Enterijer pokazuje kako
 * pod izgleda u prostoru, traka kako izgleda dekor, i to jedno uz drugo bez
 * teksta izmedju.
 *
 * Natpis stoji ispod slike, ne preko nje: enterijer je svijetao i bijeli
 * natpis preko njega trazi zatamnjenje, a zatamnjenje gasi upravo ono sto
 * slika pokazuje.
 */
export default function GalerijaLaminati() {
  return (
    <section className="galerija is-fullbleed" aria-label="Laminati u prostoru">
      <div className="galerija-slike">
        <figure className="galerija-glavna">
          <Image
            src="/images/rooms/living.png"
            alt="Dnevni boravak sa laminatom u hrastovom dekoru"
            fill
            sizes="(max-width: 767px) 78vw, 62vw"
          />
        </figure>
        {/* Traka je odsjecak dekora; sama po sebi ne nosi informaciju, pa je
            za citac ekrana prazna. */}
        <div className="galerija-traka" aria-hidden="true">
          <Image
            src="/images/textures/honey.png"
            alt=""
            fill
            sizes="(max-width: 767px) 22vw, 18vw"
          />
        </div>
      </div>

      <div className="galerija-podnozje">
        <span className="galerija-natpis">LAMINATI</span>
        <Link
          href="/proizvodi/laminati"
          className="galerija-strelica"
          aria-label="Pogledaj laminate"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M2.5 8H13M9 4l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="square"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

import Image from "next/image";

/**
 * Dvije slike u paru: enterijer preko skoro cijele sirine i uska traka
 * teksture uz njega.
 *
 * Uska traka nije ukras — ona je isti pod izbliza. Enterijer pokazuje kako
 * pod izgleda u prostoru, traka kako izgleda dekor, i to jedno uz drugo bez
 * teksta izmedju.
 */
export default function GalerijaLaminati() {
  return (
    <section className="galerija is-fullbleed" aria-label="Laminati u prostoru">
      <figure className="galerija-glavna">
        <Image
          src="/images/rooms/living.png"
          alt="Dnevni boravak sa laminatom u hrastovom dekoru"
          fill
          sizes="(max-width: 767px) 78vw, 62vw"
        />
        <figcaption>LAMINATI</figcaption>
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
    </section>
  );
}

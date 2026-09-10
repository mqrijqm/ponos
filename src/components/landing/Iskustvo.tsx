import Image from "next/image";

import IskustvoKadar from "./IskustvoKadar";

/**
 * Sekcija odmah ispod snimka, prije "Asortimana".
 *
 * Slog je iz predloska (stranica o istoriji muzeja): krupan naslov u tri
 * reda gdje je srednji kurzivan i uvucen, mala slika sa natpisom gore
 * desno, kvadratni kadar na sredini, i na dnu godina osnivanja uz kratak
 * tekst.
 *
 * Prazan prostor je dio sloga, ne previd: sekcija ima tri bloka i mnogo
 * vazduha medju njima — poslije snimka stranica treba da uspori prije nego
 * sto krene da nabraja.
 *
 * Naslov je podijeljen u tri elementa, ne prelomljen sam: srednji red je
 * kurzivan i uvucen, pa mora biti svoj element.
 */
export default function Iskustvo() {
  return (
    <section className="iskustvo is-fullbleed" aria-labelledby="iskustvo-naslov">
      <div className="isk-vrh">
        <h2 id="iskustvo-naslov" className="isk-naslov">
          <span>Četvrt</span>
          <em>vijeka</em>
          <span>pod nogama</span>
        </h2>
        <figure className="isk-slika">
          <Image
            src="/images/hero/hero-interior.jpg"
            alt="Enterijer sa podom iz ponude MT PONOS"
            fill
            sizes="(max-width: 767px) 36vw, 240px"
          />
          <figcaption>Od 2000. do danas</figcaption>
        </figure>
      </div>

      <IskustvoKadar />

      <div className="isk-dno">
        <p className="isk-godina">
          <b>2000</b>
          <span>Osnovani</span>
        </p>
        <div className="isk-tekst">
          <h3>Šta radimo</h3>
          <p>
            Laminat, parket, vinil i decking — veleprodaja, maloprodaja,
            dostava i ugradnja. Izlazimo na teren, uzimamo mjere i pod
            postavljamo sami. Ono što prodamo, to i ugradimo.
          </p>
        </div>
      </div>
    </section>
  );
}

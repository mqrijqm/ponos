import KadarRaste from "./KadarRaste";

/**
 * Predah izmedju sekcije o iskustvu i ponude: jedan kadar iz salona koji
 * raste dok se lista, i pod njim dvije rijeci.
 *
 * Podloga je nijansu tamnija od kreme da se predah vidi kao svoj blok, a
 * ne kao razmak koji je neko zaboravio da popuni.
 *
 * "sa PONOSOM" je jedina igra rijeci na sajtu koja se isplati: ime firme
 * je i rijec koja kaze kako se radi. Zato "sa" ide kurzivom i sitnije —
 * kao dodatak, a naglasak nosi ono drugo.
 */
export default function Predah() {
  return (
    <section className="predah is-fullbleed" aria-labelledby="predah-naslov">
      <KadarRaste
        src="/images/predah-salon.webp"
        alt="Uzorci podnih obloga u salonu MT PONOS"
        klasa="pr-kadar"
      />
      <h2 id="predah-naslov" className="pr-naslov">
        <em>sa</em> <span>Ponosom</span>
      </h2>
    </section>
  );
}

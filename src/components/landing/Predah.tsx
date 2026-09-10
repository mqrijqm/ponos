import Image from "next/image";

/**
 * Predah izmedju sekcije o iskustvu i ponude — jedan kadar preko cijele
 * sirine, na nijansu tamnijoj podlozi.
 *
 * Nema natpisa: sekcija iznad je govorila, sekcija ispod pocinje da
 * nabraja, a ovdje stranica samo pokaze pod i uti. Podloga je tamnija od
 * kreme da se predah vidi kao svoj blok, a ne kao razmak koji je neko
 * zaboravio da popuni.
 */
export default function Predah() {
  return (
    <section className="predah is-fullbleed" aria-label="Pod u prostoru">
      <Image
        src="/images/predah-dnevni.webp"
        alt="Dnevni boravak sa hrastovim podom iz ponude MT PONOS"
        width={1200}
        height={800}
        sizes="100vw"
      />
    </section>
  );
}

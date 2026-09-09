/**
 * Tanka traka sa jednom recenicom, izmedju dvije vlasi linije.
 *
 * Stoji dva puta na stranici i radi kao predah: zatvara jednu grupu sekcija
 * i najavljuje sljedecu. Zato je i tekst isti na oba mjesta — ponavljanje je
 * namjerno, kao zaglavlje koje se vraca.
 */
export default function Traka({ tekst }: { tekst: string }) {
  return (
    <div className="traka is-fullbleed">
      <span>{tekst}</span>
    </div>
  );
}

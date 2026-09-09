import { CatalogItem } from "@/data/catalog";

/**
 * Specifikacije artikla kao redovi koji se otvaraju: naziv lijevo, „+" desno.
 *
 * Bez JS-a — `<details>` to radi sam, pa red radi i prije hidracije i ostaje
 * dostupan citacima ekrana bez ijednog aria atributa. Znak se mijenja u CSS-u
 * preko `details[open]`.
 *
 * Sadrzaj je isti onaj koji na sirokom ekranu stoji u `<dl>` — nista se ne
 * dodaje niti izmislja. Na telefonu je samo sklopljen, da se cijena, sifra i
 * napomena ne stovare u jedan dugi stub.
 */
export default function SpecsAccordion({ item }: { item: CatalogItem }) {
  const redovi: { naziv: string; sadrzaj: string }[] = [
    {
      naziv: "Šifra i kolekcija",
      sadrzaj: `${item.code} · ${item.collection}, ${item.brand}`,
    },
    ...(item.thickness
      ? [{ naziv: "Dimenzija i debljina", sadrzaj: item.thickness }]
      : []),
    {
      naziv: "Dostupnost i cijena",
      sadrzaj:
        "Provjeriti u poslovnici. Cijenu i rok isporuke potvrđuje prodajni tim uz upit.",
    },
    {
      naziv: "O podacima",
      sadrzaj:
        "Naziv, šifra i kolekcija prate objavljeni asortiman MT PONOS. Fotografija proizvoda preuzeta je sa zvanične MT PONOS stranice.",
    },
  ];

  return (
    <div className="m-acc">
      <span className="m-label">SPECIFIKACIJA</span>
      {redovi.map((r) => (
        <details className="m-acc-row" key={r.naziv}>
          <summary>
            {r.naziv}
            <i aria-hidden="true" />
          </summary>
          <p>{r.sadrzaj}</p>
        </details>
      ))}
    </div>
  );
}

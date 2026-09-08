import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Ruler,
  Store,
} from "lucide-react";
import { Footer, Header, PageHero } from "@/components/SiteChrome";
import AwardsShowcase from "@/components/AwardsShowcase";
import StatsScroll from "@/components/StatsScroll";
export const metadata = {
  title: "O nama | MT PONOS",
  description:
    "MT PONOS Banja Luka — tradicija od 2000. godine, veleprodaja, maloprodaja, dostava i stručna ugradnja podova.",
};
const awards = [
  {
    year: "2026",
    title: "Bonitetna ocjena AA+",
    text: "MT PONOS je ponovo stekao AA+ bonitetnu ocjenu, kao potvrdu finansijske stabilnosti, transparentnog i odgovornog poslovanja prema kupcima, partnerima i dobavljačima.",
    image: "/images/awards/bonitet-2026.jpg",
  },
  {
    year: "2025",
    title: "CompanyWall AA+ certifikat",
    text: "Certifikat bonitetne izvrsnosti za 2025. godinu svrstava kompaniju među pouzdane poslovne subjekte u Bosni i Hercegovini.",
    image: "/images/awards/bonitet-2025.jpg",
  },
  {
    year: "2024",
    title: "Zlatna plaketa bonitetne izvrsnosti",
    text: "Nakon tri uzastopne godine ispunjavanja visokih standarda bonitetne izvrsnosti, kompaniji je dodijeljena zlatna plaketa CompanyWall.",
    image: "/images/awards/bonitet-2024.jpg",
  },
  {
    year: "2023",
    title: "Nagrada za uspješno poslovanje",
    text: "Bonitetna ocjena AA+ potvrdila je profesionalizam, finansijsku stabilnost i integritet poslovanja kompanije MT PONOS.",
    image: "/images/awards/bonitet-2023.jpg",
  },
];
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          kicker="OD 2000. GODINE"
          title="Ponosni na tradiciju. Posvećeni dobrom podu."
          copy="MT PONOS je kompanija iz Banje Luke koja više od dvije decenije gradi povjerenje kroz pažljivo odabran asortiman, stručan savjet i pouzdanu uslugu."
        />
        <section className="about-intro">
          <div className="about-image">
            <Image
              src="/images/rooms/office.png"
              alt="Savremeni poslovni prostor sa drvenim podom"
              fill
              sizes="55vw"
            />
          </div>
          <article>
            <span className="eyebrow">NAŠA PRIČA</span>
            <h2>Od specijalizovane prodavnice do centra podnih obloga.</h2>
            <p>
              Privatno preduzeće MT PONOS d.o.o. osnovano je u Banjoj Luci 2000.
              godine. Od prvog dana fokus je na kvalitetnim laminatnim podovima,
              korektnom odnosu prema kupcu i znanju koje olakšava izbor poda.
            </p>
            <p>
              Danas osnovnu djelatnost čine veleprodaja, maloprodaja, dostava i
              ugradnja laminatnih podova, kao i prateće opreme — podloga i
              lajsni. Asortiman je proširen parketima, SPC vinilom, WPC decking
              podovima i akustičnim zidnim panelima.
            </p>
            <p>
              U ponudi se posebno izdvajaju laminati evropskih proizvođača Krono
              Original iz Njemačke i Kaindl iz Austrije, kao i Tarkett laminati
              i višeslojni parketi.
            </p>
          </article>
        </section>
        <StatsScroll />
        <section className="service-story">
          <div>
            <span className="eyebrow">OD IZBORA DO UGRADNJE</span>
            <h2>Pod nije samo dekor. Važan je cijeli sistem.</h2>
          </div>
          <div className="service-columns">
            <article>
              <Ruler />
              <h3>Stručno savjetovanje</h3>
              <p>
                Od namjene prostora i klase otpornosti do nijanse i formata
                daske — kupac dobija pomoć pri izboru odgovarajućeg poda.
              </p>
            </article>
            <article>
              <PackageCheck />
              <h3>Dostava i priprema</h3>
              <p>
                Tim pomaže pri obračunu količine, izboru podloge i završnih
                lajsni, uz organizaciju dostave prema dogovoru.
              </p>
            </article>
            <article>
              <Store />
              <h3>Veleprodaja i maloprodaja</h3>
              <p>
                Asortiman je dostupan kroz sjedište u Dervišima i maloprodajnu
                poslovnicu u Lazarevu.
              </p>
            </article>
          </div>
        </section>
        <section className="installation">
          <article>
            <span className="eyebrow">MONTAŽA LAMINATA</span>
            <h2>Precizna ugradnja za uredan i trajan rezultat.</h2>
            <p>
              Kvalitet poda zavisi i od pravilne pripreme podloge, izbora
              izolacionog sloja, preciznog poravnanja panela i odgovarajućih
              dilatacija. MT PONOS pruža uslugu montaže i vodi računa o
              dogovorenim rokovima.
            </p>
            {[
              "Provjera i priprema podloge",
              "Odabir odgovarajuće podloge",
              "Precizno spajanje i poravnanje panela",
              "Završna obrada odgovarajućim lajsnama",
            ].map((x) => (
              <span className="check" key={x}>
                <CheckCircle2 size={17} />
                {x}
              </span>
            ))}
          </article>
          <div>
            <Image
              src="/images/hero-floor.png"
              alt="Detalj precizno postavljenog hrastovog poda"
              fill
              sizes="50vw"
            />
          </div>
        </section>
        <section className="recognition">
          <div className="recognition-head">
            <div>
              <span className="eyebrow">NAGRADE I PRIZNANJA</span>
              <h2>Četiri godine potvrđene poslovne pouzdanosti.</h2>
            </div>
            <p>
              Bonitetna priznanja potvrđuju finansijsku stabilnost, odgovorno
              poslovanje i pouzdan odnos prema kupcima, partnerima i
              dobavljačima.
            </p>
          </div>
          <AwardsShowcase awards={awards} />
          <Link className="recognition-link" href="/priznanja">
            Detaljan pregled priznanja <ArrowRight size={16} />
          </Link>
        </section>
        <section className="about-cta">
          <span className="eyebrow">POSJETITE NAS</span>
          <h2>Pronađimo artikal koji odgovara vašem prostoru.</h2>
          <p>
            Dođite u jednu od dvije poslovnice u Banjoj Luci ili pošaljite
            dimenzije prostora za informativni proračun i ponudu.
          </p>
          <div>
            <Link className="cta-dot" href="/kontakt#upit">
              <i /> Zatraži ponudu
            </Link>
            <Link href="/proizvodi">
              Istraži asortiman <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

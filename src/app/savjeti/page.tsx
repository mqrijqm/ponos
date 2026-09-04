import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer, Header, PageHero } from "@/components/SiteChrome";
const posts = [
  [
    "Kako odabrati debljinu laminata?",
    "Debljina nije jedini pokazatelj kvaliteta. Važni su klasa otpornosti, namjena prostora i kvalitet pripreme podloge.",
  ],
  [
    "Koliko rezerve treba naručiti?",
    "Za pravougaone prostorije obično se računa najmanje 5–10%, a za složene tlocrte i dijagonalno postavljanje više.",
  ],
  [
    "SPC pod i podno grijanje",
    "SPC Natural Floor je prilagođen podnom grijanju i provodi toplotu bez promjene svojih parametara.",
  ],
  [
    "Zašto su dilatacije važne?",
    "Pod mora imati dovoljno prostora za prirodno širenje. Završne lajsne zatvaraju spoj bez blokiranja poda.",
  ],
];
export const metadata = {
  title: "Savjeti za izbor i ugradnju poda | MT PONOS",
};
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          kicker="VODIČ KROZ PODOVE"
          title="Savjeti prije konačne odluke."
          copy="Praktične smjernice za izbor dekora, količine, podloge i završnih detalja."
        />
        <section className="advice-grid">
          {posts.map((p, i) => (
            <article key={p[0]}>
              <span>0{i + 1}</span>
              <h2>{p[0]}</h2>
              <p>{p[1]}</p>
              <Link href="/kontakt">
                Pitajte stručni tim <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}

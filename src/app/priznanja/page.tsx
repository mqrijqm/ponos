import { Award } from "lucide-react";
import { Footer, Header, PageHero } from "@/components/SiteChrome";
export const metadata = { title: "Nagrade i priznanja | MT PONOS" };
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          kicker="BONITETNA IZVRSNOST"
          title="Kontinuitet odgovornog poslovanja."
          copy="Pregled priznanja koja MT PONOS objavljuje na svojoj zvaničnoj stranici."
        />
        <section className="awards">
          {[
            ["2026", "Bonitetna ocjena AA+"],
            ["2025", "Certifikat bonitetne izvrsnosti AA+"],
            ["2024", "Zlatna bonitetna ocjena"],
            ["2023", "Sertifikat AA+ bonitetne izvrsnosti"],
          ].map((x) => (
            <article key={x[0]}>
              <Award />
              <b>{x[0]}</b>
              <h2>{x[1]}</h2>
              <p>Priznanje navedeno na zvaničnoj web stranici MT PONOS.</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}

"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP, ScrollTrigger);
const stats = [
  { value: 2000, suffix: ".", label: "godina osnivanja" },
  { value: 2, suffix: "", label: "poslovnice u Banjoj Luci" },
  { value: 100, suffix: "+", label: "vrsta laminata na lageru" },
  {
    value: 1000,
    suffix: "+",
    label: "zadovoljnih kupaca navedeno na zvaničnoj stranici",
  },
];
export default function StatsScroll() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const setFinal = () =>
        root.current
          ?.querySelectorAll<HTMLElement>("[data-count]")
          .forEach((el, i) => {
            el.textContent = `${stats[i].value}${stats[i].suffix}`;
          });
      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const counters =
            root.current!.querySelectorAll<HTMLElement>("[data-count]");
          const cards =
            root.current!.querySelectorAll<HTMLElement>(".stat-card");
          counters.forEach((el) => (el.textContent = "0"));
          gsap.set(cards, { opacity: 0.28 });
          let unlocked = false;
          const unlockScroll = () => {
            if (unlocked) return;
            unlocked = true;
            document.documentElement.classList.remove("stats-scroll-locked");
            window.dispatchEvent(new Event("ponos:scroll-unlock"));
          };
          const tl = gsap.timeline({ paused: true, onComplete: unlockScroll });
          const trigger = ScrollTrigger.create({
            trigger: root.current,
            start: "top 12%",
            once: true,
            onEnter: () => {
              document.documentElement.classList.add("stats-scroll-locked");
              window.dispatchEvent(new Event("ponos:scroll-lock"));
              tl.play();
            },
          });
          counters.forEach((el, i) => {
            const state = { value: 0 };
            tl.to(cards[i], { opacity: 1, duration: 0.18 }, i * 0.72)
              .to(
                state,
                {
                  value: stats[i].value,
                  duration: 0.58,
                  ease: "power2.out",
                  onUpdate: () => {
                    el.textContent = `${Math.round(state.value)}${stats[i].suffix}`;
                  },
                },
                i * 0.72,
              )
              .to(
                cards[i],
                { opacity: i === stats.length - 1 ? 1 : 0.5, duration: 0.16 },
                i * 0.72 + 0.6,
              );
          });
          return () => {
            trigger.kill();
            tl.kill();
            unlockScroll();
            setFinal();
          };
        },
      );
      mm.add("(prefers-reduced-motion: reduce)", setFinal);
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section
      ref={root}
      className="stats-scroll"
      aria-label="MT PONOS u brojevima"
    >
      <div className="stats-heading">
        <span className="eyebrow">MT PONOS U BROJEVIMA</span>
        <p>Kontinuitet koji se gradi izborom, uslugom i povjerenjem.</p>
      </div>
      <div className="stats-track">
        {stats.map((s, i) => (
          <article className="stat-card" key={s.label}>
            <span>0{i + 1}</span>
            <b data-count>
              {s.value}
              {s.suffix}
            </b>
            <p>{s.label}</p>
          </article>
        ))}
      </div>
      <div className="scroll-cue">
        Brojevi se prikazuju automatski <i />
      </div>
    </section>
  );
}

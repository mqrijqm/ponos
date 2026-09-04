"use client";
import Image from "next/image";
import { Award, Plus } from "lucide-react";
import { useState } from "react";

export type AwardItem = {
  year: string;
  title: string;
  text: string;
  image: string;
};
export default function AwardsShowcase({ awards }: { awards: AwardItem[] }) {
  const [active, setActive] = useState(0);
  const award = awards[active];
  return (
    <div className="awards-showcase">
      <div className="award-rows">
        {awards.map((item, i) => (
          <button
            key={item.year}
            className={active === i ? "award-row active" : "award-row"}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-expanded={active === i}
          >
            <span className="award-index">0{i + 1}</span>
            <Award />
            <b>{item.year}</b>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="award-mobile-image">
                <Image
                  src={item.image}
                  alt={`${item.title}, ${item.year}. godina`}
                  fill
                  sizes="90vw"
                />
              </div>
            </div>
            <Plus className="award-plus" />
          </button>
        ))}
      </div>
      <div className="award-preview" aria-live="polite">
        <Image
          key={award.image}
          src={award.image}
          alt={`${award.title}, ${award.year}. godina`}
          fill
          sizes="42vw"
          priority
        />
        <div>
          <span>{award.year}</span>
          <b>{award.title}</b>
        </div>
      </div>
    </div>
  );
}

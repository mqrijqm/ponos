"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { HERO_COLORS, MARKER, MARKER_REVEAL, PLANK_LABELS } from "./hero-content";

/**
 * FAZA C - pokazivaci (leader lines) sa tekstom preko canvasa.
 *
 * Zasto SVG a ne 3D geometrija: linija i tekst treba da budu iste debljine i
 * velicine bez obzira gdje je daska u prostoru. Kao 3D objekat bi se linija
 * suzavala sa perspektivom, tekst bi se izobliceno lijepio na povrsinu, a font
 * ne bi bio isti kao ostatak sajta.
 *
 * Sta se pomjera a sta ne:
 *   - SIDRISTE prati dasku. Scena svaki frejm projektuje tacku sa povrsine
 *     daske u ekranske koordinate i zove `place()`.
 *   - OZNAKA (kvadratic + tekst) stoji na fiksnom mjestu u kadru. Linija se
 *     rasteze izmedju to dvoje.
 *
 * Zasto oznaka ne visi na fiksnom razmaku od sidrista: daske se u fazi
 * lebdenja pomjeraju, pa bi tekst prije ili kasnije zavrsio preko svijetle
 * daske - a bijeli tekst na alpskoj bijeloj se ne vidi.
 *
 * Pozicije NE idu kroz React state: `place()` pise pravo u DOM. Kroz state bi
 * se cijela stranica renderovala 60 puta u sekundi.
 */

export type MarkerHandle = {
  /**
   * @param slot    redni broj daske (0 ili 1)
   * @param x,y     sidriste na dasci, u pikselima canvasa
   * @param reveal  0-1, koliko je pokazivac otkriven
   * @param visible da li je sidriste uopste u kadru
   */
  place: (slot: number, x: number, y: number, reveal: number, visible: boolean) => void;
};

type MarkerDom = {
  group: SVGGElement | null;
  path: SVGPathElement | null;
  halo: SVGPathElement | null;
  mark: SVGGElement | null;
  label: SVGTextElement | null;
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export type HeroMarkersProps = {
  isMobile: boolean;
  /** false = prefers-reduced-motion, sve je odmah iscrtano. */
  animated: boolean;
};

const HeroMarkers = forwardRef<MarkerHandle, HeroMarkersProps>(function HeroMarkers(
  { isMobile, animated },
  ref,
) {
  const shape = isMobile ? MARKER.mobile : MARKER.desktop;

  const svgRef = useRef<SVGSVGElement>(null);
  const size = useRef({ width: 0, height: 0 });
  const dom = useRef<MarkerDom[]>(
    PLANK_LABELS.map(() => ({ group: null, path: null, halo: null, mark: null, label: null })),
  );

  /**
   * Velicina se cita iz ResizeObservera, ne iz clientWidth u petlji - citanje
   * dimenzije svaki frejm tjera browser da racuna raspored.
   */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      size.current = { width: box.width, height: box.height };
      place();
    });
    observer.observe(svg);

    /** Oznaka stoji na fiksnom mjestu, pa se pomjera samo kad se kadar mijenja. */
    function place() {
      for (let slot = 0; slot < PLANK_LABELS.length; slot++) {
        const spot = shape.label[slot];
        const node = dom.current[slot];
        node.mark?.setAttribute(
          "transform",
          `translate(${(spot.x * size.current.width).toFixed(1)} ${(
            spot.y * size.current.height
          ).toFixed(1)})`,
        );
      }
    }

    return () => observer.disconnect();
  }, [shape]);

  useImperativeHandle(
    ref,
    () => ({
      place(slot, x, y, reveal, visible) {
        const node = dom.current[slot];
        if (!node?.group || !node.path) return;

        node.group.style.opacity = visible ? "1" : "0";
        if (!visible) return;

        const spot = shape.label[slot];
        const lx = spot.x * size.current.width;
        const ly = spot.y * size.current.height;

        // smjer od sidrista ka oznaci; crtica na dasci je okomita na njega
        const dx = lx - x;
        const dy = ly - y;
        const dist = Math.hypot(dx, dy) || 1;
        const px = (-dy / dist) * (shape.tick / 2);
        const py = (dx / dist) * (shape.tick / 2);

        // potez: crtica (jedan kraj -> drugi) pa nazad kroz sidriste do oznake.
        // Povratak preko crtice se ne vidi (isti stroke), a ovako je sve jedan
        // element pa se otkriva jednim dashoffsetom, od daske ka tekstu.
        const d =
          `M ${(x + px).toFixed(1)} ${(y + py).toFixed(1)}` +
          ` L ${(x - px).toFixed(1)} ${(y - py).toFixed(1)}` +
          ` L ${x.toFixed(1)} ${y.toFixed(1)}` +
          ` L ${lx.toFixed(1)} ${ly.toFixed(1)}`;

        node.path.setAttribute("d", d);
        node.halo?.setAttribute("d", d);

        const total = shape.tick * 1.5 + dist;
        const t = animated ? clamp(reveal) : 1;

        // linija se crta prva, tekst tek kad je gotova
        const line = clamp(t / MARKER_REVEAL.lineShare);
        const text = clamp((t - MARKER_REVEAL.lineShare) / (1 - MARKER_REVEAL.lineShare));

        const dash = String(total);
        const offset = String(total * (1 - line));
        node.path.style.strokeDasharray = dash;
        node.path.style.strokeDashoffset = offset;
        if (node.halo) {
          node.halo.style.strokeDasharray = dash;
          node.halo.style.strokeDashoffset = offset;
        }
        if (node.mark) node.mark.style.opacity = String(line > 0.98 ? 1 : 0);
        if (node.label) node.label.style.opacity = String(text);
      },
    }),
    [animated, shape],
  );

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      aria-hidden="true"
    >
      {PLANK_LABELS.map((label, slot) => (
        <g
          key={label}
          ref={(el) => {
            dom.current[slot].group = el;
          }}
          style={{ opacity: 0 }}
        >
          {/*
            Dvije putanje jedna preko druge: tamna deblja ispod, bijela tanka
            iznad. Bez tamne bi linija nestala tamo gdje predje preko alpske
            bijele daske.
          */}
          <path
            ref={(el) => {
              dom.current[slot].halo = el;
            }}
            fill="none"
            stroke={HERO_COLORS.markerHalo}
            strokeWidth={3}
          />
          <path
            ref={(el) => {
              dom.current[slot].path = el;
            }}
            fill="none"
            stroke={HERO_COLORS.marker}
            strokeWidth={1}
          />

          {/* kvadratic i tekst se pomjeraju samo kad se kadar mijenja */}
          <g
            ref={(el) => {
              dom.current[slot].mark = el;
            }}
            style={{ opacity: animated ? 0 : 1, transition: "opacity .3s ease" }}
          >
            <rect
              x={-shape.square / 2}
              y={-shape.square / 2}
              width={shape.square}
              height={shape.square}
              fill={HERO_COLORS.marker}
              stroke={HERO_COLORS.markerHalo}
              strokeWidth={3}
              paintOrder="stroke"
            />
            <text
              ref={(el) => {
                dom.current[slot].label = el;
              }}
              x={shape.below ? 0 : shape.square / 2 + shape.gap}
              y={shape.below ? shape.square + 18 : 4}
              textAnchor={shape.below ? "middle" : "start"}
              fill={HERO_COLORS.marker}
              stroke={HERO_COLORS.markerHalo}
              strokeWidth={3}
              paintOrder="stroke"
              strokeLinejoin="round"
              style={{
                opacity: animated ? 0 : 1,
                fontFamily: "var(--font-lora), serif",
                fontSize: shape.size,
                letterSpacing: "0.22em",
              }}
            >
              {label.toUpperCase()}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
});

export default HeroMarkers;

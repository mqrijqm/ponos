"use client";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  Heart,
  Maximize2,
  RefreshCw,
  RotateCw,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { products, Product } from "@/data/products";
import { track } from "@/lib/analytics";

type Point = { x: number; y: number };
const rooms = [
  ["Dnevni boravak", "/images/rooms/living.png"],
  ["Kuhinja", "/images/rooms/kitchen.png"],
  ["Spavaća soba", "/images/rooms/bedroom.png"],
  ["Poslovni prostor", "/images/rooms/office.png"],
] as const;
const initial: Point[] = [
  { x: 4, y: 58 },
  { x: 96, y: 58 },
  { x: 96, y: 99 },
  { x: 4, y: 99 },
];

export default function Visualizer({
  onQuote,
}: {
  onQuote: (p: Product) => void;
}) {
  const [room, setRoom] = useState<string>(rooms[0][1]);
  const [uploaded, setUploaded] = useState(false);
  const [points, setPoints] = useState<Point[]>(initial);
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(products[0]);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(240);
  const [opacity, setOpacity] = useState(62);
  const [before, setBefore] = useState(100);
  const [compare, setCompare] = useState(false);
  const [second] = useState(products[3]);
  const [search, setSearch] = useState("");
  const [maker, setMaker] = useState("Svi");
  const [sort, setSort] = useState("Preporučeno");
  const [stock, setStock] = useState(false);
  const [sale, setSale] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (maker === "Svi" || p.manufacturer === maker) &&
            (!stock || p.available) &&
            (!sale || p.badge === "Akcija") &&
            (p.name + " " + p.code)
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "Najniža cijena"
            ? a.price - b.price
            : sort === "Najviša cijena"
              ? b.price - a.price
              : sort === "Najnovije"
                ? b.created - a.created
                : sort === "Najpopularnije"
                  ? b.popular - a.popular
                  : 0,
        ),
    [maker, search, sort, stock, sale],
  );
  const polygon = points.map((p) => `${p.x}% ${p.y}%`).join(",");
  function upload(f?: File) {
    if (!f || !["image/jpeg", "image/png", "image/webp"].includes(f.type))
      return;
    setRoom(URL.createObjectURL(f));
    setUploaded(true);
    setPoints([]);
    setEditing(true);
    track("room_uploaded");
  }
  function stagePoint(e: React.PointerEvent) {
    if (!editing || points.length >= 4 || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    setPoints([
      ...points,
      {
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      },
    ]);
  }
  function drag(i: number, e: React.PointerEvent) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      if (!stage.current) return;
      const r = stage.current.getBoundingClientRect();
      setPoints((ps) =>
        ps.map((p, n) =>
          n === i
            ? {
                x: Math.max(
                  0,
                  Math.min(100, ((ev.clientX - r.left) / r.width) * 100),
                ),
                y: Math.max(
                  0,
                  Math.min(100, ((ev.clientY - r.top) / r.height) * 100),
                ),
              }
            : p,
        ),
      );
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
  function select(p: Product) {
    setActive(p);
    track("product_selected", { id: p.id });
  }
  function reset() {
    if (uploaded) URL.revokeObjectURL(room);
    setRoom(rooms[0][1]);
    setUploaded(false);
    setPoints(initial);
    setEditing(false);
    setBefore(100);
  }
  async function download() {
    const img = document.createElement("img");
    img.src = room;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    ctx.save();
    ctx.beginPath();
    points.forEach((p, i) =>
      i
        ? ctx.lineTo((p.x * c.width) / 100, (p.y * c.height) / 100)
        : ctx.moveTo((p.x * c.width) / 100, (p.y * c.height) / 100),
    );
    ctx.closePath();
    ctx.clip();
    const tex = document.createElement("img");
    tex.src = active.texture;
    await tex.decode();
    ctx.globalAlpha = opacity / 100;
    const pat = ctx.createPattern(tex, "repeat");
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.restore();
    const a = document.createElement("a");
    a.download = "mt-ponos-prikaz.png";
    a.href = c.toDataURL("image/png");
    a.click();
  }
  return (
    <section id="vizualizator" className="visualizer-section">
      <div className="section-intro">
        <div>
          <span className="eyebrow">INTERAKTIVNI ALAT</span>
          <h2>Pogledajte pod u svom prostoru</h2>
        </div>
        <p>
          Odaberite pripremljenu prostoriju ili učitajte vlastitu fotografiju.
          Zatim označite površinu poda i isprobajte dekore iz naše ponude.
        </p>
      </div>
      <div className="visualizer-shell">
        <div className="visual-main">
          <div className="room-tabs">
            {rooms.map(([n, src]) => (
              <button
                key={n}
                onClick={() => {
                  setRoom(src);
                  setUploaded(false);
                  setPoints(initial);
                  setEditing(false);
                  track("room_selected", { room: n });
                }}
                className={room === src ? "active" : ""}
              >
                {n}
              </button>
            ))}
          </div>
          <div
            ref={stage}
            className="stage"
            onPointerDown={stagePoint}
            aria-label="Prikaz prostorije i označavanje poda"
          >
            {/* Unoptimized is required for local object URLs from private browser-only uploads. */}
            {uploaded ? (
              <>
                <span className="sr-only">
                  Fotografija prostorije učitana sa uređaja
                </span>
                <div
                  className="uploaded-room"
                  style={{ backgroundImage: `url(${room})` }}
                />
              </>
            ) : (
              <Image
                src={room}
                alt="Pripremljeni enterijer za vizualizaciju poda"
                fill
                sizes="(max-width: 900px) 100vw, 70vw"
                priority
              />
            )}
            {points.length >= 3 && (
              <>
                <div
                  className="texture-layer"
                  style={{
                    clipPath: `polygon(${polygon})`,
                    opacity: opacity / 100,
                  }}
                >
                  <div
                    className="texture-surface"
                    style={{
                      backgroundImage: `url(${active.texture})`,
                      backgroundSize: `${scale}px auto`,
                      transform: `rotate(${rotation}deg) scale(1.55)`,
                    }}
                  />
                </div>
                {compare && (
                  <div
                    className="texture-layer compare-layer"
                    style={{
                      clipPath: `polygon(${polygon})`,
                      opacity: opacity / 100,
                      width: `${before}%`,
                    }}
                  >
                    <div
                      className="texture-surface"
                      style={{
                        backgroundImage: `url(${second.texture})`,
                        backgroundSize: `${scale}px auto`,
                      }}
                    />
                  </div>
                )}
              </>
            )}
            {editing &&
              points.map((p, i) => (
                <button
                  key={i}
                  aria-label={`Tačka poda ${i + 1}`}
                  className="handle"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onPointerDown={(e) => drag(i, e)}
                >
                  {i + 1}
                </button>
              ))}
            {editing && (
              <div className="instruction">
                {points.length < 4
                  ? `Kliknite još ${4 - points.length} ${4 - points.length === 1 ? "tačku" : "tačke"} na uglove poda.`
                  : "Povucite tačke za precizno podešavanje."}
              </div>
            )}
            {compare && (
              <input
                className="compare-slider"
                aria-label="Klizač poređenja prije i poslije"
                type="range"
                min="0"
                max="100"
                value={before}
                onChange={(e) => setBefore(+e.target.value)}
              />
            )}
            <div className="stage-badge">
              {active.manufacturer} · {active.name}
            </div>
          </div>
          <div className="tool-row">
            <button onClick={() => file.current?.click()}>
              <Upload size={17} /> Učitaj fotografiju
            </button>
            <input
              ref={file}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => upload(e.target.files?.[0])}
            />
            <button
              onClick={() => {
                setPoints([]);
                setEditing(true);
              }}
            >
              <Maximize2 size={17} /> Označi pod
            </button>
            {editing && points.length === 4 && (
              <button
                className="solid"
                onClick={() => {
                  setEditing(false);
                  track("floor_area_confirmed");
                }}
              >
                <Check size={17} /> Potvrdi površinu
              </button>
            )}
            <button onClick={reset}>
              <RefreshCw size={17} /> Resetuj
            </button>
            <button
              onClick={() => {
                setCompare(!compare);
                track("comparison_started");
              }}
            >
              Prije / poslije
            </button>
            <button
              onClick={() =>
                localStorage.setItem(
                  "mtponos-visualizer",
                  JSON.stringify({
                    product: active.id,
                    room: uploaded ? "lokalna fotografija" : room,
                    points,
                  }),
                )
              }
            >
              Sačuvaj prikaz
            </button>
            <button onClick={download}>
              <ArrowDownToLine size={17} /> Preuzmi sliku
            </button>
          </div>
          <p className="privacy-note">
            Fotografija se obrađuje isključivo lokalno u vašem browseru i ne
            šalje se na server. Dugme „Resetuj“ uklanja je iz prikaza.
          </p>
        </div>
        <aside className="control-panel">
          <div className="panel-title">
            <div>
              <span>DEMO KATALOG</span>
              <b>{filtered.length} podova</b>
            </div>
            <SlidersHorizontal size={20} />
          </div>
          <label className="search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Naziv ili šifra"
              aria-label="Pretraži proizvode"
            />
          </label>
          <div className="filters">
            <label>
              Proizvođač
              <select
                value={maker}
                onChange={(e) => {
                  setMaker(e.target.value);
                  track("product_filtered");
                }}
              >
                <option>Svi</option>
                <option>Krono Original</option>
                <option>Kaindl</option>
                <option>Tarkett</option>
              </select>
            </label>
            <label>
              Sortiranje
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Preporučeno</option>
                <option>Najniža cijena</option>
                <option>Najviša cijena</option>
                <option>Najnovije</option>
                <option>Najpopularnije</option>
              </select>
            </label>
          </div>
          <div className="quick">
            <label>
              <input
                type="checkbox"
                checked={stock}
                onChange={(e) => setStock(e.target.checked)}
              />{" "}
              Na lageru
            </label>
            <label>
              <input
                type="checkbox"
                checked={sale}
                onChange={(e) => setSale(e.target.checked)}
              />{" "}
              Akcija
            </label>
          </div>
          <details className="more-filters">
            <summary>
              Više filtera <ChevronDown size={15} />
            </summary>
            <p>
              Vrsta poda · Boja · Debljina · Klasa · Vodootpornost · Namjena ·
              Cijena
            </p>
          </details>
          <div className="adjust">
            <div>
              <label>Smjer poda</label>
              <span>{rotation}°</span>
            </div>
            <div className="segmented">
              {[0, 45, 90].map((n) => (
                <button
                  className={rotation === n ? "active" : ""}
                  onClick={() => setRotation(n)}
                  key={n}
                >
                  <RotateCw size={14} />
                  {n}°
                </button>
              ))}
            </div>
            <label>
              Veličina daske{" "}
              <input
                type="range"
                min="120"
                max="420"
                value={scale}
                onChange={(e) => setScale(+e.target.value)}
              />
            </label>
            <label>
              Intenzitet prikaza{" "}
              <input
                type="range"
                min="20"
                max="90"
                value={opacity}
                onChange={(e) => setOpacity(+e.target.value)}
              />
            </label>
          </div>
          <div className="product-list">
            {filtered.map((p) => (
              <article
                key={p.id}
                className={active.id === p.id ? "product active" : "product"}
                onClick={() => select(p)}
              >
                <Image
                  src={p.texture}
                  alt={`Demo tekstura ${p.name}`}
                  width={88}
                  height={88}
                />
                <div>
                  <small>{p.manufacturer}</small>
                  <h3>{p.name}</h3>
                  <p>
                    {p.code} · {p.thickness} mm · {p.usageClass}
                  </p>
                  <b>{p.price.toFixed(2).replace(".", ",")} KM/m²</b>
                  {p.badge && <em>{p.badge}</em>}
                </div>
                <button
                  aria-label={`Dodaj ${p.name} u omiljene`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart size={17} />
                </button>
              </article>
            ))}
          </div>
          <div className="selected">
            <Image
              src={active.texture}
              alt="Odabrani dekor"
              width={88}
              height={64}
            />
            <div>
              <small>{active.manufacturer}</small>
              <strong>{active.name}</strong>
              <span>
                {active.code} · paket {active.packageCoverage} m²
              </span>
            </div>
            <p>
              {active.available ? "Dostupno na lageru" : "Po narudžbi"} ·{" "}
              {active.price.toFixed(2).replace(".", ",")} KM/m²
            </p>
            <a href="#kalkulator">Izračunaj količinu</a>
            <button onClick={() => onQuote(active)}>
              Zatraži ponudu za ovaj pod
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CatalogItem,
  catalog,
  priceFor,
  pricingFor,
  productImage,
} from "@/data/catalog";

export type CalcResult = {
  area: number;
  total: number;
  packages: number;
  value: number;
  coverage: number;
  unit: string;
};

export function useCalculator(item: CatalogItem) {
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(4);
  const [extra, setExtra] = useState(0);
  const [waste, setWaste] = useState(10);
  const result = useMemo<CalcResult>(() => {
    const { packageCoverage, unit } = pricingFor(item);
    const area = Math.max(0, length * width + extra);
    const total = area * (1 + waste / 100);
    const packages = Math.ceil(total / packageCoverage);
    return {
      area,
      total,
      packages,
      coverage: packages * packageCoverage,
      value: packages * packageCoverage * priceFor(item),
      unit,
    };
  }, [length, width, extra, waste, item]);
  return {
    length,
    setLength,
    width,
    setWidth,
    extra,
    setExtra,
    waste,
    setWaste,
    result,
  };
}

/** Artikli za koje racun po povrsini ima smisla (lajsne se prodaju po duznom metru). */
export const calculableItems = catalog.filter((i) => pricingFor(i).areaBased);

export function CalcSummary({ result }: { result: CalcResult }) {
  return (
    <div className="calc-results">
      <span>
        Površina prostorije <b>{result.area.toFixed(2)} m²</b>
      </span>
      <span>
        Potrebno sa rezervom <b>{result.total.toFixed(2)} m²</b>
      </span>
      <span>
        Broj paketa <b>{result.packages}</b>
      </span>
      <span>
        Informativna vrijednost <b>{result.value.toFixed(2)} KM</b>
      </span>
    </div>
  );
}

/**
 * Jedan kalkulator za cijeli sajt. Koristi se inline na landingu i unutar
 * modala kad se pozove sa kataloga ili stranice artikla.
 */
export default function Calculator({
  item,
  onItemChange,
  onRequestQuote,
  showPicker = false,
}: {
  item: CatalogItem;
  onItemChange?: (item: CatalogItem) => void;
  onRequestQuote: (result: CalcResult) => void;
  showPicker?: boolean;
}) {
  const { length, setLength, width, setWidth, extra, setExtra, waste, setWaste, result } =
    useCalculator(item);
  const pricing = pricingFor(item);

  return (
    <div className="calculator">
      <div className="calc-product">
        <Image
          src={productImage(item)}
          alt={`${item.brand} ${item.name}`}
          width={120}
          height={120}
        />
        <span>
          <small>{item.brand}</small>
          <b>{item.name}</b>
          <em>
            {item.code} · {pricing.packageCoverage} {pricing.unit}/paket
          </em>
        </span>
      </div>
      {showPicker && onItemChange && (
        <label className="calc-picker">
          Artikal
          <select
            value={item.code}
            onChange={(e) => {
              const next = calculableItems.find((x) => x.code === e.target.value);
              if (next) onItemChange(next);
            }}
          >
            {calculableItems.map((x) => (
              <option key={x.code} value={x.code}>
                {x.name} · {x.brand}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="calc-inputs">
        <label>
          Dužina prostorije (m)
          <input
            min="0"
            step="0.1"
            type="number"
            value={length}
            onChange={(e) => setLength(+e.target.value)}
          />
        </label>
        <label>
          Širina prostorije (m)
          <input
            min="0"
            step="0.1"
            type="number"
            value={width}
            onChange={(e) => setWidth(+e.target.value)}
          />
        </label>
        <label>
          Dodatna površina (m²)
          <input
            min="0"
            step="0.1"
            type="number"
            value={extra}
            onChange={(e) => setExtra(+e.target.value)}
          />
        </label>
        <fieldset>
          <legend>Otpad / rezerva</legend>
          {[5, 10, 15].map((n) => (
            <label key={n}>
              <input
                type="radio"
                name="waste"
                checked={waste === n}
                onChange={() => setWaste(n)}
              />
              {n}%
            </label>
          ))}
        </fieldset>
      </div>
      <CalcSummary result={result} />
      <p>
        Proračun je informativnog karaktera. Konačnu količinu i cijenu potrebno
        je potvrditi prije narudžbe.
      </p>
      {/* "sa proračunom" je izaslo iz natpisa: dugme stoji ispod samog
          proracuna, pa se to vidi, a duzi natpis je razvlacio oval preko
          cijele kartice. */}
      <button className="cta-dot" onClick={() => onRequestQuote(result)}>
        <i /> Zatraži ponudu
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { formatPLN } from "@/lib/pricing";

// Koszt materiału = cena szpuli / masa szpuli × zużycie w wydruku.
// Zwraca null, gdy wejście nie ma sensu (zero, ujemne, NaN lub zbyt duża wartość).
export function materialCost(spoolPrice: number, spoolWeightG: number, usedG: number): number | null {
  const valid = [spoolPrice, spoolWeightG, usedG].every((value) => Number.isFinite(value) && value >= 0);
  if (!valid || spoolWeightG === 0 || spoolPrice > 100000 || usedG > 100000) return null;
  return Math.round((spoolPrice / spoolWeightG) * usedG * 100) / 100;
}

export function PrintCostCalculator() {
  const [spoolPrice, setSpoolPrice] = useState("80");
  const [spoolWeight, setSpoolWeight] = useState("1000");
  const [usedG, setUsedG] = useState("50");

  const cost = materialCost(Number(spoolPrice), Number(spoolWeight), Number(usedG));

  return (
    <div className="card calculator">
      <Field id="spool-price" label="Cena szpuli (zł)" value={spoolPrice} onChange={setSpoolPrice} />
      <Field id="spool-weight" label="Masa szpuli (g)" value={spoolWeight} onChange={setSpoolWeight} />
      <Field id="used" label="Zużycie w wydruku (g)" value={usedG} onChange={setUsedG} />
      <div className="muted">Koszt materiału</div>
      <div className="result">{cost === null ? "Sprawdź wartości" : formatPLN(cost)}</div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min="0"
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

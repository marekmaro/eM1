"use client";

import { useState } from "react";
import { formatPLN } from "@/lib/pricing";

// Koszt materiału = cena szpuli / masa szpuli × zużycie w wydruku.
export function materialCost(spoolPrice: number, spoolWeightG: number, usedG: number): number {
  if (spoolWeightG <= 0) return 0;
  return Math.round((spoolPrice / spoolWeightG) * usedG * 100) / 100;
}

export function PrintCostCalculator() {
  const [spoolPrice, setSpoolPrice] = useState("80");
  const [spoolWeight, setSpoolWeight] = useState("1000");
  const [usedG, setUsedG] = useState("50");

  const cost = materialCost(Number(spoolPrice), Number(spoolWeight), Number(usedG));

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <Field id="spool-price" label="Cena szpuli (zł)" value={spoolPrice} onChange={setSpoolPrice} />
      <Field id="spool-weight" label="Masa szpuli (g)" value={spoolWeight} onChange={setSpoolWeight} />
      <Field id="used" label="Zużycie w wydruku (g)" value={usedG} onChange={setUsedG} />
      <div className="muted">Koszt materiału</div>
      <div className="result">{formatPLN(cost)}</div>
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
      <input id={id} type="number" min="0" step="any" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

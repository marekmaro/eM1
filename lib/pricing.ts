import { niche } from "@/config/niche";

// Przelicza cenę za produkt na cenę za jednostkę z konfiguracji (domyślnie kg).
export function unitPrice(price: number, netWeightG: number): number {
  const units = netWeightG / niche.unit.weightG;
  return Math.round((price / units) * 100) / 100;
}

export function formatPLN(value: number): string {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);
}

export function formatUnitPrice(value: number): string {
  return `${formatPLN(value)}/${niche.unit.label}`;
}

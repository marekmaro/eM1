import { niche } from "@/config/niche";

// Znak: szpula z nawiniętą nitką na pomarańczowym tle. Kolory marki są stałe w każdym motywie,
// dlatego nie używamy zmiennych CSS. Plik public/icon.svg (favikona) ma ten sam kształt.
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="logo">
      <rect width="48" height="48" rx="13" fill="#ff7a3d" />
      <circle cx="24" cy="24" r="15" fill="#fff8f2" />
      <circle cx="24" cy="24" r="10" fill="none" stroke="#3ec5c0" strokeWidth="3.2" strokeDasharray="34 100" transform="rotate(-70 24 24)" />
      <circle cx="24" cy="24" r="10" fill="none" stroke="#1d1d1f" strokeWidth="3.2" strokeDasharray="22 100" strokeDashoffset="-40" transform="rotate(-70 24 24)" />
      <circle cx="24" cy="24" r="5.5" fill="#1d1d1f" />
      <circle cx="24" cy="24" r="1.8" fill="#fff8f2" />
    </svg>
  );
}

// Nazwa marki z akcentem na ostatnich trzech literach (Nitko + mat).
export function Wordmark() {
  const name = niche.brand.name;
  const head = name.slice(0, -3);
  const tail = name.slice(-3);
  return (
    <span className="wordmark">
      {head}
      <span>{tail}</span>
    </span>
  );
}

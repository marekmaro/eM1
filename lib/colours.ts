const HEX: Record<string, string> = {
  czarny: "#1d1d1f",
  biały: "#f4f4f0",
  szary: "#8e8e93",
  srebrny: "#c0c4cc",
  złoty: "#d4a536",
  beżowy: "#d9c3a0",
  czerwony: "#e03c31",
  pomarańczowy: "#ff7a1a",
  żółty: "#f5c518",
  zielony: "#2fa35b",
  niebieski: "#1e6fd9",
  fioletowy: "#7b4fd6",
  przezroczysty: "#cfe9f2",
};

const FALLBACK = "#8a8a8f";

export function colourToHex(name: string): string {
  return HEX[name.toLowerCase()] ?? FALLBACK;
}

import { colourToHex } from "@/lib/colours";

export function ColourDot({ colour, size = 16 }: { colour: string; size?: number }) {
  return (
    <span
      className="swatch"
      style={{ backgroundColor: colourToHex(colour), width: size, height: size }}
      title={colour}
      aria-label={`Kolor: ${colour}`}
      role="img"
    />
  );
}

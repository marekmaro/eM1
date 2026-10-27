import { colourToHex } from "@/lib/colours";

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Szpula z pasami w kolorach najtańszych produktów. Czysto dekoracyjna, dlatego aria-hidden.
export function SpoolHero({ colours }: { colours: string[] }) {
  const palette = colours.length > 0 ? colours : ["czarny", "biały", "czerwony"];
  const segment = CIRCUMFERENCE / palette.length;

  return (
    <div className="spool-hero" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="spool-svg">
        <circle cx="100" cy="100" r="93" className="spool-flange" />
        <g className="spool-rotor">
          {palette.map((colour, index) => (
            <circle
              key={`${colour}-${index}`}
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke={colourToHex(colour)}
              strokeWidth="26"
              strokeDasharray={`${segment - 3} ${CIRCUMFERENCE}`}
              strokeDashoffset={-index * segment}
              transform="rotate(-90 100 100)"
            />
          ))}
        </g>
        <circle cx="100" cy="100" r="44" className="spool-core" />
        <circle cx="100" cy="100" r="9" className="spool-hole" />
      </svg>
    </div>
  );
}

// Logo: szpula z kolorowym nawinięciem. Kolory idą z CSS, więc działa w jasnym i ciemnym motywie.
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" className="logo">
      <circle cx="16" cy="16" r="15" className="logo-flange" />
      <circle cx="16" cy="16" r="10" className="logo-wind-a" />
      <circle cx="16" cy="16" r="6.5" className="logo-wind-b" />
      <circle cx="16" cy="16" r="2.5" className="logo-hole" />
    </svg>
  );
}

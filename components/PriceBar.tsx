// Pasek ceny: pełna długość = najtańsza dostępna oferta. Krótszy pasek = droższa oferta.
export function PriceBar({ value, min }: { value: number; min: number }) {
  const percent = Math.max(4, Math.min(100, Math.round((min / value) * 100)));
  const above = Math.round((value / min - 1) * 100);

  return (
    <div className="price-bar" aria-label={above === 0 ? "najtańsza oferta" : `o ${above}% drożej niż najtańsza`}>
      <div className="price-bar-track">
        <div className={above === 0 ? "price-bar-fill is-best" : "price-bar-fill"} style={{ width: `${percent}%` }} />
      </div>
      <span className="muted">{above === 0 ? "najtaniej" : `+${above}%`}</span>
    </div>
  );
}

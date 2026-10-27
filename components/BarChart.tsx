// Prosty wykres słupkowy bez biblioteki. Wysokość słupków jest proporcjonalna do maksimum.
export function BarChart({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <figure className="chart" aria-label={label}>
      <div className="chart-bars">
        {data.map((item) => (
          <div key={item.label} className="chart-col" title={`${item.label}: ${item.value}`}>
            <div className="chart-bar" style={{ height: `${Math.round((item.value / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <figcaption className="muted">{label}</figcaption>
    </figure>
  );
}

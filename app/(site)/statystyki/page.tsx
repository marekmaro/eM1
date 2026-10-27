import type { Metadata } from "next";
import Link from "next/link";
import { niche } from "@/config/niche";
import { biggestSpreads, catalogTotals, materialStats } from "@/lib/analytics";
import { getCatalog } from "@/lib/catalog";
import { formatPLN, formatUnitPrice } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Statystyki rynku",
};

export default function MarketStatsPage() {
  const catalog = getCatalog();
  const totals = catalogTotals(catalog);
  const materials = materialStats(catalog);
  const spreads = biggestSpreads(catalog);

  return (
    <>
      <h1>Ceny filamentu w liczbach</h1>
      <p className="lead">
        Średnie i różnice cen liczone z aktualnych ofert w katalogu. Dane z dnia {totals.updatedAt}.
      </p>

      <div className="stats">
        <Stat value={totals.products} label="produktów" />
        <Stat value={totals.shops} label="sklepów" />
        <Stat value={totals.offersInStock} label="dostępnych ofert" />
        <Stat value={totals.staleOffers} label="ofert starszych niż tydzień" />
      </div>

      <h2>Materiały</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Materiał</th>
              <th>Produkty</th>
              <th>Średnio za {niche.unit.label}</th>
              <th>Najtaniej</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((row) => (
              <tr key={row.material}>
                <td>{row.material}</td>
                <td>{row.products}</td>
                <td className="price">{row.avgPricePerKg === null ? "—" : formatUnitPrice(row.avgPricePerKg)}</td>
                <td>
                  {row.cheapest ? (
                    <>
                      {formatUnitPrice(row.cheapest.pricePerKg)} · {row.cheapest.productName} ·{" "}
                      <span className="muted">{row.cheapest.shopName}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Największe różnice cen</h2>
      {spreads.length === 0 ? (
        <p className="muted">Potrzebne są co najmniej dwie dostępne oferty tego samego produktu.</p>
      ) : (
        <div className="grid">
          {spreads.map((row) => (
            <Link key={row.slug} href={`/products/${row.slug}`} className="card spread-card">
              <strong>{row.name}</strong>
              <div className="spread-value">+{row.spreadPct}%</div>
              <div className="muted">
                od {formatPLN(row.min)} do {formatPLN(row.max)} za {niche.unit.label}
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="disclaimer">
        Statystyki opisują stan katalogu i nie są poradą zakupową. Ostateczną cenę sprawdź w sklepie.
      </p>
    </>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

import type { Metadata } from "next";
import { BarChart } from "@/components/BarChart";
import { niche } from "@/config/niche";
import { biggestSpreads, materialStats, shopStats } from "@/lib/analytics";
import { getCatalog } from "@/lib/catalog";
import { formatPLN, formatUnitPrice } from "@/lib/pricing";
import { clickSummary } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Statystyki · panel",
  robots: { index: false, follow: false },
};

export default async function AdminStatsPage() {
  const catalog = getCatalog();
  const clicks = clickSummary();
  const shops = shopStats(catalog);
  const materials = materialStats(catalog);
  const spreads = biggestSpreads(catalog, 5);
  const shopName = (id: string) => catalog.shops.find((shop) => shop.id === id)?.name ?? id;

  return (
    <>
      <h1>Statystyki</h1>
      <p className="lead">Kliknięcia w sklepy liczymy od wdrożenia licznika. Pozostałe dane pochodzą z katalogu.</p>

      <div className="stats">
        <Stat value={clicks.last7} label="kliknięć w 7 dni" />
        <Stat value={clicks.last30} label="kliknięć w 30 dni" />
        <Stat value={clicks.total} label="kliknięć łącznie" />
        <Stat value={clicks.daily.length ? Math.round(clicks.last30 / 30) : 0} label="średnio dziennie (30 dni)" />
      </div>

      <section className="card">
        <h2>Kliknięcia dziennie</h2>
        <BarChart data={clicks.daily.map((day) => ({ label: day.date, value: day.count }))} label="Ostatnie 30 dni" />
      </section>

      <div className="grid two-col dashboard-grid">
        <section className="card">
          <h2>Najczęściej klikane oferty (30 dni)</h2>
          {clicks.topOffers.length === 0 ? (
            <p className="muted">Brak kliknięć w tym okresie.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Sklep</th>
                  <th>Kliknięcia</th>
                </tr>
              </thead>
              <tbody>
                {clicks.topOffers.map((row) => (
                  <tr key={`${row.productSlug}-${row.shopId}`}>
                    <td>{row.productSlug}</td>
                    <td>{shopName(row.shopId)}</td>
                    <td className="price">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h2>Kliknięcia według sklepu (30 dni)</h2>
          {clicks.byShop.length === 0 ? (
            <p className="muted">Brak kliknięć w tym okresie.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Sklep</th>
                  <th>Kliknięcia</th>
                </tr>
              </thead>
              <tbody>
                {clicks.byShop.map((row) => (
                  <tr key={row.shopId}>
                    <td>{shopName(row.shopId)}</td>
                    <td className="price">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <h2>Sklepy i ich ceny</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Sklep</th>
              <th>Oferty</th>
              <th>Dostępne</th>
              <th>Najtańsze w produktach</th>
              <th>Średnio drożej o</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr key={shop.id}>
                <td>{shop.name}</td>
                <td>{shop.offers}</td>
                <td>{shop.inStock}</td>
                <td className="price">{shop.cheapestCount}</td>
                <td className="price">{shop.avgAbovePct === null ? "—" : `${shop.avgAbovePct}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Materiały</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Materiał</th>
              <th>Produkty</th>
              <th>Z ofertami</th>
              <th>Średnio za {niche.unit.label}</th>
              <th>Najtaniej</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((row) => (
              <tr key={row.material}>
                <td>{row.material}</td>
                <td>{row.products}</td>
                <td>{row.withOffers}</td>
                <td className="price">{row.avgPricePerKg === null ? "—" : formatUnitPrice(row.avgPricePerKg)}</td>
                <td>{row.cheapest ? `${row.cheapest.productName} · ${formatUnitPrice(row.cheapest.pricePerKg)}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Największe różnice cen</h2>
      {spreads.length === 0 ? (
        <p className="muted">Potrzeba co najmniej dwóch dostępnych ofert tego samego produktu.</p>
      ) : (
        <ul className="plain-list">
          {spreads.map((row) => (
            <li key={row.slug}>
              {row.name}: <strong>+{row.spreadPct}%</strong>{" "}
              <span className="muted">
                ({formatPLN(row.min)} – {formatPLN(row.max)} za {niche.unit.label})
              </span>
            </li>
          ))}
        </ul>
      )}
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

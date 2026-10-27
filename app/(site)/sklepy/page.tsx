import type { Metadata } from "next";
import { niche } from "@/config/niche";
import { shopStats } from "@/lib/analytics";
import { getCatalog } from "@/lib/catalog";
import { safeHref } from "@/lib/url";

export const metadata: Metadata = {
  title: "Sklepy",
};

export default function ShopsPage() {
  const catalog = getCatalog();
  const stats = shopStats(catalog).sort(
    (a, b) => b.cheapestCount - a.cheapestCount || (a.avgAbovePct ?? Infinity) - (b.avgAbovePct ?? Infinity),
  );

  return (
    <>
      <h1>Sklepy</h1>
      <p className="lead">
        Zobacz, który sklep najczęściej ma najniższą cenę za {niche.unit.label} i jak bardzo jego ceny odbiegają od
        najtańszych ofert.
      </p>

      {stats.length === 0 ? (
        <p className="muted">Brak sklepów w katalogu.</p>
      ) : (
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
              {stats.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <a href={safeHref(shop.url)} target="_blank" rel="nofollow noopener noreferrer">
                      {shop.name}
                    </a>
                  </td>
                  <td>{shop.offers}</td>
                  <td>{shop.inStock}</td>
                  <td className="price">{shop.cheapestCount}</td>
                  <td className="price">{shop.avgAbovePct === null ? "—" : `${shop.avgAbovePct}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="disclaimer">
        „Średnio drożej” liczymy tylko z dostępnych ofert, porównując każdą z najtańszą dostępną ofertą danego produktu.
      </p>
    </>
  );
}

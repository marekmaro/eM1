import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/AdminNotice";
import { ColourDot } from "@/components/ColourDot";
import { niche } from "@/config/niche";
import { getCatalog, rankedOffersFor } from "@/lib/catalog";
import { formatUnitPrice } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Produkty · panel",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string; saved?: string }>;
}) {
  const { q = "", error, saved } = await searchParams;
  const query = q.trim().slice(0, 60).toLowerCase();
  const catalog = getCatalog();

  const rows = catalog.products
    .filter((product) => !query || `${product.name} ${product.brand} ${product.slug}`.toLowerCase().includes(query))
    .map((product) => {
      const offers = rankedOffersFor(catalog, product.slug);
      return { product, offers, best: offers.find((offer) => offer.inStock) };
    });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Produkty</h1>
          <p className="lead">
            {catalog.products.length} produktów w katalogu. Edycja, oferty i usuwanie są w karcie produktu.
          </p>
        </div>
        <div className="page-actions">
          <Link className="button" href="/admin/products/new">
            Nowy produkt
          </Link>
        </div>
      </div>
      <AdminNotice error={error} saved={saved} />

      <form className="card filters-inline" method="GET" action="/admin/products">
        <div className="field grow">
          <label htmlFor="q">Szukaj</label>
          <input id="q" name="q" defaultValue={q} maxLength={60} placeholder="nazwa, marka albo slug" />
        </div>
        <button className="button button-secondary" type="submit">
          Szukaj
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="muted">Brak produktów dla tego zapytania.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Materiał</th>
                <th>Najniżej za {niche.unit.label}</th>
                <th>Oferty</th>
                <th>Dostępne</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, offers, best }) => (
                <tr key={product.slug}>
                  <td>
                    <span className="inline-row">
                      <ColourDot colour={product.colour} />
                      <span>
                        {product.name}
                        <div className="muted">{product.slug}</div>
                      </span>
                    </span>
                  </td>
                  <td>{product.material}</td>
                  <td className="price">{best ? formatUnitPrice(best.pricePerKg) : "brak"}</td>
                  <td>{offers.length}</td>
                  <td>{offers.filter((offer) => offer.inStock).length}</td>
                  <td>
                    <Link href={`/admin/products/${product.slug}`}>Edytuj →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

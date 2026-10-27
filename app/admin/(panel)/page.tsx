import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/AdminNotice";
import { ColourDot } from "@/components/ColourDot";
import { ProductFields } from "@/components/ProductFields";
import { niche } from "@/config/niche";
import { getBestOffer, getCatalog } from "@/lib/catalog";
import { formatUnitPrice } from "@/lib/pricing";
import { createProductAction, createShopAction } from "../actions";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const catalog = getCatalog();
  const inStock = catalog.offers.filter((offer) => offer.inStock).length;

  return (
    <>
      <h1>Dashboard</h1>
      <AdminNotice error={error} saved={saved} />

      <div className="stats">
        <Stat value={catalog.products.length} label="produktów" />
        <Stat value={catalog.shops.length} label="sklepów" />
        <Stat value={catalog.offers.length} label="ofert" />
        <Stat value={inStock} label="dostępnych ofert" />
      </div>

      <h2>Produkty</h2>
      {catalog.products.length === 0 ? (
        <p className="muted">Brak produktów. Dodaj pierwszy poniżej.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Materiał</th>
                <th>Najniżej za {niche.unit.label}</th>
                <th>Oferty</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {catalog.products.map((product) => {
                const best = getBestOffer(product.slug);
                const offerCount = catalog.offers.filter((offer) => offer.productSlug === product.slug).length;
                return (
                  <tr key={product.slug}>
                    <td>
                      <span className="inline-row">
                        <ColourDot colour={product.colour} />
                        {product.name}
                      </span>
                    </td>
                    <td>{product.material}</td>
                    <td className="price">{best ? formatUnitPrice(best.pricePerKg) : "brak"}</td>
                    <td>{offerCount}</td>
                    <td>
                      <Link href={`/admin/products/${product.slug}`}>Edytuj →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid two-col">
        <section className="card">
          <h2>Nowy produkt</h2>
          <form action={createProductAction} className="form-stack">
            <ProductFields idPrefix="new" />
            <button className="button" type="submit">
              Dodaj produkt
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Sklepy</h2>
          {catalog.shops.length > 0 && (
            <ul className="plain-list">
              {catalog.shops.map((shop) => (
                <li key={shop.id}>
                  <strong>{shop.name}</strong> <span className="muted">({shop.id})</span>
                </li>
              ))}
            </ul>
          )}
          <form action={createShopAction} className="form-stack">
            <div className="field">
              <label htmlFor="shop-id">Identyfikator (slug)</label>
              <input id="shop-id" name="id" required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
            </div>
            <div className="field">
              <label htmlFor="shop-name">Nazwa</label>
              <input id="shop-name" name="name" required maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="shop-url">Adres sklepu (https://)</label>
              <input id="shop-url" name="url" type="url" required maxLength={500} />
            </div>
            <button className="button button-secondary" type="submit">
              Dodaj sklep
            </button>
          </form>
        </section>
      </div>
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

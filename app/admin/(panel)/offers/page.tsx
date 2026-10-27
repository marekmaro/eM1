import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/AdminNotice";
import { niche } from "@/config/niche";
import { getCatalog, rankedOffersFor } from "@/lib/catalog";
import { daysSince } from "@/lib/dates";
import { formatPLN, formatUnitPrice } from "@/lib/pricing";
import { deleteOfferAction, setOfferStockAction } from "../../actions";

export const metadata: Metadata = {
  title: "Oferty · panel",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ filter?: string; error?: string; saved?: string }>;
}

const FILTERS = [
  { key: "all", label: "Wszystkie" },
  { key: "stale", label: "Starsze niż 7 dni" },
  { key: "out", label: "Niedostępne" },
] as const;

export default async function AdminOffersPage({ searchParams }: Props) {
  const { filter, error, saved } = await searchParams;
  const active = FILTERS.find((item) => item.key === filter)?.key ?? "all";
  const catalog = getCatalog();

  const rows = catalog.offers
    .map((offer) => {
      const product = catalog.products.find((item) => item.slug === offer.productSlug);
      const shop = catalog.shops.find((item) => item.id === offer.shopId);
      const ranked = rankedOffersFor(catalog, offer.productSlug).find((item) => item.shopId === offer.shopId);
      return { offer, product, shop, pricePerKg: ranked?.pricePerKg, age: daysSince(offer.updatedAt) };
    })
    .filter((row) => {
      if (active === "stale") return row.age > 7;
      if (active === "out") return !row.offer.inStock;
      return true;
    })
    .sort((a, b) => b.age - a.age);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Oferty</h1>
          <p className="lead">Dostępność zmieniasz jednym kliknięciem. Ceny i linki edytujesz w karcie produktu.</p>
        </div>
        <div className="page-actions">
          <a className="button button-ghost" href="/admin/export/offers.csv">
            Eksport CSV
          </a>
          <Link className="button" href="/admin/import">
            Import CSV
          </Link>
        </div>
      </div>
      <AdminNotice error={error} saved={saved} />

      <nav className="tabs" aria-label="Filtr ofert">
        {FILTERS.map((item) => (
          <Link key={item.key} href={item.key === "all" ? "/admin/offers" : `/admin/offers?filter=${item.key}`} aria-current={active === item.key ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="muted">Brak ofert w tym filtrze.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Sklep</th>
                <th>Cena</th>
                <th>Za {niche.unit.label}</th>
                <th>Aktualizacja</th>
                <th>Dostępność</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ offer, product, shop, pricePerKg, age }) => (
                <tr key={`${offer.productSlug}-${offer.shopId}`} className={age > 7 ? "is-stale" : undefined}>
                  <td>
                    <Link href={`/admin/products/${offer.productSlug}`}>{product?.name ?? offer.productSlug}</Link>
                  </td>
                  <td>{shop?.name ?? offer.shopId}</td>
                  <td className="price">{formatPLN(offer.price)}</td>
                  <td className="price">{pricePerKg === undefined ? "—" : formatUnitPrice(pricePerKg)}</td>
                  <td>
                    {offer.updatedAt}
                    {age > 7 && <span className="badge badge-warn">{age} dni</span>}
                  </td>
                  <td>
                    <form action={setOfferStockAction} className="inline-form">
                      <input type="hidden" name="productSlug" value={offer.productSlug} />
                      <input type="hidden" name="shopId" value={offer.shopId} />
                      <input type="hidden" name="inStock" value={offer.inStock ? "0" : "1"} />
                      <button className={offer.inStock ? "button button-small" : "button button-ghost button-small"} type="submit">
                        {offer.inStock ? "Dostępny" : "Brak"}
                      </button>
                    </form>
                  </td>
                  <td>
                    <details className="danger-details">
                      <summary>Usuń</summary>
                      <form action={deleteOfferAction} className="inline-form">
                        <input type="hidden" name="productSlug" value={offer.productSlug} />
                        <input type="hidden" name="shopId" value={offer.shopId} />
                        <input type="hidden" name="back" value="offers" />
                        <label className="checkbox">
                          <input name="confirm" type="checkbox" required /> Potwierdzam
                        </label>
                        <button className="button button-danger button-small" type="submit">
                          Usuń ofertę
                        </button>
                      </form>
                    </details>
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

import Link from "next/link";
import { niche } from "@/config/niche";
import { getBestOffer, getProducts } from "@/lib/catalog";
import { formatUnitPrice } from "@/lib/pricing";

export const metadata = {
  title: "Produkty",
};

export default function ProductsPage({ searchParams }: { searchParams: { material?: string } }) {
  const material = searchParams.material;

  const items = getProducts()
    .filter((product) => !material || product.material === material)
    .map((product) => ({ product, best: getBestOffer(product.slug) }))
    .sort((a, b) => (a.best?.pricePerKg ?? Infinity) - (b.best?.pricePerKg ?? Infinity));

  return (
    <>
      <h1>Produkty</h1>
      <p className="lead">Posortowane od najtańszego {niche.unit.label} dostępnej oferty.</p>

      <div className="tabs">
        <Link href="/products" aria-current={!material ? "page" : undefined}>
          Wszystkie
        </Link>
        {niche.materials.map((item) => (
          <Link key={item} href={`/products?material=${item}`} aria-current={material === item ? "page" : undefined}>
            {item}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="muted">Brak produktów w tym filtrze.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Materiał</th>
                <th>Najniżej za {niche.unit.label}</th>
                <th>Sklep</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ product, best }) => (
                <tr key={product.slug}>
                  <td>
                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    <div className="muted">{product.brand}</div>
                  </td>
                  <td>{product.material}</td>
                  <td className="price">{best ? formatUnitPrice(best.pricePerKg) : "brak w sprzedaży"}</td>
                  <td>{best?.shopName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { niche } from "@/config/niche";
import { getBestOffer, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Produkty",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ material?: string }> }) {
  const { material: rawMaterial } = await searchParams;
  // Parametr z URL przepuszczamy tylko, gdy jest jednym z materiałów z konfiguracji.
  const material = niche.materials.find((item) => item === rawMaterial);

  const items = getProducts()
    .filter((product) => !material || product.material === material)
    .map((product) => ({ product, best: getBestOffer(product.slug) }))
    .sort((a, b) => (a.best?.pricePerKg ?? Infinity) - (b.best?.pricePerKg ?? Infinity));

  return (
    <>
      <h1>Produkty</h1>
      <p className="lead">Posortowane od najtańszego {niche.unit.label} dostępnej oferty.</p>

      <div className="tabs">
        <Link href="/products" aria-current={material ? undefined : "page"}>
          Wszystkie
        </Link>
        {niche.materials.map((item) => (
          <Link
            key={item}
            href={`/products?material=${encodeURIComponent(item)}`}
            aria-current={material === item ? "page" : undefined}
          >
            {item}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="muted">Brak produktów w tym filtrze.</p>
      ) : (
        <div className="grid">
          {items.map(({ product, best }) => (
            <ProductCard key={product.slug} product={product} best={best} />
          ))}
        </div>
      )}
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { niche } from "@/config/niche";
import { getCatalog, rankedOffersFor } from "@/lib/catalog";
import type { Catalog, RankedOffer } from "@/lib/types";

export const metadata: Metadata = {
  title: "Produkty",
};

const SORTS = ["price", "name", "brand", "offers"] as const;
type Sort = (typeof SORTS)[number];

const SORT_LABELS: Record<Sort, string> = {
  price: "Najtańsze za kg",
  name: "Nazwa A–Z",
  brand: "Marka A–Z",
  offers: "Najwięcej ofert",
};

interface SearchParams {
  q?: string;
  material?: string;
  colour?: string;
  stock?: string;
  sort?: string;
}

// Wartości z URL przepuszczamy tylko wtedy, gdy są na liście dozwolonych.
function pick<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((item) => item === value);
}

function uniqueColours(catalog: Catalog): string[] {
  return [...new Set(catalog.products.map((product) => product.colour))].sort((a, b) => a.localeCompare(b, "pl"));
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const catalog = getCatalog();
  const colours = uniqueColours(catalog);

  const q = (params.q ?? "").trim().slice(0, 60).toLowerCase();
  const material = pick(params.material, niche.materials);
  const colour = pick(params.colour, colours);
  const onlyInStock = params.stock === "1";
  const sort = pick(params.sort, SORTS) ?? "price";

  const rows = catalog.products.map((product) => {
    const offers: RankedOffer[] = rankedOffersFor(catalog, product.slug);
    return { product, offers, best: offers.find((offer) => offer.inStock) };
  });

  const items = rows
    .filter(({ product }) => !material || product.material === material)
    .filter(({ product }) => !colour || product.colour === colour)
    .filter(({ best }) => !onlyInStock || best !== undefined)
    .filter(({ product }) => {
      if (!q) return true;
      return `${product.name} ${product.brand} ${product.colour}`.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      switch (sort) {
        case "name":
          return a.product.name.localeCompare(b.product.name, "pl");
        case "brand":
          return a.product.brand.localeCompare(b.product.brand, "pl") || a.product.name.localeCompare(b.product.name, "pl");
        case "offers":
          return b.offers.length - a.offers.length;
        default:
          return (a.best?.pricePerKg ?? Infinity) - (b.best?.pricePerKg ?? Infinity);
      }
    });

  const baseQuery = { q: params.q ?? "", material: material ?? "", colour: colour ?? "", stock: onlyInStock ? "1" : "", sort };
  const clearHref = "/products";

  return (
    <>
      <h1>Produkty</h1>
      <p className="lead">
        Porównujemy ceny za {niche.unit.label}. Wybierz materiał, kolor albo wpisz nazwę.
      </p>

      <form className="card filters" method="GET" action="/products">
        <div className="filter-grid">
          <div className="field">
            <label htmlFor="q">Szukaj</label>
            <input id="q" name="q" defaultValue={baseQuery.q} maxLength={60} placeholder="np. PLA czarny" />
          </div>
          <div className="field">
            <label htmlFor="material">Materiał</label>
            <select id="material" name="material" defaultValue={baseQuery.material}>
              <option value="">Wszystkie</option>
              {niche.materials.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="colour">Kolor</label>
            <select id="colour" name="colour" defaultValue={baseQuery.colour}>
              <option value="">Wszystkie</option>
              {colours.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sort">Sortowanie</label>
            <select id="sort" name="sort" defaultValue={sort}>
              {SORTS.map((item) => (
                <option key={item} value={item}>
                  {SORT_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <label className="checkbox">
            <input type="checkbox" name="stock" value="1" defaultChecked={onlyInStock} /> Tylko dostępne
          </label>
          <button className="button" type="submit">
            Pokaż
          </button>
          <Link className="button button-ghost" href={clearHref}>
            Wyczyść
          </Link>
        </div>
      </form>

      <p className="muted results-count">
        Znaleziono: {items.length} z {rows.length}
      </p>

      {items.length === 0 ? (
        <p className="muted">Brak produktów dla tych filtrów. Spróbuj szerszego wyszukiwania.</p>
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

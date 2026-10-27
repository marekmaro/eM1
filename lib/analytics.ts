import { niche } from "@/config/niche";
import { rankedOffersFor } from "@/lib/catalog";
import { daysSince, todayIso } from "@/lib/dates";
import type { Catalog } from "@/lib/types";

// Statystyki liczone wyłącznie z katalogu (bez danych o kliknięciach).
// Używane na stronie publicznej „Statystyki” i w panelu admina.

const STALE_DAYS = 7;

const round2 = (value: number) => Math.round(value * 100) / 100;

export function catalogTotals(catalog: Catalog) {
  const offersInStock = catalog.offers.filter((offer) => offer.inStock).length;
  const staleOffers = catalog.offers.filter((offer) => daysSince(offer.updatedAt) > STALE_DAYS).length;
  return {
    products: catalog.products.length,
    shops: catalog.shops.length,
    offers: catalog.offers.length,
    offersInStock,
    staleOffers,
    updatedAt: catalog.updatedAt,
    today: todayIso(),
  };
}

export interface MaterialStat {
  material: string;
  products: number;
  withOffers: number;
  avgPricePerKg: number | null;
  cheapest: { productName: string; shopName: string; pricePerKg: number } | null;
}

export function materialStats(catalog: Catalog): MaterialStat[] {
  return niche.materials.map((material) => {
    const rows = catalog.products
      .filter((product) => product.material === material)
      .map((product) => {
        const best = rankedOffersFor(catalog, product.slug).find((offer) => offer.inStock);
        return best ? { productName: product.name, shopName: best.shopName, pricePerKg: best.pricePerKg } : null;
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => a.pricePerKg - b.pricePerKg);

    const avg = rows.length ? rows.reduce((sum, row) => sum + row.pricePerKg, 0) / rows.length : null;

    return {
      material,
      products: catalog.products.filter((product) => product.material === material).length,
      withOffers: rows.length,
      avgPricePerKg: avg === null ? null : round2(avg),
      cheapest: rows[0] ?? null,
    };
  });
}

export interface ShopStat {
  id: string;
  name: string;
  url: string;
  offers: number;
  inStock: number;
  cheapestCount: number;
  avgAbovePct: number | null;
}

// Dla każdej oferty sklepu liczymy, o ile procent jest droższa od najtańszej dostępnej.
export function shopStats(catalog: Catalog): ShopStat[] {
  const rankedByProduct = new Map(
    catalog.products.map((product) => [product.slug, rankedOffersFor(catalog, product.slug)]),
  );

  return catalog.shops.map((shop) => {
    const offers = catalog.offers.filter((offer) => offer.shopId === shop.id);
    const deltas: number[] = [];
    let cheapestCount = 0;

    for (const offer of offers) {
      if (!offer.inStock) continue;
      const ranked = (rankedByProduct.get(offer.productSlug) ?? []).filter((item) => item.inStock);
      const mine = ranked.find((item) => item.shopId === shop.id);
      const cheapest = ranked[0];
      if (!mine || !cheapest) continue;

      deltas.push((mine.pricePerKg / cheapest.pricePerKg - 1) * 100);
      if (cheapest.shopId === shop.id) cheapestCount += 1;
    }

    const avg = deltas.length ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length : null;

    return {
      id: shop.id,
      name: shop.name,
      url: shop.url,
      offers: offers.length,
      inStock: offers.filter((offer) => offer.inStock).length,
      cheapestCount,
      avgAbovePct: avg === null ? null : round2(avg),
    };
  });
}

export interface SpreadStat {
  slug: string;
  name: string;
  min: number;
  max: number;
  spreadPct: number;
}

// Produkty z największą różnicą cen między sklepami (min. dwie dostępne oferty).
export function biggestSpreads(catalog: Catalog, limit = 5): SpreadStat[] {
  return catalog.products
    .map((product) => {
      const prices = rankedOffersFor(catalog, product.slug)
        .filter((offer) => offer.inStock)
        .map((offer) => offer.pricePerKg);
      if (prices.length < 2) return null;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return {
        slug: product.slug,
        name: product.name,
        min,
        max,
        spreadPct: round2(((max - min) / min) * 100),
      };
    })
    .filter((row): row is SpreadStat => row !== null)
    .sort((a, b) => b.spreadPct - a.spreadPct)
    .slice(0, limit);
}

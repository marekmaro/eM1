import { unitPrice } from "@/lib/pricing";
import { catalogSchema } from "@/lib/schema";
import { readJson, writeJson } from "@/lib/store";
import { safeHref } from "@/lib/url";
import type { Catalog, Product, RankedOffer, Shop } from "@/lib/types";

// Czytamy katalog przy każdym wywołaniu, żeby zmiany z panelu były widoczne po revalidacji.
export function getCatalog(): Catalog {
  return catalogSchema.parse(readJson<unknown>("catalog.json", undefined));
}

export function saveCatalog(catalog: Catalog): void {
  writeJson("catalog.json", catalogSchema.parse(catalog));
}

// Oferty produktu z jednej migawki katalogu: najpierw dostępne, potem od najniższej ceny za jednostkę.
export function rankedOffersFor(catalog: Catalog, slug: string): RankedOffer[] {
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product) return [];

  const shopNames = new Map(catalog.shops.map((shop) => [shop.id, shop.name]));

  return catalog.offers
    .filter((offer) => offer.productSlug === slug)
    .map((offer) => ({
      ...offer,
      url: safeHref(offer.url),
      shopName: shopNames.get(offer.shopId) ?? offer.shopId,
      pricePerKg: unitPrice(offer.price, product.netWeightG),
    }))
    .sort((a, b) => Number(b.inStock) - Number(a.inStock) || a.pricePerKg - b.pricePerKg);
}

export function getRankedOffers(slug: string): RankedOffer[] {
  return rankedOffersFor(getCatalog(), slug);
}

export function getBestOffer(slug: string): RankedOffer | undefined {
  return getRankedOffers(slug).find((offer) => offer.inStock);
}

export function getProducts(): Product[] {
  return getCatalog().products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return getCatalog().products.find((product) => product.slug === slug);
}

export function getShops(): Shop[] {
  return getCatalog().shops;
}

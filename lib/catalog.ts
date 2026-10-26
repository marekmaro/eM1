import catalogData from "@/data/catalog.json";
import { unitPrice } from "@/lib/pricing";
import type { Catalog, Product, RankedOffer } from "@/lib/types";

// Na razie dane są w pliku JSON. Później ten moduł zamienimy na bazę,
// bez zmian w stronach, które z niego korzystają.
const catalog = catalogData as Catalog;

export function getCatalog(): Catalog {
  return catalog;
}

export function getProducts(): Product[] {
  return catalog.products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return catalog.products.find((product) => product.slug === slug);
}

// Oferty produktu: najpierw dostępne, potem od najniższej ceny za jednostkę.
export function getRankedOffers(slug: string): RankedOffer[] {
  const product = getProductBySlug(slug);
  if (!product) return [];

  const shopNames = new Map(catalog.shops.map((shop) => [shop.id, shop.name]));

  return catalog.offers
    .filter((offer) => offer.productSlug === slug)
    .map((offer) => ({
      ...offer,
      shopName: shopNames.get(offer.shopId) ?? offer.shopId,
      pricePerKg: unitPrice(offer.price, product.netWeightG),
    }))
    .sort((a, b) => Number(b.inStock) - Number(a.inStock) || a.pricePerKg - b.pricePerKg);
}

export function getBestOffer(slug: string): RankedOffer | undefined {
  return getRankedOffers(slug).find((offer) => offer.inStock);
}

export function getShopCount(): number {
  return catalog.shops.length;
}

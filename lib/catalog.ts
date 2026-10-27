import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { unitPrice } from "@/lib/pricing";
import { catalogSchema } from "@/lib/schema";
import { safeHref } from "@/lib/url";
import type { Catalog, Product, RankedOffer } from "@/lib/types";

// Źródło danych to plik JSON. Czytamy go przy każdym wywołaniu, żeby zmiany z panelu
// admina były widoczne po revalidacji. Plik jest mały, więc koszt jest pomijalny.
// Gdy pojawi się baza, zmieniamy tylko ten moduł.
const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

export function getCatalog(): Catalog {
  return catalogSchema.parse(JSON.parse(readFileSync(CATALOG_PATH, "utf8")));
}

export function saveCatalog(catalog: Catalog): void {
  const valid = catalogSchema.parse(catalog);
  // Zapis przez plik tymczasowy i rename, żeby przerwany zapis nie uszkodził katalogu.
  const tmpPath = `${CATALOG_PATH}.${process.pid}.tmp`;
  writeFileSync(tmpPath, `${JSON.stringify(valid, null, 2)}\n`, { encoding: "utf8" });
  renameSync(tmpPath, CATALOG_PATH);
}

export function getProducts(): Product[] {
  return getCatalog().products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return getCatalog().products.find((product) => product.slug === slug);
}

// Oferty produktu: najpierw dostępne, potem od najniższej ceny za jednostkę.
export function getRankedOffers(slug: string): RankedOffer[] {
  const catalog = getCatalog();
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

export function getBestOffer(slug: string): RankedOffer | undefined {
  return getRankedOffers(slug).find((offer) => offer.inStock);
}

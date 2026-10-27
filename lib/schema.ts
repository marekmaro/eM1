import { z } from "zod";
import { niche } from "@/config/niche";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(SLUG_PATTERN, "Slug: małe litery, cyfry i myślniki");

// Tylko http(s). Blokuje javascript:, data: i inne schematy w linkach z danych.
export const httpUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    try {
      const { protocol } = new URL(value);
      return protocol === "https:" || protocol === "http:";
    } catch {
      return false;
    }
  }, "Adres musi zaczynać się od http:// lub https://");

const textSchema = (max: number) => z.string().trim().min(1).max(max);

export const shopSchema = z.object({
  id: slugSchema,
  name: textSchema(120),
  url: httpUrlSchema,
});

export const productSchema = z.object({
  slug: slugSchema,
  name: textSchema(160),
  brand: textSchema(80),
  material: z.string().refine((value) => niche.materials.includes(value), "Nieznany materiał"),
  diameterMm: z.coerce.number().positive().max(10),
  colour: textSchema(40),
  netWeightG: z.coerce.number().positive().max(100000),
});

export const offerSchema = z.object({
  productSlug: slugSchema,
  shopId: slugSchema,
  price: z.coerce.number().positive().max(100000),
  url: httpUrlSchema,
  inStock: z.boolean(),
  updatedAt: z.string().regex(DATE_PATTERN),
});

// Zgłoszenie od użytkownika. Pole "website" to pułapka dla botów (musi być puste).
export const reportSchema = z.object({
  productSlug: slugSchema,
  shopId: slugSchema,
  message: z.string().trim().min(10, "Opis musi mieć co najmniej 10 znaków").max(500),
});

// Sprawdza spójność całego katalogu: unikalne klucze i brak osieroconych ofert.
export const catalogSchema = z
  .object({
    updatedAt: z.string().regex(DATE_PATTERN),
    shops: z.array(shopSchema),
    products: z.array(productSchema),
    offers: z.array(offerSchema),
  })
  .superRefine((catalog, ctx) => {
    const productSlugs = new Set<string>();
    for (const product of catalog.products) {
      if (productSlugs.has(product.slug)) {
        ctx.addIssue({ code: "custom", message: `Zduplikowany produkt: ${product.slug}` });
      }
      productSlugs.add(product.slug);
    }

    const shopIds = new Set<string>();
    for (const shop of catalog.shops) {
      if (shopIds.has(shop.id)) {
        ctx.addIssue({ code: "custom", message: `Zduplikowany sklep: ${shop.id}` });
      }
      shopIds.add(shop.id);
    }

    const pairs = new Set<string>();
    for (const offer of catalog.offers) {
      if (!productSlugs.has(offer.productSlug)) {
        ctx.addIssue({ code: "custom", message: `Oferta bez produktu: ${offer.productSlug}` });
      }
      if (!shopIds.has(offer.shopId)) {
        ctx.addIssue({ code: "custom", message: `Oferta bez sklepu: ${offer.shopId}` });
      }
      const key = `${offer.productSlug}|${offer.shopId}`;
      if (pairs.has(key)) {
        ctx.addIssue({ code: "custom", message: `Zduplikowana oferta: ${key}` });
      }
      pairs.add(key);
    }
  });

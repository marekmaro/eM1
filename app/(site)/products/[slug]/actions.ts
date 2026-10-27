"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { clientKey } from "@/lib/client-key";
import { addReport } from "@/lib/reports";
import { reportLimiter } from "@/lib/rate-limit";
import { reportSchema } from "@/lib/schema";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// Zgłoszenie błędnej ceny. Publiczna akcja, więc chronimy ją walidacją, limitem prób
// i pułapką dla botów. Zapisujemy tylko treść zgłoszenia, bez adresu IP i e-maila.
export async function reportOfferAction(formData: FormData): Promise<void> {
  const productSlug = field(formData, "productSlug");
  const back = `/products/${encodeURIComponent(productSlug)}`;

  // Ukryte pole "website" wypełniają tylko boty. Udajemy sukces, żeby ich nie uczyć.
  if (field(formData, "website") !== "") redirect(`${back}?report=sent`);

  if (!reportLimiter.allow(clientKey(await headers()))) redirect(`${back}?report=limit`);

  const parsed = reportSchema.safeParse({
    productSlug,
    shopId: field(formData, "shopId"),
    message: field(formData, "message"),
  });
  if (!parsed.success) redirect(`${back}?report=invalid`);

  const offerExists = getCatalog().offers.some(
    (offer) => offer.productSlug === parsed.data.productSlug && offer.shopId === parsed.data.shopId,
  );
  if (!offerExists) redirect(`${back}?report=invalid`);

  addReport(parsed.data);
  redirect(`${back}?report=sent`);
}

"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { passwordMatches, requireAdmin } from "@/lib/admin-auth";
import { audit } from "@/lib/audit";
import { getCatalog, saveCatalog } from "@/lib/catalog";
import { todayIso } from "@/lib/dates";
import { offersToCsv, parseOffersCsv } from "@/lib/offers-csv";
import { setReportStatus, type ReportStatus } from "@/lib/reports";
import { clientKey } from "@/lib/client-key";
import { loginLimiter } from "@/lib/rate-limit";
import { offerSchema, productSchema, shopSchema } from "@/lib/schema";
import { resetClicks } from "@/lib/stats";
import { SESSION_COOKIE, SESSION_TTL_S, adminEnabled, createSessionToken } from "@/lib/session";

// Zmiany są widoczne na wszystkich stronach po ponownym wygenerowaniu.
function publishChanges(): void {
  revalidatePath("/", "layout");
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function productFromForm(formData: FormData) {
  return {
    slug: field(formData, "slug"),
    name: field(formData, "name"),
    brand: field(formData, "brand"),
    material: field(formData, "material"),
    diameterMm: field(formData, "diameterMm"),
    colour: field(formData, "colour"),
    netWeightG: field(formData, "netWeightG"),
  };
}

// ---------- Logowanie ----------

export async function loginAction(formData: FormData): Promise<void> {
  if (!adminEnabled()) redirect("/admin/login?error=disabled");

  const key = clientKey(await headers());
  if (!loginLimiter.allow(key)) redirect("/admin/login?error=limit");

  const password = formData.get("password");
  if (typeof password !== "string" || password.length > 256 || !passwordMatches(password)) {
    audit("login_fail", "panel");
    redirect("/admin/login?error=password");
  }

  loginLimiter.reset(key);
  audit("login_ok", "panel");

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_TTL_S,
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  audit("logout", "panel");
  const jar = await cookies();
  jar.delete({ name: SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

// ---------- Produkty ----------

export async function createProductAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = productSchema.safeParse(productFromForm(formData));
  if (!parsed.success) redirect("/admin/products/new?error=invalid");

  const catalog = getCatalog();
  if (catalog.products.some((product) => product.slug === parsed.data.slug)) {
    redirect("/admin/products/new?error=duplicate");
  }

  catalog.products.push(parsed.data);
  saveCatalog(catalog);
  audit("product_create", parsed.data.slug, parsed.data.name);
  publishChanges();
  redirect(`/admin/products/${encodeURIComponent(parsed.data.slug)}?saved=product`);
}

export async function updateProductAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const originalSlug = field(formData, "originalSlug");
  const back = `/admin/products/${encodeURIComponent(originalSlug)}`;
  const parsed = productSchema.safeParse(productFromForm(formData));
  // Slug jest częścią adresu, więc przy edycji nie wolno go zmienić.
  if (!parsed.success || parsed.data.slug !== originalSlug) redirect(`${back}?error=invalid`);

  const catalog = getCatalog();
  const index = catalog.products.findIndex((product) => product.slug === originalSlug);
  if (index === -1) redirect("/admin/products?error=missing");

  catalog.products[index] = parsed.data;
  saveCatalog(catalog);
  audit("product_update", originalSlug);
  publishChanges();
  redirect(`${back}?saved=product`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const slug = field(formData, "slug");
  const back = `/admin/products/${encodeURIComponent(slug)}`;
  if (formData.get("confirm") !== "on") redirect(`${back}?error=confirm`);

  const catalog = getCatalog();
  const removedOffers = catalog.offers.filter((offer) => offer.productSlug === slug).length;
  catalog.products = catalog.products.filter((product) => product.slug !== slug);
  catalog.offers = catalog.offers.filter((offer) => offer.productSlug !== slug);
  saveCatalog(catalog);
  audit("product_delete", slug, `usunięte oferty: ${removedOffers}`);
  publishChanges();
  redirect("/admin/products?saved=deleted");
}

// ---------- Oferty ----------

export async function saveOfferAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const productSlug = field(formData, "productSlug");
  const back = `/admin/products/${encodeURIComponent(productSlug)}`;

  const parsed = offerSchema.safeParse({
    productSlug,
    shopId: field(formData, "shopId"),
    price: field(formData, "price"),
    url: field(formData, "url"),
    inStock: formData.get("inStock") === "on",
    updatedAt: todayIso(),
  });
  if (!parsed.success) redirect(`${back}?error=invalid`);

  const catalog = getCatalog();
  if (!catalog.products.some((product) => product.slug === parsed.data.productSlug)) {
    redirect("/admin/products?error=missing");
  }
  if (!catalog.shops.some((shop) => shop.id === parsed.data.shopId)) redirect(`${back}?error=shop`);

  const index = catalog.offers.findIndex(
    (offer) => offer.productSlug === parsed.data.productSlug && offer.shopId === parsed.data.shopId,
  );
  if (index === -1) {
    catalog.offers.push(parsed.data);
  } else {
    catalog.offers[index] = parsed.data;
  }

  saveCatalog(catalog);
  audit("offer_save", `${parsed.data.productSlug} / ${parsed.data.shopId}`, `${parsed.data.price} zł`);
  publishChanges();
  redirect(`${back}?saved=offer`);
}

export async function deleteOfferAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const productSlug = field(formData, "productSlug");
  const shopId = field(formData, "shopId");
  const back = field(formData, "back") === "offers" ? "/admin/offers" : `/admin/products/${encodeURIComponent(productSlug)}`;
  if (formData.get("confirm") !== "on") redirect(`${back}?error=confirm`);

  const catalog = getCatalog();
  catalog.offers = catalog.offers.filter((offer) => !(offer.productSlug === productSlug && offer.shopId === shopId));
  saveCatalog(catalog);
  audit("offer_delete", `${productSlug} / ${shopId}`);
  publishChanges();
  redirect(`${back}?saved=deleted`);
}

export async function setOfferStockAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const productSlug = field(formData, "productSlug");
  const shopId = field(formData, "shopId");
  const inStock = field(formData, "inStock") === "1";

  const catalog = getCatalog();
  const offer = catalog.offers.find((item) => item.productSlug === productSlug && item.shopId === shopId);
  if (!offer) redirect("/admin/offers?error=missing");

  offer.inStock = inStock;
  offer.updatedAt = todayIso();
  saveCatalog(catalog);
  audit("offer_stock", `${productSlug} / ${shopId}`, inStock ? "dostępny" : "brak");
  publishChanges();
  redirect("/admin/offers?saved=stock");
}

// Import wielu ofert naraz. Zapis następuje tylko wtedy, gdy cały plik jest poprawny.
export async function importOffersAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const csv = field(formData, "csv");
  if (csv.trim() === "") redirect("/admin/import?error=empty_import");
  if (csv.length > 200_000) redirect("/admin/import?error=import");

  const catalog = getCatalog();
  const { offers, errors } = parseOffersCsv(csv, catalog);
  if (errors.length > 0) {
    // Kilka pierwszych błędów w URL. Długi komunikat mógłby przekroczyć limit nagłówka.
    const shown = errors.slice(0, 10).map((message) => message.slice(0, 120));
    redirect(`/admin/import?error=import&errors=${encodeURIComponent(JSON.stringify(shown))}&total=${errors.length}`);
  }

  for (const offer of offers) {
    const index = catalog.offers.findIndex(
      (item) => item.productSlug === offer.productSlug && item.shopId === offer.shopId,
    );
    if (index === -1) {
      catalog.offers.push(offer);
    } else {
      catalog.offers[index] = offer;
    }
  }

  saveCatalog(catalog);
  audit("offers_import", "csv", `ofert: ${offers.length}`);
  publishChanges();
  redirect(`/admin/import?imported=${offers.length}`);
}

// ---------- Sklepy ----------

export async function createShopAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = shopSchema.safeParse({
    id: field(formData, "id"),
    name: field(formData, "name"),
    url: field(formData, "url"),
  });
  if (!parsed.success) redirect("/admin/shops?error=invalid");

  const catalog = getCatalog();
  if (catalog.shops.some((shop) => shop.id === parsed.data.id)) redirect("/admin/shops?error=duplicate");

  catalog.shops.push(parsed.data);
  saveCatalog(catalog);
  audit("shop_create", parsed.data.id, parsed.data.name);
  publishChanges();
  redirect("/admin/shops?saved=shop");
}

// Identyfikator sklepu jest kluczem w ofertach, więc przy edycji zmieniamy tylko nazwę i adres.
export async function updateShopAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = field(formData, "id");
  const parsed = shopSchema.safeParse({ id, name: field(formData, "name"), url: field(formData, "url") });
  if (!parsed.success) redirect("/admin/shops?error=invalid");

  const catalog = getCatalog();
  const shop = catalog.shops.find((item) => item.id === id);
  if (!shop) redirect("/admin/shops?error=missing");

  shop.name = parsed.data.name;
  shop.url = parsed.data.url;
  saveCatalog(catalog);
  audit("shop_update", id, parsed.data.name);
  publishChanges();
  redirect("/admin/shops?saved=shop");
}

export async function deleteShopAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = field(formData, "id");
  if (formData.get("confirm") !== "on") redirect("/admin/shops?error=confirm");

  const catalog = getCatalog();
  if (catalog.offers.some((offer) => offer.shopId === id)) redirect("/admin/shops?error=shop_has_offers");

  catalog.shops = catalog.shops.filter((shop) => shop.id !== id);
  saveCatalog(catalog);
  audit("shop_delete", id);
  publishChanges();
  redirect("/admin/shops?saved=deleted");
}

// ---------- Zgłoszenia i statystyki ----------

export async function setReportStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = field(formData, "id");
  const status = field(formData, "status");
  if (!/^[0-9a-f-]{36}$/.test(id) || (status !== "open" && status !== "resolved")) {
    redirect("/admin/reports?error=invalid");
  }

  const updated = setReportStatus(id, status as ReportStatus);
  if (!updated) redirect("/admin/reports?error=missing");

  audit("report_status", id, status);
  redirect("/admin/reports?saved=report");
}

export async function resetClicksAction(formData: FormData): Promise<void> {
  await requireAdmin();

  if (formData.get("confirm") !== "on") redirect("/admin/settings?error=confirm");

  resetClicks();
  audit("clicks_reset", "clicks.json");
  redirect("/admin/settings?saved=stats");
}

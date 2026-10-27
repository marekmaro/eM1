"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { passwordMatches, requireAdmin } from "@/lib/admin-auth";
import { getCatalog, saveCatalog } from "@/lib/catalog";
import { loginLimiter } from "@/lib/rate-limit";
import { offerSchema, productSchema, shopSchema } from "@/lib/schema";
import { SESSION_COOKIE, SESSION_TTL_S, adminEnabled, createSessionToken } from "@/lib/session";

// Zmiany są widoczne na wszystkich stronach po ponownym wygenerowaniu.
function publishChanges(): void {
  revalidatePath("/", "layout");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
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

async function clientKey(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function loginAction(formData: FormData): Promise<void> {
  if (!adminEnabled()) redirect("/admin/login?error=disabled");

  const key = await clientKey();
  if (!loginLimiter.allow(key)) redirect("/admin/login?error=limit");

  const password = formData.get("password");
  if (typeof password !== "string" || password.length > 256 || !passwordMatches(password)) {
    redirect("/admin/login?error=password");
  }

  loginLimiter.reset(key);
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
  const jar = await cookies();
  jar.delete({ name: SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

export async function createProductAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = productSchema.safeParse(productFromForm(formData));
  if (!parsed.success) redirect("/admin?error=invalid");

  const catalog = getCatalog();
  if (catalog.products.some((product) => product.slug === parsed.data.slug)) {
    redirect("/admin?error=duplicate");
  }

  catalog.products.push(parsed.data);
  saveCatalog(catalog);
  publishChanges();
  redirect(`/admin/products/${encodeURIComponent(parsed.data.slug)}?saved=product`);
}

export async function updateProductAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const originalSlug = field(formData, "originalSlug");
  const parsed = productSchema.safeParse(productFromForm(formData));
  // Slug jest częścią adresu, więc nie zmieniamy go przy edycji.
  if (!parsed.success || parsed.data.slug !== originalSlug) redirect("/admin?error=invalid");

  const catalog = getCatalog();
  const index = catalog.products.findIndex((product) => product.slug === originalSlug);
  if (index === -1) redirect("/admin?error=missing");

  catalog.products[index] = parsed.data;
  saveCatalog(catalog);
  publishChanges();
  redirect(`/admin/products/${encodeURIComponent(originalSlug)}?saved=product`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const slug = field(formData, "slug");
  if (formData.get("confirm") !== "on") {
    redirect(`/admin/products/${encodeURIComponent(slug)}?error=confirm`);
  }

  const catalog = getCatalog();
  catalog.products = catalog.products.filter((product) => product.slug !== slug);
  catalog.offers = catalog.offers.filter((offer) => offer.productSlug !== slug);
  saveCatalog(catalog);
  publishChanges();
  redirect("/admin?saved=deleted");
}

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
    updatedAt: today(),
  });
  if (!parsed.success) redirect(`${back}?error=invalid`);

  const catalog = getCatalog();
  if (!catalog.products.some((product) => product.slug === parsed.data.productSlug)) {
    redirect("/admin?error=missing");
  }
  if (!catalog.shops.some((shop) => shop.id === parsed.data.shopId)) {
    redirect(`${back}?error=shop`);
  }

  const index = catalog.offers.findIndex(
    (offer) => offer.productSlug === parsed.data.productSlug && offer.shopId === parsed.data.shopId,
  );
  if (index === -1) {
    catalog.offers.push(parsed.data);
  } else {
    catalog.offers[index] = parsed.data;
  }

  saveCatalog(catalog);
  publishChanges();
  redirect(`${back}?saved=offer`);
}

export async function deleteOfferAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const productSlug = field(formData, "productSlug");
  const shopId = field(formData, "shopId");
  const back = `/admin/products/${encodeURIComponent(productSlug)}`;

  const catalog = getCatalog();
  catalog.offers = catalog.offers.filter(
    (offer) => !(offer.productSlug === productSlug && offer.shopId === shopId),
  );
  saveCatalog(catalog);
  publishChanges();
  redirect(`${back}?saved=deleted`);
}

export async function createShopAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = shopSchema.safeParse({
    id: field(formData, "id"),
    name: field(formData, "name"),
    url: field(formData, "url"),
  });
  if (!parsed.success) redirect("/admin?error=invalid");

  const catalog = getCatalog();
  if (catalog.shops.some((shop) => shop.id === parsed.data.id)) redirect("/admin?error=duplicate");

  catalog.shops.push(parsed.data);
  saveCatalog(catalog);
  publishChanges();
  redirect("/admin?saved=shop");
}

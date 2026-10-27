import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/", "/products", "/sklepy", "/statystyki", "/blog", "/tools/print-cost"];

// Adres serwisu pochodzi z SITE_URL, np. https://example.pl. Bez niego mapa używa adresu lokalnego.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const catalog = getCatalog();

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${base}${path}` })),
    ...catalog.products.map((product) => ({ url: `${base}/products/${product.slug}`, lastModified: catalog.updatedAt })),
    ...getAllPosts().map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.date })),
  ];
}

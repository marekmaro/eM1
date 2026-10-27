import type { MetadataRoute } from "next";

// Dynamiczne, żeby adres z SITE_URL był brany w czasie działania, a nie zapisany w buildzie.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/go/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

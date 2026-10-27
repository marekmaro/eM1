import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { niche } from "@/config/niche";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: niche.brand.name,
    template: `%s · ${niche.brand.name}`,
  },
  description: niche.brand.tagline,
};

export const viewport: Viewport = {
  themeColor: "#0e1014",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { niche } from "@/config/niche";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: niche.brand.name,
    template: `%s | ${niche.brand.name}`,
  },
  description: niche.brand.tagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const { main, tools, account } = niche.navigation;

  return (
    <html lang="pl">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              {niche.brand.name}
            </Link>
            <nav className="nav" aria-label="Główna nawigacja">
              {main.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              {tools.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
              {account.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </nav>
          </div>
        </header>

        <main>
          <div className="container">{children}</div>
        </main>

        <footer className="site-footer">
          <div className="container">
            <p>{niche.disclaimer}</p>
            <p>
              <Link href="/regulamin">Regulamin</Link>
              <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
            </p>
            <p>
              Operator: {niche.legal.operator}. Kontakt: {niche.legal.contact}.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavItem({ item }: { item: { label: string; href: string; soon?: boolean } }) {
  if (item.soon) {
    return (
      <span className="soon">
        {item.label}
        <span className="badge">wkrótce</span>
      </span>
    );
  }
  return <Link href={item.href}>{item.label}</Link>;
}

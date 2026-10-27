import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, Wordmark } from "@/components/Logo";
import { niche } from "@/config/niche";

type NavEntry = { label: string; href: string; soon?: boolean };

export default function SiteLayout({ children }: { children: ReactNode }) {
  const { main, tools, account } = niche.navigation;
  const entries: NavEntry[] = [...main, ...tools, ...account];

  return (
    <>
      <header className="site-header">
        <div className="container header-row">
          <Link href="/" className="brand" aria-label={niche.brand.name}>
            <Logo />
            <Wordmark />
          </Link>
          <nav className="nav" aria-label="Główna nawigacja">
            {entries.map((entry) =>
              entry.soon ? (
                <span key={entry.href} className="nav-soon">
                  {entry.label}
                </span>
              ) : (
                <Link key={entry.href} href={entry.href}>
                  {entry.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </header>

      <main>
        <div className="container">{children}</div>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <p className="footer-brand">
              <Logo size={24} /> <Wordmark />
            </p>
            <p>{niche.disclaimer}</p>
          </div>
          <div>
            <p>
              Niektóre linki prowadzą do sklepów partnerskich. Takie linki mogą generować prowizję dla serwisu, bez
              wpływu na cenę dla kupującego.
            </p>
            <p className="footer-links">
              <Link href="/regulamin">Regulamin</Link>
              <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
            </p>
            <p>
              Operator: {niche.legal.operator}. Kontakt: {niche.legal.contact}.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, Wordmark } from "@/components/Logo";
import { requireAdmin } from "@/lib/admin-auth";
import { openReportCount } from "@/lib/reports";
import { logoutAction } from "../actions";

export const metadata: Metadata = {
  title: "Panel administratora",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Pulpit", icon: "◎" },
  { href: "/admin/products", label: "Produkty", icon: "▦" },
  { href: "/admin/offers", label: "Oferty", icon: "◈" },
  { href: "/admin/import", label: "Import CSV", icon: "⇪" },
  { href: "/admin/shops", label: "Sklepy", icon: "⌂" },
  { href: "/admin/reports", label: "Zgłoszenia", icon: "⚑" },
  { href: "/admin/stats", label: "Statystyki", icon: "▮" },
  { href: "/admin/audit", label: "Dziennik", icon: "≡" },
  { href: "/admin/settings", label: "Ustawienia", icon: "⚙" },
] as const;

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const openReports = openReportCount();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand admin-brand">
          <Logo size={28} />
          <Wordmark />
        </Link>
        <nav className="admin-nav" aria-label="Panel administratora">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="admin-nav-link">
              <span className="admin-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.href === "/admin/reports" && openReports > 0 && (
                <span className="admin-count">{openReports}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <Link href="/" className="admin-nav-link">
            <span className="admin-nav-icon" aria-hidden="true">
              ↗
            </span>
            <span>Podgląd serwisu</span>
          </Link>
          <form action={logoutAction}>
            <button className="button button-ghost button-small button-block" type="submit">
              Wyloguj
            </button>
          </form>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-body">{children}</div>
      </div>
    </div>
  );
}

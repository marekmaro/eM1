import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAction } from "../actions";

export const metadata: Metadata = {
  title: "Panel administratora",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="admin">
      <header className="site-header">
        <div className="container header-row">
          <Link href="/admin" className="brand">
            <Logo />
            <span>Panel</span>
          </Link>
          <nav className="nav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/">Podgląd serwisu</Link>
            <form action={logoutAction}>
              <button className="button button-ghost button-small" type="submit">
                Wyloguj
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="container admin-body">{children}</div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { niche } from "@/config/niche";
import { catalogTotals } from "@/lib/analytics";
import { getCatalog } from "@/lib/catalog";
import { clickSummary } from "@/lib/stats";
import { readAudit } from "@/lib/audit";
import { getHealth, type Status } from "@/lib/health";
import { listReports } from "@/lib/reports";
import { BarChart } from "@/components/BarChart";
import { AdminNotice } from "@/components/AdminNotice";

export const metadata: Metadata = {
  title: "Pulpit",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<Status, string> = {
  ok: "w porządku",
  warn: "uwaga",
  error: "błąd",
};

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const catalog = getCatalog();
  const totals = catalogTotals(catalog);
  const health = getHealth();
  const clicks = clickSummary();
  const openReports = listReports().filter((report) => report.status === "open").slice(0, 3);
  const recent = readAudit(6);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Pulpit</h1>
          <p className="lead">Stan katalogu, kondycja serwisu i ostatnie zdarzenia.</p>
        </div>
        <div className="page-actions">
          <Link className="button" href="/admin/products/new">
            Nowy produkt
          </Link>
          <Link className="button button-ghost" href="/admin/import">
            Import CSV
          </Link>
        </div>
      </div>
      <AdminNotice error={error} />

      <div className="stats">
        <Stat value={totals.products} label="produktów" />
        <Stat value={totals.shops} label="sklepów" />
        <Stat value={totals.offersInStock} label={`dostępnych z ${totals.offers} ofert`} />
        <Stat value={clicks.last7} label="kliknięć w 7 dni" />
      </div>

      <div className="grid two-col dashboard-grid">
        <section className="card">
          <div className="card-head">
            <h2>Kondycja serwisu</h2>
            <span className={`status-pill status-${health.status}`}>{STATUS_LABEL[health.status]}</span>
          </div>
          <ul className="check-list">
            {health.checks.map((check) => (
              <li key={check.label}>
                <span className={`dot dot-${check.status}`} aria-hidden="true" />
                <div>
                  <strong>{check.label}</strong>
                  <div className="muted">{check.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Kliknięcia w sklepy (30 dni)</h2>
          <BarChart data={clicks.daily.map((day) => ({ label: day.date, value: day.count }))} label={`Razem: ${clicks.last30}`} />
          <h3>Najczęściej klikane</h3>
          {clicks.topOffers.length === 0 ? (
            <p className="muted">Brak kliknięć. Licznik ruszy, gdy użytkownicy przejdą do sklepu.</p>
          ) : (
            <ol className="plain-list">
              {clicks.topOffers.slice(0, 5).map((row) => (
                <li key={`${row.productSlug}-${row.shopId}`}>
                  <Link href={`/admin/products/${row.productSlug}`}>{row.productSlug}</Link>{" "}
                  <span className="muted">· {row.shopId} · {row.count}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="grid two-col dashboard-grid">
        <section className="card">
          <div className="card-head">
            <h2>Zgłoszenia do sprawdzenia</h2>
            <Link href="/admin/reports">Wszystkie →</Link>
          </div>
          {openReports.length === 0 ? (
            <p className="muted">Brak otwartych zgłoszeń.</p>
          ) : (
            <ul className="plain-list">
              {openReports.map((report) => (
                <li key={report.id}>
                  <strong>{report.productSlug}</strong> <span className="muted">· {report.shopId}</span>
                  <div className="muted">{report.message.slice(0, 140)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Ostatnie zdarzenia</h2>
            <Link href="/admin/audit">Dziennik →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="muted">Brak zdarzeń.</p>
          ) : (
            <ul className="plain-list compact">
              {recent.map((entry) => (
                <li key={`${entry.at}-${entry.action}-${entry.target}`}>
                  <span className="muted">{entry.at.slice(0, 16).replace("T", " ")}</span> {entry.action}{" "}
                  <span className="muted">{entry.target}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="disclaimer">
        Katalog z dnia {totals.updatedAt}. {niche.disclaimer}
      </p>
    </>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

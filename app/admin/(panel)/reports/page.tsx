import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/AdminNotice";
import { getCatalog } from "@/lib/catalog";
import { listReports } from "@/lib/reports";
import { setReportStatusAction } from "../../actions";

export const metadata: Metadata = {
  title: "Zgłoszenia · panel",
  robots: { index: false, follow: false },
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string; saved?: string }>;
}) {
  const { status = "open", error, saved } = await searchParams;
  const catalog = getCatalog();
  const reports = listReports().filter((report) => (status === "all" ? true : report.status === status));

  return (
    <>
      <h1>Zgłoszenia użytkowników</h1>
      <p className="lead">Zgłoszenia błędnych cen i dostępności. Sprawdź je w sklepie, popraw ofertę i oznacz jako rozwiązane.</p>
      <AdminNotice error={error} saved={saved} />

      <nav className="tabs" aria-label="Filtr zgłoszeń">
        <Link href="/admin/reports?status=open" aria-current={status === "open" ? "page" : undefined}>
          Otwarte
        </Link>
        <Link href="/admin/reports?status=resolved" aria-current={status === "resolved" ? "page" : undefined}>
          Rozwiązane
        </Link>
        <Link href="/admin/reports?status=all" aria-current={status === "all" ? "page" : undefined}>
          Wszystkie
        </Link>
      </nav>

      {reports.length === 0 ? (
        <p className="muted">Brak zgłoszeń w tym widoku.</p>
      ) : (
        <div className="offer-list">
          {reports.map((report) => {
            const product = catalog.products.find((item) => item.slug === report.productSlug);
            const shop = catalog.shops.find((item) => item.id === report.shopId);
            return (
              <article className="card report" key={report.id}>
                <div className="card-head">
                  <strong>{product?.name ?? report.productSlug}</strong>
                  <span className={report.status === "open" ? "badge badge-warn" : "badge"}>
                    {report.status === "open" ? "otwarte" : "rozwiązane"}
                  </span>
                </div>
                <p className="muted">
                  {shop?.name ?? report.shopId} · {report.createdAt.slice(0, 16).replace("T", " ")} UTC
                </p>
                {/* Treść użytkownika renderujemy jako tekst. React ją escapuje, nie interpretuje HTML. */}
                <p className="report-message">{report.message}</p>
                <div className="form-inline">
                  <Link href={`/admin/products/${report.productSlug}`}>Otwórz produkt →</Link>
                  <form action={setReportStatusAction}>
                    <input type="hidden" name="id" value={report.id} />
                    <input type="hidden" name="status" value={report.status === "open" ? "resolved" : "open"} />
                    <button className="button button-small" type="submit">
                      {report.status === "open" ? "Oznacz jako rozwiązane" : "Przywróć do otwartych"}
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

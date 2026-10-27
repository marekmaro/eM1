import type { Metadata } from "next";
import { AdminNotice } from "@/components/AdminNotice";
import { niche } from "@/config/niche";
import { resetClicksAction } from "../../actions";

export const metadata: Metadata = {
  title: "Ustawienia · panel",
  robots: { index: false, follow: false },
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;

  return (
    <>
      <h1>Ustawienia</h1>
      <p className="lead">Eksport danych, dane o serwisie i operacje, których nie da się cofnąć.</p>
      <AdminNotice error={error} saved={saved} />

      <div className="grid two-col">
        <section className="card">
          <h2>Eksport danych</h2>
          <p className="muted">Kopia zapasowa i dane do pracy w arkuszu.</p>
          <div className="form-inline">
            <a className="button" href="/admin/export/offers.csv">
              Oferty (CSV)
            </a>
            <a className="button button-ghost" href="/admin/export/catalog.json">
              Cały katalog (JSON)
            </a>
          </div>
        </section>

        <section className="card">
          <h2>Serwis</h2>
          <ul className="plain-list">
            <li>Nazwa: {niche.brand.name}</li>
            <li>Jednostka porównania: za {niche.unit.label}</li>
            <li>
              Dane prawne: {niche.legal.operator}, {niche.legal.contact}
            </li>
          </ul>
          <p className="muted">Te wartości edytujesz w pliku config/niche.ts.</p>
        </section>
      </div>

      <section className="card danger-zone">
        <h2>Wyzeruj liczniki kliknięć</h2>
        <p className="muted">Usuwa historię kliknięć w sklepy. Katalog, oferty i zgłoszenia pozostają bez zmian.</p>
        <details className="danger-details">
          <summary>Pokaż operację</summary>
          <form action={resetClicksAction} className="form-inline">
            <label className="checkbox">
              <input name="confirm" type="checkbox" required /> Rozumiem, usuń statystyki kliknięć
            </label>
            <button className="button button-danger" type="submit">
              Wyzeruj
            </button>
          </form>
        </details>
      </section>
    </>
  );
}

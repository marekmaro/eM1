import type { Metadata } from "next";
import { AdminNotice } from "@/components/AdminNotice";
import { importOffersAction } from "../../actions";

export const metadata: Metadata = {
  title: "Import CSV · panel",
  robots: { index: false, follow: false },
};

const EXAMPLE = `produkt;sklep;cena;dostepny;link
marka-a-pla-matt-1kg-czarny;sklep-a;79,90;1;https://example.com/pla-czarny
marka-a-pla-matt-1kg-czarny;sklep-b;74,50;0;https://example.com/pla-czarny-b`;

function parseErrors(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 10) : [];
  } catch {
    return [];
  }
}

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; errors?: string; total?: string; imported?: string }>;
}) {
  const { error, errors, total, imported } = await searchParams;
  const messages = parseErrors(errors);
  const count = Number(total ?? 0);

  return (
    <>
      <h1>Import ofert z CSV</h1>
      <p className="lead">
        Wklej tabelę z cenami od sklepów. Dane są sprawdzane w całości, zapis następuje tylko wtedy, gdy wszystkie wiersze
        są poprawne. Separator to średnik albo przecinek, a ceny mogą mieć przecinek jako separator dziesiętny.
      </p>

      {imported !== undefined && (
        <div className="notice notice-ok" role="status">
          Zaimportowano ofert: {imported}.
        </div>
      )}
      <AdminNotice error={error} />

      {messages.length > 0 && (
        <div className="card error-list">
          <h2>Błędy w pliku</h2>
          <ul className="plain-list">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          {count > messages.length && <p className="muted">…i kolejne {count - messages.length}.</p>}
        </div>
      )}

      <form action={importOffersAction} className="card form-stack">
        <div className="field">
          <label htmlFor="csv">Dane CSV</label>
          <textarea id="csv" name="csv" rows={12} required maxLength={200000} placeholder={EXAMPLE} spellCheck={false} />
        </div>
        <button className="button" type="submit">
          Zaimportuj
        </button>
      </form>

      <section className="card">
        <h2>Format</h2>
        <p className="muted">
          Wymagane kolumny: <code>produkt</code> (slug produktu), <code>sklep</code> (identyfikator sklepu),{" "}
          <code>cena</code> (zł bez dostawy), <code>dostepny</code> (1/0 lub tak/nie), <code>link</code> (adres http/https).
          Angielskie nazwy też działają: productSlug, shopId, price, inStock, url.
        </p>
        <pre className="code-block">{EXAMPLE}</pre>
      </section>
    </>
  );
}

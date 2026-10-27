import type { Metadata } from "next";
import { readAudit } from "@/lib/audit";

export const metadata: Metadata = {
  title: "Dziennik · panel",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  const entries = readAudit(200);

  return (
    <>
      <h1>Dziennik zdarzeń</h1>
      <p className="lead">
        Logowania, zmiany w katalogu i operacje na danych. Pokazujemy 200 ostatnich wpisów. Hasła i adresy IP nie są
        zapisywane.
      </p>

      {entries.length === 0 ? (
        <p className="muted">Dziennik jest pusty.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Czas (UTC)</th>
                <th>Zdarzenie</th>
                <th>Obiekt</th>
                <th>Szczegóły</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={`${entry.at}-${entry.action}-${entry.target}`}>
                  <td className="muted">{entry.at.slice(0, 19).replace("T", " ")}</td>
                  <td>
                    <code>{entry.action}</code>
                  </td>
                  <td>{entry.target}</td>
                  <td className="muted">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

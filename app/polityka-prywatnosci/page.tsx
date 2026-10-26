import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Polityka prywatności</h1>
      <div className="card">
        <p className="muted">
          Polityka prywatności jest w przygotowaniu. Musi opisywać zasady przetwarzania danych zgodne z RODO, zanim
          serwis zacznie zbierać adresy e-mail do alertów.
        </p>
      </div>
    </>
  );
}

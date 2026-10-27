import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin",
};

export default function TermsPage() {
  return (
    <>
      <h1>Regulamin</h1>
      <div className="card">
        <p className="muted">
          Regulamin jest w przygotowaniu. Przed publicznym startem serwisu musi zostać przygotowany i zatwierdzony
          przez osobę odpowiedzialną za prawną stronę projektu.
        </p>
      </div>
    </>
  );
}

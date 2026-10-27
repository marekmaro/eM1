import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { SpoolHero } from "@/components/SpoolHero";
import { niche } from "@/config/niche";
import { catalogTotals } from "@/lib/analytics";
import { getBestOffer, getCatalog, getProducts } from "@/lib/catalog";

const STEPS = [
  {
    title: "Przeliczamy na kilogram",
    text: "Gramatura, średnica i cena szpuli trafiają do jednej jednostki. Porównujesz to, co naprawdę kosztuje.",
  },
  {
    title: "Pokazujemy najtańszy sklep",
    text: "Oferty są posortowane od najniższej ceny. Dostępne są na górze, a brak towaru wyraźnie oznaczamy.",
  },
  {
    title: "Kupujesz w sklepie",
    text: "Klikasz przejście do sklepu i płacisz tam. Cena w sklepie jest wiążąca, nie nasza.",
  },
];

export default function HomePage() {
  const catalog = getCatalog();
  const totals = catalogTotals(catalog);

  const cheapest = getProducts()
    .map((product) => ({ product, best: getBestOffer(product.slug) }))
    .filter((entry) => entry.best !== undefined)
    .sort((a, b) => (a.best?.pricePerKg ?? 0) - (b.best?.pricePerKg ?? 0))
    .slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Porównywarka filamentu do druku 3D</p>
          <h1>{niche.brand.tagline}</h1>
          <p className="lead">
            Przeliczamy ceny na {niche.unit.label}, żebyś widział, który sklep jest naprawdę tańszy. Bez zgadywania
            z gramatury i bez przepłacania.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/products">
              Przeglądaj produkty
            </Link>
            <Link className="button button-ghost" href="/statystyki">
              Ceny w liczbach
            </Link>
          </div>
        </div>
        <SpoolHero colours={cheapest.map((entry) => entry.product.colour)} />
      </section>

      <div className="stats">
        <Stat value={totals.products} label="produktów" />
        <Stat value={totals.shops} label="sklepów" />
        <Stat value={totals.offersInStock} label="dostępnych ofert" />
        <Stat value={totals.updatedAt.split("-").reverse().join(".")} label="dane z dnia" />
      </div>

      <h2>Najtańsze oferty za {niche.unit.label}</h2>
      {cheapest.length === 0 ? (
        <p className="muted">Brak dostępnych ofert.</p>
      ) : (
        <div className="grid">
          {cheapest.map((entry, index) => (
            <ProductCard
              key={entry.product.slug}
              product={entry.product}
              best={entry.best}
              badge={index === 0 ? "Najtańszy" : undefined}
            />
          ))}
        </div>
      )}

      <h2>Jak to działa</h2>
      <div className="grid steps">
        {STEPS.map((step, index) => (
          <div className="card step" key={step.title}>
            <span className="step-number">{index + 1}</span>
            <h3>{step.title}</h3>
            <p className="muted">{step.text}</p>
          </div>
        ))}
      </div>

      <h2>Narzędzia</h2>
      <div className="grid">
        {niche.navigation.tools.map((tool) =>
          tool.soon ? (
            <div className="card tool-card is-soon" key={tool.href}>
              <strong>{tool.label}</strong>
              <span className="badge">wkrótce</span>
            </div>
          ) : (
            <Link className="card tool-card" key={tool.href} href={tool.href}>
              <strong>{tool.label}</strong>
              <span className="muted">Otwórz →</span>
            </Link>
          ),
        )}
      </div>
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

import Link from "next/link";
import { niche } from "@/config/niche";
import { getBestOffer, getCatalog, getProducts, getShopCount } from "@/lib/catalog";
import { formatUnitPrice } from "@/lib/pricing";

export default function HomePage() {
  const catalog = getCatalog();

  const cheapest = getProducts()
    .map((product) => ({ product, best: getBestOffer(product.slug) }))
    .filter((entry) => entry.best !== undefined)
    .sort((a, b) => (a.best?.pricePerKg ?? 0) - (b.best?.pricePerKg ?? 0))
    .slice(0, 5);

  return (
    <>
      <h1>{niche.brand.tagline}</h1>
      <p className="lead">
        Porównujemy ceny filamentu do druku 3D i pokazujemy je w przeliczeniu na {niche.unit.label}. Dzięki temu
        widzisz, który sklep jest naprawdę tańszy.
      </p>

      <div className="stats">
        <Stat value={getProducts().length} label="produktów" />
        <Stat value={getShopCount()} label="sklepów" />
        <Stat value={catalog.offers.length} label="ofert" />
        <Stat value={catalog.updatedAt} label="dane z dnia" />
      </div>

      <h2>Najtańsze {niche.unit.label} tej chwili</h2>
      <div className="card">
        {cheapest.length === 0 ? (
          <p className="muted">Brak dostępnych ofert.</p>
        ) : (
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {cheapest.map(({ product, best }) => (
              <li key={product.slug} style={{ margin: "8px 0" }}>
                <Link href={`/products/${product.slug}`}>{product.name}</Link>{" "}
                <span className="price">{formatUnitPrice(best?.pricePerKg ?? 0)}</span>{" "}
                <span className="muted">w {best?.shopName}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <h2>Narzędzia</h2>
      <div className="grid">
        {niche.navigation.tools.map((tool) => (
          <div className="card" key={tool.href}>
            {tool.soon ? (
              <strong>
                {tool.label} <span className="badge">wkrótce</span>
              </strong>
            ) : (
              <Link href={tool.href}>
                <strong>{tool.label}</strong>
              </Link>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

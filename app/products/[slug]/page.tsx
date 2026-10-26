import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { niche } from "@/config/niche";
import { getProductBySlug, getProducts, getRankedOffers } from "@/lib/catalog";
import { formatPLN, formatUnitPrice } from "@/lib/pricing";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getProductBySlug(params.slug);
  return { title: product?.name ?? "Produkt" };
}

export default function ProductPage({ params }: Props) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const offers = getRankedOffers(product.slug);
  const best = offers.find((offer) => offer.inStock);

  return (
    <>
      <h1>{product.name}</h1>
      <p className="lead">
        {product.brand} · {product.material} · {product.diameterMm} mm · {product.netWeightG} g
      </p>

      <div className="stats">
        <div className="card">
          <div className="stat-value">{best ? formatUnitPrice(best.pricePerKg) : "—"}</div>
          <div className="stat-label">najniżej dostępnie</div>
        </div>
        <div className="card">
          <div className="stat-value">{best ? formatPLN(best.price) : "—"}</div>
          <div className="stat-label">cena w tym sklepie za {product.netWeightG} g</div>
        </div>
        <div className="card">
          <div className="stat-value">{offers.length}</div>
          <div className="stat-label">sklepów w porównaniu</div>
        </div>
      </div>

      <h2>Oferty</h2>
      {offers.length === 0 ? (
        <p className="muted">Brak ofert dla tego produktu.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sklep</th>
                <th>Cena</th>
                <th>Za {niche.unit.label}</th>
                <th>Dostępność</th>
                <th>Data</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={`${offer.shopId}-${offer.url}`}>
                  <td>{offer.shopName}</td>
                  <td className="price">{formatPLN(offer.price)}</td>
                  <td className="price">{formatUnitPrice(offer.pricePerKg)}</td>
                  <td>{offer.inStock ? "Dostępny" : "Brak"}</td>
                  <td className="muted">{offer.updatedAt}</td>
                  <td>
                    <a href={offer.url} target="_blank" rel="sponsored nofollow noopener">
                      Do sklepu
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="disclaimer">{niche.disclaimer}</p>

      <h2>Historia cen</h2>
      <div className="card">
        <p className="muted">Wykres pojawi się, gdy zbierzemy historię cen z kolejnych odświeżeń danych.</p>
      </div>

      <h2>Alert cenowy</h2>
      <div className="card">
        <p className="muted">Powiadomienie, gdy cena za {niche.unit.label} spadnie poniżej wybranej wartości.</p>
        <button className="button" disabled>
          Wkrótce
        </button>
      </div>
    </>
  );
}

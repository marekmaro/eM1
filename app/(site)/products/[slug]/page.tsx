import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColourDot } from "@/components/ColourDot";
import { niche } from "@/config/niche";
import { getProductBySlug, getProducts, getRankedOffers } from "@/lib/catalog";
import { formatPLN, formatUnitPrice } from "@/lib/pricing";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return { title: product?.name ?? "Produkt" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const offers = getRankedOffers(product.slug);
  const best = offers.find((offer) => offer.inStock);

  return (
    <>
      <div className="product-head">
        <ColourDot colour={product.colour} size={44} />
        <div>
          <h1>{product.name}</h1>
          <p className="lead">
            {product.brand} · {product.material} · {product.diameterMm} mm · {product.netWeightG} g · {product.colour}
          </p>
        </div>
      </div>

      <div className="best-deal card">
        <div>
          <div className="muted">Najniżej dostępnie</div>
          <div className="unit-price big">{best ? formatUnitPrice(best.pricePerKg) : "—"}</div>
        </div>
        <div>
          <div className="muted">Cena w sklepie (bez dostawy)</div>
          <div className="stat-value">{best ? formatPLN(best.price) : "—"}</div>
          {best && <div className="muted">w {best.shopName}</div>}
        </div>
        {best && (
          <a className="button" href={best.url} target="_blank" rel="sponsored nofollow noopener noreferrer">
            Do sklepu
          </a>
        )}
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
                <th>Cena (bez dostawy)</th>
                <th>Za {niche.unit.label}</th>
                <th>Dostępność</th>
                <th>Aktualizacja</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={`${offer.shopId}-${offer.productSlug}`} className={offer.inStock ? undefined : "is-muted"}>
                  <td>{offer.shopName}</td>
                  <td className="price">{formatPLN(offer.price)}</td>
                  <td className="price">{formatUnitPrice(offer.pricePerKg)}</td>
                  <td>
                    <span className={offer.inStock ? "status status-ok" : "status"}>
                      {offer.inStock ? "Dostępny" : "Brak"}
                    </span>
                  </td>
                  <td className="muted">{offer.updatedAt}</td>
                  <td>
                    {offer.url !== "#" && (
                      <a href={offer.url} target="_blank" rel="sponsored nofollow noopener noreferrer">
                        Do sklepu →
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="disclaimer">{niche.disclaimer}</p>

      <div className="grid two-col">
        <section className="card">
          <h2>Historia cen</h2>
          <p className="muted">Wykres pojawi się, gdy zbierzemy historię cen z kolejnych odświeżeń danych.</p>
        </section>
        <section className="card">
          <h2>Alert cenowy</h2>
          <p className="muted">
            Powiadomienie, gdy cena za {niche.unit.label} spadnie poniżej wybranej wartości.
          </p>
          <button className="button" disabled>
            Wkrótce
          </button>
        </section>
      </div>
    </>
  );
}

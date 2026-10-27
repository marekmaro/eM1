import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColourDot } from "@/components/ColourDot";
import { PriceBar } from "@/components/PriceBar";
import { niche } from "@/config/niche";
import { getCatalog, rankedOffersFor } from "@/lib/catalog";
import { formatPLN, formatUnitPrice } from "@/lib/pricing";
import { reportOfferAction } from "./actions";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ report?: string }>;
}

const REPORT_MESSAGES = new Map<string, string>([
  ["sent", "Dziękujemy. Zgłoszenie trafiło do sprawdzenia."],
  ["limit", "Wysłano już kilka zgłoszeń. Spróbuj ponownie później."],
  ["invalid", "Nie udało się wysłać zgłoszenia. Opisz problem w co najmniej 10 znakach."],
]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getCatalog().products.find((item) => item.slug === slug);
  return { title: product?.name ?? "Produkt" };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { report } = await searchParams;

  const catalog = getCatalog();
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product) notFound();

  const offers = rankedOffersFor(catalog, product.slug);
  const inStock = offers.filter((offer) => offer.inStock);
  const best = inStock[0];

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
          <a
            className="button"
            href={`/go/${product.slug}/${best.shopId}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
          >
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
                <th>Porównanie</th>
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
                    {offer.inStock && best ? <PriceBar value={offer.pricePerKg} min={best.pricePerKg} /> : "—"}
                  </td>
                  <td>
                    <span className={offer.inStock ? "status status-ok" : "status"}>
                      {offer.inStock ? "Dostępny" : "Brak"}
                    </span>
                  </td>
                  <td className="muted">{offer.updatedAt}</td>
                  <td>
                    {offer.url !== "#" && (
                      <a
                        href={`/go/${product.slug}/${offer.shopId}`}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                      >
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
          <h2>Zgłoś błędną cenę</h2>
          {report && REPORT_MESSAGES.has(report) && (
            <div className={report === "sent" ? "notice notice-ok" : "notice notice-error"} role="status">
              {REPORT_MESSAGES.get(report)}
            </div>
          )}
          {offers.length === 0 ? (
            <p className="muted">Brak ofert do zgłoszenia.</p>
          ) : (
            <form action={reportOfferAction} className="form-stack">
              <input type="hidden" name="productSlug" value={product.slug} />
              <div className="field">
                <label htmlFor="report-shop">Sklep</label>
                <select id="report-shop" name="shopId" required>
                  {offers.map((offer) => (
                    <option key={offer.shopId} value={offer.shopId}>
                      {offer.shopName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="report-message">Co się nie zgadza? (10–500 znaków)</label>
                <textarea id="report-message" name="message" required minLength={10} maxLength={500} rows={3} />
              </div>
              {/* Pułapka dla botów: ukryte pole, którego człowiek nie widzi ani nie wypełnia. */}
              <div className="hp" aria-hidden="true">
                <label htmlFor="report-website">Nie wypełniaj</label>
                <input id="report-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <button className="button button-secondary" type="submit">
                Wyślij zgłoszenie
              </button>
            </form>
          )}
        </section>

        <section className="card">
          <h2>Alert cenowy</h2>
          <p className="muted">
            Powiadomienie, gdy cena za {niche.unit.label} spadnie poniżej wybranej wartości. Funkcja w przygotowaniu.
          </p>
          <button className="button" disabled>
            Wkrótce
          </button>
        </section>
      </div>
    </>
  );
}

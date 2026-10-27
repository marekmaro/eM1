import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/AdminNotice";
import { ColourDot } from "@/components/ColourDot";
import { ProductFields } from "@/components/ProductFields";
import { niche } from "@/config/niche";
import { getCatalog } from "@/lib/catalog";
import {
  deleteOfferAction,
  deleteProductAction,
  saveOfferAction,
  updateProductAction,
} from "../../../actions";

export const metadata: Metadata = {
  title: "Edycja produktu",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}

export default async function AdminProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { error, saved } = await searchParams;

  const catalog = getCatalog();
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product) notFound();

  const offers = catalog.offers.filter((offer) => offer.productSlug === slug);

  return (
    <>
      <p>
        <Link href="/admin">← Wróć do dashboardu</Link>
      </p>
      <h1>
        <span className="inline-row">
          <ColourDot colour={product.colour} size={28} /> {product.name}
        </span>
      </h1>
      <AdminNotice error={error} saved={saved} />

      <section className="card">
        <h2>Dane produktu</h2>
        <form action={updateProductAction} className="form-stack">
          <input type="hidden" name="originalSlug" value={product.slug} />
          <ProductFields idPrefix="edit" defaults={product} lockSlug />
          <button className="button" type="submit">
            Zapisz produkt
          </button>
        </form>
      </section>

      <h2>Oferty</h2>
      {offers.length === 0 ? (
        <p className="muted">Brak ofert. Dodaj pierwszą poniżej.</p>
      ) : (
        <div className="offer-list">
          {offers.map((offer) => {
            const shop = catalog.shops.find((item) => item.id === offer.shopId);
            return (
              <div className="card offer-edit" key={offer.shopId}>
                <div className="offer-edit-head">
                  <strong>{shop?.name ?? offer.shopId}</strong>
                  <span className="muted">aktualizacja {offer.updatedAt}</span>
                </div>
                <form action={saveOfferAction} className="form-inline">
                  <input type="hidden" name="productSlug" value={product.slug} />
                  <input type="hidden" name="shopId" value={offer.shopId} />
                  <div className="field">
                    <label htmlFor={`price-${offer.shopId}`}>Cena (zł)</label>
                    <input
                      id={`price-${offer.shopId}`}
                      name="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      defaultValue={offer.price}
                    />
                  </div>
                  <div className="field grow">
                    <label htmlFor={`url-${offer.shopId}`}>Link do oferty</label>
                    <input id={`url-${offer.shopId}`} name="url" type="url" required maxLength={500} defaultValue={offer.url} />
                  </div>
                  <label className="checkbox">
                    <input name="inStock" type="checkbox" defaultChecked={offer.inStock} /> Dostępny
                  </label>
                  <button className="button button-small" type="submit">
                    Zapisz
                  </button>
                </form>
                <form action={deleteOfferAction}>
                  <input type="hidden" name="productSlug" value={product.slug} />
                  <input type="hidden" name="shopId" value={offer.shopId} />
                  <button className="button button-danger button-small" type="submit">
                    Usuń ofertę
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      <section className="card">
        <h2>Dodaj ofertę</h2>
        {catalog.shops.length === 0 ? (
          <p className="muted">
            Najpierw dodaj sklep w <Link href="/admin">dashboardzie</Link>.
          </p>
        ) : (
          <form action={saveOfferAction} className="form-inline">
            <input type="hidden" name="productSlug" value={product.slug} />
            <div className="field">
              <label htmlFor="new-offer-shop">Sklep</label>
              <select id="new-offer-shop" name="shopId" required>
                {catalog.shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="new-offer-price">Cena (zł, bez dostawy)</label>
              <input id="new-offer-price" name="price" type="number" step="0.01" min="0.01" required />
            </div>
            <div className="field grow">
              <label htmlFor="new-offer-url">Link do oferty</label>
              <input id="new-offer-url" name="url" type="url" required maxLength={500} placeholder="https://" />
            </div>
            <label className="checkbox">
              <input name="inStock" type="checkbox" defaultChecked /> Dostępny
            </label>
            <button className="button" type="submit">
              Dodaj ofertę
            </button>
          </form>
        )}
        <p className="muted">Cena ma być bez kosztów dostawy. Jednostka {niche.unit.label} liczy się automatycznie.</p>
      </section>

      <section className="card danger-zone">
        <h2>Usuń produkt</h2>
        <p className="muted">Usunięcie produktu kasuje też wszystkie jego oferty. Tej operacji nie da się cofnąć.</p>
        <form action={deleteProductAction} className="form-inline">
          <input type="hidden" name="slug" value={product.slug} />
          <label className="checkbox">
            <input name="confirm" type="checkbox" required /> Rozumiem, usuń produkt
          </label>
          <button className="button button-danger" type="submit">
            Usuń produkt
          </button>
        </form>
      </section>
    </>
  );
}

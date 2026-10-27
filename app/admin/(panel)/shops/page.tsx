import type { Metadata } from "next";
import { AdminNotice } from "@/components/AdminNotice";
import { getCatalog } from "@/lib/catalog";
import { safeHref } from "@/lib/url";
import { createShopAction, deleteShopAction, updateShopAction } from "../../actions";

export const metadata: Metadata = {
  title: "Sklepy · panel",
  robots: { index: false, follow: false },
};

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const catalog = getCatalog();

  return (
    <>
      <h1>Sklepy</h1>
      <p className="lead">Identyfikator sklepu jest stały, bo łączy go z ofertami. Nazwę i adres możesz zmienić.</p>
      <AdminNotice error={error} saved={saved} />

      <div className="offer-list">
        {catalog.shops.map((shop) => {
          const offers = catalog.offers.filter((offer) => offer.shopId === shop.id).length;
          return (
            <section className="card" key={shop.id}>
              <div className="card-head">
                <h2>{shop.name}</h2>
                <span className="muted">{offers} ofert · {shop.id}</span>
              </div>
              <form action={updateShopAction} className="form-inline">
                <input type="hidden" name="id" value={shop.id} />
                <div className="field grow">
                  <label htmlFor={`shop-name-${shop.id}`}>Nazwa</label>
                  <input id={`shop-name-${shop.id}`} name="name" required maxLength={120} defaultValue={shop.name} />
                </div>
                <div className="field grow">
                  <label htmlFor={`shop-url-${shop.id}`}>Adres sklepu</label>
                  <input id={`shop-url-${shop.id}`} name="url" type="url" required maxLength={500} defaultValue={shop.url} />
                </div>
                <button className="button button-small" type="submit">
                  Zapisz
                </button>
              </form>
              <p className="muted">
                Podgląd: <a href={safeHref(shop.url)} target="_blank" rel="nofollow noopener noreferrer">{safeHref(shop.url)}</a>
              </p>
              <details className="danger-details">
                <summary>Usuń sklep</summary>
                <form action={deleteShopAction} className="form-inline">
                  <input type="hidden" name="id" value={shop.id} />
                  <label className="checkbox">
                    <input name="confirm" type="checkbox" required /> Usuń sklep (tylko gdy nie ma ofert)
                  </label>
                  <button className="button button-danger button-small" type="submit">
                    Usuń
                  </button>
                </form>
              </details>
            </section>
          );
        })}
      </div>

      <section className="card">
        <h2>Nowy sklep</h2>
        <form action={createShopAction} className="form-inline">
          <div className="field">
            <label htmlFor="new-shop-id">Identyfikator (slug)</label>
            <input id="new-shop-id" name="id" required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="sklep-x" />
          </div>
          <div className="field grow">
            <label htmlFor="new-shop-name">Nazwa</label>
            <input id="new-shop-name" name="name" required maxLength={120} />
          </div>
          <div className="field grow">
            <label htmlFor="new-shop-url">Adres (https://)</label>
            <input id="new-shop-url" name="url" type="url" required maxLength={500} />
          </div>
          <button className="button" type="submit">
            Dodaj sklep
          </button>
        </form>
      </section>
    </>
  );
}

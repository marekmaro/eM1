import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/AdminNotice";
import { ProductFields } from "@/components/ProductFields";
import { createProductAction } from "../../../actions";

export const metadata: Metadata = {
  title: "Nowy produkt · panel",
  robots: { index: false, follow: false },
};

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <>
      <p>
        <Link href="/admin/products">← Produkty</Link>
      </p>
      <h1>Nowy produkt</h1>
      <p className="lead">Slug to fragment adresu, np. „marka-pla-matt-1kg-czarny”. Później nie da się go zmienić.</p>
      <AdminNotice error={error} />

      <section className="card">
        <form action={createProductAction} className="form-stack">
          <ProductFields idPrefix="new" />
          <button className="button" type="submit">
            Dodaj produkt
          </button>
        </form>
      </section>
    </>
  );
}

import Link from "next/link";
import type { CSSProperties } from "react";
import { ColourDot } from "@/components/ColourDot";
import { colourToHex } from "@/lib/colours";
import { formatUnitPrice } from "@/lib/pricing";
import type { Product, RankedOffer } from "@/lib/types";

export function ProductCard({
  product,
  best,
  badge,
}: {
  product: Product;
  best?: RankedOffer;
  badge?: string;
}) {
  // Kolor filamentu idzie na górną krawędź karty, dzięki czemu katalog wygląda jak półka z szpulami.
  const style = { "--swatch": colourToHex(product.colour) } as CSSProperties;

  return (
    <Link href={`/products/${product.slug}`} className={`product-card${badge ? " featured" : ""}`} style={style}>
      <div className="product-card-top">
        <ColourDot colour={product.colour} />
        <span className="chip">{product.material}</span>
        {badge && <span className="badge badge-accent">{badge}</span>}
      </div>
      <h3>{product.name}</h3>
      <p className="muted">
        {product.brand} · {product.netWeightG} g
      </p>
      {best ? (
        <div className="offer-summary">
          <div className="unit-price">{formatUnitPrice(best.pricePerKg)}</div>
          <div className="muted">w {best.shopName}</div>
        </div>
      ) : (
        <div className="muted">Brak w sprzedaży</div>
      )}
    </Link>
  );
}

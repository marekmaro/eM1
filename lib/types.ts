export type Material = string;

export interface Shop {
  id: string;
  name: string;
  url: string;
}

export interface Product {
  slug: string;
  name: string;
  brand: string;
  material: Material;
  diameterMm: number;
  colour: string;
  netWeightG: number;
}

export interface Offer {
  productSlug: string;
  shopId: string;
  price: number;
  url: string;
  inStock: boolean;
  updatedAt: string;
}

export interface Catalog {
  updatedAt: string;
  shops: Shop[];
  products: Product[];
  offers: Offer[];
}

export interface RankedOffer extends Offer {
  shopName: string;
  pricePerKg: number;
}

import { todayIso } from "@/lib/dates";
import { offerSchema } from "@/lib/schema";
import type { Catalog, Offer } from "@/lib/types";

// Import i eksport ofert w CSV. Akceptujemy separator ";" (Excel w polskiej lokalizacji)
// albo ",", oraz polskie nazwy kolumn.

const MAX_ROWS = 500;
const MAX_ERRORS = 50;

type ColumnName = "product" | "shop" | "price" | "stock" | "url";

const REQUIRED_COLUMNS: ColumnName[] = ["product", "shop", "price", "stock", "url"];

const COLUMN_ALIASES: Partial<Record<string, ColumnName>> = {
  productslug: "product",
  produkt: "product",
  slug: "product",
  shopid: "shop",
  sklep: "shop",
  price: "price",
  cena: "price",
  instock: "stock",
  dostepny: "stock",
  stock: "stock",
  url: "url",
  link: "url",
};

const TRUE_VALUES = new Set(["1", "tak", "yes", "true", "t"]);
const FALSE_VALUES = new Set(["0", "nie", "no", "false", "f"]);

export interface ImportResult {
  offers: Offer[];
  errors: string[];
}

function splitLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

export function parseOffersCsv(text: string, catalog: Catalog): ImportResult {
  const lines = text
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) return { offers: [], errors: ["Plik jest pusty."] };
  if (lines.length - 1 > MAX_ROWS) return { offers: [], errors: [`Maksymalnie ${MAX_ROWS} wierszy naraz.`] };

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const header = splitLine(lines[0], delimiter).map(
    (name) => COLUMN_ALIASES[name.toLowerCase().replace(/[\s_-]/g, "")],
  );

  const missing = REQUIRED_COLUMNS.filter((column) => !header.includes(column));
  if (missing.length > 0) {
    return { offers: [], errors: [`Brak wymaganych kolumn: ${missing.join(", ")}.`] };
  }

  const productSlugs = new Set(catalog.products.map((product) => product.slug));
  const shopIds = new Set(catalog.shops.map((shop) => shop.id));
  const seen = new Set<string>();
  const offers: Offer[] = [];
  const errors: string[] = [];
  const updatedAt = todayIso();

  for (let index = 1; index < lines.length; index++) {
    const line = index + 1;
    const cells = splitLine(lines[index], delimiter);
    const get = (column: ColumnName) => cells[header.indexOf(column)] ?? "";

    const fail = (message: string) => {
      if (errors.length < MAX_ERRORS) errors.push(`Wiersz ${line}: ${message}`);
    };

    const productSlug = get("product");
    const shopId = get("shop");
    if (!productSlugs.has(productSlug)) {
      fail(`nieznany produkt „${productSlug.slice(0, 60)}”`);
      continue;
    }
    if (!shopIds.has(shopId)) {
      fail(`nieznany sklep „${shopId.slice(0, 60)}”`);
      continue;
    }

    const stockValue = get("stock").toLowerCase();
    if (!TRUE_VALUES.has(stockValue) && !FALSE_VALUES.has(stockValue)) {
      fail("dostępność musi być 1/0 albo tak/nie");
      continue;
    }

    const parsed = offerSchema.safeParse({
      productSlug,
      shopId,
      price: get("price").replace(",", "."),
      url: get("url"),
      inStock: TRUE_VALUES.has(stockValue),
      updatedAt,
    });
    if (!parsed.success) {
      fail(parsed.error.issues[0]?.message ?? "nieprawidłowe dane");
      continue;
    }

    const key = `${productSlug}|${shopId}`;
    if (seen.has(key)) {
      fail(`zduplikowana oferta ${productSlug} / ${shopId}`);
      continue;
    }
    seen.add(key);
    offers.push(parsed.data);
  }

  return { offers, errors };
}

// Zabezpieczenie przed CSV injection: wartości zaczynające się od = + - @ dostają apostrof.
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[";\r\n"]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function offersToCsv(catalog: Catalog): string {
  const header = "productSlug;shopId;price;inStock;url;updatedAt";
  const rows = catalog.offers.map((offer) =>
    [
      offer.productSlug,
      offer.shopId,
      String(offer.price).replace(".", ","),
      offer.inStock ? "1" : "0",
      offer.url,
      offer.updatedAt,
    ]
      .map(csvCell)
      .join(";"),
  );
  return `${[header, ...rows].join("\r\n")}\r\n`;
}

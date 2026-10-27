import { accessSync, constants, existsSync, statSync } from "node:fs";
import { getCatalog, rankedOffersFor } from "@/lib/catalog";
import { daysSince } from "@/lib/dates";
import { openReportCount } from "@/lib/reports";
import { adminEnabled } from "@/lib/session";
import { DATA_DIR, dataFile } from "@/lib/store";

// Kondycja serwisu: katalog, dane, konfiguracja i zasoby. Każdy check ma prosty status.
export type Status = "ok" | "warn" | "error";

export interface HealthCheck {
  label: string;
  status: Status;
  detail: string;
}

export interface Health {
  status: Status;
  checks: HealthCheck[];
  facts: { label: string; value: string }[];
}

const STALE_DAYS = 7;
const MAX_RSS_MB = 800;

const WORST: Record<Status, number> = { ok: 0, warn: 1, error: 2 };

function fileSizeKb(name: string): string {
  const file = dataFile(name);
  return existsSync(file) ? `${Math.round(statSync(file).size / 1024)} kB` : "brak";
}

export function getHealth(): Health {
  const checks: HealthCheck[] = [];

  try {
    const catalog = getCatalog();
    const offers = catalog.offers;
    const stale = offers.filter((offer) => daysSince(offer.updatedAt) > STALE_DAYS).length;
    const inStock = offers.filter((offer) => offer.inStock).length;
    const productsWithoutOffers = catalog.products.filter(
      (product) => rankedOffersFor(catalog, product.slug).length === 0,
    ).length;
    const shopsWithoutOffers = catalog.shops.filter(
      (shop) => !offers.some((offer) => offer.shopId === shop.id),
    ).length;
    const reports = openReportCount();

    checks.push({
      label: "Katalog",
      status: "ok",
      detail: `${catalog.products.length} produktów, ${catalog.shops.length} sklepów, ${offers.length} ofert`,
    });
    checks.push({
      label: "Aktualność cen",
      status: stale > 0 ? "warn" : "ok",
      detail: stale > 0 ? `${stale} ofert starszych niż ${STALE_DAYS} dni` : "wszystkie oferty są świeże",
    });
    checks.push({
      label: "Dostępność",
      status: inStock === 0 ? "warn" : "ok",
      detail: `${inStock} z ${offers.length} ofert dostępnych`,
    });
    checks.push({
      label: "Pokrycie produktów",
      status: productsWithoutOffers > 0 || shopsWithoutOffers > 0 ? "warn" : "ok",
      detail:
        productsWithoutOffers > 0 || shopsWithoutOffers > 0
          ? `${productsWithoutOffers} produktów bez ofert, ${shopsWithoutOffers} sklepów bez ofert`
          : "każdy produkt i sklep ma oferty",
    });
    checks.push({
      label: "Zgłoszenia",
      status: reports > 0 ? "warn" : "ok",
      detail: reports > 0 ? `${reports} otwartych zgłoszeń do sprawdzenia` : "brak otwartych zgłoszeń",
    });
  } catch {
    checks.push({
      label: "Katalog",
      status: "error",
      detail: "plik katalogu nie przechodzi walidacji. Sprawdź data/catalog.json",
    });
  }

  let writable = true;
  try {
    accessSync(DATA_DIR, constants.W_OK);
  } catch {
    writable = false;
  }
  checks.push({
    label: "Zapis danych",
    status: writable ? "ok" : "error",
    detail: writable ? "katalog data/ jest zapisywalny" : "brak uprawnień do zapisu w data/",
  });

  checks.push({
    label: "Panel admina",
    status: adminEnabled() ? "ok" : "warn",
    detail: adminEnabled() ? "logowanie skonfigurowane" : "brak ADMIN_PASSWORD lub ADMIN_SESSION_SECRET",
  });

  const rssMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
  checks.push({
    label: "Pamięć procesu",
    status: rssMb > MAX_RSS_MB ? "warn" : "ok",
    detail: `${rssMb} MB (próg ostrzeżenia ${MAX_RSS_MB} MB)`,
  });

  const status = checks.reduce<Status>((worst, check) => (WORST[check.status] > WORST[worst] ? check.status : worst), "ok");

  return {
    status,
    checks,
    facts: [
      { label: "Środowisko", value: process.env.NODE_ENV ?? "nieustawione" },
      { label: "Node.js", value: process.version },
      { label: "Czas działania", value: formatUptime(process.uptime()) },
      { label: "Dane katalogu", value: fileSizeKb("catalog.json") },
      { label: "Dziennik zdarzeń", value: fileSizeKb("audit.log") },
      { label: "Statystyki kliknięć", value: fileSizeKb("clicks.json") },
    ],
  };
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days > 0 ? `${days} d ${hours} h` : `${hours} h ${minutes} min`;
}

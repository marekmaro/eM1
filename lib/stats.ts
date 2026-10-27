import { isoDaysAgo, todayIso } from "@/lib/dates";
import { readJson, writeJson } from "@/lib/store";

// Liczniki kliknięć w sklepy. Zapisujemy tylko sumy dzienne per oferta.
// Nie zapisujemy adresów IP, identyfikatorów ani nagłówków przeglądarki.
const FILE = "clicks.json";
const KEEP_DAYS = 180;

// dzień (YYYY-MM-DD) → "slug produktu|id sklepu" → liczba kliknięć
type ClickFile = { days: Record<string, Record<string, number>> };

function bucketTotal(bucket: Record<string, number> | undefined): number {
  return Object.values(bucket ?? {}).reduce((sum, count) => sum + count, 0);
}

export function recordClick(productSlug: string, shopId: string): void {
  const data = readJson<ClickFile>(FILE, { days: {} });
  const day = (data.days[todayIso()] ??= {});
  const key = `${productSlug}|${shopId}`;
  day[key] = (day[key] ?? 0) + 1;

  const cutoff = isoDaysAgo(KEEP_DAYS);
  for (const date of Object.keys(data.days)) {
    if (date < cutoff) delete data.days[date];
  }
  writeJson(FILE, data);
}

export function resetClicks(): void {
  writeJson(FILE, { days: {} });
}

export interface ClickSummary {
  total: number;
  last7: number;
  last30: number;
  daily: { date: string; count: number }[];
  topOffers: { productSlug: string; shopId: string; count: number }[];
  byShop: { shopId: string; count: number }[];
}

export function clickSummary(): ClickSummary {
  const { days } = readJson<ClickFile>(FILE, { days: {} });

  const daily = Array.from({ length: 30 }, (_, index) => {
    const date = isoDaysAgo(29 - index);
    return { date, count: bucketTotal(days[date]) };
  });

  const offerTotals = new Map<string, number>();
  for (const date of daily.map((day) => day.date)) {
    for (const [key, count] of Object.entries(days[date] ?? {})) {
      offerTotals.set(key, (offerTotals.get(key) ?? 0) + count);
    }
  }

  const topOffers = [...offerTotals.entries()]
    .map(([key, count]) => {
      const [productSlug, shopId] = key.split("|");
      return { productSlug, shopId, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const shopTotals = new Map<string, number>();
  for (const { shopId, count } of topOffers) {
    shopTotals.set(shopId, (shopTotals.get(shopId) ?? 0) + count);
  }

  return {
    total: Object.keys(days).reduce((sum, date) => sum + bucketTotal(days[date]), 0),
    last7: daily.slice(-7).reduce((sum, day) => sum + day.count, 0),
    last30: daily.reduce((sum, day) => sum + day.count, 0),
    daily,
    topOffers,
    byShop: [...shopTotals.entries()]
      .map(([shopId, count]) => ({ shopId, count }))
      .sort((a, b) => b.count - a.count),
  };
}

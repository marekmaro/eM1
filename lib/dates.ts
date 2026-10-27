const DAY_MS = 86_400_000;

// Daty w katalogu to YYYY-MM-DD w UTC. Wszystkie obliczenia trzymamy w tej samej strefie.
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);
}

export function daysSince(isoDate: string): number {
  const then = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - then) / DAY_MS);
}

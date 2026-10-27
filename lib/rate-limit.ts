interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_TRACKED_KEYS = 10_000;

// Limit w pamięci procesu. Wystarczy dla jednego serwera. Przy kilku instancjach
// trzeba przenieść go do wspólnego magazynu (np. Redis).
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  return {
    allow(key: string): boolean {
      const now = Date.now();
      if (buckets.size > MAX_TRACKED_KEYS) buckets.clear();

      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (bucket.count >= maxAttempts) return false;

      bucket.count += 1;
      return true;
    },
    reset(key: string): void {
      buckets.delete(key);
    },
  };
}

export const loginLimiter = createRateLimiter(5, 15 * 60 * 1000);
export const reportLimiter = createRateLimiter(5, 60 * 60 * 1000);

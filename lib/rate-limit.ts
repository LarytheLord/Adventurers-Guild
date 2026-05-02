type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const globalRateLimitState = globalThis as typeof globalThis & {
  rateLimitStores?: Map<string, RateLimitStore>;
};

const rateLimitStores = globalRateLimitState.rateLimitStores ?? new Map<string, RateLimitStore>();
if (!globalRateLimitState.rateLimitStores) {
  globalRateLimitState.rateLimitStores = rateLimitStores;
}

function getStore(bucket: string): RateLimitStore {
  const existingStore = rateLimitStores.get(bucket);
  if (existingStore) {
    return existingStore;
  }

  const nextStore = new Map<string, RateLimitEntry>();
  rateLimitStores.set(bucket, nextStore);
  return nextStore;
}

export function consumeRateLimit(
  bucket: string,
  key: string,
  options: { windowMs: number; maxRequests: number }
) {
  const store = getStore(bucket);
  const now = Date.now();
  const currentEntry = store.get(key);

  if (!currentEntry || now > currentEntry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetAt: now + options.windowMs,
    };
  }

  const nextCount = currentEntry.count + 1;
  const updatedEntry = { ...currentEntry, count: nextCount };
  store.set(key, updatedEntry);

  return {
    allowed: nextCount <= options.maxRequests,
    remaining: Math.max(0, options.maxRequests - nextCount),
    resetAt: updatedEntry.resetAt,
  };
}

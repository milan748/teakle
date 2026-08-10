const buckets = new Map();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > entry.windowMs * 2) {
      buckets.delete(key);
    }
  }
}

setInterval(cleanup, 60000).unref?.();

export function rateLimit(key, { limit = 10, windowMs = 60000 } = {}) {
  const now = Date.now();
  let entry = buckets.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    entry = { windowStart: now, count: 0, windowMs };
    buckets.set(key, entry);
  }

  entry.count++;

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetMs: windowMs - (now - entry.windowStart),
  };
}

export const RATE_LIMITS = {
  adminLogin: { limit: 5, windowMs: 15 * 60 * 1000 },
  customerLogin: { limit: 10, windowMs: 15 * 60 * 1000 },
  customerRegister: { limit: 5, windowMs: 60 * 1000 },
  orderCreate: { limit: 3, windowMs: 5 * 60 * 1000 },
};

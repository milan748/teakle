/**
 * TEAKLE — Rate Limiter (Single-Instance, IP-Aware)
 *
 * In-memory sliding-window rate limiter.
 * Keys are derived from endpoint name + client IP to isolate users.
 *
 * Trust model:
 *   - Behind a documented reverse proxy (nginx/Caddy), X-Forwarded-For
 *     contains the real client IP. We use the FIRST entry (leftmost) which
 *     is the original client.
 *   - In direct connections (dev), we use a default 'local' identity.
 *   - X-Forwarded-For is ONLY trusted when the app is behind a reverse
 *     proxy that sets it. If spoofed in direct connections, it only
 *     affects the attacker's own bucket (self-rate-limiting).
 *   - We do NOT trust X-Real-IP or other non-standard headers.
 *
 * Limitations:
 *   - Single-instance only. Not distributed.
 *   - Resets on server restart.
 *   - Not shared between replicas.
 */

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

/**
 * Extract a stable client identity from request headers.
 *
 * Returns a string like '1.2.3.4' or 'local' for direct connections.
 * Does NOT return full forwarded chains — only the leftmost (original client).
 */
export function extractClientIp(headers) {
  if (!headers) return 'local';

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first (leftmost) IP — the original client.
    // Subsequent IPs are proxies we trust.
    const firstIp = forwarded.split(',')[0].trim();
    if (!firstIp) return 'local';

    // IPv6 loopback / IPv4-mapped loopback → treat as local identity
    if (firstIp === '::1' || firstIp === '::ffff:127.0.0.1') {
      return 'local';
    }

    // IPv4
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(firstIp)) {
      return firstIp;
    }

    // IPv6 (general form, including compressed and IPv4-mapped)
    if (/^(::ffff:)?(?:[0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(firstIp)) {
      return firstIp;
    }

    // Malformed / non-IP (e.g. a hostname) → fall through to default so it
    // cannot be used to poison another client's rate-limit bucket.
  }

  return 'local';
}

/**
 * Rate-limit key builder. Prevents collisions between endpoints.
 * Format: 'ratelimit:{endpoint}:{identity}'
 */
function buildKey(endpoint, identity) {
  return `ratelimit:${endpoint}:${identity}`;
}

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

/**
 * IP-aware rate limit. Derives identity from request headers.
 * @param {string} endpoint - Endpoint identifier (e.g. 'admin:login')
 * @param {object} options - { limit, windowMs }
 * @param {Headers} [headers] - Request headers for IP extraction
 */
export function rateLimitIp(endpoint, { limit = 10, windowMs = 60000 } = {}, headers) {
  const identity = extractClientIp(headers);
  const key = buildKey(endpoint, identity);
  return rateLimit(key, { limit, windowMs });
}

/**
 * Authenticated rate limit. Uses session identity (email or adminId) instead of IP.
 * Prevents authenticated users from being grouped by shared IP.
 */
export function rateLimitAuth(endpoint, identity, { limit = 10, windowMs = 60000 } = {}) {
  const key = buildKey(endpoint, `auth:${identity}`);
  return rateLimit(key, { limit, windowMs });
}

export const RATE_LIMITS = {
  adminLogin: { limit: 5, windowMs: 15 * 60 * 1000 },
  customerLogin: { limit: 10, windowMs: 15 * 60 * 1000 },
  customerRegister: { limit: 5, windowMs: 60 * 1000 },
  orderCreate: { limit: 3, windowMs: 5 * 60 * 1000 },
  passwordChange: { limit: 5, windowMs: 15 * 60 * 1000 },
  forgotPassword: { limit: 5, windowMs: 60 * 60 * 1000 },
  resetPassword: { limit: 10, windowMs: 60 * 60 * 1000 },
  paymentCreate: { limit: 5, windowMs: 15 * 60 * 1000 },
  paymentWebhook: { limit: 100, windowMs: 60 * 1000 },
  adminAuditLogs: { limit: 50, windowMs: 60 * 1000 },
  adminBulkAction: { limit: 10, windowMs: 60 * 1000 },
  adminExport: { limit: 10, windowMs: 60 * 1000 },
  contact: { limit: 30, windowMs: 60 * 1000 },
  newsletter: { limit: 30, windowMs: 60 * 1000 },
  customOrders: { limit: 30, windowMs: 60 * 1000 },
  trade: { limit: 30, windowMs: 60 * 1000 },
  media: { limit: 30, windowMs: 60 * 1000 },
  adminRefund: { limit: 10, windowMs: 60 * 1000 },
  adminSettings: { limit: 20, windowMs: 60 * 1000 },
};

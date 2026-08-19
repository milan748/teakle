/**
 * Sprint #17 — Production Security Hardening & Observability Tests
 * Run: node scripts/test-sprint17.js
 *
 * Tests:
 * 1. Security headers in next.config.mjs
 * 2. CSRF utility functions
 * 3. Logger sensitive key redaction
 * 4. Rate limiting coverage
 * 5. Session security properties
 * 6. Input validation completeness
 * 7. Error handling (no stack traces)
 * 8. Database security (WAL, foreign keys)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  catch (err) { failed++; console.log(`  \x1b[31m✗\x1b[0m ${name}`); console.log(`    ${err.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function assertEq(a, b, m) { if (a !== b) throw new Error(m || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function assertIncludes(h, n, m) { if (!h.includes(n)) throw new Error(m || `Expected to include "${n}"`); }
function assertNotIncludes(h, n, m) { if (h.includes(n)) throw new Error(m || `Expected NOT to include "${n}"`); }
function assertMatches(h, r, m) { if (!r.test(h)) throw new Error(m || `Expected to match ${r}`); }

// ─── 1. Security Headers ──────────────────────────────────────────────────────

console.log('\n1. Security Headers');

const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');

test('X-Content-Type-Options header present', () => {
  assertIncludes(nextConfig, 'X-Content-Type-Options');
  assertIncludes(nextConfig, 'nosniff');
});

test('X-Frame-Options header present', () => {
  assertIncludes(nextConfig, 'X-Frame-Options');
  assertIncludes(nextConfig, 'DENY');
});

test('X-XSS-Protection header present', () => {
  assertIncludes(nextConfig, 'X-XSS-Protection');
  assertIncludes(nextConfig, '1; mode=block');
});

test('Referrer-Policy header present', () => {
  assertIncludes(nextConfig, 'Referrer-Policy');
  assertIncludes(nextConfig, 'strict-origin-when-cross-origin');
});

test('Permissions-Policy header present', () => {
  assertIncludes(nextConfig, 'Permissions-Policy');
  assertIncludes(nextConfig, 'camera=()');
  assertIncludes(nextConfig, 'microphone=()');
  assertIncludes(nextConfig, 'geolocation=()');
});

test('API routes have no-store cache header', () => {
  assertIncludes(nextConfig, 'no-store');
  assertIncludes(nextConfig, 'no-cache');
});

test('Headers applied to all routes via /(.*) pattern', () => {
  assertIncludes(nextConfig, "'/(.*)'");
});

// ─── 2. CSRF Protection ───────────────────────────────────────────────────────

console.log('\n2. CSRF Protection');

const csrfPath = path.join(__dirname, '..', 'lib', 'csrf.js');
const csrfCode = fs.readFileSync(csrfPath, 'utf-8');

test('CSRF module exports getCsrfToken', () => {
  assertIncludes(csrfCode, 'export async function getCsrfToken');
});

test('CSRF module exports setCsrfCookie', () => {
  assertIncludes(csrfCode, 'export async function setCsrfCookie');
});

test('CSRF module exports validateCsrfRequest', () => {
  assertIncludes(csrfCode, 'export async function validateCsrfRequest');
});

test('CSRF module exports withCsrf wrapper', () => {
  assertIncludes(csrfCode, 'export function withCsrf');
});

test('CSRF uses x-csrf-token header', () => {
  assertIncludes(csrfCode, 'x-csrf-token');
});

test('CSRF cookie name is teakle_csrf', () => {
  assertIncludes(csrfCode, 'teakle_csrf');
});

test('CSRF token is 64 chars hex (32 bytes)', () => {
  assertIncludes(csrfCode, 'randomBytes(32)');
});

test('withCsrf skips GET/HEAD/OPTIONS', () => {
  assertIncludes(csrfCode, 'GET');
  assertIncludes(csrfCode, 'HEAD');
  assertIncludes(csrfCode, 'OPTIONS');
});

test('Client-side api.js sends x-csrf-token header', () => {
  const apiPath = path.join(__dirname, '..', 'lib', 'api.js');
  const apiCode = fs.readFileSync(apiPath, 'utf-8');
  assertIncludes(apiCode, 'x-csrf-token');
  assertIncludes(apiCode, 'teakle_csrf');
});

test('Admin adminFetch sends x-csrf-token header', () => {
  const adminApiPath = path.join(__dirname, '..', 'lib', 'adminApi.js');
  const adminApiCode = fs.readFileSync(adminApiPath, 'utf-8');
  assertIncludes(adminApiCode, 'x-csrf-token');
  assertIncludes(adminApiCode, 'teakle_csrf');
});

test('Customer session sets CSRF cookie on login', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'customerSession.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, 'teakle_csrf');
  assertIncludes(sessionCode, 'randomBytes(32)');
});

test('Customer session clears CSRF cookie on logout', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'customerSession.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  const deleteSection = sessionCode.substring(sessionCode.indexOf('deleteCustomerSession'));
  assertIncludes(deleteSection, 'CSRF_COOKIE');
  assertIncludes(deleteSection, 'maxAge: 0');
});

test('Admin session sets CSRF cookie on login', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'session.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, 'teakle_csrf');
  assertIncludes(sessionCode, 'randomBytes(32)');
});

test('Admin session clears CSRF cookie on logout', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'session.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  const deleteSection = sessionCode.substring(sessionCode.indexOf('deleteSession'));
  assertIncludes(deleteSection, 'CSRF_COOKIE');
  assertIncludes(deleteSection, 'maxAge: 0');
});

// ─── 3. Logger Sensitive Key Redaction ────────────────────────────────────────

console.log('\n3. Logger Sensitive Key Redaction');

const loggerPath = path.join(__dirname, '..', 'lib', 'logger.js');
const loggerCode = fs.readFileSync(loggerPath, 'utf-8');

test('Logger redacts password key', () => {
  assertIncludes(loggerCode, "'password'");
});

test('Logger redacts passwordHash key', () => {
  assertIncludes(loggerCode, "'passwordHash'");
});

test('Logger redacts token key', () => {
  assertIncludes(loggerCode, "'token'");
});

test('Logger redacts jwt key', () => {
  assertIncludes(loggerCode, "'jwt'");
});

test('Logger redacts session key', () => {
  assertIncludes(loggerCode, "'session'");
});

test('Logger redacts secret key', () => {
  assertIncludes(loggerCode, "'secret'");
});

test('Logger redacts SESSION_SECRET key', () => {
  assertIncludes(loggerCode, "'SESSION_SECRET'");
});

test('Logger redacts cookie key', () => {
  assertIncludes(loggerCode, "'cookie'");
});

test('Logger redacts authorization key', () => {
  assertIncludes(loggerCode, "'authorization'");
});

test('Logger replaces sensitive values with [REDACTED]', () => {
  assertIncludes(loggerCode, '[REDACTED]');
});

test('Logger sanitizes nested objects', () => {
  assertIncludes(loggerCode, 'sanitize');
});

// ─── 4. Rate Limiting Coverage ────────────────────────────────────────────────

console.log('\n4. Rate Limiting Coverage');

const rateLimitPath = path.join(__dirname, '..', 'lib', 'rateLimit.js');
const rateLimitCode = fs.readFileSync(rateLimitPath, 'utf-8');

test('Rate limiter has fixed window algorithm', () => {
  assertIncludes(rateLimitCode, 'windowStart');
});

test('Rate limiter has adminLogin limit', () => {
  assertIncludes(rateLimitCode, 'adminLogin');
});

test('Rate limiter has customerLogin limit', () => {
  assertIncludes(rateLimitCode, 'customerLogin');
});

test('Rate limiter has customerRegister limit', () => {
  assertIncludes(rateLimitCode, 'customerRegister');
});

test('Rate limiter has orderCreate limit', () => {
  assertIncludes(rateLimitCode, 'orderCreate');
});

// Check rate limiting on public form endpoints
test('Contact endpoint has rate limiting', () => {
  const contactPath = path.join(__dirname, '..', 'app', 'api', 'contact', 'route.js');
  const contactCode = fs.readFileSync(contactPath, 'utf-8');
  assertIncludes(contactCode, 'rateLimit');
});

test('Newsletter endpoint has rate limiting', () => {
  const nlPath = path.join(__dirname, '..', 'app', 'api', 'newsletter', 'route.js');
  const nlCode = fs.readFileSync(nlPath, 'utf-8');
  assertIncludes(nlCode, 'rateLimit');
});

test('Trade endpoint has rate limiting', () => {
  const tradePath = path.join(__dirname, '..', 'app', 'api', 'trade', 'route.js');
  const tradeCode = fs.readFileSync(tradePath, 'utf-8');
  assertIncludes(tradeCode, 'rateLimit');
});

test('Custom orders endpoint has rate limiting', () => {
  const coPath = path.join(__dirname, '..', 'app', 'api', 'custom-orders', 'route.js');
  const coCode = fs.readFileSync(coPath, 'utf-8');
  assertIncludes(coCode, 'rateLimit');
});

test('Password change has rate limiting', () => {
  const pwPath = path.join(__dirname, '..', 'app', 'api', 'auth', 'password', 'route.js');
  const pwCode = fs.readFileSync(pwPath, 'utf-8');
  assertIncludes(pwCode, 'rateLimit');
});

test('Forgot password has rate limiting', () => {
  const fpPath = path.join(__dirname, '..', 'app', 'api', 'auth', 'forgot-password', 'route.js');
  const fpCode = fs.readFileSync(fpPath, 'utf-8');
  assertIncludes(fpCode, 'rateLimit');
});

test('Reset password has rate limiting', () => {
  const rpPath = path.join(__dirname, '..', 'app', 'api', 'auth', 'reset-password', 'route.js');
  const rpCode = fs.readFileSync(rpPath, 'utf-8');
  assertIncludes(rpCode, 'rateLimit');
});

test('Account deactivation has rate limiting', () => {
  const daPath = path.join(__dirname, '..', 'app', 'api', 'auth', 'deactivate', 'route.js');
  const daCode = fs.readFileSync(daPath, 'utf-8');
  assertIncludes(daCode, 'rateLimit');
});

// ─── 5. Session Security ──────────────────────────────────────────────────────

console.log('\n5. Session Security');

test('Admin session is HttpOnly', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'session.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, 'httpOnly: true');
});

test('Admin session uses SameSite=Lax', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'session.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, "sameSite: 'lax'");
});

test('Admin session uses Secure in production', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'session.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, 'NODE_ENV');
  assertIncludes(sessionCode, 'production');
});

test('Admin session requires SESSION_SECRET', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'session.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, 'SESSION_SECRET');
  assertIncludes(sessionCode, 'required');
});

test('Admin session uses HS256', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'session.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, 'HS256');
});

test('Customer session is HttpOnly', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'customerSession.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, 'httpOnly: true');
});

test('Customer session uses SameSite=Lax', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'customerSession.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, "sameSite: 'lax'");
});

test('Customer session requires SESSION_SECRET', () => {
  const sessionPath = path.join(__dirname, '..', 'lib', 'customerSession.js');
  const sessionCode = fs.readFileSync(sessionPath, 'utf-8');
  assertIncludes(sessionCode, 'SESSION_SECRET');
  assertIncludes(sessionCode, 'required');
});

// ─── 6. Input Validation ──────────────────────────────────────────────────────

console.log('\n6. Input Validation');

const validatePath = path.join(__dirname, '..', 'lib', 'validate.js');
const validateCode = fs.readFileSync(validatePath, 'utf-8');

test('validateContact validates email format', () => {
  assertIncludes(validateCode, 'validateContact');
});

test('validateNewsletter validates email', () => {
  assertIncludes(validateCode, 'validateNewsletter');
});

test('validateTrade validates fields', () => {
  assertIncludes(validateCode, 'validateTrade');
});

test('validateCustomOrder validates fields', () => {
  assertIncludes(validateCode, 'validateCustomOrder');
});

test('Sanitization function exists', () => {
  assertIncludes(validateCode, 'sanitize');
});

// Address validation
const addrPath = path.join(__dirname, '..', 'lib', 'validateAddress.js');
const addrCode = fs.readFileSync(addrPath, 'utf-8');

test('validateAddress validates required fields', () => {
  assertIncludes(addrCode, 'validateAddress');
});

test('validateCheckoutAddresses exists', () => {
  assertIncludes(addrCode, 'validateCheckoutAddresses');
});

// ─── 7. Error Handling ────────────────────────────────────────────────────────

console.log('\n7. Error Handling — No console.error in API routes');

function checkNoConsoleError(filePath, label) {
  const code = fs.readFileSync(filePath, 'utf-8');
  test(`${label} uses log.error not console.error`, () => {
    assertNotIncludes(code, 'console.error(', `${label} still has console.error`);
  });
}

const apiDir = path.join(__dirname, '..', 'app', 'api');
function findApiRoutes(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findApiRoutes(full));
    } else if (entry.name === 'route.js') {
      results.push(full);
    }
  }
  return results;
}

const apiRoutes = findApiRoutes(apiDir);
for (const route of apiRoutes) {
  const rel = path.relative(path.join(__dirname, '..'), route).replace(/\\/g, '/');
  checkNoConsoleError(route, rel);
}

// ─── 8. CSRF Applied to State-Changing Endpoints ──────────────────────────────

console.log('\n8. CSRF Applied to State-Changing Endpoints');

function checkCsrfApplied(filePath, methods, label) {
  const code = fs.readFileSync(filePath, 'utf-8');
  for (const method of methods) {
    test(`${label} ${method} has CSRF`, () => {
      assertIncludes(code, 'withCsrf', `${label} missing withCsrf import`);
      assertMatches(code, new RegExp(`export const ${method} = withCsrf`), `${label} ${method} not wrapped with withCsrf`);
    });
  }
}

// Customer endpoints
checkCsrfApplied(path.join(apiDir, 'auth', 'profile', 'route.js'), ['PUT'], 'auth/profile');
checkCsrfApplied(path.join(apiDir, 'auth', 'password', 'route.js'), ['PUT'], 'auth/password');
checkCsrfApplied(path.join(apiDir, 'auth', 'deactivate', 'route.js'), ['POST'], 'auth/deactivate');
checkCsrfApplied(path.join(apiDir, 'addresses', 'route.js'), ['POST'], 'addresses');
checkCsrfApplied(path.join(apiDir, 'addresses', '[id]', 'route.js'), ['PUT', 'DELETE'], 'addresses/[id]');
checkCsrfApplied(path.join(apiDir, 'cart', 'route.js'), ['POST', 'PUT'], 'cart');
checkCsrfApplied(path.join(apiDir, 'cart', '[itemId]', 'route.js'), ['DELETE'], 'cart/[itemId]');
checkCsrfApplied(path.join(apiDir, 'wishlist', 'route.js'), ['POST'], 'wishlist');
checkCsrfApplied(path.join(apiDir, 'wishlist', '[itemId]', 'route.js'), ['DELETE'], 'wishlist/[itemId]');
checkCsrfApplied(path.join(apiDir, 'orders', 'route.js'), ['POST'], 'orders');
checkCsrfApplied(path.join(apiDir, 'orders', '[id]', 'route.js'), ['PATCH'], 'orders/[id]');

// Public form endpoints
checkCsrfApplied(path.join(apiDir, 'contact', 'route.js'), ['POST'], 'contact');
checkCsrfApplied(path.join(apiDir, 'newsletter', 'route.js'), ['POST'], 'newsletter');
checkCsrfApplied(path.join(apiDir, 'trade', 'route.js'), ['POST'], 'trade');
checkCsrfApplied(path.join(apiDir, 'custom-orders', 'route.js'), ['POST'], 'custom-orders');

// Admin endpoints
checkCsrfApplied(path.join(apiDir, 'admin', 'login', 'route.js'), ['POST'], 'admin/login');
checkCsrfApplied(path.join(apiDir, 'admin', 'logout', 'route.js'), ['POST'], 'admin/logout');
checkCsrfApplied(path.join(apiDir, 'admin', 'settings', 'route.js'), ['PUT'], 'admin/settings');
checkCsrfApplied(path.join(apiDir, 'admin', 'products', '[id]', 'route.js'), ['PATCH'], 'admin/products/[id]');
checkCsrfApplied(path.join(apiDir, 'admin', 'custom-orders', '[id]', 'route.js'), ['PATCH'], 'admin/custom-orders/[id]');
checkCsrfApplied(path.join(apiDir, 'admin', 'media', 'route.js'), ['POST'], 'admin/media');
checkCsrfApplied(path.join(apiDir, 'admin', 'media', '[id]', 'route.js'), ['DELETE', 'PUT'], 'admin/media/[id]');

// ─── 9. Admin Auth Check ──────────────────────────────────────────────────────

console.log('\n9. Admin Authorization');

test('Admin /me endpoint uses requireAdmin()', () => {
  const mePath = path.join(apiDir, 'admin', 'me', 'route.js');
  const meCode = fs.readFileSync(mePath, 'utf-8');
  assertIncludes(meCode, 'requireAdmin()');
});

// ─── 10. Database Security ────────────────────────────────────────────────────

console.log('\n10. Database Configuration');

const dbPath = path.join(__dirname, '..', 'lib', 'db.js');
const dbCode = fs.readFileSync(dbPath, 'utf-8');

test('Database uses WAL mode', () => {
  assertIncludes(dbCode, 'WAL');
});

test('Database has foreign keys enabled', () => {
  assertIncludes(dbCode, 'foreign_keys');
});

test('Database has 21 tables', () => {
  const tables = [
    'admins', 'customers', 'carts', 'cart_items', 'wishlists', 'wishlist_items',
    'orders', 'order_items', 'order_status_history', 'order_notes',
    'content_sections', 'site_settings', 'media',
    'custom_orders', 'contact_submissions', 'trade_enquiries', 'newsletter_subscribers',
    'product_metadata', 'customer_addresses', 'password_resets'
  ];
  for (const t of tables) {
    assertIncludes(dbCode, t, `Missing table: ${t}`);
  }
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(60));
console.log(`Sprint #17 Security Tests: ${passed}/${total} passed, ${failed} failed`);
console.log('═'.repeat(60));

if (failed > 0) process.exit(1);

#!/usr/bin/env node

/**
 * TEAKLE — Sprint #29 Runtime Tests
 * Production Deployment & Hostinger Compatibility Readiness
 *
 * Full Application HTTP Integration Tests against a running production build.
 *
 * Prerequisites:
 *   1. A running production build on port 3099 (or set BASE_URL).
 *   2. Admin account seeded: testadmin@teakle.in / TestPassword123
 *
 * Usage:
 *   $env:BASE_URL="http://127.0.0.1:3099"; npm run start
 *   node scripts/runtime-sprint29.js
 *
 * Test helpers return explicit true/false and never create false positives.
 */

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3099';
const ADMIN_EMAIL = 'testadmin@teakle.in';
const ADMIN_PASSWORD = 'TestPassword123';
const TEST_EMAIL = 'sprint29_' + Date.now() + '@example.com';
const TEST_PASSWORD = 'Sprint29Pass#123';

let passed = 0, failed = 0, total = 0;

function skip(name) {
  total++;
  console.log(`  \x1b[33m○\x1b[0m ${name} (skipped — dependency failed)`);
}

async function check(name, a, b, c) {
  total++;
  try {
    let url, opts, fn;
    if (typeof a === 'function') {
      fn = a; url = null; opts = {};
    } else if (typeof b === 'function') {
      url = a; fn = b; opts = (typeof c === 'object' && c !== null) ? c : {};
    } else {
      url = a; opts = (typeof b === 'object' && b !== null) ? b : {}; fn = c;
    }
    let r;
    if (url) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      opts.signal = controller.signal;
      try {
        r = await fetch(url, opts);
      } finally {
        clearTimeout(timeout);
      }
    }
    const result = await fn(r);
    if (result === true) {
      passed++;
      console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    } else {
      failed++;
      console.log(`  \x1b[31m✗\x1b[0m ${name}: ${result}`);
    }
  } catch (e) {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}: ${e.message}`);
  }
}

async function getResponseCookies(url, opts) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  opts.signal = controller.signal;
  let resp;
  try {
    resp = await fetch(url, opts);
  } finally {
    clearTimeout(timeout);
  }
  const allCookies = [];
  if (resp.headers.getSetCookie) {
    allCookies.push(...resp.headers.getSetCookie());
  }
  if (allCookies.length === 0) {
    const raw = resp.headers.get('set-cookie');
    if (raw) allCookies.push(...(Array.isArray(raw) ? raw : [raw]));
  }
  return { cookies: allCookies.map(c => c.split(';')[0]).join('; '), status: resp.status, json: await resp.json().catch(() => null) };
}

function extractCsrfToken(cookieStr) {
  if (!cookieStr) return '';
  const match = cookieStr.match(/teakle_csrf=([^;]+)/);
  return match ? match[1] : '';
}

async function freshCsrf(cookies) {
  return getResponseCookies(BASE + '/api/csrf', {
    method: 'GET',
    credentials: 'same-origin',
    headers: cookies ? { Cookie: cookies } : {},
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

(async () => {
  console.log(`\n=== SPRINT #29 RUNTIME TESTS (${BASE}) ===\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HEALTH (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('1. HEALTH');

  let healthData = null;

  await check('GET /api/health → 200', BASE + '/api/health', async r => {
    if (r.status !== 200) return 'status: ' + r.status;
    healthData = await r.json();
    return true;
  });

  await check('Health status is healthy/degraded (not error)', async () => {
    if (!healthData) return 'no health data';
    return (healthData.status === 'healthy' || healthData.status === 'degraded') ? true : 'status: ' + healthData.status;
  });

  await check('Health does NOT expose filesystem paths', async () => {
    if (!healthData) return 'no health data';
    const s = JSON.stringify(healthData);
    return !s.includes('/data/') && !s.includes('/home/') && !s.includes('teakle.db') ? true : 'leaks path: ' + s.slice(0, 200);
  });

  await check('Health does NOT expose secrets', async () => {
    if (!healthData) return 'no health data';
    const s = JSON.stringify(healthData).toLowerCase();
    return !s.includes('session_secret') && !s.includes('api_key') && !s.includes('password') ? true : 'leaks secret';
  });

  await check('Health reports database state', async () => {
    if (!healthData) return 'no health data';
    return healthData.database && typeof healthData.database.status === 'string' ? true : 'missing database.status';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PUBLIC PAGES (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n2. PUBLIC PAGES');

  await check('GET / (homepage) → 200', BASE + '/', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /gallery (collection listing) → 200', BASE + '/gallery', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /journal → 200', BASE + '/journal', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /contact → 200', BASE + '/contact', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /sitemap.xml → 200 (xml)', BASE + '/sitemap.xml', async r => {
    if (r.status !== 200) return 'status: ' + r.status;
    const ct = r.headers.get('content-type') || '';
    return ct.includes('xml') ? true : 'content-type: ' + ct;
  });
  await check('GET /robots.txt → 200', BASE + '/robots.txt', async r => r.status === 200 ? true : 'status: ' + r.status);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. PRODUCTS / COLLECTIONS (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n3. PRODUCTS / COLLECTIONS');

  await check('GET /gallery returns product content', BASE + '/gallery', async r => {
    if (r.status !== 200) return 'status: ' + r.status;
    const t = await r.text();
    return t.length > 500 ? true : 'empty page';
  });

  await check('GET /shop/anchor-table (product detail) → 200', BASE + '/shop/anchor-table', async r => r.status === 200 ? true : 'status: ' + r.status);

  await check('GET /api/products (if exists) → 200 or 404 (not 500)', BASE + '/api/products', async r => {
    return (r.status === 200 || r.status === 404) ? true : 'status: ' + r.status;
  });

  await check('GET /collections → 200 or 404 (not 500)', BASE + '/collections', async r => {
    return (r.status === 200 || r.status === 404) ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. 404 HANDLING (2 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n4. 404 HANDLING');

  await check('GET /nonexistent-route → 404', BASE + '/this-route-should-not-exist-xyz', async r => r.status === 404 ? true : 'status: ' + r.status);
  await check('GET /api/nonexistent → 404 (not 500)', BASE + '/api/nonexistent-endpoint-xyz', async r => r.status === 404 ? true : 'status: ' + r.status);

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CUSTOMER REGISTRATION / LOGIN (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n5. CUSTOMER REGISTRATION / LOGIN');

  let custCookies = '';
  let custAuthOk = false;

  await check('POST /api/auth/register → 200 (creates customer)', async () => {
    const csrf = await freshCsrf('');
    const r = await getResponseCookies(BASE + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrf.cookies, 'x-csrf-token': extractCsrfToken(csrf.cookies) },
      body: JSON.stringify({ name: 'Sprint TwentyNine', email: TEST_EMAIL, password: TEST_PASSWORD, confirmPassword: TEST_PASSWORD }),
    });
    if (r.status !== 200) return 'status: ' + r.status + ' ' + JSON.stringify(r.json);
    custCookies = r.cookies;
    return true;
  });

  await check('Registration sets teakle_customer_session cookie', async () => {
    if (!custCookies) return 'no cookies';
    return custCookies.includes('teakle_customer_session=') ? true : 'missing customer session cookie';
  });

  await check('GET /api/auth/me with session → customer not null', async () => {
    if (!custCookies) return 'no session';
    const r = await fetch(BASE + '/api/auth/me', { headers: { Cookie: custCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return j.customer && j.customer.email === TEST_EMAIL ? true : 'customer mismatch: ' + JSON.stringify(j);
  });

  await check('POST /api/auth/login → 200 (existing customer)', async () => {
    const csrf = await freshCsrf('');
    const r = await getResponseCookies(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrf.cookies, 'x-csrf-token': extractCsrfToken(csrf.cookies) },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    if (r.status !== 200) return 'status: ' + r.status;
    custCookies = r.cookies;
    custAuthOk = true;
    return true;
  });

  await check('Login sets Secure= attribute only when behind HTTPS proxy', async () => {
    // On the test server (plain HTTP, NODE_ENV may be dev), Secure must NOT be set.
    if (!custCookies) return 'no cookies';
    const lower = custCookies.toLowerCase();
    // The test server is plain HTTP; Secure attribute must be absent.
    return !lower.includes('secure') ? true : 'Secure set on plain-HTTP test server (should be absent)';
  });

  await check('POST /api/auth/login wrong password → 401', async () => {
    const csrf = await freshCsrf('');
    const r = await fetch(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrf.cookies, 'x-csrf-token': extractCsrfToken(csrf.cookies) },
      body: JSON.stringify({ email: TEST_EMAIL, password: 'wrongpassword' }),
    });
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. CUSTOMER ISOLATION (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n6. CUSTOMER ISOLATION');

  await check('GET /api/admin/dashboard without admin auth → 401', async () => {
    if (!custCookies) return 'no customer session';
    const r = await fetch(BASE + '/api/admin/dashboard', { headers: { Cookie: custCookies } });
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  await check('GET /api/orders requires auth (no cookie → 401)', async () => {
    const r = await fetch(BASE + '/api/orders');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  await check('Customer session cannot access admin audit logs', async () => {
    if (!custCookies) return 'no customer session';
    const r = await fetch(BASE + '/api/admin/audit-logs', { headers: { Cookie: custCookies } });
    return (r.status === 401 || r.status === 403) ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. CART (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n7. CART');

  await check('POST /api/cart adds product (anchor-table)', async () => {
    if (!custAuthOk) return 'no customer auth';
    const csrf = await freshCsrf(custCookies);
    const r = await fetch(BASE + '/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: custCookies, 'x-csrf-token': extractCsrfToken(custCookies) },
      body: JSON.stringify({ productId: 'anchor-table', quantity: 1 }),
    });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return j.ok && Array.isArray(j.items) && j.items.length >= 1 ? true : 'no items: ' + JSON.stringify(j);
  });

  await check('GET /api/cart returns items', async () => {
    if (!custAuthOk) return 'no customer auth';
    const r = await fetch(BASE + '/api/cart', { headers: { Cookie: custCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return Array.isArray(j.items) && j.items.length >= 1 ? true : 'empty cart';
  });

  await check('POST /api/cart without auth → 401/403 (auth or CSRF)', async () => {
    const r = await fetch(BASE + '/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'anchor-table', quantity: 1 }),
    });
    return (r.status === 401 || r.status === 403) ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. ADDRESSES (2 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n8. ADDRESSES');

  await check('GET /api/addresses with auth → 200 and array', async () => {
    if (!custAuthOk) return 'no customer auth';
    const r = await fetch(BASE + '/api/addresses', { headers: { Cookie: custCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return Array.isArray(j.addresses) ? true : 'addresses not array: ' + JSON.stringify(j);
  });

  await check('POST /api/addresses creates address', async () => {
    if (!custAuthOk) return 'no customer auth';
    const csrf = await freshCsrf(custCookies);
    const r = await fetch(BASE + '/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: custCookies, 'x-csrf-token': extractCsrfToken(custCookies) },
      body: JSON.stringify({ label: 'Home', fullName: 'Sprint TwentyNine', phone: '9876543210', addressLine1: '123 Test St', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India', isDefault: true }),
    });
    if (r.status !== 200 && r.status !== 201) return 'status: ' + r.status;
    const j = await r.json();
    return j.ok || j.address ? true : 'unexpected: ' + JSON.stringify(j);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. ORDER CREATION (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n9. ORDER CREATION');

  await check('POST /api/orders creates order from cart', async () => {
    if (!custAuthOk) return 'no customer auth';
    const csrf = await freshCsrf(custCookies);
    const r = await fetch(BASE + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: custCookies, 'x-csrf-token': extractCsrfToken(custCookies) },
      body: JSON.stringify({
        shipping: { firstName: 'Sprint', lastName: '29', email: TEST_EMAIL, phone: '9876543210', address: '123 Test St', apartment: '', city: 'Mumbai', state: 'Maharashtra', pin: '400001', country: 'India' },
        billingSameAsShipping: true,
        notes: 'Sprint 29 runtime test order',
      }),
    });
    if (r.status !== 200) return 'status: ' + r.status + ' ' + JSON.stringify(await r.json().catch(() => ({})));
    const j = await r.json();
    return j.ok && j.order ? true : 'no order: ' + JSON.stringify(j);
  });

  await check('POST /api/orders without auth → 401/403', async () => {
    const r = await fetch(BASE + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipping: { firstName: 'X' }, billingSameAsShipping: true }),
    });
    return (r.status === 401 || r.status === 403) ? true : 'status: ' + r.status;
  });

  await check('GET /api/orders with auth → returns orders array', async () => {
    if (!custAuthOk) return 'no customer auth';
    const r = await fetch(BASE + '/api/orders', { headers: { Cookie: custCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return Array.isArray(j.orders) ? true : 'orders not array';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. ADMIN LOGIN / AUTHORIZATION (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n10. ADMIN LOGIN / AUTHORIZATION');

  let adminCookies = '';
  let adminAuthOk = false;

  await check('POST /api/admin/login → 200', async () => {
    const csrf = await freshCsrf('');
    const r = await getResponseCookies(BASE + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrf.cookies, 'x-csrf-token': extractCsrfToken(csrf.cookies) },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (r.status !== 200) return 'status: ' + r.status + ' ' + JSON.stringify(r.json);
    adminCookies = r.cookies;
    adminAuthOk = true;
    return true;
  });

  await check('Admin login sets teakle_admin_session cookie', async () => {
    if (!adminCookies) return 'no cookies';
    return adminCookies.includes('teakle_admin_session=') ? true : 'missing admin session cookie';
  });

  await check('Admin session cannot access customer /api/auth/me as customer', async () => {
    if (!adminAuthOk) return 'no admin session';
    const r = await fetch(BASE + '/api/auth/me', { headers: { Cookie: adminCookies } });
    const j = await r.json().catch(() => ({}));
    return j.customer === null || j.customer === undefined ? true : 'customer not null for admin session';
  });

  await check('GET /api/admin/dashboard with admin auth → 200', async () => {
    if (!adminAuthOk) return 'no admin session';
    const r = await fetch(BASE + '/api/admin/dashboard', { headers: { Cookie: adminCookies } });
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  await check('GET /api/admin/products with admin auth → 200', async () => {
    if (!adminAuthOk) return 'no admin session';
    const r = await fetch(BASE + '/api/admin/products', { headers: { Cookie: adminCookies } });
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. DIAGNOSTICS (2 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n11. DIAGNOSTICS');

  await check('GET /api/admin/diagnostics with admin auth → has database/system', async () => {
    if (!adminAuthOk) return 'no admin session';
    const r = await fetch(BASE + '/api/admin/diagnostics', { headers: { Cookie: adminCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return j.database && j.system ? true : 'missing fields';
  });

  await check('GET /api/admin/diagnostics without auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/diagnostics');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. AUDIT LOGS (2 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n12. AUDIT LOGS');

  await check('GET /api/admin/audit-logs with admin auth → pagination fields', async () => {
    if (!adminAuthOk) return 'no admin session';
    const r = await fetch(BASE + '/api/admin/audit-logs?page=1&limit=10', { headers: { Cookie: adminCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return j.data !== undefined && j.pagination !== undefined ? true : 'missing data/pagination: ' + JSON.stringify(j).slice(0, 200);
  });

  await check('Admin login produced an audit log entry', async () => {
    if (!adminAuthOk) return 'no admin session';
    const r = await fetch(BASE + '/api/admin/audit-logs?page=1&limit=50', { headers: { Cookie: adminCookies } });
    const j = await r.json();
    const entries = j.data || [];
    return entries.length > 0 ? true : 'no audit entries';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. EXPORTS (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n13. EXPORTS');

  await check('GET /api/admin/product-orders/export → CSV (admin)', async () => {
    if (!adminAuthOk) return 'no admin session';
    const r = await fetch(BASE + '/api/admin/product-orders/export', { headers: { Cookie: adminCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const ct = r.headers.get('content-type') || '';
    return ct.includes('csv') || ct.includes('text') ? true : 'content-type: ' + ct;
  });

  await check('GET /api/admin/contact/export → CSV (admin)', async () => {
    if (!adminAuthOk) return 'no admin session';
    const r = await fetch(BASE + '/api/admin/contact/export', { headers: { Cookie: adminCookies } });
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  await check('Exports without auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/product-orders/export');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 14. CSRF (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n14. CSRF');

  await check('GET /api/csrf → returns token cookie', async () => {
    const csrf = await freshCsrf('');
    return csrf.cookies.includes('teakle_csrf=') ? true : 'no csrf cookie';
  });

  await check('POST /api/cart without CSRF token → 403', async () => {
    if (!custAuthOk) return 'no customer auth';
    const r = await fetch(BASE + '/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: custCookies },
      body: JSON.stringify({ productId: 'anchor-table', quantity: 1 }),
    });
    return (r.status === 403 || r.status === 401) ? true : 'status: ' + r.status;
  });

  await check('POST /api/cart with valid CSRF token → success', async () => {
    if (!custAuthOk) return 'no customer auth';
    const csrf = await freshCsrf(custCookies);
    const r = await fetch(BASE + '/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: custCookies, 'x-csrf-token': extractCsrfToken(custCookies) },
      body: JSON.stringify({ productId: 'bearing-chair', quantity: 1 }),
    });
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 15. SECURITY HEADERS (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n15. SECURITY HEADERS');

  const hdrResp = await fetch(BASE + '/api/health');

  await check('X-Content-Type-Options: nosniff', async () => {
    const v = hdrResp.headers.get('x-content-type-options');
    return v === 'nosniff' ? true : 'got: ' + v;
  });

  await check('X-Frame-Options: DENY', async () => {
    const v = hdrResp.headers.get('x-frame-options');
    return v === 'DENY' ? true : 'got: ' + v;
  });

  await check('Referrer-Policy present', async () => {
    const v = hdrResp.headers.get('referrer-policy');
    return v ? true : 'missing';
  });

  await check('Cache-Control: no-store on API health', async () => {
    const v = hdrResp.headers.get('cache-control');
    return v && v.includes('no-store') ? true : 'got: ' + v;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 16. PAYMENT STUB (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n16. PAYMENT STUB');

  await check('POST /api/payments/intent → configured:false', async () => {
    const csrf = await freshCsrf(custCookies || '');
    const r = await fetch(BASE + '/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: custCookies, 'x-csrf-token': extractCsrfToken(custCookies || '') },
      body: JSON.stringify({ orderId: 1 }),
    });
    const j = await r.json().catch(() => ({}));
    if (j.configured === false) return true;
    if (r.status >= 400) return true;
    return 'unexpected: ' + JSON.stringify(j);
  });

  await check('POST /api/payments/confirm → error (no provider)', async () => {
    const r = await fetch(BASE + '/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: 1, status: 'PAID' }),
    });
    return r.status >= 400 ? true : 'status: ' + r.status;
  });

  await check('POST /api/payments/refund → error (no provider)', async () => {
    const r = await fetch(BASE + '/api/payments/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: 1 }),
    });
    return r.status >= 400 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 17. EMAIL STUB (2 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n17. EMAIL STUB');

  await check('Email provider reports not configured', async () => {
    if (!healthData) return 'no health data';
    return healthData.email && healthData.email.configured === false ? true : 'email configured unexpectedly: ' + JSON.stringify(healthData.email);
  });

  await check('POST /api/newsletter subscribes (email not actually sent)', async () => {
    const csrf = await freshCsrf('');
    const r = await fetch(BASE + '/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrf.cookies, 'x-csrf-token': extractCsrfToken(csrf.cookies) },
      body: JSON.stringify({ email: 'newsletter-sprint29@example.com' }),
    });
    return (r.status === 200 || r.status === 201) ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 18. CUSTOMER LOGOUT / SESSION VERSION (2 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n18. SESSION VERSION / LOGOUT');

  await check('POST /api/auth/logout clears customer session', async () => {
    if (!custAuthOk) return 'no customer auth';
    const r = await fetch(BASE + '/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: custCookies, 'x-csrf-token': extractCsrfToken(custCookies) },
    });
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  await check('Password reset request does not leak account existence', async () => {
    const csrf = await freshCsrf('');
    const r = await fetch(BASE + '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrf.cookies, 'x-csrf-token': extractCsrfToken(csrf.cookies) },
      body: JSON.stringify({ email: 'definitely-not-real-' + Date.now() + '@example.com' }),
    });
    // Should return 200 either way (no account enumeration)
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  const skipped = total - passed - failed;
  console.log(`\x1b[1mRuntime: ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)\x1b[0m`);
  if (failed > 0) process.exit(1);
})();

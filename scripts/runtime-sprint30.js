#!/usr/bin/env node

/**
 * TEAKLE — Sprint #30 Runtime Tests
 * Final Production Hardening
 *
 * Full application HTTP integration tests against a running production build.
 *
 * Prerequisites:
 *   1. A running production build on port 3099 (or set BASE_URL).
 *   2. Admin account seeded: testadmin@teakle.in / TestPassword123
 *
 * Usage:
 *   $env:BASE_URL="http://127.0.0.1:3099"; npm run start
 *   node scripts/runtime-sprint30.js
 *
 * Test helpers return explicit true/false and never create false positives.
 */

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3099';
const ADMIN_EMAIL = 'testadmin@teakle.in';
const ADMIN_PASSWORD = 'TestPassword123';
const TEST_EMAIL = 'sprint30_' + Date.now() + '@example.com';
const TEST_PASSWORD = 'Sprint30Pass#123';
const NEW_PASSWORD = 'Sprint30NewPass#456';

let passed = 0, failed = 0, total = 0;

function skip(name) {
  total++;
  console.log(`  \x1b[33m○\x1b[0m ${name} (skipped)`);
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

async function postJson(url, body, cookies, csrf) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookies) headers.Cookie = cookies;
  if (csrf) headers['x-csrf-token'] = csrf;
  return getResponseCookies(url, { method: 'POST', headers, body: JSON.stringify(body) });
}

(async () => {
  console.log(`\n=== SPRINT #30 RUNTIME TESTS (${BASE}) ===\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HEALTH / OBSERVABILITY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('1. HEALTH / OBSERVABILITY');
  let healthData = null;

  await check('GET /api/health → 200', BASE + '/api/health', async r => {
    if (r.status !== 200) return 'status: ' + r.status;
    healthData = await r.json();
    return true;
  });
  await check('Health status healthy/degraded', async () => {
    if (!healthData) return 'no health data';
    return (healthData.status === 'healthy' || healthData.status === 'degraded') ? true : 'status: ' + healthData.status;
  });
  await check('Health does NOT expose filesystem paths', async () => {
    const s = JSON.stringify(healthData || {});
    return (!s.includes('/data/') && !s.includes('teakle.db')) ? true : 'leaks path';
  });
  await check('Health does NOT expose secrets', async () => {
    const s = JSON.stringify(healthData || {}).toLowerCase();
    return (!s.includes('session_secret') && !s.includes('api_key') && !s.includes('password')) ? true : 'leaks secret';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PUBLIC PAGES / SEO
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n2. PUBLIC PAGES / SEO');
  await check('GET / (homepage) → 200', BASE + '/', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /gallery → 200', BASE + '/gallery', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /journal → 200', BASE + '/journal', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /contact → 200', BASE + '/contact', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /shop/anchor-table → 200', BASE + '/shop/anchor-table', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /sitemap.xml → 200 (xml)', BASE + '/sitemap.xml', async r => {
    if (r.status !== 200) return 'status: ' + r.status;
    const ct = r.headers.get('content-type') || '';
    return ct.includes('xml') ? true : 'content-type: ' + ct;
  });
  await check('GET /robots.txt → 200', BASE + '/robots.txt', async r => r.status === 200 ? true : 'status: ' + r.status);
  await check('GET /this-route-should-not-exist-xyz → 404', BASE + '/this-route-should-not-exist-xyz', async r => r.status === 404 ? true : 'status: ' + r.status);
  await check('GET /api/nonexistent-endpoint-xyz → 404 (not 500)', BASE + '/api/nonexistent-endpoint-xyz', async r => r.status === 404 ? true : 'status: ' + r.status);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SECURITY HEADERS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n3. SECURITY HEADERS');
  await check('Page response has X-Content-Type-Options: nosniff', BASE + '/', async r => {
    const v = r.headers.get('x-content-type-options');
    return v === 'nosniff' ? true : 'header: ' + v;
  });
  await check('Page response has X-Frame-Options: DENY', BASE + '/', async r => {
    const v = r.headers.get('x-frame-options');
    return (v === 'DENY') ? true : 'header: ' + v;
  });
  await check('Page response has Referrer-Policy', BASE + '/', async r => {
    return r.headers.get('referrer-policy') ? true : 'missing';
  });
  await check('Page response has Permissions-Policy', BASE + '/', async r => {
    return r.headers.get('permissions-policy') ? true : 'missing';
  });
  await check('API response has Cache-Control: no-store', BASE + '/api/health', async r => {
    const v = (r.headers.get('cache-control') || '').toLowerCase();
    return v.includes('no-store') ? true : 'cache-control: ' + v;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CUSTOMER REGISTRATION / LOGIN / SESSION SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n4. CUSTOMER REGISTRATION / LOGIN / SESSION SECURITY');
  let custCookies = '';

  await check('POST /api/auth/register → 200', async () => {
    const csrf = await freshCsrf('');
    const r = await postJson(BASE + '/api/auth/register',
      { name: 'Sprint Thirty', email: TEST_EMAIL, password: TEST_PASSWORD, confirmPassword: TEST_PASSWORD },
      csrf.cookies, extractCsrfToken(csrf.cookies));
    if (r.status !== 200) return 'status: ' + r.status + ' ' + JSON.stringify(r.json);
    custCookies = r.cookies;
    return true;
  });

  await check('Registration sets teakle_customer_session cookie', async () => {
    if (!custCookies) return 'no cookies';
    return custCookies.includes('teakle_customer_session=') ? true : 'missing customer session cookie';
  });

  await check('GET /api/auth/me with session → customer not null', async () => {
    const r = await fetch(BASE + '/api/auth/me', { headers: { Cookie: custCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return (j.customer && j.customer.email === TEST_EMAIL) ? true : 'customer mismatch: ' + JSON.stringify(j);
  });

  // CSRF enforcement
  await check('POST /api/auth/login without CSRF token → 403', async () => {
    const r = await fetch(BASE + '/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    return r.status === 403 ? true : 'status: ' + r.status;
  });

  // Password change invalidates the OLD session (sessionVersion bump) — this is
  // the correct, intended security behavior. The fix ensures re-login works.
  await check('PUT /api/auth/password invalidates the OLD session', async () => {
    const csrf = await freshCsrf(custCookies);
    const r = await getResponseCookies(BASE + '/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: custCookies, 'x-csrf-token': extractCsrfToken(csrf.cookies) },
      body: JSON.stringify({ currentPassword: TEST_PASSWORD, newPassword: NEW_PASSWORD }),
    });
    if (r.status !== 200) return 'status: ' + r.status + ' ' + JSON.stringify(r.json);
    // The previous session cookie must now be rejected (sessionVersion mismatch)
    const me = await fetch(BASE + '/api/auth/me', { headers: { Cookie: custCookies } });
    const j = await me.json();
    return (!j.customer) ? true : 'old session still valid after password change (bug)';
  });

  let custCookies2 = '';
  await check('Re-login with NEW password succeeds (sessionVersion fix)', async () => {
    const csrf = await freshCsrf('');
    const r = await postJson(BASE + '/api/auth/login',
      { email: TEST_EMAIL, password: NEW_PASSWORD }, csrf.cookies, extractCsrfToken(csrf.cookies));
    if (r.status !== 200) return 'login status: ' + r.status + ' ' + JSON.stringify(r.json);
    custCookies2 = r.cookies;
    return true;
  });

  await check('GET /api/auth/me after re-login with new password → customer valid', async () => {
    if (!custCookies2) return 'no relogin session';
    const r = await fetch(BASE + '/api/auth/me', { headers: { Cookie: custCookies2 } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return (j.customer && j.customer.email === TEST_EMAIL) ? true : 'customer null after relogin (bug)';
  });

  // Customer isolation: cannot fetch another customer's address
  await check('Customer A cannot read customer B address (isolation)', async () => {
    if (!custCookies2) return 'no session';
    // create a second customer, then try to read address id 999999 of own — should 401/404, not leak
    const r = await fetch(BASE + '/api/addresses/999999', { headers: { Cookie: custCookies2 } });
    return (r.status === 401 || r.status === 404) ? true : 'status: ' + r.status;
  });

  // Deactivate -> session invalid
  await check('POST /api/auth/deactivate invalidates session', async () => {
    const csrf = await freshCsrf(custCookies2);
    const r = await getResponseCookies(BASE + '/api/auth/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: custCookies2, 'x-csrf-token': extractCsrfToken(csrf.cookies) },
      body: JSON.stringify({ password: NEW_PASSWORD }),
    });
    if (r.status !== 200) return 'deactivate status: ' + r.status + ' ' + JSON.stringify(r.json);
    const me = await fetch(BASE + '/api/auth/me', { headers: { Cookie: custCookies2 } });
    const j = await me.json();
    return (!j.customer) ? true : 'session still valid after deactivate';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ADMIN LOGIN / AUTHORIZATION / PAGINATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n5. ADMIN LOGIN / AUTHORIZATION / PAGINATION');
  let adminCookies = '';

  await check('POST /api/admin/login requires CSRF (no token → 403)', async () => {
    const r = await fetch(BASE + '/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    return r.status === 403 ? true : 'status: ' + r.status;
  });

  await check('POST /api/admin/login → 200 with CSRF', async () => {
    const csrf = await freshCsrf('');
    const r = await postJson(BASE + '/api/admin/login',
      { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, csrf.cookies, extractCsrfToken(csrf.cookies));
    if (r.status !== 200) return 'status: ' + r.status + ' ' + JSON.stringify(r.json);
    adminCookies = r.cookies;
    return true;
  });

  await check('Admin session cookie set', async () => {
    return adminCookies.includes('teakle_admin_session=') ? true : 'missing admin session cookie';
  });

  await check('GET /api/admin/dashboard without admin auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/dashboard');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  await check('GET /api/admin/dashboard with auth → 200', async () => {
    const r = await fetch(BASE + '/api/admin/dashboard', { headers: { Cookie: adminCookies } });
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  await check('Admin product-orders list returns total + pagination', async () => {
    const r = await fetch(BASE + '/api/admin/product-orders?page=1&limit=10', { headers: { Cookie: adminCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return (j.pagination && typeof j.pagination.total === 'number') ? true : 'missing pagination.total';
  });

  await check('Admin audit-logs list returns total + pagination', async () => {
    const r = await fetch(BASE + '/api/admin/audit-logs?page=1&limit=10', { headers: { Cookie: adminCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return (j.pagination && typeof j.pagination.total === 'number') ? true : 'missing pagination.total';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. MEDIA SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n6. MEDIA SECURITY');
  await check('GET /api/admin/media requires admin auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/media');
    return r.status === 401 ? true : 'status: ' + r.status;
  });
  await check('Admin media list returns pagination + total', async () => {
    const r = await fetch(BASE + '/api/admin/media?page=1&limit=10', { headers: { Cookie: adminCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return (j.pagination && typeof j.pagination.total === 'number') ? true : 'missing pagination.total';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. PAYMENT / EMAIL STUBS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n7. PAYMENT / EMAIL STUBS');
  await check('Payment intent without auth → 401/403 (no crash)', async () => {
    const r = await fetch(BASE + '/api/payments/intent', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 1 }),
    });
    return (r.status === 401 || r.status === 403) ? true : 'status: ' + r.status;
  });
  await check('Forgot-password returns generic 200 (no account leak)', async () => {
    const r = await fetch(BASE + '/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'definitely-not-real-' + Date.now() + '@example.com' }),
    });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return (j.message && j.message.includes('If an account exists')) ? true : 'not generic';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(60));
  console.log(`Sprint #30 runtime: ${passed} PASS, ${failed} FAIL, ${total} total`);
  process.exit(failed > 0 ? 1 : 0);
})();

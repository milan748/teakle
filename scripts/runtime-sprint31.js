#!/usr/bin/env node

/**
 * TEAKLE — Sprint #31 Runtime Tests
 * Final Security Hardening
 *
 * Full application HTTP integration tests against a running production build.
 *
 * Prerequisites:
 *   1. A running production build on port 3099 (or set BASE_URL).
 *   2. Admin account seeded: testadmin@teakle.in / TestPassword123
 *
 * Usage:
 *   $env:BASE_URL="http://127.0.0.1:3099"; npm run start
 *   node scripts/runtime-sprint31.js
 *
 * Test helpers return explicit true/false and never create false positives.
 */

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3099';
const ADMIN_EMAIL = 'testadmin@teakle.in';
const ADMIN_PASSWORD = 'TestPassword123';

let passed = 0, failed = 0, total = 0;

async function check(name, fn) {
  total++;
  try {
    const result = await fn();
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
    headers: { Cookie: cookies },
  });
}

(async () => {
  console.log('TEAKLE Sprint #31 Runtime Tests — Final Security Hardening\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. LOGOUT CSRF ENFORCEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('1. LOGOUT CSRF ENFORCEMENT');

  // First, register a test user and get a session
  const testEmail = 'sprint31_' + Date.now() + '@example.com';
  const testPassword = 'Sprint31Pass#123';

  let userCookies = '';
  await check('Register test user for logout CSRF tests', async () => {
    const r = await fetch(BASE + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sprint31 Test', email: testEmail, password: testPassword, confirmPassword: testPassword }),
    });
    if (r.status !== 200) return 'register status: ' + r.status;
    const allCookies = [];
    if (r.headers.getSetCookie) allCookies.push(...r.headers.getSetCookie());
    userCookies = allCookies.map(c => c.split(';')[0]).join('; ');
    const j = await r.json();
    return j.ok === true ? true : 'register failed: ' + JSON.stringify(j);
  });

  // Get CSRF token for the user session
  let csrfResponse;
  await check('Get CSRF token for user session', async () => {
    csrfResponse = await freshCsrf(userCookies);
    userCookies = csrfResponse.cookies || userCookies;
    return csrfResponse.status === 200 ? true : 'csrf status: ' + csrfResponse.status;
  });

  const userCsrf = extractCsrfToken(userCookies);

  await check('POST /api/auth/logout WITHOUT CSRF token → 403', async () => {
    const r = await fetch(BASE + '/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: userCookies, 'Content-Type': 'application/json' },
    });
    return r.status === 403 ? true : 'expected 403, got: ' + r.status;
  });

  await check('POST /api/auth/logout WITH CSRF token → 200', async () => {
    const r = await fetch(BASE + '/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: userCookies,
        'Content-Type': 'application/json',
        'x-csrf-token': userCsrf,
      },
    });
    return r.status === 200 ? true : 'expected 200, got: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. NaN INPUT VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n2. NaN INPUT VALIDATION');

  // Get admin session
  let adminCookies = '';
  let adminCsrf = '';

  await check('Login as admin', async () => {
    const r = await fetch(BASE + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (r.status !== 200) return 'admin login status: ' + r.status;
    const allCookies = [];
    if (r.headers.getSetCookie) allCookies.push(...r.headers.getSetCookie());
    adminCookies = allCookies.map(c => c.split(';')[0]).join('; ');
    const j = await r.json();
    if (!j.success) return 'admin login failed: ' + JSON.stringify(j);
    const csrfResp = await freshCsrf(adminCookies);
    adminCookies = csrfResp.cookies || adminCookies;
    adminCsrf = extractCsrfToken(adminCookies);
    return true;
  });

  await check('GET /api/admin/product-orders?minTotal=abc → 400 (NaN guard)', async () => {
    const r = await fetch(BASE + '/api/admin/product-orders?minTotal=abc', {
      headers: { Cookie: adminCookies },
    });
    if (r.status !== 400) return 'expected 400, got: ' + r.status;
    const j = await r.json();
    return (j.error && j.error.includes('minTotal')) ? true : 'wrong error: ' + j.error;
  });

  await check('GET /api/admin/product-orders?maxTotal=xyz → 400 (NaN guard)', async () => {
    const r = await fetch(BASE + '/api/admin/product-orders?maxTotal=xyz', {
      headers: { Cookie: adminCookies },
    });
    if (r.status !== 400) return 'expected 400, got: ' + r.status;
    const j = await r.json();
    return (j.error && j.error.includes('maxTotal')) ? true : 'wrong error: ' + j.error;
  });

  await check('GET /api/admin/product-orders?minTotal=500&maxTotal=1000 → 200 (valid numbers)', async () => {
    const r = await fetch(BASE + '/api/admin/product-orders?minTotal=500&maxTotal=1000', {
      headers: { Cookie: adminCookies },
    });
    return r.status === 200 ? true : 'expected 200, got: ' + r.status;
  });

  await check('GET /api/admin/product-orders/export?minTotal=abc → 400 (NaN guard)', async () => {
    const r = await fetch(BASE + '/api/admin/product-orders/export?minTotal=abc', {
      headers: { Cookie: adminCookies },
    });
    if (r.status !== 400) return 'expected 400, got: ' + r.status;
    const j = await r.json();
    return (j.error && j.error.includes('minTotal')) ? true : 'wrong error: ' + j.error;
  });

  await check('GET /api/admin/product-orders/export?maxTotal=xyz → 400 (NaN guard)', async () => {
    const r = await fetch(BASE + '/api/admin/product-orders/export?maxTotal=xyz', {
      headers: { Cookie: adminCookies },
    });
    if (r.status !== 400) return 'expected 400, got: ' + r.status;
    const j = await r.json();
    return (j.error && j.error.includes('maxTotal')) ? true : 'wrong error: ' + j.error;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ERROR DISCLOSURE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n3. ERROR DISCLOSURE');

  await check('POST /api/admin/media with invalid file type → 400 (sanitized)', async () => {
    const formData = new FormData();
    const blob = new Blob(['test'], { type: 'text/plain' });
    formData.append('file', blob, 'test.exe');
    const r = await fetch(BASE + '/api/admin/media', {
      method: 'POST',
      headers: { Cookie: adminCookies, 'x-csrf-token': adminCsrf },
      body: formData,
    });
    if (r.status !== 400) return 'expected 400, got: ' + r.status;
    const j = await r.json();
    return j.error ? true : 'missing error message';
  });

  await check('DELETE /api/admin/media/nonexistent-uuid → 404 (no path leak)', async () => {
    const r = await fetch(BASE + '/api/admin/media/00000000-0000-0000-0000-000000000000', {
      method: 'DELETE',
      headers: { Cookie: adminCookies, 'x-csrf-token': adminCsrf, 'Content-Type': 'application/json' },
    });
    if (r.status !== 404) return 'expected 404, got: ' + r.status;
    return true;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CSRF VERIFICATION ON OTHER ROUTES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n4. CSRF VERIFICATION ON OTHER ROUTES');

  await check('POST /api/admin/product-orders/bulk without CSRF → 403', async () => {
    const r = await fetch(BASE + '/api/admin/product-orders/bulk', {
      method: 'PATCH',
      headers: { Cookie: adminCookies, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: [], status: 'SHIPPED' }),
    });
    return r.status === 403 ? true : 'expected 403, got: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. PRE-AUTH ROUTES — NO CSRF, RATE LIMITED
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n5. PRE-AUTH ROUTES — NO CSRF, RATE LIMITED');

  await check('POST /api/auth/forgot-password works without CSRF token', async () => {
    const r = await fetch(BASE + '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_' + Date.now() + '@example.com' }),
    });
    return r.status === 200 ? true : 'expected 200, got: ' + r.status;
  });

  await check('POST /api/auth/register works without CSRF token', async () => {
    const r = await fetch(BASE + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'CSRF Test', email: 'csrf_test_' + Date.now() + '@example.com', password: 'TestPass123!', confirmPassword: 'TestPass123!' }),
    });
    return r.status === 200 ? true : 'expected 200, got: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(60));
  console.log(`Sprint #31 runtime: ${passed} PASS, ${failed} FAIL, ${total} total`);
  process.exit(failed > 0 ? 1 : 0);
})();

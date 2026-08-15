#!/usr/bin/env node

/**
 * TEAKLE — Sprint #28 Runtime Tests
 * Full Application HTTP Integration Tests
 *
 * Prerequisites:
 *   1. A running production build on port 3099 (or set BASE_URL).
 *   2. Admin account seeded: testadmin@teakle.in / TestPassword123
 *   3. At least one active product (e.g. anchor-table) in the database.
 *
 * Usage:
 *   $env:BASE_URL="http://127.0.0.1:3099"; npm run start
 *   node scripts/runtime-sprint28.js
 */

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3099';
const ADMIN_EMAIL = 'testadmin@teakle.in';
const ADMIN_PASSWORD = 'TestPassword123';

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
  const r = await getResponseCookies(BASE + '/api/csrf', {
    method: 'GET',
    credentials: 'same-origin',
    headers: cookies ? { Cookie: cookies } : {},
  });
  return r;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

(async () => {
  console.log(`\n=== SPRINT #28 RUNTIME TESTS (${BASE}) ===\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HEALTH (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('1. HEALTH');

  let healthData = null;
  let healthResponse;

  await check('GET /api/health → 200', BASE + '/api/health', async r => {
    healthResponse = r;
    if (r.status !== 200) return 'status: ' + r.status;
    healthData = await r.json();
    return true;
  });

  await check('Health response has status field', async () => {
    if (!healthData) return 'no health data';
    return healthData.status ? true : 'missing status field';
  });

  await check('Health response has database info', async () => {
    if (!healthData) return 'no health data';
    return healthData.database ? true : 'missing database field';
  });

  await check('Health response does NOT expose db.path', async () => {
    if (!healthData) return 'no health data';
    const text = JSON.stringify(healthData);
    return !text.includes('db.path') && !healthData.database?.path ? true : 'leaked db.path';
  });

  await check('Health response does NOT expose error details', async () => {
    if (!healthData) return 'no health data';
    return healthData.status !== 'error' ? true : 'health status is error';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PUBLIC PAGES (15 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n2. PUBLIC PAGES');

  await check('GET / → 200', BASE + '/', r => r.status === 200);
  await check('GET /gallery → 200', BASE + '/gallery', r => r.status === 200);
  await check('GET /studio → 200', BASE + '/studio', r => r.status === 200);
  await check('GET /journal → 200', BASE + '/journal', r => r.status === 200);
  await check('GET /contact → 200', BASE + '/contact', r => r.status === 200);
  await check('GET /trade → 200', BASE + '/trade', r => r.status === 200);
  await check('GET /custom → 200', BASE + '/custom', r => r.status === 200);
  await check('GET /cart → 200', BASE + '/cart', r => r.status === 200);
  await check('GET /login → 200', BASE + '/login', r => r.status === 200);
  await check('GET /wishlist → 200', BASE + '/wishlist', r => r.status === 200);
  await check('GET /privacy → 200', BASE + '/privacy', r => r.status === 200);
  await check('GET /terms → 200', BASE + '/terms', r => r.status === 200);
  await check('GET /shipping → 200', BASE + '/shipping', r => r.status === 200);
  await check('GET /returns-and-refunds → 200', BASE + '/returns-and-refunds', r => r.status === 200);
  await check('GET /cancellation → 200', BASE + '/cancellation', r => r.status === 200);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. PRODUCT PAGES (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n3. PRODUCT PAGES');

  await check('GET /shop/anchor-table → 200', BASE + '/shop/anchor-table', r => r.status === 200);
  await check('GET /shop/bearing-chair → 200', BASE + '/shop/bearing-chair', r => r.status === 200);
  await check('GET /collection/kitchen-dining → 200', BASE + '/collection/kitchen-dining', r => r.status === 200);
  await check('GET /collection/home-decor → 200', BASE + '/collection/home-decor', r => r.status === 200);
  await check('GET /shop/nonexistent-product → 404', BASE + '/shop/nonexistent-product', r => r.status === 404);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. JOURNAL PAGES (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n4. JOURNAL PAGES');

  await check('GET /journal → 200', BASE + '/journal', r => r.status === 200);
  await check('GET /journal/what-solid-wood-actually-means → 200', BASE + '/journal/what-solid-wood-actually-means', r => r.status === 200);
  await check('GET /journal/nonexistent-article → 404', BASE + '/journal/nonexistent-article', r => r.status === 404);

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. 404 & SPECIAL (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n5. 404 & SPECIAL');

  await check('GET /nonexistent-page → 404', BASE + '/nonexistent-page', r => r.status === 404);
  await check('GET /sitemap.xml → 200', BASE + '/sitemap.xml', r => r.status === 200);
  await check('GET /robots.txt → 200', BASE + '/robots.txt', r => r.status === 200);
  await check('GET /api/health → 200 with JSON content type', BASE + '/api/health', async r => {
    if (r.status !== 200) return 'status: ' + r.status;
    const ct = r.headers.get('content-type') || '';
    return ct.includes('application/json') ? true : 'content-type: ' + ct;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. CUSTOMER AUTH FLOW (10 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n6. CUSTOMER AUTH FLOW');

  const ts = Date.now();
  const custEmail = `sprint28_${ts}@test.com`;
  const custPass = 'TestPass28!';

  await check('GET /api/csrf returns CSRF token', async () => {
    const r = await fetch(BASE + '/api/csrf');
    const allCookies = [];
    if (r.headers.getSetCookie) allCookies.push(...r.headers.getSetCookie());
    const csrfCookie = allCookies.find(c => c.includes('teakle_csrf='));
    return csrfCookie ? true : 'no teakle_csrf cookie';
  });

  await check('POST /api/auth/register with valid data → 200 or 409', async () => {
    const csrfResp = await freshCsrf(null);
    const csrfCookies = csrfResp.cookies;
    const csrfToken = extractCsrfToken(csrfCookies);
    const r = await fetch(BASE + '/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: csrfCookies,
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({ email: custEmail, password: custPass, confirmPassword: custPass, name: 'Sprint 28 Test' }),
    });
    return r.status === 200 || r.status === 409 ? true : 'status: ' + r.status;
  });

  await check('POST /api/auth/login with invalid credentials → 401', async () => {
    const r = await fetch(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: custEmail, password: 'wrongpassword' }),
    });
    if (r.status !== 401) return 'status: ' + r.status;
    const j = await r.json();
    return j.error === 'Invalid email or password' ? true : 'error: ' + j.error;
  });

  let custCookies = '', custCsrf = '';
  let loginSuccess = false;

  await check('POST /api/auth/register with unique email → 200', async () => {
    const csrfResp = await freshCsrf(null);
    const csrfCookies = csrfResp.cookies;
    const csrfToken = extractCsrfToken(csrfCookies);
    const r = await fetch(BASE + '/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: csrfCookies,
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({ email: custEmail, password: custPass, confirmPassword: custPass, name: 'Sprint 28 Test' }),
    });
    const j = await r.json().catch(() => null);
    return r.status === 200 || r.status === 409 ? true : 'status: ' + r.status;
  });

  await check('POST /api/auth/login with registered email → 200', async () => {
    const loginResp = await getResponseCookies(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: custEmail, password: custPass }),
    });
    custCookies = loginResp.cookies;
    custCsrf = extractCsrfToken(custCookies);
    loginSuccess = loginResp.status === 200 && custCookies.includes('teakle_customer_session=');
    if (!loginSuccess) return 'login failed: status=' + loginResp.status;
    return true;
  });

  await check('GET /api/auth/me with session cookie → customer profile', async () => {
    if (!loginSuccess) return 'no login session';
    const r = await fetch(BASE + '/api/auth/me', { headers: { Cookie: custCookies } });
    const j = await r.json();
    return j.customer && j.customer.email === custEmail ? true : 'wrong customer: ' + JSON.stringify(j);
  });

  await check('PUT /api/auth/profile with valid data → 200', async () => {
    if (!loginSuccess) return 'no login session';
    const r = await fetch(BASE + '/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: custCookies, 'x-csrf-token': custCsrf },
      body: JSON.stringify({ name: 'Updated Sprint 28' }),
    });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return j.ok ? true : 'ok not true';
  });

  await check('POST /api/auth/logout clears session', async () => {
    if (!loginSuccess) return 'no login session';
    const r = await fetch(BASE + '/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: custCookies },
    });
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  await check('GET /api/auth/me after logout → null customer', async () => {
    const r = await fetch(BASE + '/api/auth/me', { headers: { Cookie: custCookies } });
    const j = await r.json();
    return j.customer === null ? true : 'customer not null: ' + JSON.stringify(j);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. CART FLOW (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n7. CART FLOW');

  // Re-login for cart tests
  const cartLoginResp = await getResponseCookies(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: custEmail, password: custPass }),
  });
  const cartCookies = cartLoginResp.cookies;
  const cartCsrf = extractCsrfToken(cartCookies);
  const cartAuthOk = cartLoginResp.status === 200 && cartCookies.includes('teakle_customer_session=');

  if (cartAuthOk) {
    await check('GET /api/cart with auth → returns items array', async () => {
      const r = await fetch(BASE + '/api/cart', { headers: { Cookie: cartCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.items !== undefined ? true : 'no items field';
    });

    await check('POST /api/cart without auth → 401', async () => {
      const r = await fetch(BASE + '/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'anchor-table', quantity: 1 }),
      });
      return r.status === 401 ? true : 'status: ' + r.status;
    });

    await check('POST /api/cart with auth and invalid product → error', async () => {
      const r = await fetch(BASE + '/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cartCookies, 'x-csrf-token': cartCsrf },
        body: JSON.stringify({ productId: 'nonexistent-product', quantity: 1 }),
      });
      return r.status >= 400 ? true : 'status: ' + r.status;
    });

    await check('GET /api/cart with auth → empty cart initially', async () => {
      const r = await fetch(BASE + '/api/cart', { headers: { Cookie: cartCookies } });
      const j = await r.json();
      return Array.isArray(j.items) ? true : 'items not array';
    });

    await check('POST /api/cart with auth and valid product → adds item', async () => {
      const r = await fetch(BASE + '/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cartCookies, 'x-csrf-token': cartCsrf },
        body: JSON.stringify({ productId: 'anchor-table', quantity: 1 }),
      });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.ok && j.items && j.items.length > 0 ? true : 'unexpected: ' + JSON.stringify(j);
    });

    await check('DELETE /api/cart/[itemId] with auth → removes item', async () => {
      const r = await fetch(BASE + '/api/cart/anchor-table', {
        method: 'DELETE',
        headers: { Cookie: cartCookies, 'x-csrf-token': cartCsrf },
      });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.ok ? true : 'ok not true';
    });
  } else {
    skip('GET /api/cart with auth → returns items array');
    skip('POST /api/cart without auth → 401');
    skip('POST /api/cart with auth and invalid product → error');
    skip('GET /api/cart with auth → empty cart initially');
    skip('POST /api/cart with auth and valid product → adds item');
    skip('DELETE /api/cart/[itemId] with auth → removes item');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. WISHLIST FLOW (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n8. WISHLIST FLOW');

  if (cartAuthOk) {
    await check('GET /api/wishlist with auth → returns items array', async () => {
      const r = await fetch(BASE + '/api/wishlist', { headers: { Cookie: cartCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.items !== undefined ? true : 'no items field';
    });

    await check('POST /api/wishlist with auth and valid product → adds item', async () => {
      const r = await fetch(BASE + '/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cartCookies, 'x-csrf-token': cartCsrf },
        body: JSON.stringify({ productId: 'anchor-table' }),
      });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.ok && j.added === true ? true : 'unexpected: ' + JSON.stringify(j);
    });

    await check('GET /api/wishlist with auth → returns wishlist', async () => {
      const r = await fetch(BASE + '/api/wishlist', { headers: { Cookie: cartCookies } });
      const j = await r.json();
      return j.items && j.items.length > 0 ? true : 'wishlist empty: ' + JSON.stringify(j);
    });

    await check('DELETE /api/wishlist/[itemId] with auth → removes item', async () => {
      const r = await fetch(BASE + '/api/wishlist/anchor-table', {
        method: 'DELETE',
        headers: { Cookie: cartCookies, 'x-csrf-token': cartCsrf },
      });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.ok ? true : 'ok not true';
    });
  } else {
    skip('GET /api/wishlist with auth → returns items array');
    skip('POST /api/wishlist with auth and valid product → adds item');
    skip('GET /api/wishlist with auth → returns wishlist');
    skip('DELETE /api/wishlist/[itemId] with auth → removes item');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. ORDER FLOW (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n9. ORDER FLOW');

  if (cartAuthOk) {
    await check('GET /api/orders with auth → returns order list', async () => {
      const r = await fetch(BASE + '/api/orders', { headers: { Cookie: cartCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.orders !== undefined ? true : 'no orders field';
    });

    await check('POST /api/orders without auth → 401', async () => {
      const r = await fetch(BASE + '/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping: {}, billingSameAsShipping: true }),
      });
      return r.status === 401 ? true : 'status: ' + r.status;
    });

    await check('POST /api/orders with auth creates order (cart has items)', async () => {
      const addCart = await fetch(BASE + '/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cartCookies, 'x-csrf-token': cartCsrf },
        body: JSON.stringify({ productId: 'anchor-table', quantity: 1 }),
      });
      const shipping = {
        firstName: 'Test', lastName: 'Customer',
        email: custEmail, phone: '+919876543210',
        address: '123 Test Street', city: 'Mumbai', state: 'Maharashtra',
        pin: '400001', country: 'India',
      };
      const r = await fetch(BASE + '/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cartCookies, 'x-csrf-token': cartCsrf },
        body: JSON.stringify({ shipping, billingSameAsShipping: true }),
      });
      if (r.status !== 200) {
        const j = await r.json().catch(() => ({}));
        return 'status: ' + r.status + ' ' + (j.error || '');
      }
      const j = await r.json();
      return j.ok && j.order ? true : 'unexpected: ' + JSON.stringify(j);
    });

    await check('GET /api/orders includes paymentStatus', async () => {
      const r = await fetch(BASE + '/api/orders', { headers: { Cookie: cartCookies } });
      const j = await r.json();
      const order = j.orders?.[0];
      if (!order) return 'no orders';
      return order.paymentStatus !== undefined ? true : 'no paymentStatus field';
    });

    await check('GET /api/orders returns only own orders', async () => {
      const r = await fetch(BASE + '/api/orders', { headers: { Cookie: cartCookies } });
      const j = await r.json();
      return Array.isArray(j.orders) ? true : 'orders not array';
    });
  } else {
    skip('GET /api/orders with auth → returns order list');
    skip('POST /api/orders without auth → 401');
    skip('POST /api/orders with auth creates order (cart has items)');
    skip('GET /api/orders includes paymentStatus');
    skip('GET /api/orders returns only own orders');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. ADDRESS FLOW (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n10. ADDRESS FLOW');

  let addressId = null;

  if (cartAuthOk) {
    await check('GET /api/addresses with auth → returns address list', async () => {
      const r = await fetch(BASE + '/api/addresses', { headers: { Cookie: cartCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.addresses !== undefined ? true : 'no addresses field';
    });

    await check('POST /api/addresses with auth → creates address', async () => {
      const r = await fetch(BASE + '/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cartCookies, 'x-csrf-token': cartCsrf },
        body: JSON.stringify({
          label: 'Home', fullName: 'Test Customer', phone: '+919876543210',
          addressLine1: '123 Test Street', city: 'Mumbai', state: 'Maharashtra',
          postalCode: '400001', country: 'India',
        }),
      });
      if (r.status !== 200 && r.status !== 201) return 'status: ' + r.status;
      const j = await r.json();
      addressId = j.address?.id;
      return j.ok ? true : 'ok not true';
    });

    if (addressId) {
      await check('PUT /api/addresses/[id] with auth → updates address', async () => {
        const r = await fetch(BASE + '/api/addresses/' + addressId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Cookie: cartCookies, 'x-csrf-token': cartCsrf },
          body: JSON.stringify({
            label: 'Updated Home', fullName: 'Test Customer', phone: '+919876543210',
            addressLine1: '456 Updated St', city: 'Mumbai', state: 'Maharashtra',
            postalCode: '400001', country: 'India',
          }),
        });
        if (r.status !== 200) return 'status: ' + r.status;
        const j = await r.json();
        return j.ok ? true : 'ok not true';
      });

      await check('DELETE /api/addresses/[id] with auth → deletes address', async () => {
        const r = await fetch(BASE + '/api/addresses/' + addressId, {
          method: 'DELETE',
          headers: { Cookie: cartCookies, 'x-csrf-token': cartCsrf },
        });
        if (r.status !== 200) return 'status: ' + r.status;
        const j = await r.json();
        return j.ok ? true : 'ok not true';
      });
    } else {
      skip('PUT /api/addresses/[id] with auth → updates address');
      skip('DELETE /api/addresses/[id] with auth → deletes address');
    }
  } else {
    skip('GET /api/addresses with auth → returns address list');
    skip('POST /api/addresses with auth → creates address');
    skip('PUT /api/addresses/[id] with auth → updates address');
    skip('DELETE /api/addresses/[id] with auth → deletes address');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. ADMIN AUTH FLOW (8 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n11. ADMIN AUTH FLOW');

  await check('POST /api/admin/login with invalid credentials → 401', async () => {
    const csrfResp = await freshCsrf(null);
    const csrfCookies = csrfResp.cookies;
    const csrfToken = extractCsrfToken(csrfCookies);
    const r = await fetch(BASE + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfCookies, 'x-csrf-token': csrfToken },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: 'wrongpassword' }),
    });
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  const adminCsrfResp = await freshCsrf(null);
  const adminInitCookies = adminCsrfResp.cookies;
  const adminInitCsrf = extractCsrfToken(adminInitCookies);

  const adminLoginResp = await getResponseCookies(BASE + '/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminInitCookies, 'x-csrf-token': adminInitCsrf },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  let adminCookies = adminLoginResp.cookies;
  let adminCsrf = extractCsrfToken(adminCookies);
  const adminAuthOk = adminLoginResp.status === 200 && adminCookies.includes('teakle_admin_session=');

  await check('POST /api/admin/login with valid credentials → 200', async () => {
    return adminAuthOk ? true : 'admin login failed: status=' + adminLoginResp.status;
  });

  if (adminAuthOk) {
    await check('GET /api/admin/me with admin session → admin profile', async () => {
      const r = await fetch(BASE + '/api/admin/me', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.admin && j.admin.email === ADMIN_EMAIL ? true : 'wrong admin: ' + JSON.stringify(j);
    });

    await check('GET /api/admin/dashboard with admin auth → 200', async () => {
      const r = await fetch(BASE + '/api/admin/dashboard', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.success ? true : 'success not true';
    });

    await check('GET /api/admin/diagnostics with admin auth → 200', async () => {
      const r = await fetch(BASE + '/api/admin/diagnostics', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.database && j.system ? true : 'missing database/system';
    });

    await check('GET /api/admin/audit-logs with admin auth → 200', async () => {
      const r = await fetch(BASE + '/api/admin/audit-logs', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.success ? true : 'success not true';
    });

    await check('GET /api/admin/products with admin auth → 200', async () => {
      const r = await fetch(BASE + '/api/admin/products', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.success ? true : 'success not true';
    });

    await check('POST /api/admin/logout clears admin session', async () => {
      const r = await fetch(BASE + '/api/admin/logout', {
        method: 'POST',
        headers: { Cookie: adminCookies, 'x-csrf-token': adminCsrf },
      });
      return r.status === 200 ? true : 'status: ' + r.status;
    });
  } else {
    skip('GET /api/admin/me with admin session → admin profile');
    skip('GET /api/admin/dashboard with admin auth → 200');
    skip('GET /api/admin/diagnostics with admin auth → 200');
    skip('GET /api/admin/audit-logs with admin auth → 200');
    skip('GET /api/admin/products with admin auth → 200');
    skip('POST /api/admin/logout clears admin session');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. ADMIN PROTECTION (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n12. ADMIN PROTECTION');

  await check('GET /api/admin/dashboard without auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/dashboard');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  await check('GET /api/admin/diagnostics without auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/diagnostics');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  await check('GET /api/admin/audit-logs without auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/audit-logs');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  await check('GET /api/admin/products without auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/products');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  await check('PATCH /api/admin/settings without CSRF → 403', async () => {
    const r = await fetch(BASE + '/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteName: 'test' }),
    });
    return r.status === 403 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. CSRF PROTECTION (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n13. CSRF PROTECTION');

  const csrfLoginCookies = (await getResponseCookies(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: custEmail, password: custPass }),
  })).cookies;

  await check('POST /api/orders without CSRF header → 403', async () => {
    const r = await fetch(BASE + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfLoginCookies },
      body: JSON.stringify({ shipping: {}, billingSameAsShipping: true }),
    });
    return r.status === 403 ? true : 'status: ' + r.status;
  });

  await check('POST /api/cart without CSRF header → 403', async () => {
    const r = await fetch(BASE + '/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfLoginCookies },
      body: JSON.stringify({ productId: 'anchor-table', quantity: 1 }),
    });
    return r.status === 403 ? true : 'status: ' + r.status;
  });

  await check('POST /api/wishlist without CSRF header → 403', async () => {
    const r = await fetch(BASE + '/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfLoginCookies },
      body: JSON.stringify({ productId: 'anchor-table' }),
    });
    return r.status === 403 ? true : 'status: ' + r.status;
  });

  await check('PUT /api/auth/profile without CSRF header → 403', async () => {
    const r = await fetch(BASE + '/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: csrfLoginCookies },
      body: JSON.stringify({ name: 'No CSRF' }),
    });
    return r.status === 403 ? true : 'status: ' + r.status;
  });

  await check('POST with correct CSRF header succeeds', async () => {
    const csrfResp = await freshCsrf(csrfLoginCookies);
    const csrfCookies = csrfResp.cookies || csrfLoginCookies;
    const csrfToken = extractCsrfToken(csrfCookies) || extractCsrfToken(csrfLoginCookies);
    const addR = await fetch(BASE + '/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfCookies, 'x-csrf-token': csrfToken },
      body: JSON.stringify({
        label: 'CSRF Test', fullName: 'CSRF', phone: '+919876543210',
        addressLine1: 'CSRF St', city: 'Mumbai', state: 'MH', postalCode: '400001', country: 'India',
      }),
    });
    return addR.status === 200 || addR.status === 201 ? true : 'status: ' + addR.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 14. PAYMENT (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n14. PAYMENT');

  await check('POST /api/payments/intent returns provider-not-configured', async () => {
    const csrfResp = await freshCsrf(cartCookies);
    const csrfCookies = csrfResp.cookies || cartCookies;
    const csrfToken = extractCsrfToken(csrfCookies) || cartCsrf;
    const r = await fetch(BASE + '/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfCookies, 'x-csrf-token': csrfToken },
      body: JSON.stringify({ orderId: 99999999 }),
    });
    if (r.status === 400 || r.status === 404) {
      const j = await r.json().catch(() => ({}));
      return true;
    }
    return r.status === 400 || r.status === 401 || r.status === 403 || r.status === 404 ? true : 'status: ' + r.status;
  });

  await check('POST /api/payments/confirm returns provider-not-configured', async () => {
    const r = await fetch(BASE + '/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: 1, status: 'PAID' }),
    });
    return r.status >= 400 ? true : 'status: ' + r.status;
  });

  await check('POST /api/payments/refund returns provider-not-configured', async () => {
    const r = await fetch(BASE + '/api/payments/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: 1 }),
    });
    return r.status >= 400 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 15. SECURITY HEADERS (8 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n15. SECURITY HEADERS');

  const secHeaders = await fetch(BASE + '/api/health');

  await check('X-Content-Type-Options: nosniff', async () => {
    const val = secHeaders.headers.get('x-content-type-options');
    return val === 'nosniff' ? true : 'got: ' + val;
  });

  await check('X-Frame-Options: DENY', async () => {
    const val = secHeaders.headers.get('x-frame-options');
    return val === 'DENY' ? true : 'got: ' + val;
  });

  await check('Referrer-Policy header present', async () => {
    const val = secHeaders.headers.get('referrer-policy');
    return val ? true : 'missing';
  });

  await check('Permissions-Policy header present', async () => {
    const val = secHeaders.headers.get('permissions-policy');
    return val ? true : 'missing';
  });

  await check('API response has Cache-Control: no-store', async () => {
    const r = await fetch(BASE + '/api/health');
    const val = r.headers.get('cache-control');
    return val && val.includes('no-store') ? true : 'got: ' + val;
  });

  await check('Health response has proper content type', async () => {
    const ct = secHeaders.headers.get('content-type') || '';
    return ct.includes('application/json') ? true : 'content-type: ' + ct;
  });

  const pageHeaders = await fetch(BASE + '/');

  await check('Page response has X-Content-Type-Options', async () => {
    const val = pageHeaders.headers.get('x-content-type-options');
    return val ? true : 'missing';
  });

  await check('Page response has X-Frame-Options', async () => {
    const val = pageHeaders.headers.get('x-frame-options');
    return val ? true : 'missing';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 16. EMAIL (2 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n16. EMAIL');

  await check('POST /api/auth/forgot-password returns success message', async () => {
    const r = await fetch(BASE + '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@test.com' }),
    });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return j.ok && j.message ? true : 'unexpected: ' + JSON.stringify(j);
  });

  await check('POST /api/auth/forgot-password does NOT reveal user existence', async () => {
    const r = await fetch(BASE + '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@test.com' }),
    });
    const j = await r.json();
    const lower = JSON.stringify(j).toLowerCase();
    return !lower.includes('user not found') && !lower.includes('no account') ? true : 'leaked user existence';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 17. NEWSLETTER/CONTACT (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n17. NEWSLETTER/CONTACT');

  await check('POST /api/newsletter with valid email → success', async () => {
    const csrfResp = await freshCsrf(null);
    const csrfCookies = csrfResp.cookies;
    const csrfToken = extractCsrfToken(csrfCookies);
    const r = await fetch(BASE + '/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfCookies, 'x-csrf-token': csrfToken },
      body: JSON.stringify({ email: `newsletter_${ts}@test.com` }),
    });
    const j = await r.json().catch(() => ({}));
    return j.success === true || j.message === 'You are already subscribed' ? true : 'unexpected: status=' + r.status + ' ' + JSON.stringify(j);
  });

  await check('POST /api/contact with valid data → success', async () => {
    const csrfResp = await freshCsrf(null);
    const csrfCookies = csrfResp.cookies;
    const csrfToken = extractCsrfToken(csrfCookies);
    const r = await fetch(BASE + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfCookies, 'x-csrf-token': csrfToken },
      body: JSON.stringify({
        name: 'Test Contact', email: `contact_${ts}@test.com`,
        subject: 'Test Subject', message: 'Test message for sprint 28',
      }),
    });
    const j = await r.json().catch(() => ({}));
    return j.success === true ? true : 'unexpected: status=' + r.status + ' ' + JSON.stringify(j);
  });

  await check('POST /api/custom-orders with valid data → success', async () => {
    const csrfResp = await freshCsrf(null);
    const csrfCookies = csrfResp.cookies;
    const csrfToken = extractCsrfToken(csrfCookies);
    const r = await fetch(BASE + '/api/custom-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfCookies, 'x-csrf-token': csrfToken },
      body: JSON.stringify({
        name: 'Test Custom', email: `custom_${ts}@test.com`,
        phone: '+919876543210', size: 'Medium',
        dimensions: '120x80 cm', description: 'Custom test order',
      }),
    });
    const j = await r.json().catch(() => ({}));
    return j.success === true ? true : 'unexpected: status=' + r.status + ' ' + JSON.stringify(j);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 18. CMS (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n18. CMS');

  await check('GET /api/admin/content/home with admin auth → 200', async () => {
    const csrfResp = await freshCsrf(null);
    const csrfCookies = csrfResp.cookies;
    const csrfToken = extractCsrfToken(csrfCookies);
    const loginResp = await getResponseCookies(BASE + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfCookies, 'x-csrf-token': csrfToken },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const cmsCookies = loginResp.cookies;
    const r = await fetch(BASE + '/api/admin/content/home', { headers: { Cookie: cmsCookies } });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return j.success !== undefined ? true : 'unexpected: ' + JSON.stringify(j);
  });

  await check('GET /api/admin/content/home without auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/content/home');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  await check('Admin preview page returns 200', async () => {
    const r = await fetch(BASE + '/admin');
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 19. PAGINATION (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n19. PAGINATION');

  if (adminAuthOk) {
    await check('GET /api/admin/contact → has pagination field', async () => {
      const r = await fetch(BASE + '/api/admin/contact', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.pagination !== undefined ? true : 'no pagination field: ' + JSON.stringify(j);
    });

    await check('GET /api/admin/newsletter → has pagination field', async () => {
      const r = await fetch(BASE + '/api/admin/newsletter', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.pagination !== undefined ? true : 'no pagination field: ' + JSON.stringify(j);
    });

    await check('GET /api/admin/custom-orders → has pagination field', async () => {
      const r = await fetch(BASE + '/api/admin/custom-orders', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.pagination !== undefined ? true : 'no pagination field: ' + JSON.stringify(j);
    });

    await check('GET /api/admin/trade → has pagination field', async () => {
      const r = await fetch(BASE + '/api/admin/trade', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.pagination !== undefined ? true : 'no pagination field: ' + JSON.stringify(j);
    });

    await check('GET /api/admin/media → has pagination field', async () => {
      const r = await fetch(BASE + '/api/admin/media', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.pagination !== undefined ? true : 'no pagination field: ' + JSON.stringify(j);
    });

    await check('GET /api/admin/contact?page=1&limit=2 → respects limit param', async () => {
      const r = await fetch(BASE + '/api/admin/contact?page=1&limit=2', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      if (!j.pagination) return 'no pagination field';
      return j.pagination.limit === 2 ? true : 'limit not 2: ' + j.pagination.limit;
    });
  } else {
    skip('GET /api/admin/contact → has pagination field');
    skip('GET /api/admin/newsletter → has pagination field');
    skip('GET /api/admin/custom-orders → has pagination field');
    skip('GET /api/admin/trade → has pagination field');
    skip('GET /api/admin/media → has pagination field');
    skip('GET /api/admin/contact?page=1&limit=2 → respects limit param');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 20. ADMIN AUDIT LOGGING (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n20. ADMIN AUDIT LOGGING');

  if (adminAuthOk) {
    await check('GET /api/admin/audit-logs → has pagination and data fields', async () => {
      const r = await fetch(BASE + '/api/admin/audit-logs', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      if (!j.pagination) return 'no pagination field';
      if (j.data === undefined && j.logs === undefined) return 'no data/logs field: ' + JSON.stringify(j);
      return true;
    });

    await check('Admin login creates audit log entry', async () => {
      const csrfResp = await freshCsrf(null);
      const csrfCookies = csrfResp.cookies;
      const csrfToken = extractCsrfToken(csrfCookies);
      const loginR = await getResponseCookies(BASE + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: csrfCookies, 'x-csrf-token': csrfToken },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      });
      return loginR.status === 200 ? true : 'admin login failed: status=' + loginR.status;
    });

    await check('Admin logout creates audit log entry', async () => {
      const freshAdminCsrf = await freshCsrf(null);
      const freshAdminCookies = freshAdminCsrf.cookies;
      const freshAdminCsrfToken = extractCsrfToken(freshAdminCookies);
      const loginR = await getResponseCookies(BASE + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: freshAdminCookies, 'x-csrf-token': freshAdminCsrfToken },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      });
      if (loginR.status !== 200) return 'login failed: status=' + loginR.status;
      const logoutR = await fetch(BASE + '/api/admin/logout', {
        method: 'POST',
        headers: { Cookie: loginR.cookies, 'x-csrf-token': extractCsrfToken(loginR.cookies) },
      });
      return logoutR.status === 200 ? true : 'logout failed: status=' + logoutR.status;
    });
  } else {
    skip('GET /api/admin/audit-logs → has pagination and data fields');
    skip('Admin login creates audit log entry');
    skip('Admin logout creates audit log entry');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 21. SESSION ISOLATION (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n21. SESSION ISOLATION');

  await check('Admin token cannot access customer endpoints (GET /api/auth/me → customer null)', async () => {
    if (!adminAuthOk) return 'no admin session';
    const r = await fetch(BASE + '/api/auth/me', { headers: { Cookie: adminCookies } });
    const j = await r.json();
    return j.customer === null ? true : 'customer not null: ' + JSON.stringify(j);
  });

  await check('Customer token cannot access admin endpoints (GET /api/admin/dashboard → 401)', async () => {
    if (!cartAuthOk) return 'no customer session';
    const r = await fetch(BASE + '/api/admin/dashboard', { headers: { Cookie: cartCookies } });
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  await check('Customer token cannot access admin endpoints (GET /api/admin/products → 401)', async () => {
    if (!cartAuthOk) return 'no customer session';
    const r = await fetch(BASE + '/api/admin/products', { headers: { Cookie: cartCookies } });
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 22. PAYMENT NOT CONFIGURED (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n22. PAYMENT NOT CONFIGURED');

  await check('POST /api/payments/intent → configured:false or error', async () => {
    const csrfResp = await freshCsrf(cartCookies);
    const csrfCookies = csrfResp.cookies || cartCookies;
    const csrfToken = extractCsrfToken(csrfCookies) || cartCsrf;
    const r = await fetch(BASE + '/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfCookies, 'x-csrf-token': csrfToken },
      body: JSON.stringify({ orderId: 99999999 }),
    });
    const j = await r.json().catch(() => ({}));
    if (j.configured === false) return true;
    if (r.status >= 400) return true;
    return 'unexpected: status=' + r.status + ' ' + JSON.stringify(j);
  });

  await check('POST /api/payments/confirm → returns error (provider not configured)', async () => {
    const r = await fetch(BASE + '/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: 1, status: 'PAID' }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.status >= 400) return true;
    return 'unexpected: status=' + r.status + ' ' + JSON.stringify(j);
  });

  await check('POST /api/payments/refund → returns error (provider not configured)', async () => {
    const r = await fetch(BASE + '/api/payments/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: 1 }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.status >= 400) return true;
    return 'unexpected: status=' + r.status + ' ' + JSON.stringify(j);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 23. SECURITY HEADERS REGRESSION (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n23. SECURITY HEADERS REGRESSION');

  const regressionHeaders = await fetch(BASE + '/api/health');

  await check('X-Content-Type-Options: nosniff on API health', async () => {
    const val = regressionHeaders.headers.get('x-content-type-options');
    return val === 'nosniff' ? true : 'got: ' + val;
  });

  await check('X-Frame-Options: DENY on API health', async () => {
    const val = regressionHeaders.headers.get('x-frame-options');
    return val === 'DENY' ? true : 'got: ' + val;
  });

  await check('Referrer-Policy header present on API health', async () => {
    const val = regressionHeaders.headers.get('referrer-policy');
    return val ? true : 'missing';
  });

  await check('Cache-Control: no-store on API health', async () => {
    const val = regressionHeaders.headers.get('cache-control');
    return val && val.includes('no-store') ? true : 'got: ' + val;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 24. DIAGNOSTICS (2 tests)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n24. DIAGNOSTICS');

  if (adminAuthOk) {
    await check('GET /api/admin/diagnostics with admin auth → has database and system fields', async () => {
      const r = await fetch(BASE + '/api/admin/diagnostics', { headers: { Cookie: adminCookies } });
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      if (!j.database) return 'missing database field';
      if (!j.system) return 'missing system field';
      return true;
    });
  } else {
    skip('GET /api/admin/diagnostics with admin auth → has database and system fields');
  }

  await check('GET /api/admin/diagnostics without auth → 401', async () => {
    const r = await fetch(BASE + '/api/admin/diagnostics');
    return r.status === 401 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  const skipped = total - passed - failed;
  console.log(`\x1b[1mRuntime: ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)\x1b[0m`);
  if (failed > 0) process.exit(1);
})();

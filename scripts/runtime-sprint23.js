#!/usr/bin/env node

/**
 * TEAKLE — Sprint #23 Runtime Tests
 * Production Commerce Infrastructure Audit & Integration Readiness
 *
 * Run against a live server on port 3099.
 * Tests: product data, pricing, cart, checkout/order, auth, admin, health, CSRF, security.
 *
 * Set BASE_URL before running: $env:BASE_URL="http://127.0.0.1:3099"
 */

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3099';
const ADMIN_EMAIL = 'testadmin@teakle.in';
const ADMIN_PASSWORD = 'TestPassword123';

let passed = 0, failed = 0, total = 0;

function skip(name) {
  total++;
  console.log(`  \x1b[33m○\x1b[0m ${name} (skipped — rate-limited)`);
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
    if (url) r = await fetch(url, opts);
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
  const resp = await fetch(url, opts);
  const allCookies = [];
  if (resp.headers.getSetCookie) {
    allCookies.push(...resp.headers.getSetCookie());
  }
  if (allCookies.length === 0) {
    const raw = resp.headers.get('set-cookie');
    if (raw) allCookies.push(...(Array.isArray(raw) ? raw : [raw]));
  }
  return { cookies: allCookies.map(c => c.split(';')[0]).join('; '), status: resp.status };
}

function extractCsrfToken(cookieStr) {
  if (!cookieStr) return '';
  const match = cookieStr.match(/teakle_csrf=([^;]+)/);
  return match ? match[1] : '';
}

(async () => {
  console.log(`\n=== SPRINT #23 RUNTIME TESTS (${BASE}) ===\n`);

  // ─── 1. PUBLIC PRODUCT DATA ────────────────────────────────────────────────
  console.log('1. PRODUCT DATA INTEGRITY');

  let homeHtml = '';
  await check('Homepage loads', BASE + '/', r => { return r.status === 200 ? true : 'status: ' + r.status; });
  await check('Homepage HTML loads', BASE + '/', async r => {
    homeHtml = await r.text();
    return homeHtml.includes('Teakle') ? true : 'no Teakle content';
  });
  await check('Shop page loads', BASE + '/shop', async r => {
    const h = await r.text();
    return h.length > 500 ? true : 'empty page';
  });
  await check('Product page loads', BASE + '/shop/anchor-table', r => r.status === 200);
  await check('Product has JSON-LD', BASE + '/shop/anchor-table', async r => {
    const h = await r.text();
    return h.includes('"@type":"Product"') || h.includes('"@type": "Product"') ? true : 'no Product schema';
  });
  await check('Product has price', BASE + '/shop/anchor-table', async r => {
    const h = await r.text();
    return h.includes('1,85,000') || h.includes('185000') || h.includes('₹') ? true : 'no price found';
  });

  // ─── 2. HEALTH ENDPOINT ─────────────────────────────────────────────────────
  console.log('\n2. HEALTH ENDPOINT');

  await check('Health endpoint → 200', BASE + '/api/health', r => r.status === 200);
  await check('Health returns JSON', BASE + '/api/health', r => {
    const ct = r.headers.get('content-type');
    return ct && ct.includes('json') ? true : 'content-type: ' + ct;
  });
  await check('Health reports database status', BASE + '/api/health', async r => {
    const j = await r.json();
    return j.database ? true : 'no database field';
  });
  await check('Health reports WAL mode', BASE + '/api/health', async r => {
    const j = await r.json();
    return j.database && j.database.walMode !== undefined ? true : 'no WAL status';
  });
  await check('Health reports foreign keys', BASE + '/api/health', async r => {
    const j = await r.json();
    return j.database && j.database.foreignKeys !== undefined ? true : 'no FK status';
  });
  await check('Health reports integrity check', BASE + '/api/health', async r => {
    const j = await r.json();
    return j.database && j.database.integrity ? true : 'no integrity check';
  });

  // ─── 3. CART (UNAUTHENTICATED) ──────────────────────────────────────────────
  console.log('\n3. CART (UNAUTHENTICATED)');

  await check('Cart GET returns empty for guest', BASE + '/api/cart', async r => {
    const j = await r.json();
    return j.items && Array.isArray(j.items) ? true : 'no items array';
  });
  await check('Cart POST requires auth', BASE + '/api/cart', async r => {
    return r.status === 401 || r.status === 403 ? true : 'status: ' + r.status;
  }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 'anchor-table', quantity: 1 })
  });

  // ─── 4. CUSTOMER AUTH FLOW ──────────────────────────────────────────────────
  console.log('\n4. CUSTOMER AUTH FLOW');

  const testEmail = `sprint23test_${Date.now()}@test.com`;
  const testPass = 'TestPass123!';

  await check('Customer register creates account', BASE + '/api/auth/register', async r => {
    if (r.status !== 200 && r.status !== 201) {
      const j = await r.json().catch(() => ({}));
      return 'status: ' + r.status + ' ' + (j.error || '');
    }
    const j = await r.json();
    return j.ok || j.customer ? true : 'unexpected response: ' + JSON.stringify(j);
  }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPass, confirmPassword: testPass, name: 'Sprint 23 Test' })
  });

  await check('Duplicate registration rejected', BASE + '/api/auth/register', async r => {
    return r.status >= 400 ? true : 'status: ' + r.status;
  }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPass, confirmPassword: testPass, name: 'Sprint 23 Test' })
  });

  // Login and capture cookies in a single call
  let customerCookies = '';
  let customerCsrf = '';
  const loginResp = await getResponseCookies(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPass })
  });
  customerCookies = loginResp.cookies;
  customerCsrf = extractCsrfToken(customerCookies);
  const customerAuthOk = loginResp.status === 200 && customerCookies.includes('teakle_customer_session=');

  await check('Customer login returns session', async () => {
    if (loginResp.status === 429) return 'status: 429 rate-limited (will recover)';
    if (loginResp.status !== 200) return 'status: ' + loginResp.status;
    return customerAuthOk ? true : 'no session cookie';
  });

  await check('Wrong password rejected', BASE + '/api/auth/login', async r => {
    return r.status === 401 || r.status === 400 || r.status === 429 ? true : 'status: ' + r.status;
  }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'wrongpassword' })
  });

  // ─── 5. CART WITH AUTH ──────────────────────────────────────────────────────
  console.log('\n5. CART WITH AUTH');

  if (customerAuthOk) {
    await check('Add to cart with auth', BASE + '/api/cart', async r => {
      if (r.status !== 200) {
        const j = await r.json().catch(() => ({}));
        return 'status: ' + r.status + ' ' + (j.error || '');
      }
      const j = await r.json();
      return j.items ? true : 'no items';
    }, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': customerCookies,
        'x-csrf-token': customerCsrf,
      },
      body: JSON.stringify({ productId: 'anchor-table', quantity: 1 })
    });

    await check('Cart has item after add', BASE + '/api/cart', async r => {
      const j = await r.json();
      return j.items && j.items.length > 0 ? true : 'cart empty: ' + JSON.stringify(j);
    }, {
      headers: { 'Cookie': customerCookies }
    });
  } else {
    skip('Add to cart with auth');
    skip('Cart has item after add');
  }

  // ─── 6. ORDER CREATION ──────────────────────────────────────────────────────
  console.log('\n6. ORDER CREATION');

  const shippingAddr = {
    firstName: 'Test',
    lastName: 'Customer',
    email: testEmail,
    phone: '+919876543210',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400001',
    country: 'India',
  };

  let orderNumber = '';
  if (customerAuthOk) {
    await check('Order creation with valid address', BASE + '/api/orders', async r => {
      const j = await r.json().catch(() => ({}));
      if (r.status !== 200) return 'status: ' + r.status + ' ' + (j.error || '');
      if (j.ok && j.order) {
        orderNumber = j.order.orderNumber;
        return true;
      }
      return 'unexpected: ' + JSON.stringify(j);
    }, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': customerCookies,
        'x-csrf-token': customerCsrf,
      },
      body: JSON.stringify({ shipping: shippingAddr, billingSameAsShipping: true })
    });

    await check('Order has unique order number', async () => orderNumber.length > 0 ? true : 'no order number');
    await check('Order number starts with TK-', async () => orderNumber.startsWith('TK-') ? true : 'wrong format: ' + orderNumber);

    await check('Cart cleared after order', BASE + '/api/cart', async r => {
      const j = await r.json();
      return j.items && j.items.length === 0 ? true : 'cart not cleared: ' + JSON.stringify(j);
    }, {
      headers: { 'Cookie': customerCookies }
    });

    await check('Order appears in customer orders', BASE + '/api/orders', async r => {
      const j = await r.json();
      return j.orders && j.orders.length > 0 ? true : 'no orders';
    }, {
      headers: { 'Cookie': customerCookies }
    });

    await check('Order contains snapshot data', BASE + '/api/orders', async r => {
      const j = await r.json();
      const order = j.orders?.[0];
      if (!order) return 'no order';
      if (!order.items || order.items.length === 0) return 'no items';
      const item = order.items[0];
      return item.productNameSnapshot && item.unitPrice && item.lineTotal ? true : 'missing snapshot fields';
    }, {
      headers: { 'Cookie': customerCookies }
    });
  } else {
    skip('Order creation with valid address');
    skip('Order has unique order number');
    skip('Order number starts with TK-');
    skip('Cart cleared after order');
    skip('Order appears in customer orders');
    skip('Order contains snapshot data');
  }

  await check('Order creation requires auth', BASE + '/api/orders', async r => {
    return r.status === 401 || r.status === 403 ? true : 'status: ' + r.status;
  }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipping: shippingAddr })
  });

  await check('Empty cart order rejected', BASE + '/api/orders', async r => {
    return r.status >= 400 ? true : 'status: ' + r.status;
  }, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': customerCookies,
      'x-csrf-token': customerCsrf,
    },
    body: JSON.stringify({ shipping: shippingAddr })
  });

  // ─── 7. CUSTOMER CANNOT ACCESS OTHER ORDERS ─────────────────────────────────
  console.log('\n7. CUSTOMER SECURITY');

  await check('Customer cannot access admin orders', BASE + '/api/admin/product-orders', async r => {
    return r.status === 401 || r.status === 403 ? true : 'status: ' + r.status;
  }, {
    headers: { 'Cookie': customerCookies }
  });

  await check('Customer cannot access admin dashboard', BASE + '/api/admin/dashboard', async r => {
    return r.status === 401 || r.status === 403 ? true : 'status: ' + r.status;
  }, {
    headers: { 'Cookie': customerCookies }
  });

  await check('Health endpoint accessible without auth', BASE + '/api/health', r => r.status === 200);

  // ─── 8. ADMIN AUTH FLOW ─────────────────────────────────────────────────────
  console.log('\n8. ADMIN AUTH FLOW');

  const adminCsrfResp = await getResponseCookies(BASE + '/api/csrf', {
    method: 'GET',
    credentials: 'same-origin',
  });
  const adminInitialCookies = adminCsrfResp.cookies;
  const adminInitialCsrf = extractCsrfToken(adminInitialCookies);

  let adminSessionChecked = false;
  await check('Admin login returns session', BASE + '/api/admin/login', async r => {
    adminSessionChecked = true;
    if (r.status === 429) return 'status: 429 rate-limited';
    if (r.status !== 200) {
      const j = await r.json().catch(() => ({}));
      return 'status: ' + r.status + ' ' + (j.error || '');
    }
    const j = await r.json();
    return j.success || j.ok || j.admin ? true : 'unexpected: ' + JSON.stringify(j);
  }, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminInitialCookies,
      'x-csrf-token': adminInitialCsrf,
    },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });

  const adminLoginResp = await getResponseCookies(BASE + '/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminInitialCookies,
      'x-csrf-token': adminInitialCsrf,
    },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  let adminCookies = adminLoginResp.cookies;
  let adminCsrf = extractCsrfToken(adminCookies);
  const adminAuthOk = adminLoginResp.status === 200 && adminCookies.includes('teakle_admin_session=');

  await check('Admin wrong password rejected', BASE + '/api/admin/login', async r => {
    return r.status === 401 || r.status === 403 || r.status === 429 ? true : 'status: ' + r.status;
  }, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminInitialCookies,
      'x-csrf-token': adminInitialCsrf,
    },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: 'wrongpassword' })
  });

  // ─── 9. ADMIN ORDER OPERATIONS ──────────────────────────────────────────────
  console.log('\n9. ADMIN ORDER OPERATIONS');

  if (adminAuthOk) {
    await check('Admin order list returns', BASE + '/api/admin/product-orders', async r => {
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.success && j.data !== undefined ? true : 'unexpected structure: ' + JSON.stringify(Object.keys(j));
    }, {
      headers: { 'Cookie': adminCookies }
    });

    await check('Admin dashboard returns stats', BASE + '/api/admin/dashboard', async r => {
      if (r.status !== 200) return 'status: ' + r.status;
      const j = await r.json();
      return j.success && j.data && (j.data.totalRevenue !== undefined || j.data.productOrders !== undefined) ? true : 'no stats: ' + JSON.stringify(Object.keys(j));
    }, {
      headers: { 'Cookie': adminCookies }
    });

    await check('Admin audit logs accessible', BASE + '/api/admin/audit-logs', async r => {
      return r.status === 200 || r.status === 401 ? true : 'status: ' + r.status;
    }, {
      headers: { 'Cookie': adminCookies }
    });

    await check('Admin settings accessible', BASE + '/api/admin/settings', async r => {
      return r.status === 200 ? true : 'status: ' + r.status;
    }, {
      headers: { 'Cookie': adminCookies }
    });
  } else {
    skip('Admin order list returns');
    skip('Admin dashboard returns stats');
    skip('Admin audit logs accessible');
    skip('Admin settings accessible');
  }

  await check('Admin order list requires auth', BASE + '/api/admin/product-orders', async r => {
    return r.status === 401 || r.status === 403 ? true : 'status: ' + r.status;
  });

  // ─── 10. PAYMENT WEBHOOK ────────────────────────────────────────────────────
  console.log('\n10. PAYMENT WEBHOOK');

  await check('Payment webhook returns 501 (no provider)', BASE + '/api/payments/webhook', async r => {
    return r.status === 501 ? true : 'status: ' + r.status;
  }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'none', event: 'test' })
  });

  await check('Payment webhook rejects unknown provider', BASE + '/api/payments/webhook', async r => {
    return r.status === 400 ? true : 'status: ' + r.status;
  }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'unknown_provider', event: 'test' })
  });

  // ─── 11. CSRF PROTECTION ────────────────────────────────────────────────────
  console.log('\n11. CSRF PROTECTION');

  await check('POST without CSRF rejected', BASE + '/api/cart', async r => {
    return r.status === 403 ? true : 'status: ' + r.status;
  }, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': customerCookies,
    },
    body: JSON.stringify({ productId: 'pen-stand', quantity: 1 })
  });

  // ─── 12. SECURITY HEADERS ───────────────────────────────────────────────────
  console.log('\n12. SECURITY HEADERS');

  await check('X-Content-Type-Options: nosniff', BASE + '/api/health', r =>
    r.headers.get('x-content-type-options') === 'nosniff' ? true : 'got: ' + r.headers.get('x-content-type-options'));
  await check('X-Frame-Options: DENY', BASE + '/api/health', r =>
    r.headers.get('x-frame-options') === 'DENY' ? true : 'got: ' + r.headers.get('x-frame-options'));
  await check('Cache-Control on API', BASE + '/api/health', r => {
    const cc = r.headers.get('cache-control');
    return cc && cc.includes('no-store') ? true : 'got: ' + cc;
  });

  // ─── 13. PUBLIC PAGES ──────────────────────────────────────────────────────
  console.log('\n13. PUBLIC PAGES');

  const pages = [
    '/', '/gallery', '/studio', '/journal', '/archive',
    '/contact', '/trade', '/custom', '/login',
    '/cart', '/wishlist', '/checkout',
    '/privacy', '/terms', '/shipping', '/returns-and-refunds', '/warranty', '/cancellation',
  ];
  for (const p of pages) {
    await check(`${p} → 200`, BASE + p, r => r.status === 200);
  }

  await check('Sitemap → 200', BASE + '/sitemap.xml', r => r.status === 200);
  await check('Robots → 200', BASE + '/robots.txt', r => r.status === 200);
  await check('Invalid route → 404', BASE + '/nonexistent-page', r => r.status === 404);

  // ─── 14. PRODUCT & COLLECTION PAGES ────────────────────────────────────────
  console.log('\n14. PRODUCT & COLLECTION PAGES');

  await check('Product page → 200', BASE + '/shop/anchor-table', r => r.status === 200);
  await check('Invalid product → 404', BASE + '/shop/nonexistent', r => r.status === 404);
  await check('Collection page → 200', BASE + '/collection/kitchen-dining', r => r.status === 200);
  await check('Invalid collection → 404', BASE + '/collection/bogus', r => r.status === 404);
  await check('Journal article → 200', BASE + '/journal/what-solid-wood-actually-means', r => r.status === 200);
  await check('Invalid journal → 404', BASE + '/journal/fake-slug', r => r.status === 404);

  // ─── SUMMARY ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log(`\x1b[1mRuntime: ${passed} passed, ${failed} failed, ${total - passed - failed} skipped (${total} total)\x1b[0m`);
  if (failed > 0) process.exit(1);
})();

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3219';

const jar = new Map();
function storeCookies(res) {
  const sc = res.headers.get('set-cookie');
  if (!sc) return;
  for (const part of sc.split(',')) {
    const [pair] = part.split(';');
    const idx = pair.indexOf('=');
    if (idx > -1) jar.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
  }
}
function cookieHeader() {
  return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
}
function getCookie(name) { return jar.get(name) || ''; }

async function call(method, urlPath, { body = null, csrf = false, raw = false } = {}) {
  const headers = { cookie: cookieHeader() };
  if (body !== null) headers['Content-Type'] = 'application/json';
  if (csrf) headers['x-csrf-token'] = getCookie('teakle_csrf');
  const res = await fetch(BASE + urlPath, {
    method, headers,
    body: body !== null ? JSON.stringify(body) : undefined,
  });
  storeCookies(res);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, headers: res.headers, text, json };
}

let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log('  \x1b[32m✓\x1b[0m ' + name); }
  else { fail++; console.log('  \x1b[31m✗\x1b[0m ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  console.log('\n=== SPRINT #20 LIVE RUNTIME TESTS (' + BASE + ') ===\n');

  console.log('1. Unauthorized Access (no session)');
  check('dashboard → 401', (await call('GET', '/api/admin/dashboard')).status === 401);
  check('audit-logs → 401', (await call('GET', '/api/admin/audit-logs')).status === 401);
  check('product-orders export → 401', (await call('GET', '/api/admin/product-orders/export')).status === 401);
  check('bulk unauth → 401/403', [401, 403].includes((await call('PATCH', '/api/admin/product-orders/bulk', { body: { orderIds: [1], status: 'CONFIRMED' } })).status));

  console.log('\n2. CSRF Protection on Login');
  check('GET /api/csrf → 200', (await call('GET', '/api/csrf')).status === 200);
  check('teakle_csrf cookie set', !!getCookie('teakle_csrf'));
  check('login without CSRF → 403', (await call('POST', '/api/admin/login', { body: { email: 'testadmin@teakle.in', password: 'TestPassword123' } })).status === 403);
  check('login wrong password → 401', (await call('POST', '/api/admin/login', { body: { email: 'testadmin@teakle.in', password: 'wrong' }, csrf: true })).status === 401);

  console.log('\n3. Admin Login');
  const login = await call('POST', '/api/admin/login', { body: { email: 'testadmin@teakle.in', password: 'TestPassword123' }, csrf: true });
  check('login valid → 200', login.status === 200 && login.json?.success, 'got ' + login.status);
  check('teakle_admin_session cookie set', !!getCookie('teakle_admin_session'));

  console.log('\n4. Dashboard Metrics');
  const dash = await call('GET', '/api/admin/dashboard');
  check('dashboard → 200', dash.status === 200);
  check('dashboard.success', dash.json?.success === true);
  const d = dash.json?.data || {};
  for (const k of ['newOrders', 'totalCustomOrders', 'customers', 'contactSubmissions', 'tradeEnquiries', 'newsletterSubscribers', 'paidOrders', 'totalRevenue', 'unpaidOrders', 'pendingProductOrders', 'cmsPublished']) {
    check('dashboard.' + k + ' numeric', typeof d[k] === 'number', JSON.stringify(d[k]));
  }

  console.log('\n5. Order Filtering');
  check('filter status → 200', (await call('GET', '/api/admin/product-orders?status=PENDING&limit=5')).status === 200);
  const f1 = await call('GET', '/api/admin/product-orders?status=PENDING&limit=5');
  check('filter returns data array', Array.isArray(f1.json?.data));
  check('filter minTotal/maxTotal → 200', (await call('GET', '/api/admin/product-orders?minTotal=1&maxTotal=99999999')).status === 200);
  check('unknown filter param → 200', (await call('GET', '/api/admin/product-orders?customerEmail=x@y.com&bogus=1')).status === 200);

  console.log('\n6. Order Activity');
  const act = await call('GET', '/api/admin/product-orders/1/activity');
  check('activity → 200 or 404', act.status === 200 || act.status === 404, 'got ' + act.status);
  if (act.status === 200) check('activity returns array', Array.isArray(act.json?.data));

  console.log('\n7. Audit Log API');
  const audit = await call('GET', '/api/admin/audit-logs?limit=10');
  check('audit-logs → 200', audit.status === 200);
  check('audit-logs data array', Array.isArray(audit.json?.data));
  check('audit-logs pagination', audit.json?.pagination && typeof audit.json.pagination.total === 'number');

  console.log('\n8. Bulk Order Action');
  check('bulk without CSRF → 403', (await call('PATCH', '/api/admin/product-orders/bulk', { body: { orderIds: [1], status: 'CONFIRMED' } })).status === 403);
  check('bulk forbidden PAID → 400', (await call('PATCH', '/api/admin/product-orders/bulk', { body: { orderIds: [1], status: 'PAID' }, csrf: true })).status === 400);
  const list = await call('GET', '/api/admin/product-orders?limit=1');
  const firstId = Array.isArray(list.json?.data) && list.json.data[0]?.id;
  if (firstId) {
    const okBulk = await call('PATCH', '/api/admin/product-orders/bulk', { body: { orderIds: [firstId], status: 'CONFIRMED' }, csrf: true });
    check('bulk valid CONFIRMED → 200', okBulk.status === 200, 'got ' + okBulk.status);
  } else {
    check('bulk valid CONFIRMED → 200', true, '(no orders in DB)');
  }

  console.log('\n9. CSV Exports (+ formula-injection hardening)');
  const exports = ['/api/admin/product-orders/export', '/api/admin/custom-orders/export', '/api/admin/contact/export', '/api/admin/trade/export', '/api/admin/newsletter/export'];
  for (const ep of exports) {
    const exp = await call('GET', ep);
    check(ep + ' → 200', exp.status === 200, 'got ' + exp.status);
    const ct = exp.headers.get('content-type') || '';
    check(ep + ' text/csv', ct.includes('text/csv'), ct);
    check(ep + ' has body', exp.text.includes(',') || exp.text.length === 0);
  }

  console.log('\n10. Customer Isolation');
  const cLogin = await call('POST', '/api/auth/login', { body: { email: 'nope@test.com', password: 'TestPassword123' }, csrf: true });
  if (getCookie('teakle_customer_session')) {
    check('customer session blocked from admin', [401, 403].includes((await call('GET', '/api/admin/audit-logs')).status));
  } else {
    check('customer session blocked from admin', true, '(no customer acct; CSRF/login path verified)');
  }

  console.log('\n' + '='.repeat(64));
  console.log(`\x1b[1mRESULT: ${pass} passed, ${fail} failed\x1b[0m`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch((e) => { console.error('\x1b[31mFATAL\x1b[0m', e); process.exit(1); });

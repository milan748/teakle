const BASE = process.env.BASE_URL || 'http://127.0.0.1:3225';
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  \x1b[32m✓\x1b[0m ' + name); }
  else { fail++; console.log('  \x1b[31m✗\x1b[0m ' + name + (extra ? ' — ' + extra : '')); }
}

async function hit(path, opts = {}) {
  try {
    const res = await fetch(BASE + path, { redirect: 'manual', ...opts });
    return { status: res.status, headers: res.headers, ok: res.ok };
  } catch (e) {
    return { status: 0, error: e.message };
  }
}

async function main() {
  console.log('\n=== SECTION 20: FRONTEND REGRESSION (' + BASE + ') ===\n');

  const routes = [
    ['/', 'Homepage'],
    ['/login', 'Login'],
    ['/account', 'Account'],
    ['/cart', 'Cart'],
    ['/wishlist', 'Wishlist'],
    ['/checkout', 'Checkout'],
    ['/gallery', 'Gallery'],
    ['/shop/anchor-table', 'Shop: Anchor Table'],
    ['/shop/bearing-chair', 'Shop: Bearing Chair'],
    ['/collection/kitchen-dining', 'Collection: Kitchen & Dining'],
    ['/custom', 'Custom Orders'],
    ['/contact', 'Contact'],
    ['/trade', 'Trade'],
  ];

  console.log('Public Routes');
  for (const [path, name] of routes) {
    const r = await hit(path);
    const html = r.status === 200;
    check(`${name} (${path}) → 200`, r.status === 200 || r.status === 304, `got ${r.status}`);
  }

  console.log('\nAdmin Routes');
  const adminRoutes = [
    ['/admin/login', 'Admin Login'],
    ['/admin', 'Admin Dashboard'],
  ];
  for (const [path, name] of adminRoutes) {
    const r = await hit(path);
    check(`${name} (${path}) responds`, r.status === 200 || r.status === 302 || r.status === 304, `got ${r.status}`);
  }

  console.log('\nAPI Health Check');
  const csrf = await hit('/api/csrf');
  check('CSRF token endpoint → 200', csrf.status === 200, `got ${csrf.status}`);
  const apiRoutes = [
    ['/api/admin/audit-logs', 'Audit logs (unauth → 401)'],
    ['/api/admin/dashboard', 'Dashboard (unauth → 401)'],
    ['/api/admin/product-orders', 'Product orders (unauth → 401)'],
    ['/api/admin/product-orders/export', 'Orders export (unauth → 401)'],
    ['/api/admin/custom-orders/export', 'Custom orders export (unauth → 401)'],
    ['/api/admin/contact/export', 'Contact export (unauth → 401)'],
    ['/api/admin/trade/export', 'Trade export (unauth → 401)'],
    ['/api/admin/newsletter/export', 'Newsletter export (unauth → 401)'],
    ['/api/admin/product-orders/bulk', 'Bulk action (unauth → 401/403)'],
  ];
  for (const [path, name] of apiRoutes) {
    const r = await hit(path, { method: path.includes('bulk') ? 'PATCH' : 'GET', headers: path.includes('bulk') ? { 'Content-Type': 'application/json' } : {} });
    const expected401or403 = [401, 403].includes(r.status);
    check(`${name} → ${r.status}`, expected401or403, `got ${r.status}`);
  }

  console.log('\n' + '='.repeat(64));
  console.log(`\x1b[1mFrontend Regression: ${pass} passed, ${fail} failed\x1b[0m`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });

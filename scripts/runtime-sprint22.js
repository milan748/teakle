#!/usr/bin/env node

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3099';
let passed = 0, failed = 0;

async function check(name, url, fn) {
  try {
    const r = await fetch(url);
    const result = await fn(r);
    if (result === true) { passed++; console.log('  \x1b[32m✓\x1b[0m ' + name); }
    else { failed++; console.log('  \x1b[31m✗\x1b[0m ' + name + ': ' + result); }
  } catch(e) { failed++; console.log('  \x1b[31m✗\x1b[0m ' + name + ': ' + e.message); }
}

(async () => {
  console.log('\n=== SPRINT #22 LIVE RUNTIME TESTS (' + BASE + ') ===\n');

  console.log('1. PUBLIC PAGES');
  await check('Homepage → 200', BASE + '/', r => r.status === 200);
  await check('Gallery → 200', BASE + '/gallery', r => r.status === 200);
  await check('Studio → 200', BASE + '/studio', r => r.status === 200);
  await check('Journal → 200', BASE + '/journal', r => r.status === 200);
  await check('Archive → 200', BASE + '/archive', r => r.status === 200);
  await check('Contact → 200', BASE + '/contact', r => r.status === 200);
  await check('Trade → 200', BASE + '/trade', r => r.status === 200);
  await check('Custom → 200', BASE + '/custom', r => r.status === 200);
  await check('Login → 200', BASE + '/login', r => r.status === 200);
  await check('Cart → 200', BASE + '/cart', r => r.status === 200);
  await check('Wishlist → 200', BASE + '/wishlist', r => r.status === 200);
  await check('Checkout → 200', BASE + '/checkout', r => r.status === 200);
  await check('Privacy → 200', BASE + '/privacy', r => r.status === 200);
  await check('Terms → 200', BASE + '/terms', r => r.status === 200);
  await check('Shipping → 200', BASE + '/shipping', r => r.status === 200);
  await check('Returns → 200', BASE + '/returns-and-refunds', r => r.status === 200);
  await check('Warranty → 200', BASE + '/warranty', r => r.status === 200);
  await check('Cancellation → 200', BASE + '/cancellation', r => r.status === 200);
  await check('Subcategory → 200', BASE + '/subcategory?cat=kitchen&sub=bowls', r => r.status === 200);

  console.log('\n2. PRODUCT PAGES');
  await check('anchor-table → 200', BASE + '/shop/anchor-table', r => r.status === 200);
  await check('bearing-chair → 200', BASE + '/shop/bearing-chair', r => r.status === 200);
  await check('circle-table → 200', BASE + '/shop/circle-table', r => r.status === 200);
  await check('Invalid product → 404', BASE + '/shop/nonexistent', r => r.status === 404);

  console.log('\n3. COLLECTION PAGES');
  await check('kitchen-dining → 200', BASE + '/collection/kitchen-dining', r => r.status === 200);
  await check('home-decor → 200', BASE + '/collection/home-decor', r => r.status === 200);
  await check('Invalid collection → 404', BASE + '/collection/bogus', r => r.status === 404);

  console.log('\n4. JOURNAL PAGES');
  await check('Article → 200', BASE + '/journal/what-solid-wood-actually-means', r => r.status === 200);
  await check('Invalid journal → 404', BASE + '/journal/fake-slug-xyz', r => r.status === 404);

  console.log('\n5. SITEMAP & ROBOTS');
  await check('Sitemap → 200', BASE + '/sitemap.xml', r => r.status === 200);
  await check('Sitemap is XML', BASE + '/sitemap.xml', async r => {
    const ct = r.headers.get('content-type');
    return ct && ct.includes('xml') ? true : 'content-type: ' + ct;
  });
  await check('Sitemap has teakle.in URLs', BASE + '/sitemap.xml', async r => {
    const t = await r.text();
    return t.includes('https://teakle.in/') ? true : 'no teakle.in URLs';
  });
  await check('Sitemap no localhost', BASE + '/sitemap.xml', async r => {
    const t = await r.text();
    return !t.includes('localhost') ? true : 'contains localhost';
  });
  await check('Robots → 200', BASE + '/robots.txt', r => r.status === 200);
  await check('Robots disallows /account', BASE + '/robots.txt', async r => {
    const t = await r.text();
    return t.includes('/account') ? true : 'missing /account';
  });
  await check('Robots disallows /checkout', BASE + '/robots.txt', async r => {
    const t = await r.text();
    return t.includes('/checkout') ? true : 'missing /checkout';
  });
  await check('Robots has sitemap URL', BASE + '/robots.txt', async r => {
    const t = await r.text();
    return t.includes('sitemap.xml') ? true : 'missing sitemap URL';
  });

  console.log('\n6. SEO (LIVE HTML)');
  await check('Homepage has title', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('<title>') ? true : 'no title tag';
  });
  await check('Homepage has meta description', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('name="description"') ? true : 'no meta description';
  });
  await check('Homepage has canonical', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('rel="canonical"') ? true : 'no canonical';
  });
  await check('Homepage has og:title', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('og:title') ? true : 'no og:title';
  });
  await check('Homepage has twitter:card', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('twitter:card') ? true : 'no twitter:card';
  });
  await check('Product has Product JSON-LD', BASE + '/shop/anchor-table', async r => {
    const h = await r.text();
    return h.includes('"@type":"Product"') || h.includes('"@type": "Product"') ? true : 'no Product schema';
  });
  await check('Product has canonical', BASE + '/shop/anchor-table', async r => {
    const h = await r.text();
    return h.includes('rel="canonical"') ? true : 'no canonical';
  });
  await check('Product has og:title', BASE + '/shop/anchor-table', async r => {
    const h = await r.text();
    return h.includes('og:title') ? true : 'no og:title';
  });
  await check('Journal has Article JSON-LD', BASE + '/journal/what-solid-wood-actually-means', async r => {
    const h = await r.text();
    return h.includes('"@type":"Article"') || h.includes('"@type": "Article"') ? true : 'no Article schema';
  });
  await check('Journal has canonical', BASE + '/journal/what-solid-wood-actually-means', async r => {
    const h = await r.text();
    return h.includes('rel="canonical"') ? true : 'no canonical';
  });
  await check('Journal has og:type article', BASE + '/journal/what-solid-wood-actually-means', async r => {
    const h = await r.text();
    return h.includes('og:type') ? true : 'no og:type';
  });

  console.log('\n7. ACCESSIBILITY (LIVE HTML)');
  await check('Skip-to-content link', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('#main-content') ? true : 'no skip link';
  });
  await check('Logo has alt text', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('alt="Teakle"') ? true : 'no alt on logo';
  });
  await check('HTML lang=en', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('lang="en"') ? true : 'no lang attr';
  });
  await check('Organization JSON-LD', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('"@type":"Organization"') || h.includes('"@type": "Organization"') ? true : 'no Organization schema';
  });
  await check('WebSite JSON-LD', BASE + '/', async r => {
    const h = await r.text();
    return h.includes('"@type":"WebSite"') || h.includes('"@type": "WebSite"') ? true : 'no WebSite schema';
  });

  console.log('\n8. SECURITY HEADERS');
  await check('X-Content-Type-Options', BASE + '/api/health', r =>
    r.headers.get('x-content-type-options') === 'nosniff' ? true : 'got: ' + r.headers.get('x-content-type-options'));
  await check('X-Frame-Options', BASE + '/api/health', r =>
    r.headers.get('x-frame-options') === 'DENY' ? true : 'got: ' + r.headers.get('x-frame-options'));
  await check('Cache-Control on API', BASE + '/api/health', r => {
    const cc = r.headers.get('cache-control');
    return cc && cc.includes('no-store') ? true : 'got: ' + cc;
  });

  console.log('\n9. 404 / ERROR UX');
  await check('Invalid route → 404', BASE + '/nonexistent-page', r => r.status === 404);
  await check('Invalid product → 404', BASE + '/shop/totally-fake', r => r.status === 404);
  await check('Invalid journal → 404', BASE + '/journal/bogus-slug', r => r.status === 404);
  await check('Invalid collection → 404', BASE + '/collection/bogus', r => r.status === 404);

  console.log('\n' + '='.repeat(50));
  console.log('\x1b[1mRuntime: ' + passed + ' passed, ' + failed + ' failed\x1b[0m');
  if (failed > 0) process.exit(1);
})();

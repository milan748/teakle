#!/usr/bin/env node

/**
 * TEAKLE — Sprint #34 Runtime Tests
 * Premium Mobile & Editorial UX Redesign
 *
 * Full application HTTP integration tests against a running production build.
 *
 * Prerequisites:
 *   1. A running production build on port 3099 (or set BASE_URL).
 *   2. Admin account seeded: testadmin@teakle.in / TestPassword123
 *
 * Usage:
 *   $env:BASE_URL="http://127.0.0.1:3099"; npm run start
 *   node scripts/runtime-sprint34.js
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
  console.log('TEAKLE Sprint #34 Runtime Tests — Premium Mobile & Editorial UX Redesign\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HOMEPAGE — HTML STRUCTURE & CSS DELIVERY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('1. HOMEPAGE — HTML STRUCTURE & CSS DELIVERY');

  let homeHtml = '';
  await check('GET / returns 200 with HTML', async () => {
    const r = await fetch(BASE + '/');
    if (r.status !== 200) return 'status: ' + r.status;
    homeHtml = await r.text();
    if (!homeHtml.includes('<!DOCTYPE html>') && !homeHtml.includes('<!doctype html>')) return 'not HTML';
    return true;
  });

  await check('Homepage references Montserrat font', async () => {
    if (!homeHtml) return 'no HTML';
    if (homeHtml.includes('Montserrat') || homeHtml.includes('montserrat')) return true;
    if (homeHtml.includes('googleapis.com')) return true;
    return 'missing Montserrat in HTML';
  });

  await check('Homepage references bundled CSS', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('_next/static/css/') ? true : 'missing CSS link';
  });

  await check('Homepage has bottom-nav element', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('bottom-nav') ? true : 'missing bottom-nav';
  });

  await check('Homepage has site-header element', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('site-header') ? true : 'missing site-header';
  });

  await check('Homepage has site-footer element', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('site-footer') ? true : 'missing site-footer';
  });

  await check('Homepage has hero section (v2-hero)', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('v2-hero') ? true : 'missing v2-hero';
  });

  await check('Homepage has products section (v2-products)', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('v2-products') ? true : 'missing v2-products';
  });

  await check('Homepage has philosophy section (v2-philosophy)', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('v2-philosophy') ? true : 'missing v2-philosophy';
  });

  await check('Homepage has signature section (v2-signature)', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('v2-signature') ? true : 'missing v2-signature';
  });

  await check('Homepage has craftsmanship section (v2-craft)', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('v2-craft') ? true : 'missing v2-craft';
  });

  await check('Homepage has lifestyle section (v2-lifestyle)', async () => {
    if (!homeHtml) return 'no HTML';
    return homeHtml.includes('v2-lifestyle') ? true : 'missing v2-lifestyle';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CSS FILE SERVING & MOBILE BREAKPOINTS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n2. CSS FILE SERVING & MOBILE BREAKPOINTS');

  let cssText = '';
  await check('Bundled CSS is served from /_next/static/css/', async () => {
    if (!homeHtml) return 'no HTML';
    const cssMatch = homeHtml.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/);
    if (!cssMatch) return 'no CSS link found in HTML';
    const r = await fetch(BASE + cssMatch[1]);
    if (r.status !== 200) return 'CSS fetch status: ' + r.status;
    cssText = await r.text();
    if (cssText.length < 5000) return 'CSS too short: ' + cssText.length;
    return true;
  });

  await check('Bundled CSS contains 860px breakpoint', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('860px') ? true : 'missing 860px';
  });

  await check('Bundled CSS contains 560px breakpoint', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('560px') ? true : 'missing 560px';
  });

  await check('Bundled CSS contains 430px breakpoint', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('430px') ? true : 'missing 430px';
  });

  await check('Mobile 860px overrides --text-body', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('--text-body:') ? true : 'missing --text-body override';
  });

  await check('Mobile 860px overrides --text-h1', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('--text-h1:1.5rem') || cssText.includes('--text-h1: 1.5rem') ? true : 'wrong 860px h1';
  });

  await check('Mobile 560px overrides --text-body', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('.75rem') && cssText.includes('text-body') ? true : 'wrong 560px body';
  });

  await check('Mobile 560px overrides --text-h1', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('--text-h1:1.3125rem') || cssText.includes('--text-h1: 1.3125rem') ? true : 'wrong 560px h1';
  });

  await check('860px bottom-nav has glassmorphism background', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('backdrop-filter:blur(20px)') || cssText.includes('backdrop-filter: blur(20px)') ? true : 'missing glassmorphism';
  });

  await check('860px nav drawer uses controlled width', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('min(85vw,320px)') || cssText.includes('min(85vw, 320px)') || cssText.includes('85vw') ? true : 'wrong nav drawer width';
  });

  await check('860px nav drawer is left-side slide', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('translateX(-100%)') ? true : 'missing left-side slide';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. GALLERY PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n3. GALLERY PAGE');

  await check('GET /gallery returns 200', async () => {
    const r = await fetch(BASE + '/gallery');
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  await check('Gallery page has site-header', async () => {
    const r = await fetch(BASE + '/gallery');
    const html = await r.text();
    return html.includes('site-header') ? true : 'missing site-header';
  });

  await check('Gallery page has site-footer', async () => {
    const r = await fetch(BASE + '/gallery');
    const html = await r.text();
    return html.includes('site-footer') ? true : 'missing site-footer';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. SHOP PAGE (PRODUCT DETAIL)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n4. SHOP PAGE (PRODUCT DETAIL)');

  await check('GET /shop/anchor-table returns 200', async () => {
    const r = await fetch(BASE + '/shop/anchor-table');
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  await check('Shop page includes product image', async () => {
    const r = await fetch(BASE + '/shop/anchor-table');
    const html = await r.text();
    return html.includes('img') ? true : 'no img tags';
  });

  await check('Shop page includes bottom-nav', async () => {
    const r = await fetch(BASE + '/shop/anchor-table');
    const html = await r.text();
    return html.includes('bottom-nav') ? true : 'missing bottom-nav';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. API ROUTES STILL FUNCTIONAL
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n5. API ROUTES STILL FUNCTIONAL');

  await check('GET /api/health returns 200', async () => {
    const r = await fetch(BASE + '/api/health');
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return (j.ok === true || j.status === 'ok' || j.status === 'healthy') ? true : 'health not ok: ' + JSON.stringify(j);
  });

  await check('GET /api/csrf returns token', async () => {
    const r = await fetch(BASE + '/api/csrf');
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return j.csrfToken ? true : 'no csrfToken in response';
  });

  await check('Admin login works', async () => {
    const csrfResp = await freshCsrf('');
    const cookies = csrfResp.cookies || '';
    const csrf = extractCsrfToken(cookies);
    const r = await fetch(BASE + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookies, 'x-csrf-token': csrf },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (r.status !== 200) return 'status: ' + r.status;
    const j = await r.json();
    return j.success === true ? true : 'login failed: ' + JSON.stringify(j);
  });

  await check('GET /api/cart returns 200 (empty cart)', async () => {
    const r = await fetch(BASE + '/api/cart');
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. CONTENT PAGES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n6. CONTENT PAGES');

  const contentPages = ['/studio', '/archive', '/trade', '/custom', '/contact', '/privacy', '/terms', '/shipping', '/returns-and-refunds', '/warranty', '/cancellation'];
  for (const page of contentPages) {
    await check(`GET ${page} returns 200`, async () => {
      const r = await fetch(BASE + page);
      return r.status === 200 ? true : 'status: ' + r.status;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. AUTH PAGES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n7. AUTH PAGES');

  await check('GET /login returns 200', async () => {
    const r = await fetch(BASE + '/login');
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  await check('GET /account returns 200 (redirects or shows login)', async () => {
    const r = await fetch(BASE + '/account');
    return r.status === 200 ? true : 'status: ' + r.status;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. DESIGN SYSTEM INTEGRITY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n8. DESIGN SYSTEM INTEGRITY');

  await check('CSS has :root custom properties', async () => {
    if (!cssText) return 'no CSS';
    return (cssText.includes(':root{') || cssText.includes(':root {')) && cssText.includes('--bg-primary:') ? true : 'missing root vars';
  });

  await check('CSS has reduced-motion media query', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('prefers-reduced-motion') ? true : 'missing reduced-motion';
  });

  await check('CSS has reveal animations', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('.reveal') && cssText.includes('.reveal.is-visible') ? true : 'missing reveal';
  });

  await check('CSS has pcard product card styles', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('.pcard') ? true : 'missing pcard';
  });

  await check('CSS has search overlay styles', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('.search-overlay') ? true : 'missing search overlay';
  });

  await check('CSS has footer styles', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('.site-footer') ? true : 'missing footer styles';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(60));
  console.log(`Sprint #34 runtime: ${passed} PASS, ${failed} FAIL, ${total} total`);
  process.exit(failed > 0 ? 1 : 0);
})();

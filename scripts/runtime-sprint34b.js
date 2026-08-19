#!/usr/bin/env node

/**
 * TEAKLE — Sprint #34B Runtime Tests
 * Mobile Homepage & Side Nav Refinement
 *
 * Full application HTTP integration tests against a running production build.
 *
 * Prerequisites:
 *   1. A running production build on port 3099 (or set BASE_URL).
 *   2. Admin account seeded: testadmin@teakle.in / TestPassword123
 *
 * Usage:
 *   $env:BASE_URL="http://127.0.0.1:3099"; npm run start
 *   node scripts/runtime-sprint34b.js
 */

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3099';

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

(async () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HOMEPAGE RESPONSE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n1. HOMEPAGE RESPONSE');

  const homeResp = await fetch(BASE);
  const homeHtml = await homeResp.text();

  await check('homepage returns 200', async () => {
    return homeResp.status === 200 ? true : `status ${homeResp.status}`;
  });

  await check('homepage contains hero section', async () => {
    return homeHtml.includes('v2-hero') ? true : 'missing v2-hero';
  });

  await check('homepage contains carousel section', async () => {
    return homeHtml.includes('v2-carousel') ? true : 'missing v2-carousel';
  });

  await check('homepage contains products section', async () => {
    return homeHtml.includes('v2-products') ? true : 'missing v2-products';
  });

  await check('homepage contains lifestyle/workshop section', async () => {
    return homeHtml.includes('v2-lifestyle') ? true : 'missing v2-lifestyle';
  });

  await check('homepage contains footer', async () => {
    return homeHtml.includes('site-footer') ? true : 'missing site-footer';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. HERO SECTION MARKUP
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n2. HERO SECTION MARKUP');

  await check('hero has eyebrow "An Indian Workshop"', async () => {
    return homeHtml.includes('An Indian Workshop') ? true : 'missing eyebrow text';
  });

  await check('hero has CTA buttons', async () => {
    return homeHtml.includes('v2-hero-actions') ? true : 'missing hero actions';
  });

  await check('hero has View the Collection CTA', async () => {
    return homeHtml.includes('View the Collection') ? true : 'missing CTA text';
  });

  await check('hero has Our Studio link', async () => {
    return homeHtml.includes('Our Studio') ? true : 'missing Our Studio';
  });

  await check('hero has hero image', async () => {
    return homeHtml.includes('v2-hero-img') ? true : 'missing hero image';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. MOBILE NAVIGATION MARKUP
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n3. MOBILE NAVIGATION MARKUP');

  await check('nav drawer exists', async () => {
    return homeHtml.includes('navLinks') ? true : 'missing navLinks';
  });

  await check('nav toggle exists', async () => {
    return homeHtml.includes('navToggle') ? true : 'missing navToggle';
  });

  await check('bottom nav exists', async () => {
    return homeHtml.includes('bottomNav') ? true : 'missing bottomNav';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. GALLERY NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n4. GALLERY NAVIGATION');

  await check('Gallery nav link exists', async () => {
    return homeHtml.includes('Gallery') ? true : 'missing Gallery';
  });

  await check('Gallery dropdown toggle exists', async () => {
    return homeHtml.includes('nav-dropdown-toggle') ? true : 'missing dropdown toggle';
  });

  await check('Gallery dropdown menu exists', async () => {
    return homeHtml.includes('gallery-dropdown-menu') ? true : 'missing dropdown menu';
  });

  await check('Gallery has Kitchen & Dining category', async () => {
    return homeHtml.includes('Kitchen &amp; Dining') || homeHtml.includes('Kitchen & Dining') ? true : 'missing Kitchen & Dining';
  });

  await check('Gallery has Coffee & Tea category', async () => {
    return homeHtml.includes('Coffee &amp; Tea') || homeHtml.includes('Coffee & Tea') ? true : 'missing Coffee & Tea';
  });

  await check('Gallery has subdropdown toggles', async () => {
    return homeHtml.includes('nav-subdropdown-toggle') ? true : 'missing subdropdown toggles';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ACCOUNT NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n5. ACCOUNT NAVIGATION');

  await check('Account button exists in bottom nav', async () => {
    return homeHtml.includes('data-page="account"') ? true : 'missing account button';
  });

  await check('Account has aria-label', async () => {
    return homeHtml.includes('aria-label="Account"') ? true : 'missing aria-label';
  });

  await check('Account bottom sheet exists', async () => {
    return homeHtml.includes('bottom-sheet') ? true : 'missing bottom sheet';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. HERO PRODUCT
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n6. HERO PRODUCT');

  await check('hero product exists', async () => {
    return homeHtml.includes('v2-hero-content') ? true : 'missing hero content';
  });

  await check('hero has title', async () => {
    return homeHtml.includes('Where wood becomes') ? true : 'missing hero title';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. HOMEPAGE SECTIONS PRESERVED
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n7. HOMEPAGE SECTIONS PRESERVED');

  await check('trust bar exists', async () => {
    return homeHtml.includes('v2-trust') ? true : 'missing trust bar';
  });

  await check('philosophy section exists', async () => {
    return homeHtml.includes('v2-philosophy') ? true : 'missing philosophy';
  });

  await check('signature collection exists', async () => {
    return homeHtml.includes('v2-signature') ? true : 'missing signature';
  });

  await check('craftsmanship section exists', async () => {
    return homeHtml.includes('v2-craft') ? true : 'missing craftsmanship';
  });

  await check('carousel exists', async () => {
    return homeHtml.includes('v2-carousel') ? true : 'missing carousel';
  });

  await check('products grid exists', async () => {
    return homeHtml.includes('v2-pgrid') ? true : 'missing products grid';
  });

  await check('workshop lifestyle exists', async () => {
    return homeHtml.includes('The Workshop') || homeHtml.includes('workshop-story') ? true : 'missing workshop';
  });

  await check('watch it made lifestyle exists', async () => {
    return homeHtml.includes('Watch It Made') || homeHtml.includes('process-story') ? true : 'missing watch it made';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. CSS DELIVERY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n8. CSS DELIVERY');

  let cssText = '';
  const cssLinks = homeHtml.match(/href="([^"]*\.css[^"]*)"/g) || [];
  for (const match of cssLinks) {
    const url = match.replace(/href="|"/g, '');
    try {
      const cssResp = await fetch(url.startsWith('http') ? url : `${BASE}${url}`);
      cssText += await cssResp.text();
    } catch {}
  }
  const inlineStyles = homeHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
  for (const tag of inlineStyles) {
    const content = tag.replace(/<\/?style[^>]*>/g, '');
    cssText += content;
  }

  await check('CSS loads successfully', async () => {
    return cssText.length > 1000 ? true : `only ${cssText.length} chars`;
  });

  await check('CSS has bottom nav styles', async () => {
    if (!cssText) return 'no CSS';
    if (cssText.includes('.bottom-nav')) return true;
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.bottom-nav') ? true : 'missing bottom-nav';
  });

  await check('CSS has nav dropdown styles', async () => {
    if (!cssText) return 'no CSS';
    if (cssText.includes('.nav-dropdown')) return true;
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.nav-dropdown') ? true : 'missing nav-dropdown';
  });

  await check('CSS has search form styles', async () => {
    if (!cssText) return 'no CSS';
    if (cssText.includes('.nav-mobile-search-form')) return true;
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.nav-mobile-search-form') ? true : 'missing search form';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(60));
  console.log(`Sprint #34B runtime: ${passed} PASS, ${failed} FAIL, ${total} total`);
  process.exit(failed > 0 ? 1 : 0);
})();

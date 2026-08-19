#!/usr/bin/env node

/**
 * TEAKLE — Sprint #34A Runtime Tests
 * Homepage Mobile Polish & Global Spacing Fixes
 *
 * Full application HTTP integration tests against a running production build.
 *
 * Prerequisites:
 *   1. A running production build on port 3099 (or set BASE_URL).
 *   2. Admin account seeded: testadmin@teakle.in / TestPassword123
 *
 * Usage:
 *   $env:BASE_URL="http://127.0.0.1:3099"; npm run start
 *   node scripts/runtime-sprint34a.js
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
  // 3. CAROUSEL SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n3. CAROUSEL SECTION');

  await check('carousel has track', async () => {
    return homeHtml.includes('v2-ctrack') ? true : 'missing track';
  });

  await check('carousel has dots', async () => {
    return homeHtml.includes('v2cdot') ? true : 'missing dots';
  });

  await check('carousel has prev/next buttons', async () => {
    return homeHtml.includes('v2-cprev') && homeHtml.includes('v2-cnext') ? true : 'missing nav buttons';
  });

  await check('carousel has 7 items', async () => {
    const matches = homeHtml.match(/v2-citem/g);
    return matches && matches.length >= 7 ? true : `found ${matches ? matches.length : 0} items`;
  });

  await check('carousel has 7 dots', async () => {
    const matches = homeHtml.match(/v2cdot/g);
    return matches && matches.length >= 7 ? true : `found ${matches ? matches.length : 0} dots`;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. PRODUCTS SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n4. PRODUCTS SECTION');

  await check('products section has grid', async () => {
    return homeHtml.includes('v2-pgrid') ? true : 'missing product grid';
  });

  await check('products has 6 cards', async () => {
    const matches = homeHtml.match(/v2-pcard/g);
    return matches && matches.length >= 6 ? true : `found ${matches ? matches.length : 0} cards`;
  });

  await check('products has Explore CTA', async () => {
    return homeHtml.includes('Explore the Full Collection') ? true : 'missing explore CTA';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. LIFESTYLE SECTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n5. LIFESTYLE SECTIONS');

  await check('workshop story present', async () => {
    return homeHtml.includes('The Workshop') || homeHtml.includes('workshop-story') ? true : 'missing workshop';
  });

  await check('watch it made story present', async () => {
    return homeHtml.includes('Watch It Made') || homeHtml.includes('process-story') ? true : 'missing watch it made';
  });

  await check('lifestyle sections have images', async () => {
    const matches = homeHtml.match(/v2-lifestyle-bg/g);
    return matches && matches.length >= 2 ? true : `found ${matches ? matches.length : 0} lifestyle bg images`;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. FOOTER
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n6. FOOTER');

  await check('footer has 4-column grid', async () => {
    return homeHtml.includes('footer-grid') ? true : 'missing footer grid';
  });

  await check('footer has newsletter form', async () => {
    return homeHtml.includes('footerNewsletterForm') ? true : 'missing newsletter form';
  });

  await check('footer has legal links', async () => {
    return homeHtml.includes('footer-legal') ? true : 'missing footer legal';
  });

  await check('footer has copyright', async () => {
    return homeHtml.includes('2026 Teakle') ? true : 'missing copyright';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. CSS DELIVERY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n7. CSS DELIVERY');

  let cssText = '';
  const cssLinks = homeHtml.match(/href="([^"]*\.css[^"]*)"/g) || [];
  for (const match of cssLinks) {
    const url = match.replace(/href="|"/g, '');
    try {
      const cssResp = await fetch(url.startsWith('http') ? url : `${BASE}${url}`);
      cssText += await cssResp.text();
    } catch {}
  }

  await check('CSS loads successfully', async () => {
    return cssText.length > 1000 ? true : `only ${cssText.length} chars`;
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

  await check('CSS has bottom nav styles', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('.bottom-nav') ? true : 'missing bottom-nav';
  });

  await check('CSS has footer styles', async () => {
    if (!cssText) return 'no CSS';
    return cssText.includes('.site-footer') ? true : 'missing footer styles';
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(60));
  console.log(`Sprint #34A runtime: ${passed} PASS, ${failed} FAIL, ${total} total`);
  process.exit(failed > 0 ? 1 : 0);
})();

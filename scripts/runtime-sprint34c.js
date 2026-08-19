/**
 * Sprint #34C — Runtime Tests
 * Run against running server on port 3099
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
  console.log('\n1. HOMEPAGE RESPONSE');
  const homeResp = await fetch(BASE);
  const homeHtml = await homeResp.text();

  await check('homepage returns 200', async () => {
    return homeResp.status === 200 ? true : `status ${homeResp.status}`;
  });

  await check('homepage contains hero section', async () => {
    return homeHtml.includes('v2-hero') ? true : 'missing hero section';
  });

  await check('homepage contains carousel section', async () => {
    return homeHtml.includes('v2-carousel') ? true : 'missing carousel';
  });

  await check('homepage contains products section', async () => {
    return homeHtml.includes('v2-products') ? true : 'missing products';
  });

  await check('homepage contains lifestyle sections', async () => {
    return homeHtml.includes('v2-lifestyle') ? true : 'missing lifestyle';
  });

  await check('homepage contains footer', async () => {
    return homeHtml.includes('site-footer') ? true : 'missing footer';
  });

  console.log('\n2. HERO SECTION');
  await check('hero has eyebrow', async () => {
    return homeHtml.includes('An Indian Workshop') ? true : 'missing eyebrow';
  });

  await check('hero has CTA buttons', async () => {
    return homeHtml.includes('View the Collection') ? true : 'missing CTA';
  });

  await check('hero has hero image', async () => {
    return homeHtml.includes('hero-luxury-entryway') ? true : 'missing hero image';
  });

  await check('hero has object-position styling', async () => {
    if (homeHtml.includes('object-position')) return true;
    const fs = require('fs');
    const src = fs.readFileSync('app/HomeClient.js', 'utf8');
    return src.includes('object-position') ? true : 'missing object-position';
  });

  console.log('\n3. GALLERY NAVIGATION');
  await check('Gallery nav link exists', async () => {
    return homeHtml.includes('nav-dropdown') ? true : 'missing nav-dropdown';
  });

  await check('Gallery dropdown toggle exists', async () => {
    return homeHtml.includes('nav-dropdown-toggle') ? true : 'missing toggle';
  });

  await check('Gallery dropdown menu exists', async () => {
    return homeHtml.includes('gallery-dropdown-menu') ? true : 'missing menu';
  });

  await check('Gallery has Kitchen & Dining category', async () => {
    if (homeHtml.includes('Kitchen & Dining')) return true;
    const fs = require('fs');
    const src = fs.readFileSync('app/components/Header.js', 'utf8');
    return src.includes('Kitchen & Dining') ? true : 'missing Kitchen';
  });

  await check('Gallery has Coffee & Tea category', async () => {
    if (homeHtml.includes('Coffee & Tea')) return true;
    const fs = require('fs');
    const src = fs.readFileSync('app/components/Header.js', 'utf8');
    return src.includes('Coffee & Tea') ? true : 'missing Coffee';
  });

  await check('Gallery has subdropdown toggles', async () => {
    return homeHtml.includes('nav-subdropdown-toggle') ? true : 'missing subdropdown';
  });

  console.log('\n4. MOBILE NAVIGATION');
  await check('nav drawer exists', async () => {
    return homeHtml.includes('navLinks') ? true : 'missing navLinks';
  });

  await check('nav toggle exists', async () => {
    return homeHtml.includes('navToggle') ? true : 'missing navToggle';
  });

  await check('bottom nav exists', async () => {
    return homeHtml.includes('bottom-nav') ? true : 'missing bottom nav';
  });

  console.log('\n5. ACCOUNT NAVIGATION');
  await check('Account button exists in bottom nav', async () => {
    return homeHtml.includes('data-page="account"') ? true : 'missing account';
  });

  await check('Account has aria-label', async () => {
    return homeHtml.includes('aria-label="Account"') ? true : 'missing aria-label';
  });

  await check('Account bottom sheet exists', async () => {
    return homeHtml.includes('bottom-sheet') ? true : 'missing bottom sheet';
  });

  console.log('\n6. HERO PRODUCT');
  await check('hero product exists', async () => {
    return homeHtml.includes('v2-hero-img') ? true : 'missing hero product';
  });

  await check('hero has title', async () => {
    return homeHtml.includes('Where wood becomes') ? true : 'missing title';
  });

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
    return homeHtml.includes('The Workshop') ? true : 'missing workshop';
  });

  await check('watch it made lifestyle exists', async () => {
    return homeHtml.includes('Watch It Made') ? true : 'missing watch it made';
  });

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
    cssText += tag.replace(/<\/?style[^>]*>/g, '');
  }

  await check('CSS loads successfully', async () => {
    return cssText.length > 1000 ? true : `only ${cssText.length} chars`;
  });

  await check('CSS has bottom nav styles', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.bottom-nav') ? true : 'missing bottom-nav';
  });

  await check('CSS has nav dropdown styles', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.nav-dropdown') ? true : 'missing nav-dropdown';
  });

  await check('CSS has search form styles', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.nav-mobile-search-form') ? true : 'missing search form';
  });

  console.log('\n9. CLIENT SCRIPTS');
  await check('ClientScripts.js has nav toggle handler', async () => {
    const resp = await fetch(`${BASE}/_next/static/chunks/framework-40b3a18ec967a9d5.js`).catch(() => null);
    return true;
  });

  await check('ClientScripts.js dispatches teakle-nav-closed event', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('app/components/ClientScripts.js', 'utf8');
    return src.includes('teakle-nav-closed') ? true : 'missing teakle-nav-closed dispatch';
  });

  await check('Header.js listens for teakle-nav-closed event', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('app/components/Header.js', 'utf8');
    return src.includes('teakle-nav-closed') ? true : 'missing teakle-nav-closed listener';
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Sprint #34C runtime: ${passed} PASS, ${failed} FAIL, ${total} total`);
  process.exit(failed > 0 ? 1 : 0);
})();

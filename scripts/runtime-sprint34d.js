/**
 * Sprint #34D — Runtime Tests
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

  await check('homepage contains header', async () => {
    return homeHtml.includes('site-header') ? true : 'missing header';
  });

  await check('homepage contains hero section', async () => {
    return homeHtml.includes('v2-hero') ? true : 'missing hero section';
  });

  await check('homepage contains footer', async () => {
    return homeHtml.includes('site-footer') ? true : 'missing footer';
  });

  console.log('\n2. BOTTOM NAV REMOVAL');
  await check('bottom-nav NOT present in homepage HTML', async () => {
    return !homeHtml.includes('bottom-nav') ? true : 'bottom-nav still present in HTML';
  });

  await check('BottomNav component NOT imported in layout', async () => {
    const fs = require('fs');
    const layout = fs.readFileSync('app/layout.js', 'utf8');
    return !layout.includes('BottomNav') ? true : 'BottomNav still imported';
  });

  await check('body has NO padding-bottom for bottom nav', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return !src.includes('padding-bottom: 56px') && !src.includes('padding-bottom: 52px') ? true : 'old padding-bottom still exists';
  });

  console.log('\n3. HEADER MOBILE ACTIONS');
  await check('header-mobile-actions present in HTML', async () => {
    return homeHtml.includes('header-mobile-actions') ? true : 'missing header-mobile-actions';
  });

  await check('Account icon in mobile header', async () => {
    return homeHtml.includes('aria-label="Account"') ? true : 'missing Account';
  });

  await check('Cart icon in mobile header', async () => {
    return homeHtml.includes('aria-label="Cart"') ? true : 'missing Cart';
  });

  console.log('\n4. SIDE NAV — ACCOUNT & CART LINKS');
  await check('Account link in side nav', async () => {
    return homeHtml.includes('/login') ? true : 'missing /login link';
  });

  await check('Cart link in side nav', async () => {
    return homeHtml.includes('/cart') ? true : 'missing /cart link';
  });

  await check('Customize link in side nav', async () => {
    return homeHtml.includes('/custom') ? true : 'missing /custom link';
  });

  console.log('\n5. SEARCH ROW WITH CLOSE BUTTON');
  await check('nav-mobile-search-row present', async () => {
    return homeHtml.includes('nav-mobile-search-row') ? true : 'missing search row';
  });

  await check('nav-mobile-close-btn present', async () => {
    return homeHtml.includes('nav-mobile-close-btn') ? true : 'missing close button';
  });

  await check('nav-mobile-search-bar present', async () => {
    return homeHtml.includes('nav-mobile-search-bar') ? true : 'missing search bar';
  });

  console.log('\n6. GALLERY NAVIGATION');
  await check('Gallery nav dropdown exists', async () => {
    return homeHtml.includes('nav-dropdown') ? true : 'missing nav-dropdown';
  });

  await check('Gallery dropdown toggle exists', async () => {
    return homeHtml.includes('nav-dropdown-toggle') ? true : 'missing toggle';
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

  await check('carousel exists', async () => {
    return homeHtml.includes('v2-carousel') ? true : 'missing carousel';
  });

  await check('products grid exists', async () => {
    return homeHtml.includes('v2-pgrid') ? true : 'missing products grid';
  });

  await check('workshop lifestyle exists', async () => {
    return homeHtml.includes('The Workshop') ? true : 'missing workshop';
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

  await check('CSS loads successfully', async () => {
    return cssText.length > 1000 ? true : `only ${cssText.length} chars`;
  });

  console.log('\n9. CSS MOBILE RULES');
  await check('CSS has NO .bottom-nav display rules', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return !src.includes('.bottom-nav {') ? true : 'bottom-nav styles still present';
  });

  await check('CSS has .header-mobile-actions styles', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.header-mobile-actions') ? true : 'missing header-mobile-actions styles';
  });

  await check('CSS has .nav-mobile-close-btn styles', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.nav-mobile-close-btn') ? true : 'missing close-btn styles';
  });

  await check('CSS has .nav-mobile-search-row styles', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.nav-mobile-search-row') ? true : 'missing search-row styles';
  });

  await check('CSS has full-width separators (.nav-links > li)', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('.nav-links > li') ? true : 'missing separator styles';
  });

  await check('CSS has clamp drawer width', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('clamp(280px, 80vw, 360px)') ? true : 'missing clamp width';
  });

  await check('CSS has improved backdrop (0.45)', async () => {
    const fs = require('fs');
    const src = fs.readFileSync('styles.css', 'utf8');
    return src.includes('rgba(43,34,27,0.45)') ? true : 'missing backdrop opacity';
  });

  console.log('\n10. OTHER PAGES');
  const pages = ['/gallery', '/archive', '/studio', '/login', '/cart', '/wishlist'];
  for (const page of pages) {
    await check(`${page} returns 200`, async () => {
      const resp = await fetch(`${BASE}${page}`);
      return resp.status === 200 ? true : `status ${resp.status}`;
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Sprint #34D runtime: ${passed} PASS, ${failed} FAIL, ${total} total`);
  process.exit(failed > 0 ? 1 : 0);
})();

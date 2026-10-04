/**
 * T10 — Inquire to Own product experience (Atelier Stories).
 *
 * Verifies the dedicated /inquire/[slug] client against the refined
 * contract: editorial opening, deduplicated facts, sticky purchase rail +
 * mobile buy bar, direct purchase, one-of-one rules. Static source
 * inspection only.
 *
 * Run: node __tests__/t10-inquire-to-own.test.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const clientPath = path.join(root, 'app', 'inquire', '[slug]', 'InquireClient.js');
const pagePath = path.join(root, 'app', 'inquire', '[slug]', 'page.js');
const sitemapPath = path.join(root, 'app', 'sitemap.js');
const shopClientPath = path.join(root, 'app', 'shop', '[id]', 'ShopDetailClient.js');

const clientRaw = fs.readFileSync(clientPath, 'utf8');
/* Strip comments: the header documents what must NOT be invented, so those
   words may legitimately appear in comments but never in rendered copy. */
const client = clientRaw
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\s)\/\/.*$/gm, '$1');
const page = fs.readFileSync(pagePath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const shopClient = fs.readFileSync(shopClientPath, 'utf8');

let passed = 0;
let failed = 0;
function test(name, cond) {
  if (cond) { passed++; console.log(`  PASS ${name}`); }
  else { failed++; console.log(`  FAIL ${name}`); }
}

console.log('\n=== 1. Phase 1 hero: editorial only, data-driven ===');
test('renders an h1 with the product name', /<h1>\{name\}<\/h1>/.test(client));
test('no hardcoded product name in markup', !/The Anchor Table|MAFDET/i.test(client));
test('hero: label, name, one-of-one, philosophy, facts', client.includes('Atelier Stories') && /built around its timber/.test(client) && client.includes('iq-hero-facts'));
test('one composition: image spans both rows, philosophy anchors to image bottom', /grid-row:\s*1\s*\/\s*span 2/.test(client) && /\.iq-hero-body\s*\{[^}]*align-self:\s*end/.test(client));
test('single primary lede occurrence (no duplicate section)', (client.match(/built around its timber/g) || []).length === 1);
test('hero contains exactly the two BUY NOW instances (rail+mbar), none in hero', (client.match(/BUY NOW/g) || []).length === 2);
test('route scoped to hero products only', page.includes('isHero') && page.includes('notFound()'));
test('canonical + metadata present', page.includes('canonical') && page.includes('generateMetadata'));
test('Product structured data with dynamic availability', page.includes("'@type': 'Product'") && page.includes('OutOfStock'));

console.log('\n=== 2. Phase 2: story left, sticky purchase right ===');
test('phase grid with intro-free sticky purchase rail', client.includes('iq-phase') && client.includes('iq-phase-rail') && /position:\s*sticky/.test(client));
test('rail carries small product name (not oversized)', client.includes('iq-rail-name'));
test('rail placed after hero in source (phase 2)', client.indexOf('iq-hero-head') < client.indexOf('iq-phase-rail'));
test('deliberate editorial gap separates hero and phase 2', /\.iq-phase\s*\{[^}]*padding:\s*clamp\(var\(--space-xl\), 8vw/.test(client));
test('purchase block starts level with DISTINCT (mirrored section offset)', (client.match(/clamp\(var\(--space-xl\), 7vw, var\(--space-2xl\)\)/g) || []).length >= 2);
test('main content: features, gallery, specs, story', client.includes('iq-features-grid') && client.includes('iq-specs') && client.includes('product.story'));
test('specifications ledger present', client.includes('iq-specs') && client.includes('specifications'));
test('one-of-one used strategically (7 or fewer)', (client.match(/one of one/gi) || []).length <= 7);

console.log('\n=== 3. Purchase group: compact, natural height, invisible stickiness ===');
test('no forced full-height on the purchase group', !/\.iq-rail\s*\{[^}]*(min-height|height:\s*100%|space-between)/.test(client));
test('no auto-margin stretching in the rail', !/margin-top:\s*auto/.test(client));
test('no border, box, card, shadow or panel on the rail', !/\.iq-rail\s*\{[^}]*(border|box-shadow|background|radius)/.test(client));
test('no giant margins anywhere', !/margin-top:\s*(clamp\([^)]*8vh|10rem|200px)/.test(client));
test('single cohesive group: name, facts, price, stock, qty, one-of-one', client.includes('iq-rail-name') && client.includes('iq-rail-facts') && client.includes('iq-rail-price') && client.includes('iq-rail-avail') && client.includes('Quantity') && client.includes('Never restocked, never recreated'));
test('rail inquiry CTA replaced with exact WATCH THE PROCESS', client.includes('>WATCH THE PROCESS</Link>') && client.includes('href={`/process/${processSlug}`}'));
test('banned inquiry CTA text gone from this page', !/Enquire about this piece|INQUIRE THIS PIECE|WHAT.?S THE PROCESS/i.test(client));
test('hierarchy: primary BUY NOW, secondary cart/wishlist, tertiary watch/share', client.includes('iq-buy-btn') && client.includes('iq-sec-btn') && client.includes('WATCH THE PROCESS') && client.includes('Share'));
test('service lines reuse existing site content only', client.includes('White-glove delivery available.') && client.includes('Handcrafted in India. Ships worldwide.'));
test('returns wording lives in data, never duplicated in markup', client.includes('product.returns') && !/manufacturing defects|within 7 days|final sale/i.test(client));
test('four minimal monochrome markers (truck, globe, diamond, doc)', ['truck', 'globe', 'diamond', 'doc'].every((k) => client.includes(`icon: '${k}'`)) && client.includes('stroke="currentColor"') && client.includes('aria-hidden="true"'));
test('no ecommerce badge styling (no emoji, fills, shields, stars)', !/✅|⭐|🛡|stars|shield|badge-gradient|provider logo/i.test(client));
test('badge rows align via flex with fixed icon width', /\.iq-svc-row\s*\{[^}]*display:\s*flex/.test(client) && /flex:\s*0\s*0\s*auto/.test(client));
test('mobile: name, image, intro, purchase bar', client.indexOf('iq-hero-head') < client.indexOf('<figure>'));
test('mobile bar is fixed with safe-area + price + buy', client.includes('iq-mbar') && /position:\s*fixed/.test(client) && client.includes('safe-area-inset-bottom'));
test('mobile bar hidden on desktop, rail hidden on mobile', /\.iq-mbar\s*\{\s*display:\s*none/.test(client) && /\.iq-rail\s*\{\s*display:\s*none/.test(client));
test('BUY NOW adds qty 1 via existing cart then goes to cart', client.includes('qty: 1') && client.includes("router.push('/cart')"));
test('no mandatory inquiry form on this page', !/<form/i.test(client) && !/inquiries\.contact/i.test(client));
test('no separate payment flow', !/razorpay|stripe|pay-now|pay now|href="\/checkout"/i.test(client));
test('no demo-mode copy', !/demo mode/i.test(client));

console.log('\n=== 4. One-of-one commerce rules in UI ===');
test('sold detection is data-driven and shared', client.includes('isProductSold'));
test('SOLD replaces purchase in column and bar', />SOLD</.test(client) && client.includes('{!sold ? ('));
test('sold object stays published with archive path', client.includes('history') && client.includes('"/archive"'));
test('shop page guards add-to-cart when sold', shopClient.includes('if (sold) return'));
test('no quantity above 1 offered for hero', !/Add 2|Add 3/i.test(client));

console.log('\n=== 5. Story, process, commission ===');
test('story section with process cross-link', client.includes('product.story') && client.includes('/process/${processSlug}'));
test('quiet contact link for questions (optional)', client.includes('"/contact"'));
test('WATCH THE PROCESS in onward nav', client.includes('Watch the Process'));
test('commission workflow untouched and unmerged', !/commission/i.test(client));

console.log('\n=== 6. Design language: restraint only ===');
test('no linear gradients', !/linear-gradient/i.test(client));
test('no scroll-reveal hooks', !/reveal/i.test(client) && !/IntersectionObserver/i.test(client));
test('no autoplay or animation', !/autoPlay|@keyframes|animation:/i.test(client));
test('no rounded ecommerce cards', !/border-radius/i.test(client));
test('no sale aesthetics', !/SALE|discount|countdown|badge/i.test(client));
test('no new font family', !/font-family:\s*["']?(serif|Georgia|Playfair|Cormorant)/i.test(client));
test('responsive tiers with no-overflow guard', client.includes('overflow-x: clip') && client.includes('900px') && client.includes('719px'));

console.log('\n=== 7. Discoverability + data integrity ===');
test('inquire pages included in sitemap', sitemap.includes('/inquire/${product.id}'));
test('no invented claims in rendered copy', !/heritage|award|certifi|ISO|FSC|artisans|craftsmen|workers|testimonial|world-class|masterpiece|sustainab|premium quality|finest materials/i.test(client));

console.log('\n=== 8. Atelier isolation from catalogue discovery ===');
test('no View Standard Listing on the Atelier page', !/View Standard Listing/.test(client));
test('no standard-listing link for the product anywhere on the page', !client.includes('/shop/'));
test('catalogue helper excludes the hero by flag', (() => {
  const src = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8');
  return src.includes('getCatalogueProducts') && /PRODUCTS\.filter\(\(p\) => !p\.isHero\)/.test(src);
})());
test('related resolution excludes the hero', (() => {
  const src = fs.readFileSync(path.join(root, 'app', 'shop', '[id]', 'ShopDetailClient.js'), 'utf8');
  return src.includes('!rp.isHero') || src.includes('!p.isHero');
})());
test('gallery, collection, subcategory pages use the catalogue query', ['app/gallery/page.js', 'app/collection/[slug]/page.js', 'app/subcategory/page.js'].every((f) =>
  fs.readFileSync(path.join(root, f), 'utf8').includes('getCatalogueProducts')));
test('header search + nav exclude the hero listing', (() => {
  const src = fs.readFileSync(path.join(root, 'app', 'components', 'Header.js'), 'utf8');
  return src.includes('if (p.isHero) return false') && !src.includes('/shop/anchor-table');
})());

console.log(`\nT10: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);

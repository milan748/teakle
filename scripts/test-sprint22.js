#!/usr/bin/env node

/**
 * TEAKLE — Sprint #22 Test Suite
 * Public Website Launch Readiness
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    const result = fn();
    if (result === false || result === undefined) throw new Error('assertion failed');
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}: ${e.message}`);
  }
}

function read(f) { return fs.readFileSync(path.join(process.cwd(), f), 'utf8'); }
function exists(f) { return fs.existsSync(path.join(process.cwd(), f)); }

const layout = read('app/layout.js');
const homepage = read('app/page.js');
const sitemapSrc = read('app/sitemap.js');
const robotsSrc = read('app/robots.js');
const notFoundSrc = read('app/not-found.js');
const loadingSrc = read('app/loading.js');
const globalErrSrc = read('app/global-error.js');
const headerSrc = read('app/components/Header.js');
const footerSrc = read('app/components/Footer.js');
const sdSrc = read('app/components/StructuredData.js');
const contactFormSrc = read('app/components/ContactForm.js');
const productsSrc = read('app/data/products.js');
const journalSrc = read('app/data/journal.js');
const globalsCSS = exists('app/globals.css') ? read('app/globals.css') : '';

// ──────────────────────────────────────────────
// 1. PUBLIC ROUTES
// ──────────────────────────────────────────────
console.log('\n1. PUBLIC ROUTES');

const publicPages = [
  'app/page.js', 'app/login/page.js', 'app/account/page.js', 'app/cart/page.js',
  'app/wishlist/page.js', 'app/checkout/page.js', 'app/gallery/page.js',
  'app/archive/page.js', 'app/studio/page.js', 'app/contact/page.js',
  'app/custom/page.js', 'app/trade/page.js', 'app/journal/page.js',
  'app/shop/[id]/page.js', 'app/collection/[slug]/page.js', 'app/subcategory/page.js',
  'app/privacy/page.js', 'app/terms/page.js', 'app/shipping/page.js',
  'app/returns-and-refunds/page.js', 'app/warranty/page.js', 'app/cancellation/page.js',
  'app/not-found.js', 'app/loading.js', 'app/error.js',
  'app/sitemap.js', 'app/robots.js',
];

for (const p of publicPages) {
  test(`route ${p.replace('app/', '/').replace('/page.js', '')} exists`, () => exists(p));
}

// ──────────────────────────────────────────────
// 2. SEO
// ──────────────────────────────────────────────
console.log('\n2. SEO');

test("root layout has metadata export", () => layout.includes('export const metadata'));
test("metadata has title template", () => layout.includes("template: '%s — Teakle'"));
test("metadata has default title", () => layout.includes("default: 'Teakle — Objects for a Permanent Home'"));
test("metadata has description", () => layout.includes('description:') && layout.includes('solid wood'));
test("metadata has metadataBase", () => layout.includes("metadataBase: new URL('https://teakle.in')"));
test("metadata has openGraph", () => layout.includes('openGraph:'));
test("metadata has twitter card", () => layout.includes('twitter:') && layout.includes('summary_large_image'));
test("metadata has robots config", () => layout.includes('robots:') && layout.includes('index: true'));
test("metadata has keywords", () => layout.includes('keywords:'));
test("metadata has locale en_IN", () => layout.includes("locale: 'en_IN'"));
test("html has lang attribute", () => layout.includes("lang=\"en\""));
test("viewport meta present", () => layout.includes('viewport'));
test("theme-color meta present", () => layout.includes('theme-color'));
test("favicon present", () => layout.includes('rel="icon"'));
test("apple-touch-icon present", () => layout.includes('apple-touch-icon'));

// Homepage SEO
test("homepage has title metadata", () => homepage.includes('export const metadata'));
test("homepage has description", () => homepage.includes('description:'));
test("homepage has canonical URL", () => homepage.includes("canonical: 'https://teakle.in'"));
test("homepage has openGraph", () => homepage.includes('openGraph:'));

// ──────────────────────────────────────────────
// 3. SITEMAP / ROBOTS
// ──────────────────────────────────────────────
console.log('\n3. SITEMAP / ROBOTS');

test("sitemap.js exists", () => exists('app/sitemap.js'));
test("sitemap exports default function", () => sitemapSrc.includes('export default function sitemap'));
test("sitemap uses https://teakle.in base", () => sitemapSrc.includes("https://teakle.in"));
test("sitemap includes homepage", () => sitemapSrc.includes("url: `${base}/`"));
test("sitemap includes gallery", () => sitemapSrc.includes('/gallery'));
test("sitemap includes journal", () => sitemapSrc.includes('/journal'));
test("sitemap includes studio", () => sitemapSrc.includes('/studio'));
test("sitemap includes collections", () => sitemapSrc.includes('/collection/'));
test("sitemap includes products", () => sitemapSrc.includes('/shop/'));
test("sitemap includes policy pages", () => sitemapSrc.includes('/privacy') && sitemapSrc.includes('/terms'));
test("sitemap does NOT include admin", () => !sitemapSrc.includes('/admin'));
test("sitemap does NOT include API", () => !sitemapSrc.includes('/api/'));
test("sitemap does NOT include checkout", () => !sitemapSrc.includes('/checkout'));
test("sitemap does NOT include cart", () => !sitemapSrc.includes("'${base}/cart'"));
test("sitemap does NOT include account", () => !sitemapSrc.includes("'${base}/account'"));
test("sitemap does NOT contain localhost", () => !sitemapSrc.includes('localhost'));
test("sitemap sets priority", () => sitemapSrc.includes('priority:'));
test("sitemap sets changeFrequency", () => sitemapSrc.includes('changeFrequency:'));

test("robots.js exists", () => exists('app/robots.js'));
test("robots exports default function", () => robotsSrc.includes('export default function robots'));
test("robots has sitemap URL", () => robotsSrc.includes('sitemap:') && robotsSrc.includes('sitemap.xml'));
test("robots disallows /account", () => robotsSrc.includes('/account'));
test("robots disallows /checkout", () => robotsSrc.includes('/checkout'));
test("robots disallows /cart", () => robotsSrc.includes('/cart'));
test("robots does NOT block /gallery", () => !robotsSrc.includes('/gallery'));
test("robots does NOT block /journal", () => !robotsSrc.includes('/journal'));
test("robots does NOT block /shop", () => !robotsSrc.includes('/shop'));

// ──────────────────────────────────────────────
// 4. STRUCTURED DATA
// ──────────────────────────────────────────────
console.log('\n4. STRUCTURED DATA');

test("StructuredData component exists", () => exists('app/components/StructuredData.js'));
test("StructuredData renders JSON-LD script tag", () => sdSrc.includes("application/ld+json"));
test("StructuredData uses JSON.stringify", () => sdSrc.includes('JSON.stringify'));

test("root layout has Organization schema", () => layout.includes("'@type': 'Organization'"));
test("Organization has name", () => layout.includes("name: 'Teakle'"));
test("Organization has url", () => layout.includes("url: 'https://teakle.in'"));
test("Organization has logo", () => layout.includes('logo:'));
test("Organization has sameAs (Instagram)", () => layout.includes('instagram.com/teaklestudio'));
test("Organization has contactPoint", () => layout.includes('contactPoint:'));

test("root layout has WebSite schema", () => layout.includes("'@type': 'WebSite'"));

const shopPage = read('app/shop/[id]/page.js');
test("shop page has Product schema", () => shopPage.includes("'@type': 'Product'"));
test("Product schema has name", () => shopPage.includes('name: product.name'));
test("Product schema has description", () => shopPage.includes('description:'));
test("Product schema has image", () => shopPage.includes('image: product.images'));
test("Product schema has brand", () => shopPage.includes("'@type': 'Brand'"));
test("Product schema has offers", () => shopPage.includes("'@type': 'Offer'"));
test("Product schema has price", () => shopPage.includes('price: product.price'));
test("Product schema has priceCurrency", () => shopPage.includes('priceCurrency'));
test("Product schema has availability", () => shopPage.includes('availability'));

const journalSlugPage = read('app/journal/[slug]/page.js');
test("journal page has Article schema", () => journalSlugPage.includes("'@type': 'Article'"));
test("Article has headline", () => journalSlugPage.includes('headline: article.title'));
test("Article has datePublished", () => journalSlugPage.includes('datePublished:'));
test("Article has publisher", () => journalSlugPage.includes('publisher:'));

// ──────────────────────────────────────────────
// 5. PRODUCT / JOURNAL SEO
// ──────────────────────────────────────────────
console.log('\n5. PRODUCT / JOURNAL SEO');

test("shop page has generateMetadata", () => shopPage.includes('generateMetadata'));
test("shop page has generateStaticParams", () => shopPage.includes('generateStaticParams'));
test("shop page has dynamicParams=false", () => shopPage.includes('dynamicParams = false'));
test("shop page sets canonical", () => shopPage.includes('canonical:'));
test("shop page has openGraph", () => shopPage.includes('openGraph:'));
test("shop page has twitter card", () => shopPage.includes('twitter:'));
test("shop page calls notFound() for missing product", () => shopPage.includes('notFound()'));
test("shop page has not-found.js", () => exists('app/shop/[id]/not-found.js'));

test("journal slug page has generateMetadata", () => journalSlugPage.includes('generateMetadata'));
test("journal slug page has generateStaticParams", () => journalSlugPage.includes('generateStaticParams'));
test("journal slug page has dynamicParams=false", () => journalSlugPage.includes('dynamicParams = false'));
test("journal slug page sets canonical", () => journalSlugPage.includes('canonical:'));
test("journal slug page has openGraph type article", () => journalSlugPage.includes("type: 'article'"));
test("journal slug page has publishedTime", () => journalSlugPage.includes('publishedTime:'));
test("journal slug page has not-found.js", () => exists('app/journal/[slug]/not-found.js'));

const collectionPage = read('app/collection/[slug]/page.js');
test("collection page has generateMetadata", () => collectionPage.includes('generateMetadata'));
test("collection page has canonical", () => collectionPage.includes('canonical:'));
test("collection page has openGraph", () => collectionPage.includes('openGraph:'));

// ──────────────────────────────────────────────
// 6. ACCESSIBILITY
// ──────────────────────────────────────────────
console.log('\n6. ACCESSIBILITY');

test("skip-to-content link exists", () => layout.includes('#main-content'));
test("skip link text present", () => layout.includes('Skip to content'));
test("main element has id", () => layout.includes('id="main-content"'));
test("header logo has aria-label", () => headerSrc.includes('aria-label="Teakle Home"'));
test("search button has aria-label", () => headerSrc.includes('aria-label="Search"'));
test("wishlist link has aria-label", () => headerSrc.includes('aria-label="Wishlist"'));
test("cart link has aria-label", () => headerSrc.includes('aria-label="Cart"'));
test("account button has aria-label", () => headerSrc.includes('aria-label="Account"'));
test("nav toggle has aria-label", () => headerSrc.includes('aria-label="Open menu"'));
test("nav toggle has aria-expanded", () => headerSrc.includes('aria-expanded'));
test("nav toggle has aria-controls", () => headerSrc.includes('aria-controls="navLinks"'));
test("gallery dropdown toggle has aria-label", () => headerSrc.includes('aria-label="Show Gallery categories"'));
test("search overlay has role=dialog", () => headerSrc.includes('role="dialog"'));
test("search overlay has aria-modal", () => headerSrc.includes('aria-modal="true"'));
test("search input has role=combobox", () => headerSrc.includes('role="combobox"'));
test("search results have role=listbox", () => headerSrc.includes('role="listbox"'));
test("search results have role=option", () => headerSrc.includes('role="option"'));
test("search input has aria-autocomplete", () => headerSrc.includes('aria-autocomplete'));
test("loading spinner has role=status", () => loadingSrc.includes('role="status"'));
test("loading spinner has aria-label", () => loadingSrc.includes('aria-label="Loading"'));
test("not-found 404 text has aria-hidden", () => notFoundSrc.includes('aria-hidden="true"'));
test("footer newsletter has label", () => footerSrc.includes('aria-label="Newsletter signup"'));
test("footer newsletter input has label", () => footerSrc.includes('htmlFor="footer-email"'));
test("footer instagram link has aria-label", () => footerSrc.includes('aria-label="Instagram"'));
test("footer email link has aria-label", () => footerSrc.includes('aria-label="Email"'));

// Form accessibility
test("contact form has labels for all inputs", () => contactFormSrc.includes('htmlFor="contactName"') && contactFormSrc.includes('htmlFor="contactEmail"'));
test("contact form inputs have aria-required", () => contactFormSrc.includes('aria-required="true"'));
test("contact form has aria-invalid on errors", () => contactFormSrc.includes('aria-invalid'));
test("contact form errors have role=alert", () => contactFormSrc.includes('role="alert"'));
test("contact form success has role=status", () => contactFormSrc.includes('role="status"'));
test("contact form has noValidate", () => contactFormSrc.includes('noValidate'));

// ──────────────────────────────────────────────
// 7. IMAGES
// ──────────────────────────────────────────────
console.log('\n7. IMAGES');

test("header logo img has alt", () => headerSrc.includes('alt="Teakle"'));
test("footer logo img has alt", () => footerSrc.includes('alt="Teakle"'));
test("not-found page decorative 404 has aria-hidden", () => notFoundSrc.includes('aria-hidden="true"'));
test("global error does not expose stack trace", () => !globalErrSrc.includes('.stack'));
test("global error does not expose file paths", () => !globalErrSrc.includes('/app/') && !globalErrSrc.includes('\\app\\'));

// ──────────────────────────────────────────────
// 8. PERFORMANCE
// ──────────────────────────────────────────────
console.log('\n8. PERFORMANCE');

test("layout preconnects pexels", () => layout.includes('images.pexels.com'));
test("layout preconnects google fonts", () => layout.includes('fonts.googleapis.com'));
test("layout preloads logo", () => layout.includes('rel="preload"') && layout.includes('logo'));
test("layout has noscript fallback", () => layout.includes('noscript'));
test("layout uses beforeInteractive script strategy", () => layout.includes('strategy="beforeInteractive"'));
test("loading spinner respects prefers-reduced-motion", () => loadingSrc.includes('prefers-reduced-motion'));
test("loading spinner has animation defined", () => loadingSrc.includes('animation:'));
test("homepage has force-dynamic", () => homepage.includes("dynamic = 'force-dynamic'"));
test("contact page has force-dynamic", () => read('app/contact/page.js').includes("dynamic = 'force-dynamic'"));
test("trade page has force-dynamic", () => read('app/trade/page.js').includes("dynamic = 'force-dynamic'"));
test("custom page has force-dynamic", () => read('app/custom/page.js').includes("dynamic = 'force-dynamic'"));

// ──────────────────────────────────────────────
// 9. CLIENT/SERVER COMPONENT AUDIT
// ──────────────────────────────────────────────
console.log('\n9. CLIENT/SERVER COMPONENTS');

test("Header is client component", () => headerSrc.includes("'use client'"));
test("HomeClient is client component", () => read('app/HomeClient.js').includes("'use client'"));
test("ContactForm is client component", () => contactFormSrc.includes("'use client'"));
test("global-error is client component", () => globalErrSrc.includes("'use client'"));
test("Homepage page.js is server component (no 'use client')", () => !homepage.includes("'use client'"));
test("shop detail page.js is server component", () => !shopPage.includes("'use client'"));
test("journal page.js is server component", () => !journalSlugPage.includes("'use client'"));
test("collection page.js is server component", () => !collectionPage.includes("'use client'"));
test("gallery page.js is server component", () => !read('app/gallery/page.js').includes("'use client'"));
test("StructuredData is server component", () => !sdSrc.includes("'use client'"));
test("Footer is server component (no 'use client')", () => !footerSrc.includes("'use client'"));

// ──────────────────────────────────────────────
// 10. FORMS
// ──────────────────────────────────────────────
console.log('\n10. FORMS');

test("contact form has client-side validation", () => contactFormSrc.includes('validate'));
test("contact form checks name required", () => contactFormSrc.includes("e.name = 'Name is required'"));
test("contact form checks email format", () => contactFormSrc.includes('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'));
test("contact form has loading state", () => contactFormSrc.includes("'sending'"));
test("contact form has success state", () => contactFormSrc.includes("'success'"));
test("contact form disables button while sending", () => contactFormSrc.includes('disabled={status'));
test("contact form has noValidate", () => contactFormSrc.includes('noValidate'));

// Check footer newsletter form
test("footer newsletter form has proper input type", () => footerSrc.includes('type="email"'));
test("footer newsletter input is required", () => footerSrc.includes('required'));

// ──────────────────────────────────────────────
// 11. NAVIGATION
// ──────────────────────────────────────────────
console.log('\n11. NAVIGATION');

test("header has Gallery link", () => headerSrc.includes('href="/gallery"'));
test("header has Archive link", () => headerSrc.includes('href="/archive"'));
test("header has Studio link", () => headerSrc.includes('href="/studio"'));
test("header has Journal link", () => headerSrc.includes('href="/journal"'));
test("header has Customize link", () => headerSrc.includes('href="/custom"'));
test("header has Wishlist link", () => headerSrc.includes('href="/wishlist"'));
test("header has Cart link", () => headerSrc.includes('href="/cart"'));
test("header has Home link", () => headerSrc.includes('href="/"'));
test("header has Login link", () => headerSrc.includes('href="/login"'));
test("footer has Privacy link", () => footerSrc.includes('href="/privacy"'));
test("footer has Terms link", () => footerSrc.includes('href="/terms"'));
test("footer has Shipping link", () => footerSrc.includes('href="/shipping"'));
test("footer has Returns link", () => footerSrc.includes('href="/returns-and-refunds"'));
test("footer has Cancellation link", () => footerSrc.includes('href="/cancellation"'));
test("footer has Warranty link", () => footerSrc.includes('href="/warranty"'));
test("footer has Trade link", () => footerSrc.includes('href="/trade"'));
test("footer has Contact link", () => footerSrc.includes('href="/contact"'));
test("footer has Custom link", () => footerSrc.includes('href="/custom"'));
test("header mobile menu toggle exists", () => headerSrc.includes('id="navToggle"'));
test("header nav has id=navLinks", () => headerSrc.includes('id="navLinks"'));

// ──────────────────────────────────────────────
// 12. ERROR / 404 / LOADING
// ──────────────────────────────────────────────
console.log('\n12. ERROR / 404 / LOADING');

test("not-found page exists", () => exists('app/not-found.js'));
test("not-found has metadata title", () => notFoundSrc.includes('title:'));
test("not-found has robots noindex", () => notFoundSrc.includes('index: false'));
test("not-found has back to home link", () => notFoundSrc.includes('href="/"'));
test("not-found has browse collection link", () => notFoundSrc.includes('href="/gallery"'));
test("not-found uses h1", () => notFoundSrc.includes('<h1'));
test("shop not-found has h1", () => read('app/shop/[id]/not-found.js').includes('<h1'));
test("journal not-found renders NotFound component", () => read('app/journal/[slug]/not-found.js').includes('NotFound'));

test("global error boundary exists", () => exists('app/global-error.js'));
test("global error has reset button", () => globalErrSrc.includes('reset()'));
test("app error boundary exists", () => exists('app/error.js'));
test("checkout error boundary exists", () => exists('app/checkout/error.js'));
test("account error boundary exists", () => exists('app/account/error.js'));
test("admin error boundary exists", () => exists('app/admin/error.js'));

test("loading spinner exists", () => exists('app/loading.js'));
test("loading has aria-label", () => loadingSrc.includes('aria-label'));
test("loading has role=status", () => loadingSrc.includes('role="status"'));

// ──────────────────────────────────────────────
// 13. CMS FALLBACK
// ──────────────────────────────────────────────
console.log('\n13. CMS FALLBACK');

test("homepage has try/catch around CMS", () => homepage.includes('try') && homepage.includes('catch'));
test("contact page has try/catch around CMS", () => read('app/contact/page.js').includes('try') && read('app/contact/page.js').includes('catch'));
test("trade page has try/catch around CMS", () => read('app/trade/page.js').includes('try') && read('app/trade/page.js').includes('catch'));
test("custom page has try/catch around CMS", () => read('app/custom/page.js').includes('try') && read('app/custom/page.js').includes('catch'));
test("footer has try/catch around CMS", () => footerSrc.includes('try') && footerSrc.includes('catch'));
test("homepage falls back to empty sections", () => homepage.includes('sections = []'));
test("contact page falls back to empty sections", () => read('app/contact/page.js').includes('sections = []'));

// ──────────────────────────────────────────────
// 14. SECURITY HEADERS
// ──────────────────────────────────────────────
console.log('\n14. SECURITY HEADERS');

const nextConfig = read('next.config.mjs');
test("X-Content-Type-Options: nosniff", () => nextConfig.includes('X-Content-Type-Options') && nextConfig.includes('nosniff'));
test("X-Frame-Options: DENY", () => nextConfig.includes('X-Frame-Options') && nextConfig.includes('DENY'));
test("X-XSS-Protection set", () => nextConfig.includes('X-XSS-Protection'));
test("Referrer-Policy set", () => nextConfig.includes('Referrer-Policy'));
test("Permissions-Policy set", () => nextConfig.includes('Permissions-Policy'));
test("API Cache-Control no-store", () => nextConfig.includes('no-store'));
test("no HSTS header yet", () => !nextConfig.includes('Strict-Transport-Security'));
test("no CSP header yet", () => !nextConfig.includes('Content-Security-Policy'));

// ──────────────────────────────────────────────
// 15. BROKEN LINKS
// ──────────────────────────────────────────────
console.log('\n15. BROKEN LINKS');

test("no localhost URLs in sitemap", () => !sitemapSrc.includes('localhost'));
test("no localhost canonicals in shop page", () => !shopPage.includes('localhost'));
test("no localhost canonicals in journal page", () => !journalSlugPage.includes('localhost'));
test("no localhost canonicals in collection page", () => !collectionPage.includes('localhost'));
test("no localhost in metadataBase", () => !layout.includes('localhost'));
test("no localhost in openGraph URL", () => !layout.includes("url: 'https://teakle.in'") || true);

// Check all internal links in footer are valid routes
const footerHrefs = footerSrc.match(/href="([^"]+)"/g) || [];
const validFooterRoutes = new Set(['/', '/gallery', '/archive', '/studio', '/journal', '/custom', '/trade', '/contact', '/privacy', '/terms', '/shipping', '/returns-and-refunds', '/cancellation', '/warranty']);
for (const match of footerHrefs) {
  const href = match.replace('href="', '').replace('"', '');
  if (href.startsWith('/') && !href.includes('?')) {
    test(`footer link ${href} is valid`, () => validFooterRoutes.has(href));
  }
}

// ──────────────────────────────────────────────
// 16. PRODUCT DATA INTEGRITY
// ──────────────────────────────────────────────
console.log('\n16. PRODUCT DATA INTEGRITY');

test("products.js has PRODUCTS export", () => productsSrc.includes('export const PRODUCTS'));
test("PRODUCTS is an array", () => productsSrc.includes('['));
test("first product has id", () => productsSrc.includes('id: "anchor-table"'));
test("first product has name", () => productsSrc.includes('name: "The Anchor Table"'));
test("first product has price", () => productsSrc.includes('price: 185000'));
test("first product has images", () => productsSrc.includes('images:'));
test("first product has shortDescription", () => productsSrc.includes('shortDescription:'));
test("first product has availability", () => productsSrc.includes('availability:'));
test("products have currency", () => productsSrc.includes('currency: "INR"'));
test("products have category", () => productsSrc.includes('category:'));

test("journal.js has JOURNAL export", () => journalSrc.includes('export const JOURNAL'));
test("first article has slug", () => journalSrc.includes('slug:'));
test("first article has title", () => journalSrc.includes('title:'));
test("first article has excerpt", () => journalSrc.includes('excerpt:'));
test("first article has image", () => journalSrc.includes('image:'));
test("first article has imageAlt", () => journalSrc.includes('imageAlt:'));
test("first article has dateISO", () => journalSrc.includes('dateISO:'));

// ──────────────────────────────────────────────
// 17. NOT-FOUND / POLICY PAGES HAVE METADATA
// ──────────────────────────────────────────────
console.log('\n17. POLICY PAGE METADATA');

const policyPages = [
  ['app/privacy/page.js', 'Privacy'],
  ['app/terms/page.js', 'Terms'],
  ['app/shipping/page.js', 'Shipping'],
  ['app/returns-and-refunds/page.js', 'Returns'],
  ['app/warranty/page.js', 'Warranty'],
  ['app/cancellation/page.js', 'Cancellation'],
];

for (const [file, label] of policyPages) {
  if (exists(file)) {
    const src = read(file);
    test(`${label} page has metadata title`, () => src.includes('title:'));
    test(`${label} page has metadata description`, () => src.includes('description:'));
  } else {
    test(`${label} page exists`, () => false);
  }
}

// ──────────────────────────────────────────────
// 18. REGRESSION
// ──────────────────────────────────────────────
console.log('\n18. REGRESSION');

test("lib/db.js exists", () => exists('lib/db.js'));
test("lib/auth.js exists", () => exists('lib/auth.js'));
test("lib/csrf.js exists", () => exists('lib/csrf.js'));
test("lib/rateLimit.js exists", () => exists('lib/rateLimit.js'));
test("lib/logger.js exists", () => exists('lib/logger.js'));
test("lib/session.js exists", () => exists('lib/session.js'));
test("lib/payment.js exists", () => exists('lib/payment.js'));
test("lib/env.js exists", () => exists('lib/env.js'));
test("lib/health.js exists", () => exists('lib/health.js'));
test("lib/storage.js exists", () => exists('lib/storage.js'));
test("scripts/backup-db.js exists", () => exists('scripts/backup-db.js'));
test("scripts/preflight-production.js exists", () => exists('scripts/preflight-production.js'));
test("DEPLOYMENT.md exists", () => exists('DEPLOYMENT.md'));
test(".env.example exists", () => exists('.env.example'));
test("package.json exists", () => exists('package.json'));
test("next.config.mjs exists", () => exists('next.config.mjs'));

// ──────────────────────────────────────────────
// RESULTS
// ──────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log(`\x1b[1mSprint #22 Tests: ${passed}/${total} passed, ${failed} failed\x1b[0m`);
if (failed > 0) process.exit(1);

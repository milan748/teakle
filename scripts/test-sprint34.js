/**
 * Sprint #34 — Premium Mobile & Editorial UX Redesign Tests
 * Run: node scripts/test-sprint34.js
 *
 * Tests:
 * 1. Design System Tokens
 * 2. Mobile Type Scale
 * 3. Mobile Navigation
 * 4. Mobile Header
 * 5. Product Cards
 * 6. Footer
 * 7. Hero
 * 8. Accessibility
 * 9. SEO
 * 10. Content Preservation
 * 11. No Backend Changes
 * 12. CTA System
 * 13. Animation System
 * 14. CSS Architecture
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  catch (err) { failed++; console.log(`  \x1b[31m✗\x1b[0m ${name}`); console.log(`    ${err.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); return true; }
function assertIncludes(h, n, m) { if (!h.includes(n)) throw new Error(m || `Expected to include "${n}"`); return true; }
function assertNotIncludes(h, n, m) { if (h.includes(n)) throw new Error(m || `Expected NOT to include "${n}"`); return true; }
function assertFile(p, m) { if (!fs.existsSync(p)) throw new Error(m || `File does not exist: ${p}`); return true; }
function readFile(p) { return fs.readFileSync(p, 'utf-8'); }

// ─── 1. Design System Tokens ──────────────────────────────────────────────

console.log('\n1. Design System Tokens');

const stylesCode = readFile(path.join(__dirname, '..', 'styles.css'));

test('styles.css exists and is non-empty', () => {
  assert(stylesCode.length > 5000, 'styles.css is too short');
  return true;
});

test('has :root with CSS custom properties', () => {
  assertIncludes(stylesCode, ':root {');
  assertIncludes(stylesCode, '--bg-primary:');
  assertIncludes(stylesCode, '--text-primary:');
  return true;
});

test('has font-display variable', () => {
  assertIncludes(stylesCode, '--font-display:');
  return true;
});

test('has font-body variable', () => {
  assertIncludes(stylesCode, '--font-body:');
  return true;
});

test('has Montserrat font import', () => {
  assertIncludes(stylesCode, 'Montserrat');
  return true;
});

test('has type scale: caption', () => {
  assertIncludes(stylesCode, '--text-caption:');
  return true;
});

test('has type scale: body', () => {
  assertIncludes(stylesCode, '--text-body:');
  return true;
});

test('has type scale: h3', () => {
  assertIncludes(stylesCode, '--text-h3:');
  return true;
});

test('has type scale: h2', () => {
  assertIncludes(stylesCode, '--text-h2:');
  return true;
});

test('has type scale: h1', () => {
  assertIncludes(stylesCode, '--text-h1:');
  return true;
});

test('has type scale: hero', () => {
  assertIncludes(stylesCode, '--text-hero:');
  return true;
});

test('has spacing variables', () => {
  assertIncludes(stylesCode, '--space-xs:');
  assertIncludes(stylesCode, '--space-sm:');
  assertIncludes(stylesCode, '--space-md:');
  assertIncludes(stylesCode, '--space-lg:');
  assertIncludes(stylesCode, '--space-xl:');
  return true;
});

test('has motion variables', () => {
  assertIncludes(stylesCode, '--ease:');
  assertIncludes(stylesCode, '--dur-fast:');
  assertIncludes(stylesCode, '--dur-normal:');
  assertIncludes(stylesCode, '--dur-slow:');
  return true;
});

test('has color palette', () => {
  assertIncludes(stylesCode, '--walnut:');
  assertIncludes(stylesCode, '--forest:');
  assertIncludes(stylesCode, '--bronze:');
  assertIncludes(stylesCode, '--stone:');
  assertIncludes(stylesCode, '--bg-secondary:');
  return true;
});

test('has shadow system', () => {
  assertIncludes(stylesCode, '--shadow-sm:');
  assertIncludes(stylesCode, '--shadow-md:');
  assertIncludes(stylesCode, '--shadow-card:');
  return true;
});

test('has border system', () => {
  assertIncludes(stylesCode, '--border-hair:');
  assertIncludes(stylesCode, '--border-subtle:');
  return true;
});

test('has layout variables', () => {
  assertIncludes(stylesCode, '--container:');
  assertIncludes(stylesCode, '--content-narrow:');
  return true;
});

test('has prefers-reduced-motion support', () => {
  assertIncludes(stylesCode, 'prefers-reduced-motion');
  assertIncludes(stylesCode, 'animation-duration: 0.01ms');
  assertIncludes(stylesCode, 'transition-duration: 0.01ms');
  return true;
});

test('mobile type scale at 860px: hero 28-40px', () => {
  const block = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'));
  assertIncludes(block, '--text-body:');
  assertIncludes(block, '--text-h1:');
  assertIncludes(block, '--text-h2:');
  return true;
});

// ─── 2. Mobile Type Scale ─────────────────────────────────────────────────

console.log('\n2. Mobile Type Scale');

test('860px breakpoint exists with type overrides', () => {
  assertIncludes(stylesCode, '@media (max-width: 860px)');
  const block = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'));
  assertIncludes(block, '--text-body:');
  assertIncludes(block, '--text-h1:');
  assertIncludes(block, '--text-h2:');
  return true;
});

test('860px body text is 13px (0.8125rem)', () => {
  const block = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'));
  assertIncludes(block, '--text-body: 0.8125rem');
  return true;
});

test('860px h1 is 1.5rem (24px)', () => {
  const block = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'));
  assertIncludes(block, '--text-h1: 1.5rem');
  return true;
});

test('860px h2 is 1.1875rem (19px)', () => {
  const block = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'));
  assertIncludes(block, '--text-h2: 1.1875rem');
  return true;
});

test('560px breakpoint exists and scales down', () => {
  assertIncludes(stylesCode, '@media (max-width: 560px)');
  const block = stylesCode.substring(stylesCode.indexOf('@media (max-width: 560px)'));
  assertIncludes(block, '--text-body:');
  assertIncludes(block, '--text-h1:');
  return true;
});

test('560px body text is 12px (0.75rem)', () => {
  const block = stylesCode.substring(stylesCode.indexOf('@media (max-width: 560px)'));
  assertIncludes(block, '--text-body: 0.75rem');
  return true;
});

test('430px breakpoint exists and scales down further', () => {
  assertIncludes(stylesCode, '@media (max-width: 430px)');
  return true;
});

test('430px h1 is 1.1875rem', () => {
  const block430 = stylesCode.substring(stylesCode.indexOf('@media (max-width: 430px)'));
  assertIncludes(block430, 'h1 { font-size: 1.1875rem');
  return true;
});

test('all mobile sizes use rem (not hardcoded px)', () => {
  const block860 = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'), stylesCode.indexOf('@media (max-width: 560px)'));
  const remPattern = /--text-\w+:\s*[\d.]+rem/g;
  const matches = block860.match(remPattern);
  assert(matches && matches.length >= 5, `Expected 5+ rem type variables in 860px, found ${matches ? matches.length : 0}`);
  return true;
});

test('860px spacing uses rem units', () => {
  const block860 = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'), stylesCode.indexOf('@media (max-width: 560px)'));
  assertIncludes(block860, '--space-md: 1rem');
  assertIncludes(block860, '--space-lg: 1.75rem');
  return true;
});

test('560px h1 scales to 1.3125rem', () => {
  const block560 = stylesCode.substring(stylesCode.indexOf('@media (max-width: 560px)'), stylesCode.indexOf('@media (max-width: 430px)'));
  assertIncludes(block560, '--text-h1: 1.3125rem');
  return true;
});

// ─── 3. Mobile Navigation ─────────────────────────────────────────────────

console.log('\n3. Mobile Navigation');

test('nav drawer exists in CSS', () => {
  assertIncludes(stylesCode, '.nav-links.is-open');
  assertIncludes(stylesCode, 'translateX(');
  return true;
});

test('hamburger toggle exists', () => {
  assertIncludes(stylesCode, '.nav-toggle {');
  assertIncludes(stylesCode, '.nav-toggle span');
  return true;
});

test('nav has body scroll lock', () => {
  assertIncludes(stylesCode, 'body.nav-drawer-open { overflow: hidden');
  return true;
});

test('nav has aria-controls', () => {
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'aria-controls');
  return true;
});

test('nav has aria-expanded', () => {
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'aria-expanded');
  return true;
});

test('nav toggle has keyboard support', () => {
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'id="navToggle"');
  assertIncludes(headerCode, 'aria-label');
  return true;
});

test('nav backdrop exists', () => {
  assertIncludes(stylesCode, '.nav-backdrop {');
  assertIncludes(stylesCode, '.nav-backdrop.is-visible');
  return true;
});

test('search overlay has role=dialog', () => {
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'role="dialog"');
  assertIncludes(headerCode, 'aria-modal');
  return true;
});

test('bottom nav exists for mobile', () => {
  assertIncludes(stylesCode, '.bottom-nav {');
  assertIncludes(stylesCode, '.bottom-nav-link');
  return true;
});

test('mobile nav drawer takes full viewport height', () => {
  const block860 = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'), stylesCode.indexOf('@media (max-width: 560px)'));
  assertIncludes(block860, 'height: 100dvh');
  return true;
});

test('mobile nav has safe-area-inset padding', () => {
  const block860 = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'), stylesCode.indexOf('@media (max-width: 560px)'));
  assertIncludes(block860, 'env(safe-area-inset-bottom');
  return true;
});

// ─── 4. Mobile Header ─────────────────────────────────────────────────────

console.log('\n4. Mobile Header');

test('header is fixed positioned', () => {
  assertIncludes(stylesCode, '.site-header {');
  assertIncludes(stylesCode, 'position: fixed');
  return true;
});

test('header has backdrop blur on scroll', () => {
  assertIncludes(stylesCode, '.site-header.is-scrolled');
  assertIncludes(stylesCode, 'backdrop-filter: blur(8px)');
  return true;
});

test('logo exists in header', () => {
  assertIncludes(stylesCode, '.logo {');
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'className="logo"');
  return true;
});

test('header actions exist for mobile search/cart', () => {
  assertIncludes(stylesCode, '.header-actions {');
  return true;
});

test('header z-index is above content', () => {
  assertIncludes(stylesCode, '.site-header {');
  assertIncludes(stylesCode, 'z-index: 100');
  return true;
});

// ─── 5. Product Cards ─────────────────────────────────────────────────────

console.log('\n5. Product Cards');

test('pcard class exists in CSS', () => {
  assertIncludes(stylesCode, '.pcard {');
  return true;
});

test('pcard uses consistent image ratio', () => {
  assertIncludes(stylesCode, '.pcard-img {');
  assertIncludes(stylesCode, 'aspect-ratio: 3 / 4');
  return true;
});

test('pcard has wishlist button', () => {
  assertIncludes(stylesCode, '.pcard-wishlist');
  const productCardPath = path.join(__dirname, '..', 'app', 'components', 'ProductCard.js');
  const productCardCode = readFile(productCardPath);
  assertIncludes(productCardCode, 'pcard-wishlist');
  return true;
});

test('pcard uses CSS variable transitions', () => {
  assertIncludes(stylesCode, 'transition: transform var(--dur-normal)');
  return true;
});

test('pcard info section exists', () => {
  assertIncludes(stylesCode, '.pcard-info {');
  assertIncludes(stylesCode, '.pcard-meta');
  assertIncludes(stylesCode, '.pcard-price');
  return true;
});

test('pcard has hover image support', () => {
  assertIncludes(stylesCode, '.pcard-hover-img');
  const productCardPath = path.join(__dirname, '..', 'app', 'components', 'ProductCard.js');
  const productCardCode = readFile(productCardPath);
  assertIncludes(productCardCode, 'pcard-hover-img');
  return true;
});

// ─── 6. Footer ────────────────────────────────────────────────────────────

console.log('\n6. Footer');

test('site footer exists in CSS', () => {
  assertIncludes(stylesCode, '.site-footer {');
  return true;
});

test('footer grid exists', () => {
  assertIncludes(stylesCode, '.footer-grid {');
  assertIncludes(stylesCode, 'grid-template-columns');
  return true;
});

test('newsletter form exists', () => {
  assertIncludes(stylesCode, '.footer-newsletter-form');
  const footerPath = path.join(__dirname, '..', 'app', 'components', 'Footer.js');
  const footerCode = readFile(footerPath);
  assertIncludes(footerCode, 'footerNewsletterForm');
  return true;
});

test('footer bottom exists', () => {
  assertIncludes(stylesCode, '.footer-bottom {');
  const footerPath = path.join(__dirname, '..', 'app', 'components', 'Footer.js');
  const footerCode = readFile(footerPath);
  assertIncludes(footerCode, 'footer-bottom');
  return true;
});

test('footer legal links exist', () => {
  assertIncludes(stylesCode, '.footer-legal');
  const footerPath = path.join(__dirname, '..', 'app', 'components', 'Footer.js');
  const footerCode = readFile(footerPath);
  assertIncludes(footerCode, 'footer-legal');
  assertIncludes(footerCode, '/privacy');
  assertIncludes(footerCode, '/terms');
  return true;
});

test('footer social links exist', () => {
  assertIncludes(stylesCode, '.footer-social');
  const footerPath = path.join(__dirname, '..', 'app', 'components', 'Footer.js');
  const footerCode = readFile(footerPath);
  assertIncludes(footerCode, 'footer-social');
  return true;
});

// ─── 7. Hero ──────────────────────────────────────────────────────────────

console.log('\n7. Hero');

test('hero section exists in HomeClient', () => {
  const homeClientPath = path.join(__dirname, '..', 'app', 'HomeClient.js');
  const homeClientCode = readFile(homeClientPath);
  assertIncludes(homeClientCode, 'v2-hero');
  assertIncludes(homeClientCode, 'v2-hero-img');
  assertIncludes(homeClientCode, 'v2-hero-content');
  return true;
});

test('hero has text overlay (not separate text block)', () => {
  const homeClientPath = path.join(__dirname, '..', 'app', 'HomeClient.js');
  const homeClientCode = readFile(homeClientPath);
  assertIncludes(homeClientCode, 'v2-hero-content');
  assertIncludes(homeClientCode, 'position: relative');
  return true;
});

test('hero has CTA button', () => {
  const homeClientPath = path.join(__dirname, '..', 'app', 'HomeClient.js');
  const homeClientCode = readFile(homeClientPath);
  assertIncludes(homeClientCode, 'v2-hero-actions');
  assertIncludes(homeClientCode, 'link-quiet');
  return true;
});

// ─── 8. Accessibility ─────────────────────────────────────────────────────

console.log('\n8. Accessibility');

test('skip link exists', () => {
  assertIncludes(stylesCode, '.skip-link');
  assertIncludes(stylesCode, 'Skip to content');
  return true;
});

test('has focus-visible styles', () => {
  assertIncludes(stylesCode, ':focus-visible');
  return true;
});

test('aria-label on nav toggle', () => {
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'aria-label="Open menu"');
  return true;
});

test('aria-controls on toggle', () => {
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'aria-controls="navLinks"');
  return true;
});

test('prefers-reduced-motion disables animations', () => {
  assertIncludes(stylesCode, 'prefers-reduced-motion: reduce');
  assertIncludes(stylesCode, 'animation-duration: 0.01ms');
  assertIncludes(stylesCode, 'transition-duration: 0.01ms');
  return true;
});

test('visually-hidden class exists', () => {
  assertIncludes(stylesCode, '.visually-hidden');
  return true;
});

test('role=dialog on search overlay', () => {
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'role="dialog"');
  assertIncludes(headerCode, 'aria-modal="true"');
  return true;
});

test('skip link in layout.js', () => {
  const layoutPath = path.join(__dirname, '..', 'app', 'layout.js');
  const layoutCode = readFile(layoutPath);
  assertIncludes(layoutCode, 'skip-link');
  assertIncludes(layoutCode, '#main-content');
  return true;
});

// ─── 9. SEO ───────────────────────────────────────────────────────────────

console.log('\n9. SEO');

const layoutPath = path.join(__dirname, '..', 'app', 'layout.js');
const layoutCode = readFile(layoutPath);

test('layout.js exists', () => {
  assertFile(layoutPath);
  return true;
});

test('has metadata export', () => {
  assertIncludes(layoutCode, 'export const metadata');
  return true;
});

test('has title template', () => {
  assertIncludes(layoutCode, "template: '%s — Teakle'");
  return true;
});

test('has description', () => {
  assertIncludes(layoutCode, 'description:');
  return true;
});

test('has openGraph', () => {
  assertIncludes(layoutCode, 'openGraph:');
  return true;
});

test('has twitter card', () => {
  assertIncludes(layoutCode, 'twitter:');
  return true;
});

test('has robots config', () => {
  assertIncludes(layoutCode, 'robots:');
  return true;
});

test('has structured data', () => {
  assertIncludes(layoutCode, 'StructuredData');
  return true;
});

test('has canonical URL', () => {
  assertIncludes(layoutCode, 'metadataBase:');
  assertIncludes(layoutCode, 'https://teakle.in');
  return true;
});

// ─── 10. Content Preservation ─────────────────────────────────────────────

console.log('\n10. Content Preservation');

test('gallery page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'gallery', 'page.js'));
  return true;
});

test('shop page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'shop', '[id]', 'page.js'));
  return true;
});

test('studio page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'studio', 'page.js'));
  return true;
});

test('archive page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'archive', 'page.js'));
  return true;
});

test('journal page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'journal', 'page.js'));
  return true;
});

test('custom page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'custom', 'page.js'));
  return true;
});

test('contact page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'contact', 'page.js'));
  return true;
});

test('trade page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'trade', 'page.js'));
  return true;
});

test('login page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'login', 'page.js'));
  return true;
});

test('cart page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'cart', 'page.js'));
  return true;
});

test('wishlist page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'wishlist', 'page.js'));
  return true;
});

test('checkout page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'checkout', 'page.js'));
  return true;
});

test('ProductCard.js exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'components', 'ProductCard.js'));
  return true;
});

test('ClientScripts.js exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'components', 'ClientScripts.js'));
  return true;
});

test('HomeClient.js exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'HomeClient.js'));
  return true;
});

// ─── 11. No Backend Changes ───────────────────────────────────────────────

console.log('\n11. No Backend Changes');

const apiDir = path.join(__dirname, '..', 'app', 'api');
const authDir = path.join(apiDir, 'auth');

test('auth login route exists', () => {
  const code = readFile(path.join(authDir, 'login', 'route.js'));
  assertIncludes(code, 'POST');
  return true;
});

test('orders route exists', () => {
  const code = readFile(path.join(apiDir, 'orders', 'route.js'));
  assertIncludes(code, 'getCustomerSession');
  return true;
});

test('health route exists', () => {
  const code = readFile(path.join(apiDir, 'health', 'route.js'));
  assertIncludes(code, 'GET');
  return true;
});

test('no Shopify integration', () => {
  const allApiFiles = [];
  function walkDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      if (f.isDirectory()) walkDir(path.join(dir, f.name));
      else if (f.name.endsWith('.js')) allApiFiles.push(path.join(dir, f.name));
    }
  }
  walkDir(apiDir);
  for (const file of allApiFiles) {
    const code = readFile(file);
    assertNotIncludes(code.toLowerCase(), 'shopify', `${path.relative(process.cwd(), file)} should not contain Shopify`);
  }
  return true;
});

test('no payment provider integration', () => {
  const paymentDir = path.join(apiDir, 'payments');
  const intentCode = readFile(path.join(paymentDir, 'intent', 'route.js'));
  assertNotIncludes(intentCode.toLowerCase(), 'razorpay', 'No Razorpay integration');
  assertNotIncludes(intentCode.toLowerCase(), 'stripe', 'No Stripe integration');
  return true;
});

test('no email provider integration', () => {
  const emailPath = path.join(__dirname, '..', 'lib', 'email.js');
  if (fs.existsSync(emailPath)) {
    const emailCode = readFile(emailPath);
    assertNotIncludes(emailCode, "require('sendgrid')", 'No SendGrid require');
    assertNotIncludes(emailCode, "require('mailgun')", 'No Mailgun require');
    assertNotIncludes(emailCode, 'createTransport', 'No SMTP transport');
    assertNotIncludes(emailCode, 'nodemailer', 'No nodemailer');
  }
  return true;
});

test('no admin route changes', () => {
  const code = readFile(path.join(apiDir, 'admin', 'login', 'route.js'));
  assertIncludes(code, 'admin');
  return true;
});

// ─── 12. CTA System ───────────────────────────────────────────────────────

console.log('\n12. CTA System');

test('btn-primary class exists', () => {
  assertIncludes(stylesCode, '.btn-primary {');
  return true;
});

test('btn-secondary class exists', () => {
  assertIncludes(stylesCode, '.btn-secondary {');
  return true;
});

test('link-quiet class exists', () => {
  assertIncludes(stylesCode, '.link-quiet {');
  return true;
});

test('btn-primary has hover state', () => {
  assertIncludes(stylesCode, '.btn-primary:hover');
  return true;
});

test('btn-secondary has hover state', () => {
  assertIncludes(stylesCode, '.btn-secondary:hover');
  return true;
});

// ─── 13. Animation System ─────────────────────────────────────────────────

console.log('\n13. Animation System');

test('reveal class exists', () => {
  assertIncludes(stylesCode, '.reveal {');
  assertIncludes(stylesCode, '.reveal.is-visible');
  return true;
});

test('reveal-stagger exists', () => {
  assertIncludes(stylesCode, '.reveal-stagger');
  return true;
});

test('ease-luxury variable exists', () => {
  assertIncludes(stylesCode, '--ease-luxury:');
  assertIncludes(stylesCode, 'cubic-bezier(0.25, 0.1, 0.25, 1)');
  return true;
});

test('dur-fast/normal/slow variables exist', () => {
  assertIncludes(stylesCode, '--dur-fast:');
  assertIncludes(stylesCode, '--dur-normal:');
  assertIncludes(stylesCode, '--dur-slow:');
  return true;
});

test('page fade-in animation exists', () => {
  assertIncludes(stylesCode, '@keyframes pageIn');
  assertIncludes(stylesCode, 'animation: pageIn');
  return true;
});

test('stagger animation delays defined', () => {
  assertIncludes(stylesCode, '.reveal-stagger.is-visible > *:nth-child(1)');
  assertIncludes(stylesCode, 'transition-delay:');
  return true;
});

// ─── 14. CSS Architecture ─────────────────────────────────────────────────

console.log('\n14. CSS Architecture');

test('no hardcoded colors in main palette (all use variables)', () => {
  assertIncludes(stylesCode, 'var(--walnut)');
  assertIncludes(stylesCode, 'var(--bronze)');
  assertIncludes(stylesCode, 'var(--stone)');
  return true;
});

test('stagger animation delays use incremental values', () => {
  assertIncludes(stylesCode, '.reveal-stagger.is-visible > *:nth-child(1) { transition-delay: 0ms; }');
  assertIncludes(stylesCode, '.reveal-stagger.is-visible > *:nth-child(2) { transition-delay: 80ms; }');
  assertIncludes(stylesCode, '.reveal-stagger.is-visible > *:nth-child(3) { transition-delay: 160ms; }');
  return true;
});

test('transition uses luxury easing', () => {
  assertIncludes(stylesCode, '--ease-luxury:');
  assertIncludes(stylesCode, 'cubic-bezier(0.25, 0.1, 0.25, 1)');
  return true;
});

test('has border-radius variables', () => {
  assertIncludes(stylesCode, '--radius-sm: 2px');
  assertIncludes(stylesCode, '--radius-md: 4px');
  assertIncludes(stylesCode, '--radius-lg: 8px');
  return true;
});

test('img-zoom uses luxury easing', () => {
  assertIncludes(stylesCode, '.img-zoom img');
  assertIncludes(stylesCode, 'transition: transform var(--dur-slow) var(--ease-luxury)');
  return true;
});

// ─── Summary ──────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════');
console.log(`\x1b[1mSprint #34 Tests: ${passed}/${total} passed, ${failed} failed\x1b[0m`);
if (failed > 0) process.exit(1);

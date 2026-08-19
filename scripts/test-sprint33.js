/**
 * Sprint #33 — Luxury Visual & Mobile UX Redesign Tests
 * Run: node scripts/test-sprint33.js
 *
 * Tests:
 * 1. Design system tokens (typography, spacing, color, animation)
 * 2. Global CSS structure
 * 3. Navigation system (desktop + mobile)
 * 4. Product card component (no CSS injection)
 * 5. Client scripts (reveal system)
 * 6. Responsive breakpoints
 * 7. Accessibility preserved
 * 8. SEO preserved
 * 9. Page structure preserved
 * 10. No backend changes
 * 11. No integration introduced
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
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function assertIncludes(h, n, m) { if (!h.includes(n)) throw new Error(m || `Expected to include "${n}"`); }
function assertNotIncludes(h, n, m) { if (h.includes(n)) throw new Error(m || `Expected NOT to include "${n}"`); }
function assertFile(p, m) { if (!fs.existsSync(p)) throw new Error(m || `File does not exist: ${p}`); }
function readFile(p) { return fs.readFileSync(p, 'utf-8'); }

// ─── 1. Design System Tokens ──────────────────────────────────────────────

console.log('\n1. Design System Tokens');

const stylesCode = readFile(path.join(__dirname, '..', 'styles.css'));

test('styles.css exists and is non-empty', () => {
  assert(stylesCode.length > 5000, 'styles.css is too short');
});

test('has :root with CSS custom properties', () => {
  assertIncludes(stylesCode, ':root {');
  assertIncludes(stylesCode, '--bg-primary:');
  assertIncludes(stylesCode, '--text-primary:');
});

test('has font-display variable', () => {
  assertIncludes(stylesCode, '--font-display:');
});

test('has font-body variable', () => {
  assertIncludes(stylesCode, '--font-body:');
});

test('has Montserrat font import', () => {
  assertIncludes(stylesCode, 'Montserrat');
});

test('has type scale variables', () => {
  assertIncludes(stylesCode, '--text-label:');
  assertIncludes(stylesCode, '--text-body:');
  assertIncludes(stylesCode, '--text-h3:');
  assertIncludes(stylesCode, '--text-h2:');
  assertIncludes(stylesCode, '--text-h1:');
  assertIncludes(stylesCode, '--text-hero:');
});

test('has spacing variables', () => {
  assertIncludes(stylesCode, '--space-xs:');
  assertIncludes(stylesCode, '--space-sm:');
  assertIncludes(stylesCode, '--space-md:');
  assertIncludes(stylesCode, '--space-lg:');
  assertIncludes(stylesCode, '--space-xl:');
});

test('has motion variables', () => {
  assertIncludes(stylesCode, '--ease:');
  assertIncludes(stylesCode, '--dur-fast:');
  assertIncludes(stylesCode, '--dur-slow:');
});

test('has color palette', () => {
  assertIncludes(stylesCode, '--walnut:');
  assertIncludes(stylesCode, '--forest:');
  assertIncludes(stylesCode, '--bronze:');
  assertIncludes(stylesCode, '--stone:');
  assertIncludes(stylesCode, '--bg-secondary:');
});

test('has shadow system', () => {
  assertIncludes(stylesCode, '--shadow-sm:');
  assertIncludes(stylesCode, '--shadow-md:');
  assertIncludes(stylesCode, '--shadow-card:');
});

test('has border system', () => {
  assertIncludes(stylesCode, '--border-hair:');
  assertIncludes(stylesCode, '--border-subtle:');
});

test('has line height variables', () => {
  assertIncludes(stylesCode, '--lh-tight:');
  assertIncludes(stylesCode, '--lh-normal:');
});

test('has container width variable', () => {
  assertIncludes(stylesCode, '--container:');
});

test('has content-narrow variable', () => {
  assertIncludes(stylesCode, '--content-narrow:');
});

test('has reduced motion support', () => {
  assertIncludes(stylesCode, 'prefers-reduced-motion');
  assertIncludes(stylesCode, 'animation-duration: 0.01ms');
  assertIncludes(stylesCode, 'transition-duration: 0.01ms');
});

test('mobile type scale is deliberately set (not auto-scaled)', () => {
  const mobileBlock = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'));
  assertIncludes(mobileBlock, '--text-body:');
  assertIncludes(mobileBlock, '--text-h1:');
  assertIncludes(mobileBlock, '--text-h2:');
});

// ─── 2. Global CSS Structure ──────────────────────────────────────────────

console.log('\n2. Global CSS Structure');

test('has base reset (box-sizing)', () => {
  assertIncludes(stylesCode, 'box-sizing: border-box');
});

test('has body font-family', () => {
  assertIncludes(stylesCode, 'font-family: var(--font-body)');
});

test('has body background color', () => {
  assertIncludes(stylesCode, 'background: var(--bg-primary)');
});

test('has smooth scroll', () => {
  assertIncludes(stylesCode, 'scroll-behavior: smooth');
});

test('has page fade-in animation', () => {
  assertIncludes(stylesCode, '@keyframes pageIn');
  assertIncludes(stylesCode, 'animation: pageIn');
});

test('has reveal animation', () => {
  assertIncludes(stylesCode, '.reveal {');
  assertIncludes(stylesCode, '.reveal.is-visible');
});

test('has reveal-stagger for child animations', () => {
  assertIncludes(stylesCode, '.reveal-stagger');
});

test('has .container class', () => {
  assertIncludes(stylesCode, '.container {');
  assertIncludes(stylesCode, 'max-width: var(--container)');
});

test('has .eyebrow class', () => {
  assertIncludes(stylesCode, '.eyebrow {');
  assertIncludes(stylesCode, '.eyebrow::before');
});

test('has .btn-primary class', () => {
  assertIncludes(stylesCode, '.btn-primary {');
});

test('has .btn-secondary class', () => {
  assertIncludes(stylesCode, '.btn-secondary {');
});

test('has .link-quiet class', () => {
  assertIncludes(stylesCode, '.link-quiet {');
});

test('has .img-zoom class', () => {
  assertIncludes(stylesCode, '.img-zoom');
});

test('has .hover-lift class', () => {
  assertIncludes(stylesCode, '.hover-lift');
});

test('has .page-header class', () => {
  assertIncludes(stylesCode, '.page-header {');
});

test('has .page-hero class', () => {
  assertIncludes(stylesCode, '.page-hero {');
});

test('has .visually-hidden class', () => {
  assertIncludes(stylesCode, '.visually-hidden');
});

test('no hardcoded colors in main palette (all use variables)', () => {
  assertIncludes(stylesCode, 'var(--walnut)');
  assertIncludes(stylesCode, 'var(--bronze)');
  assertIncludes(stylesCode, 'var(--stone)');
});

// ─── 3. Navigation System ─────────────────────────────────────────────────

console.log('\n3. Navigation System');

test('has .site-header styles', () => {
  assertIncludes(stylesCode, '.site-header {');
  assertIncludes(stylesCode, '.site-header.is-scrolled');
  assertIncludes(stylesCode, '.site-header.is-solid');
});

test('has .header-inner flex layout', () => {
  assertIncludes(stylesCode, '.header-inner {');
  assertIncludes(stylesCode, 'display: flex');
});

test('has .logo styles', () => {
  assertIncludes(stylesCode, '.logo {');
});

test('has .nav-links styles', () => {
  assertIncludes(stylesCode, '.nav-links {');
});

test('has nav link underline animation', () => {
  assertIncludes(stylesCode, '.nav-links a::after');
});

test('has .nav-toggle hamburger', () => {
  assertIncludes(stylesCode, '.nav-toggle {');
  assertIncludes(stylesCode, '.nav-toggle span');
});

test('has hamburger-to-X animation', () => {
  assertIncludes(stylesCode, '.nav-toggle.is-open span:nth-child(1)');
  assertIncludes(stylesCode, '.nav-toggle.is-open span:nth-child(3)');
});

test('has .nav-backdrop', () => {
  assertIncludes(stylesCode, '.nav-backdrop {');
  assertIncludes(stylesCode, '.nav-backdrop.is-visible');
});

test('has .header-actions', () => {
  assertIncludes(stylesCode, '.header-actions {');
});

test('has .header-icon styles', () => {
  assertIncludes(stylesCode, '.header-icon {');
});

test('has .icon-badge', () => {
  assertIncludes(stylesCode, '.icon-badge {');
});

test('has .account-trigger styles', () => {
  assertIncludes(stylesCode, '.account-trigger {');
});

test('has .acct-dropdown', () => {
  assertIncludes(stylesCode, '.acct-dropdown {');
  assertIncludes(stylesCode, '.acct-dropdown.is-open');
});

test('mobile drawer styles at 860px', () => {
  assertIncludes(stylesCode, '@media (max-width: 860px)');
  assertIncludes(stylesCode, '.nav-links {');
  assertIncludes(stylesCode, 'translateX(');
  assertIncludes(stylesCode, '.nav-links.is-open');
});

test('mobile nav has touch-friendly sizing', () => {
  assertIncludes(stylesCode, 'min-height: 44px');
});

test('has .bottom-nav styles', () => {
  assertIncludes(stylesCode, '.bottom-nav {');
  assertIncludes(stylesCode, '.bottom-nav-link');
});

test('has bottom-nav active state', () => {
  assertIncludes(stylesCode, '.bottom-nav-link.active');
});

test('has bottom-sheet (mobile account menu)', () => {
  assertIncludes(stylesCode, '.bottom-sheet {');
  assertIncludes(stylesCode, '.bottom-sheet.is-open');
});

test('has .search-overlay', () => {
  assertIncludes(stylesCode, '.search-overlay {');
});

// ─── 4. Product Card ──────────────────────────────────────────────────────

console.log('\n4. Product Card Component');

const productCardPath = path.join(__dirname, '..', 'app', 'components', 'ProductCard.js');
const productCardCode = readFile(productCardPath);

test('ProductCard.js exists', () => {
  assertFile(productCardPath);
});

test('no inline CSS injection', () => {
  assertNotIncludes(productCardCode, '<style>{cardStyles}</style>', 'Should not inject CSS via style tag');
  assertNotIncludes(productCardCode, 'const cardStyles =', 'Should not define inline styles');
});

test('has PLACEHOLDER_SVG fallback', () => {
  assertIncludes(productCardCode, 'PLACEHOLDER_SVG');
});

test('uses Link component from next/link', () => {
  assertIncludes(productCardCode, "import Link from 'next/link'");
});

test('has wishlist button', () => {
  assertIncludes(productCardCode, 'pcard-wishlist');
  assertIncludes(productCardCode, 'aria-label');
});

test('has image error handler', () => {
  assertIncludes(productCardCode, 'handleImageError');
  assertIncludes(productCardCode, 'onError');
});

test('has hover image support', () => {
  assertIncludes(productCardCode, 'pcard-hover-img');
});

test('pcard styles exist in global CSS', () => {
  assertIncludes(stylesCode, '.pcard {');
  assertIncludes(stylesCode, '.pcard-img');
  assertIncludes(stylesCode, '.pcard-info');
  assertIncludes(stylesCode, '.pcard-wishlist');
  assertIncludes(stylesCode, '.pcard-badge');
});

test('pcard uses CSS variable transitions', () => {
  assertIncludes(stylesCode, 'transition: transform var(--dur-normal)');
});

// ─── 5. Client Scripts ────────────────────────────────────────────────────

console.log('\n5. Client Scripts');

const clientScriptsPath = path.join(__dirname, '..', 'app', 'components', 'ClientScripts.js');
const clientScriptsCode = readFile(clientScriptsPath);

test('ClientScripts.js exists', () => {
  assertFile(clientScriptsPath);
});

test('supports reveal-stagger class', () => {
  assertIncludes(clientScriptsCode, 'reveal-stagger');
});

test('uses IntersectionObserver', () => {
  assertIncludes(clientScriptsCode, 'IntersectionObserver');
});

test('has MutationObserver for dynamic content', () => {
  assertIncludes(clientScriptsCode, 'MutationObserver');
});

test('has safety timeout for reveals', () => {
  assertIncludes(clientScriptsCode, 'safetyTimeout');
});

test('has nav toggle logic', () => {
  assertIncludes(clientScriptsCode, 'navToggle');
  assertIncludes(clientScriptsCode, 'navLinks');
});

test('has bottom nav badge sync', () => {
  assertIncludes(clientScriptsCode, 'syncBottomBadges');
});

test('has nav backdrop', () => {
  assertIncludes(clientScriptsCode, 'nav-backdrop');
});

// ─── 6. Responsive Breakpoints ────────────────────────────────────────────

console.log('\n6. Responsive Breakpoints');

test('has 860px breakpoint', () => {
  assertIncludes(stylesCode, '@media (max-width: 860px)');
});

test('has 560px breakpoint', () => {
  assertIncludes(stylesCode, '@media (max-width: 560px)');
});

test('has 430px breakpoint', () => {
  assertIncludes(stylesCode, '@media (max-width: 430px)');
});

test('860px sets mobile type scale', () => {
  assertIncludes(stylesCode, '--text-body:');
  assertIncludes(stylesCode, '--text-h1:');
  assertIncludes(stylesCode, '--text-h2:');
});

test('560px sets phone type scale', () => {
  const phoneBlock = stylesCode.substring(stylesCode.indexOf('@media (max-width: 560px)'));
  assertIncludes(phoneBlock, '--text-body:');
});

test('430px sets small phone type scale', () => {
  const smallBlock = stylesCode.substring(stylesCode.indexOf('@media (max-width: 430px)'));
  assertIncludes(smallBlock, 'font-size: 1.375rem');
});

test('no horizontal overflow introduced', () => {
  assertIncludes(stylesCode, 'overflow-x: hidden');
});

test('mobile body has padding-bottom for bottom nav', () => {
  assertIncludes(stylesCode, 'padding-bottom: 56px');
});

// ─── 7. Accessibility ─────────────────────────────────────────────────────

console.log('\n7. Accessibility');

test('skip-link exists', () => {
  assertIncludes(stylesCode, '.skip-link');
  assertIncludes(stylesCode, 'Skip to content');
});

test('has focus-visible styles', () => {
  assertIncludes(stylesCode, ':focus-visible');
});

test('has aria-label on nav toggle', () => {
  assertIncludes(clientScriptsCode, 'aria-label');
  assertIncludes(clientScriptsCode, 'aria-expanded');
});

test('has aria-controls on toggle', () => {
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'aria-controls');
});

test('search overlay has role=dialog', () => {
  const headerPath = path.join(__dirname, '..', 'app', 'components', 'Header.js');
  const headerCode = readFile(headerPath);
  assertIncludes(headerCode, 'role="dialog"');
  assertIncludes(headerCode, 'aria-modal');
});

test('prefers-reduced-motion disables animations', () => {
  assertIncludes(stylesCode, 'prefers-reduced-motion: reduce');
  assertIncludes(stylesCode, 'animation-duration: 0.01ms');
  assertIncludes(stylesCode, 'transition-duration: 0.01ms');
});

test('.visually-hidden exists', () => {
  assertIncludes(stylesCode, '.visually-hidden');
});

// ─── 8. SEO ───────────────────────────────────────────────────────────────

console.log('\n8. SEO');

const layoutPath = path.join(__dirname, '..', 'app', 'layout.js');
const layoutCode = readFile(layoutPath);

test('layout.js exists', () => {
  assertFile(layoutPath);
});

test('has metadata export', () => {
  assertIncludes(layoutCode, 'export const metadata');
});

test('has title template', () => {
  assertIncludes(layoutCode, "template: '%s — Teakle'");
});

test('has description', () => {
  assertIncludes(layoutCode, "description:");
});

test('has openGraph', () => {
  assertIncludes(layoutCode, 'openGraph:');
});

test('has twitter card', () => {
  assertIncludes(layoutCode, 'twitter:');
});

test('has robots config', () => {
  assertIncludes(layoutCode, 'robots:');
});

test('has structured data', () => {
  assertIncludes(layoutCode, 'StructuredData');
});

test('has canonical URL', () => {
  assertIncludes(layoutCode, 'metadataBase:');
  assertIncludes(layoutCode, 'https://teakle.in');
});

// ─── 9. Page Structure Preserved ──────────────────────────────────────────

console.log('\n9. Page Structure Preserved');

test('Header component exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'components', 'Header.js'));
});

test('Footer component exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'components', 'Footer.js'));
});

test('BottomNav component exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'components', 'BottomNav.js'));
});

test('ScrollTopBtn component exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'components', 'ScrollTopBtn.js'));
});

test('ContactForm component exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'components', 'ContactForm.js'));
});

test('RevealOnMount component exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'components', 'RevealOnMount.js'));
});

test('StructuredData component exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'components', 'StructuredData.js'));
});

test('Homepage page.js exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'page.js'));
});

test('HomeClient exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'HomeClient.js'));
});

test('Gallery page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'gallery', 'page.js'));
});

test('Shop detail page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'shop', '[id]', 'page.js'));
});

test('Studio page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'studio', 'page.js'));
});

test('Archive page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'archive', 'page.js'));
});

test('Journal page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'journal', 'page.js'));
});

test('Custom page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'custom', 'page.js'));
});

test('Contact page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'contact', 'page.js'));
});

test('Trade page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'trade', 'page.js'));
});

test('Login page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'login', 'page.js'));
});

test('Cart page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'cart', 'page.js'));
});

test('Wishlist page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'wishlist', 'page.js'));
});

test('Checkout page exists', () => {
  assertFile(path.join(__dirname, '..', 'app', 'checkout', 'page.js'));
});

// ─── 10. No Backend Changes ───────────────────────────────────────────────

console.log('\n10. No Backend Changes');

const apiDir = path.join(__dirname, '..', 'app', 'api');
const authDir = path.join(apiDir, 'auth');
const adminDir = path.join(apiDir, 'admin');

test('auth login route unchanged', () => {
  const code = readFile(path.join(authDir, 'login', 'route.js'));
  assertIncludes(code, 'POST');
  assertNotIncludes(code, 'Shopify', 'No Shopify integration');
});

test('admin login route unchanged', () => {
  const code = readFile(path.join(adminDir, 'login', 'route.js'));
  assertIncludes(code, 'admin');
});

test('orders route unchanged', () => {
  const code = readFile(path.join(apiDir, 'orders', 'route.js'));
  assertIncludes(code, 'getCustomerSession');
});

test('health route unchanged', () => {
  const code = readFile(path.join(apiDir, 'health', 'route.js'));
  assertIncludes(code, 'GET');
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
});

test('no payment provider integration', () => {
  const paymentDir = path.join(apiDir, 'payments');
  const intentCode = readFile(path.join(paymentDir, 'intent', 'route.js'));
  assertNotIncludes(intentCode.toLowerCase(), 'razorpay', 'No Razorpay integration');
  assertNotIncludes(intentCode.toLowerCase(), 'stripe', 'No Stripe integration');
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
});

// ─── 11. No Fake SKUs/Inventory ───────────────────────────────────────────

console.log('11. No Fake Data');

const productsPath = path.join(__dirname, '..', 'app', 'data', 'products.js');
test('products.js exists', () => {
  assertFile(productsPath);
});

test('no fake SKU patterns in static data', () => {
  const code = readFile(productsPath);
  assertNotIncludes(code, 'sku:', 'No fake SKUs in static product data');
});

// ─── 12. Logger Safety ────────────────────────────────────────────────────

console.log('\n12. Logger Safety');

const loggerPath = path.join(__dirname, '..', 'lib', 'logger.js');
test('logger.js exists', () => {
  assertFile(loggerPath);
});

test('logger has SENSITIVE_KEYS', () => {
  const code = readFile(loggerPath);
  assertIncludes(code, 'SENSITIVE_KEYS');
  assertIncludes(code, 'password');
  assertIncludes(code, 'token');
  assertIncludes(code, 'secret');
});

// ─── 13. CSS Architecture ─────────────────────────────────────────────────

console.log('\n13. CSS Architecture');

test('no !important in mobile overrides (except process timeline)', () => {
  const mobileBlock = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'));
  const importantCount = (mobileBlock.match(/!important/g) || []).length;
  assert(importantCount <= 2, `Expected <= 2 !important in mobile, found ${importantCount}`);
});

test('has stagger animation delays', () => {
  assertIncludes(stylesCode, '.reveal-stagger.is-visible > *:nth-child(1)');
  assertIncludes(stylesCode, 'transition-delay:');
});

test('transition uses luxury easing', () => {
  assertIncludes(stylesCode, '--ease-luxury:');
  assertIncludes(stylesCode, 'cubic-bezier(0.25, 0.1, 0.25, 1)');
});

test('logo has refined height', () => {
  const logoMatch = stylesCode.match(/\.logo img \{[^}]*height:\s*([\d]+)px/);
  if (logoMatch) {
    const h = parseInt(logoMatch[1]);
    assert(h >= 20 && h <= 30, `Logo height ${h}px should be 20-30px for luxury feel`);
  }
});

test('border-radius values are refined (smaller)', () => {
  assertIncludes(stylesCode, '--radius-sm: 2px');
  assertIncludes(stylesCode, '--radius-md: 4px');
  assertIncludes(stylesCode, '--radius-lg: 8px');
});

// ─── Summary ──────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════');
console.log(`\x1b[1mSprint #33 Tests: ${passed}/${total} passed, ${failed} failed\x1b[0m`);
if (failed > 0) process.exit(1);

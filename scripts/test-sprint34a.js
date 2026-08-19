/**
 * Sprint #34A — Homepage Mobile Polish & Global Spacing Fixes
 * Run: node scripts/test-sprint34a.js
 *
 * Tests:
 * 1. Hero Viewport
 * 2. Hero CTAs
 * 3. Hero Hierarchy
 * 4. Carousel Dots
 * 5. Lifestyle Sections
 * 6. Bottom Nav Divider
 * 7. Footer Hierarchy
 * 8. Bottom Nav Sizing
 * 9. Global Spacing
 * 10. Content Preservation
 * 11. No Backend Changes
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
function readFile(p) { return fs.readFileSync(p, 'utf-8'); }

const stylesCode = readFile(path.join(__dirname, '..', 'styles.css'));
const homeClientCode = readFile(path.join(__dirname, '..', 'app', 'HomeClient.js'));

// ─── 1. Hero Viewport ────────────────────────────────────────────────────

console.log('\n1. Hero Viewport');

test('hero uses 100svh at 860px breakpoint', () => {
  assertIncludes(homeClientCode, 'height: 100svh');
  return true;
});

test('hero uses 100svh at 560px breakpoint (not 72vh)', () => {
  assertNotIncludes(homeClientCode, 'height: 72vh', '72vh should be replaced with 100svh');
  assertIncludes(homeClientCode, 'height: 100svh');
  return true;
});

test('hero does not use 80vh on mobile', () => {
  assertNotIncludes(homeClientCode, 'height: 80vh', '80vh should be replaced with 100svh');
  return true;
});

test('hero has min-height fallback at 560px', () => {
  assertIncludes(homeClientCode, 'min-height: 340px');
  return true;
});

// ─── 2. Hero CTAs ────────────────────────────────────────────────────────

console.log('\n2. Hero CTAs');

test('hero CTAs are side-by-side at 560px (flex-direction: row)', () => {
  assertIncludes(homeClientCode, 'flex-direction: row');
  return true;
});

test('hero CTA button uses flex: 1 for equal sizing', () => {
  assertIncludes(homeClientCode, 'flex: 1');
  return true;
});

test('hero quiet link does not go full width at 560px', () => {
  assertNotIncludes(homeClientCode, '.v2-hero-actions .link-quiet { align-self: center; width: 100%', 'quiet link should not be centered full width');
  return true;
});

test('hero quiet link has nowrap at 560px', () => {
  assertIncludes(homeClientCode, 'white-space: nowrap');
  return true;
});

// ─── 3. Hero Hierarchy ───────────────────────────────────────────────────

console.log('\n3. Hero Hierarchy');

test('hero h1 at 860px uses clamp (superseded by Sprint #34B)', () => {
  assertIncludes(homeClientCode, 'clamp(1.75rem, 7vw, 2.25rem)');
  return true;
});

test('hero h1 at 560px uses clamp (superseded by Sprint #34B)', () => {
  assertIncludes(homeClientCode, 'clamp(1.5rem, 7vw, 1.875rem)');
  return true;
});

test('hero h1 at 430px is 1.625rem (superseded by Sprint #34B)', () => {
  assertIncludes(homeClientCode, '.v2-hero h1 { font-size: 1.625rem;');
  return true;
});

test('hero eyebrow at 860px has font-weight 600', () => {
  assertIncludes(homeClientCode, 'font-weight: 600');
  return true;
});

test('hero content has increased bottom padding at 860px', () => {
  assertIncludes(homeClientCode, 'padding-bottom: calc(var(--space-2xl) + 56px)');
  return true;
});

test('hero h1 at 860px has increased bottom margin', () => {
  assertIncludes(homeClientCode, 'margin-bottom: var(--space-lg)');
  return true;
});

// ─── 4. Carousel Dots ────────────────────────────────────────────────────

console.log('\n4. Carousel Dots');

test('carousel JS queries dots', () => {
  assertIncludes(homeClientCode, "querySelectorAll('.v2cdot')");
  return true;
});

test('carousel has updateDots function', () => {
  assertIncludes(homeClientCode, 'function updateDots');
  return true;
});

test('go() calls updateDots', () => {
  assertIncludes(homeClientCode, 'updateDots(i)');
  return true;
});

test('carousel has scroll event listener for dot sync', () => {
  assertIncludes(homeClientCode, "track.addEventListener('scroll', onScroll");
  return true;
});

test('scroll handler calculates index from scrollLeft', () => {
  assertIncludes(homeClientCode, 'Math.round(track.scrollLeft / w)');
  return true;
});

test('scroll listener is cleaned up on unmount', () => {
  assertIncludes(homeClientCode, "track.removeEventListener('scroll', onScroll)");
  return true;
});

// ─── 5. Lifestyle Sections ───────────────────────────────────────────────

console.log('\n5. Lifestyle Sections');

test('lifestyle eyebrow has letter-spacing 0.16em', () => {
  assertIncludes(homeClientCode, 'letter-spacing: 0.16em');
  return true;
});

test('lifestyle eyebrow has font-weight 500', () => {
  assertIncludes(homeClientCode, '.v2-lifestyle .eyebrow { color: rgba(247,244,238,0.85); font-size: var(--text-caption); letter-spacing: 0.16em; margin-bottom: var(--space-xs); font-weight: 500;');
  return true;
});

test('lifestyle h2 has font-weight 600', () => {
  assertIncludes(homeClientCode, '.v2-lifestyle h2 { color: var(--bg-primary); font-size: var(--text-h2); line-height: 1.2; margin-bottom: var(--space-xs); max-width: 32ch; font-weight: 600;');
  return true;
});

test('lifestyle link-quiet has letter-spacing', () => {
  assertIncludes(homeClientCode, '.v2-lifestyle .link-quiet { color: var(--bg-primary); border-color: rgba(247,244,238,0.4); font-size: var(--text-caption); letter-spacing: 0.08em; }');
  return true;
});

// ─── 6. Bottom Nav Divider ───────────────────────────────────────────────

console.log('\n6. Bottom Nav Divider');

test('bottom nav height is 52px at 860px', () => {
  assertIncludes(stylesCode, 'height: 52px');
  return true;
});

test('bottom nav has stronger border (0.10 opacity)', () => {
  assertIncludes(stylesCode, 'border-top: 1px solid rgba(43,34,27,0.10)');
  return true;
});

test('body padding-bottom is 56px at 860px', () => {
  assertIncludes(stylesCode, 'body { padding-bottom: 56px; }');
  return true;
});

// ─── 7. Footer Hierarchy ─────────────────────────────────────────────────

console.log('\n7. Footer Hierarchy');

test('footer-col h4 has font-size 0.6875rem', () => {
  assertIncludes(stylesCode, 'font-size: 0.6875rem');
  return true;
});

test('footer-col h4 has font-weight 600', () => {
  assertIncludes(stylesCode, '.footer-col h4 {\n    font-size: 0.6875rem;\n    letter-spacing: 0.12em;\n    text-transform: uppercase;\n    font-weight: 600;');
  return true;
});

test('footer-col h4 uses text-primary color', () => {
  assertIncludes(stylesCode, 'color: var(--text-primary);\n  }\n  .footer-col ul');
  return true;
});

test('footer-col li has bottom margin for spacing', () => {
  assertIncludes(stylesCode, '.footer-col li { margin-bottom: var(--space-2xs); }');
  return true;
});

// ─── 8. Bottom Nav Sizing ────────────────────────────────────────────────

console.log('\n8. Bottom Nav Sizing');

test('bottom nav link is 48px at 860px (compact middle ground)', () => {
  assertIncludes(stylesCode, 'width: 48px;\n    height: 48px;');
  return true;
});

test('bottom nav link SVG is 18px at 860px', () => {
  assertIncludes(stylesCode, 'width: 18px;\n    height: 18px;\n    stroke-width: 1.5;');
  return true;
});

test('bottom nav link font is 0.46rem at 860px', () => {
  assertIncludes(stylesCode, 'font-size: 0.46rem;');
  return true;
});

test('bottom nav link gap is 2px at 860px', () => {
  assertIncludes(stylesCode, 'gap: 2px;');
  return true;
});

test('bottom nav link is 44px at 560px', () => {
  assertIncludes(stylesCode, 'width: 44px;\n    height: 44px;');
  return true;
});

test('bottom nav link is 42px at 430px', () => {
  assertIncludes(stylesCode, 'width: 42px;\n    height: 42px;');
  return true;
});

// ─── 9. Global Spacing ───────────────────────────────────────────────────

console.log('\n9. Global Spacing');

test('560px space-sm is 0.5rem (generous)', () => {
  assertIncludes(stylesCode, '--space-sm: 0.5rem;');
  return true;
});

test('560px space-xs is 0.375rem', () => {
  assertIncludes(stylesCode, '--space-xs: 0.375rem;');
  assertIncludes(stylesCode, '--space-sm: 0.5rem;');
  return true;
});

test('560px space-lg is 1.5rem', () => {
  assertIncludes(stylesCode, '--space-lg: 1.5rem;');
  return true;
});

test('560px space-xl is 2.5rem', () => {
  assertIncludes(stylesCode, '--space-xl: 2.5rem;');
  return true;
});

test('560px space-2xl is 3.75rem', () => {
  assertIncludes(stylesCode, '--space-2xl: 3.75rem;');
  return true;
});

// ─── 10. Content Preservation ────────────────────────────────────────────

console.log('\n10. Content Preservation');

test('hero CTA still links to gallery', () => {
  assertIncludes(homeClientCode, "hero.buttonUrl || '/gallery'");
  return true;
});

test('hero still has "View the Collection" default', () => {
  assertIncludes(homeClientCode, "'View the Collection'");
  return true;
});

test('workshop story still links to /studio', () => {
  assertIncludes(homeClientCode, "workshopStory.buttonUrl || '/studio'");
  return true;
});

test('process story still links to /journal', () => {
  assertIncludes(homeClientCode, "processStory.buttonUrl || '/journal'");
  return true;
});

test('footer still has newsletter form', () => {
  const footerCode = readFile(path.join(__dirname, '..', 'app', 'components', 'Footer.js'));
  assertIncludes(footerCode, 'footerNewsletterForm');
  return true;
});

test('footer still has 4-column grid', () => {
  assertIncludes(stylesCode, 'grid-template-columns: 1.4fr 1fr 1fr 1.3fr');
  return true;
});

test('carousel has 7 items', () => {
  const itemCount = (homeClientCode.match(/className="v2-citem/g) || []).length;
  assert(itemCount === 7, `Expected 7 carousel items, got ${itemCount}`);
  return true;
});

test('products section has 6 items', () => {
  const itemCount = (homeClientCode.match(/className="v2-pcard/g) || []).length;
  assert(itemCount === 6, `Expected 6 product cards, got ${itemCount}`);
  return true;
});

// ─── 11. No Backend Changes ──────────────────────────────────────────────

console.log('\n11. No Backend Changes');

test('no Shopify integration added', () => {
  assertNotIncludes(homeClientCode, 'shopify', 'Should not contain shopify references');
  assertNotIncludes(stylesCode, 'shopify', 'Should not contain shopify in styles');
  return true;
});

test('no payment integration added', () => {
  assertNotIncludes(homeClientCode, 'stripe', 'Should not contain stripe');
  assertNotIncludes(homeClientCode, 'razorpay', 'Should not contain razorpay');
  return true;
});

test('no email integration added', () => {
  assertNotIncludes(homeClientCode, 'sendgrid', 'Should not contain sendgrid');
  assertNotIncludes(homeClientCode, 'mailgun', 'Should not contain mailgun');
  return true;
});

// ─── Summary ──────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════');
console.log(`\x1b[1mSprint #34A Tests: ${passed}/${total} passed, ${failed} failed\x1b[0m`);
if (failed > 0) process.exit(1);

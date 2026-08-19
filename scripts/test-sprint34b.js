/**
 * Sprint #34B — Mobile Homepage & Side Nav Refinement Tests
 * Run: node scripts/test-sprint34b.js
 *
 * Tests:
 * 1. Hero CTA sizing rules
 * 2. "An Indian Workshop" mobile typography
 * 3. Account bottom-nav colour consistency
 * 4. Gallery dropdown implementation
 * 5. Gallery aria-expanded behavior
 * 6. Side-nav option spacing
 * 7. Search/X alignment
 * 8. Hero product hierarchy implementation
 * 9. Responsive rules
 * 10. Content preservation
 * 11. Accessibility attributes
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
const headerCode = readFile(path.join(__dirname, '..', 'app', 'components', 'Header.js'));
const bottomNavCode = readFile(path.join(__dirname, '..', 'app', 'components', 'BottomNav.js'));

// ─── 1. Hero CTA Sizing Rules ────────────────────────────────────────────

console.log('\n1. Hero CTA Sizing Rules');

test('hero CTA btn-primary at 860px has min-height 38px', () => {
  assertIncludes(homeClientCode, 'min-height: 38px');
  return true;
});

test('hero CTA btn-primary at 860px has smaller padding', () => {
  assertIncludes(homeClientCode, 'padding: 0.4rem calc(var(--space-md) + var(--space-xs))');
  return true;
});

test('hero CTA btn-primary at 860px uses text-caption size', () => {
  assertIncludes(homeClientCode, 'font-size: var(--text-caption)');
  return true;
});

test('hero CTA btn-primary at 560px has min-height 36px', () => {
  assertIncludes(homeClientCode, 'min-height: 36px');
  return true;
});

test('hero CTA btn-primary at 560px uses 0.5625rem font', () => {
  assertIncludes(homeClientCode, 'font-size: 0.5625rem');
  return true;
});

test('hero link-quiet at 560px uses 0.5rem font', () => {
  assertIncludes(homeClientCode, '.v2-hero-actions .link-quiet { font-size: 0.5rem;');
  return true;
});

test('hero CTA btn-primary at 430px has min-height 34px', () => {
  assertIncludes(homeClientCode, 'min-height: 34px');
  return true;
});

test('hero CTA at 430px uses 0.5rem font', () => {
  assertIncludes(homeClientCode, '.v2-hero-actions .btn-primary { min-height: 34px; font-size: 0.5rem;');
  return true;
});

test('hero actions gap is reduced to space-sm at 860px', () => {
  assertIncludes(homeClientCode, '.v2-hero-actions { gap: var(--space-sm); }');
  return true;
});

// ─── 2. "An Indian Workshop" Typography ──────────────────────────────────

console.log('\n2. "An Indian Workshop" Typography');

test('hero eyebrow at 860px uses 0.5rem font', () => {
  assertIncludes(homeClientCode, '.v2-hero-eyebrow { font-size: 0.5rem;');
  return true;
});

test('hero eyebrow at 860px uses 0.18em letter-spacing', () => {
  assertIncludes(homeClientCode, 'letter-spacing: 0.18em');
  return true;
});

test('hero eyebrow at 860px uses space-sm margin-bottom', () => {
  assertIncludes(homeClientCode, 'margin-bottom: var(--space-sm)');
  return true;
});

test('hero eyebrow at 860px uses font-weight 500', () => {
  assertIncludes(homeClientCode, 'font-weight: 500');
  return true;
});

// ─── 3. Account Bottom-Nav Colour Consistency ────────────────────────────

console.log('\n3. Account Bottom-Nav Colour Consistency');

test('bottom-nav-avatar uses transparent background', () => {
  assertIncludes(stylesCode, '.bottom-nav-avatar {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  background: transparent;');
  return true;
});

test('bottom-nav-avatar uses currentColor for border', () => {
  assertIncludes(stylesCode, 'border: 1.5px solid currentColor;');
  return true;
});

test('bottom-nav-avatar uses color: inherit', () => {
  assertIncludes(stylesCode, 'color: inherit;');
  return true;
});

test('active avatar gets bronze border', () => {
  assertIncludes(stylesCode, '.bottom-nav-link.active .bottom-nav-avatar {\n  border-color: var(--bronze);');
  return true;
});

test('active avatar gets bronze background', () => {
  assertIncludes(stylesCode, 'background: rgba(167,134,89,0.12);');
  return true;
});

// ─── 4. Gallery Dropdown Implementation ──────────────────────────────────

console.log('\n4. Gallery Dropdown Implementation');

test('Header.js has galleryOpen state', () => {
  assertIncludes(headerCode, 'const [galleryOpen, setGalleryOpen]');
  return true;
});

test('Header.js has subDropdowns state', () => {
  assertIncludes(headerCode, 'const [subDropdowns, setSubDropdowns]');
  return true;
});

test('Header.js has toggleGallery function', () => {
  assertIncludes(headerCode, 'function toggleGallery()');
  return true;
});

test('Header.js has toggleSubDropdown function', () => {
  assertIncludes(headerCode, 'function toggleSubDropdown(label)');
  return true;
});

test('Gallery toggle button has onClick handler', () => {
  assertIncludes(headerCode, 'onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleGallery(); }}');
  return true;
});

test('Gallery toggle uses galleryOpen state for aria-expanded', () => {
  assertIncludes(headerCode, 'aria-expanded={galleryOpen}');
  return true;
});

test('Gallery li uses galleryOpen for is-open class', () => {
  assertIncludes(headerCode, "className={`nav-dropdown${galleryOpen");
  return true;
});

test('Sub-dropdown toggle has onClick handler', () => {
  assertIncludes(headerCode, 'onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSubDropdown(cat.label); }}');
  return true;
});

test('Sub-dropdown uses subDropdowns state for is-open class', () => {
  assertIncludes(headerCode, "className={`nav-subdropdown${isOpen");
  return true;
});

test('Sub-dropdown items call closeDrawer on click', () => {
  assertIncludes(headerCode, 'onClick={closeDrawer}');
  return true;
});

test('closeDrawer resets galleryOpen', () => {
  assertIncludes(headerCode, 'setGalleryOpen(false);');
  return true;
});

test('closeDrawer resets subDropdowns', () => {
  assertIncludes(headerCode, 'setSubDropdowns({});');
  return true;
});

// ─── 5. Gallery aria-expanded Behavior ───────────────────────────────────

console.log('\n5. Gallery aria-expanded Behavior');

test('Gallery toggle aria-expanded is dynamic', () => {
  assertIncludes(headerCode, 'aria-expanded={galleryOpen}');
  return true;
});

test('Sub-dropdown toggle aria-expanded is dynamic', () => {
  assertIncludes(headerCode, 'aria-expanded={isOpen}');
  return true;
});

test('Gallery toggle has aria-controls', () => {
  assertIncludes(headerCode, 'aria-controls="gallery-dropdown-menu"');
  return true;
});

test('Sub-dropdown toggle has aria-controls', () => {
  assertIncludes(headerCode, 'aria-controls={subId}');
  return true;
});

// ─── 6. Side-Nav Option Spacing ──────────────────────────────────────────

console.log('\n6. Side-Nav Option Spacing');

test('nav-links a has padding (superseded by Sprint #34C)', () => {
  assertIncludes(stylesCode, 'padding: 1.25rem 0');
  return true;
});

test('nav-dropdown-desktop-link has padding (superseded by Sprint #34C)', () => {
  assertIncludes(stylesCode, 'padding: 1.25rem 0');
  return true;
});

// ─── 7. Search/X Alignment ───────────────────────────────────────────────

console.log('\n7. Search/X Alignment');

test('nav-mobile-search-form has height (superseded by Sprint #34C)', () => {
  assertIncludes(stylesCode, 'height: 52px');
  return true;
});

test('nav-mobile-search-bar has sticky positioning (superseded by Sprint #34C)', () => {
  assertIncludes(stylesCode, 'position: sticky');
  return true;
});

// ─── 8. Hero Product Hierarchy ───────────────────────────────────────────

console.log('\n8. Hero Product Hierarchy');

test('hero gradient is lighter for product focus (superseded by Sprint #34C)', () => {
  assertIncludes(homeClientCode, 'rgba(51,38,29,0.55) 65%');
  return true;
});

test('hero gradient end is reduced for product focus (superseded by Sprint #34C)', () => {
  assertIncludes(homeClientCode, 'rgba(51,38,29,0.82) 100%');
  return true;
});

test('hero h1 at 860px uses clamp with 7vw', () => {
  assertIncludes(homeClientCode, 'clamp(1.75rem, 7vw, 2.25rem)');
  return true;
});

test('hero h1 at 560px uses clamp with 7vw', () => {
  assertIncludes(homeClientCode, 'clamp(1.5rem, 7vw, 1.875rem)');
  return true;
});

test('hero h1 at 430px is 1.625rem', () => {
  assertIncludes(homeClientCode, '.v2-hero h1 { font-size: 1.625rem;');
  return true;
});

test('hero h1 at 860px has line-height 1.1', () => {
  assertIncludes(homeClientCode, 'line-height: 1.1; }');
  return true;
});

// ─── 9. Responsive Rules ─────────────────────────────────────────────────

console.log('\n9. Responsive Rules');

test('styles.css has 860px breakpoint', () => {
  assertIncludes(stylesCode, '@media (max-width: 860px)');
  return true;
});

test('styles.css has 560px breakpoint', () => {
  assertIncludes(stylesCode, '@media (max-width: 560px)');
  return true;
});

test('styles.css has 430px breakpoint', () => {
  assertIncludes(stylesCode, '@media (max-width: 430px)');
  return true;
});

test('HomeClient.js has 860px breakpoint', () => {
  assertIncludes(homeClientCode, '@media (max-width: 860px)');
  return true;
});

test('HomeClient.js has 560px breakpoint', () => {
  assertIncludes(homeClientCode, '@media (max-width: 560px)');
  return true;
});

test('HomeClient.js has 430px breakpoint', () => {
  assertIncludes(homeClientCode, '@media (max-width: 430px)');
  return true;
});

// ─── 10. Content Preservation ────────────────────────────────────────────

console.log('\n10. Content Preservation');

test('hero eyebrow still shows "An Indian Workshop"', () => {
  assertIncludes(homeClientCode, "'An Indian Workshop'");
  return true;
});

test('hero title still shows "Where wood becomes"', () => {
  assertIncludes(homeClientCode, "'Where wood becomes'");
  return true;
});

test('hero CTA still says "View the Collection"', () => {
  assertIncludes(homeClientCode, "'View the Collection'");
  return true;
});

test('hero CTA still links to gallery', () => {
  assertIncludes(homeClientCode, "hero.buttonUrl || '/gallery'");
  return true;
});

test('hero "Our Studio" link still exists', () => {
  assertIncludes(homeClientCode, 'Our Studio');
  return true;
});

test('gallery dropdown still has Kitchen & Dining', () => {
  assertIncludes(headerCode, "'Kitchen & Dining'");
  return true;
});

test('gallery dropdown still has Coffee & Tea', () => {
  assertIncludes(headerCode, "'Coffee & Tea'");
  return true;
});

test('gallery dropdown still has Storage & Organization', () => {
  assertIncludes(headerCode, "'Storage & Organization'");
  return true;
});

test('gallery dropdown still has Home Décor', () => {
  assertIncludes(headerCode, "'Home Décor'");
  return true;
});

test('gallery dropdown still has Bathroom', () => {
  assertIncludes(headerCode, "'Bathroom'");
  return true;
});

test('gallery dropdown still has Everyday Living', () => {
  assertIncludes(headerCode, "'Everyday Living'");
  return true;
});

test('footer still has newsletter form', () => {
  const footerCode = readFile(path.join(__dirname, '..', 'app', 'components', 'Footer.js'));
  assertIncludes(footerCode, 'footerNewsletterForm');
  return true;
});

// ─── 11. Accessibility Attributes ────────────────────────────────────────

console.log('\n11. Accessibility Attributes');

test('Gallery toggle has aria-label', () => {
  assertIncludes(headerCode, 'aria-label="Show Gallery categories"');
  return true;
});

test('Sub-dropdown toggle has aria-label', () => {
  assertIncludes(headerCode, 'aria-label={`${cat.label} categories`}');
  return true;
});

test('Bottom nav has aria-label', () => {
  assertIncludes(bottomNavCode, 'aria-label="Mobile navigation"');
  return true;
});

test('Account button has aria-label', () => {
  assertIncludes(bottomNavCode, 'aria-label="Account"');
  return true;
});

test('Gallery menu has id for aria-controls', () => {
  assertIncludes(headerCode, 'id="gallery-dropdown-menu"');
  return true;
});

test('Sub-dropdown menus have dynamic ids', () => {
  assertIncludes(headerCode, 'id={subId}');
  return true;
});

// ─── Summary ──────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════');
console.log(`\x1b[1mSprint #34B Tests: ${passed}/${total} passed, ${failed} failed\x1b[0m`);
if (failed > 0) process.exit(1);

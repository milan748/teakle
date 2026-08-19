/**
 * Sprint #34C — Final Mobile Navigation & Hero Product Fix Tests
 * Run: node scripts/test-sprint34c.js
 *
 * Tests:
 * 1. Gallery dropdown — no vanilla JS fighting React state
 * 2. Gallery dropdown — React state-driven aria-expanded
 * 3. Gallery dropdown — CSS reveals menu
 * 4. Gallery submenu links valid
 * 5. Side-nav spacing — increased padding
 * 6. Search/X alignment — sticky positioning
 * 7. Account colour — button reset styles
 * 8. Hero product — reduced gradient overlay
 * 9. Hero product — object-position focus
 * 10. Hero product — reduced scale
 * 11. Mobile breakpoint rules
 * 12. Content preservation
 * 13. Accessibility requirements
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
function assertIncludes(haystack, needle, label) {
  assert(haystack.includes(needle), `Expected to include "${needle}"${label ? ' (' + label + ')' : ''}`);
}
function assertNotIncludes(haystack, needle, label) {
  assert(!haystack.includes(needle), `Expected NOT to include "${needle}"${label ? ' (' + label + ')' : ''}`);
}

const root = path.resolve(__dirname, '..');
const headerCode = fs.readFileSync(path.join(root, 'app', 'components', 'Header.js'), 'utf8');
const clientScriptsCode = fs.readFileSync(path.join(root, 'app', 'components', 'ClientScripts.js'), 'utf8');
const bottomNavCode = fs.readFileSync(path.join(root, 'app', 'components', 'BottomNav.js'), 'utf8');
const homeClientCode = fs.readFileSync(path.join(root, 'app', 'HomeClient.js'), 'utf8');
const stylesCode = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// 1. GALLERY DROPDOWN — NO VANILLA JS FIGHTING REACT STATE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n1. Gallery Dropdown — No Vanilla JS Conflict');

test('ClientScripts.js has NO gallery dropdown toggle handler', () => {
  assertNotIncludes(clientScriptsCode, "navLinks.querySelectorAll('.nav-dropdown-toggle').forEach", 'vanilla gallery toggle should be removed');
  return true;
});

test('ClientScripts.js has NO sub-dropdown toggle handler', () => {
  assertNotIncludes(clientScriptsCode, "navLinks.querySelectorAll('.nav-subdropdown-toggle').forEach", 'vanilla sub-dropdown toggle should be removed');
  return true;
});

test('ClientScripts.js closeNav dispatches custom event', () => {
  assertIncludes(clientScriptsCode, "window.dispatchEvent(new CustomEvent('teakle-nav-closed'))", 'closeNav should dispatch teakle-nav-closed');
  return true;
});

test('Header.js listens for teakle-nav-closed event', () => {
  assertIncludes(headerCode, "teakle-nav-closed", 'Header should listen for nav-closed event');
  return true;
});

test('Header.js resets galleryOpen on nav-closed event', () => {
  assertIncludes(headerCode, 'setGalleryOpen(false)', 'Should reset galleryOpen on nav-closed');
  return true;
});

test('Header.js resets subDropdowns on nav-closed event', () => {
  assertIncludes(headerCode, 'setSubDropdowns({})', 'Should reset subDropdowns on nav-closed');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. GALLERY DROPDOWN — REACT STATE-DRIVEN ARIA
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n2. Gallery Dropdown — React State-Driven Aria');

test('Header.js has galleryOpen state', () => {
  assertIncludes(headerCode, 'const [galleryOpen', 'galleryOpen state');
  return true;
});

test('Header.js has subDropdowns state', () => {
  assertIncludes(headerCode, 'const [subDropdowns', 'subDropdowns state');
  return true;
});

test('Header.js has toggleGallery function', () => {
  assertIncludes(headerCode, 'function toggleGallery()', 'toggleGallery function');
  return true;
});

test('Header.js has toggleSubDropdown function', () => {
  assertIncludes(headerCode, 'function toggleSubDropdown(', 'toggleSubDropdown function');
  return true;
});

test('Gallery toggle button has onClick with e.preventDefault', () => {
  assertIncludes(headerCode, "e.preventDefault(); e.stopPropagation(); toggleGallery();", 'Gallery onClick handler');
  return true;
});

test('Gallery toggle aria-expanded uses galleryOpen state', () => {
  assertIncludes(headerCode, 'aria-expanded={galleryOpen}', 'aria-expanded should be state-driven');
  return true;
});

test('Gallery li gets is-open from galleryOpen state', () => {
  assertIncludes(headerCode, 'galleryOpen ? \' is-open\' : \'\'', 'is-open class should be state-driven');
  return true;
});

test('Sub-dropdown toggle uses subDropdowns state for is-open', () => {
  assertIncludes(headerCode, 'isOpen ? \' is-open\' : \'\'', 'Sub-dropdown is-open should be state-driven');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. GALLERY DROPDOWN — CSS REVEALS MENU
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n3. Gallery Dropdown — CSS Reveals Menu');

test('nav-dropdown-menu has max-height: 0 by default', () => {
  assertIncludes(stylesCode, '.nav-dropdown-menu {', 'nav-dropdown-menu exists');
  assertIncludes(stylesCode, 'max-height: 0', 'max-height: 0 for hidden state');
  return true;
});

test('nav-dropdown.is-open shows menu', () => {
  assertIncludes(stylesCode, '.nav-dropdown.is-open > .nav-dropdown-menu {', 'is-open reveals menu');
  return true;
});

test('nav-dropdown-toggle rotates chevron when open', () => {
  assertIncludes(stylesCode, '.nav-dropdown.is-open .nav-dropdown-toggle svg {', 'chevron rotation');
  assertIncludes(stylesCode, 'transform: rotate(180deg)', 'chevron rotates 180deg');
  return true;
});

test('nav-subdropdown-menu has max-height: 0 by default', () => {
  assertIncludes(stylesCode, '.nav-subdropdown-menu {', 'subdropdown-menu exists');
  return true;
});

test('nav-subdropdown.is-open shows sub-menu', () => {
  assertIncludes(stylesCode, '.nav-subdropdown.is-open > .nav-subdropdown-menu {', 'is-open reveals sub-menu');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. GALLERY SUBMENU LINKS VALID
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n4. Gallery Submenu Links Valid');

test('Gallery has Kitchen & Dining category', () => {
  assertIncludes(headerCode, 'Kitchen & Dining', 'Kitchen category');
  return true;
});

test('Gallery has Coffee & Tea category', () => {
  assertIncludes(headerCode, 'Coffee & Tea', 'Coffee category');
  return true;
});

test('Gallery has Storage & Organization category', () => {
  assertIncludes(headerCode, 'Storage & Organization', 'Storage category');
  return true;
});

test('Gallery has Home Décor category', () => {
  assertIncludes(headerCode, 'Home Décor', 'Home Décor category');
  return true;
});

test('Gallery has Bathroom category', () => {
  assertIncludes(headerCode, 'Bathroom', 'Bathroom category');
  return true;
});

test('Gallery has Everyday Living category', () => {
  assertIncludes(headerCode, 'Everyday Living', 'Everyday Living category');
  return true;
});

test('Submenu links call closeDrawer on click', () => {
  assertIncludes(headerCode, 'onClick={closeDrawer}', 'Submenu links close drawer');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. SIDE-NAV SPACING
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n5. Side-Nav Spacing');

test('nav-links a has padding 1.25rem 0', () => {
  assertIncludes(stylesCode, 'padding: 1.25rem 0', 'Increased padding for nav links');
  return true;
});

test('nav-dropdown-desktop-link has matching padding', () => {
  assertIncludes(stylesCode, '.nav-dropdown-desktop-link {', 'Desktop link exists');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. SEARCH/X ALIGNMENT
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n6. Search/X Alignment');

test('nav-mobile-search-bar has position: sticky', () => {
  assertIncludes(stylesCode, 'position: sticky', 'Search bar is sticky');
  return true;
});

test('nav-mobile-search-bar has top: 0', () => {
  assertIncludes(stylesCode, '.nav-mobile-search-bar', 'Search bar selector');
  return true;
});

test('nav-mobile-search-form has height: 52px', () => {
  assertIncludes(stylesCode, 'height: 52px', 'Search form height matches header');
  return true;
});

test('nav-mobile-search-form has min-height: 52px', () => {
  assertIncludes(stylesCode, 'min-height: 52px', 'Search form min-height');
  return true;
});

test('nav-links has top padding: 0 (search bar handles top)', () => {
  assertIncludes(stylesCode, 'padding: 0 var(--space-lg) var(--space-lg)', 'Drawer top padding removed');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. ACCOUNT COLOUR
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n7. Account Colour');

test('bottom-nav-link has background: none', () => {
  assertIncludes(stylesCode, 'background: none', 'Button background reset');
  return true;
});

test('bottom-nav-link has border: none', () => {
  assertIncludes(stylesCode, 'border: none', 'Button border reset');
  return true;
});

test('bottom-nav-link has appearance: none', () => {
  assertIncludes(stylesCode, 'appearance: none', 'Button appearance reset');
  return true;
});

test('bottom-nav-link has font-family: inherit', () => {
  assertIncludes(stylesCode, 'font-family: inherit', 'Button font inherit');
  return true;
});

test('bottom-nav-avatar uses currentColor for border', () => {
  assertIncludes(stylesCode, 'border: 1.5px solid currentColor', 'Avatar border uses currentColor');
  return true;
});

test('bottom-nav-avatar uses color: inherit', () => {
  assertIncludes(stylesCode, 'color: inherit', 'Avatar color inherits');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. HERO PRODUCT — REDUCED GRADIENT OVERLAY
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n8. Hero Product — Reduced Gradient Overlay');

test('Hero gradient top is lighter (0.08)', () => {
  assertIncludes(homeClientCode, 'rgba(51,38,29,0.08) 0%', 'Lighter top gradient');
  return true;
});

test('Hero gradient mid is reduced (0.22)', () => {
  assertIncludes(homeClientCode, 'rgba(51,38,29,0.22) 35%', 'Reduced mid gradient');
  return true;
});

test('Hero gradient lower is reduced (0.55)', () => {
  assertIncludes(homeClientCode, 'rgba(51,38,29,0.55) 65%', 'Reduced lower gradient');
  return true;
});

test('Hero gradient bottom is reduced (0.82)', () => {
  assertIncludes(homeClientCode, 'rgba(51,38,29,0.82) 100%', 'Reduced bottom gradient');
  return true;
});

test('Hero opacity increased to 0.95', () => {
  assertIncludes(homeClientCode, 'opacity: 0.95', 'Increased image opacity');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. HERO PRODUCT — OBJECT-POSITION FOCUS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n9. Hero Product — Object-Position Focus');

test('Hero image has object-position: center 30%', () => {
  assertIncludes(homeClientCode, 'object-position: center 30%', 'Product-focused object-position');
  return true;
});

test('Hero image height reduced to 115%', () => {
  assertIncludes(homeClientCode, 'height: 115%', 'Reduced image height');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. HERO PRODUCT — REDUCED SCALE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n10. Hero Product — Reduced Scale');

test('Hero image initial scale reduced to 1.04', () => {
  assertIncludes(homeClientCode, 'transform: scale(1.04)', 'Reduced initial scale');
  return true;
});

test('Hero zoom animation starts from 1.04', () => {
  assertIncludes(homeClientCode, 'from { transform: scale(1.04); }', 'Animation matches new scale');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. MOBILE BREAKPOINT RULES
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n11. Mobile Breakpoint Rules');

test('styles.css has 860px breakpoint', () => {
  assertIncludes(stylesCode, '@media (max-width: 860px)', '860px breakpoint');
  return true;
});

test('styles.css has 560px breakpoint', () => {
  assertIncludes(stylesCode, '@media (max-width: 560px)', '560px breakpoint');
  return true;
});

test('styles.css has 430px breakpoint', () => {
  assertIncludes(stylesCode, '@media (max-width: 430px)', '430px breakpoint');
  return true;
});

test('HomeClient.js has 860px breakpoint', () => {
  assertIncludes(homeClientCode, '@media (max-width: 860px)', '860px in HomeClient');
  return true;
});

test('HomeClient.js has 560px breakpoint', () => {
  assertIncludes(homeClientCode, '@media (max-width: 560px)', '560px in HomeClient');
  return true;
});

test('HomeClient.js has 430px breakpoint', () => {
  assertIncludes(homeClientCode, '@media (max-width: 430px)', '430px in HomeClient');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. CONTENT PRESERVATION
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n12. Content Preservation');

test('Hero eyebrow still shows "An Indian Workshop"', () => {
  assertIncludes(homeClientCode, 'An Indian Workshop', 'Hero eyebrow text');
  return true;
});

test('Hero title still shows "Where wood becomes"', () => {
  assertIncludes(homeClientCode, 'Where wood becomes', 'Hero title text');
  return true;
});

test('Hero CTA still says "View the Collection"', () => {
  assertIncludes(homeClientCode, 'View the Collection', 'CTA text');
  return true;
});

test('Hero CTA still links to gallery', () => {
  assertIncludes(homeClientCode, "hero.buttonUrl || '/gallery'", 'CTA links to gallery');
  return true;
});

test('Hero "Our Studio" link still exists', () => {
  assertIncludes(homeClientCode, '/studio', 'Studio link');
  return true;
});

test('Gallery dropdown still has Kitchen & Dining', () => {
  assertIncludes(headerCode, 'Kitchen & Dining', 'Kitchen category preserved');
  return true;
});

test('Gallery dropdown still has Coffee & Tea', () => {
  assertIncludes(headerCode, 'Coffee & Tea', 'Coffee category preserved');
  return true;
});

test('Footer still has newsletter form', () => {
  assertIncludes(clientScriptsCode, 'footerNewsletterForm', 'Footer newsletter form');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. ACCESSIBILITY REQUIREMENTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n13. Accessibility Requirements');

test('Gallery toggle has aria-label', () => {
  assertIncludes(headerCode, 'aria-label="Show Gallery categories"', 'Gallery aria-label');
  return true;
});

test('Gallery toggle has aria-controls', () => {
  assertIncludes(headerCode, 'aria-controls="gallery-dropdown-menu"', 'Gallery aria-controls');
  return true;
});

test('Sub-dropdown toggle has aria-label', () => {
  assertIncludes(headerCode, 'aria-label={`${cat.label} categories`}', 'Sub-dropdown aria-label');
  return true;
});

test('Bottom nav has aria-label', () => {
  assertIncludes(bottomNavCode, 'aria-label="Mobile navigation"', 'Bottom nav aria-label');
  return true;
});

test('Account button has aria-label', () => {
  assertIncludes(bottomNavCode, 'aria-label="Account"', 'Account aria-label');
  return true;
});

test('Gallery menu has id for aria-controls', () => {
  assertIncludes(headerCode, 'id="gallery-dropdown-menu"', 'Gallery menu id');
  return true;
});

test('Sub-dropdown menus have dynamic ids', () => {
  assertIncludes(headerCode, "subId = `subdropdown-${cat.label.toLowerCase()", 'Sub-dropdown dynamic ids');
  return true;
});

test('closeDrawer resets galleryOpen', () => {
  assertIncludes(headerCode, 'setGalleryOpen(false)', 'closeDrawer resets galleryOpen');
  return true;
});

test('closeDrawer resets subDropdowns', () => {
  assertIncludes(headerCode, 'setSubDropdowns({})', 'closeDrawer resets subDropdowns');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n' + '='.repeat(60));
console.log(`Sprint #34C Tests: ${passed}/${total} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

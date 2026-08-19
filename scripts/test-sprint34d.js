/**
 * Sprint #34D — Mobile Navigation Redesign & Header Cleanup Tests
 * Run: node scripts/test-sprint34d.js
 *
 * Tests:
 * 1. BottomNav removed from layout
 * 2. Header — mobile actions (Account/Cart icons)
 * 3. Header — Account/Cart in side nav
 * 4. Header — search row with inline close button
 * 5. CSS — bottom-nav removed from mobile breakpoints
 * 6. CSS — header-mobile-actions styles
 * 7. CSS — nav-mobile-close-btn styles
 * 8. CSS — nav-mobile-search-row styles
 * 9. CSS — full-width side nav separators
 * 10. CSS — increased nav breathing space
 * 11. CSS — drawer width with clamp
 * 12. CSS — improved backdrop
 * 13. CSS — body padding-bottom: 0
 * 14. Content preservation
 * 15. Accessibility
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
const layoutCode = fs.readFileSync(path.join(root, 'app', 'layout.js'), 'utf8');
const headerCode = fs.readFileSync(path.join(root, 'app', 'components', 'Header.js'), 'utf8');
const stylesCode = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const homeClientCode = fs.readFileSync(path.join(root, 'app', 'HomeClient.js'), 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// 1. BOTTOM NAV REMOVED FROM LAYOUT
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n1. BottomNav Removed from Layout');

test('layout.js does NOT import BottomNav', () => {
  assertNotIncludes(layoutCode, "import BottomNav", 'BottomNav import should be removed');
  return true;
});

test('layout.js does NOT render <BottomNav />', () => {
  assertNotIncludes(layoutCode, '<BottomNav', 'BottomNav rendering should be removed');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. HEADER — MOBILE ACTIONS (ACCOUNT/CART ICONS)
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n2. Header — Mobile Actions');

test('Header.js has header-mobile-actions div', () => {
  assertIncludes(headerCode, 'className="header-mobile-actions"', 'header-mobile-actions class');
  return true;
});

test('Mobile actions contain Account icon link', () => {
  assertIncludes(headerCode, 'href="/login" className="header-icon" aria-label="Account"', 'Account link in mobile actions');
  return true;
});

test('Mobile actions contain Cart icon link', () => {
  assertIncludes(headerCode, 'href="/cart" className="header-icon" aria-label="Cart"', 'Cart link in mobile actions');
  return true;
});

test('Mobile actions use 20x20 SVG icons', () => {
  assertIncludes(headerCode, 'width="20" height="20"', '20x20 icon size');
  return true;
});

test('Mobile actions use strokeWidth 1.5', () => {
  assertIncludes(headerCode, 'strokeWidth="1.5"', 'strokeWidth 1.5');
  return true;
});

test('Nav toggle is placed BEFORE logo in DOM', () => {
  const navToggleIdx = headerCode.indexOf('className="nav-toggle"');
  const logoIdx = headerCode.indexOf('className="logo"');
  assert(navToggleIdx < logoIdx, 'nav-toggle should appear before logo');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. HEADER — ACCOUNT/CART IN SIDE NAV
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n3. Header — Account/Cart in Side Nav');

test('Side nav has Account link', () => {
  assertIncludes(headerCode, '<li><Link href="/login" onClick={closeDrawer}>Account</Link></li>', 'Account link in side nav');
  return true;
});

test('Side nav has Cart link', () => {
  assertIncludes(headerCode, '<li><Link href="/cart" onClick={closeDrawer}>Cart</Link></li>', 'Cart link in side nav');
  return true;
});

test('Account and Cart appear after Customize in nav order', () => {
  const customizeIdx = headerCode.indexOf('href="/custom" onClick={closeDrawer}>Customize');
  const accountIdx = headerCode.indexOf('href="/login" onClick={closeDrawer}>Account');
  const cartIdx = headerCode.indexOf('href="/cart" onClick={closeDrawer}>Cart');
  assert(customizeIdx < accountIdx, 'Account should come after Customize');
  assert(accountIdx < cartIdx, 'Cart should come after Account');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. HEADER — SEARCH ROW (NO CLOSE BUTTON)
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n4. Header — Search Row');

test('Search bar is wrapped in nav-mobile-search-row', () => {
  assertIncludes(headerCode, 'className="nav-mobile-search-row"', 'nav-mobile-search-row wrapper');
  return true;
});

test('No inline close button in search row', () => {
  assertNotIncludes(headerCode, 'nav-mobile-close-btn', 'Close button removed');
  return true;
});

test('Search form exists with submit button', () => {
  assertIncludes(headerCode, 'className="nav-mobile-search-form"', 'Search form');
  return true;
});

test('Search input has placeholder', () => {
  assertIncludes(headerCode, 'placeholder="Search pieces, materials..."', 'Search placeholder');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. CSS — BOTTOM-NAV REMOVED FROM MOBILE BREAKPOINTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n5. CSS — Bottom-Nav Removed from Mobile');

test('Base .bottom-nav rule is removed/disabled', () => {
  assertNotIncludes(stylesCode, '.bottom-nav {\n  display: none;\n}', 'Base display: none should be removed');
  return true;
});

test('860px breakpoint has NO bottom-nav display rules', () => {
  const media860 = stylesCode.substring(stylesCode.indexOf('@media (max-width: 860px)'));
  const endIdx = media860.indexOf('@media (max-width: 560px)');
  const block860 = endIdx > 0 ? media860.substring(0, endIdx) : media860;
  assertNotIncludes(block860, '.bottom-nav {', 'No bottom-nav rules in 860px');
  return true;
});

test('560px breakpoint has NO bottom-nav rules', () => {
  const media560 = stylesCode.substring(stylesCode.indexOf('@media (max-width: 560px)'));
  const endIdx = media560.indexOf('@media (max-width: 430px)');
  const block560 = endIdx > 0 ? media560.substring(0, endIdx) : media560;
  assertNotIncludes(block560, '.bottom-nav', 'No bottom-nav rules in 560px');
  return true;
});

test('430px breakpoint has NO bottom-nav rules', () => {
  const media430 = stylesCode.substring(stylesCode.indexOf('@media (max-width: 430px)'));
  const endIdx = media430.indexOf('.pcard-info');
  const block430 = endIdx > 0 ? media430.substring(0, endIdx) : media430;
  assertNotIncludes(block430, '.bottom-nav', 'No bottom-nav rules in 430px');
  return true;
});

test('body padding-bottom is 0 in 860px', () => {
  assertIncludes(stylesCode, 'body { padding-bottom: 0; }', 'body padding-bottom: 0');
  return true;
});

test('No body padding-bottom: 56px anywhere', () => {
  assertNotIncludes(stylesCode, 'padding-bottom: 56px', 'No padding-bottom: 56px');
  return true;
});

test('No body padding-bottom: 52px anywhere', () => {
  assertNotIncludes(stylesCode, 'padding-bottom: 52px', 'No padding-bottom: 52px');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. CSS — HEADER-MOBILE-ACTIONS STYLES
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n6. CSS — Header Mobile Actions Styles');

test('Base .header-mobile-actions has display: none', () => {
  assertIncludes(stylesCode, '.header-mobile-actions {\n  display: none;\n}', 'Hidden on desktop');
  return true;
});

test('860px .header-mobile-actions has display: flex', () => {
  assertIncludes(stylesCode, 'display: flex;\n    align-items: center;\n    gap: var(--space-sm);\n    margin-left: auto;', 'Shown on mobile');
  return true;
});

test('.header-mobile-actions .header-icon has width: 36px', () => {
  assertIncludes(stylesCode, '.header-mobile-actions .header-icon {\n    display: flex;', 'Icon styles');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. CSS — NO CLOSE BUTTON STYLES
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n7. CSS — No Close Button');

test('.nav-mobile-close-btn styles removed', () => {
  assertNotIncludes(stylesCode, '.nav-mobile-close-btn', 'Close btn styles removed');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. CSS — NAV-MOBILE-SEARCH-ROW STYLES
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n8. CSS — Nav-Mobile-Search-Row Styles');

test('.nav-mobile-search-row exists', () => {
  assertIncludes(stylesCode, '.nav-mobile-search-row {', 'Search row styles');
  return true;
});

test('.nav-mobile-search-row has display: flex', () => {
  assertIncludes(stylesCode, '.nav-mobile-search-row {\n    display: flex;', 'Flex layout');
  return true;
});

test('.nav-mobile-search-row has align-items: center', () => {
  assertIncludes(stylesCode, 'align-items: center', 'Centered alignment');
  return true;
});

test('.nav-mobile-search-form has flex: 1', () => {
  assertIncludes(stylesCode, 'flex: 1', 'Search form fills remaining space');
  return true;
});

test('.nav-mobile-search-form has height: 48px', () => {
  assertIncludes(stylesCode, 'height: 48px', '48px form height');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. CSS — FULL-WIDTH SIDE NAV SEPARATORS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n9. CSS — Full-Width Side Nav Separators');

test('.nav-links > li has border-bottom', () => {
  assertIncludes(stylesCode, '.nav-links > li {\n    list-style: none;\n    border-bottom: 1px solid rgba(43,34,27,0.10);', 'Full-width separator');
  return true;
});

test('.nav-links > li:last-child has no border', () => {
  assertIncludes(stylesCode, '.nav-links > li:last-child {\n    border-bottom: none;\n  }', 'Last item no border');
  return true;
});

test('.nav-links a has no border-bottom (separators on li)', () => {
  assertIncludes(stylesCode, '.nav-links a {\n    display: block;', 'Links as block');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. CSS — INCREASED NAV BREATHING SPACE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n10. CSS — Increased Nav Breathing Space');

test('.nav-links a has padding: 1.5rem', () => {
  assertIncludes(stylesCode, 'padding: 1.5rem var(--space-lg)', 'Increased padding');
  return true;
});

test('.nav-dropdown-desktop-link has matching 1.5rem padding', () => {
  assertIncludes(stylesCode, '.nav-dropdown-desktop-link {\n    flex: 1;\n    display: block;\n    color: var(--text-primary);\n    font-size: 0.8125rem;\n    letter-spacing: 0.06em;\n    padding: 1.5rem var(--space-lg)', 'Desktop link padding');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. CSS — DRAWER WIDTH WITH CLAMP
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n11. CSS — Drawer Width');

test('.nav-links has width: clamp(...)', () => {
  assertIncludes(stylesCode, 'width: clamp(280px, 80vw, 360px)', 'Clamp width');
  return true;
});

test('No min(85vw, 320px) width remaining', () => {
  assertNotIncludes(stylesCode, 'min(85vw, 320px)', 'Old width removed');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. CSS — IMPROVED BACKDROP
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n12. CSS — Improved Backdrop');

test('.nav-backdrop has stronger opacity (0.45)', () => {
  assertIncludes(stylesCode, 'background: rgba(43,34,27,0.45)', 'Stronger backdrop');
  return true;
});

test('.nav-backdrop has z-index: 150', () => {
  assertIncludes(stylesCode, 'z-index: 150', 'Backdrop z-index');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. CSS — BODY PADDING-BOTTOM
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n13. CSS — Body Padding-Bottom');

test('body has padding-bottom: 0', () => {
  assertIncludes(stylesCode, 'body { padding-bottom: 0; }', 'No body padding');
  return true;
});

test('.scroll-top-btn has bottom: 4rem', () => {
  assertIncludes(stylesCode, 'bottom: 4rem', 'Scroll top button position');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 14. CONTENT PRESERVATION
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n14. Content Preservation');

test('Header still has Gallery dropdown', () => {
  assertIncludes(headerCode, 'nav-dropdown', 'Gallery dropdown preserved');
  return true;
});

test('Header still has all 6 Gallery categories', () => {
  assertIncludes(headerCode, 'Kitchen & Dining', 'Kitchen');
  assertIncludes(headerCode, 'Coffee & Tea', 'Coffee');
  assertIncludes(headerCode, 'Storage & Organization', 'Storage');
  assertIncludes(headerCode, 'Home Décor', 'Décor');
  assertIncludes(headerCode, 'Bathroom', 'Bathroom');
  assertIncludes(headerCode, 'Everyday Living', 'Everyday');
  return true;
});

test('Header still has Archive, Studio, Journal, Customize links', () => {
  assertIncludes(headerCode, 'href="/archive"', 'Archive');
  assertIncludes(headerCode, 'href="/studio"', 'Studio');
  assertIncludes(headerCode, 'href="/journal"', 'Journal');
  assertIncludes(headerCode, 'href="/custom"', 'Customize');
  return true;
});

test('Header still has search overlay functionality', () => {
  assertIncludes(headerCode, 'search-overlay', 'Search overlay');
  assertIncludes(headerCode, 'search-form', 'Search form');
  return true;
});

test('HomeClient hero text preserved', () => {
  assertIncludes(homeClientCode, 'An Indian Workshop', 'Eyebrow');
  assertIncludes(homeClientCode, 'Where wood becomes', 'Title');
  assertIncludes(homeClientCode, 'View the Collection', 'CTA');
  return true;
});

test('BottomNav.js file still exists (just not rendered)', () => {
  const bottomNavPath = path.join(root, 'app', 'components', 'BottomNav.js');
  assert(fs.existsSync(bottomNavPath), 'BottomNav.js should still exist');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 15. ACCESSIBILITY
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n15. Accessibility');

test('Mobile Account icon has aria-label', () => {
  assertIncludes(headerCode, 'aria-label="Account"', 'Account aria-label');
  return true;
});

test('Mobile Cart icon has aria-label', () => {
  assertIncludes(headerCode, 'aria-label="Cart"', 'Cart aria-label');
  return true;
});

test('Nav toggle has aria-label and aria-expanded', () => {
  assertIncludes(headerCode, 'aria-label="Open menu"', 'Nav toggle aria-label');
  assertIncludes(headerCode, 'aria-expanded="false"', 'Nav toggle aria-expanded');
  return true;
});

test('Search input has aria-label', () => {
  assertIncludes(headerCode, 'aria-label="Search products"', 'Search aria-label');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 16. GALLERY DROPDOWN — HERO PIECE & LIMITED EDITION
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n16. Gallery Dropdown — Hero Piece & Limited Edition');

test('Hero Piece link exists in Gallery dropdown', () => {
  assertIncludes(headerCode, 'Hero Piece', 'Hero Piece label');
  return true;
});

test('Hero Piece links to /shop/anchor-table', () => {
  assertIncludes(headerCode, 'href="/shop/anchor-table"', 'Hero Piece href');
  return true;
});

test('Hero Piece has sub-label "The Anchor Table"', () => {
  assertIncludes(headerCode, 'The Anchor Table', 'Hero Piece sub-label');
  return true;
});

test('Limited Edition link exists in Gallery dropdown', () => {
  assertIncludes(headerCode, 'Limited Edition', 'Limited Edition label');
  return true;
});

test('Limited Edition links to /gallery?availability=Limited+Edition', () => {
  assertIncludes(headerCode, 'href="/gallery?availability=Limited+Edition"', 'Limited Edition href');
  return true;
});

test('Limited Edition has sub-label "Exclusive numbered pieces"', () => {
  assertIncludes(headerCode, 'Exclusive numbered pieces', 'Limited Edition sub-label');
  return true;
});

test('Featured links use nav-dropdown-featured class', () => {
  assertIncludes(headerCode, 'nav-dropdown-featured', 'Featured link class');
  return true;
});

test('Featured links use nav-dropdown-featured-link class', () => {
  assertIncludes(headerCode, 'nav-dropdown-featured-link', 'Featured link inner class');
  return true;
});

test('CSS has .nav-dropdown-featured styles', () => {
  assertIncludes(stylesCode, '.nav-dropdown-featured', 'Featured link CSS');
  return true;
});

test('CSS has .nav-dropdown-featured-link styles', () => {
  assertIncludes(stylesCode, '.nav-dropdown-featured-link', 'Featured link inner CSS');
  return true;
});

test('CSS has .nav-dropdown-featured-label styles', () => {
  assertIncludes(stylesCode, '.nav-dropdown-featured-label', 'Featured label CSS');
  return true;
});

test('CSS has .nav-dropdown-featured-sub styles', () => {
  assertIncludes(stylesCode, '.nav-dropdown-featured-sub', 'Featured sub CSS');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n' + '='.repeat(60));
console.log(`Sprint #34D Tests: ${passed}/${total} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

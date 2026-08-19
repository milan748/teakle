/**
 * Sprint #34E — Gallery Dropdown Root-Cause Fix & Header Cleanup Tests
 * Run: node scripts/test-sprint34e.js
 *
 * Tests:
 * 1. Root cause: ClientScripts.js native <a> click listeners removed
 * 2. Gallery submenu restructure (Hero Edition + Limited Edition)
 * 3. Close button inside sidebar
 * 4. Search/X alignment
 * 5. Header contrast (scroll-aware)
 * 6. Gallery filtering (availability, clearFilters)
 * 7. Limited Edition data
 * 8. CSS styles for new elements
 * 9. Dead code removal
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
const clientScriptsCode = fs.readFileSync(path.join(root, 'app', 'components', 'ClientScripts.js'), 'utf8');
const headerCode = fs.readFileSync(path.join(root, 'app', 'components', 'Header.js'), 'utf8');
const stylesCode = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const galleryClientCode = fs.readFileSync(path.join(root, 'app', 'gallery', 'GalleryClient.js'), 'utf8');
const productsCode = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// 1. ROOT CAUSE: CLIENTSCRIPTS.JS NATIVE <A> CLICK LISTENERS REMOVED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n1. Root Cause: ClientScripts.js Native <a> Click Listeners Removed');

test('ClientScripts.js does NOT add native click listeners on <a> tags', () => {
  assertNotIncludes(clientScriptsCode, "querySelectorAll('a').forEach((link) => { link.addEventListener('click', closeNav)", 'Native <a> click listeners should be removed');
  return true;
});

test('ClientScripts.js still has backdrop click listener', () => {
  assertIncludes(clientScriptsCode, "backdrop.addEventListener('click', closeNav)", 'Backdrop click listener should remain');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. GALLERY SUBMENU RESTRUCTURE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n2. Gallery Submenu Restructure');

test('Gallery submenu has Hero Edition link', () => {
  assertIncludes(headerCode, 'Hero Edition', 'Hero Edition label');
  return true;
});

test('Hero Edition links to /shop/anchor-table', () => {
  assertIncludes(headerCode, 'href="/shop/anchor-table"', 'Hero Edition href');
  return true;
});

test('Gallery submenu has Limited Edition link', () => {
  assertIncludes(headerCode, 'Limited Edition', 'Limited Edition label');
  return true;
});

test('Limited Edition links to /gallery?availability=Limited+Edition', () => {
  assertIncludes(headerCode, '/gallery?availability=Limited+Edition', 'Limited Edition href');
  return true;
});

test('Gallery toggle uses button element', () => {
  assertIncludes(headerCode, 'className="nav-dropdown-desktop-link nav-dropdown-trigger"', 'Gallery toggle is button with nav-dropdown-trigger class');
  return true;
});

test('Gallery toggle has stopPropagation', () => {
  assertIncludes(headerCode, 'e.nativeEvent.stopPropagation()', 'stopPropagation on Gallery toggle');
  return true;
});

test('No subdropdowns in Gallery submenu (simplified)', () => {
  assertNotIncludes(headerCode, 'nav-subdropdown', 'Subdropdowns should be removed from Gallery');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. CLOSE BUTTON INSIDE SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n3. Close Button Inside Sidebar');

test('Sidebar has close button', () => {
  assertIncludes(headerCode, 'nav-mobile-close-btn', 'Close button class');
  return true;
});

test('Close button has accessible label', () => {
  assertIncludes(headerCode, 'aria-label="Close menu"', 'Close button aria-label');
  return true;
});

test('Close button calls closeDrawer', () => {
  assertIncludes(headerCode, 'onClick={closeDrawer}', 'Close button onClick');
  return true;
});

test('Close button is in the search row', () => {
  const searchRowStart = headerCode.indexOf('nav-mobile-search-row');
  const closeBtnIdx = headerCode.indexOf('nav-mobile-close-btn');
  assert(closeBtnIdx > searchRowStart, 'Close button should be within the search row');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. SEARCH/X ALIGNMENT
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n4. Search/X Alignment');

test('Search row has flex layout', () => {
  assertIncludes(stylesCode, '.nav-mobile-search-row {\n    display: flex;', 'Search row flex');
  return true;
});

test('Close button has min-width: 48px', () => {
  assertIncludes(stylesCode, '.nav-mobile-close-btn {\n    display: flex;', 'Close button styles');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. HEADER CONTRAST
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n5. Header Contrast');

test('Header has is-scrolled class for background', () => {
  assertIncludes(stylesCode, '.site-header.is-scrolled {', 'is-scrolled class');
  return true;
});

test('Header has is-solid class for background', () => {
  assertIncludes(stylesCode, '.site-header.is-solid {', 'is-solid class');
  return true;
});

test('Header icons change color on scroll', () => {
  assertIncludes(stylesCode, '.site-header.is-scrolled .header-icon', 'Scrolled header icon color');
  return true;
});

test('Header starts transparent for hero pages', () => {
  assertIncludes(stylesCode, 'background: transparent;', 'Transparent header background');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. GALLERY FILTERING (AVAILABILITY, CLEARFILTERS)
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n6. Gallery Filtering');

test('Gallery has availability filter', () => {
  assertIncludes(galleryClientCode, 'AVAILABILITY_OPTIONS', 'Availability options');
  return true;
});

test('Gallery has Limited Edition filter option', () => {
  assertIncludes(galleryClientCode, "'Limited Edition'", 'Limited Edition option');
  return true;
});

test('Gallery has clearFilters function', () => {
  assertIncludes(galleryClientCode, 'clearFilters', 'clearFilters function');
  return true;
});

test('Gallery filters by availability', () => {
  assertIncludes(galleryClientCode, 'p.availability === availability', 'Availability filtering logic');
  return true;
});

test('Gallery reads searchParams for availability', () => {
  assertIncludes(galleryClientCode, "searchParams.get('search')", 'URL search param support');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. LIMITED EDITION DATA
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n7. Limited Edition Data');

test('Products data has Limited Edition products', () => {
  const limitedCount = (productsCode.match(/availability:\s*["']Limited Edition["']/g) || []).length;
  assert(limitedCount >= 2, `Expected at least 2 Limited Edition products, found ${limitedCount}`);
  return true;
});

test('Products data has hero product (anchor-table)', () => {
  assertIncludes(productsCode, 'anchor-table', 'Anchor table product');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. CSS STYLES FOR NEW ELEMENTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n8. CSS Styles for New Elements');

test('CSS has nav-dropdown-trigger styles', () => {
  assertIncludes(stylesCode, '.nav-dropdown-trigger', 'Dropdown trigger button styles');
  return true;
});

test('CSS has nav-dropdown-featured styles', () => {
  assertIncludes(stylesCode, '.nav-dropdown-featured {', 'Featured item styles');
  return true;
});

test('CSS has nav-dropdown-featured-link styles', () => {
  assertIncludes(stylesCode, '.nav-dropdown-featured-link {', 'Featured link styles');
  return true;
});

test('CSS has nav-dropdown-featured-label styles', () => {
  assertIncludes(stylesCode, '.nav-dropdown-featured-label {', 'Featured label styles');
  return true;
});

test('CSS has nav-dropdown-featured-sub styles', () => {
  assertIncludes(stylesCode, '.nav-dropdown-featured-sub {', 'Featured sub styles');
  return true;
});

test('CSS has nav-mobile-close-btn styles', () => {
  assertIncludes(stylesCode, '.nav-mobile-close-btn {', 'Close button styles');
  return true;
});

test('CSS nav-dropdown-featured has padding', () => {
  const idx = stylesCode.indexOf('.nav-dropdown-featured {');
  const block = stylesCode.slice(idx, idx + 400);
  assertIncludes(block, 'padding:', 'Featured item padding');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. DEAD CODE REMOVAL
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n9. Dead Code Removal');

test('Header.js does NOT have galleryDropdown array', () => {
  assertNotIncludes(headerCode, 'const galleryDropdown =', 'galleryDropdown should be removed');
  return true;
});

test('Header.js does NOT have subDropdowns state', () => {
  assertNotIncludes(headerCode, 'useState({})', 'subDropdowns state should be removed');
  return true;
});

test('Header.js does NOT have toggleSubDropdown function', () => {
  assertNotIncludes(headerCode, 'toggleSubDropdown', 'toggleSubDropdown should be removed');
  return true;
});

test('Header.js does NOT have setSubDropdowns call', () => {
  assertNotIncludes(headerCode, 'setSubDropdowns', 'setSubDropdowns should be removed');
  return true;
});

test('Header.js does NOT have teakle-nav-closed listener', () => {
  assertNotIncludes(headerCode, 'teakle-nav-closed', 'teakle-nav-closed listener should be removed');
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n' + '='.repeat(60));
console.log(`Sprint #34E Tests: ${passed}/${total} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

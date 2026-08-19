/**
 * Sprint #34F — Mobile Navigation & Gallery Functionality Fix Tests
 * Run: node scripts/test-sprint34f.js
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
function assertIncludes(h, n, l) { assert(h.includes(n), `Expected "${n}"${l ? ' ('+l+')' : ''}`); }
function assertNotIncludes(h, n, l) { assert(!h.includes(n), `Expected NOT "${n}"${l ? ' ('+l+')' : ''}`); }

const root = path.resolve(__dirname, '..');
const headerCode = fs.readFileSync(path.join(root, 'app', 'components', 'Header.js'), 'utf8');
const stylesCode = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const clientScriptsCode = fs.readFileSync(path.join(root, 'app', 'components', 'ClientScripts.js'), 'utf8');
const galleryCode = fs.readFileSync(path.join(root, 'app', 'gallery', 'GalleryClient.js'), 'utf8');
const productsCode = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8');
const layoutCode = fs.readFileSync(path.join(root, 'app', 'layout.js'), 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// 1. MOBILE GALLERY TOGGLE EXISTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n1. Mobile Gallery Toggle');

test('Header has nav-dropdown-mobile-trigger button', () => {
  assertIncludes(headerCode, 'nav-dropdown-mobile-trigger', 'Mobile trigger class');
});

test('Mobile trigger has aria-expanded', () => {
  assertIncludes(headerCode, 'className="nav-dropdown-mobile-trigger" aria-label="Toggle Gallery submenu" aria-expanded={galleryOpen}', 'Mobile trigger aria attrs');
});

test('Mobile trigger calls toggleGallery on click', () => {
  assertIncludes(headerCode, 'nav-dropdown-mobile-trigger', 'exists');
  const idx = headerCode.indexOf('nav-dropdown-mobile-trigger');
  const block = headerCode.slice(idx, idx + 300);
  assertIncludes(block, 'toggleGallery', 'toggleGallery called');
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. GALLERY TOGGLE USES REAL STATE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n2. Gallery Toggle Uses Real State');

test('Header has galleryOpen state', () => {
  assertIncludes(headerCode, 'const [galleryOpen, setGalleryOpen] = useState(false)', 'galleryOpen state');
});

test('Header has toggleGallery function', () => {
  assertIncludes(headerCode, 'function toggleGallery()', 'toggleGallery function');
});

test('toggleGallery toggles galleryOpen', () => {
  const idx = headerCode.indexOf('function toggleGallery()');
  const block = headerCode.slice(idx, idx + 100);
  assertIncludes(block, 'setGalleryOpen', 'setGalleryOpen call');
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. ARIA-EXPANDED IS IMPLEMENTED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n3. aria-expanded Implementation');

test('Mobile trigger has aria-expanded={galleryOpen}', () => {
  assertIncludes(headerCode, 'aria-expanded={galleryOpen}', 'aria-expanded on trigger');
});

test('Toggle button has aria-expanded={galleryOpen}', () => {
  const toggleIdx = headerCode.indexOf('nav-dropdown-toggle');
  const block = headerCode.slice(toggleIdx, toggleIdx + 300);
  assertIncludes(block, 'aria-expanded={galleryOpen}', 'aria-expanded on toggle');
});

test('Gallery li gets is-open class', () => {
  assertIncludes(headerCode, "nav-dropdown${galleryOpen ? ' is-open' : ''}", 'is-open class binding');
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. HERO EDITION EXISTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n4. Hero Edition');

test('Hero Edition link exists in Gallery dropdown', () => {
  assertIncludes(headerCode, 'Hero Edition', 'Hero Edition label');
});

test('Hero Edition links to /shop/anchor-table', () => {
  assertIncludes(headerCode, 'href="/shop/anchor-table"', 'Hero Edition route');
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. HERO EDITION USES EXISTING HERO PRODUCT ROUTE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n5. Hero Product Route Verification');

test('Products data has anchor-table product', () => {
  assertIncludes(productsCode, 'id: "anchor-table"', 'Anchor table product');
});

test('Products data marks anchor-table as isHero', () => {
  assertIncludes(productsCode, 'isHero: true', 'isHero flag');
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. LIMITED EDITION USES EXISTING PRODUCT DATA
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n6. Limited Edition Product Data');

test('Limited Edition link exists', () => {
  assertIncludes(headerCode, 'Limited Edition', 'Limited Edition label');
});

test('Limited Edition links to /gallery?availability=Limited+Edition', () => {
  assertIncludes(headerCode, '/gallery?availability=Limited+Edition', 'Limited Edition route');
});

test('Products data has Limited Edition products', () => {
  const count = (productsCode.match(/availability:\s*["']Limited Edition["']/g) || []).length;
  assert(count >= 2, `Expected >= 2, found ${count}`);
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. NO FAKE LIMITED EDITION DATA
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n7. No Fake Limited Edition Data');

test('Header.js does not create fake Limited Edition products', () => {
  assertNotIncludes(headerCode, 'limitedProducts', 'No fake limited products array');
});

test('Header.js does not invent inventory', () => {
  assertNotIncludes(headerCode, 'inventory:', 'No invented inventory');
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. CLEAR ALL FILTERS EXISTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n8. Clear All Filters');

test('Gallery has clearFilters function', () => {
  assertIncludes(galleryCode, 'const clearFilters = useCallback', 'clearFilters function');
});

test('Clear All Filters button exists', () => {
  assertIncludes(galleryCode, 'Clear All Filters', 'Clear All Filters text');
});

test('clearFilters resets availability to all', () => {
  const idx = galleryCode.indexOf('const clearFilters = useCallback');
  const block = galleryCode.slice(idx, idx + 300);
  assertIncludes(block, "setAvailability('all')", 'reset availability');
});

test('clearFilters resets price range', () => {
  const idx = galleryCode.indexOf('const clearFilters = useCallback');
  const block = galleryCode.slice(idx, idx + 300);
  assertIncludes(block, 'setPriceMin(PRICE_bounds.min)', 'reset price min');
  assertIncludes(block, 'setPriceMax(PRICE_bounds.max)', 'reset price max');
});

test('clearFilters resets category', () => {
  const idx = galleryCode.indexOf('const clearFilters = useCallback');
  const block = galleryCode.slice(idx, idx + 300);
  assertIncludes(block, "setActiveCategory('all')", 'reset category');
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. CLEAR ALL FILTERS CLEARS ACTIVE FILTERS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n9. Clear All Filters Reset Behavior');

test('clearFilters navigates to /gallery (clears URL params)', () => {
  const idx = galleryCode.indexOf('const clearFilters = useCallback');
  const block = galleryCode.slice(idx, idx + 400);
  assertIncludes(block, "router.push('/gallery')", 'navigate to clean gallery URL');
});

test('Gallery reads availability from URL params', () => {
  assertIncludes(galleryCode, "searchParams.get('availability')", 'reads availability param');
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. MOBILE X BUTTON EXISTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n10. Mobile X Button');

test('Sidebar has close button', () => {
  assertIncludes(headerCode, 'nav-mobile-close-btn', 'Close button class');
});

test('Close button has accessible label', () => {
  assertIncludes(headerCode, 'aria-label="Close menu"', 'Close button aria-label');
});

test('Close button calls closeDrawer', () => {
  const idx = headerCode.indexOf('nav-mobile-close-btn');
  const block = headerCode.slice(idx, idx + 200);
  assertIncludes(block, 'onClick={closeDrawer}', 'closeDrawer onClick');
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. X BUTTON CLOSES SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n11. X Button Closes Sidebar');

test('closeDrawer removes is-open from navLinks', () => {
  const idx = headerCode.indexOf('const closeDrawer = useCallback');
  const block = headerCode.slice(idx, idx + 400);
  assertIncludes(block, "navLinks.classList.remove('is-open')", 'removes is-open');
});

test('closeDrawer resets galleryOpen', () => {
  const idx = headerCode.indexOf('const closeDrawer = useCallback');
  const block = headerCode.slice(idx, idx + 600);
  assertIncludes(block, 'setGalleryOpen(false)', 'resets galleryOpen');
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. SEARCH/X LAYOUT
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n12. Search/X Layout');

test('Search row is flex container', () => {
  assertIncludes(stylesCode, '.nav-mobile-search-row {\n    display: flex;', 'search row flex');
});

test('Close button has min-width: 48px', () => {
  assertIncludes(stylesCode, '.nav-mobile-close-btn {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 48px;\n    height: 48px;\n    min-width: 48px;', 'close button dimensions');
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. MOBILE-ONLY HEADER STYLING
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n13. Mobile-Only Header Styling');

test('Mobile contrast fix is inside media query', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const heroIdx = stylesCode.indexOf('[data-page-has-hero] .site-header:not(.is-scrolled) .header-mobile-actions');
  assert(heroIdx > mqIdx, 'Hero page contrast should be inside mobile media query');
});

test('Mobile gallery menu display: block override is inside media query', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const displayIdx = stylesCode.indexOf('.nav-dropdown-menu {\n    display: block;', mqIdx);
  assert(displayIdx > mqIdx, 'display: block should be inside mobile media query');
});

test('Mobile nav-dropdown-desktop-link is display: none', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const block = stylesCode.slice(mqIdx, mqIdx + 15000);
  const dlIdx = block.indexOf('nav-dropdown-desktop-link');
  assert(dlIdx >= 0, 'desktop link found in mobile media query');
  const dlBlock = block.slice(dlIdx, dlIdx + 80);
  assertIncludes(dlBlock, 'display: none', 'display: none for desktop link');
});

test('Mobile nav-dropdown-mobile-trigger exists', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const block = stylesCode.slice(mqIdx, mqIdx + 15000);
  const mtIdx = block.indexOf('.nav-dropdown-mobile-trigger {');
  assert(mtIdx >= 0, 'mobile trigger styles block found in mobile media query');
  const mtBlock = block.slice(mtIdx, mtIdx + 200);
  assertIncludes(mtBlock, 'display: flex', 'display: flex for mobile trigger');
});

// ═══════════════════════════════════════════════════════════════════════════
// 14. DESKTOP STYLING NOT GLOBALLY OVERRIDDEN
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n14. Desktop Styling Preserved');

test('Desktop nav-dropdown-desktop-link is display: inline', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const beforeMq = stylesCode.slice(0, mqIdx);
  assertIncludes(beforeMq, '.nav-dropdown-desktop-link { display: inline; }', 'desktop link inline');
});

test('Desktop nav-dropdown-mobile-trigger is display: none', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const beforeMq = stylesCode.slice(0, mqIdx);
  assertIncludes(beforeMq, '.nav-dropdown-mobile-trigger { display: none; }', 'desktop hide mobile trigger');
});

test('Desktop nav-dropdown-menu is display: none', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const beforeMq = stylesCode.slice(0, mqIdx);
  assertIncludes(beforeMq, '.nav-dropdown-menu,\n.nav-subdropdown-toggle,\n.nav-subdropdown-menu,\n.nav-dropdown-mobile-trigger { display: none; }', 'desktop hide dropdown menu');
});

// ═══════════════════════════════════════════════════════════════════════════
// 15. DESKTOP GALLERY FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n15. Desktop Gallery Functionality');

test('Desktop Gallery is a Link (navigates to /gallery)', () => {
  assertIncludes(headerCode, 'href="/gallery" className="nav-dropdown-desktop-link"', 'Desktop gallery is Link');
});

test('Desktop Gallery Link has closeDrawer onClick', () => {
  const idx = headerCode.indexOf('nav-dropdown-desktop-link');
  const block = headerCode.slice(idx, idx + 200);
  assertIncludes(block, 'onClick={closeDrawer}', 'closeDrawer on desktop link');
});

// ═══════════════════════════════════════════════════════════════════════════
// 16. SIDEBAR SEPARATORS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n16. Sidebar Separators');

test('Nav items have border-bottom separators', () => {
  assertIncludes(stylesCode, '.nav-links > li {\n    list-style: none;\n    border-bottom: 1px solid rgba(43,34,27,0.10);', 'border-bottom separator');
});

test('Last nav item has no separator', () => {
  assertIncludes(stylesCode, 'border-bottom: none', 'last item no border');
});

// ═══════════════════════════════════════════════════════════════════════════
// 17. SIDEBAR SPACING
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n17. Sidebar Spacing');

test('Nav links have generous padding', () => {
  assertIncludes(stylesCode, 'padding: 1.5rem var(--space-lg)', '1.5rem vertical padding');
});

test('Sidebar has breathing room (width clamp)', () => {
  assertIncludes(stylesCode, 'width: clamp(280px, 80vw, 360px)', 'sidebar width clamp');
});

// ═══════════════════════════════════════════════════════════════════════════
// 18. ACCOUNT/CART NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n18. Account/Cart Navigation');

test('Sidebar has Account link', () => {
  assertIncludes(headerCode, 'href="/login" onClick={closeDrawer}>Account', 'Account link');
});

test('Sidebar has Cart link', () => {
  assertIncludes(headerCode, 'href="/cart" onClick={closeDrawer}>Cart', 'Cart link');
});

test('Mobile header has Account icon', () => {
  assertIncludes(headerCode, 'href="/login" className="header-icon" aria-label="Account"', 'Mobile account icon');
});

test('Mobile header has Cart icon', () => {
  assertIncludes(headerCode, 'href="/cart" className="header-icon" aria-label="Cart"', 'Mobile cart icon');
});

// ═══════════════════════════════════════════════════════════════════════════
// 19. EXISTING CONTENT PRESERVED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n19. Existing Content Preserved');

test('Layout still imports Header, Footer, ClientScripts', () => {
  assertIncludes(layoutCode, "import Header from './components/Header'", 'Header import');
  assertIncludes(layoutCode, "import Footer from './components/Footer'", 'Footer import');
  assertIncludes(layoutCode, "import ClientScripts from './components/ClientScripts'", 'ClientScripts import');
});

test('ClientScripts still dispatches teakle-nav-closed', () => {
  assertIncludes(clientScriptsCode, "window.dispatchEvent(new CustomEvent('teakle-nav-closed'))", 'teakle-nav-closed dispatch');
});

test('Header listens for teakle-nav-closed', () => {
  assertIncludes(headerCode, "window.addEventListener('teakle-nav-closed', onNavClosed)", 'teakle-nav-closed listener');
});

test('Backdrop click listener still exists', () => {
  assertIncludes(clientScriptsCode, "backdrop.addEventListener('click', closeNav)", 'backdrop listener');
});

test('No native <a> click listeners in ClientScripts', () => {
  assertNotIncludes(clientScriptsCode, "querySelectorAll('a').forEach", 'no native a listeners');
});

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n' + '='.repeat(60));
console.log(`Sprint #34F Tests: ${passed}/${total} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

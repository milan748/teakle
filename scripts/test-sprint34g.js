/**
 * Sprint #34G — Mobile Navigation & Gallery Polish Tests
 * Run: node scripts/test-sprint34g.js
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
const galleryCode = fs.readFileSync(path.join(root, 'app', 'gallery', 'GalleryClient.js'), 'utf8');
const productsCode = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8');
const layoutCode = fs.readFileSync(path.join(root, 'app', 'layout.js'), 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// 1. EXACTLY ONE GALLERY LABEL/CONTROL
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n1. Exactly One Gallery Label/Control');

test('Header has nav-dropdown-desktop-link (desktop)', () => {
  assertIncludes(headerCode, 'nav-dropdown-desktop-link', 'Desktop link class');
});

test('Header has nav-dropdown-mobile-link (mobile)', () => {
  assertIncludes(headerCode, 'nav-dropdown-mobile-link', 'Mobile link class');
});

test('Desktop link contains Gallery text', () => {
  const idx = headerCode.indexOf('nav-dropdown-desktop-link');
  const block = headerCode.slice(idx, idx + 200);
  assertIncludes(block, '>Gallery</Link>', 'Desktop Gallery text');
});

test('Mobile link contains Gallery text', () => {
  const idx = headerCode.indexOf('nav-dropdown-mobile-link');
  const block = headerCode.slice(idx, idx + 300);
  assertIncludes(block, 'Gallery', 'Mobile Gallery text');
});

test('No nav-dropdown-mobile-trigger (old duplicate removed)', () => {
  assertNotIncludes(headerCode, 'nav-dropdown-mobile-trigger', 'Old trigger removed');
});

test('No nav-dropdown-trigger class (old trigger removed)', () => {
  assertNotIncludes(headerCode, 'nav-dropdown-trigger', 'Old trigger class removed');
});

test('CSS hides mobile link on desktop', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const beforeMq = stylesCode.slice(0, mqIdx);
  assertIncludes(beforeMq, '.nav-dropdown-mobile-link { display: none; }', 'desktop hide mobile link');
});

test('CSS shows desktop link on mobile', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const block = stylesCode.slice(mqIdx, mqIdx + 15000);
  assertIncludes(block, 'nav-dropdown-desktop-link', 'desktop link in mobile media query');
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. NO DUPLICATE GALLERY TRIGGER
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n2. No Duplicate Gallery Trigger');

test('No duplicate Gallery buttons (only desktop link + mobile link + chevron)', () => {
  const desktopCount = (headerCode.match(/nav-dropdown-desktop-link/g) || []).length;
  const mobileCount = (headerCode.match(/nav-dropdown-mobile-link/g) || []).length;
  assert(desktopCount === 1, `Expected 1 desktop link, found ${desktopCount}`);
  assert(mobileCount === 1, `Expected 1 mobile link, found ${mobileCount}`);
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. HERO EDITION SUBMENU EXISTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n3. Hero Edition Submenu');

test('Hero Edition link exists in dropdown', () => {
  assertIncludes(headerCode, 'Hero Edition', 'Hero Edition label');
});

test('Hero Edition links to /shop/anchor-table', () => {
  assertIncludes(headerCode, 'href="/shop/anchor-table"', 'Hero Edition route');
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. LIMITED EDITION SUBMENU EXISTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n4. Limited Edition Submenu');

test('Limited Edition link exists in dropdown', () => {
  assertIncludes(headerCode, 'Limited Edition', 'Limited Edition label');
});

test('Limited Edition links to /gallery?availability=Limited+Edition', () => {
  assertIncludes(headerCode, '/gallery?availability=Limited+Edition', 'Limited Edition route');
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. ANCHOR TABLE DESCRIPTIVE TEXT REMOVED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n5. Anchor Table Descriptive Text Removed');

test('No "The Anchor Table" sub-text in Gallery dropdown', () => {
  const idx = headerCode.indexOf('Hero Edition');
  const block = headerCode.slice(idx, idx + 300);
  assertNotIncludes(block, 'The Anchor Table', 'Anchor Table sub-text removed');
});

test('No nav-dropdown-featured-sub class in Gallery dropdown', () => {
  const idx = headerCode.indexOf('nav-dropdown-featured');
  const block = headerCode.slice(idx, idx + 800);
  assertNotIncludes(block, 'nav-dropdown-featured-sub', 'Featured sub class removed');
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. EXCLUSIVE NUMBERED PIECES DESCRIPTIVE TEXT REMOVED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n6. Exclusive Numbered Pieces Text Removed');

test('No "Exclusive numbered pieces" sub-text in Gallery dropdown', () => {
  const idx = headerCode.indexOf('Limited Edition');
  const block = headerCode.slice(idx, idx + 300);
  assertNotIncludes(block, 'Exclusive numbered pieces', 'Exclusive text removed');
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. EXISTING HERO EDITION ROUTE PRESERVED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n7. Hero Edition Route Preserved');

test('Products data has anchor-table product', () => {
  assertIncludes(productsCode, 'id: "anchor-table"', 'Anchor table product');
});

test('Products data has isHero flag', () => {
  assertIncludes(productsCode, 'isHero: true', 'isHero flag');
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. EXISTING LIMITED EDITION FILTER PRESERVED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n8. Limited Edition Filter Preserved');

test('Products data has Limited Edition products', () => {
  const count = (productsCode.match(/availability:\s*["']Limited Edition["']/g) || []).length;
  assert(count >= 2, `Expected >= 2, found ${count}`);
});

test('GalleryClient reads availability from URL', () => {
  assertIncludes(galleryCode, "searchParams.get('availability')", 'reads availability param');
});

test('GalleryClient filters by availability', () => {
  assertIncludes(galleryCode, 'p.availability === availability', 'availability filter');
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. SHOW ALL PRODUCTS EXISTS
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n9. Show All Products');

test('Gallery has "Show all products" button for filtered views', () => {
  assertIncludes(galleryCode, 'Show all products', 'Show all products text');
});

test('Gallery has gal-search-reset-btn class for the button', () => {
  assertIncludes(galleryCode, 'gal-search-reset-btn', 'Reset button class');
});

test('Show all products button calls clearFilters or navigates to /gallery', () => {
  const filteredIdx = galleryCode.indexOf('Filtered results');
  const block = galleryCode.slice(filteredIdx, filteredIdx + 500);
  const hasClear = block.includes('clearFilters');
  const hasPush = block.includes("router.push('/gallery')");
  assert(hasClear || hasPush, 'Button clears filters or navigates to gallery');
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. LIMITED EDITION FILTER CAN BE CLEARED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n10. Limited Edition Filter Can Be Cleared');

test('clearFilters resets availability to all', () => {
  const idx = galleryCode.indexOf('const clearFilters = useCallback');
  const block = galleryCode.slice(idx, idx + 300);
  assertIncludes(block, "setAvailability('all')", 'reset availability');
});

test('clearFilters navigates to /gallery (clears URL)', () => {
  const idx = galleryCode.indexOf('const clearFilters = useCallback');
  const block = galleryCode.slice(idx, idx + 300);
  assertIncludes(block, "router.push('/gallery')", 'navigate clean URL');
});

test('Has active filters banner for non-search filtered views', () => {
  assertIncludes(galleryCode, 'hasActiveFilters && !searchQuery', 'filtered view banner');
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. SEARCH FILTER BEHAVIOR PRESERVED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n11. Search Filter Behavior Preserved');

test('Search flow has "Show all products" button', () => {
  const idx = galleryCode.indexOf('Search results for');
  assert(idx >= 0, 'Search results banner found');
  const block = galleryCode.slice(idx, idx + 800);
  assertIncludes(block, 'Show all products', 'Search show all products');
});

test('Search flow navigates to /gallery on reset', () => {
  const idx = galleryCode.indexOf('Search results for');
  assert(idx >= 0, 'Search results banner found');
  const block = galleryCode.slice(idx, idx + 800);
  assertIncludes(block, "router.push('/gallery')", 'Search reset navigation');
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. SEARCH SHOW ALL PRODUCTS BEHAVIOR PRESERVED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n12. Search Show All Products Preserved');

test('Search results banner exists with query display', () => {
  assertIncludes(galleryCode, 'gal-search-banner-query', 'Search query display');
});

test('Search results show piece count', () => {
  assertIncludes(galleryCode, 'gal-search-banner-count', 'Search result count');
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. MOBILE HEADER/LOGO STATE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n13. Mobile Header/Logo State');

test('Logo switches between white and black based on scroll', () => {
  assertIncludes(headerCode, '/assets/logo-white.webp', 'White logo for hero pages');
  assertIncludes(headerCode, '/assets/logo-black.webp', 'Black logo for scrolled/non-hero');
});

test('Logo src toggled by hasHero condition', () => {
  const idx = headerCode.indexOf('logo-white.webp');
  assert(idx >= 0, 'White logo path found');
  const block = headerCode.slice(idx - 200, idx + 200);
  assertIncludes(block, 'logo-black.webp', 'Black logo for scrolled');
  assertIncludes(block, 'hasHero', 'Only switches on hero pages');
});

// ═══════════════════════════════════════════════════════════════════════════
// 14. LOGO USES HEADER COLOUR STATE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n14. Logo Uses Header Colour State');

test('CSS has is-scrolled logo color change', () => {
  assertIncludes(stylesCode, '.site-header.is-scrolled .logo', 'Scrolled logo style');
});

test('CSS has is-solid logo color change', () => {
  assertIncludes(stylesCode, '.site-header.is-solid .logo', 'Solid logo style');
});

// ═══════════════════════════════════════════════════════════════════════════
// 15. ICONS USE COMPATIBLE STATE
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n15. Icons Use Compatible State');

test('Mobile icons default to dark (var(--text-primary))', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const block = stylesCode.slice(mqIdx, mqIdx + 15000);
  const idx = block.indexOf('.header-mobile-actions .header-icon');
  assert(idx >= 0, 'Mobile icon styles found in media query');
  const styleBlock = block.slice(idx, idx + 300);
  assertIncludes(styleBlock, 'color: var(--text-primary)', 'Mobile icon default dark');
});

test('Hero pages icons light when not scrolled', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const block = stylesCode.slice(mqIdx, mqIdx + 15000);
  assertIncludes(block, 'data-page-has-hero', 'Hero page state selector');
  assertIncludes(block, 'header-mobile-actions .header-icon', 'Hero page light icons');
});

test('Hero pages hamburger light when not scrolled', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const block = stylesCode.slice(mqIdx, mqIdx + 15000);
  assertIncludes(block, 'data-page-has-hero', 'Hero page state selector');
  assertIncludes(block, 'nav-toggle span', 'Hero page light hamburger');
});

test('Scrolled header icons dark', () => {
  assertIncludes(stylesCode, '.site-header.is-scrolled .header-icon', 'Scrolled icons dark');
});

test('Solid header icons dark', () => {
  assertIncludes(stylesCode, '.site-header.is-solid .header-icon', 'Solid icons dark');
});

// ═══════════════════════════════════════════════════════════════════════════
// 16. DESKTOP VISUAL STYLES NOT GLOBALLY OVERRIDDEN
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n16. Desktop Visual Styles Preserved');

test('Desktop nav-dropdown-desktop-link is display: inline', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const beforeMq = stylesCode.slice(0, mqIdx);
  assertIncludes(beforeMq, '.nav-dropdown-desktop-link { display: inline; }', 'desktop link inline');
});

test('Desktop nav-dropdown-mobile-link is display: none', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const beforeMq = stylesCode.slice(0, mqIdx);
  assertIncludes(beforeMq, '.nav-dropdown-mobile-link { display: none; }', 'desktop hide mobile link');
});

test('Desktop nav-dropdown-menu is display: none', () => {
  const mqIdx = stylesCode.indexOf('@media (max-width: 860px)');
  const beforeMq = stylesCode.slice(0, mqIdx);
  assertIncludes(beforeMq, '.nav-dropdown-menu', 'desktop hide dropdown menu');
});

// ═══════════════════════════════════════════════════════════════════════════
// 17. EXISTING CONTENT PRESERVED
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n17. Existing Content Preserved');

test('Layout still imports Header, Footer, ClientScripts', () => {
  assertIncludes(layoutCode, "import Header from './components/Header'", 'Header import');
  assertIncludes(layoutCode, "import Footer from './components/Footer'", 'Footer import');
  assertIncludes(layoutCode, "import ClientScripts from './components/ClientScripts'", 'ClientScripts import');
});

test('Gallery still has category pills', () => {
  assertIncludes(galleryCode, 'gal-cat-pill', 'Category pills');
});

test('Gallery still has price filter', () => {
  assertIncludes(galleryCode, 'gal-filter-toggle', 'Filter toggle');
});

test('Gallery still has sort select', () => {
  assertIncludes(galleryCode, 'gal-sort-select', 'Sort select');
});

test('Gallery still has Clear All Filters button', () => {
  assertIncludes(galleryCode, 'Clear All Filters', 'Clear All Filters');
});

test('Sidebar still has Account link', () => {
  assertIncludes(headerCode, 'href="/login" onClick={closeDrawer}>Account', 'Account link');
});

test('Sidebar still has Cart link', () => {
  assertIncludes(headerCode, 'href="/cart" onClick={closeDrawer}>Cart', 'Cart link');
});

test('Sidebar still has Archive, Studio, Journal, Customize', () => {
  assertIncludes(headerCode, 'href="/archive"', 'Archive link');
  assertIncludes(headerCode, 'href="/studio"', 'Studio link');
  assertIncludes(headerCode, 'href="/journal"', 'Journal link');
  assertIncludes(headerCode, 'href="/custom"', 'Customize link');
});

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n' + '='.repeat(60));
console.log(`Sprint #34G Tests: ${passed}/${total} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

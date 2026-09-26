/* T15 — Accessibility and interaction quality pass.
   Static assertions: accessible names, keyboard/focus, alt text, no visual regression. */
const assert = require('assert')
const fs = require('fs')
const path = require('path')

let passed = 0
let failed = 0

function test(name, ok, detail) {
  if (ok) { console.log(`  PASS: ${name}`); passed++ }
  else { console.log(`  FAIL: ${name} ${detail || ''}`); failed++ }
}

const header = fs.readFileSync(path.join(__dirname, '..', 'app', 'components', 'Header.js'), 'utf8')
const footer = fs.readFileSync(path.join(__dirname, '..', 'app', 'components', 'Footer.js'), 'utf8')
const bottom = fs.readFileSync(path.join(__dirname, '..', 'app', 'components', 'BottomNav.js'), 'utf8')
const home = fs.readFileSync(path.join(__dirname, '..', 'app', 'HomeClient.js'), 'utf8')
const card = fs.readFileSync(path.join(__dirname, '..', 'app', 'components', 'ProductCard.js'), 'utf8')
const scroll = fs.readFileSync(path.join(__dirname, '..', 'app', 'components', 'ScrollTopBtn.js'), 'utf8')
const global = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8')
const gallery = fs.readFileSync(path.join(__dirname, '..', 'app', 'gallery', 'GalleryClient.js'), 'utf8')

console.log('=== T15: navigation controls have clear accessible names ===')
{
  test('header logo links home with accessible name',
    header.includes('href="/"') && header.includes('aria-label="Teakle home"') && header.includes('className="logo"'))
  test('footer logo links home with accessible name',
    footer.includes('href="/"') && footer.includes('aria-label="Teakle home"'))
  test('footer contact email has specific label', footer.includes('aria-label="Email Teakle"'))
  test('bottom nav has mobile navigation label', bottom.includes('aria-label="Mobile navigation"'))
  test('bottom nav active links expose aria-current',
    bottom.includes("aria-current={isActive('/')") && bottom.includes("aria-current={isActive('/gallery')"))
  test('carousel controls have specific labels',
    home.includes('aria-label="Previous collection items"') && home.includes('aria-label="Next collection items"'))
  test('carousel section has accessible name', home.includes('aria-label="Featured collections"'))
  test('scroll-top button has accessible name', scroll.includes('aria-label="Scroll to top"'))
  test('wishlist button has product-specific label', card.includes('to wishlist'))
}

console.log('\n=== T15: keyboard navigation is usable ===')
{
  test('search hint pills are keyboard operable (onClick present)',
    header.includes('search-hint-pill') && header.includes('onClick={() => { setSearchQuery(term);'))
  test('gallery pills expose pressed state', gallery.includes('aria-pressed={activeCategory'))
  test('gallery filter toggle exposes expanded state', gallery.includes('aria-expanded={filtersOpen}'))
  test('gallery sort has label', gallery.includes('aria-label="Sort products"'))
  test('bottom sheet exposes dialog semantics',
    bottom.includes('role="dialog"') && bottom.includes('aria-modal="true"') && bottom.includes('aria-label="Account menu"'))
  test('bottom sheet trigger exposes expanded/haspopup',
    bottom.includes('aria-expanded={sheetOpen}') && bottom.includes('aria-haspopup="dialog"'))
  test('hidden scroll-top button leaves tab order', scroll.includes('tabIndex={visible ? 0 : -1}'))
  test('hidden bottom sheet is inert', bottom.includes('inert={!sheetOpen}'))
}

console.log('\n=== T15: focus states are visible ===')
{
  test('global fallback covers logo, bottom nav, footer social, sheet, search, cards',
    global.includes('a.logo:focus-visible') && global.includes('.bottom-nav-link:focus-visible') &&
    global.includes('.footer-social a:focus-visible') && global.includes('.v2-citem:focus-visible'))
  test('gallery pills and controls have focus styles',
    gallery.includes('.gal-cat-pill:focus-visible') && gallery.includes('.gal-sort-select:focus-visible'))
  test('carousel controls keep dedicated focus style', fs.readFileSync(path.join(__dirname, '..', 'app', 'homepage.css'), 'utf8').includes('.v2-cprev:focus-visible'))
  test('skip link keeps visible focus style', global.includes('.skip-link:focus'))
}

console.log('\n=== T15: images and decorative icons ===')
{
  test('signature image alt uses existing context without invented furniture type',
    home.includes("handcrafted solid teak") && !home.includes('handcrafted teak dining table'))
  test('carousel dots are hidden from assistive tech', home.includes('v2-cdots" aria-hidden="true"'))
  test('header decorative icons are hidden', header.includes('aria-hidden="true"><circle cx="11"'))
  test('trust icons are hidden', home.includes('TRUST_ICONS') && (home.match(/aria-hidden="true"><path d="M12 22s8-4/g) || []).length >= 1)
  test('product card hover image stays decorative', card.includes('className="pcard-hover-img"') && card.includes('alt=""'))
  test('product card icon is hidden (button already named)', card.includes('aria-hidden="true"'))
}

console.log('\n=== T15: no visual regression (functionality preserved) ===')
{
  test('product grids still rendered', home.includes('className="pgrid"'))
  test('horizontal carousel still rendered', home.includes('className="v2-ctrack"'))
  test('wishlist control preserved', card.includes('pcard-wishlist'))
  test('Instrument Sans still the typeface (no new fonts)',
    !/font-family:\s*['"]?(Georgia|Serif|Comic|Papyrus)/i.test(global + home))
  test('no SaaS/card-heavy UI introduced', !home.includes('dashboard') && !home.includes('glassmorphism'))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)

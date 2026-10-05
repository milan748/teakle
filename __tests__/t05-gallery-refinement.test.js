/**
 * T05 — Refine Gallery product presentation.
 *
 * Verifies (source-level):
 *  1. No repeated "Solid Teak" material label is rendered on /gallery
 *     (GalleryClient no longer passes showMeta; no replacement label).
 *  2. Product data is untouched — material info remains for product pages.
 *  3. Editorial grid: wide full-width measure, 3-col desktop, intentional
 *     2-col mobile, no card chrome, no horizontal overflow, Instrument Sans only.
 *  4. Commerce preserved: product links, wishlist, add-to-cart surface,
 *     prices, category filtering, sort, responsive behavior.
 *
 * Run: node __tests__/t05-gallery-refinement.test.js
 */
const fs = require('fs')
const path = require('path')

let passed = 0
let failed = 0
function test(name, ok, detail) {
  if (ok) { console.log(`  PASS: ${name}`); passed++ }
  else { console.log(`  FAIL: ${name} ${detail || ''}`); failed++ }
}

const root = path.join(__dirname, '..')
const gallery = fs.readFileSync(path.join(root, 'app', 'gallery', 'GalleryClient.js'), 'utf8')
const card = fs.readFileSync(path.join(root, 'app', 'components', 'ProductCard.js'), 'utf8')
const productsSrc = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8')

console.log('=== 1. "Solid Teak" removed from Gallery presentation ===')
{
  test('GalleryClient never passes showMeta', !/showMeta/.test(gallery))
  test('no "Solid Teak" literal in GalleryClient', !gallery.includes('Solid Teak'))
  test('no material label rendered in gallery grid', !/product\.material/.test(gallery))
  test('no replacement material label invented', !/metaText/.test(gallery))
  test('ProductCard keeps opt-in showMeta default (product pages unaffected)',
    /showMeta = false/.test(card))
}

console.log('\n=== 2. Product data untouched ===')
{
  test('material field retained in dataset', productsSrc.includes('material: "Solid Teak"'))
  test('no product images replaced with placeholders',
    !/placeholder|via\.placeholder|lorempixel/i.test(productsSrc))
  test('product images still served from established source',
    productsSrc.includes('images.pexels.com'))
}

console.log('\n=== 3. Editorial grid CSS ===')
{
  test('wide full-width measure defined', /--gal-max:\s*min\(1520px/.test(gallery))
  test('grid uses the wide measure', /\.gal-grid\s*\{[^}]*max-width:\s*var\(--gal-max\)/.test(gallery))
  test('desktop three-column grid', /\.gal-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/.test(gallery))
  test('generous breathing room (clamp gap)', /\.gal-grid\s*\{[^}]*gap:\s*clamp\(/.test(gallery))
  test('heading / controls / collection separated (hairlines)',
    /\.gal-cat-nav\s*\{[^}]*border-bottom:/.test(gallery) && /\.gal-toolbar\s*\{[^}]*border-bottom:/.test(gallery))
  test('no card chrome in gallery (no border/shadow on imagery)',
    /\.gal-grid \.pcard-img\s*\{[^}]*border:\s*none/.test(gallery) && /\.gal-grid \.pcard-img\s*\{[^}]*box-shadow:\s*none/.test(gallery))
  test('no horizontal overflow guard', /\.gal-page\s*\{[^}]*overflow-x:\s*clip/.test(gallery))
  test('mobile recomposes to two readable columns',
    /max-width:\s*860px[\s\S]*?\.gal-grid\s*\{[^}]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/.test(gallery))
  test('mobile name/price type stays readable',
    /\.gal-grid \.pcard-info h3\s*\{\s*font-size:\s*1rem/.test(gallery))
  test('no badges/shadows/gradients added in gallery styles',
    !/\.gal-[^{]*\{[^}]*box-shadow:\s*0\s+\d+px/.test(gallery) && !/\.gal-grid[\s\S]{0,400}?linear-gradient/.test(gallery))
  test('no new typeface', !/font-family:\s*[^;]*(serif|Georgia|Playfair|script|cursive)/i.test(gallery))
}

console.log('\n=== 4. Commerce + filtering preserved ===')
{
  test('renders shared ProductCard', gallery.includes('<ProductCard'))
  test('product links preserved (ProductCard href /shop/:id)', card.includes('/shop/${product.id}'))
  test('wishlist control preserved', gallery.includes('ProductCard') && card.includes('toggleWishlist'))
  test('price rendered', card.includes('priceFormatted'))
  test('product name rendered', card.includes('<h3>{product.name}</h3>'))
  test('category pills preserved', gallery.includes('gal-cat-pill') && gallery.includes("setActiveCategory"))
  test('all existing categories preserved',
    // Production catalogue taxonomy (Teakle_Product_Catalogue_White_15_Products.pdf):
    // the six temporary demo categories were intentionally replaced by the
    // five first-production categories. PANTHÈRE (Atelier) has no Gallery listing.
    ['flower-vases', 'fruit-bowls', 'chopping-boards', 'serving-trays', 'coasters']
      .every((k) => gallery.includes(`key: '${k}'`)))
  test('sort control preserved', gallery.includes('gal-sort-select'))
  test('price + availability filters preserved', gallery.includes('PRICE_bounds') && gallery.includes('gal-availability'))
  test('no invented categories', !/key: 'new-|key: "new-/i.test(gallery))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

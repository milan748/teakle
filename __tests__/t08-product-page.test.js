/**
 * T08 — Refine Product Page Conversion Experience.
 *
 * Guards the SEE → INSPECT → MATERIAL → CRAFT → VALUE → OWN flow while
 * preserving all existing commerce functionality:
 *   - gallery shows every authentic image (never truncated by a stale
 *     browser-data merge); thumbnail selection, counter, prev/next, no autoplay
 *   - hierarchy: category eyebrow → h1 name → short desc → material metadata
 *     → price/availability → Add to Cart → wishlist → share
 *   - story/value rendered only from authentic fields (story, craftsmanship,
 *     materials); no invented claims
 *   - WATCH THE PROCESS links to the real process route when one exists
 *   - share uses native share + clipboard fallback and never throws
 *   - commerce preserved: Add to Cart, qty, wishlist, price, related products
 *   - Instrument Sans only; mobile sticky CTA + responsive rules intact
 *
 * Run: node __tests__/t08-product-page.test.js
 * Exit code is non-zero on any failure.
 */
const assert = require('assert')
const fs = require('fs')
const path = require('path')

let passed = 0
let failed = 0

function test(name, ok, detail) {
  if (ok) { console.log(`  PASS: ${name}`); passed++ }
  else { console.log(`  FAIL: ${name} ${detail || ''}`); failed++ }
}

const root = path.join(__dirname, '..')
const client = fs.readFileSync(path.join(root, 'app', 'shop', '[id]', 'ShopDetailClient.js'), 'utf8')
const page = fs.readFileSync(path.join(root, 'app', 'shop', '[id]', 'page.js'), 'utf8')
const serverData = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8')
const browserData = fs.readFileSync(path.join(root, 'public', 'products-browser.js'), 'utf8')

// Extract PRODUCTS from the server module without executing imports.
const serverMatch = serverData.match(/export\s+const\s+PRODUCTS\s*=\s*(\[[\s\S]*?\]);\s*\n\s*export/)
const serverProducts = eval(serverMatch[1])
const browserMatch = browserData.match(/var TEAKLE_PRODUCTS = ([\s\S]*?);\s*$/)
const browserProducts = eval(browserMatch[1])
const byId = (list, id) => list.find((p) => p.id === id)

console.log('=== 1. Authentic media intact (server source of truth) ===')
{
  const anchor = byId(serverProducts, 'anchor-table')
  test('anchor-table has multiple authentic images', anchor.images.length >= 2, `found ${anchor.images.length}`)
  test('anchor-table thumbnails match images', anchor.thumbnails.length === anchor.images.length)
  const bad = serverProducts.filter((p) => !p.images?.length || p.thumbnails?.length !== p.images?.length)
  test('every product has images with matching thumbnails', bad.length === 0, bad.map((p) => p.id).join(','))
}

console.log('\n=== 2. Browser dataset in sync (stale copy once truncated the gallery) ===')
{
  const serverAnchor = byId(serverProducts, 'anchor-table')
  const browserAnchor = byId(browserProducts, 'anchor-table')
  test('browser anchor-table images match server count',
    browserAnchor.images.length === serverAnchor.images.length,
    `browser ${browserAnchor.images.length} vs server ${serverAnchor.images.length}`)
  test('client merge never blind-overwrites server fields', !client.includes('{ ...prev, ...p }'))
  test('client merge only fills empty gaps', /only fill gaps/i.test(client) && /isEmpty/.test(client))
}

console.log('\n=== 3. Gallery: inspect the object ===')
{
  test('thumbnail-to-main selection exists', client.includes('setActiveImage'))
  test('thumbnails render from authentic data', client.includes('product.thumbnails.map'))
  test('image counter present', client.includes('pd-gallery-counter') || client.includes('sig-hero'))
  test('prev/next navigation present', client.includes('goToPrev') && client.includes('goToNext'))
  test('no autoplay (no timers driving the gallery)', !/setInterval/.test(client))
  test('restrained fade on image change', client.includes('pd-fade') && client.includes('key={currentImageIdx}'))
  test('reduced-motion respected', /prefers-reduced-motion/.test(client))
}

console.log('\n=== 4. Information hierarchy ===')
{
  test('category eyebrow above product name', /className="eyebrow".*cat \? cat\.name : product\.categoryName/s.test(client))
  test('product name is h1', client.includes('<h1 className="pd-title">'))
  test('material metadata strip from authentic fields',
    client.includes('pd-meta') && client.includes('product.material') && client.includes('product.dimensions') && client.includes('product.buildTime'))
  test('price rendered from verified data', client.includes('product.priceFormatted'))
  test('availability rendered from verified data', client.includes('product.availabilityNote'))
  test('no invented scarcity copy', !/only \d+ left|hurry|selling fast/i.test(client))
}

console.log('\n=== 5. Story / material / craft from authentic content only ===')
{
  test('story rendered', client.includes('product.story'))
  test('craftsmanship rendered', client.includes('product.craftsmanship'))
  test('materials rendered', client.includes('product.materials'))
  test('no mid-word craft heading truncation', !client.includes('substring(0, 80)'))
  const lower = client.toLowerCase()
  const invented = ['testimonial', 'award-winning', 'certified', 'discount', 'countdown', '% off', 'sale ends', 'sustainab']
  const hits = invented.filter((w) => lower.includes(w))
  test('no invented claims (awards/testimonials/discounts/scarcity)', hits.length === 0, hits.join(','))
}

console.log('\n=== 6. Process CTA → real route ===')
{
  test('page resolves the product process entry', page.includes('getProcessBySlug'))
  test('page passes processSlug to client', page.includes('processSlug'))
  test('client links to the existing process route', client.includes('/process/${processSlug}'))
  test('Watch the Process label present', /Watch the Process/i.test(client))
  test('no invented process route', !client.includes('/process/') || client.includes('processSlug'))
}

console.log('\n=== 7. Ownership / conversion preserved ===')
{
  test('Add to Cart preserved', client.includes('Add to Cart') && client.includes('addToCart'))
  test('quantity behavior preserved', client.includes('pd-qty'))
  test('wishlist preserved', client.includes('toggleWishlist') && client.includes('Wishlist'))
  test('wishlist subordinate to primary CTA', client.includes('pd-actions-row2'))
  test('no business-model swap (no inquiry form replacing cart)', !/inquiry-form|Send Inquiry/.test(client))
}

console.log('\n=== 8. Share works, never errors ===')
{
  test('native share used where supported', client.includes('navigator.share'))
  test('clipboard fallback exists', client.includes('navigator.clipboard.writeText'))
  test('dismiss is not treated as error', client.includes('AbortError'))
  test('share failures are swallowed safely', /Sharing unavailable/.test(client))
  test('no fake social integrations', !/facebook\.com\/sharer|twitter\.com\/intent|linkedin\.com\/share/.test(client))
}

console.log('\n=== 9. Details, related, visual restraint ===')
{
  test('specifications rendered', client.includes('product.specifications'))
  test('shipping/returns rendered', client.includes('product.shipping') && client.includes('product.returns'))
  test('related products from authentic data', client.includes('relatedProducts') && client.includes('Complete the Space'))
  test('no promotional badges', !/SALE|HOT|NEW ARRIVAL/i.test(client))
  const families = [...client.matchAll(/font-family:\s*([^;]+);/gi)].map((m) => m[1].trim())
  test('Instrument Sans only (no new typeface)',
    !/@font-face/i.test(client) && families.length > 0 && families.every((f) => /^var\(--font-/.test(f)),
    families.filter((f) => !/^var\(--font-/.test(f)).join(' | '))
}

console.log('\n=== 10. Desktop composition + mobile ===')
{
  test('product section uses wide viewport (not narrow ecommerce column)',
    /pd-section \.container\s*\{\s*max-width:\s*min\(1400px/.test(client))
  test('gallery carries visual weight (1.2fr)', client.includes('1.2fr 0.8fr'))
  test('mobile sticky CTA preserved', client.includes('pd-mobile-cta'))
  test('responsive rules present', client.includes('@media (max-width: 860px)') && client.includes('@media (max-width: 560px)'))
  test('wishlist/cart/account untouched elsewhere (routes preserved)',
    page.includes('generateStaticParams') && page.includes('generateMetadata'))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)

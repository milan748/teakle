/**
 * T05 — Refine featured product presentation.
 *
 * The featured product (Signature Edition / v2-sig-editorial, heroProduct =
 * The Anchor Table) must feel like a considered design object while keeping
 * commerce functional:
 *   - product name renders from verified data (heroProduct.name), never a
 *     hardcoded invented edition name
 *   - availability renders from verified data (availabilityNote/dimensions),
 *     never invented scarcity copy
 *   - description uses verified shortDescription with no appended invention
 *   - wishlist control is present and uses the existing window.Teakle store
 *     API (same as the product page: toggleWishlist / isInWishlist)
 *   - purchase path preserved: verified price, INQUIRE TO OWN -> /shop/:id,
 *     process CTA, past-editions link, thumbnails, studio tab
 *   - annotation-style hierarchy: availability eyebrow above the object name
 *   - quiet commerce: underline text wishlist control, no cards/badges/fills
 *   - keyboard + touch: aria-pressed/label, visible focus, 44px target
 *   - runtime critical CSS stays in sync with homepage.css
 *   - no new typeface, no new palette, no invented product facts
 *
 * Run: node __tests__/featured-product-presentation.test.js
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
const homepage = fs.readFileSync(path.join(root, 'app', 'homepage.css'), 'utf8')
const homeClient = fs.readFileSync(path.join(root, 'app', 'HomeClient.js'), 'utf8')
const products = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8')

// The runtime-injected critical CSS must stay in sync with homepage.css.
const critical = (homeClient.match(/const atelierCriticalCSS = `([\s\S]*?)`/) || ['', ''])[1]

console.log('=== 1. Verified product name, never invented ===')
{
  test('title renders from heroProduct.name',
    /heroProduct\?\.name/.test(homeClient))
  test('no hardcoded invented edition name remains',
    !homeClient.includes('MAFDET'))
  test('authoritative data has the hero product name',
    products.includes('The Anchor Table') && products.includes('isHero: true'))
}

console.log('\n=== 2. Verified availability, never invented scarcity ===')
{
  test('availability eyebrow renders from availabilityNote',
    homeClient.includes('v2-sig-edition-line') && homeClient.includes('availabilityNote'))
  test('price note renders availability + dimensions from data',
    homeClient.includes('availabilityNote') && homeClient.includes('dimensions'))
  test('no invented scarcity copy remains',
    !homeClient.includes('Never to be recreated')
    && !homeClient.includes('Never restocked. Never repeated')
    && !homeClient.includes('Timeless Form'))
  test('description uses verified shortDescription as-is',
    homeClient.includes('shortDescription'))
}

console.log('\n=== 3. Wishlist + purchase controls functional ===')
{
  test('wishlist toggle uses the existing store API',
    homeClient.includes('toggleWishlist') && homeClient.includes('isInWishlist'))
  test('wishlist control has accessible name and pressed state',
    homeClient.includes('v2-sig-wishlist')
    && homeClient.includes('aria-pressed')
    && homeClient.includes('aria-label'))
  test('wishlist labels are honest state text',
    homeClient.includes('Save to Wishlist') && homeClient.includes('Saved to Wishlist'))
  test('price renders from data', homeClient.includes('priceFormatted'))
  test('ownership CTA preserved', homeClient.includes('INQUIRE TO OWN'))
  test('ownership CTA routes to the featured product page',
    homeClient.includes('/shop/${heroProduct?.id'))
  test('process CTA preserved', homeClient.includes('WATCH THE PROCESS'))
  test('past-editions link preserved', homeClient.includes('See past editions'))
  test('gallery thumbnails preserved', homeClient.includes('v2-sig-editorial-thumb'))
  test('studio-visit tab preserved', homeClient.includes('v2-sig-studio-tab'))
}

console.log('\n=== 4. Sculptural/editorial treatment, quiet commerce ===')
{
  test('edition-line styled as small-caps annotation',
    /\.v2-sig-edition-line\s*\{[^}]*text-transform:\s*uppercase/.test(homepage)
    && /\.v2-sig-edition-line\s*\{[^}]*letter-spacing:\s*0\.22em/.test(homepage))
  test('critical CSS carries the edition-line too',
    /\.v2-sig-edition-line\s*\{[^}]*letter-spacing:\s*0\.22em/.test(critical))
  test('wishlist is a quiet text control (no card, badge or fill)',
    /\.v2-sig-wishlist\s*\{[^}]*background:\s*transparent/.test(homepage)
    && /\.v2-sig-wishlist\s*\{[^}]*text-decoration:\s*underline/.test(homepage)
    && [...homepage.matchAll(/\.v2-sig-wishlist\s*\{[^}]*?box-shadow:\s*([^;]+);/g)]
      .every(m => m[1].trim() === 'none')
    && !/\.v2-sig-wishlist\s*\{[^}]*border-radius:\s*[1-9]/.test(homepage))
  test('critical CSS carries the wishlist control too',
    /\.v2-sig-wishlist\s*\{[^}]*text-decoration:\s*underline/.test(critical))
  test('invented subtitle block fully removed (no dead CSS)',
    !homepage.includes('v2-sig-editorial-subtitle') && !critical.includes('v2-sig-editorial-subtitle'))
  test('main image keeps cinematic landscape crop (unchanged)',
    /\.v2-sig-editorial-img\s*>\s*img\s*\{[^}]*aspect-ratio:\s*3\/2/.test(homepage))
}

console.log('\n=== 5. Keyboard, touch and type safety ===')
{
  test('wishlist keeps a visible focus state',
    /\.v2-sig-wishlist:focus-visible\s*\{[^}]*outline:/.test(homepage))
  test('wishlist meets 44px touch target',
    /\.v2-sig-wishlist\s*\{[^}]*min-height:\s*44px/.test(homepage))
  test('mobile keeps wishlist usable',
    /max-width:\s*560px[\s\S]*?\.v2-sig-wishlist\s*\{[^}]*min-height:\s*44px/.test(homepage))
  test('small-mobile text keeps horizontal gutters (never flush to edge)',
    /max-width:\s*560px[\s\S]*?\.v2-sig-editorial-text\s*\{[^}]*padding:\s*0\s+var\(--space-md\)/.test(homepage))
  test('critical CSS preserves the mobile gutters (it overrides the sheet)',
    /max-width:\s*768px[\s\S]*?\.v2-sig-editorial-text\s*\{[^}]*padding:\s*0\s+var\(--space-md\)/.test(critical))
  test('no new typeface introduced',
    !/v2-sig-(edition-line|wishlist)[\s\S]{0,400}?font-family:\s*[^;]*(serif|Georgia|Playfair|script|cursive)/i.test(homepage))
  test('controls stay on Instrument Sans tokens',
    /\.v2-sig-wishlist\s*\{[^}]*var\(--font-body\)/.test(homepage)
    && /\.v2-sig-edition-line\s*\{[^}]*var\(--font-body\)/.test(homepage))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

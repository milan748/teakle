/**
 * T04 — Atelier Stories editorial composition.
 *
 * Guarantees the Atelier Stories section reads as an editorial story
 * rather than a generic ecommerce card:
 *   - asymmetric grid: dominant image field + narrower text field (7fr / 5fr)
 *   - section title is left-aligned with an architectural rule (not a
 *     detached centered banner)
 *   - cinematic landscape image (3/2), no rounded cards / shadows / boxed UI
 *   - provenance facts preserved as a quiet hairline rule (no icon badges)
 *   - commerce preserved: product name, price, availability note, both CTAs,
 *     past-editions link, gallery thumbnails
 *   - no invented copy, no new typeface, no new palette
 *   - mobile stacks independently with full-width actions
 *
 * Run: node __tests__/atelier-stories-editorial.test.js
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

// The runtime-injected critical CSS must stay in sync with homepage.css.
const critical = (homeClient.match(/const atelierCriticalCSS = `([\s\S]*?)`/) || ['', ''])[1]

console.log('=== 1. Asymmetric editorial grid (image dominant) ===')
{
  const grids = [...homepage.matchAll(/\.v2-sig-editorial-grid\s*\{[^}]*grid-template-columns:\s*([^;]+);/g)]
    .map(m => m[1])
  test('desktop grid is asymmetric 7fr / 5fr',
    grids.some(c => /minmax\(0,\s*7fr\)\s*minmax\(0,\s*5fr\)/.test(c)),
    `got ${JSON.stringify(grids)}`)
  test('no symmetric 5fr / 6fr grid remains',
    !grids.some(c => /minmax\(0,\s*5fr\)\s*minmax\(0,\s*6fr\)/.test(c)))
  test('critical CSS grid matches (7fr / 5fr)',
    /grid-template-columns:\s*minmax\(0,\s*7fr\)\s*minmax\(0,\s*5fr\)/.test(critical))
  test('grid top-aligns fields (no twin-card centering)',
    /\.v2-sig-editorial-grid\s*\{[^}]*align-items:\s*start/.test(homepage))
  test('critical CSS grid top-aligns too',
    /\.v2-sig-editorial-grid\s*\{[^}]*align-items:\s*start/.test(critical))
}

console.log('\n=== 2. Title reads as story opener, not detached banner ===')
{
  test('title is left-aligned',
    /\.v2-atelier-title\s*\{[^}]*text-align:\s*left/.test(homepage))
  test('critical CSS title is left-aligned',
    /\.v2-atelier-title\s*\{[^}]*text-align:\s*left/.test(critical))
  test('title carries architectural rule',
    /\.v2-atelier-title::after\s*\{[^}]*height:\s*1px/.test(homepage))
  test('title copy preserved', homeClient.includes('ATELIER STORIES'))
  test('subtitle copy preserved', homeClient.includes('ONE OF ONE - SIGNATURE PIECES'))
}

console.log('\n=== 3. Imagery is cinematic, never card-like ===')
{
  const imgs = [...homepage.matchAll(/\.v2-sig-editorial-img\s*>\s*img\s*\{[^}]*\}/g)].map(m => m[0])
  test('main image uses landscape 3/2 crop',
    imgs.length > 0 && imgs.every(b => /aspect-ratio:\s*3\/2/.test(b)),
    `checked ${imgs.length} rule(s)`)
  test('critical CSS image uses landscape 3/2 crop',
    /\.v2-sig-editorial-img\s*>\s*img\s*\{[^}]*aspect-ratio:\s*3\/2/.test(critical))
  test('no portrait 4/5 crop remains',
    !/\.v2-sig-editorial-img\s*>\s*img\s*\{[^}]*aspect-ratio:\s*4\/5/.test(homepage)
    && !/aspect-ratio:\s*4\/5/.test(critical))
  test('main image has square corners', imgs.every(b => /border-radius:\s*0/.test(b)))
  test('main image has no shadow',
    imgs.every(b => {
      const shadows = b.match(/box-shadow\s*:\s*[^;]+;/g) || []
      return shadows.every(s => /box-shadow\s*:\s*none\s*;/.test(s))
    }))
  test('thumbnails have square corners',
    !/\.v2-sig-editorial-thumb\s*\{[^}]*border-radius:\s*[1-9]/.test(homepage))
  test('section introduces no rounded cards', !/\.v2-sig-editorial[^{]*\{[^}]*border-radius:\s*[1-9]/.test(homepage))
  test('section introduces no shadows',
    [...homepage.matchAll(/(\.v2-sig-editorial[^{]*\{[^}]*})/g)]
      .every(([, block]) => {
        const shadows = block.match(/box-shadow\s*:\s*[^;]+;/g) || []
        return shadows.every(s => /box-shadow\s*:\s*none\s*;/.test(s))
      }))
  test('no gradient introduced in section',
    !/v2-sig-editorial[\s\S]{0,400}?(linear-gradient|radial-gradient)/.test(homepage))
}

console.log('\n=== 4. Provenance preserved as quiet rule (no badge chips) ===')
{
  test('feature icons are hidden (CSS-only, markup untouched)',
    /\.v2-sig-feature-icon\s*\{[^}]*display:\s*none/.test(homepage))
  test('critical CSS hides feature icons too',
    /\.v2-sig-feature-icon\s*\{[^}]*display:\s*none/.test(critical))
  test('features framed by hairlines',
    /\.v2-sig-editorial-features\s*\{[^}]*border-top:\s*1px\s+solid[^}]*border-bottom:\s*1px\s+solid/.test(homepage))
  test('facts separated by quiet middots, not boxes',
    /\.v2-sig-feature\s*\+\s*\.v2-sig-feature::before\s*\{[^}]*content:\s*"·"/.test(homepage))
  test('labels read as small-caps metadata',
    /\.v2-sig-feature-label\s*\{[^}]*text-transform:\s*uppercase/.test(homepage))
  test('build-time fact preserved', homeClient.includes('buildTime'))
  test('material fact preserved', homeClient.includes('Solid Teak'))
  test('one-of-one fact preserved', homeClient.includes('One of One'))
  test('master-crafted fact preserved', homeClient.includes('Master Crafted'))
}

console.log('\n=== 5. Commerce remains fully functional ===')
{
  // T05 note: "THE MAFDET." was hardcoded invented copy, not the verified
  // product name. T05 renders the title from heroProduct.name ("The Anchor
  // Table"), so this assertion now checks data-driven rendering instead.
  test('product name renders from data', homeClient.includes('heroProduct?.name'))
  test('price renders from data', homeClient.includes('priceFormatted'))
  // T05 note: "Never to be recreated" was invented scarcity copy, not the
  // verified availabilityNote ("In Stock"). T05 renders availability and
  // dimensions from product data, so this checks that instead.
  test('availability note preserved', homeClient.includes('availabilityNote'))
  test('ownership CTA preserved', homeClient.includes('INQUIRE TO OWN'))
  test('process CTA preserved', homeClient.includes('WATCH THE PROCESS'))
  test('CTAs do not stretch to fill the column',
    !/\.v2-sig-btn-primary,\s*\.v2-sig-btn-outline\s*\{[^}]*flex:\s*1\s*;/.test(homepage))
  test('past-editions link preserved', homeClient.includes('See past editions'))
  test('gallery thumbnails preserved', homeClient.includes('v2-sig-editorial-thumb'))
  test('studio-visit tab preserved', homeClient.includes('v2-sig-studio-tab'))
}

console.log('\n=== 6. No invented content, type or palette ===')
{
  test('no invented claims in section',
    !/v2-sig-editorial[\s\S]{0,3000}?(testimonial|award|certified|statistics|best-seller)/i.test(homeClient))
  test('no serif/script/decorative font introduced',
    !/v2-sig-editorial[\s\S]{0,4000}?font-family:\s*[^;]*(serif|Georgia|Playfair|script|cursive)/i.test(homepage))
  test('type stays on Instrument Sans tokens',
    /--font-body/.test(critical))
}

console.log('\n=== 7. Mobile is independently composed ===')
{
  test('tablet stacks grid to one column',
    /max-width:\s*860px[\s\S]*?\.v2-sig-editorial-grid\s*\{[^}]*grid-template-columns:\s*1fr/.test(homepage))
  test('small-mobile stacks actions full-width',
    /max-width:\s*768px[\s\S]*?\.v2-sig-editorial-actions\s*\{[^}]*flex-direction:\s*column/.test(critical))
  test('mobile hides studio tab', /max-width:\s*768px[\s\S]*?\.v2-sig-studio-tab\s*\{[^}]*display:\s*none/.test(critical))
  test('mobile hides floating sculpture label (no title overlap)',
    /max-width:\s*768px[\s\S]*?\.v2-sig-sculpture-label\s*\{[^}]*display:\s*none\s*!important/.test(critical))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

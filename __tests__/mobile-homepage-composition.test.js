/**
 * T13 — Recompose the mobile homepage independently.
 *
 * Mobile must feel intentionally designed, not a stacked desktop page:
 *   - craft leads with imagery on mobile (image-first order)
 *   - carousel is a distinct horizontal feature strip (large snap cards),
 *     not a miniature repeat of the 2-up product grid
 *   - the two story blocks have independent treatments (cinematic overlay
 *     vs light editorial) instead of two identical overlay cards
 *   - story copy is fully readable on mobile (no line-clamp truncation)
 *   - desktop composition is untouched (all rules inside mobile queries)
 *   - commerce, navigation and all sections are preserved
 *
 * Run: node __tests__/mobile-homepage-composition.test.js
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

const media860 = homepage.slice(homepage.indexOf('@media (max-width: 860px)'))

console.log('=== 1. Craft leads with imagery on mobile ===')
{
  test('craft image ordered before text on mobile',
    /\.v2-craft-img\s*\{[^}]*order:\s*-1/.test(media860))
  test('craft stays single-column stacked on mobile',
    /max-width:\s*860px[\s\S]*?\.v2-craft-grid\s*\{\s*grid-template-columns:\s*1fr/.test(homepage))
  test('desktop craft grid keeps asymmetric text/image columns',
    /\.v2-craft-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*62ch\)\s*1fr/.test(homepage))
}

console.log('\n=== 2. Carousel is a distinct feature strip on mobile ===')
{
  const mobileItems = [...media860.matchAll(/\.v2-citem\s*\{[^}]*flex:\s*0\s+0\s+([^;]+);/g)].map(m => m[1].trim())
  test('mobile carousel cards are feature-sized (>= 200px / vw-based)',
    mobileItems.some(b => /6[4-8]vw/.test(b)), `got [${mobileItems.join(' | ')}]`)
  const desktop = homepage.match(/\.v2-citem\s*\{[^}]*flex:\s*0\s+0\s+([^;]+);/)
  test('desktop carousel presence unchanged (clamp 280px/22vw/360px)',
    desktop && /clamp\(280px,\s*22vw,\s*360px\)/.test(desktop[1]))
  test('carousel arrows kept (tap control preserved)',
    /\.v2-cprev/.test(homepage) && /aria-label="Previous"/.test(homeClient))
  test('product grid still 2-up on mobile (distinct from carousel)',
    /max-width:\s*860px[\s\S]*?\.pgrid\s*\{\s*grid-template-columns:\s*repeat\(2,\s*1fr\)/.test(homepage))
}

console.log('\n=== 3. Story blocks have independent mobile treatments ===')
{
  test('workshop block is full-bleed cinematic on mobile',
    /\.v2-lifestyle\s*\{[^}]*padding:\s*0\s+0\s+var\(--space-lg\)/.test(media860))
  test('alt block drops the overlay gradient on mobile',
    /\.v2-lifestyle--alt::after\s*\{\s*display:\s*none/.test(media860))
  test('alt block uses static editorial text on mobile',
    /\.v2-lifestyle--alt\s+\.v2-lifestyle-content\s*\{[^}]*position:\s*static/.test(media860))
  test('alt text uses page dark tones (not overlay white)',
    /\.v2-lifestyle--alt\s+h2\s*\{[^}]*color:\s*var\(--cin-text\)/.test(media860))
  test('desktop lifestyle overlay treatments untouched',
    /\.v2-lifestyle--alt::after\s*\{[^}]*linear-gradient\(270deg/.test(homepage))
}

console.log('\n=== 4. Story copy fully readable on mobile ===')
{
  test('no line-clamp truncation in mobile lifestyle copy',
    !/\.v2-lifestyle\s+p\s*\{[^}]*-webkit-line-clamp/.test(media860))
}

console.log('\n=== 5. Content, commerce and navigation preserved ===')
{
  test('philosophy storytelling still rendered', /cms\.philosophy/.test(homeClient))
  test('workshop + process sections still rendered',
    /v2-lifestyle"/.test(homeClient) && /v2-lifestyle v2-lifestyle--alt/.test(homeClient))
  test('workshop fallback copy intact', /unchanged in method for three generations/.test(homeClient))
  test('process fallback copy intact', /documented from timber to finish/.test(homeClient))
  test('carousel section preserved', /className="carousel"/.test(homeClient))
  test('product grid preserved', /className="v2-products"/.test(homeClient))
  test('signature commerce preserved (price, CTAs, wishlist)',
    /v2-sig-editorial-price-amount/.test(homeClient)
    && /INQUIRE TO OWN/.test(homeClient)
    && /WATCH THE PROCESS/.test(homeClient)
    && /v2-sig-wishlist/.test(homeClient))
  test('no new invented sections introduced',
    !/testimonial|awards|certification|stats/i.test(homeClient))
}

console.log('\n=== 6. No desktop regression from T13 ===')
{
  const before860 = homepage.slice(0, homepage.indexOf('@media (max-width: 860px)'))
  test('desktop has no mobile order overrides', !/order:\s*-1/.test(before860))
  test('desktop has no line-clamp on lifestyle', !/-webkit-line-clamp/.test(before860))
  test('mobile breakpoints intact (860/560/430)',
    /@media\s*\(\s*max-width:\s*860px\s*\)/.test(homepage)
    && /@media\s*\(\s*max-width:\s*560px\s*\)/.test(homepage)
    && /@media\s*\(\s*max-width:\s*430px\s*\)/.test(homepage))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

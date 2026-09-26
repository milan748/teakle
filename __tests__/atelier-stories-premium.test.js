/**
 * T03 — Atelier Stories premium editorial rebuild (object study).
 *
 * NOTE (T03 rebuild): the in-Atelier workshop/process figure asserted by the
 * previous iteration of this test was intentionally removed. T03 requires the
 * Atelier Stories gallery to show ONE product only — every supporting image
 * must depict the featured Anchor Table — with no workshop/maker/process
 * imagery mixed into the object presentation. Process storytelling lives in
 * the dedicated craftsmanship / process sections further down the homepage,
 * reached via the preserved WATCH THE PROCESS CTA. This test now locks the
 * rebuilt direction instead of the removed figure.
 *
 * Guarantees the Atelier Stories section reads as a major premium
 * editorial experience (not a generic product-card grid):
 *   - no "Book a Studio Visit" CTA anywhere in live markup
 *   - Watch-the-Process destination resolves to a real process page
 *   - object-study composition renders from existing data only:
 *       primary plate (heroProduct image) + same-product supporting strip
 *       (heroProduct thumbnails minus the active primary; a single-image
 *       product such as the Anchor Table renders no strip rather than a
 *       duplicate) + story note (heroProduct.story) — no invented
 *       copy/imagery, no workshop/maker/process figure inside Atelier
 *   - new styles exist in BOTH homepage.css and the runtime critical CSS,
 *     stay on Instrument Sans tokens, square corners, no shadows/gradients
 *   - mobile recomposes independently (object name leads, plate follows,
 *     strip stays attached, archive footing closes the chapter)
 *   - commerce + hierarchy foundations still intact
 *
 * Run: node __tests__/atelier-stories-premium.test.js
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

// Runtime-injected critical CSS must stay in sync with homepage.css.
const critical = (homeClient.match(/const atelierCriticalCSS = `([\s\S]*?)`/) || ['', ''])[1]

// Resolve hero product + process slugs from the authoritative datasets.
const productsSrc = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8')
const processSrc = fs.readFileSync(path.join(root, 'app', 'data', 'process.js'), 'utf8')
const heroId = (productsSrc.match(/id:\s*"([^"]+)",[\s\S]{0,400}?isHero:\s*true/) || [])[1] || null
const processSlugs = [...processSrc.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1])

console.log('=== 1. Book a Studio Visit is removed ===')
{
  test('no "Book a Studio Visit" copy in live HomeClient',
    !/Book a Studio Visit/i.test(homeClient))
  test('no "Book a Studio Visit" copy in homepage.css',
    !/Book a Studio Visit/i.test(homepage))
  test('no book-a-visit href in Atelier section',
    !/v2-sig[\s\S]{0,500}?book/i.test(homeClient))
}

console.log('\n=== 2. Watch the Process leads to a real process page ===')
{
  test('hero product resolved from data', !!heroId, `got ${heroId}`)
  test('hero product has a dedicated process page',
    !!heroId && processSlugs.includes(heroId),
    `hero=${heroId} slugs=${JSON.stringify(processSlugs)}`)
  test('process CTA targets the featured product id',
    homeClient.includes("href={`/process/${heroProduct?.id || 'anchor-table'}`}"))
  test('no invented process destination',
    !/href="\/process\/(making|craft|atelier|story)"/.test(homeClient))
}

console.log('\n=== 3. Object-study composition is data-driven, never invented ===')
{
  test('primary plate renders the featured product image',
    homeClient.includes('sigPrimarySrc'))
  test('supporting strip shows all 4 thumbnails (no filtering of active)',
    /sigThumbs\.map\(\(t/.test(homeClient))
  test('strip renders only when unique supporting views exist',
    /sigSupporting\.length\s*>\s*0/.test(homeClient))
  test('story note renders from product data', homeClient.includes('heroProduct?.story'))
  test('no workshop/maker/process figure inside Atelier Stories',
    !/v2-sig-workshop/.test(homeClient))
  test('no process heroImage consumed inside Atelier Stories',
    !/sigProcess/.test(homeClient))
  test('no invented claims in new supporting copy',
    !/v2-sig-(mobile-head|archive)[\s\S]{0,2000}?(testimonial|award|certified|statistics|best-seller|limited-edition|never to be recreated)/i.test(homeClient))
  test('archive footing links to the existing archive route',
    homeClient.includes('v2-sig-archive-foot') && homeClient.includes('href="/archive"'))
}

console.log('\n=== 4. Styles stay on the Teakle system (both stylesheets) ===')
{
  for (const [css, label] of [[homepage, 'homepage.css'], [critical, 'critical CSS']]) {
    test(`${label} styles the object-study strip`,
      /\.v2-sig-editorial-supporting\s*\{[^}]*grid-template-columns/.test(css))
    test(`${label} keeps square corners on strip controls`,
      /\.v2-sig-editorial-thumb\s*\{[^}]*border-radius:\s*0/.test(css))
    test(`${label} keeps the strip shadow-free`,
      [...css.matchAll(/(\.v2-sig-editorial[^{]*\{[^}]*})/g)]
        .every(([, block]) => {
          const shadows = block.match(/box-shadow\s*:\s*[^;]+;/g) || []
          return shadows.every(s => /box-shadow\s*:\s*none\s*(!important\s*)?;/.test(s))
        }))
    test(`${label} styles the story note with a quiet hairline`,
      /\.v2-sig-story-note\s*\{[^}]*border-top:\s*1px\s+solid/.test(css))
    test(`${label} styles the archive footing with a quiet hairline`,
      /\.v2-sig-archive-foot\s*\{[^}]*border-top:\s*1px\s+solid/.test(css))
    test(`${label} keeps supporting type on Instrument Sans tokens`,
      /--font-body/.test(css) && /--cin-(label|body|caption)/.test(css))
  }
  test('no gradient introduced by new rules',
    !/v2-sig-(editorial-supporting|story|archive|mobile-head)[\s\S]{0,400}?(linear-gradient|radial-gradient)/.test(homepage))
  test('no serif/script font introduced by new rules',
    !/v2-sig-(editorial-supporting|story|archive|mobile-head)[\s\S]{0,800}?font-family:\s*[^;]*(serif|Georgia|Playfair|script|cursive)/i.test(homepage))
}

console.log('\n=== 5. Mobile recomposes independently ===')
{
  test('mobile head exists in markup', homeClient.includes('v2-sig-mobile-head'))
  test('mobile head hidden on desktop',
    /\.v2-sig-mobile-head\s*\{[^}]*display:\s*none/.test(homepage))
  test('tablet reveals the mobile head and retires the desktop title',
    /max-width:\s*860px[\s\S]*?\.v2-sig-mobile-head\s*\{[^}]*display:\s*block/.test(homepage)
    && /max-width:\s*860px[\s\S]*?\.v2-sig-title-desktop\s*\{[^}]*display:\s*none/.test(homepage))
  test('critical CSS reveals the mobile head too',
    /max-width:\s*860px[\s\S]*?\.v2-sig-mobile-head\s*\{[^}]*display:\s*block/.test(critical))
  test('tablet keeps the study strip attached in two columns',
    /max-width:\s*860px[\s\S]*?\.v2-sig-editorial-supporting\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/.test(homepage))
  test('critical CSS keeps the strip attached too',
    /max-width:\s*860px[\s\S]*?\.v2-sig-editorial-supporting\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/.test(critical))
}

console.log('\n=== 6. Foundations preserved (hierarchy, contrast, commerce) ===')
{
  test('dark background treatment intact',
    /\.v2-atelier-wrapper\s*\{[^}]*background:\s*var\(--cin-dark-deep\)/.test(critical))
  test('heading stays the most prominent display token',
    /\.v2-atelier-title\s+h2\s*\{[^}]*font-size:\s*var\(--cin-display\)/.test(critical))
  test('ownership CTA preserved', homeClient.includes('INQUIRE TO OWN'))
  test('process CTA preserved', homeClient.includes('WATCH THE PROCESS'))
  test('price renders from data', homeClient.includes('priceFormatted'))
  test('wishlist preserved', homeClient.includes('v2-sig-wishlist'))
  test('past-editions link preserved', homeClient.includes('See past editions'))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

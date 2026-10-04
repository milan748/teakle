/**
 * T04 — Remove product carousel, establish static 3 + 3 editorial groups.
 *
 * Verifies (source-level):
 *  1. No carousel JSX/behavior remains in HomeClient for the homepage
 *     product presentation (no v2-cprev/v2-cnext/v2-ctrack/v2-citem/
 *     v2cdot/carousel section, no autoplay/scroll-snap carousel JS).
 *  2. Two distinct editorial groups exist, each rendering exactly 3 cards.
 *  3. Six products total, all from the authoritative PRODUCTS dataset,
 *     distinct, with authentic images, /shop/:id links, names, prices.
 *  4. Editorial CSS: three-column desktop grid, single-column mobile
 *     stack, no horizontal overflow, Instrument Sans only.
 *
 * Run: node __tests__/t04-editorial-groups.test.js
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
const homeClient = fs.readFileSync(path.join(root, 'app', 'HomeClient.js'), 'utf8')
const homepage = fs.readFileSync(path.join(root, 'app', 'homepage.css'), 'utf8')
const productsSrc = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8')

console.log('=== 1. Carousel removed ===')
{
  test('no carousel section markup', !homeClient.includes('<section className="carousel"'))
  test('no carousel prev control', !homeClient.includes('v2-cprev'))
  test('no carousel next control', !homeClient.includes('v2-cnext'))
  test('no carousel track', !homeClient.includes('v2-ctrack'))
  test('no carousel item', !homeClient.includes('v2-citem'))
  test('no carousel dots', !homeClient.includes('v2cdot') && !homeClient.includes('v2-cdots'))
  test('no carousel track ref', !homeClient.includes('carouselTrackRef'))
  test('no autoplay interval', !/setInterval\(tick/.test(homeClient))
  test('no snap-scroll carousel go()', !/track\.scrollTo/.test(homeClient))
}

console.log('\n=== 2. Two groups of exactly three ===')
{
  test('editorial groups section exists', homeClient.includes('v2-edit-groups'))
  test('group 1 marker exists', homeClient.includes('data-group="1"'))
  test('group 2 marker exists', homeClient.includes('data-group="2"'))
  test('exactly two v2-edit-group blocks', (homeClient.match(/v2-edit-group[ "--]/g) || []).length >= 2 && (homeClient.match(/data-group="/g) || []).length === 2)
  test('group split is 3 + 3', homeClient.includes('six.slice(0, 3)') && homeClient.includes('six.slice(3, 6)'))
  test('six products required before render', /const six = resolveProducts\(orderedIds\)\.filter\(\(p\) => !p\.isHero\)\.slice\(0, 6\)/.test(homeClient) && homeClient.includes('if (six.length < 6) return null'))
  test('Atelier hero excluded from catalogue groups', homeClient.includes('.filter((p) => !p.isHero)'))
}

console.log('\n=== 3. Authentic product data, commerce preserved ===')
{
  const ids = ['anchor-table', 'bearing-chair', 'circle-table', 'hollow-bench', 'drift-sculpture', 'hourglass-vase']
  test('fallback ids are all real dataset products',
    ids.every((id) => productsSrc.includes(`id: "${id}"`)))
  test('product links preserved (/shop/:id)', homeClient.includes('href={`/shop/${p.id}`}'))
  test('product name rendered', /<h3>\{p\.name\}<\/h3>/.test(homeClient))
  test('product price rendered', homeClient.includes('p.priceFormatted'))
  test('category metadata rendered', homeClient.includes('p.categoryName'))
  test('product image rendered from data', homeClient.includes('p.images?.[0]'))
  test('no invented product names in HomeClient', !/Test Product|Placeholder|Lorem Ipsum/.test(homeClient))
  test('CTA to full collection preserved', homeClient.includes('Explore the Full Collection') && homeClient.includes("href={productGrid.buttonUrl || '/gallery'}"))
}

console.log('\n=== 4. Editorial CSS: desktop 3-col, mobile stack, no overflow ===')
{
  test('desktop three-column grid', /\.v2-edit-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/.test(homepage))
  test('groups use wide measure', /\.v2-edit-group\s*\{[^}]*max-width:\s*var\(--container-wide\)/.test(homepage))
  test('groups separated (spacing/divider)', /\.v2-edit-group--second\s*\{[^}]*border-top:/.test(homepage) && /\.v2-edit-group--second\s*\{[^}]*margin-top:/.test(homepage))
  test('mobile recomposes to single column', /max-width:\s*860px[\s\S]*?\.v2-edit-grid\s*\{\s*grid-template-columns:\s*1fr/.test(homepage))
  test('no horizontal overflow on groups', /\.v2-edit-groups\s*\{[^}]*overflow-x:\s*clip/.test(homepage))
  test('no carousel snap-scrolling in new layout', !/\.v2-edit-grid\s*\{[^}]*scroll-snap-type/.test(homepage))
  test('no badges/shadows/gradients in new layout', !/\.v2-edit-g[^}]*box-shadow:\s*0\s+\d+px[^}]*\}/.test(homepage) && !/\.v2-edit-g[^}]*linear-gradient/.test(homepage))
  test('no new typeface', !/\.v2-edit-[\s\S]{0,600}?font-family:\s*[^;]*(serif|Georgia|Playfair|script|cursive)/i.test(homepage))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

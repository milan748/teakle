/**
 * T03 — Atelier Stories same-product supporting gallery.
 *
 * Guarantees the supporting strip beneath the primary Atelier Stories
 * image shows all 4 thumbnails of the SAME featured product:
 *   - strip renders from heroProduct thumbnails (all 4 shown)
 *   - no workshop/process/maker imagery inside the supporting strip
 *   - no invented sculpture overlay or scarcity fallback copy
 *   - clicking a thumbnail updates the main image

 * Run: node __tests__/atelier-stories-same-product.test.js
 * Exit code is non-zero on any failure.
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
const productsSrc = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8')

console.log('=== 1. Supporting strip shows all 4 same-product thumbnails ===')
{
  // Thumbnails are now mapped without filtering - all 4 are shown
  test('supporting list includes all thumbnails (no filtering of active)',
    homeClient.includes('sigSupporting')
    && /sigThumbs\.map\(\(t/.test(homeClient))
  test('strip renders when supporting views exist',
    /sigSupporting\.length\s*>\s*0/.test(homeClient))
  test('no index-slice path that could repeat the primary remains',
    !/sigThumbs\.slice\(1,\s*3\)/.test(homeClient))
  test('thumbnails have click handler to update gallery index',
    /onClick.*setGalleryIdx/.test(homeClient))
  test('thumbnails have active state class',
    /is-active/.test(homeClient))
}

console.log('\n=== 2. No workshop/maker imagery inside the product gallery ===')
{
  const stripBlock = (homeClient.match(/<div className="v2-sig-editorial-supporting"[\s\S]{0,800}<\/div>/) || [''])[0]
  test('supporting strip markup found', stripBlock.length > 0)
  test('strip block never references process/workshop imagery',
    !/sigProcess|workshop|heroImage/.test(stripBlock))
}

console.log('\n=== 3. No invented overlay or scarcity fallback ===')
{
  test('invented sculpture overlay removed',
    !/Teak Wood<br\/>Sculpture/.test(homeClient))
  test('reclaimed-timber fallback removed',
    !/reclaimed timber block/.test(homeClient))
  test('"never discounted" scarcity fallback removed',
    !/never discounted/.test(homeClient))
}

console.log('\n=== 4. Anchor Table data reality check ===')
{
  const anchorBlock = (productsSrc.match(/id:\s*"anchor-table"[\s\S]{0,2200}/) || [''])[0]
  const images = [...anchorBlock.matchAll(/https:\/\/images\.pexels\.com\/photos\/(\d+)\//g)].map(m => m[1])
  const unique = [...new Set(images)]
  test('anchor-table has 4 unique images for gallery',
    unique.length === 4, `got ${unique.length} unique image(s): ${JSON.stringify(unique)}`)
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

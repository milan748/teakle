/**
 * Homepage product image integrity (P0 content integrity).
 *
 * Guarantees that products rendered in the homepage product areas
 * (collection carousel, featured product, product grids — currently
 * anchor-table, bearing-chair, circle-table, hollow-bench) never display
 * unrelated imagery.
 *
 * Audit history (2026-09-24, verified against Pexels photo metadata):
 *   - 11112745 "mid-century modern wooden desk with drawers" was listed
 *     under The Anchor Table (a dining table) — removed.
 *   - 4564013 "contemporary living room ... Rizza, Veneto, Italy" (an
 *     unrelated interior/showroom) was listed under The Anchor Table and
 *     The Circle Table — removed from both.
 *   - 5974275 "artisan cutting joint with chisel" (craftsman at work, no
 *     product shown) was listed under The Anchor Table and The Circle
 *     Table — removed from both (it remains valid as editorial/lifestyle
 *     imagery, just not as product imagery).
 *   - 12233290 "wooden bench" was listed under The Bearing Chair — removed.
 *   - 29546532 "wooden chair" was listed under The Hollow Bench — removed.
 *   - 5710742 "craftsman in workshop" was listed under The Bearing Chair
 *     and The Hollow Bench — removed from both.
 *
 * Run: node __tests__/homepage-image-integrity.test.js
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

// Load the authoritative dataset the same way
// scripts/generate-browser-products.js does (regex extract + eval),
// so this test works without ESM/transpiler support.
const serverPath = path.join(__dirname, '..', 'app', 'data', 'products.js')
const serverContent = fs.readFileSync(serverPath, 'utf8')
const match = serverContent.match(/export\s+const\s+PRODUCTS\s*=\s*(\[[\s\S]*?\]);\s*\n\s*export/)
assert.ok(match, 'could not extract PRODUCTS array from app/data/products.js')
const PRODUCTS = eval(match[1])

const photoId = (url) => {
  const m = String(url || '').match(/photos\/(\d+)/)
  return m ? m[1] : null
}

// Homepage product areas resolve these IDs (see DEFAULT_SECTIONS.home in
// lib/cms.js: collection-carousel + product-grid; hero product is
// anchor-table via getHeroProduct()).
const HOMEPAGE_IDS = ['anchor-table', 'bearing-chair', 'circle-table', 'hollow-bench']

// Pexels photo IDs verified (2026-09-24) to depict the named product.
const VERIFIED_IMAGES = {
  'anchor-table': ['11112739'],   // wooden table on white backdrop
  'bearing-chair': ['29546532'],  // wooden chair in sunlit room
  'circle-table': ['8251295'],    // round wooden table with decor
  'hollow-bench': ['12233290'],   // wooden bench, minimalist setting
}

// Pexels photo IDs verified to be UNRELATED to the named product.
const KNOWN_UNRELATED = {
  '11112745': 'mid-century desk with drawers (not the Anchor dining table)',
  '4564013': 'unrelated living-room interior/showroom',
  '5974275': 'craftsman at work, no product shown',
  '5710742': 'craftsman in workshop, no product shown',
}

const byId = new Map(PRODUCTS.map((p) => [p.id, p]))

console.log('=== 1. Homepage products exist with intact commerce data ===')
{
  const expected = {
    'anchor-table': { name: 'The Anchor Table', price: 185000 },
    'bearing-chair': { name: 'The Bearing Chair', price: 68000 },
    'circle-table': { name: 'The Circle Table', price: 72000 },
    'hollow-bench': { name: 'The Hollow Bench', price: 54000 },
  }
  for (const id of HOMEPAGE_IDS) {
    const p = byId.get(id)
    test(`${id} exists`, !!p)
    if (p) {
      test(`${id} name intact`, p.name === expected[id].name, `got "${p.name}"`)
      test(`${id} price intact`, p.price === expected[id].price, `got ${p.price}`)
    }
  }
}

console.log('\n=== 2. Every homepage product image is verified for that product ===')
{
  for (const id of HOMEPAGE_IDS) {
    const p = byId.get(id)
    const imgs = (p && p.images) || []
    test(`${id} has at least one image`, imgs.length >= 1)
    for (const url of imgs) {
      const pid = photoId(url)
      test(
        `${id} image ${pid} is verified for this product`,
        pid && (VERIFIED_IMAGES[id] || []).includes(pid),
        `got ${url}`
      )
      test(
        `${id} image ${pid} is not known-unrelated`,
        !(pid && KNOWN_UNRELATED[pid]),
        KNOWN_UNRELATED[pid] || ''
      )
    }
  }
}

console.log('\n=== 3. No image is shared between two different homepage products ===')
{
  const owners = new Map() // photoId -> productId
  for (const id of HOMEPAGE_IDS) {
    const p = byId.get(id)
    for (const url of (p && p.images) || []) {
      const pid = photoId(url)
      if (!pid) continue
      if (owners.has(pid)) {
        test(
          `photo ${pid} used by only one homepage product`,
          false,
          `shared by ${owners.get(pid)} and ${id}`
        )
      } else {
        owners.set(pid, id)
      }
    }
  }
  // Assert map sizes: every reference must be unique across homepage products.
  const totalRefs = HOMEPAGE_IDS.reduce((n, id) => n + (((byId.get(id) || {}).images) || []).length, 0)
  test(
    'every homepage image reference is unique across homepage products',
    owners.size === totalRefs,
    `unique=${owners.size} refs=${totalRefs}`
  )
}

console.log('\n=== 4. Thumbnails match images (same photo, w=300 variant) ===')
{
  for (const id of HOMEPAGE_IDS) {
    const p = byId.get(id)
    const imgIds = ((p && p.images) || []).map(photoId)
    const thumbIds = ((p && p.thumbnails) || []).map(photoId)
    test(
      `${id} thumbnails cover all images`,
      imgIds.length === thumbIds.length && imgIds.every((pid) => thumbIds.includes(pid)),
      `images=[${imgIds}] thumbs=[${thumbIds}]`
    )
  }
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

/**
 * Homepage editorial image integrity (T07A).
 *
 * Audits the non-product images rendered on the homepage (hero, Atelier
 * fallback, craftsmanship, workshop-story, process-story) and guards the
 * verified audit outcome:
 *
 * Audit (verified against rendered homepage + Pexels photo metadata):
 *   - hero: local /assets/hero-luxury-entryway.png — verified Teakle brand
 *     imagery (warm timber entryway). KEEP. Its alt text falsely described
 *     "a woodworker's hands finishing the grain" — corrected to describe
 *     the actual scene (no hands, no grain work in the image).
 *   - signature fallback 31817693: "two rustic wooden stools on a stone
 *     floor" — wooden furniture; also the live CMS signature.image. KEEP.
 *     (Never renders while the hero product has images.)
 *   - craftsmanship 5974275: "artisan cutting joint with chisel" — KEEP.
 *   - workshop-story 5974417: "hands of woodworker using hammer and
 *     chisel" — KEEP. Its alt text falsely claimed "sanding" — corrected
 *     to chisel work per the verified source.
 *   - process-story 5710742: "craftsman sanding plank in workshop" — KEEP.
 *   - Homepage product imagery (carousel/grid/featured) is covered by
 *     __tests__/homepage-image-integrity.test.js (T01) — not re-audited here.
 *
 * Run: node __tests__/homepage-editorial-imagery.test.js
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

const homeClient = fs.readFileSync(path.join(__dirname, '..', 'app', 'HomeClient.js'), 'utf8')
const seedCms = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'seed-cms.js'), 'utf8')

const photoIds = (src) => {
  const out = []
  const re = /photos\/(\d+)/g
  let m
  while ((m = re.exec(src))) out.push(m[1])
  return out
}

// Pexels photo IDs verified relevant to Teakle editorial sections.
const VERIFIED_EDITORIAL = {
  '31817693': 'rustic wooden stools (signature fallback / CMS image)',
  '5974275': 'artisan cutting joint with chisel (craftsmanship)',
  '5974417': 'woodworker hands with chisel and hammer (workshop-story)',
  '5710742': 'craftsman sanding plank in workshop (process-story)',
}

// Pexels photo IDs verified UNRELATED (removed during the T01 audit).
const KNOWN_UNRELATED = ['11112745', '4564013']

console.log('=== 1. Homepage editorial images are all verified-relevant ===')
{
  const ids = photoIds(homeClient)
  test('HomeClient references editorial imagery', ids.length > 0, `found [${ids}]`)
  for (const pid of new Set(ids)) {
    // Product images are audited by homepage-image-integrity.test.js; here we
    // only require that no KNOWN-UNRELATED photo appears anywhere on the page.
    test(`photo ${pid} is not known-unrelated`, !KNOWN_UNRELATED.includes(pid), 'known-unrelated photo on homepage')
  }
  for (const pid of Object.keys(VERIFIED_EDITORIAL)) {
    test(`verified editorial photo ${pid} still referenced (${VERIFIED_EDITORIAL[pid]})`, ids.includes(pid), 'missing from HomeClient')
  }
  test('hero uses local brand asset', homeClient.includes('/assets/hero-luxury-entryway.png'), 'hero fallback changed')
}

console.log('\n=== 2. Seed CMS homepage images match the verified set ===')
{
  // seed-cms.js owns the craftsmanship / workshop-story / process-story
  // images. (The 31817693 signature fallback lives in HomeClient.js and the
  // live CMS row, covered in section 1.)
  const ids = photoIds(seedCms)
  for (const pid of ['5974275', '5974417', '5710742']) {
    test(`seed-cms keeps verified photo ${pid}`, ids.includes(pid), 'missing from seed-cms.js')
  }
}

console.log('\n=== 3. Image descriptions match the rendered image content ===')
{
  test(
    'hero alt does not invent hands/grain work',
    !homeClient.includes("woodworker's hands finishing the grain"),
    'false hero alt still present'
  )
  test(
    'workshop alt does not claim sanding',
    !homeClient.includes('hands sanding a wooden surface'),
    'false workshop alt still present'
  )
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

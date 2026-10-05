/**
 * T06 — Refine Archive as Atelier Works.
 *
 * Verifies (source-level):
 *  1. No invented scarcity/retirement language, buyers, or dates on /archive.
 *  2. Archive lists only data-supported previous-edition works
 *     (availability "Limited Edition") and never the current hero.
 *  3. Authentic product imagery + metadata preserved; valid /shop links;
 *     no Add to Cart on archive; no carousel.
 *  4. Editorial composition: extreme-edge imagery, no card chrome,
 *     no new typeface, intentional mobile (no horizontal scroll/carousel).
 *  5. CMS hero uses published body copy (no "never restocked" fallback).
 *
 * Run: node __tests__/t06-archive.test.js
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
const archive = fs.readFileSync(path.join(root, 'app', 'archive', 'page.js'), 'utf8')
const productsSrc = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8')

console.log('=== 1. No invented scarcity / buyers / dates ===')
{
  test('no "never restocked" claim', !/never restocked/i.test(archive))
  test('no "never repeated" claim', !/never repeated/i.test(archive))
  test('no "one of one" claim', !/one of one/i.test(archive))
  test('no "retired" claim', !/retired/i.test(archive))
  test('no "discontinued" claim', !/discontinued/i.test(archive))
  test('no "permanently unavailable" claim', !/permanently unavailable/i.test(archive))
  test('no invented buyers ("Bought by")', !/Bought by/i.test(archive))
  test('no invented piece numbers ("Piece N")', !/Piece N/i.test(archive))
  test('no hardcoded buyer names', !/Vikram Desai|Riya Sharma|Arjun Mehta|Priya Nair/.test(archive))
  test('no hardcoded sold dates', !/Mar 2026|Jan 2026|Sep 2025|May 2025/.test(archive))
  test('no Sold badge', !/sold-badge/.test(archive))
}

console.log('\n=== 2. Data-supported archive selection ===')
{
  test('selects Limited Edition availability from dataset',
    /availability === 'Limited Edition'/.test(archive))
  test('never lists the current hero (isHero excluded)',
    !/isHero === true[^]*?works|works[^]*?isHero/.test(archive) || /find\(\(p\) => p\.isHero === true\)/.test(archive) && !archive.includes('isHero === true,\n'))
  test('hero product referenced only for the Atelier relationship line',
    /Atelier Stories presents the current signature object/.test(archive))
  test('dataset still carries the two limited editions',
    productsSrc.includes('collectors-bowl') && productsSrc.includes('limited-vase'))
  test('no invented archive titles (Hollow Bench / Still Stool / Anchor Round / Grain Bowl as archive)',
    !/The Hollow Bench|The Still Stool|The Anchor Round|The Grain Bowl/.test(archive))
}

console.log('\n=== 3. Authentic imagery, routes, quiet commerce ===')
{
  test('uses work.images from dataset (no hardcoded pexels IDs)',
    /work\.images\[0\]/.test(archive) && !/12233290|31817693|8251295|6962757/.test(archive))
  test('links each work to its product page', /\/shop\/\$\{work\.id\}/.test(archive))
  test('no Add to Cart on archive', !/add-to-cart|addToCart|AddToCart/i.test(archive))
  test('gallery relationship preserved', archive.includes('href="/gallery"'))
  test('shows only supported metadata (category, material, price, edition note)',
    /work\.categoryName/.test(archive) && /work\.material/.test(archive) && /work\.priceFormatted/.test(archive) && /availabilityNote/.test(archive))
  test('no horizontal carousel', !/carousel|overflow-x:\s*auto|scroll-snap/i.test(archive))
}

console.log('\n=== 4. Editorial composition ===')
{
  test('extreme-edge imagery (negative margin toward viewport edge)',
    /margin-left:\s*calc\(-1 \* var\(--space-lg\)\)/.test(archive) && /margin-right:\s*calc\(-1 \* var\(--space-lg\)\)/.test(archive))
  test('varied image scale (featured 4/3 vs secondary 1/1)',
    /arch-work-featured \.arch-work-image\s*\{[^}]*aspect-ratio:\s*4 \/ 3/.test(archive) && /arch-work-secondary \.arch-work-image\s*\{[^}]*aspect-ratio:\s*1 \/ 1/.test(archive))
  test('no card chrome (no border-radius cards / shadows / gradients)',
    !/border-radius:\s*(12|16|20|24)px/.test(archive) && !/box-shadow:\s*0/.test(archive) && !/linear-gradient/.test(archive))
  test('no new typeface', !/font-family:\s*[^;]*(serif|Georgia|Playfair|script|cursive)/i.test(archive))
  test('overflow-x guarded', /overflow-x:\s*clip/.test(archive))
  test('mobile recomposes to single column (not a shrunk grid, not 2-col)',
    /max-width:\s*860px[\s\S]*?\.arch-work-featured,\s*\.arch-work-secondary\s*\{[^}]*grid-template-columns:\s*1fr/.test(archive))
}

console.log('\n=== 5. CMS hero integrity ===')
{
  test('reads published hero body (not subtitle)', /hero\.body/.test(archive))
  test('fallback matches published CMS copy',
    archive.includes('Past collections, limited editions') && archive.includes('A record of what has been made.'))
  test('fallback image matches CMS image', archive.includes('/temporary-images/archive-hero-timber-01.jpg'))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

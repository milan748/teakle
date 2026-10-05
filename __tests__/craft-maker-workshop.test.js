/**
 * T06 — Craft, maker and workshop storytelling.
 *
 * Guarantees the craftsmanship narrative is central and editorial:
 *   - craft section uses an extreme-left composition (image flush to the
 *     viewport edge, full-height image field, wide text measure)
 *   - craft heading has editorial hierarchy (balanced wrap, wider size)
 *   - workshop and process story blocks no longer share one identical
 *     treatment (process uses the right-aligned alt rhythm)
 *   - mobile keeps the full craft narrative (no truncation) and keeps
 *     story-block body copy visible
 *   - copy, imagery sources and commerce controls are preserved
 *   - brand constraints hold (Instrument Sans only, palette tokens only)
 *
 * Run: node __tests__/craft-maker-workshop.test.js
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

console.log('=== 1. Craft uses extreme-left editorial composition ===')
{
  test('craft section drops left gutter (image flush to edge)',
    /\.v2-craft\s*\{[^}]*padding:[^;]*0\s*;/.test(homepage) &&
    /\.v2-craft\s*\{[^}]*padding:\s*var\(--cin-section\)\s+var\(--cin-gutter-wide\)[^;]*0/.test(homepage))
  test('craft grid spans full width (no centered container)',
    /\.v2-craft-grid\s*\{[^}]*max-width:\s*none/.test(homepage))
  test('craft grid is asymmetric (image field dominant)',
    /\.v2-craft-grid\s*\{[^}]*grid-template-columns:\s*1\.08fr\s+0\.92fr/.test(homepage))
  test('craft image is a full-height field, not a fixed portrait card',
    /\.v2-craft-img img\s*\{[^}]*min-height:\s*min\(78vh,\s*760px\)/.test(homepage))
  test('craft text holds a wide editorial measure',
    /\.v2-craft-text\s*\{[^}]*max-width:\s*62ch/.test(homepage))
}

console.log('\n=== 2. Craft text hierarchy ===')
{
  test('craft heading steps up in scale',
    /\.v2-craft-text h2\s*\{[^}]*font-size:\s*clamp\(1\.5rem,\s*2\.6vw,\s*2\.25rem\)/.test(homepage))
  test('craft heading uses balanced wrap with editorial measure',
    /\.v2-craft-text h2\s*\{[^}]*text-wrap:\s*balance/.test(homepage) &&
    /\.v2-craft-text h2\s*\{[^}]*max-width:\s*22ch/.test(homepage))
  test('craft copy preserved (solid timber claim)',
    homeClient.includes('We work in solid timber, never veneer or particleboard'))
  test('craft copy preserved (hand-cut joints claim)',
    homeClient.includes('Joints are cut by hand and fitted dry'))
  test('craft link preserved', homeClient.includes('Visit the Studio'))
  test('craft image source is the approved temporary asset (no stock swap)',
    homeClient.includes('/temporary-images/home-craft-artisan-01.jpg'))
}

console.log('\n=== 3. Workshop/process rhythm is differentiated ===')
{
  test('process block carries the alt rhythm class in markup',
    homeClient.includes('v2-lifestyle v2-lifestyle--alt'))
  test('workshop block keeps the base left-anchored treatment',
    (homeClient.match(/className="v2-lifestyle"/g) || []).length >= 1)
  test('alt block holds content to the extreme right',
    /\.v2-lifestyle--alt\s+\.v2-lifestyle-content\s*\{[^}]*margin-left:\s*auto/.test(homepage))
  test('alt block uses a shorter cinematic frame for rhythm',
    /\.v2-lifestyle--alt\s*\{[^}]*height:\s*76vh/.test(homepage))
  test('alt block mirrors the overlay grade',
    /\.v2-lifestyle--alt::after\s*\{[^}]*linear-gradient\(270deg/.test(homepage))
  test('workshop copy preserved',
    homeClient.includes('A family workshop, unchanged in method for three generations.'))
  test('process copy preserved',
    homeClient.includes('Every piece is documented from timber to finish.'))
  test('workshop/process commerce links preserved',
    homeClient.includes('Read About Our Process') && homeClient.includes('Watch the Process'))
}

console.log('\n=== 4. Mobile keeps the narrative coherent ===')
{
  test('craft stacks independently on tablet',
    /max-width:\s*860px[\s\S]*?\.v2-craft-grid\s*\{\s*grid-template-columns:\s*1fr/.test(homepage))
  test('craft body is not truncated on mobile (no line-clamp)',
    !/max-width:\s*860px[\s\S]*?\.v2-craft-text p\s*\{[^}]*-webkit-line-clamp/.test(homepage))
  test('story-block body stays visible on mobile (no display:none)',
    !/\.v2-lifestyle p\s*\{\s*display:\s*none/.test(homepage))
  test('alt rhythm collapses safely on mobile',
    /max-width:\s*860px[\s\S]*?\.v2-lifestyle--alt\s*\{[^}]*height:\s*auto/.test(homepage))
}

console.log('\n=== 5. Brand constraints hold ===')
{
  const craftCss = (homepage.match(/\/\* ---- Craftsmanship ----[\s\S]*?\/\* ---- Editorial Carousel ----/) || [''])[0]
  const lifeCss = (homepage.match(/\/\* ---- Lifestyle \(Story Block\) ----[\s\S]*?\/\* ================================================================\n   RESPONSIVE/) || [''])[0]
  const scoped = craftCss + '\n' + lifeCss
  test('no serif/script/decorative font introduced',
    !/font-family:\s*[^;]*(serif|Georgia|Playfair|script|cursive)/i.test(scoped))
  test('no heavy shadow introduced', !/box-shadow/i.test(scoped))
  test('no rounded-card treatment on craft image', !/\.v2-craft[^}]*border-radius/i.test(craftCss))
  test('no hard-coded hex colour introduced', !/#[0-9a-fA-F]{3,6}/.test(scoped))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

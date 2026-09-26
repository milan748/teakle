/**
 * T07 - Studio Material and Brand Story.
 * Verifies: /studio answers WHO Teakle is + WHY teak + HOW material/design/
 * craft become the object, using authentic existing copy (no invented brand
 * history, no superlatives), with editorial composition and a closing link
 * into the existing collection route.
 * Run: node __tests__/studio-material-story.test.js
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
const page = fs.readFileSync(path.join(root, 'app', 'studio', 'page.js'), 'utf8')

console.log('=== 1. Page answers WHO / WHY TEAK / HOW (structure) ===')
{
  test('hero section preserved (CMS-backed)', /page-hero/.test(page))
  test('origin section preserved (WHO Teakle is)', /className="origin/.test(page) || /className={`origin/.test(page))
  test('why-teak lead band present', /why-teak/.test(page))
  test('materials grid preserved (THE MATERIAL)', /materials-grid/.test(page))
  test('process roadmap preserved (HOW WE WORK)', /process-roadmap/.test(page))
  test('material→design→craft→object→use chain stated', /Material → Design → Craft → Object → Long-term use/.test(page))
  test('closing band transitions into the collection', /studio-closing/.test(page))
}

console.log('\n=== 2. Authentic copy preserved verbatim ===')
{
  test('origin story preserved', /A carpentry practice that became a workshop, over three generations/.test(page))
  test('hand-built statement preserved', /planned by hand, built by hand, and finished by hand/.test(page))
  test('why-teak item elevated (not rewritten)', /whyTeak\.body/.test(page) && /whyTeak\.title/.test(page) && /findIndex/.test(page))
  test('why-teak source copy is authentic CMS content', (() => {
    const cms = fs.readFileSync(path.join(root, 'lib', 'cms.js'), 'utf8')
    return /natural oils/.test(cms) && /shipbuilding/.test(cms)
  })())
  test('why-teak not duplicated in grid', /materialRest\.map/.test(page))
  test('process milestones preserved', /Selection/.test(page) && /Joinery/.test(page) && /Finishing/.test(page) && /Inspection/.test(page))
  test('gallery section preserved', /The people and tools behind every piece/.test(page))
  test('brand line uses verified handbook language', /Not furniture\. Heirlooms/.test(page))
}

console.log('\n=== 3. No invented claims or superlatives ===')
{
  const lower = page.toLowerCase()
  test('no "best wood" superlative', !/best wood/.test(lower))
  test('no "lasts forever"', !/lasts forever/.test(lower))
  test('no geographic exclusivity claim', !/only grows/.test(lower) && !/exclusively/.test(lower))
  test('no invented founder biography', !/founder/.test(lower))
  test('no invented awards/certifications', !/award/.test(lower) && !/certifi/.test(lower))
  test('no fake metrics/statistics', !/years of experience/.test(lower) && !/craftsmen/.test(lower))
}

console.log('\n=== 4. Functionality, routes, system preserved ===')
{
  test('StudioRoadmap (reveal/motion) preserved', /StudioRoadmap/.test(page))
  test('CMS content architecture preserved', /getPublishedPageSections/.test(page) && /seedDefaultSections/.test(page))
  test('design-resolution preserved', /resolvePageDesign/.test(page))
  test('closing links to existing /gallery route', /href="\/gallery"/.test(page))
  test('no new destinations invented', !/href="\/(atelier|stories|showroom|museum)"/.test(page))
  test('no new typeface introduced', !/@font-face/.test(page) && !/fonts\.googleapis/.test(page) && !/font-family:\s*["']?(serif|Georgia|Playfair|serif)/i.test(page))
  test('no new animation dependency', !/framer-motion/.test(page) && !/gsap/.test(page))
}

console.log('\n=== 5. Editorial composition + responsive ===')
{
  test('origin image extreme-left bleed (full-bleed grid)', /\.origin-grid\s*\{[^}]*max-width:\s*none/.test(page))
  test('origin imagery landscape/cinematic', /\.origin-image\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/.test(page))
  test('materials header left-aligned editorial', /\.materials-header\s*\{[^}]*text-align:\s*left/.test(page))
  test('mobile recomposition present (860px)', /max-width:\s*860px/.test(page))
  test('mobile why-teak scales intentionally', /why-teak-statement/.test(page) && /clamp\(1\.3rem/.test(page))
  test('no fixed viewport-width widths that overflow', !/width:\s*100vw/.test(page))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

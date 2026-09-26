/**
 * T02 — Global desktop spatial composition.
 *
 * Guarantees the homepage uses large viewports intentionally instead of
 * rendering as a narrow centered column:
 *   - global spatial tokens cap wide enough for desktop editorial use
 *   - major sections reference the wide measure (no 1200px-only caps)
 *   - atelier/signature grid is fluid (no fixed 590px-only column)
 *   - atelier band carries intentional desktop gutters
 *   - carousel holds desktop presence (no 240px-only items)
 *   - mobile collapse behaviour is preserved (no regression)
 *   - no generic dashboard/card layout is introduced
 *
 * Run: node __tests__/homepage-desktop-composition.test.js
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
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8')
const homepage = fs.readFileSync(path.join(root, 'app', 'homepage.css'), 'utf8')
const homeClient = fs.readFileSync(path.join(root, 'app', 'HomeClient.js'), 'utf8')

const pxOf = (css, name) => {
  const m = css.match(new RegExp(name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\s*:\\s*(\\d+)px'))
  return m ? parseInt(m[1], 10) : null
}

console.log('=== 1. Global spatial tokens support desktop editorial widths ===')
{
  const container = pxOf(styles, '--container')
  const wide = pxOf(styles, '--content-wide')
  const containerWide = pxOf(styles, '--container-wide')
  const narrow = pxOf(styles, '--content-narrow')
  test('--container caps at >= 1360px', container !== null && container >= 1360, `got ${container}`)
  test('--content-wide caps at >= 1120px', wide !== null && wide >= 1120, `got ${wide}`)
  test('--container-wide exists at >= 1500px', containerWide !== null && containerWide >= 1500, `got ${containerWide}`)
  test('--content-narrow reading measure preserved (<= 760px)', narrow !== null && narrow <= 760, `got ${narrow}`)
}

console.log('\n=== 1b. CMS design fallback does not confine sections ===')
{
  const designRes = fs.readFileSync(path.join(root, 'lib', 'designResolution.js'), 'utf8')
  const m = designRes.match(/pageDesign\.contentWidth\s*\|\|\s*'(\d+)px'/)
  const fallback = m ? parseInt(m[1], 10) : null
  test("resolvePageDesign contentWidth fallback is wide (>= 1500px)", fallback !== null && fallback >= 1500, `got ${fallback}`)
  test('inline section style still honors explicit CMS overrides', /sectionOverrides\.contentWidth \|\| pageDesignDefaults\.contentWidth/.test(designRes))
}

console.log('\n=== 2. Major sections use the wide measure (not confined) ===')
{
  const trustWide = /\.v2-trust-inner\s*\{[^}]*max-width:\s*var\(--container-wide\)/.test(homepage)
  // T06 moved craft to an extreme-left full-bleed composition (image flush to
  // the viewport edge), which is strictly wider than container-wide and keeps
  // the T02 "not confined" intent. Accept either measure here.
  const craftWide = /\.v2-craft-grid\s*\{[^}]*max-width:\s*(var\(--container-wide\)|none)/.test(homepage)
  const productsWide = /\.v2-products\s+\.container\s*\{[^}]*max-width:\s*var\(--container-wide\)/.test(homepage)
  const sigWide = /\.v2-sig-editorial-inner\s*\{[^}]*max-width:\s*var\(--container-wide\)/.test(homepage)
  test('trust inner uses wide measure', trustWide)
  test('craft grid uses wide measure', craftWide)
  test('products container uses wide measure', productsWide)
  test('signature inner uses wide measure', sigWide)

  const confinedTrust = /\.v2-trust-inner\s*\{[^}]*max-width:\s*var\(--container\)\s*;/.test(homepage)
  const confinedCraft = /\.v2-craft-grid\s*\{[^}]*max-width:\s*var\(--container\)\s*;/.test(homepage)
  test('trust inner no longer capped at narrow --container', !confinedTrust)
  test('craft grid no longer capped at narrow --container', !confinedCraft)
}

console.log('\n=== 3. Philosophy editorial composition (T03 recomposition) ===')
{
  // T03 moved philosophy onto the wide measure with an asymmetric grid.
  // (Supersedes the T02 content-wide expectation: the narrow left-anchored
  // column left unstructured dead space on desktop.)
  const philUsesContainerWide = /\.v2-philosophy-inner\s*\{[^}]*max-width:\s*var\(--container-wide\)/.test(homepage)
  const philGrid = homepage.match(/\.v2-philosophy-inner\s*\{[^}]*grid-template-columns:\s*([^;]+);/)
  const philCols = philGrid ? philGrid[1] : ''
  const h2Wide = /\.v2-philosophy h2\s*\{[^}]*max-width:\s*5\dch/.test(homepage)
  const pWide = /\.v2-philosophy p\s*\{[^}]*max-width:\s*6\dch/.test(homepage)
  test('philosophy inner uses container-wide token', philUsesContainerWide)
  test('philosophy inner is an asymmetric grid (no single narrow column)', /minmax\(0,\s*7fr\)\s*minmax\(0,\s*5fr\)/.test(philCols), `got "${philCols.trim()}"`)
  test('philosophy h2 measure widened beyond 42ch', h2Wide)
  test('philosophy body measure widened beyond 60ch', pWide)
  test('philosophy centered variant keeps intentional single column', /\.v2-philosophy--centered\s+\.v2-philosophy-inner\s*\{[^}]*display:\s*block/.test(homepage))
  test('philosophy collapses to stacked block on tablet', /max-width:\s*860px[\s\S]*?\.v2-philosophy-inner\s*\{\s*display:\s*block/.test(homepage))
}

console.log('\n=== 4. Atelier/signature grid is fluid, with intentional gutters ===')
{
  // Stylesheet must not freeze the media column at a fixed pixel width.
  const cssGrid = homepage.match(/\.v2-sig-editorial-grid\s*\{[^}]*grid-template-columns:\s*([^;]+);/)
  const cssCols = cssGrid ? cssGrid[1] : ''
  test('stylesheet grid is fluid (minmax/fr, no fixed px column)', /minmax/.test(cssCols) && !/\b590px\b/.test(cssCols), `got "${cssCols.trim()}"`)
  test('stylesheet atelier wrapper carries desktop gutters', /\.v2-atelier-wrapper\s*\{[^}]*padding:[^}]*var\(--cin-gutter-wide\)/.test(homepage))

  // Runtime critical CSS (with !important) must agree — it wins over the file.
  // NOTE (T04): the ratio is intentionally asymmetric 7fr/5fr (was 5fr/6fr);
  // fluidity (minmax/fr, no fixed px) is what this assertion guards.
  const jsGridFixed = /grid-template-columns:\s*590px\s+1fr\s*!important/.test(homeClient)
  const jsGridFluid = /grid-template-columns:\s*minmax\(0,\s*\d+fr\)\s*minmax\(0,\s*\d+fr\)\s*!important/.test(homeClient)
  test('runtime critical CSS grid is fluid (no 590px-only rule)', !jsGridFixed && jsGridFluid)
  test('runtime critical CSS wrapper carries desktop gutters', /\.v2-atelier-wrapper\s*\{[^}]*clamp\(3\.5rem[^}]*!important/.test(homeClient))
  test('runtime critical CSS resets wrapper on mobile', /max-width:\s*768px[\s\S]*?\.v2-atelier-wrapper\s*\{\s*padding:\s*0\s*!important/.test(homeClient))
}

console.log('\n=== 5. Carousel and lifestyle hold desktop presence ===')
{
  const item = homepage.match(/\.v2-citem\s*\{[^}]*flex:\s*0\s+0\s+([^;]+);/)
  const basis = item ? item[1] : ''
  test('carousel item scales with viewport (clamp/vw, >= 260px min)', /clamp\(280px,\s*22vw,\s*360px\)/.test(basis), `got "${basis.trim()}"`)
  test('carousel section uses wide gutters', /\.carousel\s*\{[^}]*padding:[^}]*var\(--cin-gutter-wide\)/.test(homepage))
  test('lifestyle content measure widened (640px cap removed)', !/\.v2-lifestyle-content\s*\{[^}]*max-width:\s*640px/.test(homepage))
}

console.log('\n=== 6. Mobile behaviour preserved ===')
{
  test('tablet collapse breakpoint present (860px)', /@media\s*\(\s*max-width:\s*860px\s*\)/.test(homepage))
  test('mobile breakpoint present (560px)', /@media\s*\(\s*max-width:\s*560px\s*\)/.test(homepage))
  test('small-mobile breakpoint present (430px)', /@media\s*\(\s*max-width:\s*430px\s*\)/.test(homepage))
  test('signature grid collapses to single column on tablet', /max-width:\s*860px[\s\S]*?\.v2-sig-editorial-grid\s*\{\s*grid-template-columns:\s*1fr/.test(homepage))
  test('craft grid collapses to single column on tablet', /max-width:\s*860px[\s\S]*?\.v2-craft-grid\s*\{\s*grid-template-columns:\s*1fr/.test(homepage))
  test('product grid collapses to 2-up on tablet', /max-width:\s*860px[\s\S]*?\.pgrid\s*\{\s*grid-template-columns:\s*repeat\(2,\s*1fr\)/.test(homepage))
  test('runtime critical CSS collapses grid at tablet', /max-width:\s*1024px[\s\S]*?\.v2-sig-editorial-grid\s*\{\s*grid-template-columns:\s*1fr\s*!important/.test(homeClient))
}

console.log('\n=== 7. No generic dashboard/card layout introduced ===')
{
  test('no dashboard class introduced', !/dashboard/i.test(homepage))
  test('no card-grid class introduced', !/card-grid/i.test(homepage))
  test('no glassmorphism introduced', !/backdrop-filter\s*:\s*blur\(20px\)/i.test(homepage))
  test('no large shadow system introduced', !/box-shadow:\s*0\s+24px/i.test(homepage))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

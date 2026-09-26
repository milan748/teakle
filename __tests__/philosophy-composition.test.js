/**
 * T03 — Philosophy section composition.
 *
 * Guarantees the Philosophy section uses desktop space intentionally via an
 * asymmetric editorial grid instead of a narrow left-anchored column:
 *   - inner spans the wide measure (container-wide, centered, wide gutters)
 *   - statement (eyebrow + title) and body are separate grid fields
 *   - body field carries a restrained architectural top rule
 *   - type scale is unchanged (no arbitrary oversized text)
 *   - copy is preserved (no invented content)
 *   - centered variant keeps its intentional single column
 *   - mobile collapses to an independent stacked composition
 *   - brand constraints hold (Instrument Sans only, palette tokens only)
 *
 * Run: node __tests__/philosophy-composition.test.js
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

console.log('=== 1. Desktop uses available space intentionally ===')
{
  test('inner uses container-wide measure',
    /\.v2-philosophy-inner\s*\{[^}]*max-width:\s*var\(--container-wide\)/.test(homepage))
  test('inner is centered (no left-anchored dead space)',
    /\.v2-philosophy-inner\s*\{[^}]*margin:\s*0\s+auto/.test(homepage))
  test('inner carries wide desktop gutters',
    /\.v2-philosophy-inner\s*\{[^}]*padding:\s*0\s*var\(--cin-gutter-wide\)/.test(homepage))
  const grid = homepage.match(/\.v2-philosophy-inner\s*\{[^}]*grid-template-columns:\s*([^;]+);/)
  const cols = grid ? grid[1] : ''
  test('asymmetric statement/body columns (7fr / 5fr)', /minmax\(0,\s*7fr\)\s*minmax\(0,\s*5fr\)/.test(cols), `got "${cols.trim()}"`)
}

console.log('\n=== 2. Statement/body field relationship ===')
{
  test('statement wrapper exists in markup', homeClient.includes('v2-philosophy-statement'))
  test('body wrapper exists in markup', homeClient.includes('v2-philosophy-body'))
  test('eyebrow renders inside statement field',
    /v2-philosophy-statement[\s\S]*?className="eyebrow"/.test(homeClient))
  test('body field has restrained architectural top rule',
    /\.v2-philosophy-body\s*\{[^}]*border-top:\s*1px\s+solid/.test(homepage))
  test('rule uses palette token (no invented colour)',
    /\.v2-philosophy-body\s*\{[^}]*border-top:\s*1px\s+solid\s+var\(--cin-stone-light\)/.test(homepage))
}

console.log('\n=== 3. Type scale restrained, copy preserved ===')
{
  const h2 = homepage.match(/\.v2-philosophy h2\s*\{[^}]*\}/)
  test('h2 keeps restrained display size (no oversized text)',
    /font-size:\s*clamp\(1\.25rem,\s*2\.4vw,\s*1\.875rem\)/.test(h2 ? h2[0] : ''))
  test('h2 keeps editorial measure', /\.v2-philosophy h2\s*\{[^}]*max-width:\s*56ch/.test(homepage))
  test('body keeps editorial measure', /\.v2-philosophy p\s*\{[^}]*max-width:\s*68ch/.test(homepage))
  test('eyebrow copy preserved', homeClient.includes("'Why We Exist'"))
  test('title copy preserved',
    homeClient.includes("'We make objects that are not finished when they leave the workshop.'"))
  test('body paragraph 1 preserved',
    homeClient.includes('the grain deepens, the surface catches light differently'))
  test('body paragraph 2 preserved',
    homeClient.includes('run by the same hands for three generations'))
  test('no new invented copy in section',
    !/v2-philosophy[\s\S]{0,2000}?(testimonial|award|certified|statistics)/i.test(homeClient))
}

console.log('\n=== 4. Centered variant stays intentionally narrow ===')
{
  test('centered variant keeps single column',
    /\.v2-philosophy--centered\s+\.v2-philosophy-inner\s*\{[^}]*display:\s*block/.test(homepage))
  test('centered variant keeps narrow reading measure',
    /\.v2-philosophy--centered\s+\.v2-philosophy-inner\s*\{[^}]*max-width:\s*var\(--content-narrow\)/.test(homepage))
}

console.log('\n=== 5. Mobile is independently sensible ===')
{
  test('tablet stacks to block', /max-width:\s*860px[\s\S]*?\.v2-philosophy-inner\s*\{\s*display:\s*block/.test(homepage))
  test('tablet removes body rule for stacked rhythm',
    /max-width:\s*860px[\s\S]*?\.v2-philosophy-body\s*\{[^}]*border-top:\s*none/.test(homepage))
  test('small-mobile breakpoint refines philosophy',
    /max-width:\s*560px[\s\S]*?\.v2-philosophy h2/.test(homepage))
  test('no horizontal lock-in on tablet (inner max 100%)',
    /max-width:\s*860px[\s\S]*?\.v2-philosophy-inner\s*\{[^}]*max-width:\s*100%/.test(homepage))
}

console.log('\n=== 6. Brand constraints hold ===')
{
  const philCss = (homepage.match(/\/\* ---- Philosophy ----[\s\S]*?\/\* Philosophy variant: centered/) || [''])[0]
  test('no serif/script/decorative font introduced',
    !/font-family:\s*[^;]*(serif|Georgia|Playfair|script|cursive)/i.test(philCss))
  test('no gradient introduced', !/linear-gradient|radial-gradient/i.test(philCss))
  test('no heavy shadow introduced', !/box-shadow/i.test(philCss))
  test('no rounded-card treatment introduced', !/border-radius/i.test(philCss))
  test('no hard-coded hex colour introduced', !/#[0-9a-fA-F]{3,6}/.test(philCss))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

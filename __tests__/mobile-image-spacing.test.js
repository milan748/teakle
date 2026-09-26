/**
 * T14 — Refine mobile image crops and spacing.
 *
 * After the independent mobile composition (T13), resolve remaining
 * mobile image/spacing defects:
 *   - signature CTA micro-type (6px) + sub-44px targets on <=560px
 *   - hanging "·" separator when signature features wrap on mobile
 *   - workshop lifestyle focal point on mobile (blurred mallet dome
 *     dominates; action sits off-center under the desktop 50% 18% crop)
 *   - footer density on mobile (full-width rows of 7px links)
 *   - desktop composition untouched; no fixed-pixel mobile widths;
 *     commerce, navigation, grids and carousels preserved
 *
 * Run: node __tests__/mobile-image-spacing.test.js
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
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8')
const homeClient = fs.readFileSync(path.join(root, 'app', 'HomeClient.js'), 'utf8')

const desktopHome = homepage.slice(0, homepage.indexOf('@media (max-width: 860px)'))
const media860Home = homepage.slice(homepage.indexOf('@media (max-width: 860px)'))
const media560Home = homepage.slice(homepage.indexOf('@media (max-width: 560px)'))
const footerAnchor = '/* Footer — compact luxury mobile */'
const footerMobile = styles.slice(styles.indexOf(footerAnchor))

console.log('=== 1. Signature mobile CTAs are legible + tappable ===')
{
  test('no 6px micro-type left in mobile signature buttons',
    !/font-size:\s*0\.375rem/.test(media560Home)
    && !/\.v2-sig-btn-(primary|outline)\s*\{[^}]*font-size:\s*var\(--text-caption\)/.test(media560Home))
  const btnRule = media560Home.match(/\.v2-sig-btn-primary\s*\{([^}]*)\}/)
  const size = btnRule && btnRule[1].match(/font-size:\s*([\d.]+)rem/)
  test('mobile signature buttons use readable type (>= 0.7rem)',
    size && parseFloat(size[1]) >= 0.7, size ? `got ${size[1]}rem` : 'rule not found')
  const height = btnRule && btnRule[1].match(/min-height:\s*(\d+)px/)
  test('mobile signature buttons meet 44px touch target',
    height && parseInt(height[1], 10) >= 44, height ? `got ${height[1]}px` : 'rule not found')
}

console.log('\n=== 2. Signature features wrap cleanly on mobile ===')
{
  test('hanging dot separator hidden on mobile features wrap',
    /\.v2-sig-feature\s*\+\s*\.v2-sig-feature::before\s*\{[^}]*display:\s*none/.test(media560Home))
  test('mobile features use a 2-column grid (no orphan separators)',
    /\.v2-sig-editorial-features\s*\{[^}]*grid-template-columns:\s*1fr\s+1fr/.test(media560Home))
}

console.log('\n=== 3. Workshop lifestyle focal point corrected on mobile ===')
{
  const focal = media860Home.match(/\.v2-lifestyle:not\(\.v2-lifestyle--alt\)\s+\.v2-lifestyle-bg\s*\{([^}]*)\}/)
  const pos = focal && focal[1].match(/object-position:\s*50%\s+(\d+)%/)
  test('mobile workshop crop favors the hand/chisel action (25-40% vertical)',
    pos && parseInt(pos[1], 10) >= 25 && parseInt(pos[1], 10) <= 40,
    pos ? `got 50% ${pos[1]}%` : 'override not found')
  test('desktop workshop focal unchanged (50% 18%)',
    /\.v2-lifestyle-bg\s*\{[^}]*object-position:\s*50%\s+18%/.test(homepage))
}

console.log('\n=== 4. Mobile footer density ===')
{
  test('mobile footer link lists use a 2-column grid',
    /\.footer-col[^{]*ul\s*\{[^}]*grid-template-columns:\s*repeat\(2/.test(footerMobile))
  const footLink = footerMobile.match(/\.footer-col\s+a\s*\{([^}]*)\}/)
  const footSize = footLink && footLink[1].match(/font-size:\s*([\d.]+)rem/)
  test('mobile footer links are legible (>= 0.7rem)',
    footSize && parseFloat(footSize[1]) >= 0.7, footSize ? `got ${footSize[1]}rem` : 'rule not found')
  test('desktop footer keeps its 4-column grid',
    /\.footer-grid\s*\{[^}]*grid-template-columns:\s*1\.4fr\s+1fr\s+1fr\s+1\.3fr/.test(styles))
}

console.log('\n=== 5. No desktop/mobile regressions ===')
{
  test('desktop signature grid keeps asymmetric columns',
    /\.v2-sig-editorial-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*7fr\)\s*minmax\(0,\s*5fr\)/.test(desktopHome))
  test('mobile signature stays single-column',
    /@media\s*\(\s*max-width:\s*860px\s*\)[\s\S]*?\.v2-sig-editorial-grid\s*\{[^}]*grid-template-columns:\s*1fr/.test(homepage))
  test('no fixed-pixel two-column grid leaks into mobile',
    !/max-width:\s*860px[\s\S]*?\.v2-sig-editorial-grid\s*\{[^}]*590px/.test(homepage))
  test('product grid still 2-up on mobile',
    /max-width:\s*860px[\s\S]*?\.pgrid\s*\{\s*grid-template-columns:\s*repeat\(2,\s*1fr\)/.test(homepage))
  test('carousel strip preserved on mobile',
    /max-width:\s*860px[\s\S]*?\.v2-citem\s*\{[^}]*flex:\s*0\s+0/.test(homepage))
  test('mobile bottom navigation styles preserved', /bottom-nav|mobile-nav/i.test(styles))
  test('signature commerce markup preserved (price, CTAs, wishlist)',
    /v2-sig-editorial-price-amount/.test(homeClient)
    && /INQUIRE TO OWN/.test(homeClient)
    && /WATCH THE PROCESS/.test(homeClient)
    && /v2-sig-wishlist/.test(homeClient))
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

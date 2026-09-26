/**
 * T01 - Global Header and Icon System.
 * Verifies: mobile main header keeps wishlist/cart/account (no search),
 * search lives in drawer, header icons use consistent 20px / 1.5 stroke,
 * desktop keeps Search/Wishlist/Cart/Account, routes preserved.
 * Run: node __tests__/header-icon-system.test.js
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
const header = fs.readFileSync(path.join(root, 'app', 'components', 'Header.js'), 'utf8')
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8')

console.log('=== 1. Mobile main header keeps wishlist/cart/account, no search ===')
{
  const mobileBlock = header.match(/header-mobile-actions[\s\S]*?<\/div>/)
  const block = mobileBlock ? mobileBlock[0] : ''
  test('mobile header has wishlist link', /href="\/wishlist"/.test(block))
  test('mobile header has cart link', /href="\/cart"/.test(block))
  test('mobile header has account link', /\/login/.test(block) && /aria-label="Account"/.test(block))
  test('mobile header has NO search trigger', !/aria-label="Search"/.test(block))
}

console.log('\n=== 2. Search lives in drawer/sidebar ===')
{
  test('drawer contains mobile search bar', /nav-mobile-search-bar/.test(header))
  test('drawer search input present', /nav-mobile-search-input/.test(header))
  test('desktop search overlay preserved', /search-overlay/.test(header) && /openSearch/.test(header))
}

console.log('\n=== 3. Consistent icon sizing / stroke ===')
{
  const headerSvgs = [...header.matchAll(/<svg[^>]*width="(\d+)"[^>]*strokeWidth="([\d.]+)"/g)]
  // header-icon svgs (20px) — allow 16px dropdown-item icons and 20px chevron
  const iconSizes = headerSvgs.map(m => `${m[1]}/${m[2]}`)
  const bad = headerSvgs.filter(m => !['20/1.5', '16/1.5', '18/1.5'].includes(`${m[1]}/${m[2]}`))
  test('no stray icon size/stroke combos', bad.length === 0, bad.map(m => m[0].slice(0, 80)).join(' | '))
  test('chevron uses 1.5 stroke (not 2)', !/strokeWidth="2"/.test(header), iconSizes.join(','))
  test('CSS enforces 20px header icons', /\.header-icon svg\s*\{[^}]*width:\s*20px[^}]*height:\s*20px[^}]*stroke-width:\s*1\.5/.test(styles))
  test('CSS enforces round caps/joins', /\.header-icon svg\s*\{[^}]*stroke-linecap:\s*round[^}]*stroke-linejoin:\s*round/.test(styles))
}

console.log('\n=== 4. Desktop keeps restrained premium controls ===')
{
  test('desktop has search', /header-actions[\s\S]*?aria-label="Search"/.test(header))
  test('desktop has wishlist (/wishlist)', /header-actions[\s\S]*?href="\/wishlist"/.test(header))
  test('desktop has cart (/cart)', /header-actions[\s\S]*?href="\/cart"/.test(header))
  test('desktop has account trigger', /account-trigger[\s\S]*?aria-label="Account"/.test(header) || /header-actions[\s\S]*?aria-label="Account"/.test(header))
}

console.log('\n=== 5. Routes / commerce preserved ===')
{
  for (const r of ['/gallery', '/archive', '/studio', '/journal', '/custom', '/wishlist', '/cart', '/login', '/account']) {
    test(`route ${r} referenced`, header.includes(r))
  }
}

console.log(`\n${passed} passed, ${failed} failed`)
if (true) {
  // Desktop restraint: drawer icons must not leak onto desktop nav
  const desktopHidesDrawerIcons = /min-width:\s*861px[\s\S]*?\.nav-mobile-icon\s*\{\s*display:\s*none/.test(styles)
  if (desktopHidesDrawerIcons) { console.log('  PASS: desktop hides drawer icons (text-only nav)'); passed++ }
  else { console.log('  FAIL: desktop does not hide drawer icons'); failed++ }
}
console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

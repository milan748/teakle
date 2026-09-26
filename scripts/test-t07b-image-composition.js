/**
 * T07B — Cinematic homepage image composition tests.
 * Run: node scripts/test-t07b-image-composition.js
 *
 * Guards the T07B editorial image language (static, deterministic):
 *  - CSS (not a CMS-default inline style) governs image focal defaults
 *  - signature product image keeps the object intact (4/3, bottom-anchored)
 *  - craft field is calmed, lifestyle frames use intentional focals
 *  - product data and commerce controls are untouched
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
let passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  catch (err) { failed++; console.log(`  \x1b[31m✗\x1b[0m ${name}`); console.log(`    ${err.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function count(h, n) { return (h.match(new RegExp(n, 'g')) || []).length; }

const css = fs.readFileSync(path.join(root, 'app', 'homepage.css'), 'utf8');
const home = fs.readFileSync(path.join(root, 'app', 'HomeClient.js'), 'utf8');
const design = fs.readFileSync(path.join(root, 'lib', 'designResolution.js'), 'utf8');
const products = fs.readFileSync(path.join(root, 'app', 'data', 'products.js'), 'utf8');

// ── 1. Explicit-focal helper: CSS governs defaults, CMS wins when set ──
console.log('\n1. Focal precedence (CSS default, CMS override)');
test('designResolution exports hasExplicitFocal', () => {
  assert(design.includes('export function hasExplicitFocal'), 'helper missing');
});
test('helper honours base focalX/focalY', () => {
  assert(design.includes('el.focalX !== undefined || el.focalY !== undefined'), 'base check missing');
});
test('helper honours tablet/mobile subkeys', () => {
  assert(design.includes('el.tablet.focalX !== undefined'), 'tablet check missing');
  assert(design.includes('el.mobile.focalX !== undefined'), 'mobile check missing');
});
test('HomeClient imports hasExplicitFocal', () => {
  assert(home.includes('hasExplicitFocal'), 'import missing');
});
test('all five focal sites are conditional (hero x2, craft, workshop, process)', () => {
  assert(count(home, 'hasExplicitFocal\\(') === 5, 'expected 5 conditional call sites');
});
test('no unconditional inline objectPosition from focal default remains', () => {
  assert(!home.includes(', objectPosition: focalPointToObjectPosition'), 'unconditional override remains');
});

// ── 2. Signature image: object intact in landscape ──
console.log('\n2. Signature product composition');
test('stylesheet signature images use 4/3 bottom-anchored crop', () => {
  assert(count(css, 'aspect-ratio: 4/3') >= 3, 'expected desktop x2 + mobile signature rules');
  assert(count(css, 'object-position: 50% 100%') >= 3, 'expected matching focal rules');
});
test('injected atelier critical CSS mirrors the composition', () => {
  const idx = home.indexOf('atelierCriticalCSS');
  const block = home.slice(idx, idx + 20000);
  assert(block.includes('aspect-ratio: 4/3 !important'), 'critical CSS aspect missing');
  assert(block.includes('object-position: 50% 100% !important'), 'critical CSS focal missing');
});

// ── 3. Craft + lifestyle focals ──
console.log('\n3. Craft and lifestyle composition');
test('craft field height calmed to min(68vh, 640px)', () => {
  assert(css.includes('min-height: min(68vh, 640px)'), 'craft scale missing');
});
test('workshop cinematic frame favours upper-third action', () => {
  assert(css.includes('object-position: 50% 28%'), 'workshop focal missing');
});
test('process frame favours maker and bench', () => {
  assert(css.includes('object-position: 50% 62%'), 'process focal missing');
});

// ── 4. Content integrity + commerce preserved ──
console.log('\n4. Integrity guards');
test('anchor-table product image source unchanged', () => {
  assert(products.includes('11112739/pexels-photo-11112739.jpeg'), 'product image changed');
});
test('purchase controls preserved', () => {
  assert(home.includes('INQUIRE TO OWN'), 'primary CTA missing');
  assert(home.includes('WATCH THE PROCESS'), 'secondary CTA missing');
  assert(home.includes('v2-sig-wishlist'), 'wishlist control missing');
  assert(home.includes('v2-sig-editorial-price-amount'), 'price block missing');
});
test('grids and carousels preserved', () => {
  assert(home.includes('v2-ctrack'), 'carousel track missing');
  assert(home.includes('pgrid'), 'product grid missing');
});

console.log(`\n${passed}/${total} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

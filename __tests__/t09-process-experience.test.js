/**
 * T09 — Watch the Process experience.
 *
 * Verifies the refined /process/[slug] client against the task contract
 * using only static source inspection (no invented content, no fake media).
 *
 * Run: node __tests__/t09-process-experience.test.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const clientPath = path.join(root, 'app', 'process', '[slug]', 'ProcessPageClient.js');
const processDataPath = path.join(root, 'app', 'data', 'process.js');
const productsDataPath = path.join(root, 'app', 'data', 'products.js');

const clientRaw = fs.readFileSync(clientPath, 'utf8');
/* Strip comments: the header documents what must NOT be invented, so those
   words may legitimately appear in comments but never in rendered copy. */
const client = clientRaw
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\s)\/\/.*$/gm, '$1');
const processData = fs.readFileSync(processDataPath, 'utf8');
const productsData = fs.readFileSync(productsDataPath, 'utf8');

let passed = 0;
let failed = 0;
function test(name, cond) {
  if (cond) { passed++; console.log(`  PASS ${name}`); }
  else { failed++; console.log(`  FAIL ${name}`); }
}

console.log('\n=== 1. No fabricated video / empty placeholders ===');
test('no "coming soon" placeholder copy', !/coming soon/i.test(client));
test('no ProcessVideo empty-state rendering', !client.includes('process-video-empty'));
test('no fake play button', !/play-button|btn-play|▶|watch-video/i.test(client));
test('no autoplay with sound', !/autoPlay/i.test(client));

console.log('\n=== 2. Journey MATERIAL → MAKING → TIME → OBJECT ===');
test('journey anchors present', ['#material', '#making', '#time', '#object'].every((a) => client.includes(a)));
test('material section present', client.includes('id="material"'));
test('making section present', client.includes('id="making"'));
test('time section present', client.includes('id="time"'));
test('object section present', client.includes('id="object"'));

console.log('\n=== 3. Authentic data only ===');
test('build time surfaced from product data', client.includes('buildTime') || client.includes('Build time'));
test('material record built from specifications', client.includes('specifications'));
test('price preserved on process page', client.includes('priceFormatted'));
test('no invented artisan identities', !/artisan\s+(Ram|Sharma|Kumar|family name|master craftsman [A-Z])/i.test(client));
test('no invented heritage/awards/certifications', !/heritage|award|certifi|ISO|FSC/i.test(client));
test('no invented labor counts', !/artisans|craftsmen|workers/i.test(client));

console.log('\n=== 4. Sharing uses the exact existing destination ===');
test('instagram URL is the existing destination', client.includes('https://www.instagram.com/teaklestudio'));
test('no fabricated instagram handle', !/teakle_official|teakle\.atelier|teakle_craft(?!studio)/i.test(client));
test('native share with clipboard fallback', client.includes('navigator.share') && client.includes('navigator.clipboard'));

console.log('\n=== 5. Navigation / CTA back to the object ===');
test('links back to the product page', client.includes('/shop/${product.id}') || client.includes('`/shop/`'));
test('studio link preserved', client.includes('"/studio"'));
test('journal cross-link present', client.includes('"/journal"'));
test('no duplicate nav system', !/<nav.*nav-links/i.test(client));

console.log('\n=== 6. Editorial composition, typography, responsive ===');
test('full-bleed hero (no narrow centered column)', client.includes('max-width: none') && /min-height:\s*82vh/.test(client));
test('ultra-wide cinematic break', /height:\s*clamp\(320px,\s*62vh/.test(client));
test('extreme-right figure block', client.includes('proc-split'));
test('Instrument Sans only (no new font)', !/font-family:\s*["']?(serif|Georgia|Playfair|Cormorant)/i.test(client));
test('mobile breakpoint with no-overflow guard', client.includes('overflow-x: clip') && client.includes('max-width: 860px'));
test('reduced-motion respected', client.includes('prefers-reduced-motion'));

console.log('\n=== 7. Data model untouched ===');
test('process data still has anchor-table slug', processData.includes("slug: 'anchor-table'"));
test('no video URLs fabricated in data', !/videoUrl:\s*['"]http/i.test(processData));
test('product build time intact in dataset', productsData.includes('"~18 hours"') || productsData.includes('~18 hours'));

console.log(`\nT09: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);

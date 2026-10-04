/**
 * T09 — Watch the Process experience (hero making-of page).
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

console.log('\n=== 1. Product name first, film dominant ===');
test('renders an h1 with the product name', /<h1>\{name\}<\/h1>/.test(client));
test('h1 precedes the video element', client.indexOf('<h1>') < client.indexOf('<video'));
test('no invented product name', !/MAFDET/i.test(client));
test('native video element with controls + poster', /<video[\s\S]*?controls[\s\S]*?poster/.test(client));
test('16:9 aspect preserved', /aspect-ratio:\s*16\s*\/\s*9/.test(client));
test('playsInline + preload none (no autoplay with sound)', client.includes('playsInline') && client.includes('preload="none"') && !/autoPlay/i.test(client));
test('no "coming soon" placeholder copy', !/coming soon/i.test(client));
test('no fake play button', !/play-button|btn-play|▶|watch-video/i.test(client));

console.log('\n=== 2. Short editorial sequence in order ===');
const order = ['id="film"', 'id="introduction"', 'id="material"', 'id="making"', 'id="time"', 'id="object"', 'id="own"'];
test('all section anchors present', order.every((a) => client.includes(a)));
test('sections in required order', order.every((a, i) => i === 0 || client.indexOf(order[i - 1]) < client.indexOf(a)));
test('no removed long-form sections remain', !client.includes('id="idea"') && !client.includes('id="living"'));
test('film carries its restrained title', /From timber to object/i.test(client));
test('one-of-one principle: no restock, no recreation', /will not be restocked/i.test(processData) && /will not be recreated/i.test(processData));
test('editorial copy lives in data (CMS-ready)', ['introduction', 'whyTeak', 'idea', 'oneOfOne', 'relationship', 'closing', 'ctaLabels'].every((k) => processData.includes(k)));
test('making shows a five-stage horizontal sequence', /sequenceStages/.test(client) && /repeat\(5,/.test(client));
test('stage descriptions show their opening sentence only', client.includes('firstSentence'));

console.log('\n=== 3. Design language: no gradients, no scroll-reveal ===');
test('no linear gradients', !/linear-gradient/i.test(client));
test('no scroll-reveal hooks', !/reveal/i.test(client) && !/IntersectionObserver/i.test(client));
test('no new font family', !/font-family:\s*["']?(serif|Georgia|Playfair|Cormorant)/i.test(client));
test('mobile breakpoints with no-overflow guard', client.includes('overflow-x: clip') && client.includes('max-width: 900px') && client.includes('max-width: 560px'));

console.log('\n=== 8. Extreme editorial grid (no narrow centered column) ===');
test('prose sections use the shared wide grid', (client.match(/className="mk-ed"/g) || []).length >= 4);
test('grid pairs story measure with a data-backed side record', client.includes('mk-ed-main') && client.includes('mk-ed-side') && client.includes('mk-ed-row'));
test('side records read product data, never invented copy', client.includes("specValue('Material')") && client.includes("specValue('Dimensions')") && client.includes("specValue('Build Time')"));
test('craft pairs finished plate with hand-finishing text', client.includes('mk-time-inner') && client.includes('mk-time-lede'));
test('landscape plates keep full container width, never cropped', /\.mk-plate img\s*\{[^}]*height:\s*auto/.test(client));
test('grids collapse to one column on mobile', /max-width:\s*900px[\s\S]{0,400}?\.mk-ed\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(client));
test('steps collapse without horizontal scroll', /repeat\(2,/.test(client));

console.log('\n=== 4. Authentic data only ===');
test('build time surfaced from product data', client.includes('buildTime'));
test('material record built from specifications', client.includes('specifications'));
test('price preserved on process page', client.includes('priceFormatted'));
test('no invented artisan identities', !/artisan\s+(Ram|Sharma|Kumar|family name|master craftsman [A-Z])/i.test(client));
test('no invented heritage/awards/certifications', !/heritage|award|certifi|ISO|FSC/i.test(client));
test('no invented labor counts', !/artisans|craftsmen|workers/i.test(client));

console.log('\n=== 5. CTA now routes to the Atelier experiences ===');
test('Inquire to Own present', /INQUIRE TO OWN/.test(client));
test('Buy Now present', /BUY NOW/.test(client));
test('Past Collections / archive present', client.includes('"/archive"'));
test('links back to the product page', client.includes('/shop/${product.id}'));
test('studio link preserved', client.includes('"/studio"'));
test('journal cross-link present', client.includes('"/journal"'));
test('no duplicate nav system', !/<nav.*nav-links/i.test(client));

console.log('\n=== 6. Sharing uses the exact existing destination ===');
test('instagram URL is the existing destination', client.includes('https://www.instagram.com/teaklestudio'));
test('no fabricated instagram handle', !/teakle_official|teakle\.atelier|teakle_craft(?!studio)/i.test(client));
test('native share with clipboard fallback', client.includes('navigator.share') && client.includes('navigator.clipboard'));

console.log('\n=== 7. Data model: video-ready, nothing fabricated ===');
test('process data still has anchor-table slug', processData.includes("slug: 'anchor-table'"));
test('film block video-ready with null URL', /videoUrl:\s*null/.test(processData));
test('no video URLs fabricated in data', !/videoUrl:\s*['"]http/i.test(processData));
test('product build time intact in dataset', productsData.includes('"~18 hours"') || productsData.includes('~18 hours'));

console.log(`\nT09: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);

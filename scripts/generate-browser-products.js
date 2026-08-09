/**
 * Generate public/products-browser.js from app/data/products.js
 *
 * The authoritative product dataset lives in app/data/products.js.
 * This script generates a lightweight browser-safe version with only
 * the fields needed for client-side search, cart, and wishlist.
 *
 * Run: node scripts/generate-browser-products.js
 *
 * FIELDS INCLUDED (browser):
 *   id, name, slug, price, priceFormatted, category, categoryName,
 *   subcategory, subcategoryName, material, isHero, availability,
 *   shortDescription, images, thumbnails, tags
 *
 * FIELDS EXCLUDED (server-only):
 *   description, story, craftsmanship, materials, careInstructions,
 *   shipping, returns, specifications, faqs, relatedProducts, dimensions,
 *   weight, finish, buildTime, inventoryQuantity, currency, seats, sku
 */

const fs = require('fs');
const path = require('path');

const SERVER_PATH = path.join(__dirname, '..', 'app', 'data', 'products.js');
const BROWSER_PATH = path.join(__dirname, '..', 'public', 'products-browser.js');

// Extract the PRODUCTS array from the server module
const serverContent = fs.readFileSync(SERVER_PATH, 'utf8');
const match = serverContent.match(/export\s+const\s+PRODUCTS\s*=\s*(\[[\s\S]*?\]);\s*\n\s*export/);
if (!match) {
  console.error('ERROR: Could not extract PRODUCTS array from', SERVER_PATH);
  process.exit(1);
}

const products = eval(match[1]);
console.log(`Read ${products.length} products from ${SERVER_PATH}`);

// Extract only browser-needed fields
const BROWSER_FIELDS = [
  'id', 'name', 'slug', 'price', 'priceFormatted',
  'category', 'categoryName', 'subcategory', 'subcategoryName',
  'material', 'isHero', 'availability',
  'shortDescription', 'images', 'thumbnails', 'tags',
];

const browserProducts = products.map((p) => {
  const obj = {};
  for (const field of BROWSER_FIELDS) {
    if (p[field] !== undefined) {
      obj[field] = p[field];
    }
  }
  return obj;
});

// Generate the browser file
const output = `/* ============================================
   TEAKLE — Browser Product Data (LIGHTWEIGHT)
   AUTO-GENERATED from app/data/products.js
   Do not edit manually. Re-run:
     node scripts/generate-browser-products.js

   Fields included: ${BROWSER_FIELDS.join(', ')}
   Fields excluded: description, story, craftsmanship, materials,
     careInstructions, shipping, returns, specifications, faqs,
     relatedProducts, dimensions, weight, finish, buildTime,
     inventoryQuantity, currency, seats, sku
   ============================================ */
var TEAKLE_PRODUCTS = ${JSON.stringify(browserProducts, null, 2)};
`;

fs.writeFileSync(BROWSER_PATH, output, 'utf8');

const originalSize = fs.statSync(SERVER_PATH).size;
const browserSize = fs.statSync(BROWSER_PATH).size;
console.log(`\nGenerated ${BROWSER_PATH}`);
console.log(`  Server dataset:  ${(originalSize / 1024).toFixed(1)} KB`);
console.log(`  Browser dataset: ${(browserSize / 1024).toFixed(1)} KB`);
console.log(`  Reduction:       ${((1 - browserSize / originalSize) * 100).toFixed(1)}%`);

var fs = require('fs');
eval(fs.readFileSync('public/products.js', 'utf8'));
var p = TEAKLE_PRODUCTS;
var ids = p.map(x => x.id);

// Related products validation
var issues = [];
p.forEach(x => {
  if (x.relatedProducts) {
    if (x.relatedProducts.length > 4) issues.push(x.id + ': ' + x.relatedProducts.length + ' related (>4)');
    x.relatedProducts.forEach(r => {
      if (!ids.includes(r)) issues.push(x.id + ' -> MISSING: ' + r);
      if (r === x.id) issues.push(x.id + ' -> SELF-REF');
    });
    if (new Set(x.relatedProducts).size !== x.relatedProducts.length) issues.push(x.id + ' -> DUPLICATE REFS');
  }
});
console.log('=== RELATED PRODUCTS ===');
console.log(issues.length ? issues.join('\n') : 'ALL VALID');

// Shipping language check
console.log('\n=== SHIPPING LANGUAGE ===');
var shippingIssues = [];
p.forEach(x => {
  if (x.shipping && /made.to.order|lead.time|production|after purchase|after order|upon order|on demand|on request|2.?3 week/i.test(x.shipping)) {
    shippingIssues.push(x.id + ': ' + x.shipping.substring(0, 80));
  }
});
console.log(shippingIssues.length ? shippingIssues.join('\n') : 'CLEAN');

// Hero product check
console.log('\n=== HERO PRODUCT ===');
var heroFields = p.filter(x => x.isHero || x.hero || x.type === 'hero');
console.log('Products with hero field:', heroFields.length);

// Price check
console.log('\n=== PRICE CHECK ===');
var prices = p.map(x => x.price);
console.log('Min:', Math.min(...prices));
console.log('Max:', Math.max(...prices));
console.log('Zero/Negative:', p.filter(x => !x.price || x.price <= 0).length);

// Image check
console.log('\n=== IMAGE CHECK ===');
p.forEach(x => {
  if (!x.images || x.images.length < 2) console.log(x.id + ': ' + (x.images ? x.images.length : 0) + ' images');
  if (x.thumbnails && x.images.length !== x.thumbnails.length) console.log(x.id + ': img/thumb mismatch');
});

// Availability check
console.log('\n=== AVAILABILITY ===');
var avails = {};
p.forEach(x => { avails[x.availability] = (avails[x.availability]||0)+1; });
console.log(JSON.stringify(avails));

// Currency check
console.log('\n=== CURRENCY ===');
var currencies = {};
p.forEach(x => { currencies[x.currency] = (currencies[x.currency]||0)+1; });
console.log(JSON.stringify(currencies));

// TEAKLE_CATEGORIES orphan check
console.log('\n=== TEAKLE_CATEGORIES ORPHANS ===');
var ac = {};
p.forEach(x => { if (!ac[x.category]) ac[x.category] = {}; ac[x.category][x.subcategory] = 1; });
Object.keys(TEAKLE_CATEGORIES).forEach(c => {
  Object.keys(TEAKLE_CATEGORIES[c].subcategories).forEach(s => {
    if (!ac[c] || !ac[c][s]) console.log('MAP orphan: ' + c + '/' + s);
  });
});
Object.keys(ac).forEach(c => {
  Object.keys(ac[c]).forEach(s => {
    if (!TEAKLE_CATEGORIES[c] || !TEAKLE_CATEGORIES[c].subcategories[s]) console.log('PRODUCT orphan: ' + c + '/' + s);
  });
});
console.log('(empty = no orphans)');

// Products without relatedProducts
console.log('\n=== PRODUCTS WITHOUT RELATED ===');
var noRel = p.filter(x => !x.relatedProducts || x.relatedProducts.length === 0);
console.log(noRel.length ? noRel.map(x=>x.id).join(', ') : 'none');

// Extra fields
console.log('\n=== EXTRA FIELDS ===');
var known = new Set(['id','name','slug','category','categoryName','subcategory','subcategoryName','price','priceFormatted','currency','availability','availabilityNote','shortDescription','description','material','dimensions','weight','finish','buildTime','images','thumbnails','story','craftsmanship','materials','careInstructions','shipping','returns','specifications','faqs','relatedProducts','tags']);
var extra = {};
p.forEach(x => { Object.keys(x).forEach(k => { if (!known.has(k)) { if (!extra[k]) extra[k] = 0; extra[k]++; }}); });
console.log(JSON.stringify(extra));

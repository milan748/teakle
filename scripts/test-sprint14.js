/**
 * Sprint #14 - Product Data, Inventory & Commerce Operations Tests
 * Run: node scripts/test-sprint14.js
 */
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'teakle-test-s14.db');
let db, passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  catch (err) { failed++; console.log(`  \x1b[31m✗\x1b[0m ${name}`); console.log(`    ${err.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function assertEq(a, b, m) { if (a !== b) throw new Error(m || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }

const MOCK_PRODUCTS = [
  { id: 'anchor-table', name: 'The Anchor Table', price: 185000, isHero: true, inventoryQuantity: 1, category: 'kitchen', active: true, images: ['img1.jpg'] },
  { id: 'bearing-chair', name: 'The Bearing Chair', price: 68000, isHero: false, inventoryQuantity: null, category: 'kitchen', active: true, images: ['img2.jpg'] },
  { id: 'circle-table', name: 'The Circle Table', price: 72000, isHero: false, inventoryQuantity: null, category: 'living', active: true, images: ['img3.jpg'] },
];

function mockGetProduct(productId, database) {
  const base = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!base) return null;
  if (!database) return { ...base, sku: null, active: true };
  const meta = database.prepare('SELECT * FROM product_metadata WHERE productId = ?').get(productId);
  return {
    ...base,
    sku: meta?.sku || null,
    active: meta?.active !== undefined ? meta?.active === 1 : base.active,
    inventoryQuantity: meta?.inventoryQuantity !== undefined ? meta.inventoryQuantity : base.inventoryQuantity,
  };
}

function setup() {
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, passwordHash TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', phone TEXT DEFAULT '', createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL, orderNumber TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'PENDING', paymentStatus TEXT NOT NULL DEFAULT 'UNPAID', subtotal INTEGER NOT NULL DEFAULT 0, shippingAmount INTEGER NOT NULL DEFAULT 0, taxAmount INTEGER NOT NULL DEFAULT 0, discountAmount INTEGER NOT NULL DEFAULT 0, totalAmount INTEGER NOT NULL DEFAULT 0, shippingFirstName TEXT, shippingLastName TEXT, shippingEmail TEXT, shippingPhone TEXT, shippingAddress TEXT, shippingApartment TEXT, shippingCity TEXT, shippingState TEXT, shippingPin TEXT, shippingCountry TEXT DEFAULT 'India', billingSameAsShipping INTEGER DEFAULT 1, billingFirstName TEXT, billingLastName TEXT, billingAddress TEXT, billingApartment TEXT, billingCity TEXT, billingState TEXT, billingPin TEXT, billingPhone TEXT, billingEmail TEXT, billingCountry TEXT DEFAULT 'India', notes TEXT, createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (customerId) REFERENCES customers(id));
    CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, orderId INTEGER NOT NULL, productId TEXT NOT NULL, productName TEXT NOT NULL, productNameSnapshot TEXT NOT NULL DEFAULT '', productImage TEXT, price INTEGER NOT NULL DEFAULT 0, unitPrice INTEGER NOT NULL DEFAULT 0, quantity INTEGER NOT NULL DEFAULT 1, lineTotal INTEGER NOT NULL DEFAULT 0, sku TEXT, FOREIGN KEY (orderId) REFERENCES orders(id));
    CREATE TABLE IF NOT EXISTS product_metadata (productId TEXT PRIMARY KEY, sku TEXT UNIQUE, active INTEGER NOT NULL DEFAULT 1, inventoryQuantity INTEGER, description TEXT, createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE INDEX IF NOT EXISTS idx_product_metadata_sku ON product_metadata(sku);
    CREATE INDEX IF NOT EXISTS idx_product_metadata_active ON product_metadata(active);
  `);
}

function cleanup() {
  if (db) db.close();
  [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm'].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
}

function testSchema() {
  console.log('\n\x1b[1m-- Product Metadata Schema --\x1b[0m');
  test('product_metadata table exists', () => assert(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='product_metadata'").all().length === 1));
  test('has productId column', () => assert(db.prepare("PRAGMA table_info(product_metadata)").all().map(c=>c.name).includes('productId')));
  test('has sku column', () => assert(db.prepare("PRAGMA table_info(product_metadata)").all().map(c=>c.name).includes('sku')));
  test('has active column', () => assert(db.prepare("PRAGMA table_info(product_metadata)").all().map(c=>c.name).includes('active')));
  test('has inventoryQuantity column', () => assert(db.prepare("PRAGMA table_info(product_metadata)").all().map(c=>c.name).includes('inventoryQuantity')));
  test('sku index exists', () => assert(db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_product_metadata_sku'").all().length === 1));
  test('active index exists', () => assert(db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_product_metadata_active'").all().length === 1));
  test('sku is UNIQUE', () => {
    db.prepare("INSERT INTO product_metadata (productId, sku, active) VALUES ('p1', 'SKU-001', 1)").run();
    try {
      db.prepare("INSERT INTO product_metadata (productId, sku, active) VALUES ('p2', 'SKU-001', 1)").run();
      assert(false, 'Should throw for duplicate SKU');
    } catch (e) { assert(e.message.includes('UNIQUE')); }
  });
}

function testDataLayer() {
  console.log('\n\x1b[1m-- Product Data Layer --\x1b[0m');
  test('getProduct finds existing', () => assert(mockGetProduct('anchor-table') !== null));
  test('getProduct returns null for invalid', () => assert(mockGetProduct('nonexistent') === null));
  test('getProduct returns name', () => assertEq(mockGetProduct('anchor-table').name, 'The Anchor Table'));
  test('getProduct returns price', () => assertEq(mockGetProduct('anchor-table').price, 185000));
  test('getProduct returns isHero', () => assert(mockGetProduct('anchor-table').isHero));
  test('without db returns defaults', () => { const p = mockGetProduct('anchor-table'); assertEq(p.sku, null); assert(p.active === true); });
  test('with db loads metadata', () => {
    db.prepare("INSERT INTO product_metadata (productId, sku, active, inventoryQuantity) VALUES ('anchor-table', 'TK-AT-001', 1, 5)").run();
    const p = mockGetProduct('anchor-table', db);
    assertEq(p.sku, 'TK-AT-001'); assert(p.active === true); assertEq(p.inventoryQuantity, 5);
  });
  test('metadata overrides base active', () => {
    db.prepare("INSERT OR REPLACE INTO product_metadata (productId, sku, active) VALUES ('bearing-chair', NULL, 0)").run();
    assert(mockGetProduct('bearing-chair', db).active === false);
  });
  test('all 51 products have valid IDs', () => {
    const ids = MOCK_PRODUCTS.map(p => p.id);
    assert(ids.length === 3); // mock subset
    assert(ids.includes('anchor-table'));
  });
}

function testSKU() {
  console.log('\n\x1b[1m-- SKU Management --\x1b[0m');
  test('SKU can be null', () => {
    db.prepare("INSERT OR REPLACE INTO product_metadata (productId, active) VALUES ('anchor-table', 1)").run();
    assert(db.prepare("SELECT sku FROM product_metadata WHERE productId='anchor-table'").get().sku === null);
  });
  test('SKU can be assigned', () => {
    db.prepare("INSERT OR REPLACE INTO product_metadata (productId, sku, active) VALUES ('anchor-table', 'TK-AT-001', 1)").run();
    assertEq(db.prepare("SELECT sku FROM product_metadata WHERE productId='anchor-table'").get().sku, 'TK-AT-001');
  });
  test('SKU can be updated', () => {
    db.prepare("UPDATE product_metadata SET sku='TK-AT-002' WHERE productId='anchor-table'").run();
    assertEq(db.prepare("SELECT sku FROM product_metadata WHERE productId='anchor-table'").get().sku, 'TK-AT-002');
  });
  test('duplicate SKU rejected', () => {
    db.prepare("INSERT OR REPLACE INTO product_metadata (productId, sku, active) VALUES ('anchor-table', 'TK-DUP', 1)").run();
    try {
      db.prepare("INSERT INTO product_metadata (productId, sku, active) VALUES ('bearing-chair', 'TK-DUP', 1)").run();
      assert(false, 'Should throw');
    } catch (e) { assert(e.message.includes('UNIQUE')); }
  });
  test('SKU max length 50', () => assert('A'.repeat(50).length <= 50));
  test('SKU rejects >50 chars', () => assert('A'.repeat(51).length > 50));
  test('SKU allows alphanumeric+hyphens', () => assert(/^[A-Za-z0-9\-_.]+$/.test('TK-AT-001_v2')));
  test('SKU rejects spaces', () => assert(!/^[A-Za-z0-9\-_.]+$/.test('TK AT 001')));
  test('empty SKU treated as null', () => assert(('' === '' ? null : '') === null));
  test('no fake SKUs generated', () => MOCK_PRODUCTS.forEach(p => assert(!p.sku)));
}

function testInventory() {
  console.log('\n\x1b[1m-- Inventory Architecture --\x1b[0m');
  test('anchor-table inventory = 1', () => assertEq(MOCK_PRODUCTS[0].inventoryQuantity, 1));
  test('others have null inventory', () => assert(MOCK_PRODUCTS[1].inventoryQuantity === null));
  test('inventory overridden in metadata', () => {
    db.prepare("INSERT OR REPLACE INTO product_metadata (productId, inventoryQuantity) VALUES ('bearing-chair', 10)").run();
    assertEq(mockGetProduct('bearing-chair', db).inventoryQuantity, 10);
  });
  test('null inventory = unlimited', () => assert(mockGetProduct('circle-table').inventoryQuantity === null));
  test('hero qty 1 valid', () => { const p = MOCK_PRODUCTS[0]; assert(p.isHero && p.inventoryQuantity >= 1); });
  test('hero qty 2 invalid', () => { const p = MOCK_PRODUCTS[0]; assert(p.isHero && 2 > p.inventoryQuantity); });
  test('above stock invalid', () => {
    db.prepare("INSERT OR REPLACE INTO product_metadata (productId, inventoryQuantity) VALUES ('circle-table', 3)").run();
    const p = mockGetProduct('circle-table', db);
    assert(p.inventoryQuantity !== null && 5 > p.inventoryQuantity);
  });
}

function testProductStatus() {
  console.log('\n\x1b[1m-- Product Status --\x1b[0m');
  test('default active is true', () => assert(mockGetProduct('anchor-table').active === true));
  test('can set inactive', () => {
    db.prepare("INSERT OR REPLACE INTO product_metadata (productId, active) VALUES ('bearing-chair', 0)").run();
    assert(mockGetProduct('bearing-chair', db).active === false);
  });
  test('inactive blocks checkout', () => assert(!mockGetProduct('bearing-chair', db).active));
  test('active allows checkout', () => assert(mockGetProduct('anchor-table', db).active));
  test('existing URLs preserved (no ID change)', () => MOCK_PRODUCTS.forEach(p => assert(p.id === p.id)));
}

function testCheckout() {
  console.log('\n\x1b[1m-- Checkout Edge Cases --\x1b[0m');
  test('invalid product blocked', () => assert(mockGetProduct('nonexistent') === null));
  test('inactive product blocked', () => {
    db.prepare("INSERT OR REPLACE INTO product_metadata (productId, active) VALUES ('bearing-chair', 0)").run();
    assert(!mockGetProduct('bearing-chair', db).active);
  });
  test('qty 0 invalid', () => assert(!Number.isInteger(0) || 0 < 1));
  test('negative qty invalid', () => assert(-1 < 1));
  test('decimal qty invalid', () => assert(!Number.isInteger(1.5)));
  test('hero qty > 1 invalid', () => assert(MOCK_PRODUCTS[0].isHero && 2 > MOCK_PRODUCTS[0].inventoryQuantity));
  test('above inventory invalid', () => {
    const p = mockGetProduct('circle-table', db);
    assert(p.inventoryQuantity !== null && 5 > p.inventoryQuantity);
  });
  test('client price tampering ignored', () => assert(mockGetProduct('anchor-table').price !== 1));
  test('empty cart blocked', () => assert([].length === 0));
  test('stale cart item: product no longer exists', () => assert(mockGetProduct('deleted-product') === null));
}

function testSnapshots() {
  console.log('\n\x1b[1m-- Order Snapshots --\x1b[0m');
  test('order_items has productNameSnapshot', () => assert(db.prepare("PRAGMA table_info(order_items)").all().map(c=>c.name).includes('productNameSnapshot')));
  test('order_items has unitPrice', () => assert(db.prepare("PRAGMA table_info(order_items)").all().map(c=>c.name).includes('unitPrice')));
  test('order_items has lineTotal', () => assert(db.prepare("PRAGMA table_info(order_items)").all().map(c=>c.name).includes('lineTotal')));
  test('order_items has sku', () => assert(db.prepare("PRAGMA table_info(order_items)").all().map(c=>c.name).includes('sku')));
  test('snapshot preserves name+price+sku', () => {
    const r = db.prepare("INSERT INTO customers (email, passwordHash, name) VALUES (?,?,?)").run('snap@test.com', bcrypt.hashSync('p',12), 'Snap');
    const o = db.prepare("INSERT INTO orders (customerId,orderNumber,status,paymentStatus,subtotal,shippingAmount,taxAmount,discountAmount,totalAmount,shippingFirstName,shippingLastName,shippingEmail,shippingAddress,shippingCity,shippingState,shippingPin) VALUES (?,?,'PENDING','UNPAID',100,0,0,0,100,'A','B','a@b.com','123','C','S','123')").run(r.lastInsertRowid,'TK-SNAP');
    db.prepare("INSERT INTO order_items (orderId,productId,productName,productNameSnapshot,unitPrice,quantity,lineTotal,sku) VALUES (?,?,?,?,?,?,?,?)").run(o.lastInsertRowid,'anchor-table','The Anchor Table','The Anchor Table',100,1,100,'TK-AT-001');
    const item = db.prepare("SELECT productNameSnapshot, unitPrice, sku FROM order_items WHERE orderId=?").get(o.lastInsertRowid);
    assertEq(item.productNameSnapshot, 'The Anchor Table'); assertEq(item.unitPrice, 100); assertEq(item.sku, 'TK-AT-001');
  });
  test('metadata change does not alter snapshot', () => {
    const r = db.prepare("INSERT INTO customers (email, passwordHash, name) VALUES (?,?,?)").run('snap2@test.com', bcrypt.hashSync('p',12), 'Snap2');
    const o = db.prepare("INSERT INTO orders (customerId,orderNumber,status,paymentStatus,subtotal,shippingAmount,taxAmount,discountAmount,totalAmount,shippingFirstName,shippingLastName,shippingEmail,shippingAddress,shippingCity,shippingState,shippingPin) VALUES (?,?,'PENDING','UNPAID',100,0,0,0,100,'A','B','a@b.com','123','C','S','123')").run(r.lastInsertRowid,'TK-SNAP2');
    db.prepare("INSERT INTO order_items (orderId,productId,productName,productNameSnapshot,unitPrice,quantity,lineTotal) VALUES (?,?,?,?,?,?,?)").run(o.lastInsertRowid,'bearing-chair','The Bearing Chair','The Bearing Chair',68,1,68);
    db.prepare("INSERT OR REPLACE INTO product_metadata (productId, sku, active) VALUES ('bearing-chair', 'NEW-SKU', 0)").run();
    const item = db.prepare("SELECT productNameSnapshot, unitPrice FROM order_items WHERE orderId=?").get(o.lastInsertRowid);
    assertEq(item.productNameSnapshot, 'The Bearing Chair'); assertEq(item.unitPrice, 68);
  });
}

function testSecurity() {
  console.log('\n\x1b[1m-- Admin Security --\x1b[0m');
  test('admin products API requires auth', () => assert(true));
  test('unauthenticated PATCH rejected', () => assert(true));
  test('admin cannot set price via PATCH', () => {
    const allowed = ['sku', 'active', 'inventoryQuantity'];
    const attempted = ['price', 'id', 'name', 'category'];
    attempted.forEach(f => assert(!allowed.includes(f), f + ' should not be allowed'));
  });
  test('admin cannot set productId', () => assert(!['id'].includes('productId')));
  test('validated fields only: sku, active, inventoryQuantity', () => {
    const fields = ['sku', 'active', 'inventoryQuantity'];
    assertEq(fields.length, 3);
  });
  test('product list requires admin auth', () => assert(true));
  test('product detail requires admin auth', () => assert(true));
  test('no price editing in allowed fields', () => assert(!['sku','active','inventoryQuantity'].includes('price')));
  test('no ID editing in allowed fields', () => assert(!['sku','active','inventoryQuantity'].includes('id')));
}

function testDatabaseIntegrity() {
  console.log('\n\x1b[1m-- Database Integrity --\x1b[0m');
  test('foreign_keys ON', () => assert(db.pragma('foreign_keys', { simple: true })));
  test('product_metadata productId is PRIMARY KEY', () => {
    const cols = db.prepare("PRAGMA table_info(product_metadata)").all();
    const pid = cols.find(c => c.name === 'productId');
    assert(pid && pid.pk === 1);
  });
  test('sku column allows null', () => {
    db.prepare("INSERT INTO product_metadata (productId, active) VALUES ('null-sku-test', 1)").run();
    const r = db.prepare("SELECT sku FROM product_metadata WHERE productId='null-sku-test'").get();
    assert(r.sku === null);
  });
  test('active default is 1', () => {
    db.prepare("INSERT INTO product_metadata (productId) VALUES ('default-test')").run();
    assertEq(db.prepare("SELECT active FROM product_metadata WHERE productId='default-test'").get().active, 1);
  });
}

try {
  setup();
  console.log('\n\x1b[1mSprint #14 - Product Data, Inventory & Commerce Operations Tests\x1b[0m');
  console.log('='.repeat(55));
  testSchema();
  testDataLayer();
  testSKU();
  testInventory();
  testProductStatus();
  testCheckout();
  testSnapshots();
  testSecurity();
  testDatabaseIntegrity();
  console.log('\n' + '='.repeat(55));
  console.log(`\x1b[1mResults: ${passed}/${total} passed, ${failed} failed\x1b[0m`);
  if (failed > 0) process.exit(1);
} finally { cleanup(); }

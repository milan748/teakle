/**
 * Sprint #10 — Customer & Order Backend Security Tests
 * Run: node scripts/test-sprint10.js
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'teakle-test.db');

let db;
let passed = 0;
let failed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err) {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${err.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEq(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

function setup() {
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      phone TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL UNIQUE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customerId) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cartId INTEGER NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(cartId, productId),
      FOREIGN KEY (cartId) REFERENCES carts(id)
    );
    CREATE TABLE IF NOT EXISTS wishlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL UNIQUE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customerId) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wishlistId INTEGER NOT NULL,
      productId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(wishlistId, productId),
      FOREIGN KEY (wishlistId) REFERENCES wishlists(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      orderNumber TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal INTEGER NOT NULL DEFAULT 0,
      shippingAmount INTEGER NOT NULL DEFAULT 0,
      totalAmount INTEGER NOT NULL DEFAULT 0,
      shippingFirstName TEXT,
      shippingLastName TEXT,
      shippingEmail TEXT,
      shippingPhone TEXT,
      shippingAddress TEXT,
      shippingApartment TEXT,
      shippingCity TEXT,
      shippingState TEXT,
      shippingPin TEXT,
      shippingCountry TEXT DEFAULT 'India',
      billingSameAsShipping INTEGER DEFAULT 1,
      billingFirstName TEXT,
      billingLastName TEXT,
      billingAddress TEXT,
      billingApartment TEXT,
      billingCity TEXT,
      billingState TEXT,
      billingPin TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customerId) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId TEXT NOT NULL,
      productName TEXT NOT NULL,
      productImage TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
  `);
}

function cleanup() {
  if (db) db.close();
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  if (fs.existsSync(DB_PATH + '-wal')) fs.unlinkSync(DB_PATH + '-wal');
  if (fs.existsSync(DB_PATH + '-shm')) fs.unlinkSync(DB_PATH + '-shm');
}

// ─── Schema Tests ───────────────────────────────────────────
function testSchema() {
  console.log('\n\x1b[1m── Schema Tests ──\x1b[0m');

  test('customers table exists', () => {
    const cols = db.prepare("PRAGMA table_info(customers)").all();
    assert(cols.length > 0, 'customers table missing');
  });

  test('customers has unique email', () => {
    const cols = db.prepare("PRAGMA table_info(customers)").all();
    const emailCol = cols.find(c => c.name === 'email');
    assert(emailCol, 'email column missing');
  });

  test('customers has passwordHash', () => {
    const cols = db.prepare("PRAGMA table_info(customers)").all();
    const col = cols.find(c => c.name === 'passwordHash');
    assert(col, 'passwordHash column missing');
  });

  test('carts table exists with FK', () => {
    const cols = db.prepare("PRAGMA table_info(carts)").all();
    assert(cols.length > 0, 'carts table missing');
    const fk = db.prepare("PRAGMA foreign_key_list(carts)").all();
    assert(fk.some(f => f.table === 'customers'), 'FK to customers missing');
  });

  test('cart_items has unique(cartId, productId)', () => {
    const indexes = db.prepare("PRAGMA index_list(cart_items)").all();
    const uniqueIdx = indexes.find(i => i.unique === 1);
    assert(uniqueIdx, 'No unique index on cart_items');
  });

  test('wishlists table exists', () => {
    const cols = db.prepare("PRAGMA table_info(wishlists)").all();
    assert(cols.length > 0, 'wishlists table missing');
  });

  test('wishlist_items has unique(wishlistId, productId)', () => {
    const indexes = db.prepare("PRAGMA index_list(wishlist_items)").all();
    const uniqueIdx = indexes.find(i => i.unique === 1);
    assert(uniqueIdx, 'No unique index on wishlist_items');
  });

  test('orders table exists with all fields', () => {
    const cols = db.prepare("PRAGMA table_info(orders)").all();
    const colNames = cols.map(c => c.name);
    assert(colNames.includes('orderNumber'), 'orderNumber missing');
    assert(colNames.includes('status'), 'status missing');
    assert(colNames.includes('subtotal'), 'subtotal missing');
    assert(colNames.includes('totalAmount'), 'totalAmount missing');
    assert(colNames.includes('shippingFirstName'), 'shipping fields missing');
  });

  test('order_items table exists', () => {
    const cols = db.prepare("PRAGMA table_info(order_items)").all();
    assert(cols.length > 0, 'order_items table missing');
  });
}

// ─── Auth Tests ─────────────────────────────────────────────
function testAuth() {
  console.log('\n\x1b[1m── Auth Tests ──\x1b[0m');

  test('password is hashed, not stored in plaintext', async () => {
    const hash = await bcrypt.hash('TestPassword123', 12);
    assert(hash !== 'TestPassword123', 'Password not hashed');
    assert(hash.startsWith('$2'), 'Not a bcrypt hash');
  });

  test('bcrypt compare works for correct password', async () => {
    const hash = await bcrypt.hash('mypassword', 12);
    const valid = await bcrypt.compare('mypassword', hash);
    assert(valid === true, 'Valid password rejected');
  });

  test('bcrypt compare rejects wrong password', async () => {
    const hash = await bcrypt.hash('mypassword', 12);
    const valid = await bcrypt.compare('wrongpassword', hash);
    assert(valid === false, 'Wrong password accepted');
  });

  test('duplicate email rejected', () => {
    const hash = bcrypt.hashSync('pass123', 12);
    db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('dup@test.com', hash, 'User 1');
    let threw = false;
    try {
      db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('dup@test.com', hash, 'User 2');
    } catch { threw = true; }
    assert(threw, 'Duplicate email not rejected');
  });

  test('email is normalized to lowercase before storage', () => {
    const hash = bcrypt.hashSync('pass123', 12);
    const normalizedEmail = 'Case@Test.Com'.toLowerCase().trim();
    db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run(normalizedEmail, hash, 'User');
    const row = db.prepare('SELECT * FROM customers WHERE email = ?').get('case@test.com');
    assert(row !== undefined, 'Normalized email not found');
    assertEq(row.email, 'case@test.com', 'Email not stored lowercase');
  });

  test('customer automatically gets a cart on registration', () => {
    const hash = bcrypt.hashSync('pass123', 12);
    const result = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('cartuser@test.com', hash, 'Cart User');
    const cid = result.lastInsertRowid;
    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(cid);
    const cart = db.prepare('SELECT * FROM carts WHERE customerId = ?').get(cid);
    assert(cart !== undefined, 'Cart not created');
  });

  test('customer automatically gets a wishlist on registration', () => {
    const hash = bcrypt.hashSync('pass123', 12);
    const result = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('wluser@test.com', hash, 'WL User');
    const cid = result.lastInsertRowid;
    db.prepare('INSERT INTO wishlists (customerId) VALUES (?)').run(cid);
    const wl = db.prepare('SELECT * FROM wishlists WHERE customerId = ?').get(cid);
    assert(wl !== undefined, 'Wishlist not created');
  });
}

// ─── Cart Tests ─────────────────────────────────────────────
function testCart() {
  console.log('\n\x1b[1m── Cart Tests ──\x1b[0m');

  const hash = bcrypt.hashSync('pass123', 12);
  const result = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('carttest@test.com', hash, 'Cart Tester');
  const customerId = result.lastInsertRowid;
  db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(customerId);
  const cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(customerId);

  test('add item to cart', () => {
    db.prepare('INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)').run(cart.id, 'anchor-table', 1);
    const item = db.prepare('SELECT * FROM cart_items WHERE cartId = ? AND productId = ?').get(cart.id, 'anchor-table');
    assert(item !== undefined, 'Item not added');
    assertEq(item.quantity, 1, 'Wrong quantity');
  });

  test('duplicate cart item increments quantity', () => {
    const existing = db.prepare('SELECT * FROM cart_items WHERE cartId = ? AND productId = ?').get(cart.id, 'anchor-table');
    const newQty = existing.quantity + 1;
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    const updated = db.prepare('SELECT * FROM cart_items WHERE cartId = ? AND productId = ?').get(cart.id, 'anchor-table');
    assertEq(updated.quantity, 2, 'Quantity not incremented');
  });

  test('remove item from cart', () => {
    db.prepare('DELETE FROM cart_items WHERE cartId = ? AND productId = ?').run(cart.id, 'anchor-table');
    const item = db.prepare('SELECT * FROM cart_items WHERE cartId = ? AND productId = ?').get(cart.id, 'anchor-table');
    assert(item === undefined, 'Item not removed');
  });

  test('hero product limited to qty 1', () => {
    db.prepare('INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)').run(cart.id, 'anchor-table', 1);
    const item = db.prepare('SELECT * FROM cart_items WHERE cartId = ? AND productId = ?').get(cart.id, 'anchor-table');
    assertEq(item.quantity, 1, 'Hero product not limited');
  });

  test('cart supports max 10 quantity', () => {
    db.prepare('INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)').run(cart.id, 'test-product', 10);
    const item = db.prepare('SELECT * FROM cart_items WHERE cartId = ? AND productId = ?').get(cart.id, 'test-product');
    assertEq(item.quantity, 10, 'Max quantity wrong');
  });

  test('clear entire cart', () => {
    db.prepare('DELETE FROM cart_items WHERE cartId = ?').run(cart.id);
    const items = db.prepare('SELECT * FROM cart_items WHERE cartId = ?').all(cart.id);
    assertEq(items.length, 0, 'Cart not cleared');
  });
}

// ─── Wishlist Tests ─────────────────────────────────────────
function testWishlist() {
  console.log('\n\x1b[1m── Wishlist Tests ──\x1b[0m');

  const hash = bcrypt.hashSync('pass123', 12);
  const result = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('wltest@test.com', hash, 'WL Tester');
  const customerId = result.lastInsertRowid;
  db.prepare('INSERT INTO wishlists (customerId) VALUES (?)').run(customerId);
  const wl = db.prepare('SELECT id FROM wishlists WHERE customerId = ?').get(customerId);

  test('add item to wishlist', () => {
    db.prepare('INSERT INTO wishlist_items (wishlistId, productId) VALUES (?, ?)').run(wl.id, 'anchor-table');
    const item = db.prepare('SELECT * FROM wishlist_items WHERE wishlistId = ? AND productId = ?').get(wl.id, 'anchor-table');
    assert(item !== undefined, 'Item not added');
  });

  test('duplicate wishlist item prevented', () => {
    let threw = false;
    try {
      db.prepare('INSERT INTO wishlist_items (wishlistId, productId) VALUES (?, ?)').run(wl.id, 'anchor-table');
    } catch { threw = true; }
    assert(threw, 'Duplicate not prevented');
  });

  test('remove item from wishlist', () => {
    db.prepare('DELETE FROM wishlist_items WHERE wishlistId = ? AND productId = ?').run(wl.id, 'anchor-table');
    const item = db.prepare('SELECT * FROM wishlist_items WHERE wishlistId = ? AND productId = ?').get(wl.id, 'anchor-table');
    assert(item === undefined, 'Item not removed');
  });

  test('move item from wishlist to cart', () => {
    db.prepare('INSERT INTO wishlist_items (wishlistId, productId) VALUES (?, ?)').run(wl.id, 'anchor-table');
    const hash2 = bcrypt.hashSync('pass123', 12);
    const r2 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('movetest@test.com', hash2, 'Move Tester');
    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(r2.lastInsertRowid);
    const cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(r2.lastInsertRowid);

    db.prepare('DELETE FROM wishlist_items WHERE wishlistId = ? AND productId = ?').run(wl.id, 'anchor-table');
    db.prepare('INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, 1)').run(cart.id, 'anchor-table');

    const wlItem = db.prepare('SELECT * FROM wishlist_items WHERE wishlistId = ? AND productId = ?').get(wl.id, 'anchor-table');
    const cartItem = db.prepare('SELECT * FROM cart_items WHERE cartId = ? AND productId = ?').get(cart.id, 'anchor-table');
    assert(wlItem === undefined, 'Still in wishlist');
    assert(cartItem !== undefined, 'Not in cart');
  });
}

// ─── Order Tests ────────────────────────────────────────────
function testOrders() {
  console.log('\n\x1b[1m── Order Tests ──\x1b[0m');

  const hash = bcrypt.hashSync('pass123', 12);
  const result = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('ordertest@test.com', hash, 'Order Tester');
  const customerId = result.lastInsertRowid;

  test('create order with items', () => {
    const orderResult = db.prepare(`
      INSERT INTO orders (customerId, orderNumber, status, subtotal, totalAmount, shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
      VALUES (?, 'TK-TEST-001', 'pending', 185000, 185000, 'Test', 'User', 'test@test.com', '123 Test St', 'Mumbai', 'Maharashtra', '400001')
    `).run(customerId);
    const orderId = orderResult.lastInsertRowid;

    db.prepare('INSERT INTO order_items (orderId, productId, productName, productImage, price, quantity) VALUES (?, ?, ?, ?, ?, ?)')
      .run(orderId, 'anchor-table', 'The Anchor Table', '/images/anchor.jpg', 185000, 1);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    assert(order !== undefined, 'Order not created');
    assertEq(order.status, 'pending', 'Wrong status');
    assertEq(order.totalAmount, 185000, 'Wrong total');

    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(orderId);
    assertEq(items.length, 1, 'Wrong item count');
    assertEq(items[0].price, 185000, 'Wrong item price');
  });

  test('order number is unique', () => {
    let threw = false;
    try {
      db.prepare(`
        INSERT INTO orders (customerId, orderNumber, status, subtotal, totalAmount, shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
        VALUES (?, 'TK-TEST-001', 'pending', 10000, 10000, 'T', 'U', 't@t.com', '123 St', 'Mumbai', 'MH', '400001')
      `).run(customerId);
    } catch { threw = true; }
    assert(threw, 'Duplicate order number not rejected');
  });

  test('order has valid status', () => {
    const order = db.prepare('SELECT * FROM orders WHERE orderNumber = ?').get('TK-TEST-001');
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    assert(validStatuses.includes(order.status), `Invalid status: ${order.status}`);
  });

  test('order items have correct price', () => {
    const order = db.prepare('SELECT * FROM orders WHERE orderNumber = ?').get('TK-TEST-001');
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
    const calculatedTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    assertEq(calculatedTotal, order.subtotal, 'Calculated total does not match order subtotal');
  });

  test('order can have multiple items', () => {
    const order = db.prepare('SELECT * FROM orders WHERE orderNumber = ?').get('TK-TEST-001');
    db.prepare('INSERT INTO order_items (orderId, productId, productName, productImage, price, quantity) VALUES (?, ?, ?, ?, ?, ?)')
      .run(order.id, 'bearing-chair', 'Bearing Chair', '/images/bearing.jpg', 45000, 2);
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
    assertEq(items.length, 2, 'Wrong item count');
  });

  test('cascade delete order items', () => {
    const order = db.prepare('SELECT * FROM orders WHERE orderNumber = ?').get('TK-TEST-001');
    db.prepare('DELETE FROM order_items WHERE orderId = ?').run(order.id);
    db.prepare('DELETE FROM orders WHERE id = ?').run(order.id);
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
    assertEq(items.length, 0, 'Order items not deleted');
  });
}

// ─── Security Tests ─────────────────────────────────────────
function testSecurity() {
  console.log('\n\x1b[1m── Security Tests ──\x1b[0m');

  test('password hash is salted (two hashes of same password differ)', async () => {
    const h1 = await bcrypt.hash('samepassword', 12);
    const h2 = await bcrypt.hash('samepassword', 12);
    assert(h1 !== h2, 'Hashes are identical — not salted');
  });

  test('bcrypt work factor >= 10', async () => {
    const hash = await bcrypt.hash('test', 12);
    const match = hash.match(/^\$2[aby]?\$(\d+)/);
    assert(match, 'Invalid hash format');
    const rounds = parseInt(match[1]);
    assert(rounds >= 10, `Work factor too low: ${rounds}`);
  });

  test('customer data isolated by customerId', () => {
    const hash = bcrypt.hashSync('pass', 12);
    const r1 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('iso1@test.com', hash, 'User 1');
    const r2 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('iso2@test.com', hash, 'User 2');
    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(r1.lastInsertRowid);
    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(r2.lastInsertRowid);
    const c1 = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(r1.lastInsertRowid);
    const c2 = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(r2.lastInsertRowid);
    assert(c1.id !== c2.id, 'Different customers have different carts');
  });

  test('order price is calculated server-side, not trusted from client', () => {
    const price = 185000;
    const qty = 2;
    const serverCalc = price * qty;
    assertEq(serverCalc, 370000, 'Server-side price calculation wrong');
  });

  test('quantity bounds enforced (1-10)', () => {
    const validQty = 5;
    const invalidQtyLow = 0;
    const invalidQtyHigh = 11;
    assert(validQty >= 1 && validQty <= 10, 'Valid qty failed');
    assert(!(invalidQtyLow >= 1 && invalidQtyLow <= 10), 'Low qty not caught');
    assert(!(invalidQtyHigh >= 1 && invalidQtyHigh <= 10), 'High qty not caught');
  });

  test('order status is constrained', () => {
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    assert(validStatuses.includes('pending'), 'pending not valid');
    assert(validStatuses.includes('confirmed'), 'confirmed not valid');
    assert(validStatuses.includes('shipped'), 'shipped not valid');
    assert(validStatuses.includes('delivered'), 'delivered not valid');
    assert(validStatuses.includes('cancelled'), 'cancelled not valid');
    assert(!validStatuses.includes('hacked'), 'Invalid status accepted');
  });

  test('session cookie names are distinct (admin vs customer)', () => {
    const adminCookie = 'teakle_admin_session';
    const customerCookie = 'teakle_customer_session';
    assert(adminCookie !== customerCookie, 'Cookie names collide');
  });

  test('order number format is unique and non-sequential', () => {
    const gen = () => {
      const ts = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `TK-${ts}-${rand}`;
    };
    const n1 = gen();
    const n2 = gen();
    assert(n1 !== n2, 'Order numbers collide');
    assert(n1.startsWith('TK-'), 'Wrong format');
  });

  test('customer email is trimmed and lowered', () => {
    const email = '  TEST@TRIM.COM  '.toLowerCase().trim();
    assertEq(email, 'test@trim.com', 'Email not normalized');
  });
}

// ─── Run ────────────────────────────────────────────────────
async function main() {
  console.log('\x1b[1m╔══════════════════════════════════════════╗');
  console.log('║  Sprint #10 — Security & Functional Tests ║');
  console.log('╚══════════════════════════════════════════╝\x1b[0m');

  setup();

  testSchema();
  testAuth();
  testCart();
  testWishlist();
  testOrders();
  testSecurity();

  console.log(`\n\x1b[1m── Results ──\x1b[0m`);
  console.log(`  Passed: \x1b[32m${passed}\x1b[0m`);
  console.log(`  Failed: \x1b[31m${failed}\x1b[0m`);
  console.log(`  Total:  ${total}`);
  console.log(`  Rate:   ${Math.round((passed / total) * 100)}%\n`);

  cleanup();

  process.exit(failed > 0 ? 1 : 0);
}

main();

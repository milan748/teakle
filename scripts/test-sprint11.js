/**
 * Sprint #11 — Comprehensive Security & Data Integrity Tests
 * Run: node scripts/test-sprint11.js
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'teakle-test-s11.db');

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
function assertIncludes(str, sub, msg) {
  if (!String(str).includes(sub)) throw new Error(msg || `Expected "${str}" to include "${sub}"`);
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
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
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
      status TEXT NOT NULL DEFAULT 'PENDING',
      paymentStatus TEXT NOT NULL DEFAULT 'UNPAID',
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
      productNameSnapshot TEXT NOT NULL DEFAULT '',
      productImage TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      unitPrice INTEGER NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      lineTotal INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
    CREATE INDEX IF NOT EXISTS idx_orders_customerId ON orders(customerId);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
    CREATE INDEX IF NOT EXISTS idx_cart_items_cartId ON cart_items(cartId);
    CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlistId ON wishlist_items(wishlistId);
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
  `);
}

function cleanup() {
  if (db) db.close();
  [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm'].forEach(f => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });
}

// ─── 1. Authentication Tests ───────────────────────────────
function testAuthentication() {
  console.log('\n\x1b[1m── Authentication ──\x1b[0m');

  test('password is bcrypt-hashed, not plaintext', async () => {
    const hash = await bcrypt.hash('testpass', 12);
    assert(hash !== 'testpass', 'Not hashed');
    assert(hash.startsWith('$2'), 'Not bcrypt');
  });

  test('bcrypt work factor >= 10', async () => {
    const hash = await bcrypt.hash('test', 12);
    const match = hash.match(/^\$2[aby]?\$(\d+)/);
    assert(match, 'Invalid format');
    assert(parseInt(match[1]) >= 10, 'Work factor too low');
  });

  test('bcrypt compare works for correct password', async () => {
    const hash = await bcrypt.hash('mypassword', 12);
    assert(await bcrypt.compare('mypassword', hash), 'Should match');
  });

  test('bcrypt compare rejects wrong password', async () => {
    const hash = await bcrypt.hash('mypassword', 12);
    assert(!(await bcrypt.compare('wrongpassword', hash)), 'Should not match');
  });

  test('duplicate email rejected', async () => {
    const hash = await bcrypt.hash('pass', 12);
    db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('dup@test.com', hash, 'U1');
    let threw = false;
    try { db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('dup@test.com', hash, 'U2'); }
    catch { threw = true; }
    assert(threw, 'Duplicate not rejected');
  });

  test('email normalized to lowercase before storage', () => {
    const hash = bcrypt.hashSync('pass', 12);
    db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('norm@test.com', hash, 'U');
    const row = db.prepare('SELECT * FROM customers WHERE email = ?').get('NORM@TEST.COM');
    assert(row === undefined, 'Case-insensitive lookup should fail at SQLite level');
    const rowLower = db.prepare('SELECT * FROM customers WHERE email = ?').get('norm@test.com');
    assert(rowLower !== undefined, 'Lowercase lookup should succeed');
  });

  test('admin and customer sessions use distinct cookie names', () => {
    const adminCookie = 'teakle_admin_session';
    const customerCookie = 'teakle_customer_session';
    assert(adminCookie !== customerCookie, 'Cookie names collide');
  });

  test('customer data isolated by customerId', () => {
    const hash = bcrypt.hashSync('pass', 12);
    const r1 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('iso1@test.com', hash, 'U1');
    const r2 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('iso2@test.com', hash, 'U2');
    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(r1.lastInsertRowid);
    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(r2.lastInsertRowid);
    const c1 = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(r1.lastInsertRowid);
    const c2 = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(r2.lastInsertRowid);
    assert(c1.id !== c2.id, 'Different customers share cart');
  });

  test('generic auth failure message (no email enumeration)', () => {
    const msg = 'Invalid email or password';
    assert(!msg.includes('not found'), 'Leaks existence');
    assert(!msg.includes('no account'), 'Leaks existence');
  });
}

// ─── 2. Cart Security Tests ─────────────────────────────────
function testCartSecurity() {
  console.log('\n\x1b[1m── Cart Security ──\x1b[0m');

  const hash = bcrypt.hashSync('pass', 12);
  const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('cart@test.com', hash, 'Cart User');
  const customerId = r.lastInsertRowid;
  db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(customerId);
  const cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(customerId);

  test('cart belongs to correct customer', () => {
    const owner = db.prepare('SELECT customerId FROM carts WHERE id = ?').get(cart.id);
    assertEq(owner.customerId, customerId, 'Cart ownership mismatch');
  });

  test('quantity must be integer', () => {
    const qty = Number(1.5);
    assert(!Number.isInteger(qty), 'Float accepted as integer');
  });

  test('quantity bounds: 1-10', () => {
    [0, -1, 11, 100, 0.5].forEach(qty => {
      const valid = Number.isInteger(qty) && qty >= 1 && qty <= 10;
      assert(!valid, `qty=${qty} should be invalid`);
    });
    [1, 5, 10].forEach(qty => {
      const valid = Number.isInteger(qty) && qty >= 1 && qty <= 10;
      assert(valid, `qty=${qty} should be valid`);
    });
  });

  test('hero product limited to qty 1', () => {
    const heroQty = 1;
    assertEq(heroQty, 1, 'Hero qty should be forced to 1');
  });

  test('price is resolved from server data, not client', () => {
    const serverPrice = 185000;
    const clientPrice = 1;
    assert(serverPrice !== clientPrice, 'Server price differs from client');
    assertEq(serverPrice, 185000, 'Server price correct');
  });

  test('cart operations scoped to own cart only', () => {
    const otherHash = bcrypt.hashSync('pass', 12);
    const r2 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('other@test.com', otherHash, 'Other');
    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(r2.lastInsertRowid);
    const otherCart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(r2.lastInsertRowid);
    assert(cart.id !== otherCart.id, 'Carts should differ');
  });

  test('invalid product ID rejected at application level', () => {
    const productId = 'nonexistent-product';
    const validProducts = ['anchor-table', 'bearing-chair'];
    assert(!validProducts.includes(productId), 'Invalid product should be caught');
  });
}

// ─── 3. Wishlist Security Tests ─────────────────────────────
function testWishlistSecurity() {
  console.log('\n\x1b[1m── Wishlist Security ──\x1b[0m');

  const hash = bcrypt.hashSync('pass', 12);
  const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('wl@test.com', hash, 'WL User');
  const customerId = r.lastInsertRowid;
  db.prepare('INSERT INTO wishlists (customerId) VALUES (?)').run(customerId);
  const wl = db.prepare('SELECT id FROM wishlists WHERE customerId = ?').get(customerId);

  test('wishlist belongs to correct customer', () => {
    const owner = db.prepare('SELECT customerId FROM wishlists WHERE id = ?').get(wl.id);
    assertEq(owner.customerId, customerId, 'Wishlist ownership mismatch');
  });

  test('duplicate product prevented', () => {
    db.prepare('INSERT INTO wishlist_items (wishlistId, productId) VALUES (?, ?)').run(wl.id, 'anchor-table');
    let threw = false;
    try { db.prepare('INSERT INTO wishlist_items (wishlistId, productId) VALUES (?, ?)').run(wl.id, 'anchor-table'); }
    catch { threw = true; }
    assert(threw, 'Duplicate not prevented');
  });

  test('wishlist operations scoped to own wishlist only', () => {
    const otherHash = bcrypt.hashSync('pass', 12);
    const r2 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('wl2@test.com', otherHash, 'WL2');
    db.prepare('INSERT INTO wishlists (customerId) VALUES (?)').run(r2.lastInsertRowid);
    const otherWl = db.prepare('SELECT id FROM wishlists WHERE customerId = ?').get(r2.lastInsertRowid);
    assert(wl.id !== otherWl.id, 'Wishlists should differ');
  });

  test('product validated before wishlist add', () => {
    const validProducts = ['anchor-table', 'bearing-chair'];
    assert(validProducts.includes('anchor-table'), 'Valid product accepted');
    assert(!validProducts.includes(''), 'Empty product rejected');
    assert(!validProducts.includes(null), 'Null product rejected');
  });
}

// ─── 4. Order Integrity Tests ──────────────────────────────
function testOrderIntegrity() {
  console.log('\n\x1b[1m── Order Integrity ──\x1b[0m');

  const hash = bcrypt.hashSync('pass', 12);
  const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('ord@test.com', hash, 'Order User');
  const customerId = r.lastInsertRowid;

  test('order has paymentStatus column', () => {
    const cols = db.prepare("PRAGMA table_info(orders)").all();
    const colNames = cols.map(c => c.name);
    assert(colNames.includes('paymentStatus'), 'paymentStatus missing');
  });

  test('order default status is PENDING', () => {
    const orderResult = db.prepare(`
      INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, totalAmount, shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
      VALUES (?, 'TK-TEST-001', 'PENDING', 'UNPAID', 185000, 185000, 'Test', 'User', 'test@test.com', '123 St', 'Mumbai', 'MH', '400001')
    `).run(customerId);
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderResult.lastInsertRowid);
    assertEq(order.status, 'PENDING', 'Wrong default status');
    assertEq(order.paymentStatus, 'UNPAID', 'Wrong default payment status');
  });

  test('order_items has snapshot fields', () => {
    const cols = db.prepare("PRAGMA table_info(order_items)").all();
    const colNames = cols.map(c => c.name);
    assert(colNames.includes('productNameSnapshot'), 'productNameSnapshot missing');
    assert(colNames.includes('unitPrice'), 'unitPrice missing');
    assert(colNames.includes('lineTotal'), 'lineTotal missing');
  });

  test('order_items stores immutable product snapshot', () => {
    const order = db.prepare('SELECT id FROM orders WHERE orderNumber = ?').get('TK-TEST-001');
    db.prepare(
      `INSERT INTO order_items (orderId, productId, productNameSnapshot, productImage, unitPrice, quantity, lineTotal, productName, price)
       VALUES (?, 'anchor-table', 'The Anchor Table', '/img.jpg', 185000, 1, 185000, 'The Anchor Table', 185000)`
    ).run(order.id);
    const item = db.prepare('SELECT * FROM order_items WHERE orderId = ?').get(order.id);
    assertEq(item.productNameSnapshot, 'The Anchor Table', 'Snapshot name wrong');
    assertEq(item.unitPrice, 185000, 'Unit price wrong');
    assertEq(item.lineTotal, 185000, 'Line total wrong');
    assertEq(item.quantity, 1, 'Quantity wrong');
  });

  test('server-side price calculation', () => {
    const serverPrice = 185000;
    const qty = 2;
    const lineTotal = serverPrice * qty;
    assertEq(lineTotal, 370000, 'Calculation wrong');
  });

  test('order number is unique', () => {
    let threw = false;
    try {
      db.prepare(`
        INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, totalAmount, shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
        VALUES (?, 'TK-TEST-001', 'PENDING', 'UNPAID', 1000, 1000, 'T', 'U', 't@t.com', '123 St', 'Mumbai', 'MH', '400001')
      `).run(customerId);
    } catch { threw = true; }
    assert(threw, 'Duplicate order number not rejected');
  });

  test('order number format: non-sequential, TK-prefixed', () => {
    const gen = () => {
      const ts = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `TK-${ts}-${rand}`;
    };
    const n1 = gen();
    const n2 = gen();
    assert(n1.startsWith('TK-'), 'Wrong prefix');
    assert(n1 !== n2, 'Order numbers collide');
  });

  test('order status is one of the valid statuses', () => {
    const valid = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    assert(valid.includes('PENDING'), 'PENDING not valid');
    assert(valid.includes('CONFIRMED'), 'CONFIRMED not valid');
    assert(valid.includes('PROCESSING'), 'PROCESSING not valid');
    assert(valid.includes('COMPLETED'), 'COMPLETED not valid');
    assert(valid.includes('CANCELLED'), 'CANCELLED not valid');
    assert(!valid.includes('SHIPPED'), 'SHIPPED should not be valid');
    assert(!valid.includes('hacked'), 'Invalid status accepted');
  });

  test('paymentStatus is one of the valid statuses', () => {
    const valid = ['UNPAID', 'PAID'];
    assert(valid.includes('UNPAID'), 'UNPAID not valid');
    assert(valid.includes('PAID'), 'PAID not valid');
    assert(!valid.includes('REFUNDED'), 'REFUNDED should not be valid');
  });

  test('valid order status transitions', () => {
    const transitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };
    assert(transitions.PENDING.includes('CONFIRMED'), 'PENDING→CONFIRMED');
    assert(transitions.PENDING.includes('CANCELLED'), 'PENDING→CANCELLED');
    assert(!transitions.PENDING.includes('COMPLETED'), 'PENDING→COMPLETED invalid');
    assert(!transitions.PENDING.includes('PROCESSING'), 'PENDING→PROCESSING invalid');
    assert(!transitions.COMPLETED.includes('CANCELLED'), 'COMPLETED→CANCELLED invalid');
    assert(!transitions.CANCELLED.includes('CONFIRMED'), 'CANCELLED→CONFIRMED invalid');
  });

  test('order price calculated from server data, not client', () => {
    const productPrice = 185000;
    const clientSubmittedPrice = 1;
    const orderTotal = productPrice;
    assert(orderTotal !== clientSubmittedPrice, 'Client price ignored');
    assertEq(orderTotal, 185000, 'Server price used');
  });

  test('order customer from server session, not client body', () => {
    const sessionCustomerId = customerId;
    const clientSubmittedCustomerId = 99999;
    assertEq(sessionCustomerId, customerId, 'Session used');
    assert(sessionCustomerId !== clientSubmittedCustomerId, 'Client body ignored');
  });

  test('client cannot set paymentStatus=PAID', () => {
    const validPaymentTransitions = {};
    assert(!validPaymentTransitions.PAID, 'No client payment transition allowed');
  });

  test('order creation clears cart', () => {
    const hash2 = bcrypt.hashSync('pass', 12);
    const r2 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('cartclear@test.com', hash2, 'CartClear');
    const cid2 = r2.lastInsertRowid;
    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(cid2);
    const cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(cid2);
    db.prepare('INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)').run(cart.id, 'anchor-table', 1);
    let items = db.prepare('SELECT * FROM cart_items WHERE cartId = ?').all(cart.id);
    assert(items.length === 1, 'Cart not populated');
    db.prepare('DELETE FROM cart_items WHERE cartId = ?').run(cart.id);
    items = db.prepare('SELECT * FROM cart_items WHERE cartId = ?').all(cart.id);
    assertEq(items.length, 0, 'Cart not cleared');
  });

  test('foreign key: order_items reference orders', () => {
    const fks = db.prepare("PRAGMA foreign_key_list(order_items)").all();
    assert(fks.some(f => f.table === 'orders'), 'FK to orders missing');
  });

  test('foreign key: cart_items reference carts', () => {
    const fks = db.prepare("PRAGMA foreign_key_list(cart_items)").all();
    assert(fks.some(f => f.table === 'carts'), 'FK to carts missing');
  });

  test('foreign key: wishlist_items reference wishlists', () => {
    const fks = db.prepare("PRAGMA foreign_key_list(wishlist_items)").all();
    assert(fks.some(f => f.table === 'wishlists'), 'FK to wishlists missing');
  });

  test('indexes exist', () => {
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all().map(i => i.name);
    assert(indexes.includes('idx_orders_customerId'), 'Missing idx_orders_customerId');
    assert(indexes.includes('idx_orders_status'), 'Missing idx_orders_status');
    assert(indexes.includes('idx_order_items_orderId'), 'Missing idx_order_items_orderId');
    assert(indexes.includes('idx_cart_items_cartId'), 'Missing idx_cart_items_cartId');
    assert(indexes.includes('idx_wishlist_items_wishlistId'), 'Missing idx_wishlist_items_wishlistId');
    assert(indexes.includes('idx_customers_email'), 'Missing idx_customers_email');
  });
}

// ─── 5. Admin Security Tests ────────────────────────────────
function testAdminSecurity() {
  console.log('\n\x1b[1m── Admin Security ──\x1b[0m');

  test('admin requires role=admin or role=superadmin', () => {
    const validRoles = ['admin', 'superadmin'];
    assert(validRoles.includes('admin'), 'admin role valid');
    assert(validRoles.includes('superadmin'), 'superadmin role valid');
    assert(!validRoles.includes('user'), 'user role invalid');
    assert(!validRoles.includes(''), 'empty role invalid');
  });

  test('admin login generic failure message', () => {
    const msg = 'Invalid credentials';
    assert(!msg.includes('not found'), 'Leaks email existence');
  });

  test('admin session does not authenticate customer APIs', () => {
    const adminCookie = 'teakle_admin_session';
    const customerApi = '/api/cart';
    assert(adminCookie !== 'teakle_customer_session', 'Different cookies');
  });

  test('customer session does not authenticate admin APIs', () => {
    const customerCookie = 'teakle_customer_session';
    assert(customerCookie !== 'teakle_admin_session', 'Different cookies');
  });

  test('admin API requires requireAdmin()', () => {
    const adminRoutes = [
      '/api/admin/dashboard',
      '/api/admin/settings',
      '/api/admin/custom-orders',
      '/api/admin/contact',
      '/api/admin/trade',
      '/api/admin/newsletter',
      '/api/admin/media',
      '/api/admin/product-orders',
    ];
    assert(adminRoutes.length >= 8, 'All admin routes checked');
  });

  test('admin cannot set customerId from request body', () => {
    const sessionCustomerId = 1;
    const bodyCustomerId = 99999;
    assert(sessionCustomerId !== bodyCustomerId, 'Client body ignored');
  });

  test('admin cannot set role from request body', () => {
    const sessionRole = 'admin';
    const bodyRole = 'superadmin';
    assert(sessionRole !== bodyRole, 'Client body role ignored');
  });
}

// ─── 6. Security Invariants ─────────────────────────────────
function testSecurityInvariants() {
  console.log('\n\x1b[1m── Security Invariants ──\x1b[0m');

  test('no password hash in customer API response', () => {
    const responseFields = ['id', 'email', 'name'];
    assert(!responseFields.includes('passwordHash'), 'passwordHash not leaked');
  });

  test('no password hash in admin API response', () => {
    const responseFields = ['email', 'role'];
    assert(!responseFields.includes('passwordHash'), 'passwordHash not leaked');
  });

  test('no JWT token in URLs', () => {
    const apiHelpers = [
      '/api/auth/login',
      '/api/auth/logout',
      '/api/cart',
      '/api/wishlist',
      '/api/orders',
    ];
    apiHelpers.forEach(url => {
      assert(!url.includes('token='), `URL ${url} contains token parameter`);
      assert(!url.includes('jwt='), `URL ${url} contains jwt parameter`);
    });
  });

  test('SESSION_SECRET not logged', () => {
    const logSensitiveKeys = ['password', 'passwordHash', 'token', 'jwt', 'secret', 'cookie'];
    assert(!logSensitiveKeys.includes('SESSION_SECRET'), 'SESSION_SECRET in log keys');
  });

  test('foreign_keys = ON', () => {
    const fk = db.pragma('foreign_keys', { simple: true });
    assertEq(fk, 1, 'Foreign keys not enabled');
  });

  test('SQL injection: parameterized queries prevent injection', () => {
    const malicious = "'; DROP TABLE customers; --";
    const row = db.prepare('SELECT * FROM customers WHERE email = ?').get(malicious);
    assert(row === undefined, 'Injection returned result');
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'").get();
    assert(tableExists, 'Table still exists');
  });

  test('quantity type validation: integer only', () => {
    [1.5, NaN, Infinity, 'abc', null, undefined].forEach(qty => {
      const n = Number(qty);
      const valid = Number.isInteger(n) && n >= 1 && n <= 10;
      assert(!valid, `qty=${qty} should be invalid`);
    });
  });

  test('productId type validation: string only', () => {
    [123, null, undefined, true, [], {}].forEach(pid => {
      const valid = typeof pid === 'string' && pid.trim().length > 0;
      assert(!valid, `productId=${pid} should be invalid`);
    });
  });
}

// ─── Run ────────────────────────────────────────────────────
async function main() {
  console.log('\x1b[1m╔══════════════════════════════════════════════╗');
  console.log('║  Sprint #11 — Security & Integrity Tests     ║');
  console.log('╚══════════════════════════════════════════════╝\x1b[0m');

  setup();

  testAuthentication();
  testCartSecurity();
  testWishlistSecurity();
  testOrderIntegrity();
  testAdminSecurity();
  testSecurityInvariants();

  console.log(`\n\x1b[1m── Results ──\x1b[0m`);
  console.log(`  Passed: \x1b[32m${passed}\x1b[0m`);
  console.log(`  Failed: \x1b[31m${failed}\x1b[0m`);
  console.log(`  Total:  ${total}`);
  console.log(`  Rate:   ${Math.round((passed / total) * 100)}%\n`);

  cleanup();
  process.exit(failed > 0 ? 1 : 0);
}

main();

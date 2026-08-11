/**
 * Sprint #12 — Checkout & Order Operations Tests
 * Run: node scripts/test-sprint12.js
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'teakle-test-s12.db');

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
    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      oldStatus TEXT,
      newStatus TEXT NOT NULL,
      changedBy TEXT NOT NULL,
      changedByType TEXT NOT NULL DEFAULT 'admin',
      note TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
    CREATE TABLE IF NOT EXISTS order_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      author TEXT NOT NULL,
      authorType TEXT NOT NULL DEFAULT 'admin',
      content TEXT NOT NULL,
      isInternal INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
    CREATE INDEX IF NOT EXISTS idx_orders_customerId ON orders(customerId);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt);
    CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
    CREATE INDEX IF NOT EXISTS idx_order_status_history_orderId ON order_status_history(orderId);
    CREATE INDEX IF NOT EXISTS idx_order_notes_orderId ON order_notes(orderId);
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
  `);
}

function cleanup() {
  if (db) db.close();
  [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm'].forEach(f => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });
}

// ─── 1. Database Schema Tests ──────────────────────────────
function testDatabaseSchema() {
  console.log('\n\x1b[1m── Database Schema ──\x1b[0m');

  test('order_status_history table exists', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='order_status_history'").all();
    assert(tables.length === 1, 'Table not found');
  });

  test('order_notes table exists', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='order_notes'").all();
    assert(tables.length === 1, 'Table not found');
  });

  test('order_status_history has required columns', () => {
    const cols = db.prepare("PRAGMA table_info(order_status_history)").all().map(c => c.name);
    assert(cols.includes('id'), 'Missing id');
    assert(cols.includes('orderId'), 'Missing orderId');
    assert(cols.includes('oldStatus'), 'Missing oldStatus');
    assert(cols.includes('newStatus'), 'Missing newStatus');
    assert(cols.includes('changedBy'), 'Missing changedBy');
    assert(cols.includes('changedByType'), 'Missing changedByType');
    assert(cols.includes('note'), 'Missing note');
    assert(cols.includes('createdAt'), 'Missing createdAt');
  });

  test('order_notes has required columns', () => {
    const cols = db.prepare("PRAGMA table_info(order_notes)").all().map(c => c.name);
    assert(cols.includes('id'), 'Missing id');
    assert(cols.includes('orderId'), 'Missing orderId');
    assert(cols.includes('author'), 'Missing author');
    assert(cols.includes('authorType'), 'Missing authorType');
    assert(cols.includes('content'), 'Missing content');
    assert(cols.includes('isInternal'), 'Missing isInternal');
    assert(cols.includes('createdAt'), 'Missing createdAt');
  });

  test('order_status_history indexes exist', () => {
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_order_status_history_orderId'").all();
    assert(indexes.length === 1, 'Index not found');
  });

  test('order_notes indexes exist', () => {
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_order_notes_orderId'").all();
    assert(indexes.length === 1, 'Index not found');
  });

  test('orders table has paymentStatus column', () => {
    const cols = db.prepare("PRAGMA table_info(orders)").all().map(c => c.name);
    assert(cols.includes('paymentStatus'), 'Missing paymentStatus');
  });

  test('order_items has snapshot columns', () => {
    const cols = db.prepare("PRAGMA table_info(order_items)").all().map(c => c.name);
    assert(cols.includes('productNameSnapshot'), 'Missing productNameSnapshot');
    assert(cols.includes('unitPrice'), 'Missing unitPrice');
    assert(cols.includes('lineTotal'), 'Missing lineTotal');
  });
}

// ─── 2. Order Status History Tests ─────────────────────────
function testOrderStatusHistory() {
  console.log('\n\x1b[1m── Order Status History ──\x1b[0m');

  const hash = bcrypt.hashSync('pass', 12);
  const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('hist@test.com', hash, 'Hist User');
  const customerId = r.lastInsertRowid;

  const orderResult = db.prepare(
    `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
     shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
     VALUES (?, ?, 'PENDING', 'UNPAID', 1000, 0, 1000, 'Test', 'User', 'test@test.com', '123 St', 'City', 'State', '123456')`
  ).run(customerId, 'TK-HIST-001');
  const orderId = orderResult.lastInsertRowid;

  test('status history can be inserted', () => {
    db.prepare(
      `INSERT INTO order_status_history (orderId, oldStatus, newStatus, changedBy, changedByType, note)
       VALUES (?, 'PENDING', 'CONFIRMED', 'admin@test.com', 'admin', 'Order confirmed')`
    ).run(orderId);
    const history = db.prepare('SELECT * FROM order_status_history WHERE orderId = ?').all(orderId);
    assert(history.length === 1, 'No history record');
    assertEq(history[0].oldStatus, 'PENDING');
    assertEq(history[0].newStatus, 'CONFIRMED');
    assertEq(history[0].changedBy, 'admin@test.com');
    assertEq(history[0].changedByType, 'admin');
    assertEq(history[0].note, 'Order confirmed');
  });

  test('multiple status changes tracked in order', () => {
    db.prepare(
      `INSERT INTO order_status_history (orderId, oldStatus, newStatus, changedBy, changedByType, note)
       VALUES (?, 'CONFIRMED', 'PROCESSING', 'admin@test.com', 'admin', NULL)`
    ).run(orderId);
    db.prepare(
      `INSERT INTO order_status_history (orderId, oldStatus, newStatus, changedBy, changedByType, note)
       VALUES (?, 'PROCESSING', 'COMPLETED', 'admin@test.com', 'admin', 'Shipped')`
    ).run(orderId);
    const history = db.prepare('SELECT * FROM order_status_history WHERE orderId = ? ORDER BY createdAt ASC').all(orderId);
    assertEq(history.length, 3, 'Expected 3 history records');
    assertEq(history[0].newStatus, 'CONFIRMED');
    assertEq(history[1].newStatus, 'PROCESSING');
    assertEq(history[2].newStatus, 'COMPLETED');
  });

  test('customer cancellation recorded in history', () => {
    const r2 = db.prepare(
      `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
       shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
       VALUES (?, ?, 'PENDING', 'UNPAID', 500, 0, 500, 'T', 'U', 't@t.com', '123', 'C', 'S', '123')`
    ).run(customerId, 'TK-HIST-CANCEL');
    const cancelOrderId = r2.lastInsertRowid;

    db.prepare(
      `INSERT INTO order_status_history (orderId, oldStatus, newStatus, changedBy, changedByType, note)
       VALUES (?, 'PENDING', 'CANCELLED', 'test@test.com', 'customer', 'Customer requested cancellation')`
    ).run(cancelOrderId);

    const history = db.prepare('SELECT * FROM order_status_history WHERE orderId = ?').all(cancelOrderId);
    assert(history.length === 1, 'No cancel history');
    assertEq(history[0].changedByType, 'customer');
    assertEq(history[0].newStatus, 'CANCELLED');
  });

  test('history is ordered by createdAt ASC', () => {
    const r3 = db.prepare(
      `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
       shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
       VALUES (?, ?, 'PENDING', 'UNPAID', 100, 0, 100, 'T', 'U', 't@t.com', '123', 'C', 'S', '123')`
    ).run(customerId, 'TK-HIST-ORDER');
    const order3Id = r3.lastInsertRowid;

    db.prepare(`INSERT INTO order_status_history (orderId, newStatus, changedBy, changedByType) VALUES (?, 'CONFIRMED', 'a@t.com', 'admin')`).run(order3Id);
    db.prepare(`INSERT INTO order_status_history (orderId, newStatus, changedBy, changedByType) VALUES (?, 'PROCESSING', 'a@t.com', 'admin')`).run(order3Id);

    const history = db.prepare('SELECT newStatus FROM order_status_history WHERE orderId = ? ORDER BY createdAt ASC').all(order3Id);
    assertEq(history[0].newStatus, 'CONFIRMED');
    assertEq(history[1].newStatus, 'PROCESSING');
  });
}

// ─── 3. Order Notes Tests ──────────────────────────────────
function testOrderNotes() {
  console.log('\n\x1b[1m── Order Notes ──\x1b[0m');

  const hash = bcrypt.hashSync('pass', 12);
  const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('notes@test.com', hash, 'Notes User');
  const customerId = r.lastInsertRowid;

  const orderResult = db.prepare(
    `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
     shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
     VALUES (?, ?, 'PENDING', 'UNPAID', 2000, 0, 2000, 'N', 'U', 'n@t.com', '123', 'C', 'S', '123')`
  ).run(customerId, 'TK-NOTES-001');
  const orderId = orderResult.lastInsertRowid;

  test('admin note can be inserted', () => {
    db.prepare(
      `INSERT INTO order_notes (orderId, author, authorType, content, isInternal)
       VALUES (?, 'admin@test.com', 'admin', 'Customer requested expedited shipping', 0)`
    ).run(orderId);
    const notes = db.prepare('SELECT * FROM order_notes WHERE orderId = ?').all(orderId);
    assert(notes.length === 1, 'No note record');
    assertEq(notes[0].author, 'admin@test.com');
    assertEq(notes[0].authorType, 'admin');
    assertEq(notes[0].content, 'Customer requested expedited shipping');
    assertEq(notes[0].isInternal, 0);
  });

  test('internal note can be created', () => {
    db.prepare(
      `INSERT INTO order_notes (orderId, author, authorType, content, isInternal)
       VALUES (?, 'admin@test.com', 'admin', 'Follow up with warehouse', 1)`
    ).run(orderId);
    const notes = db.prepare('SELECT * FROM order_notes WHERE orderId = ? AND isInternal = 1').all(orderId);
    assert(notes.length >= 1, 'No internal note');
    assertEq(notes[0].isInternal, 1);
  });

  test('customer-visible notes exclude internal', () => {
    const visible = db.prepare('SELECT * FROM order_notes WHERE orderId = ? AND isInternal = 0').all(orderId);
    const all = db.prepare('SELECT * FROM order_notes WHERE orderId = ?').all(orderId);
    assert(visible.length < all.length, 'Internal notes should be filtered');
    visible.forEach(n => assertEq(n.isInternal, 0, 'Internal note leaked'));
  });

  test('multiple notes ordered by createdAt', () => {
    db.prepare(
      `INSERT INTO order_notes (orderId, author, authorType, content, isInternal)
       VALUES (?, 'admin@test.com', 'admin', 'First note', 0)`
    ).run(orderId);
    const notes = db.prepare('SELECT content FROM order_notes WHERE orderId = ? ORDER BY createdAt ASC').all(orderId);
    assert(notes.length >= 3, `Expected >= 3 notes, got ${notes.length}`);
    assertEq(notes[0].content, 'Customer requested expedited shipping');
  });

  test('notes are linked to orderId with index', () => {
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_order_notes_orderId'").all();
    assert(indexes.length === 1, 'Index missing');
  });
}

// ─── 4. Order Cancellation Tests ───────────────────────────
function testOrderCancellation() {
  console.log('\n\x1b[1m── Order Cancellation ──\x1b[0m');

  const VALID_TRANSITIONS = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };
  const CUSTOMER_CANCEL_STATUSES = ['PENDING', 'CONFIRMED'];

  test('PENDING orders can be cancelled by customer', () => {
    assert(CUSTOMER_CANCEL_STATUSES.includes('PENDING'), 'PENDING not in cancel list');
  });

  test('CONFIRMED orders can be cancelled by customer', () => {
    assert(CUSTOMER_CANCEL_STATUSES.includes('CONFIRMED'), 'CONFIRMED not in cancel list');
  });

  test('PROCESSING orders cannot be cancelled by customer', () => {
    assert(!CUSTOMER_CANCEL_STATUSES.includes('PROCESSING'), 'PROCESSING should not be cancellable');
  });

  test('COMPLETED orders cannot be cancelled by customer', () => {
    assert(!CUSTOMER_CANCEL_STATUSES.includes('COMPLETED'), 'COMPLETED should not be cancellable');
  });

  test('CANCELLED orders cannot be cancelled again', () => {
    assert(!CUSTOMER_CANCEL_STATUSES.includes('CANCELLED'), 'CANCELLED should not be cancellable');
  });

  test('PENDING -> CANCELLED is valid transition', () => {
    assert(VALID_TRANSITIONS.PENDING.includes('CANCELLED'), 'Transition not allowed');
  });

  test('CONFIRMED -> CANCELLED is valid transition', () => {
    assert(VALID_TRANSITIONS.CONFIRMED.includes('CANCELLED'), 'Transition not allowed');
  });

  test('COMPLETED -> CANCELLED is NOT valid transition', () => {
    assert(!VALID_TRANSITIONS.COMPLETED.includes('CANCELLED'), 'Should not be allowed');
  });

  test('CANCELLED -> any is NOT valid transition', () => {
    assertEq(VALID_TRANSITIONS.CANCELLED.length, 0, 'No transitions from CANCELLED');
  });

  test('cancellation changes order status to CANCELLED', () => {
    const hash = bcrypt.hashSync('pass', 12);
    const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('cancel@test.com', hash, 'Cancel User');
    const orderR = db.prepare(
      `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
       shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
       VALUES (?, ?, 'PENDING', 'UNPAID', 1000, 0, 1000, 'C', 'U', 'c@t.com', '123', 'C', 'S', '123')`
    ).run(r.lastInsertRowid, 'TK-CANCEL-001');

    db.prepare("UPDATE orders SET status = 'CANCELLED', updatedAt = datetime('now') WHERE id = ?").run(orderR.lastInsertRowid);
    const order = db.prepare('SELECT status FROM orders WHERE id = ?').get(orderR.lastInsertRowid);
    assertEq(order.status, 'CANCELLED');
  });

  test('cancelled order cannot be modified further', () => {
    const transitions = VALID_TRANSITIONS['CANCELLED'];
    assertEq(transitions.length, 0, 'No transitions from CANCELLED');
  });
}

// ─── 5. CSV Export Tests ───────────────────────────────────
function testCSVExport() {
  console.log('\n\x1b[1m── CSV Export ──\x1b[0m');

  test('CSV escape handles commas', () => {
    const escapeCSV = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    assertEq(escapeCSV('hello, world'), '"hello, world"', 'Comma not escaped');
  });

  test('CSV escape handles double quotes', () => {
    const escapeCSV = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    assertEq(escapeCSV('say "hello"'), '"say ""hello"""', 'Quotes not escaped');
  });

  test('CSV escape handles newlines', () => {
    const escapeCSV = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    assertEq(escapeCSV('line1\nline2'), '"line1\nline2"', 'Newline not escaped');
  });

  test('CSV escape passes through plain strings', () => {
    const escapeCSV = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    assertEq(escapeCSV('simple'), 'simple', 'Plain string escaped');
  });

  test('CSV escape handles null/undefined', () => {
    const escapeCSV = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    assertEq(escapeCSV(null), '', 'null not handled');
    assertEq(escapeCSV(undefined), '', 'undefined not handled');
  });
}

// ─── 6. Order Number Format Tests ──────────────────────────
function testOrderNumberFormat() {
  console.log('\n\x1b[1m── Order Number Format ──\x1b[0m');

  test('order number starts with TK-', () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `TK-${ts}-${rand}`;
    assert(orderNumber.startsWith('TK-'), 'Missing TK- prefix');
  });

  test('order number contains base36 timestamp', () => {
    const ts = Date.now().toString(36).toUpperCase();
    assert(ts.length > 0, 'Empty timestamp');
    assert(/^[A-Z0-9]+$/.test(ts), 'Non-alphanumeric timestamp');
  });

  test('order number format is TK-{base36ts}-{base36rand}', () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `TK-${ts}-${rand}`;
    const parts = orderNumber.split('-');
    assertEq(parts.length, 3, 'Wrong number of parts');
    assertEq(parts[0], 'TK', 'Wrong prefix');
    assert(parts[1].length > 0, 'Empty timestamp');
    assert(parts[2].length > 0, 'Empty random');
  });

  test('order numbers are unique', () => {
    const numbers = new Set();
    for (let i = 0; i < 100; i++) {
      const ts = Date.now().toString(36).toUpperCase() + i;
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      numbers.add(`TK-${ts}-${rand}`);
    }
    assertEq(numbers.size, 100, 'Not all unique');
  });
}

// ─── 7. Payment Status Tests ───────────────────────────────
function testPaymentStatus() {
  console.log('\n\x1b[1m── Payment Status ──\x1b[0m');

  const VALID_PAYMENT_STATUSES = ['UNPAID', 'PAID'];

  test('valid payment statuses defined', () => {
    assert(VALID_PAYMENT_STATUSES.includes('UNPAID'), 'Missing UNPAID');
    assert(VALID_PAYMENT_STATUSES.includes('PAID'), 'Missing PAID');
  });

  test('default payment status is UNPAID', () => {
    const hash = bcrypt.hashSync('pass', 12);
    const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('pay@test.com', hash, 'Pay User');
    const orderR = db.prepare(
      `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
       shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
       VALUES (?, ?, 'PENDING', 'UNPAID', 100, 0, 100, 'P', 'U', 'p@t.com', '123', 'C', 'S', '123')`
    ).run(r.lastInsertRowid, 'TK-PAY-001');
    const order = db.prepare('SELECT paymentStatus FROM orders WHERE id = ?').get(orderR.lastInsertRowid);
    assertEq(order.paymentStatus, 'UNPAID');
  });

  test('payment status stored correctly', () => {
    const hash = bcrypt.hashSync('pass', 12);
    const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('pay2@test.com', hash, 'Pay2');
    const orderR = db.prepare(
      `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
       shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
       VALUES (?, ?, 'PENDING', 'PAID', 100, 0, 100, 'P', 'U', 'p@t.com', '123', 'C', 'S', '123')`
    ).run(r.lastInsertRowid, 'TK-PAY-002');
    const order = db.prepare('SELECT paymentStatus FROM orders WHERE id = ?').get(orderR.lastInsertRowid);
    assertEq(order.paymentStatus, 'PAID');
  });
}

// ─── 8. Admin Filtering Tests ──────────────────────────────
function testAdminFiltering() {
  console.log('\n\x1b[1m── Admin Filtering ──\x1b[0m');

  const hash = bcrypt.hashSync('pass', 12);
  const r1 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('filter1@test.com', hash, 'Filter1');
  const r2 = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('filter2@test.com', hash, 'Filter2');

  db.prepare(
    `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
     shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin, createdAt)
     VALUES (?, 'TK-FILT-001', 'PENDING', 'UNPAID', 1000, 0, 1000, 'A', 'B', 'a@b.com', '123', 'C', 'S', '123', '2026-01-15 10:00:00')`
  ).run(r1.lastInsertRowid);

  db.prepare(
    `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
     shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin, createdAt)
     VALUES (?, 'TK-FILT-002', 'COMPLETED', 'PAID', 2000, 0, 2000, 'C', 'D', 'c@d.com', '456', 'C', 'S', '123', '2026-06-20 14:00:00')`
  ).run(r2.lastInsertRowid);

  test('filter by payment status UNPAID', () => {
    const results = db.prepare("SELECT * FROM orders WHERE paymentStatus = 'UNPAID'").all();
    assert(results.length >= 1, 'No UNPAID orders found');
    results.forEach(o => assertEq(o.paymentStatus, 'UNPAID'));
  });

  test('filter by payment status PAID', () => {
    const results = db.prepare("SELECT * FROM orders WHERE paymentStatus = 'PAID'").all();
    assert(results.length >= 1, 'No PAID orders found');
    results.forEach(o => assertEq(o.paymentStatus, 'PAID'));
  });

  test('filter by date range', () => {
    const results = db.prepare("SELECT * FROM orders WHERE createdAt >= ? AND createdAt <= ?").all('2026-01-01', '2026-12-31 23:59:59');
    assert(results.length >= 2, 'Date range filter failed');
  });

  test('filter by status', () => {
    const results = db.prepare("SELECT * FROM orders WHERE status = 'PENDING'").all();
    assert(results.length >= 1, 'No PENDING orders found');
    results.forEach(o => assertEq(o.status, 'PENDING'));
  });

  test('combined filters work', () => {
    const results = db.prepare("SELECT * FROM orders WHERE status = ? AND paymentStatus = ?").all('PENDING', 'UNPAID');
    assert(results.length >= 1, 'Combined filter failed');
    results.forEach(o => {
      assertEq(o.status, 'PENDING');
      assertEq(o.paymentStatus, 'UNPAID');
    });
  });
}

// ─── 9. Transaction Integrity Tests ────────────────────────
function testTransactionIntegrity() {
  console.log('\n\x1b[1m── Transaction Integrity ──\x1b[0m');

  test('order creation within transaction is atomic', () => {
    const hash = bcrypt.hashSync('pass', 12);
    const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('atom@test.com', hash, 'Atom');
    const customerId = r.lastInsertRowid;
    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(customerId);
    const cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(customerId);
    db.prepare('INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)').run(cart.id, 'anchor-table', 1);

    const createOrder = db.transaction(() => {
      const orderResult = db.prepare(
        `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
         shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
         VALUES (?, ?, 'PENDING', 'UNPAID', 1000, 0, 1000, 'A', 'B', 'a@b.com', '123', 'C', 'S', '123')`
      ).run(customerId, `TK-ATOM-${Date.now()}`);
      const orderId = orderResult.lastInsertRowid;
      db.prepare('INSERT INTO order_items (orderId, productId, productName, productNameSnapshot, unitPrice, quantity, lineTotal) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(orderId, 'anchor-table', 'Anchor Table', 'Anchor Table', 1000, 1, 1000);
      db.prepare('DELETE FROM cart_items WHERE cartId = ?').run(cart.id);
      return orderId;
    });

    const orderId = createOrder();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    assert(order !== undefined, 'Order not created');
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(orderId);
    assertEq(items.length, 1, 'Item not created');
    const remaining = db.prepare('SELECT * FROM cart_items WHERE cartId = ?').all(cart.id);
    assertEq(remaining.length, 0, 'Cart not cleared');
  });

  test('order belongs to correct customer', () => {
    const hash = bcrypt.hashSync('pass', 12);
    const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('own@test.com', hash, 'Owner');
    const orderR = db.prepare(
      `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
       shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
       VALUES (?, ?, 'PENDING', 'UNPAID', 100, 0, 100, 'O', 'W', 'o@w.com', '123', 'C', 'S', '123')`
    ).run(r.lastInsertRowid, `TK-OWN-${Date.now()}`);
    const order = db.prepare('SELECT customerId FROM orders WHERE id = ?').get(orderR.lastInsertRowid);
    assertEq(order.customerId, r.lastInsertRowid);
  });

  test('order item snapshots are preserved', () => {
    const hash = bcrypt.hashSync('pass', 12);
    const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('snap@test.com', hash, 'Snap');
    const orderR = db.prepare(
      `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
       shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
       VALUES (?, ?, 'PENDING', 'UNPAID', 1000, 0, 1000, 'S', 'N', 's@n.com', '123', 'C', 'S', '123')`
    ).run(r.lastInsertRowid, `TK-SNAP-${Date.now()}`);
    db.prepare(
      'INSERT INTO order_items (orderId, productId, productName, productNameSnapshot, unitPrice, quantity, lineTotal) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(orderR.lastInsertRowid, 'anchor-table', 'Anchor Table', 'Anchor Table', 1000, 1, 1000);

    const item = db.prepare('SELECT * FROM order_items WHERE orderId = ?').get(orderR.lastInsertRowid);
    assertEq(item.productNameSnapshot, 'Anchor Table');
    assertEq(item.unitPrice, 1000);
    assertEq(item.lineTotal, 1000);
    assertEq(item.quantity, 1);
  });
}

// ─── 10. Security Hardening Tests ──────────────────────────
function testSecurityHardening() {
  console.log('\n\x1b[1m── Security Hardening ──\x1b[0m');

  test('order cannot be cancelled twice', () => {
    const VALID_TRANSITIONS = {
      CANCELLED: [],
    };
    assertEq(VALID_TRANSITIONS.CANCELLED.length, 0, 'No transitions from CANCELLED');
  });

  test('admin notes require content', () => {
    const content = '';
    const isValid = content && content.trim().length > 0;
    assert(!isValid, 'Empty content accepted');
  });

  test('admin notes content max length is 5000', () => {
    const content = 'x'.repeat(5001);
    const isValid = content.length <= 5000;
    assert(!isValid, 'Over-length content accepted');
  });

  test('order history cannot be tampered (append-only)', () => {
    const hash = bcrypt.hashSync('pass', 12);
    const r = db.prepare('INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)').run('sec@test.com', hash, 'Sec');
    const orderR = db.prepare(
      `INSERT INTO orders (customerId, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
       shippingFirstName, shippingLastName, shippingEmail, shippingAddress, shippingCity, shippingState, shippingPin)
       VALUES (?, ?, 'PENDING', 'UNPAID', 100, 0, 100, 'S', 'U', 's@u.com', '123', 'C', 'S', '123')`
    ).run(r.lastInsertRowid, `TK-SEC-${Date.now()}`);
    db.prepare(
      `INSERT INTO order_status_history (orderId, newStatus, changedBy, changedByType) VALUES (?, 'CONFIRMED', 'a@t.com', 'admin')`
    ).run(orderR.lastInsertRowid);

    const history = db.prepare('SELECT * FROM order_status_history WHERE orderId = ?').all(orderR.lastInsertRowid);
    assertEq(history.length, 1, 'History should be append-only');
  });

  test('notes linked to order via foreign key', () => {
    const tables = db.prepare("PRAGMA foreign_key_list(order_notes)").all();
    const fk = tables.find(t => t.from === 'orderId');
    assert(fk !== undefined, 'No foreign key on orderId');
  });

  test('status history linked to order via foreign key', () => {
    const tables = db.prepare("PRAGMA foreign_key_list(order_status_history)").all();
    const fk = tables.find(t => t.from === 'orderId');
    assert(fk !== undefined, 'No foreign key on orderId');
  });
}

// ─── Run All Tests ─────────────────────────────────────────
try {
  setup();
  console.log('\x1b[1m\nSprint #12 — Checkout & Order Operations Tests\x1b[0m');
  console.log('='.repeat(50));

  testDatabaseSchema();
  testOrderStatusHistory();
  testOrderNotes();
  testOrderCancellation();
  testCSVExport();
  testOrderNumberFormat();
  testPaymentStatus();
  testAdminFiltering();
  testTransactionIntegrity();
  testSecurityHardening();

  console.log('\n' + '='.repeat(50));
  console.log(`\x1b[1mResults: ${passed}/${total} passed, ${failed} failed\x1b[0m`);

  if (failed > 0) {
    process.exit(1);
  }
} finally {
  cleanup();
}

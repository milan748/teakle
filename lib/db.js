import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'teakle.db');

let _db = null;

export function getDb() {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.pragma('busy_timeout = 5000');

  initSchema(_db);

  return _db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      size TEXT,
      dimensions TEXT,
      description TEXT,
      referenceFile TEXT,
      status TEXT NOT NULL DEFAULT 'NEW',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NEW',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trade_enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      projectType TEXT,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'NEW',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      sectionKey TEXT NOT NULL,
      title TEXT,
      subtitle TEXT,
      eyebrow TEXT,
      body TEXT,
      image TEXT,
      mobileImage TEXT,
      buttonLabel TEXT,
      buttonUrl TEXT,
      sortOrder INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      draftTitle TEXT,
      draftSubtitle TEXT,
      draftEyebrow TEXT,
      draftBody TEXT,
      draftImage TEXT,
      draftMobileImage TEXT,
      draftButtonLabel TEXT,
      draftButtonUrl TEXT,
      draftEnabled INTEGER,
      status TEXT NOT NULL DEFAULT 'published',
      publishedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(page, sectionKey)
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      originalName TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      altText TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

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

    CREATE TABLE IF NOT EXISTS product_metadata (
      productId TEXT PRIMARY KEY,
      sku TEXT UNIQUE,
      active INTEGER NOT NULL DEFAULT 1,
      inventoryQuantity INTEGER,
      description TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customer_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      fullName TEXT NOT NULL DEFAULT '',
      phone TEXT DEFAULT '',
      addressLine1 TEXT NOT NULL,
      addressLine2 TEXT DEFAULT '',
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postalCode TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      isDefault INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customerId) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      tokenHash TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customerId) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      provider TEXT NOT NULL DEFAULT 'none',
      providerPaymentId TEXT,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'PENDING',
      idempotencyKey TEXT UNIQUE,
      metadata TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adminId INTEGER NOT NULL,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT,
      metadata TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (adminId) REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS order_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      actorType TEXT NOT NULL,
      actorId TEXT NOT NULL,
      action TEXT NOT NULL,
      oldValue TEXT,
      newValue TEXT,
      note TEXT,
      isCustomerVisible INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
  `);

  migrateDraftColumns(db);
  migrateContactReadColumn(db);
  migrateOrderIntegrity(db);
  migrateOrderStatusHistory(db);
  migrateOrderNotes(db);
  migrateOrderCommerce(db);
  migrateProductMetadata(db);
  migrateCustomerAddresses(db);
  migratePasswordResets(db);
  migrateCustomerIsActive(db);
  migratePaymentsTable(db);
  migrateAdminAuditLogs(db);
  migrateOrderActivity(db);
}

function migrateDraftColumns(db) {
  const columns = db.prepare("PRAGMA table_info(content_sections)").all();
  const colNames = columns.map(c => c.name);

  const newCols = [
    ['draftTitle', 'TEXT'],
    ['draftSubtitle', 'TEXT'],
    ['draftEyebrow', 'TEXT'],
    ['draftBody', 'TEXT'],
    ['draftImage', 'TEXT'],
    ['draftMobileImage', 'TEXT'],
    ['draftButtonLabel', 'TEXT'],
    ['draftButtonUrl', 'TEXT'],
    ['draftEnabled', 'INTEGER'],
    ['status', "TEXT NOT NULL DEFAULT 'published'"],
    ['publishedAt', 'TEXT'],
  ];

  for (const [name, type] of newCols) {
    if (!colNames.includes(name)) {
      db.exec(`ALTER TABLE content_sections ADD COLUMN ${name} ${type}`);
    }
  }
}

function migrateContactReadColumn(db) {
  const columns = db.prepare("PRAGMA table_info(contact_submissions)").all();
  const colNames = columns.map(c => c.name);
  if (!colNames.includes('read')) {
    db.exec(`ALTER TABLE contact_submissions ADD COLUMN read INTEGER NOT NULL DEFAULT 0`);
  }
}

function migrateOrderIntegrity(db) {
  const orderCols = db.prepare("PRAGMA table_info(orders)").all();
  const orderColNames = orderCols.map(c => c.name);

  if (!orderColNames.includes('paymentStatus')) {
    db.exec(`ALTER TABLE orders ADD COLUMN paymentStatus TEXT NOT NULL DEFAULT 'UNPAID'`);
  }

  const itemCols = db.prepare("PRAGMA table_info(order_items)").all();
  const itemColNames = itemCols.map(c => c.name);

  if (!itemColNames.includes('productNameSnapshot')) {
    db.exec(`ALTER TABLE order_items ADD COLUMN productNameSnapshot TEXT NOT NULL DEFAULT ''`);
  }
  if (!itemColNames.includes('unitPrice')) {
    db.exec(`ALTER TABLE order_items ADD COLUMN unitPrice INTEGER NOT NULL DEFAULT 0`);
  }
  if (!itemColNames.includes('lineTotal')) {
    db.exec(`ALTER TABLE order_items ADD COLUMN lineTotal INTEGER NOT NULL DEFAULT 0`);
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_customerId ON orders(customerId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_cart_items_cartId ON cart_items(cartId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlistId ON wishlist_items(wishlistId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`);
}

function migrateOrderStatusHistory(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_order_status_history_orderId ON order_status_history(orderId)`);
}

function migrateOrderNotes(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_order_notes_orderId ON order_notes(orderId)`);
}

function migrateOrderCommerce(db) {
  const orderCols = db.prepare("PRAGMA table_info(orders)").all();
  const orderColNames = orderCols.map(c => c.name);

  if (!orderColNames.includes('billingPhone')) {
    db.exec(`ALTER TABLE orders ADD COLUMN billingPhone TEXT`);
  }
  if (!orderColNames.includes('billingEmail')) {
    db.exec(`ALTER TABLE orders ADD COLUMN billingEmail TEXT`);
  }
  if (!orderColNames.includes('billingCountry')) {
    db.exec(`ALTER TABLE orders ADD COLUMN billingCountry TEXT DEFAULT 'India'`);
  }
  if (!orderColNames.includes('taxAmount')) {
    db.exec(`ALTER TABLE orders ADD COLUMN taxAmount INTEGER NOT NULL DEFAULT 0`);
  }
  if (!orderColNames.includes('discountAmount')) {
    db.exec(`ALTER TABLE orders ADD COLUMN discountAmount INTEGER NOT NULL DEFAULT 0`);
  }

  const itemCols = db.prepare("PRAGMA table_info(order_items)").all();
  const itemColNames = itemCols.map(c => c.name);
  if (!itemColNames.includes('sku')) {
    db.exec(`ALTER TABLE order_items ADD COLUMN sku TEXT`);
  }
}

function migrateProductMetadata(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_product_metadata_sku ON product_metadata(sku)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_product_metadata_active ON product_metadata(active)`);
}

function migrateCustomerAddresses(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_customer_addresses_customerId ON customer_addresses(customerId)`);
}

function migratePasswordResets(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_password_resets_customerId ON password_resets(customerId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_password_resets_tokenHash ON password_resets(tokenHash)`);
}

function migrateCustomerIsActive(db) {
  const cols = db.prepare("PRAGMA table_info(customers)").all();
  const colNames = cols.map(c => c.name);
  if (!colNames.includes('isActive')) {
    db.exec(`ALTER TABLE customers ADD COLUMN isActive INTEGER NOT NULL DEFAULT 1`);
  }
}

function migratePaymentsTable(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_orderId ON payments(orderId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_providerPaymentId ON payments(providerPaymentId)`);
}

function migrateAdminAuditLogs(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_adminId ON admin_audit_logs(adminId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity ON admin_audit_logs(entityType, entityId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_createdAt ON admin_audit_logs(createdAt)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action)`);
}

function migrateOrderActivity(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_order_activity_orderId ON order_activity(orderId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_order_activity_actor ON order_activity(actorType, actorId)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_order_activity_createdAt ON order_activity(createdAt)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_order_activity_customerVisible ON order_activity(isCustomerVisible)`);
}

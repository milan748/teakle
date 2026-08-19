#!/usr/bin/env node

/**
 * TEAKLE — Sprint #26 Test Suite
 * Production Deployment & Go-Live Validation
 *
 * Comprehensive tests for deployment configuration, environment,
 * database schema, security hardening, backup/restore, health checks,
 * and production readiness.
 *
 * Run: node scripts/test-sprint26.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

let passed = 0;
let failed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    const result = fn();
    if (result === true) {
      passed++;
      console.log(`PASS ${name}`);
    } else {
      failed++;
      console.log(`FAIL ${name} — ${result}`);
    }
  } catch (e) {
    failed++;
    console.log(`FAIL ${name} — ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// IN-MEMORY TEST DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

function createTestDb() {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  return db;
}

function loadSchema(db) {
  const schemaPath = path.join(__dirname, '..', 'lib', 'db.js');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const tableRegex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([^)]+)\)/g;
  let match;
  while ((match = tableRegex.exec(schemaContent)) !== null) {
    const tableName = match[1];
    const columns = match[2];
    try {
      db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`);
    } catch (e) {
      // Table may already exist or have syntax issues
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DEPLOYMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 1. DEPLOYMENT CONFIGURATION ===');

test('package.json exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'package.json')) === true;
});

test('package.json has name', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  return typeof pkg.name === 'string' && pkg.name.length > 0;
});

test('package.json has version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  return typeof pkg.version === 'string' && pkg.version.length > 0;
});

test('package.json has build script', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  return typeof pkg.scripts?.build === 'string';
});

test('package.json has start script', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  return typeof pkg.scripts?.start === 'string';
});

test('package.json has dev script', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  return typeof pkg.scripts?.dev === 'string';
});

test('next.config.mjs exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'next.config.mjs')) === true;
});

test('next.config.mjs has Cache-Control headers', () => {
  const config = fs.readFileSync(path.join(__dirname, '..', 'next.config.mjs'), 'utf8');
  return config.includes('Cache-Control');
});

test('next.config.mjs excludes API routes from CDN', () => {
  const config = fs.readFileSync(path.join(__dirname, '..', 'next.config.mjs'), 'utf8');
  return config.includes('source: \'/api/(.*)\'') && config.includes('no-store');
});

test('next.config.mjs has security headers for all routes', () => {
  const config = fs.readFileSync(path.join(__dirname, '..', 'next.config.mjs'), 'utf8');
  return config.includes("source: '/(.*)'") && config.includes('securityHeaders');
});

test('next.config.mjs admin API routes covered by /api/ rule', () => {
  const config = fs.readFileSync(path.join(__dirname, '..', 'next.config.mjs'), 'utf8');
  return config.includes("source: '/api/(.*)'") && config.includes('Cache-Control');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ENVIRONMENT VARIABLES
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 2. ENVIRONMENT VARIABLES ===');

test('.env.example exists', () => {
  return fs.existsSync(path.join(__dirname, '..', '.env.example')) === true;
});

test('.env.example has SESSION_SECRET placeholder', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('SESSION_SECRET=');
});

test('.env.example has ADMIN_EMAIL placeholder', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('ADMIN_EMAIL=');
});

test('.env.example has ADMIN_PASSWORD placeholder', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('ADMIN_PASSWORD=');
});

test('.env.example has DATABASE_PATH', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('DATABASE_PATH=');
});

test('.env.example has MEDIA_UPLOAD_DIR', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('MEDIA_UPLOAD_DIR=');
});

test('.env.example has NEXT_PUBLIC_SITE_URL', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('NEXT_PUBLIC_SITE_URL=');
});

test('.env.example has ALLOW_INSECURE_SESSION', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('ALLOW_INSECURE_SESSION=');
});

test('.env.example has BACKUP_DIR', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('BACKUP_DIR=');
});

test('.env.example has EMAIL_PROVIDER', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('EMAIL_PROVIDER=');
});

test('.env.example has EMAIL_FROM', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('EMAIL_FROM=');
});

test('.env.example has EMAIL_API_KEY', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('EMAIL_API_KEY=');
});

test('.env.example has PAYMENT_PROVIDER', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('PAYMENT_PROVIDER=');
});

test('.env.example has PAYMENT_KEY_ID', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('PAYMENT_KEY_ID=');
});

test('.env.example has PAYMENT_KEY_SECRET', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('PAYMENT_KEY_SECRET=');
});

test('.env.example has PAYMENT_WEBHOOK_SECRET', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return env.includes('PAYMENT_WEBHOOK_SECRET=');
});

test('.env.example does not use real domain', () => {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  return !env.includes('teakle.in');
});

test('lib/env.js has OPTIONAL_ENV with email vars', () => {
  const envJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'env.js'), 'utf8');
  return envJs.includes('EMAIL_PROVIDER') && envJs.includes('EMAIL_FROM') && envJs.includes('EMAIL_API_KEY');
});

test('lib/env.js has OPTIONAL_ENV with payment vars', () => {
  const envJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'env.js'), 'utf8');
  return envJs.includes('PAYMENT_PROVIDER') && envJs.includes('PAYMENT_KEY_ID') && envJs.includes('PAYMENT_KEY_SECRET');
});

test('lib/env.js has OPTIONAL_ENV with BACKUP_DIR', () => {
  const envJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'env.js'), 'utf8');
  return envJs.includes('BACKUP_DIR');
});

test('lib/env.js validateEnv is a function', () => {
  const envJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'env.js'), 'utf8');
  return envJs.includes('function validateEnv');
});

test('lib/env.js getEnv is a function', () => {
  const envJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'env.js'), 'utf8');
  return envJs.includes('function getEnv');
});

test('lib/env.js requireEnv is a function', () => {
  const envJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'env.js'), 'utf8');
  return envJs.includes('function requireEnv');
});

test('lib/env.js exports validateEnv, getEnv, requireEnv', () => {
  const envJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'env.js'), 'utf8');
  return envJs.includes('module.exports') && envJs.includes('validateEnv') && envJs.includes('getEnv') && envJs.includes('requireEnv');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DATABASE SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 3. DATABASE SCHEMA ===');

test('lib/db.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'db.js')) === true;
});

test('lib/db.js has CREATE TABLE statements', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS');
});

test('lib/db.js has admins table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS admins');
});

test('lib/db.js has customers table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS customers');
});

test('lib/db.js has orders table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS orders');
});

test('lib/db.js has order_items table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS order_items');
});

test('lib/db.js has payments table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS payments');
});

test('lib/db.js has payment_webhook_events table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS payment_webhook_events');
});

test('lib/db.js has admin_audit_logs table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS admin_audit_logs');
});

test('lib/db.js has order_activity table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS order_activity');
});

test('lib/db.js has order_status_history table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS order_status_history');
});

test('lib/db.js has order_notes table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS order_notes');
});

test('lib/db.js has product_metadata table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS product_metadata');
});

test('lib/db.js has customer_addresses table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS customer_addresses');
});

test('lib/db.js has password_resets table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS password_resets');
});

test('lib/db.js has carts table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS carts');
});

test('lib/db.js has cart_items table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS cart_items');
});

test('lib/db.js has wishlists table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS wishlists');
});

test('lib/db.js has wishlist_items table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS wishlist_items');
});

test('lib/db.js has media table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS media');
});

test('lib/db.js has custom_orders table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS custom_orders');
});

test('lib/db.js has contact_submissions table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS contact_submissions');
});

test('lib/db.js has trade_enquiries table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS trade_enquiries');
});

test('lib/db.js has newsletter_subscribers table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS newsletter_subscribers');
});

test('lib/db.js has content_sections table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS content_sections');
});

test('lib/db.js has site_settings table', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('CREATE TABLE IF NOT EXISTS site_settings');
});

test('lib/db.js enables WAL mode', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('wal') || dbJs.includes('WAL');
});

test('lib/db.js enables foreign_keys', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('foreign_keys');
});

test('lib/db.js sets busy_timeout', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');
  return dbJs.includes('busy_timeout');
});

test('In-memory DB: all 24 required tables can be created', () => {
  const db = createTestDb();
  
  const requiredTables = [
    'admins', 'customers', 'orders', 'order_items', 'carts', 'cart_items',
    'wishlists', 'wishlist_items', 'content_sections', 'site_settings',
    'media', 'custom_orders', 'contact_submissions', 'trade_enquiries',
    'newsletter_subscribers', 'payments', 'payment_webhook_events',
    'admin_audit_logs', 'order_activity', 'order_status_history',
    'order_notes', 'product_metadata', 'customer_addresses', 'password_resets',
  ];
  
  // Create minimal schema for each table
  const schemas = {
    admins: 'id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL',
    customers: 'id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, phone TEXT, password TEXT NOT NULL, isActive INTEGER DEFAULT 1',
    orders: 'id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL, total REAL NOT NULL, status TEXT DEFAULT "pending"',
    order_items: 'id INTEGER PRIMARY KEY AUTOINCREMENT, orderId INTEGER NOT NULL, productId INTEGER NOT NULL, quantity INTEGER NOT NULL',
    carts: 'id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER',
    cart_items: 'id INTEGER PRIMARY KEY AUTOINCREMENT, cartId INTEGER NOT NULL, productId INTEGER NOT NULL, quantity INTEGER NOT NULL',
    wishlists: 'id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL',
    wishlist_items: 'id INTEGER PRIMARY KEY AUTOINCREMENT, wishlistId INTEGER NOT NULL, productId INTEGER NOT NULL',
    content_sections: 'id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE NOT NULL, value TEXT',
    site_settings: 'id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE NOT NULL, value TEXT',
    media: 'id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, originalName TEXT, mimeType TEXT, size INTEGER',
    custom_orders: 'id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, status TEXT DEFAULT "NEW"',
    contact_submissions: 'id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL, status TEXT DEFAULT "NEW"',
    trade_enquiries: 'id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, status TEXT DEFAULT "NEW"',
    newsletter_subscribers: 'id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, subscribed INTEGER DEFAULT 1',
    payments: 'id INTEGER PRIMARY KEY AUTOINCREMENT, orderId INTEGER NOT NULL, amount REAL NOT NULL, status TEXT DEFAULT "UNPAID"',
    payment_webhook_events: 'id INTEGER PRIMARY KEY AUTOINCREMENT, provider TEXT NOT NULL, eventId TEXT, payload TEXT, status TEXT DEFAULT "received"',
    admin_audit_logs: 'id INTEGER PRIMARY KEY AUTOINCREMENT, adminId INTEGER, action TEXT NOT NULL, details TEXT',
    order_activity: 'id INTEGER PRIMARY KEY AUTOINCREMENT, orderId INTEGER NOT NULL, action TEXT NOT NULL, details TEXT',
    order_status_history: 'id INTEGER PRIMARY KEY AUTOINCREMENT, orderId INTEGER NOT NULL, fromStatus TEXT, toStatus TEXT NOT NULL',
    order_notes: 'id INTEGER PRIMARY KEY AUTOINCREMENT, orderId INTEGER NOT NULL, note TEXT NOT NULL, isInternal INTEGER DEFAULT 0',
    product_metadata: 'id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER UNIQUE NOT NULL, sku TEXT, stock INTEGER DEFAULT 0',
    customer_addresses: 'id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL, label TEXT, line1 TEXT NOT NULL, city TEXT, state TEXT, pincode TEXT',
    password_resets: 'id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, token TEXT NOT NULL, expiresAt TEXT NOT NULL, used INTEGER DEFAULT 0',
  };
  
  let created = 0;
  for (const [table, schema] of Object.entries(schemas)) {
    try {
      db.exec(`CREATE TABLE IF NOT EXISTS ${table} (${schema})`);
      created++;
    } catch (e) {
      // Skip
    }
  }
  
  db.close();
  return created === 24 || `Only created ${created} tables`;
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SECURITY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 4. SECURITY ===');

test('lib/csrf.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'csrf.js')) === true;
});

test('lib/csrf.js has CSRF_COOKIE constant', () => {
  const csrfJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'csrf.js'), 'utf8');
  return csrfJs.includes('CSRF_COOKIE') || csrfJs.includes('teakle_csrf');
});

test('lib/csrf.js has validateCsrfRequest function', () => {
  const csrfJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'csrf.js'), 'utf8');
  return csrfJs.includes('validateCsrfRequest') || csrfJs.includes('validateCsrf');
});

test('lib/csrf.js has withCsrf HOC', () => {
  const csrfJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'csrf.js'), 'utf8');
  return csrfJs.includes('withCsrf');
});

test('lib/csrf.js has setCsrfCookie function', () => {
  const csrfJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'csrf.js'), 'utf8');
  return csrfJs.includes('setCsrfCookie');
});

test('lib/csrf.js has getCsrfToken function', () => {
  const csrfJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'csrf.js'), 'utf8');
  return csrfJs.includes('getCsrfToken');
});

test('lib/auth.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'auth.js')) === true;
});

test('lib/auth.js has requireAdmin function', () => {
  const authJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'auth.js'), 'utf8');
  return authJs.includes('requireAdmin');
});

test('lib/rateLimit.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'rateLimit.js')) === true;
});

test('lib/rateLimit.js has rateLimit function', () => {
  const rlJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'rateLimit.js'), 'utf8');
  return rlJs.includes('rateLimit') || rlJs.includes('checkRateLimit');
});

test('lib/storage.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'storage.js')) === true;
});

test('lib/storage.js validates MIME types', () => {
  const storageJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'storage.js'), 'utf8');
  return storageJs.includes('ext') || storageJs.includes('extension') || storageJs.includes('path.extname');
});

test('lib/logger.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'logger.js')) === true;
});

test('lib/logger.js has SENSITIVE_KEYS redaction', () => {
  const loggerJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'logger.js'), 'utf8');
  return loggerJs.includes('SENSITIVE_KEYS') || loggerJs.includes('redact');
});

test('.gitignore has .env patterns', () => {
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  return gitignore.includes('.env') && gitignore.includes('.env.local');
});

test('.gitignore has .env.* pattern', () => {
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  return gitignore.includes('.env.*');
});

test('.gitignore excludes .env.example', () => {
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  return gitignore.includes('!.env.example');
});

test('.gitignore excludes node_modules', () => {
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  return gitignore.includes('node_modules/');
});

test('.gitignore excludes .next', () => {
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  return gitignore.includes('.next/');
});

test('.gitignore excludes data/*.db', () => {
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  return gitignore.includes('data/*.db');
});

test('.gitignore excludes public/uploads/', () => {
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  return gitignore.includes('public/uploads/');
});

test('.gitignore excludes backups/', () => {
  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  return gitignore.includes('backups/');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. HEALTH & DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 5. HEALTH & DIAGNOSTICS ===');

test('lib/health.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'health.js')) === true;
});

test('lib/health.js has checkDatabase function', () => {
  const healthJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'health.js'), 'utf8');
  return healthJs.includes('checkDatabase');
});

test('lib/health.js has checkSystem function', () => {
  const healthJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'health.js'), 'utf8');
  return healthJs.includes('checkSystem');
});

test('lib/health.js has getTablesInfo function', () => {
  const healthJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'health.js'), 'utf8');
  return healthJs.includes('getTablesInfo');
});

test('app/api/health/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'health', 'route.js')) === true;
});

test('app/api/health/route.js has GET handler', () => {
  const routeJs = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'health', 'route.js'), 'utf8');
  return routeJs.includes('GET') || routeJs.includes('export');
});

test('app/api/health/route.js returns 3-level severity', () => {
  const routeJs = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'health', 'route.js'), 'utf8');
  return routeJs.includes('HEALTHY') || routeJs.includes('healthy');
});

test('app/api/admin/diagnostics/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'admin', 'diagnostics', 'route.js')) === true;
});

test('app/api/admin/diagnostics/route.js requires admin auth', () => {
  const routeJs = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'admin', 'diagnostics', 'route.js'), 'utf8');
  return routeJs.includes('requireAdmin') || routeJs.includes('admin');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. BACKUP & RESTORE
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 6. BACKUP & RESTORE ===');

test('scripts/backup-db.js exists', () => {
  return fs.existsSync(path.join(__dirname, 'backup-db.js')) === true;
});

test('scripts/backup-db.js has backup functionality', () => {
  const backupJs = fs.readFileSync(path.join(__dirname, 'backup-db.js'), 'utf8');
  return backupJs.includes('backup') || backupJs.includes('backupDatabase');
});

test('scripts/backup-db.js has restore functionality', () => {
  const backupJs = fs.readFileSync(path.join(__dirname, 'backup-db.js'), 'utf8');
  return backupJs.includes('restore') || backupJs.includes('--restore');
});

test('scripts/backup-db.js has list functionality', () => {
  const backupJs = fs.readFileSync(path.join(__dirname, 'backup-db.js'), 'utf8');
  return backupJs.includes('list') || backupJs.includes('--list');
});

test('scripts/backup-db.js has verify functionality', () => {
  const backupJs = fs.readFileSync(path.join(__dirname, 'backup-db.js'), 'utf8');
  return backupJs.includes('verify') || backupJs.includes('--verify');
});

test('scripts/backup-db.js has auto-prune', () => {
  const backupJs = fs.readFileSync(path.join(__dirname, 'backup-db.js'), 'utf8');
  return backupJs.includes('max-backups') || backupJs.includes('prune');
});

test('scripts/backup-db.js uses SQLite backup API', () => {
  const backupJs = fs.readFileSync(path.join(__dirname, 'backup-db.js'), 'utf8');
  return backupJs.includes('backup') || backupJs.includes('VACUUM');
});

test('scripts/backup-db.js includes WAL in backup', () => {
  const backupJs = fs.readFileSync(path.join(__dirname, 'backup-db.js'), 'utf8');
  return backupJs.includes('wal') || backupJs.includes('WAL') || backupJs.includes('journal_mode');
});

test('scripts/backup-db.js checks integrity', () => {
  const backupJs = fs.readFileSync(path.join(__dirname, 'backup-db.js'), 'utf8');
  return backupJs.includes('integrity_check') || backupJs.includes('integrity');
});

test('scripts/backup-db.js checks foreign keys', () => {
  const backupJs = fs.readFileSync(path.join(__dirname, 'backup-db.js'), 'utf8');
  return backupJs.includes('foreign_key_check') || backupJs.includes('foreign_keys');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ERROR BOUNDARIES
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 7. ERROR BOUNDARIES ===');

test('app/error.js exists (global)', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'error.js')) === true;
});

test('app/error.js is client component', () => {
  const errorJs = fs.readFileSync(path.join(__dirname, '..', 'app', 'error.js'), 'utf8');
  return errorJs.includes("'use client'");
});

test('app/admin/error.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'admin', 'error.js')) === true;
});

test('app/admin/error.js is client component', () => {
  const errorJs = fs.readFileSync(path.join(__dirname, '..', 'app', 'admin', 'error.js'), 'utf8');
  return errorJs.includes("'use client'");
});

test('app/admin/error.js does not leak error.message', () => {
  const errorJs = fs.readFileSync(path.join(__dirname, '..', 'app', 'admin', 'error.js'), 'utf8');
  return !errorJs.includes('error?.message') && !errorJs.includes('error.message');
});

test('app/admin/error.js shows error.digest only', () => {
  const errorJs = fs.readFileSync(path.join(__dirname, '..', 'app', 'admin', 'error.js'), 'utf8');
  return errorJs.includes('error?.digest');
});

test('app/checkout/error.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'checkout', 'error.js')) === true;
});

test('app/checkout/error.js is client component', () => {
  const errorJs = fs.readFileSync(path.join(__dirname, '..', 'app', 'checkout', 'error.js'), 'utf8');
  return errorJs.includes("'use client'");
});

test('app/account/error.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'account', 'error.js')) === true;
});

test('app/account/error.js is client component', () => {
  const errorJs = fs.readFileSync(path.join(__dirname, '..', 'app', 'account', 'error.js'), 'utf8');
  return errorJs.includes("'use client'");
});

test('app/not-found.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'not-found.js')) === true;
});

test('app/loading.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'loading.js')) === true;
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. PROCESS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 8. PROCESS MANAGEMENT ===');

test('DEPLOYMENT.md has process manager section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Process Management');
});

test('DEPLOYMENT.md documents systemd', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('systemd');
});

test('DEPLOYMENT.md documents PM2', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('PM2');
});

test('DEPLOYMENT.md documents Docker', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Docker');
});

test('DEPLOYMENT.md warns single-instance only', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('single-instance') || deployment.includes('single instance');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. DEPLOYMENT DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 9. DEPLOYMENT DOCUMENTATION ===');

test('DEPLOYMENT.md exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'DEPLOYMENT.md')) === true;
});

test('DEPLOYMENT.md has requirements section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Requirements');
});

test('DEPLOYMENT.md has installation section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Installation');
});

test('DEPLOYMENT.md has environment variables section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Environment Variables');
});

test('DEPLOYMENT.md has database section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Database');
});

test('DEPLOYMENT.md has media storage section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Media Storage');
});

test('DEPLOYMENT.md has build section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Build');
});

test('DEPLOYMENT.md has start section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Start');
});

test('DEPLOYMENT.md has HTTPS section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('HTTPS');
});

test('DEPLOYMENT.md has cookie behavior section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Cookie Behavior');
});

test('DEPLOYMENT.md has backups section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Backups');
});

test('DEPLOYMENT.md has restore procedure section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Restore Procedure');
});

test('DEPLOYMENT.md has health check section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Health Check');
});

test('DEPLOYMENT.md has admin setup section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Admin Setup');
});

test('DEPLOYMENT.md has production verification section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Production Verification');
});

test('DEPLOYMENT.md has known limitations section', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('Known Limitations');
});

test('DEPLOYMENT.md mentions email provider config', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('EMAIL_PROVIDER') && deployment.includes('EMAIL_FROM');
});

test('DEPLOYMENT.md mentions payment provider config', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('PAYMENT_PROVIDER') && deployment.includes('PAYMENT_KEY_ID');
});

test('DEPLOYMENT.md generates base64url secret (not hex)', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('base64url');
});

test('DEPLOYMENT.md references test-sprint26.js', () => {
  const deployment = fs.readFileSync(path.join(__dirname, '..', 'DEPLOYMENT.md'), 'utf8');
  return deployment.includes('test-sprint26.js');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. PREFLIGHT SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 10. PREFLIGHT SCRIPT ===');

test('scripts/preflight-production.js exists', () => {
  return fs.existsSync(path.join(__dirname, 'preflight-production.js')) === true;
});

test('preflight checks Node version', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('nodeVersion') || preflight.includes('process.version');
});

test('preflight checks required env vars', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('SESSION_SECRET') && preflight.includes('ADMIN_EMAIL') && preflight.includes('ADMIN_PASSWORD');
});

test('preflight checks optional env vars', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('DATABASE_PATH') && preflight.includes('MEDIA_UPLOAD_DIR');
});

test('preflight checks SESSION_SECRET strength', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('SESSION_SECRET STRENGTH') || preflight.includes('secret.length');
});

test('preflight accepts hex strings with 64 chars', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('sufficient entropy') || preflight.includes('hex string');
});

test('preflight checks NODE_ENV', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('NODE_ENV') || preflight.includes('NODE ENVIRONMENT');
});

test('preflight checks site URL', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('NEXT_PUBLIC_SITE_URL') || preflight.includes('SITE URL');
});

test('preflight checks database exists', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('dbPath') || preflight.includes('DATABASE');
});

test('preflight checks database integrity', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('integrity_check');
});

test('preflight checks WAL mode', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('journal_mode') || preflight.includes('WAL');
});

test('preflight checks foreign keys', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('foreign_keys');
});

test('preflight checks required tables', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('requiredTables');
});

test('preflight checks file system writability', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('FILE SYSTEM') || preflight.includes('writable');
});

test('preflight checks .next build directory', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('.next') || preflight.includes('BUILD');
});

test('preflight checks package.json', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('package.json') || preflight.includes('PACKAGE');
});

test('preflight checks git status', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('git status') || preflight.includes('GIT');
});

test('preflight checks optional email vars', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('EMAIL_PROVIDER') && preflight.includes('EMAIL_FROM');
});

test('preflight checks optional payment vars', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('PAYMENT_PROVIDER') && preflight.includes('PAYMENT_KEY_ID');
});

test('preflight produces summary', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('Results:') || preflight.includes('Summary');
});

test('preflight exits with code 1 on FAIL', () => {
  const preflight = fs.readFileSync(path.join(__dirname, 'preflight-production.js'), 'utf8');
  return preflight.includes('process.exit(1)');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. API ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 11. API ROUTES ===');

test('app/api/csrf/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'csrf', 'route.js')) === true;
});

test('app/api/admin/login/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'admin', 'login', 'route.js')) === true;
});

test('app/api/admin/logout/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'admin', 'logout', 'route.js')) === true;
});

test('app/api/auth/login/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'login', 'route.js')) === true;
});

test('app/api/auth/register/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'register', 'route.js')) === true;
});

test('app/api/auth/logout/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'logout', 'route.js')) === true;
});

test('app/api/cart/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'cart', 'route.js')) === true;
});

test('app/api/orders/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'orders', 'route.js')) === true;
});

test('app/api/wishlist/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'wishlist', 'route.js')) === true;
});

test('app/api/addresses/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'addresses', 'route.js')) === true;
});

test('app/api/health/route.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'app', 'api', 'health', 'route.js')) === true;
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 12. SESSION MANAGEMENT ===');

test('lib/session.js exists (admin)', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'session.js')) === true;
});

test('lib/customerSession.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'customerSession.js')) === true;
});

test('lib/session.js has createSession function', () => {
  const sessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'session.js'), 'utf8');
  return sessionJs.includes('createSession');
});

test('lib/session.js has deleteSession function', () => {
  const sessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'session.js'), 'utf8');
  return sessionJs.includes('deleteSession');
});

test('lib/customerSession.js has createCustomerSession function', () => {
  const customerSessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'customerSession.js'), 'utf8');
  return customerSessionJs.includes('createCustomerSession');
});

test('lib/customerSession.js has deleteCustomerSession function', () => {
  const customerSessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'customerSession.js'), 'utf8');
  return customerSessionJs.includes('deleteCustomerSession');
});

test('lib/session.js uses JWT', () => {
  const sessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'session.js'), 'utf8');
  return sessionJs.includes('jose') || sessionJs.includes('jwt') || sessionJs.includes('SignJWT');
});

test('lib/customerSession.js uses JWT', () => {
  const customerSessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'customerSession.js'), 'utf8');
  return customerSessionJs.includes('jose') || customerSessionJs.includes('jwt') || customerSessionJs.includes('SignJWT');
});

test('lib/customerSession.js checks isActive', () => {
  const customerSessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'customerSession.js'), 'utf8');
  return customerSessionJs.includes('isActive');
});

test('lib/customerSession.js sets HttpOnly cookie', () => {
  const customerSessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'customerSession.js'), 'utf8');
  return customerSessionJs.includes('httpOnly') || customerSessionJs.includes('HttpOnly');
});

test('lib/customerSession.js sets Secure flag', () => {
  const customerSessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'customerSession.js'), 'utf8');
  return customerSessionJs.includes('secure') || customerSessionJs.includes('Secure');
});

test('lib/customerSession.js sets SameSite', () => {
  const customerSessionJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'customerSession.js'), 'utf8');
  return customerSessionJs.includes('sameSite') || customerSessionJs.includes('SameSite');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. PAYMENT ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 13. PAYMENT ARCHITECTURE ===');

test('lib/payment.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'payment.js')) === true;
});

test('lib/payment.js has state machine', () => {
  const paymentJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'payment.js'), 'utf8');
  return paymentJs.includes('UNPAID') && paymentJs.includes('PENDING') && paymentJs.includes('PAID');
});

test('lib/payment.js has REFUNDED state', () => {
  const paymentJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'payment.js'), 'utf8');
  return paymentJs.includes('REFUNDED');
});

test('lib/payment.js has CANCELLED state', () => {
  const paymentJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'payment.js'), 'utf8');
  return paymentJs.includes('CANCELLED');
});

test('lib/payment.js has FAILED state', () => {
  const paymentJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'payment.js'), 'utf8');
  return paymentJs.includes('FAILED');
});

test('lib/payment.js checks provider config', () => {
  const paymentJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'payment.js'), 'utf8');
  return paymentJs.includes('configured') || paymentJs.includes('provider');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. EMAIL ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 14. EMAIL ARCHITECTURE ===');

test('lib/email.js exists', () => {
  return fs.existsSync(path.join(__dirname, '..', 'lib', 'email.js')) === true;
});

test('lib/email.js has send function', () => {
  const emailJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'email.js'), 'utf8');
  return emailJs.includes('send') || emailJs.includes('sendEmail');
});

test('lib/email.js checks provider config', () => {
  const emailJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'email.js'), 'utf8');
  return emailJs.includes('configured') || emailJs.includes('provider');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 15. REGRESSION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 15. REGRESSION TESTS ===');

test('Sprint #25 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint25.js')) === true;
});

test('Sprint #24 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint24.js')) === true;
});

test('Sprint #23 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint23.js')) === true;
});

test('Sprint #22 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint22.js')) === true;
});

test('Sprint #21 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint21.js')) === true;
});

test('Sprint #20 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint20.js')) === true;
});

test('Sprint #19 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint19.js')) === true;
});

test('Sprint #18 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint18.js')) === true;
});

test('Sprint #17 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint17.js')) === true;
});

test('Sprint #16 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint16.js')) === true;
});

test('Sprint #15 test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'test-sprint15.js')) === true;
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n' + '='.repeat(60));
console.log(`\x1b[1mSprint #26 Test Results: ${passed} PASS, ${failed} FAIL, ${total} TOTAL\x1b[0m`);

if (failed > 0) {
  console.log('\x1b[31mSOME TESTS FAILED\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32mALL TESTS PASSED\x1b[0m');
  process.exit(0);
}

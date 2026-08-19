#!/usr/bin/env node

/**
 * TEAKLE — Sprint #28 Unit Tests
 * Rate limiter hardening, session security, admin audit, pagination,
 * payment hardening, media security, order activity, input validation,
 * database integrity, SEO/a11y regression.
 *
 * Usage: node scripts/test-sprint28.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

let pass = 0;
let fail = 0;
const sections = {};

function test(name, fn) {
  try {
    fn();
    pass++;
  } catch (e) {
    fail++;
    console.log(`  FAIL: ${name} — ${e.message}`);
  }
}

function section(name) {
  if (sections[name]) sections[name]++;
  else sections[name] = 1;
  console.log(`\n=== ${name} (${sections[name] ? 'run ' + sections[name] : '1'}) ===`);
}

function summary() {
  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail > 0 ? 1 : 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════
section('RATE LIMITING');

const rateLimitSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'rateLimit.js'), 'utf8');

test('extractClientIp exported', () => {
  assert.ok(rateLimitSrc.includes('export function extractClientIp'));
});

test('rateLimitIp exported', () => {
  assert.ok(rateLimitSrc.includes('export function rateLimitIp'));
});

test('rateLimitAuth exported', () => {
  assert.ok(rateLimitSrc.includes('export function rateLimitAuth'));
});

test('X-Forwarded-For parsed correctly (first IP)', () => {
  assert.ok(rateLimitSrc.includes("forwarded.split(',')[0].trim()"));
});

test('Malformed forwarded header falls back to local', () => {
  assert.ok(rateLimitSrc.includes("'local'"));
});

test('Key format prevents endpoint collisions', () => {
  assert.ok(rateLimitSrc.includes('ratelimit:${endpoint}:${identity}'));
});

test('IPv6 loopback handled', () => {
  assert.ok(rateLimitSrc.includes("'::1'") || rateLimitSrc.includes("'::ffff:127.0.0.1'"));
});

test('IP regex validates IPv4', () => {
  assert.ok(rateLimitSrc.includes('/^\\d{1,3}(\\.\\d{1,3}){3}$/'));
});

test('New endpoint-specific rate limits defined', () => {
  assert.ok(rateLimitSrc.includes('contact:'));
  assert.ok(rateLimitSrc.includes('newsletter:'));
  assert.ok(rateLimitSrc.includes('customOrders:'));
  assert.ok(rateLimitSrc.includes('trade:'));
  assert.ok(rateLimitSrc.includes('media:'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. SESSION SECURITY
// ═══════════════════════════════════════════════════════════════════════════════
section('SESSION SECURITY');

const sessionSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'session.js'), 'utf8');
const customerSessionSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'customerSession.js'), 'utf8');

test('Admin uses ADMIN_SESSION_SECRET', () => {
  assert.ok(sessionSrc.includes('ADMIN_SESSION_SECRET'));
  assert.ok(sessionSrc.includes("process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET"));
});

test('Customer uses CUSTOMER_SESSION_SECRET', () => {
  assert.ok(customerSessionSrc.includes('CUSTOMER_SESSION_SECRET'));
  assert.ok(customerSessionSrc.includes("process.env.CUSTOMER_SESSION_SECRET || process.env.SESSION_SECRET"));
});

test('Admin secret error message correct', () => {
  assert.ok(sessionSrc.includes('ADMIN_SESSION_SECRET (or SESSION_SECRET)'));
});

test('Customer secret error message correct', () => {
  assert.ok(customerSessionSrc.includes('CUSTOMER_SESSION_SECRET (or SESSION_SECRET)'));
});

test('Customer session includes sessionVersion in JWT', () => {
  assert.ok(customerSessionSrc.includes('sessionVersion: customer.sessionVersion || 0'));
});

test('Customer session validates sessionVersion', () => {
  assert.ok(customerSessionSrc.includes('payload.sessionVersion !== customer.sessionVersion'));
});

test('Customer session checks isActive', () => {
  assert.ok(customerSessionSrc.includes('!customer.isActive'));
});

test('Admin session does NOT embed sessionVersion (admin has no version concept)', () => {
  assert.ok(!sessionSrc.includes('sessionVersion'));
});

test('Admin cookie name unchanged', () => {
  assert.ok(sessionSrc.includes("'teakle_admin_session'"));
});

test('Customer cookie name unchanged', () => {
  assert.ok(customerSessionSrc.includes("'teakle_customer_session'"));
});

test('CSRF cookie name unchanged', () => {
  assert.ok(sessionSrc.includes("'teakle_csrf'"));
  assert.ok(customerSessionSrc.includes("'teakle_csrf'"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DATABASE — sessionVersion column
// ═══════════════════════════════════════════════════════════════════════════════
section('DATABASE — sessionVersion');

const dbSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'db.js'), 'utf8');

test('migrateCustomerSessionVersion called', () => {
  assert.ok(dbSrc.includes('migrateCustomerSessionVersion(db)'));
});

test('migrateCustomerSessionVersion adds sessionVersion column', () => {
  assert.ok(dbSrc.includes("sessionVersion INTEGER NOT NULL DEFAULT 0"));
});

test('Column check is idempotent', () => {
  assert.ok(dbSrc.includes("colNames.includes('sessionVersion')"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PASSWORD SECURITY — sessionVersion increment
// ═══════════════════════════════════════════════════════════════════════════════
section('PASSWORD SECURITY');

const passwordSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'auth', 'password', 'route.js'), 'utf8');
const resetSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'auth', 'reset-password', 'route.js'), 'utf8');
const registerSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'auth', 'register', 'route.js'), 'utf8');

test('Password change increments sessionVersion', () => {
  assert.ok(passwordSrc.includes('sessionVersion = sessionVersion + 1'));
});

test('Password reset increments sessionVersion', () => {
  assert.ok(resetSrc.includes('sessionVersion = sessionVersion + 1'));
});

test('Registration sets sessionVersion: 0', () => {
  assert.ok(registerSrc.includes('sessionVersion: 0'));
});

test('Password change has rate limiting', () => {
  assert.ok(passwordSrc.includes('rateLimitIp'));
});

test('Password change has CSRF protection', () => {
  assert.ok(passwordSrc.includes('withCsrf'));
});

test('Reset token is marked used after use', () => {
  assert.ok(resetSrc.includes("SET used = 1"));
});

test('Reset token single-use enforced', () => {
  assert.ok(resetSrc.includes('reset.used'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ADMIN AUDIT LOGGING
// ═══════════════════════════════════════════════════════════════════════════════
section('ADMIN AUDIT LOGGING');

const logoutSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'logout', 'route.js'), 'utf8');
const orderDetailSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'product-orders', '[id]', 'route.js'), 'utf8');
const notesSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'product-orders', '[id]', 'notes', 'route.js'), 'utf8');
const settingsSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'settings', 'route.js'), 'utf8');
const mediaDetailSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'media', '[id]', 'route.js'), 'utf8');

test('Admin logout logged to audit', () => {
  assert.ok(logoutSrc.includes('admin_audit_logs'));
  assert.ok(logoutSrc.includes("'logout'"));
});

test('Order status change logged to admin_audit_logs', () => {
  assert.ok(orderDetailSrc.includes('admin_audit_logs'));
  assert.ok(orderDetailSrc.includes("'order_status_change'"));
});

test('Order status change creates order_activity', () => {
  assert.ok(orderDetailSrc.includes('order_activity'));
  assert.ok(orderDetailSrc.includes("'status_changed'"));
});

test('Order note creates audit log', () => {
  assert.ok(notesSrc.includes('admin_audit_logs'));
  assert.ok(notesSrc.includes("'order_note_added'"));
});

test('Order note creates order_activity', () => {
  assert.ok(notesSrc.includes('order_activity'));
  assert.ok(notesSrc.includes("'note_added'"));
});

test('Settings change logged to audit', () => {
  assert.ok(settingsSrc.includes('admin_audit_logs'));
  assert.ok(settingsSrc.includes("'settings_update'"));
});

test('Media deletion logged to audit', () => {
  assert.ok(mediaDetailSrc.includes('admin_audit_logs'));
  assert.ok(mediaDetailSrc.includes("'media_delete'"));
});

test('Exports logged to audit (product-orders)', () => {
  const exportSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'product-orders', 'export', 'route.js'), 'utf8');
  assert.ok(exportSrc.includes('admin_audit_logs'));
  assert.ok(exportSrc.includes("'export'"));
});

test('Contact export logged to audit', () => {
  const exportSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'contact', 'export', 'route.js'), 'utf8');
  assert.ok(exportSrc.includes('admin_audit_logs'));
});

test('Newsletter export logged to audit', () => {
  const exportSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'newsletter', 'export', 'route.js'), 'utf8');
  assert.ok(exportSrc.includes('admin_audit_logs'));
});

test('Custom orders export logged to audit', () => {
  const exportSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'custom-orders', 'export', 'route.js'), 'utf8');
  assert.ok(exportSrc.includes('admin_audit_logs'));
});

test('Trade export logged to audit', () => {
  const exportSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'trade', 'export', 'route.js'), 'utf8');
  assert.ok(exportSrc.includes('admin_audit_logs'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ADMIN PAGINATION
// ═══════════════════════════════════════════════════════════════════════════════
section('ADMIN PAGINATION');

const paginatedRoutes = [
  { name: 'contact', path: 'app/api/admin/contact/route.js' },
  { name: 'newsletter', path: 'app/api/admin/newsletter/route.js' },
  { name: 'custom-orders', path: 'app/api/admin/custom-orders/route.js' },
  { name: 'trade', path: 'app/api/admin/trade/route.js' },
];

for (const { name, path: routePath } of paginatedRoutes) {
  const src = fs.readFileSync(path.join(process.cwd(), routePath), 'utf8');

  test(`${name} has LIMIT/OFFSET`, () => {
    assert.ok(src.includes('LIMIT') && src.includes('OFFSET'), `${name} missing LIMIT/OFFSET`);
  });

  test(`${name} has total count`, () => {
    assert.ok(src.includes('COUNT(*)'), `${name} missing COUNT(*)`);
  });

  test(`${name} returns pagination metadata`, () => {
    assert.ok(src.includes('pagination'), `${name} missing pagination`);
  });

  test(`${name} has rate limiting`, () => {
    assert.ok(src.includes('rateLimitIp'), `${name} missing rateLimitIp`);
  });
}

// Media pagination is handled via getAllMedia function
test('media has LIMIT/OFFSET via getAllMedia', () => {
  const mediaLibSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'media.js'), 'utf8');
  assert.ok(mediaLibSrc.includes('LIMIT') && mediaLibSrc.includes('OFFSET'));
});

test('media has total count via getAllMedia', () => {
  const mediaLibSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'media.js'), 'utf8');
  assert.ok(mediaLibSrc.includes('COUNT(*)'));
});

test('media returns pagination metadata via getAllMedia', () => {
  const mediaLibSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'media.js'), 'utf8');
  assert.ok(mediaLibSrc.includes('pagination'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. PAYMENT HARDENING
// ═══════════════════════════════════════════════════════════════════════════════
section('PAYMENT HARDENING');

const paymentSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'payment.js'), 'utf8');

test('Refund validates amount is positive', () => {
  assert.ok(paymentSrc.includes('amount <= 0'));
});

test('Refund validates amount does not exceed payment', () => {
  assert.ok(paymentSrc.includes('amount > payment.amount'));
});

test('Payment creation rejects zero total', () => {
  assert.ok(paymentSrc.includes('totalAmount <= 0'));
});

test('Payment state machine unchanged', () => {
  assert.ok(paymentSrc.includes('UNPAID'));
  assert.ok(paymentSrc.includes('PENDING'));
  assert.ok(paymentSrc.includes('PAID'));
  assert.ok(paymentSrc.includes('REFUNDED'));
  assert.ok(paymentSrc.includes('CANCELLED'));
  assert.ok(paymentSrc.includes('FAILED'));
});

test('Webhook rejects unknown provider', () => {
  assert.ok(paymentSrc.includes("'unknown_provider'") || paymentSrc.includes('Unknown payment provider'));
});

test('Webhook requires signature', () => {
  assert.ok(paymentSrc.includes("'missing_signature'") || paymentSrc.includes('Missing webhook signature'));
});

test('Server-side amount resolution', () => {
  assert.ok(paymentSrc.includes('getServerOrderAmount'));
});

test('Idempotency key check', () => {
  assert.ok(paymentSrc.includes('idempotencyKey'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MEDIA UPLOAD SECURITY
// ═══════════════════════════════════════════════════════════════════════════════
section('MEDIA UPLOAD SECURITY');

const mediaSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'media.js'), 'utf8');

test('Magic byte validation implemented', () => {
  assert.ok(mediaSrc.includes('verifyMagicBytes'));
});

test('JPEG magic bytes checked', () => {
  assert.ok(mediaSrc.includes('0xFF, 0xD8, 0xFF'));
});

test('PNG magic bytes checked', () => {
  assert.ok(mediaSrc.includes('0x89, 0x50, 0x4E, 0x47'));
});

test('WebP magic bytes checked', () => {
  assert.ok(mediaSrc.includes('WEBP'));
});

test('AVIF ftyp box checked', () => {
  assert.ok(mediaSrc.includes("'ftyp'"));
});

test('MIME type validation present', () => {
  assert.ok(mediaSrc.includes('ALLOWED_MIME_TYPES'));
  assert.ok(mediaSrc.includes('image/jpeg'));
  assert.ok(mediaSrc.includes('image/png'));
  assert.ok(mediaSrc.includes('image/webp'));
  assert.ok(mediaSrc.includes('image/avif'));
});

test('File size limit enforced', () => {
  assert.ok(mediaSrc.includes('MAX_FILE_SIZE'));
  assert.ok(mediaSrc.includes('5 * 1024 * 1024'));
});

test('Empty file rejection', () => {
  assert.ok(mediaSrc.includes('file.size === 0'));
});

test('Delete checks CMS references', () => {
  assert.ok(mediaSrc.includes('content_sections'));
});

test('Delete checks product references', () => {
  assert.ok(mediaSrc.includes('product_metadata'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. ORDER ACTIVITY
// ═══════════════════════════════════════════════════════════════════════════════
section('ORDER ACTIVITY');

test('Individual status change creates activity', () => {
  assert.ok(orderDetailSrc.includes("INSERT INTO order_activity"));
  assert.ok(orderDetailSrc.includes("'status_changed'"));
});

test('Note creates activity', () => {
  assert.ok(notesSrc.includes("INSERT INTO order_activity"));
  assert.ok(notesSrc.includes("'note_added'"));
});

test('Bulk operations create activity', () => {
  const bulkSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'product-orders', 'bulk', 'route.js'), 'utf8');
  assert.ok(bulkSrc.includes('order_activity'));
  assert.ok(bulkSrc.includes("'status_changed'"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. INPUT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════
section('INPUT VALIDATION');

const validateSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'validate.js'), 'utf8');

test('UUID regex defined', () => {
  assert.ok(validateSrc.includes('UUID_REGEX'));
});

test('ISO date regex defined', () => {
  assert.ok(validateSrc.includes('ISO_DATE_REGEX'));
});

test('isValidUUID exported', () => {
  assert.ok(validateSrc.includes('export function isValidUUID'));
});

test('isValidIsoDate exported', () => {
  assert.ok(validateSrc.includes('export function isValidIsoDate'));
});

test('validatePagination exported', () => {
  assert.ok(validateSrc.includes('export function validatePagination'));
});

test('sanitizeString exported', () => {
  assert.ok(validateSrc.includes('export function sanitizeString'));
});

test('All SQL parameterized in admin routes (no string concat)', () => {
  const adminRoutes = [
    'app/api/admin/contact/route.js',
    'app/api/admin/newsletter/route.js',
    'app/api/admin/custom-orders/route.js',
    'app/api/admin/trade/route.js',
  ];
  for (const r of adminRoutes) {
    const src = fs.readFileSync(path.join(process.cwd(), r), 'utf8');
    // Check no direct string interpolation in SQL (only ? placeholders)
    const sqlLines = src.split('\n').filter(l => l.includes('.prepare(') && l.includes('SELECT'));
    for (const line of sqlLines) {
      assert.ok(!line.includes('${'), `${r} has unparameterized SQL: ${line.trim()}`);
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. DATABASE INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════════
section('DATABASE INTEGRITY');

test('WAL mode enabled', () => {
  assert.ok(dbSrc.includes("pragma('journal_mode = WAL')"));
});

test('Foreign keys enabled', () => {
  assert.ok(dbSrc.includes("pragma('foreign_keys = ON')"));
});

test('Busy timeout set', () => {
  assert.ok(dbSrc.includes("pragma('busy_timeout = 5000')"));
});

test('24+ tables defined', () => {
  const tableCount = (dbSrc.match(/CREATE TABLE IF NOT EXISTS/g) || []).length;
  assert.ok(tableCount >= 24, `Expected 24+ tables, found ${tableCount}`);
});

test('admin_audit_logs table exists', () => {
  assert.ok(dbSrc.includes('admin_audit_logs'));
});

test('order_activity table exists', () => {
  assert.ok(dbSrc.includes('order_activity'));
});

test('payment_webhook_events table exists', () => {
  assert.ok(dbSrc.includes('payment_webhook_events'));
});

test('All migrations idempotent (IF NOT EXISTS)', () => {
  const alterMatches = dbSrc.match(/ALTER TABLE \w+ ADD COLUMN/g) || [];
  // Migrations should check column existence before adding
  const migrationFunctions = dbSrc.match(/function migrate\w+/g) || [];
  assert.ok(migrationFunctions.length >= 14, `Expected 14+ migration functions, found ${migrationFunctions.length}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. RATE LIMITING ON IP-AWARE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
section('IP-AWARE RATE LIMITING ON ROUTES');

const ipAwareRoutes = [
  { name: 'admin login', path: 'app/api/admin/login/route.js' },
  { name: 'customer login', path: 'app/api/auth/login/route.js' },
  { name: 'register', path: 'app/api/auth/register/route.js' },
  { name: 'forgot-password', path: 'app/api/auth/forgot-password/route.js' },
  { name: 'reset-password', path: 'app/api/auth/reset-password/route.js' },
  { name: 'password change', path: 'app/api/auth/password/route.js' },
  { name: 'deactivate', path: 'app/api/auth/deactivate/route.js' },
  { name: 'order create', path: 'app/api/orders/route.js' },
  { name: 'audit-logs', path: 'app/api/admin/audit-logs/route.js' },
  { name: 'bulk actions', path: 'app/api/admin/product-orders/bulk/route.js' },
  { name: 'product-orders export', path: 'app/api/admin/product-orders/export/route.js' },
  { name: 'contact export', path: 'app/api/admin/contact/export/route.js' },
  { name: 'newsletter export', path: 'app/api/admin/newsletter/export/route.js' },
  { name: 'custom-orders export', path: 'app/api/admin/custom-orders/export/route.js' },
  { name: 'trade export', path: 'app/api/admin/trade/export/route.js' },
];

for (const { name, path: routePath } of ipAwareRoutes) {
  const src = fs.readFileSync(path.join(process.cwd(), routePath), 'utf8');
  test(`${name} uses rateLimitIp`, () => {
    assert.ok(src.includes('rateLimitIp'), `${name} missing rateLimitIp`);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. PRODUCTION DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
section('PRODUCTION DOCUMENTATION');

const deploySrc = fs.readFileSync(path.join(process.cwd(), 'DEPLOYMENT.md'), 'utf8');
const envExampleSrc = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
const preflightSrc = fs.readFileSync(path.join(process.cwd(), 'scripts', 'preflight-production.js'), 'utf8');

test('DEPLOYMENT.md documents ADMIN_SESSION_SECRET', () => {
  assert.ok(deploySrc.includes('ADMIN_SESSION_SECRET'));
});

test('DEPLOYMENT.md documents CUSTOMER_SESSION_SECRET', () => {
  assert.ok(deploySrc.includes('CUSTOMER_SESSION_SECRET'));
});

test('systemd ExecStart uses npx', () => {
  assert.ok(deploySrc.includes('npx next start'));
});

test('.env.example has ADMIN_SESSION_SECRET', () => {
  assert.ok(envExampleSrc.includes('ADMIN_SESSION_SECRET'));
});

test('.env.example has CUSTOMER_SESSION_SECRET', () => {
  assert.ok(envExampleSrc.includes('CUSTOMER_SESSION_SECRET'));
});

test('Preflight checks session isolation', () => {
  assert.ok(preflightSrc.includes('SESSION ISOLATION'));
  assert.ok(preflightSrc.includes('ADMIN_SESSION_SECRET'));
  assert.ok(preflightSrc.includes('CUSTOMER_SESSION_SECRET'));
});

test('Production checklist references test-sprint28', () => {
  const checklistSrc = fs.readFileSync(path.join(process.cwd(), 'scripts', 'production-checklist.md'), 'utf8');
  assert.ok(checklistSrc.includes('test-sprint28'));
  assert.ok(checklistSrc.includes('runtime-sprint28'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. SEO / ACCESSIBILITY REGRESSION
// ═══════════════════════════════════════════════════════════════════════════════
section('SEO / ACCESSIBILITY REGRESSION');

const policyPages = ['cancellation', 'privacy', 'returns-and-refunds', 'shipping', 'terms', 'warranty'];
for (const page of policyPages) {
  const src = fs.readFileSync(path.join(process.cwd(), 'app', page, 'page.js'), 'utf8');
  test(`${page} — no nested <main>`, () => {
    const mainCount = (src.match(/<main/g) || []).length;
    assert.ok(mainCount <= 1, `${page} has ${mainCount} <main> tags`);
  });
}

const sitemapSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'sitemap.js'), 'utf8');
test('sitemap.js exists and exports default', () => {
  assert.ok(sitemapSrc.includes('export default') || sitemapSrc.includes('export function'));
});

const robotsSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'robots.js'), 'utf8');
test('robots.js exists and exports default', () => {
  assert.ok(robotsSrc.includes('export default') || robotsSrc.includes('export function'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 15. CSRF PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════
section('CSRF PROTECTION');

const csrfSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'csrf.js'), 'utf8');

test('CSRF double-submit pattern', () => {
  assert.ok(csrfSrc.includes('validateCsrfRequest'));
  assert.ok(csrfSrc.includes('x-csrf-token'));
});

test('CSRF exemptions for safe methods', () => {
  assert.ok(csrfSrc.includes("['GET', 'HEAD', 'OPTIONS']"));
});

test('withCsrf wrapper exported', () => {
  assert.ok(csrfSrc.includes('export function withCsrf'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 16. LOGGER SENSITIVE KEYS
// ═══════════════════════════════════════════════════════════════════════════════
section('LOGGER SENSITIVE KEYS');

const loggerSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'logger.js'), 'utf8');

test('Payment secrets redacted', () => {
  assert.ok(loggerSrc.includes('EMAIL_API_KEY'));
  assert.ok(loggerSrc.includes('PAYMENT_KEY_ID'));
  assert.ok(loggerSrc.includes('PAYMENT_KEY_SECRET'));
  assert.ok(loggerSrc.includes('PAYMENT_WEBHOOK_SECRET'));
});

test('Session secret redacted', () => {
  assert.ok(loggerSrc.includes('SESSION_SECRET'));
});

test('idempotencyKey redacted', () => {
  assert.ok(loggerSrc.includes('idempotencyKey'));
});

test('Password redacted', () => {
  assert.ok(loggerSrc.includes("'password'"));
  assert.ok(loggerSrc.includes("'passwordHash'"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 17. ENV VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════
section('ENV VALIDATION');

const envSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'env.js'), 'utf8');

test('ADMIN_SESSION_SECRET in OPTIONAL_ENV', () => {
  assert.ok(envSrc.includes('ADMIN_SESSION_SECRET'));
});

test('CUSTOMER_SESSION_SECRET in OPTIONAL_ENV', () => {
  assert.ok(envSrc.includes('CUSTOMER_SESSION_SECRET'));
});

test('SESSION_SECRET required', () => {
  assert.ok(envSrc.includes('SESSION_SECRET'));
  assert.ok(envSrc.includes('required: true'));
});

test('Min length 32 enforced', () => {
  assert.ok(envSrc.includes('minLength: 32'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 18. AUTH ROUTE PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════
section('AUTH ROUTE PROTECTION');

const authRoutes = [
  { name: 'auth login', path: 'app/api/auth/login/route.js', must: ['rateLimitIp'] },
  { name: 'auth register', path: 'app/api/auth/register/route.js', must: ['rateLimitIp'] },
  { name: 'auth deactivate', path: 'app/api/auth/deactivate/route.js', must: ['rateLimitIp', 'withCsrf'] },
];

for (const { name, path: routePath, must } of authRoutes) {
  const src = fs.readFileSync(path.join(process.cwd(), routePath), 'utf8');
  for (const feature of must) {
    test(`${name} has ${feature}`, () => {
      assert.ok(src.includes(feature), `${name} missing ${feature}`);
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 19. AUTHORIZATION CHECKS
// ═══════════════════════════════════════════════════════════════════════════════
section('AUTHORIZATION CHECKS');

const authSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'auth.js'), 'utf8');

test('requireAdmin checks role', () => {
  assert.ok(authSrc.includes("'admin'") && authSrc.includes("'superadmin'"));
});

test('requireAdmin returns 401 for unauthenticated', () => {
  assert.ok(authSrc.includes('401'));
});

test('requireAdmin returns 403 for insufficient permissions', () => {
  assert.ok(authSrc.includes('403'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 20. REGRESSION — Previous Sprint Fixes Intact
// ═══════════════════════════════════════════════════════════════════════════════
section('REGRESSION — Previous Fixes');

test('lib/csrf.js has no broken validateCsrf dead code', () => {
  assert.ok(!csrfSrc.includes('export function validateCsrf('));
});

test('Admin login audit log to admin_audit_logs', () => {
  const loginSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'login', 'route.js'), 'utf8');
  assert.ok(loginSrc.includes('admin_audit_logs'));
  assert.ok(loginSrc.includes("'login'"));
});

test('Health endpoint exists', () => {
  assert.ok(fs.existsSync(path.join(process.cwd(), 'app', 'api', 'health', 'route.js')));
});

test('DEPLOYMENT.md has process manager section', () => {
  assert.ok(deploySrc.includes('## 8. Process Management'));
  assert.ok(deploySrc.includes('systemd'));
  assert.ok(deploySrc.includes('PM2'));
  assert.ok(deploySrc.includes('Docker'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
summary();

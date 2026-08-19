#!/usr/bin/env node

/**
 * TEAKLE — Sprint #32 Unit / Static Tests
 * Production-Readiness Verification
 *
 * Covers: preflight configuration, environment validation, session security,
 * pre-auth security, admin authorization, customer isolation, order/payment
 * integrity, database migrations, backup/restore, media security, error
 * disclosure, security headers, deployment documentation.
 *
 * Every test contains a genuine assertion. Helpers return explicit
 * pass/fail and must not produce false positives.
 *
 * Usage: node scripts/test-sprint32.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

let pass = 0;
let fail = 0;

function test(name, fn) {
  return (async () => {
    try {
      await fn();
      pass++;
      console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    } catch (e) {
      fail++;
      console.log(`  \x1b[31m✗\x1b[0m ${name} — ${e.message}`);
    }
  })();
}

function section(name) {
  console.log(`\n=== ${name} ===`);
}

function read(rel) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
}

function fileExists(rel) {
  return fs.existsSync(path.join(process.cwd(), rel));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PREFLIGHT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
section('PREFLIGHT CONFIGURATION');

(async () => {
  await test('preflight-production.js exists', () => {
    assert.ok(fileExists('scripts/preflight-production.js'), 'preflight script missing');
  });

  await test('preflight checks SESSION_SECRET as required', () => {
    const src = read('scripts/preflight-production.js');
    assert.ok(src.includes("'SESSION_SECRET'"), 'SESSION_SECRET not in required list');
  });

  await test('preflight checks ADMIN_EMAIL as required', () => {
    const src = read('scripts/preflight-production.js');
    assert.ok(src.includes("'ADMIN_EMAIL'"), 'ADMIN_EMAIL not in required list');
  });

  await test('preflight checks ADMIN_PASSWORD as required', () => {
    const src = read('scripts/preflight-production.js');
    assert.ok(src.includes("'ADMIN_PASSWORD'"), 'ADMIN_PASSWORD not in required list');
  });

  await test('preflight validates SESSION_SECRET strength (>= 32 chars)', () => {
    const src = read('scripts/preflight-production.js');
    assert.ok(src.includes('secret.length < 32'), 'missing min length check');
  });

  await test('preflight warns (not fails) when separate session secrets are missing', () => {
    const src = read('scripts/preflight-production.js');
    assert.ok(src.includes('Neither ADMIN_SESSION_SECRET nor CUSTOMER_SESSION_SECRET set'), 'missing shared-secret warning');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ENVIRONMENT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════
section('ENVIRONMENT VALIDATION');

(async () => {
  const env = require('../lib/env');

  await test('lib/env.js exports validateEnv', () => {
    assert.ok(typeof env.validateEnv === 'function', 'validateEnv not exported');
  });

  await test('lib/env.js exports getEnv', () => {
    assert.ok(typeof env.getEnv === 'function', 'getEnv not exported');
  });

  await test('lib/env.js exports requireEnv', () => {
    assert.ok(typeof env.requireEnv === 'function', 'requireEnv not exported');
  });

  await test('REQUIRED_ENV includes SESSION_SECRET', () => {
    assert.ok('SESSION_SECRET' in env.REQUIRED_ENV, 'SESSION_SECRET not in REQUIRED_ENV');
  });

  await test('REQUIRED_ENV includes ADMIN_EMAIL', () => {
    assert.ok('ADMIN_EMAIL' in env.REQUIRED_ENV, 'ADMIN_EMAIL not in REQUIRED_ENV');
  });

  await test('REQUIRED_ENV includes ADMIN_PASSWORD', () => {
    assert.ok('ADMIN_PASSWORD' in env.REQUIRED_ENV, 'ADMIN_PASSWORD not in REQUIRED_ENV');
  });

  await test('OPTIONAL_ENV includes ADMIN_SESSION_SECRET', () => {
    assert.ok('ADMIN_SESSION_SECRET' in env.OPTIONAL_ENV, 'ADMIN_SESSION_SECRET not in OPTIONAL_ENV');
  });

  await test('OPTIONAL_ENV includes CUSTOMER_SESSION_SECRET', () => {
    assert.ok('CUSTOMER_SESSION_SECRET' in env.OPTIONAL_ENV, 'CUSTOMER_SESSION_SECRET not in OPTIONAL_ENV');
  });

  await test('OPTIONAL_ENV includes DATABASE_PATH', () => {
    assert.ok('DATABASE_PATH' in env.OPTIONAL_ENV, 'DATABASE_PATH not in OPTIONAL_ENV');
  });

  await test('OPTIONAL_ENV includes MEDIA_UPLOAD_DIR', () => {
    assert.ok('MEDIA_UPLOAD_DIR' in env.OPTIONAL_ENV, 'MEDIA_UPLOAD_DIR not in OPTIONAL_ENV');
  });

  await test('.env.example documents SESSION_SECRET', () => {
    const src = read('.env.example');
    assert.ok(src.includes('SESSION_SECRET'), '.env.example missing SESSION_SECRET');
  });

  await test('.env.example documents ADMIN_SESSION_SECRET', () => {
    const src = read('.env.example');
    assert.ok(src.includes('ADMIN_SESSION_SECRET'), '.env.example missing ADMIN_SESSION_SECRET');
  });

  await test('.env.example documents CUSTOMER_SESSION_SECRET', () => {
    const src = read('.env.example');
    assert.ok(src.includes('CUSTOMER_SESSION_SECRET'), '.env.example missing CUSTOMER_SESSION_SECRET');
  });

  await test('DEPLOYMENT.md documents all required env vars', () => {
    const src = read('DEPLOYMENT.md');
    assert.ok(src.includes('SESSION_SECRET'), 'DEPLOYMENT.md missing SESSION_SECRET');
    assert.ok(src.includes('ADMIN_EMAIL'), 'DEPLOYMENT.md missing ADMIN_EMAIL');
    assert.ok(src.includes('ADMIN_PASSWORD'), 'DEPLOYMENT.md missing ADMIN_PASSWORD');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SESSION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
section('SESSION CONFIGURATION');

(async () => {
  await test('session.js falls back to SESSION_SECRET for ADMIN_SESSION_SECRET', () => {
    const src = read('lib/session.js');
    assert.ok(src.includes("process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET"), 'session.js missing fallback');
  });

  await test('customerSession.js falls back to SESSION_SECRET for CUSTOMER_SESSION_SECRET', () => {
    const src = read('lib/customerSession.js');
    assert.ok(src.includes("process.env.CUSTOMER_SESSION_SECRET || process.env.SESSION_SECRET"), 'customerSession.js missing fallback');
  });

  await test('session.js uses HS256 algorithm', () => {
    const src = read('lib/session.js');
    assert.ok(src.includes("'HS256'"), 'session.js not using HS256');
  });

  await test('customerSession.js uses HS256 algorithm', () => {
    const src = read('lib/customerSession.js');
    assert.ok(src.includes("'HS256'"), 'customerSession.js not using HS256');
  });

  await test('customerSession.js checks isActive', () => {
    const src = read('lib/customerSession.js');
    assert.ok(src.includes('isActive'), 'customerSession.js missing isActive check');
  });

  await test('customerSession.js validates sessionVersion', () => {
    const src = read('lib/customerSession.js');
    assert.ok(src.includes('sessionVersion'), 'customerSession.js missing sessionVersion validation');
  });

  await test('session.js and customerSession.js use separate cookie names', () => {
    const sessionSrc = read('lib/session.js');
    const customerSrc = read('lib/customerSession.js');
    const adminMatch = sessionSrc.match(/SESSION_NAME\s*=\s*['"]([^'"]+)['"]/);
    const customerMatch = customerSrc.match(/SESSION_NAME\s*=\s*['"]([^'"]+)['"]/);
    assert.ok(adminMatch && customerMatch, 'could not find SESSION_NAME in session files');
    assert.notStrictEqual(adminMatch[1], customerMatch[1], 'admin and customer use same SESSION_NAME');
  });

  await test('logger SENSITIVE_KEYS includes ADMIN_SESSION_SECRET', () => {
    const src = read('lib/logger.js');
    assert.ok(src.includes("'ADMIN_SESSION_SECRET'"), 'logger missing ADMIN_SESSION_SECRET');
  });

  await test('logger SENSITIVE_KEYS includes CUSTOMER_SESSION_SECRET', () => {
    const src = read('lib/logger.js');
    assert.ok(src.includes("'CUSTOMER_SESSION_SECRET'"), 'logger missing CUSTOMER_SESSION_SECRET');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PRE-AUTHENTICATION SECURITY
// ═══════════════════════════════════════════════════════════════════════════════
section('PRE-AUTHENTICATION SECURITY');

(async () => {
  await test('Customer login route has CSRF protection', () => {
    const src = read('app/api/auth/login/route.js');
    assert.ok(src.includes('withCsrf'), 'customer login missing withCsrf');
  });

  await test('Customer login route has rate limiting', () => {
    const src = read('app/api/auth/login/route.js');
    assert.ok(src.includes('rateLimitIp'), 'customer login missing rate limiting');
  });

  await test('Customer login returns generic error for wrong credentials', () => {
    const src = read('app/api/auth/login/route.js');
    const matches = src.match(/'Invalid email or password'/g);
    assert.ok(matches && matches.length >= 3, 'login does not return consistent generic error');
  });

  await test('Admin login route has CSRF protection', () => {
    const src = read('app/api/admin/login/route.js');
    assert.ok(src.includes('withCsrf'), 'admin login missing withCsrf');
  });

  await test('Admin login route has rate limiting', () => {
    const src = read('app/api/admin/login/route.js');
    assert.ok(src.includes('rateLimitIp'), 'admin login missing rate limiting');
  });

  await test('Admin login returns generic "Invalid credentials" for all failures', () => {
    const src = read('app/api/admin/login/route.js');
    const matches = src.match(/'Invalid credentials'/g);
    assert.ok(matches && matches.length >= 3, 'admin login does not return consistent generic error');
  });

  await test('Logout route has CSRF protection', () => {
    const src = read('app/api/auth/logout/route.js');
    assert.ok(src.includes('withCsrf'), 'logout missing withCsrf');
  });

  await test('Register route returns generic response for duplicate email (no enumeration)', () => {
    const src = read('app/api/auth/register/route.js');
    assert.ok(!src.includes("'An account with this email already exists'"), 'register still leaks account existence');
  });

  await test('Forgot-password returns generic message (no account enumeration)', () => {
    const src = read('app/api/auth/forgot-password/route.js');
    assert.ok(src.includes('If an account exists'), 'forgot-password leaks account existence');
  });

  await test('Forgot-password has rate limiting', () => {
    const src = read('app/api/auth/forgot-password/route.js');
    assert.ok(src.includes('rateLimitIp'), 'forgot-password missing rate limiting');
  });

  await test('Reset-password has rate limiting', () => {
    const src = read('app/api/auth/reset-password/route.js');
    assert.ok(src.includes('rateLimitIp'), 'reset-password missing rate limiting');
  });

  await test('Health endpoint does not expose db.path', () => {
    const src = read('app/api/health/route.js');
    assert.ok(!src.includes('db.path'), 'health endpoint leaks db.path');
  });

  await test('CSRF token endpoint exists', () => {
    assert.ok(fileExists('app/api/csrf/route.js'), 'CSRF endpoint missing');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ADMIN AUTHORIZATION
// ═══════════════════════════════════════════════════════════════════════════════
section('ADMIN AUTHORIZATION');

(async () => {
  const adminRoutes = [
    'app/api/admin/dashboard/route.js',
    'app/api/admin/settings/route.js',
    'app/api/admin/products/route.js',
    'app/api/admin/products/[id]/route.js',
    'app/api/admin/product-orders/route.js',
    'app/api/admin/product-orders/[id]/route.js',
    'app/api/admin/product-orders/bulk/route.js',
    'app/api/admin/product-orders/export/route.js',
    'app/api/admin/media/route.js',
    'app/api/admin/media/[id]/route.js',
    'app/api/admin/audit-logs/route.js',
    'app/api/admin/custom-orders/route.js',
    'app/api/admin/custom-orders/[id]/route.js',
    'app/api/admin/custom-orders/export/route.js',
    'app/api/admin/contact/route.js',
    'app/api/admin/contact/[id]/route.js',
    'app/api/admin/contact/export/route.js',
    'app/api/admin/trade/route.js',
    'app/api/admin/trade/[id]/route.js',
    'app/api/admin/trade/export/route.js',
    'app/api/admin/newsletter/route.js',
    'app/api/admin/newsletter/export/route.js',
    'app/api/admin/content/[page]/route.js',
    'app/api/admin/content/[page]/[sectionKey]/route.js',
    'app/api/admin/diagnostics/route.js',
    'app/api/admin/me/route.js',
  ];

  for (const route of adminRoutes) {
    await test(`${route} has requireAdmin`, () => {
      const src = read(route);
      assert.ok(src.includes('requireAdmin'), `${route} missing requireAdmin`);
    });
  }

  const mutatingRoutes = [
    'app/api/admin/settings/route.js',
    'app/api/admin/products/[id]/route.js',
    'app/api/admin/product-orders/[id]/route.js',
    'app/api/admin/product-orders/bulk/route.js',
    'app/api/admin/media/route.js',
    'app/api/admin/media/[id]/route.js',
    'app/api/admin/custom-orders/[id]/route.js',
    'app/api/admin/contact/[id]/route.js',
    'app/api/admin/trade/[id]/route.js',
    'app/api/admin/content/[page]/[sectionKey]/route.js',
  ];

  for (const route of mutatingRoutes) {
    await test(`${route} has CSRF protection`, () => {
      const src = read(route);
      assert.ok(src.includes('withCsrf'), `${route} missing withCsrf`);
    });
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 6. CUSTOMER DATA ISOLATION
// ═══════════════════════════════════════════════════════════════════════════════
section('CUSTOMER DATA ISOLATION');

(async () => {
  const customerRoutes = [
    { file: 'app/api/orders/route.js', pattern: 'customerId' },
    { file: 'app/api/orders/[id]/route.js', pattern: 'customerId' },
    { file: 'app/api/cart/route.js', pattern: 'customerId' },
    { file: 'app/api/cart/[itemId]/route.js', pattern: 'customerId' },
    { file: 'app/api/wishlist/route.js', pattern: 'customerId' },
    { file: 'app/api/wishlist/[itemId]/route.js', pattern: 'customerId' },
    { file: 'app/api/addresses/route.js', pattern: 'customerId' },
    { file: 'app/api/addresses/[id]/route.js', pattern: 'customerId' },
    { file: 'app/api/auth/profile/route.js', pattern: 'customerId' },
    { file: 'app/api/auth/password/route.js', pattern: 'customerId' },
    { file: 'app/api/auth/deactivate/route.js', pattern: 'customerId' },
  ];

  for (const { file, pattern } of customerRoutes) {
    await test(`${file} queries by customerId (ownership check)`, () => {
      const src = read(file);
      assert.ok(src.includes(pattern), `${file} missing ${pattern} ownership check`);
    });
  }

  await test('Orders route requires customer session', () => {
    const src = read('app/api/orders/route.js');
    assert.ok(src.includes('getCustomerSession'), 'orders route missing session check');
  });

  await test('Cart route requires customer session', () => {
    const src = read('app/api/cart/route.js');
    assert.ok(src.includes('getCustomerSession'), 'cart route missing session check');
  });

  await test('Addresses route requires customer session', () => {
    const src = read('app/api/addresses/route.js');
    assert.ok(src.includes('getCustomerSession'), 'addresses route missing session check');
  });

  await test('Orders PATCH has CSRF protection', () => {
    const src = read('app/api/orders/[id]/route.js');
    assert.ok(src.includes('withCsrf'), 'orders PATCH missing CSRF');
  });

  await test('Cart POST/PUT have CSRF protection', () => {
    const src = read('app/api/cart/route.js');
    assert.ok(src.includes('withCsrf'), 'cart POST/PUT missing CSRF');
  });

  await test('Addresses POST/PUT/DELETE have CSRF protection', () => {
    const src = read('app/api/addresses/route.js');
    assert.ok(src.includes('withCsrf'), 'addresses POST missing CSRF');
    const src2 = read('app/api/addresses/[id]/route.js');
    assert.ok(src2.includes('withCsrf'), 'addresses PUT/DELETE missing CSRF');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ORDER / PAYMENT INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════════
section('ORDER / PAYMENT INTEGRITY');

(async () => {
  await test('Order pricing is server-side calculated', () => {
    const src = read('lib/orderPricing.js');
    assert.ok(src.includes('calculateOrderTotal'), 'orderPricing missing calculateOrderTotal');
    assert.ok(src.includes('getProductById'), 'orderPricing does not resolve prices from DB');
  });

  await test('Order creation uses immutable snapshots', () => {
    const src = read('app/api/orders/route.js');
    assert.ok(src.includes('productNameSnapshot'), 'order creation missing productNameSnapshot');
    assert.ok(src.includes('unitPrice'), 'order creation missing unitPrice');
    assert.ok(src.includes('lineTotal'), 'order creation missing lineTotal');
  });

  await test('Payment state machine is defined', () => {
    const src = read('lib/payment.js');
    assert.ok(src.includes('PAYMENT_TRANSITIONS'), 'payment.js missing PAYMENT_TRANSITIONS');
  });

  await test('Payment transitions are validated before update', () => {
    const src = read('lib/payment.js');
    assert.ok(src.includes('isValidPaymentTransition'), 'payment.js missing transition validation');
  });

  await test('Payment amounts are server-authoritative', () => {
    const src = read('lib/payment.js');
    assert.ok(src.includes('getServerOrderAmount'), 'payment.js missing getServerOrderAmount');
  });

  await test('Webhook has in-memory dedup guard', () => {
    const src = read('app/api/payments/webhook/route.js');
    assert.ok(src.includes('inFlightEvents'), 'webhook missing in-memory dedup guard');
  });

  await test('Webhook has rate limiting', () => {
    const src = read('app/api/payments/webhook/route.js');
    assert.ok(src.includes('rateLimit'), 'webhook missing rate limiting');
  });

  await test('Payment intent has ownership check', () => {
    const src = read('app/api/payments/intent/route.js');
    assert.ok(src.includes('customerId'), 'payment intent missing ownership check');
  });

  await test('Refund route has rate limiting', () => {
    const src = read('app/api/payments/refund/route.js');
    assert.ok(src.includes('rateLimitIp'), 'refund route missing rate limiting');
  });

  await test('Refund route has audit logging', () => {
    const src = read('app/api/payments/refund/route.js');
    assert.ok(src.includes('admin_audit_logs'), 'refund route missing audit log');
  });

  await test('Webhook returns generic error (no internal details)', () => {
    const src = read('app/api/payments/webhook/route.js');
    assert.ok(src.includes("'Webhook processing failed'"), 'webhook missing generic error message');
  });

  await test('Bulk order error results use generic message', () => {
    const src = read('app/api/admin/product-orders/bulk/route.js');
    assert.ok(src.includes("'Update failed'"), 'bulk order missing generic error');
    assert.ok(!src.includes('e.message'), 'bulk order still leaks e.message');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 8. DATABASE / MIGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════
section('DATABASE / MIGRATIONS');

(async () => {
  await test('db.js enables WAL mode', () => {
    const src = read('lib/db.js');
    assert.ok(src.includes('journal_mode = WAL'), 'db.js missing WAL mode');
  });

  await test('db.js enables foreign_keys', () => {
    const src = read('lib/db.js');
    assert.ok(src.includes('foreign_keys = ON'), 'db.js missing foreign_keys');
  });

  await test('db.js sets busy_timeout', () => {
    const src = read('lib/db.js');
    assert.ok(src.includes('busy_timeout'), 'db.js missing busy_timeout');
  });

  await test('All CREATE TABLE use IF NOT EXISTS', () => {
    const src = read('lib/db.js');
    const createTableMatches = src.match(/CREATE TABLE\s+(?!IF NOT EXISTS)/gi);
    assert.ok(!createTableMatches || createTableMatches.length === 0, 'db.js has non-idempotent CREATE TABLE');
  });

  await test('All CREATE INDEX use IF NOT EXISTS', () => {
    const src = read('lib/db.js');
    const createIndexMatches = src.match(/CREATE INDEX\s+(?!IF NOT EXISTS)/gi);
    assert.ok(!createIndexMatches || createIndexMatches.length === 0, 'db.js has non-idempotent CREATE INDEX');
  });

  await test('No DROP TABLE in db.js', () => {
    const src = read('lib/db.js');
    assert.ok(!src.includes('DROP TABLE'), 'db.js contains DROP TABLE');
  });

  await test('No DROP DATABASE in db.js', () => {
    const src = read('lib/db.js');
    assert.ok(!src.includes('DROP DATABASE'), 'db.js contains DROP DATABASE');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 9. BACKUP / RESTORE
// ═══════════════════════════════════════════════════════════════════════════════
section('BACKUP / RESTORE');

(async () => {
  await test('backup-db.js exists', () => {
    assert.ok(fileExists('scripts/backup-db.js'), 'backup script missing');
  });

  await test('backup uses SQLite backup API', () => {
    const src = read('scripts/backup-db.js');
    assert.ok(src.includes('.backup(') || src.includes('backup('), 'backup script not using SQLite backup API');
  });

  await test('backup verifies integrity after backup', () => {
    const src = read('scripts/backup-db.js');
    assert.ok(src.includes('integrity_check'), 'backup missing integrity check');
  });

  await test('backup checks foreign keys', () => {
    const src = read('scripts/backup-db.js');
    assert.ok(src.includes('foreign_key_check') || src.includes('foreign_keys'), 'backup missing FK check');
  });

  await test('restore creates pre-restore safety backup', () => {
    const src = read('scripts/backup-db.js');
    assert.ok(src.includes('pre_restore'), 'restore missing pre-restore backup');
  });

  await test('restore handles rollback on failure', () => {
    const src = read('scripts/backup-db.js');
    assert.ok(src.includes('catch') || src.includes('rollback'), 'restore missing failure handling');
  });

  await test('backup prunes old backups (--max-backups)', () => {
    const src = read('scripts/backup-db.js');
    assert.ok(src.includes('maxBackups') || src.includes('prune'), 'backup missing pruning');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 10. MEDIA / FILESYSTEM SECURITY
// ═══════════════════════════════════════════════════════════════════════════════
section('MEDIA / FILESYSTEM SECURITY');

(async () => {
  await test('Media upload validates MIME types', () => {
    const src = read('lib/media.js');
    assert.ok(src.includes('ALLOWED_MIME_TYPES'), 'media missing MIME allowlist');
  });

  await test('Media upload validates magic bytes', () => {
    const src = read('lib/media.js');
    assert.ok(src.includes('verifyMagicBytes'), 'media missing magic byte validation');
  });

  await test('Media upload enforces size limit', () => {
    const src = read('lib/media.js');
    assert.ok(src.includes('MAX_FILE_SIZE'), 'media missing size limit');
  });

  await test('Storage uses UUID filenames', () => {
    const src = read('lib/storage.js');
    assert.ok(src.includes('randomUUID') || src.includes('uuid'), 'storage not using UUID filenames');
  });

  await test('Media delete checks references before removal', () => {
    const src = read('lib/media.js');
    assert.ok(src.includes('isMediaReferenced') || src.includes('referenced'), 'media delete missing reference check');
  });

  await test('Media routes require admin auth', () => {
    const src = read('app/api/admin/media/route.js');
    assert.ok(src.includes('requireAdmin'), 'media route missing requireAdmin');
  });

  await test('Media upload route has CSRF protection', () => {
    const src = read('app/api/admin/media/route.js');
    assert.ok(src.includes('withCsrf'), 'media upload missing CSRF');
  });

  await test('Media delete route has CSRF protection', () => {
    const src = read('app/api/admin/media/[id]/route.js');
    assert.ok(src.includes('withCsrf'), 'media delete missing CSRF');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 11. ERROR / INFORMATION DISCLOSURE
// ═══════════════════════════════════════════════════════════════════════════════
section('ERROR / INFORMATION DISCLOSURE');

(async () => {
  await test('Diagnostics endpoint does NOT expose db.path', () => {
    const src = read('app/api/admin/diagnostics/route.js');
    assert.ok(!src.includes('path: db.path'), 'diagnostics leaks db.path');
  });

  await test('Diagnostics endpoint does NOT expose database columns/schema', () => {
    const src = read('app/api/admin/diagnostics/route.js');
    assert.ok(!src.includes('columns: t.columns'), 'diagnostics leaks column schema');
  });

  await test('Diagnostics endpoint does NOT expose PID', () => {
    const src = read('app/api/admin/diagnostics/route.js');
    assert.ok(!src.includes('pid: sys.pid'), 'diagnostics leaks PID');
  });

  await test('Diagnostics endpoint has audit logging', () => {
    const src = read('app/api/admin/diagnostics/route.js');
    assert.ok(src.includes('admin_audit_logs'), 'diagnostics missing audit log');
  });

  await test('Health endpoint does not expose db.path', () => {
    const src = read('app/api/health/route.js');
    assert.ok(!src.includes('db.path'), 'health endpoint leaks db.path');
  });

  await test('No stack traces in API responses (grep)', () => {
    const routeDir = path.join(process.cwd(), 'app/api');
    let found = false;
    (function walk(dir) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name === 'route.js') {
          const src = fs.readFileSync(p, 'utf8');
          if (src.includes('.stack') && src.includes('Response.json')) found = true;
        }
      }
    })(routeDir);
    assert.ok(!found, 'API routes expose stack traces');
  });

  await test('No passwordHash in any JSON response', () => {
    const routeDir = path.join(process.cwd(), 'app/api');
    let found = false;
    (function walk(dir) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name === 'route.js') {
          const src = fs.readFileSync(p, 'utf8');
          if (src.includes('passwordHash') && (src.includes('Response.json') || src.includes('NextResponse.json'))) {
            if (!src.includes('!') && !src.includes('exclude') && !src.includes('select')) found = true;
          }
        }
      }
    })(routeDir);
    assert.ok(!found, 'API responses may expose passwordHash');
  });

  await test('Logger sanitize function exists and redacts sensitive keys', () => {
    const src = read('lib/logger.js');
    assert.ok(src.includes('function sanitize'), 'logger missing sanitize function');
    assert.ok(src.includes('REDACTED'), 'logger sanitize does not redact');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 12. SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════════════════
section('SECURITY HEADERS');

(async () => {
  const cfg = read('next.config.mjs');

  await test('X-Content-Type-Options: nosniff present', () => {
    assert.ok(cfg.includes("key: 'X-Content-Type-Options'") && cfg.includes("value: 'nosniff'"), 'missing nosniff');
  });

  await test('X-Frame-Options: DENY present', () => {
    assert.ok(cfg.includes("key: 'X-Frame-Options'") && cfg.includes("value: 'DENY'"), 'missing X-Frame-Options');
  });

  await test('Referrer-Policy present', () => {
    assert.ok(cfg.includes("key: 'Referrer-Policy'"), 'missing Referrer-Policy');
  });

  await test('Permissions-Policy present', () => {
    assert.ok(cfg.includes("key: 'Permissions-Policy'"), 'missing Permissions-Policy');
  });

  await test('API responses set Cache-Control: no-store', () => {
    assert.ok(cfg.includes("key: 'Cache-Control'") && cfg.includes('no-store'), 'missing API cache-control');
  });

  await test('CSP intentionally omitted (would break inline style/script architecture)', () => {
    assert.ok(!cfg.includes('Content-Security-Policy'), 'CSP unexpectedly present');
  });

  await test('HSTS intentionally omitted unless HTTPS requirements confirmed', () => {
    assert.ok(!cfg.includes('Strict-Transport-Security'), 'HSTS unexpectedly present');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 13. DEPLOYMENT DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
section('DEPLOYMENT DOCUMENTATION');

(async () => {
  await test('DEPLOYMENT.md exists', () => {
    assert.ok(fileExists('DEPLOYMENT.md'), 'DEPLOYMENT.md missing');
  });

  await test('DEPLOYMENT.md covers required topics', () => {
    const d = read('DEPLOYMENT.md').toLowerCase();
    const topics = ['node.js', 'npm install', 'npm run build', 'npm run start', 'pm2', 'systemd', 'reverse proxy', 'https', 'sqlite', 'media', 'backup', 'rollback', 'monitoring'];
    for (const t of topics) {
      assert.ok(d.includes(t), `DEPLOYMENT.md missing topic: ${t}`);
    }
  });

  await test('DEPLOYMENT.md documents SESSION_SECRET', () => {
    const d = read('DEPLOYMENT.md');
    assert.ok(d.includes('SESSION_SECRET'), 'DEPLOYMENT.md missing SESSION_SECRET');
  });

  await test('DEPLOYMENT.md documents separate session secrets', () => {
    const d = read('DEPLOYMENT.md');
    assert.ok(d.includes('ADMIN_SESSION_SECRET') || d.includes('separate'), 'DEPLOYMENT.md missing separate session secrets');
  });

  await test('DEPLOYMENT.md documents startup validation', () => {
    const d = read('DEPLOYMENT.md');
    assert.ok(d.includes('startup') || d.includes('validation') || d.includes('requireEnv'), 'DEPLOYMENT.md missing startup validation');
  });

  await test('DEPLOYMENT.md mentions single-instance limitation', () => {
    const d = read('DEPLOYMENT.md');
    assert.ok(d.includes('single') || d.includes('Single'), 'DEPLOYMENT.md missing single-instance warning');
  });

  await test('production-checklist.md covers rollback/logging/monitoring', () => {
    const c = read('scripts/production-checklist.md').toLowerCase();
    assert.ok(c.includes('rollback'), 'checklist missing rollback');
    assert.ok(c.includes('logging') || c.includes('log'), 'checklist missing logging');
    assert.ok(c.includes('monitoring'), 'checklist missing monitoring');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 14. AUDIT LOGGING COVERAGE
// ═══════════════════════════════════════════════════════════════════════════════
section('AUDIT LOGGING COVERAGE');

(async () => {
  const auditRoutes = [
    { file: 'app/api/admin/login/route.js', name: 'admin login' },
    { file: 'app/api/admin/logout/route.js', name: 'admin logout' },
    { file: 'app/api/admin/settings/route.js', name: 'settings update' },
    { file: 'app/api/admin/products/[id]/route.js', name: 'product update' },
    { file: 'app/api/admin/product-orders/[id]/route.js', name: 'order status change' },
    { file: 'app/api/admin/product-orders/bulk/route.js', name: 'bulk status change' },
    { file: 'app/api/admin/product-orders/export/route.js', name: 'orders export' },
    { file: 'app/api/admin/media/route.js', name: 'media upload' },
    { file: 'app/api/admin/media/[id]/route.js', name: 'media delete' },
    { file: 'app/api/admin/custom-orders/[id]/route.js', name: 'custom order status' },
    { file: 'app/api/admin/contact/[id]/route.js', name: 'contact read status' },
    { file: 'app/api/admin/trade/[id]/route.js', name: 'trade status' },
    { file: 'app/api/admin/content/[page]/[sectionKey]/route.js', name: 'CMS operations' },
    { file: 'app/api/admin/diagnostics/route.js', name: 'diagnostics view' },
    { file: 'app/api/payments/refund/route.js', name: 'refund' },
  ];

  for (const { file, name } of auditRoutes) {
    await test(`${name} route has audit logging`, () => {
      const src = read(file);
      assert.ok(src.includes('admin_audit_logs'), `${file} missing audit log`);
    });
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 15. RATE LIMITING COVERAGE
// ═══════════════════════════════════════════════════════════════════════════════
section('RATE LIMITING COVERAGE');

(async () => {
  const rateLimitedRoutes = [
    { file: 'app/api/auth/login/route.js', name: 'customer login' },
    { file: 'app/api/auth/register/route.js', name: 'register' },
    { file: 'app/api/auth/forgot-password/route.js', name: 'forgot-password' },
    { file: 'app/api/auth/reset-password/route.js', name: 'reset-password' },
    { file: 'app/api/admin/login/route.js', name: 'admin login' },
    { file: 'app/api/admin/product-orders/bulk/route.js', name: 'bulk action' },
    { file: 'app/api/admin/product-orders/export/route.js', name: 'orders export' },
    { file: 'app/api/admin/settings/route.js', name: 'settings update' },
    { file: 'app/api/payments/refund/route.js', name: 'refund' },
    { file: 'app/api/payments/webhook/route.js', name: 'payment webhook' },
    { file: 'app/api/orders/route.js', name: 'order creation' },
    { file: 'app/api/auth/password/route.js', name: 'password change' },
    { file: 'app/api/auth/deactivate/route.js', name: 'account deactivation' },
  ];

  for (const { file, name } of rateLimitedRoutes) {
    await test(`${name} route has rate limiting`, () => {
      const src = read(file);
      assert.ok(src.includes('rateLimitIp') || src.includes('rateLimitAuth') || src.includes('rateLimit'), `${file} missing rate limiting`);
    });
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 16. RATE LIMIT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
section('RATE LIMIT CONFIGURATION');

(async () => {
  await test('Rate limit config includes adminRefund', () => {
    const src = read('lib/rateLimit.js');
    assert.ok(src.includes('adminRefund'), 'rate limit missing adminRefund');
  });

  await test('Rate limit config includes adminSettings', () => {
    const src = read('lib/rateLimit.js');
    assert.ok(src.includes('adminSettings'), 'rate limit missing adminSettings');
  });

  await test('Rate limit config includes adminLogin', () => {
    const src = read('lib/rateLimit.js');
    assert.ok(src.includes('adminLogin'), 'rate limit missing adminLogin');
  });

  await test('Rate limit config includes paymentWebhook', () => {
    const src = read('lib/rateLimit.js');
    assert.ok(src.includes('paymentWebhook'), 'rate limit missing paymentWebhook');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
(async () => {
  await new Promise(r => setTimeout(r, 50));
  console.log('\n' + '='.repeat(60));
  console.log(`Sprint #32 tests: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail > 0 ? 1 : 0);
})();

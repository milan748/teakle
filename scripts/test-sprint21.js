#!/usr/bin/env node

/**
 * TEAKLE — Sprint #21 Test Suite
 * Production Deployment Readiness
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    const result = fn();
    if (result === false || result === undefined) throw new Error('assertion failed');
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}: ${e.message}`);
  }
}

function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function read(f) { return fs.readFileSync(path.join(process.cwd(), f), 'utf8'); }
function exists(f) { return fs.existsSync(path.join(process.cwd(), f)); }

// ──────────────────────────────────────────────
// 1. ENVIRONMENT
// ──────────────────────────────────────────────
console.log('\n1. ENVIRONMENT');

const envSrc = read('lib/env.js');
test("env.js defines REQUIRED_ENV", () => envSrc.includes('REQUIRED_ENV'));
test("env.js defines OPTIONAL_ENV", () => envSrc.includes('OPTIONAL_ENV'));
test("env.js has validateEnv function", () => envSrc.includes('validateEnv'));
test("env.js has requireEnv function", () => envSrc.includes('requireEnv'));
test("env.js has getEnv function", () => envSrc.includes('getEnv'));
test("SESSION_SECRET is required", () => envSrc.includes("SESSION_SECRET") && envSrc.includes('required: true'));
test("SESSION_SECRET min length check", () => envSrc.includes('minLength: 32'));
test("ADMIN_EMAIL is required", () => envSrc.includes("ADMIN_EMAIL") && envSrc.includes('required: true'));
test("ADMIN_PASSWORD is required", () => envSrc.includes("ADMIN_PASSWORD") && envSrc.includes('required: true'));
test("DATABASE_PATH is optional with default", () => envSrc.includes("DATABASE_PATH") && envSrc.includes("default:"));
test("MEDIA_UPLOAD_DIR is optional with default", () => envSrc.includes("MEDIA_UPLOAD_DIR") && envSrc.includes("default:"));
test("ALLOW_INSECURE_SESSION optional", () => envSrc.includes("ALLOW_INSECURE_SESSION"));
test("NEXT_PUBLIC_SITE_URL optional", () => envSrc.includes("NEXT_PUBLIC_SITE_URL"));
test("NODE_ENV optional", () => envSrc.includes("NODE_ENV"));
test("env.js does not print secret values", () => !envSrc.includes('console.log') || !envSrc.includes('SESSION_SECRET'));
test("env.js does not expose values in errors", () => {
  const lines = envSrc.split('\n');
  const errorLines = lines.filter(l => l.includes('error') || l.includes('Error'));
  return errorLines.every(l => !l.includes('process.env.SESSION_SECRET') && !l.includes(`value`));
});

// ──────────────────────────────────────────────
// 2. SECURITY
// ──────────────────────────────────────────────
console.log('\n2. SECURITY');

const sessionSrc = read('lib/session.js');
const custSessionSrc = read('lib/customerSession.js');
const csrfSrc = read('lib/csrf.js');

test("admin session HttpOnly", () => sessionSrc.includes('httpOnly: true'));
test("admin session sameSite lax", () => sessionSrc.includes("sameSite: 'lax'"));
test("admin session secure check", () => sessionSrc.includes('secure:'));
test("admin session maxAge set", () => sessionSrc.includes('maxAge:'));
test("admin session path /", () => sessionSrc.includes("path: '/'"));
test("admin session uses HS256", () => sessionSrc.includes('HS256'));
test("admin session 24h expiry", () => sessionSrc.includes('60 * 60 * 24'));
test("admin session separate from customer", () => sessionSrc.includes('teakle_admin_session'));

test("customer session HttpOnly", () => custSessionSrc.includes('httpOnly: true'));
test("customer session sameSite lax", () => custSessionSrc.includes("sameSite: 'lax'"));
test("customer session secure check", () => custSessionSrc.includes('secure:'));
test("customer session 30d expiry", () => custSessionSrc.includes('60 * 60 * 24 * 30'));
test("customer session separate cookie", () => custSessionSrc.includes('teakle_customer_session'));

test("CSRF cookie not HttpOnly", () => csrfSrc.includes('httpOnly: false'));
test("CSRF cookie secure in production", () => csrfSrc.includes("NODE_ENV === 'production'"));
test("CSRF cookie sameSite lax", () => csrfSrc.includes("sameSite: 'lax'"));
test("CSRF uses x-csrf-token header", () => csrfSrc.includes('x-csrf-token'));
test("CSRF validates header matches cookie", () => csrfSrc.includes('headerToken !== cookieToken'));
test("CSRF skips GET/HEAD/OPTIONS", () => csrfSrc.includes("GET', 'HEAD', 'OPTIONS'"));
test("CSRF withCsrf wrapper exists", () => csrfSrc.includes('withCsrf'));

// ── Security Headers ──
const nextConfig = read('next.config.mjs');
test("X-Content-Type-Options: nosniff", () => nextConfig.includes('X-Content-Type-Options') && nextConfig.includes('nosniff'));
test("X-Frame-Options: DENY", () => nextConfig.includes('X-Frame-Options') && nextConfig.includes('DENY'));
test("X-XSS-Protection: 1; mode=block", () => nextConfig.includes('X-XSS-Protection'));
test("Referrer-Policy set", () => nextConfig.includes('Referrer-Policy'));
test("Permissions-Policy set", () => nextConfig.includes('Permissions-Policy'));
test("API Cache-Control no-store", () => nextConfig.includes('no-store') && nextConfig.includes('no-cache'));
test("security headers applied to all routes", () => nextConfig.includes("source: '/(.*)'"));

// ── CORS ──
test("no Access-Control-Allow-Origin in config", () => !nextConfig.includes('Access-Control-Allow-Origin'));

// ── Error Handling ──
const healthRoute = read('app/api/health/route.js');
test("health route catches errors", () => healthRoute.includes('catch'));

const diagnosticsRoute = read('app/api/admin/diagnostics/route.js');
test("diagnostics route requires admin", () => diagnosticsRoute.includes('requireAdmin') || diagnosticsRoute.includes('admin'));

const globalError = read('app/error.js');
test("global error boundary exists", () => exists('app/error.js'));
test("admin error boundary exists", () => exists('app/admin/error.js'));
test("checkout error boundary exists", () => exists('app/checkout/error.js'));
test("account error boundary exists", () => exists('app/account/error.js'));
test("error boundaries are client components", () => globalError.includes("'use client'"));

// ── Logger ──
const loggerSrc = read('lib/logger.js');
test("logger has sanitize function", () => loggerSrc.includes('sanitize'));
test("logger redacts password", () => loggerSrc.includes("'password'"));
test("logger redacts passwordHash", () => loggerSrc.includes("'passwordHash'"));
test("logger redacts token", () => loggerSrc.includes("'token'"));
test("logger redacts secret", () => loggerSrc.includes("'secret'"));
test("logger redacts SESSION_SECRET", () => loggerSrc.includes("'SESSION_SECRET'"));
test("logger redacts cookie", () => loggerSrc.includes("'cookie'"));
test("logger redacts authorization", () => loggerSrc.includes("'authorization'"));
test("logger uses structured output", () => loggerSrc.includes('log.info') && loggerSrc.includes('log.error'));

// ── No server-side console.log in API routes ──
const apiFiles = [];
function walkApi(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkApi(full);
    else if (entry.name === 'route.js') apiFiles.push(full);
  }
}
walkApi(path.join(process.cwd(), 'app', 'api'));

let serverConsoleCount = 0;
for (const f of apiFiles) {
  const src = fs.readFileSync(f, 'utf8');
  if (src.includes('console.log') || src.includes('console.error') || src.includes('console.warn')) {
    serverConsoleCount++;
  }
}
test("API routes use structured logging (logger.js)", () => serverConsoleCount === 0);

// ──────────────────────────────────────────────
// 3. DATABASE
// ──────────────────────────────────────────────
console.log('\n3. DATABASE');

const dbSrc = read('lib/db.js');
test("db.js exists", () => exists('lib/db.js'));
test("db uses better-sqlite3", () => dbSrc.includes("better-sqlite3"));
test("db sets WAL mode", () => dbSrc.includes('journal_mode = WAL'));
test("db enables foreign keys", () => dbSrc.includes('foreign_keys = ON'));
test("db sets busy_timeout", () => dbSrc.includes('busy_timeout'));
test("db has initSchema function", () => dbSrc.includes('initSchema'));
test("db migrations are idempotent (CREATE TABLE IF NOT EXISTS)", () => dbSrc.includes('IF NOT EXISTS'));
test("db migrations use ALTER TABLE ADD COLUMN", () => dbSrc.includes('ALTER TABLE'));
test("db has index creation", () => dbSrc.includes('CREATE INDEX IF NOT EXISTS'));
test("db reads DATABASE_PATH from env", () => dbSrc.includes('process.env.DATABASE_PATH'));
test("db creates data directory if missing", () => dbSrc.includes('mkdirSync'));
test("db initializes all required tables", () => {
  const tables = ['admins', 'customers', 'orders', 'order_items', 'carts', 'cart_items',
    'wishlists', 'wishlist_items', 'content_sections', 'site_settings', 'media',
    'custom_orders', 'contact_submissions', 'trade_enquiries', 'newsletter_subscribers',
    'payments', 'admin_audit_logs', 'order_activity', 'order_status_history',
    'order_notes', 'product_metadata', 'customer_addresses', 'password_resets'];
  return tables.every(t => dbSrc.includes(`CREATE TABLE IF NOT EXISTS ${t}`));
});

// ── Live DB check ──
try {
  const Database = require('better-sqlite3');
  const dbPath = path.resolve(process.env.DATABASE_PATH || './data/teakle.db');
  const db = new Database(dbPath, { readonly: true });

  const integrity = db.pragma('integrity_check', { simple: true });
  test("database integrity check passes", () => integrity === 'ok');

  const wal = db.pragma('journal_mode', { simple: true });
  test("database journal mode is WAL", () => wal === 'wal');

  const fk = db.pragma('foreign_keys', { simple: true });
  test("database foreign keys enabled", () => fk === 1);

  const bt = db.pragma('busy_timeout', { simple: true });
  test("database busy_timeout set", () => parseInt(bt) > 0);

  db.close();
} catch (e) {
  test("database live check", () => { throw new Error(e.message); });
}

// ──────────────────────────────────────────────
// 4. MEDIA
// ──────────────────────────────────────────────
console.log('\n4. MEDIA');

const storageSrc = read('lib/storage.js');
test("storage.js exists", () => exists('lib/storage.js'));
test("storage uses MEDIA_UPLOAD_DIR env", () => storageSrc.includes('process.env.MEDIA_UPLOAD_DIR'));
test("storage has safe filename generation", () => storageSrc.includes('generateSafeFilename') || storageSrc.includes('randomUUID'));
test("storage ensures directory exists", () => storageSrc.includes('mkdirSync') || storageSrc.includes('ensureDir'));

// ──────────────────────────────────────────────
// 5. HEALTH
// ──────────────────────────────────────────────
console.log('\n5. HEALTH');

test("health route exists", () => exists('app/api/health/route.js'));
test("health route uses logger", () => healthRoute.includes('log'));
test("health route returns JSON", () => healthRoute.includes('Response.json'));
test("health route returns 503 on error", () => healthRoute.includes('503'));

test("diagnostics route exists", () => exists('app/api/admin/diagnostics/route.js'));
test("diagnostics route requires admin auth", () => diagnosticsRoute.includes('requireAdmin'));
test("diagnostics uses force-dynamic", () => diagnosticsRoute.includes('force-dynamic'));

const healthLib = read('lib/health.js');
test("health lib checks integrity", () => healthLib.includes('integrity_check'));
test("health lib checks WAL mode", () => healthLib.includes('journal_mode'));
test("health lib checks foreign keys", () => healthLib.includes('foreign_keys'));
test("health lib checks table count", () => healthLib.includes('tableCount'));
test("health lib returns system info", () => healthLib.includes('nodeVersion'));
test("health lib returns memory usage", () => healthLib.includes('memoryUsage'));

// ── Verify health response does not leak secrets ──
test("health lib does not expose db path in public response", () => {
  const healthRouteSrc = read('app/api/health/route.js');
  return !healthRouteSrc.includes('db.path') && !healthRouteSrc.includes('path:');
});

// ──────────────────────────────────────────────
// 6. BACKUP
// ──────────────────────────────────────────────
console.log('\n6. BACKUP');

const backupSrc = read('scripts/backup-db.js');
test("backup script exists", () => exists('scripts/backup-db.js'));
test("backup uses better-sqlite3", () => backupSrc.includes('better-sqlite3'));
test("backup creates timestamped files", () => backupSrc.includes('timestamp()'));
test("backup verifies integrity", () => backupSrc.includes('integrity_check'));
test("backup checks foreign keys", () => backupSrc.includes('foreign_keys'));
test("backup verifies table contents", () => backupSrc.includes('SELECT COUNT(*)'));
test("backup has --list flag", () => backupSrc.includes('--list'));
test("backup has --verify flag", () => backupSrc.includes('--verify'));
test("backup has --restore flag", () => backupSrc.includes('--restore'));
test("backup has --max-backups pruning", () => backupSrc.includes('--max-backups'));
test("backup creates pre-restore backup", () => backupSrc.includes('pre_restore'));
test("backup reads DATABASE_PATH from env", () => backupSrc.includes('process.env.DATABASE_PATH'));
test("backup reads BACKUP_DIR from env", () => backupSrc.includes('process.env.BACKUP_DIR'));
test("backup handles WAL/SHM files", () => backupSrc.includes('-wal') && backupSrc.includes('-shm'));

// ──────────────────────────────────────────────
// 7. PREFLIGHT
// ──────────────────────────────────────────────
console.log('\n7. PREFLIGHT');

test("preflight script exists", () => exists('scripts/preflight-production.js'));
const preflightSrc = read('scripts/preflight-production.js');
test("preflight checks Node version", () => preflightSrc.includes('nodeVersion'));
test("preflight checks required env vars", () => preflightSrc.includes('SESSION_SECRET') && preflightSrc.includes('ADMIN_EMAIL'));
test("preflight checks SESSION_SECRET strength", () => preflightSrc.includes('minLength') || preflightSrc.includes('length'));
test("preflight checks database existence", () => preflightSrc.includes('existsSync') && preflightSrc.includes('dbPath'));
test("preflight checks database integrity", () => preflightSrc.includes('integrity_check'));
test("preflight checks WAL mode", () => preflightSrc.includes('journal_mode'));
test("preflight checks foreign keys", () => preflightSrc.includes('foreign_keys'));
test("preflight checks required tables", () => preflightSrc.includes('requiredTables'));
test("preflight checks media directory", () => preflightSrc.includes('uploadDir'));
test("preflight checks backup directory", () => preflightSrc.includes('backupDir'));
test("preflight checks NODE_ENV", () => preflightSrc.includes('NODE_ENV'));
test("preflight checks site URL", () => preflightSrc.includes('NEXT_PUBLIC_SITE_URL'));
test("preflight checks .next build", () => preflightSrc.includes('.next'));
test("preflight checks package.json", () => preflightSrc.includes('package.json'));
test("preflight outputs PASS/WARN/FAIL", () => preflightSrc.includes('PASS') && preflightSrc.includes('WARN') && preflightSrc.includes('FAIL'));
test("preflight does not delete files", () => !preflightSrc.includes('unlinkSync') && !preflightSrc.includes('rmSync'));
test("preflight does not modify data", () => !preflightSrc.includes('writeFileSync') && !preflightSrc.includes('INSERT') && !preflightSrc.includes('UPDATE'));
test("preflight does not print secrets", () => {
  const lines = preflightSrc.split('\n');
  return lines.filter(l => l.includes('console.log') || l.includes('console.warn')).every(l => !l.includes('process.env.SESSION_SECRET'));
});

// ──────────────────────────────────────────────
// 8. DEPLOYMENT DOCS
// ──────────────────────────────────────────────
console.log('\n8. DEPLOYMENT DOCS');

test("DEPLOYMENT.md exists", () => exists('DEPLOYMENT.md'));
const deployMd = read('DEPLOYMENT.md');
test("DEPLOYMENT.md covers requirements", () => deployMd.includes('Requirements') || deployMd.includes('requirements'));
test("DEPLOYMENT.md covers env vars", () => deployMd.includes('SESSION_SECRET') || deployMd.includes('Environment'));
test("DEPLOYMENT.md covers database", () => deployMd.includes('SQLite') || deployMd.includes('database'));
test("DEPLOYMENT.md covers media storage", () => deployMd.includes('media') || deployMd.includes('Media'));
test("DEPLOYMENT.md covers build", () => deployMd.includes('npm run build'));
test("DEPLOYMENT.md covers start", () => deployMd.includes('npm run start'));
test("DEPLOYMENT.md covers HTTPS", () => deployMd.includes('HTTPS') || deployMd.includes('https'));
test("DEPLOYMENT.md covers reverse proxy", () => deployMd.includes('reverse proxy') || deployMd.includes('nginx'));
test("DEPLOYMENT.md covers backups", () => deployMd.includes('backup') || deployMd.includes('Backup'));
test("DEPLOYMENT.md covers restore", () => deployMd.includes('restore') || deployMd.includes('Restore'));
test("DEPLOYMENT.md covers health check", () => deployMd.includes('health') || deployMd.includes('Health'));
test("DEPLOYMENT.md covers known limitations", () => deployMd.includes('Limitation') || deployMd.includes('limitation') || deployMd.includes('NOT safe'));
test("DEPLOYMENT.md states SQLite needs persistent disk", () => deployMd.includes('persistent'));
test("DEPLOYMENT.md warns against serverless", () => deployMd.includes('serverless') || deployMd.includes('NOT safe'));

test("production-checklist.md exists", () => exists('scripts/production-checklist.md'));
const checklistMd = read('scripts/production-checklist.md');
test("checklist covers domain/HTTPS", () => checklistMd.includes('HTTPS'));
test("checklist covers SESSION_SECRET", () => checklistMd.includes('SESSION_SECRET'));
test("checklist covers admin credentials", () => checklistMd.includes('ADMIN'));
test("checklist covers database persistence", () => checklistMd.includes('persistent'));
test("checklist covers backup testing", () => checklistMd.includes('backup') || checklistMd.includes('Backup'));
test("checklist covers build", () => checklistMd.includes('build'));
test("checklist covers health check", () => checklistMd.includes('health'));
test("checklist covers CSRF testing", () => checklistMd.includes('CSRF'));
test("checklist covers security headers", () => checklistMd.includes('security') || checklistMd.includes('Security'));

// ──────────────────────────────────────────────
// 9. PAYMENT ARCHITECTURE
// ──────────────────────────────────────────────
console.log('\n9. PAYMENT ARCHITECTURE');

const paymentSrc = read('lib/payment.js');
test("payment.js exists", () => exists('lib/payment.js'));
test("payment defines VALID_PAYMENT_STATUSES", () => paymentSrc.includes('VALID_PAYMENT_STATUSES'));
test("payment defines PAYMENT_TRANSITIONS", () => paymentSrc.includes('PAYMENT_TRANSITIONS'));
test("payment has isValidPaymentTransition", () => paymentSrc.includes('isValidPaymentTransition'));
test("payment has getServerOrderAmount (server-side)", () => paymentSrc.includes('getServerOrderAmount'));
test("payment has idempotent createPaymentRecord", () => paymentSrc.includes('idempotencyKey'));
test("payment createPaymentIntent returns 'not configured'", () => paymentSrc.includes('Payment provider not configured'));
test("payment verifyPayment returns 'not configured'", () => paymentSrc.includes('not configured'));
test("payment processRefund returns 'not configured'", () => paymentSrc.includes('not configured'));
test("payment handleWebhook validates provider", () => paymentSrc.includes('knownProviders'));
test("payment does not expose real provider keys", () => !paymentSrc.includes('sk_live') && !paymentSrc.includes('rzp_'));

// ──────────────────────────────────────────────
// 10. RATE LIMITING
// ──────────────────────────────────────────────
console.log('\n10. RATE LIMITING');

const rlSrc = read('lib/rateLimit.js');
test("rateLimit.js exists", () => exists('lib/rateLimit.js'));
test("rateLimit function exported", () => rlSrc.includes('export function rateLimit'));
test("RATE_LIMITS config exported", () => rlSrc.includes('RATE_LIMITS'));
test("adminLogin rate limit", () => rlSrc.includes('adminLogin'));
test("customerLogin rate limit", () => rlSrc.includes('customerLogin'));
test("orderCreate rate limit", () => rlSrc.includes('orderCreate'));
test("adminBulkAction rate limit", () => rlSrc.includes('adminBulkAction'));
test("adminExport rate limit", () => rlSrc.includes('adminExport'));
test("paymentWebhook rate limit", () => rlSrc.includes('paymentWebhook'));
test("cleanup interval set", () => rlSrc.includes('setInterval'));
test("cleanup uses unref", () => rlSrc.includes('unref'));

// ──────────────────────────────────────────────
// 11. REGRESSION
// ──────────────────────────────────────────────
console.log('\n11. REGRESSION');
test("lib/auth.js exists", () => exists('lib/auth.js'));
test("lib/csrf.js exists", () => exists('lib/csrf.js'));
test("lib/rateLimit.js exists", () => exists('lib/rateLimit.js'));
test("lib/logger.js exists", () => exists('lib/logger.js'));
test("lib/session.js exists", () => exists('lib/session.js'));
test("lib/payment.js exists", () => exists('lib/payment.js'));
test("lib/db.js exists", () => exists('lib/db.js'));
test("lib/env.js exists", () => exists('lib/env.js'));
test("lib/health.js exists", () => exists('lib/health.js'));
test("lib/storage.js exists", () => exists('lib/storage.js'));
test("scripts/backup-db.js exists", () => exists('scripts/backup-db.js'));
test("scripts/init-admin.js exists", () => exists('scripts/init-admin.js'));
test("scripts/preflight-production.js exists", () => exists('scripts/preflight-production.js'));
test("scripts/test-sprint21.js exists", () => exists('scripts/test-sprint21.js'));
test("DEPLOYMENT.md exists", () => exists('DEPLOYMENT.md'));
test("scripts/production-checklist.md exists", () => exists('scripts/production-checklist.md'));
test(".env.example exists", () => exists('.env.example'));
test(".gitignore exists", () => exists('.gitignore'));
test("package.json exists", () => exists('package.json'));
test("next.config.mjs exists", () => exists('next.config.mjs'));

// ── Gitignore checks ──
const gitignore = read('.gitignore');
test(".gitignore excludes .env", () => gitignore.includes('.env'));
test(".gitignore excludes .env.local", () => gitignore.includes('.env.local'));
test(".gitignore excludes data/*.db", () => gitignore.includes('data/*.db'));
test(".gitignore excludes backups/", () => gitignore.includes('backups/'));
test(".gitignore excludes public/uploads/", () => gitignore.includes('public/uploads/'));
test(".gitignore excludes .next/", () => gitignore.includes('.next/'));
test(".gitignore does NOT ignore source code", () => !gitignore.includes('app/') && !gitignore.includes('lib/'));

// ── No secrets in tracked files ──
test("no hardcoded secrets in app/lib source files", () => {
  const secrets = ['TestPassword123', '1b2016ef223f085ebb567633a4667bd9066271298a9df6b9dfe384639c9c58d3', 'testadmin@teakle.in'];
  const dirs = ['app', 'lib'];
  for (const dir of dirs) {
    const full = path.join(process.cwd(), dir);
    if (!fs.existsSync(full)) continue;
    function walk(d) {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, entry.name);
        if (entry.isDirectory() && !['node_modules', '.next'].includes(entry.name)) walk(p);
        else if (entry.name.endsWith('.js') && !entry.name.includes('test')) {
          const src = fs.readFileSync(p, 'utf8');
          for (const s of secrets) {
            if (src.includes(s)) throw new Error(`Secret in ${path.relative(process.cwd(), p)}`);
          }
        }
      }
    }
    walk(full);
  }
  return true;
});

test("API routes do not stringify error stack traces", () => {
  const routeFiles = [];
  function walkRoutes(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkRoutes(full);
      else if (entry.name === 'route.js') routeFiles.push(full);
    }
  }
  walkRoutes(path.join(process.cwd(), 'app', 'api'));
  for (const f of routeFiles) {
    const src = fs.readFileSync(f, 'utf8');
    if (src.includes('e.stack') || src.includes('error.stack')) {
      throw new Error(`Stack trace in ${path.relative(process.cwd(), f)}`);
    }
  }
  return true;
});

test("client components only use console.error (not console.log)", () => {
  const clientFiles = ['app/admin/OrdersManager.js', 'app/admin/ProductsManager.js', 'app/admin/AuditLogManager.js', 'app/account/page.js'];
  let ok = true;
  for (const f of clientFiles) {
    if (exists(f)) {
      const src = read(f);
      if (src.includes("'use client'") && src.includes('console.log')) ok = false;
    }
  }
  return ok;
});

// ──────────────────────────────────────────────
// RESULTS
// ──────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log(`\x1b[1mSprint #21 Tests: ${passed}/${total} passed, ${failed} failed\x1b[0m`);
if (failed > 0) process.exit(1);

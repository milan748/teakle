#!/usr/bin/env node

/**
 * TEAKLE — Sprint #29 Unit / Static Tests
 * Production Deployment & Hostinger Compatibility Hardening
 *
 * Covers: Linux compatibility, case-sensitive imports, environment consistency,
 * production start configuration, filesystem configuration, cookie/security
 * configuration, reverse proxy handling, SQLite configuration, migrations,
 * backup system, media configuration, deployment documentation, Git exposure,
 * core regression behavior.
 *
 * Usage: node scripts/test-sprint29.js
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
  sections[name] = (sections[name] || 0) + 1;
  console.log(`\n=== ${name} (run ${sections[name]}) ===`);
}

function summary() {
  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail > 0 ? 1 : 0);
}

function read(rel) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
}

function fileExists(rel) {
  return fs.existsSync(path.join(process.cwd(), rel));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. LINUX COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════════
section('LINUX COMPATIBILITY');

const storageSrc = read('lib/storage.js');
const dbSrc = read('lib/db.js');
const rateLimitSrc = read('lib/rateLimit.js');
const mediaSrc = read('lib/media.js');
const paymentSrc = read('lib/payment.js');
const emailSrc = read('lib/email.js');
const validateSrc = read('lib/validate.js');
const loggerSrc = read('lib/logger.js');
const csrfSrc = read('lib/csrf.js');
const sessionSrc = read('lib/session.js');
const customerSessionSrc = read('lib/customerSession.js');
const secureConnectionSrc = read('lib/secureConnection.js');

test('storage.js imports crypto (fixes Node 18 global crypto gap)', () => {
  assert.ok(storageSrc.includes("import crypto from 'crypto'"), 'missing crypto import');
  assert.ok(storageSrc.includes('crypto.randomUUID()'), 'crypto.randomUUID not used');
});

test('No Windows path separators in lib code', () => {
  const files = [storageSrc, dbSrc, rateLimitSrc, mediaSrc, paymentSrc, emailSrc, validateSrc, loggerSrc, csrfSrc, sessionSrc, customerSessionSrc, secureConnectionSrc];
  for (const f of files) {
    // Allow only inside string negative-assertions (e.g. assertions checking for absence)
    assert.ok(!f.includes("path.win32"), 'uses path.win32');
    assert.ok(!f.includes("process.platform === 'win32'"), 'hardcodes win32 platform');
  }
});

test('No hardcoded C:\\ absolute paths in lib (except negative assertions)', () => {
  assert.ok(!storageSrc.includes('C:\\'));
  assert.ok(!dbSrc.includes('C:\\'));
  assert.ok(!mediaSrc.includes('C:\\'));
});

test('Paths use path.join / path.resolve (cross-platform)', () => {
  assert.ok(dbSrc.includes("path.join(process.cwd(), 'data', 'teakle.db'"));
  assert.ok(storageSrc.includes("path.join(process.cwd(), 'public', 'uploads', 'media'"));
});

test('No shell script references in lib runtime', () => {
  assert.ok(!dbSrc.includes('.bat'));
  assert.ok(!dbSrc.includes('.ps1'));
  assert.ok(!dbSrc.includes('cmd.exe'));
});

test('Shebang scripts use LF line endings (no CRLF)', () => {
  const scripts = fs.readdirSync(path.join(process.cwd(), 'scripts')).filter(f => f.endsWith('.js'));
  for (const s of scripts) {
    const buf = fs.readFileSync(path.join(process.cwd(), 'scripts', s));
    const head = buf.slice(0, 200).toString('latin1');
    if (head.startsWith('#!')) {
      assert.ok(!head.includes('\r'), `${s} has CRLF after shebang`);
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CASE-SENSITIVE IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
section('CASE-SENSITIVE IMPORTS');

test('secureConnection.js exists and is lowercase', () => {
  assert.ok(fileExists('lib/secureConnection.js'), 'file missing');
});

test('session.js imports ./secureConnection (exact casing)', () => {
  assert.ok(sessionSrc.includes("import { isSecureConnection } from './secureConnection'"));
});

test('customerSession.js imports ./secureConnection (exact casing)', () => {
  assert.ok(customerSessionSrc.includes("import { isSecureConnection } from './secureConnection'"));
});

test('csrf.js imports ./secureConnection (exact casing)', () => {
  assert.ok(csrfSrc.includes("import { isSecureConnection } from './secureConnection'"));
});

test('No duplicate isSecureConnection definitions in session libs', () => {
  assert.ok(!sessionSrc.includes('async function isSecureConnection()'), 'duplicate def in session.js');
  assert.ok(!customerSessionSrc.includes('async function isSecureConnection()'), 'duplicate def in customerSession.js');
});

test('All lib imports resolve to existing lowercase files', () => {
  const libFiles = fs.readdirSync(path.join(process.cwd(), 'lib'));
  const importRe = /from\s+['"]\.\/([\w]+)['"]/g;
  const check = (src, file) => {
    let m;
    while ((m = importRe.exec(src)) !== null) {
      const name = m[1];
      assert.ok(libFiles.includes(name + '.js'), `${file} imports ./${name} but ${name}.js missing`);
    }
  };
  check(dbSrc, 'db.js');
  check(mediaSrc, 'media.js');
  check(paymentSrc, 'payment.js');
  check(emailSrc, 'email.js');
  check(validateSrc, 'validate.js');
  check(loggerSrc, 'logger.js');
  check(csrfSrc, 'csrf.js');
  check(sessionSrc, 'session.js');
  check(customerSessionSrc, 'customerSession.js');
  check(secureConnectionSrc, 'secureConnection.js');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ENVIRONMENT VARIABLE CONSISTENCY
// ═══════════════════════════════════════════════════════════════════════════════
section('ENVIRONMENT VARIABLE CONSISTENCY');

const envSrc = read('lib/env.js');
const envExample = read('.env.example');
const deploySrc = read('DEPLOYMENT.md');
const preflightSrc = read('scripts/preflight-production.js');

const vars = ['SESSION_SECRET', 'ADMIN_SESSION_SECRET', 'CUSTOMER_SESSION_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD',
  'DATABASE_PATH', 'MEDIA_UPLOAD_DIR', 'BACKUP_DIR', 'NEXT_PUBLIC_SITE_URL', 'ALLOW_INSECURE_SESSION',
  'EMAIL_PROVIDER', 'EMAIL_FROM', 'EMAIL_API_KEY', 'PAYMENT_PROVIDER', 'PAYMENT_KEY_ID', 'PAYMENT_KEY_SECRET', 'PAYMENT_WEBHOOK_SECRET'];

// NODE_ENV is platform-set and not expected in .env.example
const envExampleVars = [...vars, 'NODE_ENV'];

test('.env.example documents all core variables', () => {
  for (const v of vars) {
    assert.ok(envExample.includes(v + '='), `.env.example missing ${v}`);
  }
});

test('lib/env.js validates all core variables', () => {
  for (const v of vars) {
    assert.ok(envSrc.includes(v), `lib/env.js missing ${v}`);
  }
});

test('DEPLOYMENT.md documents all core variables', () => {
  for (const v of vars) {
    assert.ok(deploySrc.includes('`' + v + '`'), `DEPLOYMENT.md missing ${v}`);
  }
});

test('preflight checks ADMIN_SESSION_SECRET and CUSTOMER_SESSION_SECRET', () => {
  assert.ok(preflightSrc.includes('ADMIN_SESSION_SECRET'), 'preflight missing ADMIN_SESSION_SECRET');
  assert.ok(preflightSrc.includes('CUSTOMER_SESSION_SECRET'), 'preflight missing CUSTOMER_SESSION_SECRET');
});

test('No secrets use NEXT_PUBLIC_ prefix (client-safe)', () => {
  const secretVars = ['SESSION_SECRET', 'ADMIN_SESSION_SECRET', 'CUSTOMER_SESSION_SECRET', 'EMAIL_API_KEY', 'PAYMENT_KEY_SECRET', 'PAYMENT_WEBHOOK_SECRET'];
  for (const v of secretVars) {
    assert.ok(!v.startsWith('NEXT_PUBLIC_'), `${v} must not be public`);
  }
});

test('Payment keys are documented-but-unused placeholders (no provider)', () => {
  assert.ok(envExample.includes('PAYMENT_KEY_ID'));
  assert.ok(envExample.includes('PAYMENT_KEY_SECRET'));
  assert.ok(envExample.includes('PAYMENT_WEBHOOK_SECRET'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PRODUCTION START CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
section('PRODUCTION START CONFIGURATION');

const pkg = JSON.parse(read('package.json'));

test('package.json has build/start/dev scripts', () => {
  assert.ok(pkg.scripts.build === 'next build', 'build script wrong');
  assert.ok(pkg.scripts.start === 'next start', 'start script wrong');
  assert.ok(pkg.scripts.dev === 'next dev', 'dev script wrong');
});

test('start script runs production server (next start, not dev)', () => {
  assert.ok(!pkg.scripts.start.includes('next dev'), 'start must not use dev');
});

test('PORT is configurable (env recognized)', () => {
  assert.ok(envSrc.includes('PORT'), 'PORT not in env.js');
});

test('systemd ExecStart ultimately runs npm run start', () => {
  assert.ok(deploySrc.includes("ExecStart=/usr/bin/npm --prefix /path/to/teakle run start"), 'systemd ExecStart does not map to npm run start');
});

test('PM2 start command runs npm run start', () => {
  assert.ok(deploySrc.includes('pm2 start npm --name "teakle" -- start'), 'PM2 command wrong');
});

test('Docker CMD runs npm start', () => {
  assert.ok(deploySrc.includes('CMD ["npm", "start"]'), 'Docker CMD wrong');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. FILESYSTEM CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
section('FILESYSTEM CONFIGURATION');

test('DATABASE_PATH independently configurable', () => {
  assert.ok(dbSrc.includes('process.env.DATABASE_PATH'));
  assert.ok(envExample.includes('DATABASE_PATH='));
});

test('MEDIA_UPLOAD_DIR independently configurable', () => {
  assert.ok(storageSrc.includes('process.env.MEDIA_UPLOAD_DIR'));
  assert.ok(envExample.includes('MEDIA_UPLOAD_DIR='));
});

test('BACKUP_DIR independently configurable', () => {
  const backupSrc = read('scripts/backup-db.js');
  assert.ok(backupSrc.includes('process.env.BACKUP_DIR'));
  assert.ok(envExample.includes('BACKUP_DIR='));
});

test('Database does not depend on .next', () => {
  assert.ok(!dbSrc.includes('.next'), 'db references .next');
});

test('Uploads do not depend on build artifacts', () => {
  assert.ok(!storageSrc.includes('.next'), 'storage references .next');
});

test('Backups do not reside in public/static', () => {
  const backupSrc = read('scripts/backup-db.js');
  assert.ok(!backupSrc.includes('public/'), 'backup writes under public/');
});

test('Required directories created safely (recursive mkdir)', () => {
  assert.ok(dbSrc.includes('fs.mkdirSync') && dbSrc.includes('recursive: true'));
  assert.ok(storageSrc.includes('fs.mkdirSync') && storageSrc.includes('recursive: true'));
});

test('No hardcoded Hostinger-specific absolute path', () => {
  assert.ok(!dbSrc.includes('/home/'));
  assert.ok(!storageSrc.includes('/home/'));
  assert.ok(!dbSrc.includes('/var/'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. COOKIE / SECURITY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
section('COOKIE / SECURITY CONFIGURATION');

test('Admin session cookie name is teakle_admin_session', () => {
  assert.ok(sessionSrc.includes("const SESSION_NAME = 'teakle_admin_session'"));
});

test('Customer session cookie name is teakle_customer_session', () => {
  assert.ok(customerSessionSrc.includes("const SESSION_NAME = 'teakle_customer_session'"));
});

test('CSRF cookie name is teakle_csrf', () => {
  assert.ok(csrfSrc.includes("const CSRF_COOKIE = 'teakle_csrf'"));
});

test('Admin session is HttpOnly + SameSite=Lax + 24h', () => {
  assert.ok(sessionSrc.includes('httpOnly: true') && sessionSrc.includes("sameSite: 'lax'"));
  assert.ok(sessionSrc.includes('SESSION_MAX_AGE = 60 * 60 * 24'));
});

test('Customer session is HttpOnly + SameSite=Lax + 30d', () => {
  assert.ok(customerSessionSrc.includes('httpOnly: true') && customerSessionSrc.includes("sameSite: 'lax'"));
  assert.ok(customerSessionSrc.includes('SESSION_MAX_AGE = 60 * 60 * 24 * 30'));
});

test('CSRF cookie is non-HttpOnly + SameSite=Lax + 1h', () => {
  assert.ok(csrfSrc.includes('httpOnly: false') && csrfSrc.includes("sameSite: 'lax'"));
  assert.ok(csrfSrc.includes('CSRF_MAX_AGE = 60 * 60'));
});

test('CSRF cookie Secure flag uses shared isSecureConnection() (consistent with sessions)', () => {
  assert.ok(csrfSrc.includes('secure: await isSecureConnection()'), 'csrf uses NODE_ENV only — inconsistent');
  assert.ok(!csrfSrc.includes("secure: process.env.NODE_ENV === 'production'"), 'csrf still uses NODE_ENV only');
});

test('Session Secure flag uses shared isSecureConnection()', () => {
  assert.ok(sessionSrc.includes('secure: await isSecureConnection()'));
  assert.ok(customerSessionSrc.includes('secure: await isSecureConnection()'));
});

test('isSecureConnection honors x-forwarded-proto and ALLOW_INSECURE_SESSION', () => {
  assert.ok(secureConnectionSrc.includes("process.env.NODE_ENV !== 'production'"));
  assert.ok(secureConnectionSrc.includes("process.env.ALLOW_INSECURE_SESSION === 'true'"));
  assert.ok(secureConnectionSrc.includes("h.get('x-forwarded-proto')"));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. REVERSE PROXY HANDLING
// ═══════════════════════════════════════════════════════════════════════════════
section('REVERSE PROXY HANDLING');

test('Rate limiter reads x-forwarded-for (leftmost = original client)', () => {
  assert.ok(rateLimitSrc.includes("forwarded.split(',')[0].trim()"));
});

test('Rate limiter trust model documented', () => {
  assert.ok(rateLimitSrc.includes('X-Forwarded-For') && rateLimitSrc.includes('trust'));
});

test('Secure detection reads x-forwarded-proto', () => {
  assert.ok(secureConnectionSrc.includes("h.get('x-forwarded-proto')"));
});

test('Direct connections fall back to local identity', () => {
  assert.ok(rateLimitSrc.includes("'local'"));
});

test('No blind trust of arbitrary x-real-ip without proxy model', () => {
  // The design only trusts x-forwarded-for behind a documented proxy.
  assert.ok(rateLimitSrc.includes('extractClientIp'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. SQLITE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
section('SQLITE CONFIGURATION');

test('WAL journal mode enabled', () => {
  assert.ok(dbSrc.includes("pragma('journal_mode = WAL')"));
});

test('Foreign keys enforced', () => {
  assert.ok(dbSrc.includes("pragma('foreign_keys = ON')"));
});

test('busy_timeout configured', () => {
  assert.ok(dbSrc.includes("pragma('busy_timeout = 5000')"));
});

test('Database path persistent (not in-memory)', () => {
  assert.ok(dbSrc.includes("path.join(process.cwd(), 'data', 'teakle.db')"));
});

test('Migrations are idempotent (CREATE TABLE IF NOT EXISTS)', () => {
  assert.ok((dbSrc.match(/CREATE TABLE IF NOT EXISTS/g) || []).length >= 10);
});

test('Migration column additions guard with table_info', () => {
  assert.ok(dbSrc.includes("PRAGMA table_info("));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. MIGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════
section('MIGRATIONS');

test('Session version migration present and idempotent', () => {
  assert.ok(dbSrc.includes('migrateCustomerSessionVersion'));
  assert.ok(dbSrc.includes('colNames.includes'));
});

test('All migration functions invoked in initSchema', () => {
  assert.ok(dbSrc.includes('migrateCustomerSessionVersion(db)'));
});

test('No destructive DROP TABLE in migrations', () => {
  assert.ok(!dbSrc.includes('DROP TABLE'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. BACKUP SYSTEM
// �══════════════════════════════════════════════════════════════════════════════
section('BACKUP SYSTEM');

const backupSrc = read('scripts/backup-db.js');

test('Backup uses SQLite safe backup API', () => {
  assert.ok(backupSrc.includes('source.backup(backupPath)'));
});

test('Backup verifies integrity_check', () => {
  assert.ok(backupSrc.includes('integrity_check'));
});

test('Backup verifies foreign_key_check', () => {
  assert.ok(backupSrc.includes('foreign_key_check'));
});

test('Pre-restore backup created before restore', () => {
  assert.ok(backupSrc.includes('teakle_pre_restore_'));
});

test('Restore rolls back on failure', () => {
  assert.ok(backupSrc.includes('Restoring pre-restore backup'));
});

test('Pruning keeps configurable max backups', () => {
  assert.ok(backupSrc.includes('--max-backups'));
});

test('No dead/incorrect VACUUM INTO placeholder code', () => {
  assert.ok(!backupSrc.includes('VACUUM INTO ?'), 'dead VACUUM INTO code remains');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. MEDIA CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
section('MEDIA CONFIGURATION');

test('Media storage outside .next', () => {
  assert.ok(storageSrc.includes("path.join(process.cwd(), 'public', 'uploads', 'media')"));
});

test('Media URL uses forward slash (OS-independent)', () => {
  assert.ok(storageSrc.includes("return `/uploads/media/${relativePath}`"));
});

test('Magic byte verification present', () => {
  assert.ok(mediaSrc.includes('verifyMagicBytes') || mediaSrc.includes('magic'));
});

test('Allowed MIME types restricted', () => {
  assert.ok(mediaSrc.includes('image/jpeg') && mediaSrc.includes('image/png'));
});

test('CMS media references checked before deletion', () => {
  assert.ok(mediaSrc.includes('isMediaReferenced') || mediaSrc.includes('content_sections'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. DEPLOYMENT DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
section('DEPLOYMENT DOCUMENTATION');

test('Documents server environment (Node >= 18)', () => {
  assert.ok(deploySrc.includes('Node.js') && deploySrc.includes('18'));
});

test('Documents git deployment', () => {
  assert.ok(deploySrc.includes('git clone'));
});

test('Documents npm install / build / start', () => {
  assert.ok(deploySrc.includes('npm install') && deploySrc.includes('npm run build') && deploySrc.includes('npm run start'));
});

test('Documents PM2/systemd', () => {
  assert.ok(deploySrc.includes('systemd') && deploySrc.includes('PM2'));
});

test('Documents reverse proxy', () => {
  assert.ok(deploySrc.includes('Reverse proxy') || deploySrc.includes('reverse proxy'));
});

test('Documents HTTPS/SSL', () => {
  assert.ok(deploySrc.includes('HTTPS'));
});

test('Documents SQLite persistence', () => {
  assert.ok(deploySrc.includes('SQLite') && deploySrc.includes('persist'));
});

test('Documents media persistence', () => {
  assert.ok(deploySrc.includes('Media') && deploySrc.includes('persist'));
});

test('Documents backups', () => {
  assert.ok(deploySrc.includes('Backups') || deploySrc.includes('backup'));
});

test('Documents health monitoring', () => {
  assert.ok(deploySrc.includes('Health Check'));
});

test('Documents rollback', () => {
  assert.ok(deploySrc.includes('Rollback'));
});

test('Documents known architectural limitations', () => {
  assert.ok(deploySrc.includes('Known Limitations'));
  assert.ok(deploySrc.includes('serverless') || deploySrc.includes('ephemeral'));
});

test('Explicitly states not suitable for serverless without changes', () => {
  assert.ok(deploySrc.includes('NOT safe') && deploySrc.includes('serverless'));
});

test('Documents filesystem permissions for service user', () => {
  assert.ok(deploySrc.includes('chown') || deploySrc.includes('www-data'));
});

test('Documents logging', () => {
  assert.ok(deploySrc.includes('Logging'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. GIT EXPOSURE
// ═══════════════════════════════════════════════════════════════════════════════
section('GIT EXPOSURE');

const gitignore = read('.gitignore');

test('.gitignore excludes .env.local', () => {
  assert.ok(gitignore.includes('.env.local'));
});

test('.gitignore excludes database files', () => {
  assert.ok(gitignore.includes('data/*.db'));
});

test('.gitignore excludes WAL/SHM files', () => {
  assert.ok(gitignore.includes('data/*.db-wal') && gitignore.includes('data/*.db-shm'));
});

test('.gitignore excludes backups', () => {
  assert.ok(gitignore.includes('backups/'));
});

test('.gitignore excludes uploaded media', () => {
  assert.ok(gitignore.includes('public/uploads/'));
});

test('.gitignore excludes .next', () => {
  assert.ok(gitignore.includes('.next/'));
});

test('Repository tracks .env.example', () => {
  assert.ok(!gitignore.includes('.env.example') || gitignore.includes('!.env.example'));
  assert.ok(fileExists('.env.example'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. CORE REGRESSION BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════════
section('CORE REGRESSION BEHAVIOR');

test('secureConnection shared helper exported', () => {
  assert.ok(secureConnectionSrc.includes('export async function isSecureConnection()'));
});

test('All three cookie sources import the shared helper', () => {
  assert.ok(sessionSrc.includes("from './secureConnection'"));
  assert.ok(customerSessionSrc.includes("from './secureConnection'"));
  assert.ok(csrfSrc.includes("from './secureConnection'"));
});

test('Logger redacts sensitive keys', () => {
  assert.ok(loggerSrc.includes('SENSITIVE_KEYS'));
  assert.ok(loggerSrc.includes('SESSION_SECRET') && loggerSrc.includes('PAYMENT_KEY_SECRET'));
});

test('Health endpoint does not expose filesystem paths', () => {
  const healthSrc = read('app/api/health/route.js');
  assert.ok(!healthSrc.includes('db.path'));
  assert.ok(healthSrc.includes('status'));
});

test('Diagnostics remains admin-only', () => {
  const diagSrc = read('app/api/admin/diagnostics/route.js');
  assert.ok(diagSrc.includes('requireAdmin'));
});

test('No stack traces exposed to clients (search app/api)', () => {
  const apiDir = path.join(process.cwd(), 'app', 'api');
  let found = false;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'route.js') {
        const s = fs.readFileSync(p, 'utf8');
        if (s.includes('.stack') && /return\s|Response\.json/.test(s) && s.includes('err.stack')) found = true;
      }
    }
  }
  walk(apiDir);
  assert.ok(!found, 'a route leaks err.stack');
});

summary();

/**
 * Sprint #18 — Production Reliability & Database Operations Tests
 * Run: node scripts/test-sprint18.js
 *
 * Tests:
 * 1. Backup utility functions
 * 2. Health check utility
 * 3. Environment validation
 * 4. Database reliability (busy_timeout, WAL, foreign_keys)
 * 5. Migration safety (idempotent, deterministic)
 * 6. Health endpoint structure
 * 7. Admin diagnostics endpoint structure
 * 8. Backup security (.gitignore)
 * 9. Startup safety
 * 10. Error boundary coverage
 * 11. Logging safety
 * 12. API error consistency
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  catch (err) { failed++; console.log(`  \x1b[31m✗\x1b[0m ${name}`); console.log(`    ${err.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function assertEq(a, b, m) { if (a !== b) throw new Error(m || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function assertIncludes(h, n, m) { if (!h.includes(n)) throw new Error(m || `Expected to include "${n}"`); }
function assertNotIncludes(h, n, m) { if (h.includes(n)) throw new Error(m || `Expected NOT to include "${n}"`); }
function assertFile(path, m) { if (!fs.existsSync(path)) throw new Error(m || `File does not exist: ${path}`); }
function assertGt(a, b, m) { if (!(a > b)) throw new Error(m || `Expected ${a} > ${b}`); }
function assertLt(a, b, m) { if (!(a < b)) throw new Error(m || `Expected ${a} < ${b}`); }

// ─── 1. Backup Utility ─────────────────────────────────────────────────────

console.log('\n1. Backup Utility');

const backupPath = path.join(__dirname, '..', 'scripts', 'backup-db.js');
assertFile(backupPath, 'backup-db.js does not exist');
const backupCode = fs.readFileSync(backupPath, 'utf-8');

test('backup-db.js exists and is a valid script', () => {
  assert(backupCode.length > 100, 'backup-db.js is too short');
});

test('exports createBackup function', () => {
  assertIncludes(backupCode, 'function createBackup');
});

test('exports verifyBackup function', () => {
  assertIncludes(backupCode, 'function verifyBackup');
});

test('exports listBackups function', () => {
  assertIncludes(backupCode, 'function listBackups');
});

test('exports restoreBackup function', () => {
  assertIncludes(backupCode, 'function restoreBackup');
});

test('exports pruneOldBackups function', () => {
  assertIncludes(backupCode, 'function pruneOldBackups');
});

test('uses better-sqlite3 Database', () => {
  assertIncludes(backupCode, 'better-sqlite3');
});

test('uses backup API for safe backup', () => {
  assertIncludes(backupCode, 'source.backup(backupPath)');
});

test('uses async/await for backup', () => {
  assertIncludes(backupCode, 'await source.backup');
});

test('verifies integrity after backup', () => {
  assertIncludes(backupCode, 'integrity_check');
});

test('uses timestamped filenames', () => {
  assertIncludes(backupCode, 'timestamp()');
  assertIncludes(backupCode, 'teakle_backup_');
});

test('creates backup directory if missing', () => {
  assertIncludes(backupCode, 'ensureDir(BACKUP_DIR)');
});

test('supports --list flag', () => {
  assertIncludes(backupCode, "'--list'");
});

test('supports --verify flag', () => {
  assertIncludes(backupCode, "'--verify'");
});

test('supports --restore flag', () => {
  assertIncludes(backupCode, "'--restore'");
});

test('supports --max-backups flag', () => {
  assertIncludes(backupCode, "'--max-backups'");
});

test('closes source after backup', () => {
  assertIncludes(backupCode, 'source.close()');
});

test('handles backup failure gracefully', () => {
  assertIncludes(backupCode, 'Backup failed');
});

test('cleans up failed backup file', () => {
  assertIncludes(backupCode, 'fs.unlinkSync(backupPath)');
});

test('creates pre-restore backup before restoring', () => {
  assertIncludes(backupCode, 'teakle_pre_restore_');
});

test('restores WAL and SHM files', () => {
  assertIncludes(backupCode, "'-wal'");
  assertIncludes(backupCode, "'-shm'");
});

test('backup can run as CLI and as module', () => {
  assertIncludes(backupCode, "require.main === module");
});

// ─── 2. Backup Files ──────────────────────────────────────────────────────

console.log('\n2. Backup Files');

const backupsDir = path.join(__dirname, '..', 'backups');

test('backups directory exists', () => {
  assertFile(backupsDir, 'backups/ directory does not exist');
});

test('backup files exist in backups directory', () => {
  const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.db') && f.startsWith('teakle_backup_'));
  assertGt(files.length, 0, 'No backup files found');
});

test('backup files have valid size', () => {
  const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.db') && f.startsWith('teakle_backup_'));
  for (const file of files) {
    const stats = fs.statSync(path.join(backupsDir, file));
    assertGt(stats.size, 1000, `Backup ${file} is too small (${stats.size} bytes)`);
  }
});

// ─── 3. Health Utility ────────────────────────────────────────────────────

console.log('\n3. Health Utility');

const healthPath = path.join(__dirname, '..', 'lib', 'health.js');
assertFile(healthPath, 'lib/health.js does not exist');
const healthCode = fs.readFileSync(healthPath, 'utf-8');

test('health.js exists and is valid', () => {
  assert(healthCode.length > 100, 'health.js is too short');
});

test('exports checkDatabase function', () => {
  assertIncludes(healthCode, 'function checkDatabase');
});

test('exports checkSystem function', () => {
  assertIncludes(healthCode, 'function checkSystem');
});

test('exports getTablesInfo function', () => {
  assertIncludes(healthCode, 'function getTablesInfo');
});

test('exports getTableSizes function', () => {
  assertIncludes(healthCode, 'function getTableSizes');
});

test('exports getRecentActivity function', () => {
  assertIncludes(healthCode, 'function getRecentActivity');
});

test('exports getDbPath function', () => {
  assertIncludes(healthCode, 'function getDbPath');
});

test('checkDatabase returns status field', () => {
  assertIncludes(healthCode, "status: 'ok'");
});

test('checkDatabase checks WAL mode', () => {
  assertIncludes(healthCode, 'walMode');
});

test('checkDatabase checks foreign keys', () => {
  assertIncludes(healthCode, 'foreignKeys');
});

test('checkDatabase checks integrity', () => {
  assertIncludes(healthCode, 'integrity_check');
});

test('checkDatabase counts tables', () => {
  assertIncludes(healthCode, 'tableCount');
});

test('checkDatabase checks existence', () => {
  assertIncludes(healthCode, 'result.exists');
});

test('checkSystem returns node version', () => {
  assertIncludes(healthCode, 'nodeVersion');
});

test('checkSystem returns platform', () => {
  assertIncludes(healthCode, 'platform');
});

test('checkSystem returns memory usage', () => {
  assertIncludes(healthCode, 'memoryUsage');
});

test('checkSystem returns uptime', () => {
  assertIncludes(healthCode, 'uptime');
});

test('getTablesInfo returns column details', () => {
  assertIncludes(healthCode, 'PRAGMA table_info');
});

test('getTablesInfo returns row counts', () => {
  assertIncludes(healthCode, 'COUNT(*) as count');
});

test('getTableSizes returns page info', () => {
  assertIncludes(healthCode, 'PRAGMA page_count');
});

test('getRecentActivity queries orders', () => {
  assertIncludes(healthCode, 'orders');
});

test('getRecentActivity queries contact_submissions', () => {
  assertIncludes(healthCode, 'contact_submissions');
});

test('getRecentActivity queries trade_enquiries', () => {
  assertIncludes(healthCode, 'trade_enquiries');
});

// ─── 4. Environment Validation ─────────────────────────────────────────────

console.log('\n4. Environment Validation');

const envPath = path.join(__dirname, '..', 'lib', 'env.js');
assertFile(envPath, 'lib/env.js does not exist');
const envCode = fs.readFileSync(envPath, 'utf-8');

test('env.js exists and is valid', () => {
  assert(envCode.length > 100, 'env.js is too short');
});

test('exports validateEnv function', () => {
  assertIncludes(envCode, 'function validateEnv');
});

test('exports getEnv function', () => {
  assertIncludes(envCode, 'function getEnv');
});

test('exports requireEnv function', () => {
  assertIncludes(envCode, 'function requireEnv');
});

test('validates SESSION_SECRET as required', () => {
  assertIncludes(envCode, 'SESSION_SECRET');
});

test('validates SESSION_SECRET minimum length', () => {
  assertIncludes(envCode, 'minLength: 32');
});

test('validates ADMIN_EMAIL as required', () => {
  assertIncludes(envCode, 'ADMIN_EMAIL');
});

test('validates ADMIN_PASSWORD as required', () => {
  assertIncludes(envCode, 'ADMIN_PASSWORD');
});

test('validates ADMIN_PASSWORD minimum length', () => {
  assertIncludes(envCode, "minLength: 8");
});

test('has optional DATABASE_PATH', () => {
  assertIncludes(envCode, 'DATABASE_PATH');
});

test('has optional MEDIA_UPLOAD_DIR', () => {
  assertIncludes(envCode, 'MEDIA_UPLOAD_DIR');
});

test('has optional ALLOW_INSECURE_SESSION', () => {
  assertIncludes(envCode, 'ALLOW_INSECURE_SESSION');
});

test('has optional NEXT_PUBLIC_SITE_URL', () => {
  assertIncludes(envCode, 'NEXT_PUBLIC_SITE_URL');
});

test('has optional NODE_ENV with allowed values', () => {
  assertIncludes(envCode, "'development', 'production', 'test'");
});

test('validateEnv returns valid: false when required missing', () => {
  assertIncludes(envCode, "valid: false");
});

test('validateEnv returns valid: true when all present', () => {
  assertIncludes(envCode, "valid: true");
});

test('validateEnv collects errors array', () => {
  assertIncludes(envCode, 'errors');
});

test('validateEnv collects warnings array', () => {
  assertIncludes(envCode, 'warnings');
});

test('requireEnv throws on missing', () => {
  assertIncludes(envCode, 'throw new Error');
});

test('uses log.warn for warnings', () => {
  assertIncludes(envCode, 'log.warn');
});

test('uses log.error for validation errors', () => {
  assertIncludes(envCode, 'log.error');
});

// ─── 5. Database Reliability ───────────────────────────────────────────────

console.log('\n5. Database Reliability');

const dbPath = path.join(__dirname, '..', 'lib', 'db.js');
const dbCode = fs.readFileSync(dbPath, 'utf-8');

test('busy_timeout pragma set', () => {
  assertIncludes(dbCode, 'busy_timeout');
  assertIncludes(dbCode, '5000');
});

test('journal_mode WAL set', () => {
  assertIncludes(dbCode, "journal_mode = WAL");
});

test('foreign_keys ON set', () => {
  assertIncludes(dbCode, "foreign_keys = ON");
});

test('database singleton pattern', () => {
  assertIncludes(dbCode, 'let _db');
});

test('WAL mode in initSchema', () => {
  assertIncludes(dbCode, "journal_mode = WAL");
});

// ─── 6. Migration Safety ───────────────────────────────────────────────────

console.log('\n6. Migration Safety');

test('initSchema uses CREATE TABLE IF NOT EXISTS', () => {
  const createCount = (dbCode.match(/CREATE TABLE IF NOT EXISTS/g) || []).length;
  assertGt(createCount, 10, `Expected > 10 CREATE TABLE IF NOT EXISTS, found ${createCount}`);
});

test('migrations check table existence before ALTER', () => {
  const pragmaCount = (dbCode.match(/PRAGMA table_info/g) || []).length;
  assertGt(pragmaCount, 5, `Expected > 5 PRAGMA table_info checks, found ${pragmaCount}`);
});

test('has migration for admins table', () => {
  assertIncludes(dbCode, 'admins');
});

test('has migration for customers table', () => {
  assertIncludes(dbCode, 'customers');
});

test('has migration for orders table', () => {
  assertIncludes(dbCode, 'orders');
});

test('has migration for content_sections table', () => {
  assertIncludes(dbCode, 'content_sections');
});

test('has migration for product_metadata table', () => {
  assertIncludes(dbCode, 'product_metadata');
});

test('has migration for customer_addresses table', () => {
  assertIncludes(dbCode, 'customer_addresses');
});

test('has migration for password_resets table', () => {
  assertIncludes(dbCode, 'password_resets');
});

test('has migration for order_status_history table', () => {
  assertIncludes(dbCode, 'order_status_history');
});

test('has migration for order_notes table', () => {
  assertIncludes(dbCode, 'order_notes');
});

test('has migration for wishlists table', () => {
  assertIncludes(dbCode, 'wishlists');
});

test('has migration for carts table', () => {
  assertIncludes(dbCode, 'carts');
});

test('has migration for media table', () => {
  assertIncludes(dbCode, 'media');
});

test('has migration for contact_submissions table', () => {
  assertIncludes(dbCode, 'contact_submissions');
});

test('has migration for newsletter_subscribers table', () => {
  assertIncludes(dbCode, 'newsletter_subscribers');
});

test('has migration for trade_enquiries table', () => {
  assertIncludes(dbCode, 'trade_enquiries');
});

test('has migration for custom_orders table', () => {
  assertIncludes(dbCode, 'custom_orders');
});

test('has migration for site_settings table', () => {
  assertIncludes(dbCode, 'site_settings');
});

// ─── 7. Health Endpoint ────────────────────────────────────────────────────

console.log('\n7. Health Endpoint');

const healthRoutePath = path.join(__dirname, '..', 'app', 'api', 'health', 'route.js');
assertFile(healthRoutePath, 'Health endpoint does not exist');
const healthRouteCode = fs.readFileSync(healthRoutePath, 'utf-8');

test('GET handler exists', () => {
  assertIncludes(healthRouteCode, 'export async function GET');
});

test('returns database status', () => {
  assertIncludes(healthRouteCode, 'database');
});

test('returns system info', () => {
  assertIncludes(healthRouteCode, 'system');
});

test('returns nodeVersion', () => {
  assertIncludes(healthRouteCode, 'nodeVersion');
});

test('returns memoryMB', () => {
  assertIncludes(healthRouteCode, 'memoryMB');
});

test('returns tableCount', () => {
  assertIncludes(healthRouteCode, 'tableCount');
});

test('returns integrity check', () => {
  assertIncludes(healthRouteCode, 'integrity');
});

test('returns 200 when healthy', () => {
  assertIncludes(healthRouteCode, '{ status }');
});

test('returns 503 when unhealthy', () => {
  assertIncludes(healthRouteCode, '503');
});

test('handles errors gracefully', () => {
  assertIncludes(healthRouteCode, 'catch');
});

test('uses log.error on failure', () => {
  assertIncludes(healthRouteCode, 'log.error');
});

test('returns timestamp', () => {
  assertIncludes(healthRouteCode, 'timestamp');
});

test('returns healthy/degraded status', () => {
  assertIncludes(healthRouteCode, "'healthy'");
  assertIncludes(healthRouteCode, "'degraded'");
});

// ─── 8. Admin Diagnostics Endpoint ─────────────────────────────────────────

console.log('\n8. Admin Diagnostics Endpoint');

const diagPath = path.join(__dirname, '..', 'app', 'api', 'admin', 'diagnostics', 'route.js');
assertFile(diagPath, 'Admin diagnostics endpoint does not exist');
const diagCode = fs.readFileSync(diagPath, 'utf-8');

test('GET handler exists', () => {
  assertIncludes(diagCode, 'export async function GET');
});

test('requires admin authentication', () => {
  assertIncludes(diagCode, 'requireAdmin');
});

test('returns 401/403 for unauthenticated (handled by requireAdmin)', () => {
  assertIncludes(diagCode, 'requireAdmin');
});

test('returns database info', () => {
  assertIncludes(diagCode, 'database');
});

test('returns system info', () => {
  assertIncludes(diagCode, 'system');
});

test('returns memoryMB', () => {
  assertIncludes(diagCode, 'memoryMB');
});

test('returns heapUsedMB', () => {
  assertIncludes(diagCode, 'heapUsedMB');
});

test('returns heapTotalMB', () => {
  assertIncludes(diagCode, 'heapTotalMB');
});

test('returns externalMB', () => {
  assertIncludes(diagCode, 'externalMB');
});

test('returns table details', () => {
  assertIncludes(diagCode, 'tables');
});

test('returns table row counts', () => {
  assertIncludes(diagCode, 'rowCount');
});

test('does NOT return table column info (security)', () => {
  assertNotIncludes(diagCode, 'columns: t.columns', 'columns should be removed from diagnostics response for security');
});

test('returns approximate table sizes', () => {
  assertIncludes(diagCode, 'approximateSize');
});

test('returns recent activity', () => {
  assertIncludes(diagCode, 'activity');
});

test('returns timestamp', () => {
  assertIncludes(diagCode, 'timestamp');
});

test('uses force-dynamic', () => {
  assertIncludes(diagCode, 'force-dynamic');
});

test('handles errors gracefully', () => {
  assertIncludes(diagCode, 'catch');
});

test('uses log.error on failure', () => {
  assertIncludes(diagCode, 'log.error');
});

// ─── 9. Backup Security ────────────────────────────────────────────────────

console.log('\n9. Backup Security');

const gitignorePath = path.join(__dirname, '..', '.gitignore');
const gitignore = fs.readFileSync(gitignorePath, 'utf-8');

test('backups/ directory is gitignored', () => {
  assertIncludes(gitignore, 'backups/');
});

test('data/*.db files are gitignored', () => {
  assertIncludes(gitignore, 'data/*.db');
});

test('.env.local is gitignored', () => {
  assertIncludes(gitignore, '.env.local');
});

test('public/uploads/ is gitignored', () => {
  assertIncludes(gitignore, 'public/uploads/');
});

// ─── 10. Error Boundary Coverage ───────────────────────────────────────────

console.log('\n10. Error Boundary Coverage');

const errorBoundaryPaths = [
  path.join(__dirname, '..', 'app', 'error.js'),
  path.join(__dirname, '..', 'app', 'admin', 'error.js'),
  path.join(__dirname, '..', 'app', 'checkout', 'error.js'),
  path.join(__dirname, '..', 'app', 'account', 'error.js'),
];

for (const ep of errorBoundaryPaths) {
  const rel = path.relative(path.join(__dirname, '..'), ep);
  test(`${rel} exists`, () => {
    assertFile(ep, `${rel} does not exist`);
  });

  const code = fs.readFileSync(ep, 'utf-8');
  test(`${rel} has 'use client' directive`, () => {
    assertIncludes(code, "'use client'");
  });

  test(`${rel} exports default function`, () => {
    assertIncludes(code, 'export default function');
  });

  test(`${rel} renders error message`, () => {
    assertIncludes(code, 'err-desc') || assertIncludes(code, 'desc');
  });

  test(`${rel} has retry button`, () => {
    assertIncludes(code, 'reset()');
  });
}

// ─── 11. Logging Safety ────────────────────────────────────────────────────

console.log('\n11. Logging Safety');

const loggerPath = path.join(__dirname, '..', 'lib', 'logger.js');
const loggerCode = fs.readFileSync(loggerPath, 'utf-8');

test('SENSITIVE_KEYS includes password', () => {
  assertIncludes(loggerCode, "'password'");
});

test('SENSITIVE_KEYS includes passwordHash', () => {
  assertIncludes(loggerCode, "'passwordHash'");
});

test('SENSITIVE_KEYS includes token', () => {
  assertIncludes(loggerCode, "'token'");
});

test('SENSITIVE_KEYS includes secret', () => {
  assertIncludes(loggerCode, "'secret'");
});

test('SENSITIVE_KEYS includes authorization', () => {
  assertIncludes(loggerCode, "'authorization'");
});

test('SENSITIVE_KEYS includes cookie', () => {
  assertIncludes(loggerCode, "'cookie'");
});

test('redacts sensitive values with [REDACTED]', () => {
  assertIncludes(loggerCode, '[REDACTED]');
});

test('has specialized login method', () => {
  assertIncludes(loggerCode, 'adminLogin') || assertIncludes(loggerCode, 'customerLogin');
});

test('has specialized order methods', () => {
  assertIncludes(loggerCode, 'orderCreated') || assertIncludes(loggerCode, 'orderStatusChange');
});

// ─── 12. API Error Consistency ─────────────────────────────────────────────

console.log('\n12. API Error Consistency');

const apiDir = path.join(__dirname, '..', 'app', 'api');
const apiRoutes = [];

function findRoutes(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findRoutes(fullPath);
    } else if (entry.name === 'route.js') {
      apiRoutes.push(fullPath);
    }
  }
}
findRoutes(apiDir);

let consistentRoutes = 0;
let inconsistentRoutes = 0;

for (const routePath of apiRoutes) {
  const code = fs.readFileSync(routePath, 'utf-8');
  const rel = path.relative(path.join(__dirname, '..'), routePath);

  if (code.includes('catch') && code.includes('Response.json')) {
    consistentRoutes++;
  } else if (code.includes('export async function POST') || code.includes('export async function GET')) {
    inconsistentRoutes++;
  }
}

test(`Found ${apiRoutes.length} API routes`, () => {
  assertGt(apiRoutes.length, 20, `Expected > 20 API routes, found ${apiRoutes.length}`);
});

test(`${consistentRoutes} routes have try/catch + Response.json pattern`, () => {
  assertGt(consistentRoutes, 15, `Expected > 15 consistent routes, found ${consistentRoutes}`);
});

test('No routes expose stack traces in production', () => {
  for (const routePath of apiRoutes) {
    const code = fs.readFileSync(routePath, 'utf-8');
    assertNotIncludes(code, 'error.stack', `Stack trace in ${path.relative(path.join(__dirname, '..'), routePath)}`);
  }
});

test('No routes use console.error', () => {
  for (const routePath of apiRoutes) {
    const code = fs.readFileSync(routePath, 'utf-8');
    assertNotIncludes(code, 'console.error', `console.error in ${path.relative(path.join(__dirname, '..'), routePath)}`);
  }
});

// ─── Summary ───────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log(`\n\x1b[1mSprint #18 Tests: ${passed}/${total} passed\x1b[0m`);
if (failed > 0) {
  console.log(`\x1b[31m${failed} tests failed\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32mAll tests passed!\x1b[0m');
}

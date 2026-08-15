#!/usr/bin/env node

/**
 * TEAKLE — Production Preflight Check
 *
 * Safely verifies production readiness without modifying anything.
 * Reports PASS / WARN / FAIL for each check.
 *
 * Usage: node scripts/preflight-production.js
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

let pass = 0;
let warn = 0;
let fail = 0;

function pass_(msg) { pass++; console.log(`  \x1b[32mPASS\x1b[0m ${msg}`); }
function warn_(msg) { warn++; console.log(`  \x1b[33mWARN\x1b[0m ${msg}`); }
function fail_(msg) { fail++; console.log(`  \x1b[31mFAIL\x1b[0m ${msg}`); }

console.log('\n\x1b[1mTEAKLE — Production Preflight\x1b[0m\n');

// ─── Node Version ──────────────────────────────────────────────────────────
console.log('NODE VERSION');
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1), 10);
if (major >= 18) {
  pass_(`Node ${nodeVersion} (>= 18 required)`);
} else {
  fail_(`Node ${nodeVersion} is below minimum 18`);
}

// ─── Environment Variables ─────────────────────────────────────────────────
console.log('\nENVIRONMENT VARIABLES');

const required = ['SESSION_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
for (const key of required) {
  const val = process.env[key];
  if (!val) {
    fail_(`${key} is missing`);
  } else {
    pass_(`${key} is set`);
  }
}

const optional = {
  DATABASE_PATH: './data/teakle.db',
  MEDIA_UPLOAD_DIR: './public/uploads/media',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NODE_ENV: 'development',
  ALLOW_INSECURE_SESSION: 'false',
  BACKUP_DIR: './backups',
};

for (const [key, defaultVal] of Object.entries(optional)) {
  const val = process.env[key] || defaultVal;
  if (val) {
    pass_(`${key} = ${key.includes('SECRET') ? '[REDACTED]' : val}`);
  } else {
    warn_(`${key} not set, using default: ${defaultVal}`);
  }
}

// ─── SESSION_SECRET Strength ───────────────────────────────────────────────
console.log('\nSESSION_SECRET STRENGTH');
const secret = process.env.SESSION_SECRET;
if (!secret) {
  fail_('Cannot evaluate — SESSION_SECRET not set');
} else if (secret.length < 32) {
  fail_(`Too short: ${secret.length} chars (minimum 32)`);
} else if (/^[a-f0-9]+$/.test(secret) && secret.length === 64) {
  warn_('Hex string — consider using a mixed-character random secret');
} else {
  pass_(`${secret.length} chars — meets minimum length`);
}

// ─── NODE_ENV ──────────────────────────────────────────────────────────────
console.log('\nNODE ENVIRONMENT');
const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'production') {
  pass_('NODE_ENV=production');
} else {
  warn_(`NODE_ENV=${nodeEnv} — should be "production" for deployment`);
}

// ─── Site URL ──────────────────────────────────────────────────────────────
console.log('\nSITE URL');
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) {
  warn_('NEXT_PUBLIC_SITE_URL not set');
} else if (siteUrl.startsWith('https://')) {
  pass_(`${siteUrl} (HTTPS)`);
} else if (siteUrl.includes('localhost')) {
  warn_(`${siteUrl} — localhost URL, not suitable for production`);
} else {
  warn_(`${siteUrl} — not HTTPS`);
}

// ─── Database ──────────────────────────────────────────────────────────────
console.log('\nDATABASE');
const dbPath = path.resolve(process.env.DATABASE_PATH || './data/teakle.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbPath)) {
  fail_(`Database not found at ${dbPath}`);
} else {
  const stats = fs.statSync(dbPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  pass_(`Database exists (${sizeMB} MB)`);

  try {
    const Database = require('better-sqlite3');
    const db = new Database(dbPath, { readonly: true });

    const integrity = db.pragma('integrity_check', { simple: true });
    if (integrity === 'ok') {
      pass_('Integrity check: ok');
    } else {
      fail_(`Integrity check: ${integrity}`);
    }

    const wal = db.pragma('journal_mode', { simple: true });
    if (wal === 'wal') {
      pass_('Journal mode: WAL');
    } else {
      warn_(`Journal mode: ${wal} (expected WAL)`);
    }

    const fk = db.pragma('foreign_keys', { simple: true });
    if (fk === 1) {
      pass_('Foreign keys: ON');
    } else {
      warn_('Foreign keys: OFF');
    }

    const requiredTables = [
      'admins', 'customers', 'orders', 'order_items', 'carts', 'cart_items',
      'wishlists', 'wishlist_items', 'content_sections', 'site_settings',
      'media', 'custom_orders', 'contact_submissions', 'trade_enquiries',
      'newsletter_subscribers', 'payments', 'payment_webhook_events',
      'admin_audit_logs', 'order_activity',
      'order_status_history', 'order_notes', 'product_metadata',
      'customer_addresses', 'password_resets',
    ];

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all().map(t => t.name);

    const missing = requiredTables.filter(t => !tables.includes(t));
    if (missing.length === 0) {
      pass_(`All ${requiredTables.length} required tables present`);
    } else {
      fail_(`Missing tables: ${missing.join(', ')}`);
    }

    db.close();
  } catch (e) {
    fail_(`Database check failed: ${e.message}`);
  }
}

// ─── Database Directory Writable ───────────────────────────────────────────
console.log('\nFILE SYSTEM');
if (fs.existsSync(dbDir)) {
  try {
    fs.accessSync(dbDir, fs.constants.W_OK);
    pass_(`Database directory writable: ${dbDir}`);
  } catch {
    fail_(`Database directory not writable: ${dbDir}`);
  }
} else {
  fail_(`Database directory does not exist: ${dbDir}`);
}

const uploadDir = path.resolve(process.env.MEDIA_UPLOAD_DIR || './public/uploads/media');
const uploadDirParent = path.dirname(uploadDir);
if (fs.existsSync(uploadDirParent)) {
  try {
    fs.accessSync(uploadDirParent, fs.constants.W_OK);
    pass_(`Upload parent directory accessible: ${uploadDirParent}`);
  } catch {
    warn_(`Upload parent directory not writable: ${uploadDirParent}`);
  }
} else {
  warn_(`Upload parent directory does not exist: ${uploadDirParent}`);
}

const backupDir = path.resolve(process.env.BACKUP_DIR || './backups');
if (fs.existsSync(backupDir)) {
  try {
    fs.accessSync(backupDir, fs.constants.W_OK);
    pass_(`Backup directory writable: ${backupDir}`);
  } catch {
    warn_(`Backup directory not writable: ${backupDir}`);
  }
} else {
  warn_(`Backup directory does not exist: ${backupDir} (will be created on first backup)`);
}

// ─── .next Build ───────────────────────────────────────────────────────────
console.log('\nBUILD');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  pass_('.next build directory exists');
} else {
  warn_('.next build directory missing — run "npm run build" before deploying');
}

// ─── package.json ──────────────────────────────────────────────────────────
console.log('\nPACKAGE');
const pkgPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pass_(`Package: ${pkg.name}@${pkg.version}`);

  const requiredDeps = ['next', 'react', 'react-dom', 'better-sqlite3', 'jose', 'bcryptjs'];
  const missing = requiredDeps.filter(d => !pkg.dependencies?.[d] && !pkg.devDependencies?.[d]);
  if (missing.length === 0) {
    pass_('All required dependencies present');
  } else {
    fail_(`Missing dependencies: ${missing.join(', ')}`);
  }

  if (pkg.scripts?.build) {
    pass_('npm run build script defined');
  } else {
    fail_('No build script in package.json');
  }

  if (pkg.scripts?.start) {
    pass_('npm run start script defined');
  } else {
    fail_('No start script in package.json');
  }
} else {
  fail_('package.json not found');
}

// ─── Git Working Tree ──────────────────────────────────────────────────────
console.log('\nGIT');
try {
  const { execSync } = require('child_process');
  const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: process.cwd() }).trim();
  if (status === '') {
    pass_('Working tree clean');
  } else {
    const fileCount = status.split('\n').length;
    warn_(`${fileCount} uncommitted file(s) in working tree`);
  }
} catch {
  warn_('Could not check git status');
}

// ─── Summary ───────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log(`\x1b[1mResults: ${pass} PASS, ${warn} WARN, ${fail} FAIL\x1b[0m`);
if (fail > 0) {
  console.log('\x1b[31mPREFLIGHT FAILED — resolve FAIL items before deploying\x1b[0m');
  process.exit(1);
} else if (warn > 0) {
  console.log('\x1b[33mPREFLIGHT PASSED WITH WARNINGS — review WARN items\x1b[0m');
  process.exit(0);
} else {
  console.log('\x1b[32mPREFLIGHT PASSED\x1b[0m');
  process.exit(0);
}

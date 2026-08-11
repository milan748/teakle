#!/usr/bin/env node

/**
 * TEAKLE — Database Backup Utility
 *
 * Creates timestamped SQLite backups using SQLite's safe backup API.
 * Verifies backup integrity after creation.
 *
 * Usage:
 *   node scripts/backup-db.js                          # create backup
 *   node scripts/backup-db.js --verify <backup-path>   # verify existing backup
 *   node scripts/backup-db.js --list                   # list all backups
 *   node scripts/backup-db.js --restore <backup-path>  # restore from backup
 *   node scripts/backup-db.js --max-backups 10         # auto-prune old backups
 *
 * Environment variables:
 *   DATABASE_PATH  — Source database path (default: ./data/teakle.db)
 *   BACKUP_DIR     — Backup destination directory (default: ./backups)
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'teakle.db');
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');

function timestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function createBackup() {
  if (!fs.existsSync(DB_PATH)) {
    console.error('Error: Source database does not exist:', DB_PATH);
    process.exit(1);
  }

  ensureDir(BACKUP_DIR);

  const ts = timestamp();
  const backupName = `teakle_backup_${ts}.db`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  console.log('Creating backup...');
  console.log('  Source:', DB_PATH);

  const source = new Database(DB_PATH);

  try {
    await source.backup(backupPath);
    source.close();

    const stats = fs.statSync(backupPath);
    console.log(`  Complete: ${backupPath}`);
    console.log(`  Size:     ${(stats.size / 1024).toFixed(1)} KB`);

    verifyBackup(backupPath);
  } catch (e) {
    console.error('Backup failed:', e.message);
    try { fs.unlinkSync(backupPath); } catch (err) {}
    process.exit(1);
  }
}

function verifyBackup(backupPath) {
  console.log('\nVerifying backup integrity...');

  if (!fs.existsSync(backupPath)) {
    console.error('Error: Backup file does not exist:', backupPath);
    return false;
  }

  const stats = fs.statSync(backupPath);
  console.log(`  File size: ${(stats.size / 1024).toFixed(1)} KB`);

  try {
    const db = new Database(backupPath, { readonly: true });

    const integrity = db.pragma('integrity_check', { simple: true });
    if (integrity !== 'ok') {
      console.error('  Integrity check FAILED:', integrity);
      db.close();
      return false;
    }
    console.log('  Integrity check: OK');

    const foreignKeys = db.pragma('foreign_keys', { simple: true });
    console.log(`  Foreign keys: ${foreignKeys === 1 ? 'ON' : 'OFF'}`);

    const walMode = db.pragma('journal_mode', { simple: true });
    console.log(`  Journal mode: ${walMode}`);

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all();
    console.log(`  Tables: ${tables.length}`);
    tables.forEach(t => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get();
      console.log(`    ${t.name}: ${count.count} rows`);
    });

    db.close();
    console.log('  Verification: PASSED');
    return true;
  } catch (e) {
    console.error('  Verification FAILED:', e.message);
    return false;
  }
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('No backups directory found at:', BACKUP_DIR);
    return;
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db') && f.startsWith('teakle_backup_'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('No backups found in:', BACKUP_DIR);
    return;
  }

  console.log(`Found ${files.length} backup(s) in ${BACKUP_DIR}:\n`);

  for (const file of files) {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const date = stats.mtime.toLocaleString();
    console.log(`  ${file}`);
    console.log(`    Date: ${date}  Size: ${(stats.size / 1024).toFixed(1)} KB`);
  }
}

function restoreBackup(backupPath) {
  if (!fs.existsSync(backupPath)) {
    console.error('Error: Backup file does not exist:', backupPath);
    process.exit(1);
  }

  console.log('Restoring from backup...');
  console.log('  Backup:', backupPath);
  console.log('  Target:', DB_PATH);

  const ts = timestamp();
  const preRestorePath = path.join(BACKUP_DIR, `teakle_pre_restore_${ts}.db`);

  ensureDir(BACKUP_DIR);

  if (fs.existsSync(DB_PATH)) {
    console.log('  Creating pre-restore backup...');
    fs.copyFileSync(DB_PATH, preRestorePath);
    const stats = fs.statSync(preRestorePath);
    console.log(`  Pre-restore backup: ${preRestorePath} (${(stats.size / 1024).toFixed(1)} KB)`);
  }

  try {
    const source = new Database(backupPath, { readonly: true });
    const dest = new Database(DB_PATH);

    try {
      dest.exec('VACUUM INTO ?');
    } catch (e) {}

    source.close();
    dest.close();

    fs.copyFileSync(backupPath, DB_PATH);

    const walPath = DB_PATH + '-wal';
    const shmPath = DB_PATH + '-shm';
    const backupWalPath = backupPath + '-wal';
    const backupShmPath = backupPath + '-shm';

    if (fs.existsSync(backupWalPath)) {
      fs.copyFileSync(backupWalPath, walPath);
    } else if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }

    if (fs.existsSync(backupShmPath)) {
      fs.copyFileSync(backupShmPath, shmPath);
    } else if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath);
    }

    console.log('  Restore complete');

    verifyBackup(DB_PATH);
  } catch (e) {
    console.error('  Restore FAILED:', e.message);
    if (fs.existsSync(preRestorePath)) {
      console.log('  Restoring pre-restore backup...');
      fs.copyFileSync(preRestorePath, DB_PATH);
    }
    process.exit(1);
  }
}

function pruneOldBackups(maxBackups) {
  if (!fs.existsSync(BACKUP_DIR)) return;

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db') && f.startsWith('teakle_backup_'))
    .sort()
    .reverse();

  if (files.length <= maxBackups) return;

  const toDelete = files.slice(maxBackups);
  for (const file of toDelete) {
    const filePath = path.join(BACKUP_DIR, file);
    try {
      fs.unlinkSync(filePath);
      const walPath = filePath + '-wal';
      const shmPath = filePath + '-shm';
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
    } catch (e) {}
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    listBackups();
    return;
  }

  if (args.includes('--verify')) {
    const idx = args.indexOf('--verify');
    const verifyPath = args[idx + 1];
    if (!verifyPath) {
      console.error('Error: --verify requires a backup path');
      process.exit(1);
    }
    const success = verifyBackup(verifyPath);
    process.exit(success ? 0 : 1);
  }

  if (args.includes('--restore')) {
    const idx = args.indexOf('--restore');
    const restorePath = args[idx + 1];
    if (!restorePath) {
      console.error('Error: --restore requires a backup path');
      process.exit(1);
    }
    restoreBackup(restorePath);
    return;
  }

  createBackup();

  const maxIdx = args.indexOf('--max-backups');
  if (maxIdx !== -1) {
    const max = parseInt(args[maxIdx + 1], 10);
    if (max > 0) {
      pruneOldBackups(max);
    }
  }
}

module.exports = { createBackup, verifyBackup, listBackups, restoreBackup, pruneOldBackups };

if (require.main === module) {
  main();
}

/**
 * TEAKLE — Admin Initialization Script
 *
 * Creates the initial admin account in the SQLite database.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@teakle.in ADMIN_PASSWORD=yourpassword node scripts/init-admin.js
 *
 * Environment variables:
 *   ADMIN_EMAIL    — Admin email address (required)
 *   ADMIN_PASSWORD — Admin password (required, min 8 characters)
 *   DATABASE_PATH  — Database file path (optional, defaults to ./data/teakle.db)
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'teakle.db');

function main() {
  if (!ADMIN_EMAIL) {
    console.error('Error: ADMIN_EMAIL environment variable is required');
    process.exit(1);
  }

  if (!ADMIN_PASSWORD) {
    console.error('Error: ADMIN_PASSWORD environment variable is required');
    process.exit(1);
  }

  if (ADMIN_PASSWORD.length < 8) {
    console.error('Error: ADMIN_PASSWORD must be at least 8 characters');
    process.exit(1);
  }

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(ADMIN_EMAIL.toLowerCase());

  if (existing) {
    console.log('Admin account ' + ADMIN_EMAIL + ' already exists (ID: ' + existing.id + ')');
    db.close();
    process.exit(0);
  }

  const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);

  const result = db.prepare('INSERT INTO admins (email, passwordHash, role) VALUES (?, ?, ?)').run(
    ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    'admin'
  );

  console.log('Admin account created successfully:');
  console.log('  ID:    ' + result.lastInsertRowid);
  console.log('  Email: ' + ADMIN_EMAIL.toLowerCase());
  console.log('  Role:  admin');

  db.close();
}

main();

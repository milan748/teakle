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
  `);

  migrateDraftColumns(db);
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

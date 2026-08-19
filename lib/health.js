const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { getEnv } = require('./env');
const { log } = require('./logger');

function getDbPath() {
  const env = getEnv();
  return path.resolve(env.DATABASE_PATH);
}

function checkDatabase() {
  const dbPath = getDbPath();
  const result = {
    status: 'ok',
    path: dbPath,
    exists: false,
    size: null,
    lastModified: null,
    walMode: null,
    foreignKeys: null,
    tableCount: 0,
    tables: [],
    error: null,
    integrity: null,
    uptime: null,
  };

  try {
    if (!fs.existsSync(dbPath)) {
      result.status = 'error';
      result.error = 'Database file does not exist';
      return result;
    }

    result.exists = true;
    const stats = fs.statSync(dbPath);
    result.size = stats.size;
    result.lastModified = stats.mtime.toISOString();

    const db = new Database(dbPath, { readonly: true });

    try {
      const wal = db.pragma('journal_mode', { simple: true });
      result.walMode = wal === 'wal';
    } catch (e) {
      result.walMode = null;
    }

    try {
      const fk = db.pragma('foreign_keys', { simple: true });
      result.foreignKeys = fk === 1;
    } catch (e) {
      result.foreignKeys = null;
    }

    try {
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      ).all();
      result.tableCount = tables.length;
      result.tables = tables.map(t => t.name);
    } catch (e) {
      result.tableCount = -1;
    }

    try {
      const integrity = db.pragma('integrity_check', { simple: true });
      result.integrity = integrity === 'ok' ? 'ok' : integrity;
    } catch (e) {
      result.integrity = 'check_failed';
    }

    const up = db.prepare("SELECT (julianday('now') - julianday(createdAt)) as days FROM admins LIMIT 1").get();
    result.uptime = up ? up.days : null;
  } catch (e) {
    result.status = 'error';
    result.error = e.message;
  }

  return result;
}

function checkSystem() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    pid: process.pid,
  };
}

function getTablesInfo() {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) return [];

  const db = new Database(dbPath, { readonly: true });
  try {
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all();

    return tables.map(t => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get();
      const info = db.prepare(`PRAGMA table_info("${t.name}")`).all();
      return {
        name: t.name,
        rowCount: count.count,
        columns: info.map(c => ({
          name: c.name,
          type: c.type,
          notnull: c.notnull === 1,
          pk: c.pk === 1,
          default: c.dflt_value,
        })),
      };
    });
  } catch (e) {
    return [];
  } finally {
    db.close();
  }
}

function getTableSizes() {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) return [];

  const db = new Database(dbPath, { readonly: true });
  try {
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all();

    return tables.map(t => {
      try {
        const info = db.prepare(`PRAGMA page_count('${t.name}')`).get();
        const page_size = db.prepare('PRAGMA page_size').get();
        return {
          name: t.name,
          pages: info ? info.page_count : null,
          size: info && page_size ? info.page_count * page_size.page_size : null,
        };
      } catch (e) {
        return { name: t.name, pages: null, size: null };
      }
    });
  } finally {
    db.close();
  }
}

function getRecentActivity() {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) return { recentOrders: [], recentContacts: [], recentTradeEnquiries: [] };

  const db = new Database(dbPath, { readonly: true });
  try {
    const recentOrders = db.prepare(
      "SELECT id, status, createdAt FROM orders ORDER BY createdAt DESC LIMIT 5"
    ).all();
    const recentContacts = db.prepare(
      "SELECT id, createdAt FROM contact_submissions ORDER BY createdAt DESC LIMIT 5"
    ).all();
    const recentTradeEnquiries = db.prepare(
      "SELECT id, createdAt FROM trade_enquiries ORDER BY createdAt DESC LIMIT 5"
    ).all();

    return { recentOrders, recentContacts, recentTradeEnquiries };
  } catch (e) {
    return { recentOrders: [], recentContacts: [], recentTradeEnquiries: [] };
  } finally {
    db.close();
  }
}

module.exports = {
  getDbPath,
  checkDatabase,
  checkSystem,
  getTablesInfo,
  getTableSizes,
  getRecentActivity,
};

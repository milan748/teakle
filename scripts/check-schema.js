const D = require('better-sqlite3');
const db = new D('./data/teakle.db', { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log(tables.map(t => t.name).join('\n'));
console.log('---');
for (const t of ['admin_audit_logs', 'order_activity']) {
  try {
    console.log('=== ' + t + ' ===');
    const cols = db.prepare('PRAGMA table_info(' + t + ')').all();
    console.log(cols.map(c => '  ' + c.name + ' ' + c.type + (c.dflt ? ' DEFAULT ' + c.dflt : '')).join('\n'));
    const idxs = db.prepare('PRAGMA index_list(' + t + ')').all();
    if (idxs.length) {
      console.log('  INDEXES:');
      idxs.forEach(i => {
        const info = db.prepare('PRAGMA index_info(' + i.name + ')').all();
        console.log('    ' + i.name + ' (' + info.map(c => c.name).join(', ') + ')');
      });
    }
  } catch (e) {
    console.log(t + ': NOT FOUND - ' + e.message);
  }
}
db.close();

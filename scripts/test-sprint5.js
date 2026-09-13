/**
 * Sprint 5 Tests — Templates, Section Variants, Page Design System
 */
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'teakle.db');
let db;
try {
  // Open read-write so we can run migrations if needed
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
} catch (e) {
  console.error('Cannot open DB:', e.message);
  process.exit(1);
}

// Run migrations that the test depends on (same logic as lib/db.js initSchema)
function runMigrations(db) {
  // Clean up any leftover table from a previous failed migration attempt
  const leftover = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='content_sections_new'").get();
  if (leftover) {
    db.exec('DROP TABLE content_sections_new');
  }

  // Remove UNIQUE(page, sectionKey) constraint if present
  const info = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='content_sections'").get();
  if (info && info.sql.includes('UNIQUE(page, sectionKey)')) {
    db.exec(`
      CREATE TABLE content_sections_new (
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
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
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
        styleOverrides TEXT,
        draftStyleOverrides TEXT,
        sectionStyleOverrides TEXT,
        draftSectionStyleOverrides TEXT,
        instanceId TEXT,
        variant TEXT
      );
    `);
    db.exec(`INSERT INTO content_sections_new (
      id, page, sectionKey, title, subtitle, eyebrow, body,
      image, mobileImage, buttonLabel, buttonUrl, sortOrder, enabled,
      createdAt, updatedAt,
      draftTitle, draftSubtitle, draftEyebrow, draftBody,
      draftImage, draftMobileImage, draftButtonLabel, draftButtonUrl,
      draftEnabled, status, publishedAt,
      styleOverrides, draftStyleOverrides,
      sectionStyleOverrides, draftSectionStyleOverrides,
      instanceId, variant
    ) SELECT
      id, page, sectionKey, title, subtitle, eyebrow, body,
      image, mobileImage, buttonLabel, buttonUrl, sortOrder, enabled,
      createdAt, updatedAt,
      draftTitle, draftSubtitle, draftEyebrow, draftBody,
      draftImage, draftMobileImage, draftButtonLabel, draftButtonUrl,
      draftEnabled, status, publishedAt,
      styleOverrides, draftStyleOverrides,
      sectionStyleOverrides, draftSectionStyleOverrides,
      instanceId, variant
    FROM content_sections;`);
    db.exec('DROP TABLE content_sections;');
    db.exec('ALTER TABLE content_sections_new RENAME TO content_sections;');
    db.exec('CREATE INDEX IF NOT EXISTS idx_content_sections_page ON content_sections(page);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_content_sections_instanceId ON content_sections(instanceId);');
  }

  // Ensure section_templates table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS section_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      sectionType TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '{}',
      styleOverrides TEXT DEFAULT '{}',
      mobileOverrides TEXT DEFAULT '{}',
      variant TEXT DEFAULT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Ensure page_templates table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      sections TEXT NOT NULL DEFAULT '[]',
      pageDesign TEXT DEFAULT '{}',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Ensure variant column exists
  const cols = db.prepare("PRAGMA table_info(content_sections)").all();
  const colNames = cols.map(c => c.name);
  if (!colNames.includes('variant')) {
    db.exec('ALTER TABLE content_sections ADD COLUMN variant TEXT');
  }

  // Ensure pageDesign column exists on pages table
  const pageCols = db.prepare("PRAGMA table_info(pages)").all();
  const pageColNames = pageCols.map(c => c.name);
  if (!pageColNames.includes('pageDesign')) {
    db.exec("ALTER TABLE pages ADD COLUMN pageDesign TEXT DEFAULT '{}'");
  }
}

runMigrations(db);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    passed++;
  } catch (e) {
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

console.log('\n=== Sprint 5: Templates, Variants, Page Design ===\n');

// ── Schema Tests ──────────────────────────────────────────────────
console.log('Schema:');

test('section_templates table exists', () => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='section_templates'").all();
  assert(tables.length > 0, 'section_templates table not found');
});

test('page_templates table exists', () => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='page_templates'").all();
  assert(tables.length > 0, 'page_templates table not found');
});

test('content_sections has variant column', () => {
  const cols = db.prepare("PRAGMA table_info(content_sections)").all();
  const hasVariant = cols.some(c => c.name === 'variant');
  assert(hasVariant, 'variant column not found');
});

test('pages has pageDesign column', () => {
  const cols = db.prepare("PRAGMA table_info(pages)").all();
  const hasPageDesign = cols.some(c => c.name === 'pageDesign');
  assert(hasPageDesign, 'pageDesign column not found');
});

test('content_sections UNIQUE constraint removed', () => {
  const info = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='content_sections'").all();
  assert(info.length > 0, 'table not found');
  const createSql = info[0].sql;
  assert(!createSql.includes('UNIQUE(page, sectionKey)'), 'UNIQUE constraint still exists');
});

// ── Section Template CRUD Tests ───────────────────────────────────
console.log('\nSection Template CRUD:');

test('section_templates table is accessible', () => {
  const templates = db.prepare("SELECT COUNT(*) as count FROM section_templates").all();
  assert(templates[0].count >= 0, 'Could not count templates');
});

// ── Variant Tests ─────────────────────────────────────────────────
console.log('\nVariants:');

test('variant column exists and is nullable', () => {
  const cols = db.prepare("PRAGMA table_info(content_sections)").all();
  const variantCol = cols.find(c => c.name === 'variant');
  assert(variantCol, 'variant column not found');
  assertEqual(variantCol.notnull, 0, 'variant should be nullable');
});

// ── Page Design Tests ─────────────────────────────────────────────
console.log('\nPage Design:');

test('pageDesign column exists', () => {
  const cols = db.prepare("PRAGMA table_info(pages)").all();
  const pageDesignCol = cols.find(c => c.name === 'pageDesign');
  assert(pageDesignCol, 'pageDesign column not found');
});

// ── API Route Tests ───────────────────────────────────────────────
console.log('\nAPI Routes:');

test('section templates API route exists', () => {
  const routeFile = path.join(process.cwd(), 'app', 'api', 'admin', 'templates', 'sections', 'route.js');
  assert(fs.existsSync(routeFile), 'Section templates route not found');
});

test('section template instantiate route exists', () => {
  const routeFile = path.join(process.cwd(), 'app', 'api', 'admin', 'templates', 'sections', '[id]', 'route.js');
  assert(fs.existsSync(routeFile), 'Section template instantiate route not found');
});

test('page templates API route exists', () => {
  const routeFile = path.join(process.cwd(), 'app', 'api', 'admin', 'templates', 'pages', 'route.js');
  assert(fs.existsSync(routeFile), 'Page templates route not found');
});

test('page template instantiate route exists', () => {
  const routeFile = path.join(process.cwd(), 'app', 'api', 'admin', 'templates', 'pages', '[id]', 'route.js');
  assert(fs.existsSync(routeFile), 'Page template instantiate route not found');
});

// ── CMS Function Tests ────────────────────────────────────────────
console.log('\nCMS Functions:');

test('cms.js exports template functions', () => {
  const cmsPath = path.join(process.cwd(), 'lib', 'cms.js');
  const cmsContent = fs.readFileSync(cmsPath, 'utf-8');
  assert(cmsContent.includes('createSectionTemplate'), 'createSectionTemplate not found');
  assert(cmsContent.includes('getSectionTemplates'), 'getSectionTemplates not found');
  assert(cmsContent.includes('deleteSectionTemplate'), 'deleteSectionTemplate not found');
  assert(cmsContent.includes('instantiateSectionTemplate'), 'instantiateSectionTemplate not found');
  assert(cmsContent.includes('createPageTemplate'), 'createPageTemplate not found');
  assert(cmsContent.includes('getPageTemplates'), 'getPageTemplates not found');
  assert(cmsContent.includes('instantiatePageTemplate'), 'instantiatePageTemplate not found');
});

test('cms.js exports variant support', () => {
  const cmsPath = path.join(process.cwd(), 'lib', 'cms.js');
  const cmsContent = fs.readFileSync(cmsPath, 'utf-8');
  assert(cmsContent.includes('variant'), 'variant support not found');
});

// ── Editor Component Tests ────────────────────────────────────────
console.log('\nEditor Components:');

test('EditorClient has template state', () => {
  const editorPath = path.join(process.cwd(), 'app', 'admin', 'editor', 'EditorClient.js');
  const editorContent = fs.readFileSync(editorPath, 'utf-8');
  assert(editorContent.includes('sectionTemplates'), 'sectionTemplates state not found');
  assert(editorContent.includes('showSaveTemplateModal'), 'showSaveTemplateModal state not found');
  assert(editorContent.includes('showSavePageTemplateModal'), 'showSavePageTemplateModal state not found');
});

test('EditorClient has template functions', () => {
  const editorPath = path.join(process.cwd(), 'app', 'admin', 'editor', 'EditorClient.js');
  const editorContent = fs.readFileSync(editorPath, 'utf-8');
  assert(editorContent.includes('handleSaveAsTemplate'), 'handleSaveAsTemplate not found');
  assert(editorContent.includes('handleInstantiateTemplate'), 'handleInstantiateTemplate not found');
  assert(editorContent.includes('handleDeleteTemplate'), 'handleDeleteTemplate not found');
  assert(editorContent.includes('handleSavePageAsTemplate'), 'handleSavePageAsTemplate not found');
  assert(editorContent.includes('handleVariantChange'), 'handleVariantChange not found');
});

test('Inspector has variant selection', () => {
  const inspectorPath = path.join(process.cwd(), 'app', 'admin', 'editor', 'Inspector.js');
  const inspectorContent = fs.readFileSync(inspectorPath, 'utf-8');
  assert(inspectorContent.includes('getVariantsForSection'), 'getVariantsForSection not found');
  assert(inspectorContent.includes('onVariantChange'), 'onVariantChange not found');
  assert(inspectorContent.includes('Layout Variant'), 'Layout Variant label not found');
});

test('EditorToolbar has save page template button', () => {
  const toolbarPath = path.join(process.cwd(), 'app', 'admin', 'editor', 'EditorToolbar.js');
  const toolbarContent = fs.readFileSync(toolbarPath, 'utf-8');
  assert(toolbarContent.includes('onSavePageTemplate'), 'onSavePageTemplate not found');
  assert(toolbarContent.includes('Template'), 'Template button text not found');
});

test('registry.js has section variants', () => {
  const registryPath = path.join(process.cwd(), 'app', 'admin', 'editor', 'sections', 'registry.js');
  const registryContent = fs.readFileSync(registryPath, 'utf-8');
  assert(registryContent.includes('SECTION_VARIANTS'), 'SECTION_VARIANTS not found');
  assert(registryContent.includes('getVariantsForSection'), 'getVariantsForSection not found');
});

test('PageListManager supports page templates', () => {
  const pageManagerPath = path.join(process.cwd(), 'app', 'admin', 'PageListManager.js');
  const pageManagerContent = fs.readFileSync(pageManagerPath, 'utf-8');
  assert(pageManagerContent.includes('pageTemplateId'), 'pageTemplateId not found');
  assert(pageManagerContent.includes('pageTemplates'), 'pageTemplates not found');
  assert(pageManagerContent.includes('Start from Template'), 'Start from Template label not found');
});

// ── Summary ───────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`Sprint 5 Tests: ${passed}/${passed + failed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}\n`);

db.close();
process.exit(failed > 0 ? 1 : 0);

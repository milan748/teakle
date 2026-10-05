import { getDb } from './db';

// Built-in section types (can be extended by templates)
const BUILTIN_SECTIONS = [
  'hero', 'philosophy', 'signature', 'craftsmanship',
  'workshop-story', 'process-story',
  'origin', 'gallery',
  'introduction',
  'featured-intro',
  // Sprint 7: CMS-backed page composition sections
  'trust-bar', 'collection-carousel', 'product-grid', 'materials',
];

// Keep backward compatibility
const VALID_SECTIONS = BUILTIN_SECTIONS;

export const VALID_PAGES = [
  'home', 'studio', 'contact', 'trade', 'custom', 'journal', 'archive',
  // Sprint 7: Shop/process CMS editorial sections deferred —
  // requires per-product page keys (e.g. 'shop/anchor-table') which
  // is beyond this sprint's scope. Product data stays in products.js.
];

// Check if a section type is valid (built-in or exists in registry)
export function isValidSectionType(sectionType) {
  return BUILTIN_SECTIONS.includes(sectionType);
}

// ── Public (published content only) ──────────────────────────────

export function getPublishedPageSections(page) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM content_sections WHERE page = ? ORDER BY sortOrder ASC'
  ).all(page);
}

export function getPublishedSection(page, sectionKey) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM content_sections WHERE page = ? AND sectionKey = ?'
  ).get(page, sectionKey);
}

// ── Admin (draft + published) ────────────────────────────────────

export function getPageSections(page) {
  return getPublishedPageSections(page);
}

export function getSection(page, sectionKey) {
  return getPublishedSection(page, sectionKey);
}

export function getDraftPageSections(page) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM content_sections WHERE page = ? ORDER BY sortOrder ASC'
  ).all(page);
}

export function getDraftSection(page, sectionKey) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM content_sections WHERE page = ? AND sectionKey = ?'
  ).get(page, sectionKey);
}

// ── Save Draft ───────────────────────────────────────────────────

export function saveDraftSection(page, sectionKey, data, instanceId) {
  const db = getDb();
  const lookup = instanceId
    ? db.prepare('SELECT * FROM content_sections WHERE page = ? AND instanceId = ?').get(page, instanceId)
    : getSection(page, sectionKey);
  const existing = lookup;

  if (existing) {
    db.prepare(`
      UPDATE content_sections
      SET draftTitle = ?, draftSubtitle = ?, draftEyebrow = ?, draftBody = ?,
          draftImage = ?, draftMobileImage = ?, draftButtonLabel = ?, draftButtonUrl = ?,
          draftEnabled = ?, draftStyleOverrides = ?, draftSectionStyleOverrides = ?,
          variant = ?,
          status = 'draft', updatedAt = datetime('now')
      WHERE page = ? AND instanceId = ?
    `).run(
      data.title !== undefined ? data.title : existing.draftTitle ?? existing.title,
      data.subtitle !== undefined ? data.subtitle : existing.draftSubtitle ?? existing.subtitle,
      data.eyebrow !== undefined ? data.eyebrow : existing.draftEyebrow ?? existing.eyebrow,
      data.body !== undefined ? data.body : existing.draftBody ?? existing.body,
      data.image !== undefined ? data.image : existing.draftImage ?? existing.image,
      data.mobileImage !== undefined ? data.mobileImage : existing.draftMobileImage ?? existing.mobileImage,
      data.buttonLabel !== undefined ? data.buttonLabel : existing.draftButtonLabel ?? existing.buttonLabel,
      data.buttonUrl !== undefined ? data.buttonUrl : existing.draftButtonUrl ?? existing.buttonUrl,
      data.enabled !== undefined ? (data.enabled ? 1 : 0) : existing.draftEnabled ?? existing.enabled,
      data.styleOverrides !== undefined ? JSON.stringify(data.styleOverrides) : existing.draftStyleOverrides ?? existing.styleOverrides,
      data.sectionStyleOverrides !== undefined ? JSON.stringify(data.sectionStyleOverrides) : existing.draftSectionStyleOverrides ?? existing.sectionStyleOverrides,
      data.variant !== undefined ? data.variant : existing.variant,
      page,
      existing.instanceId || instanceId
    );
  } else {
    db.prepare(`
      INSERT INTO content_sections (page, sectionKey, instanceId, variant, title, subtitle, eyebrow, body,
        image, mobileImage, buttonLabel, buttonUrl, sortOrder, enabled,
        draftTitle, draftSubtitle, draftEyebrow, draftBody,
        draftImage, draftMobileImage, draftButtonLabel, draftButtonUrl,
        draftEnabled, styleOverrides, draftStyleOverrides,
        sectionStyleOverrides, draftSectionStyleOverrides, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      page,
      sectionKey,
      instanceId || null,
      data.variant || null,
      data.title || null,
      data.subtitle || null,
      data.eyebrow || null,
      data.body || null,
      data.image || null,
      data.mobileImage || null,
      data.buttonLabel || null,
      data.buttonUrl || null,
      data.sortOrder || 0,
      data.enabled !== undefined ? (data.enabled ? 1 : 0) : 1,
      data.title || null,
      data.subtitle || null,
      data.eyebrow || null,
      data.body || null,
      data.image || null,
      data.mobileImage || null,
      data.buttonLabel || null,
      data.buttonUrl || null,
      data.enabled !== undefined ? (data.enabled ? 1 : 0) : 1,
      data.styleOverrides ? JSON.stringify(data.styleOverrides) : null,
      data.styleOverrides ? JSON.stringify(data.styleOverrides) : null,
      data.sectionStyleOverrides ? JSON.stringify(data.sectionStyleOverrides) : null,
      data.sectionStyleOverrides ? JSON.stringify(data.sectionStyleOverrides) : null,
    );
  }

  const lookupId = existing ? (existing.instanceId || instanceId) : instanceId;
  if (lookupId) {
    return db.prepare('SELECT * FROM content_sections WHERE instanceId = ?').get(lookupId);
  }
  return getSection(page, sectionKey);
}

// ── Publish ──────────────────────────────────────────────────────

export function publishSection(page, sectionKey) {
  const db = getDb();
  const existing = getSection(page, sectionKey);
  if (!existing) return null;

  const hasDraft = existing.status === 'draft' && (
    existing.draftTitle !== null || existing.draftSubtitle !== null ||
    existing.draftEyebrow !== null || existing.draftBody !== null ||
    existing.draftImage !== null || existing.draftMobileImage !== null ||
    existing.draftButtonLabel !== null || existing.draftButtonUrl !== null ||
    existing.draftEnabled !== null || existing.draftStyleOverrides !== null ||
    existing.draftSectionStyleOverrides !== null
  );

  if (hasDraft || existing.draftEnabled !== null || existing.draftBody !== null) {
    db.prepare(`
      UPDATE content_sections
      SET title = COALESCE(draftTitle, title),
          subtitle = COALESCE(draftSubtitle, subtitle),
          eyebrow = COALESCE(draftEyebrow, eyebrow),
          body = COALESCE(draftBody, body),
          image = COALESCE(draftImage, image),
          mobileImage = COALESCE(draftMobileImage, mobileImage),
          buttonLabel = COALESCE(draftButtonLabel, buttonLabel),
          buttonUrl = COALESCE(draftButtonUrl, buttonUrl),
          enabled = CASE WHEN draftEnabled IS NOT NULL THEN draftEnabled ELSE enabled END,
          styleOverrides = COALESCE(draftStyleOverrides, styleOverrides),
          sectionStyleOverrides = COALESCE(draftSectionStyleOverrides, sectionStyleOverrides),
          draftTitle = NULL, draftSubtitle = NULL, draftEyebrow = NULL, draftBody = NULL,
          draftImage = NULL, draftMobileImage = NULL,
          draftButtonLabel = NULL, draftButtonUrl = NULL,
          draftEnabled = NULL,
          draftStyleOverrides = NULL,
          draftSectionStyleOverrides = NULL,
          status = 'published',
          publishedAt = datetime('now'),
          updatedAt = datetime('now')
      WHERE page = ? AND sectionKey = ?
    `).run(page, sectionKey);
  }

  return getSection(page, sectionKey);
}

// ── Discard Draft ────────────────────────────────────────────────

export function discardDraft(page, sectionKey) {
  const db = getDb();
  const existing = getSection(page, sectionKey);
  if (!existing) return null;

  db.prepare(`
    UPDATE content_sections
    SET draftTitle = NULL, draftSubtitle = NULL, draftEyebrow = NULL, draftBody = NULL,
        draftImage = NULL, draftMobileImage = NULL,
        draftButtonLabel = NULL, draftButtonUrl = NULL,
        draftEnabled = NULL,
        draftStyleOverrides = NULL,
        draftSectionStyleOverrides = NULL,
        status = 'published',
        updatedAt = datetime('now')
    WHERE page = ? AND sectionKey = ?
  `).run(page, sectionKey);

  return getSection(page, sectionKey);
}

// ── Legacy upsert (kept for backward compat, now saves draft) ────

export function upsertSection(page, sectionKey, data) {
  return saveDraftSection(page, sectionKey, data);
}

// ── Site Settings ────────────────────────────────────────────────

export function getSiteSetting(key) {
  const db = getDb();
  const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

export function getSiteSettings() {
  const db = getDb();
  return db.prepare('SELECT * FROM site_settings').all();
}

export function updateSiteSetting(key, value) {
  const db = getDb();
  db.prepare(`
    INSERT INTO site_settings (key, value, updatedAt)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = ?, updatedAt = datetime('now')
  `).run(key, value, value);
  return getSiteSetting(key);
}

// ── Section Management (add/delete/duplicate/reorder) ─────────────

export function addSection(page, sectionKey, instanceId, sortOrder = 0) {
  if (!VALID_SECTIONS.includes(sectionKey)) {
    throw new Error('Invalid section type: ' + sectionKey);
  }
  if (!VALID_PAGES.includes(page)) {
    throw new Error('Invalid page: ' + page);
  }
  const db = getDb();
  db.prepare(`
    INSERT INTO content_sections (page, sectionKey, instanceId, sortOrder, enabled, status)
    VALUES (?, ?, ?, ?, 1, 'published')
  `).run(page, sectionKey, instanceId, sortOrder);
  return db.prepare(
    'SELECT * FROM content_sections WHERE instanceId = ?'
  ).get(instanceId);
}

export function deleteSection(page, instanceId) {
  const db = getDb();
  const section = db.prepare(
    'SELECT * FROM content_sections WHERE page = ? AND instanceId = ?'
  ).get(page, instanceId);
  if (!section) return null;
  db.prepare(
    'DELETE FROM content_sections WHERE page = ? AND instanceId = ?'
  ).run(page, instanceId);
  return section;
}

export function duplicateSection(page, instanceId, newInstanceId) {
  const db = getDb();
  const src = db.prepare(
    'SELECT * FROM content_sections WHERE page = ? AND instanceId = ?'
  ).get(page, instanceId);
  if (!src) return null;

  db.prepare(`
    INSERT INTO content_sections (
      page, sectionKey, instanceId, title, subtitle, eyebrow, body,
      image, mobileImage, buttonLabel, buttonUrl, sortOrder, enabled,
      draftTitle, draftSubtitle, draftEyebrow, draftBody,
      draftImage, draftMobileImage, draftButtonLabel, draftButtonUrl,
      draftEnabled, styleOverrides, draftStyleOverrides,
      sectionStyleOverrides, draftSectionStyleOverrides, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    page, src.sectionKey, newInstanceId,
    src.title, src.subtitle, src.eyebrow, src.body,
    src.image, src.mobileImage, src.buttonLabel, src.buttonUrl,
    src.sortOrder, src.enabled,
    src.draftTitle, src.draftSubtitle, src.draftEyebrow, src.draftBody,
    src.draftImage, src.draftMobileImage, src.draftButtonLabel, src.draftButtonUrl,
    src.draftEnabled, src.styleOverrides, src.draftStyleOverrides,
    src.sectionStyleOverrides, src.draftSectionStyleOverrides, src.status
  );
  return db.prepare(
    'SELECT * FROM content_sections WHERE instanceId = ?'
  ).get(newInstanceId);
}

export function reorderSections(page, orderedIds) {
  const db = getDb();
  const stmt = db.prepare(
    'UPDATE content_sections SET sortOrder = ?, updatedAt = datetime(\'now\') WHERE page = ? AND instanceId = ?'
  );
  const tx = db.transaction(() => {
    for (let i = 0; i < orderedIds.length; i++) {
      stmt.run(i, page, orderedIds[i]);
    }
  });
  tx();
  return getPublishedPageSections(page);
}

// ── Pages Management ──────────────────────────────────────────────

export function getAllPages() {
  const db = getDb();
  return db.prepare('SELECT * FROM pages ORDER BY id ASC').all();
}

export function getPageBySlug(slug) {
  const db = getDb();
  return db.prepare('SELECT * FROM pages WHERE slug = ?').get(slug);
}

export function createPage({ title, slug, template }) {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM pages WHERE slug = ?').get(slug);
  if (existing) {
    throw new Error('A page with this slug already exists');
  }
  db.prepare(
    'INSERT INTO pages (title, slug, template, status) VALUES (?, ?, ?, ?)'
  ).run(title, slug, template || '', 'draft');
  return db.prepare('SELECT * FROM pages WHERE slug = ?').get(slug);
}

export function deletePage(slug) {
  const db = getDb();
  const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(slug);
  if (!page) return null;

  // Only allow deletion if no published content sections exist
  const sectionCount = db.prepare(
    "SELECT COUNT(*) as count FROM content_sections WHERE page = ? AND status = 'published'"
  ).get(slug).count;
  if (sectionCount > 0) {
    throw new Error('Cannot delete page with published content');
  }

  db.prepare('DELETE FROM pages WHERE slug = ?').run(slug);
  // Also delete any draft sections for this page
  db.prepare('DELETE FROM content_sections WHERE page = ?').run(slug);
  return page;
}

export function getPageStatus(slug) {
  const db = getDb();
  const sections = db.prepare(
    'SELECT status FROM content_sections WHERE page = ?'
  ).all(slug);

  if (sections.length === 0) return 'empty';
  const hasDraft = sections.some(s => s.status === 'draft');
  if (hasDraft) return 'draft';
  return 'published';
}

export function getPageSectionCount(slug) {
  const db = getDb();
  return db.prepare(
    'SELECT COUNT(*) as count FROM content_sections WHERE page = ?'
  ).get(slug).count;
}

// ── Section Templates ────────────────────────────────────────────

export function createSectionTemplate({ name, description, sectionType, content, styleOverrides, mobileOverrides, variant }) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO section_templates (name, description, sectionType, content, styleOverrides, mobileOverrides, variant)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    description || '',
    sectionType,
    JSON.stringify(content || {}),
    JSON.stringify(styleOverrides || {}),
    JSON.stringify(mobileOverrides || {}),
    variant || null
  );
  return db.prepare('SELECT * FROM section_templates WHERE id = ?').get(result.lastInsertRowid);
}

export function getSectionTemplates() {
  const db = getDb();
  return db.prepare('SELECT * FROM section_templates ORDER BY name ASC').all();
}

export function getSectionTemplateById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM section_templates WHERE id = ?').get(id);
}

export function updateSectionTemplate(id, { name, description, content, styleOverrides, mobileOverrides, variant }) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM section_templates WHERE id = ?').get(id);
  if (!existing) return null;
  
  db.prepare(`
    UPDATE section_templates
    SET name = ?, description = ?, content = ?, styleOverrides = ?, mobileOverrides = ?, variant = ?,
        updatedAt = datetime('now')
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    description !== undefined ? description : existing.description,
    content !== undefined ? JSON.stringify(content) : existing.content,
    styleOverrides !== undefined ? JSON.stringify(styleOverrides) : existing.styleOverrides,
    mobileOverrides !== undefined ? JSON.stringify(mobileOverrides) : existing.mobileOverrides,
    variant !== undefined ? variant : existing.variant,
    id
  );
  return db.prepare('SELECT * FROM section_templates WHERE id = ?').get(id);
}

export function deleteSectionTemplate(id) {
  const db = getDb();
  const template = db.prepare('SELECT * FROM section_templates WHERE id = ?').get(id);
  if (!template) return null;
  db.prepare('DELETE FROM section_templates WHERE id = ?').run(id);
  return template;
}

// Instantiate a section template into a page section
export function instantiateSectionTemplate(page, templateId, instanceId, sortOrder = 0) {
  const db = getDb();
  const template = db.prepare('SELECT * FROM section_templates WHERE id = ?').get(templateId);
  if (!template) return null;
  
  const content = JSON.parse(template.content || '{}');
  const styleOverrides = JSON.parse(template.styleOverrides || '{}');
  const mobileOverrides = JSON.parse(template.mobileOverrides || '{}');
  
  db.prepare(`
    INSERT INTO content_sections (
      page, sectionKey, instanceId, variant, sortOrder, enabled, status,
      title, subtitle, eyebrow, body, image, mobileImage, buttonLabel, buttonUrl,
      styleOverrides, sectionStyleOverrides
    ) VALUES (?, ?, ?, ?, ?, 1, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    page,
    template.sectionType,
    instanceId,
    template.variant,
    sortOrder,
    content.title || null,
    content.subtitle || null,
    content.eyebrow || null,
    content.body || null,
    content.image || null,
    content.mobileImage || null,
    content.buttonLabel || null,
    content.buttonUrl || null,
    JSON.stringify(styleOverrides),
    JSON.stringify(mobileOverrides)
  );
  
  return db.prepare('SELECT * FROM content_sections WHERE instanceId = ?').get(instanceId);
}

// ── Page Templates ───────────────────────────────────────────────

export function createPageTemplate({ name, description, sections, pageDesign }) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO page_templates (name, description, sections, pageDesign)
    VALUES (?, ?, ?, ?)
  `).run(
    name,
    description || '',
    JSON.stringify(sections || []),
    JSON.stringify(pageDesign || {})
  );
  return db.prepare('SELECT * FROM page_templates WHERE id = ?').get(result.lastInsertRowid);
}

export function getPageTemplates() {
  const db = getDb();
  return db.prepare('SELECT * FROM page_templates ORDER BY name ASC').all();
}

export function getPageTemplateById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM page_templates WHERE id = ?').get(id);
}

export function updatePageTemplate(id, { name, description, sections, pageDesign }) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM page_templates WHERE id = ?').get(id);
  if (!existing) return null;
  
  db.prepare(`
    UPDATE page_templates
    SET name = ?, description = ?, sections = ?, pageDesign = ?, updatedAt = datetime('now')
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    description !== undefined ? description : existing.description,
    sections !== undefined ? JSON.stringify(sections) : existing.sections,
    pageDesign !== undefined ? JSON.stringify(pageDesign) : existing.pageDesign,
    id
  );
  return db.prepare('SELECT * FROM page_templates WHERE id = ?').get(id);
}

export function deletePageTemplate(id) {
  const db = getDb();
  const template = db.prepare('SELECT * FROM page_templates WHERE id = ?').get(id);
  if (!template) return null;
  db.prepare('DELETE FROM page_templates WHERE id = ?').run(id);
  return template;
}

// Instantiate a page template into a new page
export function instantiatePageTemplate(targetPage, templateId) {
  const db = getDb();
  const template = db.prepare('SELECT * FROM page_templates WHERE id = ?').get(templateId);
  if (!template) return null;
  
  const sections = JSON.parse(template.sections || '[]');
  const pageDesign = JSON.parse(template.pageDesign || '{}');
  
  // Update page design
  db.prepare(`
    UPDATE pages SET pageDesign = ?, updatedAt = datetime('now') WHERE slug = ?
  `).run(JSON.stringify(pageDesign), targetPage);
  
  // Create sections with new instanceIds
  const createdSections = [];
  const tx = db.transaction(() => {
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const newInstanceId = generateId();
      
      db.prepare(`
        INSERT INTO content_sections (
          page, sectionKey, instanceId, variant, sortOrder, enabled, status,
          title, subtitle, eyebrow, body, image, mobileImage, buttonLabel, buttonUrl,
          styleOverrides, sectionStyleOverrides
        ) VALUES (?, ?, ?, ?, ?, 1, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        targetPage,
        s.sectionType,
        newInstanceId,
        s.variant || null,
        i,
        s.content?.title || null,
        s.content?.subtitle || null,
        s.content?.eyebrow || null,
        s.content?.body || null,
        s.content?.image || null,
        s.content?.mobileImage || null,
        s.content?.buttonLabel || null,
        s.content?.buttonUrl || null,
        JSON.stringify(s.styleOverrides || {}),
        JSON.stringify(s.mobileOverrides || {})
      );
      
      createdSections.push(db.prepare('SELECT * FROM content_sections WHERE instanceId = ?').get(newInstanceId));
    }
  });
  tx();
  
  return createdSections;
}

// Helper function for generating IDs (server-side)
function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ── Page Design Settings ─────────────────────────────────────────

export function getPageDesignSettings(slug) {
  const db = getDb();
  const page = db.prepare('SELECT pageDesign FROM pages WHERE slug = ?').get(slug);
  if (!page) return null;
  return JSON.parse(page.pageDesign || '{}');
}

export function updatePageDesignSettings(slug, designSettings) {
  const db = getDb();
  db.prepare(`
    UPDATE pages SET pageDesign = ?, updatedAt = datetime('now') WHERE slug = ?
  `).run(JSON.stringify(designSettings), slug);
  return getPageDesignSettings(slug);
}

// ── Seed Default Sections ───────────────────────────────────────
// Ensures CMS-backed sections exist with sensible defaults.
// Called by public renderer as fallback when sections are missing.

const DEFAULT_SECTIONS = {
  home: [
    {
      sectionKey: 'trust-bar', sortOrder: 1,
      body: JSON.stringify({
        items: [
          { icon: 'shield', text: 'Handcrafted in India' },
          { icon: 'check', text: 'Solid Timber, Never Veneer' },
          { icon: 'truck', text: 'White-Glove Delivery' },
          { icon: 'heart', text: 'Sustainably Sourced' },
        ],
      }),
    },
    {
      sectionKey: 'collection-carousel', sortOrder: 5,
      eyebrow: 'The Collection',
      title: 'Select Pieces',
      body: JSON.stringify({
        productIds: ['elan', 'boate', 'ligne', 'rive'],
      }),
    },
    {
      sectionKey: 'product-grid', sortOrder: 6,
      eyebrow: 'From the Collection',
      title: 'Pieces Built to Last',
      buttonLabel: 'Explore the Full Collection',
      buttonUrl: '/gallery',
      body: JSON.stringify({
        productIds: ['quadre', 'solenne', 'petale', 'bloc'],
      }),
    },
  ],
  studio: [
    {
      sectionKey: 'materials', sortOrder: 2,
      eyebrow: 'Materials',
      title: "Solid wood, and why we don't use anything else.",
      body: JSON.stringify({
        items: [
          { title: 'Why Teak', body: 'Teak carries its own natural oils, which is why it has been used in shipbuilding for centuries. It resists moisture and doesn\'t need synthetic sealants to survive daily use.' },
          { title: 'Why Solid, Not Veneer', body: 'Veneer looks identical on day one and fails first. A solid block can be sanded, repaired, and refinished for generations. A veneer sheet cannot.' },
          { title: 'Why Grain Matters', body: 'Every board is chosen and oriented by hand so the grain runs with the piece\'s structure, not against it. This is slower, and it\'s why the piece doesn\'t crack at the joints.' },
          { title: 'Why We Let Wood Age', body: 'A finished piece will darken and change texture slightly over its first few years. This isn\'t wear — it\'s the wood settling into its final state.' },
          { title: 'Why We Keep Imperfections', body: 'A knot or a faint colour shift in the grain isn\'t sanded away. It\'s the record of where the tree grew, and it\'s part of what makes the piece singular.' },
          { title: 'Why Food-Safe Oil', body: 'Lacquer seals moisture in and cracks over time. An oil finish can be reapplied by hand for as long as the piece is in use.' },
        ],
      }),
    },
  ],
};

export function seedDefaultSections(page) {
  const db = getDb();
  const defaults = DEFAULT_SECTIONS[page];
  if (!defaults) return [];

  const existing = db.prepare(
    'SELECT sectionKey FROM content_sections WHERE page = ?'
  ).all(page).map(s => s.sectionKey);

  const created = [];
  for (const def of defaults) {
    if (existing.includes(def.sectionKey)) continue;
    const instanceId = `${page}-${def.sectionKey}-${Date.now()}`;
    try {
      db.prepare(`
        INSERT INTO content_sections (page, sectionKey, instanceId, title, subtitle, eyebrow, body,
          buttonLabel, buttonUrl, sortOrder, enabled, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'published')
      `).run(
        page, def.sectionKey, instanceId,
        def.title || null, def.subtitle || null, def.eyebrow || null,
        def.body || null, def.buttonLabel || null, def.buttonUrl || null,
        def.sortOrder || 0,
      );
      created.push(def.sectionKey);
    } catch {
      // Section may already exist (race condition) — ignore
    }
  }
  return created;
}

export { VALID_SECTIONS, BUILTIN_SECTIONS };

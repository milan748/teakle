import { getDb } from './db';

const VALID_SECTIONS = [
  'hero', 'philosophy', 'signature', 'craftsmanship',
  'workshop-story', 'process-story',
  'origin', 'gallery',
  'introduction',
  'featured-intro',
];

export const VALID_PAGES = [
  'home', 'studio', 'contact', 'trade', 'custom', 'journal', 'archive',
];

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
      page,
      existing.instanceId || instanceId
    );
  } else {
    db.prepare(`
      INSERT INTO content_sections (page, sectionKey, instanceId, title, subtitle, eyebrow, body,
        image, mobileImage, buttonLabel, buttonUrl, sortOrder, enabled,
        draftTitle, draftSubtitle, draftEyebrow, draftBody,
        draftImage, draftMobileImage, draftButtonLabel, draftButtonUrl,
        draftEnabled, styleOverrides, draftStyleOverrides,
        sectionStyleOverrides, draftSectionStyleOverrides, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `).run(
      page,
      sectionKey,
      instanceId || null,
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

export { VALID_SECTIONS };

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

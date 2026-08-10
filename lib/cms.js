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

export function saveDraftSection(page, sectionKey, data) {
  const db = getDb();
  const existing = getSection(page, sectionKey);

  if (existing) {
    db.prepare(`
      UPDATE content_sections
      SET draftTitle = ?, draftSubtitle = ?, draftEyebrow = ?, draftBody = ?,
          draftImage = ?, draftMobileImage = ?, draftButtonLabel = ?, draftButtonUrl = ?,
          draftEnabled = ?, status = 'draft', updatedAt = datetime('now')
      WHERE page = ? AND sectionKey = ?
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
      page,
      sectionKey
    );
  } else {
    db.prepare(`
      INSERT INTO content_sections (page, sectionKey, title, subtitle, eyebrow, body,
        image, mobileImage, buttonLabel, buttonUrl, sortOrder, enabled,
        draftTitle, draftSubtitle, draftEyebrow, draftBody,
        draftImage, draftMobileImage, draftButtonLabel, draftButtonUrl,
        draftEnabled, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `).run(
      page,
      sectionKey,
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
      data.enabled !== undefined ? (data.enabled ? 1 : 0) : 1
    );
  }

  return getSection(page, sectionKey);
}

// ── Publish ──────────────────────────────────────────────────────

export function publishSection(page, sectionKey) {
  const db = getDb();
  const existing = getSection(page, sectionKey);
  if (!existing) return null;

  const hasDraft = existing.status === 'draft' && existing.draftTitle !== null;

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
          draftTitle = NULL, draftSubtitle = NULL, draftEyebrow = NULL, draftBody = NULL,
          draftImage = NULL, draftMobileImage = NULL,
          draftButtonLabel = NULL, draftButtonUrl = NULL,
          draftEnabled = NULL,
          status = 'published',
          publishedAt = datetime('now'),
          updatedAt = datetime('now')
      WHERE page = ? AND sectionKey = ?
    `).run(page, sectionKey);
  } else {
    db.prepare(`
      UPDATE content_sections
      SET status = 'published',
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

export { VALID_SECTIONS };

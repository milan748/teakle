import { getDb } from './db';

const VALID_SECTIONS = [
  'hero', 'philosophy', 'signature', 'craftsmanship',
  'workshop-story', 'process-story',
];

export function getPageSections(page) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM content_sections WHERE page = ? ORDER BY sortOrder ASC'
  ).all(page);
}

export function getSection(page, sectionKey) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM content_sections WHERE page = ? AND sectionKey = ?'
  ).get(page, sectionKey);
}

export function upsertSection(page, sectionKey, data) {
  const db = getDb();
  const existing = getSection(page, sectionKey);

  if (existing) {
    db.prepare(`
      UPDATE content_sections
      SET title = ?, subtitle = ?, eyebrow = ?, body = ?,
          image = ?, mobileImage = ?, buttonLabel = ?, buttonUrl = ?,
          sortOrder = ?, enabled = ?, updatedAt = datetime('now')
      WHERE page = ? AND sectionKey = ?
    `).run(
      data.title ?? existing.title,
      data.subtitle ?? existing.subtitle,
      data.eyebrow ?? existing.eyebrow,
      data.body ?? existing.body,
      data.image ?? existing.image,
      data.mobileImage ?? existing.mobileImage,
      data.buttonLabel ?? existing.buttonLabel,
      data.buttonUrl ?? existing.buttonUrl,
      data.sortOrder ?? existing.sortOrder,
      data.enabled !== undefined ? (data.enabled ? 1 : 0) : existing.enabled,
      page,
      sectionKey
    );
  } else {
    db.prepare(`
      INSERT INTO content_sections (page, sectionKey, title, subtitle, eyebrow, body,
        image, mobileImage, buttonLabel, buttonUrl, sortOrder, enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      data.enabled !== undefined ? (data.enabled ? 1 : 0) : 1
    );
  }

  return getSection(page, sectionKey);
}

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

import { getDb } from './db';
import { saveFile, deleteFile } from './storage';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function getAllMedia() {
  const db = getDb();
  return db.prepare('SELECT * FROM media ORDER BY createdAt DESC').all();
}

export function getMediaById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM media WHERE id = ?').get(id);
}

export async function createMedia(file, altText = '') {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, AVIF');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  if (file.size === 0) {
    throw new Error('Empty file');
  }

  const db = getDb();
  const id = crypto.randomUUID();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const { safeName } = saveFile(file.name, buffer);

  const url = `/uploads/media/${safeName}`;

  db.prepare(`
    INSERT INTO media (id, filename, originalName, mimeType, size, url, altText)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, safeName, file.name, file.type, file.size, url, altText || '');

  return getMediaById(id);
}

export function updateMediaAlt(id, altText) {
  const db = getDb();
  db.prepare(`
    UPDATE media SET altText = ?, updatedAt = datetime('now') WHERE id = ?
  `).run(altText, id);
  return getMediaById(id);
}

export function deleteMedia(id) {
  const db = getDb();
  const media = getMediaById(id);
  if (!media) return false;

  const referenced = db.prepare(`
    SELECT id FROM content_sections
    WHERE image = ? OR mobileImage = ? OR draftImage = ? OR draftMobileImage = ?
  `).get(media.url, media.url, media.url, media.url);

  if (referenced) {
    throw new Error('Media is currently used by CMS content');
  }

  deleteFile(media.filename);
  db.prepare('DELETE FROM media WHERE id = ?').run(id);
  return true;
}

export function isMediaReferenced(url) {
  const db = getDb();
  return !!db.prepare(
    'SELECT id FROM content_sections WHERE image = ? OR mobileImage = ? OR draftImage = ? OR draftMobileImage = ?'
  ).get(url, url, url, url);
}

import { getDb } from './db';
import { saveFile, deleteFile } from './storage';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Magic byte signatures for allowed image types
const MAGIC_BYTES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (need offset 8 for WEBP)
  'image/avif': [[0x00, 0x00, 0x00]], // ftyp box at offset 4-7
};

function verifyMagicBytes(buffer, mimeType) {
  if (!buffer || buffer.length < 12) return false;

  const sigs = MAGIC_BYTES[mimeType];
  if (!sigs) return false;

  for (const sig of sigs) {
    let match = true;
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) { match = false; break; }
    }
    if (match) {
      // Extra check for WebP: RIFF....WEBP
      if (mimeType === 'image/webp') {
        return buffer.toString('ascii', 8, 12) === 'WEBP';
      }
      // Extra check for AVIF: ftyp box
      if (mimeType === 'image/avif') {
        return buffer.toString('ascii', 4, 8) === 'ftyp';
      }
      return true;
    }
  }
  return false;
}

export function getAllMedia({ page = 1, limit = 50, search = '' } = {}) {
  const db = getDb();
  const offset = (Math.max(1, page) - 1) * limit;
  const safeLimit = Math.min(100, Math.max(1, limit));

  let query = 'SELECT * FROM media';
  let countQuery = 'SELECT COUNT(*) as total FROM media';
  const params = [];
  const countParams = [];

  if (search) {
    const where = ' WHERE originalName LIKE ? OR altText LIKE ?';
    query += where;
    countQuery += where;
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(safeLimit, offset);

  const media = db.prepare(query).all(...params);
  const { total } = db.prepare(countQuery).get(...countParams);

  return { data: media, pagination: { page: Math.max(1, page), limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
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

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Verify magic bytes match declared MIME type
  if (!verifyMagicBytes(buffer, file.type)) {
    throw new Error('File content does not match declared type');
  }

  const db = getDb();
  const id = crypto.randomUUID();
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

  // Check CMS content references
  const cmsRef = db.prepare(`
    SELECT id FROM content_sections
    WHERE image = ? OR mobileImage = ? OR draftImage = ? OR draftMobileImage = ?
  `).get(media.url, media.url, media.url, media.url);

  if (cmsRef) {
    throw new Error('Media is currently used by CMS content');
  }

  // Check product metadata references (description field may contain image URLs)
  const productRef = db.prepare(`
    SELECT productId FROM product_metadata WHERE description LIKE ?
  `).get(`%${media.url}%`);

  if (productRef) {
    throw new Error('Media is currently referenced by product content');
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

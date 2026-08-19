import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.MEDIA_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads', 'media');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getStorageDir() {
  return UPLOAD_DIR;
}

export function getStorageUrl(relativePath) {
  return `/uploads/media/${relativePath}`;
}

export function saveFile(filename, buffer, forceExt) {
  ensureDir(UPLOAD_DIR);
  const safeName = generateSafeFilename(filename, forceExt);
  const filePath = path.join(UPLOAD_DIR, safeName);
  fs.writeFileSync(filePath, buffer);
  return { safeName, filePath };
}

export function deleteFile(filename) {
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function fileExists(filename) {
  const filePath = path.join(UPLOAD_DIR, filename);
  return fs.existsSync(filePath);
}

function generateSafeFilename(originalName, forceExt) {
  // When forceExt is supplied (e.g. derived from a validated MIME type) it is
  // used instead of the client-provided extension. This prevents a malicious
  // upload named "shell.php" with JPEG bytes from being stored with a
  // server-side-executable extension.
  let ext = path.extname(originalName).toLowerCase();
  if (forceExt && typeof forceExt === 'string' && forceExt.startsWith('.')) {
    ext = forceExt.toLowerCase();
  }
  const id = crypto.randomUUID();
  return `${id}${ext}`;
}

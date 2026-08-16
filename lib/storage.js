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

export function saveFile(filename, buffer) {
  ensureDir(UPLOAD_DIR);
  const safeName = generateSafeFilename(filename);
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

function generateSafeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const id = crypto.randomUUID();
  return `${id}${ext}`;
}

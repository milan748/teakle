import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { rateLimitIp } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { createHash } from 'crypto';

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
const MAX_RESET_REQUESTS = 10;
const RESET_WINDOW_MS = 60 * 60 * 1000;

function sha256(str) {
  return createHash('sha256').update(str).digest('hex');
}

export async function POST(req) {
  try {
    const rl = rateLimitIp('auth:reset-password', { limit: MAX_RESET_REQUESTS, windowMs: RESET_WINDOW_MS }, req.headers);
    if (!rl.allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Reset token is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'New password is required' }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD) {
      return Response.json({ error: `Password must be at least ${MIN_PASSWORD} characters` }, { status: 400 });
    }
    if (password.length > MAX_PASSWORD) {
      return Response.json({ error: 'Password is too long' }, { status: 400 });
    }

    const db = getDb();
    const tokenHash = sha256(token);

    const reset = db.prepare(
      "SELECT id, customerId, expiresAt, used FROM password_resets WHERE tokenHash = ? ORDER BY id DESC LIMIT 1"
    ).get(tokenHash);

    if (!reset) {
      return Response.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (reset.used) {
      return Response.json({ error: 'Reset token has already been used' }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(reset.expiresAt + 'Z');
    if (now > expiresAt) {
      return Response.json({ error: 'Reset token has expired' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(password, 12);
    db.prepare("UPDATE customers SET passwordHash = ?, sessionVersion = sessionVersion + 1, updatedAt = datetime('now') WHERE id = ?")
      .run(newHash, reset.customerId);

    db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?")
      .run(reset.id);

    log.info('Password reset completed', { customerId: reset.customerId });

    return Response.json({ ok: true, message: 'Password has been reset successfully' });
  } catch (err) {
    log.error('Reset password error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

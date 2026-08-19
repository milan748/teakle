import { getDb } from '@/lib/db';
import { rateLimitIp } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { createHash, randomBytes } from 'crypto';
import { sendPasswordReset } from '@/lib/email';

const RESET_EXPIRY_HOURS = 1;
const MAX_RESET_REQUESTS = 5;
const RESET_WINDOW_MS = 60 * 60 * 1000;

function sha256(str) {
  return createHash('sha256').update(str).digest('hex');
}

function generateToken() {
  return randomBytes(32).toString('hex');
}

export async function POST(req) {
  try {
    const rl = rateLimitIp('auth:forgot-password', { limit: MAX_RESET_REQUESTS, windowMs: RESET_WINDOW_MS }, req.headers);
    if (!rl.allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = getDb();
    const customer = db.prepare('SELECT id FROM customers WHERE email = ?').get(email.trim().toLowerCase());

    if (!customer) {
      log.info('Password reset requested for non-existent email', { email: email.trim().toLowerCase() });
      return Response.json({
        ok: true,
        message: 'If an account exists with that email, a reset link has been sent.',
      });
    }

    const token = generateToken();
    const tokenHash = sha256(token);

    db.prepare(
      'DELETE FROM password_resets WHERE customerId = ? AND used = 0'
    ).run(customer.id);

    db.prepare(
      "INSERT INTO password_resets (customerId, tokenHash, expiresAt) VALUES (?, ?, datetime('now', ?))"
    ).run(customer.id, tokenHash, `+${RESET_EXPIRY_HOURS} hours`);

    log.info('Password reset token created', { customerId: customer.id });

    // Send password reset email (non-blocking)
    sendPasswordReset({ to: email.trim().toLowerCase(), resetToken: token })
      .catch(err => log.error('Password reset email failed', { message: err.message }));

    return Response.json({
      ok: true,
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (err) {
    log.error('Forgot password error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

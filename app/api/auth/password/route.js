import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import bcrypt from 'bcryptjs';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

export const PUT = withCsrf(async function PUT(req) {
  try {
    const rl = rateLimit('auth:password', { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rl.allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return Response.json({ error: 'Current password is required' }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== 'string') {
      return Response.json({ error: 'New password is required' }, { status: 400 });
    }
    if (newPassword.length < MIN_PASSWORD) {
      return Response.json({ error: `New password must be at least ${MIN_PASSWORD} characters` }, { status: 400 });
    }
    if (newPassword.length > MAX_PASSWORD) {
      return Response.json({ error: 'New password is too long' }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return Response.json({ error: 'New password must be different from current password' }, { status: 400 });
    }

    const db = getDb();
    const customer = db.prepare('SELECT id, passwordHash FROM customers WHERE id = ?').get(session.customerId);
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, customer.passwordHash);
    if (!valid) {
      log.info('Password change failed: incorrect current password', { customerId: session.customerId });
      return Response.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    db.prepare("UPDATE customers SET passwordHash = ?, updatedAt = datetime('now') WHERE id = ?")
      .run(newHash, session.customerId);

    log.info('Password changed successfully', { customerId: session.customerId });

    return Response.json({ ok: true, message: 'Password updated successfully' });
  } catch (err) {
    log.error('Password change error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

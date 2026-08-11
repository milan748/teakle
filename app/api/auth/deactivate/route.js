import { getDb } from '@/lib/db';
import { getCustomerSession, deleteCustomerSession } from '@/lib/customerSession';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

const DEACTIVATE_RATE_LIMIT = { limit: 2, windowMs: 60 * 60 * 1000 };

export const POST = withCsrf(async function POST(req) {
  try {
    const rl = rateLimit('auth:deactivate', DEACTIVATE_RATE_LIMIT);
    if (!rl.allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'Password confirmation is required' }, { status: 400 });
    }

    const db = getDb();
    const customer = db.prepare('SELECT id, passwordHash FROM customers WHERE id = ?').get(session.customerId);
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      log.info('Account deactivation failed: incorrect password', { customerId: session.customerId });
      return Response.json({ error: 'Password is incorrect' }, { status: 401 });
    }

    const orderCount = db.prepare(
      "SELECT COUNT(*) as count FROM orders WHERE customerId = ? AND status NOT IN ('CANCELLED', 'COMPLETED')"
    ).get(session.customerId);

    if (orderCount.count > 0) {
      return Response.json({
        error: 'Cannot deactivate account with active orders. Please wait for your orders to complete or contact support.',
      }, { status: 400 });
    }

    db.transaction(() => {
      db.prepare("UPDATE customers SET name = 'Deleted User', email = ?, phone = '', passwordHash = '', isActive = 0, updatedAt = datetime('now') WHERE id = ?")
        .run(`deactivated_${session.customerId}@deleted.local`, session.customerId);

      db.prepare("UPDATE carts SET updatedAt = datetime('now') WHERE customerId = ?").run(session.customerId);

      db.prepare("UPDATE wishlists SET updatedAt = datetime('now') WHERE customerId = ?").run(session.customerId);

      db.prepare('DELETE FROM password_resets WHERE customerId = ?').run(session.customerId);

      db.prepare('DELETE FROM customer_addresses WHERE customerId = ?').run(session.customerId);
    })();

    await deleteCustomerSession();

    log.info('Customer account deactivated', { customerId: session.customerId });

    return Response.json({ ok: true, message: 'Account has been deactivated' });
  } catch (err) {
    log.error('Account deactivation error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

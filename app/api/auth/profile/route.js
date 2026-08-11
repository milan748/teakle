import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,20}$/;
const MAX_NAME = 100;
const MAX_PHONE = 20;

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const customer = db.prepare(
      'SELECT id, email, name, phone, isActive, createdAt, updatedAt FROM customers WHERE id = ?'
    ).get(session.customerId);

    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    return Response.json({ customer });
  } catch (err) {
    log.error('Profile GET error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PUT = withCsrf(async function PUT(req) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = body;

    const errors = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        errors.name = 'Name is required';
      } else if (name.trim().length > MAX_NAME) {
        errors.name = `Name must be under ${MAX_NAME} characters`;
      }
    }

    if (phone !== undefined && phone !== '' && phone !== null) {
      if (typeof phone !== 'string') {
        errors.phone = 'Invalid phone number';
      } else if (phone.trim().length > MAX_PHONE) {
        errors.phone = `Phone must be under ${MAX_PHONE} characters`;
      } else if (phone.trim() && !PHONE_RE.test(phone.trim())) {
        errors.phone = 'Invalid phone number format';
      }
    }

    if (Object.keys(errors).length > 0) {
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const db = getDb();
    const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(session.customerId);
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone ? phone.trim() : '');
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push("updatedAt = datetime('now')");
    params.push(session.customerId);

    db.prepare(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare(
      'SELECT id, email, name, phone, isActive, createdAt, updatedAt FROM customers WHERE id = ?'
    ).get(session.customerId);

    log.info('Customer profile updated', { customerId: session.customerId });

    return Response.json({ ok: true, customer: updated });
  } catch (err) {
    log.error('Profile PUT error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

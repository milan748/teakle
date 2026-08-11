import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { log } from '@/lib/logger';
import { validateAddress } from '@/lib/validateAddress';
import { withCsrf } from '@/lib/csrf';

export async function GET(req, { params }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const address = db.prepare(
      'SELECT * FROM customer_addresses WHERE id = ? AND customerId = ?'
    ).get(id, session.customerId);

    if (!address) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    return Response.json({ address });
  } catch (err) {
    log.error('Address GET error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PUT = withCsrf(async function PUT(req, { params }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const existing = db.prepare(
      'SELECT * FROM customer_addresses WHERE id = ? AND customerId = ?'
    ).get(id, session.customerId);

    if (!existing) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    const body = await req.json();
    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = body;

    const validation = validateAddress(body, { requireEmail: false });
    if (!validation.valid) {
      return Response.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
    }

    if (typeof label !== 'string' || label.length > 100) {
      return Response.json({ error: 'Label must be under 100 characters' }, { status: 400 });
    }
    if (typeof fullName !== 'string' || fullName.length > 100) {
      return Response.json({ error: 'Full name must be under 100 characters' }, { status: 400 });
    }
    if (typeof phone !== 'string' || phone.length > 20) {
      return Response.json({ error: 'Phone must be under 20 characters' }, { status: 400 });
    }
    if (typeof addressLine2 !== 'string' || addressLine2.length > 200) {
      return Response.json({ error: 'Address line 2 must be under 200 characters' }, { status: 400 });
    }

    const setDefault = isDefault === true;

    if (setDefault) {
      db.prepare(
        'UPDATE customer_addresses SET isDefault = 0 WHERE customerId = ? AND id != ?'
      ).run(session.customerId, id);
    }

    db.prepare(`
      UPDATE customer_addresses
      SET label = ?, fullName = ?, phone = ?, addressLine1 = ?, addressLine2 = ?,
          city = ?, state = ?, postalCode = ?, country = ?, isDefault = ?,
          updatedAt = datetime('now')
      WHERE id = ? AND customerId = ?
    `).run(
      label || '',
      fullName || '',
      phone || '',
      addressLine1,
      addressLine2 || '',
      city,
      state,
      postalCode,
      country || 'India',
      setDefault ? 1 : (isDefault === false ? 0 : existing.isDefault),
      id,
      session.customerId
    );

    const updated = db.prepare(
      'SELECT * FROM customer_addresses WHERE id = ? AND customerId = ?'
    ).get(id, session.customerId);

    log.info('Address updated', { customerId: session.customerId, addressId: id });

    return Response.json({ ok: true, address: updated });
  } catch (err) {
    log.error('Address PUT error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = withCsrf(async function DELETE(req, { params }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const existing = db.prepare(
      'SELECT * FROM customer_addresses WHERE id = ? AND customerId = ?'
    ).get(id, session.customerId);

    if (!existing) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM customer_addresses WHERE id = ? AND customerId = ?')
      .run(id, session.customerId);

    if (existing.isDefault) {
      const next = db.prepare(
        'SELECT id FROM customer_addresses WHERE customerId = ? ORDER BY createdAt DESC LIMIT 1'
      ).get(session.customerId);
      if (next) {
        db.prepare('UPDATE customer_addresses SET isDefault = 1 WHERE id = ?').run(next.id);
      }
    }

    log.info('Address deleted', { customerId: session.customerId, addressId: id });

    return Response.json({ ok: true });
  } catch (err) {
    log.error('Address DELETE error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

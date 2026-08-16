import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { log } from '@/lib/logger';
import { validateAddress } from '@/lib/validateAddress';
import { withCsrf } from '@/lib/csrf';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const addresses = db.prepare(
      'SELECT * FROM customer_addresses WHERE customerId = ? ORDER BY isDefault DESC, createdAt DESC'
    ).all(session.customerId);

    return Response.json({ addresses });
  } catch (err) {
    log.error('Addresses GET error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withCsrf(async function POST(req) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = body;

    // Map the stored address shape (fullName/addressLine1/postalCode) to the
    // validateAddress field names (firstName/address/pin) for validation only.
    const validation = validateAddress({
      firstName: fullName,
      lastName: fullName,
      email: '',
      phone,
      address: addressLine1,
      apartment: addressLine2,
      city,
      state,
      pin: postalCode,
      country: country || 'India',
    }, { requireEmail: false });
    if (!validation.valid) {
      return Response.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
    }

    if (label !== undefined && (typeof label !== 'string' || label.length > 100)) {
      return Response.json({ error: 'Label must be under 100 characters' }, { status: 400 });
    }
    if (typeof fullName !== 'string' || fullName.length > 100) {
      return Response.json({ error: 'Full name must be under 100 characters' }, { status: 400 });
    }
    if (phone !== undefined && (typeof phone !== 'string' || phone.length > 20)) {
      return Response.json({ error: 'Phone must be under 20 characters' }, { status: 400 });
    }
    if (addressLine2 !== undefined && (typeof addressLine2 !== 'string' || addressLine2.length > 200)) {
      return Response.json({ error: 'Address line 2 must be under 200 characters' }, { status: 400 });
    }

    const db = getDb();

    const addressCount = db.prepare(
      'SELECT COUNT(*) as count FROM customer_addresses WHERE customerId = ?'
    ).get(session.customerId);

    const setDefault = addressCount.count === 0 || isDefault === true;

    if (setDefault) {
      db.prepare(
        'UPDATE customer_addresses SET isDefault = 0 WHERE customerId = ?'
      ).run(session.customerId);
    }

    const result = db.prepare(`
      INSERT INTO customer_addresses (customerId, label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      session.customerId,
      label || '',
      fullName || '',
      phone || '',
      addressLine1,
      addressLine2 || '',
      city,
      state,
      postalCode,
      country || 'India',
      setDefault ? 1 : 0
    );

    const address = db.prepare(
      'SELECT * FROM customer_addresses WHERE id = ?'
    ).get(result.lastInsertRowid);

    log.info('Address created', { customerId: session.customerId, addressId: address.id });

    return Response.json({ ok: true, address }, { status: 201 });
  } catch (err) {
    log.error('Addresses POST error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

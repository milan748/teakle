import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createCustomerSession } from '@/lib/customerSession';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    if (!name || !name.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return Response.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return Response.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM customers WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return Response.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare(
      'INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)'
    ).run(email.toLowerCase().trim(), passwordHash, name.trim());

    const customer = { id: result.lastInsertRowid, email: email.toLowerCase().trim(), name: name.trim() };

    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(customer.id);
    db.prepare('INSERT INTO wishlists (customerId) VALUES (?)').run(customer.id);

    await createCustomerSession(customer);

    return Response.json({
      ok: true,
      customer: { id: customer.id, email: customer.email, name: customer.name },
    });
  } catch (err) {
    console.error('Register error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

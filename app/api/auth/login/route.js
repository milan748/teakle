import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createCustomerSession } from '@/lib/customerSession';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDb();
    const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase().trim());

    if (!customer) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await createCustomerSession(customer);

    return Response.json({
      ok: true,
      customer: { id: customer.id, email: customer.email, name: customer.name },
    });
  } catch (err) {
    console.error('Login error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

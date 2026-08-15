import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createCustomerSession } from '@/lib/customerSession';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { sendWelcomeEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

export async function POST(req) {
  try {
    const rl = rateLimit('auth:register', RATE_LIMITS.customerRegister);
    if (!rl.allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { name, email, password, confirmPassword } = await req.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }
    if (name.trim().length > MAX_NAME) {
      return Response.json({ error: `Name must be under ${MAX_NAME} characters` }, { status: 400 });
    }
    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (email.trim().length > MAX_EMAIL) {
      return Response.json({ error: 'Email is too long' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return Response.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'Password is required' }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD) {
      return Response.json({ error: `Password must be at least ${MIN_PASSWORD} characters` }, { status: 400 });
    }
    if (password.length > MAX_PASSWORD) {
      return Response.json({ error: 'Password is too long' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return Response.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getDb();
    const existing = db.prepare('SELECT id FROM customers WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return Response.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare(
      'INSERT INTO customers (email, passwordHash, name) VALUES (?, ?, ?)'
    ).run(normalizedEmail, passwordHash, name.trim());

    const customer = { id: result.lastInsertRowid, email: normalizedEmail, name: name.trim() };

    db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(customer.id);
    db.prepare('INSERT INTO wishlists (customerId) VALUES (?)').run(customer.id);

    await createCustomerSession(customer);
    log.customerRegister(normalizedEmail);

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to: normalizedEmail, name: name.trim() })
      .catch(err => log.error('Welcome email failed', { message: err.message }));

    return Response.json({
      ok: true,
      customer: { id: customer.id, email: customer.email, name: customer.name },
    });
  } catch (err) {
    log.error('Register error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

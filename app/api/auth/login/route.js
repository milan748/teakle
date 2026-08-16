import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createCustomerSession } from '@/lib/customerSession';
import { rateLimitIp, RATE_LIMITS } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

export const POST = withCsrf(async function POST(req) {
  try {
    const rl = rateLimitIp('auth:login', RATE_LIMITS.customerLogin, req.headers);
    if (!rl.allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getDb();
    const customer = db.prepare(
      'SELECT id, email, passwordHash, name, isActive, sessionVersion FROM customers WHERE email = ?'
    ).get(normalizedEmail);

    if (!customer) {
      log.customerLogin(normalizedEmail, false);
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!customer.isActive) {
      log.customerLogin(normalizedEmail, false);
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      log.customerLogin(normalizedEmail, false);
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await createCustomerSession(customer);
    log.customerLogin(normalizedEmail, true);

    return Response.json({
      ok: true,
      customer: { id: customer.id, email: customer.email, name: customer.name },
    });
  } catch (err) {
    log.error('Customer login error', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

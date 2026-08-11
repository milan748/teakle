import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateCustomOrder } from '@/lib/validate';
import { requireAdmin } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

export const POST = withCsrf(async function POST(request) {
  try {
    const rl = rateLimit('form:custom-order', { limit: 5, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();

    const validation = validateCustomOrder(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO custom_orders (name, email, phone, size, dimensions, description, referenceFile)
      VALUES (@name, @email, @phone, @size, @dimensions, @description, @referenceFile)
    `);

    const result = stmt.run(validation.data);

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Custom order submitted successfully',
    }, { status: 201 });
  } catch (error) {
    log.error('Custom order API error', { message: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const db = getDb();
    const orders = db.prepare('SELECT id, name, email, status, createdAt FROM custom_orders ORDER BY createdAt DESC').all();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    log.error('Custom order GET error', { message: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

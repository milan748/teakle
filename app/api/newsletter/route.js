import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateNewsletter } from '@/lib/validate';
import { rateLimit } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

export const POST = withCsrf(async function POST(request) {
  try {
    const rl = rateLimit('form:newsletter', { limit: 5, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();

    const validation = validateNewsletter(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO newsletter_subscribers (email)
      VALUES (@email)
    `);

    const result = stmt.run(validation.data);

    if (result.changes === 0) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed',
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Subscribed successfully',
    }, { status: 201 });
  } catch (error) {
    log.error('Newsletter API error', { message: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

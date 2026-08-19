import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateContact } from '@/lib/validate';
import { rateLimit } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

export const POST = withCsrf(async function POST(request) {
  try {
    const rl = rateLimit('form:contact', { limit: 10, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();

    const validation = validateContact(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO contact_submissions (name, email, subject, message)
      VALUES (@name, @email, @subject, @message)
    `);

    const result = stmt.run(validation.data);

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Contact form submitted successfully',
    }, { status: 201 });
  } catch (error) {
    log.error('Contact API error', { message: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

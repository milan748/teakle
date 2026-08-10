import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateNewsletter } from '@/lib/validate';

export async function POST(request) {
  try {
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
    console.error('Newsletter API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateContact } from '@/lib/validate';

export async function POST(request) {
  try {
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
    console.error('Contact API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

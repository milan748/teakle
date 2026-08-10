import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateTrade } from '@/lib/validate';

export async function POST(request) {
  try {
    const body = await request.json();

    const validation = validateTrade(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO trade_enquiries (name, email, company, projectType, details)
      VALUES (@name, @email, @company, @projectType, @details)
    `);

    const result = stmt.run(validation.data);

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Trade enquiry submitted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Trade API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

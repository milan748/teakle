import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateCustomOrder } from '@/lib/validate';

export async function POST(request) {
  try {
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
    console.error('Custom order API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const orders = db.prepare('SELECT id, name, email, status, createdAt FROM custom_orders ORDER BY createdAt DESC').all();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Custom order GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = 'SELECT id, email, status, createdAt FROM newsletter_subscribers';
    const params = [];

    if (search) {
      query += " WHERE email LIKE ?";
      params.push(`%${search}%`);
    }
    query += ' ORDER BY createdAt DESC';

    const subscribers = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, data: subscribers });
  } catch (error) {
    console.error('Newsletter GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

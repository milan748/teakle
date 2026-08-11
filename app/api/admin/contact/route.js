import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = 'SELECT id, name, email, subject, message, status, read, createdAt FROM contact_submissions';
    const params = [];

    if (search) {
      query += " WHERE name LIKE ? OR email LIKE ? OR subject LIKE ?";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY createdAt DESC';

    const submissions = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    log.error('Contact GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

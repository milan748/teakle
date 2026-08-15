import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';
import { rateLimitIp, RATE_LIMITS } from '@/lib/rateLimit';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const rl = rateLimitIp('contact', RATE_LIMITS.contact, request.headers);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    let query = 'SELECT id, name, email, subject, message, status, read, createdAt FROM contact_submissions';
    let countQuery = 'SELECT COUNT(*) as total FROM contact_submissions';
    const conditions = [];
    const params = [];
    const countParams = [];

    if (search) {
      conditions.push("name LIKE ? OR email LIKE ? OR subject LIKE ?");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const submissions = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    log.error('Contact GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

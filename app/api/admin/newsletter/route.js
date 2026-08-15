import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';
import { rateLimitIp, RATE_LIMITS } from '@/lib/rateLimit';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const rl = rateLimitIp('newsletter', RATE_LIMITS.newsletter, request.headers);
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

    let query = 'SELECT id, email, status, createdAt FROM newsletter_subscribers';
    let countQuery = 'SELECT COUNT(*) as total FROM newsletter_subscribers';
    const conditions = [];
    const params = [];
    const countParams = [];

    if (search) {
      conditions.push("email LIKE ?");
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const subscribers = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    return NextResponse.json({
      success: true,
      data: subscribers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    log.error('Newsletter GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const rl = rateLimit('admin:auditLogs', RATE_LIMITS.adminAuditLogs);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || '';
    const entityType = searchParams.get('entityType') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.id, a.adminId, a.action, a.entityType, a.entityId, a.metadata, a.createdAt,
             ad.email as adminEmail
      FROM admin_audit_logs a
      LEFT JOIN admins ad ON ad.id = a.adminId
    `;
    const conditions = [];
    const params = [];

    if (action) {
      conditions.push("a.action = ?");
      params.push(action);
    }
    if (entityType) {
      conditions.push("a.entityType = ?");
      params.push(entityType);
    }
    if (dateFrom) {
      conditions.push("a.createdAt >= ?");
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push("a.createdAt <= ?");
      params.push(dateTo + ' 23:59:59');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY a.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const logs = db.prepare(query).all(...params);

    let countQuery = `
      SELECT COUNT(*) as total
      FROM admin_audit_logs a
      LEFT JOIN admins ad ON ad.id = a.adminId
    `;
    const countParams = [];
    const countConditions = [];
    if (action) {
      countConditions.push("a.action = ?");
      countParams.push(action);
    }
    if (entityType) {
      countConditions.push("a.entityType = ?");
      countParams.push(entityType);
    }
    if (dateFrom) {
      countConditions.push("a.createdAt >= ?");
      countParams.push(dateFrom);
    }
    if (dateTo) {
      countConditions.push("a.createdAt <= ?");
      countParams.push(dateTo + ' 23:59:59');
    }
    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }
    const { total } = db.prepare(countQuery).get(...countParams);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    log.error('Audit logs GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';
import { rateLimitIp, RATE_LIMITS } from '@/lib/rateLimit';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const rl = rateLimitIp('admin:export', RATE_LIMITS.adminExport, request.headers);
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    let query = `
      SELECT id, name, email, phone, status, size, dimensions, description, referenceFile, createdAt, updatedAt
      FROM custom_orders
    `;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (dateFrom) {
      conditions.push("createdAt >= ?");
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push("createdAt <= ?");
      params.push(dateTo + ' 23:59:59');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY createdAt DESC';

    const orders = db.prepare(query).all(...params);

    const escapeCSV = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (/[=+\-@]/.test(str.charAt(0))) {
        return "'" + str;
      }
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headers = [
      'ID', 'Customer Name', 'Customer Email', 'Customer Phone',
      'Status', 'Size', 'Dimensions', 'Description',
      'Reference File', 'Created At', 'Updated At',
    ];

    const rows = orders.map(o => [
      o.id, o.name || '', o.email || '', o.phone || '',
      o.status || '', o.size || '', o.dimensions || '', o.description || '',
      o.referenceFile || '', o.createdAt, o.updatedAt,
    ].map(escapeCSV).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    // Audit log
    try {
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'export', 'custom_orders', null,
        JSON.stringify({ format: 'csv', rowCount: orders.length })
      );
    } catch { /* audit log failure is non-blocking */ }

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teakle-custom-orders-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    log.error('Custom orders export error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

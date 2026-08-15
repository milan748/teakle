import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    let query = `
      SELECT id, name, email, company, projectType, details, status, createdAt, updatedAt
      FROM trade_enquiries
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

    const enquiries = db.prepare(query).all(...params);

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

    const headers = ['ID', 'Name', 'Email', 'Company', 'Project Type', 'Details', 'Status', 'Created At', 'Updated At'];

    const rows = enquiries.map(e => [
      e.id, e.name || '', e.email || '',
      e.company || '', e.projectType || '', e.details || '',
      e.status || '', e.createdAt, e.updatedAt,
    ].map(escapeCSV).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teakle-trade-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    log.error('Trade enquiries export error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
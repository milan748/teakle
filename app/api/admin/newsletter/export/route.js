import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    let query = `SELECT id, email, status, createdAt FROM newsletter_subscribers`;
    const conditions = [];
    const params = [];

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

    const subscribers = db.prepare(query).all(...params);

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

    const headers = ['ID', 'Email', 'Status', 'Created At'];

    const rows = subscribers.map(s => [
      s.id, s.email || '', s.status || '', s.createdAt,
    ].map(escapeCSV).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teakle-newsletter-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    log.error('Newsletter export error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
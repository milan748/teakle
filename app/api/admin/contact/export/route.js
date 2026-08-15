import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const read = searchParams.get('read') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    let query = `
      SELECT id, name, email, subject, message, read, createdAt
      FROM contact_submissions
    `;
    const conditions = [];
    const params = [];

    if (read !== '') {
      conditions.push("read = ?");
      params.push(read === 'true' ? 1 : 0);
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

    const submissions = db.prepare(query).all(...params);

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

    const headers = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Read', 'Created At'];

    const rows = submissions.map(s => [
      s.id, s.name || '', s.email || '',
      s.subject || '', s.message || '',
      s.read ? 'Yes' : 'No', s.createdAt,
    ].map(escapeCSV).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teakle-contacts-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    log.error('Contacts export error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
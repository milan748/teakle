import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

const VALID_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const db = getDb();
    const enquiry = db.prepare('SELECT * FROM trade_enquiries WHERE id = ?').get(id);
    if (!enquiry) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    log.error('Trade GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const PATCH = withCsrf(async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare("UPDATE trade_enquiries SET status = ?, updatedAt = datetime('now') WHERE id = ?").run(status, id);

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const enquiry = db.prepare('SELECT * FROM trade_enquiries WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    log.error('Trade PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

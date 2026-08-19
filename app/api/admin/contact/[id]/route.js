import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const db = getDb();
    const submission = db.prepare('SELECT * FROM contact_submissions WHERE id = ?').get(id);
    if (!submission) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    // Auto-mark as read when viewing
    if (!submission.read) {
      db.prepare("UPDATE contact_submissions SET read = 1 WHERE id = ?").run(id);
      submission.read = 1;
    }
    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    log.error('Contact GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const PATCH = withCsrf(async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { read } = body;

    if (read === undefined || typeof read !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid read value' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare("UPDATE contact_submissions SET read = ? WHERE id = ?").run(read, id);

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // Audit log
    try {
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'contact_read_status', 'contact_submission', id,
        JSON.stringify({ read })
      );
    } catch { /* audit log failure is non-blocking */ }

    const submission = db.prepare('SELECT id, name, email, subject, message, status, read, createdAt FROM contact_submissions WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    log.error('Contact PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

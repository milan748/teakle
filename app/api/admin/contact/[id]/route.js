import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

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
    console.error('Contact GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
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

    const submission = db.prepare('SELECT id, name, email, subject, message, status, read, createdAt FROM contact_submissions WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    console.error('Contact PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

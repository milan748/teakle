import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteMedia, updateMediaAlt, getMediaById } from '@/lib/media';
import { withCsrf } from '@/lib/csrf';
import { getDb } from '@/lib/db';
import { isValidUUID } from '@/lib/validate';

export const DELETE = withCsrf(async function DELETE(_request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
  }
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
  }

  try {
    const existing = getMediaById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    deleteMedia(id);

    // Audit log
    try {
      const db = getDb();
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'media_delete', 'media', id,
        JSON.stringify({ filename: existing.filename, originalName: existing.originalName })
      );
    } catch { /* audit log failure is non-blocking */ }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err.message || 'Delete failed';
    const status = message.includes('currently used') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
});

export const PUT = withCsrf(async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
  }
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { altText } = body;

    const existing = getMediaById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const updated = updateMediaAlt(id, altText || '');
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
});

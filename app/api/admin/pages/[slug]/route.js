import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deletePage, getPageBySlug } from '@/lib/cms';
import { getDb } from '@/lib/db';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

// GET — Get a single page
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { slug } = await params;

  try {
    const page = getPageBySlug(slug);
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    log.error('Page GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — Delete a page
export const DELETE = withCsrf(async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { slug } = await params;

  try {
    const deleted = deletePage(slug);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    try {
      const db = getDb();
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'page_delete', 'page', slug,
        JSON.stringify({ title: deleted.title, slug: deleted.slug })
      );
    } catch { /* audit log failure is non-blocking */ }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    if (error.message.includes('Cannot delete')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    log.error('Page DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

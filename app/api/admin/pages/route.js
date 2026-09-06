import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllPages, createPage, getPageStatus, getPageSectionCount } from '@/lib/cms';
import { getDb } from '@/lib/db';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

// GET — List all pages with status info
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const pages = getAllPages();
    const enriched = pages.map(page => ({
      ...page,
      pageStatus: getPageStatus(page.slug),
      sectionCount: getPageSectionCount(page.slug),
    }));

    const db = getDb();
    const totalSections = db.prepare('SELECT COUNT(*) as count FROM content_sections').get().count;
    const mediaCount = db.prepare('SELECT COUNT(*) as count FROM media').get().count;

    return NextResponse.json({
      success: true,
      data: {
        pages: enriched,
        stats: {
          totalPages: pages.length,
          totalSections,
          mediaCount,
        },
      },
    });
  } catch (error) {
    log.error('Pages API GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Create a new page
export const POST = withCsrf(async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, slug, template } = body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
  }

  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json(
      { success: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
      { status: 400 }
    );
  }

  try {
    const page = createPage({ title: title.trim(), slug: slug.trim(), template });

    try {
      const db = getDb();
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'page_create', 'page', page.slug,
        JSON.stringify({ title: page.title, slug: page.slug })
      );
    } catch { /* audit log failure is non-blocking */ }

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 });
    }
    log.error('Pages API POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

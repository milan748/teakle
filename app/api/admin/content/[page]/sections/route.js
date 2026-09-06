import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { addSection, deleteSection, duplicateSection, reorderSections, VALID_SECTIONS, VALID_PAGES } from '@/lib/cms';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';
import { getDb } from '@/lib/db';

// POST — Add a new section
export const POST = withCsrf(async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { page } = await params;

  if (!page || !VALID_PAGES.includes(page)) {
    return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { sectionKey, instanceId, sortOrder } = body;

  if (!sectionKey || !VALID_SECTIONS.includes(sectionKey)) {
    return NextResponse.json({ success: false, error: 'Invalid section key' }, { status: 400 });
  }
  if (!instanceId || typeof instanceId !== 'string' || instanceId.length > 128) {
    return NextResponse.json({ success: false, error: 'Invalid instanceId' }, { status: 400 });
  }

  try {
    const section = addSection(page, sectionKey, instanceId, sortOrder || 0);

    try {
      const db = getDb();
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'cms_section_add', 'cms_section', `${page}/${instanceId}`,
        JSON.stringify({ page, sectionKey, instanceId })
      );
    } catch { /* audit log failure is non-blocking */ }

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    log.error('CMS addSection error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
});

// PUT — Reorder sections
export const PUT = withCsrf(async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { page } = await params;

  if (!page || !VALID_PAGES.includes(page)) {
    return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { orderedIds } = body;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ success: false, error: 'orderedIds must be a non-empty array' }, { status: 400 });
  }

  try {
    const sections = reorderSections(page, orderedIds);

    try {
      const db = getDb();
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'cms_sections_reorder', 'cms_section', page,
        JSON.stringify({ page, orderedIds })
      );
    } catch { /* audit log failure is non-blocking */ }

    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    log.error('CMS reorderSections error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

// DELETE — Remove a section
export const DELETE = withCsrf(async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { page } = await params;

  if (!page || !VALID_PAGES.includes(page)) {
    return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { instanceId } = body;

  if (!instanceId || typeof instanceId !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid instanceId' }, { status: 400 });
  }

  try {
    const deleted = deleteSection(page, instanceId);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }

    try {
      const db = getDb();
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'cms_section_delete', 'cms_section', `${page}/${instanceId}`,
        JSON.stringify({ page, instanceId })
      );
    } catch { /* audit log failure is non-blocking */ }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    log.error('CMS deleteSection error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

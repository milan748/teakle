import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createPageTemplate, getPageTemplates, deletePageTemplate, updatePageTemplate } from '@/lib/cms';
import { withCsrf } from '@/lib/csrf';
import { log } from '@/lib/logger';

// GET — List all page templates
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const templates = getPageTemplates();
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export const POST = withCsrf(async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, description, sections, pageDesign } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
  }

  try {
    const template = createPageTemplate({
      name: name.trim(),
      description: description || '',
      sections: sections || [],
      pageDesign: pageDesign || {}
    });

    log.adminAudit(auth.admin.id, 'template_page_create', 'template', template.id, { name: name.trim() });
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

// PUT — Update a page template
export const PUT = withCsrf(async function PUT(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 });
  }

  // Field-level validation: only allow specific fields
  const ALLOWED_FIELDS = ['name', 'description', 'sections', 'pageDesign'];
  const unexpectedFields = Object.keys(updates).filter((key) => !ALLOWED_FIELDS.includes(key));
  if (unexpectedFields.length > 0) {
    return NextResponse.json(
      { success: false, error: `Unexpected fields: ${unexpectedFields.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const template = updatePageTemplate(id, updates);
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    log.adminAudit(auth.admin.id, 'template_page_update', 'template', id, { updatedFields: Object.keys(updates) });
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

// DELETE — Delete a page template
export const DELETE = withCsrf(async function DELETE(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { id } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 });
  }

  try {
    const deleted = deletePageTemplate(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    log.adminAudit(auth.admin.id, 'template_page_delete', 'template', id, { name: deleted.name });
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

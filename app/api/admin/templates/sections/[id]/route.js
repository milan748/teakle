import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { instantiateSectionTemplate, VALID_PAGES } from '@/lib/cms';
import { withCsrf } from '@/lib/csrf';
import { log } from '@/lib/logger';

// POST — Instantiate a section template into a page
export const POST = withCsrf(async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { page, instanceId, sortOrder } = body;

  if (!page || !VALID_PAGES.includes(page)) {
    return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 400 });
  }

  if (!instanceId || typeof instanceId !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid instanceId' }, { status: 400 });
  }

  try {
    const section = instantiateSectionTemplate(page, parseInt(id), instanceId, sortOrder || 0);
    if (!section) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    log.adminAudit(auth.admin.id, 'template_section_instantiate', 'template', parseInt(id), { page, instanceId });
    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

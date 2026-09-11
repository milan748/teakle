import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { instantiatePageTemplate, VALID_PAGES } from '@/lib/cms';
import { withCsrf } from '@/lib/csrf';
import { log } from '@/lib/logger';

// POST — Instantiate a page template into a page
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

  const { page } = body;

  if (!page || !VALID_PAGES.includes(page)) {
    return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 400 });
  }

  try {
    const sections = instantiatePageTemplate(page, parseInt(id));
    if (!sections) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    log.adminAudit(auth.admin.id, 'template_page_instantiate', 'template', parseInt(id), { page });
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

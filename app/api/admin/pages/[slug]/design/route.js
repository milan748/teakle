import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getPageDesignSettings, updatePageDesignSettings } from '@/lib/cms';
import { withCsrf } from '@/lib/csrf';

// GET — Get page design settings
export const GET = withCsrf(async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { slug } = await params;

  try {
    const settings = getPageDesignSettings(slug);
    if (settings === null) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

// PUT — Update page design settings
export const PUT = withCsrf(async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { slug } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate known design properties
  const allowed = ['background', 'contentWidth', 'spacing', 'typography', 'colorTheme', 'mobile'];
  const invalid = Object.keys(body).filter(k => !allowed.includes(k));
  if (invalid.length > 0) {
    return NextResponse.json(
      { success: false, error: `Unknown design properties: ${invalid.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const settings = updatePageDesignSettings(slug, body);
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

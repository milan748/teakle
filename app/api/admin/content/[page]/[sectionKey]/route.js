import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { saveDraftSection, publishSection, discardDraft, VALID_SECTIONS, VALID_PAGES } from '@/lib/cms';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';
import { getDb } from '@/lib/db';

const MAX_LENGTHS = {
  title: 200,
  subtitle: 300,
  eyebrow: 100,
  body: 5000,
  buttonLabel: 100,
  buttonUrl: 500,
  image: 1000,
  mobileImage: 1000,
};

function isSafeUrl(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (lower.startsWith('javascript:')) return false;
  if (lower.startsWith('data:')) return false;
  if (lower.startsWith('vbscript:')) return false;
  if (/^https?:\/\//.test(url)) return true;
  if (url.startsWith('/')) return true;
  return false;
}

function normalizeEnabled(value) {
  if (value === undefined || value === null) return undefined;
  if (value === true || value === 1 || value === '1') return 1;
  if (value === false || value === 0 || value === '0') return 0;
  return undefined;
}

function validateBody(body) {
  for (const [field, maxLen] of Object.entries(MAX_LENGTHS)) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] === 'string') {
      if (body[field].length > maxLen) {
        return `${field} must be under ${maxLen} characters`;
      }
    }
  }
  if (body.image && !isSafeUrl(body.image)) return 'Invalid image URL';
  if (body.mobileImage && !isSafeUrl(body.mobileImage)) return 'Invalid mobile image URL';
  if (body.buttonUrl && !isSafeUrl(body.buttonUrl)) return 'Invalid button URL';
  if (body.sortOrder !== undefined && (typeof body.sortOrder !== 'number' || body.sortOrder < 0)) return 'Invalid sort order';
  return null;
}

// PUT — Save draft
export const PUT = withCsrf(async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { page, sectionKey } = await params;

  if (!page || !sectionKey) {
    return NextResponse.json({ success: false, error: 'Invalid page or section' }, { status: 400 });
  }

  if (!VALID_SECTIONS.includes(sectionKey)) {
    return NextResponse.json({ success: false, error: 'Invalid section key' }, { status: 400 });
  }

  if (!VALID_PAGES.includes(page)) {
    return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const validationError = validateBody(body);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  const enabled = normalizeEnabled(body.enabled);

  try {
    const section = saveDraftSection(page, sectionKey, {
      title: body.title,
      subtitle: body.subtitle,
      eyebrow: body.eyebrow,
      body: body.body,
      image: body.image,
      mobileImage: body.mobileImage,
      buttonLabel: body.buttonLabel,
      buttonUrl: body.buttonUrl,
      sortOrder: body.sortOrder,
      enabled: enabled,
    });

    try {
      const db = getDb();
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'cms_draft_save', 'cms_section', `${page}/${sectionKey}`,
        JSON.stringify({ page, sectionKey })
      );
    } catch { /* audit log failure is non-blocking */ }

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    log.error('CMS PUT error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

// POST — Publish or Discard
export const POST = withCsrf(async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { page, sectionKey } = await params;

  if (!page || !sectionKey) {
    return NextResponse.json({ success: false, error: 'Invalid page or section' }, { status: 400 });
  }

  if (!VALID_SECTIONS.includes(sectionKey) || !VALID_PAGES.includes(page)) {
    return NextResponse.json({ success: false, error: 'Invalid page or section' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    let section;

    if (body.action === 'publish') {
      section = publishSection(page, sectionKey);
    } else if (body.action === 'discard') {
      section = discardDraft(page, sectionKey);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    if (!section) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }

    try {
      const db = getDb();
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, `cms_${body.action}`, 'cms_section', `${page}/${sectionKey}`,
        JSON.stringify({ page, sectionKey, action: body.action })
      );
    } catch { /* audit log failure is non-blocking */ }

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    log.error('CMS POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

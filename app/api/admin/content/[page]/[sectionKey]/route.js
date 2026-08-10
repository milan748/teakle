import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { upsertSection, VALID_SECTIONS, VALID_PAGES } from '@/lib/cms';

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

export async function PUT(request, { params }) {
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

  for (const [field, maxLen] of Object.entries(MAX_LENGTHS)) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] === 'string') {
      if (body[field].length > maxLen) {
        return NextResponse.json(
          { success: false, error: `${field} must be under ${maxLen} characters` },
          { status: 400 }
        );
      }
    }
  }

  if (body.image && !isSafeUrl(body.image)) {
    return NextResponse.json({ success: false, error: 'Invalid image URL' }, { status: 400 });
  }

  if (body.mobileImage && !isSafeUrl(body.mobileImage)) {
    return NextResponse.json({ success: false, error: 'Invalid mobile image URL' }, { status: 400 });
  }

  if (body.buttonUrl && !isSafeUrl(body.buttonUrl)) {
    return NextResponse.json({ success: false, error: 'Invalid button URL' }, { status: 400 });
  }

  if (body.sortOrder !== undefined && (typeof body.sortOrder !== 'number' || body.sortOrder < 0)) {
    return NextResponse.json({ success: false, error: 'Invalid sort order' }, { status: 400 });
  }

  const enabled = normalizeEnabled(body.enabled);

  try {
    const section = upsertSection(page, sectionKey, {
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

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    console.error('CMS PUT error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

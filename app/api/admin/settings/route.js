import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getSiteSettings, updateSiteSetting } from '@/lib/cms';
import { withCsrf } from '@/lib/csrf';

const VALID_KEYS = [
  'footerDescription',
  'contactEmail',
  'instagramUrl',
  'newsletterHeading',
  'newsletterDescription',
  'workshopLocation',
  'responseTime',
  'siteName',
  'supportEmail',
  'supportPhone',
  'legalEntityName',
  'businessAddress',
  'gstin',
  'pan',
  'tax_enabled',
  'tax_rate',
  'tax_label',
  'shipping_enabled',
  'shipping_rate',
  'shipping_method',
  'free_shipping_threshold',
];

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const rows = getSiteSettings();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ success: true, data: settings, validKeys: VALID_KEYS });
  } catch {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export const PUT = withCsrf(async function PUT(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const updated = {};
    for (const [key, value] of Object.entries(body)) {
      if (!VALID_KEYS.includes(key)) continue;
      if (typeof value !== 'string' && value !== null) continue;
      updateSiteSetting(key, value || '');
      updated[key] = value || '';
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
});

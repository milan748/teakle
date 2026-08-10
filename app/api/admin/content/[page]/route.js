import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getPageSections } from '@/lib/cms';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { page } = await params;

  if (!page || typeof page !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid page' }, { status: 400 });
  }

  try {
    const sections = getPageSections(page);
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error('CMS GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

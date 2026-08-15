import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllMedia, createMedia } from '@/lib/media';
import { withCsrf } from '@/lib/csrf';
import { rateLimitIp, RATE_LIMITS } from '@/lib/rateLimit';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const rl = rateLimitIp('media', RATE_LIMITS.media, request.headers);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const result = getAllMedia({ page, limit, search });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load media' }, { status: 500 });
  }
}

export const POST = withCsrf(async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const altText = formData.get('altText') || '';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const media = await createMedia(file, altText);
    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (err) {
    const message = err.message || 'Upload failed';
    const status = message.includes('Invalid file type') || message.includes('too large') || message.includes('Empty') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
});

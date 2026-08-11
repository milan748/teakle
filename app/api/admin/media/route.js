import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllMedia, createMedia } from '@/lib/media';
import { withCsrf } from '@/lib/csrf';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const media = getAllMedia();
    return NextResponse.json({ success: true, data: media });
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

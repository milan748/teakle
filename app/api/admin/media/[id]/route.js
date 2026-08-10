import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteMedia, updateMediaAlt, getMediaById } from '@/lib/media';

export async function DELETE(_request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
  }

  try {
    const existing = getMediaById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    deleteMedia(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err.message || 'Delete failed';
    const status = message.includes('currently used') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { altText } = body;

    const existing = getMediaById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const updated = updateMediaAlt(id, altText || '');
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

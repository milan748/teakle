import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  return NextResponse.json({
    success: true,
    admin: {
      email: auth.admin.email,
      role: auth.admin.role,
    },
  });
}

import { NextResponse } from 'next/server';
import { getCsrfToken, setCsrfCookie } from '@/lib/csrf';

export async function GET() {
  const token = await getCsrfToken();
  await setCsrfCookie(token);
  return NextResponse.json({ csrfToken: token });
}

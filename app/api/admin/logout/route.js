import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

export const POST = withCsrf(async function POST() {
  try {
    await deleteSession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    log.error('Admin logout error:', error);
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
});

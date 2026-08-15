import { NextResponse } from 'next/server';
import { deleteSession, getSession } from '@/lib/session';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';
import { getDb } from '@/lib/db';

export const POST = withCsrf(async function POST() {
  try {
    const session = await getSession();
    await deleteSession();

    if (session) {
      try {
        const db = getDb();
        db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
          session.adminId, 'logout', 'admin', session.adminId, JSON.stringify({ email: session.email })
        );
      } catch { /* audit log failure is non-blocking */ }
      log.info(`Admin logout — ${session.email}`);
    }

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

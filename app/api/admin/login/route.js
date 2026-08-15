import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { rateLimitIp, RATE_LIMITS } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

export const POST = withCsrf(async function POST(request) {
  try {
    const rl = rateLimitIp('admin:login', RATE_LIMITS.adminLogin, request.headers);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (!body.email || typeof body.email !== 'string' || !body.password || typeof body.password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const normalizedEmail = body.email.trim().toLowerCase();
    const db = getDb();
    const admin = db.prepare('SELECT id, email, passwordHash, role FROM admins WHERE email = ?').get(
      normalizedEmail
    );

    if (!admin) {
      log.adminLogin(normalizedEmail, false);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    let valid;
    try {
      valid = await bcrypt.compare(body.password, admin.passwordHash);
    } catch {
      log.adminLogin(normalizedEmail, false);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!valid) {
      log.adminLogin(normalizedEmail, false);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    try {
      await createSession({
        id: admin.id,
        email: admin.email,
        role: admin.role,
      });
    } catch {
      log.adminLogin(normalizedEmail, false);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    log.adminLogin(normalizedEmail, true);

    try {
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        admin.id, 'login', 'admin', admin.id, JSON.stringify({ email: admin.email })
      );
    } catch { /* audit log failure is non-blocking */ }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        email: admin.email,
        role: admin.role,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }
});

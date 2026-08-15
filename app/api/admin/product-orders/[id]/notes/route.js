import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

export const POST = withCsrf(async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const { content, isInternal = false } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Note content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ success: false, error: 'Note must be 5000 characters or less' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare('SELECT id, orderNumber FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const result = db.prepare(
      `INSERT INTO order_notes (orderId, author, authorType, content, isInternal)
       VALUES (?, ?, 'admin', ?, ?)`
    ).run(orderId, auth.admin.email, content.trim(), isInternal ? 1 : 0);

    log.orderNoteAdded(order.orderNumber, auth.admin.email, isInternal);

    // Audit log
    try {
      const { getDb: getDbFn } = await import('@/lib/db');
      const auditDb = getDbFn();
      auditDb.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'order_note_added', 'order', orderId,
        JSON.stringify({ orderNumber: order.orderNumber, isInternal: !!isInternal })
      );
    } catch { /* audit log failure is non-blocking */ }

    // Order activity
    try {
      const { getDb: getDbFn } = await import('@/lib/db');
      const actDb = getDbFn();
      actDb.prepare(
        `INSERT INTO order_activity (orderId, actorType, actorId, action, oldValue, newValue, note, isCustomerVisible)
         VALUES (?, 'admin', ?, 'note_added', NULL, NULL, ?, ?)`
      ).run(orderId, auth.admin.email, content.trim().slice(0, 200), isInternal ? 0 : 1);
    } catch { /* activity log failure is non-blocking */ }

    return NextResponse.json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        author: auth.admin.email,
        authorType: 'admin',
        content: content.trim(),
        isInternal: isInternal ? 1 : 0,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    log.error('Order notes POST error', { message: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

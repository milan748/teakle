import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { VALID_ORDER_STATUSES, VALID_TRANSITIONS, isValidStatusTransition } from '@/app/api/orders/route';
import { log } from '@/lib/logger';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { withCsrf } from '@/lib/csrf';

export const PATCH = withCsrf(async function PATCH(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const rl = rateLimit('admin:bulk', RATE_LIMITS.adminBulkAction);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { orderIds, status } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, error: 'orderIds array is required' }, { status: 400 });
    }

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const normalizedStatus = status.toUpperCase();
    if (!VALID_ORDER_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json({ success: false, error: `Invalid status. Allowed: ${VALID_ORDER_STATUSES.join(', ')}` }, { status: 400 });
    }

    if (normalizedStatus === 'PAID' || normalizedStatus === 'REFUNDED') {
      return NextResponse.json({ success: false, error: 'Payment status cannot be modified via bulk action' }, { status: 400 });
    }

    const db = getDb();

    const orders = db.prepare(`
      SELECT id, orderNumber, status
      FROM orders
      WHERE id IN (${orderIds.map(() => '?').join(',')})
    `).all(...orderIds);

    const results = { success: 0, failed: 0, errors: [] };

    for (const order of orders) {
      if (!isValidStatusTransition(order.status, normalizedStatus)) {
        results.failed++;
        results.errors.push({ orderId: order.id, orderNumber: order.orderNumber, error: `Cannot transition from ${order.status} to ${normalizedStatus}` });
        continue;
      }

      try {
        const updateOrder = db.transaction(() => {
          db.prepare("UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?")
            .run(normalizedStatus, order.id);

          db.prepare(
            `INSERT INTO order_status_history (orderId, oldStatus, newStatus, changedBy, changedByType, note)
             VALUES (?, ?, ?, ?, 'admin', 'Bulk status update')`
          ).run(order.id, order.status, normalizedStatus, auth.admin.email);

          db.prepare(
            `INSERT INTO order_activity (orderId, actorType, actorId, action, oldValue, newValue, note, isCustomerVisible)
             VALUES (?, 'admin', ?, 'status_changed', ?, ?, 'Bulk status update', 1)`
          ).run(order.id, auth.admin.email, order.status, normalizedStatus);

          log.adminAudit(auth.admin.id, 'bulk_status_change', 'order', order.id, { oldStatus: order.status, newStatus: normalizedStatus });
          log.orderActivity(order.id, 'admin', auth.admin.email, 'status_changed', order.status, normalizedStatus, 'Bulk status update', 1);
        });

        updateOrder();
        results.success++;
      } catch (e) {
        results.failed++;
        results.errors.push({ orderId: order.id, orderNumber: order.orderNumber, error: e.message });
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    log.error('Bulk order action error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
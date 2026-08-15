import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { VALID_ORDER_STATUSES, VALID_TRANSITIONS, isValidStatusTransition } from '@/app/api/orders/route';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';
import { sendOrderStatusUpdate } from '@/lib/email';
import { getPaymentByOrderId, updatePaymentStatus } from '@/lib/payment';

export async function GET(_request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDb();
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }

    const order = db.prepare(`
      SELECT o.*, c.email as customerEmail, c.name as customerName
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customerId
      WHERE o.id = ?
    `).get(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const items = db.prepare(
      'SELECT productId, productNameSnapshot, productImage, unitPrice, quantity, lineTotal, sku FROM order_items WHERE orderId = ?'
    ).all(orderId);

    const history = db.prepare(
      'SELECT oldStatus, newStatus, changedBy, changedByType, note, createdAt FROM order_status_history WHERE orderId = ? ORDER BY createdAt ASC'
    ).all(orderId);

    const notes = db.prepare(
      'SELECT id, author, authorType, content, isInternal, createdAt FROM order_notes WHERE orderId = ? ORDER BY createdAt ASC'
    ).all(orderId);

    return NextResponse.json({ success: true, data: { ...order, items, history, notes } });
  } catch (error) {
    log.error('Product order detail error', { message: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const PATCH = withCsrf(async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const normalizedStatus = status.toUpperCase();
    if (!VALID_ORDER_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json({ success: false, error: `Invalid status. Allowed: ${VALID_ORDER_STATUSES.join(', ')}` }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare('SELECT id, status, orderNumber, shippingEmail FROM orders WHERE id = ?').get(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (!isValidStatusTransition(order.status, normalizedStatus)) {
      return NextResponse.json({
        success: false,
        error: `Cannot transition from ${order.status} to ${normalizedStatus}. Allowed: ${(VALID_TRANSITIONS[order.status] || []).join(', ') || 'none'}`,
      }, { status: 400 });
    }

    const updateStatus = db.transaction(() => {
      db.prepare("UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?")
        .run(normalizedStatus, orderId);

      db.prepare(
        `INSERT INTO order_status_history (orderId, oldStatus, newStatus, changedBy, changedByType, note)
         VALUES (?, ?, ?, ?, 'admin', NULL)`
      ).run(orderId, order.status, normalizedStatus, auth.admin.email);
    });

    updateStatus();

    // Update payment status when order is cancelled
    if (normalizedStatus === 'CANCELLED') {
      const existingPayment = getPaymentByOrderId(orderId);
      if (existingPayment && existingPayment.status !== 'CANCELLED' && existingPayment.status !== 'REFUNDED') {
        updatePaymentStatus(existingPayment.id, 'CANCELLED');
      }
    }

    log.orderStatusChange(order.orderNumber, order.status, normalizedStatus, auth.admin.email);

    // Send status update email (non-blocking)
    if (order.shippingEmail) {
      sendOrderStatusUpdate({
        to: order.shippingEmail,
        orderNumber: order.orderNumber,
        oldStatus: order.status,
        newStatus: normalizedStatus,
      }).catch(err => log.error('Order status email failed', { message: err.message }));
    }

    return NextResponse.json({ success: true, data: { id: orderId, status: normalizedStatus } });
  } catch (error) {
    log.error('Product order status update error', { message: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

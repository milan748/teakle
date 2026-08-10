import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { VALID_ORDER_STATUSES, VALID_TRANSITIONS, isValidStatusTransition } from '@/app/api/orders/route';
import { log } from '@/lib/logger';

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
      'SELECT productId, productNameSnapshot, productImage, unitPrice, quantity, lineTotal FROM order_items WHERE orderId = ?'
    ).all(orderId);

    return NextResponse.json({ success: true, data: { ...order, items } });
  } catch (error) {
    console.error('Product order detail error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
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
    const order = db.prepare('SELECT id, status, orderNumber FROM orders WHERE id = ?').get(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (!isValidStatusTransition(order.status, normalizedStatus)) {
      return NextResponse.json({
        success: false,
        error: `Cannot transition from ${order.status} to ${normalizedStatus}. Allowed: ${(VALID_TRANSITIONS[order.status] || []).join(', ') || 'none'}`,
      }, { status: 400 });
    }

    db.prepare('UPDATE orders SET status = ?, updatedAt = datetime(\'now\') WHERE id = ?')
      .run(normalizedStatus, orderId);

    log.orderStatusChange(order.orderNumber, order.status, normalizedStatus, auth.admin.email);

    return NextResponse.json({ success: true, data: { id: orderId, status: normalizedStatus } });
  } catch (error) {
    console.error('Product order status update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

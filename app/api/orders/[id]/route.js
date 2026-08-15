import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';
import { sendOrderCancellation } from '@/lib/email';
import { updatePaymentStatus, getPaymentByOrderId } from '@/lib/payment';

const VALID_ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
const CUSTOMER_CANCEL_STATUSES = ['PENDING', 'CONFIRMED'];

export async function GET(_request, { params }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return Response.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare(`
      SELECT id, orderNumber, status, paymentStatus,
             subtotal, shippingAmount, totalAmount,
             shippingFirstName, shippingLastName, shippingEmail, shippingPhone,
             shippingAddress, shippingApartment, shippingCity, shippingState, shippingPin, shippingCountry,
             billingSameAsShipping, billingFirstName, billingLastName,
             billingAddress, billingApartment, billingCity, billingState, billingPin,
             notes, createdAt, updatedAt
      FROM orders WHERE id = ? AND customerId = ?
    `).get(orderId, session.customerId);

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = db.prepare(
      'SELECT productId, productNameSnapshot, productImage, unitPrice, quantity, lineTotal FROM order_items WHERE orderId = ?'
    ).all(orderId);

    const history = db.prepare(
      'SELECT oldStatus, newStatus, changedByType, note, createdAt FROM order_status_history WHERE orderId = ? ORDER BY createdAt ASC'
    ).all(orderId);

    const notes = db.prepare(
      'SELECT author, authorType, content, isInternal, createdAt FROM order_notes WHERE orderId = ? AND isInternal = 0 ORDER BY createdAt ASC'
    ).all(orderId);

    return Response.json({ order: { ...order, items, history, notes } });
  } catch (err) {
    log.error('Order detail GET error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PATCH = withCsrf(async function PATCH(request, { params }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return Response.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== 'cancel') {
      return Response.json({ error: 'Invalid action. Only "cancel" is supported.' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare(
      'SELECT id, orderNumber, status, customerId FROM orders WHERE id = ? AND customerId = ?'
    ).get(orderId, session.customerId);

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!CUSTOMER_CANCEL_STATUSES.includes(order.status)) {
      return Response.json({
        error: `Cannot cancel order in "${order.status}" status. Only PENDING or CONFIRMED orders can be cancelled.`,
      }, { status: 400 });
    }

    const cancelOrder = db.transaction(() => {
      db.prepare("UPDATE orders SET status = 'CANCELLED', paymentStatus = 'CANCELLED', updatedAt = datetime('now') WHERE id = ?")
        .run(orderId);

      db.prepare(
        `INSERT INTO order_status_history (orderId, oldStatus, newStatus, changedBy, changedByType, note)
         VALUES (?, ?, 'CANCELLED', ?, 'customer', 'Customer requested cancellation')`
      ).run(orderId, order.status, session.email);
    });

    cancelOrder();

    // Cancel any existing payment record
    const existingPayment = getPaymentByOrderId(orderId);
    if (existingPayment && existingPayment.status !== 'CANCELLED') {
      updatePaymentStatus(existingPayment.id, 'CANCELLED');
    }

    log.orderCancelled(order.orderNumber, session.customerId);

    // Send cancellation email (non-blocking)
    sendOrderCancellation({
      to: session.email,
      orderNumber: order.orderNumber,
      reason: 'Customer requested cancellation',
    }).catch(err => log.error('Order cancellation email failed', { message: err.message }));

    return Response.json({ ok: true, status: 'CANCELLED' });
  } catch (err) {
    log.error('Order cancel error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { getProductById } from '@/app/data/products';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { log } from '@/lib/logger';

const VALID_ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
const VALID_PAYMENT_STATUSES = ['UNPAID', 'PAID'];
const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TK-${ts}-${rand}`;
}

function isValidStatusTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const orders = db.prepare(
      `SELECT id, orderNumber, status, paymentStatus, subtotal, shippingAmount, totalAmount,
              shippingFirstName, shippingLastName, shippingEmail, createdAt, updatedAt
       FROM orders WHERE customerId = ? ORDER BY createdAt DESC`
    ).all(session.customerId);

    const ordersWithItems = orders.map((order) => {
      const items = db.prepare(
        'SELECT productId, productNameSnapshot, unitPrice, quantity, lineTotal FROM order_items WHERE orderId = ?'
      ).all(order.id);
      return { ...order, items };
    });

    return Response.json({ orders: ordersWithItems });
  } catch (err) {
    console.error('Orders GET error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const rl = rateLimit('order:create', RATE_LIMITS.orderCreate);
    if (!rl.allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { shipping = {}, billing = {}, billingSameAsShipping = true, notes = '' } = body;

    if (!shipping.firstName || !shipping.lastName || !shipping.email || !shipping.address || !shipping.city || !shipping.state || !shipping.pin) {
      return Response.json({ error: 'All required shipping fields must be filled' }, { status: 400 });
    }

    const db = getDb();
    const cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(session.customerId);
    if (!cart) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const cartRows = db.prepare('SELECT * FROM cart_items WHERE cartId = ?').all(cart.id);
    if (cartRows.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const ci of cartRows) {
      const product = getProductById(ci.productId);
      if (!product) {
        log.orderFailed(`Product not found: ${ci.productId}`);
        return Response.json({ error: `Product "${ci.productId}" is no longer available` }, { status: 400 });
      }
      const price = product.price || 0;
      const qty = ci.quantity;
      const lineTotal = price * qty;
      subtotal += lineTotal;
      orderItems.push({
        productId: ci.productId,
        productNameSnapshot: product.name,
        productImage: product.images?.[0] || '',
        unitPrice: price,
        quantity: qty,
        lineTotal,
      });
    }

    const shippingAmount = 0;
    const totalAmount = subtotal + shippingAmount;

    const createOrder = db.transaction(() => {
      const orderNumber = generateOrderNumber();
      const result = db.prepare(`
        INSERT INTO orders (
          customerId, orderNumber, status, paymentStatus,
          subtotal, shippingAmount, totalAmount,
          shippingFirstName, shippingLastName, shippingEmail, shippingPhone,
          shippingAddress, shippingApartment, shippingCity, shippingState, shippingPin, shippingCountry,
          billingSameAsShipping, billingFirstName, billingLastName,
          billingAddress, billingApartment, billingCity, billingState, billingPin,
          notes
        ) VALUES (?, ?, 'PENDING', 'UNPAID', ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?)
      `).run(
        session.customerId, orderNumber, subtotal, shippingAmount, totalAmount,
        shipping.firstName || '', shipping.lastName || '', shipping.email || '', shipping.phone || '',
        shipping.address || '', shipping.apartment || '', shipping.city || '', shipping.state || '', shipping.pin || '', shipping.country || 'India',
        billingSameAsShipping ? 1 : 0,
        billingSameAsShipping ? '' : (billing.firstName || ''),
        billingSameAsShipping ? '' : (billing.lastName || ''),
        billingSameAsShipping ? '' : (billing.address || ''),
        billingSameAsShipping ? '' : (billing.apartment || ''),
        billingSameAsShipping ? '' : (billing.city || ''),
        billingSameAsShipping ? '' : (billing.state || ''),
        billingSameAsShipping ? '' : (billing.pin || ''),
        notes ? String(notes).slice(0, 2000) : ''
      );

      const orderId = result.lastInsertRowid;

      for (const item of orderItems) {
        db.prepare(
          `INSERT INTO order_items (orderId, productId, productNameSnapshot, productImage, unitPrice, quantity, lineTotal, productName, price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(orderId, item.productId, item.productNameSnapshot, item.productImage, item.unitPrice, item.quantity, item.lineTotal, item.productNameSnapshot, item.unitPrice);
      }

      db.prepare('DELETE FROM cart_items WHERE cartId = ?').run(cart.id);

      return { orderId, orderNumber };
    });

    const { orderId, orderNumber } = createOrder();

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare(
      'SELECT productId, productNameSnapshot, unitPrice, quantity, lineTotal, productImage FROM order_items WHERE orderId = ?'
    ).all(orderId);

    log.orderCreated(orderNumber, session.customerId, totalAmount);

    return Response.json({ ok: true, order: { ...order, items } });
  } catch (err) {
    log.error('Order creation failed', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export { VALID_ORDER_STATUSES, VALID_PAYMENT_STATUSES, VALID_TRANSITIONS, isValidStatusTransition };

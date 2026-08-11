import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { getProduct } from '@/lib/products';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { validateCheckoutAddresses } from '@/lib/validateAddress';
import { calculateOrderTotal } from '@/lib/orderPricing';
import { withCsrf } from '@/lib/csrf';

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
      `SELECT id, orderNumber, status, paymentStatus, subtotal, shippingAmount, taxAmount, discountAmount, totalAmount,
              shippingFirstName, shippingLastName, shippingEmail, createdAt, updatedAt
       FROM orders WHERE customerId = ? ORDER BY createdAt DESC`
    ).all(session.customerId);

    const ordersWithItems = orders.map((order) => {
      const items = db.prepare(
        'SELECT productId, productNameSnapshot, unitPrice, quantity, lineTotal, sku FROM order_items WHERE orderId = ?'
      ).all(order.id);
      return { ...order, items };
    });

    return Response.json({ orders: ordersWithItems });
  } catch (err) {
    log.error('Orders GET error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withCsrf(async function POST(req) {
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

    // 1. Validate addresses
    const addressValidation = validateCheckoutAddresses(shipping, billing, billingSameAsShipping);
    if (!addressValidation.valid) {
      return Response.json({ error: 'Invalid address', details: addressValidation.errors }, { status: 400 });
    }

    const db = getDb();

    // 2. Load cart
    const cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(session.customerId);
    if (!cart) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const cartRows = db.prepare('SELECT * FROM cart_items WHERE cartId = ?').all(cart.id);
    if (cartRows.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 3. Calculate order total (server-side)
    const pricing = calculateOrderTotal({
      cartItems: cartRows,
      getProductById: (id) => getProduct(id, db),
      shippingAddress: addressValidation.shipping,
    });

    if (pricing.error) {
      log.orderFailed(pricing.error);
      return Response.json({ error: pricing.error }, { status: 400 });
    }

    // 4. Create order transactionally
    const shippingData = addressValidation.shipping;
    const billingData = billingSameAsShipping ? addressValidation.shipping : addressValidation.billing;

    const createOrder = db.transaction(() => {
      const orderNumber = generateOrderNumber();
      const result = db.prepare(`
        INSERT INTO orders (
          customerId, orderNumber, status, paymentStatus,
          subtotal, shippingAmount, taxAmount, discountAmount, totalAmount,
          shippingFirstName, shippingLastName, shippingEmail, shippingPhone,
          shippingAddress, shippingApartment, shippingCity, shippingState, shippingPin, shippingCountry,
          billingSameAsShipping, billingFirstName, billingLastName,
          billingAddress, billingApartment, billingCity, billingState, billingPin,
          billingPhone, billingEmail, billingCountry,
          notes
        ) VALUES (?, ?, 'PENDING', 'UNPAID', ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?)
      `).run(
        session.customerId, orderNumber,
        pricing.subtotal, pricing.shippingAmount, pricing.taxAmount, pricing.discountAmount, pricing.total,
        shippingData.firstName, shippingData.lastName, shippingData.email, shippingData.phone,
        shippingData.address, shippingData.apartment, shippingData.city, shippingData.state, shippingData.pin, shippingData.country,
        billingSameAsShipping ? 1 : 0,
        billingData.firstName, billingData.lastName,
        billingData.address, billingData.apartment, billingData.city, billingData.state, billingData.pin,
        billingData.phone, billingData.email, billingData.country,
        notes ? String(notes).slice(0, 2000) : ''
      );

      const orderId = result.lastInsertRowid;

      for (const item of pricing.orderItems) {
        db.prepare(
          `INSERT INTO order_items (orderId, productId, productNameSnapshot, productImage, unitPrice, quantity, lineTotal, productName, price, sku)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(orderId, item.productId, item.productNameSnapshot, item.productImage, item.unitPrice, item.quantity, item.lineTotal, item.productNameSnapshot, item.unitPrice, item.sku);
      }

      db.prepare('DELETE FROM cart_items WHERE cartId = ?').run(cart.id);

      return { orderId, orderNumber };
    });

    const { orderId, orderNumber } = createOrder();

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare(
      'SELECT productId, productNameSnapshot, unitPrice, quantity, lineTotal, productImage, sku FROM order_items WHERE orderId = ?'
    ).all(orderId);

    log.orderCreated(orderNumber, session.customerId, pricing.total);

    return Response.json({ ok: true, order: { ...order, items }, messages: pricing.messages });
  } catch (err) {
    log.error('Order creation failed', { message: err.message });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export { VALID_ORDER_STATUSES, VALID_PAYMENT_STATUSES, VALID_TRANSITIONS, isValidStatusTransition };

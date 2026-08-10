import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { getProductById } from '@/app/data/products';

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TK-${ts}-${rand}`;
}

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const orders = db.prepare(
      `SELECT * FROM orders WHERE customerId = ? ORDER BY createdAt DESC`
    ).all(session.customerId);

    const ordersWithItems = orders.map((order) => {
      const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
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
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      shipping = {},
      billing = {},
      billingSameAsShipping = true,
      notes = '',
    } = body;

    if (!shipping.firstName || !shipping.lastName || !shipping.email || !shipping.address || !shipping.city || !shipping.state || !shipping.pin) {
      return Response.json({ error: 'All required shipping fields must be filled' }, { status: 400 });
    }

    const db = getDb();

    let cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(session.customerId);
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
      if (!product) continue;
      const price = product.price || 0;
      subtotal += price * ci.quantity;
      orderItems.push({
        productId: ci.productId,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price,
        quantity: ci.quantity,
      });
    }

    const shippingAmount = 0;
    const totalAmount = subtotal + shippingAmount;
    const orderNumber = generateOrderNumber();

    const result = db.prepare(`
      INSERT INTO orders (
        customerId, orderNumber, status, subtotal, shippingAmount, totalAmount,
        shippingFirstName, shippingLastName, shippingEmail, shippingPhone,
        shippingAddress, shippingApartment, shippingCity, shippingState, shippingPin, shippingCountry,
        billingSameAsShipping, billingFirstName, billingLastName,
        billingAddress, billingApartment, billingCity, billingState, billingPin,
        notes
      ) VALUES (?, ?, 'pending', ?, ?, ?,
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
      notes || ''
    );

    const orderId = result.lastInsertRowid;

    for (const item of orderItems) {
      db.prepare(
        'INSERT INTO order_items (orderId, productId, productName, productImage, price, quantity) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(orderId, item.productId, item.productName, item.productImage, item.price, item.quantity);
    }

    db.prepare('DELETE FROM cart_items WHERE cartId = ?').run(cart.id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(orderId);

    return Response.json({ ok: true, order: { ...order, items } });
  } catch (err) {
    console.error('Orders POST error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

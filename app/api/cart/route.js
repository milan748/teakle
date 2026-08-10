import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { getProductById } from '@/app/data/products';

function getOrCreateCart(db, customerId) {
  let cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(customerId);
  if (!cart) {
    const result = db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(customerId);
    cart = { id: result.lastInsertRowid };
  }
  return cart;
}

function sanitizeQty(qty) {
  const n = Number(qty);
  if (!Number.isInteger(n) || n < 1 || n > 10) return null;
  return n;
}

function formatCartItems(db, cartId) {
  const rows = db.prepare(
    'SELECT ci.id, ci.productId, ci.quantity FROM cart_items ci WHERE ci.cartId = ?'
  ).all(cartId);

  return rows.map((row) => {
    const product = getProductById(row.productId);
    return {
      id: row.productId,
      cartItemId: row.id,
      name: product?.name || row.productId,
      price: product?.priceFormatted || '₹0',
      priceRaw: product?.price || 0,
      image: product?.images?.[0] || '',
      qty: row.quantity,
    };
  });
}

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ items: [] });
    }

    const db = getDb();
    const cart = getOrCreateCart(db, session.customerId);
    const items = formatCartItems(db, cart.id);

    return Response.json({ items });
  } catch (err) {
    console.error('Cart GET error:', err);
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
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    const qty = sanitizeQty(body.quantity ?? 1);

    if (!productId) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 });
    }
    if (qty === null) {
      return Response.json({ error: 'Quantity must be an integer between 1 and 10' }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    if (product.isHero && qty > 1) {
      return Response.json({ error: 'Hero product is limited to quantity 1' }, { status: 400 });
    }

    const db = getDb();
    const cart = getOrCreateCart(db, session.customerId);

    const existing = db.prepare(
      'SELECT id, quantity FROM cart_items WHERE cartId = ? AND productId = ?'
    ).get(cart.id, productId);

    if (existing) {
      const newQty = product.isHero ? 1 : Math.min(10, existing.quantity + qty);
      db.prepare('UPDATE cart_items SET quantity = ?, updatedAt = datetime(\'now\') WHERE id = ?')
        .run(newQty, existing.id);
    } else {
      db.prepare(
        'INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)'
      ).run(cart.id, productId, product.isHero ? 1 : qty);
    }

    const items = formatCartItems(db, cart.id);
    return Response.json({ ok: true, items });
  } catch (err) {
    console.error('Cart POST error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    const qty = body.quantity === 0 ? 0 : sanitizeQty(body.quantity);

    if (!productId) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 });
    }
    if (qty === null) {
      return Response.json({ error: 'Quantity must be an integer between 1 and 10' }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const db = getDb();
    const cart = getOrCreateCart(db, session.customerId);

    if (qty === 0) {
      db.prepare('DELETE FROM cart_items WHERE cartId = ? AND productId = ?')
        .run(cart.id, productId);
    } else {
      const finalQty = product.isHero ? 1 : qty;
      db.prepare(
        'UPDATE cart_items SET quantity = ?, updatedAt = datetime(\'now\') WHERE cartId = ? AND productId = ?'
      ).run(finalQty, cart.id, productId);
    }

    const items = formatCartItems(db, cart.id);
    return Response.json({ ok: true, items });
  } catch (err) {
    console.error('Cart PUT error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

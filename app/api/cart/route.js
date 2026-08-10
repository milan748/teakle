import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { getProductById } from '@/app/data/products';

function parsePrice(priceStr) {
  if (typeof priceStr === 'number') return priceStr;
  return parseInt(String(priceStr).replace(/[^0-9]/g, ''), 10) || 0;
}

function getOrCreateCart(db, customerId) {
  let cart = db.prepare('SELECT id FROM carts WHERE customerId = ?').get(customerId);
  if (!cart) {
    const result = db.prepare('INSERT INTO carts (customerId) VALUES (?)').run(customerId);
    cart = { id: result.lastInsertRowid };
  }
  return cart;
}

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ items: [] });
    }

    const db = getDb();
    const cart = getOrCreateCart(db, session.customerId);
    const rows = db.prepare(
      `SELECT ci.id, ci.productId, ci.quantity, ci.createdAt
       FROM cart_items ci WHERE ci.cartId = ?`
    ).all(cart.id);

    const items = rows.map((row) => {
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

    const { productId, quantity = 1 } = await req.json();

    if (!productId) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.isHero && quantity > 1) {
      return Response.json({ error: 'Hero product is limited to quantity 1' }, { status: 400 });
    }

    if (quantity < 1 || quantity > 10) {
      return Response.json({ error: 'Quantity must be between 1 and 10' }, { status: 400 });
    }

    const db = getDb();
    const cart = getOrCreateCart(db, session.customerId);

    const existing = db.prepare(
      'SELECT id, quantity FROM cart_items WHERE cartId = ? AND productId = ?'
    ).get(cart.id, productId);

    if (existing) {
      const newQty = product.isHero ? 1 : Math.min(10, existing.quantity + quantity);
      db.prepare('UPDATE cart_items SET quantity = ?, updatedAt = datetime(\'now\') WHERE id = ?')
        .run(newQty, existing.id);
    } else {
      db.prepare(
        'INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)'
      ).run(cart.id, productId, product.isHero ? 1 : Math.min(10, quantity));
    }

    const rows = db.prepare(
      `SELECT ci.id, ci.productId, ci.quantity
       FROM cart_items ci WHERE ci.cartId = ?`
    ).all(cart.id);

    const items = rows.map((row) => {
      const p = getProductById(row.productId);
      return {
        id: row.productId,
        cartItemId: row.id,
        name: p?.name || row.productId,
        price: p?.priceFormatted || '₹0',
        priceRaw: p?.price || 0,
        image: p?.images?.[0] || '',
        qty: row.quantity,
      };
    });

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

    const { productId, quantity } = await req.json();

    if (!productId || quantity === undefined) {
      return Response.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }

    if (quantity < 0 || quantity > 10) {
      return Response.json({ error: 'Quantity must be between 0 and 10' }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const db = getDb();
    const cart = getOrCreateCart(db, session.customerId);

    if (quantity === 0) {
      db.prepare('DELETE FROM cart_items WHERE cartId = ? AND productId = ?')
        .run(cart.id, productId);
    } else {
      const finalQty = product.isHero ? 1 : quantity;
      db.prepare(
        'UPDATE cart_items SET quantity = ?, updatedAt = datetime(\'now\') WHERE cartId = ? AND productId = ?'
      ).run(finalQty, cart.id, productId);
    }

    const rows = db.prepare(
      `SELECT ci.id, ci.productId, ci.quantity
       FROM cart_items ci WHERE ci.cartId = ?`
    ).all(cart.id);

    const items = rows.map((row) => {
      const p = getProductById(row.productId);
      return {
        id: row.productId,
        cartItemId: row.id,
        name: p?.name || row.productId,
        price: p?.priceFormatted || '₹0',
        priceRaw: p?.price || 0,
        image: p?.images?.[0] || '',
        qty: row.quantity,
      };
    });

    return Response.json({ ok: true, items });
  } catch (err) {
    console.error('Cart PUT error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

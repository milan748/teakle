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

export async function DELETE(_req, { params }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { itemId } = await params;
    if (!itemId || typeof itemId !== 'string') {
      return Response.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const db = getDb();
    const cart = getOrCreateCart(db, session.customerId);

    db.prepare('DELETE FROM cart_items WHERE cartId = ? AND productId = ?')
      .run(cart.id, itemId.trim());

    const items = formatCartItems(db, cart.id);
    return Response.json({ ok: true, items });
  } catch (err) {
    console.error('Cart DELETE error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

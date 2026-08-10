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

export async function DELETE(_req, { params }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { itemId } = await params;
    if (!itemId) {
      return Response.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const db = getDb();
    const cart = getOrCreateCart(db, session.customerId);

    db.prepare('DELETE FROM cart_items WHERE cartId = ? AND productId = ?')
      .run(cart.id, itemId);

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
    console.error('Cart DELETE error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

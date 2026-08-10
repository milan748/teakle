import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { getProductById } from '@/app/data/products';

function getOrCreateWishlist(db, customerId) {
  let wl = db.prepare('SELECT id FROM wishlists WHERE customerId = ?').get(customerId);
  if (!wl) {
    const result = db.prepare('INSERT INTO wishlists (customerId) VALUES (?)').run(customerId);
    wl = { id: result.lastInsertRowid };
  }
  return wl;
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
    const wl = getOrCreateWishlist(db, session.customerId);

    db.prepare('DELETE FROM wishlist_items WHERE wishlistId = ? AND productId = ?')
      .run(wl.id, itemId);

    const rows = db.prepare(
      'SELECT wi.id, wi.productId FROM wishlist_items wi WHERE wi.wishlistId = ?'
    ).all(wl.id);

    const items = rows.map((row) => {
      const p = getProductById(row.productId);
      return {
        id: row.productId,
        wishlistItemId: row.id,
        name: p?.name || row.productId,
        price: p?.priceFormatted || '₹0',
        priceRaw: p?.price || 0,
        image: p?.images?.[0] || '',
      };
    });

    return Response.json({ ok: true, items });
  } catch (err) {
    console.error('Wishlist DELETE error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

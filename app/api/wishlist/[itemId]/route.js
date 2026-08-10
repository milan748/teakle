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

function formatWishlistItems(db, wishlistId) {
  const rows = db.prepare(
    'SELECT wi.id, wi.productId, wi.createdAt FROM wishlist_items wi WHERE wi.wishlistId = ?'
  ).all(wishlistId);

  return rows.map((row) => {
    const product = getProductById(row.productId);
    return {
      id: row.productId,
      wishlistItemId: row.id,
      name: product?.name || row.productId,
      price: product?.priceFormatted || '₹0',
      priceRaw: product?.price || 0,
      image: product?.images?.[0] || '',
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
    const wl = getOrCreateWishlist(db, session.customerId);

    db.prepare('DELETE FROM wishlist_items WHERE wishlistId = ? AND productId = ?')
      .run(wl.id, itemId.trim());

    const items = formatWishlistItems(db, wl.id);
    return Response.json({ ok: true, items });
  } catch (err) {
    console.error('Wishlist DELETE error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

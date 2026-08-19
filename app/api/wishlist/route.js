import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { getProductById } from '@/app/data/products';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

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

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ items: [] });
    }

    const db = getDb();
    const wl = getOrCreateWishlist(db, session.customerId);
    const items = formatWishlistItems(db, wl.id);

    return Response.json({ items });
  } catch (err) {
    log.error('Wishlist GET error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withCsrf(async function POST(req) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    if (!productId) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const db = getDb();
    const wl = getOrCreateWishlist(db, session.customerId);

    const existing = db.prepare(
      'SELECT id FROM wishlist_items WHERE wishlistId = ? AND productId = ?'
    ).get(wl.id, productId);

    let added;
    if (existing) {
      db.prepare('DELETE FROM wishlist_items WHERE id = ?').run(existing.id);
      added = false;
    } else {
      db.prepare('INSERT INTO wishlist_items (wishlistId, productId) VALUES (?, ?)')
        .run(wl.id, productId);
      added = true;
    }

    const items = formatWishlistItems(db, wl.id);
    return Response.json({ ok: true, added, items });
  } catch (err) {
    log.error('Wishlist POST error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

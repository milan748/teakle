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

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ items: [] });
    }

    const db = getDb();
    const wl = getOrCreateWishlist(db, session.customerId);
    const rows = db.prepare(
      'SELECT wi.id, wi.productId, wi.createdAt FROM wishlist_items wi WHERE wi.wishlistId = ?'
    ).all(wl.id);

    const items = rows.map((row) => {
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

    return Response.json({ items });
  } catch (err) {
    console.error('Wishlist GET error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { productId } = await req.json();
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

    return Response.json({ ok: true, added, items });
  } catch (err) {
    console.error('Wishlist POST error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

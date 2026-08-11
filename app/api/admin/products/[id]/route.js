import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getProduct, clearMetadataCache } from '@/lib/products';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

const MAX_SKU_LENGTH = 50;

export async function GET(_request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();
    const product = getProduct(id, db);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const meta = db.prepare('SELECT * FROM product_metadata WHERE productId = ?').get(id);

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        categoryName: product.categoryName,
        subcategory: product.subcategory,
        subcategoryName: product.subcategoryName,
        price: product.price,
        priceFormatted: product.priceFormatted,
        currency: product.currency,
        availability: product.availability,
        isHero: product.isHero,
        inventoryQuantity: product.inventoryQuantity,
        sku: product.sku,
        active: product.active,
        images: product.images,
        thumbnails: product.thumbnails,
        description: product.description,
        shortDescription: product.shortDescription,
        material: product.material,
        dimensions: product.dimensions,
        weight: product.weight,
        finish: product.finish,
        buildTime: product.buildTime,
        tags: product.tags,
        relatedProducts: product.relatedProducts,
        specifications: product.specifications,
        faqs: product.faqs,
        metadata: meta || null,
      },
    });
  } catch (error) {
    log.error('Admin product detail error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const PATCH = withCsrf(async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();
    const product = getProduct(id, db);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates = {};

    // SKU validation
    if (body.sku !== undefined) {
      const sku = body.sku === null || body.sku === '' ? null : String(body.sku).trim();
      if (sku !== null) {
        if (sku.length > MAX_SKU_LENGTH) {
          return NextResponse.json({ success: false, error: `SKU must be ${MAX_SKU_LENGTH} characters or less` }, { status: 400 });
        }
        if (!/^[A-Za-z0-9\-_.]+$/.test(sku)) {
          return NextResponse.json({ success: false, error: 'SKU can only contain letters, numbers, hyphens, underscores, and periods' }, { status: 400 });
        }
        const existing = db.prepare('SELECT productId FROM product_metadata WHERE sku = ? AND productId != ?').get(sku, id);
        if (existing) {
          return NextResponse.json({ success: false, error: `SKU "${sku}" is already assigned to another product` }, { status: 400 });
        }
      }
      updates.sku = sku;
    }

    // Active status
    if (body.active !== undefined) {
      updates.active = body.active ? 1 : 0;
    }

    // Inventory (only allow setting, not negative)
    if (body.inventoryQuantity !== undefined) {
      const qty = body.inventoryQuantity === null ? null : parseInt(body.inventoryQuantity, 10);
      if (qty !== null && (isNaN(qty) || qty < 0)) {
        return NextResponse.json({ success: false, error: 'Inventory must be a non-negative integer or null' }, { status: 400 });
      }
      updates.inventoryQuantity = qty;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    // Upsert metadata
    const existingMeta = db.prepare('SELECT productId FROM product_metadata WHERE productId = ?').get(id);

    if (existingMeta) {
      const setClauses = [];
      const setValues = [];
      if (updates.sku !== undefined) { setClauses.push('sku = ?'); setValues.push(updates.sku); }
      if (updates.active !== undefined) { setClauses.push('active = ?'); setValues.push(updates.active); }
      if (updates.inventoryQuantity !== undefined) { setClauses.push('inventoryQuantity = ?'); setValues.push(updates.inventoryQuantity); }
      setClauses.push("updatedAt = datetime('now')");
      setValues.push(id);
      db.prepare(`UPDATE product_metadata SET ${setClauses.join(', ')} WHERE productId = ?`).run(...setValues);
    } else {
      db.prepare(
        `INSERT INTO product_metadata (productId, sku, active, inventoryQuantity)
         VALUES (?, ?, ?, ?)`
      ).run(id, updates.sku ?? null, updates.active ?? 1, updates.inventoryQuantity ?? null);
    }

    clearMetadataCache();

    const updated = getProduct(id, db);
    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        sku: updated.sku,
        active: updated.active,
        inventoryQuantity: updated.inventoryQuantity,
      },
    });
  } catch (error) {
    log.error('Admin product PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

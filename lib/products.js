/**
 * TEAKLE — Server-Side Product Data Layer
 *
 * Provides authoritative product access for all server-side commerce.
 * Reads from app/data/products.js (source of truth) and enriches
 * with metadata from the product_metadata table (SKU, active state).
 *
 * The existing PRODUCTS array remains the source of truth for product
 * definitions. Metadata overlays are additive only — never destructive.
 *
 * FUTURE: This layer defines the boundary for Shopify migration.
 * Replace this file's implementation with Shopify Storefront API.
 */

import { PRODUCTS as FILE_PRODUCTS, getProductById as fileGetProductById, getAllProducts as fileGetAllProducts } from '@/app/data/products';

let _metadataCache = null;
let _metadataCacheTime = 0;
const CACHE_TTL_MS = 30000;

/**
 * Load product metadata from database (cached for 30s).
 * Returns a Map<productId, { sku, active, inventoryQuantity, description }>.
 */
function loadMetadata(db) {
  const now = Date.now();
  if (_metadataCache && (now - _metadataCacheTime) < CACHE_TTL_MS) {
    return _metadataCache;
  }

  try {
    const rows = db.prepare('SELECT * FROM product_metadata').all();
    const map = new Map();
    for (const row of rows) {
      map.set(row.productId, {
        sku: row.sku || null,
        active: row.active === 1,
        inventoryQuantity: row.inventoryQuantity,
        description: row.description || null,
      });
    }
    _metadataCache = map;
    _metadataCacheTime = now;
    return map;
  } catch {
    return new Map();
  }
}

/**
 * Clear metadata cache (call after writes).
 */
export function clearMetadataCache() {
  _metadataCache = null;
  _metadataCacheTime = 0;
}

/**
 * Get a single product by ID, enriched with metadata.
 * @param {string} productId
 * @param {object} [db] - Database connection. If provided, metadata is loaded.
 * @returns {object|null}
 */
export function getProduct(productId, db = null) {
  const base = fileGetProductById(productId);
  if (!base) return null;

  if (!db) return { ...base, sku: null, active: true, inventoryQuantity: base.inventoryQuantity };

  const meta = loadMetadata(db);
  const m = meta.get(productId);
  return {
    ...base,
    sku: m?.sku || null,
    active: m?.active ?? true,
    inventoryQuantity: m?.inventoryQuantity ?? base.inventoryQuantity ?? null,
    description: m?.description || base.description,
  };
}

/**
 * Get all products enriched with metadata.
 * @param {object} [db]
 * @returns {Array}
 */
export function getAllProducts(db = null) {
  if (!db) {
    return FILE_PRODUCTS.map(p => ({ ...p, sku: null, active: true, inventoryQuantity: p.inventoryQuantity }));
  }

  const meta = loadMetadata(db);
  return FILE_PRODUCTS.map(p => {
    const m = meta.get(p.id);
    return {
      ...p,
      sku: m?.sku || null,
      active: m?.active ?? true,
      inventoryQuantity: m?.inventoryQuantity ?? p.inventoryQuantity ?? null,
      description: m?.description || p.description,
    };
  });
}

/**
 * Get only active products.
 * @param {object} [db]
 * @returns {Array}
 */
export function getActiveProducts(db = null) {
  return getAllProducts(db).filter(p => p.active);
}

/**
 * Get products for browser (lightweight, no metadata needed).
 * Mirrors the existing public/products-browser.js pattern.
 */
export function getBrowserProducts() {
  return FILE_PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    category: p.category,
    categoryName: p.categoryName,
    subcategory: p.subcategory,
    subcategoryName: p.subcategoryName,
    price: p.price,
    priceFormatted: p.priceFormatted,
    currency: p.currency,
    availability: p.availability,
    isHero: p.isHero,
    images: p.images,
    thumbnails: p.thumbnails,
    tags: p.tags,
  }));
}

/**
 * Get inventory quantity for a product.
 * @param {string} productId
 * @param {object} [db]
 * @returns {number|null} null = unlimited
 */
export function getInventory(productId, db = null) {
  const product = getProduct(productId, db);
  if (!product) return null;
  return product.inventoryQuantity ?? null;
}

/**
 * Check if a product is available for ordering.
 * @param {string} productId
 * @param {number} quantity
 * @param {object} [db]
 * @returns {{ available: boolean, reason?: string }}
 */
export function isAvailable(productId, quantity, db = null) {
  const product = getProduct(productId, db);
  if (!product) return { available: false, reason: 'Product not found' };
  if (!product.active) return { available: false, reason: 'Product is no longer available' };
  if (product.isHero && quantity > 1) return { available: false, reason: 'Hero product is limited to quantity 1' };
  if (product.inventoryQuantity !== null && product.inventoryQuantity !== undefined) {
    if (quantity > product.inventoryQuantity) {
      return { available: false, reason: `Only ${product.inventoryQuantity} available in stock` };
    }
  }
  return { available: true };
}

/**
 * Validate all cart items against product availability.
 * @param {Array} cartItems - [{ productId, quantity }]
 * @param {object} [db]
 * @returns {{ valid: boolean, errors: string[], items: Array }}
 */
export function validateCartItems(cartItems, db = null) {
  const errors = [];
  const items = [];

  for (const ci of cartItems) {
    const avail = isAvailable(ci.productId, ci.quantity, db);
    if (!avail.available) {
      errors.push(`${ci.productId}: ${avail.reason}`);
      continue;
    }
    const product = getProduct(ci.productId, db);
    items.push({
      ...ci,
      product,
      unitPrice: product.price,
      lineTotal: product.price * ci.quantity,
    });
  }

  return { valid: errors.length === 0, errors, items };
}

/**
 * Validate a single product for checkout.
 * Returns server-side pricing data — never trust client.
 */
export function resolveProductForOrder(productId, quantity, db = null) {
  const product = getProduct(productId, db);
  if (!product) return { valid: false, error: 'Product not found' };
  if (!product.active) return { valid: false, error: 'Product is no longer available' };
  if (product.isHero && quantity > 1) return { valid: false, error: 'Hero product limited to 1' };
  if (!Number.isInteger(quantity) || quantity < 1) return { valid: false, error: 'Invalid quantity' };
  if (product.inventoryQuantity !== null && product.inventoryQuantity !== undefined && quantity > product.inventoryQuantity) {
    return { valid: false, error: `Only ${product.inventoryQuantity} available` };
  }

  return {
    valid: true,
    productId: product.id,
    productNameSnapshot: product.name,
    productImage: product.images?.[0] || '',
    unitPrice: product.price,
    quantity,
    lineTotal: product.price * quantity,
    sku: product.sku || null,
  };
}

/**
 * TEAKLE — Order Pricing Calculation
 *
 * Server-side order total calculation.
 * Formula: subtotal + shipping + tax - discount = total
 *
 * All values are in paise (smallest currency unit).
 * Client never submits pricing — server resolves everything.
 */

import { calculateTax } from './tax';
import { calculateShipping } from './shipping';

/**
 * Calculate full order pricing breakdown.
 *
 * @param {object} params
 * @param {Array} params.cartItems - [{ productId, quantity }]
 * @param {Function} params.getProductById - Server-side product lookup
 * @param {object} params.shippingAddress - Address for shipping/tax calculation
 * @returns {{ configured, subtotal, shippingAmount, taxAmount, discountAmount, total, tax, shipping, messages }}
 */
export function calculateOrderTotal({ cartItems, getProductById, shippingAddress }) {
  const messages = [];

  // 1. Validate products and calculate subtotal
  let subtotal = 0;
  const orderItems = [];

  for (const ci of cartItems) {
    const product = getProductById(ci.productId);
    if (!product) {
      return { configured: false, error: `Product "${ci.productId}" is no longer available` };
    }
    if (product.active === false) {
      return { configured: false, error: `Product "${product.name || ci.productId}" is no longer available` };
    }

    const qty = ci.quantity;
    if (product.isHero && qty > 1) {
      return { configured: false, error: `Hero product "${product.name}" is limited to 1 per order` };
    }
    if (product.inventoryQuantity !== null && product.inventoryQuantity !== undefined && qty > product.inventoryQuantity) {
      return { configured: false, error: `Only ${product.inventoryQuantity} of "${product.name}" available` };
    }

    const price = product.price || 0;
    const lineTotal = price * qty;
    subtotal += lineTotal;

    orderItems.push({
      productId: ci.productId,
      productNameSnapshot: product.name,
      productImage: product.images?.[0] || '',
      sku: product.sku || null,
      unitPrice: price,
      quantity: qty,
      lineTotal,
    });
  }

  // 2. Calculate shipping
  const shipping = calculateShipping({
    items: orderItems,
    shippingAddress,
    subtotal,
  });
  if (shipping.message) messages.push(shipping.message);

  // 3. Calculate tax
  const tax = calculateTax({
    items: orderItems,
    shippingAddress,
    subtotal,
  });
  if (tax.message) messages.push(tax.message);

  // 4. Discount (placeholder — no discount system yet)
  const discountAmount = 0;

  // 5. Final total
  const total = subtotal + shipping.shippingAmount + tax.taxAmount - discountAmount;

  return {
    configured: true,
    orderItems,
    subtotal,
    shippingAmount: shipping.shippingAmount,
    shippingMethod: shipping.shippingMethod,
    taxAmount: tax.taxAmount,
    taxRate: tax.taxRate,
    taxLabel: tax.taxLabel,
    taxBreakdown: tax.taxBreakdown,
    taxConfigured: tax.configured,
    discountAmount,
    total,
    messages,
  };
}

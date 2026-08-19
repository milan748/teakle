/**
 * TEAKLE — Shipping Calculation Abstraction
 *
 * Server-side shipping calculation. The actual shipping rate is read from
 * site_settings ('shipping_rate', 'shipping_method', 'shipping_enabled',
 * 'free_shipping_threshold').
 *
 * When shipping is NOT configured, the system returns a clear indicator
 * rather than silently returning zero.
 *
 * Conceptual interface:
 *   calculateShipping({ items, shippingAddress, subtotal }) → { configured, shippingAmount, shippingMethod }
 */

import { getDb } from './db';

/**
 * Load shipping configuration from site_settings.
 */
export function getShippingConfig() {
  try {
    const db = getDb();
    const enabled = db.prepare("SELECT value FROM site_settings WHERE key = 'shipping_enabled'").get();
    const rate = db.prepare("SELECT value FROM site_settings WHERE key = 'shipping_rate'").get();
    const method = db.prepare("SELECT value FROM site_settings WHERE key = 'shipping_method'").get();
    const freeThreshold = db.prepare("SELECT value FROM site_settings WHERE key = 'free_shipping_threshold'").get();

    const isEnabled = enabled?.value === 'true';
    const rateValue = rate?.value ? parseInt(rate.value, 10) : null;
    const methodValue = method?.value || null;
    const thresholdValue = freeThreshold?.value ? parseInt(freeThreshold.value, 10) : null;

    return {
      enabled: isEnabled,
      rate: rateValue,
      method: methodValue,
      freeShippingThreshold: thresholdValue,
      configured: rateValue !== null || thresholdValue !== null,
    };
  } catch {
    return { enabled: false, rate: null, method: null, freeShippingThreshold: null, configured: false };
  }
}

/**
 * Calculate shipping for an order.
 *
 * @param {object} params
 * @param {Array} params.items - [{ productId, unitPrice, quantity, lineTotal }]
 * @param {object} params.shippingAddress - { city, state, pin, country }
 * @param {number} params.subtotal - Calculated subtotal in paise
 * @returns {{ configured: boolean, shippingAmount: number, shippingMethod: string|null, message: string|null }}
 */
export function calculateShipping({ items, shippingAddress, subtotal }) {
  const config = getShippingConfig();

  if (!config.configured || !config.enabled) {
    return {
      configured: false,
      shippingAmount: 0,
      shippingMethod: null,
      message: config.configured
        ? 'Shipping calculation is disabled'
        : 'Shipping calculation is not configured — no shipping rate has been set',
    };
  }

  // Free shipping threshold check
  if (config.freeShippingThreshold && subtotal >= config.freeShippingThreshold) {
    return {
      configured: true,
      shippingAmount: 0,
      shippingMethod: config.method || 'Standard',
      message: null,
    };
  }

  const shippingAmount = config.rate || 0;

  return {
    configured: true,
    shippingAmount,
    shippingMethod: config.method || 'Standard',
    message: null,
  };
}

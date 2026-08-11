/**
 * TEAKLE — Tax Calculation Abstraction
 *
 * Server-side tax calculation. The actual tax rate is read from
 * site_settings ('tax_rate', 'tax_label', 'tax_enabled').
 *
 * When tax is NOT configured, the system returns a clear indicator
 * rather than silently returning zero.
 *
 * Conceptual interface:
 *   calculateTax({ items, shippingAddress, subtotal }) → { configured, taxableSubtotal, taxAmount, taxBreakdown }
 */

import { getDb } from './db';

/**
 * Load tax configuration from site_settings.
 * Returns { enabled: boolean, rate: number, label: string, configured: boolean }
 */
export function getTaxConfig() {
  try {
    const db = getDb();
    const enabled = db.prepare("SELECT value FROM site_settings WHERE key = 'tax_enabled'").get();
    const rate = db.prepare("SELECT value FROM site_settings WHERE key = 'tax_rate'").get();
    const label = db.prepare("SELECT value FROM site_settings WHERE key = 'tax_label'").get();

    const isEnabled = enabled?.value === 'true';
    const rateValue = rate?.value ? parseFloat(rate.value) : null;
    const labelValue = label?.value || 'Tax';

    return {
      enabled: isEnabled,
      rate: rateValue,
      label: labelValue,
      configured: rateValue !== null && rateValue >= 0,
    };
  } catch {
    return { enabled: false, rate: null, label: 'Tax', configured: false };
  }
}

/**
 * Calculate tax for an order.
 *
 * @param {object} params
 * @param {Array} params.items - [{ productId, unitPrice, quantity, lineTotal }]
 * @param {object} params.shippingAddress - { city, state, pin, country }
 * @param {number} params.subtotal - Calculated subtotal in paise
 * @returns {{ configured: boolean, taxableSubtotal: number, taxAmount: number, taxBreakdown: object }}
 */
export function calculateTax({ items, shippingAddress, subtotal }) {
  const config = getTaxConfig();

  if (!config.configured || !config.enabled) {
    return {
      configured: false,
      taxableSubtotal: 0,
      taxAmount: 0,
      taxRate: 0,
      taxLabel: config.label,
      taxBreakdown: null,
      message: config.configured
        ? 'Tax calculation is disabled'
        : 'Tax calculation is not configured — no tax rate has been set',
    };
  }

  const taxableSubtotal = subtotal;
  const taxAmount = Math.round(taxableSubtotal * (config.rate / 100));

  return {
    configured: true,
    taxableSubtotal,
    taxAmount,
    taxRate: config.rate,
    taxLabel: config.label,
    taxBreakdown: {
      label: config.label,
      rate: config.rate,
      taxableSubtotal,
      amount: taxAmount,
    },
    message: null,
  };
}

/**
 * TEAKLE — Email Abstraction Layer
 *
 * No-op email service with structured logging.
 * Designed as a placeholder until Shopify email integration is activated.
 *
 * All email functions log the intent but do not send.
 * When Shopify is connected, replace the implementation with Shopify Mail API calls.
 *
 * Usage:
 *   import { sendOrderConfirmation } from '@/lib/email';
 *   await sendOrderConfirmation({ to: 'customer@example.com', orderNumber: 'TK-...' });
 */

import { log } from './logger';

/**
 * Send an order confirmation email (no-op).
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.orderNumber - Order number
 * @param {number} params.total - Total in paise
 * @param {Array} params.items - Order items
 * @param {object} params.shippingAddress - Shipping address
 */
export async function sendOrderConfirmation({ to, orderNumber, total, items, shippingAddress }) {
  log.info('Email (no-op): Order confirmation', {
    to,
    orderNumber,
    total,
    itemCount: items?.length || 0,
    recipientName: shippingAddress ? `${shippingAddress.firstName} ${shippingAddress.lastName}` : undefined,
  });
  return { sent: false, provider: 'noop', reason: 'Email not configured' };
}

/**
 * Send an order status update email (no-op).
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.orderNumber - Order number
 * @param {string} params.oldStatus - Previous status
 * @param {string} params.newStatus - New status
 */
export async function sendOrderStatusUpdate({ to, orderNumber, oldStatus, newStatus }) {
  log.info('Email (no-op): Order status update', {
    to,
    orderNumber,
    oldStatus,
    newStatus,
  });
  return { sent: false, provider: 'noop', reason: 'Email not configured' };
}

/**
 * Send an order cancellation email (no-op).
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.orderNumber - Order number
 * @param {string} params.reason - Cancellation reason
 */
export async function sendOrderCancellation({ to, orderNumber, reason }) {
  log.info('Email (no-op): Order cancellation', {
    to,
    orderNumber,
    reason,
  });
  return { sent: false, provider: 'noop', reason: 'Email not configured' };
}

/**
 * Send a welcome/registration email (no-op).
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.name - Customer name
 */
export async function sendWelcomeEmail({ to, name }) {
  log.info('Email (no-op): Welcome email', { to, name });
  return { sent: false, provider: 'noop', reason: 'Email not configured' };
}

/**
 * Send a password reset email (no-op).
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.resetToken - Password reset token
 */
export async function sendPasswordReset({ to, resetToken }) {
  log.info('Email (no-op): Password reset', { to });
  return { sent: false, provider: 'noop', reason: 'Email not configured' };
}

/**
 * Generic email send (no-op).
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.body - Email body (text or HTML)
 * @param {string} params.type - Email type for logging
 */
export async function sendEmail({ to, subject, body, type = 'generic' }) {
  log.info(`Email (no-op): ${type}`, { to, subject });
  return { sent: false, provider: 'noop', reason: 'Email not configured' };
}

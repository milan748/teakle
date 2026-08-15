/**
 * TEAKLE — Email Abstraction Layer
 *
 * Provider-neutral email interface. No real email provider is integrated.
 * All functions return controlled "not configured" results.
 *
 * When a real provider is configured via EMAIL_PROVIDER env var, the
 * implementation will delegate to that provider. Until then, emails
 * are logged and returned as not sent.
 *
 * Environment variables:
 *   EMAIL_PROVIDER  — 'none' | 'resend' | 'sendgrid' (default: 'none')
 *   EMAIL_FROM      — Sender email address (default: 'noreply@teakle.in')
 *   EMAIL_API_KEY   — Provider API key (never logged)
 *
 * Usage:
 *   import { sendOrderConfirmation } from '@/lib/email';
 *   await sendOrderConfirmation({ to: 'customer@example.com', orderNumber: 'TK-...' });
 */

import { log } from './logger';

const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'none').toLowerCase();
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@teakle.in';
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || '';

function isConfigured() {
  return EMAIL_PROVIDER !== 'none' && EMAIL_API_KEY.length > 0;
}

/**
 * Send an order confirmation email.
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.orderNumber - Order number
 * @param {number} params.total - Total in paise
 * @param {Array} params.items - Order items
 * @param {object} params.shippingAddress - Shipping address
 */
export async function sendOrderConfirmation({ to, orderNumber, total, items, shippingAddress }) {
  if (!isConfigured()) {
    log.info('Email (not configured): Order confirmation', {
      to,
      orderNumber,
      total,
      itemCount: items?.length || 0,
      recipientName: shippingAddress ? `${shippingAddress.firstName} ${shippingAddress.lastName}` : undefined,
    });
    return { sent: false, provider: EMAIL_PROVIDER, reason: 'Email provider not configured' };
  }

  log.info('Email: Sending order confirmation', { to, orderNumber, provider: EMAIL_PROVIDER });
  return { sent: false, provider: EMAIL_PROVIDER, reason: 'Provider integration not yet implemented' };
}

/**
 * Send an order status update email.
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.orderNumber - Order number
 * @param {string} params.oldStatus - Previous status
 * @param {string} params.newStatus - New status
 */
export async function sendOrderStatusUpdate({ to, orderNumber, oldStatus, newStatus }) {
  if (!isConfigured()) {
    log.info('Email (not configured): Order status update', {
      to,
      orderNumber,
      oldStatus,
      newStatus,
    });
    return { sent: false, provider: EMAIL_PROVIDER, reason: 'Email provider not configured' };
  }

  log.info('Email: Sending order status update', { to, orderNumber, oldStatus, newStatus, provider: EMAIL_PROVIDER });
  return { sent: false, provider: EMAIL_PROVIDER, reason: 'Provider integration not yet implemented' };
}

/**
 * Send an order cancellation email.
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.orderNumber - Order number
 * @param {string} params.reason - Cancellation reason
 */
export async function sendOrderCancellation({ to, orderNumber, reason }) {
  if (!isConfigured()) {
    log.info('Email (not configured): Order cancellation', {
      to,
      orderNumber,
      reason,
    });
    return { sent: false, provider: EMAIL_PROVIDER, reason: 'Email provider not configured' };
  }

  log.info('Email: Sending order cancellation', { to, orderNumber, provider: EMAIL_PROVIDER });
  return { sent: false, provider: EMAIL_PROVIDER, reason: 'Provider integration not yet implemented' };
}

/**
 * Send a welcome/registration email.
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.name - Customer name
 */
export async function sendWelcomeEmail({ to, name }) {
  if (!isConfigured()) {
    log.info('Email (not configured): Welcome email', { to, name });
    return { sent: false, provider: EMAIL_PROVIDER, reason: 'Email provider not configured' };
  }

  log.info('Email: Sending welcome email', { to, provider: EMAIL_PROVIDER });
  return { sent: false, provider: EMAIL_PROVIDER, reason: 'Provider integration not yet implemented' };
}

/**
 * Send a password reset email.
 * SECURITY: resetToken is never logged.
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.resetToken - Password reset token
 */
export async function sendPasswordReset({ to, resetToken }) {
  if (!isConfigured()) {
    log.info('Email (not configured): Password reset', { to });
    return { sent: false, provider: EMAIL_PROVIDER, reason: 'Email provider not configured' };
  }

  log.info('Email: Sending password reset', { to, provider: EMAIL_PROVIDER });
  return { sent: false, provider: EMAIL_PROVIDER, reason: 'Provider integration not yet implemented' };
}

/**
 * Generic email send.
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.body - Email body (text or HTML)
 * @param {string} params.type - Email type for logging
 */
export async function sendEmail({ to, subject, body, type = 'generic' }) {
  if (!isConfigured()) {
    log.info(`Email (not configured): ${type}`, { to, subject });
    return { sent: false, provider: EMAIL_PROVIDER, reason: 'Email provider not configured' };
  }

  log.info(`Email: Sending ${type}`, { to, subject, provider: EMAIL_PROVIDER });
  return { sent: false, provider: EMAIL_PROVIDER, reason: 'Provider integration not yet implemented' };
}

/**
 * Get current email configuration status (for health checks).
 */
export function getEmailConfig() {
  return {
    provider: EMAIL_PROVIDER,
    configured: isConfigured(),
    from: EMAIL_FROM,
  };
}

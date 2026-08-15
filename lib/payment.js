/**
 * TEAKLE — Payment Abstraction Layer
 *
 * Provider-neutral payment interface. No real payment provider is integrated.
 * All functions return controlled "provider not configured" results.
 *
 * Payment states: UNPAID, PENDING, PAID, FAILED, REFUNDED, CANCELLED
 * Order states:   PENDING, CONFIRMED, PROCESSING, COMPLETED, CANCELLED
 *
 * Legal payment transitions:
 *   UNPAID  → PENDING   (payment initiated)
 *   UNPAID  → CANCELLED (order cancelled before payment)
 *   PENDING → PAID      (payment confirmed by provider)
 *   PENDING → FAILED    (payment failed)
 *   PENDING → CANCELLED (order cancelled during pending payment)
 *   PAID    → REFUNDED  (refund processed)
 */

import { getDb } from './db';
import { log } from './logger';

// ─── Payment State Model ────────────────────────────────────────────────────

export const VALID_PAYMENT_STATUSES = ['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'];

export const PAYMENT_TRANSITIONS = {
  UNPAID:  ['PENDING', 'CANCELLED'],
  PENDING: ['PAID', 'FAILED', 'CANCELLED'],
  PAID:    ['REFUNDED'],
  FAILED:  [],
  REFUNDED: [],
  CANCELLED: [],
};

export const TERMINAL_PAYMENT_STATUSES = ['FAILED', 'REFUNDED', 'CANCELLED'];

export function isValidPaymentTransition(from, to) {
  return PAYMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Payment Amount Integrity ───────────────────────────────────────────────

/**
 * Get authoritative order total from database. Never trust client amounts.
 */
export function getServerOrderAmount(orderId) {
  const db = getDb();
  const order = db.prepare(
    'SELECT id, totalAmount, subtotal, shippingAmount, taxAmount, discountAmount FROM orders WHERE id = ?'
  ).get(orderId);

  if (!order) return null;

  return {
    orderId: order.id,
    totalAmount: order.totalAmount,
    subtotal: order.subtotal,
    shippingAmount: order.shippingAmount,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
  };
}

// ─── Payment Record Operations ──────────────────────────────────────────────

/**
 * Create a payment record. Amount always comes from server-side order total.
 * Idempotent: duplicate idempotencyKey returns existing record.
 */
export function createPaymentRecord({ orderId, idempotencyKey, provider = 'none' }) {
  const db = getDb();

  if (idempotencyKey) {
    const existing = db.prepare(
      'SELECT * FROM payments WHERE idempotencyKey = ?'
    ).get(idempotencyKey);

    if (existing) {
      log.info('Payment idempotent hit', { paymentId: existing.id, idempotencyKey });
      return existing;
    }
  }

  const amounts = getServerOrderAmount(orderId);
  if (!amounts) {
    log.error('Payment creation failed — order not found', { orderId });
    return null;
  }

  const result = db.prepare(`
    INSERT INTO payments (orderId, provider, providerPaymentId, amount, currency, status, idempotencyKey, createdAt, updatedAt)
    VALUES (?, ?, NULL, ?, 'INR', 'PENDING', ?, datetime('now'), datetime('now'))
  `).run(orderId, provider, amounts.totalAmount, idempotencyKey || null);

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);

  log.paymentCreated(payment.id, orderId, amounts.totalAmount);

  return payment;
}

/**
 * Get payment record by ID.
 */
export function getPaymentById(paymentId) {
  const db = getDb();
  return db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
}

/**
 * Get payment record by order ID.
 */
export function getPaymentByOrderId(orderId) {
  const db = getDb();
  return db.prepare('SELECT * FROM payments WHERE orderId = ? ORDER BY createdAt DESC LIMIT 1').get(orderId);
}

/**
 * Get payment record by provider payment ID.
 */
export function getPaymentByProviderId(providerPaymentId) {
  const db = getDb();
  return db.prepare('SELECT * FROM payments WHERE providerPaymentId = ?').get(providerPaymentId);
}

/**
 * Update payment status with transition validation.
 */
export function updatePaymentStatus(paymentId, newStatus, { providerPaymentId = null, adminEmail = null } = {}) {
  const db = getDb();
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);

  if (!payment) {
    log.error('Payment update failed — not found', { paymentId });
    return null;
  }

  if (!isValidPaymentTransition(payment.status, newStatus)) {
    log.error('Payment transition rejected', {
      paymentId,
      from: payment.status,
      to: newStatus,
    });
    return null;
  }

  const updatePayment = db.transaction(() => {
    if (providerPaymentId) {
      db.prepare(
        "UPDATE payments SET status = ?, providerPaymentId = ?, updatedAt = datetime('now') WHERE id = ?"
      ).run(newStatus, providerPaymentId, paymentId);
    } else {
      db.prepare(
        "UPDATE payments SET status = ?, updatedAt = datetime('now') WHERE id = ?"
      ).run(newStatus, paymentId);
    }

    if (newStatus === 'PAID') {
      db.prepare(
        "UPDATE orders SET paymentStatus = 'PAID', updatedAt = datetime('now') WHERE id = ?"
      ).run(payment.orderId);
    } else if (newStatus === 'CANCELLED' || newStatus === 'FAILED') {
      db.prepare(
        "UPDATE orders SET paymentStatus = ?, updatedAt = datetime('now') WHERE id = ?"
      ).run(newStatus, payment.orderId);
    } else if (newStatus === 'REFUNDED') {
      db.prepare(
        "UPDATE orders SET paymentStatus = 'REFUNDED', updatedAt = datetime('now') WHERE id = ?"
      ).run(payment.orderId);
    }
  });

  updatePayment();

  const updated = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
  log.paymentStatusChange(payment.id, payment.orderId, payment.status, newStatus);

  return updated;
}

// ─── Provider Abstraction ───────────────────────────────────────────────────

/**
 * Create a payment intent. No provider is configured — returns controlled result.
 */
export async function createPaymentIntent({ orderId, idempotencyKey }) {
  const amounts = getServerOrderAmount(orderId);
  if (!amounts) {
    return { ok: false, error: 'Order not found' };
  }

  log.paymentIntentRequested(orderId, amounts.totalAmount);

  return {
    ok: false,
    provider: 'none',
    reason: 'Payment provider not configured',
    orderId,
    amount: amounts.totalAmount,
    currency: 'INR',
  };
}

/**
 * Verify a payment. No provider is configured — returns controlled result.
 */
export async function verifyPayment({ paymentId, providerPaymentId }) {
  return {
    ok: false,
    provider: 'none',
    reason: 'Payment provider not configured',
    paymentId,
  };
}

/**
 * Process a refund. No provider is configured — returns controlled result.
 */
export async function processRefund({ paymentId, amount, reason }) {
  const payment = getPaymentById(paymentId);
  if (!payment) {
    return { ok: false, error: 'Payment not found' };
  }

  if (payment.status !== 'PAID') {
    return { ok: false, error: 'Only PAID payments can be refunded' };
  }

  log.paymentRefundRequested(paymentId, payment.orderId, amount);

  return {
    ok: false,
    provider: 'none',
    reason: 'Payment provider not configured',
    paymentId,
    amount,
  };
}

// ─── Webhook Handling ───────────────────────────────────────────────────────

/**
 * Handle a provider webhook. No provider is configured — returns controlled result.
 *
 * Security requirements for future implementation:
 * - Provider signature verification BEFORE any state mutation
 * - Unknown provider rejected
 * - Invalid signature rejected
 * - Duplicate events must be idempotent
 * - Payment amount must be verified against server-side order total
 * - Order ID must be verified
 */
export async function handleWebhook({ provider, signature, body }) {
  if (!provider) {
    return { ok: false, status: 400, error: 'Missing provider identifier' };
  }

  const knownProviders = ['razorpay', 'stripe', 'none'];
  if (!knownProviders.includes(provider.toLowerCase())) {
    log.paymentWebhookRejected(provider, 'unknown_provider');
    return { ok: false, status: 400, error: 'Unknown payment provider' };
  }

  if (provider.toLowerCase() === 'none' || !signature) {
    return {
      ok: false,
      status: 501,
      error: 'Payment provider not configured',
    };
  }

  log.paymentWebhookReceived(provider);

  return {
    ok: false,
    status: 501,
    error: 'Payment provider not configured',
  };
}

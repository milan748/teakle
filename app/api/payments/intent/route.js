import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCustomerSession } from '@/lib/customerSession';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';
import { createPaymentIntent, createPaymentRecord } from '@/lib/payment';
import crypto from 'crypto';

export const POST = withCsrf(async function POST(request) {
  try {
    const rl = rateLimit('payment:create', RATE_LIMITS.paymentCreate);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== 'number') {
      return NextResponse.json({ error: 'Valid order ID is required' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare(
      'SELECT id, customerId, totalAmount, paymentStatus FROM orders WHERE id = ?'
    ).get(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.customerId !== session.customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED') {
      return NextResponse.json({ error: `Order payment already ${order.paymentStatus.toLowerCase()}` }, { status: 400 });
    }

    // Generate idempotency key
    const idempotencyKey = crypto.randomBytes(16).toString('hex');

    // Create payment record (idempotent)
    const payment = createPaymentRecord({
      orderId,
      idempotencyKey,
      provider: process.env.PAYMENT_PROVIDER || 'none',
    });

    if (!payment) {
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // Attempt provider payment intent creation
    const result = await createPaymentIntent({ orderId, idempotencyKey });

    log.info('Payment intent created', {
      paymentId: payment.id,
      orderId,
      amount: order.totalAmount,
      configured: result.configured,
    });

    return NextResponse.json({
      ok: result.configured,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        idempotencyKey: payment.idempotencyKey,
      },
      provider: {
        configured: result.configured,
        provider: result.provider,
        reason: result.reason,
      },
    });
  } catch (err) {
    log.error('Payment intent error', { message: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

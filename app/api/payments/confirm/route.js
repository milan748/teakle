import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { withCsrf } from '@/lib/csrf';
import { getPaymentById, updatePaymentStatus, getPaymentConfig } from '@/lib/payment';
import { log } from '@/lib/logger';

export const POST = withCsrf(async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { paymentId, status, providerPaymentId } = body;

    if (!paymentId || typeof paymentId !== 'number') {
      return NextResponse.json({ success: false, error: 'Valid payment ID is required' }, { status: 400 });
    }

    const VALID_CONFIRM_STATUSES = ['PAID', 'FAILED'];
    if (!status || !VALID_CONFIRM_STATUSES.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Allowed: ${VALID_CONFIRM_STATUSES.join(', ')}`,
      }, { status: 400 });
    }

    const config = getPaymentConfig();
    if (!config.configured) {
      return NextResponse.json({
        success: false,
        error: 'Payment provider not configured — manual confirmation not available',
      }, { status: 400 });
    }

    const payment = getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({
        success: false,
        error: `Cannot confirm payment in "${payment.status}" status. Only PENDING payments can be confirmed.`,
      }, { status: 400 });
    }

    const updated = updatePaymentStatus(paymentId, status, {
      providerPaymentId: providerPaymentId || null,
      adminEmail: auth.admin.email,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Failed to update payment status' }, { status: 500 });
    }

    log.info('Payment confirmed by admin', {
      paymentId,
      orderId: payment.orderId,
      status,
      adminEmail: auth.admin.email,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        orderId: updated.orderId,
      },
    });
  } catch (error) {
    log.error('Payment confirm error', { message: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

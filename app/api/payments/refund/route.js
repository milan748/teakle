import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { withCsrf } from '@/lib/csrf';
import { getPaymentById, updatePaymentStatus, processRefund, getPaymentConfig } from '@/lib/payment';
import { log } from '@/lib/logger';

export const POST = withCsrf(async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { paymentId, reason } = body;

    if (!paymentId || typeof paymentId !== 'number') {
      return NextResponse.json({ success: false, error: 'Valid payment ID is required' }, { status: 400 });
    }

    const payment = getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'PAID') {
      return NextResponse.json({
        success: false,
        error: `Cannot refund payment in "${payment.status}" status. Only PAID payments can be refunded.`,
      }, { status: 400 });
    }

    const config = getPaymentConfig();
    if (!config.configured) {
      return NextResponse.json({
        success: false,
        error: 'Payment provider not configured — refund not available',
      }, { status: 400 });
    }

    // Attempt refund via provider
    const result = await processRefund({
      paymentId,
      amount: payment.amount,
      reason: reason || 'Admin initiated refund',
    });

    if (result.ok) {
      const updated = updatePaymentStatus(paymentId, 'REFUNDED', {
        adminEmail: auth.admin.email,
      });

      log.info('Payment refunded', {
        paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        adminEmail: auth.admin.email,
      });

      try {
        const { getDb } = await import('@/lib/db');
        const db = getDb();
        db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
          auth.admin.id, 'refund', 'payment', paymentId,
          JSON.stringify({ orderId: payment.orderId, amount: payment.amount, reason: reason || 'Admin initiated refund' })
        );
      } catch { /* audit log failure is non-blocking */ }

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          status: updated.status,
          orderId: updated.orderId,
          amount: updated.amount,
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: result.reason || 'Refund failed',
    }, { status: 500 });
  } catch (error) {
    log.error('Payment refund error', { message: error.message });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

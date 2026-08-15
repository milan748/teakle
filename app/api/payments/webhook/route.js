import { NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/payment';
import { log } from '@/lib/logger';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const rl = rateLimit('payment:webhook', RATE_LIMITS.paymentWebhook);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const { provider, signature, event, data, eventId } = body;

    if (!provider) {
      return NextResponse.json({ error: 'Missing provider identifier' }, { status: 400 });
    }

    // Reject requests without event ID (required for idempotency)
    if (!eventId && eventId !== 0) {
      log.paymentWebhookRejected(provider, 'missing_event_id');
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    const result = await handleWebhook({ provider, signature, body, eventId });

    if (!result.ok) {
      log.paymentWebhookRejected(provider, result.error);
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    log.info('Webhook processed', { provider, eventId: String(eventId), event });

    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error('Webhook processing error', { message: err.message });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

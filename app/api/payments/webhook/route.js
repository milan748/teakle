import { NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/payment';
import { getDb } from '@/lib/db';
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

    if (!eventId && eventId !== 0) {
      log.paymentWebhookRejected(provider, 'missing_event_id');
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    const db = getDb();
    const eventIdStr = String(eventId);

    const existing = db.prepare(
      'SELECT id, processed FROM payment_webhook_events WHERE provider = ? AND eventId = ?'
    ).get(provider, eventIdStr);

    if (existing) {
      if (existing.processed) {
        log.info('Webhook event already processed', { provider, eventId: eventIdStr });
        return NextResponse.json({ ok: true, message: 'Event already processed' });
      }
    } else {
      db.prepare(
        'INSERT INTO payment_webhook_events (provider, eventId, eventType, receivedAt) VALUES (?, ?, ?, datetime(\'now\'))'
      ).run(provider, eventIdStr, event || null);
    }

    const result = await handleWebhook({ provider, signature, body, eventId });

    if (!result.ok) {
      db.prepare(
        "UPDATE payment_webhook_events SET processingError = ?, processed = 0 WHERE provider = ? AND eventId = ?"
      ).run(result.error, provider, eventIdStr);
      log.paymentWebhookRejected(provider, result.error);
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    db.prepare(
      "UPDATE payment_webhook_events SET signatureVerified = 1, processed = 1, processedAt = datetime('now') WHERE provider = ? AND eventId = ?"
    ).run(provider, eventIdStr);

    log.info('Webhook processed', { provider, eventId: eventIdStr, event });

    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error('Webhook processing error', { message: err.message });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

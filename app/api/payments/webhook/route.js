const { handleWebhook } = require('@/lib/payment');
const { log } = require('@/lib/logger');

export async function POST(req) {
  try {
    const body = await req.json();
    const { provider, signature, event, data } = body;

    if (!provider) {
      return Response.json({ error: 'Missing provider identifier' }, { status: 400 });
    }

    const result = await handleWebhook({ provider, signature, body });

    if (!result.ok) {
      log.paymentWebhookRejected(provider, result.error);
      return Response.json({ error: result.error }, { status: result.status || 400 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    log.error('Webhook processing error', { message: err.message });
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

const SENSITIVE_KEYS = new Set([
  'password', 'passwordHash', 'passwordhash', 'confirmPassword',
  'token', 'jwt', 'session', 'secret', 'SESSION_SECRET',
  'ADMIN_SESSION_SECRET', 'CUSTOMER_SESSION_SECRET',
  'cookie', 'authorization',
  'EMAIL_API_KEY', 'PAYMENT_KEY_ID', 'PAYMENT_KEY_SECRET', 'PAYMENT_WEBHOOK_SECRET',
  'idempotencyKey',
]);

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      clean[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      clean[k] = sanitize(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

function ts() {
  return new Date().toISOString();
}

export const log = {
  info(msg, data) {
    console.log(`[${ts()}] INFO  ${msg}`, data ? sanitize(data) : '');
  },
  warn(msg, data) {
    console.warn(`[${ts()}] WARN  ${msg}`, data ? sanitize(data) : '');
  },
  error(msg, data) {
    console.error(`[${ts()}] ERROR ${msg}`, data ? sanitize(data) : '');
  },
  adminLogin(email, success) {
    log.info(`Admin login: ${success ? 'SUCCESS' : 'FAILURE'} — ${email}`);
  },
  customerLogin(email, success) {
    log.info(`Customer login: ${success ? 'SUCCESS' : 'FAILURE'} — ${email}`);
  },
  customerRegister(email) {
    log.info(`Customer registered — ${email}`);
  },
  orderCreated(orderNumber, customerId, total) {
    log.info(`Order created — ${orderNumber} by customer ${customerId}, total ${total}`);
  },
  orderFailed(error) {
    log.error(`Order creation failed — ${error}`);
  },
  orderStatusChange(orderNumber, oldStatus, newStatus, adminEmail) {
    log.info(`Order status changed — ${orderNumber}: ${oldStatus} → ${newStatus} by ${adminEmail}`);
  },
  orderCancelled(orderNumber, customerId) {
    log.info(`Order cancelled — ${orderNumber} by customer ${customerId}`);
  },
  orderNoteAdded(orderNumber, author, isInternal) {
    log.info(`Order note added — ${orderNumber} by ${author} (internal: ${isInternal})`);
  },
  paymentIntentRequested(orderId, amount) {
    log.info(`Payment intent requested — order ${orderId}, amount ${amount}`);
  },
  paymentCreated(paymentId, orderId, amount) {
    log.info(`Payment created — payment ${paymentId} for order ${orderId}, amount ${amount}`);
  },
  paymentStatusChange(paymentId, orderId, oldStatus, newStatus) {
    log.info(`Payment status changed — payment ${paymentId} for order ${orderId}: ${oldStatus} → ${newStatus}`);
  },
  paymentRefundRequested(paymentId, orderId, amount) {
    log.info(`Payment refund requested — payment ${paymentId} for order ${orderId}, amount ${amount}`);
  },
  paymentWebhookReceived(provider) {
    log.info(`Payment webhook received — provider: ${provider}`);
  },
  paymentWebhookRejected(provider, reason) {
    log.warn(`Payment webhook rejected — provider: ${provider}, reason: ${reason}`);
  },
  adminAudit(adminId, action, entityType, entityId, metadata) {
    log.info(`Admin audit — admin ${adminId}: ${action} on ${entityType} ${entityId || ''}`, metadata);
  },
  orderActivity(orderId, actorType, actorId, action, oldValue, newValue, note, isCustomerVisible) {
    log.info(`Order activity — order ${orderId}: ${action} by ${actorType}:${actorId}`, { oldValue, newValue, note, isCustomerVisible });
  },
};

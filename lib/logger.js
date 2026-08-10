const SENSITIVE_KEYS = new Set([
  'password', 'passwordHash', 'passwordhash', 'confirmPassword',
  'token', 'jwt', 'session', 'secret', 'SESSION_SECRET',
  'cookie', 'authorization',
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
};

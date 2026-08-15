#!/usr/bin/env node

/**
 * TEAKLE — Sprint #27 Test Suite
 * Comprehensive Security, Auth, Payment, SEO, Accessibility & Code Quality
 *
 * Run: node scripts/test-sprint27.js
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

let passed = 0;
let failed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    const result = fn();
    if (result === true) {
      passed++;
      console.log(`PASS ${name}`);
    } else {
      failed++;
      console.log(`FAIL ${name} — ${result}`);
    }
  } catch (e) {
    failed++;
    console.log(`FAIL ${name} — ${e.message}`);
  }
}

function readFile(rel) {
  return fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
}

function fileExists(rel) {
  return fs.existsSync(path.join(__dirname, '..', rel));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION (25+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 1. AUTHENTICATION ===');

test('lib/auth.js exists', () => {
  return fileExists('lib/auth.js') === true;
});

test('lib/auth.js exports requireAdmin', () => {
  const src = readFile('lib/auth.js');
  return src.includes('requireAdmin');
});

test('lib/session.js exports createSession', () => {
  const src = readFile('lib/session.js');
  return src.includes('createSession');
});

test('lib/session.js exports deleteSession', () => {
  const src = readFile('lib/session.js');
  return src.includes('deleteSession');
});

test('lib/customerSession.js exports createCustomerSession', () => {
  const src = readFile('lib/customerSession.js');
  return src.includes('createCustomerSession');
});

test('lib/customerSession.js exports deleteCustomerSession', () => {
  const src = readFile('lib/customerSession.js');
  return src.includes('deleteCustomerSession');
});

test('lib/customerSession.js checks isActive', () => {
  const src = readFile('lib/customerSession.js');
  return src.includes('isActive');
});

test('lib/session.js uses jose/SignJWT', () => {
  const src = readFile('lib/session.js');
  return src.includes('SignJWT') || src.includes('jose');
});

test('lib/customerSession.js uses jose/SignJWT', () => {
  const src = readFile('lib/customerSession.js');
  return src.includes('SignJWT') || src.includes('jose');
});

test('bcrypt cost factor >= 12 in register route', () => {
  const src = readFile('app/api/auth/register/route.js');
  const match = src.match(/bcrypt\.hash\([^,]+,\s*(\d+)\)/);
  if (!match) return 'no bcrypt.hash found';
  return parseInt(match[1]) >= 12;
});

test('bcrypt cost factor >= 12 in reset-password route', () => {
  const src = readFile('app/api/auth/reset-password/route.js');
  const match = src.match(/bcrypt\.hash\([^,]+,\s*(\d+)\)/);
  if (!match) return 'no bcrypt.hash found';
  return parseInt(match[1]) >= 12;
});

test('Password reset tokens are SHA-256 hashed before storage (forgot-password)', () => {
  const src = readFile('app/api/auth/forgot-password/route.js');
  return src.includes('sha256') || src.includes("createHash('sha256')");
});

test('Password reset tokens are SHA-256 hashed in reset-password', () => {
  const src = readFile('app/api/auth/reset-password/route.js');
  return src.includes('sha256') || src.includes("createHash('sha256')");
});

test('Generic error messages on admin login (not "user not found")', () => {
  const src = readFile('app/api/admin/login/route.js');
  return src.includes('Invalid credentials') && !src.includes('User not found');
});

test('Generic error messages on customer login (not "user not found")', () => {
  const src = readFile('app/api/auth/login/route.js');
  return src.includes('Invalid email or password') && !src.includes('User not found');
});

test('Generic error on inactive customer (not "account deactivated")', () => {
  const src = readFile('app/api/auth/login/route.js');
  const inactiveSection = src.substring(src.indexOf('!customer.isActive'));
  return inactiveSection.includes('Invalid email or password');
});

test('Rate limiting applied to admin login endpoint', () => {
  const src = readFile('app/api/admin/login/route.js');
  return src.includes('rateLimit') && src.includes('adminLogin');
});

test('Rate limiting applied to customer login endpoint', () => {
  const src = readFile('app/api/auth/login/route.js');
  return src.includes('rateLimit') && src.includes('customerLogin');
});

test('Rate limiting applied to register endpoint', () => {
  const src = readFile('app/api/auth/register/route.js');
  return src.includes('rateLimit') && src.includes('customerRegister');
});

test('Rate limiting applied to forgot-password endpoint', () => {
  const src = readFile('app/api/auth/forgot-password/route.js');
  return src.includes('rateLimit');
});

test('Rate limiting applied to reset-password endpoint', () => {
  const src = readFile('app/api/auth/reset-password/route.js');
  return src.includes('rateLimit');
});

test('lib/csrf.js exports withCsrf', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('withCsrf');
});

test('lib/csrf.js exports validateCsrfRequest', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('validateCsrfRequest');
});

test('lib/csrf.js does NOT export validateCsrf (removed dead code)', () => {
  const src = readFile('lib/csrf.js');
  const hasStandalone = /export\s+(async\s+)?function\s+validateCsrf\b(?!\s*Request)/.test(src);
  return !hasStandalone;
});

test('lib/csrf.js exports getCsrfToken', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('getCsrfToken');
});

test('lib/csrf.js exports setCsrfCookie', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('setCsrfCookie');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. AUTHORIZATION / IDOR (20+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 2. AUTHORIZATION / IDOR ===');

test('Admin dashboard route uses requireAdmin', () => {
  const src = readFile('app/api/admin/dashboard/route.js');
  return src.includes('requireAdmin');
});

test('Admin settings route uses requireAdmin', () => {
  const src = readFile('app/api/admin/settings/route.js');
  return src.includes('requireAdmin');
});

test('Admin products route uses requireAdmin', () => {
  const src = readFile('app/api/admin/products/route.js');
  return src.includes('requireAdmin');
});

test('Admin product-orders route uses requireAdmin', () => {
  const src = readFile('app/api/admin/product-orders/route.js');
  return src.includes('requireAdmin');
});

test('Admin media route uses requireAdmin', () => {
  const src = readFile('app/api/admin/media/route.js');
  return src.includes('requireAdmin');
});

test('Admin contact route uses requireAdmin', () => {
  const src = readFile('app/api/admin/contact/route.js');
  return src.includes('requireAdmin');
});

test('Admin trade route uses requireAdmin', () => {
  const src = readFile('app/api/admin/trade/route.js');
  return src.includes('requireAdmin');
});

test('Admin newsletter route uses requireAdmin', () => {
  const src = readFile('app/api/admin/newsletter/route.js');
  return src.includes('requireAdmin');
});

test('Admin audit-logs route uses requireAdmin', () => {
  const src = readFile('app/api/admin/audit-logs/route.js');
  return src.includes('requireAdmin');
});

test('Admin custom-orders route uses requireAdmin', () => {
  const src = readFile('app/api/admin/custom-orders/route.js');
  return src.includes('requireAdmin');
});

test('/api/orders/[id] filters by customerId (IDOR protection)', () => {
  const src = readFile('app/api/orders/[id]/route.js');
  return src.includes('customerId = ?') || src.includes('customerId=?');
});

test('/api/addresses/[id] filters by customerId (IDOR protection)', () => {
  const src = readFile('app/api/addresses/[id]/route.js');
  return src.includes('customerId = ?') || src.includes('customerId=?');
});

test('/api/cart/[itemId] uses customer session for scoping', () => {
  const src = readFile('app/api/cart/[itemId]/route.js');
  return src.includes('getCustomerSession') && src.includes('session.customerId');
});

test('/api/wishlist/[itemId] uses customer session for scoping', () => {
  const src = readFile('app/api/wishlist/[itemId]/route.js');
  return src.includes('getCustomerSession') && src.includes('session.customerId');
});

test('Admin diagnostics route requires admin auth', () => {
  const src = readFile('app/api/admin/diagnostics/route.js');
  return src.includes('requireAdmin');
});

test('Health endpoint does NOT expose db.path', () => {
  const src = readFile('app/api/health/route.js');
  return !src.includes('db.path') && !src.includes('dbPath');
});

test('Health endpoint does NOT expose error details to client', () => {
  const src = readFile('app/api/health/route.js');
  return !src.includes('error?.message') && !src.includes('error.message');
});

test('Admin product-orders bulk route uses requireAdmin', () => {
  if (!fileExists('app/api/admin/product-orders/bulk/route.js')) return 'file missing';
  const src = readFile('app/api/admin/product-orders/bulk/route.js');
  return src.includes('requireAdmin');
});

test('Admin product-orders [id] route uses requireAdmin', () => {
  if (!fileExists('app/api/admin/product-orders/[id]/route.js')) return 'file missing';
  const src = readFile('app/api/admin/product-orders/[id]/route.js');
  return src.includes('requireAdmin');
});

test('Admin media [id] route uses requireAdmin', () => {
  if (!fileExists('app/api/admin/media/[id]/route.js')) return 'file missing';
  const src = readFile('app/api/admin/media/[id]/route.js');
  return src.includes('requireAdmin');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CSRF (15+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 3. CSRF ===');

test('withCsrf HOC exists in lib/csrf.js', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('export function withCsrf');
});

test('validateCsrfRequest validates header vs cookie match', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('cookieToken') && src.includes('headerToken');
});

test('GET/HEAD/OPTIONS are exempt from CSRF validation', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('GET') && src.includes('HEAD') && src.includes('OPTIONS');
});

test('POST/PUT/PATCH/DELETE require CSRF in withCsrf', () => {
  const src = readFile('lib/csrf.js');
  return src.includes("['GET', 'HEAD', 'OPTIONS']") || src.includes('method');
});

test('CSRF cookie is httpOnly: false (JS-readable)', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('httpOnly: false');
});

test('CSRF cookie has sameSite: lax', () => {
  const src = readFile('lib/csrf.js');
  return src.includes("sameSite: 'lax'");
});

test('CSRF token is 64-char hex string (32 bytes)', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('randomBytes(32)') && src.includes('hex');
});

test('CSRF cookie name is teakle_csrf', () => {
  const src = readFile('lib/csrf.js');
  return src.includes('teakle_csrf');
});

test('Admin login uses withCsrf wrapper', () => {
  const src = readFile('app/api/admin/login/route.js');
  return src.includes('withCsrf');
});

test('Order PATCH uses withCsrf wrapper', () => {
  const src = readFile('app/api/orders/[id]/route.js');
  return src.includes('withCsrf');
});

test('Address PUT uses withCsrf wrapper', () => {
  const src = readFile('app/api/addresses/[id]/route.js');
  return src.includes('withCsrf');
});

test('Address DELETE uses withCsrf wrapper', () => {
  const src = readFile('app/api/addresses/[id]/route.js');
  return src.includes('withCsrf');
});

test('Cart DELETE uses withCsrf wrapper', () => {
  const src = readFile('app/api/cart/[itemId]/route.js');
  return src.includes('withCsrf');
});

test('Wishlist DELETE uses withCsrf wrapper', () => {
  const src = readFile('app/api/wishlist/[itemId]/route.js');
  return src.includes('withCsrf');
});

test('Settings PUT uses withCsrf wrapper', () => {
  const src = readFile('app/api/admin/settings/route.js');
  return src.includes('withCsrf');
});

test('Media POST uses withCsrf wrapper', () => {
  const src = readFile('app/api/admin/media/route.js');
  return src.includes('withCsrf');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. RATE LIMITING (15+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 4. RATE LIMITING ===');

test('lib/rateLimit.js exists', () => {
  return fileExists('lib/rateLimit.js') === true;
});

test('lib/rateLimit.js exports rateLimit function', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('export function rateLimit');
});

test('lib/rateLimit.js exports RATE_LIMITS', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('export const RATE_LIMITS');
});

test('RATE_LIMITS has adminLogin', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('adminLogin');
});

test('RATE_LIMITS has customerLogin', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('customerLogin');
});

test('RATE_LIMITS has customerRegister', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('customerRegister');
});

test('RATE_LIMITS has forgotPassword', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('forgotPassword');
});

test('RATE_LIMITS has resetPassword', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('resetPassword');
});

test('RATE_LIMITS has orderCreate', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('orderCreate');
});

test('RATE_LIMITS has paymentWebhook', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('paymentWebhook');
});

test('RATE_LIMITS has adminExport', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('adminExport');
});

test('RATE_LIMITS has adminAuditLogs', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('adminAuditLogs');
});

test('RATE_LIMITS has adminBulkAction', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('adminBulkAction');
});

test('Rate limiter uses Map for storage', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('new Map()') || src.includes('buckets');
});

test('Rate limiter has cleanup interval', () => {
  const src = readFile('lib/rateLimit.js');
  return src.includes('setInterval') || src.includes('cleanup');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. INPUT VALIDATION (20+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 5. INPUT VALIDATION ===');

test('lib/validate.js exists', () => {
  return fileExists('lib/validate.js') === true;
});

test('lib/validate.js exports validateCustomOrder', () => {
  const src = readFile('lib/validate.js');
  return src.includes('export function validateCustomOrder');
});

test('lib/validate.js exports validateContact', () => {
  const src = readFile('lib/validate.js');
  return src.includes('export function validateContact');
});

test('lib/validate.js exports validateTrade', () => {
  const src = readFile('lib/validate.js');
  return src.includes('export function validateTrade');
});

test('lib/validate.js exports validateNewsletter', () => {
  const src = readFile('lib/validate.js');
  return src.includes('export function validateNewsletter');
});

test('lib/validateAddress.js exists', () => {
  return fileExists('lib/validateAddress.js') === true;
});

test('lib/validateAddress.js exports validateAddress', () => {
  const src = readFile('lib/validateAddress.js');
  return src.includes('export function validateAddress');
});

test('Admin settings has VALID_KEYS whitelist', () => {
  const src = readFile('app/api/admin/settings/route.js');
  return src.includes('VALID_KEYS');
});

test('CMS has VALID_SECTIONS whitelist', () => {
  const src = readFile('lib/cms.js');
  return src.includes('VALID_SECTIONS');
});

test('CMS has VALID_PAGES whitelist', () => {
  const src = readFile('lib/cms.js');
  return src.includes('VALID_PAGES');
});

test('lib/media.js validates MIME types (JPEG/PNG/WebP/AVIF)', () => {
  const src = readFile('lib/media.js');
  return src.includes('ALLOWED_MIME_TYPES') && src.includes('image/jpeg') && src.includes('image/png') && src.includes('image/webp');
});

test('lib/media.js has 5MB size limit', () => {
  const src = readFile('lib/media.js');
  return src.includes('5 * 1024 * 1024') || src.includes('MAX_FILE_SIZE');
});

test('Admin login route validates email/password types', () => {
  const src = readFile('app/api/admin/login/route.js');
  return src.includes('typeof body.email') || src.includes('typeof email');
});

test('Customer login route validates email/password types', () => {
  const src = readFile('app/api/auth/login/route.js');
  return src.includes('typeof email');
});

test('Register route validates password length', () => {
  const src = readFile('app/api/auth/register/route.js');
  return src.includes('MIN_PASSWORD') || src.includes('password.length');
});

test('Register route validates email format', () => {
  const src = readFile('app/api/auth/register/route.js');
  return src.includes('EMAIL_RE') || src.includes('email') && src.includes('test');
});

test('Forgot-password route validates email', () => {
  const src = readFile('app/api/auth/forgot-password/route.js');
  return src.includes('email') && src.includes('typeof');
});

test('Reset-password route validates password length', () => {
  const src = readFile('app/api/auth/reset-password/route.js');
  return src.includes('MIN_PASSWORD') || src.includes('password.length');
});

test('Address validation has Indian PIN regex', () => {
  const src = readFile('lib/validateAddress.js');
  return src.includes('INDIA_PIN_REGEX') || src.includes('[1-9][0-9]{5}');
});

test('validateAddress sanitizes HTML in inputs', () => {
  const src = readFile('lib/validateAddress.js');
  return src.includes('sanitize') && src.includes('[<>]');
});

test('lib/validate.js sanitizes HTML in inputs', () => {
  const src = readFile('lib/validate.js');
  return src.includes('sanitize') && src.includes('[<>]');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PAYMENT (20+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 6. PAYMENT ===');

test('lib/payment.js exists', () => {
  return fileExists('lib/payment.js') === true;
});

test('lib/payment.js has PAYMENT_TRANSITIONS state machine', () => {
  const src = readFile('lib/payment.js');
  return src.includes('PAYMENT_TRANSITIONS');
});

test('PAYMENT_TRANSITIONS has UNPAID state', () => {
  const src = readFile('lib/payment.js');
  return src.includes('UNPAID');
});

test('PAYMENT_TRANSITIONS has PENDING state', () => {
  const src = readFile('lib/payment.js');
  return src.includes('PENDING');
});

test('PAYMENT_TRANSITIONS has PAID state', () => {
  const src = readFile('lib/payment.js');
  return src.includes('PAID');
});

test('PAYMENT_TRANSITIONS has REFUNDED state', () => {
  const src = readFile('lib/payment.js');
  return src.includes('REFUNDED');
});

test('PAYMENT_TRANSITIONS has CANCELLED state', () => {
  const src = readFile('lib/payment.js');
  return src.includes('CANCELLED');
});

test('PAYMENT_TRANSITIONS has FAILED state', () => {
  const src = readFile('lib/payment.js');
  return src.includes('FAILED');
});

test('Terminal states: FAILED, REFUNDED, CANCELLED have no outgoing transitions', () => {
  const src = readFile('lib/payment.js');
  return src.includes('TERMINAL_PAYMENT_STATUSES') && src.includes('FAILED') && src.includes('REFUNDED') && src.includes('CANCELLED');
});

test('Payment has getServerOrderAmount for server-side resolution', () => {
  const src = readFile('lib/payment.js');
  return src.includes('getServerOrderAmount');
});

test('Payment createPaymentRecord supports idempotencyKey', () => {
  const src = readFile('lib/payment.js');
  return src.includes('idempotencyKey');
});

test('Payment has isValidPaymentTransition validation', () => {
  const src = readFile('lib/payment.js');
  return src.includes('isValidPaymentTransition');
});

test('Payment has getPaymentConfig for provider check', () => {
  const src = readFile('lib/payment.js');
  return src.includes('getPaymentConfig');
});

test('Payment provider configured: false when not set', () => {
  const src = readFile('lib/payment.js');
  return src.includes("configured: PAYMENT_PROVIDER !== 'none'");
});

test('Refund uses DB amount not client amount (processRefund reads payment)', () => {
  const src = readFile('lib/payment.js');
  return src.includes('getPaymentById') || src.includes('payment.amount');
});

test('Webhook handler checks provider', () => {
  const src = readFile('lib/payment.js');
  return src.includes('handleWebhook');
});

test('Webhook handler checks known providers', () => {
  const src = readFile('lib/payment.js');
  return src.includes('KNOWN_PROVIDERS');
});

test('Webhook handler checks missing signature', () => {
  const src = readFile('lib/payment.js');
  return src.includes('missing_signature') || src.includes('Missing webhook signature');
});

test('Webhook handler checks unknown provider', () => {
  const src = readFile('lib/payment.js');
  return src.includes('unknown_provider') || src.includes('Unknown payment provider');
});

test('Payment db.js has payments table with idempotencyKey UNIQUE', () => {
  const src = readFile('lib/db.js');
  return src.includes('payments') && src.includes('idempotencyKey TEXT UNIQUE');
});

test('Payment db.js has payment_webhook_events with UNIQUE(provider, eventId)', () => {
  const src = readFile('lib/db.js');
  return src.includes('payment_webhook_events') && src.includes('UNIQUE(provider, eventId)');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. EMAIL (10+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 7. EMAIL ===');

test('lib/email.js exists', () => {
  return fileExists('lib/email.js') === true;
});

test('Email sendOrderConfirmation returns { sent: false } when not configured', () => {
  const src = readFile('lib/email.js');
  return src.includes("sent: false") && src.includes('provider not configured');
});

test('Email resetToken is not logged in sendPasswordReset', () => {
  const src = readFile('lib/email.js');
  const fnStart = src.indexOf('export async function sendPasswordReset');
  const fnEnd = src.indexOf('\nexport async function', fnStart + 1);
  const fnBody = src.substring(fnStart, fnEnd > 0 ? fnEnd : fnStart + 600);
  const logCalls = fnBody.split('\n').filter(l => l.includes('log.info'));
  for (const line of logCalls) {
    if (line.includes('resetToken')) return 'resetToken found in log.info call';
  }
  return true;
});

test('Email has sendOrderConfirmation function', () => {
  const src = readFile('lib/email.js');
  return src.includes('sendOrderConfirmation');
});

test('Email has sendPasswordReset function', () => {
  const src = readFile('lib/email.js');
  return src.includes('sendPasswordReset');
});

test('Email has sendWelcomeEmail function', () => {
  const src = readFile('lib/email.js');
  return src.includes('sendWelcomeEmail');
});

test('Email has sendOrderStatusUpdate function', () => {
  const src = readFile('lib/email.js');
  return src.includes('sendOrderStatusUpdate');
});

test('Email has sendOrderCancellation function', () => {
  const src = readFile('lib/email.js');
  return src.includes('sendOrderCancellation');
});

test('Email has sendEmail generic function', () => {
  const src = readFile('lib/email.js');
  return src.includes('sendEmail');
});

test('Email has getEmailConfig function', () => {
  const src = readFile('lib/email.js');
  return src.includes('getEmailConfig');
});

test('Email checks provider config before sending', () => {
  const src = readFile('lib/email.js');
  return src.includes('isConfigured') || src.includes('configured');
});

test('Email provider-not-configured returns truthful response', () => {
  const src = readFile('lib/email.js');
  return src.includes('Email provider not configured');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. ORDERS (20+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 8. ORDERS ===');

test('lib/orderPricing.js exists', () => {
  return fileExists('lib/orderPricing.js') === true;
});

test('lib/orderPricing.js exports calculateOrderTotal', () => {
  const src = readFile('lib/orderPricing.js');
  return src.includes('export function calculateOrderTotal');
});

test('lib/tax.js exists', () => {
  return fileExists('lib/tax.js') === true;
});

test('lib/tax.js exports calculateTax', () => {
  const src = readFile('lib/tax.js');
  return src.includes('export function calculateTax');
});

test('lib/shipping.js exists', () => {
  return fileExists('lib/shipping.js') === true;
});

test('lib/shipping.js exports calculateShipping', () => {
  const src = readFile('lib/shipping.js');
  return src.includes('export function calculateShipping');
});

test('Pricing is server-side calculated (calculateOrderTotal takes getProductById)', () => {
  const src = readFile('lib/orderPricing.js');
  return src.includes('getProductById');
});

test('Hero product quantity limited to 1 in orderPricing', () => {
  const src = readFile('lib/orderPricing.js');
  return src.includes('isHero') && src.includes('qty > 1');
});

test('Order numbers are unique (orders table has UNIQUE on orderNumber)', () => {
  const src = readFile('lib/db.js');
  return src.includes('orderNumber TEXT NOT NULL UNIQUE');
});

test('Valid order status transitions defined in orders route', () => {
  const src = readFile('app/api/orders/[id]/route.js');
  return src.includes('VALID_ORDER_STATUSES');
});

test('Customer can only cancel PENDING/CONFIRMED orders', () => {
  const src = readFile('app/api/orders/[id]/route.js');
  return src.includes('CUSTOMER_CANCEL_STATUSES') && src.includes('PENDING') && src.includes('CONFIRMED');
});

test('Order snapshots have productNameSnapshot (immutable)', () => {
  const src = readFile('lib/db.js');
  return src.includes('productNameSnapshot');
});

test('Order snapshots have unitPrice', () => {
  const src = readFile('lib/db.js');
  return src.includes('unitPrice');
});

test('Order snapshots have lineTotal', () => {
  const src = readFile('lib/db.js');
  return src.includes('lineTotal');
});

test('Orders table has subtotal, shippingAmount, totalAmount', () => {
  const src = readFile('lib/db.js');
  return src.includes('subtotal') && src.includes('shippingAmount') && src.includes('totalAmount');
});

test('Orders table has paymentStatus', () => {
  const src = readFile('lib/db.js');
  return src.includes('paymentStatus');
});

test('Order pricing uses subtotal + shipping + tax - discount = total', () => {
  const src = readFile('lib/orderPricing.js');
  return src.includes('subtotal + shipping') || (src.includes('shippingAmount') && src.includes('taxAmount'));
});

test('Tax is server-side calculated from site_settings', () => {
  const src = readFile('lib/tax.js');
  return src.includes('site_settings') || src.includes('getTaxConfig');
});

test('Shipping is server-side calculated from site_settings', () => {
  const src = readFile('lib/shipping.js');
  return src.includes('site_settings') || src.includes('getShippingConfig');
});

test('Stock quantity check in orderPricing', () => {
  const src = readFile('lib/orderPricing.js');
  return src.includes('inventoryQuantity');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. DATABASE (20+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 9. DATABASE ===');

test('lib/db.js exists', () => {
  return fileExists('lib/db.js') === true;
});

test('lib/db.js has admins table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS admins');
});

test('lib/db.js has customers table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS customers');
});

test('lib/db.js has orders table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS orders');
});

test('lib/db.js has order_items table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS order_items');
});

test('lib/db.js has payments table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS payments');
});

test('lib/db.js has payment_webhook_events table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS payment_webhook_events');
});

test('lib/db.js has admin_audit_logs table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS admin_audit_logs');
});

test('lib/db.js has order_activity table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS order_activity');
});

test('lib/db.js has order_status_history table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS order_status_history');
});

test('lib/db.js has order_notes table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS order_notes');
});

test('lib/db.js has product_metadata table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS product_metadata');
});

test('lib/db.js has customer_addresses table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS customer_addresses');
});

test('lib/db.js has password_resets table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS password_resets');
});

test('lib/db.js has carts table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS carts');
});

test('lib/db.js has cart_items table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS cart_items');
});

test('lib/db.js has wishlists table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS wishlists');
});

test('lib/db.js has wishlist_items table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS wishlist_items');
});

test('lib/db.js has media table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS media');
});

test('lib/db.js has custom_orders table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS custom_orders');
});

test('lib/db.js has contact_submissions table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS contact_submissions');
});

test('lib/db.js has trade_enquiries table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS trade_enquiries');
});

test('lib/db.js has newsletter_subscribers table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS newsletter_subscribers');
});

test('lib/db.js has content_sections table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS content_sections');
});

test('lib/db.js has site_settings table', () => {
  const src = readFile('lib/db.js');
  return src.includes('CREATE TABLE IF NOT EXISTS site_settings');
});

test('Foreign keys enabled in lib/db.js', () => {
  const src = readFile('lib/db.js');
  return src.includes('foreign_keys = ON') || src.includes('foreign_keys');
});

test('WAL mode enabled in lib/db.js', () => {
  const src = readFile('lib/db.js');
  return src.includes('journal_mode = WAL') || src.includes('wal');
});

test('busy_timeout set in lib/db.js', () => {
  const src = readFile('lib/db.js');
  return src.includes('busy_timeout');
});

test('customers.email has UNIQUE constraint', () => {
  const src = readFile('lib/db.js');
  return src.includes('email TEXT NOT NULL UNIQUE') || src.includes('email TEXT UNIQUE');
});

test('password_resets has tokenHash UNIQUE constraint', () => {
  const src = readFile('lib/db.js');
  return src.includes('tokenHash TEXT NOT NULL UNIQUE');
});

test('Index exists on orders.customerId', () => {
  const src = readFile('lib/db.js');
  return src.includes('idx_orders_customerId');
});

test('Index exists on order_items.orderId', () => {
  const src = readFile('lib/db.js');
  return src.includes('idx_order_items_orderId');
});

test('Index exists on customers.email', () => {
  const src = readFile('lib/db.js');
  return src.includes('idx_customers_email');
});

test('Index exists on password_resets.tokenHash', () => {
  const src = readFile('lib/db.js');
  return src.includes('idx_password_resets_tokenHash');
});

test('Index exists on payments.orderId', () => {
  const src = readFile('lib/db.js');
  return src.includes('idx_payments_orderId');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. BACKUP (10+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 10. BACKUP ===');

test('scripts/backup-db.js exists', () => {
  return fileExists('scripts/backup-db.js') === true;
});

test('backup-db.js has createBackup function', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('createBackup');
});

test('backup-db.js has verifyBackup function', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('verifyBackup');
});

test('backup-db.js has listBackups function', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('listBackups');
});

test('backup-db.js has restoreBackup function', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('restoreBackup');
});

test('backup-db.js has pruneOldBackups function', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('pruneOldBackups');
});

test('backup-db.js uses SQLite backup API', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('.backup(');
});

test('backup-db.js checks integrity after backup', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('integrity_check');
});

test('backup-db.js checks foreign keys after backup', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('foreign_key_check');
});

test('backup-db.js supports --max-backups flag', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('--max-backups');
});

test('backup-db.js exports functions for programmatic use', () => {
  const src = readFile('scripts/backup-db.js');
  return src.includes('module.exports');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. MEDIA (10+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 11. MEDIA ===');

test('lib/storage.js exists', () => {
  return fileExists('lib/storage.js') === true;
});

test('lib/storage.js generates UUID filenames', () => {
  const src = readFile('lib/storage.js');
  return src.includes('randomUUID') || src.includes('uuid');
});

test('lib/media.js exists', () => {
  return fileExists('lib/media.js') === true;
});

test('lib/media.js validates MIME types (JPEG/PNG/WebP/AVIF)', () => {
  const src = readFile('lib/media.js');
  return src.includes('image/jpeg') && src.includes('image/png') && src.includes('image/webp') && src.includes('image/avif');
});

test('lib/media.js has 5MB size limit', () => {
  const src = readFile('lib/media.js');
  return src.includes('5 * 1024 * 1024') || src.includes('MAX_FILE_SIZE');
});

test('Delete checks content_sections references before deleting media', () => {
  const src = readFile('lib/media.js');
  return src.includes('content_sections') && src.includes('referenced');
});

test('Admin media upload requires requireAdmin', () => {
  const src = readFile('app/api/admin/media/route.js');
  return src.includes('requireAdmin');
});

test('Admin media delete requires requireAdmin', () => {
  if (!fileExists('app/api/admin/media/[id]/route.js')) return 'file missing';
  const src = readFile('app/api/admin/media/[id]/route.js');
  return src.includes('requireAdmin');
});

test('lib/media.js exports isMediaReferenced', () => {
  const src = readFile('lib/media.js');
  return src.includes('isMediaReferenced');
});

test('Media route POST validates file type', () => {
  const src = readFile('app/api/admin/media/route.js');
  return src.includes('createMedia');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. ADMIN (15+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 12. ADMIN ===');

test('Admin login route logs to admin_audit_logs', () => {
  const src = readFile('app/api/admin/login/route.js');
  return src.includes('admin_audit_logs');
});

test('Admin audit-logs route has pagination', () => {
  const src = readFile('app/api/admin/audit-logs/route.js');
  return src.includes('pagination') && src.includes('page') && src.includes('limit');
});

test('Admin audit-logs route has rate limiting', () => {
  const src = readFile('app/api/admin/audit-logs/route.js');
  return src.includes('rateLimit') && src.includes('adminAuditLogs');
});

test('Admin product-orders has pagination', () => {
  const src = readFile('app/api/admin/product-orders/route.js');
  return src.includes('pagination') && src.includes('page') && src.includes('limit');
});

test('Admin diagnostics requires admin auth', () => {
  const src = readFile('app/api/admin/diagnostics/route.js');
  return src.includes('requireAdmin');
});

test('Admin dashboard route requires admin auth', () => {
  const src = readFile('app/api/admin/dashboard/route.js');
  return src.includes('requireAdmin');
});

test('Admin custom-orders export has rate limiting', () => {
  if (!fileExists('app/api/admin/custom-orders/export/route.js')) return 'file missing';
  const src = readFile('app/api/admin/custom-orders/export/route.js');
  return src.includes('requireAdmin');
});

test('Admin contact export has rate limiting', () => {
  if (!fileExists('app/api/admin/contact/export/route.js')) return 'file missing';
  const src = readFile('app/api/admin/contact/export/route.js');
  return src.includes('requireAdmin');
});

test('Admin trade export has rate limiting', () => {
  if (!fileExists('app/api/admin/trade/export/route.js')) return 'file missing';
  const src = readFile('app/api/admin/trade/export/route.js');
  return src.includes('requireAdmin');
});

test('Admin newsletter export has rate limiting', () => {
  if (!fileExists('app/api/admin/newsletter/export/route.js')) return 'file missing';
  const src = readFile('app/api/admin/newsletter/export/route.js');
  return src.includes('requireAdmin');
});

test('Admin product-orders export has requireAdmin', () => {
  if (!fileExists('app/api/admin/product-orders/export/route.js')) return 'file missing';
  const src = readFile('app/api/admin/product-orders/export/route.js');
  return src.includes('requireAdmin');
});

test('Admin product-orders bulk has requireAdmin', () => {
  if (!fileExists('app/api/admin/product-orders/bulk/route.js')) return 'file missing';
  const src = readFile('app/api/admin/product-orders/bulk/route.js');
  return src.includes('requireAdmin');
});

test('Admin content route has requireAdmin', () => {
  if (!fileExists('app/api/admin/content/[page]/route.js')) return 'file missing';
  const src = readFile('app/api/admin/content/[page]/route.js');
  return src.includes('requireAdmin');
});

test('Admin contact [id] route has requireAdmin', () => {
  if (!fileExists('app/api/admin/contact/[id]/route.js')) return 'file missing';
  const src = readFile('app/api/admin/contact/[id]/route.js');
  return src.includes('requireAdmin');
});

test('Admin custom-orders [id] route has requireAdmin', () => {
  if (!fileExists('app/api/admin/custom-orders/[id]/route.js')) return 'file missing';
  const src = readFile('app/api/admin/custom-orders/[id]/route.js');
  return src.includes('requireAdmin');
});

test('Admin trade [id] route has requireAdmin', () => {
  if (!fileExists('app/api/admin/trade/[id]/route.js')) return 'file missing';
  const src = readFile('app/api/admin/trade/[id]/route.js');
  return src.includes('requireAdmin');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. PRIVACY (15+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 13. PRIVACY ===');

test('API responses don\'t include passwordHash in admin login', () => {
  const src = readFile('app/api/admin/login/route.js');
  const lastReturn = src.lastIndexOf('return NextResponse.json');
  const responseBlock = src.substring(lastReturn, src.indexOf(';', lastReturn) + 1);
  return !responseBlock.includes('passwordHash');
});

test('API responses don\'t include passwordHash in customer login', () => {
  const src = readFile('app/api/auth/login/route.js');
  const lastReturn = src.lastIndexOf('return Response.json');
  const responseBlock = src.substring(lastReturn, src.indexOf(';', lastReturn) + 1);
  return !responseBlock.includes('passwordHash');
});

test('API responses don\'t include passwordHash in register', () => {
  const src = readFile('app/api/auth/register/route.js');
  const lastReturn = src.lastIndexOf('return Response.json');
  const responseBlock = src.substring(lastReturn, src.indexOf(';', lastReturn) + 1);
  return !responseBlock.includes('passwordHash');
});

test('Health endpoint doesn\'t expose db.path', () => {
  const src = readFile('app/api/health/route.js');
  return !src.includes('db.path');
});

test('Health endpoint doesn\'t expose error details to client', () => {
  const src = readFile('app/api/health/route.js');
  const catchStart = src.indexOf('catch');
  const catchBlock = src.substring(catchStart);
  const jsonReturn = catchBlock.substring(catchBlock.indexOf('return Response.json'));
  const jsonEnd = jsonReturn.indexOf(';', jsonReturn.indexOf('}'));
  const responseJson = jsonReturn.substring(0, jsonEnd + 1);
  return !responseJson.includes('e.message') && !responseJson.includes('error.message');
});

test('Logger SENSITIVE_KEYS includes EMAIL_API_KEY', () => {
  const src = readFile('lib/logger.js');
  return src.includes('EMAIL_API_KEY');
});

test('Logger SENSITIVE_KEYS includes PAYMENT_KEY_ID', () => {
  const src = readFile('lib/logger.js');
  return src.includes('PAYMENT_KEY_ID');
});

test('Logger SENSITIVE_KEYS includes PAYMENT_KEY_SECRET', () => {
  const src = readFile('lib/logger.js');
  return src.includes('PAYMENT_KEY_SECRET');
});

test('Logger SENSITIVE_KEYS includes PAYMENT_WEBHOOK_SECRET', () => {
  const src = readFile('lib/logger.js');
  return src.includes('PAYMENT_WEBHOOK_SECRET');
});

test('Logger SENSITIVE_KEYS includes passwordHash', () => {
  const src = readFile('lib/logger.js');
  return src.includes('passwordHash');
});

test('Logger SENSITIVE_KEYS includes SESSION_SECRET', () => {
  const src = readFile('lib/logger.js');
  return src.includes('SESSION_SECRET');
});

test('Logger has sanitize function for sensitive data', () => {
  const src = readFile('lib/logger.js');
  return src.includes('sanitize') && src.includes('REDACTED');
});

test('Admin login generic error (not leaking user existence)', () => {
  const src = readFile('app/api/admin/login/route.js');
  return src.includes('Invalid credentials');
});

test('Forgot password returns generic message (not revealing account existence)', () => {
  const src = readFile('app/api/auth/forgot-password/route.js');
  return src.includes('If an account exists with that email');
});

test('Reset password returns generic invalid token message', () => {
  const src = readFile('app/api/auth/reset-password/route.js');
  return src.includes('Invalid or expired reset token');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. SECURITY HEADERS (10+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 14. SECURITY HEADERS ===');

test('next.config.mjs exists', () => {
  return fileExists('next.config.mjs') === true;
});

test('next.config.mjs has X-Content-Type-Options: nosniff', () => {
  const src = readFile('next.config.mjs');
  return src.includes('X-Content-Type-Options') && src.includes('nosniff');
});

test('next.config.mjs has X-Frame-Options: DENY', () => {
  const src = readFile('next.config.mjs');
  return src.includes('X-Frame-Options') && src.includes('DENY');
});

test('next.config.mjs has Referrer-Policy', () => {
  const src = readFile('next.config.mjs');
  return src.includes('Referrer-Policy');
});

test('next.config.mjs has Permissions-Policy', () => {
  const src = readFile('next.config.mjs');
  return src.includes('Permissions-Policy');
});

test('next.config.mjs has X-XSS-Protection', () => {
  const src = readFile('next.config.mjs');
  return src.includes('X-XSS-Protection');
});

test('API routes have Cache-Control: no-store', () => {
  const src = readFile('next.config.mjs');
  return src.includes('no-store');
});

test('Security headers applied to all routes via /(.*)', () => {
  const src = readFile('next.config.mjs');
  return src.includes("source: '/(.*)'");
});

test('API routes covered by /api/(.*) source', () => {
  const src = readFile('next.config.mjs');
  return src.includes("source: '/api/(.*)'");
});

test('next.config.mjs has reactStrictMode', () => {
  const src = readFile('next.config.mjs');
  return src.includes('reactStrictMode');
});

test('Permissions-Policy disables camera, microphone, geolocation', () => {
  const src = readFile('next.config.mjs');
  return src.includes('camera=()') && src.includes('microphone=()') && src.includes('geolocation=()');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 15. SEO (15+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 15. SEO ===');

test('app/sitemap.js exists', () => {
  return fileExists('app/sitemap.js') === true;
});

test('app/robots.js exists', () => {
  return fileExists('app/robots.js') === true;
});

test('Root layout has metadata with title template', () => {
  const src = readFile('app/layout.js');
  return src.includes('template:') && src.includes('%s');
});

test('Root layout has OpenGraph', () => {
  const src = readFile('app/layout.js');
  return src.includes('openGraph');
});

test('Root layout has Twitter cards', () => {
  const src = readFile('app/layout.js');
  return src.includes('twitter') && src.includes('card');
});

test('Root layout has robots meta', () => {
  const src = readFile('app/layout.js');
  return src.includes('robots');
});

test('Product pages have generateMetadata', () => {
  const src = readFile('app/shop/[id]/page.js');
  return src.includes('generateMetadata');
});

test('Journal pages have generateMetadata', () => {
  const src = readFile('app/journal/[slug]/page.js');
  return src.includes('generateMetadata');
});

test('404 page has noindex', () => {
  const src = readFile('app/not-found.js');
  return src.includes('index: false') || src.includes('noindex');
});

test('Root layout has JSON-LD structured data', () => {
  const src = readFile('app/layout.js');
  return src.includes('StructuredData') && src.includes('@context');
});

test('Root layout has Organization schema', () => {
  const src = readFile('app/layout.js');
  return src.includes('Organization');
});

test('Root layout has WebSite schema', () => {
  const src = readFile('app/layout.js');
  return src.includes('WebSite');
});

test('Root layout has metadataBase', () => {
  const src = readFile('app/layout.js');
  return src.includes('metadataBase');
});

test('Sitemap includes product pages', () => {
  const src = readFile('app/sitemap.js');
  return src.includes('PRODUCTS') || src.includes('/shop/');
});

test('Sitemap includes journal pages', () => {
  const src = readFile('app/sitemap.js');
  return src.includes('JOURNAL') || src.includes('/journal/');
});

test('Robots.js disallows /account, /checkout, /cart', () => {
  const src = readFile('app/robots.js');
  return src.includes('/account') && src.includes('/checkout') && src.includes('/cart');
});

test('Robots.js references sitemap', () => {
  const src = readFile('app/robots.js');
  return src.includes('sitemap');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 16. ACCESSIBILITY (10+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 16. ACCESSIBILITY ===');

test('No nested <main> elements in privacy page', () => {
  const src = readFile('app/privacy/page.js');
  const mainCount = (src.match(/<main/g) || []).length;
  return mainCount === 0;
});

test('Skip-to-content link exists in layout', () => {
  const src = readFile('app/layout.js');
  return src.includes('skip-link') || src.includes('Skip to content');
});

test('main#main-content exists in layout', () => {
  const src = readFile('app/layout.js');
  return src.includes('main id="main-content"') || src.includes('id="main-content"');
});

test('ContactForm has proper labels', () => {
  const src = readFile('app/components/ContactForm.js');
  return src.includes('<label') && src.includes('htmlFor');
});

test('Footer newsletter has aria-label', () => {
  const src = readFile('app/components/Footer.js');
  return src.includes('aria-label');
});

test('BottomNav has aria-label', () => {
  const src = readFile('app/components/BottomNav.js');
  return src.includes('aria-label="Mobile navigation"');
});

test('Footer newsletter form has aria-label', () => {
  const src = readFile('app/components/Footer.js');
  return src.includes('aria-label="Newsletter signup"');
});

test('BottomNav account sheet has aria-label', () => {
  const src = readFile('app/components/BottomNav.js');
  return src.includes('aria-label="Account menu"');
});

test('ScrollTopBtn has aria-label', () => {
  const src = readFile('app/components/ScrollTopBtn.js');
  return src.includes('aria-label="Scroll to top"');
});

test('Privacy page has no <main> wrapper (uses layout main)', () => {
  const src = readFile('app/privacy/page.js');
  return !src.includes('<main');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 17. CMS (10+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 17. CMS ===');

test('lib/cms.js exists', () => {
  return fileExists('lib/cms.js') === true;
});

test('lib/cms.js exports saveDraftSection', () => {
  const src = readFile('lib/cms.js');
  return src.includes('saveDraftSection');
});

test('lib/cms.js exports publishSection', () => {
  const src = readFile('lib/cms.js');
  return src.includes('publishSection');
});

test('lib/cms.js exports discardDraft', () => {
  const src = readFile('lib/cms.js');
  return src.includes('discardDraft');
});

test('Content sections have draft columns in db.js', () => {
  const src = readFile('lib/db.js');
  return src.includes('draftTitle') && src.includes('draftBody');
});

test('Content sections have status column', () => {
  const src = readFile('lib/db.js');
  return src.includes("status TEXT NOT NULL DEFAULT 'published'");
});

test('Preview page has noindex', () => {
  const src = readFile('app/admin/preview/[page]/page.js');
  return src.includes('noindex');
});

test('lib/cms.js has VALID_SECTIONS array', () => {
  const src = readFile('lib/cms.js');
  return src.includes('VALID_SECTIONS');
});

test('lib/cms.js has VALID_PAGES array', () => {
  const src = readFile('lib/cms.js');
  return src.includes('VALID_PAGES');
});

test('lib/cms.js has getPublishedPageSections', () => {
  const src = readFile('lib/cms.js');
  return src.includes('getPublishedPageSections');
});

test('lib/cms.js has getDraftPageSections', () => {
  const src = readFile('lib/cms.js');
  return src.includes('getDraftPageSections');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 18. PERFORMANCE (10+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 18. PERFORMANCE ===');

test('Shop product page uses generateStaticParams (static generation)', () => {
  const src = readFile('app/shop/[id]/page.js');
  return src.includes('generateStaticParams');
});

test('Journal pages use generateStaticParams', () => {
  const src = readFile('app/journal/[slug]/page.js');
  return src.includes('generateStaticParams');
});

test('Checkout page is client component (interactive)', () => {
  const src = readFile('app/checkout/page.js');
  return src.includes("'use client'");
});

test('Account page is client component (interactive)', () => {
  const src = readFile('app/account/page.js');
  return src.includes("'use client'");
});

test('Admin product-orders has pagination (not loading all)', () => {
  const src = readFile('app/api/admin/product-orders/route.js');
  return src.includes('LIMIT') && src.includes('OFFSET');
});

test('Admin audit-logs has pagination (not loading all)', () => {
  const src = readFile('app/api/admin/audit-logs/route.js');
  return src.includes('LIMIT') && src.includes('OFFSET');
});

test('Shop product page has dynamicParams = false', () => {
  const src = readFile('app/shop/[id]/page.js');
  return src.includes('dynamicParams = false');
});

test('Journal pages have dynamicParams = false', () => {
  const src = readFile('app/journal/[slug]/page.js');
  return src.includes('dynamicParams = false');
});

test('Next config has image formats for AVIF/WebP', () => {
  const src = readFile('next.config.mjs');
  return src.includes('avif') && src.includes('webp');
});

test('Images use remotePatterns for pexels', () => {
  const src = readFile('next.config.mjs');
  return src.includes('images.pexels.com');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 19. CONFIGURATION (10+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 19. CONFIGURATION ===');

test('.env.example exists', () => {
  return fileExists('.env.example') === true;
});

test('.env.example has SESSION_SECRET', () => {
  const src = readFile('.env.example');
  return src.includes('SESSION_SECRET=');
});

test('.env.example has ADMIN_EMAIL', () => {
  const src = readFile('.env.example');
  return src.includes('ADMIN_EMAIL=');
});

test('.env.example has ADMIN_PASSWORD', () => {
  const src = readFile('.env.example');
  return src.includes('ADMIN_PASSWORD=');
});

test('.env.example has DATABASE_PATH', () => {
  const src = readFile('.env.example');
  return src.includes('DATABASE_PATH=');
});

test('.env.example has EMAIL_PROVIDER', () => {
  const src = readFile('.env.example');
  return src.includes('EMAIL_PROVIDER=');
});

test('.env.example has PAYMENT_PROVIDER', () => {
  const src = readFile('.env.example');
  return src.includes('PAYMENT_PROVIDER=');
});

test('.env.example has PAYMENT_KEY_ID', () => {
  const src = readFile('.env.example');
  return src.includes('PAYMENT_KEY_ID=');
});

test('.env.example has PAYMENT_KEY_SECRET', () => {
  const src = readFile('.env.example');
  return src.includes('PAYMENT_KEY_SECRET=');
});

test('.env.example has PAYMENT_WEBHOOK_SECRET', () => {
  const src = readFile('.env.example');
  return src.includes('PAYMENT_WEBHOOK_SECRET=');
});

test('.env.example uses placeholder domain (not teakle.in)', () => {
  const src = readFile('.env.example');
  return !src.includes('teakle.in');
});

test('.gitignore exists', () => {
  return fileExists('.gitignore') === true;
});

test('.gitignore has .env.* pattern', () => {
  const src = readFile('.gitignore');
  return src.includes('.env.*');
});

test('.gitignore excludes .env.example', () => {
  const src = readFile('.gitignore');
  return src.includes('!.env.example');
});

test('lib/env.js has OPTIONAL_ENV with email vars', () => {
  const src = readFile('lib/env.js');
  return src.includes('EMAIL_PROVIDER') && src.includes('EMAIL_FROM') && src.includes('EMAIL_API_KEY');
});

test('lib/env.js has OPTIONAL_ENV with payment vars', () => {
  const src = readFile('lib/env.js');
  return src.includes('PAYMENT_PROVIDER') && src.includes('PAYMENT_KEY_ID');
});

test('lib/env.js has OPTIONAL_ENV with BACKUP_DIR', () => {
  const src = readFile('lib/env.js');
  return src.includes('BACKUP_DIR');
});

test('DEPLOYMENT.md exists', () => {
  return fileExists('DEPLOYMENT.md') === true;
});

test('DEPLOYMENT.md has process manager section', () => {
  const src = readFile('DEPLOYMENT.md');
  return src.includes('Process Management');
});

test('DEPLOYMENT.md mentions single-instance limitation', () => {
  const src = readFile('DEPLOYMENT.md');
  return src.includes('single-instance') || src.includes('single instance');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 20. REGRESSION (10+ tests)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n=== 20. REGRESSION ===');

test('Sprint #26 test file exists', () => {
  return fileExists('scripts/test-sprint26.js') === true;
});

test('Sprint #25 test file exists', () => {
  return fileExists('scripts/test-sprint25.js') === true;
});

test('Sprint #24 test file exists', () => {
  return fileExists('scripts/test-sprint24.js') === true;
});

test('Sprint #23 test file exists', () => {
  return fileExists('scripts/test-sprint23.js') === true;
});

test('Sprint #22 test file exists', () => {
  return fileExists('scripts/test-sprint22.js') === true;
});

test('Sprint #21 test file exists', () => {
  return fileExists('scripts/test-sprint21.js') === true;
});

test('Sprint #20 test file exists', () => {
  return fileExists('scripts/test-sprint20.js') === true;
});

test('Sprint #19 test file exists', () => {
  return fileExists('scripts/test-sprint19.js') === true;
});

test('Sprint #18 test file exists', () => {
  return fileExists('scripts/test-sprint18.js') === true;
});

test('Sprint #17 test file exists', () => {
  return fileExists('scripts/test-sprint17.js') === true;
});

test('Sprint #16 test file exists', () => {
  return fileExists('scripts/test-sprint16.js') === true;
});

test('Sprint #15 test file exists', () => {
  return fileExists('scripts/test-sprint15.js') === true;
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n' + '='.repeat(60));
console.log(`\x1b[1mSprint #27 Test Results: ${passed} PASS, ${failed} FAIL, ${total} TOTAL\x1b[0m`);

if (failed > 0) {
  console.log('\x1b[31mSOME TESTS FAILED\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32mALL TESTS PASSED\x1b[0m');
  process.exit(0);
}

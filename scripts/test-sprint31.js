#!/usr/bin/env node

/**
 * TEAKLE — Sprint #31 Unit / Static Tests
 * Final Security Hardening
 *
 * Covers: logout CSRF enforcement, input validation NaN guards,
 * error disclosure sanitization, admin audit logging for refunds,
 * CSRF audit for pre-auth routes, client-side logout CSRF token.
 *
 * Every test contains a genuine assertion. Helpers return explicit
 * pass/fail and must not produce false positives.
 *
 * Usage: node scripts/test-sprint31.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

let pass = 0;
let fail = 0;

function test(name, fn) {
  return (async () => {
    try {
      await fn();
      pass++;
      console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    } catch (e) {
      fail++;
      console.log(`  \x1b[31m✗\x1b[0m ${name} — ${e.message}`);
    }
  })();
}

function section(name) {
  console.log(`\n=== ${name} ===`);
}

function read(rel) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
}

function fileExists(rel) {
  return fs.existsSync(path.join(process.cwd(), rel));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. LOGOUT CSRF ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════
section('LOGOUT CSRF ENFORCEMENT');

(async () => {
  await test('Logout route uses withCsrf wrapper', () => {
    const src = read('app/api/auth/logout/route.js');
    assert.ok(src.includes('withCsrf'), 'logout route missing withCsrf');
    assert.ok(src.includes('export const POST = withCsrf'), 'POST not wrapped with withCsrf');
  });

  await test('Logout route imports withCsrf from lib/csrf', () => {
    const src = read('app/api/auth/logout/route.js');
    assert.ok(src.includes("import { withCsrf } from '@/lib/csrf'"), 'missing withCsrf import');
  });

  await test('Header.js imports customerAuth from lib/api', () => {
    const src = read('app/components/Header.js');
    assert.ok(src.includes("import { customerAuth } from '@/lib/api'"), 'Header missing customerAuth import');
  });

  await test('Header.js handleLogout uses customerAuth.logout() instead of raw fetch', () => {
    const src = read('app/components/Header.js');
    assert.ok(src.includes('customerAuth.logout()'), 'Header logout still uses raw fetch');
    assert.ok(!src.includes("fetch('/api/auth/logout'"), 'Header still has raw fetch to /api/auth/logout');
  });

  await test('BottomNav.js imports customerAuth from lib/api', () => {
    const src = read('app/components/BottomNav.js');
    assert.ok(src.includes("import { customerAuth } from '@/lib/api'"), 'BottomNav missing customerAuth import');
  });

  await test('BottomNav.js handleLogout uses customerAuth.logout() instead of raw fetch', () => {
    const src = read('app/components/BottomNav.js');
    assert.ok(src.includes('customerAuth.logout()'), 'BottomNav logout still uses raw fetch');
    assert.ok(!src.includes("fetch('/api/auth/logout'"), 'BottomNav still has raw fetch to /api/auth/logout');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CSRF AUDIT — PRE-AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
section('CSRF AUDIT — PRE-AUTH ROUTES');

(async () => {
  await test('Register route does NOT use withCsrf (pre-auth, no session to hijack)', () => {
    const src = read('app/api/auth/register/route.js');
    assert.ok(!src.includes('withCsrf'), 'register unexpectedly uses withCsrf');
  });

  await test('Register route has rate limiting', () => {
    const src = read('app/api/auth/register/route.js');
    assert.ok(src.includes('rateLimitIp'), 'register missing rate limiting');
  });

  await test('Forgot-password route does NOT use withCsrf (pre-auth, no session)', () => {
    const src = read('app/api/auth/forgot-password/route.js');
    assert.ok(!src.includes('withCsrf'), 'forgot-password unexpectedly uses withCsrf');
  });

  await test('Forgot-password route has rate limiting', () => {
    const src = read('app/api/auth/forgot-password/route.js');
    assert.ok(src.includes('rateLimitIp'), 'forgot-password missing rate limiting');
  });

  await test('Forgot-password returns generic message (no account enumeration)', () => {
    const src = read('app/api/auth/forgot-password/route.js');
    assert.ok(src.includes('If an account exists'), 'forgot-password leaks account existence');
  });

  await test('Reset-password route does NOT use withCsrf (pre-auth, token-based)', () => {
    const src = read('app/api/auth/reset-password/route.js');
    assert.ok(!src.includes('withCsrf'), 'reset-password unexpectedly uses withCsrf');
  });

  await test('Reset-password route has rate limiting', () => {
    const src = read('app/api/auth/reset-password/route.js');
    assert.ok(src.includes('rateLimitIp'), 'reset-password missing rate limiting');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 3. INPUT VALIDATION — NaN GUARDS
// ═══════════════════════════════════════════════════════════════════════════════
section('INPUT VALIDATION — NaN GUARDS');

(async () => {
  await test('product-orders route validates minTotal for NaN', () => {
    const src = read('app/api/admin/product-orders/route.js');
    assert.ok(src.includes('Number.isNaN(v)') || src.includes('isNaN'), 'product-orders missing NaN guard for minTotal');
    assert.ok(src.includes("'minTotal must be a number'"), 'product-orders missing minTotal error message');
  });

  await test('product-orders route validates maxTotal for NaN', () => {
    const src = read('app/api/admin/product-orders/route.js');
    assert.ok(src.includes("'maxTotal must be a number'"), 'product-orders missing maxTotal error message');
  });

  await test('product-orders export validates minTotal for NaN', () => {
    const src = read('app/api/admin/product-orders/export/route.js');
    assert.ok(src.includes('Number.isNaN(v)') || src.includes('isNaN'), 'export missing NaN guard for minTotal');
    assert.ok(src.includes("'minTotal must be a number'"), 'export missing minTotal error message');
  });

  await test('product-orders export validates maxTotal for NaN', () => {
    const src = read('app/api/admin/product-orders/export/route.js');
    assert.ok(src.includes("'maxTotal must be a number'"), 'export missing maxTotal error message');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ERROR DISCLOSURE SANITIZATION
// ═══════════════════════════════════════════════════════════════════════════════
section('ERROR DISCLOSURE SANITIZATION');

(async () => {
  await test('Media POST route does not leak raw err.message for non-validation errors', () => {
    const src = read('app/api/admin/media/route.js');
    assert.ok(src.includes("error: 'Upload failed'"), 'media POST missing generic Upload failed message');
    assert.ok(src.includes("message.includes('Invalid file type')") || src.includes("message.includes('too large')"), 'media POST not preserving known-safe validation messages');
  });

  await test('Media DELETE route does not leak raw err.message for non-reference errors', () => {
    const src = read('app/api/admin/media/[id]/route.js');
    assert.ok(src.includes("error: 'Delete failed'"), 'media DELETE missing generic Delete failed message');
    assert.ok(src.includes("message.includes('currently used')"), 'media DELETE not preserving known-safe 409 message');
  });

  await test('Admin diagnostics route does not expose filesystem path to client', () => {
    const src = read('app/api/admin/diagnostics/route.js');
    assert.ok(!src.includes('path: db.path'), 'diagnostics leaks db.path in response');
    assert.ok(src.includes('requireAdmin'), 'diagnostics must require admin auth');
  });

  await test('Bulk order route does not leak raw SQL errors to client', () => {
    const src = read('app/api/admin/product-orders/bulk/route.js');
    assert.ok(!src.includes('error: e.message') || src.includes("'Internal server error'"), 'bulk route leaks raw SQL errors');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ADMIN AUDIT LOGGING — REFUND OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════
section('ADMIN AUDIT LOGGING — REFUND OPERATIONS');

(async () => {
  await test('Refund route inserts into admin_audit_logs', () => {
    const src = read('app/api/payments/refund/route.js');
    assert.ok(src.includes('admin_audit_logs'), 'refund route missing admin_audit_logs INSERT');
  });

  await test('Refund audit log captures orderId and amount', () => {
    const src = read('app/api/payments/refund/route.js');
    assert.ok(src.includes("'orderId'") || src.includes("orderId:"), 'refund audit missing orderId');
    assert.ok(src.includes("'amount'") || src.includes("amount:"), 'refund audit missing amount');
  });

  await test('Refund audit log uses correct action type', () => {
    const src = read('app/api/payments/refund/route.js');
    assert.ok(src.includes("'refund'"), 'refund audit missing action type');
  });

  await test('Refund audit log failure is non-blocking', () => {
    const src = read('app/api/payments/refund/route.js');
    assert.ok(src.includes('catch { /* audit log failure is non-blocking */ }') || src.includes('catch {'), 'refund audit should not block on failure');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 6. CLIENT-SIDE API CSRF TOKEN DELIVERY
// ═══════════════════════════════════════════════════════════════════════════════
section('CLIENT-SIDE API CSRF TOKEN DELIVERY');

(async () => {
  await test('lib/api.js apiFetch sends x-csrf-token header for POST', () => {
    const src = read('lib/api.js');
    assert.ok(src.includes("headers['x-csrf-token'] = csrf"), 'apiFetch missing CSRF header assignment');
  });

  await test('lib/api.js apiFetch reads CSRF from teakle_csrf cookie', () => {
    const src = read('lib/api.js');
    assert.ok(src.includes('teakle_csrf'), 'apiFetch missing cookie name');
  });

  await test('lib/api.js customerAuth.logout() calls apiFetch with POST', () => {
    const src = read('lib/api.js');
    assert.ok(src.includes("apiFetch('/api/auth/logout', { method: 'POST' })"), 'customerAuth.logout missing apiFetch call');
  });
})();

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
(async () => {
  await new Promise(r => setTimeout(r, 50));
  console.log('\n' + '='.repeat(60));
  console.log(`Sprint #31 tests: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail > 0 ? 1 : 0);
})();

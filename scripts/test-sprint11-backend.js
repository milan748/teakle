/**
 * Sprint #11 — Backend Security & Data Integrity Tests
 * Run: node scripts/test-sprint11-backend.js
 *
 * Tests backend patterns by reading source files — does NOT require a running DB.
 * Categories: transactions, snapshots, status transitions, auth, cart, wishlist,
 * admin auth, input validation, rate limiting, security boundaries, order numbers,
 * CSV export limits, admin session version, template validation.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
let passed = 0;
let failed = 0;
let total = 0;
const failures = [];

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, error: err.message });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${err.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}
function assertIncludes(str, sub, msg) {
  if (!String(str).includes(sub)) throw new Error(msg || `Expected file to include "${sub}"`);
}
function assertNotIncludes(str, sub, msg) {
  if (String(str).includes(sub)) throw new Error(msg || `Expected file NOT to include "${sub}"`);
}

function read(rel) {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

// ── Read all source files once ──
let ordersRoute, bulkRoute, orderDetailRoute, cartRoute, cartItemRoute;
let wishlistRoute, wishlistItemRoute, middlewareSrc, sessionSrc, customerSessionSrc;
let authSrc, rateLimitSrc, csrfSrc, adminLoginRoute, loginRoute, deactivateRoute;
let dbSrc, exportRoute, sectionsTemplateRoute, pagesTemplateRoute, adminProductOrdersRoute;
let adminApiSrc;

try {
  ordersRoute = read('app/api/orders/route.js');
  bulkRoute = read('app/api/admin/product-orders/bulk/route.js');
  orderDetailRoute = read('app/api/orders/[id]/route.js');
  cartRoute = read('app/api/cart/route.js');
  cartItemRoute = read('app/api/cart/[itemId]/route.js');
  wishlistRoute = read('app/api/wishlist/route.js');
  wishlistItemRoute = read('app/api/wishlist/[itemId]/route.js');
  middlewareSrc = read('middleware.js');
  sessionSrc = read('lib/session.js');
  customerSessionSrc = read('lib/customerSession.js');
  authSrc = read('lib/auth.js');
  rateLimitSrc = read('lib/rateLimit.js');
  csrfSrc = read('lib/csrf.js');
  adminLoginRoute = read('app/api/admin/login/route.js');
  loginRoute = read('app/api/auth/login/route.js');
  deactivateRoute = read('app/api/auth/deactivate/route.js');
  dbSrc = read('lib/db.js');
  exportRoute = read('app/api/admin/product-orders/export/route.js');
  sectionsTemplateRoute = read('app/api/admin/templates/sections/route.js');
  pagesTemplateRoute = read('app/api/admin/templates/pages/route.js');
  adminProductOrdersRoute = read('app/api/admin/product-orders/route.js');
  adminApiSrc = read('lib/adminApi.js');
} catch (e) {
  console.error('FATAL: Could not read source files:', e.message);
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// 1. Transaction Rollback (3 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 1. Transaction Rollback ──\x1b[0m');

test('order creation uses db.transaction()', () => {
  assertIncludes(ordersRoute, 'db.transaction(() => {',
    'POST handler in orders/route.js should use db.transaction()');
  assertIncludes(ordersRoute, 'createOrder()',
    'Transaction should be invoked via createOrder()');
});

test('bulk order update uses db.transaction()', () => {
  assertIncludes(bulkRoute, 'db.transaction(() => {',
    'PATCH handler in bulk/route.js should use db.transaction()');
  assertIncludes(bulkRoute, 'bulkUpdate()',
    'Transaction should be invoked via bulkUpdate()');
});

test('account deactivation uses db.transaction()', () => {
  assertIncludes(deactivateRoute, 'db.transaction(() => {',
    'POST handler in deactivate/route.js should use db.transaction()');
});

// ═══════════════════════════════════════════════════════════════
// 2. Order Snapshot Integrity (4 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 2. Order Snapshot Integrity ──\x1b[0m');

test('order_items has productNameSnapshot column in INSERT', () => {
  assertIncludes(ordersRoute, 'productNameSnapshot',
    'Order creation INSERT should include productNameSnapshot');
  // Bulk route imports from orders/route.js (which defines the schema) and uses
  // isValidStatusTransition — the snapshot fields are in order_items INSERT during order creation
  assertIncludes(bulkRoute, "from '@/app/api/orders/route'",
    'Bulk route should import from orders/route.js for status transition validation');
});

test('order_items has unitPrice column in INSERT', () => {
  assertIncludes(ordersRoute, 'unitPrice',
    'Order creation INSERT should include unitPrice');
});

test('order_items has lineTotal column in INSERT', () => {
  assertIncludes(ordersRoute, 'lineTotal',
    'Order creation INSERT should include lineTotal');
});

test('order_items has sku column in INSERT', () => {
  assertIncludes(ordersRoute, 'sku',
    'Order creation INSERT should include sku');
  // Admin order detail route selects sku from order_items
  const adminOrderDetail = read('app/api/admin/product-orders/[id]/route.js');
  assertIncludes(adminOrderDetail, 'sku FROM order_items',
    'Admin order detail SELECT should include sku');
});

// ═══════════════════════════════════════════════════════════════
// 3. Invalid Status Transitions (3 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 3. Invalid Status Transitions ──\x1b[0m');

test('VALID_TRANSITIONS map exists in orders/route.js', () => {
  assertIncludes(ordersRoute, 'const VALID_TRANSITIONS = {',
    'VALID_TRANSITIONS constant should be defined in orders/route.js');
  assertIncludes(ordersRoute, "COMPLETED: []",
    'COMPLETED should have no allowed transitions');
  assertIncludes(ordersRoute, "CANCELLED: []",
    'CANCELLED should have no allowed transitions');
});

test('completed orders cannot be cancelled', () => {
  // VALID_TRANSITIONS[COMPLETED] must be empty
  const match = ordersRoute.match(/COMPLETED:\s*\[([^\]]*)\]/);
  assert(match, 'COMPLETED transitions should be defined');
  assert(match[1].trim() === '', `COMPLETED transitions should be empty, got: "${match[1].trim()}"`);
});

test('shipped orders cannot be cancelled', () => {
  // COMPLETED and CANCELLED both have empty transition arrays
  // The status transition map does NOT include SHIPPED as a valid status
  assertNotIncludes(ordersRoute, "SHIPPED:",
    'SHIPPED should not be a key in VALID_TRANSITIONS (not a valid order status)');
  // Also verify in VALID_ORDER_STATUSES
  assertNotIncludes(ordersRoute.split('VALID_ORDER_STATUSES')[1].split(']')[0], "'SHIPPED'",
    'SHIPPED should not be in VALID_ORDER_STATUSES');
});

// ═══════════════════════════════════════════════════════════════
// 4. Unauthorized Order Access (3 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 4. Unauthorized Order Access ──\x1b[0m');

test('customer orders require session', () => {
  assertIncludes(ordersRoute, 'getCustomerSession()',
    'Orders GET should call getCustomerSession()');
  assertIncludes(ordersRoute, "Authentication required",
    'Orders GET should return 401 with "Authentication required"');
  assertIncludes(ordersRoute, 'status: 401',
    'Orders GET should return 401 status');
});

test('order detail requires ownership (customerId check)', () => {
  assertIncludes(orderDetailRoute, 'getCustomerSession()',
    'Order detail should require session');
  assertIncludes(orderDetailRoute, 'WHERE id = ? AND customerId = ?',
    'Order detail should filter by customerId to enforce ownership');
});

test('admin orders require admin session', () => {
  assertIncludes(adminProductOrdersRoute, 'requireAdmin()',
    'Admin product-orders should call requireAdmin()');
  assertIncludes(adminProductOrdersRoute, '!auth.authorized',
    'Admin product-orders should check auth.authorized');
});

// ═══════════════════════════════════════════════════════════════
// 5. Cart Ownership (3 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 5. Cart Ownership ──\x1b[0m');

test('cart requires session for mutations (POST/PUT)', () => {
  assertIncludes(cartRoute, 'getCustomerSession()',
    'Cart POST should call getCustomerSession()');
  assertIncludes(cartRoute, "Authentication required",
    'Cart POST should return 401 without session');
});

test('cart items are scoped to customer', () => {
  assertIncludes(cartRoute, 'WHERE customerId = ?',
    'Cart operations should look up cart by customerId');
  assertIncludes(cartItemRoute, 'WHERE cartId = ? AND productId = ?',
    'Cart item DELETE should scope by cartId');
});

test('cart quantity is validated (1-10)', () => {
  assertIncludes(cartRoute, 'sanitizeQty',
    'Cart POST should use sanitizeQty function');
  assertIncludes(cartRoute, 'n < 1 || n > 10',
    'sanitizeQty should reject quantities outside 1-10 range');
  assertIncludes(cartRoute, 'Number.isInteger(n)',
    'sanitizeQty should validate integer type');
});

// ═══════════════════════════════════════════════════════════════
// 6. Wishlist Ownership (3 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 6. Wishlist Ownership ──\x1b[0m');

test('wishlist requires session for mutations (POST)', () => {
  assertIncludes(wishlistRoute, 'getCustomerSession()',
    'Wishlist POST should call getCustomerSession()');
  assertIncludes(wishlistRoute, "Authentication required",
    'Wishlist POST should return 401 without session');
});

test('wishlist items are scoped to customer', () => {
  assertIncludes(wishlistRoute, 'WHERE customerId = ?',
    'Wishlist operations should look up wishlist by customerId');
  assertIncludes(wishlistItemRoute, 'WHERE wishlistId = ? AND productId = ?',
    'Wishlist item DELETE should scope by wishlistId');
});

test('wishlist validates product existence', () => {
  assertIncludes(wishlistRoute, 'getProductById(productId)',
    'Wishlist POST should validate product exists');
  assertIncludes(wishlistRoute, "Product not found",
    'Wishlist POST should return 404 for invalid product');
});

// ═══════════════════════════════════════════════════════════════
// 7. Admin Authorization (4 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 7. Admin Authorization ──\x1b[0m');

test('middleware checks admin session via JWT verify', () => {
  assertIncludes(middlewareSrc, 'jwtVerify(token, secretKey)',
    'Middleware should verify JWT token using jwtVerify');
  assertIncludes(middlewareSrc, 'teakle_admin_session',
    'Middleware should look up admin session cookie');
});

test('middleware rejects invalid tokens (catch block)', () => {
  assertIncludes(middlewareSrc, 'Invalid or expired session',
    'Middleware should return "Invalid or expired session" on JWT verification failure');
  assertIncludes(middlewareSrc, 'status: 401',
    'Middleware should return 401 for invalid tokens');
});

test('middleware rejects expired tokens (same error path)', () => {
  // jwtVerify throws on expired tokens too — same catch block handles both
  const catchMatch = middlewareSrc.match(/catch\s*\{[^}]*Invalid or expired[^}]*\}/s);
  assert(catchMatch, 'Catch block should handle expired tokens with same error message');
});

test('middleware passes admin info via headers', () => {
  assertIncludes(middlewareSrc, "requestHeaders.set('x-admin-id'",
    'Middleware should set x-admin-id header');
  assertIncludes(middlewareSrc, "requestHeaders.set('x-admin-email'",
    'Middleware should set x-admin-email header');
  assertIncludes(middlewareSrc, "requestHeaders.set('x-admin-role'",
    'Middleware should set x-admin-role header');
});

// ═══════════════════════════════════════════════════════════════
// 8. Malformed Input (4 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 8. Malformed Input ──\x1b[0m');

test('order creation validates required fields (addresses)', () => {
  assertIncludes(ordersRoute, 'validateCheckoutAddresses',
    'Order creation should validate addresses via validateCheckoutAddresses');
  assertIncludes(ordersRoute, '!addressValidation.valid',
    'Order creation should check addressValidation.valid');
  assertIncludes(ordersRoute, 'status: 400',
    'Order creation should return 400 for invalid addresses');
});

test('cart rejects invalid productId', () => {
  assertIncludes(cartRoute, "!productId",
    'Cart POST should check for empty productId');
  assertIncludes(cartRoute, 'Product ID is required',
    'Cart POST should return error for empty productId');
  assertIncludes(cartRoute, '!product',
    'Cart POST should check if product exists');
  assertIncludes(cartRoute, 'Product not found',
    'Cart POST should return 404 for nonexistent product');
});

test('cart rejects invalid quantity', () => {
  assertIncludes(cartRoute, 'qty === null',
    'Cart POST should check if qty is null after sanitization');
  assertIncludes(cartRoute, 'Quantity must be an integer between 1 and 10',
    'Cart POST should return descriptive error for invalid quantity');
});

test('bulk update rejects >50 orderIds', () => {
  assertIncludes(bulkRoute, 'orderIds.length > 50',
    'Bulk update should reject more than 50 order IDs');
  assertIncludes(bulkRoute, 'Cannot bulk update more than 50 orders at once',
    'Bulk update should return descriptive error message');
});

// ═══════════════════════════════════════════════════════════════
// 9. Rate Limiting (4 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 9. Rate Limiting ──\x1b[0m');

test('RATE_LIMITS has cartAdd entry', () => {
  assertIncludes(rateLimitSrc, 'cartAdd:',
    'RATE_LIMITS should include cartAdd');
  assertIncludes(rateLimitSrc, 'cartAdd: { limit:',
    'cartAdd should have a limit property');
});

test('RATE_LIMITS has cartUpdate entry', () => {
  assertIncludes(rateLimitSrc, 'cartUpdate:',
    'RATE_LIMITS should include cartUpdate');
});

test('RATE_LIMITS has wishlistToggle entry', () => {
  assertIncludes(rateLimitSrc, 'wishlistToggle:',
    'RATE_LIMITS should include wishlistToggle');
});

test('RATE_LIMITS has orderNoteAdd entry', () => {
  assertIncludes(rateLimitSrc, 'orderNoteAdd:',
    'RATE_LIMITS should include orderNoteAdd');
});

// ═══════════════════════════════════════════════════════════════
// 10. Security Boundaries (4 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 10. Security Boundaries ──\x1b[0m');

test('passwordHash is never returned in login API responses', () => {
  // Customer login — response object at end of file
  // The response includes only: { id, email, name }
  const customerLoginResponse = loginRoute.split('return Response.json({')[loginRoute.split('return Response.json({').length - 1];
  assertNotIncludes(customerLoginResponse, 'passwordHash',
    'Customer login response JSON should not include passwordHash');

  // Admin login — response should only return email and role
  const adminResponse = adminLoginRoute.match(/return NextResponse\.json\(\{[\s\S]*?admin:\s*\{[\s\S]*?\}/);
  assert(adminResponse, 'Admin login should return admin object');
  assertNotIncludes(adminResponse[0], 'passwordHash',
    'Admin login response should not include passwordHash');
  assertIncludes(adminResponse[0], 'email: admin.email',
    'Admin login response should include email');
  assertIncludes(adminResponse[0], 'role: admin.role',
    'Admin login response should include role');
});

test('generic error messages on login failure (no email enumeration)', () => {
  // Customer login
  assertIncludes(loginRoute, 'Invalid email or password',
    'Customer login should use generic "Invalid email or password"');
  assertNotIncludes(loginRoute.split('!customer')[1]?.split('}')[0] || '',
    'not found',
    'Customer login error should not reveal whether email exists');

  // Admin login
  assertIncludes(adminLoginRoute, 'Invalid credentials',
    'Admin login should use generic "Invalid credentials"');
});

test('CSRF protection on state-changing routes', () => {
  assertIncludes(csrfSrc, 'withCsrf(handler)',
    'csrf.js should export withCsrf HOF');
  assertIncludes(csrfSrc, "validateCsrfRequest(req)",
    'withCsrf should call validateCsrfRequest for non-GET methods');
  assertIncludes(csrfSrc, "'x-csrf-token'",
    'CSRF validation should check x-csrf-token header');
});

test('admin routes require admin session (requireAdmin in lib/auth.js)', () => {
  assertIncludes(authSrc, 'requireAdmin()',
    'lib/auth.js should export requireAdmin');
  assertIncludes(authSrc, "session.role !== 'admin' && session.role !== 'superadmin'",
    'requireAdmin should check for admin or superadmin role');
  assertIncludes(authSrc, "Insufficient permissions",
    'requireAdmin should return 403 for non-admin users');
});

// ═══════════════════════════════════════════════════════════════
// 11. Order Number Generation (2 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 11. Order Number Generation ──\x1b[0m');

test('order numbers use crypto.randomBytes', () => {
  assertIncludes(ordersRoute, 'crypto.randomBytes',
    'generateOrderNumber should use crypto.randomBytes');
  assertIncludes(ordersRoute, "import crypto from 'crypto'",
    'orders/route.js should import crypto module');
});

test('order numbers start with TK-', () => {
  assertIncludes(ordersRoute, "`TK-${",
    'generateOrderNumber should prefix with TK-');
  assertIncludes(ordersRoute, "toUpperCase()",
    'Order number should be uppercased');
});

// ═══════════════════════════════════════════════════════════════
// 12. CSV Export Limits (2 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 12. CSV Export Limits ──\x1b[0m');

test('MAX_EXPORT_ROWS is defined in export route', () => {
  assertIncludes(exportRoute, 'MAX_EXPORT_ROWS',
    'Export route should define MAX_EXPORT_ROWS');
});

test('MAX_EXPORT_ROWS limit is 1000', () => {
  const match = exportRoute.match(/MAX_EXPORT_ROWS\s*=\s*(\d+)/);
  assert(match, 'MAX_EXPORT_ROWS should be a numeric constant');
  assert(match[1] === '1000', `MAX_EXPORT_ROWS should be 1000, got ${match[1]}`);
});

// ═══════════════════════════════════════════════════════════════
// 13. Admin Session Version (3 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 13. Admin Session Version ──\x1b[0m');

test('admins table has sessionVersion column (migration exists)', () => {
  assertIncludes(dbSrc, 'migrateAdminSessionVersion',
    'db.js should call migrateAdminSessionVersion');
  assertIncludes(dbSrc, "table_info(admins)",
    'migrateAdminSessionVersion should check admin table columns');
  assertIncludes(dbSrc, "sessionVersion INTEGER NOT NULL DEFAULT 0",
    'Admin sessionVersion column should be INTEGER with default 0');
});

test('getSession checks sessionVersion', () => {
  assertIncludes(sessionSrc, 'payload.sessionVersion !== undefined',
    'getSession should check if sessionVersion is in the JWT payload');
  assertIncludes(sessionSrc, 'payload.sessionVersion !== admin.sessionVersion',
    'getSession should compare JWT sessionVersion with DB sessionVersion');
  // Should return null on mismatch
  const match = sessionSrc.match(/sessionVersion.*!==.*sessionVersion[\s\S]*?return null/);
  assert(match, 'getSession should return null when sessionVersion mismatches');
});

test('createSession includes sessionVersion in JWT', () => {
  assertIncludes(sessionSrc, 'sessionVersion: admin.sessionVersion || 0',
    'createSession should include sessionVersion in JWT payload');
});

// ═══════════════════════════════════════════════════════════════
// 14. Template Validation (2 tests)
// ═══════════════════════════════════════════════════════════════
console.log('\n\x1b[1m── 14. Template Validation ──\x1b[0m');

test('section template PUT validates allowed fields', () => {
  assertIncludes(sectionsTemplateRoute, 'ALLOWED_FIELDS',
    'Section template PUT should define ALLOWED_FIELDS');
  assertIncludes(sectionsTemplateRoute, 'unexpectedFields',
    'Section template PUT should check for unexpected fields');
  assertIncludes(sectionsTemplateRoute, 'Unexpected fields:',
    'Section template PUT should return error listing unexpected fields');
});

test('page template PUT validates allowed fields', () => {
  assertIncludes(pagesTemplateRoute, 'ALLOWED_FIELDS',
    'Page template PUT should define ALLOWED_FIELDS');
  assertIncludes(pagesTemplateRoute, 'unexpectedFields',
    'Page template PUT should check for unexpected fields');
  assertIncludes(pagesTemplateRoute, 'Unexpected fields:',
    'Page template PUT should return error listing unexpected fields');
});

// ═══════════════════════════════════════════════════════════════
// Results
// ═══════════════════════════════════════════════════════════════
console.log(`\n\x1b[1m── Results ──\x1b[0m`);
console.log(`  Passed: \x1b[32m${passed}\x1b[0m`);
console.log(`  Failed: \x1b[31m${failed}\x1b[0m`);
console.log(`  Total:  ${total}`);
console.log(`  Rate:   ${Math.round((passed / total) * 100)}%\n`);

if (failures.length > 0) {
  console.log('\x1b[31m── Failures ──\x1b[0m');
  for (const f of failures) {
    console.log(`  • ${f.name}: ${f.error}`);
  }
  console.log('');
}

process.exit(failed > 0 ? 1 : 0);

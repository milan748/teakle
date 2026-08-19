import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
let passed = 0, failed = 0, total = 0;
function test(n, fn) { total++; try { fn(); passed++; console.log("  \x1b[32m✓\x1b[0m " + n); } catch(e) { failed++; console.log("  \x1b[31m✗\x1b[0m " + n); console.log("    " + e.message); } }
function assert(c, m) { if (!c) throw new Error(m || "fail"); }
function inc(h, n) { if (!h.includes(n)) throw new Error("missing: " + n); }
function exc(h, n) { if (h.includes(n)) throw new Error("should not have: " + n); }
function exists(p) { if (!fs.existsSync(path.join(root, p))) throw new Error("no file: " + p); }
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }

const DB = read('lib/db.js');
const AUDIT_ROUTE = read('app/api/admin/audit-logs/route.js');
const BULK_ROUTE = read('app/api/admin/product-orders/bulk/route.js');
const ORDERS_ROUTE = read('app/api/admin/product-orders/route.js');
const ORDER_DETAIL = read('app/api/admin/product-orders/[id]/route.js');
const ORDER_ACTIVITY = read('app/api/admin/product-orders/[id]/activity/route.js');
const ORDER_NOTES = read('app/api/admin/product-orders/[id]/notes/route.js');
const PRODUCT_EXPORT = read('app/api/admin/product-orders/export/route.js');
const CUSTOM_EXPORT = read('app/api/admin/custom-orders/export/route.js');
const CONTACT_EXPORT = read('app/api/admin/contact/export/route.js');
const TRADE_EXPORT = read('app/api/admin/trade/export/route.js');
const NEWSLETTER_EXPORT = read('app/api/admin/newsletter/export/route.js');
const DASHBOARD = read('app/api/admin/dashboard/route.js');
const DASHBOARD_UI = read('app/admin/DashboardOverview.js');
const AUDIT_UI = read('app/admin/AuditLogManager.js');
const ORDERS_UI = read('app/admin/OrdersManager.js');
const ADMIN_SIDEBAR = read('app/admin/AdminDashboard.js');
const LOGGER = read('lib/logger.js');
const RATE_LIMIT = read('lib/rateLimit.js');
const CSRF = read('lib/csrf.js');
const AUTH = read('lib/auth.js');
const SESSION = read('lib/session.js');

console.log("\n=== SPRINT #20 TEST SUITE ===\n");

// ──────────────────────────────────────────────
// 1. AUDIT LOG
// ──────────────────────────────────────────────
console.log("1. AUDIT LOG");
test("admin_audit_logs table in db.js", () => inc(DB, "admin_audit_logs"));
test("migration idempotent", () => inc(DB, "CREATE TABLE IF NOT EXISTS admin_audit_logs"));
test("id column", () => inc(DB, "admin_audit_logs") && inc(DB, "id INTEGER"));
test("adminId column", () => inc(DB, "adminId INTEGER"));
test("action column", () => inc(DB, "action TEXT"));
test("entityType column", () => inc(DB, "entityType TEXT"));
test("entityId column", () => inc(DB, "entityId TEXT"));
test("metadata column", () => inc(DB, "metadata TEXT"));
test("createdAt column", () => inc(DB, "createdAt TEXT"));
test("adminId index", () => inc(DB, "idx_admin_audit_logs_adminId"));
test("action index", () => inc(DB, "idx_admin_audit_logs_action"));
test("entity index", () => inc(DB, "idx_admin_audit_logs_entity"));
test("createdAt index", () => inc(DB, "idx_admin_audit_logs_createdAt"));
test("audit log route uses requireAdmin", () => inc(AUDIT_ROUTE, "requireAdmin"));
test("audit log route has pagination", () => inc(AUDIT_ROUTE, "LIMIT") && inc(AUDIT_ROUTE, "OFFSET"));
test("audit log route filters by action", () => inc(AUDIT_ROUTE, "action = ?"));
test("audit log route filters by entityType", () => inc(AUDIT_ROUTE, "entityType = ?"));
test("audit log route filters by dateFrom", () => inc(AUDIT_ROUTE, "dateFrom"));
test("audit log route filters by dateTo", () => inc(AUDIT_ROUTE, "dateTo"));
test("audit log route newest first", () => inc(AUDIT_ROUTE, "ORDER BY") && inc(AUDIT_ROUTE, "DESC"));
test("audit log route joins admin email", () => inc(AUDIT_ROUTE, "adminEmail"));
test("audit log route no secrets", () => { exc(AUDIT_ROUTE, "passwordHash"); exc(AUDIT_ROUTE, "SESSION_SECRET"); });
test("logger has adminAudit method", () => inc(LOGGER, "adminAudit"));
test("logger has orderActivity method", () => inc(LOGGER, "orderActivity"));
test("logger sanitizes sensitive keys", () => inc(LOGGER, "SENSITIVE_KEYS") && inc(LOGGER, "REDACTED"));

// ──────────────────────────────────────────────
// 2. ORDER ACTIVITY
// ──────────────────────────────────────────────
console.log("\n2. ORDER ACTIVITY");
test("order_activity table in db.js", () => inc(DB, "order_activity"));
test("migration idempotent", () => inc(DB, "CREATE TABLE IF NOT EXISTS order_activity"));
test("orderId column", () => inc(DB, "orderId INTEGER"));
test("actorType column", () => inc(DB, "actorType TEXT"));
test("actorId column", () => inc(DB, "actorId TEXT"));
test("action column in order_activity", () => inc(DB, "action TEXT"));
test("oldValue column", () => inc(DB, "oldValue TEXT"));
test("newValue column", () => inc(DB, "newValue TEXT"));
test("note column", () => inc(DB, "note TEXT"));
test("isCustomerVisible column", () => inc(DB, "isCustomerVisible INTEGER"));
test("orderId index", () => inc(DB, "idx_order_activity_orderId"));
test("customerVisible index", () => inc(DB, "idx_order_activity_customerVisible"));
test("activity route uses requireAdmin", () => inc(ORDER_ACTIVITY, "requireAdmin"));
test("activity route joins order_status_history", () => inc(ORDER_ACTIVITY, "order_status_history"));
test("activity route joins order_notes", () => inc(ORDER_ACTIVITY, "order_notes"));
test("activity route merges sources", () => inc(ORDER_ACTIVITY, "unified"));
test("activity route sorts by createdAt", () => inc(ORDER_ACTIVITY, "sort"));
test("notes route uses requireAdmin", () => inc(ORDER_NOTES, "requireAdmin"));
test("notes route uses CSRF", () => inc(ORDER_NOTES, "withCsrf"));
test("notes route validates content", () => inc(ORDER_NOTES, "content") && inc(ORDER_NOTES, "length > 5000"));
test("notes route marks isInternal", () => inc(ORDER_NOTES, "isInternal"));

// ──────────────────────────────────────────────
// 3. ORDER FILTERING
// ──────────────────────────────────────────────
console.log("\n3. ORDER FILTERING");
test("orders route uses requireAdmin", () => inc(ORDERS_ROUTE, "requireAdmin"));
test("status filter", () => inc(ORDERS_ROUTE, "o.status = ?"));
test("paymentStatus filter", () => inc(ORDERS_ROUTE, "o.paymentStatus = ?"));
test("dateFrom filter", () => inc(ORDERS_ROUTE, "o.createdAt >= ?"));
test("dateTo filter", () => inc(ORDERS_ROUTE, "o.createdAt <= ?"));
test("customer filter", () => inc(ORDERS_ROUTE, "c.email LIKE ?") && inc(ORDERS_ROUTE, "c.name LIKE ?"));
test("orderNumber filter", () => inc(ORDERS_ROUTE, "o.orderNumber LIKE ?"));
test("minTotal filter", () => inc(ORDERS_ROUTE, "o.totalAmount >= ?"));
test("maxTotal filter", () => inc(ORDERS_ROUTE, "o.totalAmount <= ?"));
test("search filter", () => inc(ORDERS_ROUTE, "search") && inc(ORDERS_ROUTE, "LIKE"));
test("server-side pagination", () => inc(ORDERS_ROUTE, "LIMIT") && inc(ORDERS_ROUTE, "OFFSET"));
test("count query mirrors filter", () => inc(ORDERS_ROUTE, "COUNT(*)"));
test("orders route no console.log", () => exc(ORDERS_ROUTE, "console.log"));
test("orders route uses structured logging", () => inc(ORDERS_ROUTE, "log.error"));

// ──────────────────────────────────────────────
// 4. BULK ACTIONS
// ──────────────────────────────────────────────
console.log("\n4. BULK ACTIONS");
test("bulk route uses requireAdmin", () => inc(BULK_ROUTE, "requireAdmin"));
test("bulk route uses CSRF", () => inc(BULK_ROUTE, "withCsrf"));
test("bulk route uses rate limiting", () => inc(BULK_ROUTE, "rateLimit"));
test("bulk route validates orderIds array", () => inc(BULK_ROUTE, "Array.isArray(orderIds)"));
test("bulk route validates status", () => inc(BULK_ROUTE, "VALID_ORDER_STATUSES"));
test("bulk route blocks PAID", () => inc(BULK_ROUTE, "PAID"));
test("bulk route blocks REFUNDED", () => inc(BULK_ROUTE, "REFUNDED"));
test("bulk route checks transitions", () => inc(BULK_ROUTE, "isValidStatusTransition"));
test("bulk route uses transaction", () => inc(BULK_ROUTE, "db.transaction"));
test("bulk route creates status history", () => inc(BULK_ROUTE, "order_status_history"));
test("bulk route creates activity", () => inc(BULK_ROUTE, "order_activity"));
test("bulk route creates audit entry", () => inc(BULK_ROUTE, "adminAudit"));
test("bulk route returns success/fail counts", () => inc(BULK_ROUTE, "results.success") && inc(BULK_ROUTE, "results.failed"));
test("bulk route handles individual failures", () => inc(BULK_ROUTE, "results.errors"));
test("bulk route no silent skips", () => inc(BULK_ROUTE, "results.failed++"));
test("bulk rate limit config exists", () => inc(RATE_LIMIT, "adminBulkAction"));

// ──────────────────────────────────────────────
// 5. CSV EXPORTS
// ──────────────────────────────────────────────
console.log("\n5. CSV EXPORTS");
test("product-orders export route exists", () => exists("app/api/admin/product-orders/export/route.js"));
test("custom-orders export route exists", () => exists("app/api/admin/custom-orders/export/route.js"));
test("contact export route exists", () => exists("app/api/admin/contact/export/route.js"));
test("trade export route exists", () => exists("app/api/admin/trade/export/route.js"));
test("newsletter export route exists", () => exists("app/api/admin/newsletter/export/route.js"));
test("product-orders export uses requireAdmin", () => inc(PRODUCT_EXPORT, "requireAdmin"));
test("custom-orders export uses requireAdmin", () => inc(CUSTOM_EXPORT, "requireAdmin"));
test("contact export uses requireAdmin", () => inc(CONTACT_EXPORT, "requireAdmin"));
test("trade export uses requireAdmin", () => inc(TRADE_EXPORT, "requireAdmin"));
test("newsletter export uses requireAdmin", () => inc(NEWSLETTER_EXPORT, "requireAdmin"));
test("product-orders export text/csv", () => inc(PRODUCT_EXPORT, "text/csv"));
test("custom-orders export text/csv", () => inc(CUSTOM_EXPORT, "text/csv"));
test("contact export text/csv", () => inc(CONTACT_EXPORT, "text/csv"));
test("trade export text/csv", () => inc(TRADE_EXPORT, "text/csv"));
test("newsletter export text/csv", () => inc(NEWSLETTER_EXPORT, "text/csv"));
test("product-orders export formula injection", () => inc(PRODUCT_EXPORT, "escapeCSV") && inc(PRODUCT_EXPORT, "[=+\\-@]"));
test("custom-orders export formula injection", () => inc(CUSTOM_EXPORT, "escapeCSV") && inc(CUSTOM_EXPORT, "[=+\\-@]"));
test("contact export formula injection", () => inc(CONTACT_EXPORT, "escapeCSV") && inc(CONTACT_EXPORT, "[=+\\-@]"));
test("trade export formula injection", () => inc(TRADE_EXPORT, "escapeCSV") && inc(TRADE_EXPORT, "[=+\\-@]"));
test("newsletter export formula injection", () => inc(NEWSLETTER_EXPORT, "escapeCSV") && inc(NEWSLETTER_EXPORT, "[=+\\-@]"));
test("product-orders export escapes quotes", () => inc(PRODUCT_EXPORT, '""'));
test("product-orders export handles commas", () => inc(PRODUCT_EXPORT, "includes(',')"));
test("product-orders export handles newlines", () => inc(PRODUCT_EXPORT, "includes('\\n')"));
test("product-orders export no secrets", () => { exc(PRODUCT_EXPORT, "passwordHash"); exc(PRODUCT_EXPORT, "SESSION_SECRET"); exc(PRODUCT_EXPORT, "token"); });
test("custom-orders export no secrets", () => { exc(CUSTOM_EXPORT, "passwordHash"); exc(CUSTOM_EXPORT, "token"); });
test("contact export no secrets", () => { exc(CONTACT_EXPORT, "passwordHash"); exc(CONTACT_EXPORT, "token"); });
test("trade export no secrets", () => { exc(TRADE_EXPORT, "passwordHash"); exc(TRADE_EXPORT, "token"); });
test("newsletter export no secrets", () => { exc(NEWSLETTER_EXPORT, "passwordHash"); exc(NEWSLETTER_EXPORT, "token"); });
test("product-orders export server-side data", () => inc(PRODUCT_EXPORT, "db.prepare"));
test("product-orders export has status filter", () => inc(PRODUCT_EXPORT, "o.status = ?"));
test("product-orders export has paymentStatus filter", () => inc(PRODUCT_EXPORT, "o.paymentStatus = ?"));
test("product-orders export has dateFrom filter", () => inc(PRODUCT_EXPORT, "o.createdAt >= ?"));
test("product-orders export has dateTo filter", () => inc(PRODUCT_EXPORT, "o.createdAt <= ?"));
test("product-orders export has search filter", () => inc(PRODUCT_EXPORT, "search") && inc(PRODUCT_EXPORT, "LIKE"));
test("product-orders export has customer filter", () => inc(PRODUCT_EXPORT, "c.email LIKE ?") && inc(PRODUCT_EXPORT, "c.name LIKE ?"));
test("product-orders export has orderNumber filter", () => inc(PRODUCT_EXPORT, "o.orderNumber LIKE ?"));
test("product-orders export has minTotal filter", () => inc(PRODUCT_EXPORT, "o.totalAmount >= ?"));
test("product-orders export has maxTotal filter", () => inc(PRODUCT_EXPORT, "o.totalAmount <= ?"));
test("export rate limit config exists", () => inc(RATE_LIMIT, "adminExport"));

// ──────────────────────────────────────────────
// 6. DASHBOARD
// ──────────────────────────────────────────────
console.log("\n6. DASHBOARD");
test("dashboard route uses requireAdmin", () => inc(DASHBOARD, "requireAdmin"));
test("dashboard queries customers count", () => inc(DASHBOARD, "customers"));
test("dashboard queries totalCustomOrders", () => inc(DASHBOARD, "totalCustomOrders"));
test("dashboard queries productOrders count", () => inc(DASHBOARD, "productOrders"));
test("dashboard queries pendingProductOrders", () => inc(DASHBOARD, "pendingProductOrders"));
test("dashboard queries confirmedProductOrders", () => inc(DASHBOARD, "confirmedProductOrders"));
test("dashboard queries processingProductOrders", () => inc(DASHBOARD, "processingProductOrders"));
test("dashboard queries completedProductOrders", () => inc(DASHBOARD, "completedProductOrders"));
test("dashboard queries cancelledProductOrders", () => inc(DASHBOARD, "cancelledProductOrders"));
test("dashboard queries unpaidOrders", () => inc(DASHBOARD, "unpaidOrders"));
test("dashboard queries paidOrders", () => inc(DASHBOARD, "paidOrders"));
test("dashboard queries contactSubmissions", () => inc(DASHBOARD, "contactSubmissions"));
test("dashboard queries unreadContacts", () => inc(DASHBOARD, "unreadContacts"));
test("dashboard queries tradeEnquiries", () => inc(DASHBOARD, "tradeEnquiries"));
test("dashboard queries newsletterSubscribers", () => inc(DASHBOARD, "newsletterSubscribers"));
test("dashboard queries totalRevenue", () => inc(DASHBOARD, "totalRevenue"));
test("dashboard queries pendingRevenue", () => inc(DASHBOARD, "pendingRevenue"));
test("dashboard dateFrom filter", () => inc(DASHBOARD, "dateFrom"));
test("dashboard dateTo filter", () => inc(DASHBOARD, "dateTo"));
test("dashboard period counts", () => inc(DASHBOARD, "newCustomOrdersPeriod") && inc(DASHBOARD, "newProductOrdersPeriod") && inc(DASHBOARD, "newCustomersPeriod"));
test("dashboard uses server-side queries", () => inc(DASHBOARD, "db.prepare"));
test("dashboard UI exists", () => exists("app/admin/DashboardOverview.js"));

// ──────────────────────────────────────────────
// 7. SECURITY
// ──────────────────────────────────────────────
console.log("\n7. SECURITY");
test("audit route requireAdmin", () => inc(AUDIT_ROUTE, "requireAdmin"));
test("bulk route requireAdmin", () => inc(BULK_ROUTE, "requireAdmin"));
test("bulk route CSRF", () => inc(BULK_ROUTE, "withCsrf"));
test("notes route CSRF", () => inc(ORDER_NOTES, "withCsrf"));
test("order detail PATCH uses CSRF", () => inc(ORDER_DETAIL, "withCsrf"));
test("rate limit for bulk", () => inc(RATE_LIMIT, "adminBulkAction"));
test("rate limit for exports", () => inc(RATE_LIMIT, "adminExport"));
test("rate limit for audit logs", () => inc(RATE_LIMIT, "adminAuditLogs"));
test("logger redacts sensitive keys", () => inc(LOGGER, "SENSITIVE_KEYS") && inc(LOGGER, "password") && inc(LOGGER, "token"));
test("logger redacts nested objects", () => inc(LOGGER, "sanitize"));
test("logger no passwordHash in logs", () => { exc(LOGGER, "logPassword"); exc(LOGGER, "console.log(password"); });
test("session max age", () => inc(SESSION, "SESSION_MAX_AGE"));
test("session uses HS256", () => inc(SESSION, "HS256"));
test("session httpOnly cookie", () => inc(SESSION, "httpOnly: true"));
test("admin role check", () => inc(AUTH, "role !== 'admin'") && inc(AUTH, "role !== 'superadmin'"));
test("CSRF cookie name", () => inc(CSRF, "teakle_csrf"));
test("CSRF header name", () => inc(CSRF, "x-csrf-token"));
test("CSRF validates header matches cookie", () => inc(CSRF, "headerToken !== cookieToken"));
test("CSRF skips GET/HEAD/OPTIONS", () => inc(CSRF, "GET") && inc(CSRF, "HEAD") && inc(CSRF, "OPTIONS"));
test("no stack traces in production", () => {
  const routes = [AUDIT_ROUTE, BULK_ROUTE, ORDERS_ROUTE, PRODUCT_EXPORT, CUSTOM_EXPORT, CONTACT_EXPORT, TRADE_EXPORT, NEWSLETTER_EXPORT];
  routes.forEach(r => exc(r, "stack"));
});
test("no console.error in admin routes", () => {
  const routes = [AUDIT_ROUTE, BULK_ROUTE, ORDERS_ROUTE, PRODUCT_EXPORT, CUSTOM_EXPORT, CONTACT_EXPORT, TRADE_EXPORT, NEWSLETTER_EXPORT];
  routes.forEach(r => exc(r, "console.error"));
});

// ──────────────────────────────────────────────
// 8. REGRESSION
// ──────────────────────────────────────────────
console.log("\n8. REGRESSION");
test("app/admin/page.js exists", () => exists("app/admin/page.js"));
test("app/admin/AdminDashboard.js exists", () => exists("app/admin/AdminDashboard.js"));
test("app/admin/DashboardOverview.js exists", () => exists("app/admin/DashboardOverview.js"));
test("app/admin/OrdersManager.js exists", () => exists("app/admin/OrdersManager.js"));
test("app/admin/CustomOrdersManager.js exists", () => exists("app/admin/CustomOrdersManager.js"));
test("app/admin/ContactManager.js exists", () => exists("app/admin/ContactManager.js"));
test("app/admin/TradeManager.js exists", () => exists("app/admin/TradeManager.js"));
test("app/admin/NewsletterManager.js exists", () => exists("app/admin/NewsletterManager.js"));
test("app/admin/AuditLogManager.js exists", () => exists("app/admin/AuditLogManager.js"));
test("app/admin/ProductsManager.js exists", () => exists("app/admin/ProductsManager.js"));
test("app/admin/SiteSettingsEditor.js exists", () => exists("app/admin/SiteSettingsEditor.js"));
test("app/admin/PageEditor.js exists", () => exists("app/admin/PageEditor.js"));
test("app/admin/MediaLibrary.js exists", () => exists("app/admin/MediaLibrary.js"));
test("admin sidebar imports AuditLogManager", () => inc(ADMIN_SIDEBAR, "AuditLogManager"));
test("admin sidebar has Audit Log nav", () => inc(ADMIN_SIDEBAR, "audit-log"));
test("admin sidebar renders AuditLogManager", () => inc(ADMIN_SIDEBAR, "AuditLogManager />") || inc(ADMIN_SIDEBAR, "<AuditLogManager"));
test("lib/db.js exists", () => exists("lib/db.js"));
test("lib/auth.js exists", () => exists("lib/auth.js"));
test("lib/csrf.js exists", () => exists("lib/csrf.js"));
test("lib/rateLimit.js exists", () => exists("lib/rateLimit.js"));
test("lib/logger.js exists", () => exists("lib/logger.js"));
test("lib/session.js exists", () => exists("lib/session.js"));
test("lib/payment.js exists", () => exists("lib/payment.js"));
test("OrdersManager has activity tab", () => inc(ORDERS_UI, "detailTab") && inc(ORDERS_UI, "activity"));
test("OrdersManager has bulk action", () => inc(ORDERS_UI, "handleBulkAction") && inc(ORDERS_UI, "selectedOrderIds"));
test("OrdersManager has minTotal filter", () => inc(ORDERS_UI, "minTotal"));
test("OrdersManager has maxTotal filter", () => inc(ORDERS_UI, "maxTotal"));
test("OrdersManager has customer filter", () => inc(ORDERS_UI, "customerFilter"));
test("OrdersManager has orderNumber filter", () => inc(ORDERS_UI, "orderNumberFilter"));
test("OrdersManager has date range filter", () => inc(ORDERS_UI, "dateFrom") && inc(ORDERS_UI, "dateTo"));
test("OrdersManager has CSV export", () => inc(ORDERS_UI, "exportCSV"));
test("OrdersManager detail has back button", () => inc(ORDERS_UI, "Back to orders"));
test("OrdersManager has exactly one fetchOrderDetail", () => {
  const matches = ORDERS_UI.match(/function fetchOrderDetail/g);
  if (!matches || matches.length !== 1) throw new Error("expected 1 fetchOrderDetail, found " + (matches ? matches.length : 0));
});
test("OrdersManager fetchOrderDetail sets detailTab", () => inc(ORDERS_UI, "setDetailTab('details')"));

// ──────────────────────────────────────────────
// RESULTS
// ──────────────────────────────────────────────
console.log("\n" + "=".repeat(60));
console.log(`\x1b[1mSprint #20 Tests: ${passed}/${total} passed, ${failed} failed\x1b[0m`);
if (failed > 0) process.exit(1);

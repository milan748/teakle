# TEAKLE Production Readiness Audit Report

**Date:** 2026-09-14
**Branch:** sprint-5-product-experience
**Baseline:** 599/599 tests pass, clean build, 129 pages

---

## Executive Verdict: NOT READY

The application is architecturally complete and security-hardened, but has **3 critical deployment blockers** that make production launch impossible in its current form. The core issue is a fundamental mismatch between the storage architecture (SQLite + filesystem) and the assumed deployment target (serverless/Vercel). Additionally, 1 medium security issue and 1 CSP misconfiguration require resolution before launch.

On a **persistent-server deployment** (VPS, Railway, Fly.io), the application would be functional with the security fixes applied. On **Vercel or any serverless platform**, it would lose all data on every cold start.

---

## Critical Blockers (P0)

### B1. SQLite database is ephemeral on serverless — data loss on cold start

- **File:** `lib/db.js:5` — `DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'teakle.db')`
- **Impact:** All customer accounts, orders, payment records, media metadata, CMS content, admin sessions, and audit logs are lost on every Vercel cold start
- **Severity:** CRITICAL — total data loss
- **Fix:** Migrate to hosted database (Turso, Neon, Supabase) or deploy on persistent-volume platform (Railway, VPS)

### B2. Media uploads are ephemeral — all uploaded images lost on cold start

- **File:** `lib/storage.js:5` — `UPLOAD_DIR = process.env.MEDIA_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads', 'media')`
- **Impact:** DB records reference files that no longer exist → broken images site-wide
- **Severity:** CRITICAL — complete media loss
- **Fix:** Migrate to external object storage (S3, Cloudflare R2, Vercel Blob)

### B3. Session cookies missing `secure` flag in production

- **File:** `lib/session.js:35-41` — `secure` is conditional on `isSecureConnection()`
- **Observed:** Browser E2E shows `secure=False` for `teakle_admin_session`
- **Impact:** Session cookie transmittable over HTTP, enabling session hijacking via network sniffing
- **Severity:** CRITICAL if deployed without HTTPS termination
- **Fix:** Verify `x-forwarded-proto: https` is set by reverse proxy, or force `secure: true` in production

---

## Security Findings

### High

#### S1. CSP blocks Google Fonts — entire site missing brand typeface

- **File:** `next.config.mjs:29` — `style-src 'self' 'unsafe-inline'` missing `fonts.googleapis.com`
- **File:** `next.config.mjs:29` — `font-src 'self'` missing `fonts.gstatic.com`
- **Impact:** Montserrat font blocked; all pages render in fallback system font. 14 CSP violations per page load.
- **Fix:** Add `https://fonts.googleapis.com` to `style-src`, `https://fonts.gstatic.com` to `font-src`

#### S2. CSRF token comparison is not timing-safe

- **File:** `lib/csrf.js:67` — `headerToken !== cookieToken`
- **Impact:** Theoretical timing side-channel (requires XSS to exploit)
- **Fix:** Replace with `crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken))`

### Medium

#### S3. Contact/newsletter rate limiters share global bucket — DoS vector

- **File:** `app/api/contact/rateLimit('form:contact', ...)` — global key, not per-IP
- **File:** `app/api/newsletter/rateLimit('form:newsletter', ...)` — same pattern
- **Impact:** Single visitor can block all visitors from submitting forms for 60 seconds
- **Fix:** Change to `rateLimitIp()` with IP-based keys

#### S4. Health endpoint exposes system info to unauthenticated callers

- **File:** `app/api/health/route.js` — returns Node.js version, platform, architecture, memory, DB status, payment/email provider config
- **Impact:** Reconnaissance information for attackers
- **Fix:** Return only `{ status: "ok" }` for unauthenticated requests; gate details behind admin auth

#### S5. Registration leaks customer database IDs

- **File:** `app/api/auth/register/route.js:55-56` — returns `{ ok: true, customer: { id: existing.id, email } }` on duplicate email
- **Impact:** Account enumeration — attacker learns whether email is registered and its primary key
- **Fix:** Return generic `{ ok: true }` without customer ID

#### S6. Admin and customer share same CSRF cookie name

- **File:** `lib/session.js:9` and `lib/customerSession.js:9` — both define `CSRF_COOKIE = 'teakle_csrf'`
- **Impact:** CSRF token from customer session could theoretically be reused for admin requests
- **Fix:** Use distinct names: `teakle_admin_csrf` and `teakle_customer_csrf`

### Low

#### S7. error.message leaked in 10 admin template API routes

- **Files:** `app/api/admin/templates/sections/route.js` (lines 16, 54, 94, 124), `app/api/admin/templates/pages/route.js` (lines 16, 47, 87, 117), `app/api/admin/templates/sections/[id]/route.js:43`, `app/api/admin/templates/pages/[id]/route.js:39`
- **Impact:** Internal error details exposed to authenticated admins only
- **Fix:** Replace with generic "Internal server error"

#### S8. CSP allows `unsafe-inline` and `unsafe-eval` for scripts

- **File:** `next.config.mjs:29`
- **Impact:** Weakened XSS protection (known Next.js limitation)
- **Fix:** Future — nonce-based CSP

---

## Deployment Findings

### D1. No deployment configuration

- No `Dockerfile`, `vercel.json`, `Procfile`, or `fly.toml`
- Application relies entirely on auto-detection
- **Impact:** Deployment requires manual configuration from scratch

### D2. No graceful shutdown handling

- **File:** `package.json:8` — `"start": "next start"`
- **Impact:** In-flight requests may be dropped on SIGTERM (low risk due to SQLite ACID)
- **Fix:** Add custom server with graceful shutdown for self-hosted deployment

### D3. better-sqlite3 blocks event loop under concurrent load

- **File:** `lib/db.js:17` — synchronous database operations
- **Impact:** Response times degrade non-linearly with 20+ concurrent requests
- **Acceptable for:** Low-to-medium traffic sites

### D4. Migrations have no version tracking

- **File:** `lib/db.js:336-729` — uses column-existence checks, no migration version table
- **Impact:** No rollback capability, no way to know which migrations have run
- **Acceptable for:** Current scale

---

## Database/Persistence Findings

### DB1. SQLite configuration is correct

- WAL mode enabled (`lib/db.js:18`)
- Foreign keys enabled (`lib/db.js:19`)
- Busy timeout 5 seconds (`lib/db.js:20`)
- All migrations idempotent (IF NOT EXISTS / column checks)

### DB2. Draft/publish separation works correctly

- Draft columns (`draft*`) saved separately from published
- `publishSection()` copies draft → published via COALESCE
- `discardDraft()` NULLs out draft columns
- All structural changes wrapped in transactions

### DB3. No orphan cleanup on page deletion

- **File:** `lib/cms.js:348` — `deletePage()` cleans up sections AND page row
- **Status:** SAFE — orphan cleanup is implemented

---

## Authentication Findings

### A1. Authentication architecture is solid

- Two-layer verification: middleware JWT check + `requireAdmin()` DB query
- Session version-based revocation (password change invalidates all sessions)
- Bcrypt cost factor 12
- Rate limiting: admin login 5/15min, customer login 10/15min
- Generic error messages (no account enumeration via error text)
- Session key derivation: `teakle-admin:${secret}` / `teakle-customer:${secret}`

### A2. Admin login works correctly

- **Browser E2E verified:** Login form → POST → redirect to `/admin` → session cookie set
- `teakle_admin_session`: httpOnly=True, sameSite=Lax
- `teakle_csrf`: httpOnly=False (intentional for double-submit pattern)

---

## CMS Findings

### CMS1. CMS layer is complete

- `lib/cms.js`: addSection, deleteSection, duplicateSection, reorderSections
- Draft save/publish/discard flows work
- Templates (section + page) with instantiation
- Design settings with validation
- InstanceId-based section identification

### CMS2. Editor is functional

- **Browser E2E verified:** Sidebar, canvas, inspector, viewport toggles, section list (27 items), undo/redo buttons
- Drag-and-drop reordering works
- Element hierarchy with expand/collapse

---

## Commerce Findings

### C1. Server-side pricing is enforced

- `lib/orderPricing.js:23` — `calculateOrderTotal()` looks up product prices from DB
- Client never submits pricing
- Hero products capped at quantity 1

### C2. Order creation is transactional

- Cart + order + order items created in single transaction
- Idempotency key on payments table
- Rate limit: 3 orders per 5 minutes

### C3. No payment provider configured

- `PAYMENT_PROVIDER=none` — returns controlled "not configured" response
- This is expected for development; must be configured before launch

---

## Media Findings

### M1. Upload validation is thorough

- MIME type allowlist (JPEG, PNG, WebP, AVIF, GIF)
- Magic byte verification
- 10MB file size limit
- UUID filenames with server-authoritative extensions
- Reference checks before deletion (prevents broken images)

### M2. Uploads stored in public directory

- **File:** `lib/storage.js:5` — `public/uploads/media/`
- No access control on reads (intentional — media is public)
- Ephemeral on serverless (see B2)

---

## Browser E2E Findings

### BE1. Public site works

| Page | Status | Notes |
|------|--------|-------|
| Homepage | PASS | 9 sections, 16 nav links |
| Gallery | PASS | Product listing |
| Product detail | PASS | Prices shown, hydration mismatch warning |
| Cart | PASS | |
| Checkout | PASS | |
| Studio | PASS | |
| Contact | PASS | |

### BE2. Admin login works

| Step | Status | Notes |
|------|--------|-------|
| Login page loads | PASS | Form with email + password |
| Login submission | PASS | Redirects to /admin |
| Session cookie set | PASS | teakle_admin_session (httpOnly=True) |
| CSRF cookie set | PASS | teakle_csrf |

### BE3. Admin editor works

| Component | Status | Notes |
|-----------|--------|-------|
| Editor accessible | PASS | /admin/editor/home loads |
| Sidebar | PASS | Section list with 27 items |
| Canvas | PASS | |
| Inspector | PASS | |
| Viewport toggles | PASS | 4 buttons (Desktop/Tablet/Mobile + aria-pressed) |
| Section items | PASS | 27 draggable items |

### BE4. Responsive — mobile has horizontal overflow

- **Issue:** 3 elements overflow viewport at 390px: `IMG.v2-hero-img`, `A.v2-citem`, `DIV.v2-cimage`
- **Severity:** Medium — affects mobile UX

### BE5. Hydration mismatch on product detail

- **Issue:** Server/client HTML mismatch on `/shop/anchor-table`
- **Cause:** Likely `Math.random()` or `Date.now()` in client component
- **Severity:** Low — functional but causes React tree regeneration

### BE6. CSP blocks Google Fonts (14 violations per page)

- **Issue:** `style-src` missing `fonts.googleapis.com`
- **Severity:** High — brand typeface not loading

---

## Performance Findings

### P1. No critical performance issues

- React.memo on all 13 section components
- Coalesced undo/redo history (500ms window, 50-entry cap)
- Debounced page design saves (500ms)
- Lazy image loading in MediaLibrary
- `prefers-reduced-motion` respected

### P2. Bundle size concerns

- No code splitting beyond Next.js defaults
- No virtualized lists
- Full `products.js` included in client bundle (noted in Sprint 11 audit)

---

## Test-Confidence Assessment

### Test Inventory

| Category | Count | % |
|----------|-------|---|
| Static/source assertions | 32 | 80% |
| Unit (in-memory DB) | 5 | 12.5% |
| Integration (real DB) | 3 | 7.5% |
| Browser/E2E | 0 | 0% |

### Critical Path Coverage

| Path | Coverage | Confidence |
|------|----------|------------|
| Admin login | Static source check | LOW |
| Section CRUD | Static source check | LOW |
| Draft save/publish | Static source check | LOW |
| Cart operations | Integration (DB direct) | MEDIUM |
| Checkout/orders | Integration (DB direct) | MEDIUM |
| Media upload | Auth enforcement only | LOW |
| Template save/load | Static source check | LOW |
| Undo/redo | None | NONE |
| Browser rendering | None (until today) | LOW |

### Overall Confidence: **LOW (~15-20%)**

The 599/599 test count is misleading. ~80% of tests are source-string assertions that verify code *mentions* a concept, not that it *implements* it correctly. No tests exercise API routes through HTTP, no tests verify browser rendering, no tests exercise the actual login flow.

---

## Required Fixes (P0 — before any deployment)

| # | Finding | Fix | Effort |
|---|---------|-----|--------|
| B1 | SQLite ephemeral on serverless | Migrate to hosted DB or persistent server | High |
| B2 | Media uploads ephemeral | Migrate to S3/R2/Blob storage | High |
| B3 | Session cookie missing secure flag | Verify HTTPS termination or force secure | Low |
| S1 | CSP blocks Google Fonts | Add fonts.googleapis.com to style-src | Low |
| S2 | CSRF non-constant-time comparison | Use crypto.timingSafeEqual | Low |
| S3 | Rate limiter shared bucket | Switch to rateLimitIp() | Low |
| S4 | Health endpoint info leak | Restrict to status-only response | Low |
| S5 | Registration ID leak | Return generic response | Low |

## Recommended Improvements (P1 — before public launch)

| # | Finding | Fix | Effort |
|---|---------|-----|--------|
| S6 | Shared CSRF cookie name | Separate admin/customer cookies | Low |
| S7 | Error messages in admin routes | Replace with generic strings | Low |
| BE4 | Mobile horizontal overflow | Fix CSS on hero/gallery sections | Medium |
| BE5 | Hydration mismatch | Fix SSR/client inconsistency | Medium |
| Test gap | No integration tests through API | Add route handler tests | High |
| Test gap | No browser E2E tests | Add Playwright test suite | High |

## Optional Improvements (P2)

| # | Finding | Fix | Effort |
|---|---------|-----|--------|
| D4 | No migration version tracking | Add schema_version table | Low |
| S8 | CSP unsafe-inline/unsafe-eval | Nonce-based CSP | High |
| P2 | Bundle size | Code splitting, lazy loading | Medium |

---

## Evidence Summary

| Finding | Source | Reproduction |
|---------|--------|-------------|
| SQLite ephemeral | `lib/db.js:5` — DB_PATH in cwd | Deploy to Vercel, cold start loses data |
| Media ephemeral | `lib/storage.js:5` — UPLOAD_DIR in public/ | Same as above |
| Session secure=False | Browser E2E: `secure=False` in cookie | `http://localhost:3099/admin/login` → login → inspect cookies |
| CSP blocks fonts | Browser console: 14 violations | Load any page, check console |
| CSRF timing | `lib/csrf.js:67` — `!==` operator | Code review |
| Rate limit DoS | `app/api/contact/route.js:10` — global key | `for i in 1..11; do curl -X POST /api/contact; done` |
| Health info leak | `GET /api/health` — unauthenticated | `curl http://localhost:3099/api/health` |
| Registration ID | `app/api/auth/register/route.js:55` | POST /api/auth/register with existing email |
| Mobile overflow | Browser E2E at 390px | Screenshot shows 3 overflowing elements |
| Hydration mismatch | Browser console on /shop/anchor-table | Navigate to product detail page |

---

## Login Redirect Loop — Root Cause Analysis

The persistent admin login redirect loop observed in previous sessions was investigated:

**Finding:** Login DOES work. The redirect loop was a **test timing issue**, not an application bug.

**Evidence:**
- Browser E2E with 3s wait: Shows redirect to `/admin/login` (incomplete)
- Browser E2E with 5s wait: Shows redirect to `/admin` (complete)
- Network trace: POST `/api/admin/login` → 200 → GET `/admin` → 200
- Cookie set correctly: `teakle_admin_session` (httpOnly=True)
- Editor accessible after login with 5s+ wait

**Root cause:** The login POST returns 200 with a client-side redirect. The redirect takes 2-4 seconds to complete (involves setting cookie + client-side navigation + page load). Previous tests used 2-3s timeouts which were insufficient. With 5s+ wait, login consistently succeeds.

**Conclusion:** No application code fix needed. The login flow is functional.

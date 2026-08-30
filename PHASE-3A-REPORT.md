# TEAKLE — PHASE 3A REPORT — Global UX Logic + Information Architecture Cleanup

**Date:** 2026-08-28
**Baseline:** b0ede72 — Complete Phase 2 UI, accessibility, performance and responsive polish
**Scope:** Global UX logic audit (not visual redesign) — header/account/cart duplication, auth contextual focus, footer appropriateness, navigation, search, product/cart/wishlist, CTA, mobile/desktop logic, accessibility
**Method:** Codebase inspection + Playwright rendering at 1440px, 1280px, 375px, 390px, 430px + flow walk

---

## 1. Audit Findings

Full matrix in `PHASE-3A-UX-AUDIT.md`. Summary:

| # | Issue | Severity | Page |
|---|-------|----------|------|
| A1 | Account & Cart duplicated as text links in drawer while already present as header icons (`header-mobile-actions:276-279` + `nav-links:355-356`) | P2 | Header / Mobile drawer |
| A2 | Full marketing header shown on focused auth page (`/login` inherits all nav + icons) | P1 | /login |
| A3 | Full marketing footer shown on focused auth page (4-column + newsletter + 13 links) | P1 | /login |
| A4 | “Forgot password?” is a dead link (`href="#"` + `preventDefault`, title Shopify) | P0 | /login:898 |
| A5 | “Remember me” checkbox is disabled but rendered as interactive | P2 | /login:888 |
| A6 | Wishlist not reachable from mobile header (desktop has icon, mobile only Account+Cart) | P2 | Header mobile |
| A7 | Admin login inherits full site header/footer | P2 | /admin/login |
| A8 | Search has two surfaces (desktop overlay 8 results vs mobile drawer 5) | P3 | Search — intentional |
| A9 | Product card wishlist hover-revealed on desktop | P3 | ProductCard — intentional |
| A10 | Marketing footer on cart/checkout transactional pages | P2 | /cart |
| A11 | Gallery “Show all products” + active tag both clear filter | P3 | Gallery — complementary |
| A12 | Login card has no marketing CTAs inside (correct) | — | /login — good |

Pages classified: **A.Marketing/Discovery** (`/`, `/gallery`, `/archive`, `/studio`, `/journal` etc) → rich chrome appropriate. **B.Product/Commerce** (`/shop/[id]`, `/cart`) → rich header appropriate, footer can stay. **C.Account** (`/login` auth → minimal; `/account` dashboard → rich appropriate). **D.Utility** (search, empty states → contextual).

Only `/login` clearly needed simplified treatment.

---

## 2. Issues Fixed

### FIX-1 — Remove duplicate Account/Cart text links from navigation drawer (A1)
**File:** `app/components/Header.js:351-356`
- Removed `<li><Link href="/login" onClick={closeDrawer}>Account</Link></li>` and `<li><Link href="/cart" onClick={closeDrawer}>Cart</Link></li>` from `nav-links`.
- Rationale: Icons already communicate function via `aria-label="Account"`/`"Cart"` + badges in `header-actions` (desktop) and `header-mobile-actions` (mobile). Text duplicates added 2 extra items to every drawer, increased noise, violated spec `HEADER: [Menu][Logo][Search][Account icon][Cart icon]`.
- Preserved: Icon access everywhere (desktop 4 icons, mobile 2 icons, all ≥44px, keyboard focusable, badge support). No new routes.

### FIX-2 — Auth page header becomes minimal (A2)
**Files:** `app/components/Header.js:48-53`, `app/components/Header.js:267-268`, `styles.css:375-389`
- Added `const isAuthPage = pathname === '/login'` + body attribute `data-auth-page`.
- Header now renders `class="site-header ... is-auth"` on `/login`.
- CSS: `.site-header.is-auth .nav-toggle, .header-mobile-actions, nav[aria-label], .header-actions {display:none}` + `.header-inner{justify-content:center}` + `.logo{margin:0 auto}`.
- Result: On `/login`, only Teakle logo (→ `/`) remains, centered, fixed solid background. No hamburger, no mobile icons, no nav, no search/wishlist/cart/account. Escape/focus logic unaffected (drawer not rendered). Skip link still present.

### FIX-3 — Auth page footer hidden for focused task (A3)
**Files:** `app/components/Header.js:51-53` (body attribute), `styles.css:1025-1026`
- Added CSS `body[data-auth-page] .site-footer{display:none}`.
- Result: On `/login`, marketing footer (4 columns, newsletter form, legal bar) is not rendered. Login card already contains `Back to home` → `/` and tab switching; no legal loss for auth. Other pages unaffected (attribute only set on `/login`).

### FIX-4 — Remove dead “Forgot password?” link (A4)
**File:** `app/login/page.js:887-901`
- Removed `<a href="#" onClick={preventDefault} title="Requires Shopify...">Forgot password?</a>` and its containing `auth-options` structure which appeared clickable but did nothing (P0 broken recovery flow). Replaced with comment `intentionally omitted`.
- API routes exist (`/api/auth/forgot-password`) but no UI page; keeping dead control is worse than omitting. User can still reach support via footer/legal on other pages or `Back to home` → `/contact`.

### FIX-5 — Remove disabled “Remember me” control (A5)
**File:** `app/login/page.js:887-901` (same block)
- Removed disabled checkbox `<input disabled title="Requires Shopify...">` + label `Remember me`. Control looked interactive but could not be used, confusing and wastes space. Removed alongside A4 as part of same `auth-options` block.

### FIX-6 — Update regression test to reflect intentional IA change
**File:** `scripts/test-sprint34g.js:361-367`
- Changed two Sprint 34G assertions from `assertIncludes('Sidebar still has Account/Cart link')` to `assertNotIncludes('Sidebar no longer has duplicate Account/Cart text link (now via header icon)')`.
- Reason: Test was asserting legacy duplication that Phase 3A intentionally removed per spec. Updated to assert new correct state; test now passes 51/51.

---

## 3. Issues Intentionally Left Unchanged

| # | Reason |
|---|--------|
| **A6 — Wishlist mobile header** | Adding wishlist icon to mobile would bloat minimal header that we just simplified (A1). Mobile users can still wishlist via product card heart (which is visible on mobile) and via `/wishlist` once logged in. Deferred to keep header minimal; not a duplication issue. |
| **A7 — Admin login chrome** | `/admin/login` is not customer-facing; fixing would require route-group layout. Low impact, deferred. |
| **A8 — Search two surfaces** | Intentional contextual adaptation: desktop overlay (8 results, popular pills, keyboard nav) vs mobile drawer inline (5 results, sticky). Both navigate to same `/gallery?search=`; coherent flow. No change. |
| **A9 — Product card wishlist hover** | Hover reveal is premium direction; mobile already forces visible (`@media 560px` always visible), keyboard `:focus-visible` also shows. Not a logic error. |
| **A10 — Footer on /cart** | Marketing footer on cart is conventional; cart already has clear empty state + `Continue Shopping` + `Proceed to Checkout`. Simplifying checkout footer can be done with checkout work, not now. |
| **A11 — Gallery double clear affordance** | Tag `Limited Edition ×` + `Show all products` button are complementary (one shows *what* is filtered, one shows *how* to clear). Not duplicate. |
| **A12 — No marketing CTAs on login card** | Verified correct: card contains only tabs + inputs + `Back to home`. No change needed. |

No header rewritten from scratch, no styling system replaced, no dependencies added, no homepage redesigned, no product data/copy/photography changed.

---

## 4. Files Modified

| File | Change |
|------|--------|
| `app/components/Header.js` | Added `isAuthPage` flag, `data-auth-page` body attribute, `is-auth` header class; removed Account/Cart text `<li>` from `nav-links` (lines 355-356) |
| `styles.css` | Added `.site-header.is-auth` rules (hide nav-toggle, header-mobile-actions, nav, header-actions; center logo); added `body[data-auth-page] .site-footer{display:none}` |
| `app/login/page.js` | Removed `auth-options` block containing disabled Remember me + dead Forgot password link (lines 887-901) |
| `scripts/test-sprint34g.js` | Updated 2 assertions to expect removal of drawer Account/Cart duplicates (now `assertNotIncludes`) |
| `PHASE-3A-UX-AUDIT.md` | Created (new) |
| `PHASE-3A-REPORT.md` | Created (this file) |

**Not modified:** `app/components/Footer.js`, `app/layout.js` (no structural change), `app/gallery/GalleryClient.js`, `app/shop/[id]/ShopDetailClient.js`, `app/cart/page.js`, `app/wishlist/page.js`, `products-browser.js`, product data, copy.

---

## 5. Desktop Verification

**Viewports:** 1440px, 1280px — Playwright `domcontentloaded` + visual check

- **1440px homepage:** Header shows logo left, nav (Gallery + Hero Edition/Limited Edition dropdown, Archive, Studio, Journal, Customize) centered, actions (Search, Wishlist, Cart, Account) right. No Account/Cart text in nav (verified `nav` length 6 incl. search bar vs previous 8). Logo switches white→black on scroll (hero). No overflow, no layout shift.
- **1440px /login:** Header has `is-auth`, only logo centered, no nav, no icons, no hamburger. Body has `data-auth-page`, footer `display:none` (verified `getComputedStyle .site-footer === none`). Card shows logo, heading, tabs, inputs, submit, Back to home. No Forgot/Remember controls. No marketing chrome.
- **Gallery:** 4-col grid, cat pills, toolbar, Limited Edition filter still works, `Show all products` clears to `/gallery`. Hero Edition still links to `/shop/anchor-table`.
- **Product detail:** Add to Cart, Wishlist, Share, quantity, mobile sticky CTA unaffected.

---

## 6. Mobile Verification

**Viewports:** 375px, 390px, 430px — Playwright + drawer interaction

- **375px drawer:** Hamburger opens drawer, `body.nav-drawer-open`, backdrop visible. Drawer items: search bar, Gallery (with chevron), Archive, Studio, Journal, Customize — **no Account, no Cart** (verified `hasAccount:false hasCart:false`). Header-mobile-actions still shows Account + Cart icons (2) in top bar — access preserved. No horizontal overflow.
- **Close button:** `.nav-mobile-close-btn` clickable (fixed in 2H, still works), closes drawer, focus returns to hamburger.
- **Escape:** `Escape` key closes drawer.
- **Gallery dropdown:** Chevron toggles `is-open`, contains ONLY Hero Edition + Limited Edition, no descriptive text (verified `items: ["Hero Edition","Limited Edition"]`).
- **375px /login:** Same minimal header (logo only, centered, no hamburger, no icons). No footer. No Forgot/Remember. Tab switching works, inputs have correct `type`/`autocomplete`, submit loading spinner works. No overflow.
- **390px / 430px:** Same as 375px — drawer scrolls if needed, pills scroll horizontally with `flex-shrink:0`, no overlap.

---

## 7. Accessibility Verification

- **Landmarks preserved:** `<header>`, `<nav aria-label="Main navigation">` (hidden on auth via CSS `display:none` — correctly removed from a11y tree when not needed), `<main id="main-content">`, `<footer>` (hidden on auth via `display:none` — correctly removed), skip link.
- **Accessible names:** Header icons retain `aria-label="Search|Wishlist|Cart|Account"`, logo `aria-label="Teakle Home"`, hamburger `aria-expanded` + `aria-controls`, close button `aria-label="Close menu"`. Gallery chevron `aria-expanded` + `aria-controls="gallery-dropdown-menu"`.
- **Keyboard:** Tab order on homepage includes logo → nav links → icons → content; on `/login` tab order is logo → tabs → inputs → submit → Back to home (no trap). Focus-visible retains bronze outline. Drawer focus return works (close → hamburger). Escape closes drawer (verified). Search overlay Escape + backdrop click still work.
- **ARIA:** `aria-expanded` toggles for hamburger, gallery, account dropdown. `aria-current` not needed (nav links not current marking, but active styling via `is-scrolled`).
- **Touch targets:** All remaining icons ≥44px (nav-toggle 44×44, header-mobile-actions icons 44×44, header-actions icons 44×44, close button 48×48). Drawer Account/Cart removal does not reduce targets — icons remain.
- **No incorrect hiding:** Duplicate Account/Cart removed from DOM (not `aria-hidden`), so not announced. Auth header/footer hidden via `display:none` when not relevant — correctly hidden from AT.
- **Form:** Login inputs have `<label for>` + `type="email|password"` + `required`, no `autocomplete` regression. Removed disabled control improves clarity.

---

## 8. Build Result

```
Generating static pages (126/126) ✓
First Load JS shared by all 103 kB
No errors, no warnings
```

Run: `npm run build` — 126 pages (was 125/126 variance due to route params), 0 errors, 0 warnings.

---

## 9. Test Results

| Suite | Result | Note |
|-------|--------|------|
| **Sprint 34G** | **51/51 PASS, 0 FAIL** | After updating 2 assertions to reflect intentional removal of drawer Account/Cart duplicates (see FIX-6) |
| Other suites | Not run (no other existing tests cover changed auth/header logic) | No new tests added per spec |

Previous run before test update: 49/51 (2 expected failures for removed drawer links) — fixed by updating test expectations to new IA.

---

## 10. Remaining Recommendations

1. **Password recovery UI:** API routes exist but no `/forgot-password` + `/reset-password` pages. If recovery is needed, build minimal focused pages matching login aesthetic (logo + email input + submit + Back to Sign In) and add `is-auth` treatment similarly. Do not reintroduce dead link.
2. **Remember me:** Implement real persistence (e.g., longer JWT or localStorage) before re-adding checkbox; keep hidden until then.
3. **Admin layout:** If admin work continues, add `app/(admin)/layout.js` route group with no marketing footer/header.
4. **Wishlist mobile discoverability:** If analytics show wishlist use on mobile is low, consider adding wishlist icon to `header-mobile-actions` (would become 3 icons) or drawer entry — but weigh against header minimalism.
5. **Checkout footer:** When checkout is built, apply same `data-auth-page` or `data-checkout` hidden footer pattern for focused flow.
6. **No further header rewrite** needed; current minimal auth treatment is sufficient.

---

## Push / Commit

**NOT COMMITTED. NOT PUSHED.** Per phase instructions, changes remain in working tree for review.

**Working tree after phase:**
- Modified: `app/components/Header.js`, `styles.css`, `app/login/page.js`, `scripts/test-sprint34g.js`
- Untracked: `PHASE-3A-UX-AUDIT.md`, `PHASE-3A-REPORT.md`
- Unstaged (pre-existing, not part of phase): `app/sitemap.js`, `scripts/seed-cms.js`, `app/process/*`, screenshots, `__tests__/`, `.opencode/` etc — not included

Next phase should not start automatically. Phase 3A is checkpointed in working tree and ready for review/commit.

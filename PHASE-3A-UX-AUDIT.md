# TEAKLE — PHASE 3A UX LOGIC AUDIT

**Date:** 2026-08-28
**Baseline:** b0ede72 — Complete Phase 2 UI, accessibility, performance and responsive polish
**Method:** Codebase inspection + Playwright rendering at 1440px, 1280px, 390px, 375px, 430px + manual flow walk
**Scope:** Global UX logic, information architecture, contextual appropriateness — not visual redesign

---

## 1. Evidence Summary

- **Header:** Single `Header.js` client component (568 lines) renders one shared `<nav><ul.nav-links>` for both desktop and mobile, plus `.header-actions` (desktop icons) and `.header-mobile-actions` (mobile icons). `Playwright 1440px`: `header-actions` aria-labels = Search, Wishlist, Cart, Account; `header-mobile-actions` = Account, Cart. `nav-links` items = Gallery (with Hero Edition + Limited Edition), Archive, Studio, Journal, Customize, Account, Cart.
- **Auth:** `app/login/page.js` (1017 lines) is combined login+register tabbed card; no separate `/signup` or `/forgot-password` UI. `app/layout.js` has single root layout rendering `<Header/><main>{children}</main><Footer/>` on every route — no route-group layout. Playwright confirms `footer.site-footer` visible on `/login`.
- **Footer:** `app/components/Footer.js` (86 lines) server component with 4 columns (brand, Explore, Services, Newsletter) + legal bar; no page awareness.
- **Gallery:** `GalleryClient.js` correctly implements Hero Edition → `/shop/anchor-table`, Limited Edition → `?availability=Limited+Edition`, with both active tag and “Show all products” clear.
- **Product detail:** Confirmed ADD TO CART (primary), WISHLIST + SHARE secondary, quantity controls, mobile sticky CTA — no duplicate.
- **Build:** 125 pages, 0 errors at baseline.

---

## 2. Issue Matrix

| # | Issue | Page / Component | Severity | Why it is logically wrong | Recommended fix |
|---|-------|------------------|----------|---------------------------|-----------------|
| **A1** | **Account & Cart duplicated as text links in drawer while already present as header icons** | Header / Mobile drawer (`Header.js:355-356`) | **P2** | On mobile, user sees Account (icon in `header-mobile-actions:276`) + Cart (icon :279) in the top bar *and* again as plain text links at bottom of drawer (`nav-links` items 7-8). On desktop, the same text links appear as nav items alongside Gallery/Archive while icons already exist in `header-actions`. Icons already communicate function via accessible labels and badges; text duplicates increase drawer length, add visual noise, and contradict spec requirement `HEADER: [Menu][Logo][Search][Account icon][Cart icon]` | Remove `<li>Account` and `<li>Cart` from `nav-links` list. Retain icon access only. No new route. |
| **A2** | **Full marketing header shown on focused auth page** | `/login` — `Header.js` + `layout.js` | **P1** | Auth is task-oriented (sign in / create account). Full nav (Gallery/Archive/Studio/Journal/Customize + Search/Wishlist/Cart/Account) competes with task, offers escape routes that dilute focus, violates luxury e-com convention of simplified auth chrome. Verified: header fully visible on `/login` desktop + mobile. | Make `Header.js` page-aware: when `pathname === '/login'` render minimal header (logo → `/` only, no `nav-links`, no `header-actions`, no hamburger). Preserve accessible skip link. Alternative route-group layout also valid but heavier. |
| **A3** | **Full marketing footer shown on focused auth page** | `/login` — `Footer.js` + `layout.js` | **P1** | Same contextual mismatch as A2. Footer contains 4-column marketing (Explore, Services, Newsletter form, social) + 6 legal links — excessive burden on transactional/auth flow, pushes card, invites distraction. Playwright confirms 13 footer links rendered on `/login`. | Make footer contextual: hide marketing footer on `/login` (render `null` or minimal legal line). Requires making `Footer.js` client-aware or wrapping in conditional. |
| **A4** | **“Forgot password?” is a dead link** | `/login` — `LoginPage:898-900` | **P0** | `<a href=\"#\" onClick={preventDefault}>` with `title=\"Requires Shopify…\"` — looks interactive, does nothing, breaks core recovery flow. API routes for `forgot-password`/`reset-password` exist but no UI. User stranded. | Remove dead anchor or replace with inert text “Contact support at hello@teakle.in” / link to `/contact`. Do not keep clickable dead control. |
| **A5** | **“Remember me” checkbox is disabled but rendered as if interactive** | `/login` — `LoginPage:889-896` | **P2** | `disabled` + tooltip “Requires Shopify…” — control appears in form but cannot be used, confuses, wastes space, fails WCAG expectation that disabled controls still convey state. | Hide the `auth-remember` control entirely until feature is real. Keep layout without it. |
| **A6** | **Wishlist not reachable from mobile header** | Header mobile | **P2** | Desktop `header-actions` has Wishlist icon with badge; `header-mobile-actions` has only Account + Cart. Drawer has no Wishlist link. Mobile user has no discoverable wishlist entry point (must guess account dropdown or product card). Inconsistent IA. | Consider adding Wishlist icon to mobile header *or* drawer entry — but spec says mobile should be *simpler*, not fuller. Deferred: note as P2, fix only if A1 removal creates space. Intentionally left for now to keep header minimal. |
| **A7** | **Admin login inherits full site header/footer** | `/admin/login` | **P2** | Admin is separate context; marketing chrome inappropriate. Low traffic, low severity. | Deferred — route is not customer-facing; fix via route group if needed later. |
| **A8** | **Search has two surfaces (desktop overlay + mobile drawer inline) with different caps (8 vs 5 results) and hints** | Search | **P3** | Not logically wrong — contextual adaptation. Desktop overlay shows popular pills + keyboard nav; mobile inline shows 5 results + submit. Behavior is coherent, results navigate to same `/gallery?search=` . No fix needed. | No change — documented as intentional. |
| **A9** | **Product card wishlist button is hover-revealed on desktop** | `ProductCard.js` / `styles.css:pcard-wishlist` | **P3** | Button hidden (`opacity 0`) until hover — inaccessible to keyboard until focused and to touch users on pure hover. However mobile CSS at 560px forces it visible and desktop keyboard focus still triggers. Acceptable compromise; changing would alter premium reveal. | No change — preserve, add explicit `:focus-visible` visibility already exists. |
| **A10** | **Footer shown identically on cart/checkout transactional pages** | `/cart`, `/checkout` | **P2** | Marketing footer on cart is conventional in many shops (retain cross-sell), but premium/luxury often simplifies. Current cart empty state already has “Browse Collection” CTA; footer newsletter competes but not blocking. | Deferred — keep richer footer on cart for now; revisit if checkout conversion work begins. |
| **A11** | **Gallery “Show all products” + active “Limited Edition ×” tag both clear filter (duplicate affordance)** | `GalleryClient.js` | **P3** | Two controls do same job (tag X + banner button). Both are useful: tag shows *what* is filtered, button shows *how* to clear. Not duplication — complementary. | No change. |
| **A12** | **Homepage hero CTA “OUR STUDIO” on auth-like focused flow would be inappropriate — but no instance on `/login`** | `/login` | — | Verified: login card has no marketing CTAs (`Watch It Made` etc) inside — card is self-contained with tabs + inputs + `Back to home`. Good. | No change. |

### Severity key
- **P0** broken/confusing core flow
- **P1** significant UX inconsistency
- **P2** unnecessary/redundant UI
- **P3** minor / intentionally left

---

## 3. Pages Classified

- **A. Marketing/Discovery:** `/`, `/gallery`, `/archive`, `/studio`, `/journal`, `/trade`, `/custom`, `/contact`, `/process/*` — rich header + rich footer appropriate.
- **B. Product/Commerce:** `/shop/[id]`, `/cart` (+ future `/checkout`) — rich header appropriate; footer can stay rich for now.
- **C. Account:** `/login` (auth), `/account`, `/wishlist` (needs auth) — **auth should be minimal**; account/wishlist can retain full chrome (dashboard context).
- **D. Utility:** `/search` (via overlay/drawer + gallery param), error/empty states — already contextual.

**Header treatment decision:** Only `/login` clearly needs simplified header/footer. Other pages keep established treatment.

---

## 4. Audit Conclusion

Implement: **A1, A2, A3, A4, A5** (all clearly supported, minimal, no visual redesign, no copy change beyond removing dead control).

Defer: A6, A7, A10 — note for future but do not change now to avoid over-refactor and header bloat.

No change: A8, A9, A11, A12 — intentional.

Audit does not recommend rewriting header, replacing styling system, or changing product data/copy/photography.

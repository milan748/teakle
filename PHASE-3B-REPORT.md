# TEAKLE — PHASE 3B REPORT
## Information Architecture + Interaction Consistency

**Date:** 2026-08-28
**Baseline:** b0ede72 (Phase 2) + Phase 3A working tree (login minimal, drawer deduped, dead controls removed)
**Scope:** Remaining logical UX/IA — header active state, gallery IA, search, product→cart, product cards, CTA hierarchy, footer — not a redesign
**Method:** Code inspection (Header.js, GalleryClient.js, ProductCard.js, cart, Footer, styles) + Playwright at 1440/1280 + 375/390/430

---

## Audit

### Issues inspected (Phase 3A remaining + Phase 3B deep dive)

| # | Area | Finding | Severity at inspection |
|---|------|---------|------------------------|
| B1 | Header active state | No `is-active`/`aria-current` on nav — CSS `.nav-links a.is-active::after` exists but never applied; Playwright on `/gallery` showed all links `hasActive:false ariaCur:null` | **P1** |
| B2 | Product card wishlist | `pcard-wishlist` is `opacity:0 scale(0.85)` until hover/focus; `@media 560px` only resized, did not force visible — on touch devices wishlist not discoverable without hover | **P2** |
| B3 | Footer heading | `Footer.js` uses `<h3>` (correct) but `styles.css` had orphan `.footer-newsletter h4` rules at 1101 and 1818 — dead code after Phase 2 H3 fix | **P3** (code correctness) |
| B4 | Search push | `Header.js` search `router.push(/gallery?search=)` creates history entry (not replace) — not broken | **P3** intentional |
| B5 | Cart duplicate Checkout | Desktop `.checkout-btn` + mobile `.cart-mobile-cta` both visible at respective breakpoints — intentional thumb-reach, not competing | **P3** intentional |
| B6 | Gallery IA | Gallery → Hero Edition (`/shop/anchor-table`) and Limited Edition (`?availability=Limited+Edition`) preserved correctly; `Show all products` + active tag complementary | — correct |
| B7 | Footer duplication on /cart | Marketing footer on cart — conventional, deferred per 3A A10 | **P2 deferred** |
| B8 | Wishlist mobile header icon | Desktop has Wishlist icon, mobile header has only Account/Cart — but adding would bloat header simplified in 3A | **P2 deferred** |

**Classification:** P0 broken, P1 significant inconsistency, P2 polish, P3 intentional/leave.

### Issues fixed
- **B1, B2, B3** — clearly justified, minimal, no content/product/copy change

### Issues intentionally left unchanged
- B4, B5, B6 — intentional behavior, no change
- B7, B8 — deferred to avoid over-refactor and header bloat (documented in 3A, reaffirmed)

---

## Information Architecture

### Header / Navigation
- **Before:** No current-page indication. User could not tell if on Gallery vs Archive etc.
- **After:** `Header.js` now imports `usePathname` logic with `isActive(href)` (`/gallery` matches `/gallery*`, `/shop/*` exact, others exact) and adds `className="is-active"` + `aria-current="page"` to `Gallery` (desktop link), `Hero Edition` (`/shop/anchor-table`), `Archive`, `Studio`, `Journal`, `Customize`. CSS `.nav-links a.is-active{color:var(--bronze-text)}` + `::after{width:100%}` underline now activates; `.nav-dropdown-featured-link.is-active` colors bronze. Playwright verified: on `/gallery` Gallery is `cur:page active:true`; on `/archive` Archive is `cur:page active:true`; others false. Auth page (`/login`) still minimal (`is-auth` hides nav/actions, logo centered) — not affected.
- **Preserved:** No Account/Cart reintroduced to drawer; `header-actions` (Search/Wishlist/Cart/Account) and `header-mobile-actions` (Account/Cart) remain sole access; hamburger/close/Escape/focus-return unchanged; search overlay still `role=dialog`.

### Gallery
- **Structure preserved:** `Gallery` → `Hero Edition` (`/shop/anchor-table`) + `Limited Edition` (`?availability=Limited+Edition`) — exactly two sub-items, no descriptive text, matches spec. Playwright mobile drawer shows `["Hero Edition","Limited Edition"]` only.
- **Filtered state:** `GalleryClient.js` shows `hasActiveFilters && !searchQuery` banner + `gal-active-tag` for availability; both clear via `clearFilters` → `router.push('/gallery')` (returns to full gallery). Search banner (`Search results for "q" + count + Show all products → /gallery`) also preserved. No second filtering mechanism created.

### Search
- **Desktop overlay:** Debounced 200ms, 8 results, keyboard nav (ArrowUp/Down, Enter), `aria-expanded`/`activedescendant`, ESC/backdrop close, `View all results` → `/gallery?search=`; popular pills (Teak/Table/Bowl/Tray/Planter) when <2 chars.
- **Mobile drawer:** Inline sticky search bar (5 results, 36px thumbs) + submit → same `/gallery?search=`; `View all X results`.
- **Active search state:** Gallery banner shows `Search results for “q” — N pieces — Show all products` with count, title changes to `Search: q — Teakle`; clear via `Show all products` or `Clear search & filters` in empty state. Behavior unchanged, verified not broken.

### Product → Cart
- **Product detail:** Primary `Add to Cart` (walnut, 56px, `Added to Cart` + check for 2s, forest bg), secondary row `Wishlist` (auth-gated, `is-active` bronze) + `Share` (Web Share or clipboard, `Copied!` 2s), quantity 1–10 (hero shows `One of one`), delivery info, accordions, `Complete the Space` related, `Recently Viewed`. Mobile sticky CTA (`price + Add to Cart`) only ≤560px.
- **Cart:** Inherits full header/footer (no new layout); summary shows `Proceed to Checkout` (→ `/checkout`) + `Continue Shopping` (→ `/gallery`); per-item `Save for Later`/`Remove` with `is-removing` slide + disabled states; empty state `Browse the Collection` single CTA. No duplicate primary CTAs competing at same breakpoint (mobile sticky only ≤860px). Loading states preserved.

### Product Cards
- **IA:** Entire `.pcard` is `<Link href=/shop/{id}>` — one obvious primary interaction. Secondary `pcard-wishlist` button inside stops propagation (`preventDefault`+`stopPropagation`) and is auth-gated. Badges (`Limited Edition`) top-left, price/meta below. Hover: card `translateY(-3px)`, image `scale(1.03)`, title bronze, wishlist fades in via `opacity/transform`. No `Add to Cart` on card — correct catalogue vs commerce separation.

### CTA Hierarchy
- **Audit:** Homepage hero (`VIEW THE COLLECTION` primary + `OUR STUDIO` quiet), signature (`View This Piece` + `Watch the Process`), craftsmanship (`link-quiet`), carousel, product grid `Explore the Full Collection` — no two primaries competing equally. Gallery toolbar `Filters` (secondary) vs `Sort` (select) vs pills; cart `Proceed to Checkout` (primary walnut) vs `Continue Shopping` (ghost). No marketing CTA added to `/login` (verified none). No copy rewritten.

### Footer
- **Desktop:** 4 columns (brand + Explore + Services + Newsletter) with `<h3>` headings (`font-size 0.75rem uppercase 0.1em tracking, 1.25rem margin, #2B221B`) vs links (`0.875rem, #4A4038, 44px min-height`), legal bar 6 links. Headings visually distinct (uppercase/tracking/spacing) and semantically `<h3>` in `<nav aria-label>`.
- **Mobile:** Stacked, headings `0.6875rem 0.12em tracking` vs links `0.625rem`, newsletter column full-width.
- **Contextual:** Marketing footer hidden on `/login` via `body[data-auth-page] .site-footer{display:none}` (3A) — verified `foot display:none` on login; shown on all other pages (including gallery/cart). No useful content removed.

---

## Accessibility

- **Keyboard:** Tab order preserved — homepage logo → nav links (now with is-active, still focusable) → actions → content; `/login` tab order logo → tabs → inputs → submit → Back to home (no trap, hamburger hidden not focusable). Drawer: Tab into hamburger → Enter opens → Tab through search input, Gallery chevron, links → Escape closes and returns focus to hamburger (verified). Search overlay: Tab to input → Arrow keys navigate results, Enter selects, Escape closes and returns focus.
- **Focus:** All interactive elements retain `focus-visible` bronze outline (`outline:2px solid var(--bronze) outline-offset:3px` for header, `2px` for wishlist). `outline:none` never used without replacement. `pcard-wishlist` focus-visible forces `opacity:1` (now also always visible on mobile).
- **ARIA:** Nav links now correctly carry `aria-current="page"` when active (verified Gallery/Archive), previously none — improves screen-reader current location. Gallery toggle has `aria-expanded` + `aria-controls="gallery-dropdown-menu"`, hamburger `aria-expanded`/`aria-controls`, account trigger `aria-expanded`, search `aria-expanded`/`haspopup`/`activedescendant` + `role=listbox/option`. Landmarks: `<header>`, `<nav aria-label="Main navigation">`, `<main id="main-content">`, `<footer>` (hidden on auth via `display:none` correctly removed from tree), skip link.
- **Touch targets:** All remaining targets ≥44px (nav-toggle 44×44, header-mobile-actions icons 44×44, header-actions icons 44×44, close 48×48, footer links 44px min-height, gal pills 38px min-height + 0.55em padding). No new targets below threshold.
- **Contrast:** Unchanged from Phase 2 — text-primary 12.5:1, text-secondary ~5:1, bronze-text 4.56:1, bronze-on-dark 5.03:1, footer #4A4038 on #EFE8DC 7.1:1. Active nav `var(--bronze-text) #8B7355` on #F7F4EE 4.56:1 meets AA.

---

## Responsive Verification

Used Playwright `domcontentloaded` + `networkidle` + `waitForTimeout`.

### Desktop 1440
- Homepage: hero full-bleed, nav centered (Gallery active underline when on gallery), actions right, no overflow (0 elements beyond viewport), no duplication.
- Gallery: 4-col grid, cat pills wrap, toolbar `Filters` + `Sort`, `Show all products` banner when Limited Edition filtered, grid gap `var(--space-lg)`.
- Product detail `/shop/anchor-table`: hero type A (image + gallery thumbs), `Add to Cart` primary, no duplication.
- Login: header `is-auth` only logo centered, no nav, footer `display:none`, card centered.

### Desktop 1280
Same as 1440 — nav still single row, no wrapping, no overflow, active state still visible.

### Mobile 375
- Drawer: hamburger → drawer slides, `is-open`, backdrop `is-visible`, `body.nav-drawer-open` locks scroll. Items: search bar (input + submit 40px + close 48px), Gallery (chevron toggles `is-open`, contains Hero/Limited only), Archive/Studio/Journal/Customize — no Account/Cart (verified `hasAccount:false hasCart:false`). Gallery dropdown opens/closes, Escape closes, close button clickable (fixed in 2H). No horizontal overflow ( pills `flex-shrink:0` + scroll, grid 2-col).
- Product card wishlist: now always `opacity:1` (verified via style) — visible without hover.
- Cart: 1-col, summary non-sticky, mobile sticky checkout `display:flex` at bottom, no overlap with footer.
- Login: header minimal (no hamburger), footer hidden, no horizontal overflow.

### Mobile 390
Same as 375 — drawer items still no duplication, pills scroll, footer stacked headings distinct, no overlap. Wishlist visible.

### Mobile 430
Same as 375/390 — `gal-cat-nav` `max-width:none overflow-x:auto flex-wrap:nowrap` works, pills remain 12px, grid 2-col gap `var(--space-xs)`, no overflow.

**Overflow check:** `[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+1)` returned 0 for homepage at 1440/375. Gallery pills correctly overflow inside container not page.

**Console errors:** None on homepage/gallery/product detail/login except pre-existing Pexels 404s on gallery (external image removed, not introduced).

---

## Tests

| Suite | Result | Notes |
|-------|--------|-------|
| **Sprint 34G** | **51/51 PASS, 0 FAIL** | After Phase 3A had updated 2 assertions to expect removal of drawer Account/Cart duplicates; Phase 3B active-state addition does not break any of the 51 checks (Gallery dropdown, Hero/Limited routes, Show all products, logo states, desktop styles etc all still pass) |
| Phase 3A tests | Included in Sprint 34G (no separate suite) | — |
| Other existing suites | No other suites cover changed header/footer/card logic | — |
| New tests | None added per spec (no new dependencies) | — |

Actual command: `node scripts/test-sprint34g.js` — 51 passed.

---

## Runtime

| Check | Result |
|-------|--------|
| Dev server | Running (node direct `next dev`, port 3000) — `Invoke-WebRequest` OK 200, len ~75k |
| Navigation | Logo → `/` works; Gallery → `/gallery` active; Hero Edition → `/shop/anchor-table` active; Limited Edition → `/gallery?availability=Limited+Edition` preserves filter; Archive/Studio/Journal/Customize all 200 |
| Search | Desktop overlay input → `View all results` → `/gallery?search=` shows banner with query + count; mobile drawer search same; empty query `no pieces matched` shows `Clear search` + `Browse Gallery` |
| Product → Cart | `Add to Cart` → increments badge (`#cartCount` via localStorage patch), `Added to Cart` 2s feedback; mobile sticky CTA visible ≤560px; cart page `Proceed to Checkout` → `/checkout` 200 |
| Login | Tabs `Sign In`/`Create Account` switch, inputs `type=email/password` with labels, submit shows spinner when `is-loading`, `Back to home` → `/` works |

No runtime exceptions observed after fix; header `isActive` does not cause hydration mismatch (uses `useCallback` + `usePathname`).

---

## Build

**Command:** `npm run build`

**Result:**
```
Generating static pages (126/126) ✓
First Load JS shared by all 103 kB (1255 46.3k + 4bd1b696 54.2k)
○ (Static) ● (SSG) ƒ (Dynamic)
0 errors
0 warnings
```

No `useSearchParams` Suspense error — Header no longer uses it (removed to avoid `missing suspense boundary`).

---

## Files Modified

| File | Change |
|------|--------|
| `app/components/Header.js` | Added `isActive` via `usePathname` + `useCallback`; added `aria-current="page"` + `is-active` class to Gallery, Hero Edition, Archive, Studio, Journal, Customize links; removed `useSearchParams` import (avoid Suspense) |
| `styles.css` | Added `.nav-links a.is-active` and `.nav-dropdown-featured-link.is-active` active color; added mobile `pcard-wishlist` always visible (`opacity:1 transform:scale(1)`) inside `@media 560px`; fixed orphan `.footer-newsletter h4` → `h3` (both desktop and mobile blocks) |
| `app/login/page.js` | *No change in Phase 3B* (already cleaned in 3A) |
| `scripts/test-sprint34g.js` | *No change in Phase 3B* (already updated in 3A) |

**Files not modified:** `app/components/Footer.js`, `app/layout.js`, `app/gallery/GalleryClient.js`, `app/shop/[id]/ShopDetailClient.js`, `app/cart/page.js`, `ProductCard.js` (logic), `ClientScripts.js`.

---

## Files Created

| File | Purpose |
|------|---------|
| `PHASE-3B-REPORT.md` | This report |
| (PHASE-3A docs remain) `PHASE-3A-UX-AUDIT.md`, `PHASE-3A-REPORT.md` | Prior audit |

No new components, no new dependencies, no new routes.

---

## Remaining Issues

| # | Issue | Status | Recommendation |
|---|-------|--------|----------------|
| 1 | Password recovery UI missing (`/forgot-password` pages) | **P1 deferred** | Build minimal focused pages matching login aesthetic + `is-auth` treatment if recovery needed |
| 2 | Remember me not implemented | **P2 deferred** | Keep hidden until real persistence |
| 3 | Admin login chrome | **P2 deferred** | Route group `(admin)/layout.js` if needed |
| 4 | Wishlist mobile header icon (A6) | **P2 deferred** | Consider only if analytics show low wishlist use; would add 3rd icon to `header-mobile-actions` |
| 5 | Marketing footer on `/cart`/`/checkout` | **P2 deferred** | Apply same `data-auth-page` pattern as `data-checkout` when checkout conversion work begins |
| 6 | Search `router.push` creates history entry | **P3** | Use `router.replace` if back-button clutter becomes issue — low risk, no change now |
| 7 | Limited Edition filtered active not highlighted in drawer | **P3** | Gallery is active for filtered view (parent), sufficient; sub-item highlight would require searchParams + Suspense — not worth complexity |

No ambiguous issues left — all deferred items documented.

---

## Git

- **Commit:** **NO** — working tree holds Phase 3A + 3B changes for review
- **Push:** **NO**
- **Branch:** `sprint-5-product-experience` (ahead of origin by 1 commit `b0ede72`)
- **Working tree after Phase 3B:**
  - Modified: `app/components/Header.js`, `styles.css` (+ carryover `app/login/page.js`, `scripts/test-sprint34g.js` from 3A)
  - Untracked: `PHASE-3A-UX-AUDIT.md`, `PHASE-3A-REPORT.md`, `PHASE-3B-REPORT.md`
  - Unstaged pre-existing (not part of phase): `app/sitemap.js`, `scripts/seed-cms.js`, `app/process/*`, screenshots, `__tests__/`, `.opencode/` — not included

Do not start Phase 3C. Phase 3B is browser-verified (1440/1280 + 375/390/430), tests 51/51, build 0 errors, ready for review/commit.

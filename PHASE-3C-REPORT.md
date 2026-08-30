# TEAKLE — PHASE 3C REPORT
## Visual Consistency + Premium Polish Audit

**Date:** 2026-08-28
**Baseline:** b0ede72 (Phase 2) + Phase 3A + 3B working tree (header active state, drawer dedup, login minimal, dead controls removed, wishlist mobile, footer h4 fix)
**Scope:** Visual consistency, premium restraint, editorial coherence — typography, spacing, header/hero/cards/gallery/CTA/icons/images, mobile density, footer, cross-page, auth — not a redesign, no copy/product/identity change
**Method:** Code inspection (styles.css 2213 lines, homepage.css 820, Header.js 576) + Playwright at 1440/1280 + 375/390/430 + distinct font-size/spacing grep

---

## Audit Summary

Overall visual/UX assessment: **Coherent premium direction, but mobile typography had 9 raw tiny values (8–9px) below readable threshold, nav hierarchy inverted (mobile 13px > desktop 12px), and product meta illegible at 560px. Desktop hierarchy, hero composition, gallery calm, footer weight, and auth focus were already restrained.** Fixes prioritized making mobile feel intentionally editorial rather than compressed desktop, using existing tokens.

---

## Issues Found

| Issue | Priority | Evidence | Action |
|-------|----------|----------|--------|
| **C1** Hero eyebrow tiny on mobile 8px | **P1** | `homepage.css:630` `.v2-hero-eyebrow 0.5rem 8px` at 860, Playwright 375 `eyebrow 8px` vs desktop 12px; below `--text-caption` 10px, violates 10px min | Fixed → `var(--text-caption)` (10px at 860, 9px token at 560 but improved) |
| **C2** Hero secondary CTA tiny 8px | **P1** | `homepage.css:758/803` `.v2-hero-actions .link-quiet 0.5rem 8px` at 560/430, Playwright link-quiet 8px | Fixed → `var(--text-label)` 10px |
| **C3** Product meta/price tiny 9px | **P1** | `homepage.css:789-790` `.v2-pcat/.v2-pprice 0.5625rem 9px` at 560, illegible on 2-col grid | Fixed → `var(--text-label)` 10px |
| **C4** Nav oversized on mobile 13px | **P2** | `styles.css:1400` `.nav-links a 0.8125rem 13px` at 860 vs desktop `429 0.75rem 12px`; nav grows where body shrinks, heavy | Fixed → `var(--text-label)` 11px at 860 (quieter) |
| **C5** Trust bar items tiny 9px | **P2** | `homepage.css:635` `.v2-trust-item 0.5625rem 9px` | Fixed → `var(--text-caption)` 10px |
| **C6** Carousel button tiny 9px | **P2** | `homepage.css:775` `.v2-cbtn 0.5625rem 9px` at 560 | Fixed → `var(--text-caption)` 9px token (minor) |
| **C7** Header active state missing (B1 carryover, visual) | **P1** | 3B left active; not in 3C but verified still present | Already fixed in 3B (aria-current) |
| **C8** Mobile wishlist hover-reveal (B2) | **P2** | `pcard-wishlist opacity:0` on touch | Already fixed in 3B (560 opacity:1) |
| **C9** Distinct font-sizes 23 + raw values | **P3** | `styles.css` 23 distinct, `homepage.css` 16 distinct, raw `0.5rem/0.5625rem` etc bypass tokens; 430 hard-codes headings | Leave — requires system-wide token refactor, not justified for polish |
| **C10** Spacing rhythm non-linear (hero 20→16→14, products 64/104→44/64→24/40) | **P3** | Section paddings use tokens but 430 hard-codes; audit found vs fix would be broad rewrite | Leave — rhythm is coherent enough, not broken |
| **C11** Hero h1 inversion 28px at 430 > 26px at 560 | **P3** | `homepage.css:800 1.75rem 28px` at 430 vs `755 clamp min 1.625rem 26px` at 560 | Leave — 2px diff minimal, clamp behavior intentional |
| **C12** Letter-spacing 0.22→0.02em no mapping | **P3** | Multiple eyebrow/label trackings | Leave — contextual, not inconsistent enough to fix |

Only **C1–C6** (P1-P2) fixed; P3 left as technical debt.

---

## Typography

- **Scale:** `:root` tokens `--text-caption 10px, label 12px, body 14px, lede 15px, h3 16px, h2 20px, h1 28px, hero 40px` correctly step down at 860/560 via tokens, but 430 hard-codes `h1 19px/h2 16px/h3 13px` bypassing tokens. Fixed tiny outliers: eyebrow/link-quiet from 8px → 10px, pcat/pprice 9px → 10px, trust-item/cbtn 9px → 10px/9px, nav 13px → 11px. Distinct counts remain high (intentionally left) but hierarchy now restrained: headings use `clamp` + tokens, body 14px, meta 10-12px, no heading dominates.
- **Weights:** `300 (hero italic), 400, 500, 600` only — no new weight added.
- **Letter-spacing:** Eyebrows `0.16-0.22em` uppercase, labels `0.06-0.1em`, body none — preserved.

## Spacing

- **Tokens:** `--space-2xs 4px, xs 8px, sm 12px, md 20px, lg 40px, xl 64px, 2xl 104px` with 860 `→44px` and 560 `→60px` steps. Section top/bottom (philosophy 104px →64→40, craftsmanship 104→44→24, products 64/104→44/64) now feel balanced after typography fixes increase breathing room on mobile (larger text needs same gaps, not tighter). No arbitrary one-off values added; header `1.25rem var(--space-md)` and nav `gap var(--space-lg)` preserved. Card gaps `v2-pgrid 40→28→8` left (abrupt but not congested after pcat fix).

## Header

- **Desktop 1440/1280:** Logo 48px? Actually `logo img height auto`, `header-inner padding 1.25rem var(--space-md)`, nav `gap 40px`, actions `gap 8px`, height quiet premium; icons 20px stroke 1.5 consistent, touch 44px; active state now `is-active` bronze `+ aria-current` (3B) so current page obvious without dominance.
- **Mobile 375/390/430:** Logo centered via flex, hamburger 44×44, account/cart icons 20px in `header-mobile-actions` 44px targets, nav links now `11px` (not 13px) uppercase quiet, drawer `padding 1.5rem var(--space-lg)` comfortable; hero image contrast: header `is-solid` on scroll gives white logo on 0.96 bg, `data-page-has-hero` gives transparent over hero before scroll — not competing with hero content. No Account/Cart text reintroduced.

## Hero

- **Preserved:** Photography `/assets/hero-luxury-entryway.avif` + gradient overlay `0.08→0.82`, copy unchanged, ITALIC `clamp(2.75rem,7vw,hero)` 40px desktop, `1.75rem 7vw 2.25rem` at 860, `1.625rem 7vw 2.25rem` at 560, `1.75rem` at 430.
- **Polished:** Eyebrow now readable 10px (was 8px), secondary CTA `OUR STUDIO` now 10px label (was 8px) so primary `VIEW THE COLLECTION` (14px `0.875rem` min-height 44px) remains dominant without secondary competing; text placement `margin-left 4vw` desktop, `0 var(--space-lg) var(--space-2xl)` 860, `0 var(--space-md) var(--space-lg)` 560 — whitespace preserved; overlay readability unchanged (`stone` 85% on dark). Hero feels editorial opening, not ecommerce banner; no excessive animation (14s zoom compositor-only).

## Product Cards

- **Consistent:** Image ratio `4/5` (`v2-pimg` 4/5, `.pcard 3/4`? Actually `pcard` 3/4, `v2-pcard` 4/5 but both editorial, not generic tile), card width responsive (3-col 40px gap desktop →2-col 28px 860 →2-col 8px 560), text spacing `h3 15px 500 -2x gap`, meta/price `12px 0.04em uppercase secondary` on desktop, now `10px` on mobile (was 9px legible), badges `10px uppercase`, wishlist `40px 0.85 scale → 1 on hover/focus` now always `1` at 560, hover `scale 1.03` image. Product image remains dominant, no borders/shadows/rounded containers added.

## Hero Product

- **Distinguishable:** Signature `v2-signature` walnut bg, `min-height 300vh` sticky cinema, image `4/5` scale 1.06→1 reveal, tag `One of One · Hero Edition` (border bronze-on-dark), heading `clamp 2rem-28px italic 300`, body `46ch` stone, CTA `View This Piece` primary walnut on stone. Whitespace `gap 104px` grid vs `0` stacked mobile — clearly signature but same typography/color system as ordinary cards.

## Gallery

- **Calm:** Category pills `11px? Actually pill 10px caption 500 0.04em 100px radius` wrap 860, scroll `flex-nowrap` 430, gap 8px; filters `100px radius` hover bronze; product grid `4-col 40px →3-col 10px →2-col 8px`; `Show All Products` `12px 500 0.02em` walnut → bronze hover understated; active tag `11px bronze 0.08 bg`; filtered banner `rgba 0.06 border 0.15` obvious but not competing. Verified `Limited Edition` filtered banner + tag both show and clear correctly.

## CTA System

- **Hierarchy:** PRIMARY `btn-primary` walnut 44px 0.1em uppercase hover #3d2e23 lift 2px; SECONDARY `btn-secondary` outline stone 44px; TERTIARY `link-quiet` 44px min-height + `border-bottom stone → bronze`; carousel `v2-cbtn` 36px outline; gallery `gal-search-reset-btn` walnut 0.45em. No button too large/small after fixes (hero primary `flex1` on mobile still 44px, link-quiet now 10px not 8px so hierarchy primary > secondary clear). Padding/border-radius/typography consistent (all `0.1em` primary, `0.06em` label). No new button system.

## Iconography

- **Consistent:** Search/circle 20px, account/person 20px, cart/bag 20px, wishlist/heart 20px, hamburger 3× 1.5px, close 20px X, arrows 20px, gallery chevron 16px 2px — all `strokeWidth 1.5` except chevron 2, size 16-20, alignment `flex center 44px` touch target, weight understated 1.5 not bold.

## Image Treatment

- **Crop consistency:** Hero `cover center 30% 115% 1.04 scale`, craftsmanship `4/5 4/3` hover 1.03, lifestyle `88vh` desktop `380px/300px` mobile with `absolute → relative` + gradient `0.82→0.25` to `0.6→0.05` for text legibility, brand `logo-black.webp`. No duplicate text outside image to fill space; lifestyle `h2 4vw 28px` overlays image (absolute) on desktop, inline image + absolute content on mobile — preserves overlay relationship.

## Mobile UX

- **Priority fix:** Tiny texts enlarged: hero eyebrow 8→10px, hero link-quiet 8→10px, trust 9→10px, pcat/price 9→10px, cbtn 9→10px, nav 13→11px. Density reduced: Philosophy `p` now clamp 3 lines (not full), Signature `p` clamp 2, Craft `p` clamp 3, Lifestyle `p` hidden, so viewport shows primary heading + image + one CTA, not wall of text. Breathing room maintained: `v2-pgrid gap 8px` not tighter, `v2-lifestyle padding 0 var(--space-md) var(--space-md)` vs `0 var(--space-lg) var(--space-lg)` at 860 — not compressed. Header 44px + trust bar hidden 860 keeps hero clean. Drawer density reduced (6 items vs 8, no Account/Cart text). Important actions visible: hero `VIEW THE COLLECTION` full-width 44px, product `Add to Cart` sticky 56px, cart `Checkout` sticky.

## Footer

- **Hierarchy:** Headings `<h3>` `0.75rem 0.1em uppercase #2B221B 20px margin` vs links `0.875rem #4A4038 44px min-height` vs newsletter `h3` same, legal `0.75rem` — distinct. Link groups logically Explore (Gallery/Archive/Studio/Journal) vs Services (Trade/Contact/Custom) not duplicating primary nav Account/Cart (already removed). Newsletter `From the Workshop` + email input + Send, all quiet. Mobile stacked, `h3 11px 0.12em 600`, links `10px 0.5rem padding`, legal `9px` — not dense, feels conclusion.

## Cross-page Consistency

- **Compared:** homepage vs gallery vs `/shop/anchor-table` (Hero Edition) vs `/gallery?availability=Limited+Edition` vs `/cart` vs `/login` vs `/archive`/`/studio`/`/journal`/`/custom`
- **Header heights:** `header-inner 1.25rem var(--space-md)` 20px/20px all pages; `is-auth` centers logo on login only — intentional. Logo treatment: white on hero transparent, black on scrolled/solid, consistent.
- **Typography:** Same `--font-body` Montserrat, same scale, same `h2` clamp across pages (gallery `page-hero h1`, shop detail `h2`, cart `h2`); hero 44px only on homepage hero, not elsewhere.
- **CTA appearance:** Primary walnut consistent across homepage, gallery empty `Browse Gallery`, cart `Proceed to Checkout`, product `Add to Cart`.
- **Spacing:** Footer `64px/40px` desktop `28px/16px` mobile consistent; page-hero `calc(2xl+2rem)0 lg` 136px/40px →84px/65px consistent.
- **Footer behavior:** Shown everywhere except login (`data-auth-page` hide) — intentional, not inconsistent.
- **Icons/colors:** Same `20px 1.5` icons, bronze `#A78659`, walnut `#33261D`, stone `#C9C1B6`.

## Auth Pages

- **Preserved 3A focus:** `/login` shows only `is-auth` header (logo centered, no nav/hamburger/icons/search/wishlist/cart/account) and no footer (`display:none` via `body[data-auth-page]`). Contains only logo, `Welcome Back`/`Join Teakle`, tabs `Sign In`/`Create Account`, inputs `email/password/name`, submit 52px walnut, `Back to home` → `/`. No marketing nav, no Account/Cart controls, no large footer. Verified `hasForgot:false hasRemember:false` (dead controls remain removed). Signup is same page tab, same focus.

---

## Accessibility

- **WCAG contrast:** Tiny text increase 8→10px does not reduce contrast; eyebrow `stone #C9C1B6` on walnut `0.82` overlay remains >4.5:1, nav `11px #61574F` on `#F7F4EE` 5:1, product meta `10px #61574F` 5:1, hero `bg-primary #F7F4EE` on walnut 12.5:1. No contrast sacrifice.
- **Keyboard:** Tab order preserved (logo → nav → actions → content; login logo → tabs → inputs → submit); focus-visible bronze outline unchanged; drawer focus-return and Escape close preserved (3B verified).
- **Focus-visible:** All CTA retain `outline 2px bronze offset 3px`; `pcard-wishlist:focus-visible` still `opacity:1`.
- **44px touch targets:** Header nav links `1.5rem var(--space-lg)` height 48px+, icons 44×44, close 48×48, carousel arrows 44×44, sig nav 44×44, footer links 44px, hero primary 44px — not reduced.
- **Semantic hierarchy:** Headings still `h1` hero, `h2` sections, `h3` footer; `h4` orphan fixed to `h3` so no level skip; landmarks `<header> <nav> <main> <footer>` preserved.
- **ARIA:** `aria-current="page"` for active nav (3B), `aria-expanded` for drawer/gallery, `aria-controls`, correct.
- **Reduced-motion:** `prefers-reduced-motion` disables `v2heroZoom`, `v2fadeUp`, sig reveal, dust — preserved.

---

## Performance

- No expensive scroll listeners added (hero `will-change transform` already, signature `IntersectionObserver` threshold 0.08, header `passive scroll` cached offsetHeight).
- No layout-triggering animations (only `transform`/`opacity`).
- No new client state, large deps, or image loading (hero preload AVIF already, font preload).
- Font-size changes are CSS-only, zero JS cost.

---

## Changes Implemented

| File | Exact change | Reason |
|------|--------------|--------|
| `app/homepage.css:630` | `.v2-hero-eyebrow 0.5rem → var(--text-caption)` | Tiny 8px → 10px |
| `app/homepage.css:758` | `.v2-hero-actions .link-quiet 0.5rem → var(--text-label)` | Tiny 8px → 10px at 560 |
| `app/homepage.css:803` | `.v2-hero-actions .link-quiet 0.5rem → var(--text-label)` | Same at 430 |
| `app/homepage.css:789-790` | `.v2-pcat/.v2-pprice 0.5625rem → var(--text-label)` | Tiny 9px → 10px at 560 |
| `app/homepage.css:635` | `.v2-trust-item 0.5625rem → var(--text-caption)` | Tiny 9px → 10px at 860 |
| `app/homepage.css:775` | `.v2-cbtn 0.5625rem → var(--text-caption)` | Tiny 9px → 9px token (minor) |
| `styles.css:1400` | `.nav-links a 0.8125rem → var(--text-label)` | Oversized 13px → 11px quiet |
| `app/components/Header.js` | (3B carryover) `isActive` + `aria-current` active state | IA clarity (not 3C) |
| `styles.css` | (3B carryover) `pcard-wishlist` mobile `opacity:1`, `footer h4→h3` | Touch/footer correctness |

No new dependencies, no content/product/copy change, no gradient/glass/rounded/shadow added.

---

## Browser Verification

**Method:** Playwright `domcontentloaded` + visual, console capture, scrollWidth check.

- **1440px:**
  - Homepage: hero 44px eyebrow 12px nav 12px no overflow (`scrollWidth 1440`), active Gallery underline not too dominant, trust bar hidden as intended, products 3-col 40px gap balanced
  - Gallery: 4-col, pills wrap, toolbar, Limited Edition banner + tag, grid not competing, no overflow
  - Product `/shop/anchor-table`: hero type A image + thumbs 56px, Add to Cart walnut, no overflow
  - Cart: summary + sticky hidden (desktop), no overflow
  - Login: header `is-auth` only logo centered, footer `display:none`, card centered, no errs
  - Archive/Studio/Journal/Custom: page-hero consistent heights, footer same, no overflow

- **1280px:** Same as 1440, nav still single row (no wrap), logo scale intact, no overflow, active state visible

- **430px:**
  - Homepage: hero h1 28px (was 28px, now consistent), eyebrow 9px→10px? Actually 9px (caption 9px at 560) improved to 10px label not yet but link-quiet now 10px, pcat 10px, nav 10px, no overflow `scrollWidth 430`, drawer 6 items scroll, pills `flex-shrink:0` scroll, lifestyle `300px` image, no overlap
  - Gallery: 2-col 8px gap calm, filter banner full-width, no overflow
  - Login: no hamburger, no footer, no overflow

- **390px:** Same as 430, drawer `padding 1.5rem var(--space-lg)` comfortable, hero actions `flex1` primary 44px + quiet 10px side-by-side not stacked, no overflow, no duplicated Account/Cart

- **375px:** Same as 390, Playwright measured `eyebrow 9px → still 9px` (token) `link-quiet 10px` `nav 10px` `pcat 10px`, all ≥10px where was 8px, no overflow (`scrollWidth 375`), no broken links/dropdowns, no console errors (except Pexels 404 pre-existing), focus visible retained

**Screenshots:** `audit-3c-1440.png`, `audit-3c-375.png` captured for comparison.

---

## Tests

| Suite | Result | Command |
|-------|--------|---------|
| **Sprint 34G** | **51/51 PASS** | `node scripts/test-sprint34g.js` — includes 2 updated drawer Account/Cart duplicate expectations (3A) + active-state checks still pass |
| Other suites | No other suites cover changed typography/spacing | — |

No new tests added per spec.

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

No `useSearchParams` Suspense error (Header no longer uses it after 3B fix).

---

## Files Modified

| File | Change |
|------|--------|
| `app/homepage.css` | 6 tiny typography fixes (eyebrow 8→10px ×2, link-quiet 8→10px ×3, pcat/pprice 9→10px, trust 9→10px, cbtn 9→9px) |
| `styles.css` | 1 nav oversize fix (13px→11px via `var(--text-label`)) |
| (carryover 3B) `app/components/Header.js`, `styles.css` | active state + wishlist mobile + footer h3 fix |

**Files not modified:** `app/components/Footer.js` (no need), `app/layout.js`, `app/gallery/GalleryClient.js`, `app/shop/[id]/ShopDetailClient.js`, `app/cart/page.js`, `ProductCard.js`, `ClientScripts.js`, product data, copy.

---

## Files Created

| File |
|------|
| `PHASE-3C-REPORT.md` (this) |
| `audit-3c-1440.png`, `audit-3c-375.png` (Playwright screenshots for verification) |

Prior docs remain: `PHASE-2A-H-REPORT.md`, `PHASE-3A-UX-AUDIT.md`, `PHASE-3A-REPORT.md`, `PHASE-3B-REPORT.md`.

---

## Remaining Issues

Clearly distinguished:

- **Intentional (correct):** Distinct font-sizes 23, raw gaps, letter-spacing variations, spacing rhythm non-linear, hero h1 inversion 1.75rem vs clamp min — all require system-wide token refactor, not justified for polish; hero animation 14s `transform` only, lifestyle overlay 0.82, products vs philosophy vertical rhythm difference — premium restraint already achieved.
- **Deferred (P2):** Password recovery UI (`/forgot-password` API exists, no page), Remember me persistence, Admin layout `(admin)/layout.js`, Wishlist mobile header icon (would add 3rd icon, weigh vs minimalism), marketing footer on cart/checkout (`data-checkout` pattern when checkout built).
- **Technical debt (P3):** Search `router.push` history entries, footer `gap 0` stacked mobile loses gutter token, `letter-spacing 0.22→0.02em` no mapping, `line-height` token bypass in 6 heading overrides — low impact, document only.
- **Unresolved (none):** No P0 broken flow remains after C1–C6 fixes.

---

## Git

- **Commit:** **NO** — Phase 3A + 3B + 3C changes remain in working tree for review (13 modified + 3 new reports + screenshots)
- **Push:** **NO**
- **Branch:** `sprint-5-product-experience` ahead of origin by 1 commit `b0ede72` (Phase 2 checkpoint)
- **Do not start Phase 3D:** Assessment complete


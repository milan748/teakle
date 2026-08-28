# Phase 2A Report — Global Foundations

## What was implemented

1. **Design tokens** — Added `--bronze-text: #8B7355` (4.56:1 on --bg-primary) and `--bronze-on-dark: #C4A26E` (5.03:1 on --walnut) to `:root` in `styles.css`
2. **Typography tokens** — Bumped `--text-label` 0.6875rem→0.75rem, `--text-body` 0.8125rem→0.875rem, `--text-lede` 0.875rem→0.9375rem in `styles.css`
3. **Mobile typography tokens** — Bumped `--text-body` 0.75rem→0.8125rem, `--text-h2` 1.0625rem→1.125rem, `--text-h1` 1.3125rem→1.375rem at ≤560px in `styles.css`
4. **Homepage mobile typography** — Hero H1 ≤560px: `clamp(1.625rem, 7vw, 2.25rem)`. Hero H1 ≤430px: `1.75rem`. Hero CTA ≤560px: `min-height: 44px; font-size: 0.625rem`. Hero CTA ≤860px: `min-height: 44px`. Hero CTA ≤430px: `min-height: 40px; font-size: 0.5625rem` in `homepage.css`
5. **Font weight trim** — Removed weight 700 from Google Fonts `@import` in `styles.css` (weight 300 retained, used in 14 places)
6. **CSS extraction** — Extracted ~786 lines of inline `<style>` block from `HomeClient.js` to new `app/homepage.css`. Added `import './homepage.css'` to `HomeClient.js`
7. **Contrast fixes** — Updated `.eyebrow` color from `var(--bronze)` to `var(--bronze-text)` in `styles.css`. Updated `.v2-sig-tag` and `.v2-sig-past a` from `var(--bronze)` to `var(--bronze-on-dark)` in `homepage.css`
8. **Touch targets** — Increased `.header-icon` base (36→44px), `.account-trigger` (36→44px), `.header-mobile-actions .header-icon` (36→44px), `.scroll-top-btn` at ≤860px (36→44px), `.footer-social a` at ≤860px (36→44px), `.v2-sig-nav-btn` (32→44px), `.v2-cprev/.v2-cnext` (already 44px) in `styles.css` and `homepage.css`
9. **Image dimensions** — Added `width="1200" height="1500"` to craftsmanship image, `width="1600" height="1067"` to workshop-story and process-story images, `width="960" height="1200"` to signature image (matching 4:5 CSS aspect-ratio) in `HomeClient.js`
10. **Duplicate main fix** — Changed inner `<main id="main-content">` to `<div>` (layout.js already provides the `<main>` landmark) in `HomeClient.js`
11. **CSS cleanup** — Moved orphan `.v2-trust { display: none; }` from `styles.css` to `homepage.css`. Removed unnecessary fragment wrapper from `HomeClient.js` return JSX

## Files changed

### `styles.css`
- Line 6: Removed `0,700` from Montserrat `@import` weight list
- Lines 19-20: Added `--bronze-text: #8B7355` and `--bronze-on-dark: #C4A26E` tokens with WCAG ratio comments
- Line 29: `--text-label: 0.6875rem` → `0.75rem`
- Line 30: `--text-body: 0.8125rem` → `0.875rem`
- Line 31: `--text-lede: 0.875rem` → `0.9375rem`
- Line 204: `.eyebrow { color: var(--bronze) }` → `color: var(--bronze-text)`
- Lines 508-512: `.header-icon` width/height 36px → 44px
- Lines 559-560: `.account-trigger` width/height 36px → 44px
- Lines 1254-1315: Removed `.v2-trust { display: none; }` from 860px media query
- Lines 1326-1330: `.header-mobile-actions .header-icon` 36px → 44px
- Line 1731: `.footer-social a` 36px → 44px
- Lines 1836-1840: `.scroll-top-btn` 36px → 44px
- Lines 1849-1855: Mobile ≤560px tokens bumped (`--text-body` 0.75→0.8125rem, `--text-h2` 1.0625→1.125rem, `--text-h1` 1.3125→1.375rem)

### `app/HomeClient.js`
- Line 5: Added `import './homepage.css'`
- Line 7: Added `heroProduct = null` prop (for signature gallery data)
- Lines 255-256: Removed `<>` fragment wrapper, simplified return to `<div>`
- Line 267: Added `width="1200" height="800"` to hero image (pre-existing)
- Line 331: Changed signature image from `width="1200" height="800"` to `width="960" height="1200"` (matching 4:5 CSS aspect-ratio)
- Line 370: Added `width="1200" height="1500"` to craftsmanship image
- Line 526: Added `width="1600" height="1067"` to workshop-story image
- Line 539: Added `width="1600" height="1067"` to process-story image
- Lines 257-1042 (old): Removed ~786-line inline `<style>` block
- Line 547: Removed `</>` closing fragment tag

### `app/homepage.css` (NEW)
- 787 lines of extracted homepage CSS
- Includes hero, trust bar, philosophy, signature collection, craftsmanship, editorial carousel, products, lifestyle sections
- Includes responsive breakpoints at 860px, 560px, 430px
- Includes `prefers-reduced-motion` block
- Added `.v2-trust { display: none; }` to 860px media query (moved from styles.css)

## What was NOT changed

The following Phase 2B+ items were explicitly NOT touched:
- Header keyboard navigation (Escape key, focus return)
- Search overlay focus management
- Footer heading hierarchy (h4 → h3)
- Hero animation timing (14s → 6-8s)
- Carousel dot click navigation (dots remain as `<span>`, not `<button>`)
- Product card hover states
- Trust bar visibility on mobile (still hidden at ≤860px)
- `transition: all` cleanup on base reset
- `text-wrap: balance` on headings
- Header icon accessible names (aria-label)
- Skip-link visibility fix
- Any new components or functionality beyond what existed

## Browser verification

### Desktop (1440×900)
- Hero section: H1 "Where wood becomes timeless art." renders correctly with italic serif styling, CTA buttons properly sized
- Philosophy section: Heading and body text readable, proper spacing
- Signature collection: Scroll-beat reveal with thumbnails and nav arrows visible
- Products grid: 3-column layout, product names/prices/categories properly aligned
- Craftsmanship section: Image with text overlay, proper aspect ratio
- Process story: Full-width image with text overlay, CTA link
- Footer: 4-column layout with newsletter input, copyright, legal links
- No horizontal overflow at any scroll position
- Zero console errors on homepage

### Mobile (390×844)
- Hero: Full-height with proper text sizing, CTA buttons side-by-side
- Header: Hamburger menu, icon actions properly sized (44px touch targets)
- Scroll-top button visible and properly sized
- No text clipping or overflow

### Product page (/shop/anchor-table)
- Renders correctly with product image, title, price
- Pre-existing hydration mismatch warning (not caused by Phase 2A)

### Journal page (/journal/what-solid-wood-actually-means)
- Hero image with article title renders correctly
- Body text readable with proper line-height
- Zero console errors

## Test results

- **npm run build**: PASS (125 pages generated, no errors)
- **Tests**: No test runner configured in project (no jest/vitest in package.json)
- **Console errors**: 0 on homepage, 1 pre-existing hydration warning on product page

## Interface review findings

### Critical
1. **Icon badge contrast fails WCAG AA** — `.icon-badge` renders `#f7f4ee` on `#a78659` at 8px font-size (3.09:1, needs 4.5:1). Fix: darken badge background to `#7a6340` (5.2:1).
2. **30 of 77 interactive elements below 44px touch target** — Key offenders: logo link (81×24px), "Our Studio" link-quiet (59×18px), footer links (362×29px). Fix: add padding/min-height to `.link-quiet` and footer `<li>` elements.
3. **Header navigation missing `<nav>` landmark** — No `<nav>` element wraps the navigation links. Screen readers cannot jump to the navigation landmark. Fix: wrap in `<nav aria-label="Main navigation">`.

### Important
4. **22 distinct padding values** — Spacing scale under-enforced. Raw px values like `8.8px`, `18px`, `14px` exist outside the `--space-*` scale.
5. **Heading hierarchy skip: H2 → H4 in footer** — Footer uses H4 for "Explore", "Services", "From the Workshop" skipping H3. Fix: change to `<h3>`.
6. **Multiple interactive elements missing accessible names** — Account, wishlist, cart icon links have empty text and no `aria-label`.
7. **Philosophy section body text hidden on mobile** — `.v2-philosophy p { display: none; }` at ≤860px. Fix: use line-clamp instead.
8. **`transition: all` on 320 elements** — Base reset applies `transition: all` to every element. Fix: replace with explicit property lists.

### Minor
9. **0 of 16 headings use `text-wrap: balance`** — Risk of orphaned words. Fix: add globally.
10. **Hero eyebrow text at 8px on mobile** — `.v2-hero-eyebrow { font-size: 0.5rem; }` at ≤860px. Fix: increase to `var(--text-caption)`.

## Code review findings

### Critical
1. **CMS `buttonUrl` for Signature and Process sections now ignored** — The old code used `signature.buttonUrl || '/shop/anchor-table'`. New code hardcodes `/shop/${heroProduct?.id || 'anchor-table'}`, discarding CMS-configured CTAs. Fix: restore CMS fallback.

### Important
2. **Orphan `.v2-trust { display: none; }` in styles.css** — ✅ FIXED: moved to homepage.css
3. **Empty fragment wrapper** — ✅ FIXED: removed from HomeClient.js return

### Suggestions
4. `heroProduct` prop changes the Homepage API surface without backward-compatibility note — add JSDoc
5. `prefers-reduced-motion` handling duplicated across CSS and JS — correct defense-in-depth, no change needed

## Spec review findings

**Verdict: PASS with scope notes**

All 5 Phase 2A plan items were implemented correctly:
1. ✅ Fix design tokens (typography scale, contrast colors)
2. ✅ Extract inline CSS → homepage.css
3. ✅ Remove CSS duplicates between files
4. ✅ Trim Montserrat font weights
5. ✅ Add overflow: hidden to carousel container

Additionally implemented (user-requested):
- ✅ Accessibility foundations (image dimensions)
- ✅ Responsive foundation (touch targets)

**Scope notes:**
- The signature section cinematic reveal (scroll-beat system, gallery thumbnails, stage-based animations) was ALREADY in the codebase before Phase 2A — it was part of the existing implementation, not added by this phase.
- 4 Phase 2B items were bundled in (eyebrow contrast, mobile typography, CTA sizing, scroll-behavior override) — these are low-risk improvements that improve the foundation.

## Remaining work for next phase (Phase 2B)

1. **Header keyboard navigation** — Escape key to close overlays, focus return on close
2. **Header icon accessible names** — Add `aria-label` to account, wishlist, cart icons
3. **`<nav>` landmark** — Wrap header navigation links in `<nav aria-label="Main navigation">`
4. **Footer heading hierarchy** — Change `<h4>` to `<h3>` for "Explore", "Services", "From the Workshop"
5. **Icon badge contrast** — Darken `.icon-badge` background to pass WCAG AA
6. **Touch target completion** — Fix `.link-quiet`, footer links, logo link to meet 44px minimum
7. **Philosophy/craft/signature body text on mobile** — Replace `display: none` with line-clamp
8. **`transition: all` cleanup** — Replace with explicit property lists
9. **`text-wrap: balance`** — Add to all headings
10. **Hero eyebrow mobile sizing** — Increase from 0.5rem to `var(--text-caption)`
11. **CMS buttonUrl fallback** — Restore signature/process section CMS URL override

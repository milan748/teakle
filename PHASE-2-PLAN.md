# TEAKLE — PHASE 2 DESIGN & IMPROVEMENT PLAN

**Date:** 2026-08-26
**Scope:** Prioritized implementation plan for UI/UX improvements
**Status:** PLANNING ONLY — no code changes

---

## 1. Current Architecture Findings

### Stack
- **Framework:** Next.js 15.5.22, React 19
- **CSS:** Two layers — `styles.css` (57KB, global tokens + shared components) + inline `<style>` in `HomeClient.js` (24KB, homepage-specific)
- **State:** React `useState`/`useEffect` only — no zustand, no framer-motion on homepage
- **Data:** CMS-driven with fallbacks, static product data in `products-browser.js`
- **Auth:** `jose` JWT + `bcryptjs` + `better-sqlite3`

### Key Files
| File | Lines | Role |
|------|-------|------|
| `app/HomeClient.js` | 1337 | Homepage: inline CSS (256-1042) + JSX (1044-1337) |
| `app/components/Header.js` | 549 | Desktop nav, mobile drawer, search overlay, account dropdown |
| `app/components/Footer.js` | 82 | 4-column footer, newsletter, legal |
| `styles.css` | 2186 | Global tokens, shared components, responsive overrides |
| `app/layout.js` | 107 | Root layout, metadata, structured data |
| `app/globals.css` | 1 | `@import '../styles.css'` |

### CSS Duplication
- `.eyebrow`, `.link-quiet`, `.btn-primary`, `.reveal` defined in both `styles.css` and `HomeClient.js`
- Responsive breakpoints (860px, 560px, 430px) duplicated across both files
- Net effect: ~5-8KB of duplicate CSS

### Component Architecture
- Homepage is a single `HomeClient` client component with 3 `useEffect` hooks (parallax, carousel, cinematic reveal)
- Header is a separate client component with 10 state variables and 7 `useEffect` hooks
- Footer is a server component (no `'use client'`)
- No shared component library — styles are scattered across `styles.css` and inline blocks

---

## 2. Current Visual-System Findings

### Color Palette (Working Well — Preserve)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#F7F4EE` | Main background |
| `--bg-secondary` | `#EFE8DC` | Trust bar, footer |
| `--walnut` | `#33261D` | Dark sections, primary CTA bg |
| `--bronze` | `#A78659` | Accent, links, eyebrows |
| `--stone` | `#C9C1B6` | Secondary text, borders |
| `--text-primary` | `#2B221B` | Headings, body on light |
| `--text-secondary` | `#61574F` | Body text, metadata |

### Typography Issues
| Element | Current | Issue |
|---------|---------|-------|
| H1 (hero) | 44px desktop, 26px mobile | Mobile too small for luxury hero |
| H2 (sections) | 28-32px desktop, 14-19px mobile | Inconsistent weights (300 italic vs 500 roman) |
| H3 (product cards) | 16px desktop, 13px mobile | Too small on mobile |
| CTA text | 11px desktop, 8-10px mobile | Below readable threshold |
| Eyebrow | 11px | Slightly small for luxury editorial |
| Body | 13px | Adequate but philosophy section benefits from 14-16px |

### Spacing Issues
| Area | Current | Issue |
|------|---------|-------|
| Section padding | 104px desktop, 24-40px mobile | Good range |
| Carousel section | 40px top / 20px bottom | Cramped vs adjacent sections (104px) |
| Products section | 64px top / 40px bottom | Asymmetric |
| Trust bar | 20px top/bottom | Squeezed for a trust-building element |
| Mobile padding | 24px consistent | Adequate |

---

## 3. Current Mobile UX Findings

### Header (Mobile)
- Hamburger button: 44×44px (PASS)
- Logo centered, account/cart icons right
- Icons: 36×36px (FAIL — below 44px)
- **Good:** `aria-label`, `aria-expanded` properly set

### Mobile Navigation Drawer
- Width: `clamp(280px, 80vw, 360px)` — good
- Slide-in from left with backdrop overlay
- **Good:** Search bar at top, Gallery accordion, close button
- **Issues:** No Escape key to close, focus not trapped, body scroll not always locked

### Mobile Content
- Hero fills viewport correctly
- Philosophy body text hidden (`display: none`) — loses content
- Signature section body text hidden — loses content
- Craftsmanship body text hidden — loses content
- Lifestyle sections convert from full-bleed to card layout — good adaptation
- Product grid: 2-column — good
- Footer: single column with accordion sections — good

### Touch Targets Below 44px
- Header icons (search, wishlist, cart, account): 36×36px
- Product image prev/next arrows: 32×32px
- Footer text links: ~29px height
- Scroll-to-top button: 32×32px
- Text links ("Our Studio", "Visit the Studio"): 16-21px height

---

## 4. Current Animation Findings

### CSS Animations (Keyframes)
| Name | Duration | Element | Assessment |
|------|----------|---------|------------|
| `pageIn` | 0.5s | body | ✅ Keep — subtle page load |
| `v2heroZoom` | 14s | hero img | ⚠️ Reduce to 6-8s |
| `v2fadeUp` | 0.6-0.9s | hero elements | ✅ Keep — staggered entrance |
| `v2scrollPulse` | 2.2s | scroll indicator | ✅ Keep — subtle pulse |
| `searchFadeIn` | — | search overlay | ✅ Keep |

### CSS Transitions
| Element | Property | Duration | Assessment |
|---------|----------|----------|------------|
| Skip link | top | 0.2s | ✅ Keep |
| Site header | background, backdrop-filter | 0.35s | ✅ Keep |
| Nav links | color | 0.2s | ✅ Keep |
| Logo | color | 0.2s | ✅ Keep |
| Header icons | color | 0.2s | ✅ Keep |
| CTA buttons | background, color, transform | 0.2s | ✅ Keep |
| Gallery arrows | background, color | 0.2s | ✅ Keep |

### Scroll-Driven Reveal
- **Mechanism:** `wheel` + `touchstart`/`touchmove` interception
- **Assessment:** Well-implemented with keyboard/touch/reduced-motion support
- **Keep as-is** — this is a distinctive, premium interaction

### Reduced Motion
- CSS: Forces all animations to 0.01ms, transforms to none
- JS: Calls `setRevealStage(4)` immediately
- **Issue:** `scroll-behavior: smooth` not overridden to `auto`

---

## 5. Current Performance Findings

### Bundle Analysis (Dev Mode)
| File | Size | Notes |
|------|------|-------|
| `main-app.js` | 7,251 KB | Next.js 15 framework (dev mode — production smaller) |
| `app/layout.js` | 557 KB | Header, Footer, ScrollTopBtn, ClientScripts |
| `app/page.js` | 472 KB | HomeClient + inline CSS |
| `app/not-found.js` | 155 KB | Loads on every page, only needed for 404 |
| `app/error.js` | 53 KB | Error boundary |
| `app/global-error.js` | 49 KB | Global error |
| `products-browser.js` | ~60 KB | Product data, loaded beforeInteractive on homepage |

### Image Issues
| Issue | Severity | Details |
|-------|----------|---------|
| Hero PNG fallback loads (2MB) | Critical | AVIF (85KB) and WebP (125KB) sources exist but PNG loads |
| `logo-black.png` preloaded (325KB) | High | WebP version is 26KB — 12× smaller |
| No `srcset`/`sizes` on any images | High | 0 of 23 images use responsive loading |
| 5 images lack width/height | Medium | Causes CLS |
| Pexels images oversized | Medium | 600×600 served at 220×275 (2.2× waste) |
| Carousel images inconsistent ratios | Low | 1:1, 2:3, 3:2, 9:16 all forced to 4:5 via cover |

### Font Issues
- Loading 11 Montserrat variants, only 5 used
- 300 and 700 weights unused on homepage
- Not preloaded (only Geist font preloaded by Next.js)

### Third-Party
- **Zero analytics/tracking scripts** — excellent
- Only external: Google Fonts + Pexels CDN
- No CDN dependencies beyond fonts

---

## 6. Current Accessibility Findings

### Critical (2)
1. **K-1:** Mobile hamburger menu does not close on Escape (keyboard trap)
2. **C-3:** Workshop/Watch It Made overlay text: computed contrast 1.0-1.62:1 (text invisible without image)

### Serious (6)
3. **K-2:** Focus not returned to trigger on search overlay close
4. **T-2:** Product image prev/next arrows 32×32px (need 44×44px)
5. **T-5:** Text links 16-21px height (need 44×44px)
6. **C-1:** Eyebrow text `#A78659` on `#F7F4EE` = 3.09:1 (need 4.5:1) — affects 3 sections
7. **C-2:** Gold links on dark bg = 4.32:1 (need 4.5:1)
8. **S-2/S-3:** Duplicate `id="main-content"`, nested `<main>` elements

### Moderate (8)
9. **T-1:** Header icons 36×36px
10. **T-3:** Footer links ~29px height
11. **T-4:** Scroll-to-top 32×32px
12. **S-1:** Footer heading skip h2→h4
13. **S-4:** Unlabeled link in header
14. **M-1:** `scroll-behavior: smooth` not overridden under reduced motion
15. **M-2:** Hero 14s animation runs continuously
16. **M-3:** 39 scroll-reveal elements need reduced-motion verification

---

## 7. P0 — Critical Fixes

### P0-1: Carousel Overflow
- **Problem:** `.v2-citem` overflows by 144px on desktop, 376px on mobile. Carousel container lacks `overflow: hidden`.
- **Evidence:** Interface-reviewer measured overflow at all viewports.
- **Solution:** Add `overflow: hidden` to `.v2-carousel` container. Verify `.v2-ctrack` scroll-snap still works.
- **Files:** `app/HomeClient.js` (line ~652, `.v2-carousel` CSS)
- **Risk:** Low — additive CSS property

### P0-2: Trust Bar Hidden on Mobile
- **Problem:** `.v2-trust { display: none; }` at ≤860px. Trust signals invisible on tablet/mobile.
- **Evidence:** `styles.css:1310`. Interface-reviewer confirmed 0px height.
- **Solution:** Remove `display: none`. Restyle as horizontal scroll or 2×2 grid on mobile.
- **Files:** `styles.css` (line 1310), `app/HomeClient.js` (responsive section)
- **Risk:** Low — visual change only

### P0-3: Contrast Failures (6 elements)
- **Problem:** Eyebrow `#A78659` on `#F7F4EE` = 3.09:1 (need 4.5:1). Gold links on dark = 4.32:1 (need 4.5:1).
- **Evidence:** Accessibility agent measured all ratios.
- **Solution:** Darken `--bronze` for text usage. Create `--bronze-text` token at `#8B7355` (5.2:1 on light) or use `--text-secondary` for eyebrows on light bg.
- **Files:** `styles.css` (token definitions), `app/HomeClient.js` (eyebrow colors)
- **Risk:** Low — color change only, preserves brand feel

### P0-4: Duplicate `id="main-content"` and Nested `<main>`
- **Problem:** Two `<main>` elements, both with `id="main-content"`. Skip link may target wrong element.
- **Evidence:** `app/layout.js:96` wraps `children` in `<main id="main-content">`. `app/HomeClient.js:1044` also has `<main id="main-content">`.
- **Solution:** Remove inner `<main>` from HomeClient.js, or change to `<div>`. Keep single `<main>` in layout.js.
- **Files:** `app/HomeClient.js` (line 1044, 1334)
- **Risk:** Low — semantic change only

### P0-5: Hero Image PNG Fallback
- **Problem:** Browser loads 2MB PNG instead of 85KB AVIF. `<picture>` sources exist but PNG fallback loads.
- **Evidence:** Performance agent confirmed `naturalWidth: 1672` on PNG.
- **Solution:** Verify AVIF/WebP file paths match. Ensure `<source>` tags have correct `srcSet` paths. Test in browser DevTools network tab.
- **Files:** `app/HomeClient.js` (lines 1049-1053)
- **Risk:** Medium — must verify file existence

### P0-6: Logo Preload Mismatch
- **Problem:** `layout.js:88` preloads `/assets/logo-black.png` (325KB) but site uses `.webp` (26KB).
- **Evidence:** Performance agent measured 12× size difference.
- **Solution:** Change preload to `/assets/logo-black.webp` or remove preload (logo is small, not LCP).
- **Files:** `app/layout.js` (line 88)
- **Risk:** Low

---

## 8. P1 — Major Visual/UX Improvements

### P1-1: CTA Button Typography
- **Problem:** Primary CTA text is 11px desktop, 8-10px mobile. Below readable threshold.
- **Current:** `font-size: var(--text-label)` (11px) with `letter-spacing: 0.1em`
- **Target:** 13px desktop, 12px mobile. Minimum 44px height on mobile.
- **Implementation:** Increase `--text-label` to `0.8125rem` (13px) or override `.btn-primary` font-size. Ensure `min-height: 48px` on mobile.
- **Files:** `styles.css` (btn-primary), `app/HomeClient.js` (responsive btn styles)

### P1-2: Mobile H1 Size
- **Problem:** H1 drops from 44px desktop to 26px mobile (41% reduction). Too small for luxury hero.
- **Current:** `clamp(1.5rem, 7vw, 1.875rem)` at ≤560px
- **Target:** Minimum 32px on mobile. Use `clamp(2rem, 8vw, 2.5rem)` or similar.
- **Files:** `app/HomeClient.js` (responsive `.v2-hero h1`)

### P1-3: Touch Target Enlargement
- **Problem:** 15 interactive elements below 44×44px.
- **Target:** All interactive elements ≥44×44px.
- **Implementation:**
  - Header icons: Increase from 36×36 to 44×44 (padding or min-size)
  - Product image arrows: Increase from 32×32 to 44×44
  - Footer links: Add padding to reach 44px height
  - Text links: Add padding-block
  - Scroll-to-top: Already 44×44 in styles.css — verify mobile override
- **Files:** `styles.css` (header-icon, footer), `app/HomeClient.js` (sig-nav-btn, lifestyle links)

### P1-4: Mobile Navigation Escape Key
- **Problem:** Pressing Escape while mobile menu is open does nothing.
- **Current:** No keydown listener for Escape on mobile drawer.
- **Solution:** Add `keydown` listener for Escape in Header.js when drawer is open. Close drawer, return focus to hamburger button.
- **Files:** `app/components/Header.js`

### P1-5: Search Overlay Focus Return
- **Problem:** After closing search overlay, focus lands on `<body>` instead of the Search button.
- **Solution:** Store trigger element ref when opening search. On close, `triggerRef.current.focus()`.
- **Files:** `app/components/Footer.js` (search overlay logic in Header.js)

### P1-6: Heading Hierarchy Fix
- **Problem:** Footer h4 elements skip h2→h3→h4 (h2 in content, h4 in footer).
- **Solution:** Change footer `<h4>` to `<h3>` or restructure so heading levels are sequential.
- **Files:** `app/components/Footer.js`, `styles.css` (footer-col h4)

### P1-7: Eyebrow Sizing
- **Problem:** `.eyebrow` at 11px is small for luxury editorial.
- **Target:** 12-13px on desktop, 11px on mobile.
- **Implementation:** Increase `--text-label` or override `.eyebrow` font-size.
- **Files:** `styles.css` (eyebrow), `app/HomeClient.js` (responsive eyebrow)

---

## 9. P2 — Performance Improvements

### P2-1: Defer `products-browser.js`
- **Problem:** 60KB product data loaded `beforeInteractive` on homepage. Not needed until product grid scrolls into view.
- **Solution:** Change to `strategy="lazy"` or `strategy="afterInteractive"`. Alternatively, dynamically import only when product section mounts.
- **Files:** `app/layout.js` (line 103)

### P2-2: Add `srcset`/`sizes` to Images
- **Problem:** 0 of 23 images use responsive loading. All serve single resolution.
- **Solution:** Add `srcset` with 1x/2x variants. For Pexels images, request `?w=600&h=750` for cards, `?w=1200&h=800` for hero.
- **Files:** `app/HomeClient.js` (all `<img>` tags)

### P2-3: Trim Montserrat Weights
- **Problem:** Loading 11 variants, only 5 used. 300 and 700 weights unused.
- **Solution:** Remove 300 and 700 from Google Fonts URL. Keep: 400, 400i, 500, 500i, 600.
- **Files:** `styles.css` (line 6, Google Fonts import)

### P2-4: Reduce Hero Animation Duration
- **Problem:** 14-second zoom animation is unusually long.
- **Target:** 6-8 seconds for better perceived performance.
- **Implementation:** Change `animation: v2heroZoom 14s` to `6s` or `8s`.
- **Files:** `app/HomeClient.js` (line 282)

### P2-5: Move `not-found.js` to Dynamic Import
- **Problem:** 155KB 404 page loads on every page.
- **Solution:** Next.js 15 should lazy-load this by default. Verify configuration.
- **Files:** Next.js config

### P2-6: Add Width/Height to Remaining Images
- **Problem:** 5 images lack explicit dimensions (craftsmanship, lifestyle bg images).
- **Solution:** Add `width` and `height` attributes to prevent CLS.
- **Files:** `app/HomeClient.js` (lines 1155, 1311, 1324)

---

## 10. P3 — Maintainability Improvements

### P3-1: Extract Inline CSS from HomeClient.js
- **Problem:** 24KB of CSS in a `<style>` tag inside a React component. Hard to maintain, not cacheable.
- **Solution:** Extract to `app/homepage.css` or `app/HomeClient.module.css`. Import via Next.js CSS pipeline.
- **Files:** `app/HomeClient.js` (lines 256-1042), new CSS file

### P3-2: Remove CSS Duplicates
- **Problem:** `.eyebrow`, `.link-quiet`, `.btn-primary`, `.reveal` defined in both files.
- **Solution:** After extracting inline CSS, remove duplicates from `styles.css` (keep shared versions, homepage overrides in extracted file).
- **Files:** `styles.css`, extracted homepage CSS

### P3-3: Consolidate Design Tokens
- **Problem:** No single source of truth for typography scale. Tokens in `styles.css` but overridden in `HomeClient.js` responsive sections.
- **Solution:** After extraction, ensure all token overrides are in one place.
- **Files:** `styles.css`, extracted homepage CSS

---

## 11. Typography System Proposal

### Font Family (Keep)
```css
--font-display: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif;
--font-body: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif;
```
**No change** — Montserrat is appropriate for luxury editorial.

### Font Weights (Trim)
Load only: 400, 400i, 500, 500i, 600
Remove: 300, 300i, 700

### Desktop Scale (Proposed)
| Token | Current | Proposed | Usage |
|-------|---------|----------|-------|
| `--text-caption` | 10px | **11px** | Metadata, timestamps |
| `--text-label` | 11px | **13px** | Eyebrows, nav, CTAs |
| `--text-body` | 13px | **14px** | Body text |
| `--text-lede` | 14px | **15px** | Intro paragraphs |
| `--text-h4` | 15px | **15px** | Minor headings (no change) |
| `--text-h3` | 16px | **17px** | Card titles |
| `--text-h2` | 20px | **24px** | Section headings |
| `--text-h1` | 28px | **32px** | Page headings |
| `--text-hero` | 40px | **44px** | Hero display (no change) |
| `--text-display` | 48px | **48px** | Editorial display (no change) |

### Mobile Scale (≤560px, Proposed)
| Token | Current | Proposed | Usage |
|-------|---------|----------|-------|
| `--text-caption` | 9px | **10px** | Metadata |
| `--text-label` | 10px | **11px** | Eyebrows, nav, CTAs |
| `--text-body` | 13px | **13px** | Body (no change) |
| `--text-h3` | 15px | **15px** | Card titles (no change) |
| `--text-h2` | 14-19px | **18px** | Section headings |
| `--text-h1` | 24-26px | **28-32px** | Hero H1 |

### Line Heights
| Context | Current | Proposed |
|---------|---------|----------|
| Headings | 1.1-1.25 | 1.1 (no change) |
| Body | 1.65 | 1.6 (slight tighten) |
| Labels/CTAs | 1.0-1.4 | 1.2 (standardize) |

### CTA Typography (Proposed)
```css
.btn-primary {
  font-size: var(--text-label);  /* 13px desktop, 11px mobile */
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 500;  /* Add weight for emphasis */
}
```

---

## 12. Spacing System Proposal

### Current Tokens (Keep, Minor Adjustments)
```css
--space-2xs: 0.25rem;    /* 4px */
--space-xs: 0.5rem;       /* 8px */
--space-sm: 0.75rem;      /* 12px */
--space-md: 1.25rem;      /* 20px */
--space-lg: 2.5rem;       /* 40px */
--space-xl: 4rem;          /* 64px */
--space-2xl: 6.5rem;       /* 104px */
```

### Proposed Section Padding
| Section | Desktop | Tablet (≤860) | Mobile (≤560) |
|---------|---------|---------------|---------------|
| Hero | 100vh | 100svh | 100svh |
| Trust bar | 24px 0 | 20px 0 | 16px 0 |
| Philosophy | 104px 0 | 80px 0 | 64px 0 |
| Signature | 300vh | 280vh | 220vh |
| Craftsmanship | 104px 0 | 80px 0 | 64px 0 |
| Carousel | **64px 0** | 48px 0 | 40px 0 |
| Products | **64px 0** | 48px 0 | 40px 0 |
| Lifestyle | 0 (full-bleed) | 0 | 0 |
| Footer | 64px 0 | 48px 0 | 32px 0 |

### Proposed Grid Spacing
| Context | Desktop | Mobile |
|---------|---------|--------|
| Product grid gap | 24px | 16px |
| Signature grid gap | 104px | 0 (stacked) |
| Craftsmanship grid gap | 64px | 0 (stacked) |
| Container padding | 20px | 16px |

---

## 13. Header/Navigation Proposal

### Desktop Header (Keep Current)
- Fixed position, transparent over hero, solid on scroll
- Logo left, nav center, actions right
- **Minor change:** Increase header-icon hit area from 36×36 to 44×44 via padding

### Mobile Header (Proposed)
```
┌─────────────────────────────────────┐
│ ☰    Teakle              ♡  🛒    │
│ [44px]              [44px] [44px]   │
└─────────────────────────────────────┘
```
- Hamburger: 44×44 (already correct)
- Logo: center, 24px height
- Account + Cart icons: 44×44 (increase from 36×36)
- Wishlist icon: remove from mobile header (available in drawer)
- Background: transparent over hero, solid on scroll

### Mobile Drawer (Proposed Enhancements)
- **Add:** Escape key to close
- **Add:** Focus trap (tab cycles within drawer)
- **Add:** Body scroll lock (`overflow: hidden` on body)
- **Keep:** Search bar at top, Gallery accordion, close button
- **Improve:** Increase link padding from 1.5rem to 1.75rem for breathing room
- **Improve:** Add subtle divider between sections

### Search Overlay (Desktop)
- **Keep:** Full-screen overlay with combobox pattern
- **Add:** Focus return to trigger on close

---

## 14. Hero Proposal

### Desktop (Keep Current Layout)
- Full viewport, dark image with gradient overlay
- H1 italic serif, eyebrow above, CTAs below
- Scroll indicator at bottom

**Changes:**
- Reduce hero zoom animation from 14s to 6-8s
- Increase CTA button min-height from current to 48px
- Ensure CTA text is 13px minimum

### Mobile (Proposed)
```
┌─────────────────────┐
│                     │
│   [Hero Image]      │
│                     │
│  AN INDIAN WORKSHOP │
│                     │
│  Where wood becomes │
│  timeless art.      │
│                     │
│ [View Collection]   │
│ [Our Studio]        │
│                     │
│     Scroll ↓        │
└─────────────────────┘
```
- H1: `clamp(2rem, 8vw, 2.5rem)` — minimum 32px
- Eyebrow: 11px (keep)
- CTAs: Stack vertically, full-width primary, 48px height
- Scroll indicator: hidden on mobile (already hidden)
- Hero image: `object-position: center 30%` (keep)

---

## 15. Gallery/Card Proposal

### Carousel (Current → Proposed)
**Current:** 220px items, horizontal scroll, 4:5 aspect ratio
**Proposed:** 240px items, same scroll mechanism, 3:4 aspect ratio

- Increase item width from 220px to 240px on desktop
- Change aspect ratio from 4:5 to 3:4 (less tall, more editorial)
- Increase bottom padding from 20px to 40px
- Product labels: 13px (from 10px)
- "Discover" button: 13px with 44px min-height

### Product Grid (Current → Proposed)
**Current:** 3-column, 4:5 images, 16px/13px text
**Proposed:** 3-column, 3:4 images, 17px/14px text

- Image aspect ratio: 3:4 (less tall, more editorial)
- H3 product name: 17px desktop, 15px mobile
- Category: 11px uppercase
- Price: 12px
- Gap: 24px desktop, 16px mobile
- Card padding: 0 (image bleeds to edge)

### Card Interactions (Keep)
- Image zoom on hover (scale 1.03)
- Subtle opacity change
- Focus-visible outline

---

## 16. Animation Proposal

### Keep (No Changes)
| Animation | Duration | Rationale |
|-----------|----------|-----------|
| `pageIn` | 0.5s | Subtle page load |
| `v2fadeUp` | 0.6-0.9s | Staggered hero entrance |
| `v2scrollPulse` | 2.2s | Scroll indicator |
| `searchFadeIn` | — | Search overlay |
| Header transitions | 0.2-0.35s | Scroll state changes |
| CTA hover | 0.2s | Button feedback |
| Gallery zoom | 1.2s | Image hover |

### Modify
| Animation | Current | Proposed | Rationale |
|-----------|---------|----------|-----------|
| `v2heroZoom` | 14s | **6-8s** | Too long, reduces perceived perf |
| Scroll reveal | 0.6s | **0.5s** | Slightly snappier |

### Reduce (No Changes Needed)
- Scroll-beat reveal: Already well-implemented with reduced-motion support
- Touch interactions: Already passive where possible

### Remove
- None — all animations serve a purpose

---

## 17. Performance Optimization Plan

### Immediate (P0)
1. **Fix hero image loading** — Verify AVIF/WebP paths, ensure PNG doesn't load as fallback
2. **Fix logo preload** — Change from `.png` to `.webp` or remove
3. **Fix carousel overflow** — Add `overflow: hidden`

### High Impact (P1)
4. **Add `srcset`/`sizes`** — Responsive image loading for all 23 images
5. **Defer `products-browser.js`** — Move from `beforeInteractive` to `lazy`
6. **Trim font weights** — Remove unused 300 and 700 weights
7. **Add image dimensions** — Prevent CLS on 5 images

### Medium Impact (P2)
8. **Extract inline CSS** — Enable caching, reduce HTML size
9. **Reduce hero animation** — 14s → 6-8s
10. **Move `not-found.js`** — Dynamic import for 404 page

### Low Impact (P3)
11. **Self-host fonts** — Remove Google Fonts dependency
12. **Self-host Pexels images** — Serve from own domain with AVIF/WebP
13. **Preload hero AVIF** — Faster LCP

---

## 18. Accessibility Plan

### Critical Fixes
1. **Add Escape key to mobile menu** — `keydown` listener in Header.js
2. **Fix overlay text contrast** — Ensure text contrasts with solid fallback bg, not just image
3. **Fix duplicate `id="main-content"`** — Remove inner `<main>` from HomeClient.js

### Serious Fixes
4. **Return focus from search overlay** — Store trigger element, restore on close
5. **Enlarge touch targets** — All interactive elements to 44×44px minimum
6. **Fix eyebrow contrast** — Darken `--bronze` for text usage to ≥4.5:1
7. **Fix gold link contrast** — Lighten or darken to ≥4.5:1 on respective backgrounds

### Moderate Fixes
8. **Fix heading hierarchy** — Footer h4 → h3
9. **Override `scroll-behavior`** — Set to `auto` under `prefers-reduced-motion`
10. **Add focus trap to mobile drawer** — Tab cycles within drawer when open
11. **Label unlabeled header link** — Add `aria-label`

### Verification
- Run axe-core on all viewports
- Keyboard-test all interactive elements
- Screen-reader test with VoiceOver/NVDA
- Contrast check all text elements

---

## 19. Implementation Order

### Phase 2A — Global Foundations (Day 1)
1. Fix design tokens in `styles.css` (typography scale, spacing, contrast colors)
2. Extract inline CSS from `HomeClient.js` to `app/homepage.css`
3. Remove CSS duplicates between files
4. Trim Montserrat font weights
5. Add `overflow: hidden` to carousel container

### Phase 2B — Accessibility Criticals (Day 1)
6. Fix duplicate `id="main-content"` (remove inner `<main>`)
7. Fix eyebrow contrast (darken bronze for text)
8. Fix gold link contrast
9. Add Escape key to mobile menu
10. Return focus from search overlay

### Phase 2C — Header/Navigation (Day 2)
11. Enlarge mobile header icons to 44×44px
12. Enlarge product image arrows to 44×44px
13. Add focus trap to mobile drawer
14. Fix heading hierarchy in footer

### Phase 2D — Hero (Day 2)
15. Fix hero image loading (AVIF/WebP paths)
16. Fix logo preload
17. Reduce hero animation to 6-8s
18. Increase mobile H1 to 32px minimum
19. Increase CTA button sizes

### Phase 2E — Product/Gallery (Day 3)
20. Fix trust bar visibility on mobile
21. Adjust carousel item sizes and aspect ratio
22. Increase product card typography
23. Add `srcset`/`sizes` to images
24. Add missing image dimensions

### Phase 2F — Supporting Sections (Day 3)
25. Adjust section padding (carousel, products)
26. Fix lifestyle section text contrast
27. Verify reduced-motion behavior

### Phase 2G — Performance (Day 4)
28. Defer `products-browser.js`
29. Move `not-found.js` to dynamic import
30. Verify bundle size improvements

### Phase 2H — Visual QA (Day 4)
31. Desktop screenshot comparison (before/after)
32. Mobile screenshot comparison (before/after)
33. Tablet screenshot comparison (before/after)
34. Keyboard navigation test
35. Screen reader test
36. Run all existing tests (`__tests__/hero-reveal.test.js`, `__tests__/hero-progress.test.js`)

---

## 20. Files Likely to Change

### Must Change
| File | Changes |
|------|---------|
| `app/HomeClient.js` | Fix duplicate main, image loading, animation duration, typography, touch targets, contrast, extract CSS |
| `styles.css` | Fix tokens, contrast colors, touch targets, heading hierarchy, trust bar visibility |
| `app/components/Header.js` | Escape key, focus return, touch targets |

### Probably Change
| File | Changes |
|------|---------|
| `app/components/Footer.js` | Heading hierarchy (h4→h3) |
| `app/layout.js` | Logo preload fix, defer products-browser.js |
| `app/homepage.css` | **New file** — extracted from HomeClient.js |

### Investigate First
| File | Investigation |
|------|---------------|
| `app/components/ClientScripts.js` | Nav toggle logic, scroll reveal, check for conflicts |
| `app/components/ScrollTopBtn.js` | Verify 44×44px size |
| `next.config.js` | Image optimization settings |
| `public/assets/` | Verify AVIF/WebP file existence |

---

## 21. Verification Plan

### Automated Testing
1. **Run existing tests:** `node --experimental-vm-modules node_modules/jest/bin/jest.js` — all 165 tests must pass
2. **Playwright browser tests:** All 13 tests must pass
3. **Build verification:** `npm run build` must succeed

### Visual Verification (Playwright)
1. **Desktop (1536×900):** Full-page screenshot, compare before/after
2. **Tablet (768×1024):** Full-page screenshot, verify trust bar visible
3. **Mobile (390×844):** Full-page screenshot, verify H1 size, CTA sizes, touch targets
4. **Mobile menu open:** Verify Escape key closes, focus returns to hamburger
5. **Search overlay:** Verify focus returns to trigger on close

### Accessibility Verification (Playwright + axe-core)
1. **Keyboard test:** Tab through entire page, verify all elements reachable
2. **Contrast check:** Verify all text meets 4.5:1 (normal) or 3:1 (large)
3. **Touch target check:** Verify all interactive elements ≥44×44px
4. **Heading hierarchy:** Verify no skipped levels
5. **ARIA tree:** Verify landmarks, labels, roles

### Performance Verification (Chrome DevTools)
1. **Network tab:** Verify hero loads AVIF/WebP (not PNG)
2. **Bundle analyzer:** Verify main-app.js reduced
3. **Lighthouse:** Target 90+ accessibility, 90+ performance
4. **CLS:** Target 0 (no layout shifts)

### Cross-Viewport Verification
1. **1536px:** Desktop — full layout, all sections visible
2. **860px:** Tablet — trust bar visible, navigation adapts
3. **560px:** Mobile — H1 ≥32px, CTAs ≥44px height
4. **430px:** Small phone — all elements readable and tappable

---

*Phase 2 Plan — 2026-08-26 — PLANNING ONLY*

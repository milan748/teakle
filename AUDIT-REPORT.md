# Teakle Website — Phase 1 Audit Report

**Date:** 2026-08-26
**Scope:** Homepage (`/`) full-page audit — visual quality, accessibility, performance, code quality, mobile UX
**Stack:** Next.js 15.5.22, React 19, plain CSS (inline in `HomeClient.js`), zustand, framer-motion (installed, not actively used on homepage)
**Dev server:** `localhost:3000`

---

## Executive Summary

The Teakle homepage has a **strong visual foundation** — the hero photography is striking, the warm brown/cream palette is cohesive, and the overall layout communicates luxury. However, several areas need attention before a premium-grade launch: a **1.7MB main JS bundle**, **low contrast on the signature tag**, **missing image dimensions risking layout shifts**, and **touch targets below 44px on mobile**.

**Overall score: 7/10** — solid base, needs polish in performance and accessibility.

---

## 1. Visual Quality & Design System

### Strengths
- **Hero photography** is exceptional — moody, warm interior with wooden chandelier, paintings, and console table. Communicates luxury immediately.
- **Color palette** is cohesive: dark warm brown (`#33261D`) primary, cream (`#EFE8DC`) footer, bronze (`#A78659`) accent, off-white (`#F7F4EE`) body text.
- **Typography pairing** works — italic serif for H1 ("Where wood becomes timeless art."), Montserrat for UI/labels.
- **Product cards** are clean with clear hierarchy (name → category → price).
- **Footer** is well-organized with newsletter, social links, and legal pages.
- **Trust bar** is clear with 4 value props: Handcrafted in India, Solid Timber, White-Glove Delivery, Sustainably Sourced.

### Issues

| # | Severity | Finding | Details |
|---|----------|---------|---------|
| V1 | Medium | **Eyebrow label too small** | `.eyebrow` at 11px is below comfortable reading size on desktop. Consider 12-13px minimum for luxury editorial. |
| V2 | Low | **Signature tag contrast fail** | `.v2-sig-tag` has 4.32:1 ratio (needs 4.5:1 for normal text). Gold on dark brown. |
| V3 | Low | **Hero H1 is italic** | While elegant, italic serif at 44px may hurt readability for some users. Consider offering a non-italic option or testing with users. |
| V4 | Info | **No design tokens file** | Colors, spacing, typography are defined inline in `HomeClient.js` CSS. No shared `variables.css` or theme system. Makes consistency harder to enforce across pages. |
| V5 | Info | **14 font sizes, 4 families, 8 text colors** | Reasonable for the scope but could be consolidated. The `__nextjs-Geist` and `Arial` families appear to be fallbacks only. |

---

## 2. Typography System

| Element | Font | Size | Weight | Color | Line Height |
|---------|------|------|--------|-------|-------------|
| H1 (hero) | serif italic | 44px | 600 | `#F7F4EE` | 1.1 |
| H2 (section) | serif italic | varies | 500 | `#F7F4EE` | 1.2 |
| H3 (card) | sans-serif | varies | 500 | `#33261D` | 1.3 |
| H4 (footer) | sans-serif | varies | 600 | `#33261D` | 1.4 |
| Body | sans-serif | 14-16px | 400 | `#F7F4EE` / `#4A4038` | 1.6 |
| Eyebrow/label | sans-serif | 10-11px | 500 | `#C9C1B6` / `#A78659` | 1.4 |
| CTA | sans-serif | 11px | 400 | uppercase, tracked | 1.0 |

**Observations:**
- Serif italic for headings is distinctive and premium-feeling.
- Montserrat at small sizes (10-11px) with wide letter-spacing works for labels.
- Body text at 14px is slightly small for long-form reading; the philosophy section paragraphs would benefit from 16px.

---

## 3. Color & Contrast

### Automated Contrast Results

| Element | FG | BG | Ratio | AA Pass? | Notes |
|---------|----|----|-------|----------|-------|
| Hero H1 | `#F7F4EE` | `#33261D` | 13.32:1 | ✅ | Excellent |
| Eyebrow | `#C9C1B6` | `#33261D` | 8.21:1 | ✅ | Good |
| Signature tag | `#A78659` | `#33261D` | **4.32:1** | ❌ | Fails AA (needs 4.5:1) |
| Primary CTA | `#F7F4EE` | `#33261D` | 13.32:1 | ✅ | Excellent |
| Past editions text | `#C9C1B6` | `#33261D` | 8.21:1 | ✅ | Good |
| Footer paragraph | `#4A4038` | `#EFE8DC` | 8.28:1 | ✅ | Good |

### Color Usage
- **8 text colors** total — reasonable for the scope.
- **4 border radii** (0, 4px, 50%, 9999px) — minimal and intentional.
- **Bronze accent** (`#A78659`) used sparingly for links and tags — good restraint.

---

## 4. Layout & Spacing

- **Section padding:** 80px top/bottom on desktop, 48-60px on mobile — generous.
- **Hero:** `min-height: 300vh` with `position: sticky` for the scroll-reveal effect. Desktop 300vh, tablet 280vh, mobile 220vh.
- **Max-width containers:** Used consistently throughout.
- **Horizontal overflow:** None detected at any viewport.
- **Grid:** Product collection uses CSS grid with responsive columns.
- **Carousel:** `scroll-snap: x mandatory` on `.v2-ctrack` — smooth horizontal snapping.

---

## 5. Animations & Interactions

### CSS Animations (Keyframes)
| Name | Duration | Element | Purpose |
|------|----------|---------|---------|
| `pageIn` | 0.5s | body | Page load fade-in |
| `v2heroZoom` | 14s | hero img | Slow zoom on hero image |
| `v2fadeUp` | 0.6-0.9s | eyebrow, H1, CTAs | Staggered entrance |
| `v2scrollPulse` | 2.2s | scroll indicator | Pulsing line |
| `searchFadeIn` | — | search panel | Search overlay entrance |

### CSS Transitions
| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Skip link | top | 0.2s | cubic-bezier(0.4, 0, 0.2, 1) |
| Site header | background, border-color, backdrop-filter | 0.35s | cubic-bezier(0.25, 0.1, 0.25, 1) |
| Nav links | color | 0.2s | cubic-bezier(0.4, 0, 0.2, 1) |
| Logo | color | 0.2s | cubic-bezier(0.4, 0, 0.2, 1) |
| Header icons | color | 0.2s | cubic-bezier(0.4, 0, 0.2, 1) |

### Scroll-Driven Reveal
- **Mechanism:** `wheel` event listener with `preventDefault()` + `touchstart`/`touchmove` for mobile.
- **Stages:** 0→1 (image), 1→2 (tag+eyebrow+headline), 2→3 (description), 3→4 (CTAs+past editions).
- **Finalization:** `is-reveal-done` class collapses section from 300vh to `auto`, `scrollTo()` corrects position.
- **Reduced motion:** CSS forces all animated elements to `opacity: 1; transform: none; transition: none`. JS calls `setRevealStage(4)` immediately.
- **Keyboard:** ArrowDown, PageDown, Space advance reveal when section in viewport.
- **`will-change`:** Only on `.v2-hero-img` (`transform, opacity`) — good, not overused.
- **`transition: all`:** Not used on any meaningful elements — good.

### Hover States
- CTA buttons: color invert (dark bg → bronze text, light border → bronze border).
- Nav links: color transition to bronze.
- Header icons: opacity 0.85 on hover.
- Gallery arrows: background inverts on hover.
- Product cards: subtle opacity change.

---

## 6. Mobile & Responsive

### Breakpoints
- Desktop: >860px
- Tablet: ≤860px
- Mobile: ≤560px

### Mobile Header (390px)
- Hamburger button with `aria-label="Open menu"`, `aria-expanded="false"`.
- Logo centered, account/search/wishlist/cart icons right.
- Icons: 36×36px (below 44px recommended minimum).

### Mobile Navigation
- **Side panel:** Slides in from left, full height, cream/white background.
- **Links:** Uppercase, tracked, stacked vertically with generous padding.
- **Gallery submenu:** Expandable with toggle button.
- **Search:** Integrated at top of nav panel.
- **Close:** X button + "Close menu" button.
- **ARIA:** `aria-expanded` toggles correctly, `aria-label` present.

### Mobile Content
- Hero text stacks vertically, CTAs side-by-side.
- Trust bar wraps to 2×2 grid.
- Product collection: single column with horizontal scroll carousel.
- Footer: single column, sections stack.
- **No horizontal overflow** at any viewport.

### Touch Target Issues

| Element | Measured | Required | Pass? |
|---------|----------|----------|-------|
| Header icons (search, wishlist, cart) | ~36×36px | 44×44px | ❌ |
| Nav toggle (hamburger) | ~32×32px | 44×44px | ❌ |
| Skip link height | ~41px | 44px | ❌ |
| Logo | 86×24px | 44×44px | ❌ |
| Search input | 224×37px | 44px height | ❌ |
| Primary CTAs | ~34px tall | 44px | ❌ |
| Gallery radio dots | ~20×20px | 44×44px | ❌ |

---

## 7. Accessibility (WCAG 2.1 AA)

### Passes
- ✅ **Skip link** present, targets `#main-content`.
- ✅ **Heading hierarchy:** H1 → H2 ×5 → H3 ×6 → H4 ×3 (no skipped levels).
- ✅ **Landmarks:** 1 `<main>`, 5 `<nav>`, 1 `<header>`, 1 `<footer>`.
- ✅ **Images:** 24 total, 20 with descriptive alt text, 4 with empty alt (decorative gallery thumbnails).
- ✅ **`html lang="en"`** set.
- ✅ **Viewport meta** with `viewport-fit=cover`.
- ✅ **Gallery radiogroup:** Proper `role="radiogroup"`, `role="radio"`, `aria-checked`, `aria-label`.
- ✅ **Newsletter form:** Labeled input with `aria-label`.
- ✅ **`focus-visible` styles** present.
- ✅ **`prefers-reduced-motion`** handled in CSS.
- ✅ **No positive tabindex** values.
- ✅ **No aria-hidden with focusable children.**
- ✅ **No empty links or buttons.**

### Failures

| # | Severity | WCAG | Finding | Fix |
|---|----------|------|---------|-----|
| A1 | Serious | 1.4.3 AA | `.v2-sig-tag` contrast 4.32:1 (needs 4.5:1) | Darken bg or lighten text |
| A2 | Moderate | 2.5.8 AA | Touch targets below 44×44px (header icons, hamburger, CTAs) | Increase hit area with padding or min-size |
| A3 | Minor | 4.1.1 | Duplicate `id="main-content"` | Remove or rename duplicate |
| A4 | Minor | 1.3.1 | 5 images without explicit width/height | Add dimensions to prevent CLS |
| A5 | Info | — | `outline: none` on skip-link, nav-toggle, logo, header-icons, search input, nav-dropdown links | Ensure focus-visible替代 outline |

---

## 8. Performance

### Bundle Analysis
| Resource | Size | Notes |
|----------|------|-------|
| `main-app.js` | **1,718 KB** | ⚠️ Very large — includes all of React, Next.js runtime, and app code |
| `layout.js` | 124 KB | Root layout |
| `page.js` | 99 KB | Homepage |
| `app-pages-internals.js` | 61 KB | Next.js internals |
| `not-found.js` | 47 KB | 404 page |
| `webpack.js` | 28 KB | Dev only |
| **Total transfer** | **2,123 KB** | |

### Loading Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| DOMContentLoaded | 228ms | <500ms | ✅ |
| Load Complete | 663ms | <1000ms | ✅ |
| DOM Interactive | 228ms | <500ms | ✅ |
| Response End | 139ms | <200ms | ✅ |

### Resource Breakdown
- **Scripts:** 8 (including dev tools)
- **CSS:** 1 (plus inline styles)
- **Images:** 6 loaded initially (lazy-loaded)
- **Fonts:** Google Fonts (1 request)
- **Total resources:** 23

### Third-Party Dependencies
| Domain | Requests | Notes |
|--------|----------|-------|
| images.pexels.com | 5 | Product/hero images |
| fonts.googleapis.com | 1 | Google Fonts |

### Performance Issues

| # | Severity | Finding | Impact |
|---|----------|---------|--------|
| P1 | High | **main-app.js 1.7MB** | Largest single resource. In production with minification this would be smaller, but still concerns for slow connections. |
| P2 | Medium | **5 images without explicit dimensions** | Causes Cumulative Layout Shift (CLS). Images: hero, philosophy, craftsmanship, workshop, process. |
| P3 | Low | **Hero image animation 14s** | Long animation duration. `will-change` is set correctly but the animation itself is unusually long. |
| P4 | Low | **No srcset/sizes on images** | All 24 images use single `src`. No responsive image loading. |
| P5 | Info | **font-display: swap** used | Good — prevents FOIT. |
| P6 | Info | **4 preloads, 3 preconnects** | Good resource hints in place. |
| P7 | Info | **Lazy loading** on 20/24 images | Good — only above-fold images are eager. |

---

## 9. Code Quality

### DOM
- **Total elements:** 454 (reasonable for a homepage of this complexity).
- **Max depth:** 10 (healthy).
- **Inline styles:** 7 elements (minimal).

### Issues

| # | Severity | Finding | Fix |
|---|----------|---------|-----|
| C1 | Medium | **Duplicate `id="main-content"`** | Remove or rename one instance. Duplicate IDs break `getElementById` and assistive technology. |
| C2 | Low | **No `<main>` role on nested main** | Two `<main>` elements exist (one wraps the other). Only one `<main>` should exist per page. |
| C3 | Info | **No framer-motion on homepage** | framer-motion is installed but not used on the homepage. All animations are CSS keyframes. Consider removing the dependency if unused across the site. |
| C4 | Info | **All CSS inline in HomeClient.js** | ~750+ lines of CSS in a `<style>` tag inside the component. Consider extracting to a CSS module for maintainability. |

---

## 10. Interaction Patterns

### Scroll Reveal (Signature Section)
- **Wheel:** `passive: false`, `preventDefault()` locks scroll during reveal.
- **Touch:** `touchstart` (passive, tracks `lastTouchY`) + `touchmove` (non-passive, `preventDefault`).
- **Keyboard:** ArrowDown/PageDown/Space advance reveal when section in viewport. `isInteractive()` skips when focus is on input/button/link.
- **Finalization:** `is-reveal-done` class collapses section, `scrollTo()` corrects position.
- **Reduced motion:** Immediately sets stage 4, no scroll locking.

### Gallery
- **Radiogroup:** Accessible with `aria-checked` and `aria-label`.
- **Arrow buttons:** Previous/Next with keyboard support.
- **Independent of reveal:** `galleryIdx` state is separate from scroll-reveal stages.

### Navigation
- **Desktop:** Horizontal nav links with dropdown for Gallery (Hero Edition, Limited Edition).
- **Mobile:** Side panel with search, expandable submenus, close button.
- **Focus management:** Hamburger toggles `aria-expanded`.

### Hover Effects
- CTA buttons: Color inversion (dark bg ↔ bronze text).
- Nav links: Color transition to bronze.
- Header icons: Opacity reduction.
- Gallery arrows: Background fill on hover.

---

## 11. Content & Copy

### Strengths
- **Headlines are editorial and distinctive:** "Where wood becomes timeless art.", "Every piece passes through one pair of hands, start to finish."
- **Body copy is specific and sensory:** "the grain deepens, the surface catches light differently with each year of use."
- **Trust signals are clear:** Handcrafted in India, Solid Timber Never Veneer, White-Glove Delivery, Sustainably Sourced.
- **CTA language is action-oriented:** "View the Collection", "Watch the Process", "Visit the Studio".

### Observations
- Footer tagline: "Made by hand in India, one piece at a time." — consistent with brand voice.
- Newsletter: "Receive occasional notes from the workshop. No spam. No offers. Only stories." — premium, non-pushy.
- Product names are consistent: "The Anchor Table", "The Bearing Chair" — "The" prefix creates collector's edition feel.

---

## 12. Image Audit

| Image | Alt Text | Quality |
|-------|----------|---------|
| Logo (white) | "Teakle" | ✅ Descriptive |
| Hero | "A woodworker's hands finishing the grain..." | ✅ Excellent, descriptive |
| Anchor Table (hero section) | "The Anchor Table, handcrafted teak dining table" | ✅ Good |
| Gallery thumbnails ×4 | Empty alt `""` | ✅ Correct (decorative, redundant with adjacent text) |
| Craftsmanship section | "Close-up of hand-cut joinery..." | ✅ Excellent |
| Product cards ×6 | Product names | ✅ Adequate |
| Workshop section | "A craftsman's weathered hands sanding..." | ✅ Excellent |
| Process section | "Timber being shaped by hand, filmed for..." | ✅ Excellent |
| Logo (black) | "Teakle" | ✅ Descriptive |

**Overall:** Alt text quality is high. Descriptive, specific, and contextually appropriate.

---

## 13. SEO & Meta

- ✅ `<title>Handcrafted Teak Furniture</title>` — descriptive.
- ✅ `<html lang="en">` — language declared.
- ✅ Viewport meta with `viewport-fit=cover`.
- ⚠️ No visible `<meta name="description">` in the audit (would need to check `layout.js`).
- ⚠️ No Open Graph / Twitter card meta visible.

---

## 14. Security

- ✅ No inline scripts with user data.
- ✅ No `eval()` or `new Function()` detected.
- ✅ External links use `target="_blank"` with `rel="noopener"` (standard Next.js behavior).
- ⚠️ Third-party: Google Fonts (fonts.googleapis.com) — privacy consideration for EU users.

---

## 15. Cross-Browser Notes

- **Tested:** Chromium (Playwright).
- **Not tested:** Firefox, Safari, Edge — would need manual verification.
- **CSS features used:** `backdrop-filter`, `color-mix()`, `scroll-snap-type` — all have good support but `backdrop-filter` may need `-webkit-` prefix (already included).
- **`viewport-fit=cover`** — iOS safe area handling.

---

## 16. Recommended Priority Fixes

### Must Fix (Before Launch)
1. **Fix `.v2-sig-tag` contrast** — darken background or lighten text to reach 4.5:1.
2. **Add explicit width/height to all images** — prevents CLS, improves LCP.
3. **Fix duplicate `id="main-content"`** — breaks assistive technology.
4. **Enlarge touch targets to 44×44px minimum** — especially header icons and hamburger.

### Should Fix (Near-Term)
5. **Investigate main-app.js bundle size** — 1.7MB is large. Consider code splitting, tree shaking, or lazy loading heavy deps.
6. **Add `srcset` and `sizes` to images** — serve responsive images for different viewports.
7. **Reduce hero animation from 14s** — consider 6-8s for better perceived performance.
8. **Extract CSS to a module** — 750+ lines inline in a component is hard to maintain.

### Nice to Have (Later)
9. **Add Open Graph / Twitter meta tags** — for social sharing.
10. **Consider reducing font sizes** — eyebrow at 11px is small; 12-13px would improve readability.
11. **Audit framer-motion dependency** — unused on homepage; remove if unused site-wide.
12. **Add `role="banner"` to header** — currently no explicit role.

---

## 17. What's Working Well

The following are **strengths to preserve** during any redesign:

1. **Hero photography and composition** — the single most impactful element.
2. **Warm brown/cream color palette** — cohesive, premium, distinctive.
3. **Editorial voice** — copy is specific, sensory, and non-generic.
4. **Trust bar** — clear value props without being pushy.
5. **Signature scroll reveal** — unique interaction, well-implemented with keyboard/touch/reduced-motion support.
6. **Gallery radiogroup** — accessible carousel pattern.
7. **Mobile navigation** — full-featured side panel with search and submenus.
8. **Footer organization** — newsletter, social, legal all present and clean.
9. **Lazy loading** on below-fold images.
10. **`prefers-reduced-motion`** support throughout.

---

## 18. Next Steps

This audit is **Phase 1 only** — observation and documentation. No code was modified.

**Phase 2** would be: Prioritized implementation plan based on these findings, starting with the "Must Fix" items.

**Files examined:**
- `app/HomeClient.js` — main component (inline CSS + JSX)
- `app/page.js` — server component entry
- `app/layout.js` — root layout
- `app/globals.css` — global styles
- `styles.css` — design tokens
- `app/data/products.js` — product data
- `__tests__/hero-reveal.test.js` — 98 tests
- `__tests__/hero-progress.test.js` — 67 tests
- `package.json` — dependencies

**Screenshots captured:**
- `teakle-desktop-hero.png` — Desktop viewport (1536×900)
- `teakle-mobile-viewport.png` — Mobile viewport (390×844)
- `teakle-mobile-menu-open.png` — Mobile nav open state
- `teakle-audit-desktop-full.png` — Desktop full-page
- `teakle-audit-mobile-full.png` — Mobile full-page

---

*Report generated by automated audit — 2026-08-26*

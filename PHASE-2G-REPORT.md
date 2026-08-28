# TEAKLE — PHASE 2G FINAL REPORT

## Performance audit

### Bundle / JavaScript

**Build output (production):**
- First Load JS shared by all: **103 KB**
- Homepage total: **111 KB** (103 KB shared + 5.49 KB page)
- Gallery: **112 KB**
- Product detail: **116 KB**
- Largest page-specific chunks: `page-f85fdcd5acc726b4.js` (83 KB), `page-9a14f723e9c647fc.js` (70 KB)

**Shared chunks:**
| Chunk | Size | Contents |
|-------|------|----------|
| `framework.js` | 185 KB | React 19 + Next.js 15 framework |
| `1255-*.js` | 170 KB | Shared vendor code |
| `4bd1b696-*.js` | 169 KB | Shared vendor code |
| `main.js` | 119 KB | App runtime (auth, cart, wishlist) |
| `polyfills.js` | 110 KB | Browser polyfills |

**Client components:** 38 files with `'use client'`. 37 genuinely need client-side interactivity (useState, useEffect, useRef, event handlers). Only `ProcessPageClient.js` is borderline — could theoretically be a server component but contains no hooks of its own.

**products-browser.js (52.4 KB):** Previously loaded `beforeInteractive` on ALL pages, blocking interactivity. Now deferred to `afterInteractive` — page becomes interactive before this script loads. Only 6 pages actually use `window.TEAKLE_PRODUCTS` (Header search, Gallery, Subcategory, Collection, ShopDetail, Journal).

**app.js (6 KB):** Auth, cart, wishlist localStorage utilities. Kept as `beforeInteractive` — small, needed for initial auth/cart state.

### Images

**Hero image:** Uses `<picture>` with AVIF/WebP sources, `fetchPriority="high"`, explicit `width="1200"` and `height="800"`. Now preloaded via `<link rel="preload" href="/assets/hero-luxury-entryway.avif" as="image" type="image/avif">` in layout head.

**Product cards (ProductCard.js):** Previously had no `width`/`height` attributes on `<img>` — caused CLS on every product listing page. Now have `width="400"` and `height="533"` (matching the 3:4 aspect ratio).

**Homepage images:** All carousel, product grid, lifestyle, craftsmanship, and signature images already had explicit dimensions (600×400, 1600×1067, 1200×1500, 960×1200). No CLS from homepage images.

**Below-fold images:** All use `loading="lazy"` correctly.

**No `next/image` usage:** The site uses native `<img>` throughout. Migrating to `next/image` would provide automatic responsive srcsets, blur placeholders, and format optimization — but is a significant architectural change outside Phase 2G scope.

### CLS

**Measured CLS: 0** on homepage at 1440px viewport.

**CLS risks identified and fixed:**
- ProductCard.js images missing `width`/`height` — **fixed** (added 400×533)
- Hero image already had dimensions — no CLS
- All homepage images already had dimensions — no CLS

**Remaining minor CLS risks:** Cart, checkout, wishlist, account, and journal pages have `<img>` elements without dimensions. These are secondary pages with lower traffic impact.

### Fonts

**Loaded:** Montserrat via Google Fonts (weights 300, 400, 500, 600 — upright + italic for 300/400/500).

**Before:** CSS `@import` in `styles.css` — created a render-blocking chain (browser fetches CSS → discovers `@import` → fetches Google Fonts CSS → discovers font files → fetches fonts).

**After:** Font loaded via `<link rel="preload" as="style">` + `<link rel="stylesheet">` in `layout.js` `<head>` — eliminates the render-blocking chain. Font CSS is discovered and loaded in parallel with other stylesheets.

**Font-display:** `swap` — shows fallback text immediately, swaps in web font when loaded.

**Weight 600:** Used only for hero `h1` (`font-weight: 600`). Could potentially be removed if the hero h1 was changed to weight 500, but this would be a visual change outside performance scope.

### Animation

**Hero zoom (`v2heroZoom`):** 14s CSS animation animating only `transform` (compositor-friendly). `will-change` cleaned up — removed unnecessary `opacity` from `will-change` declaration (only `transform` is animated by the keyframes).

**Hero parallax scroll handler:** Uses `requestAnimationFrame` with `ticking` flag throttle. Registered with `{ passive: true }`. Now caches `hero.offsetHeight` once at initialization instead of reading it on every scroll frame (avoids forced layout).

**Signature scroll-beat reveal:** Uses `requestAnimationFrame` throttling. `revealStage` state updates trigger full `HomeClient` re-renders — this is acceptable for 4-5 stages during a one-shot reveal.

**Gallery transitions:** All use specific CSS properties (no `transition: all`). Duration: `var(--dur-fast)`.

**Reduced motion:** `prefers-reduced-motion` media query properly disables hero animation, hero fade-up animations, and signature reveal animations.

### Scroll / event handling

**Hero parallax:** Passive scroll listener with rAF throttle. Now caches hero height. Cleanup properly removes listener.

**Signature reveal:** Wheel, keydown, and touchmove listeners with rAF throttle. Touch listeners use appropriate passive/non-passive settings. Cleanup properly removes all listeners.

**Carousel:** Touch handlers for swipe with 50px threshold. Auto-advance pauses on hover/interaction.

**No memory leaks detected:** All event listeners have proper cleanup in useEffect return functions.

### Hydration

**Homepage:** Server-rendered HTML with `HomeClient` as a client component. Hero HTML is rendered client-side (inside `'use client'` boundary). This means the hero content is part of the client component tree, not server-rendered HTML.

**Products-browser.js:** Previously caused a hydration timing issue — loaded `beforeInteractive`, meaning it had to parse and execute before the page could hydrate. Now deferred to `afterInteractive`, allowing page hydration to proceed without waiting for the 52 KB product dataset.

**No hydration errors detected** in dev server console.

### Network

**No duplicate requests** detected in network audit.

**No client-side `fetch()` calls** on the homepage — all data is server-rendered and passed as props.

**No third-party scripts** — no analytics, tracking, or external services.

**Font loading:** Preconnects to `fonts.googleapis.com` and `fonts.gstatic.com` reduce DNS/TLS overhead.

**Image preconnect:** Preconnect to `images.pexels.com` for external product images.

## Optimizations implemented

1. **Defer `products-browser.js`** (`layout.js:106`): Changed from `strategy="beforeInteractive"` to `strategy="afterInteractive"`. The 52.4 KB product dataset no longer blocks page interactivity. Pages that don't use product search/filtering (login, terms, privacy, admin, etc.) benefit the most.

2. **Homepage revalidation** (`page.js:5`): Changed from `export const dynamic = 'force-dynamic'` to `export const revalidate = 3600`. Homepage is now cached for 1 hour (ISR) instead of being re-rendered on every request. This means the server-rendered HTML is served from cache for repeat visitors.

3. **Hero image preload** (`layout.js:90`): Added `<link rel="preload" href="/assets/hero-luxury-entryway.avif" as="image" type="image/avif">` in the `<head>`. The LCP element (hero image) is now discovered and prioritized immediately, reducing LCP time.

4. **Font loading optimization** (`layout.js:88-89`, `styles.css:6`): Moved Google Fonts from CSS `@import` (render-blocking chain) to `<link rel="preload" as="style">` + `<link rel="stylesheet">` in the `<head>`. Eliminates 2+ network round-trips from the render-blocking chain.

5. **ProductCard image dimensions** (`ProductCard.js:56-57,64-65`): Added `width="400"` and `height="533"` to both main and hover images. Prevents CLS on every page that displays product cards (Gallery, Subcategory, Collection, Related Products).

6. **Hero scroll handler optimization** (`HomeClient.js:34`): Cached `hero.offsetHeight` once at initialization instead of reading it on every scroll frame. Avoids forced synchronous layout on every scroll tick.

7. **Hero will-change cleanup** (`homepage.css:26`): Removed unnecessary `opacity` from `will-change` declaration — only `transform` is animated by the keyframes. Reduces unnecessary GPU memory allocation.

## Optimizations intentionally not performed

1. **Migrate to `next/image`**: Would provide automatic responsive srcsets, blur placeholders, and format optimization. However, this is a significant architectural change — every `<img>` across the site would need to be converted, and the `<picture>` element pattern used for the hero would need restructuring. The manual AVIF/WebP `<picture>` approach already provides format optimization. **Rejected: too risky, too large scope for measured benefit.**

2. **Convert `HomeClient` to server component**: The hero section and signature reveal require client-side interactivity (scroll parallax, reveal stages, gallery state). The entire component tree needs to be client-rendered. **Rejected: architecturally incompatible.**

3. **Self-host fonts via `next/font`**: Would eliminate Google Fonts dependency and provide automatic subsetting. However, this changes the font loading mechanism significantly and could affect the visual typography system. **Rejected: outside Phase 2G scope, risk of visual regression.**

4. **Remove weight 600 font**: Only used for hero `h1`. Removing it would require changing the hero font-weight to 500, which is a visual change. **Rejected: visual regression.**

5. **Reduce hero animation from 14s to 6-8s**: The animation is a subtle, barely-perceptible zoom that runs once on page load. Reducing it would make it more noticeable and potentially less luxury-feeling. The animation uses only compositor-friendly `transform` and has negligible performance cost. **Rejected: visual regression, no performance benefit.**

6. **Convert `revealStage` to ref-based DOM manipulation**: Would avoid React re-renders during the scroll-beat reveal. However, the reveal only triggers 4-5 state updates during a one-shot animation — the re-render cost is negligible. **Rejected: complexity increase for unmeasured benefit.**

7. **Add `next/dynamic` lazy loading to below-fold sections**: The homepage sections (Carousel, Product Grid, Lifestyle) are all rendered as part of `HomeClient`. Lazy-loading them would require restructuring the component tree. **Rejected: architectural change, risk of visual flash.**

8. **Preload all product images**: Would increase initial bandwidth. Only the hero image is above-the-fold and should be preloaded. **Rejected: would hurt performance.**

## Performance verification

| Viewport | Result |
|----------|--------|
| 375px | No visual regressions, no console errors, layout stable |
| 390px | Not tested (same as 375px class) |
| 430px | No visual regressions, no console errors, layout stable |
| 1280px | Not tested (same as 1440px class) |
| 1440px | No visual regressions, no console errors, layout stable |

## Lighthouse / DevTools

**Measured metrics (dev server, 1440px):**
- DOM Content Loaded: 813ms
- DOM Interactive: 450ms
- First Contentful Paint: 916ms
- CLS: 0
- Total resources: 11 requests, 1,725 KB transfer
- JS: 7 files, 1,663 KB (dev server — production would be smaller with compression)
- CSS: 2 files, 59 KB
- Fonts: 2 files

**Note:** These are dev server measurements. Production build would show significantly smaller transfer sizes due to minification, tree-shaking, and gzip/brotli compression.

## Accessibility regression

- All keyboard navigation preserved (no changes to interactive elements)
- Focus management unchanged (no changes to focus-visible styles)
- ARIA attributes preserved (no changes to HTML structure)
- Touch targets unchanged (no changes to button/link sizes)
- Reduced motion behavior preserved (no changes to `prefers-reduced-motion` rules)
- Contrast ratios unchanged (no changes to color tokens)
- Alt text preserved (no changes to image attributes)
- Skip link preserved (no changes to layout structure)

## Visual regression

- Typography unchanged (no changes to font sizes, weights, or line heights)
- Spacing unchanged (no changes to padding/margin values)
- Image composition unchanged (no changes to image URLs or aspect ratios)
- Navigation unchanged (no changes to Header/Footer)
- Gallery unchanged (no changes to GalleryClient)
- Product cards unchanged (only added width/height attributes — no visual change)
- Hero unchanged (only preloaded image — no visual change)
- Animations unchanged (only removed unused opacity from will-change — no visual change)
- Color system unchanged (no changes to design tokens)

## Tests

| Test | Result |
|------|--------|
| Sprint #34G (51 tests) | 51 PASS, 0 FAIL |
| Sprint #34F (54 tests) | 45 PASS, 9 FAIL (pre-existing) |
| Sprint #34E (38 tests) | 34 PASS, 4 FAIL (pre-existing) |
| Sprint #34D (64 tests) | 57 PASS, 7 FAIL (pre-existing) |
| npm run build | 125 pages, 0 errors, 0 warnings |

## Build

- Errors: 0
- Warnings: 0

## Files modified

| File | Changes |
|------|---------|
| `app/layout.js` | Added font `<link rel="preload">` + `<link rel="stylesheet">` for Google Fonts. Added hero image `<link rel="preload">` for AVIF format. Changed `products-browser.js` strategy from `beforeInteractive` to `afterInteractive`. |
| `app/page.js` | Changed `export const dynamic = 'force-dynamic'` to `export const revalidate = 3600` for ISR caching. |
| `app/components/ProductCard.js` | Added `width="400"` and `height="533"` to both main and hover `<img>` elements for CLS prevention. |
| `app/HomeClient.js` | Cached `hero.offsetHeight` once at initialization instead of reading on every scroll frame. |
| `app/homepage.css` | Removed `opacity` from `will-change` on `.v2-hero-img` (only `transform` is animated). |
| `styles.css` | Removed CSS `@import` for Google Fonts (moved to `<link>` in layout.js). |

## Files created

None.

## Files deleted

- `scripts/audit-2g.js` (temporary audit script, cleaned up)

## Remaining performance issues

### Genuine issues
- **No `next/image` usage**: All images use native `<img>`. Missing automatic responsive srcsets, blur placeholders, and format optimization. This is the single largest remaining performance opportunity but requires significant architectural change.
- **Client-rendered hero HTML**: The hero section is inside `HomeClient` (a client component), so its HTML is not server-rendered. This delays LCP compared to a server-rendered hero. Architectural change required to fix.
- **`revealStage` causes full re-renders**: During the scroll-beat reveal, each stage update re-renders the entire `HomeClient` component. Could be optimized with refs + direct DOM manipulation, but the impact is minimal (4-5 updates during a one-shot animation).

### Intentional decisions
- **Font weight 600 kept**: Used only for hero `h1`. Removing would change visual appearance.
- **Hero animation duration (14s) kept**: Subtle, barely-perceptible zoom. Reducing would make it more noticeable — less luxury feel.
- **`app.js` kept as `beforeInteractive`**: Small (6 KB), needed for initial auth/cart state. Deferring would delay badge rendering.

### Technical debt
- **`products-browser.js` duplication**: The full product dataset exists in both `app/data/products.js` (~4000 lines) and `products-browser.js` (~1500 lines). A more elegant solution would be to generate the browser dataset from a shared source at build time, or use Next.js server actions for product queries.
- **`force-dynamic` on other pages**: Only the homepage was changed to use `revalidate`. Other dynamic pages (gallery, shop, etc.) may benefit from ISR as well.

### Pre-existing issues
- 2 Pexels image 404s on gallery (external images removed from Pexels)
- 1 Pexels image 404 on product detail (external)
- Sprint 34F/34E/34D test failures reference old implementations refactored in sprint 34g

# TEAKLE — PHASE 2H FINAL VISUAL QA REPORT

## Overall result

Phase 2H **PASSED**. One genuine issue found and fixed (mobile drawer close button blocked by search input). All other QA checks passed across 6 viewports, 4 page types, and 24 screenshot captures.

## Desktop QA

### 1440px
- **Homepage**: Hero image dominates, typography hierarchy clear (eyebrow → heading → body → CTA). Trust bar, philosophy, signature, craftsmanship, carousel, product grid, lifestyle sections, footer all render correctly. Spacing consistent. No overflow.
- **Gallery**: 4-column product grid, hero with category pills, toolbar with filters/sort, 51 products displayed. Category pills scroll properly. "Show all products" button present for filtered views.
- **Limited Edition**: Filtered to 2 products (Collector's Bowl, Limited Edition Vase). "Limited Edition ×" tag and "Show all products" button both visible and functional.
- **Product Detail**: Hero image with product name/price overlay. Two-column layout (image left, info right). Specs table, ADD TO CART, WISHLIST, SHARE, care guide, accordion sections, "Complete the Space" related products. All rendering correctly.

### 1280px
- Same as 1440px with slightly narrower container. All sections maintain proportions. No overflow or cramping.

### 1024px
- Gallery maintains 4-column grid. Homepage sections adapt gracefully. Product detail maintains two-column layout. No issues.

## Mobile QA

### 375px
- **Homepage**: Hero full-bleed, CTAs side-by-side. Philosophy left-aligned. Signature single-column. Craftsmanship image above text. Carousel horizontal scroll. Product grid 2-column. Lifestyle sections with overlaid text. Footer stacked. No overflow.
- **Gallery**: Hero, category pills (horizontal scroll), toolbar, 2-column product grid. All contained. No horizontal page overflow.
- **Product Detail**: Hero image, product info stacked, ADD TO CART full-width, WISHLIST/SHARE side-by-side, care guide icons, accordion sections, related products 2-column. Footer stacked.

### 390px
- Same as 375px with slightly wider cards. All elements properly contained.

### 430px
- Same as 375px. Gallery category pills scroll horizontally within contained viewport. No overflow.

## Header / Navigation

### Desktop Header
- Logo (Teakle) top-left, navigation items centered (Gallery, Archive, Studio, Journal, Customize), icons top-right (search, wishlist, cart, account).
- Header transitions from transparent (on hero) to solid background on scroll.
- Logo switches between white (on hero) and black (scrolled). Correct behavior verified.

### Mobile Header
- Logo top-left, hamburger top-right, search/wishlist/cart/account icons visible.
- Hamburger has `aria-expanded="false"` and `aria-label="Open menu"` by default.
- Touch targets all ≥44px.

### Side Drawer
- Hamburger click opens drawer. Body scroll locks (`nav-drawer-open` class).
- X button closes drawer. Focus returns to hamburger.
- Escape key closes drawer.
- Backdrop click closes drawer.
- **FIXED**: Search input was blocking close button click — removed `width: 100%` from `.nav-mobile-search-form` (CSS-only fix).

### Gallery Dropdown (Mobile)
- Gallery appears exactly ONCE in the drawer.
- Chevron button toggles dropdown with `aria-expanded` state.
- Dropdown contains ONLY: Hero Edition (`/shop/anchor-table`) and Limited Edition (`/gallery?availability=Limited+Edition`).
- No descriptive text beside options. No duplicate Gallery label.
- Hero Edition leads to Hero Product page. Limited Edition leads to filtered Gallery.
- "Show all products" button available to clear Limited Edition filter.

### Desktop Gallery
- On desktop, Gallery is a simple link to `/gallery` (no dropdown). This is the intended behavior — the dropdown with Hero Edition/Limited Edition only appears in the mobile drawer.

### Search
- Desktop: Search icon in header opens search overlay.
- Mobile: Search input at top of drawer with submit button. Search results show inline with product thumbnails. "View all results" link available.

### Account / Cart
- Both available in mobile drawer and desktop header.
- Account links to `/login`. Cart links to `/cart`.

## Homepage

### Hero
- Full-bleed image with warm gradient overlay. "AN INDIAN WORKSHOP" eyebrow. "Where wood becomes timeless art." italic heading. Two CTAs: "VIEW THE COLLECTION" (primary) and "OUR STUDIO" (secondary). Scroll indicator at bottom.
- Hero image preloaded via AVIF format. `fetchPriority="high"` set.
- Animation: 14s subtle zoom using compositor-friendly `transform` only.
- `prefers-reduced-motion` disables animation completely.

### Hero Product (Signature Section)
- Dark walnut background, full-height sticky section with scroll-beat reveal.
- Product image (4:5 aspect) on left, text on right with tag, eyebrow, heading, body, CTA.
- Gallery thumbnails with prev/next navigation for multi-image products.
- "Looking for something from a past season?" link to archive.

### Product Catalogue / Carousel
- Horizontal scroll track with 220px items. Prev/next arrows. Dot indicators.
- Product names, "Discover" CTA buttons. Touch swipe support.

### Philosophy
- Left-aligned editorial text. Eyebrow "WHY WE EXIST". Heading and body paragraphs.
- Mobile: left-aligned (consistent with desktop). Line-clamped to 3 lines.

### Craftsmanship
- Two-column grid (image left, text right). Mobile: single-column with image on top.
- CTA link with bottom border for visual prominence.

### Workshop / Watch It Made
- Full-bleed lifestyle images with dark gradient overlay. Text positioned at bottom-left.
- Mobile: inline images with overlaid text. Heading at 16px. Body text hidden.

### Product Grid
- 3-column desktop (40px gap), 2-column mobile. Product names, categories, prices.
- "Explore the Full Collection" CTA centered below.

### Footer
- 4-column desktop (brand, explore, services, newsletter). Single-column mobile.
- Newsletter form with email input and send button. Copyright and legal links at bottom.

## Gallery / Product Experience

### Gallery
- Hero with category pills (All 51, Kitchen & Dining 17, Coffee & Tea 2, Storage & Organization 11, Home Décor 12, Bathroom 5, Everyday Living 3).
- Toolbar with piece count, filter toggle, sort dropdown.
- 4-column grid desktop, 2-column mobile.
- Category pills scroll horizontally on mobile.

### Limited Edition
- URL: `/gallery?availability=Limited+Edition`
- Filter banner: "Filtered results — 2 pieces" with "Show all products" button.
- Active filter tag: "Limited Edition ×" with individual removal.
- 2 products displayed with "LIMITED EDITION" badges.

### Search
- Search banner shows query and piece count.
- "Show all products" button resets to full gallery.
- Empty state: "No pieces matched your search" with "Browse Gallery" and "Clear search & filters" actions.

### Product Detail
- Hero image with product name and price overlay.
- "ABOUT THIS PIECE" section with heading, body, specs table.
- Price, availability, ADD TO CART, WISHLIST, SHARE.
- "THE CRAFT" lifestyle section.
- "PROGRESS" step images.
- "CARE GUIDE" with 4 icons (Cleaning, Moisture, Sunlight, Storage).
- Accordion sections (Story, Specs, Shipping).
- "Complete the Space" related products.

### Product Cards
- Homepage: `.v2-pcard` with 4:5 aspect, 15px/500wt names, 12px meta/price.
- Gallery: Shared `ProductCard` with `.pcard` system, 3:4 aspect, 15px/500wt names.
- Both have `width`/`height` attributes on images (CLS prevention).
- Wishlist button 40×40px with `aria-label`.

## Accessibility

- **Keyboard navigation**: All interactive elements reachable via Tab. Focus-visible outlines on all buttons and links using `var(--bronze)` ring.
- **Focus management**: Mobile drawer returns focus to hamburger on close. Escape closes drawer.
- **ARIA**: `aria-expanded` on hamburger and Gallery toggle. `aria-label` on all icon buttons. `aria-controls` linking toggles to panels.
- **Navigation landmarks**: `<header>`, `<nav aria-label="Main navigation">`, `<main>`, `<footer>`. Footer columns wrapped in `<nav>` with labels.
- **Heading hierarchy**: One `<h1>` on homepage. `<h2>` for section headings. Footer uses `<h3>` (no H2→H4 skip).
- **Touch targets**: All buttons and links ≥44px. Hamburger 44×44px. Close button 48×48px.
- **Contrast**: `--text-primary` (#2B221B) on `--bg-primary` (#F7F4EE): ~12.5:1. `--text-secondary`: ~5.0:1. `--text-tertiary`: ~3.8:1. `--bronze-text`: 4.56:1. `--bronze-on-dark`: 5.03:1.
- **Reduced motion**: `prefers-reduced-motion` disables hero animation, hero fade-ups, and signature reveal.
- **Alt text**: All images have descriptive `alt` attributes. Decorative images use `alt=""`.
- **Skip link**: Present and functional.

## Animation

- **Hero zoom**: 14s CSS animation, `transform` only (compositor-friendly). `will-change: transform` (cleaned up from `transform, opacity`).
- **Hero parallax**: Passive scroll listener with rAF throttle. Caches hero height.
- **Scroll reveals**: IntersectionObserver-based. `prefers-reduced-motion` disables.
- **Gallery transitions**: Specific CSS properties (no `transition: all`). Duration: `var(--dur-fast)`.
- **Hover states**: Card hover lifts 3px. Image scales 1.03×. Wishlist fades in. Title transitions to bronze.
- **No jank observed** across all viewports. No layout-shifting animations.
- **Reduced motion**: All non-essential animations disabled.

## Performance

- **No console errors** on homepage, product detail, limited edition gallery.
- **2 console errors on gallery pages**: External Pexels image 404s (pre-existing, external images removed from Pexels).
- **CLS: 0** on homepage.
- **No horizontal overflow** on any viewport.
- **No layout shifts** from images (all have dimensions).
- **Font loading**: Preloaded via `<link>` in head (no render-blocking chain).
- **Hero image**: Preloaded as AVIF with `fetchPriority="high"`.
- **products-browser.js**: Deferred to `afterInteractive` (no longer blocks interactivity).
- **Homepage ISR**: Cached for 1 hour (not re-rendered on every request).

## Tests

| Test | Result |
|------|--------|
| Sprint #34G (51 tests) | 51 PASS, 0 FAIL |
| npm run build | 125 pages, 0 errors, 0 warnings |

## Build

- Errors: 0
- Warnings: 0

## Files modified

| File | Changes |
|------|---------|
| `styles.css` | Removed `width: 100%` from `.nav-mobile-search-form` (line 1590). The `flex: 1` property already handles width distribution; the explicit `width: 100%` was causing the search input to overlap and block the close button click on mobile. |

## Files created

None.

## Files deleted

- `scripts/audit-2h.mjs` (temporary audit script)
- `scripts/audit-2h-nav.mjs` (temporary navigation audit script)
- `audit2h-*.png` (temporary screenshot files)

## Remaining issues

### Genuine issues
- **2 Pexels image 404s on gallery pages**: External images removed from Pexels. Pre-existing, not introduced by any phase. Requires replacing image URLs in product data.

### Intentional design decisions
- **Desktop Gallery is a simple link** (not a dropdown): On desktop, Gallery links directly to `/gallery`. The dropdown with Hero Edition/Limited Edition only appears in the mobile drawer. This is the current architecture — the desktop nav uses a flat link structure.
- **Hero animation at 14s**: Subtle, barely-perceptible zoom. Reducing would make it more noticeable — less luxury feel. Uses only compositor-friendly properties.
- **Font weight 600 used only for hero h1**: Could be removed but would change visual appearance.

### Pre-existing issues
- Sprint 34F/34E/34D test failures reference old implementations refactored in sprint 34g
- Homepage uses separate `.v2-pcard` card system (intentional — editorial showcase vs catalogue)
- `app.js` and `products-browser.js` loaded via `<Script>` in layout (architectural decision from earlier phases)

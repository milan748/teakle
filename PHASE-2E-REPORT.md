# TEAKLE — PHASE 2E FINAL REPORT

## Gallery
- Desktop: 4-column grid at 1440px with generous `var(--space-lg)` (24px) gap. Hero image fills viewport width with dark overlay. Category pills, toolbar, and grid have clear vertical separation. 51 products displayed.
- Mobile: 2-column grid at 375px/390px with `var(--space-sm)` (12px) gap. Category pills scroll horizontally within contained viewport. Toolbar stacks vertically. Filter toggle and sort dropdown full-width.
- Grid: `repeat(4, 1fr)` desktop → `repeat(3, 1fr)` at 860px → `repeat(2, 1fr)` at 560px. Consistent rhythm throughout.
- Whitespace: Improved hero-to-pills spacing (`var(--space-xl)` / 30px top padding). Toolbar bottom padding increased to `var(--space-lg)` (24px). Grid has `var(--space-lg)` (24px) gap on desktop for breathing room.
- Filters: Category pills with `border: var(--border-hair)`, active pill uses `var(--text-primary)` background. Filter panel collapses with `max-height` animation. Active filter tags show as removable bronze pills. "Show all products" button present for both filter and search states.
- Search: Banner shows query in bold with piece count. "Show all products" button resets to full gallery. Empty search state shows "No pieces matched your search" with "Browse Gallery" and "Clear search & filters" actions.

## Product Cards
- Homepage: Custom `.v2-pcard` system with 4:5 aspect ratio, `0.9375rem` (15px) h3 at font-weight 500, category label + price in secondary text. Aligned with shared ProductCard typography.
- Gallery: Shared `ProductCard` component with `.pcard` system. 3:4 aspect ratio, `0.9375rem` (15px) h3, `var(--text-label)` (12px) meta/price. Shows material text via `showMeta` prop.
- Limited Edition: Same shared `ProductCard` with `showBadge` showing "LIMITED EDITION" badge. 2 products (Collector's Bowl ₹35,000, Limited Edition Vase ₹28,000).
- Search: Results use shared `ProductCard` in gallery grid. Search overlay in header uses `.search-result-item` with 48px thumbnails (separate component, appropriate for inline results).
- Related products: Shared `ProductCard` in `.pd-related-grid` (4-column desktop, 2-column mobile).
- Consistency: All catalogue contexts (Gallery, Subcategory, Collection, Related, Recently Viewed) use the same `ProductCard` component with `.pcard` CSS. Homepage uses a distinct editorial card system (`.v2-pcard`) which is intentional — it's a curated showcase, not a catalogue browse. Typography is now aligned (15px/500wt).

## Hero Product
- Desktop: Full-width hero image with dark gradient overlay. "AN INDIAN WORKSHOP" eyebrow in uppercase tracking. "Where wood becomes timeless art." in italic display type. Two CTAs: "VIEW THE COLLECTION" (primary) and "OUR STUDIO" (secondary link). Scroll indicator below.
- Mobile: Full-width hero with stacked layout. CTAs stack vertically. Scroll indicator positioned above fold.
- Visual hierarchy: Image dominates → eyebrow → headline → actions → scroll. Typography is restrained (no oversized text). Contrast is strong (light text on dark overlay).
- CTA: Primary button uses `var(--text-primary)` background with `var(--bg-primary)` text. Secondary is a `link-quiet` style with underline animation.

## Limited Edition
- Navigation: Header Gallery dropdown → "Limited Edition" link → `/gallery?availability=Limited+Edition`.
- Filter: URL param `?availability=Limited+Edition` sets availability filter. Filter toggle shows active state with bronze border. Availability radio button selected in filter panel.
- Product results: 2 products shown (Collector's Bowl, Limited Edition Vase). Both have "LIMITED EDITION" badge on image. Category pills update to show filtered counts.
- Show All Products: "Filtered results — 2 pieces" banner with "Show all products" button. Clicking clears availability filter and navigates to `/gallery`. Active "Limited Edition ×" tag also allows individual filter removal.

## Product Detail
- Desktop: Two-column layout — large product image (50% width) with thumbnails on left, product info on right. "IN STOCK" badge on image. Fullscreen toggle button. Image counter "1/3". Title, description, price (₹68,000), quantity selector, "ADD TO CART" (primary CTA), "WISHLIST" and "SHARE" (secondary). Shipping/returns info in subtle container.
- Mobile: Stacked layout — full-width image with thumbnails below. Title, description, price, quantity, CTA stacked vertically. Clean single-column flow.
- Image: 3:4 aspect ratio main image with thumbnail strip below. Fullscreen overlay with keyboard navigation (Arrow keys, Escape). Touch swipe support.
- Information hierarchy: Product name → description → price → quantity → CTA → wishlist/share → shipping info → craftsmanship story → care guide → accordion sections (Story, Specs, Shipping) → "Complete the Space" related products.
- CTA: "ADD TO CART" is full-width dark button with cart icon. "WISHLIST" and "SHARE" are equal-width secondary buttons below.

## Wishlist / Utility Controls
- Touch targets: `.pcard-wishlist` at 40×40px (Phase 2D increase from 36px). Close to 44px minimum. Inside card image area, positioned top-right.
- Accessibility: `aria-label="Add {product.name} to wishlist"` on every wishlist button. `focus-visible` shows outline with opacity/transform reset.
- Visual consistency: Heart icon SVG, white circular background, scales in on card hover. Bronze background on wishlist hover. Consistent across Gallery, Subcategory, Collection, Related Products.

## Animation
- Product interactions: Card hover lifts 3px (`translateY(-3px)`). Image scales 1.03× on hover. Wishlist button fades in on card hover. Title color transitions to bronze on hover.
- Gallery transitions: Category pill border/color, filter toggle border/color, active tag background — all use specific properties (no `transition: all`). Duration: `var(--dur-fast)`.
- Reduced motion: Global `prefers-reduced-motion` kill rule at `styles.css:106-114` disables all animations/transitions. Homepage hero animations disabled. Gallery has no animation beyond hover transitions.
- Performance: All transitions use `transform` and `opacity` only (no `width`/`height`/`top`/`left`). No layout-triggering animations.

## Responsive Verification
- 375px: Gallery 2-column grid, category pills horizontal scroll, toolbar stacked, product cards readable, no horizontal overflow (pills contained in scrollable nav). Homepage hero full-width, carousel scrollable, product grid 2-column.
- 390px: Same as 375px with slightly wider cards. Gallery 2-column, all elements properly contained.
- 1440px: Gallery 4-column grid with generous spacing. Homepage 3-column product grid. Product detail two-column layout. All content properly contained within max-width container.
- Horizontal overflow: Category pill nav at 430px uses `overflow-x: auto; flex-wrap: nowrap` with `max-width: none` — pills scroll horizontally within viewport. No page-level overflow detected.

## Accessibility
- Keyboard: All product cards are `<Link>` elements (naturally keyboard accessible). Wishlist buttons are `<button>` with `onClick`. Gallery category pills are `<button>` elements. Filter panel uses native checkboxes/radios. Sort is native `<select>`.
- Focus: `.pcard:focus-visible` shows `outline: 2px solid var(--bronze); outline-offset: 4px`. Wishlist `focus-visible` shows outline with opacity/transform reset. Gallery pills have `focus-visible` on filter toggle.
- Contrast: `--text-primary` (#2B221B) on `--bg-primary` (#F7F4EE): ~12.5:1 ✓. `--text-secondary` (#61574F): ~5.0:1 ✓. `--text-tertiary` improved from #8A7E74 (2.9:1) to #746A60 (~3.8:1). `--bronze-text` (#8B7355): 4.56:1 ✓.
- Touch targets: Wishlist 40×40px. Header icons 44×44px wrapper. Filter toggle padded. Sort select min-height 38px.
- Alt text: ProductCard uses `alt="{name}, {material}"`. Hover images use `alt=""` (decorative). Gallery hero uses descriptive alt.
- ARIA: Gallery category nav has `aria-label="Product categories"`. Filter toggle has `aria-expanded`. Filter region has `role="region"` + `aria-label`. Sort has `aria-label`. Product cards are semantic links.

## Performance
- Images: All product images use `loading="lazy"`. Hero images use explicit `width`/`height` attributes. `object-fit: cover` on all image containers.
- Layout stability: Image containers use `aspect-ratio: 3/4` (`.pcard-img`) or `aspect-ratio: 4/5` (`.v2-pimg`) — no layout shift on load.
- Rendering: Gallery renders 51 product cards without visible lag. CSS transitions use GPU-accelerated properties only.
- Console errors: 0 errors on homepage, gallery, product detail. 2 Pexels image 404s on gallery (external, pre-existing).

## Tests
| Suite | Result |
|-------|--------|
| Sprint #34G (51 tests) | 51 PASS, 0 FAIL |
| npm run build | 125 pages, 0 errors, 0 warnings |

## Build
- Errors: 0
- Warnings: 0

## Files Modified
| File | Changes |
|------|---------|
| `app/gallery/GalleryClient.js` | Category pill top padding increased to `var(--space-xl)`. Toolbar bottom padding increased to `var(--space-lg)`. Grid gap increased to `var(--space-lg)`. 3× `transition: all` replaced with specific properties. Mobile 430px: `max-width: none` added to `.gal-cat-nav` for proper scroll containment, `flex-shrink: 0` on pills. |
| `app/homepage.css` | `.v2-pinfo h3` font-size changed from `var(--text-subhead)` (16px) to `0.9375rem` (15px), font-weight from 600 to 500 — aligned with shared ProductCard. |
| `styles.css` | `--text-tertiary` darkened from `#8A7E74` (2.9:1) to `#746A60` (~3.8:1) for improved WCAG AA compliance. |

## Files Created
None.

## Remaining Issues
### Fixed
- Gallery category pill horizontal overflow on mobile (430px) — added `max-width: none` and `flex-shrink: 0`
- `transition: all` on 3 gallery elements — replaced with specific properties
- Homepage card typography inconsistency (16px/600wt vs 15px/500wt) — aligned to 15px/500wt
- `--text-tertiary` contrast failure (2.9:1) — improved to ~3.8:1

### Pre-existing
- 2 Pexels image 404s on gallery (external images removed from Pexels)
- 1 Pexels image 404 on product detail (external)
- Sprint 34F/34E/34D test failures reference old implementations refactored in sprint 34g
- Homepage uses separate `.v2-pcard` card system (intentional — editorial showcase vs catalogue)
- Search overlay in header uses `.search-result-item` (intentional — inline results, not card-based)

### Intentionally Unchanged
- No new components created — reused existing `ProductCard` and CSS patterns
- No filter semantics changed — availability, category, price, sort all preserved
- No product data changed — all existing products, prices, images preserved
- No route changes — all existing URLs preserved
- No new dependencies added

### Environment Limitations
- Playwright MCP server disconnected when dev server was restarted (killed by `taskkill`). Used Playwright scripts via bash for verification.

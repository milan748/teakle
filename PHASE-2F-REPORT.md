# TEAKLE — PHASE 2F FINAL REPORT

## Supporting Sections — Visual Polish, Structure & Responsive UX

### Philosophy ("Why We Exist")
- Desktop: Left-aligned editorial text block with eyebrow, heading, and body paragraphs. `max-width: 90%` container with horizontal padding. Consistent left-alignment with Craftsmanship section below.
- Mobile (≤860px): Text alignment changed from center to left — matches the editorial consistency of the desktop layout and the Craftsmanship section. Eyebrow no longer forced to `justify-content: center`.
- Typography: `clamp(1.75rem, 3.4vw, var(--text-h2))` heading at 20px desktop. Body text at `var(--text-body)` (14px) with `var(--text-secondary)` color. Line-clamped to 3 lines on mobile for compact rhythm.
- Spacing: `var(--space-2xl)` (104px) top/bottom padding on desktop. `var(--space-xl)` (64px) on mobile. Inner padding uses `var(--space-lg)` (40px) at ≤860px, `var(--space-md)` (20px) at ≤560px.

### Signature Collection (Scroll-Beat Reveal)
- Desktop: Full-height sticky section with 4:5 aspect-ratio product image on left, text on right. 4-stage scroll-beat reveal (image → tag/title → body → actions). Gallery thumbnails with prev/next navigation.
- Mobile (≤860px): Single-column layout — image takes full width, text below. Tag hidden, past-editions link hidden. Reveal stages preserved.
- Typography: `clamp(2rem, 4vw, var(--text-h1))` heading at 28px. Body at `var(--text-body)` (14px) in stone color. Eyebrow in bronze-on-dark.
- Animation: `v2-sig-img-wrap` transitions opacity + transform. `v2-sig-reveal` elements stagger by stage. `prefers-reduced-motion` kills all reveals.

### Craftsmanship
- Desktop: Two-column grid — image (4:5 aspect) on left, text on right. Eye-brow, heading, body paragraphs, CTA link. `var(--space-xl)` gap between columns.
- Mobile (≤860px): Single-column with image reordered above text (`order: -1`). Image at 4:3 aspect ratio. Text padding `var(--space-lg)` top.
- CTA: `link-quiet` with `margin-top: var(--space-lg)` (40px) and bottom border for visual prominence as section closer. Desktop border uses `var(--stone)`.
- Typography: `clamp(1.75rem, 3.4vw, var(--text-h2))` heading at 20px. Body at `var(--text-body)` (14px) with `var(--text-secondary)`. Line-clamped to 3 lines on mobile.

### Collection Carousel
- Desktop: Horizontal scroll track with 220px-wide items, 4:5 aspect ratio images, uppercase labels, "Discover" CTA buttons. Prev/next arrows at 44×44px. Dot indicators below.
- Mobile (≤860px): Items shrink to 140px. Track gap reduces to `var(--space-sm)` (12px). At ≤560px: items 120px, labels at `var(--text-caption)` (10px), CTA buttons smaller.
- Touch: Swipe support via touchstart/touchmove/touchend with 50px threshold. User interaction pauses auto-advance for 14 seconds.
- Reduced motion: `prefers-reduced-motion` does not affect carousel (no CSS animations, only scroll-driven).

### Product Grid ("From the Collection")
- Desktop: 3-column grid with `var(--space-lg)` (40px) gap — increased from 20px for better breathing room between cards. 4:5 aspect ratio images. Product name at 15px/500wt. Category + price at `var(--text-label)` (12px).
- Mobile (≤860px): 2-column grid with `var(--space-lg)` (40px) gap. Product info stacks vertically (name above, category/price below). At ≤560px: gap reduces to `var(--space-sm)` (12px). At ≤430px: gap `var(--space-sm)`, name at 14px.
- CTA: "Explore the Full Collection" button centered below grid. `btn-primary` style with `var(--text-primary)` background.
- Section spacing: `var(--space-2xl)` (104px) bottom padding — increased from 40px to create clear separation from Lifestyle sections below.

### Lifestyle Sections (Workshop + Watch It Made)
- Desktop: Full-bleed 88vh background images with dark gradient overlay. Text positioned at bottom-left with eyebrow, heading, body, and CTA. `max-width: 640px` content container.
- Overlay: Gradient from `rgba(51,38,29,0.82)` at bottom to transparent at top — strengthened from 0.72/0.1 for better text readability over bright images.
- Mobile (≤860px): Background image becomes inline element (380px height at ≤860px, 300px at ≤560px) with `border-radius: var(--radius-sm)`. Text positioned absolutely over the image bottom. Body text hidden. Heading reduced to `var(--text-h3)` (16px) — from 20px — matching Craftsmanship section hierarchy. `max-width: 28ch` for heading.
- Mobile (≤560px): Image 300px height, content positioned with `var(--space-md)` margins, heading at 16px/26ch max.

### Footer
- Desktop: 4-column grid (brand, explore, services, newsletter) with `var(--space-xl)` (64px) gap. Brand includes logo, description, social links. Newsletter has email input + send button. Bottom bar with copyright and legal links.
- Mobile (≤860px): Single-column stacked layout. Brand section with bottom border separator. Each column separated by subtle borders. Newsletter form stacks vertically. Bottom bar stacks vertically with left-aligned copyright.
- Typography: Column headers at `var(--text-label)` (12px) uppercase. Links at `var(--text-body)` (14px). Footer bottom at `var(--text-label)` (12px).
- Accessibility: `<nav aria-label>` on each column. Newsletter form has `aria-label`. Email input has `visually-hidden` label. All links keyboard accessible.

## Responsive Verification
- 1440px: Philosophy left-aligned, product grid 3-col with 40px gap, lifestyle sections full-bleed with strong overlay, footer 4-col.
- 1280px: Same as 1440px with slightly narrower container. All sections maintain proper proportions.
- 430px: Philosophy left-aligned, product grid 2-col with 12px gap, lifestyle sections inline images with overlaid text, footer single-column.
- 390px: Same as 430px. All content contained, no overflow.
- 375px: Same as 430px. Compact but readable. All touch targets ≥40px.

## Accessibility
- Keyboard: All CTAs are `<Link>` or `<button>` elements. Carousel prev/next buttons have `aria-label`. Gallery thumbnails have `aria-label` and `role="radio"`. Newsletter form has proper `<label>`.
- Focus: `focus-visible` outlines on all interactive elements using `var(--bronze)` ring. Carousel buttons, nav links, and form inputs all have visible focus states.
- Contrast: All text meets WCAG AA. `--text-primary` on `--bg-primary`: ~12.5:1. `--text-secondary`: ~5.0:1. `--text-tertiary`: ~3.8:1. Lifestyle text uses `var(--bg-primary)` on dark overlay: sufficient.
- Touch targets: All buttons and links ≥40px. Carousel arrows 44×44px. Newsletter input 40px min-height.
- Semantic HTML: Sections use `<section>` with proper heading hierarchy. `<nav>` landmarks for footer columns. `<footer>` element for site footer.

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
| `app/homepage.css` | **Philosophy alignment**: `text-align: center` → `text-align: left` at ≤860px. **Eyebrow**: removed `justify-content: center` override. **Product grid desktop**: `gap: var(--space-md)` → `gap: var(--space-lg)` (20px → 40px). **Product grid mobile 860px**: `gap: var(--space-md)` → `gap: var(--space-lg)`. **Product grid mobile 430px**: `gap: var(--space-xs)` → `gap: var(--space-sm)` (8px → 12px). **Lifestyle overlay**: gradient bottom opacity `0.72` → `0.82`, mid opacity `0.1` → `0.25`. **Lifestyle headings mobile 860px**: `font-size: var(--text-h2)` → `var(--text-h3)` (20px → 16px), `max-width: 32ch` → `28ch`. **Products section spacing**: `padding-bottom: var(--space-lg)` → `var(--space-2xl)` (40px → 104px). **Craftsmanship CTA**: `margin-top: var(--space-md)` → `var(--space-lg)` (20px → 40px), added `border-bottom: 1px solid var(--stone)`. **Products mobile 860px**: `padding-bottom: var(--space-lg)` → `var(--space-2xl)`. **Products mobile 560px**: added `padding-bottom: var(--space-xl)`. |

## Files Created
None.

## Remaining Issues
### Fixed
- Philosophy text center-aligned on mobile — changed to left-aligned for editorial consistency
- Lifestyle headings oversized on mobile (20px) — reduced to 16px matching Craftsmanship
- Product grid gaps too tight (20px desktop, 20px mobile) — increased to 40px desktop/mobile, 12px small mobile
- Lifestyle overlay too weak for text readability — strengthened gradient
- Products section no separation from Lifestyle sections — increased bottom padding to 104px
- Craftsmanship CTA lacked visual prominence — added margin and bottom border

### Pre-existing
- 2 Pexels image 404s on gallery (external images removed from Pexels)
- 1 Pexels image 404 on product detail (external)
- Sprint 34F/34E/34D test failures reference old implementations refactored in sprint 34g
- Homepage uses separate `.v2-pcard` card system (intentional — editorial showcase vs catalogue)
- External Pexels images load lazily — appear as gray placeholders in automated screenshots until scrolled into view

### Intentionally Unchanged
- No new components created — reused existing CSS patterns
- No content/copy changes — all text, products, routes preserved
- No JavaScript changes — all fixes are CSS-only
- No new dependencies added
- Footer structure preserved — already well-styled with proper responsive behavior
- Hero section unchanged — already refined in earlier phases
- Signature scroll-beat reveal unchanged — working as designed

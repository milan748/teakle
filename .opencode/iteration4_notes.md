## Iteration 4 — Vertical Rhythm & Grid Refinement (Complete)

### Changes Made
1. **Product grid gap** — Reduced from `var(--cin-gutter-wide)` (72px) to `clamp(2rem, 3.5vw, 3rem)` (~48px)
2. **Atelier Stories right column** — Changed `align-items: start` to `align-items: center` so text vertically centers with the product image
3. **Product grid bottom padding** — Reduced from `var(--cin-section)` to `clamp(2rem, 3vw, 3rem)` to tighten space after last product
4. **Craftsmanship bottom padding** — Reduced from `0` to `clamp(2rem, 3vw, 3rem)` to tighten gap before carousel
5. **Product card info row** — Added subtle top border separator (`1px solid rgba(0,0,0,0.06)`) and `padding-top` for cleaner visual hierarchy

### Verification
- Desktop 1440px: All sections flow correctly, no horizontal overflow
- Mobile 390px: Layout stacks properly, carousel scrolls as expected
- Build: 129 pages, 0 errors
- Console: Only pre-existing hydration warning (nested `<a>` in BottomNav — not introduced by this iteration)

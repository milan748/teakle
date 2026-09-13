# Sprint 10 — Teakle Visual System + Homepage Luxury Refinement

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Teakle feel like a cohesive, premium, luxury furniture brand through targeted visual refinements while preserving existing content, architecture, and CMS system.

**Architecture:** Visual-only refinement sprint. No new CMS infrastructure. Fix critical data bugs, refine typography/spacing/hierarchy, improve mobile experience, verify accessibility and performance. All changes verified through real browser screenshots at 1440, 1280, 1024, 768, 390, 375px viewports.

**Tech Stack:** Next.js 15, React 19, plain CSS, GSAP, SQLite (better-sqlite3), Montserrat font

---

## File Structure Map

### Files to Modify
- `data/teakle.db` — Fix VERIFY eyebrow in content_sections (id=1)
- `app/components/Header.js` — Mobile header icon consolidation, desktop overflow fix
- `styles.css` — Header overflow, mobile header styles, spacing tokens
- `app/homepage.css` — Lifestyle text sizing, process story contrast, carousel cards, section spacing
- `app/HomeClient.js` — Minor typography fixes if needed
- `app/studio/page.js` — Studio visual consistency
- `app/components/BottomNav.js` — Verify not rendering unnecessary elements

### Files to Audit (No Changes Expected)
- `lib/designResolution.js` — Verify CMS tokens still control visuals
- `app/page.js` — Homepage server component
- `app/components/Footer.js` — Footer visual audit
- `app/admin/editor/sections/registry.js` — Section variants

### Test Files
- `scripts/test-sprint34g.js` — 51/51 baseline
- `scripts/test-sprint5.js` — 20/20 baseline
- `scripts/test-sprint8.js` — 55/55 baseline
- `scripts/test-sprint9.js` — 99/99 baseline
- `scripts/test-sprint10.js` — NEW: Sprint 10 visual system tests

---

## Phase 2: Fix Critical Issues

### Task 1: Fix VERIFY Eyebrow in Database

**Files:**
- Modify: `data/teakle.db` (content_sections table, id=1)

- [ ] **Step 1: Verify current eyebrow value**

Run: `python -c "import sqlite3; db=sqlite3.connect('data/teakle.db'); cur=db.cursor(); cur.execute('SELECT id,eyebrow FROM content_sections WHERE id=1'); print(cur.fetchone()); db.close()"`
Expected: `(1, 'Verify-1788802726')`

- [ ] **Step 2: Update eyebrow to intended value**

Run: `python -c "import sqlite3; db=sqlite3.connect('data/teakle.db'); cur=db.cursor(); cur.execute(\"UPDATE content_sections SET eyebrow='An Indian Workshop' WHERE id=1\"); db.commit(); print('Updated:', cur.rowcount, 'rows'); db.close()"`
Expected: `Updated: 1 rows`

- [ ] **Step 3: Verify update**

Run: `python -c "import sqlite3; db=sqlite3.connect('data/teakle.db'); cur=db.cursor(); cur.execute('SELECT id,eyebrow FROM content_sections WHERE id=1'); print(cur.fetchone()); db.close()"`
Expected: `(1, 'An Indian Workshop')`

- [ ] **Step 4: Browser verify homepage hero**

Take screenshot at 1440px and 390px. Verify "An Indian Workshop" appears as hero eyebrow.

- [ ] **Step 5: Commit**

```bash
git add data/teakle.db
git commit -m "fix: correct VERIFY eyebrow to 'An Indian Workshop' in CMS"
```

### Task 2: Investigate Studio "N 1 Issue X" Badge

**Files:**
- Audit only: `app/studio/page.js`, `app/components/BottomNav.js`, console output

- [ ] **Step 1: Check browser console for errors**

Navigate to `/studio` in browser. Open DevTools Console. Check for:
- React errors
- Hydration warnings
- Unhandled promise rejections
- Network failures
- Console.error output

Document findings: _______________

- [ ] **Step 2: DOM inspection for "N 1 Issue X" element**

Run browser script to find element containing "1 Issue" text:
```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:3099/studio", wait_until="load", timeout=60000)
    page.wait_for_timeout(3000)
    el = page.evaluate("""() => {
        const all = document.querySelectorAll('*');
        for (const el of all) {
            if (el.textContent.includes('Issue') && el.getBoundingClientRect().width > 0) {
                return {tag: el.tagName, cls: el.className, html: el.outerHTML.slice(0,500)};
            }
        }
        return null;
    }""")
    print(el)
    browser.close()
```

- [ ] **Step 3: Check if element is Teakle-generated or external**

If element found:
- Check if it's in Teakle source files (grep for "Issue" text)
- Check if it's a Next.js development indicator
- Check if it appears in production build

- [ ] **Step 4: Document findings**

If Teakle-generated: Fix root cause
If dev-only: Verify not in production build
If external: Document evidence, no code changes

- [ ] **Step 5: Commit (if Teakle fix needed)**

---

## Phase 3: Mobile Header Refinement

### Task 3: Consolidate Mobile Header Icons

**Files:**
- Modify: `app/components/Header.js` (lines ~100-200, header-mobile-actions)
- Modify: `styles.css` (header-mobile-actions styles)

- [ ] **Step 1: Audit current mobile header icons**

Current mobile header shows: hamburger, Teakle, account, mail, search, heart, mail (6+ icons)

Identify which are PRIMARY (keep visible):
- hamburger/menu: PRIMARY (navigation access)
- search: PRIMARY (product discovery)
- cart: PRIMARY (commerce)

Identify which are SECONDARY (move to drawer):
- account: SECONDARY (can access via drawer)
- mail: SECONDARY (contact via footer)
- heart/wishlist: SECONDARY (can access via drawer)

- [ ] **Step 2: Modify Header.js mobile actions**

Replace header-mobile-actions section with 3 primary icons:
```jsx
<div className="header-mobile-actions">
  {/* Search */}
  <button className="header-icon" onClick={() => setSearchOpen(true)} aria-label="Search">
    <svg>...</svg>
  </button>
  {/* Cart */}
  <Link href="/cart" className="header-icon" aria-label="Cart">
    <svg>...</svg>
  </Link>
</div>
```

Hamburger toggle remains separate (already in header).

- [ ] **Step 3: Update styles.css for mobile header**

Ensure `.header-mobile-actions` shows only 2-3 icons with proper spacing at 390px and 375px.

- [ ] **Step 4: Verify functionality preserved**

Test: search opens overlay, cart navigates, hamburger opens drawer (which contains account, wishlist, mail access)

- [ ] **Step 5: Browser verify at 390px and 375px**

Take screenshots. Verify header is clean, 2-3 icons max, no clipping.

- [ ] **Step 6: Commit**

```bash
git add app/components/Header.js styles.css
git commit -m "refine: consolidate mobile header to 3 primary icons"
```

### Task 4: Fix Desktop Header Icon Clipping at 1280px

**Files:**
- Modify: `app/components/Header.js` (header-actions container)
- Modify: `styles.css` (.header-actions, .header-inner)

- [ ] **Step 1: Inspect header layout at 1280px**

Take screenshot at 1280px. Identify which icons clip.

Current header structure:
- Logo (left)
- Nav links (center)
- Header actions (right): search, heart, cart, account

- [ ] **Step 2: Fix header-actions overflow**

Add proper flex handling to `.header-actions`:
```css
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0; /* Prevent shrinking */
}
```

Ensure `.header-inner` doesn't force overflow:
```css
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem var(--space-md);
  min-width: 0; /* Allow flex items to shrink */
}
```

- [ ] **Step 3: Browser verify at 1440, 1280, 1024**

Take screenshots at all three viewports. Verify no clipping, no overlap.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "fix: prevent header icon clipping at 1280px viewport"
```

---

## Phase 4: Typography & Readability

### Task 5: Improve Lifestyle/Story Block Text Readability

**Files:**
- Modify: `app/homepage.css` (.v2-lifestyle styles, around line 1219-1264)

- [ ] **Step 1: Audit current lifestyle block**

Current issues:
- Text too small against dark overlay
- Gradient may be insufficient for contrast

- [ ] **Step 2: Increase text size and improve gradient**

Modify `.v2-lifestyle` styles:
```css
.v2-lifestyle-content {
  position: relative;
  z-index: 2;
  padding: var(--space-xl) var(--space-md);
  max-width: 640px;
}
.v2-lifestyle h2 {
  color: var(--bg-primary);
  font-size: clamp(1.75rem, 3.5vw, var(--text-h1)); /* Increased from 2rem */
  margin-bottom: var(--space-sm);
  max-width: none;
  font-weight: 600; /* Ensure weight is sufficient */
}
.v2-lifestyle p {
  color: var(--stone);
  font-size: var(--text-body); /* Keep body size */
  max-width: 48ch;
  margin-bottom: var(--space-md);
  line-height: var(--lh-relaxed);
}
```

Improve gradient overlay:
```css
.v2-lifestyle::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(51,38,29,0.88) 0%, rgba(51,38,29,0.35) 55%, transparent 100%);
  /* Increased opacity from 0.82 to 0.88 for better contrast */
}
```

- [ ] **Step 3: Browser verify at 1440 and 390**

Take screenshots. Verify text is readable against dark overlay.

- [ ] **Step 4: Commit**

```bash
git add app/homepage.css
git commit -m "fix: improve lifestyle block text readability and contrast"
```

### Task 6: Improve Process Story Text Contrast

**Files:**
- Modify: `app/homepage.css` (process/workshop story sections)

- [ ] **Step 1: Audit process story sections**

Identify sections with white text on dark overlays. Check:
- Gradient strength
- Text weight
- Text size

- [ ] **Step 2: Strengthen overlay gradients**

For sections with insufficient contrast, increase gradient opacity by 5-10%.

Ensure text has appropriate weight:
```css
.process-story h2, .workshop-story h2 {
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3); /* Subtle shadow for readability */
}
```

- [ ] **Step 3: Verify WCAG contrast**

Use browser dev tools to check contrast ratio. Target: 4.5:1 for normal text, 3:1 for large text.

- [ ] **Step 4: Browser verify at multiple viewports**

- [ ] **Step 5: Commit**

```bash
git add app/homepage.css
git commit -m "fix: improve process story text contrast for readability"
```

---

## Phase 5: Section Spacing & Rhythm

### Task 7: Establish Consistent Section Spacing

**Files:**
- Modify: `app/homepage.css` (section padding/margin)
- Modify: `styles.css` (spacing tokens if needed)

- [ ] **Step 1: Audit current section spacing**

Measure vertical gaps between sections:
- Hero to Trust bar
- Trust bar to Philosophy
- Philosophy to Lifestyle
- Lifestyle to Craftsmanship
- Craftsmanship to Carousel
- Carousel to Product Grid
- Product Grid to Process Story
- Process Story to Footer

- [ ] **Step 2: Normalize section padding**

Use consistent vertical padding for major sections:
```css
/* Standard section rhythm */
.section-rhythm {
  padding: var(--space-3xl) 0;
}

/* On mobile, reduce proportionally */
@media (max-width: 860px) {
  .section-rhythm {
    padding: var(--space-xl) 0;
  }
}
```

- [ ] **Step 3: Fix specific section spacing issues**

Apply consistent spacing to:
- `.v2-philosophy`
- `.v2-lifestyle`
- `.v2-craft`
- `.v2-products`
- `.v2-process` (if exists)

- [ ] **Step 4: Browser verify rhythm at 1440 and 390**

- [ ] **Step 5: Commit**

```bash
git add app/homepage.css
git commit -m "refine: establish consistent section spacing rhythm"
```

### Task 8: Standardize Carousel Card Sizing

**Files:**
- Modify: `app/homepage.css` (.v2-citem styles, around line 1034-1080)

- [ ] **Step 1: Audit current carousel cards**

Check:
- Card width consistency
- Image aspect ratio
- Content spacing
- Mobile behavior

- [ ] **Step 2: Standardize card dimensions**

```css
.v2-citem {
  flex: 0 0 180px; /* Consistent width */
  display: flex;
  flex-direction: column;
}

.v2-citem img {
  aspect-ratio: 4/5; /* Consistent aspect ratio */
  object-fit: cover;
  border-radius: var(--radius-sm);
}

/* Mobile: slightly smaller */
@media (max-width: 860px) {
  .v2-citem {
    flex: 0 0 140px;
  }
}

@media (max-width: 560px) {
  .v2-citem {
    flex: 0 0 120px;
  }
}
```

- [ ] **Step 3: Ensure horizontal scroll works smoothly**

Verify:
- No vertical scrollbar
- Smooth horizontal scrolling
- Touch-friendly on mobile

- [ ] **Step 4: Browser verify at 1440 and 390**

- [ ] **Step 5: Commit**

```bash
git add app/homepage.css
git commit -m "refine: standardize carousel card sizing and aspect ratios"
```

---

## Phase 6: Hero Refinement

### Task 9: Subtle Hero Image Brightness Improvement

**Files:**
- Modify: `app/homepage.css` (hero image styles)

- [ ] **Step 1: Audit current hero image**

Current state: Dark, warm tones. Could be slightly brighter for luxury feel.

- [ ] **Step 2: Apply subtle brightness adjustment**

```css
.v2-hero-img {
  /* Existing styles */
  animation: heroZoom 20s var(--ease) infinite alternate;
  
  /* Subtle brightness improvement */
  filter: brightness(1.05) contrast(1.02);
}

/* Alternative: overlay adjustment */
.v2-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.15); /* Slightly reduced from 0.2 if present */
}
```

- [ ] **Step 3: Verify natural warm tones preserved**

Check that image doesn't look washed out or artificial.

- [ ] **Step 4: Browser verify at 1440 and 390**

- [ ] **Step 5: Commit**

```bash
git add app/homepage.css
git commit -m "refine: subtle hero image brightness improvement"
```

---

## Phase 7: Footer & Trust Bar Polish

### Task 10: Footer Newsletter Form Refinement

**Files:**
- Modify: `styles.css` (footer-newsletter styles)

- [ ] **Step 1: Audit current footer newsletter**

Current state: Generic form styling.

- [ ] **Step 2: Refine within Teakle visual language**

```css
.footer-newsletter-form {
  display: flex;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.footer-newsletter-form input {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: 1px solid rgba(43,34,27,0.15);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: var(--text-caption);
  background: transparent;
  transition: border-color var(--dur-fast) var(--ease);
}

.footer-newsletter-form input:focus {
  outline: none;
  border-color: var(--bronze);
}

.footer-newsletter-form button {
  padding: 0.625rem 1rem;
  background: var(--walnut);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}

.footer-newsletter-form button:hover {
  background: var(--bronze);
}
```

- [ ] **Step 3: Browser verify**

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "refine: footer newsletter form styling within Teakle visual language"
```

### Task 11: Trust Bar Alignment Fix

**Files:**
- Modify: `app/homepage.css` (trust bar styles)

- [ ] **Step 1: Audit trust bar alignment**

Check spacing between trust bar items.

- [ ] **Step 2: Fix alignment inconsistencies**

```css
.v2-trust-inner {
  display: flex;
  justify-content: center;
  gap: var(--space-xl); /* Consistent spacing */
}

@media (max-width: 860px) {
  .v2-trust-inner {
    gap: var(--space-md);
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 3: Browser verify**

- [ ] **Step 4: Commit**

```bash
git add app/homepage.css
git commit -m "fix: trust bar alignment and spacing consistency"
```

---

## Phase 8-14: Remaining Refinements

### Task 12: Studio Visual Consistency

**Files:**
- Audit: `app/studio/page.js`, `app/studio/studio.css` (if exists)

- [ ] **Step 1: Verify Studio uses designResolution correctly**

Confirm Studio page imports and uses:
- `getPageDesignSettings('studio')`
- `resolvePageDesign()`
- `resolveVariant()`
- `parseSectionOverrides()`
- `resolveSectionStyle()`

- [ ] **Step 2: Check Studio typography consistency**

Verify Studio headings, body text, and labels use the same type scale as homepage.

- [ ] **Step 3: Check Studio spacing consistency**

Verify section padding matches homepage rhythm.

- [ ] **Step 4: Browser verify Studio at 1440, 768, 390**

- [ ] **Step 5: Commit (if changes needed)**

### Task 13: Image System Audit

**Files:**
- Audit only: image references in `app/HomeClient.js`, `app/homepage.css`

- [ ] **Step 1: List all major homepage images**

Document:
- Hero image
- Philosophy image
- Lifestyle/story image
- Craftsmanship image
- Product images
- Process story images

- [ ] **Step 2: Verify image loading**

Check:
- Above-fold images: `loading="eager"` or priority
- Below-fold images: `loading="lazy"`
- Proper `width` and `height` attributes for layout stability

- [ ] **Step 3: Flag questionable assets for user review**

List any images that appear to be:
- Placeholders
- Incorrect product images
- Low resolution
- Wrong aspect ratio

DO NOT replace automatically. Report to user.

- [ ] **Step 4: Document findings**

### Task 14: Animation Audit

**Files:**
- Audit: `app/HomeClient.js` (GSAP animations), `app/homepage.css` (CSS animations)

- [ ] **Step 1: Audit hero scroll behavior**

Verify:
- Native scroll remains authoritative
- No scroll hijacking
- No wheel/touch hijacking
- Animation completes, normal scrolling resumes
- `prefers-reduced-motion` respected

- [ ] **Step 2: Audit section reveal animations**

Check:
- Smooth, restrained entrances
- No excessive delays
- No dramatic scaling
- Reduced motion support

- [ ] **Step 3: Document findings**

No code changes expected unless issues found.

---

## Phase 15: Accessibility

### Task 15: Accessibility Audit

**Files:**
- Audit: all homepage and Studio components

- [ ] **Step 1: Heading hierarchy check**

Verify:
- Single H1 per page
- Logical H2, H3, H4 nesting
- No skipped levels

- [ ] **Step 2: Contrast check**

Use browser dev tools to verify:
- Body text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

- [ ] **Step 3: Keyboard navigation test**

Verify:
- All interactive elements focusable
- Focus order logical
- Focus-visible styles present
- No keyboard traps

- [ ] **Step 4: Touch target size**

Verify all interactive elements at least 44x44px on mobile.

- [ ] **Step 5: Alt text audit**

Check all meaningful images have descriptive alt text.

- [ ] **Step 6: Fix any issues found**

- [ ] **Step 7: Document findings and fixes**

---

## Phase 16: Performance

### Task 16: Performance Audit

**Files:**
- Audit: `app/page.js`, `app/HomeClient.js`, image loading

- [ ] **Step 1: Check LCP (Largest Contentful Paint)**

Use browser DevTools Performance tab. Identify LCP element (likely hero image).

- [ ] **Step 2: Verify image optimization**

Check:
- Hero image: appropriate format (WebP/AVIF)
- Proper sizing (not oversized)
- Priority loading for above-fold

- [ ] **Step 3: Check client component count**

Verify `HomeClient.js` is justified as client component (needs GSAP, interactivity).

- [ ] **Step 4: Check for unnecessary JavaScript**

Look for:
- Duplicate product lookups
- Unnecessary JSON parsing
- Console.log statements
- Dead code

- [ ] **Step 5: Document findings and make evidence-based fixes only**

---

## Phase 17: CMS/Public Consistency

### Task 17: Verify CMS Controls Work Publicly

**Files:**
- Audit: `lib/designResolution.js`, `app/page.js`, `app/HomeClient.js`

- [ ] **Step 1: Verify pageDesign controls still work**

Test: Change a pageDesign setting in editor. Verify public site reflects change.

- [ ] **Step 2: Verify variant resolution still works**

Test: Change a section variant in editor. Verify public site renders variant.

- [ ] **Step 3: Verify section overrides work**

Test: Apply sectionStyleOverrides. Verify public site applies them.

- [ ] **Step 4: Document that no visual refinements bypass CMS**

---

## Phase 18: Browser Verification

### Task 18: Comprehensive Browser Verification

**Files:**
- Screenshots saved to `.opencode/screenshots/sprint10-final/`

- [ ] **Step 1: Homepage at 1440px**

Take full-page screenshot. Verify:
- Hero: "An Indian Workshop" eyebrow, image quality, CTAs
- All sections visible and properly styled
- Footer complete
- No console errors

- [ ] **Step 2: Homepage at 1280px**

Verify:
- Header no clipping
- All sections responsive
- No overflow issues

- [ ] **Step 3: Homepage at 1024px**

Verify:
- Layout adapts properly
- Typography scales
- Spacing appropriate

- [ ] **Step 4: Homepage at 768px**

Verify:
- Tablet layout
- Navigation appropriate
- Images scale

- [ ] **Step 5: Homepage at 390px**

Verify:
- Mobile layout
- Header: 3 icons max
- Touch targets adequate
- Text readable
- No horizontal scroll

- [ ] **Step 6: Homepage at 375px**

Verify:
- Smaller mobile layout works
- No overflow
- Typography appropriate

- [ ] **Step 7: Studio at 1440px**

Verify:
- No "N 1 Issue X" badge (or documented as external)
- Hero proper
- Sections consistent

- [ ] **Step 8: Studio at 768px**

- [ ] **Step 9: Studio at 390px**

- [ ] **Step 10: Console check**

Verify no errors in development mode. Document any warnings.

---

## Phase 19: Regression Testing

### Task 19: Run All Regression Tests

**Files:**
- Test scripts in `scripts/`

- [ ] **Step 1: Run Sprint 1-4 tests**

Run: `node scripts/test-sprint34g.js`
Expected: 51/51 PASS

- [ ] **Step 2: Run Sprint 5 tests**

Run: `node scripts/test-sprint5.js`
Expected: 20/20 PASS

- [ ] **Step 3: Run Sprint 8 tests**

Run: `node scripts/test-sprint8.js`
Expected: 55/55 PASS

- [ ] **Step 4: Run Sprint 9 tests**

Run: `node scripts/test-sprint9.js`
Expected: 99/99 PASS

- [ ] **Step 5: Run production build**

Run: `npm run build`
Expected: Clean build, no errors

- [ ] **Step 6: Document results**

---

## Phase 20: Code Quality & Final Report

### Task 20: Code Quality Review

**Files:**
- All modified files

- [ ] **Step 1: Check for dead CSS**

Grep for unused classes in `styles.css` and `app/homepage.css`.

- [ ] **Step 2: Check for duplicate styles**

Look for repeated property declarations.

- [ ] **Step 3: Check for hardcoded values that should use tokens**

Verify spacing, colors, fonts use CSS custom properties.

- [ ] **Step 4: Check for unnecessary client components**

Verify `HomeClient.js` is justified.

- [ ] **Step 5: Check for console.log statements**

Remove any debug logging.

- [ ] **Step 6: Check for accidental content changes**

Verify no Teakle copy was modified (except VERIFY eyebrow fix).

### Task 21: Create Sprint 10 Tests

**Files:**
- Create: `scripts/test-sprint10.js`

- [ ] **Step 1: Design meaningful Sprint 10 tests**

Focus on:
- VERIFY eyebrow fix (database value correct)
- Mobile header icon count (≤3 primary icons)
- Hero eyebrow renders correctly
- Section spacing consistency

- [ ] **Step 2: Implement tests**

- [ ] **Step 3: Run tests**

Expected: All PASS

### Task 22: Final Report

**Files:**
- Create: `.opencode/reports/sprint10-final-report.md`

- [ ] **Step 1: Document all findings and fixes**

Include:
- Initial audit findings
- Visual system established
- Section-by-section changes
- Hero composition
- Navigation improvements
- Studio consistency
- CMS controls preserved
- Accessibility fixes
- Performance findings
- Test results
- Browser verification results
- Questionable assets for user review
- Files changed
- Remaining issues
- Deferred items

---

## Critical Rules Compliance

### DO NOT (Verified)
- [ ] No new CMS infrastructure built
- [ ] No Shop/Process per-product CMS started
- [ ] No Shopify/AI/collaboration/version history/marketplace added
- [ ] No arbitrary CSS/freeform positioning added
- [ ] No Teakle copy changed (except VERIFY eyebrow)
- [ ] No imagery replaced without evidence
- [ ] No random fonts added
- [ ] No excessive animation added
- [ ] No scroll hijacking added
- [ ] No Lenis added
- [ ] No competing design systems created

### DO (Verified)
- [ ] Audit before modifying
- [ ] Targeted changes made
- [ ] Content preserved
- [ ] Architecture preserved
- [ ] Hierarchy improved
- [ ] Spacing improved
- [ ] Typography improved
- [ ] Photography presentation improved
- [ ] Responsive behavior improved
- [ ] Accessibility improved
- [ ] Performance verified
- [ ] Everything verified in real browser

---

## Execution Approach

**Recommended:** Subagent-Driven Development

1. Execute Tasks 1-2 (Critical fixes) first
2. Browser verify critical fixes
3. Execute Tasks 3-9 (High priority)
4. Browser verify high priority fixes
5. Execute Tasks 10-14 (Medium/Low priority)
6. Browser verify all viewports
7. Execute Tasks 15-17 (Audit phases)
8. Execute Tasks 18-19 (Verification)
9. Execute Tasks 20-22 (Quality & Report)

**Review checkpoints after each phase.**

---

## Estimated Effort

- Phase 2 (Critical): 15 minutes
- Phase 3-6 (High Priority): 45 minutes
- Phase 7-14 (Medium/Low): 30 minutes
- Phase 15-17 (Audit): 20 minutes
- Phase 18-19 (Verification): 30 minutes
- Phase 20 (Quality & Report): 20 minutes

**Total: ~2.5 hours**

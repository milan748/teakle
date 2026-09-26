# Typography Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish one coherent global typography hierarchy across the Teakle website using the existing Instrument Sans design tokens, replacing hardcoded inconsistent values in homepage.css with the token system from styles.css.

**Architecture:** The design tokens in styles.css already define a complete type scale (--text-display through --text-meta) with semantic aliases. The homepage.css has many hardcoded values that bypass this system. This plan updates homepage.css to consistently use the design tokens, ensuring hierarchy is immediately understandable and desktop/mobile remain readable.

**Tech Stack:** Next.js, CSS Custom Properties (design tokens), CSS media queries

---

## File Structure

- **Modify:** `app/homepage.css` - Replace hardcoded typography values with design token references
- **Modify:** `styles.css` - Minor token refinements if needed (primarily reference only)
- **Verify:** `app/globals.css` - Already imports styles.css correctly

---

## Task 1: Audit and Map Current Hardcoded Values to Design Tokens

**Files:**
- Reference: `app/homepage.css` (lines 1-1689)
- Reference: `styles.css` (lines 1-163)

- [ ] **Step 1.1: Create mapping document of all hardcoded values to design tokens**

Based on the audit, here are the key mappings needed:

| Element | Current Value | Design Token | Token Value |
|---------|--------------|--------------|-------------|
| Hero eyebrow | 11px | --text-eyebrow (10px) / --cin-eyebrow | 10px |
| Hero H1 | clamp(1.5rem, 3vw, 2.5rem) | --text-display / --cin-display | clamp(1.75rem, 3vw, 2.5rem) |
| Hero buttons | 10px | --text-button (10px) | 10px |
| Trust items | 9px | --text-caption (9px) | 9px |
| Philosophy eyebrow | 8px | --text-eyebrow (10px) | 10px |
| Philosophy H2 | clamp(1.25rem, 2.4vw, 1.875rem) | --text-h2 | clamp(1.125rem, 1.8vw, 1.375rem) |
| Philosophy body | clamp(0.8125rem, 1.05vw, 1rem) | --text-body | clamp(0.8125rem, 0.9vw, 0.9375rem) |
| Atelier title H2 | clamp(2rem, 4vw, 3.25rem) | --text-display-sm | clamp(1.5rem, 2.5vw, 2rem) |
| Atelier subtitle | clamp(0.55rem, 0.7vw, 0.7rem) | --text-caption | 0.5625rem (9px) |
| Sig editorial H2 | clamp(28px, 2.5vw, 40px) | --text-display-sm | clamp(1.5rem, 2.5vw, 2rem) |
| Sig edition line | 11px | --text-caption (9px) | 9px |
| Sig body | clamp(14px, 1vw, 16px) | --text-body-lg | clamp(0.875rem, 1vw, 1rem) |
| Sig feature labels | 11px | --text-label (10px) | 10px |
| Sig price | clamp(24px, 2vw, 32px) | --text-h2 | clamp(1.125rem, 1.8vw, 1.375rem) |
| Sig price note | 12px | --text-caption (9px) | 9px |
| Sig buttons | 12px | --text-button (10px) | 10px |
| Sig wishlist | 12px | --text-label (10px) | 10px |
| Sig past editions | 13px | --text-body (13-15px) | ~13px |
| Craft eyebrow | 10px | --text-eyebrow (10px) | 10px ✓ |
| Craft H2 | clamp(1.5rem, 2.6vw, 2.25rem) | --text-h2 | clamp(1.125rem, 1.8vw, 1.375rem) |
| Craft body | var(--cin-body) | --text-body | ✓ uses token |
| Craft link | 10px | --text-label (10px) | 10px ✓ |
| Carousel labels | 10px | --text-eyebrow (10px) | 10px ✓ |
| Carousel buttons | 10px | --text-button (10px) | 10px ✓ |
| Products eyebrow | 10px | --text-eyebrow (10px) | 10px ✓ |
| Products H2 | var(--cin-h2) | --text-h2 | ✓ uses token |
| Product H3 | clamp(0.875rem, 1.1vw, 1.0625rem) | --text-h3 | clamp(0.9375rem, 1.3vw, 1.0625rem) |
| Product category | 10px | --text-eyebrow (10px) | 10px ✓ |
| Product price | 10px | --text-caption (9px) | 9px |
| Lifestyle eyebrow | 10px | --text-eyebrow (10px) | 10px ✓ |
| Lifestyle H2 | var(--cin-h2) | --text-h2 | ✓ uses token |
| Lifestyle body | var(--cin-body) | --text-body | ✓ uses token |
| Lifestyle link | 10px | --text-label (10px) | 10px ✓ |
| Footer H3 | 10px | --text-label (10px) | 10px ✓ |
| Footer links | var(--text-body) | --text-body | ✓ uses token |
| Footer legal | 10px | --text-caption (9px) | 9px |
| Footer newsletter | var(--text-body) | --text-body | ✓ uses token |
| Footer bottom | 10px | --text-caption (9px) | 9px |
| Bottom nav | 9px | --text-nav (10px) | 10px |

Key issues:
1. Hero H1 uses 2.5rem max but token is 2.5rem - close but hero uses italic/weight 600
2. Philosophy eyebrow at 8px should be 10px
3. Philosophy H2 larger than token (1.875rem vs 1.375rem max)
4. Atelier title H2 at 3.25rem is way larger than any token - should be display-sm (2rem max)
5. Sig editorial H2 at 40px (2.5rem) vs display-sm at 2rem max
6. Sig edition line at 11px vs caption at 9px
7. Sig body at 16px vs body-lg at 1rem (16px) - close
8. Sig feature labels at 11px vs label at 10px
9. Sig price at 32px (2rem) vs h2 at 1.375rem (22px) - too large
10. Sig buttons at 12px vs button at 10px
11. Craft H2 at 2.25rem (36px) vs h2 at 1.375rem (22px) - too large
12. Product H3 at 1.0625rem (17px) vs h3 at 1.0625rem - close
13. Bottom nav at 9px vs nav at 10px

---

## Task 2: Update Hero Section Typography

**Files:**
- Modify: `app/homepage.css` (lines 18-118)

- [ ] **Step 2.1: Update hero eyebrow to use --cin-eyebrow (10px)**
- [ ] **Step 2.2: Update hero H1 to use --cin-display with weight 600, italic**
- [ ] **Step 2.3: Update hero buttons to use --cin-caption/--text-button (10px)**
- [ ] **Step 2.4: Update split/minimal hero variants consistently**

---

## Task 3: Update Trust Bar Typography

**Files:**
- Modify: `app/homepage.css` (lines 204-236)

- [ ] **Step 3.1: Update trust items to use --cin-caption (9px) with proper letter-spacing**

---

## Task 4: Update Philosophy Section Typography

**Files:**
- Modify: `app/homepage.css` (lines 237-311)

- [ ] **Step 4.1: Update philosophy eyebrow to --cin-eyebrow (10px)**
- [ ] **Step 4.2: Update philosophy H2 to --cin-h2 (clamp 1.125rem-1.375rem)**
- [ ] **Step 4.3: Update philosophy body to --cin-body**
- [ ] **Step 4.3: Ensure centered variant consistent**

---

## Task 5: Update Atelier Stories / Signature Editorial Typography

**Files:**
- Modify: `app/homepage.css` (lines 316-650)

- [ ] **Step 5.1: Update atelier title H2 to --cin-display-sm (clamp 1.5rem-2rem)**
- [ ] **Step 5.2: Update atelier subtitle to --cin-caption (9px)**
- [ ] **Step 5.3: Update sig editorial H2 to --cin-display-sm**
- [ ] **Step 5.4: Update sig edition line to --cin-caption (9px)**
- [ ] **Step 5.5: Update sig body to --cin-body-lg**
- [ ] **Step 5.6: Update sig feature labels to --cin-label (10px)**
- [ ] **Step 5.7: Update sig price to --cin-h2 (not oversized)**
- [ ] **Step 5.8: Update sig price note to --cin-caption (9px)**
- [ ] **Step 5.9: Update sig buttons to --cin-caption (10px)**
- [ ] **Step 5.10: Update sig wishlist to --cin-label (10px)**
- [ ] **Step 5.11: Update sig past editions to --cin-body**

---

## Task 6: Update Craftsmanship Section Typography

**Files:**
- Modify: `app/homepage.css` (lines 1126-1188)

- [ ] **Step 6.1: Update craft H2 to --cin-h2 (not oversized)**
- [ ] **Step 6.2: Verify craft body uses --cin-body (already correct)**
- [ ] **Step 6.3: Verify craft link uses --cin-label (already correct)**

---

## Task 7: Update Products Section Typography

**Files:**
- Modify: `app/homepage.css` (lines 1300-1382)

- [ ] **Step 7.1: Verify products H2 uses --cin-h2 (already correct)**
- [ ] **Step 7.2: Update product H3 to --cin-h3**
- [ ] **Step 7.3: Update product category to --cin-eyebrow (already correct)**
- [ ] **Step 7.4: Update product price to --cin-caption (9px)**

---

## Task 8: Update Carousel Typography

**Files:**
- Modify: `app/homepage.css` (lines 1189-1299)

- [ ] **Step 8.1: Verify carousel labels use --cin-eyebrow (already correct)**
- [ ] **Step 8.2: Verify carousel buttons use --cin-button (already correct)**

---

## Task 9: Update Lifestyle/Story Sections Typography

**Files:**
- Modify: `app/homepage.css` (lines 1383-1461)

- [ ] **Step 9.1: Verify lifestyle H2 uses --cin-h2 (already correct)**
- [ ] **Step 9.2: Verify lifestyle body uses --cin-body (already correct)**
- [ ] **Step 9.3: Verify lifestyle eyebrow/link use --cin-eyebrow/--cin-label (already correct)**

---

## Task 10: Update Footer Typography

**Files:**
- Modify: `app/homepage.css` (if any footer overrides) / `styles.css` (lines 1221-1340)

- [ ] **Step 10.1: Update footer legal to --cin-caption (9px)**
- [ ] **Step 10.2: Update footer bottom to --cin-caption (9px)**

---

## Task 11: Update Bottom Navigation Typography

**Files:**
- Modify: `styles.css` (lines 1076-1150)

- [ ] **Step 11.1: Update bottom nav links to --cin-nav (10px)**

---

## Task 12: Update Responsive Breakpoints

**Files:**
- Modify: `app/homepage.css` (media queries starting line 1465)
- Modify: `styles.css` (media queries starting line 1545)

- [ ] **Step 12.1: Ensure tablet (≤860px) token overrides are consistent**
- [ ] **Step 12.2: Ensure mobile (≤560px) token overrides are consistent**
- [ ] **Step 12.3: Ensure small mobile (≤430px) adjustments work**

---

## Task 13: Verify Build and Visual Regression

**Files:**
- Test: Run `npm run build`
- Test: Visual check at desktop and mobile

- [ ] **Step 13.1: Run npm run build - must pass**
- [ ] **Step 13.2: Verify desktop homepage renders correctly**
- [ ] **Step 13.3: Verify mobile homepage renders correctly**
- [ ] **Step 13.4: Check browser console for errors**
- [ ] **Step 13.5: Commit changes**

---

## Acceptance Criteria

- [ ] Typography feels like one system rather than individually styled sections
- [ ] Hierarchy is immediately understandable (display > H2 > H3 > eyebrow > body > caption)
- [ ] Desktop and mobile remain readable
- [ ] No content is rewritten merely to create visual change
- [ ] npm run build passes
- [ ] No console errors
# Sprint 3 — TEAKLE Canva-Like Advanced Editor

## Phase 0 — Architecture Review Findings

### Current State Summary
- 51/51 Sprint 1 tests PASS
- 38/42 editor verification PASS (4 WARN = out-of-scope)
- 0 FAIL, 0 console errors, clean production build
- ~3,937 lines of editor-specific code across 15 files

### Critical Finding #1: No WYSIWYG (Highest Priority)

**The editor and public site use COMPLETELY DIFFERENT components.**

- Editor: `app/admin/editor/sections/HeroSection.js` (264 lines) — applies `styleOverrides` inline
- Public: `app/HomeClient.js` (644 lines) — renders with CSS classes, does NOT consume `styleOverrides`

**Impact:** Style overrides applied in the editor (font size, weight, alignment, etc.) have ZERO effect on the live site. The editor preview is a visual approximation, not WYSIWYG.

**Fix:** Modify `HomeClient.js` to accept and apply `styleOverrides` from the CMS data. This is the smallest correct architectural fix — HomeClient already receives CMS data; it just needs to also receive and apply overrides.

### Critical Finding #2: Dual Registry Divergence Risk

Two parallel registries in `registry.js`:
- `SECTION_REGISTRY` (line 53-69): `editableFields` used by `saveDraft`
- `SECTION_ELEMENTS` (line 117-201): element definitions used by Inspector

If a field is added to one but not the other, save and inspector diverge.

**Fix:** Derive `editableFields` from `SECTION_ELEMENTS` automatically.

### Critical Finding #3: Hardcoded Section Keys

Each section component hardcodes its key in `isElementSelected` (e.g., HeroSection checks `'hero'`, PageHeroSection checks `'pageHero'`). But `selectedElement.sectionKey` is set by the sidebar click, which may use a different key. The `getElementsForSection` helper maps `'hero'` → pageHero elements, but the component's `isElementSelected` checks against `'pageHero'`.

**Impact:** Element selection highlighting may be broken for non-home page hero sections.

**Fix:** Pass `sectionKey` as a prop to section components and use it in `isElementSelected` instead of hardcoding.

### Critical Finding #4: No Mobile Override Pipeline

The `viewMode` toggle (desktop/mobile) only changes canvas container width. It has NO effect on:
- What controls appear in the Inspector
- How `styleOverrides` are stored (no `desktop`/`mobile` keys)
- How section components render

**Impact:** Responsive editing is purely cosmetic — no actual mobile-specific overrides.

### Critical Finding #5: No Section-Level Style Overrides

All `styleOverrides` are scoped to individual elements (`{ "title": { "fontSize": "32px" } }`). There are no section-level controls for:
- Background color/image
- Content width
- Section spacing (padding/margin)
- Layout variant

### Critical Finding #6: No Inline Editing

Text can only be edited via the Inspector textarea. No double-click-to-edit on canvas.

### Critical Finding #7: No Floating Toolbar

All controls live in the Inspector side panel. No contextual toolbar near the selected element.

### Critical Finding #8: No Undo/Redo Architecture

State is managed via `setSections(prev => prev.map(...))` with no history stack. Each change directly mutates the sections array.

---

## Phase 1 — Direct Canvas Text Editing

### Problem
Users must always use the Inspector textarea to edit text. This is slow and breaks the visual editing flow.

### Implementation

**Approach:** Use `contentEditable` divs with React state management.

**Changes to section components (all 9):**
- Add `editingElement` state prop (from EditorClient)
- When `editingElement === elementKey`, render a `contentEditable` div instead of the static text element
- On `blur` or `Escape`, commit the change via `onFieldChange` and exit editing mode
- On `Enter` (for single-line elements like title/eyebrow), exit editing mode
- On `Enter` (for multi-line elements like body/subtitle), allow newlines
- Preserve existing CSS classes and inline styles during editing
- Sanitize content on commit (strip HTML tags, trim whitespace)

**EditorClient changes:**
- Add `editingElement` state: `{ sectionKey, elementKey } | null`
- Add `handleDoubleClick(sectionKey, elementKey)` — sets `editingElement`
- Add `handleCommitEdit(sectionKey, elementKey, value)` — calls `handleFieldChange`, clears `editingElement`
- Add `handleCancelEdit()` — clears `editingElement` without saving

**Canvas changes:**
- Pass `editingElement`, `onDoubleClick`, `onCommitEdit`, `onCancelEdit` to section components

**Section component changes (HeroSection example):**
```jsx
// When editing
{editingElement === 'title' ? (
  <div
    contentEditable
    suppressContentEditableWarning
    onBlur={(e) => onCommitEdit?.(sectionKey, 'title', e.target.textContent)}
    onKeyDown={(e) => {
      if (e.key === 'Escape') onCancelEdit?.()
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.target.blur() }
    }}
    style={getStyle('title', { /* existing defaults */ }, styleOverrides)}
    dangerouslySetInnerHTML={{ __html: title }}
  />
) : (
  <h1 onDoubleClick={() => onDoubleClick?.('title')} style={getStyle('title', {...}, styleOverrides)}>
    {titleLines.map((line, i) => <span key={i}>{line}</span>)}
  </h1>
)}
```

**Keyboard accessibility:**
- `Enter` or `F2` on a focused element enters editing mode
- `Escape` cancels editing
- `Tab` moves to next element
- `aria-label` on contentEditable divs

**Files affected:**
- `app/admin/editor/EditorClient.js` — add editingElement state + handlers
- `app/admin/editor/Canvas.js` — pass new props
- `app/admin/editor/sections/HeroSection.js` — inline editing for title, eyebrow, subtitle, body
- `app/admin/editor/sections/PhilosophySection.js` — same
- `app/admin/editor/sections/SignatureSection.js` — same
- `app/admin/editor/sections/CraftsmanshipSection.js` — same
- `app/admin/editor/sections/LifestyleSection.js` — same
- `app/admin/editor/sections/PageHeroSection.js` — same
- `app/admin/editor/sections/PageOriginSection.js` — same
- `app/admin/editor/sections/PageGallerySection.js` — same
- `app/admin/editor/sections/PageIntroSection.js` — same

**Risk:** `contentEditable` + React is notoriously tricky. Use `suppressContentEditableWarning` and handle `dangerouslySetInnerHTML` carefully. Test across browsers.

---

## Phase 2 — Contextual Floating Toolbar

### Problem
All controls are in the Inspector side panel. Users need to look away from the canvas to make common changes.

### Implementation

**Approach:** A floating toolbar div that positions itself above/below the selected element using `getBoundingClientRect()`.

**New component:** `app/admin/editor/FloatingToolbar.js`

**Toolbar content by element type:**

| Element Type | Toolbar Controls |
|---|---|
| Text | Font Size [−/+] [value] [+/−], Weight dropdown, Italic toggle, Alignment [L/C/R] |
| Image | Replace button, Fit [Cover/Contain], Position [L/C/R] [T/M/B] |
| Button | Variant [Outline/Filled/Ghost], Size [S/M/L], Alignment [L/C/R] |

**Positioning logic:**
```js
function positionToolbar(elementRect, canvasRect, toolbarHeight = 44) {
  const relativeTop = elementRect.top - canvasRect.top
  const relativeLeft = elementRect.left + elementRect.width / 2
  
  // Prefer above the element
  let top = relativeTop - toolbarHeight - 8
  let placement = 'above'
  
  // If not enough space above, place below
  if (top < 0) {
    top = relativeTop + elementRect.height + 8
    placement = 'below'
  }
  
  // Clamp horizontal position within canvas bounds
  const halfWidth = 120 // approximate toolbar half-width
  let left = relativeLeft - halfWidth
  left = Math.max(0, Math.min(left, canvasRect.width - halfWidth * 2))
  
  return { top, left, placement }
}
```

**State management:**
- Toolbar visibility: derived from `selectedElement` (hide when null)
- Toolbar values: read from `styleOverrides[selectedElement.elementKey]`
- Toolbar changes: call `handleStyleChange` (same as Inspector)

**Files affected:**
- `app/admin/editor/FloatingToolbar.js` — new file (~200 lines)
- `app/admin/editor/Canvas.js` — render FloatingToolbar inside canvas container
- `app/admin/editor/EditorClient.js` — pass styleOverrides + handleStyleChange to Canvas

**Responsive behavior:**
- On mobile viewports (< 768px), hide the floating toolbar (Inspector is the primary editing interface)
- Toolbar repositions on scroll/resize via `useEffect` + `ResizeObserver`

**Risk:** Toolbar must not cover the selected content. Use `placement` logic to flip above/below. Test with elements near canvas edges.

---

## Phase 3 — Rich Typography Controls

### Problem
Current typography controls use PillGroup buttons for discrete values. No italic control. No fine-grained numeric input.

### Implementation

**Inspector typography controls update:**

Replace PillGroup-only approach with:
- **Font Size:** [−] input [+] with PillGroup presets below
- **Font Weight:** PillGroup (Light/Regular/Medium/Semibold/Bold)
- **Italic:** Toggle button (italic icon)
- **Line Height:** [−] input [+] with PillGroup presets
- **Letter Spacing:** [−] input [+] with em unit label
- **Alignment:** PillGroup [Left/Center/Right]

**New capability:** Add `'italic'` to text element capabilities in `registry.js`.

**New style property:** `fontStyle: 'italic'` stored in `styleOverrides`.

**TypographyControls component rewrite (Inspector.js):**
- Numeric inputs with stepper buttons for font-size, line-height, letter-spacing
- Value clamping: font-size 12-72px, line-height 0.8-2.5, letter-spacing -0.05em to 0.3em
- PillGroup presets below each numeric input for quick selection
- Italic toggle as a standalone button

**Files affected:**
- `app/admin/editor/Inspector.js` — rewrite TypographyControls
- `app/admin/editor/sections/registry.js` — add italic to capabilities, add new design tokens
- `app/admin/editor/sections/*.js` — apply `fontStyle` from overrides in `getStyle`

**Design tokens to add:**
```js
export const ITALIC_OPTIONS = [
  { label: 'Off', value: false },
  { label: 'Italic', value: true },
]
```

---

## Phase 4 — Image Editing

### Problem
Image controls exist but need refinement. No visual preview of fit/position changes.

### Implementation

**Inspector image controls update:**
- **Image preview:** Current thumbnail (already exists)
- **Replace Image:** Button that opens media library (already exists)
- **URL input:** Text input for direct URL (already exists)
- **Fit:** PillGroup [Cover/Contain/Fill/None] (already exists)
- **Position:** Two-row layout — Horizontal [Left/Center/Right] + Vertical [Top/Center/Bottom] (already exists)
- **Focal point indicator:** Optional — show a small crosshair on the preview thumbnail indicating object-position

**No changes needed for core image controls** — they already exist and work.

**Enhancement:** Add a visual indicator on the image preview thumbnail showing the current fit/position. This is a nice-to-have, not critical.

**Files affected:**
- `app/admin/editor/Inspector.js` — minor polish to ImageControls layout

---

## Phase 5 — Section Design Controls

### Problem
No section-level controls exist. The only section-level config is the enabled toggle.

### Implementation

**New DB column:** `sectionStyleOverrides TEXT` (separate from element-level `styleOverrides`)

**New section-level override structure:**
```json
{
  "contentWidth": "1200px",
  "alignment": "center",
  "paddingTop": "80px",
  "paddingBottom": "80px",
  "backgroundPreset": "dark",
  "overlayOpacity": 0.4
}
```

**SectionControls component (new in Inspector.js):**
- Visible when section is selected but no element is selected
- **Layout:** Content width [Narrow/Standard/Wide], Alignment [Left/Center/Right]
- **Spacing:** Padding Top [PillGroup], Padding Bottom [PillGroup]
- **Background:** Preset [Dark/Light/Warm/Stone], Overlay opacity [slider]

**Registry update:** Add `sectionCapabilities` to `SECTION_REGISTRY`:
```js
hero: {
  sectionCapabilities: ['layout', 'spacing', 'background', 'overlay'],
  // ...
}
```

**Section component updates:** Each section component reads `sectionStyleOverrides` and applies:
- `maxWidth` from contentWidth
- `paddingTop`/`paddingBottom` from spacing
- Background color from preset
- Overlay opacity

**DB migration:** Add `sectionStyleOverrides TEXT` and `draftSectionStyleOverrides TEXT` columns.

**Files affected:**
- `lib/db.js` — migration for new columns
- `lib/cms.js` — saveDraftSection/publishSection updates
- `app/api/admin/content/[page]/[sectionKey]/route.js` — accept new field
- `app/admin/editor/Inspector.js` — new SectionControls component
- `app/admin/editor/EditorClient.js` — new handleSectionStyleChange
- `app/admin/editor/Canvas.js` — pass sectionStyleOverrides
- `app/admin/editor/sections/registry.js` — add sectionCapabilities
- `app/admin/editor/sections/*.js` — apply sectionStyleOverrides
- `app/HomeClient.js` — apply sectionStyleOverrides (CRITICAL for WYSIWYG)

---

## Phase 6 — CTA Controls

### Problem
CTA controls exist but need URL validation and polish.

### Implementation

**Inspector CTA controls (already exist, enhance):**
- **Content:** Label input (already exists)
- **URL:** Input with validation feedback (enhance with visual validation indicator)
- **Style:** Variant [Outline/Filled/Ghost] + Size [S/M/L] (already exists)
- **Alignment:** [Left/Center/Right] (already exists)

**URL validation:**
- Client-side: Check URL format (http/https/mailto/tel/relative path)
- Server-side: Validate before publish in API route
- Visual feedback: Green checkmark for valid, red warning for invalid

**Files affected:**
- `app/admin/editor/Inspector.js` — add URL validation feedback
- `app/api/admin/content/[page]/[sectionKey]/route.js` — enhance URL validation

---

## Phase 7 — Responsive Editing

### Problem
Desktop/Mobile toggle only changes canvas width. No mobile-specific overrides.

### Implementation

**Extend styleOverrides structure:**
```json
{
  "title": {
    "fontSize": "56px",
    "mobile": {
      "fontSize": "36px"
    }
  }
}
```

**EditorClient changes:**
- `handleStyleChange` checks `viewMode`:
  - If `desktop`: write to `overrides[elementKey][property]`
  - If `mobile`: write to `overrides[elementKey].mobile[property]`
- `getStyleValue(elementKey, property)`:
  - If `desktop`: return `overrides[elementKey][property]`
  - If `mobile`: return `overrides[elementKey].mobile[property] ?? overrides[elementKey][property]` (inherit)

**Inspector display:**
- Show current value with mode label:
  - Desktop mode: `Font Size: 56px`
  - Mobile mode: `Font Size: 36px (Mobile)` or `Font Size: 56px (Inherited)`
- Add "Reset to inherited" button when mobile override exists

**Section component updates:**
- Read `viewMode` prop (passed from Canvas → section component)
- Apply mobile overrides when in mobile mode
- Apply desktop overrides when in desktop mode

**Canvas changes:**
- Pass `viewMode` to section components
- Section components check `viewMode` to determine which overrides to apply

**Files affected:**
- `app/admin/editor/EditorClient.js` — viewMode-aware handleStyleChange
- `app/admin/editor/Inspector.js` — show mode label, reset button
- `app/admin/editor/Canvas.js` — pass viewMode to sections
- `app/admin/editor/sections/*.js` — read viewMode, apply correct overrides
- `app/HomeClient.js` — apply mobile overrides for public site

---

## Phase 8 — Element Hierarchy in Sidebar

### Problem
The left panel only shows section names. No element-level navigation.

### Implementation

**Extend sidebar to show elements:**
```
Hero (selected)
  ├─ Eyebrow (selected)
  ├─ Title
  ├─ Subtitle
  ├─ Image
  └─ CTA
Philosophy
  ├─ Eyebrow
  ├─ Title
  ├─ Body
  └─ Image
...
```

**Implementation approach:**
- When a section is clicked in the sidebar, expand it to show its elements
- Clicking an element selects it (same as clicking on canvas)
- Currently selected element is highlighted
- Section name acts as a collapse/expand toggle

**Files affected:**
- `app/admin/editor/EditorClient.js` — track expanded sections
- `app/admin/editor/sections/registry.js` — already has element definitions

**No new component needed** — modify the existing sidebar rendering in EditorClient.js.

---

## Phase 9 — Inspector UX

### Problem
Inspector is a long form with all controls visible at once.

### Implementation

**Already partially implemented** — ControlGroup components are collapsible.

**Enhancements:**
- Default state: Only the first ControlGroup open, rest collapsed
- Smooth collapse/expand animation (CSS transition on max-height)
- Section header shows element type icon (text/image/button)
- Clear visual hierarchy: section name > element name > control groups

**Files affected:**
- `app/admin/editor/Inspector.js` — update ControlGroup defaults, add icons

---

## Phase 10 — Live State

### Problem
Must ensure all changes update canvas immediately without unnecessary re-renders.

### Implementation

**Already implemented correctly:**
- `handleFieldChange` updates state → Canvas re-renders with new data
- `handleStyleChange` updates state → Section components re-render with new overrides
- No database writes on keystroke — only on Save Draft

**Verification needed:**
- Confirm no full-editor re-renders on control changes
- Confirm Canvas sections re-render independently (not all sections)
- Use React DevTools to verify

**Potential optimization:**
- Wrap section components in `React.memo` with shallow comparison
- Only re-render the affected section when its data changes

**Files affected:**
- `app/admin/editor/sections/*.js` — add React.memo wrapper

---

## Phase 11 — Undo/Redo Architecture

### Problem
No history stack for editor changes.

### Assessment:
The current state architecture (`setSections` with immutable updates) is compatible with undo/redo, but implementing it would require:
- A history stack (array of previous states)
- Undo/redo buttons in the toolbar
- Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- Potentially ~200 lines of new code

**Decision:** Leave for Sprint 4. The current state model CAN support it — changes are represented as immutable state transitions. Document what's needed:
- `history` array in EditorClient state
- `historyIndex` pointer
- On each state change, push to history and reset index
- Undo: decrement index, restore state
- Redo: increment index, restore state
- Limit history to 50 entries

---

## Phase 12 — Design System Safety

### Problem
Must prevent users from destroying Teakle's visual language.

### Implementation

**Already enforced by design:**
- No arbitrary CSS editing
- No font-family selection
- No z-index controls
- No absolute positioning
- No JavaScript/HTML injection

**Additional safeguards:**
- URL validation on save/publish (already exists for button URLs)
- Content field max lengths (already enforced in API route)
- Image URL validation (must be valid URL or relative path)
- Style override values clamped to design token ranges

**Files affected:**
- `app/api/admin/content/[page]/[sectionKey]/route.js` — enhance validation
- `app/admin/editor/Inspector.js` — clamp numeric inputs

---

## Phase 13 — Mobile Editor UX

### Problem
Editor must remain usable on mobile viewports.

### Implementation

**Test and fix:**
- Toolbar does not overflow on small screens
- Inspector remains usable (scrollable, controls not too small)
- Controls remain touch-friendly (44px minimum targets)
- Selected elements are visible (not hidden behind header)
- Canvas can be navigated (scroll, zoom if needed)
- No horizontal page overflow

**Potential fixes:**
- Make Inspector full-screen on mobile (overlay the canvas)
- Increase touch targets for PillGroup buttons
- Add swipe gestures for section navigation

**Files affected:**
- `app/admin/editor/Inspector.js` — responsive layout
- `app/admin/editor/EditorToolbar.js` — responsive toolbar
- `app/admin/editor/EditorClient.js` — responsive layout

---

## Phase 14 — Accessibility

### Problem
Must verify and maintain accessibility across all new features.

### Checklist:
- [ ] Keyboard element selection (Tab, Enter/Space)
- [ ] Keyboard inspector navigation (Tab through controls)
- [ ] Visible focus rings on all interactive elements
- [ ] Accessible labels on all buttons/inputs
- [ ] Proper toggle semantics (aria-pressed, aria-expanded)
- [ ] Dialog accessibility (media library modal)
- [ ] Inline editing accessibility (contentEditable aria-label)
- [ ] Sufficient contrast (4.5:1 body, 3:1 large)
- [ ] Selection state not communicated only through color (add outline + label)

**Files affected:**
- `app/admin/editor/Inspector.js` — aria labels
- `app/admin/editor/FloatingToolbar.js` — aria labels
- `app/admin/editor/sections/*.js` — aria labels on contentEditable

---

## Phase 15 — Performance

### Problem
Must verify no performance regressions.

### Checks:
- [ ] No unnecessary full-canvas re-renders on control changes
- [ ] No duplicate image loading
- [ ] No excessive client-side state
- [ ] No hydration errors
- [ ] No console warnings
- [ ] No unnecessary dependencies

**Optimization:**
- Wrap section components in `React.memo`
- Use `useMemo` for computed values in Inspector
- Lazy-load media library modal

**Files affected:**
- `app/admin/editor/sections/*.js` — React.memo
- `app/admin/editor/Inspector.js` — useMemo

---

## Phase 16 — Browser Verification

### Test Matrix

**TEST 1 — TEXT EDITING:**
1. Open Homepage Visual Editor
2. Select Hero section
3. Select Hero title (click on canvas)
4. Double click title → enter inline editing mode
5. Change text → verify canvas updates immediately
6. Press Escape → verify edit is cancelled/reverted
7. Double click again → change text → press Enter → verify commit
8. Change font size in Inspector → verify canvas
9. Change weight → verify canvas
10. Change alignment → verify canvas

**TEST 2 — IMAGE EDITING:**
1. Select Hero image (click on image area)
2. Open Media → verify empty-state behavior
3. Replace image when asset exists
4. Change fit → verify canvas
5. Change position → verify canvas

**TEST 3 — CTA EDITING:**
1. Select CTA button
2. Change label → verify canvas
3. Change URL → verify canvas
4. Change variant → verify canvas
5. Change size → verify canvas

**TEST 4 — SECTION CONTROLS:**
1. Select Hero section (click section wrapper, not element)
2. Change spacing → verify canvas
3. Change background → verify canvas

**TEST 5 — MOBILE RESPONSIVE:**
1. Switch Desktop → Mobile
2. Verify responsive preview (375px canvas)
3. Change a mobile typography value
4. Verify desktop remains unchanged
5. Switch back to desktop
6. Verify correct inheritance/override

**TEST 6 — PERSISTENCE:**
1. Make multiple changes (text, image, style)
2. Save Draft
3. Reload
4. Verify every changed value persists

**TEST 7 — PUBLISH:**
1. Publish changes
2. Open public page
3. Verify published values are reflected
4. Verify editor-only UI is absent publicly

**TEST 8 — AUTH:**
1. Verify unauthenticated access blocked

**TEST 9 — REGRESSION:**
1. Run 51/51 Sprint 1 tests
2. Run editor verification (target 38+ PASS, 0 FAIL)
3. Run production build (0 errors)
4. Verify public routes
5. Scan console errors

---

## Files Changed (Expected)

### New Files
- `app/admin/editor/FloatingToolbar.js` (~200 lines)

### Modified Files
- `app/admin/editor/EditorClient.js` — editingElement state, sectionStyleOverrides, viewMode-aware overrides, element hierarchy
- `app/admin/editor/Inspector.js` — SectionControls, enhanced TypographyControls, URL validation, responsive layout
- `app/admin/editor/Canvas.js` — pass new props, render FloatingToolbar, sectionStyleOverrides
- `app/admin/editor/EditorToolbar.js` — responsive layout
- `app/admin/editor/sections/registry.js` — sectionCapabilities, derive editableFields from SECTION_ELEMENTS
- `app/admin/editor/sections/*.js` (9 files) — inline editing, sectionStyleOverrides, React.memo, sectionKey prop
- `app/HomeClient.js` — apply styleOverrides + sectionStyleOverrides (CRITICAL)
- `lib/db.js` — migration for sectionStyleOverrides columns
- `lib/cms.js` — save/publish sectionStyleOverrides
- `app/api/admin/content/[page]/[sectionKey]/route.js` — accept sectionStyleOverrides, enhanced validation

### Unchanged Files
- `app/page.js` — no changes
- `app/layout.js` — no changes
- `app/homepage.css` — no changes (CSS tokens already exist)
- `styles.css` — no changes
- `Header.js`, `Footer.js` — no changes
- All public site components — no changes

---

## Implementation Order

1. **Architecture fixes first** (before any new features):
   - Fix WYSIWYG: Apply styleOverrides in HomeClient.js
   - Fix dual registry: Derive editableFields from SECTION_ELEMENTS
   - Fix hardcoded section keys: Pass sectionKey as prop

2. **Phase 1: Inline text editing** (highest user impact)

3. **Phase 3: Rich typography controls** (enhance existing)

4. **Phase 2: Floating toolbar** (depends on Phase 1 + 3)

5. **Phase 5: Section design controls** (new capability)

6. **Phase 4: Image editing polish** (minor)

7. **Phase 6: CTA controls polish** (minor)

8. **Phase 7: Responsive editing** (new capability)

9. **Phase 8: Element hierarchy** (UI enhancement)

10. **Phase 9: Inspector UX** (polish)

11. **Phase 10-16: Verification phases** (after implementation)

---

## Estimated Line Count Changes

| Area | Current | Estimated | Delta |
|---|---|---|---|
| EditorClient.js | 325 | ~450 | +125 |
| Inspector.js | 750 | ~950 | +200 |
| Canvas.js | 180 | ~220 | +40 |
| FloatingToolbar.js | 0 | ~200 | +200 |
| registry.js | 299 | ~340 | +41 |
| Section components (9) | ~2,200 | ~2,800 | +600 |
| HomeClient.js | 644 | ~750 | +106 |
| lib/db.js | ~380 | ~400 | +20 |
| lib/cms.js | 222 | ~260 | +38 |
| API route | 165 | ~190 | +25 |
| **Total** | **~5,165** | **~6,560** | **~+1,395** |

---

## Remaining Limitations (Deferred to Sprint 4+)

- Section drag/drop reordering
- Add/remove sections
- Undo/redo implementation
- AI content generation
- Collaboration
- Version history
- Templates
- Tablet-specific editing
- Freeform absolute positioning
- Shopify integration
- Focal point selector (image)
- Keyboard shortcuts beyond basic

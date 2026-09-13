# Sprint 13 — Final Report
## Image Focal-Point Editing

**Date:** 2026-09-13
**Branch:** sprint-5-product-experience
**Baseline:** 360/360 tests (Sprint 1–12)
**Result:** 483/483 tests, clean build

---

## 1. Existing Image Architecture Discovered

### Editor Sections (8 components)
All use `backgroundImage` CSS with `backgroundSize: cover` and `backgroundPosition` from `styleOverrides.image.backgroundPosition` (defaults to `'center'`):
- HeroSection, SignatureSection, CraftsmanshipSection, LifestyleSection, PhilosophySection, PageHeroSection, PageOriginSection, PageGallerySection

### Public Site (HomeClient.js)
Uses `<img>` tags with `resolveElementStyle('image', {}, heroOver, isMobile)` for inline styles. CSS sets `object-fit: cover; object-position: center 30%` for the hero.

### Inspector ImageControls
Had `objectPositionX`/`objectPositionY` discrete controls (left/center/right, top/middle/bottom) — but these were **never used** by section components (which read `backgroundPosition` instead). The existing position controls were non-functional.

### Key Disconnect Found
Inspector stored `objectPositionX`/`objectPositionY` but sections read `backgroundPosition`. HeroSection had dead `objectFit`/`objectPosition` on a `backgroundImage` div (no effect).

## 2. Existing Crop/Object-Position Behavior

- **Editor sections**: `backgroundPosition: styleOverrides?.image?.backgroundPosition || 'center'` — keyword-based, not percentage
- **Public site CSS**: `object-position: center 30%` — hardcoded, not configurable
- **Inspector**: `objectPositionX`/`objectPositionY` — discrete keywords, disconnected from rendering

## 3. Focal-Point Data Model

```json
{
  "image": {
    "focalX": 50,
    "focalY": 30,
    "tablet": { "focalX": 60, "focalY": 40 },
    "mobile": { "focalX": 50, "focalY": 20 }
  }
}
```

- **Element-level** (per image element in a section)
- **Stored as percentage coordinates** (0–100)
- **Responsive** (desktop → tablet → mobile via existing subkey pattern)
- **No new DB columns** — stored within existing `styleOverrides` JSON

## 4. Editor UI Implementation

### FocalPointPicker Component
- Visual image preview with `object-fit: cover`
- Draggable marker (white circle with drop shadow)
- Crosshair lines showing horizontal/vertical position
- Percentage readout (`50% / 30%`)
- Reset button (restores to 50/50 center)
- Constrained to valid bounds (0–100)
- Crosshair cursor, focus-visible box-shadow

### Keyboard Accessibility
- ArrowLeft/Right/Up/Down: 2-unit step (precise)
- Shift+Arrow: 10-unit step (fast)
- Home/End: jump to 0/100
- `role="slider"`, `aria-valuetext`, `aria-label`, `tabIndex={0}`
- Focus-visible ring on keyboard focus

## 5. Responsive Behavior

- **Desktop**: base `focalX`/`focalY` values
- **Tablet**: overrides when `focalX`/`focalY` present in `.tablet` subkey
- **Mobile**: overrides when `focalX`/`focalY` present in `.mobile` subkey
- Inheritance: mobile inherits from desktop if no mobile override exists (standard precedence)

## 6. Design-Resolution Integration

- `resolveFocalPoint(styleOverrides, elementKey, viewportOrIsMobile)` → `{ x, y }`
- `focalPointToBackgroundPosition(fp)` → `'50% 30%'` (for editor sections)
- `focalPointToObjectPosition(fp)` → `'50% 30%'` (for public `<img>` tags)
- Uses existing `normalizeViewport()` for viewport detection
- No new precedence model invented

## 7. Persistence

Focal-point values flow through existing `saveDraftSection` API:
1. Inspector calls `onStyleChange(instanceId, 'image', 'focalX', 50)`
2. EditorClient stores in `styleOverrides.image.focalX`
3. API saves as JSON in `styleOverrides` TEXT column
4. Editor reloads and resolves via `resolveFocalPoint()`
5. Public site reads same `styleOverrides` via `resolveFocalPoint()`

## 8. Undo/Redo

Focal-point changes go through existing `onStyleChange` → `pushHistory` path. No separate history mechanism needed. Reset (50/50) also goes through the same path.

## 9. Accessibility

- `role="slider"` on focal-point picker
- `aria-label` with image name
- `aria-valuetext` showing current coordinates
- `tabIndex={0}` for keyboard focus
- Arrow keys for adjustment (2-unit precise, 10-unit fast with Shift)
- Home/End for bounds
- Focus-visible ring
- Screen reader announces current position

## 10. Security Validation

- Focal-point values stored in existing `styleOverrides` JSON — no new endpoints
- API route unchanged — no focal-point-specific validation needed
- Values clamped to 0–100 by `resolveFocalPoint()` (defensive)
- NaN/Infinity handled by `clamp()` function
- CSRF, authorization, draft/public separation all preserved

## 11. Tests

**Sprint 13 new tests:** 123/123
- resolveFocalPoint helper (5 tests)
- Focal-point defaults (4 tests)
- Persistence model (4 tests)
- Responsive resolution (6 tests)
- focalPointToBackgroundPosition (2 tests)
- Section components (32 tests — 4 per section × 8 sections)
- HeroSection dead code (2 tests)
- Inspector focal-point picker (16 tests)
- Inspector accessibility (4 tests)
- Public rendering (8 tests)
- designResolution.js exports (3 tests)
- Image safety (4 tests)
- Undo/redo integration (3 tests)
- Data model integrity (3 tests)
- Responsive viewport switching (5 tests)
- Scope verification (5 tests)
- Database/API unchanged (4 tests)
- Legacy cleanup (2 tests)
- Keyboard fast movement (2 tests)
- Visual marker (8 tests)

## 12. Full Regression Total

| Suite | Tests | Result |
|-------|-------|--------|
| Sprint 34G | 51/51 | Pass |
| Sprint 5 | 20/20 | Pass |
| Sprint 8 | 55/55 | Pass |
| Sprint 9 | 99/99 | Pass |
| Sprint 10 | 10/10 | Pass |
| Sprint 11 backend | 44/44 | Pass |
| Sprint 12 | 81/81 | Pass |
| Sprint 13 | 123/123 | Pass |
| **Total** | **483/483** | **Pass** |

## 13. Build Result

Clean build — 129 pages, 0 errors, 0 warnings.

## 14. Browser Verification

Playwright MCP is disconnected. Browser verification was not performed in this session. The focal-point picker, drag behavior, keyboard behavior, and public rendering should be verified manually.

Representative viewports to test:
- Desktop: 1440, 1280
- Tablet: 1024, 768
- Mobile: 390, 375

## 15. Files Changed

- `lib/designResolution.js` — Added `resolveFocalPoint()`, `focalPointToBackgroundPosition()`, `focalPointToObjectPosition()`, `clamp()`
- `app/admin/editor/Inspector.js` — Added `FocalPointPicker` component, replaced position PillGroup, added `useRef` import, removed `IMAGE_POSITION_OPTIONS` import
- `app/admin/editor/sections/HeroSection.js` — Imports focal-point helpers, uses `focalPointToBackgroundPosition`, removed dead `objectFit`/`objectPosition`
- `app/admin/editor/sections/SignatureSection.js` — Imports focal-point helpers, uses `focalPointToBackgroundPosition`
- `app/admin/editor/sections/CraftsmanshipSection.js` — Imports focal-point helpers, uses `focalPointToBackgroundPosition`
- `app/admin/editor/sections/LifestyleSection.js` — Imports focal-point helpers, uses `focalPointToBackgroundPosition`
- `app/admin/editor/sections/PhilosophySection.js` — Imports focal-point helpers, uses `focalPointToBackgroundPosition`
- `app/admin/editor/sections/PageHeroSection.js` — Imports focal-point helpers, uses `focalPointToBackgroundPosition`
- `app/admin/editor/sections/PageOriginSection.js` — Imports focal-point helpers, uses `focalPointToBackgroundPosition`
- `app/admin/editor/sections/PageGallerySection.js` — Imports focal-point helpers, uses `focalPointToBackgroundPosition`
- `app/HomeClient.js` — Imports focal-point helpers, 5 images use `focalPointToObjectPosition` for `objectPosition`
- `scripts/test-sprint13.js` — New: 123 tests
- `.opencode/MEMORY.md` — Sprint 13 recorded

## 16. Database/API Changes

**None.** No DB schema changes. No new API endpoints. Focal-point values flow through existing `styleOverrides` JSON column via existing `saveDraftSection` API.

## 17. Remaining Canvas/Editor Work

- Freeform absolute positioning (never started)
- Grid/tile layout engine (never started)
- Public site tablet-aware responsive rendering for non-hero images

## 18. Intentionally Deferred Work

- Focal-point on product images (shop detail page) — not in scope
- Focal-point on collection hero images — not in scope
- Focal-point on process page hero images — not in scope
- Focal-point on journal/article hero images — not in scope

## 19. Git Status

Branch: `sprint-5-product-experience`
28+ commits ahead of origin (including Sprint 13 changes)
Not merged to main. Not pushed.

### Sprint 13 Changed Files (13 files):
- `lib/designResolution.js`
- `app/admin/editor/Inspector.js`
- 8 section components
- `app/HomeClient.js`
- `scripts/test-sprint13.js` (new)
- `.opencode/MEMORY.md`

## 20. Commit Hash

**Not yet committed.** Awaiting user confirmation to commit.

Suggested commit: `Sprint 13: add image focal point editing`

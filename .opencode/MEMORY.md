# TEAKLE Project Memory

## Middleware Key Derivation Bug Fix (2026-09-13)
- middleware.js `getSecretKey()` used raw `secret` but lib/session.js derived `teakle-admin:${secret}`
- Result: all admin API calls returned 401 "Invalid or expired session" despite valid JWT
- Fix: middleware.js now uses `teakle-admin:${secret}` matching session.js derivation
- Root cause: Sprint 11 defense-in-depth middleware added JWT verification but used wrong key
- All 483 tests pass after fix

## Sprint 11 Backend Complete (2026-09-12)
- 279/279 tests pass (51+20+55+99+10+44), clean build
- Middleware-level admin authorization (defense-in-depth)
- CSRF on registration and forgot-password endpoints
- Security headers: HSTS + CSP
- Crypto order numbers (crypto.randomBytes)
- Atomic bulk order status updates (single transaction)
- Admin session revocation via sessionVersion
- CSV export formula injection fix
- Session key derivation (admin vs customer secrets)
- Rate limiting: cart, wishlist, order notes, admin product-orders
- Template field-level validation
- Audit logging: template ops, payment confirm, media alt text
- Bulk orderIds max length (50), CSV export row limit (1000)
- npm audit fix for Next.js CVE
- Sprint 11 backend test suite: 44/44 tests
- Git: 10 commits on sprint-5-product-experience branch (not merged to main)
- Files changed: 24 backend files (API routes, libraries, middleware, config, tests)
- No frontend changes (Phase 15 verified)

## Canvas Drag-and-Drop Complete (2026-09-12)
- Added drag-and-drop section reordering directly on the canvas
- Drag handles (⠿) appear on hover/selection at top-right of each section
- Canvas sections are drop targets with midpoint-based insertion
- Blue insertion line indicators show drop position
- Dragged section fades to 40% opacity
- Reuses existing handleReorderSections API
- Sidebar drag-and-drop continues to work unchanged
- Files changed: Canvas.js (drag handles + drop zones), EditorClient.js (unified drag handlers)
- Commit: ba50603

## Sprint 13 Complete (2026-09-13)
- 483/483 tests pass (51+20+55+99+10+44+81+123), clean build (129 pages)
- Image focal-point editing — controls which portion of an image remains visually emphasized when cropped
- Added resolveFocalPoint(), focalPointToBackgroundPosition(), focalPointToObjectPosition() to designResolution.js
- Focal point stored as focalX/focalY (0-100 percentages) in existing styleOverrides JSON — no new DB columns
- Responsive focal points: desktop → tablet → mobile via existing subkey pattern (focalX/focalY under .tablet/.mobile)
- Inspector: replaced discrete objectPositionX/Y PillGroup with visual FocalPointPicker component
- FocalPointPicker: image preview, draggable marker, crosshair lines, percentage readout, Reset button
- Keyboard accessibility: ArrowLeft/Right/Up/Down (2-unit step), Shift+arrow (10-unit fast), Home/End, role="slider", aria-valuetext
- 8 editor section components updated: HeroSection, SignatureSection, CraftsmanshipSection, LifestyleSection, PhilosophySection, PageHeroSection, PageOriginSection, PageGallerySection
- All sections now use focalPointToBackgroundPosition(resolveFocalPoint(...)) for backgroundPosition
- Public site (HomeClient.js): 5 hero/craftsmanship/workshop/process images use focalPointToObjectPosition for objectPosition
- Removed dead code: HeroSection objectFit/objectPosition on backgroundImage div (had no effect)
- Removed unused IMAGE_POSITION_OPTIONS import from Inspector
- Focal point flows through existing saveDraftSection API (styleOverrides JSON) — no API changes
- Undo/redo: focal-point changes go through existing onStyleChange → pushHistory path
- Files changed: lib/designResolution.js, app/admin/editor/Inspector.js, app/admin/editor/sections/{HeroSection,SignatureSection,CraftsmanshipSection,LifestyleSection,PhilosophySection,PageHeroSection,PageOriginSection,PageGallerySection}.js, app/HomeClient.js, scripts/test-sprint13.js (new, 123 tests)

## Sprint 12 Complete (2026-09-13)
- 360/360 tests pass (51+20+55+99+10+44+81), clean build (129 pages)
- Tablet canvas editing & responsive layout controls
- Added normalizeViewport() helper to designResolution.js — accepts string or legacy boolean
- Updated all 4 resolver functions (resolveElementStyle, resolveTypography, resolveSectionStyle, resolvePageDesign) to support tablet viewport
- Precedence: desktop → tablet → mobile (each overrides previous)
- Data model: tablet subkey alongside mobile subkey in styleOverrides, sectionStyleOverrides, pageDesign JSON
- No DB schema changes — tablet stored in same TEXT columns
- EditorToolbar: 3 viewport buttons (Desktop/Tablet/Mobile) with aria-pressed
- Canvas: 768px tablet viewport width, centered with shadow
- EditorClient: handleStyleChange and handleSectionStyleChange store tablet overrides under .tablet subkey
- Inspector: accepts viewMode prop, computes resolvedStyleOverrides merging responsive subkeys
- FloatingToolbar: accepts viewMode prop, resolves tablet overrides
- PageDesignPanel: "Tablet Overrides" section (content width, spacing)
- All 13 section components: updated getStyle() to handle tablet viewport
- Backward compatible: all existing callers pass boolean isMobile and still work
- Files changed: lib/designResolution.js, app/admin/editor/EditorToolbar.js, app/admin/editor/Canvas.js, app/admin/editor/EditorClient.js, app/admin/editor/Inspector.js, app/admin/editor/FloatingToolbar.js, app/admin/editor/PageDesignPanel.js, all 13 section components, scripts/test-sprint12.js (new)

## Sprint 11 Complete (2026-09-11)
- 235/235 tests pass (51+20+55+99+10), clean build
- Fixed 50/51 regression: Account link now intentionally in drawer as secondary (test updated)
- Fixed 1280px header overlap: nav-links gap reduced from var(--space-lg) to var(--space-md)
- Fixed mobile signature CTA touch targets: min-height 28px → 44px on all breakpoints
- Fixed critical CSS: signature button text was 5.6px (illegible), now 14px; grid gap conflict resolved; thumbnail size regression fixed
- Accessibility: mobile search input/submit focus-visible styles added
- Removed unused framer-motion dependency
- Added error logging to 4 empty catch blocks (studio/page.js, Header.js)
- Removed dead CSS rules (.v2-sig-editorial-nav, .v2-sig-editorial-tag, .v2-sig-editorial-meta)
- Removed 3 unused exports from lib/designResolution.js (getVariantId, resolveSection, getBackgroundClass)
- Added fetchPriority="high" to Studio hero image
- Audit findings documented (not fixed): no next/image anywhere, full products.js in client bundle, Pexels URLs bypass optimization
- Git: 10 commits on sprint-5-product-experience branch (not merged to main)

## Sprint 10 Complete (2026-09-11)
- 10/10 tests pass, clean build
- Hero eyebrow fixed: "An Indian Workshop" (was debug data "Verify-...")
- Mobile header: 2 icons (search + cart), account/wishlist in drawer
- Studio suppressHydrationWarning applied
- Text contrast: lifestyle gradient 0.88, process story text-shadow
- Section spacing normalized to --space-3xl
- Final report at .opencode/reports/sprint10-final-report.md

## Sprint 9 Complete (2026-09-08)
- 99/99 + 55/55 + 51/51 + 20/20 = 225/225 tests pass, clean build
- Studio now uses shared `lib/designResolution.js` — same resolution layer as Homepage
- Studio page.js: imports `getPageDesignSettings`, `resolvePageDesign`, `resolveVariant`, `parseStyleOverrides`, `parseSectionOverrides`, `resolveSectionStyle`, `getVariantClass`
- Studio page design: `getPageDesignSettings('studio')` → `resolvePageDesign(pageDesign, false)` → CSS custom properties (--studio-content-width, --studio-section-padding, --studio-gap, --studio-heading-scale, --studio-colors)
- Studio variant resolution: `resolveVariant('hero'|'origin'|'materials'|'gallery', variant)` for all 4 CMS-backed sections
- Studio section overrides: `resolveSectionStyle(parseSectionOverrides(sectionStyleOverrides), pd, false)` for background, padding, contentWidth
- Studio element overrides: `parseStyleOverrides(styleOverrides)` parsed for hero, origin, materials, gallery
- New section variants in registry.js: origin (standard/centered), materials (standard/compact), gallery (standard/full)
- New CSS variant classes in styles.css: .page-hero--split, .page-hero--minimal, .origin--centered, .materials--compact, .gallery--full
- CSS responsive breakpoints for all variant classes at 860px and 560px
- Studio CSS now uses CSS custom properties from page design (contentWidth, sectionPadding, gap, headingScale)
- All content preserved: hero, origin, materials, gallery, process (hardcoded) — all text, images, SVGs, milestones unchanged
- StudioRoadmap component unchanged (client-side IntersectionObserver + scroll animation)
- Process section remains hardcoded (not CMS-backed per Sprint 7 spec)
- Homepage untouched — `page.js` and `HomeClient.js` imports and behavior verified unchanged

## Sprint 8 Complete (2026-09-08)
- 55/55 + 51/51 + 20/20 = 126/126 tests pass, clean build, all viewports verified
- New file: `lib/designResolution.js` — shared design resolution utility (variant, element, section, page design)
- Homepage: variant-aware rendering for hero (full/split/minimal), philosophy (standard/centered), signature (standard/gallery), craftsmanship (standard/process)
- Page design now flows server→client: `page.js` fetches `getPageDesignSettings('home')` and passes to HomeClient
- Section-level overrides (contentWidth, alignment, padding, background) now applied publicly via `resolveSectionStyle()`
- Element-level overrides (fontSize, fontWeight, etc.) applied via `resolveElementStyle()` and `resolveTypography()`
- Desktop→Mobile override precedence: mobile values override desktop when `isMobile` is true
- API fix: variant now passed through from PUT route to `saveDraftSection()`
- CSS: new variant classes (.v2-hero--split, .v2-hero--minimal, .v2-philosophy--centered, .v2-sig-editorial--gallery) with responsive breakpoints
- Removed dead aliases (parseOverrides, elStyle, typoStyle) from HomeClient.js

## Sprint 7 Progress (2026-09-08)
- Phases 0-1 + Steps A-I complete: public site audit, page system definition, CMS renderer architecture
- 4 new CMS-backed sections: trust-bar, collection-carousel, product-grid, materials
- Homepage: all 9 sections now CMS-backed (hero, trust-bar, philosophy, signature, craftsmanship, collection-carousel, product-grid, workshop-story, process-story)
- Studio: materials section now CMS-backed (hero, origin, materials, gallery)
- DB is source of truth for page composition via `getPublishedPageSections(page)` + `seedDefaultSections()`
- Registry defines allowed types; DB defines actual instances (sectionKey + instanceId + sortOrder + enabled)
- Product data stays in products.js; CMS stores selectedProductIds[] as JSON in body field
- Shop/process CMS editorial sections deferred — requires per-product page keys (e.g. 'shop/anchor-table')
- Legal/utility pages kept hardcoded per spec
- 51/51 + 20/20 tests pass, clean build, all viewports verified (desktop 1440, tablet 768, mobile 390)

## Sprint 6.1 Complete (2026-09-07)
- All 15 phases completed, 51/51 + 20/20 tests pass, clean build
- Browser: 13/13 PASS, 1 WARN (benign 404), 0 FAIL
- Public site: 12/12 PASS at mobile + desktop viewports
- Key changes: undo/redo deep clone, keyboard shortcut fix (skip in inputs), delete selects nearest section, modal focus management, responsive editor CSS, ARIA roles/labels, focus-visible CSS, prefers-reduced-motion, debounced page design API, CSRF on design route

## Sprint 3-5 Complete
- Sprint 3: 51/51 tests, registry.js variable ordering fix
- Sprint 5: 20/20 tests, templates/variants/page design
- Sprint 6: Page design UI, template UX, variant UX, accessibility

## Architecture Notes
- `registry.js`: SECTION_ELEMENTS → deriveEditableFields → SECTION_REGISTRY
- `HomeClient.js`: typoStyle/elStyle helpers with isMobile param
- Mobile overrides: `.mobile` subkey in styleOverrides JSON
- Section overrides: `sectionStyleOverrides` / `draftSectionStyleOverrides` DB columns
- Editor responsive CSS: `.editor-main-layout`, `.editor-section-list`, `.editor-canvas-area`, `.editor-inspector`
- Modal focus: `useModalFocus(isOpen)` hook saves/restores trigger element
- New sections: TrustBarSection, CollectionCarouselSection, ProductGridSection, MaterialsSection (editor components)
- JSON body fields: trust-bar items, collection-carousel productIds, product-grid productIds, materials items
- `seedDefaultSections(page)` creates missing CMS sections with defaults on first render

## Verification
- Tests: `node scripts/test-sprint34g.js` (51) + `node scripts/test-sprint5.js` (20) + `node scripts/test-sprint8.js` (55) + `node scripts/test-sprint9.js` (99) + `node scripts/test-sprint10.js` (10) + `node scripts/test-sprint11-backend.js` (44) + `node scripts/test-sprint12.js` (81) + `node scripts/test-sprint13.js` (123)
- Editor requires login: `testadmin@teakle.in` / `TestPassword123`
- Dev server: `node node_modules\next\dist\bin\next dev --port 3099`

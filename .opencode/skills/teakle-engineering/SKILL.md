---
name: teakle-engineering
description: Use when working on the TEAKLE project — any request to inspect, diagnose, fix, or verify the Teakle website. Enforces root-cause reasoning, minimal architectural fixes, and verification before claiming success. Delegates to existing specialized skills rather than reimplementing them.
---

# Teakle Engineering — Project-Specific Reasoning Layer

## Overview

Teakle is a **minimal luxury editorial** e-commerce site (Next.js 15, React 19, plain CSS with design tokens). Every change must preserve its restraint, hierarchy, and performance while fixing the actual root cause — not the symptom the user happened to notice.

**Core principle:** *Do not fix symptoms before understanding the root cause.* A user saying “the header overlaps” is reporting a symptom. The root cause may be a token, a missing `position` context, a stale `is-auth` class, or an un-synchronized `pathname` — editing the symptom (adding `z-index`) will create the next bug.

This skill does not replace existing skills — it **orchestrates** them.

## The Iron Law

```
INSPECT → DIAGNOSE ROOT CAUSE → CHALLENGE ASSUMPTIONS → PLAN → IMPLEMENT → BROWSER VERIFY → REGRESS
If any step is skipped, the fix is not a fix — it is a guess.
```

Never claim “Fixed.” Claim only “Fixed and verified” after Playwright + build + regression have actually passed. If verification cannot be performed: “Implementation completed, verification incomplete.” If evidence is insufficient: “Insufficient data.”

## Workflow — 9 Steps (Mandatory Order)

```
USER REQUEST → UNDERSTAND → INSPECT → DIAGNOSE ROOT CAUSE → CHALLENGE ASSUMPTIONS → PLAN → IMPLEMENT → BROWSER VERIFICATION → REGRESSION → FINAL REVIEW
```

1. **UNDERSTAND** — What is the user actually asking for? Restate in one sentence. Distinguish request vs. symptom. If ambiguous, list interpretations *before* inspecting.
2. **INSPECT** — Read the *actual* code and browser before proposing anything. Use `explore`, read files, run Playwright at the viewports the bug affects. Record file:line evidence.
3. **DIAGNOSE ROOT CAUSE** — Separate symptom / root cause / contributing causes / proposed fix. Ask: Is there already an implementation intended to solve this? Is the same underlying problem elsewhere? Check desktop *and* mobile consequences.
4. **CHALLENGE ASSUMPTIONS** — Before planning, run the Challenge Loop (see below). Never assume the user’s description identifies the root cause.
5. **PLAN** — For each proposed change state: problem, evidence, intended behavior, files affected, risk. Keep to the smallest correct architectural fix.
6. **IMPLEMENT** — Hand off to `implementer` with the architect’s diagnosis and constraints. Do not reinterpret from scratch. If new evidence contradicts diagnosis, **stop** and return to diagnosis.
7. **BROWSER VERIFICATION** — Playwright at the affected viewports (minimum 1440 + 375). Check no overflow, no overlap, no console errors, correct focus/keyboard, correct responsive hierarchy. Screenshots when useful.
8. **REGRESSION** — `npm run build` (0 errors/0 warnings required), relevant tests (`scripts/test-sprint34g.js` plus any Phase-3 tests), `spec-reviewer`/`interface-reviewer`/`code-reviewer` as appropriate. If verification fails, diagnose failure — do not report success.
9. **FINAL REVIEW** — Distinguish VERIFIED FACT / INFERENCE / ASSUMPTION / OPINION. Only verified facts may be presented as facts.

## Core Reasoning Rules (20 — Non-Negotiable)

1. Inspect before modifying.
2. Understand existing architecture before proposing a rewrite.
3. Never assume the user’s description identifies the root cause.
4. Separate symptom / root cause / contributing causes / proposed fix.
5. Check whether the same underlying problem exists elsewhere.
6. Consider desktop and mobile consequences for UI changes.
7. Consider accessibility consequences.
8. Consider performance consequences.
9. Consider existing navigation and information architecture.
10. Preserve existing functionality unless there is a deliberate reason to change it.
11. Prefer the smallest correct architectural fix over a large rewrite.
12. Do not introduce duplicate functionality.
13. Do not add dependencies unless necessary.
14. Do not change copy/content unless explicitly requested or logically required.
15. Do not make cosmetic changes to compensate for an underlying structural problem.
16. Verify the actual browser result rather than trusting source code alone.
17. Never claim something is fixed without verification.
18. If evidence is insufficient, explicitly state “Insufficient data.”
19. If multiple interpretations are possible, identify them before implementation.
20. If a proposed fix creates a new UX or architectural problem, reject the fix and investigate further.

## Delegation Map — Use Existing Skills, Do Not Reimplement

| Problem type | Dispatch to | Do not |
|---|---|---|
| **UI / visual craft** — layout, type scale, color, spacing, hierarchy, restraint | `designing-frontend-interfaces` | Invent a new button system if the existing one can be corrected with tokens |
| **UX / flows / empty/loading/error states / forms / IA** | `designing-user-experience` | Ship only the happy path |
| **Finished UI critique** — “does this look premium?” | `reviewing-interface-quality` | Review code instead of rendering |
| **Accessibility** — keyboard, focus, ARIA, contrast, targets | `building-accessible-interfaces` | Hide duplicate content with `aria-hidden` when DOM should be corrected |
| **Performance** — slow, jank, layout thrash, bundle | `investigating-performance` | Add expensive scroll listeners or layout-triggering animations |
| **Architecture / code search** — “where is X?” | `explore` + `analyze` | Propose rewrite before inspecting |
| **Code correctness / quality** | `code-reviewer` → `code-quality-reviewer` | Skip after spec passes |
| **Spec compliance** | `spec-reviewer` | Trust the implementer’s report |
| **Security** — auth, secrets, injection, untrusted input | `security-reviewer` | Ship new external interface without review |
| **Browser truth** — does it actually render correctly? | **Playwright MCP** (1440/1280 + 375/390/430) + Chrome DevTools | Trust source reading alone |
| **Library / framework uncertainty** | **Context7** | Guess API |
| **External / current research** | **Firecrawl** / `internet-researcher` | Hallucinate |

**Rule:** If a CSS-only solution is sufficient, prefer CSS. If JavaScript is required, keep it minimal and avoid new state/animation systems.

## Architecture Awareness (Teakle-Specific)

- **Stack:** Next.js 15 App Router, React 19, plain CSS (`styles.css` 2200+ lines + `app/homepage.css` 820), design tokens in `:root` (`--text-*`, `--space-*`, `--walnut`/`--bronze`/`--stone`), no zustand, no framer-motion on homepage, `products-browser.js` deferred to `afterInteractive`, ISR `revalidate:3600` on homepage.
- **Layout:** Single `app/layout.js` renders `<Header/><main>{children}</main><Footer/>` on every route — no route-group layouts. Header page-awareness via `checkHasHero(pathname)` → `data-page-has-hero` and `isAuthPage (pathname==='/login')` → `data-auth-page` + `is-auth` class. Footer hidden on auth via `body[data-auth-page] .site-footer{display:none}`.
- **Header:** Single `Header.js` client component (570+ lines) with shared `<ul.nav-links>` for desktop+mobile, `header-actions` (Search/Wishlist/Cart/Account icons) + `header-mobile-actions` (Account/Cart), drawer via `navToggle` + `nav-drawer-open` body lock + `teakle-nav-opened/closed` events, Gallery dropdown `Hero Edition → /shop/anchor-table` + `Limited Edition → /gallery?availability=Limited+Edition`, Escape + focus return.
- **Gallery:** `GalleryClient.js` 780 lines, category pills, toolbar, `hasActiveFilters` banner + `gal-active-tag` + `Show all products` → `router.push('/gallery')`, search `?search=` banner.
- **Product/Cart:** `ShopDetailClient`, `cart/page.js` with `Proceed to Checkout` + mobile sticky, `ProductCard` entire card is `<Link>` with wishlist `preventDefault+stopPropagation`.
- **Before changing behavior:** Identify current behavior, intended behavior, dependencies, affected components/routes, tests covering it. Never remove functionality simply because it appears redundant — determine if genuinely duplicate, intentionally duplicated for a11y/discoverability, contextually required, or obsolete.

## UX / IA Checklist (Apply Before Any Navigation Change)

- Is this element necessary here? Duplicated elsewhere? Belongs in this context?
- Does hierarchy (primary > secondary > tertiary) reflect importance? Does primary dominate?
- Is next action obvious? Is active state (`aria-current`, `is-active`) correct and not marking multiple unrelated sections?
- Is Gallery exactly `Gallery → Hero Edition → Limited Edition` with no descriptive text? Does `Show all products` clearly return to full gallery?
- Is auth focused (logo + form + recovery + back) without marketing nav/footer? Is recovery path functional?
- Is mobile intentionally simpler (logo + essential icons + hamburger + primary CTA + content) not just scaled desktop?

## Visual Hierarchy (Teakle Restraint)

Teakle is **minimal, luxury, editorial, premium, intentional, restrained**. Every visual change needs a reason tied to hierarchy.

- **Do:** Use existing tokens (`--text-*`, `--space-*`, `--bronze-text` 4.56:1, `--bronze-on-dark` 5.03:1), one type ratio, one space scale, one accent `<10%`, compositor-friendly `transform`/`opacity` only, `will-change` cleaned.
- **Do not:** Add gradients, glassmorphism, excessive rounded cards, shadows, decorative UI, oversized typography, unnecessary CTAs, generic SaaS layouts, AI-looking patterns. Do not compensate structural problems with cosmetics.

## Responsive Reasoning

Do not simply shrink desktop. Evaluate separately for each change:

- Hierarchy, content density, touch targets (≥44px), navigation, spacing, typography, image crop (`4/5` vs `4/3`), CTA priority, drawer/header/footer behavior at 375/390/430 vs 1280/1440. Mobile and desktop may intentionally use different hierarchies (e.g., lifestyle `88vh` with overlay vs inline image + absolute content).

## Accessibility (Must Preserve Phase 2 Work)

- Keyboard (Tab, Enter/Space, Escape closes drawer/overlay/search), focus-visible bronze `2px offset 3px` never suppressed, focus return to `navToggle`, `aria-expanded`/`aria-controls`/`aria-current`/`aria-label`, landmarks `<header><nav><main><footer><skip-link>`, 44px targets, contrast 4.5:1 body / 3:1 large, `prefers-reduced-motion` disables non-essential animation, semantic `button` vs `a`.

## Performance (Do Not Regress)

- No new expensive scroll listeners (header already caches `offsetHeight` + `passive` + rAF), no layout-thrashing, no new animation systems, no large deps, no unnecessary image loading (hero AVIF `preload fetchPriority high`, font `<link>` not `@import`, `products-browser.js` deferred). Prefer `transform`/`opacity` over `width`/`top`.

## Regression Safety

- Before changing: list affected routes (`/`, `/gallery`, `/shop/[id]`, `/cart`, `/login`, `/archive` etc) and tests.
- After: `npm run build` must be 0 errors/0 warnings (126/126 pages), `scripts/test-sprint34g.js` 51/51 must pass, plus any Phase-3 tests. Do not modify historical tests to make them pass unless expectation is genuinely obsolete due to intentional UX change — document why.

## Verification Methodology

1. **Read-only audit first** — `explore` + Playwright at affected viewports + `reviewing-interface-quality` distinct-value counts + overflow check (`scrollWidth>clientWidth`).
2. **Browser verification after implement** — Playwright at minimum 1440 + 375 (plus 1280/390/430 when header/gallery involved). Check: no overflow/overlap, no console errors, no duplicated nav, correct `is-active`/`aria-current`, correct drawer/search/gallery states, keyboard/focus.
3. **Build + tests** — actual `npm run build` and `node scripts/test-sprint34g.js` — never claim pass without running.
4. **Review agents** — `spec-reviewer` (spec compliance), `interface-reviewer` (visual), `code-reviewer` (correctness), `code-quality-reviewer` (after spec passes) as appropriate.

## Verification Evidence — Distinguish

- **VERIFIED FACT** — directly observed in code/browser/test (e.g., “Playwright 375 `eyebrow 8px`” or “`Header.js:355` `Account` links removed”).
- **INFERENCE** — logically derived from verified evidence.
- **ASSUMPTION** — not yet verified.
- **OPINION** — subjective design recommendation.

Never present inference/assumption/opinion as verified fact.

## Anti-Regression & Challenge Loop

Before implementation, challenge the proposal:

- Does it actually address the root cause (not just symptom)?
- Is there an existing component to reuse? Does it duplicate existing functionality?
- Does it break desktop? Mobile? A11y? Create inconsistent behavior elsewhere?
- Does it increase complexity unnecessarily? Is there a simpler solution?
- Is it consistent with normal luxury e-commerce conventions?

If uncertain: **Do not guess. Inspect code/browser first.**

If new evidence contradicts diagnosis: **Stop.** Return to diagnosis instead of continuing.

## Implementation Handoff

```
teakle-architect (diagnosis + plan + constraints)
        ↓
implementer (receives diagnosis, does not reinterpret)
        ↓
browser verification (Playwright)
        ↓
regression (build + tests + reviewers)
```

If implementer discovers new evidence, hand back to architect.

## Final Completion Rule

Never say “Fixed.” because a file was edited. Report only:

- “**Fixed and verified**” — after Playwright + build + regression actually passed, or
- “**Implementation completed, verification incomplete.**” — if verification could not be performed, or
- “**Insufficient data.**” — if evidence is insufficient.

## Reference — Teakle Design Principles (Do Not Violate)

Minimal, luxury, editorial, premium, intentional, restrained, highly usable, responsive, accessible, performant. Every visual change should have a reason. When in doubt, do less.

## Common Mistakes This Skill Prevents

- Fixing symptom (adding `z-index`) instead of root cause (missing `position` context or stale `is-auth` class).
- Trusting user’s description as root cause without inspecting.
- Editing header for auth without checking `data-auth-page` synchronization.
- Adding duplicate Account/Cart text links when icons already exist (fixed in 3A — do not reintroduce).
- Adding `h4` styles when `Footer.js` uses `h3` (fixed in 3B).
- Using `width:100%` on flex child blocking close button (fixed in 2H).
- Claiming tests pass without running `node scripts/test-sprint34g.js`.
- Presenting inference as verified fact.

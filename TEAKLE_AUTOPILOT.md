# TEAKLE AUTOPILOT

## Autonomous Website Improvement Protocol

Version: 2.0

---

# 01 — PURPOSE

This document defines HOW an assigned Teakle task must be executed.

The task backlog defines WHAT must be accomplished.

Primary task source:

`TEAKLE_TASKS.yaml`

Design authority:

`TEAKLE\TEAKLE_HANDBOOK.md`

Do not use this document as a replacement task backlog.

---

# 02 — AUTHORITY ORDER

When making implementation decisions, use this order:

1. TEAKLE\TEAKLE_HANDBOOK.md
2. Existing verified rendered website
3. Existing product/content data
4. Current assigned task
5. Existing project implementation
6. Reference-site principles
7. Agent preference

Reference websites must never override Teakle's identity.

---

# 03 — TASK BOUNDARY

The agent receives ONE assigned backlog task.

The agent must:

1. understand that task
2. inspect only the relevant website areas
3. identify the smallest coherent implementation
4. implement it
5. render the result
6. verify it
7. build when implementation changed
8. report the result

Do not independently select a different project-wide task.

Do not redesign the entire website during a single task.

Do not make unrelated changes merely because they are visible.

---

# 04 — BROWSER-FIRST WORKFLOW

For visual or UX tasks:

1. Start or use the existing local Next.js development server.
2. Open the relevant route with agent-browser.
3. Inspect the rendered result.
4. Inspect the relevant DOM/accessibility structure.
5. Capture screenshots when useful.
6. Check console/runtime errors when practical.
7. Inspect the relevant responsive viewport.
8. Test affected interactions.

The rendered website is the source of truth for visual evaluation.

Source code alone is insufficient for judging visual quality.

---

# 05 — IMPLEMENTATION LOOP

For each assigned task:

OBSERVE
↓
UNDERSTAND
↓
TARGET
↓
IMPLEMENT
↓
RENDER
↓
VERIFY
↓
BUILD
↓
REPORT

Do not skip OBSERVE.

Do not implement visual changes solely from source-code assumptions when browser inspection can answer the question.

---

# 06 — DESKTOP PRINCIPLES

Teakle desktop should feel intentionally designed for large viewports.

Evaluate:

- viewport utilization
- image scale
- text width
- section proportions
- horizontal relationships
- whitespace
- typography
- materiality
- visual rhythm

Avoid:

- unnecessary narrow containers
- mobile layouts stretched across desktop
- repeated centered card layouts
- excessive empty vertical space
- generic ecommerce presentation

Major sections may use:

- extreme-left imagery
- extreme-right imagery
- wide cinematic imagery
- full-bleed imagery
- asymmetrical image/text relationships
- large editorial image fields

Use these only where they improve the actual composition.

---

# 07 — MOBILE PRINCIPLES

Mobile is independently composed.

Do not simply stack the desktop layout.

Mobile should:

- simplify
- preserve important imagery
- preserve important commerce
- preserve navigation
- maintain readable typography
- maintain comfortable spacing
- maintain usable touch targets
- avoid unnecessary repetition

Do not remove important content merely to shorten the page.

---

# 08 — TYPOGRAPHY

Use the existing Instrument Sans system.

Maintain one coherent hierarchy for:

- display
- H1
- H2
- H3
- eyebrow
- subtitle
- body
- metadata
- navigation
- utilities
- footer
- mobile UI

Evaluate:

- size
- line height
- letter spacing
- text width
- contrast
- density
- responsive scaling

Do not independently invent arbitrary typography for every section.

---

# 09 — IMAGERY

Prefer authentic Teakle imagery already present in the repository.

Do not introduce unrelated stock imagery to fill space.

For major editorial imagery prefer:

- landscape
- cinematic
- wide
- extreme-left
- extreme-right
- full-bleed
- large material/detail compositions

Before replacing an image, verify whether the problem is actually an incorrect data or CMS mapping.

Never randomly swap images to hide a data problem.

---

# 10 — PRODUCT PRESENTATION

Products should feel like considered design objects while remaining commercially functional.

Preserve:

- product name
- price
- availability
- product navigation
- wishlist
- add-to-cart
- commerce controls

Do not remove commerce functionality to make the website look more luxurious.

---

# 11 — NAVIGATION

Preserve all existing navigation functionality.

Audit only when relevant to the assigned task:

- desktop header
- mobile header
- logo
- search
- account
- wishlist
- cart
- navigation spacing
- drawer
- drawer width
- drawer hierarchy
- overlay
- transitions
- icons
- active states
- bottom navigation
- footer navigation

Use the existing Teakle logo asset.

Never redraw or reinterpret it.

---

# 12 — MOTION

Motion should be restrained and controlled.

Appropriate uses include:

- page entrance
- section reveal
- image reveal
- subtle image movement
- hover states
- carousel transitions
- drawer transitions
- navigation transitions

Avoid:

- excessive parallax
- bouncing
- constant movement
- exaggerated effects
- animation on every element
- motion that interferes with reading
- motion that interferes with purchasing

Respect reduced-motion preferences where practical.

---

# 13 — CONTENT INTEGRITY

Never invent:

- products
- prices
- specifications
- dimensions
- availability
- testimonials
- brand facts
- product claims

When an existing content relationship is incorrect:

1. identify the incorrect rendered result
2. trace its source
3. determine whether the source is product data, CMS mapping, seed data,
   component mapping or another verified source
4. correct the actual source when necessary
5. verify the rendered result

Do not randomly replace content.

---

# 14 — FUNCTIONALITY PROTECTION

Do not modify unless a verified defect specifically requires investigation:

- authentication
- database architecture
- CMS architecture
- Shopify architecture
- payment logic
- business logic
- product data structure

Preserve:

- routes
- navigation
- product pages
- product grids
- carousels
- wishlist
- account
- cart
- add-to-cart
- mobile navigation

---

# 15 — BUILD VERIFICATION

After meaningful implementation changes:

1. render again
2. inspect affected desktop areas
3. inspect affected mobile areas when relevant
4. check console/runtime
5. run:

`npm run build`

Do not claim successful implementation without verification.

---

# 16 — FAILURE HANDLING

If implementation introduces a regression:

1. identify the regression
2. determine the smallest safe correction
3. correct it
4. rerender
5. verify again

If the task cannot be safely completed:

- do not invent a solution
- do not modify unrelated systems
- report the blocker clearly

---

# 17 — COMPLETION STANDARD

A task is complete when:

- its requested scope has been implemented or verified
- the rendered result has been inspected
- relevant interactions work
- no relevant runtime regression exists
- the build passes when implementation changed
- no unrelated changes were introduced

If the task is already satisfied:

DO NOT change it merely to create progress.

---

# 18 — FINAL REPORT

At task completion record:

OBSERVED:
What was actually seen.

CHANGED:
What was actually modified.

VERIFIED:
What was tested and how.

BUILD:
Whether npm run build passed.

REMAINING:
Any relevant unresolved issue.

Do not claim work that was not performed.

---

# 19 — AUTONOMOUS CONVERGENCE

The backlog controls the sequence of work.

Do not repeatedly rediscover the same problem.

Do not skip ahead to unrelated improvements.

Do not repeat a completed task.

After a task is completed, Ralphy should advance to the next incomplete task.

The objective is progressive convergence toward the Teakle design direction while preserving the existing application.

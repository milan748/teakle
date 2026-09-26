# TEAKLE — AUTONOMOUS REFINEMENT PRD

## 01 — PROJECT

Project: Teakle Atelier

Framework: Next.js

Purpose:

Progressively refine the existing Teakle website into a contemporary architectural
atelier experience while preserving the existing application, brand identity,
product data, commerce functionality, navigation and backend architecture.

This is a refinement project.

It is NOT a rebuild.

---

# 02 — SOURCE OF TRUTH

The project uses three layers of authority.

### Design authority

`TEAKLE\TEAKLE_HANDBOOK.md`

Defines the established Teakle identity, visual language and design principles.

### Execution protocol

`TEAKLE_AUTOPILOT.md`

Defines how an assigned task must be inspected, implemented, rendered,
verified and completed.

### Work queue

`TEAKLE_TASKS.yaml`

Defines the finite autonomous tasks that Ralphy must execute.

The YAML task queue is the active execution backlog.

Do not invent additional project-wide tasks when a backlog task is assigned.

---

# 03 — AUTONOMOUS EXECUTION MODEL

Ralphy is the orchestrator.

OpenCode is the implementation engine.

agent-browser is the browser verification layer.

The execution model is:

OBSERVE
↓
UNDERSTAND
↓
IMPLEMENT
↓
RENDER
↓
VERIFY
↓
BUILD
↓
COMPLETE
↓
NEXT TASK

Each Ralphy iteration should execute one bounded task from:

`TEAKLE_TASKS.yaml`

Do not attempt to redesign the entire website during one task.

Do not repeatedly rediscover the entire project when the assigned task already
defines the relevant scope.

---

# 04 — PRIMARY OBJECTIVE

The final website should feel:

- contemporary
- architectural
- editorial
- cinematic
- tactile
- spacious
- sophisticated
- materially rich
- restrained
- premium
- intentional

The experience should communicate Teakle as an atelier and design brand rather
than as a generic ecommerce catalogue.

Luxury should come from:

- proportion
- typography
- photography
- materiality
- composition
- contrast
- whitespace
- restrained motion
- interaction quality

Do not achieve luxury through excessive decoration.

---

# 05 — EXISTING WEBSITE MUST BE PRESERVED

The implementation must preserve:

- existing routes
- existing navigation
- product pages
- product data
- product prices
- product availability
- wishlist
- account
- cart
- add-to-cart
- product grids
- product carousels
- mobile navigation
- authentication
- CMS architecture
- backend architecture
- existing business logic

Do not remove functionality merely for visual reasons.

Do not redesign the application architecture.

Do not introduce Shopify changes unless a separate task explicitly requires them.

---

# 06 — BRAND PROTECTION

Use the existing Teakle identity.

Preserve:

- established brand palette
- existing logo
- Instrument Sans
- existing product/content identity
- existing authentic Teakle imagery

Never:

- redraw the logo
- reinterpret the logo
- stretch the logo
- distort the logo
- replace the logo
- introduce unrelated fonts
- invent brand claims
- invent testimonials
- invent products
- invent prices
- invent dimensions
- invent specifications
- invent availability

---

# 07 — IMAGE DIRECTION

Major editorial imagery should generally favor:

- landscape
- cinematic
- wide
- full-bleed where appropriate
- extreme-left positioning
- extreme-right positioning
- large editorial image fields
- asymmetric image/text relationships
- material/detail photography

Avoid:

- unrelated stock photography
- decorative imagery without purpose
- repeated small centered images
- excessive portrait imagery when a wider composition is more appropriate
- images unrelated to the product or story

If a product displays an incorrect image:

1. inspect the rendered result
2. trace the actual image source
3. inspect product data/CMS mapping
4. identify the verified source of the mismatch
5. correct the source when necessary
6. verify the rendered result

Do not randomly swap images.

---

# 08 — DESKTOP DIRECTION

Desktop must look intentionally designed for a large viewport.

Do not simply stretch a mobile layout across desktop.

Evaluate:

- viewport utilization
- horizontal composition
- section width
- text width
- image scale
- section height
- whitespace
- grid relationships
- visual rhythm

Avoid unnecessarily constraining major sections to narrow or half-width
content when the composition would benefit from more space.

The Philosophy section is specifically important because it must not appear
unnecessarily confined within the desktop viewport.

Major sections may use:

- extreme-left imagery
- extreme-right imagery
- wide cinematic imagery
- full-bleed compositions
- asymmetrical layouts

when supported by the existing content and assets.

---

# 09 — HOMEPAGE DIRECTION

The homepage should feel like an editorial story.

The narrative relationship between these areas should be considered:

- hero
- announcement
- philosophy
- Atelier Stories
- featured product
- craft
- collection
- maker/workshop
- footer

Do not force every section into the same structure.

Avoid repetitive patterns such as:

```text
image + text
image + text
image + text

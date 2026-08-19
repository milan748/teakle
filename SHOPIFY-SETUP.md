# TEAKLE — SHOPIFY STORE CONFIGURATION

**Date:** August 2026
**Purpose:** Shopify store setup specification for future headless Next.js integration

---

## 1. Store Identity

| Setting | Value |
|---|---|
| Store Name | Teakle |
| Domain | teakle.in |
| Currency | INR |
| Timezone | Asia/Kolkata |
| Industry | Furniture & Home Decor |
| Business Model | Pre-made inventory + One-of-one hero product + Custom orders (separate workflow) |

---

## 2. Shopify Plan Requirements

### Required Features

| Feature | Required For | Plan Needed |
|---|---|---|
| Storefront API | Product catalogue, cart, search (headless) | Basic or higher |
| Customer Accounts | Auth, order history, wishlist | Basic or higher |
| Checkout | Order processing, payment | Basic or higher |
| Inventory Management | Hero product qty=1, stock tracking | Basic or higher |
| Product Management | 51 products + metafields | Basic or higher |
| Custom Domain | teakle.in | Basic or higher |
| Metafields | 19 custom product fields | Basic or higher |
| Shopify Flow | Automation (optional) | Basic or higher |

### Recommendation

**Shopify Basic** ($39/month as of 2026) should be sufficient for the initial headless integration. All required features (Storefront API, Customer Accounts, Checkout, Inventory, Metafields) are available on the Basic plan.

**NOT required at this stage:**
- Shopify Payments activation (can use test mode)
- Live payment gateway
- Shopify POS
- Shopify Email (can use third-party)
- Shopify Scripts (advanced checkout customization)

---

## 3. Shop Settings

### Configurable Now (from verified data)

| Setting | Value | Source |
|---|---|---|
| Store name | Teakle | Verified |
| Currency | INR | Verified |
| Timezone | Asia/Kolkata | Verified |
| Weight unit | Kilograms | Verified (products use "kg") |
| Order ID format | #TEAKLE-XXXX | Standard Shopify |

### Requires Business Decision (INSUFFICIENT DATA)

| Setting | Required For | Status |
|---|---|---|
| Business legal name | Legal pages, invoices | INSUFFICIENT DATA |
| Business address | Shipping, tax, invoices | INSUFFICIENT DATA |
| Phone number | Contact, support | INSUFFICIENT DATA |
| GSTIN | Indian tax compliance, invoices | INSUFFICIENT DATA |
| PAN | Financial compliance | INSUFFICIENT DATA |
| Business entity type | Legal compliance | INSUFFICIENT DATA |

---

## 4. Product Taxonomy

### Shopify Product Types (mapped from current categories)

| Product Type | Current Category | Product Count |
|---|---|---|
| Kitchen | kitchen | 10 |
| Living | living | 8 |
| Dining | dining | 7 |
| Bedroom | bedroom | 6 |
| Office | office | 6 |
| Bathroom | bathroom | 5 |
| Outdoor | outdoor | 5 |
| Seasonal | seasonal | 4 |

### Shopify Vendor (constant)

All products: `Teakle`

---

## 5. Collections

### Category Collections (Automated)

| Collection | Rule | Product Count |
|---|---|---|
| Kitchen | Product Type = Kitchen | 10 |
| Living | Product Type = Living | 8 |
| Dining | Product Type = Dining | 7 |
| Bedroom | Product Type = Bedroom | 6 |
| Office | Product Type = Office | 6 |
| Bathroom | Product Type = Bathroom | 5 |
| Outdoor | Product Type = Outdoor | 5 |
| Seasonal | Product Type = Seasonal | 4 |

### Editorial Collections (Manual or Automated)

| Collection | Products | Slug |
|---|---|---|
| Kitchen & Dining | Kitchen + Dining products | kitchen-dining |
| Home Décor | Living + Outdoor products | home-decor |
| Everyday Living | Living + Bedroom products | everyday-living |
| Storage | Office + Bathroom + Bedroom products | storage |

### Collection Image

Each collection should use the corresponding hero image from the current website:
- Kitchen & Dining: `https://images.pexels.com/photos/6910978/pexels-photo-6910978.jpeg`
- Home Décor: `https://images.pexels.com/photos/4612501/pexels-photo-4612501.jpeg`
- Everyday Living: `https://images.pexels.com/photos/33395641/pexels-photo-33395641.jpeg`
- Storage: `https://images.pexels.com/photos/6340708/pexels-photo-6340708.jpeg`

---

## 6. Metafield Definitions

### Namespace: `custom`

| Key | Name | Type | Category | Description |
|---|---|---|---|---|
| `material` | Material | Single line text | Product | Primary material (e.g., "Solid Teak") |
| `dimensions` | Dimensions | Single line text | Product | Physical dimensions (e.g., "180 x 90 x 76 cm") |
| `weight` | Weight | Single line text | Product | Weight (e.g., "42 kg") |
| `finish` | Finish | Single line text | Product | Surface finish (e.g., "Food-safe oil") |
| `buildTime` | Build Time | Single line text | Product | Approximate crafting time (e.g., "~18 hours") |
| `seats` | Seats | Single line text | Product | Seating capacity (only 1 product) |
| `availabilityNote` | Availability Note | Single line text | Product | Stock/shipping note (e.g., "Ships in 3-5 days") |
| `isHero` | Is Hero Product | Boolean | Product | Whether this is the one-of-one hero product |
| `story` | Story | Rich text | Product | Product story/narrative |
| `craftsmanship` | Craftsmanship | Rich text | Product | Craftsmanship details |
| `materials` | Materials Detail | Rich text | Product | Detailed materials description |
| `careInstructions` | Care Instructions | Rich text | Product | Care and maintenance guide |
| `shipping` | Shipping Info | Rich text | Product | Product-specific shipping details |
| `returns` | Returns Info | Rich text | Product | Product-specific return policy |
| `specifications` | Specifications | JSON | Product | Array of `{label, value}` objects |
| `faqs` | FAQs | JSON | Product | Array of `{q, a}` objects |
| `relatedProducts` | Related Products | JSON | Product | Array of product handles |
| `subcategory` | Subcategory | Single line text | Product | Subcategory key (e.g., "serving-boards") |
| `subcategoryName` | Subcategory Name | Single line text | Product | Subcategory display name (e.g., "Serving Boards") |

### Metafield Values

Do NOT populate metafield values during definition creation. Values will be populated during product migration from the authoritative dataset (`app/data/products.js`).

---

## 7. Product Structure

### Per Product

| Shopify Field | Source | Notes |
|---|---|---|
| Title | `product.name` | e.g., "The Anchor Table" |
| Description (HTML) | `product.description` | Convert markdown to HTML if needed |
| Product Type | `product.categoryName` | One of 8 types |
| Vendor | `Teakle` | Constant |
| Tags | `product.tags` | Comma-separated |
| Status | `active` | All products active |
| Handle | `product.id` | URL-friendly (already is) |
| Images | `product.images` | Upload to Shopify, preserve order |
| Variant Price | `product.price` | In INR (no decimals needed for INR) |
| Variant SKU | — | Leave blank (no SKUs exist) |
| Inventory | See below | Hero: 1, Standard: TBD |

### Variant Structure

Each product gets **one default variant** with no options. No size/color/material variants.

---

## 8. Hero Product Configuration

### anchor-table

| Setting | Value |
|---|---|
| Inventory tracking | Enabled |
| Quantity | 1 |
| Continue selling when out of stock | OFF |
| Requires shipping | YES |
| Taxable | YES |
| Metafield `custom.isHero` | true |

**SKU:** INSUFFICIENT DATA — no SKU exists. Shopify does not require a SKU for product creation, but inventory tracking may benefit from one. Leave blank during initial setup.

---

## 9. Standard Inventory

### Current State

50 products have `inventoryQuantity: null` in the local dataset.

### Shopify Approach

| Option | Implication |
|---|---|
| Set quantity = 0 | Products show as "Out of stock" |
| Set quantity = 1+ | Products show as "In stock" |
| Don't track inventory | Products always available |

**Recommendation:** During initial product creation, set `inventory_policy = "deny"` (Shopify default) and `inventory_quantity = 0`. Update quantities later when real inventory data is available.

**Do NOT invent inventory quantities.**

---

## 10. SKU Policy

**Current state:** 0 products have SKUs.

**Shopify requirement:** SKU is optional. Products can be created and managed without SKUs.

**During initial setup:** Leave SKU fields blank.

**When SKUs are needed:**
- Inventory management (Shopify can track without SKU but reporting is limited)
- Barcode printing
- Warehouse management
- Integration with accounting software

**INSUFFICIENT DATA — REAL BUSINESS SKU REQUIRED**

---

## 11. Shipping Configuration

### Requires Business Decision (INSUFFICIENT DATA)

| Setting | Required Value | Status |
|---|---|---|
| Shipping origin address | Business address | INSUFFICIENT DATA |
| Domestic shipping zones | Pan-India? Specific states? | INSUFFICIENT DATA |
| International shipping | Yes/No? Which countries? | INSUFFICIENT DATA |
| Shipping rates | Free? Flat? Calculated? | INSUFFICIENT DATA |
| Free shipping threshold | ₹X amount? | INSUFFICIENT DATA |
| Delivery SLA | Days for domestic? | INSUFFICIENT DATA |
| Remote area surcharge | Yes/No? | INSUFFICIENT DATA |
| Courier partners | Which services? | INSUFFICIENT DATA |

### Product-Level Shipping Notes

The current product data includes per-product `shipping` text (e.g., "Ships in 3-5 days"). This will become a metafield. Site-wide shipping policy is separate.

---

## 12. Tax Configuration

### Requires Business Decision (INSUFFICIENT DATA)

| Setting | Required Value | Status |
|---|---|---|
| GST registration status | Registered/Unregistered | INSUFFICIENT DATA |
| GSTIN | 15-digit number | INSUFFICIENT DATA |
| GST rates | 0%, 5%, 12%, 18%, 28% | INSUFFICIENT DATA |
| HSN codes | Per product category | INSUFFICIENT DATA |
| Business state | For CGST/SGST calculation | INSUFFICIENT DATA |

**Do NOT enter fabricated tax information.**

---

## 13. Payments

**Status:** NOT configured. No live payment processing.

**During initial setup:** Shopify test mode is sufficient for development.

**When ready for production:**
- Shopify Payments (recommended for INR)
- Razorpay (popular in India)
- Cashfree (alternative)

**Do NOT activate live payments until the integration is complete and tested.**

---

## 14. Customer Accounts

**Status:** NOT migrated. Current localStorage auth remains.

**Shopify Customer Accounts features to enable:**
- Customer registration
- Login/logout
- Order history
- Saved addresses
- Password reset

**Do NOT delete or modify the current localStorage auth system until Shopify integration sprint.**

---

## 15. Domain

**Current:** teakle.in (production domain for Next.js frontend)

**Future architecture:**
```
teakle.in → Next.js frontend (Vercel/Netlify)
teakle.myshopify.com → Shopify admin/backend (hidden)
```

**Do NOT change DNS yet.** Domain configuration happens during the deployment/integration sprint.

---

## 16. API Credentials

**Status:** NOT created. No .env files. No tokens.

**When integration begins, create:**
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` — e.g., `teakle.myshopify.com`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` — Storefront API access token
- `SHOPIFY_ADMIN_API_TOKEN` — Admin API access token (server-side only)

**Do NOT create these yet.** They will be created only when the actual integration sprint begins.

---

## 17. Blockers

### CRITICAL
None.

### HIGH
1. **Business legal information missing** — Legal entity name, address, GSTIN, PAN required for Shopify store setup, invoices, and tax compliance.

### MEDIUM
1. **Shipping configuration incomplete** — Cannot set up shipping rates without business address and delivery policy.
2. **Tax configuration incomplete** — Cannot configure GST without registration status and GSTIN.
3. **No SKUs exist** — 51 products have no SKUs. Not required for initial setup but needed for inventory management.

### LOW
1. **Product images are Pexels URLs** — Need to download and upload to Shopify during migration.
2. **Custom orders workflow** — Requires separate backend architecture, not natively handled by Shopify.

### INFORMATIONAL
1. **Shopify store not yet created** — This document specifies what to configure. Actual creation requires a Shopify account.
2. **No products imported yet** — Products will be imported during the migration sprint using the authoritative dataset.
3. **No metafield values populated** — Metafield definitions created; values populated during migration.

---

## 18. Website Impact

**Next.js code modified:** NONE
**Build status:** PASS (0 errors, 0 warnings, 87 pages)
**Commerce functionality unchanged:** YES
**Product data unchanged:** YES
**No API credentials added:** YES
**No .env files created:** YES

The existing website continues to work exactly as before.

---

## 19. Migration Checklist

When ready to begin Shopify integration:

- [ ] Create Shopify account
- [ ] Set currency to INR
- [ ] Create 8 category collections
- [ ] Create 4 editorial collections
- [ ] Create 19 metafield definitions
- [ ] Import 51 products
- [ ] Upload product images
- [ ] Populate metafield values
- [ ] Configure hero product inventory
- [ ] Set up shipping rates
- [ ] Configure tax settings
- [ ] Create API credentials
- [ ] Install @shopify/storefront-api-client
- [ ] Create app/data/shopify.js
- [ ] Replace product data source
- [ ] Implement Shopify Cart API
- [ ] Implement Shopify Checkout
- [ ] Implement Shopify Customer Accounts
- [ ] Test end-to-end
- [ ] Connect domain
- [ ] Go live

// Section Registry for the visual editor
// Maps sectionKey -> { component, label, editableFields }
// Each editableField has: key, label, type ('text'|'textarea'|'image'|'boolean'), maxLength (optional)
//
// New element-based model: SECTION_ELEMENTS maps sectionKey -> element definitions
// for granular per-element inspector controls.
//
// EDITABLE FIELDS ARE DERIVED FROM SECTION_ELEMENTS — single source of truth.

import PageHeroSection from './PageHeroSection'
import PageIntroSection from './PageIntroSection'
import HeroSection from './HeroSection'
import PhilosophySection from './PhilosophySection'
import SignatureSection from './SignatureSection'
import CraftsmanshipSection from './CraftsmanshipSection'
import LifestyleSection from './LifestyleSection'
import PageOriginSection from './PageOriginSection'
import PageGallerySection from './PageGallerySection'
import TrustBarSection from './TrustBarSection'
import CollectionCarouselSection from './CollectionCarouselSection'
import ProductGridSection from './ProductGridSection'
import MaterialsSection from './MaterialsSection'

// ─── Element-Based Model ───────────────────────────────────────────────────────
// SECTION_ELEMENTS maps sectionKey -> array of element definitions.
// Each element describes a single editable piece within a section.

/**
 * @typedef {'text'|'image'|'button'} ElementType
 * @typedef {Object} ElementDef
 * @property {string} label          - Display name (e.g. "Title")
 * @property {ElementType} type      - Element type
 * @property {string} contentField   - DB column holding the content
 * @property {string} [urlField]     - DB column holding the URL (buttons only)
 * @property {string[]} capabilities - Capability strings for the inspector
 */

/** @type {Record<string, ElementDef[]>} */
export const SECTION_ELEMENTS = {
  // ── Hero (home) ──
  hero: [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Subtitle', type: 'text', contentField: 'subtitle', capabilities: ['typography', 'spacing'] },
    { label: 'Image', type: 'image', contentField: 'image', capabilities: ['source', 'position', 'fit'] },
    { label: 'Button', type: 'button', contentField: 'buttonLabel', urlField: 'buttonUrl', capabilities: ['label', 'link', 'variant', 'alignment'] },
  ],

  // ── Philosophy (home) ──
  philosophy: [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Body', type: 'text', contentField: 'body', capabilities: ['typography', 'spacing'] },
    { label: 'Image', type: 'image', contentField: 'image', capabilities: ['source', 'position', 'fit'] },
  ],

  // ── Signature (home) ──
  signature: [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Body', type: 'text', contentField: 'body', capabilities: ['typography', 'spacing'] },
    { label: 'Image', type: 'image', contentField: 'image', capabilities: ['source', 'position', 'fit'] },
  ],

  // ── Craftsmanship (home) ──
  craftsmanship: [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Body', type: 'text', contentField: 'body', capabilities: ['typography', 'spacing'] },
    { label: 'Image', type: 'image', contentField: 'image', capabilities: ['source', 'position', 'fit'] },
  ],

  // ── Workshop Story (home) ──
  'workshop-story': [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Body', type: 'text', contentField: 'body', capabilities: ['typography', 'spacing'] },
    { label: 'Image', type: 'image', contentField: 'image', capabilities: ['source', 'position', 'fit'] },
    { label: 'Button', type: 'button', contentField: 'buttonLabel', urlField: 'buttonUrl', capabilities: ['label', 'link', 'variant', 'alignment'] },
  ],

  // ── Process Story (home) ──
  'process-story': [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Body', type: 'text', contentField: 'body', capabilities: ['typography', 'spacing'] },
    { label: 'Image', type: 'image', contentField: 'image', capabilities: ['source', 'position', 'fit'] },
    { label: 'Button', type: 'button', contentField: 'buttonLabel', urlField: 'buttonUrl', capabilities: ['label', 'link', 'variant', 'alignment'] },
  ],

  // ── Page Hero (all non-home pages) ──
  pageHero: [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Subtitle', type: 'text', contentField: 'subtitle', capabilities: ['typography', 'spacing'] },
    { label: 'Image', type: 'image', contentField: 'image', capabilities: ['source', 'position', 'fit'] },
    { label: 'Button', type: 'button', contentField: 'buttonLabel', urlField: 'buttonUrl', capabilities: ['label', 'link', 'variant', 'alignment'] },
  ],

  // ── Origin (studio) ──
  origin: [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Body', type: 'text', contentField: 'body', capabilities: ['typography', 'spacing'] },
    { label: 'Image', type: 'image', contentField: 'image', capabilities: ['source', 'position', 'fit'] },
  ],

  // ── Gallery (studio) ──
  gallery: [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Body', type: 'text', contentField: 'body', capabilities: ['typography', 'spacing'] },
    { label: 'Image', type: 'image', contentField: 'image', capabilities: ['source', 'position', 'fit'] },
  ],

  // ── Introduction (contact, trade, custom) ──
  introduction: [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Subtitle', type: 'text', contentField: 'subtitle', capabilities: ['typography', 'spacing'] },
    { label: 'Body', type: 'text', contentField: 'body', capabilities: ['typography', 'spacing'] },
  ],

  // ── Trust Bar (home) — CMS-backed trust indicators ──
  'trust-bar': [
    { label: 'Items', type: 'text', contentField: 'body', capabilities: ['content'] },
    { label: 'Section Style', type: 'text', contentField: 'styleOverrides', capabilities: ['spacing', 'background'] },
  ],

  // ── Collection Carousel (home) — CMS-backed product carousel ──
  'collection-carousel': [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Products', type: 'text', contentField: 'body', capabilities: ['content'] },
    { label: 'Section Style', type: 'text', contentField: 'styleOverrides', capabilities: ['spacing', 'background'] },
  ],

  // ── Product Grid (home) — CMS-backed product grid ──
  'product-grid': [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Products', type: 'text', contentField: 'body', capabilities: ['content'] },
    { label: 'Button Label', type: 'text', contentField: 'buttonLabel', capabilities: ['label', 'link'] },
    { label: 'Button URL', type: 'text', contentField: 'buttonUrl', capabilities: ['link'] },
    { label: 'Section Style', type: 'text', contentField: 'styleOverrides', capabilities: ['spacing', 'background'] },
  ],

  // ── Materials (studio) — CMS-backed materials list ──
  materials: [
    { label: 'Eyebrow', type: 'text', contentField: 'eyebrow', capabilities: ['typography', 'spacing'] },
    { label: 'Title', type: 'text', contentField: 'title', capabilities: ['typography', 'spacing'] },
    { label: 'Items', type: 'text', contentField: 'body', capabilities: ['content'] },
    { label: 'Section Style', type: 'text', contentField: 'styleOverrides', capabilities: ['spacing', 'background'] },
  ],
}

// ── Derive editableFields from SECTION_ELEMENTS (single source of truth) ────
const FIELD_MAX_LENGTHS = {
  eyebrow: 100, title: 200, subtitle: 300, body: 5000,
  image: 500, mobileImage: 500,
  buttonLabel: 100, buttonUrl: 500, enabled: 1,
}

function deriveEditableFields(sectionKey) {
  const elements = SECTION_ELEMENTS[sectionKey]
  if (!elements) return []
  const fields = []
  for (const el of elements) {
    fields.push({
      key: el.contentField,
      label: el.label,
      type: el.type === 'image' ? 'image' : 'text',
      maxLength: FIELD_MAX_LENGTHS[el.contentField] || 500,
    })
    if (el.urlField) {
      fields.push({
        key: el.urlField,
        label: el.label + ' URL',
        type: 'text',
        maxLength: FIELD_MAX_LENGTHS[el.urlField] || 500,
      })
    }
  }
  return fields
}

// ─── Section Registry ──────────────────────────────────────────────────────────
/** @type {Record<string, {component: any, label: string, editableFields: any[]}>} */
export const SECTION_REGISTRY = {
  hero: { component: HeroSection, label: 'Hero', editableFields: deriveEditableFields('hero') },
  philosophy: { component: PhilosophySection, label: 'Philosophy', editableFields: deriveEditableFields('philosophy') },
  signature: { component: SignatureSection, label: 'Signature Collection', editableFields: deriveEditableFields('signature') },
  craftsmanship: { component: CraftsmanshipSection, label: 'Craftsmanship', editableFields: deriveEditableFields('craftsmanship') },
  'workshop-story': { component: LifestyleSection, label: 'Workshop Story', editableFields: deriveEditableFields('workshop-story') },
  'process-story': { component: LifestyleSection, label: 'Process Story', editableFields: deriveEditableFields('process-story') },
  pageHero: { component: PageHeroSection, label: 'Page Hero', editableFields: deriveEditableFields('pageHero') },
  origin: { component: PageOriginSection, label: 'Origin Story', editableFields: deriveEditableFields('origin') },
  gallery: { component: PageGallerySection, label: 'Workshop Gallery', editableFields: deriveEditableFields('gallery') },
  introduction: { component: PageIntroSection, label: 'Introduction', editableFields: deriveEditableFields('introduction') },
  'trust-bar': { component: TrustBarSection, label: 'Trust Bar', editableFields: deriveEditableFields('trust-bar') },
  'collection-carousel': { component: CollectionCarouselSection, label: 'Collection Carousel', editableFields: deriveEditableFields('collection-carousel') },
  'product-grid': { component: ProductGridSection, label: 'Product Grid', editableFields: deriveEditableFields('product-grid') },
  materials: { component: MaterialsSection, label: 'Materials', editableFields: deriveEditableFields('materials') },
}

// Page-to-sections mapping (which sections each page CAN use — DB is source of truth for actual composition)
export const PAGE_SECTIONS = {
  home: ['hero', 'trust-bar', 'philosophy', 'signature', 'craftsmanship', 'collection-carousel', 'product-grid', 'workshop-story', 'process-story'],
  studio: ['hero', 'origin', 'materials', 'gallery'],
  contact: ['hero', 'introduction'],
  trade: ['hero', 'introduction'],
  custom: ['hero', 'introduction'],
  journal: ['hero'],
  archive: ['hero'],
  // Shop/process deferred — requires per-product page keys
}

// Human-readable page labels
export const PAGE_LABELS = {
  home: 'Homepage',
  studio: 'Studio',
  contact: 'Contact',
  trade: 'Trade',
  custom: 'Custom Orders',
  journal: 'Journal',
  archive: 'Archive',
}

// Get the section config for a given section key and page
export function getSectionConfig(sectionKey, page) {
  // For 'hero' on non-home pages, use the pageHero config
  if (sectionKey === 'hero' && page !== 'home') {
    return SECTION_REGISTRY.pageHero
  }
  return SECTION_REGISTRY[sectionKey] || null
}

/**
 * Returns the element definitions for a given section, handling the
 * pageHero → hero mapping for non-home pages.
 *
 * @param {string} sectionKey - The section key (e.g. 'hero', 'philosophy')
 * @param {string} page       - The page name (e.g. 'home', 'studio')
 * @returns {ElementDef[]|null}
 */
export function getElementsForSection(sectionKey, page) {
  if (sectionKey === 'hero' && page !== 'home') {
    return SECTION_ELEMENTS.pageHero || null
  }
  return SECTION_ELEMENTS[sectionKey] || null
}

// ─── Design Token Constants ────────────────────────────────────────────────────
// Preset options for inspector controls.

export const FONT_SIZE_PRESETS = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
  { label: '40px', value: '40px' },
  { label: '48px', value: '48px' },
  { label: '56px', value: '56px' },
  { label: '64px', value: '64px' },
]

export const FONT_WEIGHT_PRESETS = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
]

export const LINE_HEIGHT_PRESETS = [
  { label: '1.0', value: '1.0' },
  { label: '1.1', value: '1.1' },
  { label: '1.2', value: '1.2' },
  { label: '1.4', value: '1.4' },
  { label: '1.5', value: '1.5' },
  { label: '1.6', value: '1.6' },
  { label: '1.8', value: '1.8' },
  { label: '2.0', value: '2.0' },
]

export const SPACING_TOKENS = [
  { label: '4px', value: '4px' },
  { label: '8px', value: '8px' },
  { label: '12px', value: '12px' },
  { label: '20px', value: '20px' },
  { label: '40px', value: '40px' },
  { label: '64px', value: '64px' },
  { label: '80px', value: '80px' },
  { label: '104px', value: '104px' },
]

export const ALIGNMENT_OPTIONS = [
  { label: 'Left', value: 'left', icon: 'align-left' },
  { label: 'Center', value: 'center', icon: 'align-center' },
  { label: 'Right', value: 'right', icon: 'align-right' },
]

export const IMAGE_FIT_OPTIONS = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Fill', value: 'fill' },
  { label: 'None', value: 'none' },
]

export const IMAGE_POSITION_OPTIONS = [
  // Horizontal
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
  // Vertical
  { label: 'Top', value: 'top' },
  { label: 'Middle', value: 'middle' },
  { label: 'Bottom', value: 'bottom' },
]

export const BUTTON_VARIANTS = [
  { label: 'Outline', value: 'outline' },
  { label: 'Filled', value: 'filled' },
  { label: 'Ghost', value: 'ghost' },
]

export const BUTTON_SIZES = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
]

// ─── Section Variants ────────────────────────────────────────────────────────
// Variants define different visual layouts/compositions for the same section type.
// Each variant should change layout, spacing, or composition — NOT arbitrary CSS.

export const SECTION_VARIANTS = {
  hero: [
    { id: 'full', label: 'Full Image', description: 'Full-width background image with text overlay' },
    { id: 'split', label: 'Split Editorial', description: 'Image on one side, text on the other' },
    { id: 'minimal', label: 'Minimal', description: 'Clean text-focused layout without image' },
  ],
  philosophy: [
    { id: 'standard', label: 'Standard', description: 'Image with text alongside' },
    { id: 'centered', label: 'Centered', description: 'Centered text with image below' },
  ],
  signature: [
    { id: 'standard', label: 'Standard', description: 'Image with text alongside' },
    { id: 'gallery', label: 'Gallery', description: 'Featured image with text overlay' },
  ],
  craftsmanship: [
    { id: 'standard', label: 'Standard', description: 'Image with text alongside' },
    { id: 'process', label: 'Process', description: 'Step-by-step process layout' },
  ],
  // ── Studio section variants ──
  origin: [
    { id: 'standard', label: 'Standard', description: 'Image on left, text on right' },
    { id: 'centered', label: 'Centered', description: 'Text centered with image above' },
  ],
  materials: [
    { id: 'standard', label: 'Standard Grid', description: '3-column grid layout' },
    { id: 'compact', label: 'Compact', description: 'Single-column list layout' },
  ],
  gallery: [
    { id: 'standard', label: 'Standard Grid', description: '2-column asymmetric grid' },
    { id: 'full', label: 'Full Width', description: 'Full-width mosaic layout' },
  ],
}

export function getVariantsForSection(sectionKey) {
  return SECTION_VARIANTS[sectionKey] || []
}

// Section Registry for the visual editor
// Maps sectionKey -> { component, label, editableFields }
// Each editableField has: key, label, type ('text'|'textarea'|'image'|'boolean'), maxLength (optional)
//
// New element-based model: SECTION_ELEMENTS maps sectionKey -> element definitions
// for granular per-element inspector controls.

import PageHeroSection from './PageHeroSection'
import PageIntroSection from './PageIntroSection'
import HeroSection from './HeroSection'
import PhilosophySection from './PhilosophySection'
import SignatureSection from './SignatureSection'
import CraftsmanshipSection from './CraftsmanshipSection'
import LifestyleSection from './LifestyleSection'
import PageOriginSection from './PageOriginSection'
import PageGallerySection from './PageGallerySection'

// Reusable field definitions
const commonFields = {
  hero: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text', maxLength: 100 },
    { key: 'title', label: 'Title', type: 'text', maxLength: 200 },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea', maxLength: 300 },
    { key: 'image', label: 'Background Image', type: 'image' },
    { key: 'buttonLabel', label: 'Button Label', type: 'text', maxLength: 100 },
    { key: 'buttonUrl', label: 'Button URL', type: 'text', maxLength: 500 },
  ],
  standard: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text', maxLength: 100 },
    { key: 'title', label: 'Title', type: 'text', maxLength: 200 },
    { key: 'body', label: 'Body', type: 'textarea', maxLength: 5000 },
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'buttonLabel', label: 'Button Label', type: 'text', maxLength: 100 },
    { key: 'buttonUrl', label: 'Button URL', type: 'text', maxLength: 500 },
  ],
  introduction: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text', maxLength: 100 },
    { key: 'title', label: 'Title', type: 'text', maxLength: 200 },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea', maxLength: 300 },
    { key: 'body', label: 'Body', type: 'textarea', maxLength: 5000 },
  ],
  lifestyle: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text', maxLength: 100 },
    { key: 'title', label: 'Title', type: 'text', maxLength: 200 },
    { key: 'body', label: 'Body', type: 'textarea', maxLength: 5000 },
    { key: 'image', label: 'Background Image', type: 'image' },
    { key: 'buttonLabel', label: 'Button Label', type: 'text', maxLength: 100 },
    { key: 'buttonUrl', label: 'Button URL', type: 'text', maxLength: 500 },
  ],
}

// Registry: sectionKey -> config (backward-compatible)
export const SECTION_REGISTRY = {
  // Homepage sections
  hero: { component: HeroSection, label: 'Hero', editableFields: commonFields.hero },
  philosophy: { component: PhilosophySection, label: 'Philosophy', editableFields: commonFields.standard },
  signature: { component: SignatureSection, label: 'Signature Collection', editableFields: commonFields.standard },
  craftsmanship: { component: CraftsmanshipSection, label: 'Craftsmanship', editableFields: commonFields.standard },
  'workshop-story': { component: LifestyleSection, label: 'Workshop Story', editableFields: commonFields.lifestyle },
  'process-story': { component: LifestyleSection, label: 'Process Story', editableFields: commonFields.lifestyle },

  // Page hero sections (studio, contact, trade, custom, journal, archive)
  pageHero: { component: PageHeroSection, label: 'Page Hero', editableFields: commonFields.hero },

  // Page-specific sections
  origin: { component: PageOriginSection, label: 'Origin Story', editableFields: commonFields.standard },
  gallery: { component: PageGallerySection, label: 'Workshop Gallery', editableFields: commonFields.standard },
  introduction: { component: PageIntroSection, label: 'Introduction', editableFields: commonFields.introduction },
}

// Page-to-sections mapping (which sections each page uses)
export const PAGE_SECTIONS = {
  home: ['hero', 'philosophy', 'signature', 'craftsmanship', 'workshop-story', 'process-story'],
  studio: ['hero', 'origin', 'gallery'],
  contact: ['hero', 'introduction'],
  trade: ['hero', 'introduction'],
  custom: ['hero', 'introduction'],
  journal: ['hero'],
  archive: ['hero'],
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

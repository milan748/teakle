// Design Resolution Utility
// Bridges CMS editor controls to public rendering.
//
// Precedence model (highest wins):
//   1. Variant-specific layout (structural, which CSS class/structure to use)
//   2. Page Design defaults (background, contentWidth, spacing, typography, colorTheme)
//   3. Section-level overrides (contentWidth, alignment, padding, background)
//   4. Element-level overrides (fontSize, fontWeight, color, etc.)
//   5. Mobile overrides (override desktop values on mobile viewport)

import { SECTION_VARIANTS } from '@/app/admin/editor/sections/registry'

// ── Variant Resolution ───────────────────────────────────────────────────────

/**
 * Resolve the active variant for a section.
 * Falls back to the first variant if the stored variant is missing or invalid.
 *
 * @param {string} sectionKey - e.g. 'hero', 'philosophy'
 * @param {string|null} storedVariant - the variant stored in DB
 * @returns {{ id: string, label: string, description: string }}
 */
export function resolveVariant(sectionKey, storedVariant) {
  const variants = SECTION_VARIANTS[sectionKey] || []
  if (variants.length === 0) return null

  const found = variants.find(v => v.id === storedVariant)
  return found || variants[0] // fallback to first (default) variant
}

// ── Element Style Resolution ─────────────────────────────────────────────────

const TYPO_KEYS = ['fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textAlign']

/**
 * Parse JSON styleOverrides string from DB into an object.
 */
export function parseStyleOverrides(raw) {
  try {
    return JSON.parse(raw || '{}') || {}
  } catch {
    return {}
  }
}

/**
 * Parse JSON sectionStyleOverrides string from DB into an object.
 */
export function parseSectionOverrides(raw) {
  try {
    return JSON.parse(raw || '{}') || {}
  } catch {
    return {}
  }
}

/**
 * Resolve element-level styles with desktop → mobile override precedence.
 *
 * @param {string} elementKey - e.g. 'title', 'eyebrow', 'image'
 * @param {Object} defaults - default CSS styles for this element
 * @param {Object} styleOverrides - parsed styleOverrides object (element-keyed)
 * @param {boolean} isMobile - whether viewport is mobile
 * @returns {Object} resolved CSS style object
 */
export function resolveElementStyle(elementKey, defaults, styleOverrides, isMobile) {
  const el = styleOverrides?.[elementKey] || {}
  const base = { ...defaults }

  // Apply desktop overrides (everything except 'mobile' subkey)
  for (const [key, val] of Object.entries(el)) {
    if (key !== 'mobile') base[key] = val
  }

  // Apply mobile overrides on mobile viewport
  if (isMobile && el.mobile) {
    for (const [key, val] of Object.entries(el.mobile)) {
      base[key] = val
    }
  }

  return base
}

/**
 * Resolve typography-only element styles (safe subset — no layout properties).
 *
 * @param {string} elementKey
 * @param {Object} defaults
 * @param {Object} styleOverrides
 * @param {boolean} isMobile
 * @returns {Object} typography CSS style object
 */
export function resolveTypography(elementKey, defaults, styleOverrides, isMobile) {
  const el = styleOverrides?.[elementKey] || {}
  const base = { ...defaults }

  for (const k of TYPO_KEYS) {
    if (el[k] !== undefined) base[k] = el[k]
  }

  if (isMobile && el.mobile) {
    for (const k of TYPO_KEYS) {
      if (el.mobile[k] !== undefined) base[k] = el.mobile[k]
    }
  }

  return base
}

// ── Section-Level Overrides ──────────────────────────────────────────────────

/**
 * Resolve section-level styles (contentWidth, alignment, padding, background).
 * Section overrides take precedence over page design defaults.
 *
 * @param {Object} sectionOverrides - parsed sectionStyleOverrides
 * @param {Object} pageDesignDefaults - resolved page design defaults
 * @param {boolean} isMobile
 * @returns {Object} section CSS style object
 */
export function resolveSectionStyle(sectionOverrides, pageDesignDefaults = {}, isMobile) {
  const mobile = isMobile ? (sectionOverrides.mobile || {}) : {}

  return {
    // Content width: section override > page design default
    contentWidth: mobile.contentWidth || sectionOverrides.contentWidth || pageDesignDefaults.contentWidth || undefined,

    // Alignment: section override only (no page design default)
    textAlign: sectionOverrides.alignment || undefined,

    // Padding: section override > page design spacing
    paddingTop: mobile.paddingTop || sectionOverrides.paddingTop || pageDesignDefaults.paddingTop || undefined,
    paddingBottom: mobile.paddingBottom || sectionOverrides.paddingBottom || pageDesignDefaults.paddingBottom || undefined,

    // Background: section override > page design background
    backgroundPreset: sectionOverrides.backgroundPreset || pageDesignDefaults.backgroundPreset || undefined,
  }
}

// ── Page Design Resolution ───────────────────────────────────────────────────

/**
 * Page design presets mapping.
 * Maps semantic preset names to concrete CSS values.
 */
const BACKGROUND_PRESETS = {
  default: undefined,      // no background override
  light: '#F7F4EE',
  warm: '#2a2420',
  stone: '#3a3530',
  dark: '#1a1715',
}

const SPACING_PRESETS = {
  compact: { sectionPadding: '48px 0', gap: '32px' },
  standard: { sectionPadding: '80px 0', gap: '64px' },
  spacious: { sectionPadding: '120px 0', gap: '96px' },
}

const TYPOGRAPHY_PRESETS = {
  conservative: { headingScale: 0.85 },
  balanced: { headingScale: 1.0 },
  expressive: { headingScale: 1.15 },
}

const COLOR_THEME_PRESETS = {
  teakle: {
    primary: '#A78659',
    text: '#1a1715',
    textLight: '#F7F4EE',
    textMuted: '#6b6560',
    bg: '#F7F4EE',
  },
  monochrome: {
    primary: '#555',
    text: '#1a1a1a',
    textLight: '#f5f5f5',
    textMuted: '#888',
    bg: '#fafafa',
  },
  'warm-accent': {
    primary: '#c97d4a',
    text: '#2a2218',
    textLight: '#faf5ef',
    textMuted: '#8a7a6a',
    bg: '#faf5ef',
  },
}

/**
 * Resolve page design settings into concrete CSS values.
 *
 * @param {Object} pageDesign - raw pageDesign from DB
 * @param {boolean} isMobile
 * @returns {Object} resolved page design values
 */
export function resolvePageDesign(pageDesign, isMobile) {
  if (!pageDesign || typeof pageDesign !== 'object') return {}

  const mobile = isMobile && pageDesign.mobile ? pageDesign.mobile : {}

  const background = mobile.background || pageDesign.background || 'default'
  const spacing = mobile.spacing || pageDesign.spacing || 'standard'
  const typography = pageDesign.typography || 'balanced'
  const colorTheme = pageDesign.colorTheme || 'teakle'
  const contentWidth = mobile.contentWidth || pageDesign.contentWidth || '1200px'

  const bgValue = BACKGROUND_PRESETS[background] || BACKGROUND_PRESETS.default
  const spacingValues = SPACING_PRESETS[spacing] || SPACING_PRESETS.standard
  const typoValues = TYPOGRAPHY_PRESETS[typography] || TYPOGRAPHY_PRESETS.balanced
  const colorValues = COLOR_THEME_PRESETS[colorTheme] || COLOR_THEME_PRESETS.teakle

  return {
    // Raw preset names (for class names or conditional logic)
    backgroundPreset: bgValue,
    spacingPreset: spacing,
    typographyPreset: typography,
    colorThemePreset: colorTheme,

    // Concrete values
    contentWidth,
    sectionPadding: spacingValues.sectionPadding,
    gap: spacingValues.gap,
    headingScale: typoValues.headingScale,
    colors: colorValues,
  }
}

// ── CSS Class Helpers ────────────────────────────────────────────────────────

/**
 * Get CSS class name for a variant.
 * e.g. getVariantClass('hero', 'split') → 'hero--split'
 */
export function getVariantClass(sectionKey, variantId) {
  if (!variantId) return ''
  return `${sectionKey}--${variantId}`
}

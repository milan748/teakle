// Design Resolution Utility
// Bridges CMS editor controls to public rendering.
//
// Precedence model (highest wins):
//   1. Variant-specific layout (structural, which CSS class/structure to use)
//   2. Page Design defaults (background, contentWidth, spacing, typography, colorTheme)
//   3. Section-level overrides (contentWidth, alignment, padding, background)
//   4. Element-level overrides (fontSize, fontWeight, color, etc.)
//   5. Tablet overrides (override desktop values on tablet viewport)
//   6. Mobile overrides (override desktop values on mobile viewport)

import { SECTION_VARIANTS } from '@/lib/sectionVariants'

// ── Viewport Helpers ───────────────────────────────────────────────────────

/**
 * Normalize viewport parameter.
 * Accepts either a viewport string ('desktop' | 'tablet' | 'mobile')
 * or the legacy isMobile boolean for backward compatibility.
 *
 * @param {string|boolean} viewportOrIsMobile - viewport string or isMobile boolean
 * @returns {'desktop' | 'tablet' | 'mobile'}
 */
export function normalizeViewport(viewportOrIsMobile) {
  if (typeof viewportOrIsMobile === 'string') {
    if (viewportOrIsMobile === 'tablet' || viewportOrIsMobile === 'mobile' || viewportOrIsMobile === 'desktop') {
      return viewportOrIsMobile
    }
  }
  // Legacy boolean: true → mobile, false → desktop
  return viewportOrIsMobile ? 'mobile' : 'desktop'
}

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
 * Resolve element-level styles with desktop → tablet → mobile override precedence.
 *
 * @param {string} elementKey - e.g. 'title', 'eyebrow', 'image'
 * @param {Object} defaults - default CSS styles for this element
 * @param {Object} styleOverrides - parsed styleOverrides object (element-keyed)
 * @param {string|boolean} viewportOrIsMobile - viewport string or isMobile boolean
 * @returns {Object} resolved CSS style object
 */
export function resolveElementStyle(elementKey, defaults, styleOverrides, viewportOrIsMobile) {
  const viewport = normalizeViewport(viewportOrIsMobile)
  const el = styleOverrides?.[elementKey] || {}
  const base = { ...defaults }

  // Apply desktop overrides (everything except 'mobile' and 'tablet' subkeys)
  for (const [key, val] of Object.entries(el)) {
    if (key !== 'mobile' && key !== 'tablet') base[key] = val
  }

  // Apply tablet overrides on tablet viewport
  if (viewport === 'tablet' && el.tablet) {
    for (const [key, val] of Object.entries(el.tablet)) {
      base[key] = val
    }
  }

  // Apply mobile overrides on mobile viewport
  if (viewport === 'mobile' && el.mobile) {
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
 * @param {string|boolean} viewportOrIsMobile - viewport string or isMobile boolean
 * @returns {Object} typography CSS style object
 */
export function resolveTypography(elementKey, defaults, styleOverrides, viewportOrIsMobile) {
  const viewport = normalizeViewport(viewportOrIsMobile)
  const el = styleOverrides?.[elementKey] || {}
  const base = { ...defaults }

  for (const k of TYPO_KEYS) {
    if (el[k] !== undefined) base[k] = el[k]
  }

  // Apply tablet typography overrides
  if (viewport === 'tablet' && el.tablet) {
    for (const k of TYPO_KEYS) {
      if (el.tablet[k] !== undefined) base[k] = el.tablet[k]
    }
  }

  // Apply mobile typography overrides
  if (viewport === 'mobile' && el.mobile) {
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
 * @param {string|boolean} viewportOrIsMobile - viewport string or isMobile boolean
 * @returns {Object} section CSS style object
 */
export function resolveSectionStyle(sectionOverrides, pageDesignDefaults = {}, viewportOrIsMobile) {
  const viewport = normalizeViewport(viewportOrIsMobile)
  const tablet = viewport === 'tablet' ? (sectionOverrides.tablet || {}) : {}
  const mobile = viewport === 'mobile' ? (sectionOverrides.mobile || {}) : {}

  return {
    // Content width: responsive override > section override > page design default
    contentWidth: mobile.contentWidth || tablet.contentWidth || sectionOverrides.contentWidth || pageDesignDefaults.contentWidth || undefined,

    // Alignment: section override only (no page design default)
    textAlign: sectionOverrides.alignment || undefined,

    // Padding: responsive override > section override > page design spacing
    paddingTop: mobile.paddingTop || tablet.paddingTop || sectionOverrides.paddingTop || pageDesignDefaults.paddingTop || undefined,
    paddingBottom: mobile.paddingBottom || tablet.paddingBottom || sectionOverrides.paddingBottom || pageDesignDefaults.paddingBottom || undefined,

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
 * @param {string|boolean} viewportOrIsMobile - viewport string or isMobile boolean
 * @returns {Object} resolved page design values
 */
export function resolvePageDesign(pageDesign, viewportOrIsMobile) {
  if (!pageDesign || typeof pageDesign !== 'object') return {}

  const viewport = normalizeViewport(viewportOrIsMobile)
  const tablet = viewport === 'tablet' && pageDesign.tablet ? pageDesign.tablet : {}
  const mobile = viewport === 'mobile' && pageDesign.mobile ? pageDesign.mobile : {}

  const background = mobile.background || tablet.background || pageDesign.background || 'default'
  const spacing = mobile.spacing || tablet.spacing || pageDesign.spacing || 'standard'
  const typography = pageDesign.typography || 'balanced'
  const colorTheme = pageDesign.colorTheme || 'teakle'
  // T02: default content width matches the wide editorial measure
  // (--container-wide: 1600px). Stylesheets own section widths; this inline
  // fallback must not confine major sections to a narrow column.
  const contentWidth = mobile.contentWidth || tablet.contentWidth || pageDesign.contentWidth || '1600px'

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

// ── Focal Point Resolution ──────────────────────────────────────────────────

const FOCAL_DEFAULT = { x: 50, y: 50 }

/**
 * Clamp a value to [min, max].
 */
function clamp(val, min, max) {
  const n = Number(val)
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, n))
}

/**
 * Resolve focal-point coordinates for an image element.
 * Focal point is stored as { focalX, focalY } percentages (0–100)
 * with optional responsive subkeys (tablet, mobile).
 *
 * @param {Object} styleOverrides - parsed styleOverrides object (element-keyed)
 * @param {string} elementKey - e.g. 'image'
 * @param {string|boolean} viewportOrIsMobile - viewport string or isMobile boolean
 * @returns {{ x: number, y: number }} resolved focal point (0–100)
 */
export function resolveFocalPoint(styleOverrides, elementKey, viewportOrIsMobile) {
  const viewport = normalizeViewport(viewportOrIsMobile)
  const el = styleOverrides?.[elementKey] || {}

  // Desktop base
  let x = el.focalX !== undefined ? clamp(el.focalX, 0, 100) : FOCAL_DEFAULT.x
  let y = el.focalY !== undefined ? clamp(el.focalY, 0, 100) : FOCAL_DEFAULT.y

  // Tablet override
  if (viewport === 'tablet' && el.tablet) {
    if (el.tablet.focalX !== undefined) x = clamp(el.tablet.focalX, 0, 100)
    if (el.tablet.focalY !== undefined) y = clamp(el.tablet.focalY, 0, 100)
  }

  // Mobile override
  if (viewport === 'mobile' && el.mobile) {
    if (el.mobile.focalX !== undefined) x = clamp(el.mobile.focalX, 0, 100)
    if (el.mobile.focalY !== undefined) y = clamp(el.mobile.focalY, 0, 100)
  }

  return { x, y }
}

/**
 * Whether an explicit focal point was configured for an image element.
 * Used by renderers to decide between a CMS-authored inline object-position
 * and the stylesheet's intentional editorial default. The implicit 50/50
 * default must NOT be emitted inline, or it would silently override CSS.
 *
 * @param {Object} styleOverrides - parsed styleOverrides object (element-keyed)
 * @param {string} elementKey - e.g. 'image'
 * @param {string|boolean} viewportOrIsMobile - viewport string or isMobile boolean
 * @returns {boolean} true when focalX/focalY is explicitly set (incl. viewport subkeys)
 */
export function hasExplicitFocal(styleOverrides, elementKey, viewportOrIsMobile) {
  const viewport = normalizeViewport(viewportOrIsMobile)
  const el = styleOverrides?.[elementKey] || {}
  if (el.focalX !== undefined || el.focalY !== undefined) return true
  if (viewport === 'tablet' && el.tablet) {
    if (el.tablet.focalX !== undefined || el.tablet.focalY !== undefined) return true
  }
  if (viewport === 'mobile' && el.mobile) {
    if (el.mobile.focalX !== undefined || el.mobile.focalY !== undefined) return true
  }
  return false
}

/**
 * Convert a focal point { x, y } to a CSS background-position string.
 * @param {{ x: number, y: number }} fp
 * @returns {string} e.g. '50% 30%'
 */
export function focalPointToBackgroundPosition(fp) {
  return `${fp.x}% ${fp.y}%`
}

/**
 * Convert a focal point { x, y } to a CSS object-position string.
 * @param {{ x: number, y: number }} fp
 * @returns {string} e.g. '50% 30%'
 */
export function focalPointToObjectPosition(fp) {
  return `${fp.x}% ${fp.y}%`
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

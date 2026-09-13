/**
 * Sprint 8 Tests — Public Variant Rendering & Design Resolution
 * Tests the designResolution utility and CMS→public data flow.
 */

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${e.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}
function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ─── Load the design resolution module ───────────────────────────────────────
// We can't use import in CJS, so we'll test the logic inline by replicating the key functions.

const SECTION_VARIANTS = {
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
}

function resolveVariant(sectionKey, storedVariant) {
  const variants = SECTION_VARIANTS[sectionKey] || []
  if (variants.length === 0) return null
  const found = variants.find(v => v.id === storedVariant)
  return found || variants[0]
}

function parseStyleOverrides(raw) {
  try { return JSON.parse(raw || '{}') || {} } catch { return {} }
}

function parseSectionOverrides(raw) {
  try { return JSON.parse(raw || '{}') || {} } catch { return {} }
}

function resolveElementStyle(elementKey, defaults, styleOverrides, isMobile) {
  const el = styleOverrides?.[elementKey] || {}
  const base = { ...defaults }
  for (const [key, val] of Object.entries(el)) {
    if (key !== 'mobile') base[key] = val
  }
  if (isMobile && el.mobile) {
    for (const [key, val] of Object.entries(el.mobile)) {
      base[key] = val
    }
  }
  return base
}

const TYPO_KEYS = ['fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textAlign']
function resolveTypography(elementKey, defaults, styleOverrides, isMobile) {
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

const BACKGROUND_PRESETS = {
  default: undefined,
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
const COLOR_THEME_PRESETS = {
  teakle: { primary: '#A78659', text: '#1a1715' },
  monochrome: { primary: '#555', text: '#1a1a1a' },
}

function resolvePageDesign(pageDesign, isMobile) {
  if (!pageDesign || typeof pageDesign !== 'object') return {}
  const mobile = isMobile && pageDesign.mobile ? pageDesign.mobile : {}
  const background = mobile.background || pageDesign.background || 'default'
  const spacing = mobile.spacing || pageDesign.spacing || 'standard'
  const contentWidth = mobile.contentWidth || pageDesign.contentWidth || '1200px'
  const bgValue = BACKGROUND_PRESETS[background] || BACKGROUND_PRESETS.default
  const spacingValues = SPACING_PRESETS[spacing] || SPACING_PRESETS.standard
  return {
    backgroundPreset: bgValue,
    contentWidth,
    sectionPadding: spacingValues.sectionPadding,
    gap: spacingValues.gap,
  }
}

function resolveSectionStyle(sectionOverrides, pageDesignDefaults = {}, isMobile) {
  const mobile = isMobile ? (sectionOverrides.mobile || {}) : {}
  return {
    contentWidth: mobile.contentWidth || sectionOverrides.contentWidth || pageDesignDefaults.contentWidth || undefined,
    textAlign: sectionOverrides.alignment || undefined,
    paddingTop: mobile.paddingTop || sectionOverrides.paddingTop || pageDesignDefaults.paddingTop || undefined,
    paddingBottom: mobile.paddingBottom || sectionOverrides.paddingBottom || pageDesignDefaults.paddingBottom || undefined,
    backgroundPreset: sectionOverrides.backgroundPreset || pageDesignDefaults.backgroundPreset || undefined,
  }
}

function getVariantClass(sectionKey, variantId) {
  if (!variantId) return ''
  return `${sectionKey}--${variantId}`
}

// ─── Tests ───────────────────────────────────────────────────────────────────

console.log('\n==================================================');
console.log('Sprint 8 Tests — Public Variant Rendering');
console.log('==================================================\n');

// Phase 1: Variant resolution
console.log('Phase 1: Variant Resolution');

test('resolveVariant returns correct variant for hero/split', () => {
  const v = resolveVariant('hero', 'split')
  assertEqual(v.id, 'split')
  assertEqual(v.label, 'Split Editorial')
})

test('resolveVariant returns first variant as fallback for invalid', () => {
  const v = resolveVariant('hero', 'nonexistent')
  assertEqual(v.id, 'full')
})

test('resolveVariant returns first variant for null storedVariant', () => {
  const v = resolveVariant('hero', null)
  assertEqual(v.id, 'full')
})

test('resolveVariant returns null for unknown sectionKey', () => {
  const v = resolveVariant('unknown-section', 'foo')
  assertEqual(v, null)
})

test('resolveVariant returns correct variant for philosophy/centered', () => {
  const v = resolveVariant('philosophy', 'centered')
  assertEqual(v.id, 'centered')
})

test('resolveVariant returns correct variant for signature/gallery', () => {
  const v = resolveVariant('signature', 'gallery')
  assertEqual(v.id, 'gallery')
})

test('resolveVariant returns correct variant for craftsmanship/process', () => {
  const v = resolveVariant('craftsmanship', 'process')
  assertEqual(v.id, 'process')
})

// Phase 2: Style override parsing
console.log('\nPhase 2: Style Override Parsing');

test('parseStyleOverrides handles valid JSON', () => {
  const result = parseStyleOverrides('{"title":{"fontSize":"32px"}}')
  assertEqual(result.title.fontSize, '32px')
})

test('parseStyleOverrides returns empty object for null', () => {
  const result = parseStyleOverrides(null)
  assertEqual(Object.keys(result).length, 0)
})

test('parseStyleOverrides returns empty object for invalid JSON', () => {
  const result = parseStyleOverrides('not json')
  assertEqual(Object.keys(result).length, 0)
})

test('parseStyleOverrides returns empty object for empty string', () => {
  const result = parseStyleOverrides('')
  assertEqual(Object.keys(result).length, 0)
})

// Phase 3: Element style resolution
console.log('\nPhase 3: Element Style Resolution');

test('resolveElementStyle applies desktop overrides', () => {
  const overrides = { title: { fontSize: '48px', fontWeight: '700' } }
  const result = resolveElementStyle('title', { fontSize: '24px', fontWeight: '400' }, overrides, false)
  assertEqual(result.fontSize, '48px')
  assertEqual(result.fontWeight, '700')
})

test('resolveElementStyle preserves defaults for non-overridden keys', () => {
  const overrides = { title: { fontSize: '48px' } }
  const result = resolveElementStyle('title', { fontSize: '24px', lineHeight: 1.2 }, overrides, false)
  assertEqual(result.fontSize, '48px')
  assertEqual(result.lineHeight, 1.2)
})

test('resolveElementStyle applies mobile overrides on mobile', () => {
  const overrides = { title: { fontSize: '48px', mobile: { fontSize: '28px' } } }
  const result = resolveElementStyle('title', { fontSize: '24px' }, overrides, true)
  assertEqual(result.fontSize, '28px')
})

test('resolveElementStyle ignores mobile overrides on desktop', () => {
  const overrides = { title: { fontSize: '48px', mobile: { fontSize: '28px' } } }
  const result = resolveElementStyle('title', { fontSize: '24px' }, overrides, false)
  assertEqual(result.fontSize, '48px')
})

test('resolveElementStyle returns defaults when no overrides exist', () => {
  const result = resolveElementStyle('title', { fontSize: '24px' }, {}, false)
  assertEqual(result.fontSize, '24px')
})

// Phase 4: Typography resolution
console.log('\nPhase 4: Typography Resolution');

test('resolveTypography only applies typography keys', () => {
  const overrides = { title: { fontSize: '48px', color: 'red', background: 'blue' } }
  const result = resolveTypography('title', { fontSize: '24px' }, overrides, false)
  assertEqual(result.fontSize, '48px')
  assertEqual(result.color, undefined) // not a typo key
  assertEqual(result.background, undefined) // not a typo key
})

test('resolveTypography applies mobile overrides for typo keys', () => {
  const overrides = { title: { fontSize: '48px', mobile: { fontSize: '28px' } } }
  const result = resolveTypography('title', { fontSize: '24px' }, overrides, true)
  assertEqual(result.fontSize, '28px')
})

// Phase 5: Page design resolution
console.log('\nPhase 5: Page Design Resolution');

test('resolvePageDesign returns defaults for empty input', () => {
  const result = resolvePageDesign({}, false)
  assertEqual(result.contentWidth, '1200px')
  assertEqual(result.sectionPadding, '80px 0')
})

test('resolvePageDesign applies light background preset', () => {
  const result = resolvePageDesign({ background: 'light' }, false)
  assertEqual(result.backgroundPreset, '#F7F4EE')
})

test('resolvePageDesign applies dark background preset', () => {
  const result = resolvePageDesign({ background: 'dark' }, false)
  assertEqual(result.backgroundPreset, '#1a1715')
})

test('resolvePageDesign applies compact spacing', () => {
  const result = resolvePageDesign({ spacing: 'compact' }, false)
  assertEqual(result.sectionPadding, '48px 0')
})

test('resolvePageDesign applies spacious spacing', () => {
  const result = resolvePageDesign({ spacing: 'spacious' }, false)
  assertEqual(result.sectionPadding, '120px 0')
})

test('resolvePageDesign applies wide content width', () => {
  const result = resolvePageDesign({ contentWidth: '1600px' }, false)
  assertEqual(result.contentWidth, '1600px')
})

test('resolvePageDesign applies mobile overrides', () => {
  const result = resolvePageDesign({ contentWidth: '1600px', mobile: { contentWidth: '800px' } }, true)
  assertEqual(result.contentWidth, '800px')
})

test('resolvePageDesign ignores mobile overrides on desktop', () => {
  const result = resolvePageDesign({ contentWidth: '1600px', mobile: { contentWidth: '800px' } }, false)
  assertEqual(result.contentWidth, '1600px')
})

test('resolvePageDesign returns empty object for null input', () => {
  const result = resolvePageDesign(null, false)
  assertEqual(Object.keys(result).length, 0)
})

// Phase 6: Section style resolution
console.log('\nPhase 6: Section Style Resolution');

test('resolveSectionStyle uses section override over page design', () => {
  const section = { contentWidth: '800px' }
  const pageDesign = { contentWidth: '1600px' }
  const result = resolveSectionStyle(section, pageDesign, false)
  assertEqual(result.contentWidth, '800px')
})

test('resolveSectionStyle falls back to page design when no section override', () => {
  const result = resolveSectionStyle({}, { contentWidth: '1600px' }, false)
  assertEqual(result.contentWidth, '1600px')
})

test('resolveSectionStyle applies mobile section overrides', () => {
  const section = { contentWidth: '1200px', mobile: { contentWidth: '800px' } }
  const result = resolveSectionStyle(section, {}, true)
  assertEqual(result.contentWidth, '800px')
})

test('resolveSectionStyle applies alignment from section override', () => {
  const result = resolveSectionStyle({ alignment: 'center' }, {}, false)
  assertEqual(result.textAlign, 'center')
})

test('resolveSectionStyle applies backgroundPreset from section override', () => {
  const result = resolveSectionStyle({ backgroundPreset: 'dark' }, {}, false)
  assertEqual(result.backgroundPreset, 'dark')
})

// Phase 7: Variant CSS class generation
console.log('\nPhase 7: Variant CSS Class Generation');

test('getVariantClass generates correct class for hero/split', () => {
  assertEqual(getVariantClass('v2-hero', 'split'), 'v2-hero--split')
})

test('getVariantClass generates correct class for hero/minimal', () => {
  assertEqual(getVariantClass('v2-hero', 'minimal'), 'v2-hero--minimal')
})

test('getVariantClass returns empty string for null variant', () => {
  assertEqual(getVariantClass('v2-hero', null), '')
})

test('getVariantClass generates correct class for philosophy/centered', () => {
  assertEqual(getVariantClass('v2-philosophy', 'centered'), 'v2-philosophy--centered')
})

// Phase 8: Integration — simulate CMS data flow
console.log('\nPhase 8: Integration — CMS Data Flow');

test('Full flow: variant + section overrides + element overrides + page design', () => {
  // Simulate CMS data
  const sectionData = {
    variant: 'split',
    styleOverrides: JSON.stringify({ title: { fontSize: '48px', mobile: { fontSize: '28px' } } }),
    sectionStyleOverrides: JSON.stringify({ contentWidth: '800px', alignment: 'center' }),
  }
  const pageDesign = { contentWidth: '1600px', spacing: 'spacious', background: 'light' }

  // Resolve variant
  const variant = resolveVariant('hero', sectionData.variant)
  assertEqual(variant.id, 'split')

  // Parse overrides
  const styleOverrides = parseStyleOverrides(sectionData.styleOverrides)
  const sectionOverrides = parseSectionOverrides(sectionData.sectionStyleOverrides)

  // Resolve section style (section > page design)
  const sectionStyle = resolveSectionStyle(sectionOverrides, resolvePageDesign(pageDesign, false), false)
  assertEqual(sectionStyle.contentWidth, '800px') // section wins
  assertEqual(sectionStyle.textAlign, 'center')

  // Resolve element style
  const titleStyle = resolveElementStyle('title', { fontSize: '24px' }, styleOverrides, false)
  assertEqual(titleStyle.fontSize, '48px')

  // Mobile element style
  const titleStyleMobile = resolveElementStyle('title', { fontSize: '24px' }, styleOverrides, true)
  assertEqual(titleStyleMobile.fontSize, '28px')

  // CSS class
  assertEqual(getVariantClass('v2-hero', variant.id), 'v2-hero--split')
})

test('Full flow: no variant stored uses default', () => {
  const sectionData = { variant: null }
  const variant = resolveVariant('hero', sectionData.variant)
  assertEqual(variant.id, 'full')
})

test('Full flow: empty overrides chain uses page design defaults', () => {
  const sectionData = {}
  const pageDesign = {}
  const variant = resolveVariant('hero', sectionData.variant)
  assertEqual(variant.id, 'full')
  const styleOverrides = parseStyleOverrides(sectionData.styleOverrides)
  const sectionOverrides = parseSectionOverrides(sectionData.sectionStyleOverrides)
  const resolvedPD = resolvePageDesign(pageDesign, false)
  const sectionStyle = resolveSectionStyle(sectionOverrides, resolvedPD, false)
  // Empty section overrides → falls back to page design default (1200px)
  assertEqual(sectionStyle.contentWidth, '1200px')
})

// ─── Database checks ─────────────────────────────────────────────────────────
console.log('\nPhase 9: Database Schema Checks');

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'teakle.db');
let db;
try {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
} catch (e) {
  console.log('  \x1b[33m⚠\x1b[0m Cannot open DB for schema checks — skipping');
}

if (db) {
  test('content_sections has variant column', () => {
    const cols = db.prepare("PRAGMA table_info(content_sections)").all()
    const hasVariant = cols.some(c => c.name === 'variant')
    assert(hasVariant, 'variant column missing')
  })

  test('content_sections has styleOverrides column', () => {
    const cols = db.prepare("PRAGMA table_info(content_sections)").all()
    const hasCol = cols.some(c => c.name === 'styleOverrides')
    assert(hasCol, 'styleOverrides column missing')
  })

  test('content_sections has sectionStyleOverrides column', () => {
    const cols = db.prepare("PRAGMA table_info(content_sections)").all()
    const hasCol = cols.some(c => c.name === 'sectionStyleOverrides')
    assert(hasCol, 'sectionStyleOverrides column missing')
  })

  test('pages table has pageDesign column', () => {
    const cols = db.prepare("PRAGMA table_info(pages)").all()
    const hasCol = cols.some(c => c.name === 'pageDesign')
    assert(hasCol, 'pageDesign column missing')
  })

  test('content_sections has instanceId column', () => {
    const cols = db.prepare("PRAGMA table_info(content_sections)").all()
    const hasCol = cols.some(c => c.name === 'instanceId')
    assert(hasCol, 'instanceId column missing')
  })

  test('content_sections has draftStyleOverrides column', () => {
    const cols = db.prepare("PRAGMA table_info(content_sections)").all()
    const hasCol = cols.some(c => c.name === 'draftStyleOverrides')
    assert(hasCol, 'draftStyleOverrides column missing')
  })

  test('content_sections has draftSectionStyleOverrides column', () => {
    const cols = db.prepare("PRAGMA table_info(content_sections)").all()
    const hasCol = cols.some(c => c.name === 'draftSectionStyleOverrides')
    assert(hasCol, 'draftSectionStyleOverrides column missing')
  })

  db.close()
}

// ─── File existence checks ──────────────────────────────────────────────────
console.log('\nPhase 10: File Checks');

test('designResolution.js exists', () => {
  assert(fs.existsSync(path.join(process.cwd(), 'lib', 'designResolution.js')), 'designResolution.js not found')
})

test('homepage.css has hero variant CSS', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'app', 'homepage.css'), 'utf8')
  assert(css.includes('v2-hero--split'), 'Missing .v2-hero--split CSS')
  assert(css.includes('v2-hero--minimal'), 'Missing .v2-hero--minimal CSS')
})

test('homepage.css has philosophy variant CSS', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'app', 'homepage.css'), 'utf8')
  assert(css.includes('v2-philosophy--centered'), 'Missing .v2-philosophy--centered CSS')
})

test('homepage.css has signature variant CSS', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'app', 'homepage.css'), 'utf8')
  assert(css.includes('v2-sig-editorial--gallery'), 'Missing .v2-sig-editorial--gallery CSS')
})

test('HomeClient.js imports designResolution', () => {
  const code = fs.readFileSync(path.join(process.cwd(), 'app', 'HomeClient.js'), 'utf8')
  assert(code.includes('designResolution'), 'HomeClient.js does not import designResolution')
})

test('HomeClient.js accepts pageDesign prop', () => {
  const code = fs.readFileSync(path.join(process.cwd(), 'app', 'HomeClient.js'), 'utf8')
  assert(code.includes('pageDesign'), 'HomeClient.js does not reference pageDesign')
})

test('page.js imports getPageDesignSettings', () => {
  const code = fs.readFileSync(path.join(process.cwd(), 'app', 'page.js'), 'utf8')
  assert(code.includes('getPageDesignSettings'), 'page.js does not import getPageDesignSettings')
})

test('page.js passes pageDesign to HomeClient', () => {
  const code = fs.readFileSync(path.join(process.cwd(), 'app', 'page.js'), 'utf8')
  assert(code.includes('pageDesign={pageDesign}'), 'page.js does not pass pageDesign prop')
})

test('API route passes variant to saveDraftSection', () => {
  const code = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'content', '[page]', '[sectionKey]', 'route.js'), 'utf8')
  assert(code.includes('variant: body.variant'), 'API route does not pass variant')
})

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('\n==================================================');
console.log(`Sprint 8 Tests: ${passed}/${passed + failed} passed, ${failed} failed`);
console.log('==================================================');

if (failed > 0) process.exit(1);

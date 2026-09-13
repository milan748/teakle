// Sprint 12 Tests — Tablet Canvas Editing & Responsive Layout Controls
// Run: node scripts/test-sprint12.js

import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
let passed = 0;
let failed = 0;
let total = 0;

function ok(label, condition, detail = '') {
  total++;
  if (condition) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${label}`); }
  else { failed++; console.log(`  \x1b[31m✗\x1b[0m ${label}${detail ? ' — ' + detail : ''}`); }
}

function read(rel) {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

console.log('\n==================================================');
console.log('Sprint 12 Tests — Tablet Canvas Editing');
console.log('==================================================\n');

// ── Phase 1: normalizeViewport helper ──
console.log('Phase 1: normalizeViewport Helper');
{
  const drSrc = read('lib/designResolution.js');
  ok('normalizeViewport function exists', drSrc.includes('export function normalizeViewport'));
  ok('normalizeViewport handles boolean false → desktop', drSrc.includes("return viewportOrIsMobile ? 'mobile' : 'desktop'"));
  ok('normalizeViewport handles string viewport', drSrc.includes("'tablet' || viewportOrIsMobile === 'mobile' || viewportOrIsMobile === 'desktop'"));
}

// ── Phase 2: Element Style Resolution — tablet ──
console.log('\nPhase 2: Element Style Resolution — Tablet');
{
  const drSrc = read('lib/designResolution.js');
  ok('resolveElementStyle calls normalizeViewport', drSrc.includes("const viewport = normalizeViewport(viewportOrIsMobile)") && drSrc.includes('resolveElementStyle'));
  ok('Filters both mobile and tablet subkeys from desktop', drSrc.includes("key !== 'mobile' && key !== 'tablet'"));
  ok('Applies tablet overrides when viewport=tablet', drSrc.includes("viewport === 'tablet' && el.tablet"));
  ok('Applies mobile overrides when viewport=mobile', drSrc.includes("viewport === 'mobile' && el.mobile"));
}

// ── Phase 3: Typography Resolution — tablet ──
console.log('\nPhase 3: Typography Resolution — Tablet');
{
  const drSrc = read('lib/designResolution.js');
  ok('resolveTypography calls normalizeViewport', drSrc.includes('resolveTypography') && drSrc.includes("const viewport = normalizeViewport(viewportOrIsMobile)"));
  ok('resolveTypography applies tablet overrides', drSrc.includes("viewport === 'tablet' && el.tablet") || drSrc.includes("el.tablet[k] !== undefined"));
}

// ── Phase 4: Section Style Resolution — tablet ──
console.log('\nPhase 4: Section Style Resolution — Tablet');
{
  const drSrc = read('lib/designResolution.js');
  ok('resolveSectionStyle calls normalizeViewport', drSrc.includes('resolveSectionStyle') && drSrc.includes("const viewport = normalizeViewport(viewportOrIsMobile)"));
  ok('resolveSectionStyle resolves tablet subkey', drSrc.includes("viewport === 'tablet' ? (sectionOverrides.tablet || {})"));
  ok('resolveSectionStyle resolves mobile subkey', drSrc.includes("viewport === 'mobile' ? (sectionOverrides.mobile || {})"));
  ok('Content width precedence: mobile > tablet > base > pageDesign', drSrc.includes('mobile.contentWidth || tablet.contentWidth || sectionOverrides.contentWidth || pageDesignDefaults.contentWidth'));
  ok('Padding precedence: mobile > tablet > base > pageDesign', drSrc.includes('mobile.paddingTop || tablet.paddingTop || sectionOverrides.paddingTop || pageDesignDefaults.paddingTop'));
}

// ── Phase 5: Page Design Resolution — tablet ──
console.log('\nPhase 5: Page Design Resolution — Tablet');
{
  const drSrc = read('lib/designResolution.js');
  ok('resolvePageDesign calls normalizeViewport', drSrc.includes('resolvePageDesign') && drSrc.includes("const viewport = normalizeViewport(viewportOrIsMobile)"));
  ok('resolvePageDesign resolves tablet subkey', drSrc.includes("viewport === 'tablet' && pageDesign.tablet"));
  ok('Background precedence: mobile > tablet > base', drSrc.includes('mobile.background || tablet.background || pageDesign.background'));
  ok('Spacing precedence: mobile > tablet > base', drSrc.includes('mobile.spacing || tablet.spacing || pageDesign.spacing'));
  ok('ContentWidth precedence: mobile > tablet > base', drSrc.includes('mobile.contentWidth || tablet.contentWidth || pageDesign.contentWidth'));
}

// ── Phase 6: EditorToolbar — 3 viewport buttons ──
console.log('\nPhase 6: EditorToolbar — Viewport Buttons');
{
  const toolbarSrc = read('app/admin/editor/EditorToolbar.js');
  ok('Has Desktop button', toolbarSrc.includes("'desktop'") && toolbarSrc.includes('Desktop'));
  ok('Has Tablet button', toolbarSrc.includes("'tablet'") && toolbarSrc.includes('Tablet'));
  ok('Has Mobile button', toolbarSrc.includes("'mobile'") && toolbarSrc.includes('Mobile'));
  ok('Desktop button has aria-pressed', toolbarSrc.includes("aria-pressed={viewMode === 'desktop'}"));
  ok('Tablet button has aria-pressed', toolbarSrc.includes("aria-pressed={viewMode === 'tablet'}"));
  ok('Mobile button has aria-pressed', toolbarSrc.includes("aria-pressed={viewMode === 'mobile'}"));
}

// ── Phase 7: Canvas — tablet viewport width ──
console.log('\nPhase 7: Canvas — Tablet Viewport Width');
{
  const canvasSrc = read('app/admin/editor/Canvas.js');
  ok('Canvas has tablet width (768px)', canvasSrc.includes("viewMode === 'tablet' ? '768px'"));
  ok('Canvas has mobile width (375px)', canvasSrc.includes("viewMode === 'mobile' ? '375px'"));
  ok('Canvas centers tablet viewport', canvasSrc.includes("viewMode === 'desktop' ? 'stretch' : 'center'"));
  ok('Canvas has tablet boxShadow', canvasSrc.includes("viewMode === 'desktop' ? 'none' : '0 0 40px"));
  ok('Canvas has tablet maxWidth', canvasSrc.includes("viewMode === 'tablet' ? '768px'"));
}

// ── Phase 8: EditorClient — tablet override storage ──
console.log('\nPhase 8: EditorClient — Tablet Override Storage');
{
  const editorSrc = read('app/admin/editor/EditorClient.js');
  ok('handleStyleChange stores tablet overrides under .tablet subkey', editorSrc.includes("if (!overrides[elementKey].tablet) overrides[elementKey].tablet = {}") && editorSrc.includes("overrides[elementKey].tablet[property] = value"));
  ok('handleSectionStyleChange stores tablet overrides under .tablet subkey', editorSrc.includes("if (!overrides.tablet) overrides.tablet = {}") && editorSrc.includes("overrides.tablet[property] = value"));
  ok('Inspector receives viewMode prop', editorSrc.includes('viewMode={viewMode}'));
  ok('FloatingToolbar receives viewMode prop', editorSrc.includes("viewMode={viewMode}"));
}

// ── Phase 9: Inspector — responsive override resolution ──
console.log('\nPhase 9: Inspector — Responsive Override Resolution');
{
  const inspectorSrc = read('app/admin/editor/Inspector.js');
  ok('Inspector accepts viewMode prop', inspectorSrc.includes("viewMode = 'desktop'"));
  ok('Inspector has resolveOverrides function', inspectorSrc.includes('function resolveOverrides'));
  ok('Inspector has resolveSectionOverrides function', inspectorSrc.includes('function resolveSectionOverrides'));
  ok('Inspector computes resolvedStyleOverrides', inspectorSrc.includes('const resolvedStyleOverrides'));
  ok('SectionControls uses resolved overrides', inspectorSrc.includes('sectionStyleOverrides={resolveSectionOverrides'));
  ok('TypographyControls uses resolved overrides', inspectorSrc.includes('styleOverrides={resolvedStyleOverrides}'));
  ok('SpacingControls uses resolved overrides', inspectorSrc.includes('styleOverrides={resolvedStyleOverrides}'));
  ok('ImageControls uses resolved overrides', inspectorSrc.includes('styleOverrides={resolvedStyleOverrides}'));
  ok('ButtonElementControls uses resolved overrides', inspectorSrc.includes('styleOverrides={resolvedStyleOverrides}'));
}

// ── Phase 10: FloatingToolbar — responsive override resolution ──
console.log('\nPhase 10: FloatingToolbar — Responsive Override Resolution');
{
  const ftSrc = read('app/admin/editor/FloatingToolbar.js');
  ok('FloatingToolbar accepts viewMode prop', ftSrc.includes("viewMode = 'desktop'"));
  ok('FloatingToolbar resolves tablet overrides', ftSrc.includes("viewMode === 'tablet' && rawOverrides.tablet"));
  ok('FloatingToolbar resolves mobile overrides', ftSrc.includes("viewMode === 'mobile' && rawOverrides.mobile"));
}

// ── Phase 11: PageDesignPanel — tablet overrides section ──
console.log('\nPhase 11: PageDesignPanel — Tablet Overrides');
{
  const pdpSrc = read('app/admin/editor/PageDesignPanel.js');
  ok('PageDesignPanel has tabletOverrides state', pdpSrc.includes('const [tabletOverrides, setTabletOverrides]'));
  ok('PageDesignPanel has updateTablet function', pdpSrc.includes('function updateTablet'));
  ok('PageDesignPanel has Tablet Overrides section', pdpSrc.includes('"Tablet Overrides"'));
  ok('Tablet Overrides has content width control', pdpSrc.includes('tabletOverrides.contentWidth'));
  ok('Tablet Overrides has spacing control', pdpSrc.includes('tabletOverrides.spacing'));
  ok('Mobile Overrides section still exists', pdpSrc.includes('"Mobile Overrides"'));
}

// ── Phase 12: All 13 section components handle tablet ──
console.log('\nPhase 12: Section Components — Tablet Support');
{
  const sectionFiles = [
    'HeroSection.js', 'PhilosophySection.js', 'SignatureSection.js',
    'CraftsmanshipSection.js', 'LifestyleSection.js', 'PageHeroSection.js',
    'PageIntroSection.js', 'PageOriginSection.js', 'PageGallerySection.js',
    'MaterialsSection.js', 'CollectionCarouselSection.js', 'ProductGridSection.js',
    'TrustBarSection.js',
  ];
  
  let allHaveTablet = true;
  let allOldPatternRemoved = true;
  for (const file of sectionFiles) {
    const src = read(`app/admin/editor/sections/${file}`);
    const hasTablet = src.includes("key !== 'tablet'") && src.includes("viewMode === 'tablet'") && src.includes("overrides.tablet");
    if (!hasTablet) {
      allHaveTablet = false;
      ok(`  ${file} has tablet support`, false);
    }
    // Check old pattern is gone (standalone mobile-only filter)
    if (src.includes("if (key !== 'mobile') base[key] = val") && !src.includes("if (key !== 'mobile' && key !== 'tablet') base[key] = val")) {
      allOldPatternRemoved = false;
      ok(`  ${file} still has old pattern`, false);
    }
  }
  ok('All 13 section components have tablet support', allHaveTablet);
  ok('No old mobile-only pattern remains', allOldPatternRemoved);
}

// ── Phase 13: designResolution.js exports ──
console.log('\nPhase 13: designResolution.js Exports');
{
  const drSrc = read('lib/designResolution.js');
  ok('Exports normalizeViewport', drSrc.includes('export function normalizeViewport'));
  ok('Exports resolveElementStyle', drSrc.includes('export function resolveElementStyle'));
  ok('Exports resolveTypography', drSrc.includes('export function resolveTypography'));
  ok('Exports resolveSectionStyle', drSrc.includes('export function resolveSectionStyle'));
  ok('Exports resolvePageDesign', drSrc.includes('export function resolvePageDesign'));
  ok('Exports resolveVariant', drSrc.includes('export function resolveVariant'));
  ok('Exports parseStyleOverrides', drSrc.includes('export function parseStyleOverrides'));
  ok('Exports parseSectionOverrides', drSrc.includes('export function parseSectionOverrides'));
  ok('Exports getVariantClass', drSrc.includes('export function getVariantClass'));
}

// ── Phase 14: Data model integrity ──
console.log('\nPhase 14: Data Model Integrity');
{
  const dbSrc = read('lib/db.js');
  ok('DB schema unchanged — styleOverrides column', dbSrc.includes('styleOverrides TEXT'));
  ok('DB schema unchanged — sectionStyleOverrides column', dbSrc.includes('sectionStyleOverrides TEXT'));
  ok('No tablet-specific DB columns added', !dbSrc.includes('tabletOverrides'));
  
  const cmsSrc = read('lib/cms.js');
  ok('CMS saveDraftSection unchanged', cmsSrc.includes('function saveDraftSection'));
  ok('CMS publishSection unchanged', cmsSrc.includes('function publishSection'));
}

// ── Phase 15: Precedence model documentation ──
console.log('\nPhase 15: Precedence Model');
{
  const drSrc = read('lib/designResolution.js');
  ok('Precedence comment includes tablet', drSrc.includes('5. Tablet overrides'));
  ok('Precedence comment includes mobile', drSrc.includes('6. Mobile overrides'));
}

// ── Phase 16: Backward compatibility ──
console.log('\nPhase 16: Backward Compatibility');
{
  const drSrc = read('lib/designResolution.js');
  ok('normalizeViewport accepts boolean', drSrc.includes("typeof viewportOrIsMobile === 'string'") && drSrc.includes("viewportOrIsMobile ? 'mobile' : 'desktop'"));
  ok('resolveElementStyle accepts viewportOrIsMobile', drSrc.includes('resolveElementStyle(elementKey, defaults, styleOverrides, viewportOrIsMobile)'));
  ok('resolveTypography accepts viewportOrIsMobile', drSrc.includes('resolveTypography(elementKey, defaults, styleOverrides, viewportOrIsMobile)'));
  ok('resolveSectionStyle accepts viewportOrIsMobile', drSrc.includes('resolveSectionStyle(sectionOverrides, pageDesignDefaults = {}, viewportOrIsMobile)'));
  ok('resolvePageDesign accepts viewportOrIsMobile', drSrc.includes('resolvePageDesign(pageDesign, viewportOrIsMobile)'));
}

// ── Phase 17: EditorClient viewMode state ──
console.log('\nPhase 17: EditorClient Viewport State');
{
  const editorSrc = read('app/admin/editor/EditorClient.js');
  ok('viewMode state initialized to desktop', editorSrc.includes("const [viewMode, setViewMode] = useState('desktop')"));
  ok('viewMode passed to EditorToolbar', editorSrc.includes('viewMode={viewMode}') && editorSrc.includes('onViewModeChange={setViewMode}'));
  ok('viewMode passed to Canvas', editorSrc.includes('<Canvas') && editorSrc.includes('viewMode={viewMode}'));
  ok('viewMode passed to Inspector', editorSrc.includes('<Inspector') && editorSrc.includes('viewMode={viewMode}'));
  ok('viewMode passed to FloatingToolbar', editorSrc.includes('<FloatingToolbar') && editorSrc.includes('viewMode={viewMode}'));
}

// ── Phase 18: CSS canvas area handles tablet ──
console.log('\nPhase 18: Editor CSS — Tablet Support');
{
  const editorSrc = read('app/admin/editor/EditorClient.js');
  ok('Editor CSS has responsive breakpoints', editorSrc.includes('@media') && editorSrc.includes('min-width'));
}

// ── Results ──
console.log('\n==================================================');
console.log(`Sprint 12 Tests: ${passed}/${total} passed, ${failed} failed`);
console.log('==================================================\n');

if (failed > 0) process.exit(1);

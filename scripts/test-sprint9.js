// Sprint 9 Tests — Unified Design Resolution (Studio + Homepage)
// Tests that Studio uses the same design resolution system as Homepage.

import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
let passed = 0;
let failed = 0;

function ok(label, condition, detail = '') {
  if (condition) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${label}`); }
  else { failed++; console.log(`  \x1b[31m✗\x1b[0m ${label}${detail ? ' — ' + detail : ''}`); }
}

function read(rel) {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

console.log('\n==================================================');
console.log('Sprint 9 Tests — Unified Design Resolution');
console.log('==================================================\n');

// ── Phase 1: Studio page imports designResolution ──
console.log('Phase 1: Studio Design Resolution Imports');
const studioPage = read('app/studio/page.js');
ok('Studio imports getPageDesignSettings', studioPage.includes("import { getPublishedPageSections, seedDefaultSections, getPageDesignSettings } from '@/lib/cms'"));
ok('Studio imports resolvePageDesign', studioPage.includes("import { resolvePageDesign"));
ok('Studio imports resolveVariant', studioPage.includes("resolveVariant"));
ok('Studio imports parseStyleOverrides', studioPage.includes("parseStyleOverrides"));
ok('Studio imports parseSectionOverrides', studioPage.includes("parseSectionOverrides"));
ok('Studio imports resolveSectionStyle', studioPage.includes("resolveSectionStyle"));
ok('Studio imports getVariantClass', studioPage.includes("getVariantClass"));

// ── Phase 2: Studio resolves page design ──
console.log('\nPhase 2: Studio Page Design Resolution');
ok('Studio calls getPageDesignSettings', studioPage.includes("getPageDesignSettings('studio')"));
ok('Studio calls resolvePageDesign', studioPage.includes('resolvePageDesign(pageDesign'));
ok('Studio resolves as desktop (isMobile=false)', studioPage.includes('resolvePageDesign(pageDesign, false)'));
ok('Studio sets CSS custom properties from page design', studioPage.includes('--studio-content-width'));
ok('Studio sets section padding variable', studioPage.includes('--studio-section-padding'));
ok('Studio sets gap variable', studioPage.includes('--studio-gap'));
ok('Studio sets heading scale variable', studioPage.includes('--studio-heading-scale'));

// ── Phase 3: Studio resolves variants ──
console.log('\nPhase 3: Studio Variant Resolution');
ok('Studio resolves hero variant', studioPage.includes("resolveVariant('hero', hero.variant)"));
ok('Studio resolves origin variant', studioPage.includes("resolveVariant('origin', origin.variant)"));
ok('Studio resolves materials variant', studioPage.includes("resolveVariant('materials', materials.variant)"));
ok('Studio resolves gallery variant', studioPage.includes("resolveVariant('gallery', gallery.variant)"));
ok('Studio applies variant CSS class to hero', studioPage.includes("getVariantClass('page-hero', heroVariant?.id)"));
ok('Studio applies variant CSS class to origin', studioPage.includes("getVariantClass('origin', originVariant?.id)"));
ok('Studio applies variant CSS class to materials', studioPage.includes("getVariantClass('materials', materialsVariant?.id)"));
ok('Studio applies variant CSS class to gallery', studioPage.includes("getVariantClass('gallery', galleryVariant?.id)"));

// ── Phase 4: Studio resolves section overrides ──
console.log('\nPhase 4: Studio Section Override Resolution');
ok('Studio resolves hero section style', studioPage.includes("resolveSectionStyle(parseSectionOverrides(hero.sectionStyleOverrides)"));
ok('Studio resolves origin section style', studioPage.includes("resolveSectionStyle(parseSectionOverrides(origin.sectionStyleOverrides)"));
ok('Studio resolves materials section style', studioPage.includes("resolveSectionStyle(parseSectionOverrides(materials.sectionStyleOverrides)"));
ok('Studio resolves gallery section style', studioPage.includes("resolveSectionStyle(parseSectionOverrides(gallery.sectionStyleOverrides)"));
ok('Studio applies backgroundPreset to origin', studioPage.includes("originSectionStyle.backgroundPreset"));
ok('Studio applies backgroundPreset to materials', studioPage.includes("materialsSectionStyle.backgroundPreset"));
ok('Studio applies backgroundPreset to gallery', studioPage.includes("gallerySectionStyle.backgroundPreset"));

// ── Phase 5: Studio parses element overrides ──
console.log('\nPhase 5: Studio Element Override Parsing');
ok('Studio parses hero styleOverrides', studioPage.includes("parseStyleOverrides(hero.styleOverrides)"));
ok('Studio parses origin styleOverrides', studioPage.includes("parseStyleOverrides(origin.styleOverrides)"));
ok('Studio parses materials styleOverrides', studioPage.includes("parseStyleOverrides(materials.styleOverrides)"));
ok('Studio parses gallery styleOverrides', studioPage.includes("parseStyleOverrides(gallery.styleOverrides)"));

// ── Phase 6: Section Variants Registry ──
console.log('\nPhase 6: Section Variants Registry');
const registry = read('app/admin/editor/sections/registry.js');
ok('Registry has origin variants', registry.includes("origin: ["));
ok('Registry has materials variants', registry.includes("materials: ["));
ok('Registry has gallery variants', registry.includes("gallery: ["));
ok('Origin has standard variant', registry.includes("{ id: 'standard', label: 'Standard', description: 'Image on left, text on right' }"));
ok('Origin has centered variant', registry.includes("{ id: 'centered', label: 'Centered', description: 'Text centered with image above' }"));
ok('Materials has standard variant', registry.includes("{ id: 'standard', label: 'Standard Grid', description: '3-column grid layout' }"));
ok('Materials has compact variant', registry.includes("{ id: 'compact', label: 'Compact', description: 'Single-column list layout' }"));
ok('Gallery has standard variant', registry.includes("{ id: 'standard', label: 'Standard Grid', description: '2-column asymmetric grid' }"));
ok('Gallery has full variant', registry.includes("{ id: 'full', label: 'Full Width', description: 'Full-width mosaic layout' }"));

// ── Phase 7: CSS Variant Classes ──
console.log('\nPhase 7: CSS Variant Classes');
const styles = read('styles.css');
ok('styles.css has page-hero--split class', styles.includes('.page-hero--split'));
ok('styles.css has page-hero--minimal class', styles.includes('.page-hero--minimal'));
ok('styles.css has origin--centered class', styles.includes('.origin--centered'));
ok('styles.css has materials--compact class', styles.includes('.materials--compact'));
ok('styles.css has gallery--full class', styles.includes('.gallery--full'));
ok('page-hero--split has grid layout', styles.includes('.page-hero--split {') && styles.includes('grid-template-columns: 1fr 1fr'));
ok('page-hero--minimal hides image', styles.includes('.page-hero--minimal img { display: none'));
ok('origin--centered centers content', styles.includes('.origin--centered .origin-grid {') && styles.includes('grid-template-columns: 1fr'));
ok('materials--compact uses single column', styles.includes('.materials--compact .materials-grid {') && styles.includes('grid-template-columns: 1fr'));

// ── Phase 8: Studio CSS uses design tokens ──
console.log('\nPhase 8: Studio CSS Uses Design Tokens');
ok('Studio CSS uses --studio-content-width', studioPage.includes('var(--studio-content-width)'));
ok('Studio CSS uses --studio-section-padding', studioPage.includes('var(--studio-section-padding)'));
ok('Studio CSS uses --studio-gap', studioPage.includes('var(--studio-gap)'));
ok('Studio CSS uses --studio-heading-scale', studioPage.includes('--studio-heading-scale'));
ok('Studio origin uses --studio-content-width', studioPage.includes('.origin-grid {') && studioPage.includes('max-width: var(--studio-content-width)'));
ok('Studio materials uses --studio-content-width', studioPage.includes('.materials-grid {') && studioPage.includes('max-width: var(--studio-content-width)'));
ok('Studio gallery uses --studio-content-width', studioPage.includes('.gallery-header {') && studioPage.includes('max-width: var(--studio-content-width)'));

// ── Phase 9: Content Preservation ──
console.log('\nPhase 9: Content Preservation');
ok('Hero eyebrow text preserved', studioPage.includes("'Studio'"));
ok('Hero title text preserved', studioPage.includes("'Why we work in solid wood, and why it takes as long as it does.'"));
ok('Hero subtitle text preserved', studioPage.includes("'The materials, the process, and the workshop behind every Teakle piece.'"));
ok('Origin eyebrow text preserved', studioPage.includes("'Where We Started'"));
ok('Origin title text preserved', studioPage.includes("'A carpentry practice that became a workshop, over three generations.'"));
ok('Origin body text preserved', studioPage.includes('Teakle began as a small carpentry practice in India'));
ok('Materials eyebrow text preserved', studioPage.includes("'Materials'"));
ok('Materials title text preserved', studioPage.includes("Solid wood, and why we don't use anything else."));
ok('Gallery eyebrow text preserved', studioPage.includes("'The Workshop'"));
ok('Gallery title text preserved', studioPage.includes('The people and tools behind every piece.'));
ok('Process eyebrow text preserved', studioPage.includes('>The Journey<'));
ok('Process title text preserved', studioPage.includes('From timber to finished object.'));
ok('Process milestones preserved (Selection)', studioPage.includes('>Selection<'));
ok('Process milestones preserved (Joinery)', studioPage.includes('>Joinery<'));
ok('Process milestones preserved (Shaping)', studioPage.includes('>Shaping<'));
ok('Process milestones preserved (Finishing)', studioPage.includes('>Finishing<'));
ok('Process milestones preserved (Inspection)', studioPage.includes('>Inspection<'));

// ── Phase 10: Image URLs preserved ──
console.log('\nPhase 10: Image URLs Preserved');
ok('Hero image URL preserved', studioPage.includes('pexels.com/photos/5710742'));
ok('Origin image URL preserved', studioPage.includes('pexels.com/photos/5973919'));
ok('Gallery image URLs preserved', studioPage.includes('pexels.com/photos/5974028'));
ok('Gallery third image URL preserved', studioPage.includes('pexels.com/photos/5974251'));

// ── Phase 11: Responsive Breakpoints ──
console.log('\nPhase 11: Responsive Breakpoints');
ok('Studio has 860px breakpoint for origin', studioPage.includes('@media (max-width: 860px)') && studioPage.includes('.origin-grid { grid-template-columns: 1fr'));
ok('Studio has 860px breakpoint for materials', studioPage.includes('.materials-grid { grid-template-columns: 1fr'));
ok('Studio has 860px breakpoint for gallery', studioPage.includes('.gallery-grid { grid-template-columns: 1fr'));
ok('Studio has 560px breakpoint for process', studioPage.includes('@media (max-width: 560px)') && studioPage.includes('.process-roadmap'));
ok('Studio has variant responsive styles', studioPage.includes('.origin--centered .origin-grid { grid-template-columns: 1fr'));

// ── Phase 12: Homepage Regression ──
console.log('\nPhase 12: Homepage Regression');
const homePage = read('app/page.js');
const homeClient = read('app/HomeClient.js');
ok('Homepage still imports designResolution', homeClient.includes("import { resolvePageDesign"));
ok('Homepage still passes pageDesign to HomeClient', homePage.includes('pageDesign={pageDesign}'));
ok('Homepage still imports getPageDesignSettings', homePage.includes("getPageDesignSettings('home')"));

// ── Phase 13: File Integrity ──
console.log('\nPhase 13: File Integrity');
const designRes = read('lib/designResolution.js');
ok('designResolution.js exists', designRes.length > 0);
ok('designResolution.js exports resolvePageDesign', designRes.includes('export function resolvePageDesign'));
ok('designResolution.js exports resolveVariant', designRes.includes('export function resolveVariant'));
ok('designResolution.js exports resolveSectionStyle', designRes.includes('export function resolveSectionStyle'));
ok('designResolution.js exports getVariantClass', designRes.includes('export function getVariantClass'));
ok('designResolution.js exports resolveElementStyle', designRes.includes('export function resolveElementStyle'));
ok('designResolution.js exports resolveTypography', designRes.includes('export function resolveTypography'));

// ── Phase 14: StudioRoadmap Component ──
console.log('\nPhase 14: StudioRoadmap Component');
const roadmap = read('app/components/StudioRoadmap.js');
ok('StudioRoadmap is client component', roadmap.includes("'use client'"));
ok('StudioRoadmap has IntersectionObserver', roadmap.includes('IntersectionObserver'));
ok('StudioRoadmap uses data-milestone attribute', roadmap.includes('data-milestone'));
ok('StudioRoadmap animates path fill', roadmap.includes('pathFill'));
ok('StudioRoadmap has scroll handler', roadmap.includes('handleScroll'));

// ── Summary ──
console.log('\n==================================================');
console.log(`Sprint 9 Tests: ${passed}/${passed + failed} passed, ${failed} failed`);
console.log('==================================================\n');

if (failed > 0) process.exit(1);

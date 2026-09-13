// Sprint 16 Tests — Phase 10: Live State
// Run: node scripts/test-sprint16.js

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
console.log('Sprint 16 Tests — Phase 10: Live State');
console.log('==================================================\n');

// ── Phase 1: React.memo Import ──
console.log('Phase 1: React.memo Import');
{
  const sectionFiles = [
    'HeroSection.js', 'SignatureSection.js', 'CraftsmanshipSection.js',
    'LifestyleSection.js', 'PhilosophySection.js', 'PageHeroSection.js',
    'PageOriginSection.js', 'PageGallerySection.js', 'PageIntroSection.js',
    'TrustBarSection.js', 'CollectionCarouselSection.js', 'ProductGridSection.js',
    'MaterialsSection.js'
  ];
  
  let allHaveImport = true;
  let allHaveMemo = true;
  let allNoExportDefault = true;
  
  for (const file of sectionFiles) {
    const src = read(`app/admin/editor/sections/${file}`);
    if (!src.includes("import { memo } from 'react'")) allHaveImport = false;
    if (!src.includes('export default memo(')) allHaveMemo = false;
    if (src.includes('export default function')) allNoExportDefault = false;
  }
  
  ok(`All ${sectionFiles.length} sections import { memo } from 'react'`, allHaveImport);
  ok(`All ${sectionFiles.length} sections use memo() wrapper`, allHaveMemo);
  ok(`All ${sectionFiles.length} sections removed export default function`, allNoExportDefault);
}

// ── Phase 2: React.memo Wrapper Pattern ──
console.log('\nPhase 2: React.memo Wrapper Pattern');
{
  const sectionFiles = [
    'HeroSection.js', 'SignatureSection.js', 'CraftsmanshipSection.js',
    'LifestyleSection.js', 'PhilosophySection.js', 'PageHeroSection.js',
    'PageOriginSection.js', 'PageGallerySection.js', 'PageIntroSection.js',
    'TrustBarSection.js', 'CollectionCarouselSection.js', 'ProductGridSection.js',
    'MaterialsSection.js'
  ];
  
  let allCorrectPattern = true;
  
  for (const file of sectionFiles) {
    const src = read(`app/admin/editor/sections/${file}`);
    // Should have: function SectionName({ ... }) { ... }
    // And: export default memo(SectionName)
    const hasFunctionDecl = /^function \w+\(/m.test(src);
    const hasMemoExport = /export default memo\(\w+\)/.test(src);
    if (!hasFunctionDecl || !hasMemoExport) allCorrectPattern = false;
  }
  
  ok('All sections use function declaration (not export default function)', allCorrectPattern);
}

// ── Phase 3: Canvas Imports ──
console.log('\nPhase 3: Canvas Imports');
{
  const canvasSrc = read('app/admin/editor/Canvas.js');
  ok('Canvas imports section components', canvasSrc.includes('import') && canvasSrc.includes('Section'));
  ok('Canvas uses config.component to render sections', canvasSrc.includes('const SectionComponent = config.component'));
}

// ── Phase 4: Section Component Props ──
console.log('\nPhase 4: Section Component Props');
{
  const heroSrc = read('app/admin/editor/sections/HeroSection.js');
  ok('HeroSection accepts sectionKey prop', heroSrc.includes('sectionKey'));
  ok('HeroSection accepts data prop', heroSrc.includes('data'));
  ok('HeroSection accepts isSelected prop', heroSrc.includes('isSelected'));
  ok('HeroSection accepts selectedElement prop', heroSrc.includes('selectedElement'));
  ok('HeroSection accepts onSelectElement prop', heroSrc.includes('onSelectElement'));
  ok('HeroSection accepts viewMode prop', heroSrc.includes('viewMode'));
}

// ── Phase 5: No Schema/API Changes ──
console.log('\nPhase 5: No Schema/API Changes');
{
  let noApiChanges = true;
  let noDbChanges = true;
  
  const sectionFiles = [
    'HeroSection.js', 'SignatureSection.js', 'CraftsmanshipSection.js',
    'LifestyleSection.js', 'PhilosophySection.js', 'PageHeroSection.js',
    'PageOriginSection.js', 'PageGallerySection.js', 'PageIntroSection.js',
    'TrustBarSection.js', 'CollectionCarouselSection.js', 'ProductGridSection.js',
    'MaterialsSection.js'
  ];
  
  for (const file of sectionFiles) {
    const src = read(`app/admin/editor/sections/${file}`);
    if (src.includes('fetch(')) noApiChanges = false;
    if (src.includes('CREATE TABLE') || src.includes('ALTER TABLE')) noDbChanges = false;
  }
  
  ok('No API calls added to section components', noApiChanges);
  ok('No database schema changes in section components', noDbChanges);
}

// ── Phase 6: Build Verification ──
console.log('\nPhase 6: Build Verification');
{
  // Verify the files are syntactically valid by checking for common issues
  const sectionFiles = [
    'HeroSection.js', 'SignatureSection.js', 'CraftsmanshipSection.js',
    'LifestyleSection.js', 'PhilosophySection.js', 'PageHeroSection.js',
    'PageOriginSection.js', 'PageGallerySection.js', 'PageIntroSection.js',
    'TrustBarSection.js', 'CollectionCarouselSection.js', 'ProductGridSection.js',
    'MaterialsSection.js'
  ];
  
  let allValid = true;
  for (const file of sectionFiles) {
    const src = read(`app/admin/editor/sections/${file}`);
    // Check for balanced braces (basic syntax check)
    const openBraces = (src.match(/{/g) || []).length;
    const closeBraces = (src.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      console.log(`  WARNING: ${file} has unbalanced braces: ${openBraces} open, ${closeBraces} close`);
      allValid = false;
    }
  }
  
  ok('All section files have balanced braces', allValid);
}

// ── Summary ──
console.log('\n==================================================');
console.log(`Sprint 16 Tests: ${passed}/${total} passed, ${failed} failed`);
console.log('==================================================\n');

process.exit(failed > 0 ? 1 : 0);

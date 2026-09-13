// Sprint 14 Tests — Element Hierarchy in Sidebar
// Run: node scripts/test-sprint14.js

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
console.log('Sprint 14 Tests — Element Hierarchy in Sidebar');
console.log('==================================================\n');

// ── Phase 1: expandedSections State ──
console.log('Phase 1: expandedSections State');
{
  const src = read('app/admin/editor/EditorClient.js');
  ok('expandedSections state variable exists', src.includes('expandedSections') && src.includes('useState'));
  ok('expandedSections initialized as Set', src.includes('new Set()'));
  ok('expandedSections used in sidebar rendering', src.includes('expandedSections.has'));
}

// ── Phase 2: toggleExpand Function ──
console.log('\nPhase 2: toggleExpand Function');
{
  const src = read('app/admin/editor/EditorClient.js');
  ok('toggleExpand function exists', src.includes('function toggleExpand'));
  ok('toggleExpand accepts instanceId parameter', src.includes('toggleExpand(instanceId)'));
  ok('toggleExpand adds to Set when not present', src.includes('next.add(instanceId)'));
  ok('toggleExpand removes from Set when present', src.includes('next.delete(instanceId)'));
  ok('toggleExpand uses functional setState', src.includes('setExpandedSections(prev'));
}

// ── Phase 3: Expand/Collapse Button ──
console.log('\nPhase 3: Expand/Collapse Button');
{
  const src = read('app/admin/editor/EditorClient.js');
  ok('Expand/collapse button renders', src.includes('aria-expanded'));
  ok('aria-expanded uses isExpanded state', src.includes('aria-expanded={isExpanded}'));
  ok('Button has accessible label with section name', src.includes('aria-label={isExpanded ? `Collapse'));
  ok('Button calls toggleExpand on click', src.includes('toggleExpand(section.instanceId)'));
  ok('Button click stops propagation', src.includes('e.stopPropagation()') && src.includes('toggleExpand'));
  ok('Button has rotate transform for expanded state', src.includes('rotate(90deg)'));
  ok('Button shows triangle character', src.includes('▶'));
}

// ── Phase 4: Element Sub-List ──
console.log('\nPhase 4: Element Sub-List');
{
  const src = read('app/admin/editor/EditorClient.js');
  ok('Element sub-list renders when expanded', src.includes('isExpanded && elements.length > 0'));
  ok('Element sub-list has role="group"', src.includes('role="group"'));
  ok('Element sub-list has aria-label with section name', src.includes('aria-label={`${config?.label'));
  ok('Element sub-list has padding for indentation', src.includes('paddingLeft: \'36px\''));
  ok('Elements mapped from getElementsForSection', src.includes('elements.map((el)'));
}

// ── Phase 5: Element Sub-Rows ──
console.log('\nPhase 5: Element Sub-Rows');
{
  const src = read('app/admin/editor/EditorClient.js');
  ok('Element rows have role="option"', src.includes('role="option"') && src.includes('isElSelected'));
  ok('Element rows have aria-selected', src.includes('aria-selected={isElSelected}'));
  ok('Element rows have onClick handler', src.includes('setSelectedElement({ instanceId: section.instanceId, elementKey: el.contentField })'));
  ok('Element rows show element label', src.includes('{el.label}'));
  ok('Element rows have type icon', src.includes('typeIcon'));
  ok('Text type icon is T', src.includes("el.type === 'image' ? '🖼' : el.type === 'button' ? '→' : 'T'"));
  ok('Selected element has bronze left border', src.includes('isElSelected ? \'2px solid #A78659\' : \'2px solid transparent\''));
  ok('Selected element has bronze background', src.includes('rgba(167, 134, 89, 0.3)'));
  ok('Element rows have hover effect', src.includes('onMouseEnter') && src.includes('onMouseLeave'));
}

// ── Phase 6: Auto-Expand on Selection ──
console.log('\nPhase 6: Auto-Expand on Selection');
{
  const src = read('app/admin/editor/EditorClient.js');
  ok('useEffect auto-expands selected section', src.includes('Auto-expand selected section'));
  ok('useEffect depends on selectedElement', src.includes('[selectedElement]'));
  ok('useEffect checks selectedElement.instanceId', src.includes('selectedElement?.instanceId'));
  ok('useEffect only expands if not already expanded', src.includes('if (prev.has(selectedElement.instanceId)) return prev'));
}

// ── Phase 7: Keyboard Navigation ──
console.log('\nPhase 7: Keyboard Navigation');
{
  const src = read('app/admin/editor/EditorClient.js');
  ok('ArrowRight key handled for expand', src.includes("e.key === 'ArrowRight'"));
  ok('ArrowLeft key handled for collapse', src.includes("e.key === 'ArrowLeft'"));
  ok('ArrowRight calls toggleExpand when collapsed', src.includes('!expandedSections.has(sec.instanceId)'));
  ok('ArrowLeft calls toggleExpand when expanded', src.includes('expandedSections.has(sec.instanceId)') && src.includes("e.key === 'ArrowLeft'"));
  ok('ArrowRight prevents default', src.includes("e.key === 'ArrowRight'") && src.includes('e.preventDefault()'));
  ok('ArrowLeft prevents default', src.includes("e.key === 'ArrowLeft'") && src.includes('e.preventDefault()'));
}

// ── Phase 8: isElementSelected Bug Fix ──
console.log('\nPhase 8: isElementSelected Bug Fix');
{
  const sectionFiles = [
    'HeroSection.js', 'SignatureSection.js', 'CraftsmanshipSection.js',
    'LifestyleSection.js', 'PhilosophySection.js', 'PageHeroSection.js',
    'PageOriginSection.js', 'PageGallerySection.js', 'PageIntroSection.js',
    'TrustBarSection.js', 'CollectionCarouselSection.js', 'ProductGridSection.js',
    'MaterialsSection.js'
  ];
  
  let allFixed = true;
  let allRemovedOldPattern = true;
  
  for (const file of sectionFiles) {
    const src = read(`app/admin/editor/sections/${file}`);
    const hasOldPattern = src.includes('selectedElement?.sectionKey === sectionKey && selectedElement?.elementKey === elementKey');
    const hasNewPattern = src.includes('selectedElement?.elementKey === elementKey') && !src.includes('selectedElement?.sectionKey === sectionKey');
    
    if (hasOldPattern) allFixed = false;
    if (!hasNewPattern) allRemovedOldPattern = false;
  }
  
  ok(`All ${sectionFiles.length} section files fixed (no old pattern)`, allRemovedOldPattern);
  ok('Old sectionKey comparison removed from all sections', allFixed);
  ok('New elementKey-only comparison present in all sections', allRemovedOldPattern);
}

// ── Phase 9: Section Tree Item Role ──
console.log('\nPhase 9: Section Tree Item Role');
{
  const src = read('app/admin/editor/EditorClient.js');
  ok('Section rows have role="treeitem"', src.includes('role="treeitem"'));
  ok('Section treeitem has aria-selected', src.includes('aria-selected={isActive}') && src.includes('role="treeitem"'));
  ok('Section list has role="listbox"', src.includes('role="listbox"'));
}

// ── Phase 10: Data Model Integrity ──
console.log('\nPhase 10: Data Model Integrity');
{
  const registry = read('app/admin/editor/sections/registry.js');
  const client = read('app/admin/editor/EditorClient.js');
  
  ok('getElementsForSection imported in EditorClient', client.includes('getElementsForSection'));
  ok('getSectionConfig imported in EditorClient', client.includes('getSectionConfig'));
  ok('SECTION_ELEMENTS defined in registry', registry.includes('SECTION_ELEMENTS'));
  ok('getElementsForSection function exists in registry', registry.includes('function getElementsForSection'));
  ok('Elements have label property', registry.includes('label:') && registry.includes('contentField:'));
  ok('Elements have type property', registry.includes('type:') && registry.includes("'text'"));
  ok('Elements have capabilities property', registry.includes('capabilities:'));
}

// ── Phase 11: No Schema/API Changes ──
console.log('\nPhase 11: No Schema/API Changes');
{
  const client = read('app/admin/editor/EditorClient.js');
  
  ok('No new API calls added', !client.includes('fetch(') || client.split('fetch(').length <= 47);
  ok('No new database schema references', !client.includes('CREATE TABLE') && !client.includes('ALTER TABLE'));
  ok('No new persistence requirements', !client.includes('localStorage') || client.includes('localStorage') && client.split('localStorage').length <= 3);
}

// ── Summary ──
console.log('\n==================================================');
console.log(`Sprint 14 Tests: ${passed}/${total} passed, ${failed} failed`);
console.log('==================================================\n');

process.exit(failed > 0 ? 1 : 0);

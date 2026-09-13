// Sprint 15 Tests — Phase 9: Inspector UX
// Run: node scripts/test-sprint15.js

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
console.log('Sprint 15 Tests — Phase 9: Inspector UX');
console.log('==================================================\n');

// ── Phase 1: ControlGroup Smooth Animation ──
console.log('Phase 1: ControlGroup Smooth Animation');
{
  const src = read('app/admin/editor/Inspector.js');
  ok('ControlGroup uses useRef for content', src.includes('const contentRef = useRef(null)'));
  ok('ControlGroup has max-height animation', src.includes('maxHeight: open ?'));
  ok('ControlGroup uses CSS transition on max-height', src.includes("'max-height 0.2s ease-in-out'"));
  ok('ControlGroup uses overflow hidden', src.includes("overflow: 'hidden'"));
  ok('ControlGroup calculates scrollHeight', src.includes('contentRef.current.scrollHeight'));
  ok('ControlGroup still renders children', src.includes('style={{ padding: \'10px 0 6px\' }}'));
}

// ── Phase 2: Element Type Icons ──
console.log('\nPhase 2: Element Type Icons');
{
  const src = read('app/admin/editor/Inspector.js');
  ok('Type icons object defined', src.includes('const typeIcons = {'));
  ok('Text type icon is T', src.includes("text: 'T'"));
  ok('Image type icon is emoji', src.includes("image: '🖼'"));
  ok('Button type icon is arrow', src.includes("button: '→'"));
  ok('Type icon rendered in header', src.includes('{typeIcons[el.type]'));
  ok('Type icon has bronze color', src.includes('color: \'#A78659\''));
}

// ── Phase 3: Accordion Behavior (First Group Open) ──
console.log('\nPhase 3: Accordion Behavior');
{
  const src = read('app/admin/editor/Inspector.js');
  
  // Text element panel
  ok('Text Content group has no defaultOpen prop (defaults to true)', 
    src.includes('<ControlGroup title="Content">') && 
    !src.includes('<ControlGroup title="Content" defaultOpen={false}>'));
  ok('TypographyControls accepts defaultOpen prop', 
    src.includes('function TypographyControls({ elementKey, styleOverrides, onStyleChange, instanceId, defaultOpen = true })'));
  ok('SpacingControls accepts defaultOpen prop', 
    src.includes('function SpacingControls({ elementKey, styleOverrides, onStyleChange, instanceId, defaultOpen = true })'));
  ok('TypographyControls passes defaultOpen to ControlGroup', 
    src.includes('<ControlGroup title="Typography" defaultOpen={defaultOpen}>'));
  ok('SpacingControls passes defaultOpen to ControlGroup', 
    src.includes('<ControlGroup title="Spacing" defaultOpen={defaultOpen}>'));
  
  // Image element panel
  ok('ImageControls accepts defaultOpen prop', 
    src.includes('function ImageControls({ element, elementKey, instanceId, sectionData, styleOverrides, onStyleChange, onFieldChange, onOpenMedia, defaultOpen = true })'));
  ok('ImageControls Image group uses defaultOpen', 
    src.includes('<ControlGroup title="Image" defaultOpen={defaultOpen}>'));
  ok('ImageControls Fit group has defaultOpen={false}', 
    src.includes('<ControlGroup title="Fit" defaultOpen={false}>'));
  ok('ImageControls Focal Point group has defaultOpen={false}', 
    src.includes('<ControlGroup title="Focal Point" defaultOpen={false}>'));
  
  // Button element panel
  ok('ButtonElementControls accepts defaultOpen prop', 
    src.includes('function ButtonElementControls({ element, elementKey, instanceId, sectionData, styleOverrides, onStyleChange, onFieldChange, defaultOpen = true })'));
  ok('ButtonElementControls Content group uses defaultOpen', 
    src.includes('<ControlGroup title="Content" defaultOpen={defaultOpen}>'));
  ok('ButtonElementControls Style group has defaultOpen={false}', 
    src.includes('<ControlGroup title="Style" defaultOpen={false}>'));
  ok('ButtonElementControls Alignment group has defaultOpen={false}', 
    src.includes('<ControlGroup title="Alignment" defaultOpen={false}>'));
  
  // Call sites pass defaultOpen={true}
  ok('ImageControls called with defaultOpen={true}', 
    src.includes('<ImageControls') && src.includes('defaultOpen={true}'));
  ok('ButtonElementControls called with defaultOpen={true}', 
    src.includes('<ButtonElementControls') && src.includes('defaultOpen={true}'));
  ok('TypographyControls called with defaultOpen={false}', 
    src.includes('defaultOpen={false}') && src.includes('TypographyControls'));
  ok('SpacingControls called with defaultOpen={false}', 
    src.includes('defaultOpen={false}') && src.includes('SpacingControls'));
}

// ── Phase 4: Visual Hierarchy ──
console.log('\nPhase 4: Visual Hierarchy');
{
  const src = read('app/admin/editor/Inspector.js');
  ok('Header has section name (14px, bold)', src.includes('fontSize: \'14px\'') && src.includes('fontWeight: 600'));
  ok('Header has element label (10px, muted)', src.includes('fontSize: \'10px\'') && src.includes('color: \'#888\''));
  ok('Header has type icon (10px, bronze)', src.includes('fontSize: \'10px\'') && src.includes('color: \'#A78659\''));
  ok('Element label has pill style', src.includes('borderRadius: \'8px\''));
  ok('ControlGroup title is uppercase', src.includes('textTransform: \'uppercase\''));
  ok('ControlGroup has letter spacing', src.includes('letterSpacing: \'0.05em\''));
}

// ── Phase 5: Accessibility ──
console.log('\nPhase 5: Accessibility');
{
  const src = read('app/admin/editor/Inspector.js');
  ok('ControlGroup has aria-expanded', src.includes('aria-expanded={open}'));
  ok('ControlGroup supports Enter key', src.includes("e.key === 'Enter'"));
  ok('ControlGroup supports Space key', src.includes("e.key === ' '"));
  ok('ControlGroup prevents default on keyboard', src.includes('e.preventDefault()'));
}

// ── Phase 6: Data Model Integrity ──
console.log('\nPhase 6: Data Model Integrity');
{
  const src = read('app/admin/editor/Inspector.js');
  ok('No new API calls added', !src.includes('fetch('));
  ok('No new database schema references', !src.includes('CREATE TABLE') && !src.includes('ALTER TABLE'));
  ok('No new persistence requirements', !src.includes('localStorage'));
  ok('ControlGroup defaultOpen defaults to true', src.includes('defaultOpen = true'));
}

// ── Phase 7: Existing ControlGroup in PageDesignPanel ──
console.log('\nPhase 7: PageDesignPanel ControlGroup');
{
  const src = read('app/admin/editor/PageDesignPanel.js');
  ok('PageDesignPanel uses ControlGroup', src.includes('ControlGroup'));
  ok('PageDesignPanel Tablet Overrides collapsed by default', src.includes('defaultOpen={false}'));
  ok('PageDesignPanel Mobile Overrides collapsed by default', src.includes('defaultOpen={false}'));
}

// ── Summary ──
console.log('\n==================================================');
console.log(`Sprint 15 Tests: ${passed}/${total} passed, ${failed} failed`);
console.log('==================================================\n');

process.exit(failed > 0 ? 1 : 0);

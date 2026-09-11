// Sprint 10 Tests — Visual System Fixes & Verification
// Run: node scripts/test-sprint10.js

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
console.log('Sprint 10 Tests — Visual System Fixes');
console.log('==================================================\n');

// ── Phase 1: Database eyebrow fix ──
console.log('Phase 1: Eyebrow Fix Verification');
try {
  const Database = (await import('better-sqlite3')).default;
  const db = new Database(resolve(ROOT, 'data', 'teakle.db'));
  const row = db.prepare('SELECT eyebrow FROM content_sections WHERE id = 1').get();
  db.close();
  ok('DB hero eyebrow is "An Indian Workshop"', row && row.eyebrow === 'An Indian Workshop',
     row ? `got "${row.eyebrow}"` : 'row not found');
  ok('DB eyebrow is NOT debug data', row && !row.eyebrow.startsWith('Verify-'),
     row ? `got "${row.eyebrow}"` : 'row not found');
} catch (e) {
  ok('DB eyebrow readable', false, e.message);
}

// ── Phase 2: Mobile header icon count ──
console.log('\nPhase 2: Mobile Header');
const headerSrc = read('app/components/Header.js');
const mobileActionsMatch = headerSrc.match(/header-mobile-actions[\s\S]*?<\/div>/);
if (mobileActionsMatch) {
  const iconCount = (mobileActionsMatch[0].match(/className="header-icon"/g) || []).length;
  ok('Mobile header has ≤3 primary icons', iconCount <= 3, `found ${iconCount}`);
} else {
  ok('Mobile header actions section found', false, 'header-mobile-actions block not found');
}

// ── Phase 3: Hero eyebrow in component ──
console.log('\nPhase 3: Hero Eyebrow Rendering');
const homeClientSrc = read('app/HomeClient.js');
ok('HomeClient renders eyebrow from data', homeClientSrc.includes('eyebrow'),
   'eyebrow property not found in HomeClient');

// ── Phase 4: Section spacing tokens ──
console.log('\nPhase 4: Section Spacing');
const stylesSrc = read('styles.css');
ok('--space-3xl defined in CSS variables', stylesSrc.includes('--space-3xl: 8rem'));
ok('--space-3xl used in homepage.css', read('app/homepage.css').includes('var(--space-3xl)'));

// ── Phase 5: Studio hydration fix ──
console.log('\nPhase 5: Studio Hydration');
const studioSrc = read('app/studio/page.js');
ok('Studio uses suppressHydrationWarning', studioSrc.includes('suppressHydrationWarning'));

// ── Phase 6: Text contrast improvements ──
console.log('\nPhase 6: Text Contrast');
const homeCss = read('app/homepage.css');
ok('Lifestyle gradient opacity increased (0.88)', homeCss.includes('0.88'));
ok('Process story has text-shadow', homeCss.includes('text-shadow'));

// ── Phase 7: Footer newsletter styling ──
console.log('\nPhase 7: Footer Newsletter');
ok('Footer newsletter styles exist', homeCss.includes('footer-newsletter') || stylesSrc.includes('footer-newsletter'));

// ── Summary ──
console.log(`\n\x1b[1m── Results ──\x1b[0m`);
console.log(`  Passed: \x1b[32m${passed}\x1b[0m`);
console.log(`  Failed: \x1b[31m${failed}\x1b[0m`);
console.log(`  Total:  ${total}`);
console.log(`  Rate:   ${Math.round((passed / total) * 100)}%\n`);

process.exit(failed > 0 ? 1 : 0);

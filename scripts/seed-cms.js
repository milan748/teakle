/**
 * TEAKLE — CMS Seed Script
 *
 * Seeds the homepage content sections into the database.
 * Idempotent: skips sections that already exist.
 *
 * Usage: node scripts/seed-cms.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'teakle.db');

const SECTIONS = [
  {
    page: 'home',
    sectionKey: 'hero',
    eyebrow: 'An Indian Workshop',
    title: 'Where wood becomes timeless art.',
    body: null,
    image: '/assets/hero-luxury-entryway.png',
    mobileImage: null,
    buttonLabel: 'View the Collection',
    buttonUrl: '/gallery',
    sortOrder: 1,
    enabled: 1,
  },
  {
    page: 'home',
    sectionKey: 'philosophy',
    eyebrow: 'Why We Exist',
    title: 'We make objects that are not finished when they leave the workshop.',
    body: 'A piece of solid teak keeps changing long after it reaches your home \u2014 the grain deepens, the surface catches light differently with each year of use. We build for that slow change, not against it.\n\nThis is a small family workshop in India, run by the same hands for three generations. We make fewer things, more carefully, and we are in no hurry to make more.',
    image: null,
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 2,
    enabled: 1,
  },
  {
    page: 'home',
    sectionKey: 'signature',
    eyebrow: 'The Hero Edition',
    title: 'This season\u2019s hero.',
    body: 'One sculptural centrepiece, carved from a single reclaimed timber block. It is never restocked and never discounted \u2014 once it\u2019s gone, the next edition begins.',
    image: 'https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=1200',
    mobileImage: null,
    buttonLabel: 'View This Piece',
    buttonUrl: '/shop/anchor-table',
    sortOrder: 3,
    enabled: 1,
  },
  {
    page: 'home',
    sectionKey: 'craftsmanship',
    eyebrow: 'Craftsmanship',
    title: 'Every piece passes through one pair of hands, start to finish.',
    body: 'We work in solid timber, never veneer or particleboard. A single block is selected, dried, and left to settle before a tool ever touches it \u2014 rushing this step is the most common way a piece fails early.\n\nJoints are cut by hand and fitted dry before any finish is applied. The oil we use is food-safe and reapplied over the piece\u2019s life, not sealed under lacquer that traps moisture and cracks.',
    image: 'https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=1200',
    mobileImage: null,
    buttonLabel: 'Visit the Studio',
    buttonUrl: '/studio',
    sortOrder: 4,
    enabled: 1,
  },
  {
    page: 'home',
    sectionKey: 'workshop-story',
    eyebrow: 'The Workshop',
    title: 'A family workshop, unchanged in method for three generations.',
    body: 'The tools are old. The hands are patient. Nothing here is made to a deadline \u2014 a piece is finished when it is ready, and not before.',
    image: 'https://images.pexels.com/photos/5974417/pexels-photo-5974417.jpeg?auto=compress&cs=tinysrgb&w=1600',
    mobileImage: null,
    buttonLabel: 'Read About Our Process',
    buttonUrl: '/studio',
    sortOrder: 5,
    enabled: 1,
  },
  {
    page: 'home',
    sectionKey: 'process-story',
    eyebrow: 'Watch It Made',
    title: 'Every piece is documented from timber to finish.',
    body: 'We don\u2019t ask you to imagine the process \u2014 we film it. Wood selection, joinery, finishing, and the hours each one takes, so you know exactly what you\u2019re buying before you buy it.',
    image: 'https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1600',
    mobileImage: null,
    buttonLabel: 'Watch the Process',
    buttonUrl: '/journal',
    sortOrder: 6,
    enabled: 1,
  },
];

function main() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  let created = 0;
  let skipped = 0;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO content_sections (page, sectionKey, eyebrow, title, body, image, mobileImage, buttonLabel, buttonUrl, sortOrder, enabled)
    VALUES (@page, @sectionKey, @eyebrow, @title, @body, @image, @mobileImage, @buttonLabel, @buttonUrl, @sortOrder, @enabled)
  `);

  const check = db.prepare('SELECT id FROM content_sections WHERE page = ? AND sectionKey = ?');

  for (const section of SECTIONS) {
    const existing = check.get(section.page, section.sectionKey);
    if (existing) {
      skipped++;
      continue;
    }
    insert.run(section);
    created++;
  }

  console.log('CMS seed complete:');
  console.log('  Created: ' + created);
  console.log('  Skipped (already exist): ' + skipped);
  console.log('  Total sections: ' + (created + skipped));

  db.close();
}

main();

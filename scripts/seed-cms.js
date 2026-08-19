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
  // Studio
  {
    page: 'studio',
    sectionKey: 'hero',
    eyebrow: 'Studio',
    title: 'Why we work in solid wood, and why it takes as long as it does.',
    body: 'The materials, the process, and the workshop behind every Teakle piece.',
    image: 'https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1600',
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 1,
    enabled: 1,
  },
  {
    page: 'studio',
    sectionKey: 'origin',
    eyebrow: 'Where We Started',
    title: 'A carpentry practice that became a workshop, over three generations.',
    body: 'Teakle began as a small carpentry practice in India, taking on furniture repair and custom joinery for houses in the area. Over three generations, the same practice narrowed into something more deliberate \u2014 fewer commissions, more time per piece, and a refusal to use materials that would not hold up over decades.\n\nWe still work the way the workshop always has. A piece is planned by hand, built by hand, and finished by hand. Nothing here is automated because nothing here needed to be.',
    image: 'https://images.pexels.com/photos/5973919/pexels-photo-5973919.jpeg?auto=compress&cs=tinysrgb&w=900',
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 2,
    enabled: 1,
  },
  {
    page: 'studio',
    sectionKey: 'gallery',
    eyebrow: 'The Workshop',
    title: 'The people and tools behind every piece.',
    body: null,
    image: 'https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1000',
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 3,
    enabled: 1,
  },
  // Contact
  {
    page: 'contact',
    sectionKey: 'hero',
    eyebrow: 'Contact',
    title: 'Questions before you order are always welcome.',
    body: 'Whether it\u2019s about a piece, timelines, or something you\u2019re not sure exists yet \u2014 write to us directly.',
    image: 'https://images.pexels.com/photos/7234682/pexels-photo-7234682.jpeg?auto=compress&cs=tinysrgb&w=1600',
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 1,
    enabled: 1,
  },
  {
    page: 'contact',
    sectionKey: 'introduction',
    eyebrow: null,
    title: null,
    body: null,
    image: null,
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 2,
    enabled: 1,
  },
  // Trade
  {
    page: 'trade',
    sectionKey: 'hero',
    eyebrow: 'Trade & Bulk Inquiries',
    title: 'For projects that need more than one piece.',
    body: 'If you\u2019re furnishing a project \u2014 a home, a studio, a hospitality space \u2014 and need multiple pieces or something built to a specific size, tell us about it below.',
    image: 'https://images.pexels.com/photos/12278576/pexels-photo-12278576.jpeg?auto=compress&cs=tinysrgb&w=1600',
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 1,
    enabled: 1,
  },
  {
    page: 'trade',
    sectionKey: 'introduction',
    eyebrow: 'How It Works',
    title: 'A short conversation before anything is quoted.',
    body: 'Every custom or bulk piece starts with understanding the space it\u2019s going into \u2014 dimensions, use, and timeline. We reply with what\u2019s realistic before any commitment is made on either side.\n\nWe take on a limited number of these projects at a time, since each one is still built by the same small team.',
    image: null,
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 2,
    enabled: 1,
  },
  // Custom
  {
    page: 'custom',
    sectionKey: 'hero',
    eyebrow: 'Custom Orders',
    title: 'Custom Wooden Creations',
    body: 'Have a unique idea? Upload a reference image or describe your vision. Our artisans will review your request and get back to you with feasibility, pricing, and estimated completion time.',
    image: 'https://images.pexels.com/photos/5974327/pexels-photo-5974327.jpeg?auto=compress&cs=tinysrgb&w=1600',
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 1,
    enabled: 1,
  },
  {
    page: 'custom',
    sectionKey: 'introduction',
    eyebrow: 'How It Works',
    title: 'Every piece starts with a conversation.',
    body: 'Tell us what you have in mind \u2014 whether it\u2019s a sculpture, a piece of furniture, a religious idol, a nameplate, or a gift item. You don\u2019t need perfect dimensions or technical drawings. A photo, a sketch, or a few sentences is enough to start.\n\nOur artisans will review your idea and respond with what\u2019s possible, what wood and finish would work best, and a realistic price and timeline.',
    image: null,
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 2,
    enabled: 1,
  },
  // Journal
  {
    page: 'journal',
    sectionKey: 'hero',
    eyebrow: 'Journal',
    title: 'Stories, wood facts, and how to care for your piece.',
    body: 'Writing on materials, grain details, finishing techniques, and the seasonal routines that keep solid timber in good condition for decades.',
    image: 'https://images.pexels.com/photos/5974028/pexels-photo-5974028.jpeg?auto=compress&cs=tinysrgb&w=1600',
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 1,
    enabled: 1,
  },
  // Archive
  {
    page: 'archive',
    sectionKey: 'hero',
    eyebrow: 'Archive',
    title: 'A record of what has been made.',
    body: 'Past collections, limited editions, and one-of-one pieces. Once they\u2019re gone, they\u2019re documented here.',
    image: 'https://images.pexels.com/photos/5974327/pexels-photo-5974327.jpeg?auto=compress&cs=tinysrgb&w=1600',
    mobileImage: null,
    buttonLabel: null,
    buttonUrl: null,
    sortOrder: 1,
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

/**
 * Server-safe journal data module.
 * Used by generateMetadata(), sitemap, and structured data.
 * Client components continue reading from window.TEAKLE_JOURNAL.
 */

export const JOURNAL = [
  {
    slug: 'what-solid-wood-actually-means',
    category: 'Wood Facts',
    title: 'What "solid wood" actually means, and why the label is used loosely',
    excerpt: 'Most furniture described as solid wood is a thin veneer over particleboard. Here\u2019s how to tell the difference before you buy \u2014 and why it matters more after five years than on day one.',
    date: 'March 2026',
    dateISO: '2026-03-01',
    image: 'https://images.pexels.com/photos/8465898/pexels-photo-8465898.jpeg?auto=compress&cs=tinysrgb&w=1000',
    imageAlt: 'Close-up of wood grain on a finished tabletop.',
    featured: true,
    relatedProducts: ['anchor-table', 'circle-table', 'hollow-bench'],
  },
  {
    slug: 'why-we-never-seal-wood-with-lacquer',
    category: 'Details',
    title: 'Why we never seal wood with lacquer',
    excerpt: 'Lacquer looks flawless for a year, then starts to crack at the edges. Oil ages differently \u2014 here\u2019s the tradeoff, honestly.',
    date: 'February 2026',
    dateISO: '2026-02-01',
    image: 'https://images.pexels.com/photos/7234682/pexels-photo-7234682.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'A hand rubbing oil finish into a wooden surface.',
    featured: false,
    relatedProducts: ['carving-board', 'serving-plank', 'carve-board'],
  },
  {
    slug: 'how-long-wood-needs-to-dry',
    category: 'Wood Facts',
    title: 'How long wood needs to dry before it\u2019s usable',
    excerpt: 'Rushed timber warps within a year. We explain the drying process we use and why it can\u2019t be shortened.',
    date: 'January 2026',
    dateISO: '2026-01-01',
    image: 'https://images.pexels.com/photos/5599172/pexels-photo-5599172.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'Stacked timber boards drying in a workshop.',
    featured: false,
    relatedProducts: ['anchor-table', 'bearing-chair'],
  },
  {
    slug: 'caring-for-solid-wood-over-decades',
    category: 'Care',
    title: 'Caring for a solid wood piece over decades',
    excerpt: 'A simple seasonal routine \u2014 no special products, no polishes, just what actually keeps timber in good condition.',
    date: 'December 2025',
    dateISO: '2025-12-01',
    image: 'https://images.pexels.com/photos/12233290/pexels-photo-12233290.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'A finished wooden bench in a minimal room.',
    featured: false,
    relatedProducts: ['hollow-bench', 'spice-shelf', 'bread-box'],
  },
  {
    slug: 'why-we-dont-use-nails-or-screws',
    category: 'Details',
    title: 'Why we don\u2019t use nails or screws in most joints',
    excerpt: 'A cut joint moves with the wood as it expands and contracts. Metal fasteners fight that movement instead.',
    date: 'November 2025',
    dateISO: '2025-11-01',
    image: 'https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'Detail of a hand-cut wooden joint.',
    featured: false,
    relatedProducts: ['anchor-table', 'hollow-bench', 'blanket-ladder'],
  },
  {
    slug: 'why-we-dont-sand-away-knots',
    category: 'Stories',
    title: 'Why we don\u2019t sand away knots and colour shifts',
    excerpt: 'An imperfection in the grain is a record of where the tree grew. Removing it doesn\u2019t make the wood better \u2014 it makes it generic.',
    date: 'October 2025',
    dateISO: '2025-10-01',
    image: 'https://images.pexels.com/photos/36299690/pexels-photo-36299690.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'Natural imperfections and knots in wood grain.',
    featured: false,
    relatedProducts: ['drift-sculpture', 'decorative-objects-set', 'serving-plank'],
  },
  {
    slug: 'the-tools-we-still-use',
    category: 'Stories',
    title: 'The tools we still use, and why we haven\u2019t replaced them',
    excerpt: 'Some of the hand tools in daily use here are decades old. A short note on why that\u2019s a feature, not a limitation.',
    date: 'September 2025',
    dateISO: '2025-09-01',
    image: 'https://images.pexels.com/photos/5974028/pexels-photo-5974028.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'Hand tools arranged on a workshop bench.',
    featured: false,
    relatedProducts: ['bearing-chair', 'hourglass-vase'],
  },
];

export function getArticleBySlug(slug) {
  return JOURNAL.find((a) => a.slug === slug) || null;
}

export function getAllArticleSlugs() {
  return JOURNAL.map((a) => a.slug);
}

export function getFeaturedArticle() {
  return JOURNAL.find((a) => a.featured) || JOURNAL[0];
}

export function getNonFeaturedArticles() {
  return JOURNAL.filter((a) => !a.featured);
}

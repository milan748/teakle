/**
 * TEAKLE — Process / Making-Of Data
 *
 * Structured data for dedicated process pages.
 * Each entry documents the making journey of a specific product.
 *
 * Video infrastructure: videoUrl and posterUrl fields are ready for
 * real manufacturing footage when available. Null values render clean
 * empty states without fabricating content.
 *
 * To add a new process page:
 *   1. Add an entry to PROCESSES below
 *   2. Add a corresponding static page at app/process/[slug]/
 *   3. The route works automatically via generateStaticParams()
 */

import { getProductById } from './products';

export const PROCESSES = [
  {
    slug: 'anchor-table',
    productId: 'anchor-table',
    title: 'The Making of The Anchor Table',
    subtitle: 'From a single teak block to a dining table built to outlast its owner.',
    intro: 'The Anchor Table begins as a single teak log, selected from a managed plantation in southern India. Every joint is hand-cut. The grain runs the full length of the top, unbroken. Nothing here is rushed.',
    heroImage: 'https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=1600',
    heroImageAlt: 'Hand-planing a solid teak surface in natural workshop light.',
    stages: [
      {
        number: '01',
        title: 'Selecting the Teak',
        description: 'Each table begins with a single log, chosen for grain density, colour consistency, and structural integrity. The wood comes from managed plantations in southern India — harvested sustainably, never from old-growth forests.',
        videoUrl: null,
        posterUrl: null,
      },
      {
        number: '02',
        title: 'Preparing the Timber',
        description: 'The selected log is cut to rough dimensions and left to settle in the workshop for several weeks. This allows the timber to acclimatise to the workshop environment — moisture content stabilises, internal stresses ease, and the wood reveals its true character before any precision work begins.',
        videoUrl: null,
        posterUrl: null,
      },
      {
        number: '03',
        title: 'Shaping the Form',
        description: 'The tabletop and legs are planed by hand, not sanded, to preserve the grain\'s natural lustre. Each surface is shaped to its final profile using traditional hand planes — a process that takes hours but produces a finish no machine can replicate.',
        videoUrl: null,
        posterUrl: null,
      },
      {
        number: '04',
        title: 'Joining by Hand',
        description: 'Every joint is cut using traditional mortise and tenon joinery — wood meeting wood, as it has for centuries. No metal fasteners, no screws. Each joint is fitted dry before any finish is applied, ensuring precision that holds across decades of daily use.',
        videoUrl: null,
        posterUrl: null,
      },
      {
        number: '05',
        title: 'Hand Finishing',
        description: 'Multiple thin coats of food-safe oil are worked into the surface by hand, each allowed to cure before the next. The oil penetrates the grain rather than sitting on top, developing a patina that deepens with use over years.',
        videoUrl: null,
        posterUrl: null,
      },
      {
        number: '06',
        title: 'Final Inspection',
        description: 'Every surface, joint, and edge is inspected by the same pair of hands that built it. The table is checked for structural integrity, finish consistency, and alignment. A piece is finished when it is ready — not before.',
        videoUrl: null,
        posterUrl: null,
      },
      {
        number: '07',
        title: 'The Finished Piece',
        description: 'Solid teak dining table, hand-finished from a single selected block. 180 × 90 × 76 cm. Seats six. Food-safe oil finish, reapplied over the piece\'s life. Every table is unique — the timber and finish are chosen once.',
        videoUrl: null,
        posterUrl: null,
        isFinal: true,
      },
    ],
  },
];

/**
 * Get a process entry by slug.
 * @param {string} slug
 * @returns {object|null}
 */
export function getProcessBySlug(slug) {
  return PROCESSES.find((p) => p.slug === slug) || null;
}

/**
 * Get all process slugs for generateStaticParams.
 * @returns {string[]}
 */
export function getAllProcessSlugs() {
  return PROCESSES.map((p) => p.slug);
}

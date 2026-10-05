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
    heroImage: '/temporary-images/process-poster-workshop-01.jpg',
    heroImageAlt: 'Hand-planing a solid teak surface in natural workshop light.',
    /* — Editorial film block (self-hosted/CDN-ready). Points at the
       supplied production video; the layout renders it as-is. */
    videoUrl: '/assets/videos/0714.mp4',
    posterUrl: '/temporary-images/process-poster-workshop-01.jpg',
    /* Small contextual label rendered above the product name. */
    contextLabel: 'Atelier Stories — One of One',
    /* — CMS-ready editorial sections (future WordPress blocks). Every
       sentence below is a philosophical reading grounded only in
       app/data/products.js (anchor-table): single selected teak block,
       settled before cutting, unbroken grain, hand-cut mortise & tenon
       with no metal, hand-planed not sanded, food-safe oil worked in by
       hand and cured, patina that deepens, 180 × 90 × 76 cm, seats six,
       42 kg, ~18 hours, timber and finish chosen once, every table
       unique. No people, places, dates, or provenance beyond that. */
    introduction: {
      eyebrow: 'Introduction',
      heading: 'What it is.',
      body: [
        'The Anchor Table is a dining table built from a single selected teak block. It measures 180 × 90 × 76 cm, seats six, and is made for daily use.',
        'It begins as one log, left to settle in the workshop for several weeks before any cutting begins. The grain runs the length of the top, unbroken. The legs are joined by hand — mortise and tenon, without metal fasteners. The surface is planed, not sanded, and finished in food-safe oil, worked in by hand and left to cure.',
        'TEAKLE holds it as an Atelier Stories piece for one reason: it is a singular object. The timber and finish are chosen once, and every table is unique — the film above, and the record below, document those decisions.',
      ],
    },
    whyTeak: {
      eyebrow: 'Material',
      heading: 'Why teak.',
      body: [
        'Teak was selected the way the table is built — for use. It is naturally resistant to moisture and insects, which is what a dining table meets every day. The oil finish is food-safe and non-toxic, and it sits in the grain rather than sealing over it.',
        'Visually, the wood carries the design. Because the top comes from one block, the grain runs unbroken across its full length — a continuous record of growth that no assembly of boards could give. Planing by hand, rather than sanding, keeps the grain\u2019s natural lustre; thin coats of oil deepen it instead of covering it.',
        'Teak is also what makes the form possible. A dense, single block takes a hand-cut mortise and tenon joint and holds it — wood meeting wood, fitted dry before any finish is applied. And because no two blocks share the same grain, no two tables can look alike: natural variation is what makes each piece individual.',
      ],
    },
    idea: {
      eyebrow: 'The idea',
      heading: 'Mass, kept simple.',
      body: [
        'The form is a rectangle of substance: a solid top, four legs, nothing added. There is no ornament, because the material is the ornament — the unbroken grain across 180 centimetres is the only decoration the piece needs.',
        'Mass is the point. At 42 kilograms of solid teak, the table does not shift, creak, or ask for attention; it anchors the room it stands in. That stillness is why the piece holds this exact proportion — large enough to gather six people, plain enough to disappear into daily life.',
        'It is designed as a singular piece, not a production run. Ordinary furniture repeats; this object was made once, from one block, finished by hand — and it is meant to live with one household, gathering the marks of its use rather than wearing through them.',
      ],
    },
    oneOfOne: {
      eyebrow: 'One of One',
      heading: 'One object. One creation.',
      body: [
        'The Anchor Table is a one-of-one piece: a single physical object, not a batch. The timber and finish are chosen once — this exact grain, weight, and finish exists one time.',
        'It will not be restocked, and the same object will not be recreated. Natural variation in the timber is what makes the piece individual; no second block could repeat it.',
      ],
    },
    relationship: {
      eyebrow: 'After the workshop',
      heading: 'Living with it.',
      body: [
        'Once the table leaves the workshop, the making hands it over. Teak deepens with use: the hand-rubbed oil finish develops a patina instead of wearing through, and the surface can be renewed — a coat of food-safe oil every 12–18 months keeps it fed.',
        'Daily life leaves traces, and this table accepts them. Small scratches buff out with fine steel wool followed by oil; cleaning asks only for a damp cloth, never harsh chemicals. Ownership here means maintenance rather than replacement — the object is kept, not consumed.',
      ],
    },
    closing: 'Made once, from one block — ready to be used every day.',
    ctaLabels: {
      inquire: 'INQUIRE TO OWN',
      buy: 'BUY NOW',
      archive: 'SEE PAST COLLECTIONS',
    },
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

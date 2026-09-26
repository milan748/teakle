import Link from 'next/link';
import { getPublishedPageSections } from '@/lib/cms';
import { PRODUCTS } from '@/app/data/products';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Archive',
  description: 'Past collections from Teakle. A record of objects made, editions released, and craft explored.',
  openGraph: { title: 'Archive — Teakle', description: 'Past collections from Teakle.' },
};

// Archive = previous Atelier editions. The only works the existing dataset
// explicitly identifies as editions are products with availability
// "Limited Edition" (numbered, signed, "Only N made"). The current Atelier
// hero (isHero) is never listed here.
function getArchivedWorks() {
  return PRODUCTS.filter((p) => p.availability === 'Limited Edition');
}

function editionDetail(product) {
  const spec = (product.specifications || []).find((s) => s.label === 'Edition');
  const parts = [];
  if (product.availabilityNote) parts.push(product.availabilityNote);
  if (spec && spec.value && !parts.includes(spec.value)) parts.push(spec.value);
  return parts.filter(Boolean);
}

export default function ArchivePage() {
  let sections = [];
  try { sections = getPublishedPageSections('archive'); } catch {}
  const cms = {};
  for (const s of sections) { if (s.enabled) cms[s.sectionKey] = s; }
  const cmsKeys = new Set(sections.map(s => s.sectionKey));
  const hero = cms.hero || {};
  const heroDisabled = cmsKeys.has('hero') && !cms.hero;

  const heroEyebrow = hero.eyebrow || 'Archive';
  const heroTitle = hero.title || 'A record of what has been made.';
  const heroBody = hero.body || "Past collections, limited editions, and one-of-one pieces. Once they're gone, they're documented here.";
  const heroImage = hero.image || 'https://images.pexels.com/photos/5974327/pexels-photo-5974327.jpeg?auto=compress&cs=tinysrgb&w=1600';

  const works = getArchivedWorks();
  const heroProduct = PRODUCTS.find((p) => p.isHero === true);

  return (
    <>
      <link rel="stylesheet" href="/editorial-composition.css" />
      <style>{`
        .arch-page {
          background: var(--bg-primary);
          overflow-x: clip;
        }
        .arch-record {
          border-top: var(--border-hair);
          padding: var(--space-xl) 0 0;
        }
        .arch-record-inner {
          max-width: var(--container-wide);
          margin: 0 auto;
          padding: 0 var(--space-lg);
        }
        .arch-kicker {
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--bronze);
          margin-bottom: var(--space-sm);
          display: block;
        }
        .arch-lede {
          font-size: clamp(1.125rem, 1.6vw, 1.375rem);
          line-height: var(--lh-relaxed);
          color: var(--text-primary);
          max-width: 62ch;
        }
        .arch-lede a {
          color: var(--text-primary);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--stone);
        }
        .arch-lede a:hover {
          color: var(--bronze);
          text-decoration-color: var(--bronze);
        }
        .arch-count {
          margin-top: var(--space-md);
          padding-top: var(--space-md);
          border-top: var(--border-hair);
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        /* Hero: full-bleed cinematic */
        .arch-hero {
          position: relative;
          height: 60vh;
          min-height: 480px;
          overflow: hidden;
          background: var(--walnut);
        }
        .arch-hero img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.82;
          transform: scale(1.04);
          animation: pageHeroZoom 8s var(--ease-luxury) forwards;
        }
        .arch-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(43,34,27,0.08) 0%, rgba(43,34,27,0.15) 40%, rgba(43,34,27,0.65) 100%);
        }
        .arch-hero-content {
          position: absolute;
          bottom: clamp(var(--space-lg), 8vh, var(--space-2xl));
          left: 0;
          z-index: 2;
          padding: 0 var(--space-lg);
          max-width: 680px;
        }
        .arch-hero .eyebrow { margin-bottom: var(--space-sm); }
        .arch-hero h1 {
          color: var(--bg-primary);
          font-size: clamp(2rem, 4.5vw, var(--text-h1));
          line-height: 1.08;
          margin: 0;
          letter-spacing: -0.025em;
        }
        .arch-hero p {
          color: var(--stone);
          font-size: var(--text-body);
          max-width: 48ch;
          margin-top: var(--space-sm);
        }

                /* Archive works: editorial grid with varied scales and intentional alignment */
        .arch-works {
          padding: var(--space-2xl) 0 var(--space-3xl);
        }
        .arch-works-inner {
          max-width: var(--container-wide);
          margin: 0 auto;
          padding: 0 var(--space-lg);
        }

        /* Work items using editorial grid system */
        .arch-work {
          display: grid;
          align-items: center;
          padding: var(--space-2xl) 0;
          border-bottom: var(--border-hair);
        }
        .arch-work:last-child {
          border-bottom: none;
        }

        /* Variant cycle: featured (edge-left), secondary (edge-right), center (center-aligned) */
        /* First work: dominant, edge-left composition with 4:3 cinematic */
        .arch-work-featured {
          grid-template-columns: 1.2fr 0.8fr;
          gap: 0 var(--space-2xl);
        }
        .arch-work-featured .arch-work-image {
          margin-left: calc(-1 * var(--space-lg));
          aspect-ratio: 4 / 3;
        }

        /* Second work: secondary, edge-right with 1:1 detail crop */
        .arch-work-secondary {
          grid-template-columns: 0.8fr 1.2fr;
          gap: 0 var(--space-2xl);
        }
        .arch-work-secondary .arch-work-text {
          order: -1;
        }
        .arch-work-secondary .arch-work-image {
          margin-right: calc(-1 * var(--space-lg));
          aspect-ratio: 1 / 1;
        }

        /* Third work: center-aligned, cinematic 16:9 environmental */
        .arch-work-center {
          grid-template-columns: 1fr;
          gap: var(--space-2xl) 0;
          justify-items: center;
        }
        .arch-work-center .arch-work-image {
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          max-width: 100%;
        }

        /* Fourth work: wide cinematic environmental with edge bleed */
        .arch-work-wide {
          grid-template-columns: 1.4fr 0.6fr;
          gap: 0 var(--space-2xl);
        }
        .arch-work-wide .arch-work-text {
          order: -1;
        }
        .arch-work-wide .arch-work-image {
          margin-right: calc(-1 * var(--space-lg));
          aspect-ratio: 21 / 9;
        }

        /* Fifth work: dominant 3:2 with edge-left */
        .arch-work-dominant {
          grid-template-columns: 1.3fr 0.7fr;
          gap: 0 var(--space-2xl);
        }
        .arch-work-dominant .arch-work-image {
          margin-left: calc(-1 * var(--space-lg));
          aspect-ratio: 3 / 2;
        }

        .arch-work-image {
          background: var(--stone);
          overflow: hidden;
        }
        .arch-work-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s var(--ease-luxury);
        }
        .arch-work:hover .arch-work-image img {
          transform: scale(1.02);
        }

        .arch-work-eyebrow {
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--bronze);
          margin-bottom: var(--space-sm);
          display: block;
        }
        .arch-work-title {
          font-size: clamp(1.5rem, 2.8vw, var(--text-h2));
          margin-bottom: var(--space-xs);
          max-width: none;
        }
        .arch-work-meta {
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
        }
        .arch-work-desc {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          max-width: 42ch;
          margin-bottom: var(--space-md);
        }
        .arch-work-edition {
          padding: var(--space-md) 0;
          border-top: var(--border-hair);
          border-bottom: var(--border-hair);
          margin-bottom: var(--space-md);
          font-size: var(--text-body);
          color: var(--text-primary);
        }
        .arch-work-edition span {
          display: block;
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          margin-bottom: 0.15rem;
        }
        .arch-work-foot {
          display: flex;
          align-items: baseline;
          gap: var(--space-lg);
          flex-wrap: wrap;
        }
        .arch-work-price {
          font-size: var(--text-body);
          color: var(--text-secondary);
        }
        .arch-work-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-primary);
          border-bottom: 1px solid var(--stone);
          padding-bottom: 2px;
          transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
        }
        .arch-work-link:hover {
          color: var(--bronze);
          border-color: var(--bronze);
        }
        .arch-work-link:focus-visible {
          outline: 2px solid var(--bronze);
          outline-offset: 3px;
        }

        /* Ultra-wide editorial break — cinematic environmental context */
        .arch-break {
          margin: var(--space-3xl) calc(-1 * var(--cin-gutter-wide));
          padding: 0;
        }
        .arch-break figure { margin: 0; }
        .arch-break img {
          display: block;
          width: 100%;
          height: clamp(280px, 45vh, 480px);
          object-fit: cover;
          object-position: 50% 30%;
        }
        .arch-break figcaption {
          max-width: var(--container-wide);
          margin: 0 auto;
          padding: var(--space-xs) var(--space-lg) 0;
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
        }

        /* Editorial section pacing for Archive */
        .arch-works {
          padding: var(--space-2xl) 0 var(--space-3xl);
        }
        .arch-record {
          border-top: var(--border-hair);
          padding: var(--space-xl) 0 0;
        }
        .arch-record-inner {
          max-width: var(--container-wide);
          margin: 0 auto;
          padding: 0 var(--space-lg);
        }
        .arch-kicker {
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--bronze);
          margin-bottom: var(--space-sm);
          display: block;
        }
        .arch-lede {
          font-size: clamp(1.125rem, 1.6vw, 1.375rem);
          line-height: var(--lh-relaxed);
          color: var(--text-primary);
          max-width: 62ch;
        }
        .arch-lede a {
          color: var(--text-primary);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--stone);
        }
        .arch-lede a:hover {
          color: var(--bronze);
          text-decoration-color: var(--bronze);
        }
        .arch-count {
          margin-top: var(--space-md);
          padding-top: var(--space-md);
          border-top: var(--border-hair);
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        /* Hero: full-bleed cinematic */
        .arch-hero {
          position: relative;
          height: 60vh;
          min-height: 480px;
          overflow: hidden;
          background: var(--walnut);
        }
        .arch-hero img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.82;
          transform: scale(1.04);
          animation: pageHeroZoom 8s var(--ease-luxury) forwards;
        }
        .arch-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(43,34,27,0.08) 0%, rgba(43,34,27,0.15) 40%, rgba(43,34,27,0.65) 100%);
        }
        .arch-hero-content {
          position: absolute;
          bottom: clamp(var(--space-lg), 8vh, var(--space-2xl));
          left: 0;
          z-index: 2;
          padding: 0 var(--space-lg);
          max-width: 680px;
        }
        .arch-hero .eyebrow { margin-bottom: var(--space-sm); }
        .arch-hero h1 {
          color: var(--bg-primary);
          font-size: clamp(2rem, 4.5vw, var(--text-h1));
          line-height: 1.08;
          margin: 0;
          letter-spacing: -0.025em;
        }
        .arch-hero p {
          color: var(--stone);
          font-size: var(--text-body);
          max-width: 48ch;
          margin-top: var(--space-sm);
        }

        @media (max-width: 860px) {
          .arch-hero { height: 50vh; min-height: 400px; }
          .arch-hero-content { padding: 0 var(--space-md); bottom: var(--space-lg); }

          .arch-work-featured,
          .arch-work-secondary,
          .arch-work-center,
          .arch-work-wide,
          .arch-work-dominant {
            grid-template-columns: 1fr;
            gap: var(--space-md);
          }
          .arch-work-secondary .arch-work-text {
            order: 0;
          }
          .arch-work-featured .arch-work-image,
          .arch-work-secondary .arch-work-image,
          .arch-work-center .arch-work-image,
          .arch-work-wide .arch-work-image,
          .arch-work-dominant .arch-work-image {
            margin-left: 0;
            margin-right: 0;
            aspect-ratio: 4 / 3;
          }
          .arch-work-title { font-size: var(--text-subhead); }

          .arch-break {
            margin: var(--space-2xl) calc(-1 * var(--space-lg));
          }
          .arch-break img {
            height: clamp(240px, 40vh, 360px);
          }
          .arch-break figcaption {
            padding: var(--space-xs) var(--space-md) 0;
          }
        }

        @media (max-width: 560px) {
          .arch-hero { height: 45vh; min-height: 360px; }
          .arch-hero h1 { font-size: var(--text-h2); }
          .arch-work-image { aspect-ratio: 4 / 3; }
          .arch-work-foot { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }
        }
      `}</style>

      <div className="arch-page">
        {!heroDisabled && (
          <section className="arch-hero">
            <img src={heroImage} alt="Hands shaping timber in the Teakle workshop." />
            <div className="arch-hero-content">
              <span className="eyebrow eyebrow-light">{heroEyebrow}</span>
              <h1>{heroTitle}</h1>
              <p>{heroBody}</p>
            </div>
          </section>
        )}

        <section className="arch-record" aria-label="About the Archive">
          <div className="arch-record-inner">
            <span className="arch-kicker">Previous Atelier editions</span>
            <p className="arch-lede">
              {heroProduct ? (
                <>Atelier Stories presents the current signature object — <Link href={`/shop/${heroProduct.id}`}>{heroProduct.name}</Link>. The works below belong to earlier limited editions, recorded here with their existing materials, descriptions and edition notes. For the current collection, see <Link href="/gallery">Gallery</Link>.</>
              ) : (
                <>Atelier Stories presents the current signature object. The works below belong to earlier limited editions, recorded here with their existing materials, descriptions and edition notes. For the current collection, see <Link href="/gallery">Gallery</Link>.</>
              )}
            </p>
            <p className="arch-count">{works.length === 1 ? 'One work recorded to date.' : `${works.length} works recorded to date.`}</p>
          </div>
        </section>

        <section className="arch-works" aria-label="Archived works">
          <div className="arch-works-inner">
            {works.map((work, i) => {
              const details = editionDetail(work);
              // Cycle through editorial composition variants with intentional variation:
              // i=0 → featured: dominant edge-left image (4:3 cinematic)
              // i=1 → secondary: edge-right image (1:1 supporting detail)
              // i=2 → center: cinematic 16:9 environmental image
              // i=3 → wide: ultra-wide environmental (21:9)
              // i=4+ → alternate between variants with varied scaling
              const variantMap = {
                0: 'arch-work-featured',
                1: 'arch-work-secondary',
                2: 'arch-work-center',
                3: 'arch-work-wide',
              };
              const variant = variantMap[i] || (i % 4 === 0 ? 'arch-work-featured' : i % 4 === 1 ? 'arch-work-secondary' : i % 4 === 2 ? 'arch-work-center' : 'arch-work-wide');
              // Use appropriate image for each work with varied scaling
              // First work: dominant hero image, second: supporting detail, third: environmental, then cycle
              const imageIdx = i % 4;
              const imageSrc = work.images[imageIdx] || work.images[0];
              
              return (
                <article key={work.id} className={`arch-work reveal ${variant}`}>
                  <div className="arch-work-image">
                    <img loading={i === 0 ? 'eager' : 'lazy'} src={imageSrc} alt={work.name} />
                  </div>
                  <div className="arch-work-text">
                    <span className="arch-work-eyebrow">Archive · {work.availability}</span>
                    <h2 className="arch-work-title">{work.name}</h2>
                    <p className="arch-work-meta">{[work.categoryName, work.material].filter(Boolean).join(' · ')}</p>
                    <p className="arch-work-desc">{work.shortDescription || work.description}</p>
                    {details.length > 0 && (
                      <p className="arch-work-edition">
                        <span>Edition note</span>
                        {details.join(' · ')}
                      </p>
                    )}
                    <div className="arch-work-foot">
                      <span className="arch-work-price">{work.priceFormatted}</span>
                      <Link href={`/shop/${work.id}`} className="arch-work-link">View work →</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Ultra-wide editorial break — environmental/workshop context */}
        <figure className="arch-break" aria-label="Workshop environment">
          <img 
            src="https://images.pexels.com/photos/5974417/pexels-photo-5974417.jpeg?auto=compress&cs=tinysrgb&w=2400"
            alt="Close-up of a craftsman's hand guiding a chisel in the workshop."
            width="2400" height="900"
            loading="lazy"
            className="editorial-image--ultra-wide"
          />
          <figcaption>The workshop — where each edition begins.</figcaption>
        </figure>
      </div>
    </>
  );
}
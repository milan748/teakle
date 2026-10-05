import Link from 'next/link';
import { JOURNAL, getFeaturedArticle, getNonFeaturedArticles } from '../data/journal';
import { getPublishedPageSections } from '@/lib/cms'

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Journal',
  description: 'Stories from the Teakle workshop. Notes on craft, material, and the objects we make.',
  openGraph: { title: 'Journal — Teakle', description: 'Stories from the Teakle workshop.' },
  alternates: { canonical: 'https://teakle.in/journal' },
};

export default function JournalPage() {
  const FEATURED = getFeaturedArticle();
  const ARTICLES = getNonFeaturedArticles();
  let sections = [];
  try { sections = getPublishedPageSections('journal'); } catch {}
  const cms = {};
  for (const s of sections) { if (s.enabled) cms[s.sectionKey] = s; }
  const cmsKeys = new Set(sections.map(s => s.sectionKey));
  const hero = cms.hero || {};
  const heroDisabled = cmsKeys.has('hero') && !cms.hero;

  // 6 non-featured articles → 6 deliberate compositions
  // Rhythm: LEFT-LARGE → RIGHT-MEDIUM → LEFT-DETAIL → PANORAMA → RIGHT-LARGE → LEFT-MEDIUM
  const compositions = [
    // 1. LEFT LARGE — cinematic left, dominant opening
    { type: 'left-large', cols: 8, textCols: 4, side: 'left', gap: 'xl' },
    // 2. RIGHT MEDIUM — balanced counterpoint
    { type: 'right-medium', cols: 6, textCols: 5, side: 'right', gap: 'xl' },
    // 3. LEFT DETAIL — intimate scale, left-anchored
    { type: 'left-detail', cols: 5, textCols: 6, side: 'left', gap: 'lg' },
    // 4. PANORAMA — wide landscape, full grid width
    { type: 'panorama', cols: 12, textCols: 12, side: 'center', gap: '2xl' },
    // 5. RIGHT LARGE — cinematic right, visual counterweight
    { type: 'right-large', cols: 8, textCols: 4, side: 'right', gap: 'xl' },
    // 6. LEFT MEDIUM — closing composition
    { type: 'left-medium', cols: 7, textCols: 5, side: 'left', gap: 'xl' },
  ];

  return (
    <>
      <style>{`
        /* ── CSS Custom Properties: Journal Editorial Grid ── */
        :root {
          --journal-grid-max: 1280px;
          --journal-gutter: clamp(1.5rem, 3.5vw, 3rem);
          --journal-col-gap: clamp(1rem, 2.5vw, 2rem);
          --journal-row-rhythm: clamp(2.5rem, 4vw, 3.5rem);
          --journal-section-gap: clamp(3rem, 5vw, 4.5rem);
        }

        /* ── Hero: full-bleed cinematic ── */
        .journal-hero {
          position: relative;
          height: 55vh;
          min-height: 420px;
          overflow: hidden;
          background: var(--walnut);
        }
        .journal-hero img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 30%;
          opacity: 0.82;
          transform: scale(1.04);
          animation: pageHeroZoom 8s var(--ease-luxury) forwards;
        }
        .journal-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(43,34,27,0.08) 0%, rgba(43,34,27,0.15) 40%, rgba(43,34,27,0.65) 100%);
        }
        .journal-hero-content {
          position: absolute;
          bottom: clamp(var(--space-lg), 8vh, var(--space-2xl));
          left: 0;
          z-index: 2;
          padding: 0 var(--space-lg);
          max-width: 680px;
        }
        .journal-hero .eyebrow { margin-bottom: var(--space-sm); }
        .journal-hero h1 {
          color: var(--bg-primary);
          font-size: clamp(2rem, 4.5vw, var(--text-h1));
          line-height: 1.08;
          margin: 0;
          letter-spacing: -0.025em;
        }
        .journal-hero p {
          color: var(--stone);
          font-size: var(--text-body);
          max-width: 48ch;
          margin-top: var(--space-sm);
        }

        /* ── Featured Article: asymmetric editorial grid ── */
        .journal-featured {
          background: var(--bg-primary);
          padding: var(--space-3xl) 0;
          overflow-x: clip;
        }
        .featured-editorial {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: clamp(var(--space-xl), 5vw, var(--space-3xl));
          align-items: start;
          max-width: var(--journal-grid-max);
          margin: 0 auto;
          padding: 0 var(--journal-gutter);
        }
        .featured-image {
          position: relative;
          overflow: hidden;
        }
        .featured-image img {
          width: 100%;
          aspect-ratio: 3 / 2;
          object-fit: cover;
          transition: transform 1.2s var(--ease-luxury);
        }
        .featured-editorial:hover .featured-image img { transform: scale(1.02); }
        .featured-text { padding: var(--space-md) 0; }
        .featured-text .eyebrow { display: block; margin-bottom: var(--space-sm); }
        .featured-text h2 {
          margin-bottom: var(--space-sm);
          max-width: none;
        }
        .featured-editorial:hover .featured-text h2 { color: var(--bronze); }
        .featured-text p { color: var(--text-secondary); margin-bottom: var(--space-md); line-height: var(--lh-relaxed); }
        .article-date { font-size: var(--text-caption); color: var(--text-secondary); letter-spacing: 0.04em; display: block; margin-bottom: var(--space-sm); }
        .read-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          color: var(--bronze);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
        }
        .featured-editorial:hover .read-link { opacity: 1; transform: translateX(0); }

        /* ── Editorial Articles Container ── */
        .journal-editorial {
          background: var(--bg-primary);
          padding: var(--journal-row-rhythm) 0 var(--journal-section-gap);
          overflow-x: clip;
        }
        .journal-editorial-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: var(--journal-col-gap);
          max-width: var(--journal-grid-max);
          margin: 0 auto;
          padding: 0 var(--journal-gutter);
        }

        /* ── Base Article Card ── */
        .article-card {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-column: span 12;
          gap: var(--space-md);
          text-decoration: none;
          color: inherit;
          margin-bottom: var(--journal-row-rhythm);
        }
        .article-card:hover { transform: none; }

        .article-image {
          position: relative;
          overflow: hidden;
          background: var(--bg-secondary);
        }
        .article-image img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform var(--dur-slow) var(--ease);
        }
        .article-card:hover .article-image img { transform: scale(1.03); }

        .article-text {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          align-self: start;
        }
        .article-text .eyebrow { display: block; }
        .article-text h3,
        .featured-text h2 {
          font-size: clamp(1.25rem, 2.5vw, var(--text-h3));
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: -0.02em;
          transition: color var(--dur-fast) var(--ease);
        }
        .article-card:hover .article-text h3 { color: var(--bronze); }
        .article-text p { color: var(--text-secondary); font-size: var(--text-body); line-height: var(--lh-relaxed); }
        .article-meta {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-top: var(--space-xs);
        }
        .article-date { font-size: var(--text-caption); color: var(--text-secondary); letter-spacing: 0.04em; }
        .read-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          color: var(--bronze);
          opacity: 0.6;
          transition: opacity var(--dur-fast) var(--ease);
        }
        .article-card:hover .read-link { opacity: 1; }

        /* ── Composition: LEFT LARGE (8 cols image left, 4 cols text right) ── */
        .article-card--left-large .article-image {
          grid-column: 1 / span 8;
          grid-row: 1;
          aspect-ratio: 16 / 9;
        }
        .article-card--left-large .article-text {
          grid-column: 9 / span 4;
          grid-row: 1;
          padding-left: var(--space-lg);
          border-left: 1px solid rgba(43,34,27,0.15);
          max-width: 100%;
        }

        /* ── Composition: RIGHT MEDIUM (6 cols image right, 5 cols text left) ──
           Text at col 2 (outer margin at col 1), image at cols 7-12 (extreme right) */
        .article-card--right-medium .article-text {
          grid-column: 2 / span 5;
          grid-row: 1;
          align-self: center;
        }
        .article-card--right-medium .article-image {
          grid-column: 7 / span 6;
          grid-row: 1;
          aspect-ratio: 4 / 3;
          justify-self: end;
        }

        /* ── Composition: LEFT DETAIL (5 cols image left, 6 cols text right) ──
           Image at col 1 (extreme left), text adjacent at col 6, outer margin at col 12 */
        .article-card--left-detail .article-image {
          grid-column: 1 / span 5;
          grid-row: 1;
          aspect-ratio: 1 / 1;
        }
        .article-card--left-detail .article-text {
          grid-column: 6 / span 6;
          grid-row: 1;
          padding-left: var(--space-md);
          border-left: 1px solid rgba(43,34,27,0.1);
        }

        /* ── Composition: PANORAMA (full 12 cols, image + text stacked) ── */
        .article-card--panorama .article-image {
          grid-column: 1 / span 12;
          grid-row: 1;
          aspect-ratio: 2.5 / 1;
        }
        .article-card--panorama .article-text {
          grid-column: 1 / span 12;
          grid-row: 2;
          text-align: center;
          max-width: 60ch;
          margin: 0 auto;
          padding-top: var(--space-md);
        }

        /* ── Composition: RIGHT LARGE (8 cols image right, 4 cols text left) ── */
        .article-card--right-large .article-text {
          grid-column: 1 / span 4;
          grid-row: 1;
          align-self: center;
          padding-right: var(--space-lg);
          border-right: 1px solid rgba(43,34,27,0.15);
        }
        .article-card--right-large .article-image {
          grid-column: 5 / span 8;
          grid-row: 1;
          aspect-ratio: 16 / 9;
        }

        /* ── Composition: LEFT MEDIUM (7 cols image left, 5 cols text right) ── */
        .article-card--left-medium .article-image {
          grid-column: 1 / span 7;
          grid-row: 1;
          aspect-ratio: 3 / 2;
        }
        .article-card--left-medium .article-text {
          grid-column: 8 / span 5;
          grid-row: 1;
          padding-left: var(--space-lg);
          border-left: 1px solid rgba(43,34,27,0.15);
        }

        /* ── Edge-anchored compositions (desktop): side images sit flush
           to the viewport edge while image + text travel as one unit.
           Relative offsets never change box sizes; the panorama,
           featured block, and all tablet/mobile layouts are untouched. ── */
        @media (min-width: 1025px) {
          :root {
            --journal-edge: calc(var(--journal-gutter) + max(0px, (100vw - var(--journal-grid-max)) / 2));
          }
          /* Featured "Wood Facts": text left, image right and flush to
             the viewport edge. Column weights are preserved, so the
             image keeps its exact size; only its side changes. */
          .featured-editorial {
            grid-template-columns: 0.75fr 1.25fr;
          }
          .featured-editorial .featured-text {
            grid-column: 1;
            grid-row: 1;
            align-self: center;
            position: relative;
            left: var(--journal-edge);
          }
          .featured-editorial .featured-image {
            grid-column: 2;
            grid-row: 1;
            position: relative;
            left: var(--journal-edge);
          }
          .article-card--left-large .article-image,
          .article-card--left-detail .article-image,
          .article-card--left-medium .article-image,
          .article-card--left-large .article-text,
          .article-card--left-detail .article-text,
          .article-card--left-medium .article-text {
            position: relative;
            left: calc(-1 * var(--journal-edge));
          }
          .article-card--right-medium .article-image,
          .article-card--right-large .article-image,
          .article-card--right-medium .article-text,
          .article-card--right-large .article-text {
            position: relative;
            left: var(--journal-edge);
          }
        }

        /* ── Responsive: Tablet (≤1024px) ── */
        @media (max-width: 1024px) {
          :root {
            --journal-gutter: clamp(1.25rem, 3vw, 2.5rem);
            --journal-col-gap: clamp(0.75rem, 2vw, 1.5rem);
            --journal-row-rhythm: clamp(2rem, 3.5vw, 3rem);
            --journal-section-gap: clamp(2.5rem, 4.5vw, 4rem);
          }
          .featured-editorial {
            grid-template-columns: 1fr;
            gap: var(--space-lg);
            max-width: 100%;
            padding: 0 var(--space-md);
          }
          .featured-image img { aspect-ratio: 4 / 3; }
          .featured-text { padding: var(--space-sm) 0; }
          .read-link { opacity: 1; transform: none; }

          .article-card--right-medium .article-text,
          .article-card--right-large .article-text {
            grid-column: 1 / span 12;
            grid-row: 1;
            text-align: center;
            padding: 0;
            border: none;
          }
          .article-card--right-medium .article-image,
          .article-card--right-large .article-image {
            grid-column: 1 / span 12;
            grid-row: 2;
            justify-self: center;
            max-width: 70%;
          }
          .article-card--left-large .article-text,
          .article-card--left-detail .article-text,
          .article-card--left-medium .article-text {
            border: none;
            padding: 0;
            text-align: left;
          }
          .article-card--left-large .article-image,
          .article-card--left-detail .article-image,
          .article-card--left-medium .article-image {
            max-width: 100%;
            justify-self: center;
          }
          .article-card--panorama .article-image {
            aspect-ratio: 2 / 1;
            height: clamp(200px, 35vw, 300px);
          }
          .article-card--panorama .article-text {
            text-align: left;
            max-width: none;
            padding: 0;
          }
        }

        /* ── Responsive: Mobile (≤768px) ── */
        @media (max-width: 768px) {
          :root {
            --journal-gutter: clamp(1rem, 3vw, 1.5rem);
            --journal-col-gap: clamp(0.5rem, 2vw, 1rem);
            --journal-row-rhythm: clamp(1.75rem, 3.5vw, 2.5rem);
            --journal-section-gap: clamp(2rem, 4vw, 3rem);
          }
          .journal-hero { height: 45vh; min-height: 380px; }
          .journal-hero-content { padding: 0 var(--space-md); bottom: var(--space-lg); }

          .journal-editorial-grid {
            grid-template-columns: 1fr;
          }

          /* Mobile compositions: each article becomes a vertical stack
             but retains left/right visual variation through image sizing */
          .article-card {
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
            margin-bottom: var(--journal-row-rhythm);
          }

          .article-image {
            width: 100%;
            max-width: 100%;
            justify-self: stretch;
          }

          /* Mobile: vary image aspect ratios to preserve editorial rhythm */
          .article-card--left-large .article-image { aspect-ratio: 16 / 9; }
          .article-card--right-medium .article-image { aspect-ratio: 4 / 3; }
          .article-card--left-detail .article-image { aspect-ratio: 1 / 1; }
          .article-card--panorama .article-image {
            aspect-ratio: 2 / 1;
            height: clamp(200px, 40vw, 280px);
          }
          .article-card--right-large .article-image { aspect-ratio: 16 / 9; }
          .article-card--left-medium .article-image { aspect-ratio: 3 / 2; }

          .article-text {
            max-width: none;
            padding: 0;
            border: none;
            text-align: left;
            width: 100%;
          }
          .article-text h3,
          .featured-text h2 { font-size: var(--text-subhead); }
          .article-text p { font-size: var(--text-body); }
          .article-meta { flex-wrap: wrap; }
        }

        @media (max-width: 560px) {
          .journal-hero { height: 40vh; min-height: 320px; }
          .journal-hero h1 { font-size: var(--text-display); }
          .featured-image img { aspect-ratio: 1 / 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .article-image img { transition: none; }
          .article-card:hover .article-image img { transform: none; }
          .featured-editorial:hover .featured-image img { transform: none; }
          .read-link { transition: none; opacity: 1; }
        }
      `}</style>

      {!heroDisabled && (
      <section className="journal-hero">
        <img src={hero.image || "/temporary-images/journal-hero-tools-01.jpg"} alt="Hand tools arranged on a workshop bench." />
        <div className="journal-hero-content">
          <span className="eyebrow eyebrow-light">{hero.eyebrow || 'Journal'}</span>
          <h1>{hero.title || 'Stories, wood facts, and how to care for your piece.'}</h1>
          <p>{hero.subtitle || 'Writing on materials, grain details, finishing techniques, and the seasonal routines that keep solid timber in good condition for decades.'}</p>
        </div>
      </section>
      )}

      <section className="journal-featured">
        <div className="featured-editorial reveal" suppressHydrationWarning>
          <div className="featured-image img-zoom">
            <img loading="lazy" src={FEATURED.image} alt={FEATURED.imageAlt} />
          </div>
          <div className="featured-text">
            <span className="eyebrow">{FEATURED.category}</span>
            <h2>{FEATURED.title}</h2>
            <p>{FEATURED.excerpt}</p>
            <span className="article-date">{FEATURED.date}</span>
            <span className="read-link">Read <span aria-hidden="true">&rarr;</span></span>
          </div>
        </div>
      </section>

      {/* Editorial Articles Sequence — deliberate grid-based compositions */}
      <section className="journal-editorial">
        <div className="journal-editorial-grid">
          {ARTICLES.map((article, i) => {
            const comp = compositions[i % compositions.length];
            return (
              <article key={article.slug} className={`article-card article-card--${comp.type} reveal`} suppressHydrationWarning>
                <Link href={`/journal/${article.slug}`} className="article-card-link" style={{ display: 'contents' }}>
                  <div className="article-image img-zoom">
                    <img loading="lazy" src={article.image} alt={article.imageAlt} />
                  </div>
                  <div className="article-text">
                    <span className="eyebrow">{article.category}</span>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <div className="article-meta">
                      <span className="article-date">{article.date}</span>
                      <span className="read-link">Read <span aria-hidden="true">&rarr;</span></span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
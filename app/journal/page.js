import Link from 'next/link';
import { JOURNAL, getFeaturedArticle, getNonFeaturedArticles } from '../data/journal';
import { getPublishedPageSections } from '@/lib/cms'

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Journal',
  description: 'Stories from the Teakle workshop. Notes on craft, material, and the objects we make.',
  openGraph: { title: 'Journal \u2014 Teakle', description: 'Stories from the Teakle workshop.' },
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

  return (
    <>
      <style>{`
        .journal-featured {
          background: var(--bg-primary);
          padding: var(--space-xl) 0;
        }
        .featured-card {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: var(--space-2xl);
          align-items: center;
          text-decoration: none;
          color: inherit;
          transition: transform 400ms var(--ease);
        }
        .featured-card:hover { transform: translateY(-2px); }
        .featured-image {
          position: relative;
          aspect-ratio: 16 / 11;
          overflow: hidden;
          background: var(--bg-secondary);
        }
        .featured-image img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform var(--dur-slow) var(--ease);
        }
        .featured-card:hover .featured-image img { transform: scale(1.03); }
        .featured-text .eyebrow { display: block; margin-bottom: var(--space-sm); }
        .featured-text h2 {
          font-size: clamp(1.75rem, 3.4vw, var(--text-h2));
          margin-bottom: var(--space-sm);
          max-width: none;
          line-height: 1.25;
          transition: color var(--dur-fast) var(--ease);
        }
        .featured-card:hover .featured-text h2 { color: var(--bronze); }
        .featured-text p { color: var(--text-secondary); margin-bottom: var(--space-md); line-height: var(--lh-relaxed); }
        .article-date { font-size: var(--text-caption); color: var(--text-secondary); letter-spacing: 0.04em; }
        .read-link {
          display: inline-block;
          margin-left: var(--space-sm);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          color: var(--bronze);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
        }
        .featured-card:hover .read-link,
        .article-card:hover .read-link { opacity: 1; transform: translateX(0); }

        .journal-list {
          background: var(--bg-secondary);
          padding: var(--space-2xl) 0;
        }
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg) var(--space-md);
        }
        .article-card {
          display: block;
          text-decoration: none;
          color: inherit;
          transition: transform 400ms var(--ease);
        }
        .article-card:hover { transform: translateY(-4px); }
        .article-image {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: var(--bg-primary);
          margin-bottom: var(--space-sm);
        }
        .article-image img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform var(--dur-slow) var(--ease);
        }
        .article-card:hover .article-image img { transform: scale(1.04); }
        .article-card .eyebrow { display: block; margin-bottom: var(--space-sm); }
        .article-card h3 {
          font-size: var(--text-subhead);
          font-weight: 500;
          margin-bottom: var(--space-sm);
          max-width: none;
          line-height: 1.3;
          transition: color var(--dur-fast) var(--ease);
        }
        .article-card:hover h3 { color: var(--bronze); }
        .article-card p { color: var(--text-secondary); font-size: var(--text-body); margin-bottom: var(--space-sm); line-height: var(--lh-relaxed); }

        @media (max-width: 860px) {
          .featured-card { grid-template-columns: 1fr; gap: var(--space-md); }
          .featured-image { aspect-ratio: 4 / 3; }
          .articles-grid { grid-template-columns: 1fr 1fr; }
          .read-link { opacity: 1; transform: none; }
        }
        @media (max-width: 560px) {
          .articles-grid { grid-template-columns: 1fr; }
          .featured-image { aspect-ratio: 1 / 1; }
          .article-card h3 { font-size: var(--text-subhead); }
          .article-card p { font-size: var(--text-body); line-height: var(--lh-relaxed); }
        }
        @media (max-width: 430px) {
          .article-card h3 { font-size: var(--text-subhead); }
          .article-card p { font-size: var(--text-caption); }
        }
        @media (prefers-reduced-motion: reduce) {
          .featured-card, .article-card { transition: none; }
          .featured-card:hover, .article-card:hover { transform: none; }
          .featured-image img, .article-image img { transition: none; }
          .featured-card:hover .featured-image img,
          .article-card:hover .article-image img { transform: none; }
          .read-link { transition: none; opacity: 1; transform: none; }
        }
      `}</style>

      {!heroDisabled && (
      <section className="page-hero">
        <img src={hero.image || "https://images.pexels.com/photos/5974028/pexels-photo-5974028.jpeg?auto=compress&cs=tinysrgb&w=1600"} alt="Hand tools arranged on a workshop bench." />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">{hero.eyebrow || 'Journal'}</span>
          <h1>{hero.title || 'Stories, wood facts, and how to care for your piece.'}</h1>
          <p>{hero.subtitle || 'Writing on materials, grain details, finishing techniques, and the seasonal routines that keep solid timber in good condition for decades.'}</p>
        </div>
      </section>
      )}

      <section className="journal-featured">
        <div className="container">
          <Link href={`/journal/${FEATURED.slug}`} className="featured-card reveal">
            <div className="featured-image img-zoom">
              <img loading="lazy" src={FEATURED.image} alt={FEATURED.imageAlt} />
            </div>
            <div className="featured-text">
              <span className="eyebrow">{FEATURED.category}</span>
              <h2>{FEATURED.title}</h2>
              <p>{FEATURED.excerpt}</p>
              <span className="article-date">{FEATURED.date}</span><span className="read-link">Read &rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="journal-list">
        <div className="container">
          <div className="articles-grid">
            {ARTICLES.map((article) => (
              <Link key={article.slug} href={`/journal/${article.slug}`} className="article-card reveal">
                <div className="article-image img-zoom">
                  <img loading="lazy" src={article.image} alt={article.imageAlt} />
                </div>
                <span className="eyebrow">{article.category}</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <span className="article-date">{article.date}</span><span className="read-link">Read &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

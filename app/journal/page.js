import Link from 'next/link';

export const metadata = {
  title: 'Journal',
  description: 'Stories from the Teakle workshop. Notes on craft, material, and the objects we make.',
  openGraph: { title: 'Journal — Teakle', description: 'Stories from the Teakle workshop.' },
};

const ARTICLES = [
  {
    slug: 'why-we-never-seal-wood-with-lacquer',
    category: 'Details',
    title: 'Why we never seal wood with lacquer',
    excerpt: 'Lacquer looks flawless for a year, then starts to crack at the edges. Oil ages differently — here\u2019s the tradeoff, honestly.',
    date: 'February 2026',
    image: 'https://images.pexels.com/photos/7234682/pexels-photo-7234682.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'A hand rubbing oil finish into a wooden surface.',
  },
  {
    slug: 'how-long-wood-needs-to-dry',
    category: 'Wood Facts',
    title: 'How long wood needs to dry before it\u2019s usable',
    excerpt: 'Rushed timber warps within a year. We explain the drying process we use and why it can\u2019t be shortened.',
    date: 'January 2026',
    image: 'https://images.pexels.com/photos/5599172/pexels-photo-5599172.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'Stacked timber boards drying in a workshop.',
  },
  {
    slug: 'caring-for-solid-wood-over-decades',
    category: 'Care',
    title: 'Caring for a solid wood piece over decades',
    excerpt: 'A simple seasonal routine \u2014 no special products, no polishes, just what actually keeps timber in good condition.',
    date: 'December 2025',
    image: 'https://images.pexels.com/photos/12233290/pexels-photo-12233290.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'A finished wooden bench in a minimal room.',
  },
  {
    slug: 'why-we-dont-use-nails-or-screws',
    category: 'Details',
    title: 'Why we don\u2019t use nails or screws in most joints',
    excerpt: 'A cut joint moves with the wood as it expands and contracts. Metal fasteners fight that movement instead.',
    date: 'November 2025',
    image: 'https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'Detail of a hand-cut wooden joint.',
  },
  {
    slug: 'why-we-dont-sand-away-knots',
    category: 'Stories',
    title: 'Why we don\u2019t sand away knots and colour shifts',
    excerpt: 'An imperfection in the grain is a record of where the tree grew. Removing it doesn\u2019t make the wood better \u2014 it makes it generic.',
    date: 'October 2025',
    image: 'https://images.pexels.com/photos/36299690/pexels-photo-36299690.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'Natural imperfections and knots in wood grain.',
  },
  {
    slug: 'the-tools-we-still-use',
    category: 'Stories',
    title: 'The tools we still use, and why we haven\u2019t replaced them',
    excerpt: 'Some of the hand tools in daily use here are decades old. A short note on why that\u2019s a feature, not a limitation.',
    date: 'September 2025',
    image: 'https://images.pexels.com/photos/5974028/pexels-photo-5974028.jpeg?auto=compress&cs=tinysrgb&w=700',
    imageAlt: 'Hand tools arranged on a workshop bench.',
  },
];

const FEATURED = {
  slug: 'what-solid-wood-actually-means',
  category: 'Wood Facts',
  title: 'What \u201csolid wood\u201d actually means, and why the label is used loosely',
  excerpt: 'Most furniture described as solid wood is a thin veneer over particleboard. Here\u2019s how to tell the difference before you buy \u2014 and why it matters more after five years than on day one.',
  date: 'March 2026',
  image: 'https://images.pexels.com/photos/8465898/pexels-photo-8465898.jpeg?auto=compress&cs=tinysrgb&w=1000',
  imageAlt: 'Close-up of wood grain on a finished tabletop.',
};

export default function JournalPage() {
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

      {/* Hero */}
      <section className="page-hero">
        <img src="https://images.pexels.com/photos/5974028/pexels-photo-5974028.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Hand tools arranged on a workshop bench." />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">Journal</span>
          <h1>Stories, wood facts, and how to care for your piece.</h1>
          <p>Writing on materials, grain details, finishing techniques, and the seasonal routines that keep solid timber in good condition for decades.</p>
        </div>
      </section>

      {/* Featured Story */}
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

      {/* Article Grid */}
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

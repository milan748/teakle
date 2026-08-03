'use client'

import { useEffect } from 'react'

export default function JournalPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal, .piece-card').forEach((el) => {
        el.classList.add('is-visible')
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <style>{`
        .journal-featured {
          background: var(--bg-primary);
          padding: var(--space-xl) 0 var(--space-xl);
        }
        .featured-card {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: var(--space-2xl);
          align-items: center;
        }
        .featured-image { aspect-ratio: 16 / 11; }
        .featured-image img { width: 100%; height: 100%; object-fit: cover; }
        .featured-text .eyebrow { display: block; margin-bottom: var(--space-sm); }
        .featured-text h2 {
          font-size: clamp(1.75rem, 3.4vw, var(--text-h2));
          margin-bottom: var(--space-sm);
          max-width: none;
        }
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
        .article-card { display: block; }
        .article-image { aspect-ratio: 4 / 3; margin-bottom: var(--space-sm); }
        .article-image img { width: 100%; height: 100%; object-fit: cover; }
        .article-card .eyebrow { display: block; margin-bottom: var(--space-sm); }
        .article-card h3 {
          font-size: var(--text-subhead);
          margin-bottom: var(--space-sm);
          max-width: none;
        }
        .article-card p { color: var(--text-secondary); font-size: var(--text-body); margin-bottom: var(--space-sm); line-height: var(--lh-relaxed); }

        @media (max-width: 860px) {
          .featured-card { grid-template-columns: 1fr; gap: var(--space-md); }
          .featured-image { aspect-ratio: 4 / 3; }
          .articles-grid { grid-template-columns: 1fr 1fr; }
          .article-date { font-size: var(--text-caption); }
          .read-link { font-size: var(--text-caption); opacity: 1; transform: none; }
          .article-card .eyebrow { font-size: var(--text-caption); }
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
      `}</style>

      <section className="page-hero">
        <img src="https://images.pexels.com/photos/5974028/pexels-photo-5974028.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Hand tools arranged on a workshop bench." />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">Journal</span>
          <h1>Stories, wood facts, and how to care for your piece.</h1>
          <p>Writing on materials, grain details, finishing techniques, and the seasonal routines that keep solid timber in good condition for decades.</p>
        </div>
      </section>

      <section className="journal-featured">
        <div className="container">
          <a href="#" className="featured-card reveal">
            <div className="featured-image img-zoom">
              <img loading="lazy" src="https://images.pexels.com/photos/8465898/pexels-photo-8465898.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Close-up of wood grain on a finished tabletop." />
            </div>
            <div className="featured-text">
              <span className="eyebrow">Wood Facts</span>
              <h2>What &quot;solid wood&quot; actually means, and why the label is used loosely</h2>
              <p>Most furniture described as solid wood is a thin veneer over particleboard. Here&apos;s how to tell the difference before you buy — and why it matters more after five years than on day one.</p>
              <span className="article-date">March 2026</span><span className="read-link">Read →</span>
            </div>
          </a>
        </div>
      </section>

      <section className="journal-list">
        <div className="container">
          <div className="articles-grid">

            <article className="article-card reveal">
              <div className="article-image img-zoom">
                <img loading="lazy" src="https://images.pexels.com/photos/7234682/pexels-photo-7234682.jpeg?auto=compress&cs=tinysrgb&w=700" alt="A hand rubbing oil finish into a wooden surface." />
              </div>
              <span className="eyebrow">Details</span>
              <h3>Why we never seal wood with lacquer</h3>
              <p>Lacquer looks flawless for a year, then starts to crack at the edges. Oil ages differently — here&apos;s the tradeoff, honestly.</p>
              <span className="article-date">February 2026</span><span className="read-link">Read →</span>
            </article>

            <article className="article-card reveal">
              <div className="article-image img-zoom">
                <img loading="lazy" src="https://images.pexels.com/photos/5599172/pexels-photo-5599172.jpeg?auto=compress&cs=tinysrgb&w=700" alt="Stacked timber boards drying in a workshop." />
              </div>
              <span className="eyebrow">Wood Facts</span>
              <h3>How long wood needs to dry before it&apos;s usable</h3>
              <p>Rushed timber warps within a year. We explain the drying process we use and why it can&apos;t be shortened.</p>
              <span className="article-date">January 2026</span><span className="read-link">Read →</span>
            </article>

            <article className="article-card reveal">
              <div className="article-image img-zoom">
                <img loading="lazy" src="https://images.pexels.com/photos/12233290/pexels-photo-12233290.jpeg?auto=compress&cs=tinysrgb&w=700" alt="A finished wooden bench in a minimal room." />
              </div>
              <span className="eyebrow">Care</span>
              <h3>Caring for a solid wood piece over decades</h3>
              <p>A simple seasonal routine — no special products, no polishes, just what actually keeps timber in good condition.</p>
              <span className="article-date">December 2025</span><span className="read-link">Read →</span>
            </article>

            <article className="article-card reveal">
              <div className="article-image img-zoom">
                <img loading="lazy" src="https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=700" alt="Detail of a hand-cut wooden joint." />
              </div>
              <span className="eyebrow">Details</span>
              <h3>Why we don&apos;t use nails or screws in most joints</h3>
              <p>A cut joint moves with the wood as it expands and contracts. Metal fasteners fight that movement instead.</p>
              <span className="article-date">November 2025</span><span className="read-link">Read →</span>
            </article>

            <article className="article-card reveal">
              <div className="article-image img-zoom">
                <img loading="lazy" src="https://images.pexels.com/photos/36299690/pexels-photo-36299690.jpeg?auto=compress&cs=tinysrgb&w=700" alt="Natural imperfections and knots in wood grain." />
              </div>
              <span className="eyebrow">Stories</span>
              <h3>Why we don&apos;t sand away knots and colour shifts</h3>
              <p>An imperfection in the grain is a record of where the tree grew. Removing it doesn&apos;t make the wood better — it makes it generic.</p>
              <span className="article-date">October 2025</span><span className="read-link">Read →</span>
            </article>

            <article className="article-card reveal">
              <div className="article-image img-zoom">
                <img loading="lazy" src="https://images.pexels.com/photos/5974028/pexels-photo-5974028.jpeg?auto=compress&cs=tinysrgb&w=700" alt="Hand tools arranged on a workshop bench." />
              </div>
              <span className="eyebrow">Stories</span>
              <h3>The tools we still use, and why we haven&apos;t replaced them</h3>
              <p>Some of the hand tools in daily use here are decades old. A short note on why that&apos;s a feature, not a limitation.</p>
              <span className="article-date">September 2025</span><span className="read-link">Read →</span>
            </article>

          </div>
        </div>
      </section>
    </>
  )
}

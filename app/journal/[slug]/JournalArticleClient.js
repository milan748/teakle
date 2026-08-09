'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

const articleStyles = `
  .j-hero {
    position: relative;
    width: 100%;
    height: 55vh;
    min-height: 400px;
    overflow: hidden;
    background: var(--bg-secondary);
  }
  .j-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .j-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(43,34,27,0.7) 0%, rgba(43,34,27,0.1) 60%);
  }
  .j-hero-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--space-xl) var(--space-md) var(--space-lg);
    max-width: var(--container);
    margin: 0 auto;
  }
  .j-hero-content .eyebrow {
    display: inline-block;
    margin-bottom: var(--space-sm);
  }
  .j-hero-content h1 {
    font-size: clamp(1.75rem, 4vw, var(--text-h1));
    color: #fff;
    max-width: 720px;
    line-height: 1.2;
    margin-bottom: var(--space-sm);
  }
  .j-hero-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: rgba(255,255,255,0.7);
    font-size: var(--text-caption);
    letter-spacing: 0.04em;
  }
  .j-hero-meta span:not(:empty)::after {
    content: '';
    display: inline-block;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    margin-left: var(--space-sm);
    vertical-align: middle;
  }
  .j-hero-meta span:last-child::after {
    display: none;
  }
  .j-article {
    background: var(--bg-primary);
    padding: var(--space-xl) 0 var(--space-2xl);
  }
  .j-article-inner {
    max-width: 680px;
    margin: 0 auto;
    padding: 0 var(--space-md);
  }
  .j-article-body h2 {
    font-size: var(--text-h3);
    margin: var(--space-lg) 0 var(--space-sm);
    max-width: none;
    line-height: 1.3;
  }
  .j-article-body p {
    font-size: var(--text-body);
    line-height: var(--lh-relaxed);
    color: var(--text-primary);
    margin-bottom: var(--space-md);
  }
  .j-article-body p:first-child {
    font-size: 1.125rem;
    line-height: 1.75;
    color: var(--text-primary);
  }
  .j-back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: var(--text-caption);
    color: var(--bronze);
    text-decoration: none;
    letter-spacing: 0.04em;
    font-weight: 500;
    margin-bottom: var(--space-lg);
    transition: opacity 150ms var(--ease);
  }
  .j-back:hover { opacity: 0.7; }
  .j-back:focus-visible { outline: 2px solid var(--bronze); outline-offset: 2px; }
  .j-back svg { width: 14px; height: 14px; }
  .j-related {
    background: var(--bg-secondary);
    padding: var(--space-xl) 0;
  }
  .j-related-inner {
    max-width: var(--container);
    margin: 0 auto;
    padding: 0 var(--space-md);
  }
  .j-related-head {
    margin-bottom: var(--space-lg);
  }
  .j-related-head .eyebrow {
    display: block;
    margin-bottom: var(--space-xs);
  }
  .j-related-head h2 {
    font-size: var(--text-h2);
    max-width: none;
  }
  .j-related-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
  }
  .j-rel-card {
    display: block;
    text-decoration: none;
    color: inherit;
    transition: transform 400ms var(--ease);
  }
  .j-rel-card:hover { transform: translateY(-4px); }
  .j-rel-card-img {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--bg-primary);
    margin-bottom: 0.75rem;
  }
  .j-rel-card-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--dur-slow) var(--ease);
  }
  .j-rel-card:hover .j-rel-card-img img { transform: scale(1.04); }
  .j-rel-card .eyebrow {
    display: block;
    margin-bottom: var(--space-xs);
  }
  .j-rel-card h3 {
    font-size: var(--text-body);
    font-weight: 500;
    line-height: 1.3;
    margin-bottom: var(--space-xs);
    max-width: none;
    transition: color var(--dur-fast) var(--ease);
  }
  .j-rel-card:hover h3 { color: var(--bronze); }
  .j-rel-card p {
    font-size: var(--text-caption);
    color: var(--text-secondary);
    line-height: var(--lh-relaxed);
    margin-bottom: var(--space-xs);
  }
  .j-rel-card .article-date {
    font-size: var(--text-caption);
    color: var(--text-secondary);
    letter-spacing: 0.04em;
  }
  @media (max-width: 860px) {
    .j-hero { height: 45vh; min-height: 320px; }
    .j-hero-content { padding: var(--space-lg) var(--space-md) var(--space-md); }
    .j-related-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 560px) {
    .j-hero { height: 40vh; min-height: 280px; }
    .j-hero-content h1 { font-size: var(--text-h2); }
    .j-related-grid { grid-template-columns: 1fr; gap: var(--space-sm); }
    .j-article-body p:first-child { font-size: 1rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .j-rel-card { transition: none; }
    .j-rel-card:hover { transform: none; }
    .j-rel-card-img img { transition: none; }
    .j-rel-card:hover .j-rel-card-img img { transform: none; }
  }
`;

export default function JournalArticleClient({ article: serverArticle }) {
  const [article, setArticle] = useState({ body: [], relatedProducts: [], ...serverArticle });
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const articles = window.TEAKLE_JOURNAL || [];
    const found = articles.find((a) => a.slug === serverArticle.slug);
    const fullArticle = found || { body: [], relatedProducts: [], ...serverArticle };
    setArticle(fullArticle);

    const related = articles
      .filter((a) => a.slug !== serverArticle.slug && a.category === fullArticle.category)
      .slice(0, 3);
    if (related.length < 3) {
      const extras = articles
        .filter((a) => a.slug !== serverArticle.slug && a.category !== fullArticle.category && !related.find((r) => r.slug === a.slug))
        .slice(0, 3 - related.length);
      related.push(...extras);
    }
    setRelatedArticles(related);

    if (fullArticle.relatedProducts && window.TEAKLE_PRODUCTS) {
      const prods = fullArticle.relatedProducts
        .map((id) => window.TEAKLE_PRODUCTS.find((p) => p.id === id))
        .filter(Boolean)
        .slice(0, 3);
      setRelatedProducts(prods);
    }
  }, [serverArticle.slug, scriptLoaded]);

  return (
    <>
      <Script src="/journal-articles.js" strategy="beforeInteractive" onLoad={() => setScriptLoaded(true)} />
      <style>{articleStyles}</style>

      <section className="j-hero">
        <img src={article.image} alt={article.imageAlt} />
        <div className="j-hero-overlay"></div>
        <div className="j-hero-content">
          <span className="eyebrow eyebrow-light">{article.category}</span>
          <h1>{article.title}</h1>
          <div className="j-hero-meta">
            {article.date && <span>{article.date}</span>}
            <span>Teakle Journal</span>
          </div>
        </div>
      </section>

      <article className="j-article">
        <div className="j-article-inner">
          <Link href="/journal" className="j-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Journal
          </Link>

          <div className="j-article-body">
            {article.body.map((block, i) => {
              if (block.type === 'heading') {
                return <h2 key={i}>{block.text}</h2>;
              }
              return <p key={i}>{block.text}</p>;
            })}
          </div>
        </div>
      </article>

      {relatedProducts.length > 0 && (
        <section className="j-related">
          <div className="j-related-inner">
            <div className="j-related-head">
              <span className="eyebrow">Related Pieces</span>
              <h2>Mentioned in this article</h2>
            </div>
            <div className="j-related-grid">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/shop/${p.id}`} className="j-rel-card">
                  <div className="j-rel-card-img">
                    <img src={p.images?.[0]} alt={p.name} loading="lazy" />
                  </div>
                  <span className="eyebrow">{p.categoryName}</span>
                  <h3>{p.name}</h3>
                  <p>{p.priceFormatted}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="j-related">
          <div className="j-related-inner">
            <div className="j-related-head">
              <span className="eyebrow">Continue Reading</span>
              <h2>More from the Journal</h2>
            </div>
            <div className="j-related-grid">
              {relatedArticles.map((a) => (
                <Link key={a.slug} href={`/journal/${a.slug}`} className="j-rel-card">
                  <div className="j-rel-card-img">
                    <img src={a.image} alt={a.imageAlt} loading="lazy" />
                  </div>
                  <span className="eyebrow">{a.category}</span>
                  <h3>{a.title}</h3>
                  {a.date && <span className="article-date">{a.date}</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

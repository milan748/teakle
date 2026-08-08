'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/* ============================================
   COLLECTION PAGE — Editorial Collection View
   ============================================ */

const COLLECTIONS = {
  'kitchen-dining': {
    name: 'Kitchen & Dining',
    tagline: 'Where meals begin and memories form.',
    description: 'Handcrafted boards, bowls, and serving pieces designed for daily use. Each piece is shaped from solid teak, finished with food-safe oil, and built to develop a rich patina over years of use.',
    heroImage: 'https://images.pexels.com/photos/6910978/pexels-photo-6910978.jpeg?auto=compress&cs=tinysrgb&w=1800',
    categories: ['kitchen', 'dining'],
    subcategories: ['serving-boards', 'trays', 'bowls', 'countertop-essentials', 'cooking-essentials', 'dining-serving'],
  },
  'home-decor': {
    name: 'Home Décor',
    tagline: 'Objects that anchor a room.',
    description: 'Sculptural objects, vases, and candle holders crafted to bring warmth and character to any space. Each piece is unique — shaped by hand, never by machine.',
    heroImage: 'https://images.pexels.com/photos/4612501/pexels-photo-4612501.jpeg?auto=compress&cs=tinysrgb&w=1800',
    categories: ['living', 'outdoor'],
    subcategories: ['sculptures', 'vases', 'candle-holders', 'coffee-table-decor', 'planters'],
  },
  'everyday-living': {
    name: 'Everyday Living',
    tagline: 'Handmade rituals for daily life.',
    description: 'Trays, boxes, and organisers shaped by hand for the small rituals that make a home. Designed to be used every day, and to look better with each year.',
    heroImage: 'https://images.pexels.com/photos/33395641/pexels-photo-33395641.jpeg?auto=compress&cs=tinysrgb&w=1800',
    categories: ['living', 'bedroom'],
    subcategories: ['storage-boxes', 'nightstand-essentials', 'organizers', 'decorative-objects'],
  },
  'storage': {
    name: 'Storage',
    tagline: 'Functional craft for organised spaces.',
    description: 'Pen holders, desk trays, vanity organisers, and storage boxes — each one handcrafted from solid timber. Functional objects that bring order and beauty to everyday spaces.',
    heroImage: 'https://images.pexels.com/photos/6340708/pexels-photo-6340708.jpeg?auto=compress&cs=tinysrgb&w=1800',
    categories: ['office', 'bathroom', 'bedroom'],
    subcategories: ['desk-organization', 'pen-holders', 'vanity-organizers', 'organizers', 'laptop-stands'],
  },
};

const collectionStyles = `
/* ================================================================
   COLLECTION PAGE
   ================================================================ */
.col-hero {
  position: relative;
  height: 65vh;
  min-height: 480px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  background: var(--walnut);
}
.col-hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 120%;
  object-fit: cover;
  opacity: 0.8;
  animation: colZoom 16s var(--ease) forwards;
}
@keyframes colZoom {
  from { transform: scale(1.08); }
  to { transform: scale(1); }
}
.col-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(51,38,29,0.05) 0%, rgba(51,38,29,0.5) 60%, rgba(51,38,29,0.82) 100%);
  z-index: 1;
}
.col-hero-content {
  position: relative;
  z-index: 2;
  padding: 0 var(--space-md) var(--space-2xl);
  max-width: 720px;
  margin-left: 4vw;
}
.col-hero-content .eyebrow { color: var(--stone); margin-bottom: var(--space-md); }
.col-hero-content h1 {
  color: var(--bg-primary);
  font-size: clamp(2.2rem, 5.5vw, var(--text-hero));
  font-weight: 300;
  font-style: italic;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-sm);
}
.col-hero-content .col-tagline {
  color: var(--stone);
  font-size: var(--text-body);
  font-style: italic;
  margin-bottom: var(--space-md);
}

/* Breadcrumb */
.col-breadcrumb {
  padding: var(--space-lg) 0 0;
  font-size: var(--text-caption);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
}
.col-breadcrumb a { color: var(--text-secondary); text-decoration: none; }
.col-breadcrumb a:hover { color: var(--bronze); }
.col-breadcrumb span { margin: 0 0.5em; }

/* Intro */
.col-intro {
  background: var(--bg-primary);
  padding: var(--space-xl) 0;
}
.col-intro-inner {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: center;
}
.col-intro-text p {
  color: var(--text-secondary);
  font-size: var(--text-body);
  line-height: var(--lh-relaxed);
  max-width: 50ch;
}
.col-intro-count {
  font-size: var(--text-caption);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bronze);
  margin-bottom: var(--space-sm);
}

/* Sort & Filter Bar */
.col-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: var(--border-subtle);
  margin-bottom: var(--space-md);
}
.col-toolbar-count {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.col-toolbar-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.col-sort-select {
  font-family: var(--font-body);
  font-size: var(--text-caption);
  color: var(--text-primary);
  background: none;
  border: var(--border-hair);
  padding: 0.5em 1.8em 0.5em 0.6em;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2361574F' stroke-width='1.2'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5em center;
  cursor: pointer;
  min-height: 40px;
  transition: border-color var(--dur-fast) var(--ease);
}
.col-sort-select:hover { border-color: var(--bronze); }
.col-filter-btn {
  display: none;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-body);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-primary);
  background: none;
  border: var(--border-hair);
  padding: 0.5em 1em;
  cursor: pointer;
  min-height: 40px;
}

/* Product Grid */
.col-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  padding-bottom: var(--space-2xl);
}
.col-card {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: transform 400ms var(--ease);
}
.col-card:hover { transform: translateY(-4px); }
.col-card-img {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--bg-secondary);
  margin-bottom: 0.75rem;
}
.col-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dur-slow) var(--ease);
}
.col-card:hover .col-card-img img { transform: scale(1.04); }
.col-card-wishlist {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
  z-index: 2;
  color: var(--text-primary);
}
.col-card:hover .col-card-wishlist { opacity: 1; transform: scale(1); }
.col-card-wishlist:hover { background: var(--bronze); color: #fff; }
.col-card-wishlist svg { width: 14px; height: 14px; }
.col-card-info h3 {
  font-size: var(--text-body);
  font-weight: 500;
  margin-bottom: 0.15rem;
  transition: color var(--dur-fast) var(--ease);
}
.col-card:hover .col-card-info h3 { color: var(--bronze); }
.col-card-price {
  font-size: var(--text-caption);
  color: var(--text-secondary);
}

/* Empty State */
.col-empty {
  text-align: center;
  padding: var(--space-2xl) var(--space-md);
  grid-column: 1 / -1;
}
.col-empty h3 {
  font-size: var(--text-h2);
  font-weight: 300;
  margin-bottom: var(--space-sm);
}
.col-empty p {
  color: var(--text-secondary);
  font-size: var(--text-body);
  margin-bottom: var(--space-md);
}

/* Responsive */
@media (max-width: 860px) {
  .col-hero { height: 55vh; min-height: 400px; }
  .col-hero-content { padding: 0 var(--space-lg) var(--space-lg); margin-left: 0; max-width: 100%; }
  .col-hero-content h1 { font-size: var(--text-h1); }
  .col-intro-inner { grid-template-columns: 1fr; gap: var(--space-md); }
  .col-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
  .col-filter-btn { display: flex; }
}
@media (max-width: 560px) {
  .col-hero { height: 50vh; min-height: 340px; }
  .col-hero-content { padding: 0 var(--space-md) var(--space-md); }
  .col-hero-content h1 { font-size: var(--text-h2); }
  .col-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
  .col-card-wishlist { opacity: 1; transform: scale(1); }
  .col-toolbar { flex-wrap: wrap; gap: var(--space-xs); }
  .col-toolbar-controls { width: 100%; }
  .col-sort-select { flex: 1; }
}
@media (max-width: 430px) {
  .col-card-info h3 { font-size: var(--text-caption); }
  .col-card-price { font-size: 0.65rem; }
  .col-grid { gap: var(--space-xs); }
}
@media (prefers-reduced-motion: reduce) {
  .col-hero-img { animation: none; transform: scale(1); }
}
`;

export default function CollectionPage() {
  const params = useParams();
  const slug = params?.slug;
  const [products, setProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [sortValue, setSortValue] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = COLLECTIONS[slug];
    if (!col) {
      setCollection(null);
      setLoading(false);
      return;
    }
    setCollection(col);
    document.title = `${col.name} — Teakle`;

    if (typeof window === 'undefined' || !window.TEAKLE_PRODUCTS) return;
    const all = window.TEAKLE_PRODUCTS;
    const filtered = all.filter(
      (p) => col.categories.includes(p.category) || col.subcategories.includes(p.subcategory)
    );
    setProducts(filtered);
    setLoading(false);
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortValue) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'name': return a.name.localeCompare(b.name);
      case 'newest': return 0;
      default: return 0;
    }
  });

  const handleWishlist = useCallback((e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    if (window.Teachle && window.Teachle.requireAuth && !window.Teachle.requireAuth()) return;
    if (window.Teachle && window.Teachle.toggleWishlist) {
      window.Teachle.toggleWishlist({
        id: product.id, name: product.name,
        price: product.priceFormatted, image: product.images[0],
      });
    }
  }, []);

  if (!collection) {
    return (
      <>
        <style>{collectionStyles}</style>
        <section className="col-hero">
          <div className="col-hero-content">
            <h1>Collection Not Found</h1>
            <p style={{ color: 'var(--stone)' }}>This collection doesn&apos;t exist yet.</p>
          </div>
        </section>
        <div style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-md)' }}>
          <Link href="/gallery" className="btn-primary">Back to Gallery</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{collectionStyles}</style>

      {/* Hero */}
      <section className="col-hero">
        <img className="col-hero-img" src={collection.heroImage} alt={collection.name} />
        <div className="col-hero-content">
          <span className="eyebrow eyebrow-light">Collection</span>
          <h1>{collection.name}</h1>
          <p className="col-tagline">{collection.tagline}</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container">
        <nav className="col-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/gallery">Gallery</Link>
          <span>/</span>
          <span>{collection.name}</span>
        </nav>
      </div>

      {/* Intro */}
      <section className="col-intro">
        <div className="col-intro-inner">
          <div className="col-intro-text">
            <span className="col-intro-count">{products.length} piece{products.length !== 1 ? 's' : ''}</span>
            <p>{collection.description}</p>
          </div>
          <div>
            <div className="col-toolbar">
              <span className="col-toolbar-count">{sortedProducts.length} piece{sortedProducts.length !== 1 ? 's' : ''}</span>
              <div className="col-toolbar-controls">
                <select className="col-sort-select" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section style={{ background: 'var(--bg-primary)', padding: '0 var(--space-md)' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto' }}>
          <div className="col-grid">
            {loading ? (
              <div className="col-empty"><p>Loading collection...</p></div>
            ) : sortedProducts.length === 0 ? (
              <div className="col-empty">
                <h3>Coming Soon</h3>
                <p>This collection is being curated. Enquire for custom options.</p>
                <Link href="/contact" className="btn-primary">Get in Touch</Link>
              </div>
            ) : (
              sortedProducts.map((p) => (
                <Link key={p.id} href={`/shop/${p.id}`} className="col-card">
                  <div className="col-card-img">
                    <img src={p.images[0]} alt={p.name} loading="lazy" />
                    <button className="col-card-wishlist" aria-label={`Add ${p.name} to wishlist`} onClick={(e) => handleWishlist(e, p)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                  </div>
                  <div className="col-card-info">
                    <h3>{p.name}</h3>
                    <span className="col-card-price">{p.priceFormatted}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';

/* ============================================
   GALLERY — Curated Product Discovery
   Use-case categories + filtering + sorting
   ============================================ */

const CATEGORIES = [
  {
    key: 'kitchen-dining',
    title: 'Kitchen & Dining',
    description: 'Cooking, serving, and gathering around the table.',
    filter: (p) => p.category === 'kitchen' || p.category === 'dining',
  },
  {
    key: 'coffee-tea',
    title: 'Coffee & Tea',
    description: 'Stations, caddies, and accessories for the daily ritual.',
    filter: (p) => p.subcategory === 'coffee-tea-station' || p.subcategory === 'pantry-organization' || p.id === 'tea-caddy',
  },
  {
    key: 'storage-organization',
    title: 'Storage & Organization',
    description: 'Shelves, caddies, and organisers for every room.',
    filter: (p) => p.subcategory === 'storage-organization' || p.subcategory === 'organizers' || p.subcategory === 'desk-organization' || p.subcategory === 'pantry-organization' || p.subcategory === 'storage-boxes' || p.subcategory === 'pen-holders' || p.subcategory === 'laptop-stands' || p.subcategory === 'document-storage' || p.subcategory === 'office-decor' || p.subcategory === 'accessories' || p.id === 'blanket-ladder' || p.id === 'floating-shelf-set',
  },
  {
    key: 'home-decor',
    title: 'Home Décor',
    description: 'Sculptural objects, vases, and candle holders.',
    filter: (p) => p.subcategory === 'sculptures' || p.subcategory === 'vases' || p.subcategory === 'coffee-table-decor' || p.subcategory === 'candle-holders' || p.subcategory === 'decorative-objects' || p.subcategory === 'shelving-decor' || p.subcategory === 'mirrors' || p.subcategory === 'nightstand-essentials' || p.subcategory === 'jewelry-storage' || p.subcategory === 'decorative-accents' || p.subcategory === 'bedroom-decor',
  },
  {
    key: 'bathroom',
    title: 'Bathroom',
    description: 'Vanity trays, soap dishes, and tumblers.',
    filter: (p) => p.category === 'bathroom',
  },
  {
    key: 'everyday-living',
    title: 'Everyday Living',
    description: 'Planters, outdoor serving, and limited editions.',
    filter: (p) => p.category === 'outdoor' || p.category === 'seasonal',
  },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

const PRICE_RANGES = [
  { value: 'all', label: 'All Prices' },
  { value: '0-5000', label: 'Under ₹5,000' },
  { value: '5000-15000', label: '₹5,000 – ₹15,000' },
  { value: '15000-50000', label: '₹15,000 – ₹50,000' },
  { value: '50000+', label: '₹50,000+' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Handcrafted', label: 'Handcrafted' },
  { value: 'In Stock', label: 'In Stock' },
  { value: 'Limited Edition', label: 'Limited Edition' },
];

const galleryStyles = `
/* ================================================================
   GALLERY — Curated Product Discovery
   ================================================================ */
.gal-page {
  background: var(--bg-primary);
  min-height: 100vh;
}

/* Category Navigation — Compact Pills */
.gal-cat-nav {
  max-width: var(--container);
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md) var(--space-md);
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.gal-cat-pill {
  font-family: var(--font-body);
  font-size: var(--text-caption);
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  background: none;
  border: var(--border-hair);
  border-radius: 100px;
  padding: 0.55em 1.2em;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
  white-space: nowrap;
}
.gal-cat-pill:hover {
  border-color: var(--bronze);
  color: var(--text-primary);
}
.gal-cat-pill.is-active {
  background: var(--text-primary);
  border-color: var(--text-primary);
  color: var(--bg-primary);
}
.gal-cat-pill .pill-count {
  font-weight: 400;
  opacity: 0.6;
  margin-left: 0.3em;
}

/* Toolbar — Sort + Filter Toggle */
.gal-toolbar {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md) var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  flex-wrap: wrap;
}
.gal-toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.gal-result-count {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}
.gal-filter-toggle {
  font-family: var(--font-body);
  font-size: var(--text-caption);
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  background: none;
  border: var(--border-hair);
  border-radius: 100px;
  padding: 0.5em 1em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4em;
  transition: all var(--dur-fast) var(--ease);
}
.gal-filter-toggle:hover {
  border-color: var(--bronze);
  color: var(--text-primary);
}
.gal-filter-toggle.is-active {
  border-color: var(--bronze);
  color: var(--bronze);
}
.gal-filter-toggle svg {
  width: 14px;
  height: 14px;
}
.gal-sort-select {
  font-family: var(--font-body);
  font-size: var(--text-caption);
  color: var(--text-primary);
  background: none;
  border: var(--border-hair);
  border-radius: 100px;
  padding: 0.55em 1.8em 0.55em 0.8em;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2361574F' stroke-width='1.2'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.6em center;
  cursor: pointer;
  min-height: 38px;
  transition: border-color var(--dur-fast) var(--ease);
}
.gal-sort-select:hover {
  border-color: var(--bronze);
}

/* Filter Panel */
.gal-filters {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md);
  max-height: 0;
  overflow: hidden;
  transition: max-height 400ms var(--ease), padding 400ms var(--ease);
}
.gal-filters.is-open {
  max-height: 300px;
  padding-bottom: var(--space-md);
}
.gal-filters-inner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: var(--border-subtle);
}
.gal-filter-group h4 {
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
.gal-filter-group label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--text-caption);
  color: var(--text-secondary);
  padding: 0.25rem 0;
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease);
}
.gal-filter-group label:hover {
  color: var(--text-primary);
}
.gal-filter-group input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: var(--bronze);
  cursor: pointer;
}
.gal-filter-group select {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--text-caption);
  color: var(--text-primary);
  background: none;
  border: var(--border-hair);
  padding: 0.5em;
  cursor: pointer;
}
.gal-filter-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}
.gal-filter-clear {
  font-family: var(--font-body);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4em;
  transition: color var(--dur-fast) var(--ease);
}
.gal-filter-clear:hover {
  color: var(--bronze);
}

/* Active Filters Bar */
.gal-active-filters {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md) var(--space-sm);
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.gal-active-filters:empty { display: none; }
.gal-active-tag {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--bronze);
  background: rgba(167, 134, 89, 0.08);
  border: 1px solid rgba(167, 134, 89, 0.2);
  border-radius: 100px;
  padding: 0.3em 0.7em;
  display: flex;
  align-items: center;
  gap: 0.3em;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.gal-active-tag:hover {
  background: rgba(167, 134, 89, 0.15);
}
.gal-active-tag svg {
  width: 10px;
  height: 10px;
}

/* Product Grid */
.gal-grid {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md) var(--space-2xl);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}
.gal-card {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: transform 400ms var(--ease);
}
.gal-card:hover { transform: translateY(-4px); }
.gal-card-img {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--bg-secondary);
  margin-bottom: 0.75rem;
}
.gal-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dur-slow) var(--ease), opacity var(--dur-slow) var(--ease);
}
.gal-card:hover .gal-card-img img { transform: scale(1.04); }
.gal-card-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-caption);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3em 0.6em;
  z-index: 2;
}
.gal-card-badge:empty { display: none; }
.gal-card-wishlist {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
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
.gal-card:hover .gal-card-wishlist { opacity: 1; transform: scale(1); }
.gal-card-wishlist:hover { background: var(--bronze); color: #fff; }
.gal-card-wishlist:active { transform: scale(0.85); }
.gal-card-wishlist svg { width: 14px; height: 14px; }
.gal-card-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-xs);
}
.gal-card-info h3 {
  font-size: var(--text-body);
  font-weight: 500;
  line-height: 1.3;
  transition: color var(--dur-fast) var(--ease);
  max-width: none;
}
.gal-card:hover .gal-card-info h3 { color: var(--bronze); }
.gal-card-price {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* Empty State */
.gal-empty {
  max-width: var(--container);
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-md);
  text-align: center;
}
.gal-empty h2 {
  font-size: var(--text-h2);
  font-weight: 300;
  font-style: italic;
  margin-bottom: 0.5rem;
  max-width: none;
}
.gal-empty p {
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}
.gal-empty-btn {
  font-family: var(--font-body);
  font-size: var(--text-caption);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bg-primary);
  background: var(--text-primary);
  border: none;
  padding: 0.8em 2em;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.gal-empty-btn:hover { background: var(--bronze); }

/* Note */
.gal-note {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md) var(--space-xl);
  text-align: center;
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
}
.gal-note a { color: var(--bronze); border-bottom: 1px solid transparent; transition: border-color var(--dur-fast) var(--ease); }
.gal-note a:hover { border-bottom-color: var(--bronze); }

/* Responsive */
@media (max-width: 860px) {
  .gal-cat-nav { padding-top: var(--space-md); }
  .gal-grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); }
  .gal-filters-inner { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .gal-cat-nav { gap: 0.4rem; padding-top: var(--space-sm); }
  .gal-cat-pill { font-size: 12px; padding: 0.45em 0.9em; }
  .gal-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
  .gal-card-info h3 { font-size: var(--text-caption); }
  .gal-card-wishlist { width: 36px; height: 36px; }
  .gal-filters-inner { grid-template-columns: 1fr; }
  .gal-toolbar { flex-direction: column; align-items: stretch; }
  .gal-toolbar-left { justify-content: space-between; }
}
@media (max-width: 430px) {
  .gal-grid { gap: var(--space-xs); }
  .gal-cat-nav { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .gal-cat-nav::-webkit-scrollbar { display: none; }
}
`;

export default function GalleryPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [availability, setAvailability] = useState('all');

  useEffect(() => {
    document.title = 'Gallery — Teakle';
    if (typeof window !== 'undefined' && window.TEAKLE_PRODUCTS) {
      setProducts(window.TEAKLE_PRODUCTS);
    }
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.key] = products.filter(cat.filter).length;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== 'all') {
      const cat = CATEGORIES.find((c) => c.key === activeCategory);
      if (cat) result = result.filter(cat.filter);
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      if (max) {
        result = result.filter((p) => p.price >= min && p.price < max);
      } else {
        result = result.filter((p) => p.price >= 50000);
      }
    }

    if (availability !== 'all') {
      result = result.filter((p) => p.availability === availability);
    }

    switch (sortBy) {
      case 'newest':
        result.reverse();
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, activeCategory, sortBy, priceRange, availability]);

  const hasActiveFilters = priceRange !== 'all' || availability !== 'all';

  const clearFilters = useCallback(() => {
    setPriceRange('all');
    setAvailability('all');
  }, []);

  const removeFilter = useCallback((type) => {
    if (type === 'price') setPriceRange('all');
    if (type === 'availability') setAvailability('all');
  }, []);

  const handleWishlist = useCallback((e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    const t = window.Teakle;
    if (t && t.requireAuth && !t.requireAuth()) return;
    if (t && t.toggleWishlist) {
      t.toggleWishlist({
        id: product.id,
        name: product.name,
        price: product.priceFormatted,
        image: product.images[0],
      });
    }
  }, []);

  return (
    <>
      <style>{galleryStyles}</style>

      <main className="gal-page">
        <section className="page-hero">
          <img src="https://images.pexels.com/photos/6474475/pexels-photo-6474475.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="A curated collection of handcrafted teak serving pieces on a wooden table." />
          <div className="page-hero-content">
            <span className="eyebrow eyebrow-light">Gallery</span>
            <h1>Every piece, handcrafted from solid timber.</h1>
            <p>Browse by use case &mdash; kitchen, coffee, storage, d&eacute;cor, bathroom, and everyday living.</p>
          </div>
        </section>

        <nav className="gal-cat-nav" aria-label="Product categories">
          <button
            className={`gal-cat-pill${activeCategory === 'all' ? ' is-active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All<span className="pill-count">{categoryCounts.all}</span>
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`gal-cat-pill${activeCategory === cat.key ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.title}<span className="pill-count">{categoryCounts[cat.key]}</span>
            </button>
          ))}
        </nav>

        <div className="gal-toolbar">
          <div className="gal-toolbar-left">
            <span className="gal-result-count">
              {filteredProducts.length} piece{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            <button
              className={`gal-filter-toggle${hasActiveFilters ? ' is-active' : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18M7 12h10M10 18h4" />
              </svg>
              Filters
            </button>
          </div>
          <select
            className="gal-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={`gal-filters${filtersOpen ? ' is-open' : ''}`}>
          <div className="gal-filters-inner">
            <div className="gal-filter-group">
              <h4>Price Range</h4>
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                {PRICE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="gal-filter-group">
              <h4>Availability</h4>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <label key={opt.value}>
                  <input
                    type="radio"
                    name="gal-availability"
                    checked={availability === opt.value}
                    onChange={() => setAvailability(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div className="gal-filter-group">
              <h4>Quick Actions</h4>
              <div className="gal-filter-actions">
                <button className="gal-filter-clear" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="gal-active-filters">
            {priceRange !== 'all' && (
              <button className="gal-active-tag" onClick={() => removeFilter('price')}>
                {PRICE_RANGES.find((r) => r.value === priceRange)?.label}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {availability !== 'all' && (
              <button className="gal-active-tag" onClick={() => removeFilter('availability')}>
                {availability}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className="gal-grid">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`} className="gal-card">
                <div className="gal-card-img">
                  <img src={product.images[0]} alt={product.name} loading="lazy" />
                  <span className="gal-card-badge">{product.availability}</span>
                  <button
                    className="gal-card-wishlist"
                    aria-label={`Add ${product.name} to wishlist`}
                    onClick={(e) => handleWishlist(e, product)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                </div>
                <div className="gal-card-info">
                  <h3>{product.name}</h3>
                  <span className="gal-card-price">{product.priceFormatted}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="gal-empty">
            <h2>No pieces found</h2>
            <p>Try adjusting your filters or browse a different category.</p>
            <button className="gal-empty-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        <div className="gal-note">
          <p>
            Each piece is handcrafted to order. Lead times vary by complexity. For
            enquiries, visit our{' '}
            <Link href="/contact">contact page</Link> or{' '}
            <Link href="/custom">request a custom piece</Link>.
          </p>
        </div>
      </main>
    </>
  );
}

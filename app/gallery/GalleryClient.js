'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';

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
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

const PRICE_bounds = { min: 3500, max: 185000 };

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
  overflow-x: clip;
  --gal-max: min(1520px, 100% - 3rem);
}

/* Category Navigation — Compact Pills */
.gal-cat-nav {
  max-width: var(--gal-max);
  margin: 0 auto;
  padding: var(--space-xl) 0 var(--space-md);
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  border-bottom: var(--border-subtle);
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
  transition: border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
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
  max-width: var(--gal-max);
  margin: 0 auto;
  padding: var(--space-md) 0 var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  flex-wrap: wrap;
  border-bottom: var(--border-subtle);
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
  transition: border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
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
.gal-cat-pill:focus-visible,
.gal-filter-toggle:focus-visible,
.gal-sort-select:focus-visible,
.gal-filter-clear:focus-visible,
.gal-empty-btn:focus-visible,
.gal-search-reset-btn:focus-visible,
.gal-active-tag:focus-visible {
  outline: 2px solid var(--bronze);
  outline-offset: 2px;
}

/* Filter Panel */
.gal-filters {
  max-width: var(--gal-max);
  margin: 0 auto;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 400ms var(--ease), padding 400ms var(--ease);
}
.gal-filters.is-open {
  max-height: 720px;
  padding-bottom: var(--space-md);
  border-bottom: var(--border-subtle);
}
.gal-filters-inner {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
.gal-filter-price { grid-column: 1 / -1; }
.gal-price-display {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-caption);
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.6rem;
}
.gal-price-sliders {
  position: relative;
  height: 36px;
  display: flex;
  align-items: center;
}
.gal-price-sliders input[type="range"] {
  position: absolute;
  width: 100%;
  height: 36px;
  background: none;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;
}
.gal-price-sliders input[type="range"]::-webkit-slider-runnable-track {
  height: 3px;
  background: var(--stone);
  border-radius: 2px;
}
.gal-price-sliders input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-primary);
  border: 2px solid var(--bg-primary);
  cursor: pointer;
  pointer-events: auto;
  margin-top: -7.5px;
  transition: box-shadow var(--dur-fast) var(--ease);
}
.gal-price-sliders input[type="range"]::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 4px rgba(167, 134, 89, 0.15);
}
.gal-price-sliders input[type="range"]::-moz-range-track {
  height: 3px;
  background: var(--stone);
  border-radius: 2px;
}
.gal-price-sliders input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-primary);
  border: 2px solid var(--bg-primary);
  cursor: pointer;
  pointer-events: auto;
}
.gal-price-sliders input[type="range"]::-moz-range-thumb:hover {
  box-shadow: 0 0 0 4px rgba(167, 134, 89, 0.15);
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
  max-width: var(--gal-max);
  margin: 0 auto;
  padding: var(--space-sm) 0 0;
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
  transition: background var(--dur-fast) var(--ease);
}
.gal-active-tag:hover {
  background: rgba(167, 134, 89, 0.15);
}
.gal-active-tag svg {
  width: 10px;
  height: 10px;
}

/* Product Collection — curated editorial grid.
   Wide full-bleed measure, three deliberate columns on desktop,
   generous breathing room. No card chrome: imagery leads,
   name carries hierarchy, price stays quiet. */
.gal-grid {
  max-width: var(--gal-max);
  margin: 0 auto;
  padding: var(--space-xl) 0 var(--space-2xl);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(2rem, 3.5vw, 3.5rem) clamp(1.5rem, 2.5vw, 2.5rem);
}
/* Gallery-scoped object presentation: image dominant, name + price only.
   (No material label — intentionally omitted on Gallery.) */
.gal-grid .pcard {
  min-width: 0;
}
.gal-grid .pcard-img {
  border: none;
  box-shadow: none;
  margin-bottom: 1rem;
}
.gal-grid .pcard-info {
  align-items: baseline;
  gap: var(--space-sm);
}
.gal-grid .pcard-info h3 {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}
.gal-grid .pcard-price {
  font-size: 0.875rem;
  color: var(--text-secondary);
  letter-spacing: 0.01em;
}

/* Empty State */
.gal-empty {
  max-width: var(--gal-max);
  margin: 0 auto;
  padding: var(--space-2xl) 0;
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
.gal-empty-actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: var(--space-sm); }

/* Search Banner */
.gal-search-banner {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
  max-width: var(--gal-max); margin: var(--space-md) auto 0;
  padding: var(--space-md);
  background: rgba(167,134,89,0.06);
  border: 1px solid rgba(167,134,89,0.15);
  border-radius: var(--radius-md);
}
.gal-search-banner-inner { display: flex; align-items: baseline; gap: 0.4rem; flex-wrap: wrap; }
.gal-search-banner-label { font-size: var(--text-caption); color: var(--text-secondary); }
.gal-search-banner-query { font-size: var(--text-body); font-weight: 500; color: var(--text-primary); }
.gal-search-banner-count { font-size: var(--text-caption); color: var(--text-secondary); margin-left: 0.5rem; }
.gal-search-reset-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: var(--text-caption); font-weight: 500; letter-spacing: 0.02em;
  color: var(--bg-primary); background: var(--text-primary);
  border: none; border-radius: var(--radius-sm);
  padding: 0.45em 1em;
  text-decoration: none; cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.gal-search-reset-btn svg { flex-shrink: 0; }
.gal-search-reset-btn:hover { background: var(--bronze); }

/* Note */
.gal-note {
  max-width: var(--gal-max);
  margin: 0 auto;
  padding: 0 0 var(--space-xl);
  text-align: center;
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
}
.gal-note a { color: var(--bronze); border-bottom: 1px solid transparent; transition: border-color var(--dur-fast) var(--ease); }
.gal-note a:hover { border-bottom-color: var(--bronze); }

/* Responsive — mobile is recomposed, not shrunk.
   Two generous columns keep imagery large and names/prices readable. */
@media (max-width: 1024px) {
  .gal-grid { gap: var(--space-lg) var(--space-md); }
}
@media (max-width: 860px) {
  .gal-page { --gal-max: min(1520px, 100% - 2rem); }
  .gal-cat-nav { padding-top: var(--space-md); }
  .gal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-lg) var(--space-md); }
  .gal-grid .pcard-info h3 { font-size: 0.9375rem; }
  .gal-grid .pcard-price { font-size: 0.8125rem; }
  .gal-filters-inner { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .gal-page { --gal-max: min(1520px, 100% - 1.5rem); }
  .gal-cat-nav { gap: 0.4rem; padding-top: var(--space-md); }
  .gal-cat-pill { font-size: 12px; padding: 0.55em 1em; min-height: 40px; }
  .gal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-md) var(--space-sm); padding-top: var(--space-lg); }
  .gal-grid .pcard-img { margin-bottom: 0.75rem; }
  .gal-grid .pcard-info h3 { font-size: 0.875rem; line-height: 1.35; }
  .gal-grid .pcard-price { font-size: 0.8125rem; }
  .gal-filters-inner { grid-template-columns: 1fr; }
  .gal-toolbar { flex-direction: column; align-items: stretch; }
  .gal-toolbar-left { justify-content: space-between; }
  .gal-search-banner { padding: var(--space-xs) var(--space-sm); }
}
@media (max-width: 430px) {
  .gal-grid { gap: var(--space-md) var(--space-sm); }
  .gal-cat-nav { max-width: none; overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-left: 0.75rem; padding-right: 0.75rem; margin-left: -0.75rem; margin-right: -0.75rem; border-bottom: none; }
  .gal-cat-nav::-webkit-scrollbar { display: none; }
  .gal-cat-pill { flex-shrink: 0; }
}

/* Filter drawer chrome — shared across breakpoints (positioning is mobile-only below) */
.gal-filter-backdrop { display: none; }
.gal-filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: var(--border-subtle);
}
.gal-filter-head h3 {
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-primary);
  margin: 0;
}
.gal-filter-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}
.gal-filter-close:hover { color: var(--text-primary); }
.gal-filter-close:focus-visible { outline: 2px solid var(--bronze); outline-offset: 2px; }
.gal-price-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}
.gal-price-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-primary);
}
.gal-price-field input {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--text-primary);
  background: none;
  border: var(--border-hair);
  border-radius: var(--radius-sm);
  padding: 0.65em 0.75em;
  min-height: 48px;
  outline: none;
  transition: border-color var(--dur-fast) var(--ease);
}
.gal-price-field input:focus { border-color: var(--bronze); }
.gal-filter-apply {
  font-family: var(--font-body);
  font-size: var(--text-caption);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bg-primary);
  background: var(--text-primary);
  border: 1px solid var(--text-primary);
  min-height: 48px;
  padding: 0.4em 1.5em;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.gal-filter-apply:hover { background: var(--bronze); border-color: var(--bronze); }
.gal-filter-apply:focus-visible,
.gal-filter-clear:focus-visible { outline: 2px solid var(--bronze); outline-offset: 2px; }

/* Filter drawer (mobile) — same sidebar pattern as the nav drawer:
   controlled-width panel, right side, own backdrop + close control.
   Desktop keeps the inline expanding panel above. */
@media (max-width: 860px) {
  .gal-filter-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(43,34,27,0.45);
    z-index: 410;
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--dur-slow) var(--ease), visibility var(--dur-slow) var(--ease);
    pointer-events: none;
  }
  .gal-filter-backdrop.is-open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  .gal-filters {
    position: fixed;
    top: 0; right: 0;
    height: 100dvh;
    height: 100vh;
    width: clamp(280px, 75vw, 340px);
    max-width: 100%;
    background: var(--bg-primary);
    z-index: 420;
    margin: 0;
    padding: 0;
    max-height: none;
    border-bottom: none;
    box-shadow: -4px 0 32px rgba(43,34,27,0.12);
    transform: translateX(100%);
    visibility: hidden;
    transition: transform var(--dur-normal) var(--ease-luxury), visibility 0s linear 300ms;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
  }
  .gal-filters.is-open {
    transform: translateX(0);
    visibility: visible;
    transition: transform var(--dur-normal) var(--ease-luxury), visibility 0s;
    max-height: none;
    padding-bottom: 0;
    border-bottom: none;
  }
  .gal-filter-head {
    padding: var(--space-md) var(--space-lg);
    position: sticky;
    top: 0;
    background: var(--bg-primary);
    z-index: 1;
  }
  .gal-filter-close {
    margin-right: calc(var(--space-lg) * -1 + 0.5rem);
  }
  .gal-filters-inner {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    padding: var(--space-lg);
    border-bottom: none;
    flex: 1;
  }
  .gal-filter-actions {
    position: sticky;
    bottom: 0;
    background: var(--bg-primary);
    border-top: 1px solid rgba(43,34,27,0.10);
    padding: var(--space-md) var(--space-lg);
    padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0px));
    margin-top: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-sm);
  }
  .gal-filter-apply:hover { background: var(--bronze); border-color: var(--bronze); }
  .gal-filter-clear {
    border: var(--border-hair);
    min-height: 48px;
    padding: 0.4em;
  }
}
`;

export default function GalleryClient({ products: serverProducts }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSearch = searchParams.get('search') || '';
  const urlAvailability = searchParams.get('availability') || 'all';
  const [products, setProducts] = useState(serverProducts || []);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(PRICE_bounds.min);
  const [priceMax, setPriceMax] = useState(PRICE_bounds.max);
  const [availability, setAvailability] = useState(urlAvailability);
  /* Drawer drafts — edited inside the filter drawer, committed on Apply. */
  const [draftMin, setDraftMin] = useState(PRICE_bounds.min);
  const [draftMax, setDraftMax] = useState(PRICE_bounds.max);
  const [draftAvail, setDraftAvail] = useState(urlAvailability);
  const filterCloseRef = useRef(null);

  function clampPrice(v, fallback) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(PRICE_bounds.max, Math.max(PRICE_bounds.min, Math.round(n)));
  }

  const openFilters = useCallback(() => {
    setDraftMin(priceMin);
    setDraftMax(priceMax);
    setDraftAvail(availability);
    setFiltersOpen(true);
  }, [priceMin, priceMax, availability]);

  const closeFilters = useCallback(() => {
    setFiltersOpen(false);
  }, []);

  const applyFilters = useCallback(() => {
    let lo = clampPrice(draftMin, PRICE_bounds.min);
    let hi = clampPrice(draftMax, PRICE_bounds.max);
    if (lo > hi) { const t = lo; lo = hi; hi = t; }
    setPriceMin(lo);
    setPriceMax(hi);
    setDraftMin(lo);
    setDraftMax(hi);
    setAvailability(draftAvail);
    setFiltersOpen(false);
  }, [draftMin, draftMax, draftAvail]);

  /* Escape closes the drawer; body scroll locks while it is open. */
  useEffect(() => {
    if (!filtersOpen) return;
    filterCloseRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === 'Escape') setFiltersOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [filtersOpen]);

  const searchQuery = urlSearch.trim();

  useEffect(() => {
    document.title = searchQuery ? `Search: ${searchQuery} — Teakle` : 'Gallery — Teakle';
    if (typeof window !== 'undefined' && window.TEAKLE_PRODUCTS && (!serverProducts || !serverProducts.length)) {
      /* Standard catalogue only — the Atelier hero is excluded by design. */
      setProducts(window.TEAKLE_PRODUCTS.filter((p) => !p.isHero));
    }
  }, [searchQuery, serverProducts]);

  useEffect(() => {
    const av = searchParams.get('availability');
    if (av && AVAILABILITY_OPTIONS.some((o) => o.value === av)) {
      setAvailability(av);
    } else if (!av) {
      setAvailability('all');
    }
  }, [searchParams]);

  const categoryCounts = useMemo(() => {
    /* Standard catalogue only — the Atelier hero is excluded by design. */
    let base = [...products].filter((p) => !p.isHero);
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      base = base.filter((p) => {
        const haystack = [
          p.name, p.material, p.category, p.categoryName,
          p.subcategory, p.subcategoryName, p.shortDescription,
          p.description, p.availability,
          ...(Array.isArray(p.tags) ? p.tags : []),
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(lower);
      });
    }
    const counts = { all: base.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.key] = base.filter(cat.filter).length;
    });
    return counts;
  }, [products, searchQuery]);

  const filteredProducts = useMemo(() => {
    /* Standard catalogue only — the Atelier hero is excluded by design. */
    let result = [...products].filter((p) => !p.isHero);

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const haystack = [
          p.name, p.material, p.category, p.categoryName,
          p.subcategory, p.subcategoryName, p.shortDescription,
          p.description, p.availability,
          ...(Array.isArray(p.tags) ? p.tags : []),
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(lower);
      });
    }

    if (activeCategory !== 'all') {
      const cat = CATEGORIES.find((c) => c.key === activeCategory);
      if (cat) result = result.filter(cat.filter);
    }

    if (priceMin > PRICE_bounds.min || priceMax < PRICE_bounds.max) {
      result = result.filter((p) => p.price >= priceMin && p.price <= priceMax);
    }

    if (availability !== 'all') {
      result = result.filter((p) => p.availability === availability);
    }

    switch (sortBy) {
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
  }, [products, activeCategory, sortBy, priceMin, priceMax, availability, searchQuery]);

  const hasActiveFilters = priceMin > PRICE_bounds.min || priceMax < PRICE_bounds.max || availability !== 'all';

  const clearFilters = useCallback(() => {
    setActiveCategory('all');
    setPriceMin(PRICE_bounds.min);
    setPriceMax(PRICE_bounds.max);
    setDraftMin(PRICE_bounds.min);
    setDraftMax(PRICE_bounds.max);
    setAvailability('all');
    setDraftAvail('all');
    setSortBy('featured');
    router.push('/gallery');
  }, [router]);

  const removeFilter = useCallback((type) => {
    if (type === 'price') {
      setPriceMin(PRICE_bounds.min);
      setPriceMax(PRICE_bounds.max);
      setDraftMin(PRICE_bounds.min);
      setDraftMax(PRICE_bounds.max);
    }
    if (type === 'availability') {
      setAvailability('all');
      setDraftAvail('all');
    }
  }, []);

  return (
    <>
      <style>{galleryStyles}</style>

      <div className="gal-page">
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
            aria-pressed={activeCategory === 'all'}
          >
            All<span className="pill-count">{categoryCounts.all}</span>
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`gal-cat-pill${activeCategory === cat.key ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
              aria-pressed={activeCategory === cat.key}
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
              onClick={() => (filtersOpen ? closeFilters() : openFilters())}
              aria-expanded={filtersOpen}
              aria-controls="gal-filter-drawer"
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

        <div className={`gal-filter-backdrop${filtersOpen ? ' is-open' : ''}`} onClick={closeFilters} aria-hidden="true"></div>
        <aside
          id="gal-filter-drawer"
          className={`gal-filters${filtersOpen ? ' is-open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
          aria-hidden={!filtersOpen}
          inert={!filtersOpen}
        >
          <div className="gal-filter-head">
            <h3>Filters</h3>
            <button ref={filterCloseRef} type="button" className="gal-filter-close" onClick={closeFilters} aria-label="Close filters">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="gal-filters-inner">
            <div className="gal-filter-group gal-filter-price">
              <h4>Price Range</h4>
              <div className="gal-price-inputs">
                <label className="gal-price-field">
                  From ₹
                  <input
                    type="number"
                    inputMode="numeric"
                    min={PRICE_bounds.min}
                    max={PRICE_bounds.max}
                    step="500"
                    value={draftMin}
                    onChange={(e) => setDraftMin(e.target.value === '' ? '' : Number(e.target.value))}
                    aria-label="Minimum price in rupees"
                  />
                </label>
                <label className="gal-price-field">
                  To ₹
                  <input
                    type="number"
                    inputMode="numeric"
                    min={PRICE_bounds.min}
                    max={PRICE_bounds.max}
                    step="500"
                    value={draftMax}
                    onChange={(e) => setDraftMax(e.target.value === '' ? '' : Number(e.target.value))}
                    aria-label="Maximum price in rupees"
                  />
                </label>
              </div>
              <div className="gal-price-display">
                <span>₹{clampPrice(draftMin, PRICE_bounds.min).toLocaleString('en-IN')}</span>
                <span>₹{clampPrice(draftMax, PRICE_bounds.max).toLocaleString('en-IN')}</span>
              </div>
              <div className="gal-price-sliders">
                <input
                  type="range"
                  min={PRICE_bounds.min}
                  max={PRICE_bounds.max}
                  step="500"
                  value={clampPrice(draftMin, PRICE_bounds.min)}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v <= clampPrice(draftMax, PRICE_bounds.max)) setDraftMin(v);
                  }}
                  aria-label="Minimum price"
                />
                <input
                  type="range"
                  min={PRICE_bounds.min}
                  max={PRICE_bounds.max}
                  step="500"
                  value={clampPrice(draftMax, PRICE_bounds.max)}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= clampPrice(draftMin, PRICE_bounds.min)) setDraftMax(v);
                  }}
                  aria-label="Maximum price"
                />
              </div>
            </div>
            <div className="gal-filter-group">
              <h4>Availability</h4>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <label key={opt.value}>
                  <input
                    type="radio"
                    name="gal-availability"
                    checked={draftAvail === opt.value}
                    onChange={() => setDraftAvail(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div className="gal-filter-actions">
            <button type="button" className="gal-filter-apply" onClick={applyFilters}>
              Apply
            </button>
            <button type="button" className="gal-filter-clear" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        </aside>

        {hasActiveFilters && !searchQuery && (
          <div className="gal-search-banner">
            <div className="gal-search-banner-inner">
              <span className="gal-search-banner-label">Filtered results</span>
              <span className="gal-search-banner-count">{filteredProducts.length} piece{filteredProducts.length !== 1 ? 's' : ''}</span>
            </div>
            <button className="gal-search-reset-btn" onClick={clearFilters}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M18 6L6 18M6 6l12 12"/></svg>
              Show all products
            </button>
          </div>
        )}

        {hasActiveFilters && (
          <div className="gal-active-filters">
            {(priceMin > PRICE_bounds.min || priceMax < PRICE_bounds.max) && (
              <button className="gal-active-tag" onClick={() => removeFilter('price')}>
                ₹{priceMin.toLocaleString('en-IN')} – ₹{priceMax.toLocaleString('en-IN')}
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

        {searchQuery && (
          <div className="gal-search-banner">
            <div className="gal-search-banner-inner">
              <span className="gal-search-banner-label">Search results for</span>
              <span className="gal-search-banner-query">&ldquo;{searchQuery}&rdquo;</span>
              <span className="gal-search-banner-count">{filteredProducts.length} piece{filteredProducts.length !== 1 ? 's' : ''}</span>
            </div>
            <button className="gal-search-reset-btn" onClick={() => router.push('/gallery')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M18 6L6 18M6 6l12 12"/></svg>
              Show all products
            </button>
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className="gal-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="gal-empty">
            <h2>{searchQuery ? 'No pieces matched your search' : 'No pieces found'}</h2>
            <p>{searchQuery
              ? `We couldn't find any pieces matching "${searchQuery}". Try a different search or browse the gallery.`
              : 'Try adjusting your filters or browse a different category.'
            }</p>
            <div className="gal-empty-actions">
              {searchQuery && <button className="gal-empty-btn" onClick={() => router.push('/gallery')}>Browse Gallery</button>}
              <button className="gal-empty-btn" onClick={clearFilters}>
                {searchQuery ? 'Clear search & filters' : 'Clear Filters'}
              </button>
            </div>
          </div>
        )}

        <div className="gal-note">
          <p>
            Most pieces are in stock and ship within a week. For bespoke
            creations, visit our{' '}
            <Link href="/custom">commission page</Link>.
          </p>
        </div>
      </div>
    </>
  );
}

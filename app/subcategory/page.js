'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';

/* ============================================
   SUBCATEGORY — Product Listing with Filters
   ============================================ */

const CATS = {
  kitchen: {
    name: 'Kitchen',
    image: 'https://images.pexels.com/photos/4805236/pexels-photo-4805236.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: 'Solid teak boards, bowls, and utensil holders for daily kitchen use.',
    subs: [
      { key: 'countertop-essentials', name: 'Countertop Essentials', image: 'https://images.pexels.com/photos/6996084/pexels-photo-6996084.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'coffee-tea-station', name: 'Coffee & Tea Station', image: 'https://images.pexels.com/photos/5807555/pexels-photo-5807555.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'cooking-essentials', name: 'Cooking Essentials', image: 'https://images.pexels.com/photos/5807560/pexels-photo-5807560.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'dining-serving', name: 'Dining & Serving', image: 'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'storage-organization', name: 'Storage & Organization', image: 'https://images.pexels.com/photos/6474478/pexels-photo-6474478.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'kitchen-decor', name: 'Kitchen Decor', image: 'https://images.pexels.com/photos/4750280/pexels-photo-4750280.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'baking-essentials', name: 'Baking Essentials', image: 'https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'pantry-organization', name: 'Pantry Organization', image: 'https://images.pexels.com/photos/6996084/pexels-photo-6996084.jpeg?auto=compress&cs=tinysrgb&w=900' },
    ],
  },
  dining: {
    name: 'Dining',
    image: 'https://images.pexels.com/photos/6474475/pexels-photo-6474475.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: 'Serving boards, trays, and dining centrepieces for every occasion.',
    subs: [
      { key: 'serving-boards', name: 'Serving Boards', image: 'https://images.pexels.com/photos/4750280/pexels-photo-4750280.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'trays', name: 'Trays', image: 'https://images.pexels.com/photos/6996090/pexels-photo-6996090.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'bowls', name: 'Bowls', image: 'https://images.pexels.com/photos/6474502/pexels-photo-6474502.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'cutlery', name: 'Cutlery', image: 'https://images.pexels.com/photos/6474475/pexels-photo-6474475.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'drinkware-accessories', name: 'Drinkware Accessories', image: 'https://images.pexels.com/photos/6996090/pexels-photo-6996090.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'table-centerpieces', name: 'Table Centerpieces', image: 'https://images.pexels.com/photos/6474502/pexels-photo-6474502.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'dining-decor', name: 'Dining Decor', image: 'https://images.pexels.com/photos/4750280/pexels-photo-4750280.jpeg?auto=compress&cs=tinysrgb&w=900' },
    ],
  },
  living: {
    name: 'Living Room',
    image: 'https://images.pexels.com/photos/5858085/pexels-photo-5858085.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: 'Sculptural objects, vases, and coffee table pieces for your living space.',
    subs: [
      { key: 'sculptures', name: 'Sculptures', image: 'https://images.pexels.com/photos/6044820/pexels-photo-6044820.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'vases', name: 'Vases', image: 'https://images.pexels.com/photos/6044816/pexels-photo-6044816.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'coffee-table-decor', name: 'Coffee Table Decor', image: 'https://images.pexels.com/photos/6044814/pexels-photo-6044814.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'storage-boxes', name: 'Storage Boxes', image: 'https://images.pexels.com/photos/6044810/pexels-photo-6044810.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'decorative-objects', name: 'Decorative Objects', image: 'https://images.pexels.com/photos/6044820/pexels-photo-6044820.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'shelving-decor', name: 'Shelving Decor', image: 'https://images.pexels.com/photos/6044814/pexels-photo-6044814.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'candle-holders', name: 'Candle Holders', image: 'https://images.pexels.com/photos/6044816/pexels-photo-6044816.jpeg?auto=compress&cs=tinysrgb&w=900' },
    ],
  },
  bedroom: {
    name: 'Bedroom',
    image: 'https://images.pexels.com/photos/6045088/pexels-photo-6045088.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: 'Nightstand essentials, organisers, and mirrors for private spaces.',
    subs: [
      { key: 'nightstand-essentials', name: 'Nightstand Essentials', image: 'https://images.pexels.com/photos/6045086/pexels-photo-6045086.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'organizers', name: 'Organizers', image: 'https://images.pexels.com/photos/6045082/pexels-photo-6045082.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'mirrors', name: 'Mirrors', image: 'https://images.pexels.com/photos/6045080/pexels-photo-6045080.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'jewelry-storage', name: 'Jewelry Storage', image: 'https://images.pexels.com/photos/6045082/pexels-photo-6045082.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'decorative-accents', name: 'Decorative Accents', image: 'https://images.pexels.com/photos/6045088/pexels-photo-6045088.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'bedroom-decor', name: 'Bedroom Decor', image: 'https://images.pexels.com/photos/6045086/pexels-photo-6045086.jpeg?auto=compress&cs=tinysrgb&w=900' },
    ],
  },
  office: {
    name: 'Office',
    image: 'https://images.pexels.com/photos/7979604/pexels-photo-7979604.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: 'Desk organisers, pen holders, and laptop stands for your workspace.',
    subs: [
      { key: 'desk-organization', name: 'Desk Organization', image: 'https://images.pexels.com/photos/7979602/pexels-photo-7979602.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'pen-holders', name: 'Pen Holders', image: 'https://images.pexels.com/photos/7979600/pexels-photo-7979600.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'laptop-stands', name: 'Laptop Stands', image: 'https://images.pexels.com/photos/7979598/pexels-photo-7979598.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'document-storage', name: 'Document Storage', image: 'https://images.pexels.com/photos/7979604/pexels-photo-7979604.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'office-decor', name: 'Office Decor', image: 'https://images.pexels.com/photos/7979602/pexels-photo-7979602.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'accessories', name: 'Accessories', image: 'https://images.pexels.com/photos/7979600/pexels-photo-7979600.jpeg?auto=compress&cs=tinysrgb&w=900' },
    ],
  },
  bathroom: {
    name: 'Bathroom',
    image: 'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: 'Vanity organisers, soap dispensers, and toothbrush holders.',
    subs: [
      { key: 'vanity-organizers', name: 'Vanity Organizers', image: 'https://images.pexels.com/photos/8005395/pexels-photo-8005395.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'soap-dispensers', name: 'Soap Dispensers', image: 'https://images.pexels.com/photos/8005393/pexels-photo-8005393.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'toothbrush-holders', name: 'Toothbrush Holders', image: 'https://images.pexels.com/photos/7055292/pexels-photo-7055292.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'storage', name: 'Storage', image: 'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'bathroom-decor', name: 'Bathroom Decor', image: 'https://images.pexels.com/photos/8005395/pexels-photo-8005395.jpeg?auto=compress&cs=tinysrgb&w=900' },
    ],
  },
  outdoor: {
    name: 'Outdoor',
    image: 'https://images.pexels.com/photos/6480210/pexels-photo-6480210.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: 'Planters, garden decor, and outdoor serving pieces.',
    subs: [
      { key: 'planters', name: 'Planters', image: 'https://images.pexels.com/photos/6480208/pexels-photo-6480208.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'garden-decor', name: 'Garden Decor', image: 'https://images.pexels.com/photos/6480206/pexels-photo-6480206.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'outdoor-serving', name: 'Outdoor Serving', image: 'https://images.pexels.com/photos/6480204/pexels-photo-6480204.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'patio-accessories', name: 'Patio Accessories', image: 'https://images.pexels.com/photos/6480210/pexels-photo-6480210.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'storage', name: 'Storage', image: 'https://images.pexels.com/photos/6480208/pexels-photo-6480208.jpeg?auto=compress&cs=tinysrgb&w=900' },
    ],
  },
  seasonal: {
    name: 'Seasonal',
    image: 'https://images.pexels.com/photos/6474475/pexels-photo-6474475.jpeg?auto=compress&cs=tinysrgb&w=1600',
    description: 'Festive decor, collectors pieces, and limited edition collections.',
    subs: [
      { key: 'festive-decor', name: 'Festive Decor', image: 'https://images.pexels.com/photos/6474475/pexels-photo-6474475.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'collectors-series', name: "Collectors Series", image: 'https://images.pexels.com/photos/6474502/pexels-photo-6474502.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'limited-editions', name: 'Limited Editions', image: 'https://images.pexels.com/photos/6044820/pexels-photo-6044820.jpeg?auto=compress&cs=tinysrgb&w=900' },
      { key: 'gift-collections', name: 'Gift Collections', image: 'https://images.pexels.com/photos/6996090/pexels-photo-6996090.jpeg?auto=compress&cs=tinysrgb&w=900' },
    ],
  },
};

const subStyles = `
/* ================================================================
   SUBCATEGORY — Product Listing
   ================================================================ */
.sub-hero {
  position: relative;
  height: 48vh;
  min-height: 340px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  background: var(--walnut);
}
.sub-hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 120%;
  object-fit: cover;
  opacity: 0.8;
  animation: subZoom 16s var(--ease) forwards;
}
@keyframes subZoom {
  from { transform: scale(1.08); }
  to { transform: scale(1); }
}
.sub-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(51,38,29,0.05) 0%, rgba(51,38,29,0.5) 60%, rgba(51,38,29,0.82) 100%);
  z-index: 1;
}
.sub-hero-content {
  position: relative;
  z-index: 2;
  padding: 0 var(--space-md) var(--space-xl);
  max-width: 700px;
  margin-left: 4vw;
}
.sub-hero-content .eyebrow { color: var(--stone); margin-bottom: var(--space-sm); }
.sub-hero-content h1 {
  color: var(--bg-primary);
  font-size: clamp(1.8rem, 4.5vw, var(--text-h1));
  font-weight: 300;
  font-style: italic;
  line-height: 1.1;
  margin-bottom: var(--space-sm);
}
.sub-hero-content p {
  color: var(--stone);
  font-size: var(--text-body);
  line-height: var(--lh-relaxed);
}

/* Breadcrumb */
.sub-breadcrumb {
  padding: var(--space-lg) 0 0;
  font-size: var(--text-caption);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}
.sub-breadcrumb a { color: var(--text-secondary); text-decoration: none; transition: color var(--dur-fast) var(--ease); }
.sub-breadcrumb a:hover { color: var(--bronze); }
.sub-breadcrumb span { margin: 0 0.5em; }
.sub-breadcrumb .bc-current { color: var(--text-primary); }

/* Toolbar */
.sub-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: var(--border-subtle);
  margin-bottom: var(--space-md);
  gap: var(--space-sm);
  flex-wrap: wrap;
}
.sub-toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}
.sub-toolbar-count {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.sub-toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.sub-filter-btn {
  display: flex;
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
  transition: border-color var(--dur-fast) var(--ease);
}
.sub-filter-btn:hover { border-color: var(--bronze); }
.sub-filter-btn.is-active { border-color: var(--bronze); color: var(--bronze); }
.sub-sort-select {
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
.sub-sort-select:hover { border-color: var(--bronze); }

/* Filter Panel */
.sub-filters {
  display: none;
  padding: var(--space-md) 0;
  border-bottom: var(--border-subtle);
  margin-bottom: var(--space-md);
}
.sub-filters.is-open { display: block; }
.sub-filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}
.sub-filter-group h4 {
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}
.sub-filter-group label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--text-caption);
  color: var(--text-secondary);
  padding: 0.3rem 0;
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease);
}
.sub-filter-group label:hover { color: var(--text-primary); }
.sub-filter-group input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: var(--bronze);
  cursor: pointer;
}
.sub-filter-group select {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--text-caption);
  color: var(--text-primary);
  background: none;
  border: var(--border-hair);
  padding: 0.5em;
  cursor: pointer;
}
.sub-filter-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}
.sub-filter-clear {
  font-family: var(--font-body);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5em;
  transition: color var(--dur-fast) var(--ease);
}
.sub-filter-clear:hover { color: var(--bronze); }

/* Product Grid */
.sub-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  padding-bottom: var(--space-2xl);
}

/* Empty State */
.sub-empty {
  text-align: center;
  padding: var(--space-2xl) var(--space-md);
  grid-column: 1 / -1;
}
.sub-empty-icon {
  width: 48px;
  height: 48px;
  color: var(--stone);
  margin-bottom: var(--space-md);
}
.sub-empty h3 {
  font-size: var(--text-h2);
  font-weight: 300;
  margin-bottom: var(--space-sm);
}
.sub-empty p {
  color: var(--text-secondary);
  font-size: var(--text-body);
  margin-bottom: var(--space-md);
  max-width: 40ch;
  margin-left: auto;
  margin-right: auto;
}

/* Mobile Sticky Filter */
.sub-mobile-filter {
  display: none;
  position: fixed;
  bottom: 56px;
  left: 0;
  right: 0;
  z-index: 160;
  background: var(--bg-primary);
  border-top: 1px solid var(--stone);
  padding: var(--space-sm) var(--space-md);
  transform: translateY(100%);
  opacity: 0;
  transition: transform var(--dur-slow) var(--ease), opacity var(--dur-slow) var(--ease);
  pointer-events: none;
}
.sub-mobile-filter.is-visible { transform: translateY(0); opacity: 1; pointer-events: auto; }
.sub-mobile-filter-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: 0.75rem;
  font-family: var(--font-body);
  font-size: var(--text-caption);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bg-primary);
  background: var(--walnut);
  border: 1px solid var(--walnut);
  cursor: pointer;
  min-height: 48px;
}

/* Responsive */
@media (max-width: 860px) {
  .sub-hero { height: 42vh; min-height: 280px; }
  .sub-hero-content { padding: 0 var(--space-lg) var(--space-lg); margin-left: 0; max-width: 100%; }
  .sub-hero-content h1 { font-size: var(--text-h1); }
  .sub-grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); }
  .sub-filters-grid { grid-template-columns: repeat(2, 1fr); }
  .sub-mobile-filter { display: block; }
  body { padding-bottom: 110px; }
}
@media (max-width: 560px) {
  .sub-hero { height: 38vh; min-height: 240px; }
  .sub-hero-content { padding: 0 var(--space-md) var(--space-md); }
  .sub-hero-content h1 { font-size: var(--text-h2); }
  .sub-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
  .sub-toolbar { flex-wrap: wrap; }
  .sub-toolbar-right { width: 100%; }
  .sub-sort-select { flex: 1; }
  .sub-filters-grid { grid-template-columns: 1fr; }
  .sub-mobile-filter { bottom: 52px; }
  body { padding-bottom: 104px; }
}
@media (max-width: 430px) {
  .sub-grid { gap: var(--space-xs); }
}
@media (prefers-reduced-motion: reduce) {
  .sub-hero-img { animation: none; transform: scale(1); }
}
`;

export default function SubcategoryPage() {
  const [heroImg, setHeroImg] = useState('https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=1600');
  const [heroTitle, setHeroTitle] = useState('Gallery');
  const [heroDesc, setHeroDesc] = useState('Browse handcrafted solid timber products.');
  const [catName, setCatName] = useState('');
  const [catKey, setCatKey] = useState('');
  const [subName, setSubName] = useState('');
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [sortValue, setSortValue] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ material: [], price: '', availability: [] });
  const [stickyFilterVisible, setStickyFilterVisible] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ck = params.get('cat');
    const sk = params.get('sub');
    if (!ck || !sk) {
      window.location.href = '/gallery';
      return;
    }
    const cat = CATS[ck];
    if (!cat) {
      window.location.href = '/gallery';
      return;
    }
    let sub = null;
    for (let i = 0; i < cat.subs.length; i++) {
      if (cat.subs[i].key === sk) { sub = cat.subs[i]; break; }
    }
    if (!sub) {
      window.location.href = '/gallery';
      return;
    }
    document.title = `${sub.name} — ${cat.name} — Teakle`;
    setCatName(cat.name);
    setCatKey(ck);
    setSubName(sub.name);
    setHeroTitle(sub.name);
    setHeroDesc(sub.description || `${sub.name} — handcrafted from solid timber.`);
    setHeroImg(sub.image);

    if (typeof window.TEAKLE_PRODUCTS === 'undefined') return;
    const filtered = window.TEAKLE_PRODUCTS.filter(
      (p) => p.category === ck && p.subcategory === sk
    );
    setAllProducts(filtered);
    setProducts(filtered);
    setLoading(false);
  }, []);

  /* Sticky filter detection */
  useEffect(() => {
    function onScroll() {
      const toolbar = document.querySelector('.sub-toolbar');
      if (!toolbar) return;
      setStickyFilterVisible(toolbar.getBoundingClientRect().bottom < 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Apply filters and sorting */
  useEffect(() => {
    let result = [...allProducts];
    if (filters.material.length > 0) {
      result = result.filter((p) => filters.material.includes(p.material));
    }
    if (filters.price) {
      const [min, max] = filters.price.split('-').map(Number);
      result = result.filter((p) => p.price >= min && (!max || p.price <= max));
    }
    if (filters.availability.length > 0) {
      result = result.filter((p) => filters.availability.includes(p.availability));
    }
    switch (sortValue) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': result.reverse(); break;
      default: break;
    }
    setProducts(result);
  }, [sortValue, filters, allProducts]);

  const handleFilterChange = useCallback((type, value) => {
    setFilters((prev) => {
      if (type === 'price') return { ...prev, price: value };
      const arr = prev[type];
      return { ...prev, [type]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ material: [], price: '', availability: [] });
    setSortValue('featured');
  }, []);

  const hasActiveFilters = filters.material.length > 0 || filters.price || filters.availability.length > 0;

  const materials = [...new Set(allProducts.map((p) => p.material).filter(Boolean))];
  const availabilities = [...new Set(allProducts.map((p) => p.availability).filter(Boolean))];

  return (
    <>
      <style>{subStyles}</style>

      {/* Hero */}
      <section className="sub-hero">
        <img className="sub-hero-img" src={heroImg} alt={heroTitle} />
        <div className="sub-hero-content">
          <span className="eyebrow eyebrow-light">{catName}</span>
          <h1>{heroTitle}</h1>
          <p>{heroDesc}</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container">
        <nav className="sub-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/gallery">Gallery</Link>
          <span>/</span>
          <Link href="/gallery">{catName}</Link>
          <span>/</span>
          <span className="bc-current">{subName}</span>
        </nav>
      </div>

      {/* Toolbar */}
      <section style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="sub-toolbar">
            <div className="sub-toolbar-left">
              <span className="sub-toolbar-count">{products.length} piece{products.length !== 1 ? 's' : ''}</span>
              {hasActiveFilters && (
                <button className="sub-filter-clear" onClick={clearFilters}>Clear Filters</button>
              )}
            </div>
            <div className="sub-toolbar-right">
              <button className={`sub-filter-btn ${filtersOpen ? 'is-active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
                Filters
              </button>
              <select className="sub-sort-select" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          <div className={`sub-filters ${filtersOpen ? 'is-open' : ''}`}>
            <div className="sub-filters-grid">
              {materials.length > 0 && (
                <div className="sub-filter-group">
                  <h4>Material</h4>
                  {materials.map((m) => (
                    <label key={m}>
                      <input type="checkbox" checked={filters.material.includes(m)} onChange={() => handleFilterChange('material', m)} />
                      {m}
                    </label>
                  ))}
                </div>
              )}
              <div className="sub-filter-group">
                <h4>Price Range</h4>
                <label><input type="radio" name="price" checked={filters.price === ''} onChange={() => handleFilterChange('price', '')} /> All Prices</label>
                <label><input type="radio" name="price" checked={filters.price === '0-10000'} onChange={() => handleFilterChange('price', '0-10000')} /> Under \u20B910,000</label>
                <label><input type="radio" name="price" checked={filters.price === '10000-50000'} onChange={() => handleFilterChange('price', '10000-50000')} /> \u20B910,000 \u2013 \u20B950,000</label>
                <label><input type="radio" name="price" checked={filters.price === '50000-'} onChange={() => handleFilterChange('price', '50000-')} /> Over \u20B950,000</label>
              </div>
              {availabilities.length > 0 && (
                <div className="sub-filter-group">
                  <h4>Availability</h4>
                  {availabilities.map((a) => (
                    <label key={a}>
                      <input type="checkbox" checked={filters.availability.includes(a)} onChange={() => handleFilterChange('availability', a)} />
                      {a}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="sub-filter-actions">
              <button className="sub-filter-clear" onClick={clearFilters}>Clear All Filters</button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section style={{ background: 'var(--bg-primary)', padding: '0 var(--space-md)' }}>
        <div className="container">
          <div className="sub-grid" ref={gridRef}>
            {loading ? (
              <div className="sub-empty"><p>Loading products...</p></div>
            ) : products.length === 0 ? (
              <div className="sub-empty">
                <svg className="sub-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <h3>No pieces found</h3>
                <p>{hasActiveFilters ? 'Try adjusting your filters to discover more pieces.' : 'This collection is being curated. Enquire for custom options.'}</p>
                {hasActiveFilters ? (
                  <button className="btn-primary" onClick={clearFilters}>Clear Filters</button>
                ) : (
                  <Link href="/contact" className="btn-primary">Get in Touch</Link>
                )}
              </div>
            ) : (
              products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Mobile Sticky Filter */}
      <div className={`sub-mobile-filter ${stickyFilterVisible ? 'is-visible' : ''}`}>
        <button className="sub-mobile-filter-btn" onClick={() => { setFiltersOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
          Filter & Sort
        </button>
      </div>
    </>
  );
}

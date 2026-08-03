'use client';

import { useEffect, useState } from 'react';

const CATS = {
  kitchen: {
    name: 'Kitchen',
    image: 'https://images.pexels.com/photos/4805236/pexels-photo-4805236.jpeg?auto=compress&cs=tinysrgb&w=1600',
    subs: [
      { key: 'countertop-essentials', name: 'Countertop Essentials', image: 'https://images.pexels.com/photos/6996084/pexels-photo-6996084.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'coffee-tea-station', name: 'Coffee & Tea Station', image: 'https://images.pexels.com/photos/5807555/pexels-photo-5807555.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'cooking-essentials', name: 'Cooking Essentials', image: 'https://images.pexels.com/photos/5807560/pexels-photo-5807560.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'dining-serving', name: 'Dining & Serving', image: 'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'storage-organization', name: 'Storage & Organization', image: 'https://images.pexels.com/photos/6474478/pexels-photo-6474478.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'kitchen-decor', name: 'Kitchen Decor', image: 'https://images.pexels.com/photos/6474482/pexels-photo-6474482.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'baking-essentials', name: 'Baking Essentials', image: 'https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'pantry-organization', name: 'Pantry Organization', image: 'https://images.pexels.com/photos/6474490/pexels-photo-6474490.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
    ],
  },
  dining: {
    name: 'Dining',
    image: 'https://images.pexels.com/photos/6474475/pexels-photo-6474475.jpeg?auto=compress&cs=tinysrgb&w=1600',
    subs: [
      { key: 'serving-boards', name: 'Serving Boards', image: 'https://images.pexels.com/photos/4750280/pexels-photo-4750280.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'trays', name: 'Trays', image: 'https://images.pexels.com/photos/6996090/pexels-photo-6996090.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'bowls', name: 'Bowls', image: 'https://images.pexels.com/photos/6474502/pexels-photo-6474502.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'cutlery', name: 'Cutlery', image: 'https://images.pexels.com/photos/4750272/pexels-photo-4750272.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'drinkware-accessories', name: 'Drinkware Accessories', image: 'https://images.pexels.com/photos/6474495/pexels-photo-6474495.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'table-centerpieces', name: 'Table Centerpieces', image: 'https://images.pexels.com/photos/5591890/pexels-photo-5591890.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'dining-decor', name: 'Dining Decor', image: 'https://images.pexels.com/photos/6996100/pexels-photo-6996100.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
    ],
  },
  living: {
    name: 'Living Room',
    image: 'https://images.pexels.com/photos/5858085/pexels-photo-5858085.jpeg?auto=compress&cs=tinysrgb&w=1600',
    subs: [
      { key: 'sculptures', name: 'Sculptures', image: 'https://images.pexels.com/photos/6044820/pexels-photo-6044820.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'decorative-objects', name: 'Decorative Objects', image: 'https://images.pexels.com/photos/6044818/pexels-photo-6044818.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'vases', name: 'Vases', image: 'https://images.pexels.com/photos/6044816/pexels-photo-6044816.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'coffee-table-decor', name: 'Coffee Table Decor', image: 'https://images.pexels.com/photos/6044814/pexels-photo-6044814.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'shelving-decor', name: 'Shelving Decor', image: 'https://images.pexels.com/photos/6044812/pexels-photo-6044812.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'storage-boxes', name: 'Storage Boxes', image: 'https://images.pexels.com/photos/6044810/pexels-photo-6044810.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'candle-holders', name: 'Candle Holders', image: 'https://images.pexels.com/photos/6044808/pexels-photo-6044808.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
    ],
  },
  bedroom: {
    name: 'Bedroom',
    image: 'https://images.pexels.com/photos/6045088/pexels-photo-6045088.jpeg?auto=compress&cs=tinysrgb&w=1600',
    subs: [
      { key: 'nightstand-essentials', name: 'Nightstand Essentials', image: 'https://images.pexels.com/photos/6045086/pexels-photo-6045086.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'jewelry-storage', name: 'Jewelry Storage', image: 'https://images.pexels.com/photos/6045084/pexels-photo-6045084.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'organizers', name: 'Organizers', image: 'https://images.pexels.com/photos/6045082/pexels-photo-6045082.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'mirrors', name: 'Mirrors', image: 'https://images.pexels.com/photos/6045080/pexels-photo-6045080.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'decorative-accents', name: 'Decorative Accents', image: 'https://images.pexels.com/photos/6045078/pexels-photo-6045078.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'bedroom-decor', name: 'Bedroom Decor', image: 'https://images.pexels.com/photos/6045076/pexels-photo-6045076.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
    ],
  },
  office: {
    name: 'Office',
    image: 'https://images.pexels.com/photos/7979604/pexels-photo-7979604.jpeg?auto=compress&cs=tinysrgb&w=1600',
    subs: [
      { key: 'desk-organization', name: 'Desk Organization', image: 'https://images.pexels.com/photos/7979602/pexels-photo-7979602.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'pen-holders', name: 'Pen Holders', image: 'https://images.pexels.com/photos/7979600/pexels-photo-7979600.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'laptop-stands', name: 'Laptop Stands', image: 'https://images.pexels.com/photos/7979598/pexels-photo-7979598.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'document-storage', name: 'Document Storage', image: 'https://images.pexels.com/photos/7979596/pexels-photo-7979596.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'office-decor', name: 'Office Decor', image: 'https://images.pexels.com/photos/7979594/pexels-photo-7979594.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'accessories', name: 'Accessories', image: 'https://images.pexels.com/photos/7979592/pexels-photo-7979592.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
    ],
  },
  bathroom: {
    name: 'Bathroom',
    image: 'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg?auto=compress&cs=tinysrgb&w=1600',
    subs: [
      { key: 'vanity-organizers', name: 'Vanity Organizers', image: 'https://images.pexels.com/photos/8005395/pexels-photo-8005395.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'soap-dispensers', name: 'Soap Dispensers', image: 'https://images.pexels.com/photos/8005393/pexels-photo-8005393.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'toothbrush-holders', name: 'Toothbrush Holders', image: 'https://images.pexels.com/photos/8005391/pexels-photo-8005391.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'storage', name: 'Storage', image: 'https://images.pexels.com/photos/8005389/pexels-photo-8005389.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'bathroom-decor', name: 'Bathroom Decor', image: 'https://images.pexels.com/photos/8005387/pexels-photo-8005387.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
    ],
  },
  outdoor: {
    name: 'Outdoor',
    image: 'https://images.pexels.com/photos/6480210/pexels-photo-6480210.jpeg?auto=compress&cs=tinysrgb&w=1600',
    subs: [
      { key: 'planters', name: 'Planters', image: 'https://images.pexels.com/photos/6480208/pexels-photo-6480208.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'garden-decor', name: 'Garden Decor', image: 'https://images.pexels.com/photos/6480206/pexels-photo-6480206.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'outdoor-serving', name: 'Outdoor Serving', image: 'https://images.pexels.com/photos/6480204/pexels-photo-6480204.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'patio-accessories', name: 'Patio Accessories', image: 'https://images.pexels.com/photos/6480202/pexels-photo-6480202.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'storage', name: 'Storage', image: 'https://images.pexels.com/photos/6480200/pexels-photo-6480200.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
    ],
  },
  seasonal: {
    name: 'Seasonal Collections',
    image: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=1600',
    subs: [
      { key: 'festive-decor', name: 'Festive Decor', image: 'https://images.pexels.com/photos/6045074/pexels-photo-6045074.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'limited-editions', name: 'Limited Editions', image: 'https://images.pexels.com/photos/6045072/pexels-photo-6045072.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'collectors-series', name: "Collector's Series", image: 'https://images.pexels.com/photos/6045070/pexels-photo-6045070.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
      { key: 'gift-collections', name: 'Gift Collections', image: 'https://images.pexels.com/photos/6045068/pexels-photo-6045068.jpeg?auto=compress&cs=tinysrgb&w=900', count: 14 },
    ],
  },
};

export default function SubcategoryPage() {
  const [heroImg, setHeroImg] = useState('https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=1600');
  const [heroTitle, setHeroTitle] = useState('Gallery');
  const [heroDesc, setHeroDesc] = useState('Browse handcrafted solid timber products from the Teakle workshop.');
  const [breadcrumbCatName, setBreadcrumbCatName] = useState('Gallery');
  const [breadcrumbCatHref, setBreadcrumbCatHref] = useState('/gallery');
  const [breadcrumbSubName, setBreadcrumbSubName] = useState('Gallery');
  const [products, setProducts] = useState([]);
  const [sortValue, setSortValue] = useState('featured');
  const [sortCount, setSortCount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catKey = params.get('cat');
    const subKey = params.get('sub');
    if (!catKey || !subKey) {
      window.location.href = '/gallery';
      return;
    }

    const cat = CATS[catKey];
    if (!cat) {
      window.location.href = '/gallery';
      return;
    }

    let sub = null;
    for (let i = 0; i < cat.subs.length; i++) {
      if (cat.subs[i].key === subKey) {
        sub = cat.subs[i];
        break;
      }
    }
    if (!sub) {
      window.location.href = `/subcategory?cat=${catKey}`;
      return;
    }

    document.title = `${sub.name} — ${cat.name} — Teakle`;

    setBreadcrumbCatName(cat.name);
    setBreadcrumbCatHref(`/subcategory?cat=${catKey}`);
    setBreadcrumbSubName(sub.name);
    setHeroTitle(sub.name);
    setHeroDesc(`${sub.name} — handcrafted from solid timber.`);
    setHeroImg(sub.image);

    if (typeof window.TEAKLE_PRODUCTS === 'undefined') {
      setLoading(true);
      return;
    }

    const allFiltered = window.TEAKLE_PRODUCTS.filter(
      (p) => p.category === catKey && p.subcategory === subKey
    );

    setProducts(allFiltered);
    setSortCount(`${allFiltered.length} piece${allFiltered.length !== 1 ? 's' : ''}`);
    setLoading(false);

    document.querySelectorAll('.reveal, .piece-card, .product-card, .category-card, .subcategory-card').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, []);

  useEffect(() => {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;

    const handler = () => {
      const sorted = [...products];
      switch (sortSelect.value) {
        case 'price-asc':
          sorted.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          sorted.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
      const grid = document.getElementById('productsGrid');
      if (grid) {
        grid.style.transition = 'opacity 200ms var(--ease)';
        grid.style.opacity = '0';
        setTimeout(() => {
          setProducts(sorted);
          requestAnimationFrame(() => {
            grid.style.opacity = '1';
          });
        }, 200);
      }
    };

    sortSelect.addEventListener('change', handler);
    return () => sortSelect.removeEventListener('change', handler);
  }, [products]);

  useEffect(() => {
    if (products.length === 0) return;

    const timers = [];
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((card, i) => {
      timers.push(setTimeout(() => card.classList.add('is-visible'), 60 * i));
    });

    grid.querySelectorAll('.product-image').forEach((container) => {
      const img = container.querySelector('img');
      if (!img) return;
      if (img.complete) return;
      container.classList.add('is-loading');
      const onLoad = () => container.classList.remove('is-loading');
      const onError = () => container.classList.remove('is-loading');
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
      return () => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      };
    });

    grid.querySelectorAll('.wishlist-btn').forEach((btn) => {
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.TeaKle !== 'undefined' && !window.TeaKle.isLoggedIn()) {
          window.location.href = '/login';
          return;
        }
        if (typeof window.TeaKle !== 'undefined') {
          const result = window.TeaKle.toggleWishlist({
            id: btn.dataset.id,
            name: btn.dataset.name,
            price: btn.dataset.price,
            image: btn.dataset.image,
          });
          btn.style.transform = 'scale(1.3)';
          setTimeout(() => {
            btn.style.transform = 'scale(1)';
          }, 150);
          btn.style.background = result.added ? 'var(--bronze)' : 'rgba(255,255,255,0.9)';
          btn.style.color = result.added ? '#fff' : 'var(--text-primary)';
        }
      };

      if (typeof window.TeaKle !== 'undefined' && window.TeaKle.isInWishlist(btn.dataset.id)) {
        btn.style.background = 'var(--bronze)';
        btn.style.color = '#fff';
      }

      btn.addEventListener('click', clickHandler);
      timers.push({ remove: () => btn.removeEventListener('click', clickHandler) });
    });

    return () => {
      timers.forEach((t) => {
        if (typeof t === 'number') clearTimeout(t);
        else if (t && t.remove) t.remove();
      });
    };
  }, [products]);

  return (
    <>
      <style>{`
        .breadcrumb {
          padding: var(--space-lg) 0 0;
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .breadcrumb a { color: var(--text-secondary); text-decoration: none; }
        .breadcrumb a:hover { color: var(--bronze); }
        .breadcrumb span { margin: 0 0.5em; }

        .sort-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) 0;
          border-bottom: var(--border-subtle);
          margin-bottom: var(--space-md);
        }
        .sort-bar-count {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .sort-bar-controls {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .sort-bar-label {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .sort-bar-select {
          font-family: var(--font-body);
          font-size: var(--text-caption);
          color: var(--text-primary);
          background: none;
          border: var(--border-hair);
          padding: 0.4em 1.8em 0.4em 0.6em;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2361574F' stroke-width='1.2'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5em center;
          cursor: pointer;
          transition: border-color var(--dur-fast) var(--ease);
        }
        .sort-bar-select:hover { border-color: var(--bronze); }
        .sort-bar-select:focus { outline: none; border-color: var(--bronze); }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-md) var(--space-sm);
          padding: 0 0 var(--space-2xl);
        }
        .product-card {
          display: block;
          text-decoration: none;
          color: inherit;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity var(--dur-slow) var(--ease), transform var(--dur-slow) var(--ease);
        }
        .product-card.is-visible { opacity: 1; transform: translateY(0); }
        .product-card:hover { color: inherit; }
        .product-image {
          position: relative;
          aspect-ratio: 3 / 4;
          background: var(--bg-secondary);
          margin-bottom: 0.6rem;
          overflow: hidden;
        }
        .product-image img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform var(--dur-slow) var(--ease), opacity var(--dur-slow) var(--ease);
        }
        .product-card:hover .product-image img { transform: scale(1.04); }

        .product-image { position: relative; }
        .product-image.is-loading img { opacity: 0; }
        .product-image.is-loading::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, var(--bg-secondary) 25%, rgba(43,34,27,0.04) 50%, var(--bg-secondary) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .product-badge {
          position: absolute;
          top: 0.6rem;
          left: 0.6rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: var(--text-caption);
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.3em 0.6em;
          line-height: 1;
          z-index: 2;
        }
        .product-badge:empty { display: none; }
        .wishlist-btn {
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
        .product-card:hover .wishlist-btn { opacity: 1; transform: scale(1); }
        .wishlist-btn:hover { background: var(--bronze); color: #fff; }
        .wishlist-btn:active { transform: scale(0.85); }
        .wishlist-btn:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; opacity: 1; transform: scale(1); }
        .wishlist-btn svg { width: 13px; height: 13px; }
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .product-info h3 {
          font-size: var(--text-body);
          font-weight: 500;
          margin-bottom: 0;
          max-width: none;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color var(--dur-fast) var(--ease);
        }
        .product-card:hover .product-info h3 { color: var(--bronze); }
        .product-price {
          font-size: var(--text-caption);
          letter-spacing: 0.02em;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .subcategory-loading {
          text-align: center;
          padding: var(--space-2xl) 0;
          color: var(--text-secondary);
          font-size: var(--text-body);
        }
        @media (max-width: 860px) {
          .products-grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); }
          .wishlist-btn { opacity: 1; transform: scale(1); }
          .sort-bar { flex-wrap: wrap; gap: var(--space-xs); }
        }
        @media (max-width: 560px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
          .product-image { aspect-ratio: 3 / 4; margin-bottom: var(--space-xs); }
          .product-info h3 { font-size: var(--text-caption); font-weight: 500; line-height: 1.3; }
          .product-price { font-size: 0.65rem; }
          .wishlist-btn { width: 40px; height: 40px; }
          .wishlist-btn svg { width: 14px; height: 14px; }
          .sort-bar { padding: var(--space-sm) 0; }
          .sort-bar-count { font-size: 0.65rem; }
          .sort-bar-controls { width: 100%; }
          .sort-bar-select { flex: 1; }
        }
        @media (max-width: 430px) {
          .product-info h3 { font-size: var(--text-caption); }
          .products-grid { gap: var(--space-xs); }
        }
      `}</style>

      <section className="page-hero">
        <img id="subcategoryHeroImg" src={heroImg} alt="Browse products" />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">Gallery</span>
          <h1 id="subcategoryHeroTitle">{heroTitle}</h1>
          <p id="subcategoryHeroDesc">{heroDesc}</p>
        </div>
      </section>

      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/gallery">Gallery</a>
          <span>/</span>
          <a href={breadcrumbCatHref} id="breadcrumbCategory">{breadcrumbCatName}</a>
          <span>/</span>
          <span id="breadcrumbSubcategory">{breadcrumbSubName}</span>
        </nav>
      </div>

      <section className="products-section">
        <div className="container">
          <div className="sort-bar" id="sortBar">
            <span className="sort-bar-count" id="sortBarCount">{sortCount}</span>
            <div className="sort-bar-controls">
              <label className="sort-bar-label" htmlFor="sortSelect">Sort by</label>
              <select className="sort-bar-select" id="sortSelect" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          <div className="products-grid" id="productsGrid">
            {loading ? (
              <p className="subcategory-loading">Products data not loaded.</p>
            ) : products.length === 0 ? (
              <p className="subcategory-loading">Products coming soon. Enquire for custom options.</p>
            ) : (
              products.map((product) => {
                const badgeText =
                  product.availability === 'Limited Edition'
                    ? 'Limited'
                    : product.availability === 'In Stock'
                    ? 'In Stock'
                    : '';

                return (
                  <a key={product.id} href={`/shop/${product.id}`} className="product-card">
                    <div className="product-image">
                      <img src={product.images[0]} alt={product.name} loading="lazy" />
                      {badgeText && <span className="product-badge">{badgeText}</span>}
                      <button
                        className="wishlist-btn"
                        data-id={product.id}
                        data-name={product.name}
                        data-price={product.priceFormatted}
                        data-image={product.images[0]}
                        aria-label="Add to wishlist"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <span className="product-price">{product.priceFormatted}</span>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}

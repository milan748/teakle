'use client';

import { useEffect } from 'react';

export default function GalleryPage() {
  useEffect(() => {
    const tabs = document.querySelectorAll('.gallery-tab');
    const sections = document.querySelectorAll('.category-section');
    let animating = false;

    sections.forEach((s) => {
      s.style.transition = 'opacity var(--dur-slow) var(--ease)';
    });

    tabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        if (animating) return;
        const cat = this.getAttribute('data-category');

        tabs.forEach((t) => t.classList.remove('is-active'));
        this.classList.add('is-active');

        animating = true;
        sections.forEach((section) => {
          if (cat === 'all' || section.getAttribute('data-category') === cat) {
            section.style.opacity = '0';
            section.style.display = '';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                section.style.opacity = '1';
              });
            });
          } else {
            section.style.opacity = '0';
            setTimeout(() => {
              section.style.display = 'none';
              animating = false;
            }, 500);
          }
        });

        if (cat === 'all') {
          setTimeout(() => {
            animating = false;
          }, 510);
        }

        if (cat !== 'all') {
          const target = document.querySelector(
            `.category-section[data-category="${cat}"]`
          );
          if (target) {
            setTimeout(() => {
              const tabHeight = document.querySelector('.gallery-tabs').offsetHeight;
              const top =
                target.getBoundingClientRect().top + window.pageYOffset - tabHeight - 20;
              window.scrollTo({ top, behavior: 'smooth' });
            }, 50);
          }
        }
      });
    });
  }, []);

  useEffect(() => {
    document.querySelectorAll('.subcategory-card-image').forEach((container) => {
      const img = container.querySelector('img');
      if (!img) return;
      if (img.complete) return;
      container.classList.add('is-loading');
      img.addEventListener('load', () => {
        container.classList.remove('is-loading');
      });
      img.addEventListener('error', () => {
        container.classList.remove('is-loading');
      });
    });
  }, []);

  return (
    <>
      <style>{`
        .gallery-tabs {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--bg-primary);
          border-bottom: var(--border-light);
          padding: 0 var(--space-md);
        }
        .gallery-tabs-inner {
          display: flex;
          gap: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .gallery-tabs-inner::-webkit-scrollbar { display: none; }
        .gallery-tab {
          flex-shrink: 0;
          padding: var(--space-sm) var(--space-md);
          font-family: var(--font-body);
          font-size: var(--text-caption);
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-secondary);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
          white-space: nowrap;
        }
        .gallery-tab:hover {
          color: var(--text-primary);
        }
        .gallery-tab.is-active {
          color: var(--text-primary);
          border-bottom-color: var(--text-primary);
        }
        .gallery-tab:focus-visible {
          outline: 2px solid var(--bronze);
          outline-offset: -2px;
          border-radius: 2px;
        }
        .gallery-categories {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md);
        }
        .category-section {
          padding: var(--space-xl) 0 var(--space-lg);
        }
        .category-section + .category-section {
          border-top: var(--border-subtle);
        }
        .category-heading-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }
        .category-heading {
          font-family: var(--font-body);
          font-size: var(--text-label);
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-primary);
          margin: 0;
          max-width: none;
          white-space: nowrap;
        }
        .category-heading-line {
          flex: 1;
          height: 1px;
          background: rgba(43,34,27,0.12);
        }
        .subcategory-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-md) var(--space-sm);
        }
        .subcategory-card {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .subcategory-card-image {
          position: relative;
          aspect-ratio: 3 / 4;
          background: var(--bg-secondary);
          margin-bottom: 0.6rem;
          overflow: hidden;
          border-radius: var(--radius-sm);
        }
        .subcategory-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--dur-slow) var(--ease), opacity var(--dur-slow) var(--ease);
        }
        .subcategory-card:hover .subcategory-card-image img {
          transform: scale(1.04);
        }
        .subcategory-card-image { position: relative; }
        .subcategory-card-image img {
          transition: opacity var(--dur-slow) var(--ease);
        }
        .subcategory-card-image.is-loading img { opacity: 0; }
        .subcategory-card-image.is-loading::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, var(--bg-secondary) 25%, rgba(43,34,27,0.04) 50%, var(--bg-secondary) 75%);
          background-size: 200% 100%;
          animation: galleryShimmer 1.5s infinite;
        }
        @keyframes galleryShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .subcategory-card-wishlist {
          position: absolute;
          top: 0.6rem;
          right: 0.6rem;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.9);
          border-radius: var(--radius-full);
          opacity: 0;
          transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
          z-index: 2;
          transform: scale(0.85);
        }
        .subcategory-card:hover .subcategory-card-wishlist {
          opacity: 1;
          transform: scale(1);
        }
        .subcategory-card-wishlist:hover { background: var(--bronze); }
        .subcategory-card-wishlist:hover svg { color: #fff; }
        .subcategory-card-wishlist:active { transform: scale(0.85); }
        .subcategory-card-wishlist:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; opacity: 1; transform: scale(1); }
        .subcategory-card-wishlist svg {
          width: 14px;
          height: 14px;
          color: var(--text-primary);
        }
        .subcategory-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .subcategory-card-title {
          font-family: var(--font-body);
          font-size: var(--text-body);
          font-weight: 500;
          letter-spacing: 0.01em;
          line-height: 1.3;
          max-width: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color var(--dur-fast) var(--ease);
        }
        .subcategory-card:hover .subcategory-card-title {
          color: var(--bronze);
        }
        .subcategory-card:hover {
          box-shadow: var(--shadow-card-hover);
        }
        .subcategory-card-count {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }
        .gallery-note {
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-lg) var(--space-md);
          text-align: center;
          font-size: var(--text-body);
          color: var(--text-secondary);
          line-height: var(--lh-relaxed);
        }
        .gallery-note a {
          color: var(--bronze);
          border-bottom: 1px solid transparent;
          transition: border-color var(--dur-fast) var(--ease);
        }
        .gallery-note a:hover { border-bottom-color: var(--bronze); }
        @media (max-width: 860px) {
          .gallery-tab { padding: var(--space-sm) var(--space-sm); font-size: var(--text-caption); min-height: 44px; }
          .category-section { padding: var(--space-lg) 0 var(--space-md); }
          .subcategory-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-sm) var(--space-sm);
          }
          .subcategory-card-title { font-size: var(--text-caption); }
          .subcategory-card-wishlist { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 560px) {
          .gallery-tabs { padding: 0 var(--space-sm); }
          .category-section { padding: var(--space-md) 0; }
          .category-heading { font-size: var(--text-caption); }
          .subcategory-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-sm) var(--space-sm);
          }
          .subcategory-card-title { font-size: var(--text-caption); }
          .subcategory-card-wishlist { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 430px) {
          .subcategory-card-title { font-size: var(--text-caption); }
        }
      `}</style>

      <section className="page-hero">
        <img
          src="https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=1800"
          alt="Solid timber furniture in a workshop."
        />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">Gallery</span>
          <h1>Every piece, handcrafted from solid timber.</h1>
          <p>
            Browse by room or category — kitchen, dining, living, bedroom,
            workspace, organization, and decor.
          </p>
        </div>
      </section>

      <nav className="gallery-tabs" aria-label="Filter by category">
        <div className="gallery-tabs-inner">
          <button className="gallery-tab is-active" data-category="all">All</button>
          <button className="gallery-tab" data-category="kitchen">Kitchen</button>
          <button className="gallery-tab" data-category="dining">Dining</button>
          <button className="gallery-tab" data-category="living">Living</button>
          <button className="gallery-tab" data-category="bedroom">Bedroom</button>
          <button className="gallery-tab" data-category="office">Workspace</button>
          <button className="gallery-tab" data-category="bathroom">Organization</button>
          <button className="gallery-tab" data-category="outdoor">Decor</button>
        </div>
      </nav>

      <section className="gallery-categories" id="galleryCategories">
        {/* KITCHEN */}
        <div className="category-section" data-category="kitchen">
          <div className="category-heading-row">
            <h2 className="category-heading">Kitchen</h2>
            <div className="category-heading-line"></div>
          </div>
          <div className="subcategory-grid">
            <a href="/subcategory?cat=kitchen&sub=countertop-essentials" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/28080318/pexels-photo-28080318.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Countertop Essentials" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Countertop Essentials</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=kitchen&sub=coffee-tea-station" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/16588584/pexels-photo-16588584.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Coffee & Tea Station" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Coffee & Tea Station</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=kitchen&sub=cooking-essentials" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/7123134/pexels-photo-7123134.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Cooking Essentials" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Cooking Essentials</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=kitchen&sub=storage-organization" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/34942955/pexels-photo-34942955.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Spice Storage" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Spice Storage</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=kitchen&sub=dining-serving" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/29250824/pexels-photo-29250824.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Knife & Utensil Holders" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Knife & Utensil Holders</h3>
                <p className="subcategory-card-count">2 pieces</p>
              </div>
            </a>
            <a href="/subcategory?cat=kitchen&sub=dining-serving" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/4736381/pexels-photo-4736381.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Trays" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Trays</h3>
                <p className="subcategory-card-count">2 pieces</p>
              </div>
            </a>
            <a href="/subcategory?cat=kitchen&sub=storage-organization" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/4805230/pexels-photo-4805230.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Bread Boxes" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Bread Boxes</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=kitchen&sub=countertop-essentials" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/11913154/pexels-photo-11913154.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Fruit Bowls" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Fruit Bowls</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
          </div>
        </div>

        {/* DINING */}
        <div className="category-section" data-category="dining">
          <div className="category-heading-row">
            <h2 className="category-heading">Dining</h2>
            <div className="category-heading-line"></div>
          </div>
          <div className="subcategory-grid">
            <a href="/subcategory?cat=dining&sub=serving-boards" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/6910978/pexels-photo-6910978.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Serving Boards" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Serving Boards</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=dining&sub=trays" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/8895213/pexels-photo-8895213.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Serving Trays" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Serving Trays</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=dining&sub=bowls" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/7799698/pexels-photo-7799698.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Platters" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Platters</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=dining&sub=trays" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/29632116/pexels-photo-29632116.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Coasters" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Coasters</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=dining&sub=serving-boards" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/4791748/pexels-photo-4791748.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Napkin Holders" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Napkin Holders</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=dining&sub=bowls" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/9646744/pexels-photo-9646744.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Cutlery Organizers" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Cutlery Organizers</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=dining&sub=serving-boards" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/4989498/pexels-photo-4989498.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Dining Centerpieces" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Dining Centerpieces</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
          </div>
        </div>

        {/* LIVING */}
        <div className="category-section" data-category="living">
          <div className="category-heading-row">
            <h2 className="category-heading">Living</h2>
            <div className="category-heading-line"></div>
          </div>
          <div className="subcategory-grid">
            <a href="/subcategory?cat=living&sub=coffee-table-decor" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/10677815/pexels-photo-10677815.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Coffee Table Objects" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Coffee Table Objects</h3>
                <p className="subcategory-card-count">2 pieces</p>
              </div>
            </a>
            <a href="/subcategory?cat=living&sub=storage-boxes" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/33395641/pexels-photo-33395641.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Decorative Boxes" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Decorative Boxes</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=living&sub=sculptures" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/6956510/pexels-photo-6956510.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Bookends" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Bookends</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=living&sub=vases" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/4612501/pexels-photo-4612501.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Candle Holders" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Candle Holders</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=living&sub=storage-boxes" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/11911824/pexels-photo-11911824.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Tissue Boxes" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Tissue Boxes</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
          </div>
        </div>

        {/* BEDROOM */}
        <div className="category-section" data-category="bedroom">
          <div className="category-heading-row">
            <h2 className="category-heading">Bedroom</h2>
            <div className="category-heading-line"></div>
          </div>
          <div className="subcategory-grid">
            <a href="/subcategory?cat=bedroom&sub=nightstand-essentials" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/31538808/pexels-photo-31538808.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Nightstand Essentials" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Nightstand Essentials</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=bedroom&sub=organizers" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/15679388/pexels-photo-15679388.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Organizers" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Organizers</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=bedroom&sub=mirrors" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/8218187/pexels-photo-8218187.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Mirrors" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Mirrors</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
          </div>
        </div>

        {/* OFFICE / WORKSPACE */}
        <div className="category-section" data-category="office">
          <div className="category-heading-row">
            <h2 className="category-heading">Workspace</h2>
            <div className="category-heading-line"></div>
          </div>
          <div className="subcategory-grid">
            <a href="/subcategory?cat=office&sub=laptop-stands" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/3847554/pexels-photo-3847554.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Laptop Stands" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Laptop Stands</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=office&sub=desk-organization" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/6340708/pexels-photo-6340708.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Desk Organization" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Desk Organization</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=office&sub=pen-holders" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/13162093/pexels-photo-13162093.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Pen Holders" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Pen Holders</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
          </div>
        </div>

        {/* BATHROOM / ORGANIZATION */}
        <div className="category-section" data-category="bathroom">
          <div className="category-heading-row">
            <h2 className="category-heading">Organization</h2>
            <div className="category-heading-line"></div>
          </div>
          <div className="subcategory-grid">
            <a href="/subcategory?cat=bathroom&sub=vanity-organizers" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/7303908/pexels-photo-7303908.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Vanity Organizers" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Vanity Organizers</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=bathroom&sub=soap-dispensers" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/7303925/pexels-photo-7303925.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Soap Dispensers" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Soap Dispensers</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=bathroom&sub=toothbrush-holders" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/7055292/pexels-photo-7055292.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Toothbrush Holders" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Toothbrush Holders</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
          </div>
        </div>

        {/* OUTDOOR / DECOR */}
        <div className="category-section" data-category="outdoor">
          <div className="category-heading-row">
            <h2 className="category-heading">Decor</h2>
            <div className="category-heading-line"></div>
          </div>
          <div className="subcategory-grid">
            <a href="/subcategory?cat=outdoor&sub=planters" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/4752017/pexels-photo-4752017.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Planters" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Planters</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=outdoor&sub=garden-decor" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/10418654/pexels-photo-10418654.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Garden Decor" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Garden Decor</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
            <a href="/subcategory?cat=outdoor&sub=outdoor-serving" className="subcategory-card">
              <div className="subcategory-card-image">
                <img src="https://images.pexels.com/photos/8170254/pexels-photo-8170254.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Outdoor Serving" loading="lazy" />
                <button className="subcategory-card-wishlist" aria-label="Add to wishlist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="subcategory-card-info">
                <h3 className="subcategory-card-title">Outdoor Serving</h3>
                <p className="subcategory-card-count">1 piece</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <div className="gallery-note">
        <p>
          Each piece is handcrafted to order. Lead times vary by complexity. For
          enquiries, visit our{' '}
          <a href="/contact">contact page</a> or{' '}
          <a href="/custom">request a custom piece</a>.
        </p>
      </div>
    </>
  );
}

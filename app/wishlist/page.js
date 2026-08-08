'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.Teakle) {
      setIsLoggedIn(window.Teakle.isLoggedIn());
      setWishlistItems(window.Teakle.getWishlist());
    }
  }, []);

  const refresh = useCallback(() => {
    if (window.Teakle) setWishlistItems(window.Teakle.getWishlist());
  }, []);

  function addToCart(item) {
    setAddedId(item.id);
    window.Teakle.addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
    setTimeout(() => {
      window.Teakle.toggleWishlist({ id: item.id, name: item.name, price: item.price, image: item.image });
      refresh();
      setAddedId(null);
    }, 600);
  }

  function removeFromWishlist(id) {
    setRemovingId(id);
    setTimeout(() => {
      window.Teakle.toggleWishlist({ id });
      refresh();
      setRemovingId(null);
    }, 300);
  }

  return (
    <>
      <style>{`
        .wish-page {
          padding: calc(var(--space-2xl) + var(--space-xl)) 0 var(--space-xl);
          min-height: 70vh;
        }
        .wish-page-header {
          margin-bottom: var(--space-lg);
          border-bottom: 1px solid rgba(43,34,27,0.08);
          padding-bottom: var(--space-sm);
        }
        .wish-page-header h1 {
          font-family: var(--font-display); font-size: clamp(1.75rem, 3vw, var(--text-h1));
          font-weight: 500; letter-spacing: -0.01em; color: var(--text-primary);
          margin: 0; max-width: none;
        }
        .wish-page-header .wish-count {
          font-size: var(--text-caption); color: var(--text-secondary);
          margin-top: 0.25rem; letter-spacing: 0.02em;
        }

        /* Empty */
        .wish-empty {
          text-align: center; padding: var(--space-2xl) 0;
        }
        .wish-empty-icon {
          width: 80px; height: 80px; margin: 0 auto var(--space-md);
          color: var(--bronze); opacity: 0.25;
        }
        .wish-empty h2 {
          font-family: var(--font-display); font-size: var(--text-h2); font-weight: 500;
          color: var(--text-primary); margin: 0 0 0.5rem; max-width: none;
        }
        .wish-empty p {
          color: var(--text-secondary); margin: 0 0 var(--space-md); max-width: none;
          font-size: var(--text-body);
        }
        .wish-empty .btn-primary {
          display: inline-block; font-family: var(--font-body); font-size: var(--text-caption);
          letter-spacing: 0.08em; text-transform: uppercase; color: var(--bg-primary);
          background: var(--walnut); border: 1px solid var(--walnut); padding: 0.875rem 2.5rem;
          text-decoration: none; cursor: pointer; transition: background 250ms var(--ease), transform 200ms var(--ease);
        }
        .wish-empty .btn-primary:hover { background: #3d2e23; transform: translateY(-1px); }

        /* Login prompt */
        .wish-login {
          text-align: center; padding: var(--space-2xl) 0;
        }
        .wish-login-icon {
          width: 80px; height: 80px; margin: 0 auto var(--space-md);
          color: var(--bronze); opacity: 0.25;
        }
        .wish-login h2 {
          font-family: var(--font-display); font-size: var(--text-h2); font-weight: 500;
          color: var(--text-primary); margin: 0 0 0.5rem; max-width: none;
        }
        .wish-login p {
          color: var(--text-secondary); margin: 0 0 var(--space-md); max-width: none;
          font-size: var(--text-body);
        }

        /* Grid */
        .wish-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm);
        }

        /* Card */
        .wish-card {
          background: var(--bg-secondary); border: var(--border-subtle); overflow: hidden;
          transition: box-shadow 300ms var(--ease), transform 300ms var(--ease);
          position: relative;
        }
        .wish-card:hover { box-shadow: 0 8px 32px rgba(43,34,27,0.08); transform: translateY(-3px); }
        .wish-card.is-removing { opacity: 0; transform: scale(0.95); pointer-events: none; }

        .wish-card-img {
          aspect-ratio: 3/4; overflow: hidden; background: var(--stone); position: relative;
        }
        .wish-card-img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 600ms var(--ease);
        }
        .wish-card:hover .wish-card-img img { transform: scale(1.05); }

        .wish-card-remove {
          position: absolute; top: 0.75rem; right: 0.75rem; z-index: 2;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(247,244,238,0.9); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: scale(0.8); transition: all 200ms var(--ease);
          backdrop-filter: blur(4px);
        }
        .wish-card:hover .wish-card-remove { opacity: 1; transform: scale(1); }
        .wish-card-remove:hover { background: rgba(247,244,238,1); }
        .wish-card-remove:focus-visible { outline: 2px solid var(--bronze); outline-offset: 2px; opacity: 1; transform: scale(1); }
        .wish-card-remove svg { width: 16px; height: 16px; color: var(--text-primary); }

        .wish-card-body { padding: var(--space-sm); }

        .wish-card-name {
          font-family: var(--font-display); font-size: var(--text-body); font-weight: 500;
          color: var(--text-primary); margin: 0 0 0.25rem; max-width: none; line-height: 1.3;
        }
        .wish-card-name a { color: inherit; text-decoration: none; transition: color 200ms var(--ease); }
        .wish-card-name a:hover { color: var(--bronze); }

        .wish-card-price {
          font-size: var(--text-body); color: var(--text-primary); font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .wish-card-actions { display: flex; gap: 0.5rem; }

        .wish-btn-cart {
          flex: 1; text-align: center; padding: 0.75rem var(--space-sm); font-family: var(--font-body);
          font-size: var(--text-caption); letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--bg-primary); background: var(--walnut); border: 1px solid var(--walnut);
          cursor: pointer; transition: all 200ms var(--ease); min-height: 44px;
          position: relative; overflow: hidden;
        }
        .wish-btn-cart:hover { background: #3d2e23; }
        .wish-btn-cart:active { transform: scale(0.97); }
        .wish-btn-cart:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
        .wish-btn-cart:disabled { opacity: 0.6; cursor: not-allowed; }
        .wish-btn-cart .btn-label { transition: opacity 200ms var(--ease); }
        .wish-btn-cart.is-added .btn-label { opacity: 0; }
        .wish-btn-cart .btn-check {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          opacity: 0; transition: opacity 200ms var(--ease);
        }
        .wish-btn-cart.is-added .btn-check { opacity: 1; }

        .wish-btn-view {
          flex: 1; text-align: center; padding: 0.75rem var(--space-sm); font-family: var(--font-body);
          font-size: var(--text-caption); letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--text-secondary); background: transparent; border: 1px solid var(--stone);
          cursor: pointer; text-decoration: none; display: flex; align-items: center;
          justify-content: center; transition: all 200ms var(--ease); min-height: 44px;
        }
        .wish-btn-view:hover { color: var(--text-primary); border-color: rgba(43,34,27,0.2); }
        .wish-btn-view:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }

        /* Mobile card */
        @media (max-width: 860px) {
          .wish-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
        }
        @media (max-width: 560px) {
          .wish-page { padding: calc(var(--space-lg) + var(--space-md)) 0 var(--space-lg); min-height: 50vh; }
          .wish-page-header h1 { font-size: var(--text-h2); }
          .wish-empty { padding: var(--space-lg) 0; }
          .wish-grid { grid-template-columns: 1fr; }
          .wish-card { display: grid; grid-template-columns: 100px 1fr; }
          .wish-card-img { aspect-ratio: 1/1; }
          .wish-card-body { padding: var(--space-sm); display: flex; flex-direction: column; justify-content: center; }
          .wish-card-actions { flex-direction: column; }
          .wish-card-remove { opacity: 1; transform: scale(1); top: 0.5rem; right: 0.5rem; width: 32px; height: 32px; }
        }
        @media (max-width: 430px) {
          .wish-card { grid-template-columns: 80px 1fr; }
          .wish-card-img { width: 80px; height: 80px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .wish-card, .wish-card-img img, .wish-card-remove, .wish-btn-cart, .wish-btn-view {
            transition: none !important;
          }
        }
      `}</style>

      <section className="wish-page">
        <div className="container">
          <div className="wish-page-header">
            <h1>Your Wishlist</h1>
            {mounted && isLoggedIn && wishlistItems.length > 0 && (
              <p className="wish-count">{wishlistItems.length} {wishlistItems.length === 1 ? 'piece' : 'pieces'}</p>
            )}
          </div>

          {!mounted && null}

          {mounted && !isLoggedIn && (
            <div className="wish-login">
              <svg className="wish-login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <h2>Sign in to view your wishlist</h2>
              <p>Save and manage your favourite handcrafted pieces.</p>
              <Link href="/login" className="btn-primary">Sign In</Link>
            </div>
          )}

          {mounted && isLoggedIn && wishlistItems.length === 0 && (
            <div className="wish-empty">
              <svg className="wish-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <h2>Your wishlist is empty</h2>
              <p>Discover pieces that speak to you and save them here.</p>
              <Link href="/gallery" className="btn-primary">Browse the Collection</Link>
            </div>
          )}

          {mounted && isLoggedIn && wishlistItems.length > 0 && (
            <div className="wish-grid">
              {wishlistItems.map((item) => (
                <div className={`wish-card ${removingId === item.id ? 'is-removing' : ''}`} key={item.id}>
                  <div className="wish-card-img">
                    <Link href={`/shop/${item.id}`}>
                      <img loading="lazy" src={item.image || ''} alt={item.name} />
                    </Link>
                    <button
                      className="wish-card-remove"
                      onClick={() => removeFromWishlist(item.id)}
                      aria-label={`Remove ${item.name} from wishlist`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div className="wish-card-body">
                    <p className="wish-card-name">
                      <Link href={`/shop/${item.id}`}>{item.name}</Link>
                    </p>
                    {item.price && <p className="wish-card-price">{item.price}</p>}
                    <div className="wish-card-actions">
                      <button
                        className={`wish-btn-cart ${addedId === item.id ? 'is-added' : ''}`}
                        onClick={() => addToCart(item)}
                        disabled={addedId === item.id}
                      >
                        <span className="btn-label">{addedId === item.id ? 'Added' : 'Add to Cart'}</span>
                        <span className="btn-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      </button>
                      <Link href={`/shop/${item.id}`} className="wish-btn-view">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

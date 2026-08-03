'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.Teakle) {
      setIsLoggedIn(window.Teakle.isLoggedIn());
      renderWishlist();
    }
  }, []);

  function renderWishlist() {
    const wl = window.Teakle.getWishlist();
    setWishlistItems(wl);
  }

  function addToCart(item) {
    window.Teakle.addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  function removeFromWishlist(id) {
    window.Teakle.toggleWishlist({ id });
    renderWishlist();
  }

  return (
    <>
      <style>{`
        .wishlist-section {
          padding: calc(var(--space-2xl) + var(--space-xl)) 0 var(--space-xl);
          min-height: 60vh;
        }
        .wishlist-empty {
          text-align: center;
          padding: var(--space-2xl) 0;
        }
        .wishlist-empty h2 {
          font-size: var(--text-subhead);
          margin-bottom: var(--space-sm);
          max-width: none;
        }
        .wishlist-empty p {
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
          max-width: none;
        }

        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
        }
        .wishlist-card {
          background: var(--bg-secondary);
          border: var(--border-subtle);
          overflow: hidden;
          transition: box-shadow var(--dur-fast) var(--ease);
        }
        .wishlist-card:hover { box-shadow: var(--shadow-card-hover); }
        .wishlist-card:active { transform: scale(0.99); }
        .wishlist-card-actions button:active,
        .wishlist-card-actions a:active { opacity: 0.7; }
        .wishlist-card-actions button:focus-visible,
        .wishlist-card-actions a:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
        .wishlist-card-image {
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: var(--stone);
        }
        .wishlist-card-image img { width: 100%; height: 100%; object-fit: cover; }
        .wishlist-card-body {
          padding: var(--space-sm);
        }
        .wishlist-card-body h3 {
          font-size: var(--text-body);
          font-weight: 600;
          margin-bottom: var(--space-xs);
          max-width: none;
        }
        .wishlist-card-body .item-price {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          display: block;
          margin-bottom: var(--space-sm);
        }
        .wishlist-card-actions {
          display: flex;
          gap: var(--space-xs);
        }
        .wishlist-card-actions button,
        .wishlist-card-actions a {
          flex: 1;
          text-align: center;
          padding: var(--space-sm) var(--space-sm);
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
        }
        .btn-add-cart {
          color: var(--bg-primary);
          background: var(--walnut);
          border: 1px solid var(--walnut);
        }
        .btn-add-cart:hover { background: var(--forest); border-color: var(--forest); }
        .btn-remove-wish {
          color: var(--text-secondary);
          background: none;
          border: 1px solid var(--stone);
        }
        .btn-remove-wish:hover { color: var(--error); border-color: var(--error); }

        @media (max-width: 860px) {
          .wishlist-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
          .wishlist-card-body h3 { font-size: var(--text-subhead); }
          .wishlist-card-body .item-price { font-size: var(--text-caption); }
          .wishlist-card-actions button,
          .wishlist-card-actions a { font-size: var(--text-caption); padding: var(--space-sm); min-height: 44px; }
        }
        @media (max-width: 560px) {
          .wishlist-section { padding: calc(var(--space-lg) + var(--space-md)) 0 var(--space-lg); min-height: 50vh; }
          .wishlist-section h1 { font-size: var(--text-h1); }
          .wishlist-empty { padding: var(--space-lg) 0; }
          .wishlist-empty h2 { font-size: var(--text-h2); }
          .wishlist-empty p { font-size: var(--text-body); }
          .wishlist-grid { grid-template-columns: 1fr; gap: var(--space-sm); }
          .wishlist-card { display: grid; grid-template-columns: 100px 1fr; }
          .wishlist-card-image { aspect-ratio: 1/1; }
          .wishlist-card-body { padding: var(--space-sm); display: flex; flex-direction: column; justify-content: center; }
          .wishlist-card-body h3 { font-size: var(--text-subhead); margin-bottom: var(--space-xs); }
          .wishlist-card-body .item-price { font-size: var(--text-caption); margin-bottom: var(--space-sm); }
          .wishlist-card-actions { flex-direction: column; gap: var(--space-xs); }
          .wishlist-card-actions button,
          .wishlist-card-actions a { font-size: var(--text-caption); padding: var(--space-sm); min-height: 44px; }
        }
        @media (max-width: 430px) {
          .wishlist-card { grid-template-columns: 80px 1fr; }
          .wishlist-empty h2 { font-size: var(--text-subhead); }
        }
      `}</style>

      <section className="wishlist-section">
        <div className="container">
          <div className="page-header" style={{ padding: '0 0 var(--space-md)' }}>
            <h1 style={{ fontSize: 'var(--text-h1)', textAlign: 'left', maxWidth: 'none' }}>Your Wishlist</h1>
          </div>

          <div id="wishlistContent">
            {mounted && !isLoggedIn && (
              <div className="wishlist-empty">
                <h2>Sign in to view your wishlist</h2>
                <p>You need an account to save and manage your favourite pieces.</p>
                <Link href="/login" className="btn-primary">Sign In</Link>
              </div>
            )}

            {mounted && isLoggedIn && wishlistItems.length === 0 && (
              <div className="wishlist-empty">
                <h2>Your wishlist is empty</h2>
                <p>Browse the gallery and save pieces you love.</p>
                <Link href="/gallery" className="btn-primary">Browse Gallery</Link>
              </div>
            )}

            {mounted && isLoggedIn && wishlistItems.length > 0 && (
              <div className="wishlist-grid">
                {wishlistItems.map((item) => (
                  <div className="wishlist-card" key={item.id} data-id={item.id}>
                    <div className="wishlist-card-image">
                      <img loading="lazy" src={item.image || ''} alt={item.name} />
                    </div>
                    <div className="wishlist-card-body">
                      <h3>{item.name}</h3>
                      {item.price && <span className="item-price">{item.price}</span>}
                      <div className="wishlist-card-actions">
                        <button
                          className="btn-add-cart"
                          onClick={() => addToCart(item)}
                          disabled={addedId === item.id}
                        >
                          {addedId === item.id ? 'Added' : 'Add to Cart'}
                        </button>
                        <button
                          className="btn-remove-wish"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

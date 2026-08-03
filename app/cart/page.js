'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.Teakle) {
      renderCart();
    }
  }, []);

  function renderCart() {
    const cart = window.Teakle.getCart();
    setCartItems(cart);

    let sum = 0;
    cart.forEach((item) => {
      if (item.price) {
        const num = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) sum += num * (item.qty || 1);
      }
    });
    setTotal(sum);
  }

  function updateQty(id, newQty) {
    window.Teakle.updateCartQty(id, newQty);
    renderCart();
  }

  function removeItem(id) {
    window.Teakle.removeFromCart(id);
    renderCart();
  }

  function handleCheckout() {
    if (!window.Teakle.isLoggedIn()) {
      window.location.href = '/login';
    } else {
      alert('Checkout coming soon!');
    }
  }

  const itemCount = cartItems.reduce((s, c) => s + (c.qty || 1), 0);

  return (
    <>
      <style>{`
        .cart-section {
          padding: calc(var(--space-2xl) + var(--space-xl)) 0 var(--space-xl);
          min-height: 60vh;
        }
        .cart-empty {
          text-align: center;
          padding: var(--space-2xl) 0;
        }
        .cart-empty h2 {
          font-size: var(--text-h1);
          margin-bottom: var(--space-sm);
          max-width: none;
        }
        .cart-empty p {
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
          max-width: none;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: var(--space-lg);
          align-items: start;
        }

        .cart-items { display: flex; flex-direction: column; gap: var(--space-sm); }

        .cart-item {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: var(--space-sm);
          align-items: center;
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border: var(--border-subtle);
        }
        .cart-item-image {
          width: 80px;
          height: 80px;
          overflow: hidden;
          background: var(--stone);
        }
        .cart-item-image img { width: 100%; height: 100%; object-fit: cover; }
        .cart-item-info h3 {
          font-size: var(--text-body);
          font-weight: 600;
          margin-bottom: var(--space-xs);
          max-width: none;
        }
        .cart-item-info .item-price {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          max-width: none;
        }
        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .qty-control {
          display: flex;
          align-items: center;
          border: 1px solid var(--stone);
        }
        .qty-control button {
          width: 44px;
          height: 44px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: var(--text-body);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--dur-fast) var(--ease);
        }
        .qty-control button:hover { background: var(--stone); }
        .qty-control button:active { background: var(--bronze); color: var(--bg-primary); }
        .qty-control button:focus-visible { outline: 2px solid var(--bronze); outline-offset: 2px; }
        .qty-control span {
          width: 44px;
          text-align: center;
          font-size: var(--text-body);
          font-weight: 600;
          border-left: 1px solid var(--stone);
          border-right: 1px solid var(--stone);
          line-height: 44px;
        }
        .remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: var(--space-xs) 0;
          transition: color var(--dur-fast) var(--ease);
        }
        .remove-btn:hover { color: var(--error); }
        .remove-btn:active { opacity: 0.7; }
        .remove-btn:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }

        .cart-summary {
          background: var(--bg-secondary);
          padding: var(--space-md);
          border: var(--border-subtle);
          position: sticky;
          top: 120px;
        }
        .cart-summary h2 {
          font-size: var(--text-body);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: var(--space-sm);
          max-width: none;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-sm) 0;
          font-size: var(--text-body);
          max-width: none;
        }
        .summary-row.total {
          border-top: 1px solid var(--stone);
          margin-top: var(--space-sm);
          padding-top: var(--space-sm);
          font-weight: 600;
          font-size: var(--text-subhead);
        }
        .checkout-btn {
          display: block;
          width: 100%;
          margin-top: var(--space-sm);
          padding: var(--space-md);
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--bg-primary);
          background: var(--walnut);
          border: 1px solid var(--walnut);
          cursor: pointer;
          text-align: center;
          transition: background var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
        }
        .checkout-btn:hover { background: var(--forest); }
        .checkout-btn:active { transform: scale(0.97); }
        .checkout-btn:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }

        .continue-link {
          display: block;
          text-align: center;
          margin-top: var(--space-sm);
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--stone);
          padding-bottom: var(--space-xs);
          max-width: none;
          transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
        }
        .continue-link:hover { color: var(--bronze); border-color: var(--bronze); }

        @media (max-width: 860px) {
          .cart-layout { grid-template-columns: 1fr; gap: var(--space-md); }
          .cart-summary { position: static; }
          .cart-item { grid-template-columns: 60px 1fr; gap: var(--space-sm); }
          .cart-item-actions { grid-column: 1 / -1; justify-content: space-between; }
          .cart-item-info h3 { font-size: var(--text-subhead); }
          .cart-item-info .item-price { font-size: var(--text-caption); }
          .remove-btn { font-size: var(--text-caption); }
          .qty-control button { width: 44px; height: 44px; }
          .qty-control span { width: 44px; line-height: 44px; }
          .checkout-btn { font-size: var(--text-caption); }
          .continue-link { font-size: var(--text-caption); }
        }
        @media (max-width: 560px) {
          .cart-section { padding: calc(var(--space-lg) + var(--space-md)) 0 var(--space-lg); min-height: 50vh; }
          .cart-section h1 { font-size: var(--text-h1); }
          .cart-empty { padding: var(--space-lg) 0; }
          .cart-empty h2 { font-size: var(--text-h2); }
          .cart-empty p { font-size: var(--text-body); }
          .cart-item { grid-template-columns: 50px 1fr; gap: var(--space-sm); padding: var(--space-sm) 0; }
          .cart-item-info h3 { font-size: var(--text-subhead); }
          .cart-item-info .item-price { font-size: var(--text-caption); }
          .qty-control button { width: 44px; height: 44px; }
          .qty-control span { width: 44px; line-height: 44px; font-size: var(--text-caption); }
          .remove-btn { font-size: var(--text-caption); }
          .cart-summary-inner { padding: var(--space-md); }
          .summary-row { font-size: var(--text-body); padding: var(--space-sm) 0; }
          .summary-total { font-size: var(--text-subhead); }
          .cart-checkout { min-height: 48px; font-size: var(--text-caption); }
          .continue-link { font-size: var(--text-caption); }
        }
        @media (max-width: 430px) {
          .cart-section { padding-top: calc(var(--space-lg) + var(--space-sm)); }
          .cart-item { grid-template-columns: 44px 1fr; }
          .cart-empty h2 { font-size: 1.25rem; }
          .summary-total { font-size: var(--text-subhead); }
        }
      `}</style>

      <section className="cart-section">
        <div className="container">
          <div className="page-header" style={{ padding: '0 0 var(--space-md)' }}>
            <h1 style={{ fontSize: 'var(--text-h1)', textAlign: 'left', maxWidth: 'none' }}>Your Cart</h1>
          </div>

          {mounted && cartItems.length === 0 && (
            <div className="cart-empty">
              <h2>Your cart is empty</h2>
              <p>Find something you love in the gallery.</p>
              <Link href="/gallery" className="btn-primary">Browse Gallery</Link>
            </div>
          )}

          {mounted && cartItems.length > 0 && (
            <div className="cart-layout">
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div className="cart-item" key={item.id} data-id={item.id}>
                    <div className="cart-item-image">
                      <img loading="lazy" src={item.image || ''} alt={item.name} />
                    </div>
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      {item.price && <span className="item-price">{item.price}</span>}
                    </div>
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button
                          className="qty-minus"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(item.id, (item.qty || 1) - 1)}
                        >
                          &minus;
                        </button>
                        <span>{item.qty || 1}</span>
                        <button
                          className="qty-plus"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <h2>Summary</h2>
                <div className="summary-row">
                  <span>Items</span>
                  <span>{itemCount}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{total > 0 ? `₹${total.toLocaleString()}` : '—'}</span>
                </div>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
                <Link href="/gallery" className="continue-link">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

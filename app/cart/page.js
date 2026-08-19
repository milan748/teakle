'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customerCart } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = window.Teakle;
    const loggedIn = t && t.isLoggedIn();
    setIsLoggedIn(!!loggedIn);
    if (t) setCartItems(t.getCart());

    if (loggedIn) {
      customerCart.get().then(result => {
        if (result && result.items) setCartItems(result.items);
      });
    }
  }, []);

  const refreshCart = useCallback(() => {
    if (window.Teakle) setCartItems(window.Teakle.getCart());
  }, []);

  async function updateQty(id, newQty) {
    if (newQty < 1) return;
    window.Teakle.updateCartQty(id, Math.min(10, newQty));
    refreshCart();
    if (isLoggedIn) {
      const result = await customerCart.update(id, Math.min(10, newQty));
      if (result && result.items) setCartItems(result.items);
    }
  }

  async function removeItem(id) {
    setRemovingId(id);
    setTimeout(async () => {
      window.Teakle.removeFromCart(id);
      refreshCart();
      if (isLoggedIn) {
        const result = await customerCart.remove(id);
        if (result && result.items) setCartItems(result.items);
      }
      setRemovingId(null);
    }, 300);
  }

  async function saveForLater(item) {
    setSavingId(item.id);
    window.Teakle.toggleWishlist({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    setTimeout(async () => {
      window.Teakle.removeFromCart(item.id);
      refreshCart();
      if (isLoggedIn) {
        await customerCart.remove(item.id);
      }
      setSavingId(null);
    }, 400);
  }

  function handleCheckout() {
    router.push('/checkout');
  }

  const itemCount = cartItems.reduce((s, c) => s + (c.qty || 1), 0);
  const subtotal = cartItems.reduce((s, c) => {
    const num = parseFloat((c.price || '').replace(/[^0-9.]/g, ''));
    return s + (isNaN(num) ? 0 : num * (c.qty || 1));
  }, 0);

  const formatPrice = (n) => n > 0 ? `\u20B9${n.toLocaleString('en-IN')}` : '\u2014';

  return (
    <>
      <title>Your Cart — Teakle</title>
      <style>{`
        .cart-page {
          padding: calc(var(--space-2xl) + var(--space-xl)) 0 var(--space-xl);
          min-height: 70vh;
        }

        .cart-page-header {
          margin-bottom: var(--space-lg);
          border-bottom: 1px solid rgba(43,34,27,0.08);
          padding-bottom: var(--space-sm);
        }
        .cart-page-header h1 {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 3vw, var(--text-h1));
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--text-primary);
          margin: 0;
          max-width: none;
        }
        .cart-page-header .cart-count-label {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          margin-top: 0.25rem;
          letter-spacing: 0.02em;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: var(--space-lg);
          align-items: start;
        }

        /* --- Empty State --- */
        .cart-empty {
          text-align: center;
          padding: var(--space-2xl) 0;
          grid-column: 1 / -1;
        }
        .cart-empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--space-md);
          color: var(--bronze);
          opacity: 0.25;
        }
        .cart-empty h2 {
          font-family: var(--font-display);
          font-size: var(--text-h2);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 0.5rem;
          max-width: none;
        }
        .cart-empty p {
          color: var(--text-secondary);
          margin: 0 0 var(--space-md);
          max-width: none;
          font-size: var(--text-body);
        }
        .cart-empty .btn-primary {
          display: inline-block;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--bg-primary);
          background: var(--walnut);
          border: 1px solid var(--walnut);
          padding: 0.875rem 2.5rem;
          text-decoration: none;
          cursor: pointer;
          transition: background 250ms var(--ease), transform 200ms var(--ease);
        }
        .cart-empty .btn-primary:hover { background: #3d2e23; transform: translateY(-1px); }

        /* --- Cart Items --- */
        .cart-items { display: flex; flex-direction: column; gap: 1px; }

        .cart-item {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: var(--space-sm);
          align-items: center;
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border: var(--border-subtle);
          transition: opacity 300ms var(--ease), transform 300ms var(--ease), background 200ms var(--ease);
        }
        .cart-item:hover { background: rgba(43,34,27,0.02); }
        .cart-item.is-removing { opacity: 0; transform: translateX(-20px); pointer-events: none; }

        .cart-item-image {
          width: 100px;
          height: 100px;
          overflow: hidden;
          background: var(--stone);
          flex-shrink: 0;
        }
        .cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 500ms var(--ease);
        }
        .cart-item:hover .cart-item-image img { transform: scale(1.04); }

        .cart-item-info {
          min-width: 0;
        }
        .cart-item-name {
          font-family: var(--font-display);
          font-size: var(--text-body);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 0.25rem;
          max-width: none;
          line-height: 1.3;
        }
        .cart-item-name a {
          color: inherit;
          text-decoration: none;
          transition: color 200ms var(--ease);
        }
        .cart-item-name a:hover { color: var(--bronze); }
        .cart-item-price {
          font-size: var(--text-body);
          color: var(--text-primary);
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .cart-item-meta {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          opacity: 0.7;
        }

        .cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.75rem;
        }

        .cart-item-price-lg {
          font-family: var(--font-display);
          font-size: var(--text-body);
          font-weight: 500;
          color: var(--text-primary);
          text-align: right;
        }

        .cart-item-btns {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* Qty Control */
        .qty-control {
          display: flex;
          align-items: center;
          border: 1px solid var(--stone);
        }
        .qty-btn {
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: var(--text-body);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms var(--ease), color 150ms var(--ease);
        }
        .qty-btn:hover { background: var(--stone); }
        .qty-btn:active { background: var(--bronze); color: var(--bg-primary); }
        .qty-btn:focus-visible { outline: 2px solid var(--bronze); outline-offset: 2px; }
        .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .qty-val {
          width: 44px;
          text-align: center;
          font-size: var(--text-body);
          font-weight: 500;
          border-left: 1px solid var(--stone);
          border-right: 1px solid var(--stone);
          line-height: 40px;
          user-select: none;
        }

        /* Action buttons */
        .cart-action-link {
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-secondary);
          padding: 0;
          transition: color 150ms var(--ease);
          white-space: nowrap;
        }
        .cart-action-link:hover { color: var(--text-primary); }
        .cart-action-link.is-danger:hover { color: #8B6B4A; }
        .cart-action-link:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
        .cart-action-link:disabled { opacity: 0.5; cursor: not-allowed; }

        /* --- Summary --- */
        .cart-summary {
          background: var(--bg-secondary);
          padding: var(--space-md);
          border: var(--border-subtle);
          position: sticky;
          top: 120px;
        }
        .cart-summary h2 {
          font-family: var(--font-display);
          font-size: var(--text-body);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-primary);
          margin: 0 0 var(--space-sm);
          max-width: none;
        }

        .summary-rows { margin-bottom: var(--space-sm); }
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0;
          font-size: var(--text-body);
          color: var(--text-primary);
          max-width: none;
        }
        .summary-row .label { color: var(--text-secondary); }
        .summary-row .value { font-weight: 500; }
        .summary-row.is-discount .value { color: var(--forest); }

        .summary-divider {
          height: 1px;
          background: rgba(43,34,27,0.08);
          margin: 0.25rem 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-sm) 0 0;
          border-top: 1px solid rgba(43,34,27,0.12);
          margin-top: 0.25rem;
        }
        .summary-total .label {
          font-family: var(--font-display);
          font-size: var(--text-body);
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-primary);
        }
        .summary-total .value {
          font-family: var(--font-display);
          font-size: var(--text-h2);
          font-weight: 500;
          color: var(--text-primary);
        }

        .summary-note {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          opacity: 0.7;
          margin: 0.75rem 0 0;
          line-height: 1.5;
          max-width: none;
        }

        .checkout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          margin-top: var(--space-sm);
          padding: 1rem;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          color: var(--bg-primary);
          background: var(--walnut);
          border: 1px solid var(--walnut);
          cursor: pointer;
          text-align: center;
          transition: background 250ms var(--ease), transform 200ms var(--ease), box-shadow 250ms var(--ease);
          min-height: 52px;
        }
        .checkout-btn:hover { background: #3d2e23; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(43,34,27,0.15); }
        .checkout-btn:active { transform: translateY(0) scale(0.98); }
        .checkout-btn:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
        .checkout-btn svg { width: 16px; height: 16px; }

        .continue-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          width: 100%;
          margin-top: 0.75rem;
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          padding: 0.75rem;
          text-decoration: none;
          border: 1px solid rgba(43,34,27,0.1);
          transition: color 150ms var(--ease), border-color 150ms var(--ease), background 150ms var(--ease);
        }
        .continue-link:hover { color: var(--text-primary); border-color: rgba(43,34,27,0.2); background: rgba(43,34,27,0.015); }
        .continue-link svg { width: 14px; height: 14px; }

        /* --- Trust Signals --- */
        .cart-trust {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          margin-top: var(--space-md);
          border: var(--border-subtle);
          background: var(--bg-secondary);
        }
        .cart-trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--space-sm) 0.5rem;
          border-right: 1px solid rgba(43,34,27,0.06);
        }
        .cart-trust-item:last-child { border-right: none; }
        .cart-trust-item svg {
          width: 22px;
          height: 22px;
          color: var(--bronze);
          opacity: 0.55;
          margin-bottom: 0.5rem;
        }
        .cart-trust-item .trust-label {
          font-size: 0.55rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* --- Mobile Sticky CTA --- */
        .cart-mobile-cta {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: var(--bg-primary);
          border-top: 1px solid rgba(43,34,27,0.08);
          padding: 0.75rem var(--space-sm);
          padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
          box-shadow: 0 -2px 12px rgba(43,34,27,0.06);
        }
        .cart-mobile-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-sm);
        }
        .cart-mobile-total {
          font-family: var(--font-display);
          font-size: var(--text-body);
          font-weight: 500;
          color: var(--text-primary);
        }
        .cart-mobile-total span {
          display: block;
          font-size: 0.55rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-weight: 400;
          margin-bottom: 0.125rem;
        }
        .cart-mobile-btn {
          padding: 0.875rem 2rem;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          color: var(--bg-primary);
          background: var(--walnut);
          border: 1px solid var(--walnut);
          cursor: pointer;
          min-height: 48px;
          transition: background 200ms var(--ease);
        }
        .cart-mobile-btn:hover { background: #3d2e23; }

        /* --- Responsive --- */
        @media (max-width: 860px) {
          .cart-layout { grid-template-columns: 1fr; gap: var(--space-md); }
          .cart-summary { position: static; }
          .cart-mobile-cta { display: block; }
          .cart-page { padding-bottom: 100px; }
        }

        @media (max-width: 560px) {
          .cart-page { padding: calc(var(--space-lg) + var(--space-md)) 0 var(--space-lg); min-height: 50vh; }
          .cart-page-header h1 { font-size: var(--text-h2); }
          .cart-empty { padding: var(--space-lg) 0; }
          .cart-empty h2 { font-size: var(--text-body); }
          .cart-item { grid-template-columns: 80px 1fr; gap: var(--space-sm); padding: var(--space-sm) 0; border-bottom: 1px solid rgba(43,34,27,0.06); }
          .cart-item-actions { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: space-between; margin-top: 0.25rem; }
          .cart-item-btns { gap: 0.5rem; }
          .cart-item-price-lg { text-align: left; }
          .cart-trust { grid-template-columns: 1fr; }
          .cart-trust-item { flex-direction: row; gap: 0.75rem; text-align: left; padding: 0.75rem var(--space-sm); border-right: none; border-bottom: 1px solid rgba(43,34,27,0.06); }
          .cart-trust-item:last-child { border-bottom: none; }
          .cart-trust-item svg { margin-bottom: 0; }
          .qty-btn { width: 44px; height: 44px; }
          .qty-val { width: 44px; line-height: 44px; }
        }

        @media (max-width: 430px) {
          .cart-item { grid-template-columns: 64px 1fr; }
          .cart-item-image { width: 64px; height: 64px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cart-item, .cart-item-image img { transition: none !important; }
        }
      `}</style>

      <section className="cart-page">
        <div className="container">
          <div className="cart-page-header">
            <h1>Your Cart</h1>
            {mounted && cartItems.length > 0 && (
              <p className="cart-count-label">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
            )}
          </div>

          {!mounted && null}

          {mounted && cartItems.length === 0 && (
            <div className="cart-empty">
              <svg className="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <h2>Your cart is empty</h2>
              <p>Discover handcrafted pieces made to last generations.</p>
              <Link href="/gallery" className="btn-primary">Browse the Collection</Link>
            </div>
          )}

          {mounted && cartItems.length > 0 && (
            <div className="cart-layout">
              <div className="cart-items">
                {cartItems.map((item) => {
                  const product = typeof window !== 'undefined' && window.TEAKLE_PRODUCTS
                    ? window.TEAKLE_PRODUCTS.find((p) => p.id === item.id)
                    : null;
                  const isHero = product?.isHero === true;
                  return (
                  <div className={`cart-item ${removingId === item.id ? 'is-removing' : ''}`} key={item.id}>
                    <div className="cart-item-image">
                      <Link href={`/shop/${item.id}`}>
                        <img loading="lazy" src={item.image || ''} alt={item.name} />
                      </Link>
                    </div>
                    <div className="cart-item-info">
                      <p className="cart-item-name">
                        <Link href={`/shop/${item.id}`}>{item.name}</Link>
                      </p>
                      {item.price && <p className="cart-item-price">{item.price}</p>}
                      <p className="cart-item-meta">{isHero ? 'One of one' : 'Handcrafted \u00B7 In Stock'}</p>
                    </div>
                    <div className="cart-item-actions">
                      <p className="cart-item-price-lg">{item.price || ''}</p>
                      <div className="cart-item-btns">
                        {isHero ? (
                          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--bronze)', letterSpacing: '0.04em', fontWeight: 500 }}>One available</span>
                        ) : (
                        <div className="qty-control" role="group" aria-label={`Quantity for ${item.name}`}>
                          <button
                            className="qty-btn"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(item.id, (item.qty || 1) - 1)}
                            disabled={(item.qty || 1) <= 1}
                          >
                            &minus;
                          </button>
                          <span className="qty-val" aria-live="polite">{item.qty || 1}</span>
                          <button
                            className="qty-btn"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                            disabled={(item.qty || 1) >= 10}
                          >
                            +
                          </button>
                        </div>
                        )}
                        <button
                          className="cart-action-link"
                          onClick={() => saveForLater(item)}
                          disabled={savingId === item.id}
                        >
                          {savingId === item.id ? 'Saving...' : 'Save for Later'}
                        </button>
                        <button
                          className="cart-action-link is-danger"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                <h2>Order Summary</h2>
                <div className="summary-rows">
                  <div className="summary-row">
                    <span className="label">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="value">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Shipping</span>
                    <span className="value" style={{ fontSize: 'var(--text-caption)', color: 'var(--text-secondary)' }}>Calculated at checkout</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Tax</span>
                    <span className="value" style={{ fontSize: 'var(--text-caption)', color: 'var(--text-secondary)' }}>Applicable taxes calculated at checkout</span>
                  </div>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-total">
                  <span className="label">Estimated Total</span>
                  <span className="value">{formatPrice(subtotal)}</span>
                </div>
                <p className="summary-note">Final shipping and tax calculated during checkout.</p>

                <button className="checkout-btn" onClick={handleCheckout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Proceed to Checkout
                </button>
                <Link href="/gallery" className="continue-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Continue Shopping
                </Link>
              </div>

              <div className="cart-trust">
                <div className="cart-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span className="trust-label">Handcrafted Quality</span>
                </div>
                <div className="cart-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                  <span className="trust-label">Solid Wood</span>
                </div>
                <div className="cart-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="trust-label">Carefully Packed</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky CTA */}
        {mounted && cartItems.length > 0 && (
          <div className="cart-mobile-cta">
            <div className="cart-mobile-cta-inner">
              <div className="cart-mobile-total">
                <span>Estimated Total</span>
                {formatPrice(subtotal)}
              </div>
              <button className="cart-mobile-btn" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STEPS = ['Shipping', 'Review', 'Payment'];

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [isGuest, setIsGuest] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', apartment: '', city: '', state: '', pin: '', country: 'India',
  });
  const [sameBilling, setSameBilling] = useState(true);
  const [billing, setBilling] = useState({
    firstName: '', lastName: '', address: '', apartment: '', city: '', state: '', pin: '',
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.Teakle) {
      const cart = window.Teakle.getCart();
      setCartItems(cart);
      if (cart.length === 0) { router.push('/cart'); return; }
      if (window.Teakle.isLoggedIn()) {
        setIsLoggedIn(true);
        setIsGuest(false);
        const user = window.Teakle.getCurrentUser();
        if (user) {
          setShipping(prev => ({ ...prev, firstName: user.name?.split(' ')[0] || '', lastName: user.name?.split(' ').slice(1).join(' ') || '', email: user.email || '', phone: user.phone || '' }));
        }
      }
    }
  }, [router]);

  const subtotal = cartItems.reduce((s, c) => {
    const num = parseFloat((c.price || '').replace(/[^0-9.]/g, ''));
    return s + (isNaN(num) ? 0 : num * (c.qty || 1));
  }, 0);
  const itemCount = cartItems.reduce((s, c) => s + (c.qty || 1), 0);
  const formatPrice = (n) => n > 0 ? `\u20B9${n.toLocaleString('en-IN')}` : '\u2014';

  const updateShipping = useCallback((field, val) => {
    setShipping(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const updateBilling = useCallback((field, val) => {
    setBilling(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  function validateShipping() {
    const e = {};
    if (!shipping.firstName.trim()) e.firstName = 'Required';
    if (!shipping.lastName.trim()) e.lastName = 'Required';
    if (!shipping.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(shipping.email)) e.email = 'Invalid email';
    if (!shipping.address.trim()) e.address = 'Required';
    if (!shipping.city.trim()) e.city = 'Required';
    if (!shipping.state.trim()) e.state = 'Required';
    if (!shipping.pin.trim()) e.pin = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    if (step === 0 && !validateShipping()) return;
    setStep(prev => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prevStep() {
    setStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePlaceOrder() {
    setIsProcessing(true);
    setTimeout(() => {
      window.Teakle && window.Teakle.updateCartQty && cartItems.forEach(item => window.Teakle.removeFromCart(item.id));
      router.push('/account');
    }, 2000);
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '0.875rem 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)',
    color: 'var(--text-primary)', background: 'transparent', border: 'none',
    borderBottom: hasError ? '1.5px solid #8B6B4A' : '1px solid var(--stone)',
    outline: 'none', transition: 'border-color 300ms var(--ease)',
  });

  const labelStyle = {
    display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.375rem', fontWeight: 500,
  };

  const errStyle = {
    fontSize: '0.6rem', color: '#8B6B4A', marginTop: '0.25rem', letterSpacing: '0.02em',
  };

  return (
    <>
      <title>Checkout — Teakle</title>
      <style>{`
        .checkout-page {
          padding: calc(var(--space-2xl) + var(--space-xl)) 0 var(--space-xl);
          min-height: 70vh;
        }
        .checkout-header {
          margin-bottom: var(--space-lg);
          border-bottom: 1px solid rgba(43,34,27,0.08);
          padding-bottom: var(--space-sm);
        }
        .checkout-header h1 {
          font-family: var(--font-display); font-size: clamp(1.75rem, 3vw, var(--text-h1));
          font-weight: 500; letter-spacing: -0.01em; color: var(--text-primary);
          margin: 0; max-width: none;
        }

        /* Steps */
        .checkout-steps {
          display: flex; align-items: center; gap: 0; margin-bottom: var(--space-lg);
          border-bottom: 1px solid rgba(43,34,27,0.06); padding-bottom: var(--space-sm);
        }
        .step-item {
          display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
          padding: 0.5rem 0; font-size: var(--text-caption); letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-secondary); transition: color 200ms var(--ease);
          background: none; border: none; font-family: var(--font-body);
        }
        .step-item:hover { color: var(--text-primary); }
        .step-item.is-active { color: var(--text-primary); font-weight: 500; }
        .step-item.is-done { color: var(--bronze); }
        .step-num {
          width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 0.6rem; font-weight: 600;
          border: 1.5px solid var(--stone); transition: all 200ms var(--ease);
        }
        .step-item.is-active .step-num { border-color: var(--walnut); background: var(--walnut); color: var(--bg-primary); }
        .step-item.is-done .step-num { border-color: var(--bronze); background: var(--bronze); color: var(--bg-primary); }
        .step-divider { flex: 1; height: 1px; background: rgba(43,34,27,0.08); margin: 0 0.75rem; }

        /* Layout */
        .checkout-layout {
          display: grid; grid-template-columns: 1fr 360px; gap: var(--space-lg); align-items: start;
        }
        .checkout-form { min-width: 0; }

        /* Form sections */
        .checkout-section {
          background: var(--bg-secondary); border: var(--border-subtle);
          padding: var(--space-md); margin-bottom: var(--space-sm);
        }
        .checkout-section-title {
          font-family: var(--font-display); font-size: var(--text-body); font-weight: 500;
          color: var(--text-primary); margin: 0 0 var(--space-sm); max-width: none;
          letter-spacing: -0.005em;
        }
        .form-row { margin-bottom: 1rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }

        /* Guest toggle */
        .guest-toggle {
          display: flex; align-items: center; gap: 0.75rem; padding: var(--space-sm);
          background: var(--bg-secondary); border: var(--border-subtle); margin-bottom: var(--space-sm);
        }
        .guest-toggle-text { flex: 1; }
        .guest-toggle-text p { margin: 0; font-size: var(--text-body); color: var(--text-primary); }
        .guest-toggle-text span { font-size: var(--text-caption); color: var(--text-secondary); }
        .guest-toggle-btn {
          padding: 0.5rem 1rem; font-family: var(--font-body); font-size: var(--text-caption);
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--walnut);
          background: transparent; border: 1px solid var(--stone); cursor: pointer;
          transition: all 150ms var(--ease); white-space: nowrap;
        }
        .guest-toggle-btn:hover { border-color: var(--walnut); background: rgba(167,134,89,0.04); }

        /* Checkbox */
        .check-row {
          display: flex; align-items: center; gap: 0.625rem; cursor: pointer;
          padding: 0.5rem 0; -webkit-tap-highlight-color: transparent;
        }
        .check-row input[type="checkbox"] {
          appearance: none; -webkit-appearance: none; width: 18px; height: 18px;
          border: 1.5px solid var(--stone); border-radius: 3px; cursor: pointer;
          position: relative; flex-shrink: 0; transition: border-color 200ms var(--ease), background 200ms var(--ease);
        }
        .check-row input[type="checkbox"]:checked { background: var(--bronze); border-color: var(--bronze); }
        .check-row input[type="checkbox"]:checked::after {
          content: ''; position: absolute; left: 5px; top: 1px; width: 5px; height: 10px;
          border: solid var(--bg-primary); border-width: 0 2px 2px 0; transform: rotate(45deg);
        }
        .check-row input[type="checkbox"]:focus-visible { outline: 2px solid var(--bronze); outline-offset: 2px; }
        .check-row span { font-size: var(--text-body); color: var(--text-primary); }

        /* Buttons */
        .checkout-next {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 1rem; font-family: var(--font-body); font-size: var(--text-caption);
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
          color: var(--bg-primary); background: var(--walnut); border: 1px solid var(--walnut);
          cursor: pointer; transition: all 250ms var(--ease); min-height: 52px;
        }
        .checkout-next:hover { background: #3d2e23; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(43,34,27,0.15); }
        .checkout-next:active { transform: translateY(0) scale(0.98); }
        .checkout-next:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
        .checkout-next:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
        .checkout-back {
          display: block; width: 100%; text-align: center; margin-top: 0.75rem;
          font-size: var(--text-caption); letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--text-secondary); background: none; border: none; cursor: pointer;
          padding: 0.75rem; font-family: var(--font-body); transition: color 150ms var(--ease);
        }
        .checkout-back:hover { color: var(--text-primary); }

        /* Order sidebar */
        .checkout-sidebar {
          background: var(--bg-secondary); border: var(--border-subtle);
          padding: var(--space-md); position: sticky; top: 120px;
        }
        .sidebar-title {
          font-family: var(--font-display); font-size: var(--text-body); font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-primary);
          margin: 0 0 var(--space-sm); max-width: none;
        }
        .sidebar-items { margin-bottom: var(--space-sm); }
        .sidebar-item {
          display: flex; gap: 0.75rem; padding: 0.625rem 0;
          border-bottom: 1px solid rgba(43,34,27,0.06);
        }
        .sidebar-item:last-child { border-bottom: none; }
        .sidebar-item-img {
          width: 56px; height: 56px; overflow: hidden; background: var(--stone); flex-shrink: 0;
        }
        .sidebar-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .sidebar-item-info { flex: 1; min-width: 0; }
        .sidebar-item-name {
          font-size: var(--text-caption); font-weight: 500; color: var(--text-primary);
          margin: 0 0 0.125rem; max-width: none; line-height: 1.3;
        }
        .sidebar-item-meta { font-size: 0.6rem; color: var(--text-secondary); opacity: 0.7; }
        .sidebar-item-price {
          font-size: var(--text-caption); font-weight: 500; color: var(--text-primary);
          white-space: nowrap; flex-shrink: 0;
        }

        .sidebar-summary .summary-row {
          display: flex; justify-content: space-between; padding: 0.5rem 0;
          font-size: var(--text-body); max-width: none;
        }
        .sidebar-summary .summary-row .label { color: var(--text-secondary); }
        .sidebar-summary .summary-row .value { font-weight: 500; }
        .sidebar-summary .summary-total {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.75rem 0 0; border-top: 1px solid rgba(43,34,27,0.12); margin-top: 0.25rem;
        }
        .sidebar-summary .summary-total .label {
          font-family: var(--font-display); font-weight: 500; text-transform: uppercase;
          letter-spacing: 0.04em; font-size: var(--text-body);
        }
        .sidebar-summary .summary-total .value {
          font-family: var(--font-display); font-size: var(--text-h2); font-weight: 500;
        }

        /* Trust */
        .checkout-trust {
          display: flex; flex-direction: column; gap: 0.5rem; margin-top: var(--space-sm);
          padding-top: var(--space-sm); border-top: 1px solid rgba(43,34,27,0.06);
        }
        .checkout-trust-item {
          display: flex; align-items: center; gap: 0.625rem; font-size: var(--text-caption);
          color: var(--text-secondary);
        }
        .checkout-trust-item svg { width: 16px; height: 16px; color: var(--bronze); opacity: 0.5; flex-shrink: 0; }

        /* Review */
        .review-block {
          background: var(--bg-secondary); border: var(--border-subtle);
          padding: var(--space-sm); margin-bottom: var(--space-sm);
        }
        .review-block-title {
          font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 500;
        }
        .review-block p { margin: 0; font-size: var(--text-body); color: var(--text-primary); line-height: 1.6; max-width: none; }
        .review-edit {
          font-size: var(--text-caption); color: var(--bronze); background: none; border: none;
          cursor: pointer; font-family: var(--font-body); padding: 0; margin-top: 0.375rem;
          transition: opacity 150ms var(--ease);
        }
        .review-edit:hover { opacity: 0.7; }

        /* Payment placeholder */
        .payment-placeholder {
          text-align: center; padding: var(--space-lg) var(--space-md);
          background: var(--bg-secondary); border: var(--border-subtle);
        }
        .payment-placeholder svg { width: 40px; height: 40px; color: var(--bronze); opacity: 0.3; margin-bottom: var(--space-sm); }
        .payment-placeholder p { font-size: var(--text-body); color: var(--text-secondary); margin: 0; max-width: none; }

        /* Processing overlay */
        .processing-overlay {
          position: fixed; inset: 0; z-index: 500; background: rgba(43,34,27,0.85);
          backdrop-filter: blur(4px); display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1rem;
        }
        .processing-spinner {
          width: 32px; height: 32px; border: 2px solid rgba(247,244,238,0.2);
          border-top-color: var(--bg-primary); border-radius: 50%;
          animation: spin 700ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .processing-text {
          font-size: var(--text-caption); letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--bg-primary); opacity: 0.8;
        }

        /* Mobile sticky */
        .checkout-mobile-cta {
          display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: var(--bg-primary); border-top: 1px solid rgba(43,34,27,0.08);
          padding: 0.75rem var(--space-sm);
          padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
          box-shadow: 0 -2px 12px rgba(43,34,27,0.06);
        }
        .checkout-mobile-inner {
          display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm);
        }
        .checkout-mobile-total {
          font-family: var(--font-display); font-size: var(--text-body); font-weight: 500;
        }
        .checkout-mobile-total span {
          display: block; font-size: 0.55rem; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--text-secondary); font-family: var(--font-body); font-weight: 400; margin-bottom: 0.125rem;
        }
        .checkout-mobile-btn {
          padding: 0.875rem 2rem; font-family: var(--font-body); font-size: var(--text-caption);
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
          color: var(--bg-primary); background: var(--walnut); border: 1px solid var(--walnut);
          cursor: pointer; min-height: 48px; transition: background 200ms var(--ease);
        }
        .checkout-mobile-btn:hover { background: #3d2e23; }

        @media (max-width: 860px) {
          .checkout-layout { grid-template-columns: 1fr; }
          .checkout-sidebar { position: static; order: -1; }
          .checkout-mobile-cta { display: block; }
          .checkout-page { padding-bottom: 100px; }
        }
        @media (max-width: 560px) {
          .checkout-page { padding: calc(var(--space-lg) + var(--space-md)) 0 var(--space-lg); }
          .checkout-header h1 { font-size: var(--text-h2); }
          .form-grid, .form-grid-3 { grid-template-columns: 1fr; }
          .checkout-steps { overflow-x: auto; gap: 0; }
          .step-item { font-size: 0.55rem; white-space: nowrap; }
        }
        @media (prefers-reduced-motion: reduce) {
          .processing-spinner { animation: none; }
        }
      `}</style>

      {isProcessing && (
        <div className="processing-overlay" role="alert" aria-live="assertive">
          <div className="processing-spinner"></div>
          <p className="processing-text">Demo mode — order not being processed</p>
        </div>
      )}

      <section className="checkout-page">
        <div className="container">
          <div className="checkout-header">
            <h1>Checkout</h1>
          </div>

          {!mounted && null}

          {mounted && cartItems.length === 0 && !isProcessing && (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', maxWidth: 'none' }}>Your cart is empty.</p>
              <Link href="/gallery" style={{
                display: 'inline-block', fontFamily: 'var(--font-body)', fontSize: 'var(--text-caption)',
                letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bg-primary)',
                background: 'var(--walnut)', border: '1px solid var(--walnut)', padding: '0.875rem 2.5rem',
                textDecoration: 'none',
              }}>Browse the Collection</Link>
            </div>
          )}

          {mounted && cartItems.length > 0 && !isProcessing && (
            <>
              {/* Step indicator */}
              <div className="checkout-steps" role="navigation" aria-label="Checkout progress">
                {STEPS.map((s, i) => (
                  <span key={s} style={{ display: 'contents' }}>
                    <button
                      className={`step-item ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}
                      onClick={() => i < step && setStep(i)}
                      aria-current={i === step ? 'step' : undefined}
                      disabled={i > step}
                    >
                      <span className="step-num">{i < step ? '\u2713' : i + 1}</span>
                      {s}
                    </button>
                    {i < STEPS.length - 1 && <span className="step-divider" aria-hidden="true"></span>}
                  </span>
                ))}
              </div>

              <div className="checkout-layout">
                <div className="checkout-form">
                  {/* Guest / Returning */}
                  {!isLoggedIn && step === 0 && (
                    <div className="guest-toggle">
                      <div className="guest-toggle-text">
                        <p>Already have an account?</p>
                        <span>Sign in for a faster checkout experience.</span>
                      </div>
                      <Link href="/login" className="guest-toggle-btn">Sign In</Link>
                    </div>
                  )}

                  {/* Step 0: Shipping */}
                  {step === 0 && (
                    <div className="checkout-section">
                      <h2 className="checkout-section-title">Shipping Address</h2>
                      <div className="form-grid">
                        <div className="form-row">
                          <label style={labelStyle} htmlFor="ck-first">First Name *</label>
                          <input id="ck-first" style={inputStyle(errors.firstName)} value={shipping.firstName} onChange={e => updateShipping('firstName', e.target.value)} placeholder="First name" required />
                          {errors.firstName && <p style={errStyle}>{errors.firstName}</p>}
                        </div>
                        <div className="form-row">
                          <label style={labelStyle} htmlFor="ck-last">Last Name *</label>
                          <input id="ck-last" style={inputStyle(errors.lastName)} value={shipping.lastName} onChange={e => updateShipping('lastName', e.target.value)} placeholder="Last name" required />
                          {errors.lastName && <p style={errStyle}>{errors.lastName}</p>}
                        </div>
                      </div>
                      <div className="form-grid">
                        <div className="form-row">
                          <label style={labelStyle} htmlFor="ck-email">Email *</label>
                          <input id="ck-email" type="email" style={inputStyle(errors.email)} value={shipping.email} onChange={e => updateShipping('email', e.target.value)} placeholder="you@example.com" required />
                          {errors.email && <p style={errStyle}>{errors.email}</p>}
                        </div>
                        <div className="form-row">
                          <label style={labelStyle} htmlFor="ck-phone">Phone</label>
                          <input id="ck-phone" type="tel" style={inputStyle()} value={shipping.phone} onChange={e => updateShipping('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                        </div>
                      </div>
                      <div className="form-row">
                        <label style={labelStyle} htmlFor="ck-address">Street Address *</label>
                        <input id="ck-address" style={inputStyle(errors.address)} value={shipping.address} onChange={e => updateShipping('address', e.target.value)} placeholder="House number, street name" required />
                        {errors.address && <p style={errStyle}>{errors.address}</p>}
                      </div>
                      <div className="form-row">
                        <label style={labelStyle} htmlFor="ck-apt">Apartment, Suite, etc.</label>
                        <input id="ck-apt" style={inputStyle()} value={shipping.apartment} onChange={e => updateShipping('apartment', e.target.value)} placeholder="Floor, suite, unit (optional)" />
                      </div>
                      <div className="form-grid-3">
                        <div className="form-row">
                          <label style={labelStyle} htmlFor="ck-city">City *</label>
                          <input id="ck-city" style={inputStyle(errors.city)} value={shipping.city} onChange={e => updateShipping('city', e.target.value)} required />
                          {errors.city && <p style={errStyle}>{errors.city}</p>}
                        </div>
                        <div className="form-row">
                          <label style={labelStyle} htmlFor="ck-state">State *</label>
                          <input id="ck-state" style={inputStyle(errors.state)} value={shipping.state} onChange={e => updateShipping('state', e.target.value)} required />
                          {errors.state && <p style={errStyle}>{errors.state}</p>}
                        </div>
                        <div className="form-row">
                          <label style={labelStyle} htmlFor="ck-pin">PIN Code *</label>
                          <input id="ck-pin" style={inputStyle(errors.pin)} value={shipping.pin} onChange={e => updateShipping('pin', e.target.value)} required />
                          {errors.pin && <p style={errStyle}>{errors.pin}</p>}
                        </div>
                      </div>

                      <label className="check-row">
                        <input type="checkbox" checked={sameBilling} onChange={e => setSameBilling(e.target.checked)} />
                        <span>Billing address same as shipping</span>
                      </label>

                      {!sameBilling && (
                        <>
                          <h2 className="checkout-section-title" style={{ marginTop: 'var(--space-sm)' }}>Billing Address</h2>
                          <div className="form-grid">
                            <div className="form-row">
                              <label style={labelStyle} htmlFor="ck-bfirst">First Name</label>
                              <input id="ck-bfirst" style={inputStyle()} value={billing.firstName} onChange={e => updateBilling('firstName', e.target.value)} />
                            </div>
                            <div className="form-row">
                              <label style={labelStyle} htmlFor="ck-blast">Last Name</label>
                              <input id="ck-blast" style={inputStyle()} value={billing.lastName} onChange={e => updateBilling('lastName', e.target.value)} />
                            </div>
                          </div>
                          <div className="form-row">
                            <label style={labelStyle} htmlFor="ck-baddr">Street Address</label>
                            <input id="ck-baddr" style={inputStyle()} value={billing.address} onChange={e => updateBilling('address', e.target.value)} />
                          </div>
                          <div className="form-grid-3">
                            <div className="form-row">
                              <label style={labelStyle} htmlFor="ck-bcity">City</label>
                              <input id="ck-bcity" style={inputStyle()} value={billing.city} onChange={e => updateBilling('city', e.target.value)} />
                            </div>
                            <div className="form-row">
                              <label style={labelStyle} htmlFor="ck-bstate">State</label>
                              <input id="ck-bstate" style={inputStyle()} value={billing.state} onChange={e => updateBilling('state', e.target.value)} />
                            </div>
                            <div className="form-row">
                              <label style={labelStyle} htmlFor="ck-bpin">PIN Code</label>
                              <input id="ck-bpin" style={inputStyle()} value={billing.pin} onChange={e => updateBilling('pin', e.target.value)} />
                            </div>
                          </div>
                        </>
                      )}

                      <button className="checkout-next" onClick={nextStep}>
                        Continue to Review
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </button>
                    </div>
                  )}

                  {/* Step 1: Review */}
                  {step === 1 && (
                    <>
                      <div className="review-block">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p className="review-block-title">Shipping Address</p>
                            <p>{shipping.firstName} {shipping.lastName}</p>
                            <p>{shipping.address}{shipping.apartment ? `, ${shipping.apartment}` : ''}</p>
                            <p>{shipping.city}, {shipping.state} {shipping.pin}</p>
                            <p>{shipping.email}{shipping.phone ? ` \u00B7 ${shipping.phone}` : ''}</p>
                          </div>
                          <button className="review-edit" onClick={() => setStep(0)}>Edit</button>
                        </div>
                      </div>
                      {!sameBilling && (
                        <div className="review-block">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p className="review-block-title">Billing Address</p>
                              <p>{billing.firstName} {billing.lastName}</p>
                              <p>{billing.address}</p>
                              <p>{billing.city}, {billing.state} {billing.pin}</p>
                            </div>
                            <button className="review-edit" onClick={() => setStep(0)}>Edit</button>
                          </div>
                        </div>
                      )}
                      <div className="review-block">
                        <p className="review-block-title">Items ({itemCount})</p>
                        {cartItems.map(item => (
                          <div key={item.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(43,34,27,0.06)' }}>
                            <div style={{ width: 48, height: 48, overflow: 'hidden', background: 'var(--stone)', flexShrink: 0 }}>
                              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 'var(--text-caption)', fontWeight: 500, maxWidth: 'none' }}>{item.name}</p>
                              <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-secondary)', opacity: 0.7 }}>Qty: {item.qty || 1}</p>
                            </div>
                            <span style={{ fontSize: 'var(--text-caption)', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.price}</span>
                          </div>
                        ))}
                      </div>
                      <button className="checkout-next" onClick={() => setStep(2)}>
                        Continue to Payment
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </button>
                      <button className="checkout-back" onClick={prevStep}>Back to Shipping</button>
                    </>
                  )}

                  {/* Step 2: Payment */}
                  {step === 2 && (
                    <>
                      <div className="payment-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                        <p>Secure payment integration will be available soon.</p>
                        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', opacity: 0.7, marginTop: '0.5rem' }}>Your order details have been saved.</p>
                      </div>
                      <button className="checkout-next" onClick={handlePlaceOrder} style={{ marginTop: 'var(--space-sm)' }}>
                        Demo &mdash; Place Order &mdash; {formatPrice(subtotal)}
                      </button>
                      <button className="checkout-back" onClick={prevStep}>Back to Review</button>
                    </>
                  )}
                </div>

                {/* Sidebar */}
                <div className="checkout-sidebar">
                  <h2 className="sidebar-title">Your Order</h2>
                  <div className="sidebar-items">
                    {cartItems.map(item => (
                      <div className="sidebar-item" key={item.id}>
                        <div className="sidebar-item-img">
                          <img src={item.image} alt={item.name} loading="lazy" />
                        </div>
                        <div className="sidebar-item-info">
                          <p className="sidebar-item-name">{item.name}</p>
                          <p className="sidebar-item-meta">Qty: {item.qty || 1}</p>
                        </div>
                        <span className="sidebar-item-price">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="sidebar-summary">
                    <div className="summary-row">
                      <span className="label">Subtotal</span>
                      <span className="value">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="label">Shipping</span>
                      <span className="value" style={{ fontSize: 'var(--text-caption)', color: 'var(--text-secondary)' }}>Calculated next</span>
                    </div>
                    <div className="summary-total">
                      <span className="label">Total</span>
                      <span className="value">{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                  <div className="checkout-trust">
                    <div className="checkout-trust-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Secure, encrypted checkout
                    </div>
                    <div className="checkout-trust-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                      Handcrafted with care
                    </div>
                    <div className="checkout-trust-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      Carefully packed &amp; shipped
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile sticky */}
              <div className="checkout-mobile-cta">
                <div className="checkout-mobile-inner">
                  <div className="checkout-mobile-total">
                    <span>Total</span>
                    {formatPrice(subtotal)}
                  </div>
                  <button
                    className="checkout-mobile-btn"
                    onClick={step === 2 ? handlePlaceOrder : step === 1 ? () => setStep(2) : nextStep}
                  >
                    {step === 2 ? 'Demo — Place Order' : 'Continue'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

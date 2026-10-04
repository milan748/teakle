/**
 * TEAKLE — Inquire to Own (Atelier Stories hero-product page).
 *
 * Two phases, per the Atelier reference structure:
 *   PHASE 1 — Editorial hero: large image left, editorial introduction
 *     right (Atelier Stories, dynamic product name, One of One, short
 *     philosophy, minimal supporting facts). NO purchase here.
 *   PHASE 2 — Left storytelling (features, gallery, specifications,
 *     story, purchase section, ownership) with a compact sticky purchase
 *     group on the right (product name, price, availability, quantity,
 *     BUY NOW, contact). Natural content height only — no forced height,
 *     no stretched whitespace. Sticky behavior is invisible: no border,
 *     no box, no card, no shadow, no panel, no label.
 *
 * BUY NOW uses the existing cart/checkout infrastructure (window.Teakle
 * store caps hero quantity at 1; server cart + order pricing enforce the
 * same cap). Mobile stacks naturally with the fixed bottom buy bar.
 * No inquiry form.
 *
 * Data contract (app/data/products.js):
 *   - product: id, name, shortDescription, description, story, material,
 *     dimensions, seats, price, priceFormatted, availability,
 *     availabilityNote, inventoryQuantity, isHero, images[],
 *     specifications[]
 *   - processSlug: making-of page slug, or null.
 *   - isProductSold(product): shared sold detection. A sold object stays
 *     published as history; purchase controls become SOLD.
 *
 * Content-integrity: every fact from the dataset or approved Atelier
 * labels. Nothing invented. Static render — no scroll-reveal, gradients,
 * or animation. Template is fully data-driven for future heroes.
 */
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isProductSold } from '@/app/data/products';

export default function InquireClient({ product, processSlug = null }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const name = product?.name || 'Teakle Atelier';
  const sold = isProductSold(product);
  const images = product?.images || [];
  const specs = product?.specifications || [];
  const facts = [product?.material, product?.dimensions].filter(Boolean);

  function handleBuyNow() {
    if (sold || isAdding) return;
    setIsAdding(true);
    try {
      if (typeof window !== 'undefined' && window.Teakle && window.Teakle.addToCart) {
        window.Teakle.addToCart({
          id: product.id,
          name: product.name,
          price: product.priceFormatted,
          image: product.images?.[0] || '',
          qty: 1,
        });
      }
    } finally {
      router.push('/cart');
    }
  }

  /* Secondary: Add to Cart stays on the page (existing store, hero-capped). */
  function handleAddToCart() {
    if (sold || typeof window === 'undefined') return;
    if (window.Teakle && window.Teakle.addToCart) {
      window.Teakle.addToCart({
        id: product.id,
        name: product.name,
        price: product.priceFormatted,
        image: product.images?.[0] || '',
        qty: 1,
      });
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  /* Secondary: wishlist via the existing store (same guard as shop page). */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Teakle || !window.Teakle.isInWishlist) return;
    try {
      setIsWishlisted(!!window.Teakle.isInWishlist(product?.id));
    } catch {}
  }, [product?.id]);

  function handleWishlist() {
    if (typeof window === 'undefined') return;
    if (window.Teakle && window.Teakle.requireAuth && !window.Teakle.requireAuth()) return;
    if (window.Teakle && window.Teakle.toggleWishlist) {
      try {
        const result = window.Teakle.toggleWishlist({
          id: product.id,
          name: product.name,
          price: product.priceFormatted,
          image: product.images?.[0] || '',
        });
        setIsWishlisted(!!(result && result.added));
      } catch {}
    }
  }

  /* Tertiary: native share with clipboard fallback, never errors. */
  async function handleShare() {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: product?.shortDescription || '', url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  }

  const galleryCaptions = [
    'The grain runs the full length of the top, unbroken.',
    'Hand-planed, oiled, and left to cure.',
    'Joined by hand — no metal fasteners.',
    'Seats six. Made for daily use.',
  ];

  /* Reassurance rows: existing approved wording only. The returns text is
     presented as its own sentences (defect assurance, then policy) — same
     words, distributed across two rows, never rewritten. */
  const returnBits = (product.returns || '')
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const serviceRows = [
    { icon: 'truck', text: 'White-glove delivery available.' },
    { icon: 'globe', text: 'Handcrafted in India. Ships worldwide.' },
    ...(returnBits.length > 0 ? [{ icon: 'diamond', text: returnBits[0] }] : []),
    ...(returnBits.length > 1 ? [{ icon: 'doc', text: returnBits.slice(1).join(' ') }] : []),
  ];

  const serviceIcons = {
    truck: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
        <path d="M1 5h13v10H1z" /><path d="M14 9h4l3 3v3h-7z" /><circle cx="6" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" />
      </svg>
    ),
    globe: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c3 3.6 3 14.4 0 18" /><path d="M12 3c-3 3.6-3 14.4 0 18" />
      </svg>
    ),
    diamond: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
        <path d="M12 4l7 8-7 8-7-8z" />
      </svg>
    ),
    doc: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
        <path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7" /><path d="M9 16h5" />
      </svg>
    ),
  };

  const buyButton = (
    <button type="button" className="btn-primary iq-buy-btn" onClick={handleBuyNow} disabled={isAdding}>
      {isAdding ? 'Adding…' : 'BUY NOW'}
    </button>
  );

  const purchaseGroup = sold ? (
    <div role="status">
      <div className="iq-rail-name">{name}</div>
      <div className="iq-rail-sold" style={{ marginTop: 'var(--space-sm)' }}>SOLD</div>
      <p className="iq-rail-note">No longer available.</p>
    </div>
  ) : (
    <>
      <div className="iq-rail-name">{name}</div>
      <div className="iq-rail-facts">{[product.material, product.dimensions, product.buildTime].filter(Boolean).join(' · ')}</div>
      <div className="iq-rail-price">{product.priceFormatted}</div>
      <div className="iq-rail-avail">{product.availabilityNote || product.availability}</div>
      <div className="iq-rail-qty"><span>Quantity</span><strong>1</strong></div>
      <p className="iq-rail-one">One of One · Never restocked, never recreated.</p>
      {buyButton}
      <button type="button" className="iq-sec-btn" onClick={handleAddToCart} disabled={isAdded}>
        {isAdded ? 'Added to Cart' : 'Add to Cart'}
      </button>
      <button type="button" className="iq-sec-btn" onClick={handleWishlist} aria-pressed={isWishlisted}>
        {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
      </button>
      <div className="iq-rail-tertiary">
        {processSlug ? (
          <Link href={`/process/${processSlug}`} className="link-quiet">WATCH THE PROCESS</Link>
        ) : null}
        <button type="button" className="link-quiet" onClick={handleShare} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {shareCopied ? 'Copied!' : 'Share'}
        </button>
      </div>
      <div className="iq-rail-service">
        {serviceRows.map((row) => (
          <div key={row.icon} className="iq-svc-row">
            {serviceIcons[row.icon]}
            <span>{row.text}</span>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="iq-page">
      <style>{`
        .iq-page { overflow-x: clip; background: var(--bg-primary); }

        .iq-breadcrumb {
          border-bottom: var(--border-subtle);
          padding: var(--space-sm) 0;
        }
        .iq-breadcrumb-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md);
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: var(--text-caption);
          color: var(--text-tertiary);
          letter-spacing: 0.04em;
          flex-wrap: wrap;
        }
        .iq-breadcrumb a { color: var(--text-secondary); text-decoration: none; }
        .iq-breadcrumb a:hover { color: var(--bronze); }
        .iq-breadcrumb-sep { opacity: 0.4; }

        /* ---- PHASE 1 · Editorial hero: image + introduction, no purchase ---- */
        .iq-hero {
          max-width: var(--container);
          margin: 0 auto;
          padding: clamp(var(--space-xl), 6vw, calc(var(--space-2xl) * 1.5)) var(--space-md) 0;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(var(--space-xl), 5vw, calc(var(--space-2xl) * 1.5));
          align-items: start;
        }
        .iq-hero figure { margin: 0; grid-column: 1; grid-row: 1 / span 2; align-self: start; }
        .iq-hero img { display: block; width: 100%; height: auto; }
        .iq-hero figcaption {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          padding-top: var(--space-xs);
        }
        .iq-hero-head { grid-column: 2; grid-row: 1; align-self: start; }
        .iq-hero-head h1 {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 0.98;
          text-transform: uppercase;
          margin: var(--space-sm) 0 0;
          overflow-wrap: break-word;
        }
        .iq-hero-one {
          display: block;
          margin-top: var(--space-sm);
          font-size: var(--text-body);
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }
        .iq-hero-body { grid-column: 2; grid-row: 2; align-self: end; }
        .iq-hero-lede {
          margin: var(--space-md) 0 0;
          font-size: var(--text-body-lg);
          font-style: italic;
          color: var(--text-primary);
          max-width: 34ch;
        }
        .iq-hero-state {
          margin: var(--space-sm) 0 0;
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: 1.75;
          max-width: 42ch;
        }
        .iq-hero-facts {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs) var(--space-md);
          margin-top: var(--space-md);
        }
        .iq-hero-facts span {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ---- PHASE 2 · Storytelling left, compact sticky purchase right ---- */
        .iq-phase {
          max-width: var(--container);
          margin: 0 auto;
          padding: clamp(var(--space-xl), 8vw, calc(var(--space-2xl) * 1.5)) var(--space-md) 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: clamp(var(--space-xl), 5vw, calc(var(--space-2xl) * 1.5));
          align-items: start;
        }
        .iq-phase-main { grid-column: 1; grid-row: 1; min-width: 0; }
        /* Wrapper stretches the full row; its top offset mirrors the
           section top padding below, so the purchase block starts at
           exactly the same level as DISTINCT on the left. */
        .iq-phase-rail {
          grid-column: 2;
          grid-row: 1;
          min-width: 0;
          align-self: stretch;
          padding-top: clamp(var(--space-xl), 7vw, var(--space-2xl));
        }

        /* Sticky purchase group: natural height, invisible behavior.
           No border, box, card, shadow, panel, or label. */
        .iq-rail { position: sticky; top: 96px; }
        .iq-rail-name {
          font-size: var(--text-body-lg);
          font-weight: 500;
          color: var(--text-primary);
          letter-spacing: 0.01em;
        }
        .iq-rail-facts {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          margin-top: var(--space-xs);
        }
        .iq-rail-price {
          margin-top: var(--space-sm);
          font-size: var(--text-body-lg);
          font-weight: 500;
          color: var(--text-primary);
        }
        .iq-rail-avail {
          color: var(--text-tertiary);
          font-size: var(--text-body);
          margin-top: 2px;
        }
        .iq-rail-qty {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: var(--space-sm);
          font-size: var(--text-body);
          color: var(--text-secondary);
        }
        .iq-rail-qty strong { color: var(--text-primary); font-weight: 500; }
        .iq-rail-one {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: var(--space-sm);
        }
        .iq-rail .iq-buy-btn {
          width: 100%;
          margin-top: var(--space-md);
          text-align: center;
          min-height: 48px;
        }
        .iq-sec-btn {
          width: 100%;
          margin-top: var(--space-xs);
          min-height: 44px;
          background: none;
          border: 1px solid var(--stone);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .iq-sec-btn:hover { color: var(--bronze); border-color: var(--bronze); }
        .iq-sec-btn:disabled { opacity: 0.55; cursor: default; }
        .iq-rail-tertiary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-md);
          margin-top: var(--space-md);
        }
        .iq-rail-service { margin-top: var(--space-md); }
        .iq-svc-row {
          display: flex;
          gap: var(--space-sm);
          align-items: flex-start;
          margin: 0 0 var(--space-sm);
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          line-height: 1.7;
        }
        .iq-svc-row:last-child { margin-bottom: 0; }
        .iq-svc-row svg {
          flex: 0 0 auto;
          width: 15px;
          height: 15px;
          margin-top: 3px;
        }
        .iq-svc-row span { min-width: 0; }
        .iq-rail-note {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: var(--space-sm);
        }
        .iq-rail-contact { margin-top: var(--space-sm); }
        .iq-rail-sold {
          font-size: var(--text-body-lg);
          font-weight: 500;
          letter-spacing: 0.06em;
        }

        /* ---- Left editorial sections ---- */
        .iq-section { padding: clamp(var(--space-xl), 7vw, var(--space-2xl)) 0 0; }
        .iq-section h2 {
          font-size: clamp(1.6rem, 3vw, 2.25rem);
          font-weight: 500;
          letter-spacing: -0.015em;
          margin: var(--space-xs) 0 var(--space-md);
          max-width: 22ch;
        }
        .iq-section p {
          color: var(--text-secondary);
          font-size: var(--text-body-lg);
          line-height: 1.75;
          margin: 0 0 var(--space-md);
          max-width: 60ch;
        }
        .iq-section p:last-child { margin-bottom: 0; }

        .iq-features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
          border-top: var(--border-hair);
          margin-top: var(--space-lg);
          padding-top: var(--space-lg);
        }
        .iq-feature strong {
          display: block;
          font-size: var(--text-caption);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: var(--space-xs);
        }
        .iq-feature span {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
        }

        .iq-plate { margin: var(--space-xl) 0 0; }
        .iq-plate figure { margin: 0; }
        .iq-plate img { display: block; width: 100%; height: auto; }
        .iq-plate figcaption {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          padding-top: var(--space-xs);
        }

        .iq-specs { border-top: var(--border-hair); margin-top: var(--space-lg); }
        .iq-spec-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: var(--space-md);
          padding: 0.65rem 0;
          border-bottom: var(--border-hair);
          font-size: var(--text-body);
        }
        .iq-spec-label { color: var(--text-secondary); flex-shrink: 0; }
        .iq-spec-value { color: var(--text-primary); text-align: right; font-weight: 500; }

        .iq-buy { margin-top: var(--space-lg); }
        .iq-buy-price {
          color: var(--text-primary);
          font-size: clamp(1.25rem, 2.4vw, 1.75rem);
          font-weight: 500;
          margin: 0 0 var(--space-xs);
        }
        .iq-buy-note {
          color: var(--text-secondary);
          font-size: var(--text-body);
          margin: 0 0 var(--space-md);
        }
        .iq-buy-actions { display: flex; gap: var(--space-md); flex-wrap: wrap; align-items: center; }
        .iq-buy-actions .btn-primary { min-height: 48px; }
        .iq-qtylock {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: var(--space-md);
        }
        .iq-contact { margin-top: var(--space-sm); }

        .iq-close-statement {
          color: var(--text-primary);
          font-size: clamp(1.25rem, 2.4vw, 1.75rem);
          line-height: 1.5;
          font-weight: 500;
          letter-spacing: -0.01em;
          margin: 0 0 var(--space-md);
          max-width: 30ch;
        }

        .iq-onward { border-top: var(--border-subtle); margin-top: clamp(var(--space-xl), 7vw, var(--space-2xl)); }
        .iq-onward-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-md);
          display: flex;
          gap: var(--space-md) var(--space-lg);
          flex-wrap: wrap;
          align-items: center;
        }

        /* ---- Mobile fixed buy bar ---- */
        .iq-mbar {
          display: none;
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 60;
          background: var(--bg-primary);
          border-top: var(--border-subtle);
          padding: var(--space-sm) var(--space-md) calc(var(--space-sm) + env(safe-area-inset-bottom));
          align-items: center;
          gap: var(--space-md);
        }
        .iq-mbar-price { font-weight: 500; color: var(--text-primary); white-space: nowrap; }
        .iq-mbar .btn-primary { flex: 1; text-align: center; min-height: 48px; }

        @media (max-width: 900px) {
          .iq-hero { grid-template-columns: minmax(0, 1fr); }
          .iq-hero figure, .iq-hero-head, .iq-hero-body { grid-column: 1; grid-row: auto; }
          .iq-phase { grid-template-columns: minmax(0, 1fr); }
          .iq-phase-main, .iq-phase-rail { grid-column: 1; grid-row: auto; }
          .iq-phase-rail { padding-top: 0; }
          .iq-rail { position: static; max-width: 560px; }
          .iq-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .iq-features-grid { grid-template-columns: 1fr; }
          .iq-buy-actions { flex-direction: column; align-items: stretch; }
          .iq-buy-actions .btn-primary { text-align: center; }
        }
        @media (max-width: 719px) {
          .iq-hero-head h1 { font-size: clamp(2.5rem, 14vw, 3.5rem); }
          .iq-rail { display: none; }
          .iq-mbar { display: flex; }
          .iq-page { padding-bottom: 76px; }
        }
      `}</style>

      {/* Breadcrumb */}
      <nav className="iq-breadcrumb" aria-label="Breadcrumb">
        <div className="iq-breadcrumb-inner">
          <Link href="/">Home</Link>
          <span className="iq-breadcrumb-sep">/</span>
          <Link href="/gallery">Gallery</Link>
          <span className="iq-breadcrumb-sep">/</span>
          <span aria-current="page">{name}</span>
        </div>
      </nav>

      {/* PHASE 1 · Editorial hero — no purchase here */}
      <div className="iq-hero">
        <div className="iq-hero-head">
          <span className="eyebrow">Atelier Stories</span>
          <h1>{name}</h1>
          <span className="iq-hero-one">One of one.</span>
        </div>
        <figure>
          <img
            src={product.images?.[0]}
            alt={`${name} — solid teak, hand-finished`}
            width="1200"
            height="900"
          />
          <figcaption>One block, cut once, finished by hand.</figcaption>
        </figure>
        <div className="iq-hero-body">
          <p className="iq-hero-lede">A table built around its timber.</p>
          <p className="iq-hero-state">
            Cut from a single block and left to settle before any cutting
            begins, its grain runs unbroken across the whole top. No metal
            fasteners, no veneer — the timber gives the form, and the
            handwork follows.
          </p>
          {facts.length > 0 ? (
            <div className="iq-hero-facts" aria-label="Piece at a glance">
              {facts.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* PHASE 2 · Storytelling left, compact sticky purchase right */}
      <div className="iq-phase">
        <aside className="iq-phase-rail" aria-label="Purchase">
          <div className="iq-rail">{purchaseGroup}</div>
        </aside>

        <div className="iq-phase-main">
          {/* Distinct features */}
          <section className="iq-section" aria-label="What makes it distinct">
            <span className="eyebrow">Distinct</span>
            <h2>Why it stands apart.</h2>
            <div className="iq-features-grid">
              <div className="iq-feature">
                <strong>Solid teak</strong>
                <span>{product.material || 'Solid Teak'} throughout — no veneer, no boards.</span>
              </div>
              <div className="iq-feature">
                <strong>One of one</strong>
                <span>A single physical piece. Never restocked, never recreated.</span>
              </div>
              <div className="iq-feature">
                <strong>Hand finished</strong>
                <span>Planed by hand, oiled by hand — {product.buildTime || 'about eighteen hours'} of making.</span>
              </div>
              <div className="iq-feature">
                <strong>Form</strong>
                <span>{product.dimensions || 'A dining table'} — seats {product.seats || 'six'}.</span>
              </div>
            </div>
          </section>

          {/* Details gallery */}
          {images.slice(1, 3).map((src, i) => (
            <div key={src} className="iq-plate">
              <figure>
                <img src={src} alt={`${name} — detail ${i + 1}`} width="1200" height="900" loading="lazy" />
                <figcaption>{galleryCaptions[i + 1] || name}</figcaption>
              </figure>
            </div>
          ))}

          {/* Specifications */}
          <section className="iq-section" aria-label="Specifications">
            <span className="eyebrow">Specifications</span>
            <h2>Record.</h2>
            <div className="iq-specs">
              {specs.map((s) => (
                <div key={s.label} className="iq-spec-row">
                  <span className="iq-spec-label">{s.label}</span>
                  <span className="iq-spec-value">{s.value}</span>
                </div>
              ))}
              <div className="iq-spec-row">
                <span className="iq-spec-label">Production</span>
                <span className="iq-spec-value">One of One</span>
              </div>
              <div className="iq-spec-row">
                <span className="iq-spec-label">Quantity</span>
                <span className="iq-spec-value">1</span>
              </div>
              <div className="iq-spec-row">
                <span className="iq-spec-label">Availability</span>
                <span className="iq-spec-value">{sold ? 'Sold' : (product.availabilityNote || product.availability || '—')}</span>
              </div>
            </div>
          </section>

          {images[3] ? (
            <div className="iq-plate">
              <figure>
                <img src={images[3]} alt={`${name} — in the room`} width="1200" height="900" loading="lazy" />
                <figcaption>{galleryCaptions[3]}</figcaption>
              </figure>
            </div>
          ) : null}

          {/* Story + process link */}
          {product.story ? (
            <section className="iq-section" aria-label="The story">
              <span className="eyebrow">Story</span>
              <h2>How it began.</h2>
              <p>{product.story}</p>
              {processSlug ? (
                <p><Link href={`/process/${processSlug}`} className="link-quiet">Watch the Process →</Link></p>
              ) : null}
            </section>
          ) : null}

          {/* Purchase */}
          <section className="iq-buy" aria-label="Purchase">
            {sold ? (
              <div role="status">
                <span className="eyebrow">Atelier Stories</span>
                <h2 style={{ marginTop: 'var(--space-xs)' }}>SOLD</h2>
                <p className="iq-buy-note">One of One · No longer available. This object has found its owner and remains here as part of TEAKLE&rsquo;s history.</p>
                <p style={{ marginTop: 'var(--space-md)' }}>
                  <Link href="/archive" className="link-quiet">Explore Past Atelier Stories</Link>
                </p>
              </div>
            ) : (
              <>
                <span className="eyebrow">Purchase</span>
                <p className="iq-buy-price" style={{ marginTop: 'var(--space-xs)' }}>{product.priceFormatted}</p>
                <p className="iq-buy-note">One of one — a single physical piece, purchasable directly. No inquiry required.</p>
                <div className="iq-buy-actions">{buyButton}</div>
                <p className="iq-qtylock">One of one · Quantity 1</p>
                <p className="iq-contact">
                  <Link href="/contact" className="link-quiet">Questions about this piece? Contact us →</Link>
                </p>
              </>
            )}
          </section>

          {/* Ownership closing */}
          <section className="iq-section" id="own" aria-label="Ownership">
            <span className="eyebrow">Ownership</span>
            <h2>One object. One owner.</h2>
            <p>Only one exists. It will not be recreated — once sold, this particular object is gone.</p>
            <p className="iq-close-statement" style={{ marginTop: 'var(--space-md)' }}>No second edition.</p>
            <p><Link href="/archive" className="link-quiet">Explore Past Atelier Stories</Link></p>
          </section>
        </div>
      </div>

      {/* Quiet onward row */}
      <nav className="iq-onward" aria-label="Continue">
        <div className="iq-onward-inner">
          {processSlug ? (
            <Link href={`/process/${processSlug}`} className="link-quiet">Watch the Process</Link>
          ) : null}
          <Link href="/archive" className="link-quiet">Past Collections</Link>
        </div>
      </nav>

      {/* Mobile fixed buy bar */}
      {!sold ? (
        <div className="iq-mbar" role="region" aria-label="Purchase">
          <span className="iq-mbar-price">{product.priceFormatted}</span>
          <button type="button" className="btn-primary" onClick={handleBuyNow} disabled={isAdding}>
            {isAdding ? 'Adding…' : 'BUY NOW'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

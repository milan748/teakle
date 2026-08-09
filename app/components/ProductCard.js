'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

/* ============================================
   PRODUCT CARD — Shared Component
   Premium editorial product card for Teakle
   ============================================ */

const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='533' viewBox='0 0 400 533'%3E%3Crect fill='%23E8E4DC' width='400' height='533'/%3E%3Ctext x='200' y='260' text-anchor='middle' fill='%23A09888' font-family='system-ui' font-size='14' letter-spacing='0.1em'%3ETEAKLE%3C/text%3E%3C/svg%3E";

const cardStyles = `
/* ================================================================
   PRODUCT CARD — Shared Component
   ================================================================ */
.pcard {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: transform 400ms var(--ease);
}
.pcard:hover { transform: translateY(-4px); }

/* Image */
.pcard-img {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--bg-secondary);
  margin-bottom: 0.75rem;
}
.pcard-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dur-slow) var(--ease), opacity var(--dur-slow) var(--ease);
}
.pcard:hover .pcard-img img { transform: scale(1.04); }

/* Hover image (second image crossfade) */
.pcard-hover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--dur-slow) var(--ease);
}
.pcard:hover .pcard-hover-img { opacity: 1; }

/* Badge */
.pcard-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-caption);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3em 0.6em;
  z-index: 2;
}
.pcard-badge:empty { display: none; }

/* Wishlist */
.pcard-wishlist {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
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
.pcard:hover .pcard-wishlist { opacity: 1; transform: scale(1); }
.pcard-wishlist:hover { background: var(--bronze); color: #fff; }
.pcard-wishlist:active { transform: scale(0.85); }
.pcard-wishlist svg { width: 14px; height: 14px; }
.pcard-wishlist:focus-visible {
  outline: 2px solid var(--bronze);
  outline-offset: 2px;
  opacity: 1;
  transform: scale(1);
}

/* Info */
.pcard-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-xs);
}
.pcard-info h3 {
  font-size: var(--text-body);
  font-weight: 500;
  line-height: 1.3;
  transition: color var(--dur-fast) var(--ease);
  max-width: none;
}
.pcard:hover .pcard-info h3 { color: var(--bronze); }
.pcard-meta {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  letter-spacing: 0.02em;
  margin-top: 0.15rem;
}
.pcard-price {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* Focus visible for link */
.pcard:focus-visible {
  outline: 2px solid var(--bronze);
  outline-offset: 4px;
  border-radius: 2px;
}

/* Responsive */
@media (max-width: 560px) {
  .pcard-info h3 { font-size: var(--text-caption); }
  .pcard-wishlist { width: 36px; height: 36px; }
}
`;

export default function ProductCard({
  product,
  href,
  showBadge = true,
  showWishlist = true,
  showMeta = false,
  metaText,
  hoverImage,
  className = '',
}) {
  const [imgSrc, setImgSrc] = useState(product?.images?.[0] || PLACEHOLDER_SVG);
  const [hoverImgSrc] = useState(hoverImage || null);

  const handleImageError = useCallback(() => {
    setImgSrc(PLACEHOLDER_SVG);
  }, []);

  const handleWishlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    const t = window.Teakle;
    if (t && t.requireAuth && !t.requireAuth()) return;
    if (t && t.toggleWishlist) {
      t.toggleWishlist({
        id: product.id,
        name: product.name,
        price: product.priceFormatted,
        image: product.images?.[0] || '',
      });
    }
  }, [product]);

  if (!product) return null;

  const linkHref = href || `/shop/${product.id}`;

  return (
    <>
      <style>{cardStyles}</style>
      <Link href={linkHref} className={`pcard ${className}`}>
        <div className="pcard-img">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
          />
          {hoverImgSrc && (
            <img
              className="pcard-hover-img"
              src={hoverImgSrc}
              alt=""
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          {showBadge && product.availability && (
            <span className="pcard-badge">{product.availability}</span>
          )}
          {showWishlist && (
            <button
              className="pcard-wishlist"
              aria-label={`Add ${product.name} to wishlist`}
              onClick={handleWishlist}
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          )}
        </div>
        <div className="pcard-info">
          <div>
            <h3>{product.name}</h3>
            {showMeta && (metaText || product.material) && (
              <div className="pcard-meta">{metaText || product.material}</div>
            )}
          </div>
          <span className="pcard-price">{product.priceFormatted}</span>
        </div>
      </Link>
    </>
  );
}

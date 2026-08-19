'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

/* ============================================
   PRODUCT CARD — Shared Component
   Premium editorial product card for Teakle
   ============================================ */

const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='533' viewBox='0 0 400 533'%3E%3Crect fill='%23E8E4DC' width='400' height='533'/%3E%3Ctext x='200' y='260' text-anchor='middle' fill='%23A09888' font-family='system-ui' font-size='14' letter-spacing='0.1em'%3ETEAKLE%3C/text%3E%3C/svg%3E";

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
    <Link href={linkHref} className={`pcard ${className}`}>
      <div className="pcard-img">
        <img
          src={imgSrc}
          alt={`${product.name}${product.material ? ', ' + product.material : ''}`}
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
        {showBadge && product.availability === 'Limited Edition' && (
          <span className="pcard-badge">Limited Edition</span>
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
  );
}

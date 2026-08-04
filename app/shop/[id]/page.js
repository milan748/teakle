'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';

/* ============================================
   SHOP DETAIL — Premium Product Page (Redesigned IA)
   ============================================ */

/* --- Breadcrumb --- */
const breadcrumbBarStyle = {
  padding: 'calc(var(--space-xl) + var(--space-sm)) 0 var(--space-sm)',
  background: 'var(--bg-primary)',
};
const breadcrumbStyle = {
  fontSize: 'var(--text-caption)',
  letterSpacing: '0.04em',
  color: 'var(--text-secondary)',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.35rem',
};

/* --- Product Section --- */
const productSectionStyle = {
  background: 'var(--bg-primary)',
  padding: 'var(--space-md) 0 var(--space-xl)',
};
const productGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.15fr 0.85fr',
  gap: 'var(--space-2xl)',
  alignItems: 'start',
};

/* Gallery */
const productGalleryStyle = { position: 'relative' };
const productGalleryMainStyle = {
  position: 'relative',
  aspectRatio: '4 / 5',
  overflow: 'hidden',
  background: 'var(--bg-secondary)',
  cursor: 'crosshair',
  marginBottom: 'var(--space-sm)',
};
const galleryBadgeStyle = {
  position: 'absolute',
  top: 'var(--space-sm)',
  left: 'var(--space-sm)',
  background: 'var(--walnut)',
  color: 'var(--bg-primary)',
  fontSize: 'var(--text-caption)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '0.35rem 0.75rem',
  zIndex: 2,
};
const galleryCounterStyle = {
  position: 'absolute',
  bottom: 'var(--space-sm)',
  right: 'var(--space-sm)',
  background: 'rgba(43,34,27,0.65)',
  backdropFilter: 'blur(4px)',
  color: 'var(--bg-primary)',
  fontSize: 'var(--text-caption)',
  letterSpacing: '0.06em',
  padding: '0.3rem 0.65rem',
  zIndex: 2,
};
const fullscreenBtnStyle = {
  position: 'absolute',
  top: 'var(--space-sm)',
  right: 'var(--space-sm)',
  width: 40, height: 40,
  background: 'rgba(255,255,255,0.9)',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
};
const thumbsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 'var(--space-sm)',
};
const thumbStyle = {
  aspectRatio: '1 / 1',
  cursor: 'pointer',
  overflow: 'hidden',
  border: '1.5px solid transparent',
  opacity: 0.65,
};
const thumbActiveStyle = { ...thumbStyle, borderColor: 'var(--bronze)', opacity: 1 };
const thumbImgStyle = { width: '100%', height: '100%', objectFit: 'cover' };

/* Details panel */
const productDetailsStyle = { position: 'sticky', top: 100 };
const productTitleStyle = {
  fontSize: 'clamp(1.8rem, 3vw, var(--text-h1))',
  fontWeight: 500,
  marginBottom: '0.25rem',
  letterSpacing: '-0.02em',
};
const productMaterialTagStyle = {
  fontSize: 'var(--text-label)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: 'var(--space-sm)',
};
const productPriceRowStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 'var(--space-sm)',
  marginBottom: 'var(--space-md)',
  paddingBottom: 'var(--space-md)',
  borderBottom: 'var(--border-hair)',
};
const productPriceStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.6rem',
  fontWeight: 500,
  color: 'var(--text-primary)',
};
const productAvailabilityStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: 'var(--text-label)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--forest)',
};
const productShortDescStyle = {
  color: 'var(--text-secondary)',
  fontSize: 'var(--text-body)',
  lineHeight: 'var(--lh-relaxed)',
  marginBottom: 'var(--space-md)',
  maxWidth: '50ch',
};
const specRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 'var(--space-md)',
  padding: '0.65rem 0',
  borderBottom: 'var(--border-hair)',
  fontSize: 'var(--text-body)',
};
const specLabelStyle = { color: 'var(--text-secondary)' };
const specValueStyle = { color: 'var(--text-primary)', textAlign: 'right', fontWeight: 500 };

/* Quantity */
const qtyRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
  marginBottom: 'var(--space-md)',
};
const qtyLabelStyle = {
  fontSize: 'var(--text-label)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
};
const qtyControlStyle = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid var(--stone)',
};
const qtyBtnStyle = {
  width: 40, height: 40,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 'var(--text-subhead)',
  color: 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const qtyValueStyle = {
  width: 48,
  textAlign: 'center',
  fontSize: 'var(--text-body)',
  fontWeight: 500,
  borderLeft: '1px solid var(--stone)',
  borderRight: '1px solid var(--stone)',
  height: 40,
  lineHeight: '40px',
};

/* Actions */
const productActionsStyle = { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: 'var(--space-md)' };
const btnAddCartStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-sm)',
  width: '100%',
  padding: 'var(--space-md)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-label)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--bg-primary)',
  background: 'var(--walnut)',
  border: '1px solid var(--walnut)',
  cursor: 'pointer',
  minHeight: 52,
};
const btnAddCartAddedStyle = { ...btnAddCartStyle, background: 'var(--forest)', borderColor: 'var(--forest)' };
const btnBuyNowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: 'var(--space-md)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-label)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--walnut)',
  background: 'transparent',
  border: '1px solid var(--walnut)',
  cursor: 'pointer',
  minHeight: 52,
};
const productActionsRow2Style = { display: 'flex', gap: '0.6rem' };
const btnWishlistSmStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  height: 48,
  background: 'none',
  border: '1px solid var(--stone)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-caption)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
};
const btnWishlistSmActiveStyle = { ...btnWishlistSmStyle, color: 'var(--bronze)', borderColor: 'var(--bronze)' };
const btnShareStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  height: 48,
  background: 'none',
  border: '1px solid var(--stone)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-caption)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
};

/* Delivery */
const productDeliveryStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: 'var(--space-md)',
  background: 'var(--bg-secondary)',
};
const deliveryRowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.6rem',
  fontSize: 'var(--text-body)',
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
};

/* Related / Recently Viewed */
const relatedSectionStyle = {
  background: 'var(--bg-primary)',
  padding: 'var(--space-xl) 0',
};
const relatedGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 'var(--space-sm)',
};
const pieceCardStyle = {
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
};
const pieceImageStyle = {
  position: 'relative',
  aspectRatio: '3 / 4',
  overflow: 'hidden',
  background: 'var(--bg-secondary)',
  marginBottom: '0.6rem',
};
const pieceImgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const pieceImgSecondaryStyle = { position: 'absolute', inset: 0, opacity: 0 };
const pieceTitleStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  fontWeight: 500,
  marginBottom: '0.15rem',
};
const piecePriceStyle = {
  fontSize: 'var(--text-label)',
  color: 'var(--text-secondary)',
  letterSpacing: '0.04em',
};

/* Reviews */
const reviewItemStyle = {
  padding: 'var(--space-md)',
  borderBottom: 'var(--border-hair)',
};
const reviewHeadStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 'var(--space-xs)',
};
const reviewStarsStyle = {
  color: 'var(--bronze)',
  fontSize: 'var(--text-body)',
  letterSpacing: '0.08em',
  marginBottom: 'var(--space-xs)',
};
const reviewTextStyle = {
  fontSize: 'var(--text-body)',
  color: 'var(--text-secondary)',
  lineHeight: 'var(--lh-relaxed)',
};

/* Review Form */
const formGroupStyle = { marginBottom: 'var(--space-md)' };
const formGroupLabelStyle = {
  display: 'block',
  fontSize: 'var(--text-label)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: 'var(--space-xs)',
};
const formGroupInputStyle = {
  width: '100%',
  padding: '0.75rem',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  color: 'var(--text-primary)',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--stone)',
};
const formRatingStyle = { display: 'flex', gap: '0.3rem' };
const formRatingStarStyle = {
  width: 32, height: 32,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.4rem',
  color: 'var(--stone)',
  padding: 0,
};
const formRatingStarActiveStyle = { ...formRatingStarStyle, color: 'var(--bronze)' };
const btnSubmitReviewStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-label)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--bg-primary)',
  background: 'var(--walnut)',
  border: '1px solid var(--walnut)',
  padding: '1rem 2.5rem',
  cursor: 'pointer',
};

/* Mobile Sticky CTA */
const mobileStickyCtaStyle = {
  position: 'fixed',
  bottom: 56,
  left: 0,
  right: 0,
  zIndex: 160,
  background: 'var(--bg-primary)',
  borderTop: '1px solid var(--stone)',
  padding: 'var(--space-sm) var(--space-md)',
  gap: 'var(--space-sm)',
  display: 'flex',
  alignItems: 'center',
  transform: 'translateY(100%)',
  opacity: 0,
  transition: 'transform var(--dur-slow) var(--ease), opacity var(--dur-slow) var(--ease)',
};
const mobileStickyCtaVisibleStyle = { ...mobileStickyCtaStyle, transform: 'translateY(0)', opacity: 1 };
const mobileStickyPriceStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-body)',
  fontWeight: 500,
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
};
const mobileStickyBtnStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-xs)',
  padding: '0.75rem var(--space-md)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-caption)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--bg-primary)',
  background: 'var(--walnut)',
  border: '1px solid var(--walnut)',
  cursor: 'pointer',
  minHeight: 44,
};

/* Gallery Overlay */
const galleryOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(43,34,27,0.95)',
  zIndex: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity var(--dur-slow) var(--ease), visibility var(--dur-slow) var(--ease)',
};
const galleryOverlayVisibleStyle = { ...galleryOverlayStyle, opacity: 1, visibility: 'visible' };
const galleryOverlayCloseStyle = {
  position: 'absolute',
  top: 'var(--space-md)',
  right: 'var(--space-md)',
  width: 48, height: 48,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--bg-primary)',
  zIndex: 2,
};
const galleryOverlayNavStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 48, height: 48,
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--bg-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const galleryOverlayPrevStyle = { ...galleryOverlayNavStyle, left: 'var(--space-md)' };
const galleryOverlayNextStyle = { ...galleryOverlayNavStyle, right: 'var(--space-md)' };
const galleryOverlayCounterStyle = {
  position: 'absolute',
  bottom: 'var(--space-md)',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: 'var(--text-label)',
  letterSpacing: '0.1em',
  color: 'var(--stone)',
};

/* ============================================
   Inline <style> tag
   ============================================ */
const pageStyles = `
/* Disable hover zoom on touch devices */
@media (hover: none) {
  .product-gallery-main:hover img { transform: none; }
  .product-gallery-main { cursor: default; }
}

/* Gallery loading skeleton */
.product-gallery-main.is-loading::after {
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

.product-thumb.is-active { border-color: var(--bronze); opacity: 1; }
.product-thumb:hover { opacity: 1; transform: scale(1.02); }
.product-thumb:active { transform: scale(0.96); }

.product-gallery-main:hover img { transform: scale(1.08); }
.product-gallery-fullscreen:hover { background: #fff; }
.product-gallery-fullscreen:active { transform: scale(0.9); }
.product-gallery-fullscreen:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }

.product-availability.is-limited { color: var(--bronze); }
.product-availability.is-limited::before { background: var(--bronze); }
.product-availability::before {
  content: '';
  width: 6px; height: 6px;
  background: var(--forest);
  border-radius: var(--radius-full);
}

.qty-btn:hover { background: var(--bg-secondary); }
.qty-btn:active { background: var(--stone); }
.qty-btn:focus-visible { outline: 2px solid var(--bronze); outline-offset: 2px; }

.btn-add-cart:hover { background: var(--forest); border-color: var(--forest); }
.btn-add-cart:active { transform: scale(0.97); }
.btn-add-cart:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }

.btn-buy-now:hover { background: var(--walnut); color: var(--bg-primary); }
.btn-buy-now:active { transform: scale(0.97); }
.btn-buy-now:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }

.btn-wishlist-sm:hover, .btn-share:hover { color: var(--bronze); border-color: var(--bronze); }
.btn-wishlist-sm:active, .btn-share:active { transform: scale(0.9); }
.btn-wishlist-sm:focus-visible, .btn-share:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
.btn-wishlist-sm.is-active { color: var(--bronze); border-color: var(--bronze); }

.piece-card:hover .piece-image .img-secondary { opacity: 1; }
.piece-card:hover .piece-image img:first-child { transform: scale(1.04); }
.piece-card:hover .piece-title { color: var(--bronze); }

/* Accordions */
.pd-accordion { border-bottom: var(--border-hair); }
.pd-accordion:last-child { border-bottom: none; }
.pd-accordion-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: var(--space-md) 0;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
  gap: var(--space-sm);
  transition: color var(--dur-fast) var(--ease);
}
.pd-accordion-btn:hover { color: var(--bronze); }
.pd-accordion-btn:focus-visible { outline: 2px solid var(--bronze); outline-offset: -2px; border-radius: 2px; }
.pd-accordion-btn::after {
  content: '+';
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--text-secondary);
  transition: transform var(--dur-fast) var(--ease);
  flex-shrink: 0;
}
.pd-accordion-btn.is-open::after { transform: rotate(45deg); }
.pd-accordion-body {
  overflow: hidden;
  transition: max-height 400ms var(--ease), opacity 300ms var(--ease);
}
.pd-accordion-body.is-open {
  max-height: 2000px;
  opacity: 1;
}
.pd-accordion-body:not(.is-open) {
  max-height: 0;
  opacity: 0;
}
.pd-accordion-body-inner {
  padding: 0 0 var(--space-md);
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
}
.pd-accordion-body-inner p { margin-bottom: var(--space-sm); }
.pd-accordion-body-inner p:last-child { margin-bottom: 0; }
.pd-accordion-body-inner h4 {
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.pd-spec-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 0.65rem 0;
  border-bottom: var(--border-hair);
  font-size: var(--text-body);
}
.pd-spec-row:last-child { border-bottom: none; }

.faq-q::after {
  content: '+';
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--text-secondary);
  transition: transform var(--dur-fast) var(--ease);
  flex-shrink: 0;
}
.faq-item.is-open .faq-q::after { transform: rotate(45deg); }
.faq-item.is-open .faq-a {
  max-height: 300px;
  padding: 0 0 var(--space-md);
}

.btn-submit-review:hover { background: var(--forest); border-color: var(--forest); }
.btn-submit-review:active { transform: scale(0.97); }
.btn-submit-review:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }

.gallery-overlay-close:active { opacity: 0.7; transform: scale(0.9); }
.gallery-overlay-close:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
.gallery-overlay img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
}
.gallery-overlay-nav:hover { background: rgba(255,255,255,0.2); }
.gallery-overlay-nav:active { transform: translateY(-50%) scale(0.9); }
.gallery-overlay-nav:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }

.mobile-sticky-cta.is-visible { transform: translateY(0); opacity: 1; }
.mobile-sticky-btn:hover { background: var(--forest); border-color: var(--forest); }

.form-rating-star.is-active { color: var(--bronze); }
.form-rating-star:hover { color: var(--bronze); }

.btn-write-review {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  background: none;
  border: 1px solid var(--stone);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: 'var(--text-secondary)';
  transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
}
.btn-write-review:hover { color: var(--bronze); border-color: var(--bronze); }
.btn-write-review:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }

/* --- Responsive --- */
@media (max-width: 860px) {
  .product-grid { grid-template-columns: 1fr; gap: var(--space-md); }
  .product-details { position: static; }
  .product-gallery-main { aspect-ratio: 4/5; }
  .product-thumbs { grid-template-columns: repeat(4, 1fr); gap: var(--space-xs); }
  .related-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
}
@media (max-width: 560px) {
  .product-section { padding: var(--space-sm) 0 var(--space-lg); }
  .product-gallery-main { aspect-ratio: 3/4; }
  .product-gallery-fullscreen { width: 36px; height: 36px; }
  .product-title { font-size: var(--text-h1); }
  .product-price { font-size: 1.3rem; }
  .product-actions-row-2 { flex-direction: column; }
  .related-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
  .mobile-sticky-cta { display: flex; }
  body { padding-bottom: 110px; }
}
@media (max-width: 430px) {
  .product-title { font-size: 1.25rem; }
  .product-price { font-size: 1.15rem; }
  .product-gallery-main { aspect-ratio: 3/4; }
  .product-thumbs img { min-height: 56px; }
  .related-grid { grid-template-columns: 1fr 1fr; gap: var(--space-sm); }
  .mobile-sticky-cta { bottom: 52px; }
  body { padding-bottom: 104px; }
}
`;

export default function ShopDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params?.id || searchParams.get('id') || 'anchor-table';

  const [product, setProduct] = useState(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayIdx, setOverlayIdx] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [faqOpenIdx, setFaqOpenIdx] = useState(null);
  const [mobileStickyVisible, setMobileStickyVisible] = useState(false);
  const [mainImgStyle, setMainImgStyle] = useState({});
  const [storyOpen, setStoryOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const lastFocusedElRef = useRef(null);
  const addToCartBtnRef = useRef(null);
  const galleryMainRef = useRef(null);

  /* Load product data */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.TEAKLE_PRODUCTS) return;
    const p = window.TEAKLE_PRODUCTS.find((item) => item.id === productId);
    if (p) {
      setProduct(p);
      document.title = p.name + ' — Teakle';
    } else if (window.TEAKLE_PRODUCTS.length > 0) {
      setProduct(window.TEAKLE_PRODUCTS[0]);
      document.title = window.TEAKLE_PRODUCTS[0].name + ' — Teakle';
    }
  }, [productId]);

  /* Load wishlist state */
  useEffect(() => {
    if (!product || typeof window === 'undefined') return;
    if (window.Teachle && window.Teachle.isInWishlist) {
      setIsWishlisted(window.Teachle.isInWishlist(product.id));
    }
  }, [product]);

  /* Recently viewed */
  useEffect(() => {
    if (!product || typeof window === 'undefined') return;
    try {
      const key = 'teakle_recently_viewed';
      let rv = JSON.parse(localStorage.getItem(key) || '[]');
      rv = rv.filter((id) => id !== product.id);
      rv.unshift(product.id);
      rv = rv.slice(0, 8);
      localStorage.setItem(key, JSON.stringify(rv));
      const others = rv.slice(1);
      if (others.length > 0 && window.TEAKLE_PRODUCTS) {
        setRecentlyViewed(others.map((rid) => window.TEAKLE_PRODUCTS.find((p) => p.id === rid)).filter(Boolean));
        setShowRecentlyViewed(true);
      }
    } catch (e) {}
  }, [product]);

  /* Load reviews */
  useEffect(() => {
    if (!product || typeof window === 'undefined') return;
    try {
      const key = 'teakle_reviews_' + product.id;
      setReviews(JSON.parse(localStorage.getItem(key) || '[]'));
    } catch (e) {}
  }, [product]);

  /* Gallery hover zoom */
  const handleGalleryMouseMove = useCallback((e) => {
    if (!galleryMainRef.current) return;
    const rect = galleryMainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMainImgStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.15)' });
  }, []);

  const handleGalleryMouseLeave = useCallback(() => {
    setMainImgStyle({ transform: 'scale(1)' });
  }, []);

  /* Set active image */
  const setActiveImage = useCallback((idx) => {
    setCurrentImageIdx(idx);
    setIsGalleryLoading(true);
    setMainImgStyle({ opacity: 0 });
    setTimeout(() => {
      setMainImgStyle({ opacity: 1 });
    }, 200);
  }, []);

  /* Fullscreen overlay */
  const openOverlay = useCallback((idx) => {
    setOverlayIdx(idx);
    lastFocusedElRef.current = document.activeElement;
    setOverlayVisible(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlayVisible(false);
    document.body.style.overflow = '';
    if (lastFocusedElRef.current) lastFocusedElRef.current.focus();
  }, []);

  /* Keyboard for overlay */
  useEffect(() => {
    if (!overlayVisible || !product) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') closeOverlay();
      if (e.key === 'ArrowLeft') {
        setOverlayIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
      }
      if (e.key === 'ArrowRight') {
        setOverlayIdx((prev) => (prev + 1) % product.images.length);
      }
      if (e.key === 'Tab') {
        const overlay = document.getElementById('galleryOverlay');
        if (!overlay) return;
        const focusable = overlay.querySelectorAll('button');
        if (focusable.length === 0) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [overlayVisible, product, closeOverlay]);

  /* Mobile sticky CTA visibility */
  useEffect(() => {
    function onScroll() {
      const addBtn = addToCartBtnRef.current;
      if (!addBtn) return;
      const rect = addBtn.getBoundingClientRect();
      setMobileStickyVisible(rect.bottom < 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Add to Cart */
  const handleAddToCart = useCallback(() => {
    if (!product || typeof window === 'undefined') return;
    if (window.Teachle) {
      for (let q = 0; q < qty; q++) {
        window.Teachle.addToCart({
          id: product.id,
          name: product.name,
          price: product.priceFormatted,
          image: product.images[0],
        });
      }
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }, [product, qty]);

  /* Buy Now */
  const handleBuyNow = useCallback(() => {
    if (!product || typeof window === 'undefined') return;
    if (window.Teachle) {
      for (let q = 0; q < qty; q++) {
        window.Teachle.addToCart({
          id: product.id,
          name: product.name,
          price: product.priceFormatted,
          image: product.images[0],
        });
      }
    }
    window.location.href = '/cart?checkout=1';
  }, [product, qty]);

  /* Wishlist */
  const handleWishlist = useCallback(() => {
    if (!product || typeof window === 'undefined') return;
    if (window.Teachle && window.Teachle.requireAuth) {
      if (!window.Teachle.requireAuth()) return;
    }
    if (window.Teachle && window.Teachle.toggleWishlist) {
      const result = window.Teachle.toggleWishlist({
        id: product.id,
        name: product.name,
        price: product.priceFormatted,
        image: product.images[0],
      });
      setIsWishlisted(result.added);
    }
  }, [product]);

  /* Share */
  const handleShare = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({ title: product?.name, text: product?.shortDescription, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard.');
      });
    }
  }, [product]);

  /* Mobile sticky add to cart */
  const handleMobileStickyAdd = useCallback(() => {
    if (!product || typeof window === 'undefined') return;
    if (window.Teachle) {
      window.Teachle.addToCart({
        id: product.id,
        name: product.name,
        price: product.priceFormatted,
        image: product.images[0],
      });
    }
  }, [product]);

  /* Review form submit */
  const handleReviewSubmit = useCallback((e) => {
    e.preventDefault();
    if (selectedRating === 0) { alert('Please select a rating.'); return; }
    if (!reviewName.trim() || !reviewBody.trim()) { alert('Please fill in all fields.'); return; }
    const review = {
      name: reviewName.trim(),
      title: reviewTitle.trim(),
      body: reviewBody.trim(),
      rating: selectedRating,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
    const updated = [...reviews, review];
    setReviews(updated);
    if (typeof window !== 'undefined' && product) {
      localStorage.setItem('teakle_reviews_' + product.id, JSON.stringify(updated));
    }
    setSelectedRating(0);
    setReviewName('');
    setReviewTitle('');
    setReviewBody('');
    setReviewFormOpen(false);
  }, [selectedRating, reviewName, reviewTitle, reviewBody, reviews, product]);

  /* Derived review stats */
  const reviewTotal = reviews.length;
  const reviewAvg = reviewTotal > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviewTotal).toFixed(1)
    : '0.0';
  const reviewStarsStr = (() => {
    const rounded = Math.round(parseFloat(reviewAvg));
    let s = '';
    for (let i = 0; i < 5; i++) s += i < rounded ? '★' : '☆';
    return s;
  })();

  /* Derived badge */
  const badgeText = !product ? '' : product.availability === 'Limited Edition'
    ? 'Limited Edition'
    : product.availability === 'In Stock'
      ? 'In Stock'
      : 'Handcrafted';

  /* Category for breadcrumb */
  const cat = product && window?.TEAKLE_CATEGORIES?.[product.category];

  if (!product) {
    return (
      <>
        <style>{pageStyles}</style>
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading product...
        </div>
      </>
    );
  }

  return (
    <>
      <style>{pageStyles}</style>
      <Script src="/products.js" strategy="beforeInteractive" />
      <Script src="/app.js" strategy="beforeInteractive" />

      {/* Breadcrumb */}
      <section style={breadcrumbBarStyle}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={breadcrumbStyle}>
            <Link href="/">Home</Link>
            <span className="bc-sep" style={{ color: 'var(--stone)' }}>/</span>
            <Link href="/gallery">Gallery</Link>
            <span className="bc-sep" style={{ color: 'var(--stone)' }}>/</span>
            <Link href={`/subcategory?cat=${product.category}`}>{cat ? cat.name : product.categoryName}</Link>
            <span className="bc-sep" style={{ color: 'var(--stone)' }}>/</span>
            <Link href={`/subcategory?cat=${product.category}&sub=${product.subcategory}`}>{product.subcategoryName}</Link>
            <span className="bc-sep" style={{ color: 'var(--stone)' }}>/</span>
            <span className="bc-current" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Section */}
      <section className="product-section" style={productSectionStyle}>
        <div className="container product-grid" style={productGridStyle}>

          {/* LEFT: Gallery */}
          <div style={productGalleryStyle}>
            <div
              ref={galleryMainRef}
              className={`product-gallery-main ${isGalleryLoading ? 'is-loading' : ''}`}
              style={productGalleryMainStyle}
              onMouseMove={handleGalleryMouseMove}
              onMouseLeave={handleGalleryMouseLeave}
              onDoubleClick={() => openOverlay(currentImageIdx)}
            >
              <span className="product-gallery-badge" style={galleryBadgeStyle}>{badgeText}</span>
              <span className="product-gallery-counter" style={galleryCounterStyle}>{currentImageIdx + 1} / {product.images.length}</span>
              <button
                className="product-gallery-fullscreen"
                style={fullscreenBtnStyle}
                aria-label="View fullscreen"
                onClick={() => openOverlay(currentImageIdx)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18, color: 'var(--text-primary)' }}>
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                </svg>
              </button>
              <img
                src={product.images[currentImageIdx]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity var(--dur-slow) var(--ease), transform var(--dur-fast) var(--ease)', ...mainImgStyle }}
                onLoad={() => setIsGalleryLoading(false)}
              />
            </div>
            <div className="product-thumbs" style={thumbsStyle}>
              {product.thumbnails.map((thumb, i) => (
                <div
                  key={i}
                  className={`product-thumb ${i === currentImageIdx ? 'is-active' : ''}`}
                  style={i === currentImageIdx ? thumbActiveStyle : thumbStyle}
                  tabIndex={0}
                  role="button"
                  aria-label={`View image ${i + 1} of ${product.images.length}`}
                  onClick={() => setActiveImage(i)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveImage(i); } }}
                >
                  <img loading="lazy" src={thumb} alt={`${product.name} view ${i + 1}`} style={thumbImgStyle} />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="product-details" style={productDetailsStyle}>
            <h1 className="product-title" style={productTitleStyle}>{product.name}</h1>
            <p className="product-material-tag" style={productMaterialTagStyle}>{product.material} — {product.subcategoryName}</p>

            <div style={productPriceRowStyle}>
              <span className="product-price" style={productPriceStyle}>{product.priceFormatted}</span>
              <span className="product-availability" style={productAvailabilityStyle}>{product.availabilityNote}</span>
            </div>

            <p className="product-short-desc" style={productShortDescStyle}>{product.shortDescription}</p>

            {/* Key specs (always visible) */}
            <div style={{ borderTop: 'var(--border-hair)', marginBottom: 'var(--space-sm)' }}>
              {product.specifications.slice(0, 3).map((s, i) => (
                <div key={i} style={specRowStyle}>
                  <span style={specLabelStyle}>{s.label}</span>
                  <span style={specValueStyle}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div style={qtyRowStyle}>
              <span style={qtyLabelStyle}>Quantity</span>
              <div style={qtyControlStyle}>
                <button className="qty-btn" style={qtyBtnStyle} aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>&minus;</button>
                <span className="qty-value" style={qtyValueStyle}>{qty}</span>
                <button className="qty-btn" style={qtyBtnStyle} aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div style={productActionsStyle}>
              <button
                ref={addToCartBtnRef}
                className={`btn-add-cart ${isAdded ? 'is-added' : ''}`}
                style={isAdded ? btnAddCartAddedStyle : btnAddCartStyle}
                onClick={handleAddToCart}
              >
                {isAdded ? (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><polyline points="20 6 9 17 4 12" /></svg> Added to Cart</>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg> Add to Cart</>
                )}
              </button>
              <button className="btn-buy-now" style={btnBuyNowStyle} onClick={handleBuyNow}>Buy Now</button>
              <div className="product-actions-row-2" style={productActionsRow2Style}>
                <button
                  className={`btn-wishlist-sm ${isWishlisted ? 'is-active' : ''}`}
                  style={isWishlisted ? btnWishlistSmActiveStyle : btnWishlistSmStyle}
                  onClick={handleWishlist}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  Wishlist
                </button>
                <button className="btn-share" style={btnShareStyle} onClick={handleShare}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                  Share
                </button>
              </div>
            </div>

            {/* Delivery & Trust */}
            <div style={productDeliveryStyle}>
              <div style={deliveryRowStyle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: 'var(--bronze)' }}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                <span>{product.leadTime} delivery. White-glove service available.</span>
              </div>
              <div style={deliveryRowStyle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: 'var(--bronze)' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>Handcrafted in India. Ships worldwide.</span>
              </div>
              <div style={deliveryRowStyle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: 'var(--bronze)' }}><polyline points="20 6 9 17 4 12" /></svg>
                <span>{product.returns}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========== ACCORDIONS BELOW THE FOLD ========== */}
      <section style={{ background: 'var(--bg-primary)', padding: '0 0 var(--space-xl)', borderTop: 'var(--border-hair)' }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '0 var(--space-md)' }}>

          {/* Our Craft — combines Story + Craftsmanship + Materials + Care */}
          <div className="pd-accordion">
            <button
              className={`pd-accordion-btn ${storyOpen ? 'is-open' : ''}`}
              aria-expanded={storyOpen}
              onClick={() => setStoryOpen(!storyOpen)}
            >
              Our Craft — Story, Materials & Care
            </button>
            <div className={`pd-accordion-body ${storyOpen ? 'is-open' : ''}`} aria-hidden={!storyOpen}>
              <div className="pd-accordion-body-inner">
                <h4>The Story</h4>
                <p>{product.story}</p>
                <h4>Craftsmanship</h4>
                <p>{product.craftsmanship}</p>
                <h4>Materials</h4>
                <p>{product.materials}</p>
                <h4>Care Instructions</h4>
                <p>{product.careInstructions}</p>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="pd-accordion">
            <button
              className={`pd-accordion-btn ${specsOpen ? 'is-open' : ''}`}
              aria-expanded={specsOpen}
              onClick={() => setSpecsOpen(!specsOpen)}
            >
              Specifications
            </button>
            <div className={`pd-accordion-body ${specsOpen ? 'is-open' : ''}`} aria-hidden={!specsOpen}>
              <div className="pd-accordion-body-inner">
                {product.specifications.map((s, i) => (
                  <div key={i} className="pd-spec-row">
                    <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping & Returns */}
          <div className="pd-accordion">
            <button
              className={`pd-accordion-btn ${shippingOpen ? 'is-open' : ''}`}
              aria-expanded={shippingOpen}
              onClick={() => setShippingOpen(!shippingOpen)}
            >
              Shipping & Returns
            </button>
            <div className={`pd-accordion-body ${shippingOpen ? 'is-open' : ''}`} aria-hidden={!shippingOpen}>
              <div className="pd-accordion-body-inner">
                <h4>Shipping</h4>
                <p>{product.shipping}</p>
                <h4>Returns</h4>
                <p>{product.returns}</p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          {product.faqs && product.faqs.length > 0 && (
            <div>
              {product.faqs.map((f, i) => (
                <div key={i} className={`faq-item ${faqOpenIdx === i ? 'is-open' : ''}`} style={{ borderBottom: 'var(--border-hair)' }}>
                  <button
                    className="faq-q"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                      background: 'none', border: 'none', padding: 'var(--space-md) 0', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 500,
                      color: 'var(--text-primary)', textAlign: 'left', gap: 'var(--space-sm)',
                    }}
                    aria-expanded={faqOpenIdx === i}
                    onClick={() => setFaqOpenIdx(faqOpenIdx === i ? null : i)}
                  >
                    {f.q}
                  </button>
                  <div className="faq-a" style={{ overflow: 'hidden', fontSize: 'var(--text-body)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)', maxHeight: faqOpenIdx === i ? 300 : 0, padding: faqOpenIdx === i ? '0 0 var(--space-md)' : 0, transition: 'max-height 400ms var(--ease), padding 300ms var(--ease)' }} aria-hidden={faqOpenIdx !== i}>
                    {f.a}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Complete the Space */}
      <section style={relatedSectionStyle}>
        <div className="container">
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <span style={{ fontSize: 'var(--text-caption)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)', display: 'block' }}>Curated</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, var(--text-h2))', marginBottom: 0 }}>Complete the Space</h2>
          </div>
          <div className="related-grid" style={relatedGridStyle}>
            {(product.relatedProducts || []).map((rid) => {
              const rp = window?.TEAKLE_PRODUCTS?.find((p) => p.id === rid);
              if (!rp) return null;
              return (
                <Link key={rid} href={`/shop/${rp.id}`} style={pieceCardStyle} className="piece-card">
                  <div style={pieceImageStyle} className="piece-image">
                    <img loading="lazy" src={rp.images[0]} alt={rp.name} style={pieceImgStyle} />
                    {rp.images[1] && <img className="img-secondary" loading="lazy" src={rp.images[1]} alt={`${rp.name} detail`} style={pieceImgSecondaryStyle} />}
                  </div>
                  <h3 className="piece-title" style={pieceTitleStyle}>{rp.name}</h3>
                  <p style={piecePriceStyle}>
                    <span>{rp.priceFormatted}</span>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--bronze)' }}>Discover →</span>
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews — compact inline section */}
      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-xl) 0' }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Summary + write button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)' }}>{reviewAvg}</span>
              <div>
                <div style={{ color: 'var(--bronze)', fontSize: '1.1rem', letterSpacing: '0.1em', marginBottom: '0.15rem' }}>{reviewStarsStr}</div>
                <p style={{ fontSize: 'var(--text-label)', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>Based on {reviewTotal} review{reviewTotal !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button className="btn-write-review" onClick={() => setReviewFormOpen(!reviewFormOpen)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              {reviewFormOpen ? 'Close' : 'Write a Review'}
            </button>
          </div>

          {/* Inline review form (expandable) */}
          {reviewFormOpen && (
            <div style={{ background: 'var(--bg-primary)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)', maxWidth: 500 }}>
              <form onSubmit={handleReviewSubmit}>
                <div style={formGroupStyle}>
                  <label style={formGroupLabelStyle}>Your Rating</label>
                  <div style={formRatingStyle} role="radiogroup" aria-label="Your Rating">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`form-rating-star ${val <= selectedRating ? 'is-active' : ''}`}
                        style={val <= selectedRating ? formRatingStarActiveStyle : formRatingStarStyle}
                        role="radio"
                        aria-checked={val <= selectedRating}
                        onClick={() => setSelectedRating(val)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div style={formGroupStyle}>
                  <label htmlFor="reviewName" style={formGroupLabelStyle}>Name</label>
                  <input type="text" id="reviewName" required placeholder="Your name" style={formGroupInputStyle} value={reviewName} onChange={(e) => setReviewName(e.target.value)} />
                </div>
                <div style={formGroupStyle}>
                  <label htmlFor="reviewTitle" style={formGroupLabelStyle}>Review Title</label>
                  <input type="text" id="reviewTitle" required placeholder="Summarise your experience" style={formGroupInputStyle} value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} />
                </div>
                <div style={formGroupStyle}>
                  <label htmlFor="reviewBody" style={formGroupLabelStyle}>Your Review</label>
                  <textarea id="reviewBody" required placeholder="Tell us about your experience with this product..." style={{ ...formGroupInputStyle, minHeight: 100, resize: 'vertical' }} value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} />
                </div>
                <button type="submit" style={btnSubmitReviewStyle}>Submit Review</button>
              </form>
            </div>
          )}

          {/* Review list */}
          {reviewTotal === 0 && !reviewFormOpen && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)' }}>No reviews yet. Be the first to share your experience.</p>
          )}
          {[...reviews].reverse().map((r, i) => {
            const rs = Array.from({ length: 5 }, (_, j) => j < r.rating ? '★' : '☆').join('');
            return (
              <div key={i} style={reviewItemStyle}>
                <div style={reviewHeadStyle}>
                  <span style={{ fontWeight: 500, fontSize: 'var(--text-body)' }}>{r.name}</span>
                  <span style={{ fontSize: 'var(--text-label)', color: 'var(--text-secondary)' }}>{r.date}</span>
                </div>
                <div style={reviewStarsStyle}>{rs}</div>
                {r.title && <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: 'var(--text-body)' }}>{r.title}</strong>}
                <p style={reviewTextStyle}>{r.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recently Viewed */}
      {showRecentlyViewed && recentlyViewed.length > 0 && (
        <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-xl) 0', borderTop: 'var(--border-hair)' }}>
          <div className="container">
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <span style={{ fontSize: 'var(--text-caption)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)', display: 'block' }}>Browsing History</span>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, var(--text-h2))', marginBottom: 0 }}>Recently Viewed</h2>
            </div>
            <div className="related-grid" style={relatedGridStyle}>
              {recentlyViewed.map((rp) => (
                <Link key={rp.id} href={`/shop/${rp.id}`} style={pieceCardStyle} className="piece-card">
                  <div style={pieceImageStyle} className="piece-image">
                    <img loading="lazy" src={rp.images[0]} alt={rp.name} style={pieceImgStyle} />
                    {rp.images[1] && <img className="img-secondary" loading="lazy" src={rp.images[1]} alt={`${rp.name} detail`} style={pieceImgSecondaryStyle} />}
                  </div>
                  <h3 className="piece-title" style={pieceTitleStyle}>{rp.name}</h3>
                  <p style={piecePriceStyle}>
                    <span>{rp.priceFormatted}</span>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--bronze)' }}>Discover →</span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Gallery Overlay */}
      <div
        id="galleryOverlay"
        className={overlayVisible ? 'gallery-overlay is-visible' : 'gallery-overlay'}
        style={overlayVisible ? galleryOverlayVisibleStyle : galleryOverlayStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Fullscreen image gallery"
      >
        <button className="gallery-overlay-close" style={galleryOverlayCloseStyle} aria-label="Close fullscreen" onClick={closeOverlay}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <button
          className="gallery-overlay-prev"
          style={galleryOverlayPrevStyle}
          aria-label="Previous image"
          onClick={(e) => { e.stopPropagation(); setOverlayIdx((prev) => (prev - 1 + product.images.length) % product.images.length); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <img
          src={product.images[overlayIdx]}
          alt={`${product.name} image ${overlayIdx + 1}`}
          style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
        />
        <button
          className="gallery-overlay-next"
          style={galleryOverlayNextStyle}
          aria-label="Next image"
          onClick={(e) => { e.stopPropagation(); setOverlayIdx((prev) => (prev + 1) % product.images.length); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <span className="gallery-overlay-counter" style={galleryOverlayCounterStyle}>{overlayIdx + 1} / {product.images.length}</span>
      </div>

      {/* Mobile Sticky CTA */}
      <div
        className={`mobile-sticky-cta ${mobileStickyVisible ? 'is-visible' : ''}`}
        style={mobileStickyVisible ? mobileStickyCtaVisibleStyle : mobileStickyCtaStyle}
      >
        <span className="mobile-sticky-price" style={mobileStickyPriceStyle}>{product.priceFormatted}</span>
        <button className="mobile-sticky-btn" style={mobileStickyBtnStyle} onClick={handleMobileStickyAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
          Add to Cart
        </button>
      </div>
    </>
  );
}

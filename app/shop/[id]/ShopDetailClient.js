'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

/* ============================================
   PRODUCT PAGE — Editorial Catalogue Template
   Single unified layout for every product:
   01 Hero · 02 Key Details · 03 Story · 04 Detail Images ·
   05 Specifications · 06 Lifestyle · 07 Related
   Data: app/data/products.js only. Missing optional fields
   are omitted, never fabricated.
   Behaviour preserved: gallery (switch/zoom/fullscreen/swipe/
   keyboard), quantity (hero = one of one), cart, wishlist,
   share, mobile sticky CTA, recently viewed, related products.
   ============================================ */

const pageStyles = `
/* ================================================================
   BREADCRUMB
   ================================================================ */
.pd-breadcrumb {
  padding: calc(var(--space-xl) + var(--space-sm)) 0 var(--space-sm);
  background: var(--bg-primary);
}
.pd-breadcrumb nav {
  font-size: var(--text-caption);
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}
.pd-breadcrumb .bc-sep { color: var(--stone); }
.pd-breadcrumb .bc-current { color: var(--text-primary); }
.pd-breadcrumb a { transition: color var(--dur-fast) var(--ease); }
.pd-breadcrumb a:hover { color: var(--bronze); }

/* ================================================================
   SECTION MARKERS + SHARED EDITORIAL BITS
   ================================================================ */
.pde-page { background: var(--bg-primary); overflow-x: clip; }
.pde-num {
  font-size: var(--text-caption);
  letter-spacing: 0.14em;
  color: var(--stone);
  font-weight: 400;
  flex-shrink: 0;
}
.pde-strip-num {
  max-width: min(1400px, 100% - 3rem);
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  padding-bottom: var(--space-sm);
}
.pde-eyebrow-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
}
.pde-sec-head {
  max-width: min(1400px, 100% - 3rem);
  margin: 0 auto var(--space-lg);
}
.pde-sec-head h2 {
  font-size: var(--text-h2);
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: var(--lh-heading);
  max-width: none;
  margin: var(--space-xs) 0 0;
}

/* ================================================================
   01 — HERO
   ================================================================ */
.pde-hero { background: var(--bg-primary); padding: var(--space-md) 0 var(--space-xl); }
.pde-hero-inner {
  max-width: min(1400px, 100% - 3rem);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: clamp(var(--space-lg), 4vw, var(--space-2xl));
  align-items: start;
}
.pde-info-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}
.pde-title {
  font-size: var(--text-display);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: var(--lh-display);
  margin: 0 0 0.35rem;
  max-width: none;
}
.pde-short-desc {
  color: var(--text-secondary);
  font-size: var(--text-body);
  line-height: var(--lh-relaxed);
  margin: 0 0 var(--space-sm);
  max-width: 50ch;
}
.pde-meta {
  color: var(--text-secondary);
  font-size: var(--text-body);
  line-height: var(--lh-relaxed);
  letter-spacing: 0.01em;
  margin: 0 0 var(--space-sm);
  max-width: 52ch;
}
.pde-price-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}
.pde-price {
  font-family: var(--font-display);
  font-size: var(--text-display-sm);
  font-weight: 500;
  color: var(--text-primary);
}
.pde-avail {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--text-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--forest);
}
.pde-avail::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--forest);
  border-radius: var(--radius-full);
}
.pde-avail.is-limited { color: var(--bronze); }
.pde-avail.is-limited::before { background: var(--bronze); }

/* Gallery */
.pd-gallery { position: relative; min-width: 0; }
.pd-gallery-main {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--bg-secondary);
  margin-bottom: var(--space-sm);
  cursor: zoom-in;
}
.pd-gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: pd-fade 450ms var(--ease);
}
@keyframes pd-fade {
  from { opacity: 0.3; }
  to { opacity: 1; }
}
.pd-gallery-main.is-zoomed { cursor: zoom-out; }
.pd-gallery-main.is-zoomed img { transform: scale(1.8); }

/* Desktop: fit the whole product in one viewport. The frame is sized
   by viewport height (not column width) and the image is contained,
   so the complete product is visible without scrolling, cropping,
   or distortion. Mobile keeps the aspect-driven presentation. */
@media (min-width: 861px) {
  .pd-gallery-main {
    aspect-ratio: auto;
    height: 640px;
    height: clamp(320px, calc(100vh - 270px), 760px);
    height: clamp(320px, calc(100svh - 270px), 760px);
  }
  .pd-gallery-main img { object-fit: contain; }
}
.pd-gallery-badge {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  background: var(--walnut);
  color: var(--bg-primary);
  font-size: var(--text-caption);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.35rem 0.75rem;
  z-index: 2;
}
.pd-gallery-counter {
  position: absolute;
  bottom: var(--space-sm);
  right: var(--space-sm);
  background: rgba(43,34,27,0.65);
  color: var(--bg-primary);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  padding: 0.3rem 0.65rem;
  z-index: 2;
}
.pd-gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease);
}
.pd-gallery-main:hover .pd-gallery-nav,
.pd-gallery-main:focus-within .pd-gallery-nav { opacity: 1; }
.pd-gallery-nav:active { background: rgba(255,255,255,0.7); }
.pd-gallery-prev { left: var(--space-sm); }
.pd-gallery-next { right: var(--space-sm); }
.pd-gallery-fullscreen {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.pd-gallery-fullscreen:active { background: rgba(255,255,255,0.7); }
.pd-gallery-zoom-hint {
  position: absolute;
  bottom: var(--space-sm);
  left: var(--space-sm);
  background: rgba(43,34,27,0.65);
  color: var(--bg-primary);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  padding: 0.3rem 0.65rem;
  z-index: 2;
  opacity: 0;
  transition: opacity 300ms var(--ease);
  pointer-events: none;
}
@media (hover: hover) {
  .pd-gallery-main:hover .pd-gallery-zoom-hint { opacity: 1; }
}
.pd-thumbs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}
.pd-thumb {
  aspect-ratio: 1 / 1;
  cursor: pointer;
  overflow: hidden;
  border: 1.5px solid transparent;
  background: none;
  padding: 0;
  opacity: 0.65;
  transition: border-color var(--dur-fast) var(--ease), opacity var(--dur-fast) var(--ease);
}
.pd-thumb.is-active { border-color: var(--bronze); opacity: 1; }
.pd-thumb:hover { opacity: 1; }
.pd-thumb:focus-visible { outline: 2px solid var(--bronze); outline-offset: 2px; }
.pd-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Purchase (integrated, no card) */
.pde-info { position: sticky; top: 100px; min-width: 0; }
.pde-info .eyebrow { display: block; margin-bottom: 0; }
.pd-qty {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}
.pd-qty-label {
  font-size: var(--text-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}
.pd-qty-ctrl {
  display: flex;
  align-items: center;
  border: 1px solid var(--stone);
}
.pd-qty-btn {
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-subhead);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--dur-fast) var(--ease);
}
.pd-qty-btn:hover { background: var(--bg-secondary); }
.pd-qty-btn:active { background: var(--stone); }
.pd-qty-val {
  width: 52px;
  text-align: center;
  font-size: var(--text-body);
  font-weight: 500;
  border-left: 1px solid var(--stone);
  border-right: 1px solid var(--stone);
  height: 44px;
  line-height: 44px;
}
.pd-actions { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: var(--space-md); }
.pd-btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-md);
  font-family: var(--font-body);
  font-size: var(--text-label);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bg-primary);
  background: var(--walnut);
  border: 1px solid var(--walnut);
  cursor: pointer;
  min-height: 56px;
  transition: background var(--dur-fast) var(--ease), transform 150ms var(--ease);
}
.pd-btn-add:hover { background: var(--forest); border-color: var(--forest); }
.pd-btn-add:active { transform: scale(0.97); }
.pd-btn-add.is-added { background: var(--forest); border-color: var(--forest); }
.pd-btn-secondary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: 48px;
  background: none;
  border: 1px solid var(--stone);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
}
.pd-btn-secondary:hover { color: var(--bronze); border-color: var(--bronze); }
.pd-btn-secondary.is-active { color: var(--bronze); border-color: var(--bronze); }
.pde-quiet-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}
.pde-quiet-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
}
.pde-quiet-link:hover { color: var(--bronze); border-bottom-color: var(--bronze); }
.pd-delivery {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: var(--space-md) 0;
  border-top: var(--border-hair);
}
.pd-delivery-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* ================================================================
   02 — KEY DETAILS
   ================================================================ */
.pde-keys {
  background: var(--bg-primary);
  border-top: var(--border-hair);
  border-bottom: var(--border-hair);
  padding: var(--space-lg) 0;
}
.pde-keys-inner {
  max-width: min(1400px, 100% - 3rem);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}
.pde-key { display: flex; gap: var(--space-sm); align-items: flex-start; min-width: 0; }
.pde-key-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: var(--bronze);
  margin-top: 2px;
}
.pde-key-label {
  display: block;
  font-size: var(--text-caption);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 0.2rem;
}
.pde-key-value {
  display: block;
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

/* ================================================================
   03 — STORY
   ================================================================ */
.pde-story { background: var(--bg-primary); padding: var(--space-2xl) 0; }
.pde-story-inner {
  max-width: min(1400px, 100% - 3rem);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(var(--space-lg), 4vw, var(--space-2xl));
  align-items: center;
}
.pde-story-text .eyebrow { display: block; margin-bottom: var(--space-sm); }
.pde-story-text h2 {
  font-size: var(--text-h1);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: var(--lh-heading);
  max-width: 16ch;
  margin: 0 0 var(--space-md);
}
.pde-story-text p {
  color: var(--text-secondary);
  font-size: var(--text-body);
  line-height: var(--lh-relaxed);
  max-width: 52ch;
  margin: 0;
}
.pde-story-img { overflow: hidden; background: var(--bg-secondary); }
.pde-story-img img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  transition: transform 1.2s var(--ease);
}
.pde-story-img:hover img { transform: scale(1.02); }

/* ================================================================
   04 — DETAIL IMAGES
   ================================================================ */
.pde-details { background: var(--bg-primary); padding: 0 0 var(--space-2xl); }
.pde-details-grid {
  max-width: min(1400px, 100% - 3rem);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: var(--space-sm);
}
.pde-detail { overflow: hidden; background: var(--bg-secondary); }
.pde-detail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 1.2s var(--ease);
}
.pde-detail:hover img { transform: scale(1.02); }
.pde-detail:first-child { aspect-ratio: 4 / 3; }
.pde-detail:last-child { aspect-ratio: 1 / 1; }
.pde-details-grid:has(> :only-child) { grid-template-columns: 1fr; }
.pde-details-grid:has(> :only-child) .pde-detail:first-child { aspect-ratio: 21 / 9; }

/* ================================================================
   05 — SPECIFICATIONS
   ================================================================ */
.pde-specs { background: var(--bg-secondary); padding: var(--space-2xl) 0; }
.pde-specs-inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}
.pd-info-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-md);
  padding: 0.7rem 0;
  border-bottom: var(--border-hair);
  font-size: var(--text-body);
}
.pd-info-row:first-of-type { border-top: var(--border-hair); }
.pd-info-label { color: var(--text-secondary); flex-shrink: 0; }
.pd-info-value { color: var(--text-primary); text-align: right; font-weight: 500; }

/* ================================================================
   06 — LIFESTYLE
   ================================================================ */
.pde-life {
  position: relative;
  min-height: 72vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  background: var(--walnut);
}
.pde-life img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pde-life::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(43,34,27,0) 30%, rgba(43,34,27,0.55) 100%);
}
.pde-life-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: min(1400px, 100% - 3rem);
  margin: 0 auto;
  padding: 0 0 var(--space-2xl);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-lg);
  flex-wrap: wrap;
}
.pde-life-text .eyebrow { color: var(--stone); display: block; margin-bottom: var(--space-sm); }
.pde-life-text h2 {
  color: var(--bg-primary);
  font-size: var(--text-h2);
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: var(--lh-heading);
  max-width: 22ch;
  margin: 0 0 var(--space-sm);
}
.pde-life-text p {
  color: rgba(247,244,238,0.85);
  font-size: var(--text-body);
  line-height: var(--lh-relaxed);
  max-width: 52ch;
  margin: 0;
}
.pde-life-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-sm);
  flex-shrink: 0;
}
.pde-life .pde-num { color: rgba(247,244,238,0.65); }
.pde-life-cta {
  color: var(--bg-primary);
  font-size: var(--text-caption);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border-bottom: 1px solid rgba(247,244,238,0.5);
  padding-bottom: 4px;
  transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
}
.pde-life-cta:hover { color: var(--bronze); border-color: var(--bronze); }

/* ================================================================
   07 — RELATED
   ================================================================ */
.pde-related { background: var(--bg-primary); padding: var(--space-2xl) 0; }
.pde-related-inner { max-width: min(1400px, 100% - 3rem); margin: 0 auto; }
.pde-related-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}
.pde-related-head h2 {
  font-size: clamp(1.4rem, 2.5vw, var(--text-h2));
  font-weight: 500;
  letter-spacing: -0.015em;
  max-width: none;
  margin: 0;
}
.pde-related-more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  flex-shrink: 0;
  transition: color var(--dur-fast) var(--ease);
}
.pde-related-more:hover { color: var(--bronze); }
.pde-rel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}
.pde-rel-card { text-decoration: none; display: block; min-width: 0; }
.pde-rel-card:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
.pde-rel-img { overflow: hidden; background: var(--bg-secondary); margin-bottom: 0.75rem; }
.pde-rel-img img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  display: block;
  transition: transform 1.2s var(--ease);
}
.pde-rel-card:hover .pde-rel-img img { transform: scale(1.03); }
.pde-rel-card h3 {
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.15rem;
  line-height: 1.35;
  transition: color var(--dur-fast) var(--ease);
}
.pde-rel-card:hover h3 { color: var(--bronze); }
.pde-rel-card p {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  letter-spacing: 0.04em;
  margin: 0;
}

/* ================================================================
   MOBILE ACCORDIONS (details disclosure on small screens)
   ================================================================ */
.pde-acc { display: none; }
.pd-accordions { background: var(--bg-primary); padding: 0 0 var(--space-xl); border-top: var(--border-hair); }
.pd-accordions-inner { max-width: 900px; margin: 0 auto; padding: 0 var(--space-md); }
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
  min-height: 44px;
  transition: color var(--dur-fast) var(--ease);
}
.pd-accordion-btn:hover { color: var(--bronze); }
.pd-accordion-btn::after {
  content: '+';
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--text-secondary);
  transition: transform var(--dur-fast) var(--ease);
  flex-shrink: 0;
}
.pd-accordion-btn.is-open::after { transform: rotate(45deg); }
.pd-accordion-body { overflow: hidden; transition: max-height 400ms var(--ease), opacity 300ms var(--ease); }
.pd-accordion-body.is-open { max-height: 2000px; opacity: 1; }
.pd-accordion-body:not(.is-open) { max-height: 0; opacity: 0; }
.pd-accordion-inner {
  padding: 0 0 var(--space-md);
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
}
.pd-accordion-inner p { margin: 0 0 var(--space-sm); }
.pd-accordion-inner p:last-child { margin-bottom: 0; }
.pd-accordion-inner .pd-info-row { font-size: var(--text-body); }

/* ================================================================
   OVERLAY + MOBILE STICKY CTA
   ================================================================ */
.pd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(43,34,27,0.95);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--dur-slow) var(--ease), visibility var(--dur-slow) var(--ease);
}
.pd-overlay.is-visible { opacity: 1; visibility: visible; }
.pd-overlay-close {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 48px;
  height: 48px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--bg-primary);
  z-index: 2;
}
.pd-overlay-close:active { opacity: 0.7; }
.pd-overlay img { max-width: 90vw; max-height: 85vh; object-fit: contain; }
.pd-overlay-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.1);
  border: none;
  cursor: pointer;
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pd-overlay-nav:hover { background: rgba(255,255,255,0.2); }
.pd-overlay-prev { left: var(--space-md); }
.pd-overlay-next { right: var(--space-md); }
.pd-overlay-counter {
  position: absolute;
  bottom: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-label);
  letter-spacing: 0.1em;
  color: var(--stone);
}
.pd-mobile-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 160;
  background: var(--bg-primary);
  border-top: 1px solid var(--stone);
  padding: var(--space-sm) var(--space-md);
  padding-bottom: calc(var(--space-sm) + env(safe-area-inset-bottom, 0px));
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transform: translateY(100%);
  opacity: 0;
  transition: transform var(--dur-slow) var(--ease), opacity var(--dur-slow) var(--ease);
  pointer-events: none;
}
.pd-mobile-cta.is-visible { transform: translateY(0); opacity: 1; pointer-events: auto; }
.pd-mobile-price {
  font-family: var(--font-display);
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}
.pd-mobile-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: 0.75rem var(--space-md);
  font-family: var(--font-body);
  font-size: var(--text-caption);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bg-primary);
  background: var(--walnut);
  border: 1px solid var(--walnut);
  cursor: pointer;
  min-height: 48px;
}

/* ================================================================
   RESPONSIVE
   ================================================================ */
@media (max-width: 1280px) {
  .pde-hero-inner,
  .pde-keys-inner,
  .pde-story-inner,
  .pde-details-grid,
  .pde-life-content,
  .pde-related-inner,
  .pde-strip-num,
  .pde-sec-head { max-width: min(1200px, 100% - 2.5rem); }
}
@media (max-width: 1024px) {
  .pde-hero-inner { grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
  .pde-rel-grid { grid-template-columns: repeat(2, 1fr); }
  .pde-story-text h2 { font-size: var(--text-h2); }
  .pde-life { min-height: 64vh; }
}
@media (max-width: 860px) {
  .pde-info { position: static; }
  .pde-hero-inner { grid-template-columns: 1fr; }
  .pd-gallery-main { aspect-ratio: 4 / 5; }
  .pd-gallery-nav { opacity: 1; }
  .pde-keys-inner { grid-template-columns: repeat(2, 1fr); gap: var(--space-md) var(--space-sm); }
  .pde-story-inner { grid-template-columns: 1fr; gap: var(--space-md); }
  .pde-story-img img { aspect-ratio: 16 / 10; }
  .pde-story-text h2 { font-size: var(--text-h2); }
  .pde-details-grid { grid-template-columns: 1fr 1fr; }
  .pde-life { min-height: 78vh; }
  .pde-life-content { flex-direction: column; align-items: flex-start; }
  .pde-life-side { flex-direction: row; align-items: center; justify-content: space-between; width: 100%; }
  .pde-acc { display: block; }
  .pde-rel-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md) var(--space-sm); }
}
@media (max-width: 560px) {
  .pde-hero { padding-top: 0; }
  .pde-hero-inner,
  .pde-keys-inner,
  .pde-story-inner,
  .pde-details-grid,
  .pde-related-inner,
  .pde-strip-num,
  .pde-sec-head { max-width: none; margin-left: 0; margin-right: 0; padding-left: var(--space-md); padding-right: var(--space-md); }
  .pde-life-content { padding-left: var(--space-md); padding-right: var(--space-md); }
  .pde-title { font-size: var(--text-h1); }
  .pde-price { font-size: 1.35rem; }
  .pde-story { padding: var(--space-xl) 0; }
  .pde-details { padding-bottom: var(--space-xl); }
  .pde-specs { padding: var(--space-xl) 0; }
  .pde-life { min-height: 82vh; }
  .pde-rel-img img { aspect-ratio: 1 / 1; }
  .pd-overlay-nav { width: 44px; height: 44px; }
}
@media (max-width: 430px) {
  .pde-title { font-size: 1.65rem; }
  .pde-keys-inner { gap: var(--space-sm); }
  .pde-key-icon { width: 24px; height: 24px; }
  .pde-life { min-height: 84vh; }
}
@media (hover: none) {
  .pd-gallery-nav { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .pd-gallery-main img { animation: none; }
  .pde-story-img img,
  .pde-detail img,
  .pde-rel-img img { transition: none; }
  .pd-accordion-body { transition: none; }
  .pd-mobile-cta { transition: none; }
}
`;

export default function ShopDetailClient({ product: initialProduct, productId: initialProductId, processSlug = null, sold = false }) {
  const productId = initialProductId;

  const [product, setProduct] = useState({
    thumbnails: [],
    specifications: [],
    story: '',
    craftsmanship: '',
    materials: '',
    careInstructions: '',
    shipping: '',
    returns: '',
    relatedProducts: [],
    availabilityNote: '',
    category: '',
    categoryName: '',
    subcategory: '',
    subcategoryName: '',
    images: [],
    ...initialProduct,
  });
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayIdx, setOverlayIdx] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(false);
  const [mobileStickyVisible, setMobileStickyVisible] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const lastFocusedElRef = useRef(null);
  const addToCartBtnRef = useRef(null);
  const galleryMainRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const isSignature = product?.isHero === true;

  /* Path to the dedicated process page when one exists for this product. */
  const processHref = processSlug ? `/process/${processSlug}` : null;

  /* First sentence of a text — clean editorial heading without mid-word cuts. */
  const firstSentence = (text) => {
    if (!text) return '';
    const idx = text.indexOf('. ');
    if (idx !== -1) return text.slice(0, idx + 1);
    return text.length > 120 ? text.slice(0, 120).trimEnd() + '…' : text;
  };

  /* Sync product from window.TEAKLE_PRODUCTS for extended fields (fallback if server data incomplete).
     Server props are authoritative (full media + story). The browser dataset is
     a lightweight subset, so only fill gaps — never overwrite populated fields.
     (A stale browser copy once truncated the gallery to a single image.) */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.TEAKLE_PRODUCTS) return;
    const p = window.TEAKLE_PRODUCTS.find((item) => item.id === productId);
    if (p) {
      setProduct((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const [key, value] of Object.entries(p)) {
          if (value === undefined) continue;
          const current = next[key];
          const isEmpty =
            current === undefined ||
            current === null ||
            current === '' ||
            (Array.isArray(current) && current.length === 0);
          if (!isEmpty) continue;
          next[key] = value;
          changed = true;
        }
        return changed ? next : prev;
      });
    }
    /* Resolve related products client-side to avoid server/client hydration mismatch.
       Standard catalogue only — the Atelier hero is excluded by design. */
    if (product?.relatedProducts?.length > 0) {
      const resolved = product.relatedProducts
        .map((rid) => window.TEAKLE_PRODUCTS.find((rp) => rp.id === rid))
        .filter((rp) => rp && !rp.isHero);
      setRelatedProducts(resolved);
    }
  }, [productId, product?.relatedProducts]);

  /* Wishlist state */
  useEffect(() => {
    if (!product || typeof window === 'undefined') return;
    if (window.Teakle && window.Teakle.isInWishlist) {
      setIsWishlisted(window.Teakle.isInWishlist(product.id));
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

  /* Gallery keyboard navigation */
  const goToPrev = useCallback(() => {
    if (!product) return;
    setCurrentImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
    setIsGalleryLoading(true);
  }, [product]);

  const goToNext = useCallback(() => {
    if (!product) return;
    setCurrentImageIdx((prev) => (prev + 1) % product.images.length);
    setIsGalleryLoading(true);
  }, [product]);

  useEffect(() => {
    if (overlayVisible) return;
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [goToPrev, goToNext, overlayVisible]);

  /* Gallery touch swipe */
  const handleTouchStart = useCallback((e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    const dy = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) goToPrev();
      else goToNext();
    }
  }, [goToPrev, goToNext]);

  /* Gallery zoom */
  const handleGalleryClick = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  const setActiveImage = useCallback((idx) => {
    setCurrentImageIdx(idx);
    setIsGalleryLoading(true);
    setIsZoomed(false);
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

  useEffect(() => {
    if (!overlayVisible || !product) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') closeOverlay();
      if (e.key === 'ArrowLeft') setOverlayIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
      if (e.key === 'ArrowRight') setOverlayIdx((prev) => (prev + 1) % product.images.length);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [overlayVisible, product, closeOverlay]);

  /* Mobile sticky CTA */
  useEffect(() => {
    function onScroll() {
      const btn = addToCartBtnRef.current;
      if (!btn) return;
      setMobileStickyVisible(btn.getBoundingClientRect().bottom < 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Add to Cart — never for a sold piece (server + store enforce the same rule) */
  const handleAddToCart = useCallback(() => {
    if (!product || typeof window === 'undefined') return;
    if (sold) return;
    if (window.Teakle) {
      const addQty = product.isHero ? 1 : qty;
      window.Teakle.addToCart({ id: product.id, name: product.name, price: product.priceFormatted, image: product.images[0], qty: addQty });
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }, [product, qty]);

  /* Wishlist */
  const handleWishlist = useCallback(() => {
    if (!product || typeof window === 'undefined') return;
    if (window.Teakle && window.Teakle.requireAuth && !window.Teakle.requireAuth()) return;
    if (window.Teakle && window.Teakle.toggleWishlist) {
      const result = window.Teakle.toggleWishlist({ id: product.id, name: product.name, price: product.priceFormatted, image: product.images[0] });
      setIsWishlisted(result.added);
    }
  }, [product]);

  /* Share — native share where supported, clipboard fallback, never errors. */
  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'Teakle',
          text: product?.shortDescription || '',
          url,
        });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // user dismissed — not an error
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Legacy fallback for contexts without the async clipboard API.
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
    } catch (e) {
      // Sharing unavailable — leave the control untouched, never raises.
    }
  }, [product]);

  /* Badge */
  const badgeText = !product ? '' : sold ? 'Sold' : product.availability === 'Limited Edition' ? 'Limited Edition' : product.availability === 'In Stock' ? 'In Stock' : 'Handcrafted';

  /* Category */
  const cat = product && typeof window !== 'undefined' ? window?.TEAKLE_CATEGORIES?.[product.category] : null;

  if (!product) {
    return (
      <>
        <style>{pageStyles}</style>
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading product...</div>
      </>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const thumbs = Array.isArray(product.thumbnails) && product.thumbnails.length ? product.thumbnails : images;
  const safeIdx = images.length ? currentImageIdx % images.length : 0;
  const detailImages = images.slice(2);
  const storyImage = images[1] || images[0];
  const lifestyleImage = images[0];
  const specs = Array.isArray(product.specifications) ? product.specifications : [];

  /* 02 — Key details, from top-level attributes only. Missing fields omitted. */
  const keyDetails = [
    product.material ? { label: 'Material', value: product.material, icon: 'material' } : null,
    product.dimensions ? { label: 'Dimensions', value: product.dimensions, icon: 'dimensions' } : null,
    product.buildTime ? { label: 'Build Time', value: product.buildTime, icon: 'time' } : null,
    product.finish ? { label: 'Finish', value: product.finish, icon: 'finish' } : null,
  ].filter(Boolean);

  const keyIcon = (kind) => {
    const common = { viewBox: '0 0 28 28', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', 'aria-hidden': 'true', className: 'pde-key-icon' };
    if (kind === 'dimensions') {
      return (<svg {...common}><path d="M4 10h20M4 10l3-3M4 10l3 3M24 10l-3-3M24 10l-3 3M7 18h14M7 18l2.5-2.5M7 18l2.5 2.5M21 18l-2.5-2.5M21 18l-2.5 2.5" /></svg>);
    }
    if (kind === 'time') {
      return (<svg {...common}><circle cx="14" cy="14" r="9" /><polyline points="14 8.5 14 14 18.5 16.5" /></svg>);
    }
    if (kind === 'finish') {
      return (<svg {...common}><path d="M14 3.5l7.5 7.5a9.5 9.5 0 1 1-15 0z" /></svg>);
    }
    return (<svg {...common}><path d="M4 9.5l10-5 10 5-10 5z" /><path d="M4 9.5V18l10 5 10-5V9.5" /><path d="M14 14.5V23.5" /></svg>);
  };

  /* Mobile accordion groups, each rendered only with real content. */
  const accDetails = [product.description, product.craftsmanship].filter(Boolean);
  const accMaterials = [product.materials, product.finish ? `Finish — ${product.finish}` : ''].filter(Boolean);
  const accDimensions = [
    product.dimensions ? `Dimensions — ${product.dimensions}` : '',
    product.weight ? `Weight — ${product.weight}` : '',
    product.seats ? `Seats — ${product.seats}` : '',
  ].filter(Boolean);

  const renderAccordion = (title, open, setOpen, body) => (
    <div className="pd-accordion">
      <button className={`pd-accordion-btn ${open ? 'is-open' : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}>
        {title}
      </button>
      <div className={`pd-accordion-body ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="pd-accordion-inner">{body}</div>
      </div>
    </div>
  );

  const renderRelatedCard = (rp) => (
    <Link key={rp.id} href={`/shop/${rp.id}`} className="pde-rel-card">
      <div className="pde-rel-img">
        <img loading="lazy" src={rp.images?.[0]} alt={rp.name} />
      </div>
      <h3>{rp.name}</h3>
      <p>{rp.subcategoryName || rp.categoryName || ''}</p>
    </Link>
  );

  const renderOverlay = () => (
    <div
      id="galleryOverlay"
      className={`pd-overlay ${overlayVisible ? 'is-visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen image gallery"
    >
      <button className="pd-overlay-close" aria-label="Close fullscreen" onClick={closeOverlay}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
      <button className="pd-overlay-nav pd-overlay-prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); setOverlayIdx((prev) => (prev - 1 + images.length) % images.length); }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <img src={images[overlayIdx]} alt={`${product.name} image ${overlayIdx + 1}`} />
      <button className="pd-overlay-nav pd-overlay-next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); setOverlayIdx((prev) => (prev + 1) % images.length); }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><polyline points="9 18 15 12 9 6" /></svg>
      </button>
      <span className="pd-overlay-counter">{overlayIdx + 1} / {images.length}</span>
    </div>
  );

  const renderMobileCta = () => (
    <div className={`pd-mobile-cta ${mobileStickyVisible ? 'is-visible' : ''}`}>
      <span className="pd-mobile-price">{sold ? 'Sold' : product.priceFormatted}</span>
      {sold ? (
        <span className="pd-mobile-btn" role="status" style={{ justifyContent: 'center' }}>Sold</span>
      ) : (
      <button className="pd-mobile-btn" onClick={handleAddToCart}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
        Add to Cart
      </button>
      )}
    </div>
  );

  const metaBits = [product.material, product.dimensions, product.buildTime].filter(Boolean);

  return (
    <div className="pde-page">
      <style>{pageStyles}</style>

      {/* Breadcrumb */}
      <section className="pd-breadcrumb">
        <div className="container">
          <nav aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="bc-sep">/</span>
            <Link href="/gallery">Gallery</Link>
            <span className="bc-sep">/</span>
            <Link href={`/subcategory?cat=${product.category}`}>{cat ? cat.name : product.categoryName}</Link>
            <span className="bc-sep">/</span>
            <Link href={`/subcategory?cat=${product.category}&sub=${product.subcategory}`}>{product.subcategoryName}</Link>
            <span className="bc-sep">/</span>
            <span className="bc-current">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* 01 — HERO */}
      <section className="pde-hero">
        <div className="pde-hero-inner">
          <div className="pd-gallery">
            <div
              ref={galleryMainRef}
              className={`pd-gallery-main ${isGalleryLoading ? 'is-loading' : ''} ${isZoomed ? 'is-zoomed' : ''}`}
              onClick={handleGalleryClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <span className="pd-gallery-badge">{badgeText}</span>
              <span className="pd-gallery-counter" aria-label={`Image ${safeIdx + 1} of ${images.length}`}>{safeIdx + 1} / {images.length}</span>
              <span className="pd-gallery-zoom-hint">Click to zoom</span>
              <button className="pd-gallery-fullscreen" aria-label="View fullscreen" onClick={(e) => { e.stopPropagation(); openOverlay(safeIdx); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18, color: 'var(--text-primary)' }}>
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                </svg>
              </button>
              <button className="pd-gallery-nav pd-gallery-prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); goToPrev(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20, color: 'var(--text-primary)' }}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button className="pd-gallery-nav pd-gallery-next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); goToNext(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20, color: 'var(--text-primary)' }}><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              {images.length > 0 ? (
                <img
                  key={safeIdx}
                  src={images[safeIdx]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%' }}
                  onLoad={() => setIsGalleryLoading(false)}
                />
              ) : null}
            </div>
            {thumbs.length > 1 ? (
              <div className="pd-thumbs">
                {thumbs.map((thumb, i) => (
                  <div
                    key={i}
                    className={`pd-thumb ${i === safeIdx ? 'is-active' : ''}`}
                    tabIndex={0}
                    role="button"
                    aria-label={`View image ${i + 1}`}
                    onClick={() => setActiveImage(i)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveImage(i); } }}
                  >
                    <img loading="lazy" src={thumb} alt={`${product.name} view ${i + 1}`} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="pde-info">
            <div className="pde-info-top">
              <span className="eyebrow">{cat ? cat.name : product.categoryName}</span>
              <span className="pde-num" aria-hidden="true">01</span>
            </div>
            <h1 className="pde-title">{product.name}</h1>
            {product.shortDescription ? (
              <p className="pde-short-desc">{product.shortDescription}</p>
            ) : null}
            {metaBits.length > 0 ? (
              <p className="pde-meta">{metaBits.join('  ·  ')}</p>
            ) : null}
            <div className="pde-price-row">
              <span className="pde-price">{product.priceFormatted}</span>
              {product.availabilityNote ? (
                <span className={`pde-avail ${product.availability === 'Limited Edition' ? 'is-limited' : ''}`}>{product.availabilityNote}</span>
              ) : null}
            </div>
            <div className="pd-qty">
              {isSignature ? (
                <>
                  <span className="pd-qty-label">Availability</span>
                  <div className="pd-qty-ctrl" style={{ border: 'none' }}>
                    <span className="pd-qty-val" style={{ width: 'auto', border: 'none', fontWeight: 500, color: 'var(--bronze)' }}>One of one</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="pd-qty-label">Quantity</span>
                  <div className="pd-qty-ctrl">
                    <button className="pd-qty-btn" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>&minus;</button>
                    <span className="pd-qty-val">{qty}</span>
                    <button className="pd-qty-btn" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
                  </div>
                </>
              )}
            </div>
            <div className="pd-actions">
              {sold ? (
                <div role="status" style={{ padding: '0.9rem 0', borderTop: 'var(--border-hair)', borderBottom: 'var(--border-hair)' }}>
                  <div style={{ fontSize: 'var(--text-body-lg)', fontWeight: 500, letterSpacing: '0.06em' }}>SOLD</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', marginTop: '0.25rem' }}>One of One · No longer available. This piece remains as part of TEAKLE&rsquo;s history.</div>
                </div>
              ) : (
              <button ref={addToCartBtnRef} className={`pd-btn-add ${isAdded ? 'is-added' : ''}`} onClick={handleAddToCart}>
                {isAdded ? (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><polyline points="20 6 9 17 4 12" /></svg> Added to Cart</>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg> Add to Cart</>
                )}
              </button>
              )}
              <button className={`pd-btn-secondary ${isWishlisted ? 'is-active' : ''}`} onClick={handleWishlist}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                Add to Wishlist
              </button>
              <div className="pde-quiet-row">
                <Link href="/contact" className="pde-quiet-link">
                  Enquire about this piece
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>
                <button className="pde-quiet-link" onClick={handleShare}>
                  {shareCopied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>
            <div className="pd-delivery">
              <div className="pd-delivery-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: 'var(--bronze)' }}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                <span>White-glove delivery available.</span>
              </div>
              <div className="pd-delivery-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: 'var(--bronze)' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>Handcrafted in India. Ships worldwide.</span>
              </div>
              {product.returns ? (
                <div className="pd-delivery-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: 'var(--bronze)' }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span>{product.returns}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 02 — KEY DETAILS */}
      {keyDetails.length > 0 ? (
        <section className="pde-keys" aria-label="Key details">
          <div className="pde-strip-num"><span className="pde-num" aria-hidden="true">02</span></div>
          <div className="pde-keys-inner">
            {keyDetails.map((k) => (
              <div key={k.label} className="pde-key">
                {keyIcon(k.icon)}
                <div>
                  <span className="pde-key-label">{k.label}</span>
                  <span className="pde-key-value">{k.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* 03 — STORY */}
      {product.story ? (
        <section className="pde-story">
          <div className="pde-story-inner">
            <div className="pde-story-text">
              <div className="pde-eyebrow-row">
                <span className="eyebrow">The Story</span>
                <span className="pde-num" aria-hidden="true">03</span>
              </div>
              <h2>{firstSentence(product.story)}</h2>
              <p>{product.story}</p>
            </div>
            {storyImage ? (
              <div className="pde-story-img">
                <img loading="lazy" src={storyImage} alt={`${product.name} in the workshop`} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 04 — DETAIL IMAGES */}
      {detailImages.length > 0 ? (
        <section className="pde-details" aria-label="Detail images">
          <div className="pde-strip-num"><span className="pde-num" aria-hidden="true">04</span></div>
          <div className="pde-details-grid">
            {detailImages.map((src, i) => (
              <div key={i} className="pde-detail" onClick={() => openOverlay(images.indexOf(src))} role="button" tabIndex={0} aria-label={`View detail image ${i + 1} fullscreen`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOverlay(images.indexOf(src)); } }}>
                <img loading="lazy" src={src} alt={`${product.name} detail ${i + 1}`} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* 05 — SPECIFICATIONS */}
      {specs.length > 0 ? (
        <section className="pde-specs">
          <div className="pde-specs-inner">
            <div className="pde-eyebrow-row">
              <span className="eyebrow">Specifications</span>
              <span className="pde-num" aria-hidden="true">05</span>
            </div>
            <div style={{ marginTop: 'var(--space-md)' }}>
              {specs.map((s, i) => (
                <div key={i} className="pd-info-row">
                  <span className="pd-info-label">{s.label}</span>
                  <span className="pd-info-value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 06 — LIFESTYLE */}
      {lifestyleImage ? (
        <section className="pde-life">
          <img loading="lazy" src={lifestyleImage} alt={`${product.name} in the home`} />
          <div className="pde-life-content">
            <div className="pde-life-text">
              <span className="eyebrow">{product.subcategoryName || product.categoryName}</span>
              <h2>{firstSentence(product.description)}</h2>
              <p>{product.description}</p>
            </div>
            <div className="pde-life-side">
              <span className="pde-num" aria-hidden="true">06</span>
              {processHref ? (
                <Link href={processHref} className="pde-life-cta">Watch the Process</Link>
              ) : (
                <Link href="/studio" className="pde-life-cta">Visit the Studio</Link>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* MOBILE ACCORDIONS */}
      <div className="pde-acc">
        <section className="pd-accordions">
          <div className="pd-accordions-inner">
            {accDetails.length > 0 ? renderAccordion('Details', detailsOpen, setDetailsOpen, <>{accDetails.map((t, i) => <p key={i}>{t}</p>)}</>) : null}
            {accMaterials.length > 0 ? renderAccordion('Materials & Finish', materialsOpen, setMaterialsOpen, <>{accMaterials.map((t, i) => <p key={i}>{t}</p>)}</>) : null}
            {accDimensions.length > 0 ? renderAccordion('Dimensions', dimensionsOpen, setDimensionsOpen, <>{accDimensions.map((t, i) => <p key={i}>{t}</p>)}</>) : null}
            {product.careInstructions ? renderAccordion('Care', careOpen, setCareOpen, <p>{product.careInstructions}</p>) : null}
            {(product.shipping || product.returns) ? renderAccordion('Shipping & Returns', shippingOpen, setShippingOpen, <>{product.shipping ? <p>{product.shipping}</p> : null}{product.returns ? <p>{product.returns}</p> : null}</>) : null}
          </div>
        </section>
      </div>

      {/* 07 — RELATED */}
      {relatedProducts.length > 0 ? (
        <section className="pde-related">
          <div className="pde-related-inner">
            <div className="pde-related-head">
              <div>
                <div className="pde-eyebrow-row">
                  <span className="eyebrow">Curated</span>
                  <span className="pde-num" aria-hidden="true">07</span>
                </div>
                <h2>You may also like</h2>
              </div>
              <Link href="/gallery" className="pde-related-more" aria-label="View the full collection">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            </div>
            <div className="pde-rel-grid">
              {relatedProducts.map((rp) => renderRelatedCard(rp))}
            </div>
          </div>
        </section>
      ) : null}

      {/* RECENTLY VIEWED (preserved) */}
      {showRecentlyViewed && recentlyViewed.length > 0 ? (
        <section className="pde-related">
          <div className="pde-related-inner">
            <div className="pde-related-head">
              <div>
                <div className="pde-eyebrow-row">
                  <span className="eyebrow">Browsing History</span>
                </div>
                <h2>Recently Viewed</h2>
              </div>
            </div>
            <div className="pde-rel-grid">
              {recentlyViewed.map((rp) => renderRelatedCard(rp))}
            </div>
          </div>
        </section>
      ) : null}

      {renderOverlay()}
      {renderMobileCta()}
    </div>
  );
}

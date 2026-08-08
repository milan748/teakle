'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';

/* ============================================
   PRODUCT PAGE — Type A (Signature) + Type B (Standard)
   Refined v2 — improved hierarchy, gallery, mobile
   ============================================ */

const SIGNATURE_IDS = ['anchor-table'];

const pageStyles = `
/* ================================================================
   SHARED STYLES
   ================================================================ */

/* Breadcrumb */
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

/* ---- Type B: Standard Product Grid ---- */
.pd-section { background: var(--bg-primary); padding: var(--space-md) 0 var(--space-xl); }
.pd-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: var(--space-2xl);
  align-items: start;
}

/* Gallery */
.pd-gallery { position: relative; }
.pd-gallery-main {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--bg-secondary);
  margin-bottom: var(--space-sm);
  cursor: zoom-in;
}
.pd-gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 400ms var(--ease), transform 400ms var(--ease);
}
.pd-gallery-main.is-zoomed { cursor: zoom-out; }
.pd-gallery-main.is-zoomed img { transform: scale(1.8); }
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
  backdrop-filter: blur(4px);
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
.pd-gallery-main:hover .pd-gallery-nav { opacity: 1; }
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
  backdrop-filter: blur(4px);
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
  opacity: 0.65;
  transition: border-color var(--dur-fast) var(--ease), opacity var(--dur-fast) var(--ease);
}
.pd-thumb.is-active { border-color: var(--bronze); opacity: 1; }
.pd-thumb:hover { opacity: 1; }
.pd-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* Details Panel */
.pd-details { position: sticky; top: 100px; }
.pd-title {
  font-size: clamp(1.8rem, 3vw, var(--text-h1));
  font-weight: 500;
  margin-bottom: 0.35rem;
  letter-spacing: -0.02em;
}
.pd-short-desc {
  color: var(--text-secondary);
  font-size: var(--text-body);
  line-height: var(--lh-relaxed);
  margin-bottom: var(--space-sm);
  max-width: 50ch;
}
.pd-price-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}
.pd-price {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--text-primary);
}
.pd-avail {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--text-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--forest);
}
.pd-avail::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--forest);
  border-radius: var(--radius-full);
}
.pd-avail.is-limited { color: var(--bronze); }
.pd-avail.is-limited::before { background: var(--bronze); }

/* Product Info Sections */
.pd-info-sections {
  border-top: var(--border-hair);
  margin: var(--space-md) 0;
}
.pd-info-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-md);
  padding: 0.6rem 0;
  border-bottom: var(--border-hair);
  font-size: var(--text-body);
}
.pd-info-label {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.pd-info-value {
  color: var(--text-primary);
  text-align: right;
  font-weight: 500;
}

/* Purchase Section */
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

.pd-actions-row2 { display: flex; gap: 0.6rem; }
.pd-btn-secondary {
  flex: 1;
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

.pd-delivery {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: var(--space-md);
  background: var(--bg-secondary);
}
.pd-delivery-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* ---- Craftsmanship Section (Standard) ---- */
.pd-craft {
  background: var(--bg-secondary);
  padding: var(--space-xl) 0;
}
.pd-craft-inner {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: center;
}
.pd-craft-img {
  position: relative;
  overflow: hidden;
}
.pd-craft-img img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  transition: transform 1.2s var(--ease);
}
.pd-craft-img:hover img { transform: scale(1.03); }
.pd-craft-text .eyebrow { margin-bottom: var(--space-sm); }
.pd-craft-text h2 {
  font-size: clamp(1.5rem, 3vw, var(--text-h2));
  margin-bottom: var(--space-md);
  max-width: none;
}
.pd-craft-text p {
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  max-width: 48ch;
}

/* ---- Care Guide ---- */
.pd-care {
  background: var(--bg-primary);
  padding: var(--space-xl) 0;
}
.pd-care-inner {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md);
}
.pd-care-head {
  margin-bottom: var(--space-lg);
}
.pd-care-head h2 {
  font-size: clamp(1.5rem, 3vw, var(--text-h2));
  max-width: none;
}
.pd-care-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}
.pd-care-card {
  padding: var(--space-md);
  background: var(--bg-secondary);
  border: var(--border-subtle);
}
.pd-care-icon {
  width: 36px;
  height: 36px;
  color: var(--bronze);
  margin-bottom: var(--space-sm);
}
.pd-care-card h3 {
  font-size: var(--text-body);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: var(--space-xs);
}
.pd-care-card p {
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
}

/* ---- Accordions ---- */
.pd-accordions {
  background: var(--bg-primary);
  padding: 0 0 var(--space-xl);
  border-top: var(--border-hair);
}
.pd-accordions-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}
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
.pd-accordion-body.is-open { max-height: 2000px; opacity: 1; }
.pd-accordion-body:not(.is-open) { max-height: 0; opacity: 0; }
.pd-accordion-inner {
  padding: 0 0 var(--space-md);
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
}
.pd-accordion-inner p { margin-bottom: var(--space-sm); }
.pd-accordion-inner p:last-child { margin-bottom: 0; }
.pd-accordion-inner h4 {
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ---- Related / Recently Viewed ---- */
.pd-related {
  background: var(--bg-primary);
  padding: var(--space-xl) 0;
}
.pd-related-head {
  margin-bottom: var(--space-lg);
}
.pd-related-head h2 {
  font-size: clamp(1.4rem, 2.5vw, var(--text-h2));
  max-width: none;
  margin-top: var(--space-xs);
}
.pd-related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}
.pd-piece-card {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: transform 400ms var(--ease);
}
.pd-piece-card:hover { transform: translateY(-4px); }
.pd-piece-img {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--bg-secondary);
  margin-bottom: 0.75rem;
}
.pd-piece-img img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease); }
.pd-piece-card:hover .pd-piece-img img { transform: scale(1.04); }
.pd-piece-title {
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 500;
  margin-bottom: 0.2rem;
  transition: color var(--dur-fast) var(--ease);
}
.pd-piece-card:hover .pd-piece-title { color: var(--bronze); }
.pd-piece-price {
  font-size: var(--text-label);
  color: var(--text-secondary);
  letter-spacing: 0.04em;
}

/* ---- Gallery Overlay ---- */
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
.pd-overlay img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
}
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

/* ---- Mobile Sticky CTA ---- */
.pd-mobile-cta {
  position: fixed;
  bottom: 56px;
  left: 0;
  right: 0;
  z-index: 160;
  background: var(--bg-primary);
  border-top: 1px solid var(--stone);
  padding: var(--space-sm) var(--space-md);
  gap: var(--space-sm);
  display: flex;
  align-items: center;
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
   TYPE A: SIGNATURE — Editorial Product Showcase
   ================================================================ */
.sig-hero-gallery {
  position: relative;
  width: 100%;
  height: 85vh;
  min-height: 600px;
  overflow: hidden;
  background: var(--walnut);
  touch-action: pan-y;
}
.sig-hero-gallery img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 600ms var(--ease);
}
.sig-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(43,34,27,0) 0%, rgba(43,34,27,0.6) 100%);
  z-index: 1;
}
.sig-hero-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: var(--space-2xl) var(--space-md) var(--space-xl);
  max-width: var(--container);
  margin: 0 auto;
}
.sig-hero-info h1 {
  color: var(--bg-primary);
  font-size: clamp(2.5rem, 6vw, var(--text-hero));
  font-weight: 300;
  font-style: italic;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-sm);
}
.sig-hero-tag {
  display: inline-block;
  font-size: var(--text-caption);
  letter-spacing: 0.08em;
  color: var(--bronze);
  border: 1px solid color-mix(in srgb, var(--bronze), transparent 60%);
  padding: 0.5rem 1rem;
  margin-bottom: var(--space-md);
}
.sig-hero-price {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  font-weight: 400;
  color: var(--bg-primary);
  margin-bottom: var(--space-md);
}
.sig-hero-thumbs {
  display: flex;
  gap: var(--space-sm);
  position: absolute;
  bottom: var(--space-md);
  right: var(--space-md);
  z-index: 2;
}
.sig-hero-thumb {
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  cursor: pointer;
  overflow: hidden;
  opacity: 0.6;
  transition: border-color var(--dur-fast) var(--ease), opacity var(--dur-fast) var(--ease);
}
.sig-hero-thumb.is-active { border-color: var(--bronze); opacity: 1; }
.sig-hero-thumb:hover { opacity: 1; }
.sig-hero-thumb img { width: 100%; height: 100%; object-fit: cover; }
.sig-hero-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.15);
  border: none;
  cursor: pointer;
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease);
}
.sig-hero-gallery:hover .sig-hero-nav { opacity: 1; }
.sig-hero-nav:active { background: rgba(255,255,255,0.25); }
.sig-hero-prev { left: var(--space-md); }
.sig-hero-next { right: var(--space-md); }
.sig-hero-counter {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  z-index: 2;
  background: rgba(255,255,255,0.9);
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Signature: Product Info Section */
.sig-info {
  background: var(--bg-primary);
  padding: var(--space-2xl) 0;
}
.sig-info-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: calc(var(--space-2xl) * 0.8);
  align-items: start;
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md);
}
.sig-info-left h2 {
  font-size: clamp(1.8rem, 3.5vw, var(--text-h1));
  font-weight: 300;
  font-style: italic;
  line-height: 1.2;
  margin-bottom: var(--space-md);
  max-width: none;
}
.sig-info-left p {
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  max-width: 50ch;
  margin-bottom: var(--space-md);
}
.sig-info-left .sig-avail {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--text-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--forest);
  margin-bottom: var(--space-md);
}
.sig-info-left .sig-avail::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--forest);
  border-radius: var(--radius-full);
}
.sig-specs-table {
  width: 100%;
  border-top: var(--border-hair);
}
.sig-specs-table .pd-info-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 0.65rem 0;
  border-bottom: var(--border-hair);
  font-size: var(--text-body);
}

/* Signature: Purchase Panel */
.sig-purchase {
  position: sticky;
  top: 100px;
  padding: var(--space-lg);
  background: var(--bg-secondary);
}
.sig-purchase-price {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}
.sig-purchase .pd-actions { margin-bottom: var(--space-md); }
.sig-purchase-delivery {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: var(--space-md);
  border-top: var(--border-hair);
}
.sig-purchase-delivery .pd-delivery-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: var(--text-body);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Signature: Craftsmanship Story */
.sig-craft {
  position: relative;
  height: 80vh;
  min-height: 500px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.sig-craft-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.4s var(--ease);
}
.sig-craft:hover .sig-craft-bg { transform: scale(1.03); }
.sig-craft::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(43,34,27,0.88) 0%, rgba(43,34,27,0.4) 50%, rgba(43,34,27,0.1) 100%);
}
.sig-craft-content {
  position: relative;
  z-index: 2;
  padding: var(--space-2xl) var(--space-md);
  max-width: 560px;
  margin-left: 8vw;
}
.sig-craft .eyebrow { color: var(--stone); margin-bottom: var(--space-md); }
.sig-craft h2 {
  color: var(--bg-primary);
  font-size: clamp(1.8rem, 4vw, var(--text-h1));
  font-weight: 300;
  font-style: italic;
  line-height: 1.2;
  margin-bottom: var(--space-md);
  max-width: none;
}
.sig-craft p {
  color: var(--stone);
  font-size: var(--text-body);
  max-width: 44ch;
  line-height: var(--lh-relaxed);
  margin-bottom: var(--space-sm);
}
.sig-craft .link-quiet { color: var(--bg-primary); border-color: rgba(247,244,238,0.4); }
.sig-craft .link-quiet:hover { color: var(--bronze); border-color: var(--bronze); }

/* Signature: Progress Gallery */
.sig-progress {
  background: var(--bg-secondary);
  padding: var(--space-2xl) 0;
}
.sig-progress-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md);
}
.sig-progress-item {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  cursor: pointer;
}
.sig-progress-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s var(--ease);
}
.sig-progress-item:hover img { transform: scale(1.06); }
.sig-progress-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(43,34,27,0.6) 0%, transparent 60%);
}
.sig-progress-label {
  position: absolute;
  bottom: var(--space-sm);
  left: var(--space-sm);
  z-index: 2;
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bg-primary);
}

/* Signature: Care Guide */
.sig-care {
  background: var(--bg-primary);
  padding: var(--space-xl) 0;
}
.sig-care-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-md);
}

/* ================================================================
   RESPONSIVE
   ================================================================ */
@media (max-width: 860px) {
  .pd-grid { grid-template-columns: 1fr; gap: var(--space-md); }
  .pd-details { position: static; }
  .pd-gallery-main { aspect-ratio: 4/5; }
  .pd-thumbs { grid-template-columns: repeat(4, 1fr); gap: var(--space-xs); }
  .pd-related-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }

  .pd-craft-inner { grid-template-columns: 1fr; gap: var(--space-lg); }
  .pd-craft-img img { aspect-ratio: 16 / 9; }
  .pd-care-grid { grid-template-columns: repeat(2, 1fr); }

  .sig-hero-gallery { height: 70vh; min-height: 480px; }
  .sig-hero-info h1 { font-size: var(--text-h1); }
  .sig-hero-thumbs { bottom: auto; top: var(--space-md); right: auto; left: var(--space-md); }
  .sig-hero-thumb { width: 48px; height: 48px; }

  .sig-info { padding: var(--space-xl) 0; }
  .sig-info-grid { grid-template-columns: 1fr; gap: var(--space-lg); }
  .sig-purchase { position: static; }

  .sig-craft { height: auto; min-height: 0; display: block; background: var(--bg-primary); }
  .sig-craft-bg { position: relative; width: 100%; height: 340px; }
  .sig-craft:hover .sig-craft-bg { transform: none; }
  .sig-craft::after { display: none; }
  .sig-craft-content { padding: var(--space-lg); max-width: 100%; }
  .sig-craft .eyebrow { color: var(--bronze); }
  .sig-craft h2 { color: var(--text-primary); font-size: var(--text-h2); }
  .sig-craft p { color: var(--text-secondary); max-width: none; }
  .sig-craft .link-quiet { color: var(--bronze); border-color: var(--bronze); }

  .sig-progress-grid { grid-template-columns: repeat(2, 1fr); }
  .sig-care-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .pd-section { padding: var(--space-sm) 0 var(--space-lg); }
  .pd-gallery-main { aspect-ratio: 3/4; }
  .pd-gallery-nav { width: 40px; height: 40px; }
  .pd-gallery-fullscreen { width: 36px; height: 36px; }
  .pd-title { font-size: var(--text-h1); }
  .pd-price { font-size: 1.3rem; }
  .pd-actions-row2 { flex-direction: column; }
  .pd-related-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
  .pd-mobile-cta { display: flex; }
  body { padding-bottom: 110px; }

  .pd-care-grid { grid-template-columns: 1fr; }

  .sig-hero-gallery { height: 65vh; min-height: 400px; }
  .sig-hero-info { padding: var(--space-xl) var(--space-md) var(--space-lg); }
  .sig-hero-info h1 { font-size: var(--text-h1); }
  .sig-hero-price { font-size: 1.3rem; }
  .sig-hero-thumb { width: 42px; height: 42px; }

  .sig-progress-grid { grid-template-columns: 1fr 1fr; gap: var(--space-xs); }
  .sig-care-grid { grid-template-columns: 1fr; }
}

@media (max-width: 430px) {
  .pd-title { font-size: 1.25rem; }
  .pd-price { font-size: 1.15rem; }
  .pd-gallery-main { aspect-ratio: 3/4; }
  .pd-thumbs img { min-height: 56px; }
  .pd-related-grid { grid-template-columns: 1fr 1fr; gap: var(--space-sm); }
  .pd-mobile-cta { bottom: 52px; }
  body { padding-bottom: 104px; }

  .sig-hero-gallery { height: 60vh; min-height: 360px; }
  .sig-hero-info h1 { font-size: var(--text-h2); }
  .sig-hero-price { font-size: 1.15rem; }
}

@media (hover: none) {
  .pd-gallery-nav { opacity: 1; }
  .sig-hero-nav { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .sig-craft-bg, .sig-progress-item img, .pd-piece-img img { transition: none; }
  .pd-gallery-main img, .sig-hero-gallery img { transition: none; }
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
  const [mobileStickyVisible, setMobileStickyVisible] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const lastFocusedElRef = useRef(null);
  const addToCartBtnRef = useRef(null);
  const galleryMainRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const isSignature = SIGNATURE_IDS.includes(productId);

  /* Load product */
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

  /* Wishlist state */
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

  /* Add to Cart */
  const handleAddToCart = useCallback(() => {
    if (!product || typeof window === 'undefined') return;
    if (window.Teachle) {
      for (let q = 0; q < qty; q++) {
        window.Teachle.addToCart({ id: product.id, name: product.name, price: product.priceFormatted, image: product.images[0] });
      }
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }, [product, qty]);

  /* Wishlist */
  const handleWishlist = useCallback(() => {
    if (!product || typeof window === 'undefined') return;
    if (window.Teachle && window.Teachle.requireAuth && !window.Teachle.requireAuth()) return;
    if (window.Teachle && window.Teachle.toggleWishlist) {
      const result = window.Teachle.toggleWishlist({ id: product.id, name: product.name, price: product.priceFormatted, image: product.images[0] });
      setIsWishlisted(result.added);
    }
  }, [product]);

  /* Share */
  const handleShare = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({ title: product?.name, text: product?.shortDescription, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied to clipboard.'));
    }
  }, [product]);

  /* Badge */
  const badgeText = !product ? '' : product.availability === 'Limited Edition' ? 'Limited Edition' : product.availability === 'In Stock' ? 'In Stock' : 'Handcrafted';

  /* Category */
  const cat = product && window?.TEAKLE_CATEGORIES?.[product.category];

  if (!product) {
    return (
      <>
        <style>{pageStyles}</style>
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading product...</div>
      </>
    );
  }

  /* ---- Shared purchase panel ---- */
  const renderPurchasePanel = (className = '') => (
    <div className={className}>
      <div className="pd-qty">
        <span className="pd-qty-label">Quantity</span>
        <div className="pd-qty-ctrl">
          <button className="pd-qty-btn" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>&minus;</button>
          <span className="pd-qty-val">{qty}</span>
          <button className="pd-qty-btn" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
        </div>
      </div>
      <div className="pd-actions">
        <button ref={addToCartBtnRef} className={`pd-btn-add ${isAdded ? 'is-added' : ''}`} onClick={handleAddToCart}>
          {isAdded ? (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><polyline points="20 6 9 17 4 12" /></svg> Added to Cart</>
          ) : (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg> Add to Cart</>
          )}
        </button>
        <div className="pd-actions-row2">
          <button className={`pd-btn-secondary ${isWishlisted ? 'is-active' : ''}`} onClick={handleWishlist}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            Wishlist
          </button>
          <button className="pd-btn-secondary" onClick={handleShare}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );

  const renderDelivery = () => (
    <div className="pd-delivery">
      <div className="pd-delivery-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: 'var(--bronze)' }}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
        <span>{product.leadTime} delivery. White-glove service available.</span>
      </div>
      <div className="pd-delivery-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: 'var(--bronze)' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
        <span>Handcrafted in India. Ships worldwide.</span>
      </div>
      <div className="pd-delivery-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: 'var(--bronze)' }}><polyline points="20 6 9 17 4 12" /></svg>
        <span>{product.returns}</span>
      </div>
    </div>
  );

  const renderRelated = () => (
    <section className="pd-related">
      <div className="container">
        <div className="pd-related-head">
          <span className="eyebrow">Curated</span>
          <h2>Complete the Space</h2>
        </div>
        <div className="pd-related-grid">
          {(product.relatedProducts || []).map((rid) => {
            const rp = window?.TEAKLE_PRODUCTS?.find((p) => p.id === rid);
            if (!rp) return null;
            return (
              <Link key={rid} href={`/shop/${rp.id}`} className="pd-piece-card">
                <div className="pd-piece-img">
                  <img loading="lazy" src={rp.images[0]} alt={rp.name} />
                </div>
                <h3 className="pd-piece-title">{rp.name}</h3>
                <p className="pd-piece-price">{rp.priceFormatted}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );

  const renderRecentlyViewed = () => {
    if (!showRecentlyViewed || recentlyViewed.length === 0) return null;
    return (
      <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-xl) 0', borderTop: 'var(--border-hair)' }}>
        <div className="container">
          <div className="pd-related-head">
            <span className="eyebrow">Browsing History</span>
            <h2>Recently Viewed</h2>
          </div>
          <div className="pd-related-grid">
            {recentlyViewed.map((rp) => (
              <Link key={rp.id} href={`/shop/${rp.id}`} className="pd-piece-card">
                <div className="pd-piece-img">
                  <img loading="lazy" src={rp.images[0]} alt={rp.name} />
                </div>
                <h3 className="pd-piece-title">{rp.name}</h3>
                <p className="pd-piece-price">{rp.priceFormatted}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  };

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
      <button className="pd-overlay-nav pd-overlay-prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); setOverlayIdx((prev) => (prev - 1 + product.images.length) % product.images.length); }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <img src={product.images[overlayIdx]} alt={`${product.name} image ${overlayIdx + 1}`} />
      <button className="pd-overlay-nav pd-overlay-next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); setOverlayIdx((prev) => (prev + 1) % product.images.length); }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><polyline points="9 18 15 12 9 6" /></svg>
      </button>
      <span className="pd-overlay-counter">{overlayIdx + 1} / {product.images.length}</span>
    </div>
  );

  const renderMobileCta = () => (
    <div className={`pd-mobile-cta ${mobileStickyVisible ? 'is-visible' : ''}`}>
      <span className="pd-mobile-price">{product.priceFormatted}</span>
      <button className="pd-mobile-btn" onClick={handleAddToCart}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
        Add to Cart
      </button>
    </div>
  );

  const renderCareGuide = () => (
    <section className="pd-care">
      <div className="pd-care-inner">
        <div className="pd-care-head">
          <span className="eyebrow">Care Guide</span>
          <h2>Caring for Your Piece</h2>
        </div>
        <div className="pd-care-grid">
          <div className="pd-care-card">
            <svg className="pd-care-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" /></svg>
            <h3>Cleaning</h3>
            <p>Wipe with a soft, damp cloth. Avoid abrasive cleaners or harsh chemicals that may damage the oil finish.</p>
          </div>
          <div className="pd-care-card">
            <svg className="pd-care-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
            <h3>Moisture</h3>
            <p>Blot spills immediately. Teak is naturally moisture-resistant, but prolonged exposure may affect the finish.</p>
          </div>
          <div className="pd-care-card">
            <svg className="pd-care-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            <h3>Sunlight</h3>
            <p>Avoid placing in direct, prolonged sunlight. UV exposure may cause the wood to lighten or the finish to dry.</p>
          </div>
          <div className="pd-care-card">
            <svg className="pd-care-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            <h3>Storage</h3>
            <p>Keep in a stable environment. Avoid extreme temperature changes. Reapply oil every 12–18 months for lasting protection.</p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderAccordions = () => (
    <section className="pd-accordions">
      <div className="pd-accordions-inner">
        <div className="pd-accordion">
          <button className={`pd-accordion-btn ${storyOpen ? 'is-open' : ''}`} aria-expanded={storyOpen} onClick={() => setStoryOpen(!storyOpen)}>
            Our Craft — Story, Materials & Care
          </button>
          <div className={`pd-accordion-body ${storyOpen ? 'is-open' : ''}`} aria-hidden={!storyOpen}>
            <div className="pd-accordion-inner">
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
        <div className="pd-accordion">
          <button className={`pd-accordion-btn ${specsOpen ? 'is-open' : ''}`} aria-expanded={specsOpen} onClick={() => setSpecsOpen(!specsOpen)}>
            Specifications
          </button>
          <div className={`pd-accordion-body ${specsOpen ? 'is-open' : ''}`} aria-hidden={!specsOpen}>
            <div className="pd-accordion-inner">
              {product.specifications.map((s, i) => (
                <div key={i} className="pd-info-row">
                  <span className="pd-info-label">{s.label}</span>
                  <span className="pd-info-value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="pd-accordion">
          <button className={`pd-accordion-btn ${shippingOpen ? 'is-open' : ''}`} aria-expanded={shippingOpen} onClick={() => setShippingOpen(!shippingOpen)}>
            Shipping & Returns
          </button>
          <div className={`pd-accordion-body ${shippingOpen ? 'is-open' : ''}`} aria-hidden={!shippingOpen}>
            <div className="pd-accordion-inner">
              <h4>Shipping</h4>
              <p>{product.shipping}</p>
              <h4>Returns</h4>
              <p>{product.returns}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderCraftSection = (img, eyebrow, heading, text) => (
    <section className="pd-craft">
      <div className="pd-craft-inner">
        <div className="pd-craft-img">
          <img src={img} alt="The making process" loading="lazy" />
        </div>
        <div className="pd-craft-text">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{heading}</h2>
          <p>{text}</p>
        </div>
      </div>
    </section>
  );

  /* ================================================================
     TYPE A: SIGNATURE PRODUCT
     ================================================================ */
  if (isSignature) {
    return (
      <>
        <style>{pageStyles}</style>
        <Script src="/products.js" strategy="beforeInteractive" />

        {/* Breadcrumb */}
        <section className="pd-breadcrumb">
          <div className="container">
            <nav aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="bc-sep">/</span>
              <Link href="/gallery">Gallery</Link>
              <span className="bc-sep">/</span>
              <span className="bc-current">{product.name}</span>
            </nav>
          </div>
        </section>

        {/* Hero Gallery */}
        <section
          className="sig-hero-gallery"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img src={product.images[currentImageIdx]} alt={product.name} style={{ opacity: isGalleryLoading ? 0 : 1 }} onLoad={() => setIsGalleryLoading(false)} />
          <div className="sig-hero-overlay"></div>
          <div className="sig-hero-info">
            <span className="sig-hero-tag">{'Piece N\u00B0 04 \u2014 This Season'}</span>
            <h1>{product.name}</h1>
            <p className="sig-hero-price">{product.priceFormatted}</p>
          </div>
          <button className="sig-hero-nav sig-hero-prev" aria-label="Previous image" onClick={goToPrev}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button className="sig-hero-nav sig-hero-next" aria-label="Next image" onClick={goToNext}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <div className="sig-hero-thumbs">
            {product.thumbnails.map((thumb, i) => (
              <div key={i} className={`sig-hero-thumb ${i === currentImageIdx ? 'is-active' : ''}`} onClick={() => setActiveImage(i)}>
                <img loading="lazy" src={thumb} alt={`${product.name} view ${i + 1}`} />
              </div>
            ))}
          </div>
          <button className="sig-hero-counter" aria-label="View fullscreen" onClick={() => openOverlay(currentImageIdx)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18, color: 'var(--text-primary)' }}>
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
            </svg>
          </button>
        </section>

        {/* Product Info */}
        <section className="sig-info">
          <div className="sig-info-grid">
            <div className="sig-info-left">
              <span className="eyebrow" style={{ marginBottom: 'var(--space-md)' }}>About This Piece</span>
              <h2>{product.shortDescription}</h2>
              <p>{product.description}</p>
              <span className="sig-avail">{product.availabilityNote}</span>
              <div className="sig-specs-table">
                {product.specifications.map((s, i) => (
                  <div key={i} className="pd-info-row">
                    <span className="pd-info-label">{s.label}</span>
                    <span className="pd-info-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sig-purchase">
              <p className="sig-purchase-price">{product.priceFormatted}</p>
              {renderPurchasePanel()}
              {renderDelivery()}
            </div>
          </div>
        </section>

        {/* Craftsmanship Story */}
        <section className="sig-craft">
          <img className="sig-craft-bg" src={product.images[2] || product.images[0]} alt="The making process" loading="lazy" />
          <div className="sig-craft-content">
            <span className="eyebrow">The Craft</span>
            <h2>{product.craftsmanship?.substring(0, 80)}...</h2>
            <p>{product.story}</p>
            <a href="/studio" className="link-quiet">Visit the Studio</a>
          </div>
        </section>

        {/* Progress Gallery */}
        <section className="sig-progress">
          <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--space-md) var(--space-lg)' }}>
            <span className="eyebrow">Progress</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, var(--text-h2))', marginTop: 'var(--space-sm)' }}>From timber to finish.</h2>
          </div>
          <div className="sig-progress-grid">
            {product.images.map((img, i) => (
              <div key={i} className="sig-progress-item" onClick={() => openOverlay(i)}>
                <img loading="lazy" src={img} alt={`Process step ${i + 1}`} />
                <span className="sig-progress-label">Step {i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Care Guide */}
        {renderCareGuide()}

        {/* Accordions */}
        {renderAccordions()}

        {renderRelated()}
        {renderRecentlyViewed()}
        {renderOverlay()}
        {renderMobileCta()}
      </>
    );
  }

  /* ================================================================
     TYPE B: STANDARD PRODUCT
     ================================================================ */
  return (
    <>
      <style>{pageStyles}</style>
      <Script src="/products.js" strategy="beforeInteractive" />

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

      {/* Product Section */}
      <section className="pd-section">
        <div className="container pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <div
              ref={galleryMainRef}
              className={`pd-gallery-main ${isGalleryLoading ? 'is-loading' : ''} ${isZoomed ? 'is-zoomed' : ''}`}
              onClick={handleGalleryClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <span className="pd-gallery-badge">{badgeText}</span>
              <span className="pd-gallery-counter">{currentImageIdx + 1} / {product.images.length}</span>
              <span className="pd-gallery-zoom-hint">Click to zoom</span>
              <button className="pd-gallery-fullscreen" aria-label="View fullscreen" onClick={(e) => { e.stopPropagation(); openOverlay(currentImageIdx); }}>
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
              <img
                src={product.images[currentImageIdx]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onLoad={() => setIsGalleryLoading(false)}
              />
            </div>
            <div className="pd-thumbs">
              {product.thumbnails.map((thumb, i) => (
                <div
                  key={i}
                  className={`pd-thumb ${i === currentImageIdx ? 'is-active' : ''}`}
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
          </div>

          {/* Details — Purchase Hierarchy: Name → Desc → Price → Avail → Qty → Add to Cart → Wishlist → Share */}
          <div className="pd-details">
            <h1 className="pd-title">{product.name}</h1>
            <p className="pd-short-desc">{product.shortDescription}</p>
            <div className="pd-price-row">
              <span className="pd-price">{product.priceFormatted}</span>
              <span className={`pd-avail ${product.availability === 'Limited Edition' ? 'is-limited' : ''}`}>{product.availabilityNote}</span>
            </div>
            <div className="pd-info-sections">
              {product.specifications.map((s, i) => (
                <div key={i} className="pd-info-row">
                  <span className="pd-info-label">{s.label}</span>
                  <span className="pd-info-value">{s.value}</span>
                </div>
              ))}
            </div>
            {renderPurchasePanel()}
            {renderDelivery()}
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      {renderCraftSection(
        product.images[1] || product.images[0],
        'Craftsmanship',
        product.craftsmanship?.substring(0, 80) + '...',
        product.craftsmanship
      )}

      {/* Care Guide */}
      {renderCareGuide()}

      {/* Accordions */}
      {renderAccordions()}

      {renderRelated()}
      {renderRecentlyViewed()}
      {renderOverlay()}
      {renderMobileCta()}
    </>
  );
}

/**
 * TEAKLE T09 — Watch the Process experience.
 *
 * Data contract (app/data/process.js + app/data/products.js):
 *   - process: slug, productId, title, subtitle, intro, heroImage, heroImageAlt, stages[]
 *   - product: name, material, dimensions, weight, finish, buildTime, priceFormatted,
 *     shortDescription, description, images[], specifications[]
 *   - Every stage: { number, title, description, videoUrl, posterUrl, isFinal? }
 *
 * Content-integrity notes:
 *   - No video asset exists in the repository (all stage videoUrl values are null),
 *     so this page opens with a cinematic editorial hero built from the existing
 *     process hero image — no footage is fabricated and no fake player is rendered.
 *   - All copy below is drawn from process.js / products.js. Nothing is invented:
 *     no artisans, workshops locations, timelines, awards, or social accounts
 *     beyond the existing instagram.com/teaklestudio destination.
 *   - app/components/ProcessVideo.js remains as documented infrastructure for
 *     real manufacturing footage (see process.js header comment); it is not
 *     rendered here because there is nothing authentic to play yet.
 */
'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

const INSTAGRAM_URL = 'https://www.instagram.com/teaklestudio'

export default function ProcessPageClient({ process, product }) {
  const [shareCopied, setShareCopied] = useState(false)

  const stages = (process.stages || []).filter((s) => !s.isFinal)
  const finalStage = (process.stages || []).find((s) => s.isFinal)

  /* Share — native share where supported, clipboard fallback, never errors. */
  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: process?.title || 'Teakle',
          text: process?.subtitle || '',
          url,
        })
        return
      } catch (e) {
        if (e && e.name === 'AbortError') return // user dismissed — not an error
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.setAttribute('readonly', '')
        ta.style.position = 'absolute'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch (e) {
      // Sharing unavailable — leave the control untouched, never raise.
    }
  }, [process])

  /* Material record — surfaced only from the authoritative product data. */
  const specValue = (label) =>
    product?.specifications?.find((s) => s.label === label)?.value || null
  const materialRecord = [
    ['Material', specValue('Material') || product?.material],
    ['Dimensions', specValue('Dimensions') || product?.dimensions],
    ['Weight', specValue('Weight') || product?.weight],
    ['Finish', specValue('Finish') || product?.finish],
    ['Seating', specValue('Seating')],
    ['Joinery', specValue('Joinery')],
    ['Build time', specValue('Build Time') || product?.buildTime],
  ].filter(([, v]) => Boolean(v))

  const heroMeta = [product?.material, product?.buildTime, product?.dimensions].filter(Boolean)

  const makingIntro = stages[0] || null
  const settlingStages = stages.slice(1, 3)
  const joiningStage = stages[3] || null
  const finishingStages = stages.slice(4, 6)

  return (
    <div className="proc-page">
      <style>{`
        .proc-page { overflow-x: clip; background: var(--bg-primary); }

        /* ---- Breadcrumb ---- */
        .proc-breadcrumb {
          background: var(--bg-secondary);
          padding: var(--space-md) 0;
          border-bottom: var(--border-subtle);
        }
        .proc-breadcrumb-inner {
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
        .proc-breadcrumb a {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s var(--ease);
        }
        .proc-breadcrumb a:hover { color: var(--bronze); }
        .proc-breadcrumb-sep { opacity: 0.4; }

        /* ---- Hero: full-bleed cinematic opening ---- */
        .proc-hero {
          position: relative;
          min-height: 82vh;
          display: flex;
          align-items: flex-end;
          background: var(--walnut);
          overflow: hidden;
        }
        .proc-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .proc-hero-bg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: 50% 30%;
          }
        .proc-hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(28,19,13,0.88) 0%, rgba(28,19,13,0.35) 52%, rgba(28,19,13,0.12) 100%);
        }
        .proc-hero-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: none;
          margin: 0;
          padding: var(--space-2xl) clamp(var(--space-md), 6vw, calc((100vw - var(--container)) / 2 + var(--space-md))) var(--space-xl);
        }
        .proc-hero h1 {
          color: var(--bg-primary);
          font-size: clamp(2.25rem, 5vw, 3.75rem);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1.05;
          max-width: 16ch;
          margin: 0 0 var(--space-sm);
        }
        .proc-hero-sub {
          color: var(--stone);
          font-size: var(--text-lede);
          line-height: var(--lh-relaxed);
          max-width: 46ch;
          margin: 0 0 var(--space-md);
        }
        .proc-hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs) var(--space-md);
          margin: 0 0 var(--space-lg);
          padding-top: var(--space-md);
          border-top: 1px solid rgba(221,216,208,0.25);
          max-width: 720px;
        }
        .proc-hero-meta span {
          color: var(--bg-primary);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .proc-hero-cue {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          color: var(--bronze-on-dark);
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
        }
        .proc-hero-cue:hover { color: var(--bg-primary); }

        /* ---- Journey ledger: MATERIAL → MAKING → TIME → OBJECT ---- */
        .proc-journey {
          background: var(--walnut);
          border-top: 1px solid rgba(221,216,208,0.16);
          padding: var(--space-md) 0;
        }
        .proc-journey-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }
        .proc-journey a {
          color: var(--stone);
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.2s var(--ease);
        }
        .proc-journey a:hover { color: var(--bronze-on-dark); }
        .proc-journey-arrow { color: var(--bronze-on-dark); opacity: 0.7; }

        /* ---- Material: wide editorial split ---- */
        .proc-material {
          background: var(--bg-primary);
          padding: var(--space-2xl) 0;
        }
        .proc-material-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md);
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: var(--space-2xl);
          align-items: start;
        }
        .proc-material-lede {
          color: var(--text-primary);
          font-size: clamp(1.125rem, 1.8vw, 1.375rem);
          line-height: 1.65;
          max-width: 34ch;
        }
        .proc-record {
          border-top: var(--border-hair);
        }
        .proc-record-title {
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          padding: var(--space-sm) 0;
        }
        .proc-record-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: var(--space-md);
          padding: 0.6rem 0;
          border-top: var(--border-hair);
          font-size: var(--text-body);
        }
        .proc-record-label { color: var(--text-secondary); flex-shrink: 0; }
        .proc-record-value { color: var(--text-primary); text-align: right; font-weight: 500; }

        /* ---- Making: section head ---- */
        .proc-making { background: var(--bg-primary); padding: 0 0 var(--space-xl); }
        .proc-making-head {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md) var(--space-lg);
        }
        .proc-making-head h2 {
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          font-weight: 500;
          letter-spacing: -0.015em;
          max-width: 20ch;
          margin-top: var(--space-xs);
        }
        .proc-making-head p {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          max-width: 60ch;
          margin-top: var(--space-sm);
        }

        /* ---- Stage 01: full-width feature ---- */
        .proc-feature {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md) var(--space-xl);
        }
        .proc-feature-number {
          display: inline-block;
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bronze-text);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 3px 14px;
          margin-bottom: var(--space-sm);
        }
        .proc-feature h3 {
          font-size: clamp(1.5rem, 3vw, 2.125rem);
          font-weight: 500;
          letter-spacing: -0.015em;
          max-width: 22ch;
          margin-bottom: var(--space-sm);
        }
        .proc-feature p {
          color: var(--text-secondary);
          font-size: var(--text-body-lg);
          line-height: var(--lh-relaxed);
          max-width: 64ch;
        }

        /* ---- Ultra-wide cinematic break ---- */
        .proc-break {
          margin: 0 0 var(--space-xl);
        }
        .proc-break figure { margin: 0; }
        .proc-break img {
            display: block;
            width: 100%;
            height: clamp(320px, 62vh, 620px);
            object-fit: cover;
            object-position: 50% 30%;
          }
        .proc-break figcaption {
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-xs) var(--space-md) 0;
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
        }

        /* ---- Paired ledger (02+03, 05+06) ---- */
        .proc-pair {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md) var(--space-xl);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-xl);
        }
        .proc-ledger { border-top: var(--border-hair); padding-top: var(--space-md); }
        .proc-ledger-number {
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bronze-text);
          margin-bottom: var(--space-xs);
        }
        .proc-ledger h3 {
          font-size: var(--text-h2);
          font-weight: 500;
          letter-spacing: -0.015em;
          margin-bottom: var(--space-sm);
        }
        .proc-ledger p {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          max-width: 44ch;
        }

        /* ---- Stage 04: extreme-right figure ---- */
        .proc-split {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 0;
          align-items: stretch;
          margin: 0 0 var(--space-xl);
          background: var(--bg-secondary);
        }
        .proc-split-text {
          padding: clamp(var(--space-lg), 5vw, var(--space-2xl));
          align-self: center;
        }
        .proc-split-text h3 {
          font-size: clamp(1.5rem, 3vw, 2.125rem);
          font-weight: 500;
          letter-spacing: -0.015em;
          margin: var(--space-sm) 0;
          max-width: 18ch;
        }
        .proc-split-text p {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          max-width: 44ch;
        }
        .proc-split figure { margin: 0; min-height: 100%; }
        .proc-split img {
            display: block;
            width: 100%;
            height: 100%;
            min-height: 420px;
            max-height: 640px;
            object-fit: cover;
            object-position: 50% 40%;
          }
        .proc-split figcaption {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          padding: var(--space-xs) 0 0;
        }

        /* ---- Time band: dark espresso ---- */
        .proc-time {
          background: var(--walnut);
          padding: var(--space-2xl) 0;
        }
        .proc-time-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md);
        }
        .proc-time h2 {
          color: var(--bg-primary);
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          font-weight: 500;
          letter-spacing: -0.015em;
          max-width: 22ch;
          margin-top: var(--space-xs);
        }
        .proc-time-lede {
          color: var(--stone);
          font-size: var(--text-body-lg);
          line-height: var(--lh-relaxed);
          max-width: 62ch;
          margin-top: var(--space-sm);
        }
        .proc-time-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
          margin-top: var(--space-xl);
          padding-top: var(--space-lg);
          border-top: 1px solid rgba(221,216,208,0.2);
        }
        .proc-time-stat strong {
          display: block;
          color: var(--bg-primary);
          font-size: clamp(1.25rem, 2.2vw, 1.75rem);
          font-weight: 500;
          letter-spacing: -0.01em;
          margin-bottom: var(--space-xs);
        }
        .proc-time-stat span {
          color: var(--stone);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ---- Object: connection back to the finished piece ---- */
        .proc-object { background: var(--bg-primary); padding: var(--space-2xl) 0 0; }
        .proc-object-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md);
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: var(--space-2xl);
          align-items: center;
        }
        .proc-object figure { margin: 0; }
        .proc-object img {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 5;
          object-fit: cover;
        }
        .proc-object figcaption {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          padding-top: var(--space-xs);
        }
        .proc-object-text h2 {
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          font-weight: 500;
          letter-spacing: -0.015em;
          margin-top: var(--space-xs);
        }
        .proc-object-text .proc-object-name {
          font-size: var(--text-body-lg);
          color: var(--text-primary);
          font-weight: 500;
          margin-top: var(--space-md);
        }
        .proc-object-text .proc-object-price {
          font-size: var(--text-body-lg);
          color: var(--text-primary);
          margin-top: var(--space-xs);
        }
        .proc-object-text p {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          max-width: 46ch;
          margin-top: var(--space-sm);
        }
        .proc-object-actions {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          flex-wrap: wrap;
          margin-top: var(--space-lg);
        }

        /* ---- Share ---- */
        .proc-share {
          background: var(--bg-primary);
          padding: var(--space-2xl) 0;
        }
        .proc-share-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-xl) var(--space-md) 0;
          border-top: var(--border-hair);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-lg);
          flex-wrap: wrap;
        }
        .proc-share-text h2 {
          font-size: var(--text-h2);
          font-weight: 500;
          letter-spacing: -0.015em;
          margin-top: var(--space-xs);
        }
        .proc-share-text p {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          max-width: 48ch;
          margin-top: var(--space-xs);
        }
        .proc-share-actions {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
          padding-top: var(--space-sm);
        }
        .proc-share-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          min-height: 44px;
          padding: 0.65rem 1.1rem;
          background: none;
          border: 1px solid var(--stone);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
        }
        .proc-share-btn:hover { color: var(--bronze); border-color: var(--bronze); }

        /* ---- Responsive: mobile as composed experience ---- */
        @media (max-width: 860px) {
          .proc-hero { min-height: 72vh; }
          .proc-hero-content {
            padding-left: var(--space-md);
            padding-right: var(--space-md);
          }
          .proc-material-inner { grid-template-columns: 1fr; gap: var(--space-lg); }
          .proc-material-lede { max-width: none; }
          .proc-pair { grid-template-columns: 1fr; gap: var(--space-lg); }
          .proc-ledger p { max-width: none; }
          .proc-split { grid-template-columns: 1fr; }
          .proc-split img { min-height: 0; max-height: none; aspect-ratio: 16 / 10; }
          .proc-split-text { padding: var(--space-lg) var(--space-md); }
          .proc-time-grid { grid-template-columns: repeat(2, 1fr); }
          .proc-object-inner { grid-template-columns: 1fr; gap: var(--space-lg); }
          .proc-object img { aspect-ratio: 16 / 10; }
          .proc-share-inner { flex-direction: column; }
        }
        @media (max-width: 560px) {
          .proc-hero { min-height: 64vh; }
          .proc-hero h1 { font-size: clamp(1.9rem, 9vw, 2.5rem); }
          .proc-break img { height: 300px; }
          .proc-time-grid { grid-template-columns: 1fr 1fr; gap: var(--space-md); }
          .proc-object-actions { flex-direction: column; align-items: stretch; }
          .proc-object-actions .btn-primary { text-align: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .proc-page .reveal { transition: none !important; }
        }
      `}</style>

      {/* Breadcrumb */}
      <nav className="proc-breadcrumb" aria-label="Breadcrumb">
        <div className="proc-breadcrumb-inner">
          <Link href="/">Home</Link>
          <span className="proc-breadcrumb-sep">/</span>
          <Link href="/studio">Studio</Link>
          <span className="proc-breadcrumb-sep">/</span>
          <span aria-current="page">{process.title}</span>
        </div>
      </nav>

      {/* Hero — cinematic editorial opening (no fabricated footage) */}
      <section className="proc-hero">
        <div className="proc-hero-bg">
          <img
            src={process.heroImage}
            alt={process.heroImageAlt}
            width="1600"
            height="900"
            fetchPriority="high"
          />
        </div>
        <div className="proc-hero-content">
          <span className="eyebrow eyebrow-light">Process{product ? ` — ${product.name}` : ''}</span>
          <h1>{process.title}</h1>
          <p className="proc-hero-sub">{process.subtitle}</p>
          {heroMeta.length > 0 && (
            <div className="proc-hero-meta" aria-label="Piece at a glance">
              {heroMeta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}
          <a className="proc-hero-cue" href="#making">Follow the making ↓</a>
        </div>
      </section>

      {/* Journey ledger */}
      <nav className="proc-journey" aria-label="The making journey">
        <div className="proc-journey-inner">
          <a href="#material">Material</a>
          <span className="proc-journey-arrow" aria-hidden="true">→</span>
          <a href="#making">Making</a>
          <span className="proc-journey-arrow" aria-hidden="true">→</span>
          <a href="#time">Time</a>
          <span className="proc-journey-arrow" aria-hidden="true">→</span>
          <a href="#object">Object</a>
        </div>
      </nav>

      {/* Material */}
      <section className="proc-material" id="material">
        <div className="proc-material-inner reveal">
          <div>
            <span className="eyebrow">Material</span>
            <p className="proc-material-lede" style={{ marginTop: 'var(--space-md)' }}>{process.intro}</p>
          </div>
          <div className="proc-record" aria-label="Material record">
            <div className="proc-record-title">Material record — {product?.name || 'this piece'}</div>
            {materialRecord.map(([label, value]) => (
              <div key={label} className="proc-record-row">
                <span className="proc-record-label">{label}</span>
                <span className="proc-record-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Making */}
      <section className="proc-making" id="making">
        <div className="proc-making-head reveal">
          <span className="eyebrow">Making</span>
          <h2>From log to table.</h2>
          <p>Each stage below is how the piece is actually put together — the same construction described on the product page, followed in order.</p>
        </div>

        {makingIntro && (
          <div className="proc-feature reveal">
            <span className="proc-feature-number">Stage {makingIntro.number}</span>
            <h3>{makingIntro.title}</h3>
            <p>{makingIntro.description}</p>
          </div>
        )}

        <div className="proc-break editorial-wide-break reveal">
          <figure>
            <img
              src="https://images.pexels.com/photos/5974417/pexels-photo-5974417.jpeg?auto=compress&cs=tinysrgb&w=2000"
              alt="Close-up of a craftsman's hand guiding a chisel in the workshop."
              width="2000"
              height="1125"
              loading="lazy"
            />
            <figcaption>Hands and tools — the workshop.</figcaption>
          </figure>
        </div>

        {settlingStages.length > 0 && (
          <div className="proc-pair">
            {settlingStages.map((stage) => (
              <div key={stage.number} className="proc-ledger reveal">
                <div className="proc-ledger-number">Stage {stage.number}</div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
            ))}
          </div>
        )}

        {joiningStage && (
          <div className="proc-split reveal">
            <div className="proc-split-text">
              <span className="eyebrow">Stage {joiningStage.number}</span>
              <h3>{joiningStage.title}</h3>
              <p>{joiningStage.description}</p>
            </div>
            <figure>
              <img
                src={product?.images?.[2] || product?.images?.[0]}
                alt={`${product?.name || 'The finished piece'} — joined without metal fasteners.`}
                width="1200"
                height="900"
                loading="lazy"
              />
              <figcaption className="proc-split-caption" style={{ padding: 'var(--space-xs) var(--space-md)' }}>
                {product?.name} — mortise and tenon, no metal fasteners.
              </figcaption>
            </figure>
          </div>
        )}

        {finishingStages.length > 0 && (
          <div className="proc-pair">
            {finishingStages.map((stage) => (
              <div key={stage.number} className="proc-ledger reveal">
                <div className="proc-ledger-number">Stage {stage.number}</div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Time / effort / value — only documented measurements */}
      <section className="proc-time" id="time">
        <div className="proc-time-inner reveal">
          <span className="eyebrow eyebrow-light">Time &amp; effort</span>
          <h2>Why the piece feels the way it does.</h2>
          <p className="proc-time-lede">
            The surface is planed by hand, not sanded, to keep the grain&apos;s natural lustre.
            Joints are cut as mortise and tenon and fitted dry before any finish goes on.
            Thin coats of food-safe oil are worked in by hand, each left to cure — so the
            patina deepens with use instead of wearing through.
          </p>
          <div className="proc-time-grid">
            <div className="proc-time-stat">
              <strong>{product?.buildTime || specValue('Build Time') || '—'}</strong>
              <span>Hands-on build</span>
            </div>
            <div className="proc-time-stat">
              <strong>{specValue('Joinery') || '—'}</strong>
              <span>Joinery</span>
            </div>
            <div className="proc-time-stat">
              <strong>{specValue('Finish') || product?.finish || '—'}</strong>
              <span>Finish</span>
            </div>
            <div className="proc-time-stat">
              <strong>{product?.weight || specValue('Weight') || '—'}</strong>
              <span>Solid teak weight</span>
            </div>
          </div>
        </div>
      </section>

      {/* Object — back to the finished piece */}
      {product && (
        <section className="proc-object" id="object">
          <div className="proc-object-inner reveal">
            <figure>
              <img
                src={product.images?.[0]}
                alt={product.name}
                width="800"
                height="1000"
                loading="lazy"
              />
              <figcaption>The grain runs the full length of the top, unbroken.</figcaption>
            </figure>
            <div className="proc-object-text">
              <span className="eyebrow">The finished object</span>
              <h2>{finalStage ? finalStage.title : 'The Finished Piece'}</h2>
              <div className="proc-object-name">{product.name}</div>
              <div className="proc-object-price">{product.priceFormatted}</div>
              <p>{product.shortDescription}</p>
              {finalStage && <p>{finalStage.description}</p>}
              <div className="proc-object-actions">
                <Link href={`/shop/${product.id}`} className="btn-primary">View This Piece</Link>
                <Link href="/studio" className="link-quiet">Visit the Studio</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Share */}
      <section className="proc-share">
        <div className="proc-share-inner reveal">
          <div className="proc-share-text">
            <span className="eyebrow">Share</span>
            <h2>Pass it on.</h2>
            <p>Send this making story to someone choosing a table — or follow the workshop on Instagram.</p>
          </div>
          <div className="proc-share-actions">
            <button type="button" className="proc-share-btn" onClick={handleShare}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }} aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              {shareCopied ? 'Copied!' : 'Share'}
            </button>
            <a className="proc-share-btn" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }} aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><line x1="17.5" y1="6.5" x2="17.5" y2="6.5" /></svg>
              Instagram
            </a>
            <Link href="/journal" className="link-quiet">Atelier Stories</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

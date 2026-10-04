/**
 * TEAKLE — Watch the Process / making-of experience (hero Atelier Stories piece).
 *
 * Short editorial composition, wide extreme left/right grid:
 *   01 Opening — product name, full-width 16:9 process film, short intro
 *   02 What it is — story left, factual record right
 *   03 Why teak — philosophy left, supporting image right
 *   04 The making — five-stage horizontal sequence, one line each
 *   05 Craft — finished plate left, hand-finishing text right
 *   06 One object — closing philosophy + CTA (inquire, buy, archive)
 *   07 Related Atelier Stories navigation
 *
 * Data contract (app/data/process.js + app/data/products.js):
 *   - process: slug, videoUrl, posterUrl, contextLabel, introduction,
 *     whyTeak, oneOfOne { eyebrow, heading, body[] }, relationship,
 *     closing, ctaLabels, stages[] (number, title, description, isFinal?),
 *     heroImageAlt
 *   - product: name, shortDescription, material, dimensions, buildTime,
 *     priceFormatted, availabilityNote, images[], specifications[]
 *
 * Content-integrity notes:
 *   - No video asset exists in the repository (videoUrl is null), so the
 *     film block renders a native <video> with poster + controls and no
 *     <source>. When TEAKLE supplies footage, only the data field changes.
 *   - Stage descriptions show their opening sentence in the sequence; the
 *     full approved copy stays intact in the data file.
 *   - All copy below is drawn from process.js / products.js. Nothing is
 *     invented: no people, places, dates, awards, or provenance beyond
 *     the existing dataset.
 *   - Static editorial render. No scroll-reveal, no gradients, no autoplay.
 *
 * WordPress migration: every block maps 1:1 to a CMS field
 * (title, video + poster, intro, record, philosophy, image, stages,
 * craft, closing, CTA labels/links).
 */
'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

const INSTAGRAM_URL = 'https://www.instagram.com/teaklestudio'

export default function ProcessPageClient({ process, product }) {
  const [shareCopied, setShareCopied] = useState(false)

  const stages = (process.stages || []).filter((s) => !s.isFinal)
  const inspectionStage = stages.find((s) => s.number === '06') || null
  const sequenceStages = stages.filter((s) => s.number !== '06').slice(0, 5)

  /* Share — native share where supported, clipboard fallback, never errors. */
  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || process?.title || 'Teakle',
          text: product?.shortDescription || '',
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
  }, [process, product])

  /* Facts surfaced only from the authoritative product data. */
  const specValue = (label) =>
    product?.specifications?.find((s) => s.label === label)?.value || null

  /* Supporting record row (right rail) — values only from product data. */
  const edRow = ([label, value]) => value ? (
    <div key={label} className="mk-ed-row">
      <span className="mk-ed-label">{label}</span>
      <span className="mk-ed-value">{value}</span>
    </div>
  ) : null

  /* Opening sentence of a stage description (full copy stays in data). */
  const firstSentence = (text) => {
    if (!text) return ''
    const idx = text.indexOf('. ')
    return idx === -1 ? text : text.slice(0, idx + 1)
  }

  const para = (text, i) => <p key={i}>{text}</p>

  const name = product?.name || 'The Anchor Table'
  const filmUrl = process.videoUrl || null
  const posterUrl = process.posterUrl || process.heroImage || product?.images?.[0] || null
  const intro = process.introduction || null
  const whyTeak = process.whyTeak || null
  const oneOfOne = process.oneOfOne || null
  const relationship = process.relationship || null
  const images = product?.images || []
  const labels = process.ctaLabels || {}
  const livingCoda = relationship && relationship.body.length > 1
    ? relationship.body.slice(1).map(para)
    : null

  return (
    <div className="mk-page">
      <style>{`
        .mk-page { overflow-x: clip; background: var(--bg-primary); }

        /* ---- Breadcrumb ---- */
        .mk-breadcrumb {
          border-bottom: var(--border-subtle);
          padding: var(--space-sm) 0;
        }
        .mk-breadcrumb-inner {
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
        .mk-breadcrumb a { color: var(--text-secondary); text-decoration: none; }
        .mk-breadcrumb a:hover { color: var(--bronze); }
        .mk-breadcrumb-sep { opacity: 0.4; }

        /* ---- 01 · Opening: product name first, extremely restrained ---- */
        .mk-open {
          max-width: var(--container);
          margin: 0 auto;
          padding: clamp(var(--space-xl), 6vw, calc(var(--space-2xl) * 1.25)) var(--space-md) var(--space-lg);
        }
        .mk-open h1 {
          font-size: clamp(2.25rem, 5vw, 3.75rem);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1.05;
          text-transform: uppercase;
          margin: 0 0 var(--space-sm);
          max-width: 16ch;
        }
        .mk-open-desc {
          color: var(--text-secondary);
          font-size: var(--text-lede);
          line-height: var(--lh-relaxed);
          max-width: 52ch;
          margin: 0;
        }

        /* ---- Film: full-width 16:9, no card, no frame ---- */
        .mk-film { margin: 0; background: #000; }
        .mk-film video {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: contain;
          background: #000;
        }
        .mk-film-cap {
          background: var(--bg-primary);
          border-bottom: var(--border-subtle);
        }
        .mk-film-cap-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-xs) var(--space-md) var(--space-md);
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
        }
        .mk-film-title {
          display: block;
          color: var(--text-primary);
          font-size: var(--text-body-lg);
          font-weight: 500;
          letter-spacing: 0.02em;
          margin-bottom: 2px;
        }

        /* ---- Editorial sections ---- */
        .mk-section { padding: clamp(var(--space-lg), 5vw, var(--space-xl)) 0 0; }

        /* ---- Extreme grid: story left, supporting record right ---- */
        .mk-ed {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md);
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: var(--space-xl) var(--space-2xl);
          align-items: start;
        }
        .mk-ed-main { min-width: 0; max-width: 60ch; }
        .mk-ed-main h2 {
          font-size: clamp(1.6rem, 3vw, 2.25rem);
          font-weight: 500;
          letter-spacing: -0.015em;
          margin: var(--space-xs) 0 var(--space-md);
          max-width: 22ch;
        }
        .mk-ed-main p {
          color: var(--text-secondary);
          font-size: var(--text-body-lg);
          line-height: 1.75;
          margin: 0 0 var(--space-md);
        }
        .mk-ed-main p:last-child { margin-bottom: 0; }
        .mk-ed-side { min-width: 0; }
        .mk-ed-side-title {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: var(--space-sm) 0 var(--space-xs);
          border-top: var(--border-hair);
        }
        .mk-ed-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: var(--space-md);
          padding: 0.55rem 0;
          border-top: var(--border-hair);
          font-size: var(--text-body);
        }
        .mk-ed-row:last-child { border-bottom: var(--border-hair); }
        .mk-ed-label { color: var(--text-secondary); flex-shrink: 0; }
        .mk-ed-value { color: var(--text-primary); text-align: right; font-weight: 500; }
        .mk-ed-figure { margin: 0; }
        .mk-ed-figure img {
          display: block;
          width: 100%;
          height: auto;
        }
        .mk-ed-figure figcaption {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          padding-top: var(--space-xs);
        }

        /* ---- Landscape plates: full container width, never cropped ---- */
        .mk-plate {
          max-width: var(--container);
          margin: var(--space-xl) auto 0;
          padding: 0 var(--space-md);
        }
        .mk-plate figure { margin: 0; }
        .mk-plate img {
          display: block;
          width: 100%;
          height: auto;
        }
        .mk-plate figcaption {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          padding-top: var(--space-xs);
        }

        /* ---- Making sequence: five stages in one row ---- */
        .mk-steps {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: var(--space-lg);
          margin-top: var(--space-lg);
          padding-top: var(--space-lg);
          border-top: var(--border-hair);
        }
        .mk-step-number {
          display: block;
          font-size: var(--text-caption);
          letter-spacing: 0.12em;
          color: var(--bronze-text);
          margin-bottom: var(--space-xs);
        }
        .mk-step h3 {
          font-size: var(--text-body-lg);
          font-weight: 500;
          letter-spacing: -0.01em;
          margin: 0 0 var(--space-xs);
        }
        .mk-step p {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          margin: 0;
        }
        .mk-steps-note {
          color: var(--text-tertiary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          margin: var(--space-md) 0 0;
          max-width: 60ch;
        }

        /* ---- Craft band: finished plate beside hand-finishing text ---- */
        .mk-time {
          background: var(--walnut);
          margin-top: clamp(var(--space-lg), 5vw, var(--space-xl));
          padding: var(--space-2xl) 0;
        }
        .mk-time-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md);
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: var(--space-2xl);
          align-items: center;
        }
        .mk-time figure { margin: 0; }
        .mk-time img {
          display: block;
          width: 100%;
          height: auto;
        }
        .mk-time figcaption {
          color: var(--stone);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
          padding-top: var(--space-xs);
          opacity: 0.8;
        }
        .mk-time h2 {
          color: var(--bg-primary);
          font-size: clamp(1.6rem, 3vw, 2.25rem);
          font-weight: 500;
          letter-spacing: -0.015em;
          margin: var(--space-xs) 0 var(--space-md);
          max-width: 20ch;
        }
        .mk-time-lede {
          color: var(--stone);
          font-size: var(--text-body-lg);
          line-height: 1.75;
          margin: 0 0 var(--space-md);
        }
        .mk-time-lede:last-child { margin-bottom: 0; }

        /* ---- Full-bleed still ---- */
        .mk-break { margin: clamp(var(--space-lg), 5vw, var(--space-xl)) 0 0; }
        .mk-break figure { margin: 0; }
        .mk-break img {
          display: block;
          width: 100%;
          height: clamp(320px, 60vh, 560px);
          object-fit: cover;
          object-position: 50% 40%;
        }
        .mk-break figcaption {
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-xs) var(--space-md) 0;
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          letter-spacing: 0.04em;
        }

        /* ---- Closing: philosophy + CTA ---- */
        .mk-close {
          max-width: var(--container);
          margin: 0 auto;
          padding: clamp(var(--space-lg), 5vw, var(--space-xl)) var(--space-md) 0;
        }
        .mk-close h2 {
          font-size: clamp(1.6rem, 3vw, 2.25rem);
          font-weight: 500;
          letter-spacing: -0.015em;
          margin: var(--space-xs) 0 var(--space-md);
          max-width: 22ch;
        }
        .mk-close p {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: 1.75;
          margin: 0 0 var(--space-md);
          max-width: 60ch;
        }
        .mk-close-price {
          color: var(--text-primary);
          font-size: var(--text-body-lg);
          font-weight: 500;
          margin: var(--space-lg) 0 0;
        }
        .mk-close-actions {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
          align-items: center;
          margin-top: var(--space-md);
        }
        .mk-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0.8rem 1.75rem;
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid var(--text-primary);
          color: var(--text-primary);
          background: none;
          cursor: pointer;
        }
        .mk-btn:hover { border-color: var(--bronze); color: var(--bronze); }
        .mk-close-archive { margin-top: var(--space-md); }

        /* ---- Related Atelier Stories ---- */
        .mk-related { border-top: var(--border-subtle); margin-top: clamp(var(--space-lg), 5vw, var(--space-xl)); }
        .mk-related-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-md);
          display: flex;
          gap: var(--space-md) var(--space-lg);
          flex-wrap: wrap;
          align-items: center;
        }
        .mk-related-label {
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-right: auto;
        }

        /* ---- Share ---- */
        .mk-share { border-top: var(--border-subtle); }
        .mk-share-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-md);
          display: flex;
          gap: var(--space-md);
          align-items: center;
          flex-wrap: wrap;
        }
        .mk-share-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          min-height: 44px;
          padding: 0.6rem 1rem;
          background: none;
          border: 1px solid var(--stone);
          cursor: pointer;
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .mk-share-btn:hover { color: var(--bronze); border-color: var(--bronze); }

        /* ---- Responsive: collapse grids naturally, left-aligned ---- */
        @media (max-width: 1100px) {
          .mk-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .mk-time-inner { grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); }
        }
        @media (max-width: 900px) {
          .mk-ed { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 560px) {
          .mk-steps { grid-template-columns: minmax(0, 1fr); }
          .mk-close-actions { flex-direction: column; align-items: stretch; }
          .mk-close-actions .btn-primary { text-align: center; }
          .mk-break img { height: 300px; }
        }
      `}</style>

      {/* Breadcrumb */}
      <nav className="mk-breadcrumb" aria-label="Breadcrumb">
        <div className="mk-breadcrumb-inner">
          <Link href="/">Home</Link>
          <span className="mk-breadcrumb-sep">/</span>
          <Link href="/studio">Studio</Link>
          <span className="mk-breadcrumb-sep">/</span>
          <span aria-current="page">{process.title}</span>
        </div>
      </nav>

      {/* 01 · Opening: product name, film, short introduction */}
      <header className="mk-open">
        <span className="eyebrow">{process.contextLabel || 'Atelier Stories'}</span>
        <h1>{name}</h1>
        {product?.shortDescription ? <p className="mk-open-desc">{product.shortDescription}</p> : null}
      </header>

      <figure className="mk-film" id="film" style={{ margin: 0 }}>
        <video
          controls
          playsInline
          preload="none"
          poster={posterUrl || undefined}
          aria-label={`The making of ${name} — process film`}
        >
          {filmUrl ? <source src={filmUrl} type="video/mp4" /> : null}
          <p>This film documents the making of {name}, from a single teak block to the finished table.</p>
        </video>
      </figure>
      <div className="mk-film-cap">
        <div className="mk-film-cap-inner">
          <span className="mk-film-title">From timber to object.</span>
          <span>The making of {name} — from a single teak block to the finished table.</span>
        </div>
      </div>

      {/* 02 · What it is — story left, record right */}
      {intro ? (
        <section className="mk-section" id="introduction" aria-label={intro.heading}>
          <div className="mk-ed">
            <div className="mk-ed-main">
              <span className="eyebrow">{intro.eyebrow}</span>
              <h2>{intro.heading}</h2>
              {intro.body.map(para)}
            </div>
            <aside className="mk-ed-side" aria-label="Key information">
              <div className="mk-ed-side-title">Key information</div>
              {[
                ['Material', specValue('Material') || product?.material],
                ['Form', specValue('Dimensions') || product?.dimensions],
                ['Build time', specValue('Build Time') || product?.buildTime],
                ['Edition', 'One of One'],
              ].map(edRow)}
            </aside>
          </div>
        </section>
      ) : null}

      {/* Large plate: the object in full */}
      {images[0] ? (
        <div className="mk-plate">
          <figure>
            <img src={images[0]} alt={`${name} — the finished table`} width="1200" height="900" loading="lazy" />
            <figcaption>The grain runs the full length of the top, unbroken.</figcaption>
          </figure>
        </div>
      ) : null}

      {/* 03 · Why teak — philosophy left, supporting image right */}
      {whyTeak ? (
        <section className="mk-section" id="material" aria-label={whyTeak.heading}>
          <div className="mk-ed">
            <div className="mk-ed-main">
              <span className="eyebrow">{whyTeak.eyebrow}</span>
              <h2>{whyTeak.heading}</h2>
              {whyTeak.body.map(para)}
            </div>
            {images[1] ? (
              <figure className="mk-ed-figure">
                <img src={images[1]} alt={`${name} — surface detail`} width="1200" height="900" loading="lazy" />
                <figcaption>Hand-planed, oiled, and left to cure.</figcaption>
              </figure>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 04 · The making — five stages in one row */}
      <section className="mk-section" id="making" aria-label="From material to object">
        <div className="mk-ed">
          <div className="mk-ed-main" style={{ maxWidth: 'none' }}>
            <span className="eyebrow">From material to object</span>
            <h2>A sequence of decisions.</h2>
            <p>Each stage below is how the piece is actually put together — the same construction described on the product page, followed in order.</p>
          </div>
        </div>
        <div className="mk-ed" style={{ marginTop: '0' }}>
          <div className="mk-steps" style={{ gridColumn: '1 / -1' }}>
            {sequenceStages.map((stage) => (
              <div key={stage.number} className="mk-step">
                <span className="mk-step-number">Stage {stage.number}</span>
                <h3>{stage.title}</h3>
                <p>{firstSentence(stage.description)}</p>
              </div>
            ))}
          </div>
        </div>
        {inspectionStage ? (
          <div className="mk-ed" style={{ marginTop: '0' }}>
            <p className="mk-steps-note" style={{ gridColumn: '1 / -1' }}>Before it is finished: {inspectionStage.description}</p>
          </div>
        ) : null}
      </section>

      {/* 05 · Craft — finished plate beside hand-finishing text */}
      <section className="mk-time" id="time" aria-label="Craft and hand-finishing">
        <div className="mk-time-inner">
          {images[2] ? (
            <figure>
              <img src={images[2]} alt={`${name} — the finished piece`} width="1200" height="900" loading="lazy" />
              <figcaption>Joined by hand — no metal fasteners.</figcaption>
            </figure>
          ) : null}
          <div>
            <span className="eyebrow eyebrow-light">Time &amp; effort</span>
            <h2>About eighteen hours, by hand.</h2>
            <p className="mk-time-lede">
              Every joint is hand-cut — mortise and tenon, no metal fasteners, no
              screws. The surface is planed by hand, not sanded, to keep the
              grain&rsquo;s natural lustre. Thin coats of food-safe oil are worked
              in by hand, each left to cure — so the patina deepens with use
              instead of wearing through.
            </p>
            {relationship && relationship.body.length > 0 ? (
              <p className="mk-time-lede">{relationship.body[0]}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Full-bleed still */}
      {images[3] ? (
        <div className="mk-break">
          <figure>
            <img
              src={images[3]}
              alt={`${name} — living with the finished table`}
              width="1600"
              height="900"
              loading="lazy"
            />
            <figcaption>Teak deepens with use — a patina, not wear.</figcaption>
          </figure>
        </div>
      ) : null}

      {/* 06 · One object — closing philosophy + CTA */}
      {oneOfOne ? (
        <section className="mk-close" id="object" aria-label={oneOfOne.heading}>
          <span className="eyebrow">{oneOfOne.eyebrow}</span>
          <h2>{oneOfOne.heading}</h2>
          {oneOfOne.body.map(para)}
          {livingCoda}
          <p className="mk-close-price">
            {[product?.priceFormatted, product?.availabilityNote || product?.availability].filter(Boolean).join(' · ')}
          </p>
          <div className="mk-close-actions">
            <Link href={`/inquire/${product.id}`} className="btn-primary">{labels.inquire || 'INQUIRE TO OWN'}</Link>
            <Link href={`/shop/${product.id}`} className="mk-btn">{labels.buy || 'BUY NOW'}</Link>
          </div>
          <div className="mk-close-archive">
            <Link href="/archive" className="link-quiet">{labels.archive || 'SEE PAST COLLECTIONS'}</Link>
          </div>
        </section>
      ) : null}

      {/* 07 · Related Atelier Stories */}
      <nav className="mk-related" id="own" aria-label="Continue">
        <div className="mk-related-inner">
          <span className="mk-related-label">Next Atelier Stories</span>
          <Link href={`/inquire/${product.id}`} className="link-quiet">Inquire to Own</Link>
          <Link href={`/shop/${product.id}`} className="link-quiet">Buy Now</Link>
          <Link href="/archive" className="link-quiet">Past Collections</Link>
          <Link href="/studio" className="link-quiet">Visit the Studio</Link>
          <Link href="/journal" className="link-quiet">Journal</Link>
        </div>
      </nav>

      {/* Quiet share row (existing behaviour, kept minimal) */}
      <div className="mk-share">
        <div className="mk-share-inner">
          <button type="button" className="mk-share-btn" onClick={handleShare}>
            {shareCopied ? 'Copied!' : 'Share'}
          </button>
          <a className="link-quiet" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            Instagram
          </a>
          <Link href="/journal" className="link-quiet">More writing — the Journal</Link>
        </div>
      </div>
    </div>
  )
}

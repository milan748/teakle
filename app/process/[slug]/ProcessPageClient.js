'use client'

import Link from 'next/link'
import ProcessVideo from '../../components/ProcessVideo'

export default function ProcessPageClient({ process, product }) {
  const stages = process.stages || []

  return (
    <>
      <style>{`
        /* ================================================================
           PROCESS PAGE — Making-Of Experience
           ================================================================ */

        /* ---- Hero ---- */
        .proc-hero {
          position: relative;
          min-height: 56vh;
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
          opacity: 0.55;
        }
        .proc-hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(51,38,29,0.85) 0%, rgba(51,38,29,0.3) 50%, transparent 100%);
        }
        .proc-hero-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-2xl) var(--space-md) var(--space-xl);
        }
        .proc-hero .eyebrow {
          margin-bottom: var(--space-sm);
        }
        .proc-hero h1 {
          color: var(--bg-primary);
          font-size: clamp(2rem, 4.5vw, var(--text-hero));
          font-weight: 300;
          font-style: italic;
          letter-spacing: -0.02em;
          max-width: 700px;
          margin-bottom: var(--space-md);
        }
        .proc-hero-sub {
          color: var(--stone);
          font-size: var(--text-lede);
          max-width: 540px;
          line-height: var(--lh-relaxed);
        }

        /* ---- Intro ---- */
        .proc-intro {
          background: var(--bg-primary);
          padding: var(--space-2xl) 0;
        }
        .proc-intro-inner {
          max-width: var(--content-narrow);
          margin: 0 auto;
          padding: 0 var(--space-md);
        }
        .proc-intro-inner p {
          color: var(--text-secondary);
          font-size: var(--text-lede);
          line-height: var(--lh-relaxed);
        }

        /* ---- Stages ---- */
        .proc-stages {
          background: var(--bg-primary);
          padding: 0 0 var(--space-2xl);
        }
        .proc-stage {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2xl);
          align-items: center;
          max-width: var(--container);
          margin: 0 auto;
          padding: var(--space-xl) var(--space-md);
          border-top: var(--border-subtle);
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
        }
        .proc-stage.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .proc-stage-text {
          order: 2;
        }
        .proc-stage-media {
          order: 1;
        }
        .proc-stage:nth-child(even) .proc-stage-text { order: 1; }
        .proc-stage:nth-child(even) .proc-stage-media { order: 2; }

        .proc-stage-number {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.6875rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bronze);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 3px 14px;
          margin-bottom: var(--space-sm);
        }
        .proc-stage h2 {
          font-size: clamp(1.5rem, 3vw, var(--text-h2));
          font-weight: 400;
          margin-bottom: var(--space-md);
          max-width: none;
        }
        .proc-stage p {
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          max-width: 42ch;
        }

        /* ---- Video ---- */
        .process-video { width: 100%; }
        .process-video-inner {
          position: relative;
          aspect-ratio: 16 / 9;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .process-video-player {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0;
          transition: opacity 0.4s var(--ease);
        }
        .process-video-player.is-loaded {
          opacity: 1;
        }
        .process-video-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          padding: var(--space-lg);
        }
        .process-video-empty-content {
          text-align: center;
          max-width: 320px;
        }
        .process-video-stage {
          display: inline-block;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bronze);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 3px 14px;
          margin-bottom: var(--space-sm);
        }
        .process-video-empty-label {
          color: var(--text-tertiary);
          font-size: var(--text-body);
          font-style: italic;
          margin-bottom: var(--space-xs);
        }
        .process-video-empty-sub {
          color: var(--text-tertiary);
          font-size: var(--text-caption);
          line-height: var(--lh-relaxed);
        }

        /* ---- Final piece ---- */
        .proc-final {
          background: var(--walnut);
          padding: var(--space-2xl) 0;
        }
        .proc-final-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2xl);
          align-items: center;
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--space-md);
        }
        .proc-final-text h2 {
          color: var(--bg-primary);
          font-size: clamp(1.5rem, 3vw, var(--text-h2));
          font-weight: 300;
          font-style: italic;
          margin-bottom: var(--space-md);
          max-width: none;
        }
        .proc-final-text p {
          color: var(--stone);
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          margin-bottom: var(--space-lg);
          max-width: 42ch;
        }
        .proc-final-actions {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          flex-wrap: wrap;
        }
        .proc-final-actions .btn-primary {
          color: var(--bg-primary);
          border-color: var(--bg-primary);
        }
        .proc-final-actions .link-quiet {
          color: var(--stone);
          border-color: rgba(201,193,182,0.4);
        }
        .proc-final-actions .link-quiet:hover {
          color: var(--bronze);
          border-color: var(--bronze);
        }
        .proc-final-image {
          aspect-ratio: 4 / 3;
          overflow: hidden;
          border-radius: var(--radius-md);
        }
        .proc-final-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

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
        }
        .proc-breadcrumb a {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s var(--ease);
        }
        .proc-breadcrumb a:hover { color: var(--bronze); }
        .proc-breadcrumb-sep { opacity: 0.4; }

        /* ---- Responsive ---- */
        @media (max-width: 860px) {
          .proc-hero { min-height: 44vh; }
          .proc-hero h1 { font-size: clamp(1.75rem, 4vw, var(--text-h1)); }

          .proc-stage {
            grid-template-columns: 1fr;
            gap: var(--space-lg);
            padding: var(--space-lg) var(--space-md);
          }
          .proc-stage-text { order: 1; }
          .proc-stage-media { order: 2; }
          .proc-stage:nth-child(even) .proc-stage-text { order: 1; }
          .proc-stage:nth-child(even) .proc-stage-media { order: 2; }
          .proc-stage p { max-width: none; }

          .proc-final-inner {
            grid-template-columns: 1fr;
            gap: var(--space-lg);
          }
          .proc-final-image { order: -1; }
          .proc-final-text p { max-width: none; }
          .proc-final-actions { flex-direction: column; align-items: flex-start; gap: var(--space-md); }
        }

        @media (max-width: 560px) {
          .proc-hero { min-height: 36vh; }
          .proc-hero-content { padding: var(--space-xl) var(--space-md) var(--space-lg); }
          .proc-hero h1 { font-size: var(--text-h1); }
          .proc-stage { padding: var(--space-md); }
        }

        @media (prefers-reduced-motion: reduce) {
          .proc-stage { opacity: 1 !important; transform: none !important; transition: none !important; }
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

      {/* Hero */}
      <section className="proc-hero">
        <div className="proc-hero-bg">
          <img src={process.heroImage} alt={process.heroImageAlt} width="1600" height="900" />
        </div>
        <div className="proc-hero-content">
          <span className="eyebrow eyebrow-light">Process</span>
          <h1>{process.title}</h1>
          <p className="proc-hero-sub">{process.subtitle}</p>
        </div>
      </section>

      {/* Intro */}
      {process.intro && (
        <section className="proc-intro">
          <div className="proc-intro-inner reveal">
            <p>{process.intro}</p>
          </div>
        </section>
      )}

      {/* Stages */}
      <section className="proc-stages">
        {stages.map((stage) => (
          <div key={stage.number} className="proc-stage reveal">
            <div className="proc-stage-text">
              <span className="proc-stage-number">Stage {stage.number}</span>
              <h2>{stage.title}</h2>
              <p>{stage.description}</p>
            </div>
            <div className="proc-stage-media">
              <ProcessVideo
                videoUrl={stage.videoUrl}
                posterUrl={stage.posterUrl}
                title={stage.title}
                stageNumber={stage.number}
                description={stage.description}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Final piece / Product relationship */}
      {product && (
        <section className="proc-final">
          <div className="proc-final-inner reveal">
            <div className="proc-final-text">
              <h2>The Finished Piece</h2>
              <p>{product.shortDescription} {product.description ? product.description.split('.').slice(0, 2).join('.') + '.' : ''}</p>
              <div className="proc-final-actions">
                <Link href={`/shop/${product.id}`} className="btn-primary">View This Piece</Link>
                <Link href="/studio" className="link-quiet">Visit the Studio</Link>
              </div>
            </div>
            <div className="proc-final-image img-zoom">
              <img src={product.images?.[0]} alt={product.name} width="800" height="600" loading="lazy" />
            </div>
          </div>
        </section>
      )}
    </>
  )
}

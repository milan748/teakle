import StudioRoadmap from '../components/StudioRoadmap'
import { getPublishedPageSections, seedDefaultSections, getPageDesignSettings } from '@/lib/cms'
import { resolvePageDesign, resolveVariant, parseStyleOverrides, parseSectionOverrides, resolveSectionStyle, getVariantClass } from '@/lib/designResolution'

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Studio',
  description: 'Inside the Teakle workshop. How our objects are designed, crafted, and finished by hand.',
  openGraph: { title: 'Studio — Teakle', description: 'Inside the Teakle workshop.' },
};

export default function StudioPage() {
  let sections = [];
  try {
    sections = getPublishedPageSections('studio');
    if (sections.length > 0) {
      seedDefaultSections('studio');
      sections = getPublishedPageSections('studio');
    }
  } catch (e) { console.warn('Failed to load CMS sections:', e.message); }
  const cms = {};
  for (const s of sections) { if (s.enabled) cms[s.sectionKey] = s; }
  const cmsKeys = new Set(sections.map(s => s.sectionKey));

  const hero = cms.hero || {};
  const origin = cms.origin || {};
  const gallery = cms.gallery || {};
  const materials = cms.materials || {};
  const heroDisabled = cmsKeys.has('hero') && !cms.hero;
  const originDisabled = cmsKeys.has('origin') && !cms.origin;
  const galleryDisabled = cmsKeys.has('gallery') && !cms.gallery;
  const materialsDisabled = cmsKeys.has('materials') && !cms.materials;

  // Parse materials items from JSON body
  let materialItems = [];
  try { materialItems = JSON.parse(materials.body || '{}').items || []; } catch (e) { console.warn('Failed to parse materials:', e.message); }

  // ── Design Resolution (shared with Homepage) ──────────────────────────────
  let pageDesign = {};
  try { pageDesign = getPageDesignSettings('studio') || {}; } catch (e) { console.warn('Failed to load page design:', e.message); }

  // Server-side: always resolve as desktop (isMobile=false).
  // Mobile overrides are handled by CSS custom properties + media queries.
  const pd = resolvePageDesign(pageDesign, false)

  // Resolve variants for each CMS-backed section
  const heroVariant = resolveVariant('hero', hero.variant)
  const originVariant = resolveVariant('origin', origin.variant)
  const materialsVariant = resolveVariant('materials', materials.variant)
  const galleryVariant = resolveVariant('gallery', gallery.variant)

  // Resolve section-level overrides
  const heroSectionStyle = resolveSectionStyle(parseSectionOverrides(hero.sectionStyleOverrides), pd, false)
  const originSectionStyle = resolveSectionStyle(parseSectionOverrides(origin.sectionStyleOverrides), pd, false)
  const materialsSectionStyle = resolveSectionStyle(parseSectionOverrides(materials.sectionStyleOverrides), pd, false)
  const gallerySectionStyle = resolveSectionStyle(parseSectionOverrides(gallery.sectionStyleOverrides), pd, false)

  // Parse element-level style overrides
  const heroOver = parseStyleOverrides(hero.styleOverrides)
  const originOver = parseStyleOverrides(origin.styleOverrides)
  const materialsOver = parseStyleOverrides(materials.styleOverrides)
  const galleryOver = parseStyleOverrides(gallery.styleOverrides)

  // CSS custom properties from page design (resolved server-side)
  const pageDesignVars = {
    '--studio-content-width': pd.contentWidth || '1200px',
    '--studio-section-padding': pd.sectionPadding || '80px 0',
    '--studio-gap': pd.gap || '64px',
    '--studio-heading-scale': pd.headingScale || 1.0,
    ...(pd.colors ? {
      '--studio-primary': pd.colors.primary,
      '--studio-text': pd.colors.text,
      '--studio-text-light': pd.colors.textLight,
      '--studio-text-muted': pd.colors.textMuted,
      '--studio-bg': pd.colors.bg,
    } : {}),
  }

  return (
    <>
      <StudioRoadmap />

      {/* Page Design CSS custom properties */}
      <style>{`
        :root {
          ${Object.entries(pageDesignVars).map(([k, v]) => `${k}: ${v};`).join('\n          ')}
        }
      `}</style>

      {/* Studio section styles */}
      <style>{`
        .origin {
          background: var(--bg-primary);
          padding: var(--studio-section-padding);
        }
        .origin-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--studio-gap);
          align-items: center;
          max-width: var(--studio-content-width);
          margin: 0 auto;
          padding: 0 var(--space-md);
        }
        .origin-image { aspect-ratio: 4 / 5; }
        .origin-image img { width: 100%; height: 100%; object-fit: cover; }
        .origin-text h2 {
          font-size: clamp(1.75rem, calc(3.2vw * var(--studio-heading-scale, 1)), var(--text-h2));
          margin-bottom: var(--space-md);
          max-width: none;
        }
        .origin-text p { color: var(--text-secondary); margin-bottom: var(--space-sm); line-height: var(--lh-relaxed); }

        .materials {
          background: var(--bg-secondary);
          padding: var(--studio-section-padding);
        }
        .materials-header {
          max-width: 640px;
          margin: 0 auto var(--space-xl);
          text-align: center;
        }
        .materials-header h2 {
          font-size: clamp(1.75rem, calc(3.2vw * var(--studio-heading-scale, 1)), var(--text-h2));
          margin-top: var(--space-sm);
          max-width: none;
        }
        .materials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
          max-width: var(--studio-content-width);
          margin: 0 auto;
          padding: 0 var(--space-md);
        }
        .material-item { border-top: var(--border-hair); padding-top: var(--space-md); }
        .material-item h3 {
          font-size: var(--text-subhead);
          margin-bottom: var(--space-xs);
          max-width: none;
        }
        .material-item p { color: var(--text-secondary); font-size: var(--text-body); line-height: var(--lh-relaxed); }

        .process {
          background: var(--bg-primary);
          padding: var(--space-2xl) 0 var(--space-xl);
          overflow: hidden;
        }
        .process-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }
        .process-header .eyebrow {
          display: block;
          margin-bottom: var(--space-sm);
        }
        .process-header h2 {
          font-size: clamp(1.75rem, 3.2vw, var(--text-h2));
          max-width: none;
        }

        .process-roadmap {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          padding: var(--space-lg) 0;
        }

        .process-path-track {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--border-subtle);
          transform: translateX(-50%);
        }
        .process-path-fill {
          position: absolute;
          left: 50%;
          top: 0;
          width: 2px;
          height: 0;
          background: var(--bronze);
          transform: translateX(-50%);
          transition: height 0.08s linear;
          will-change: height;
        }

        .process-milestone {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 60px 1fr;
          align-items: start;
          gap: 0;
          padding: var(--space-md) 0;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
        }
        .process-milestone.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .process-marker {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 4px;
          z-index: 2;
        }
        .process-marker-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 2px solid var(--bronze);
          position: relative;
          transition: transform 0.4s var(--ease), background 0.4s var(--ease), box-shadow 0.4s var(--ease);
        }
        .process-milestone.is-visible .process-marker-dot {
          transform: scale(1);
        }
        .process-milestone.is-active .process-marker-dot {
          background: var(--bronze);
          box-shadow: 0 0 0 4px rgba(167, 134, 89, 0.15);
        }

        .process-content {
          padding: 0 var(--space-lg);
        }
        .process-content-inner {
          max-width: 320px;
        }
        .process-milestone:nth-child(odd) .process-content-left {
          text-align: right;
        }
        .process-milestone:nth-child(odd) .process-content-left .process-content-inner {
          margin-left: auto;
        }
        .process-milestone:nth-child(odd) .process-content-right {
          visibility: hidden;
        }
        .process-milestone:nth-child(even) .process-content-right {
          text-align: left;
        }
        .process-milestone:nth-child(even) .process-content-left {
          visibility: hidden;
        }

        .process-duration {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bronze);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 3px 12px;
          margin-bottom: var(--space-xs);
        }
        .process-title {
          font-family: var(--font-display);
          font-size: var(--text-subhead);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
          line-height: var(--lh-tight);
        }
        .process-desc {
          font-size: var(--text-body);
          color: var(--text-secondary);
          line-height: var(--lh-relaxed);
          max-width: 36ch;
        }
        .process-milestone:nth-child(odd) .process-desc {
          margin-left: auto;
        }

        .process-icon {
          display: block;
          width: 32px;
          height: 32px;
          margin-bottom: 8px;
          color: var(--bronze);
          opacity: 0.6;
          transition: opacity 0.4s var(--ease), transform 0.4s var(--ease);
        }
        .process-milestone.is-visible .process-icon {
          opacity: 1;
          transform: scale(1);
        }
        .process-milestone:nth-child(odd) .process-icon {
          margin-left: auto;
        }

        @media (hover: hover) {
          .process-milestone:hover .process-marker-dot {
            transform: scale(1.2);
            box-shadow: 0 0 0 6px rgba(167, 134, 89, 0.1);
          }
          .process-milestone:hover .process-icon {
            transform: scale(1.05);
          }
        }

        @media (max-width: 860px) {
          .process-roadmap {
            max-width: 100%;
            padding-left: 40px;
          }
          .process-path-track,
          .process-path-fill {
            left: 20px;
            transform: none;
          }
          .process-milestone {
            grid-template-columns: 40px 1fr;
            gap: 0;
          }
          .process-marker {
            justify-content: center;
            padding-top: 6px;
          }
          .process-content-left {
            display: none !important;
          }
          .process-content-right {
            visibility: visible !important;
            text-align: left !important;
            padding: 0 var(--space-md) 0 var(--space-sm);
          }
          .process-milestone:nth-child(odd) .process-content-right {
            visibility: visible !important;
          }
          .process-desc {
            margin-left: 0 !important;
            max-width: none;
          }
          .process-icon {
            margin-left: 0 !important;
          }
        }

        @media (max-width: 560px) {
          .process-roadmap {
            padding-left: 32px;
          }
          .process-path-track,
          .process-path-fill {
            left: 16px;
          }
          .process-milestone {
            grid-template-columns: 32px 1fr;
          }
          .process-marker-dot {
            width: 14px;
            height: 14px;
          }
          .process-content-right {
            padding: 0 var(--space-sm) 0 6px;
          }
          .origin--centered .origin-text h2 { font-size: clamp(1.5rem, 5vw, 1.75rem); }
          .gallery--full .gallery-item { aspect-ratio: 4 / 3; }
        }

        @media (max-width: 860px) {
          .origin-grid { grid-template-columns: 1fr; gap: var(--space-lg); max-width: 100%; }
          .materials-grid { grid-template-columns: 1fr; gap: var(--space-md); max-width: 100%; }
        }

        .gallery {
          background: var(--walnut);
          color: var(--bg-primary);
          padding: var(--studio-section-padding);
        }
        .gallery .eyebrow { color: var(--stone); }
        .gallery-header {
          max-width: var(--studio-content-width);
          margin: 0 auto;
          padding: 0 var(--space-md);
        }
        .gallery-header h2 {
          color: var(--bg-primary);
          font-size: clamp(1.75rem, calc(3.2vw * var(--studio-heading-scale, 1)), var(--text-h2));
          max-width: 620px;
          margin: var(--space-sm) 0 var(--space-lg);
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          grid-template-rows: repeat(2, 1fr);
          gap: var(--space-sm);
          height: 640px;
          max-width: var(--studio-content-width);
          margin: 0 auto;
          padding: 0 var(--space-md);
        }
        .gallery-grid a:first-child { grid-row: 1 / 3; }
        .gallery-item { overflow: hidden; }
        .gallery-item img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform var(--dur-slow) var(--ease);
        }
        .gallery-item:hover img { transform: scale(1.02); }

        @media (max-width: 860px) {
          .gallery-grid { grid-template-columns: 1fr; grid-template-rows: none; height: auto; }
          .gallery-grid a:first-child { grid-row: auto; }
          .gallery-item { aspect-ratio: 4 / 3; }
          .origin--centered .origin-grid { grid-template-columns: 1fr; }
          .origin--centered .origin-image { max-width: 100%; }
          .materials--compact .material-item { grid-template-columns: 1fr; }
          .gallery--full .gallery-grid { grid-template-columns: 1fr; height: auto; }
        }
      `}</style>

      {/* ── Hero Section (CMS-backed, variant-aware) ── */}
      {!heroDisabled && (
      <section
        className={`page-hero ${getVariantClass('page-hero', heroVariant?.id)}`}
        style={{
          ...(heroSectionStyle.contentWidth ? { maxWidth: heroSectionStyle.contentWidth, margin: '0 auto' } : {}),
          ...(heroSectionStyle.paddingTop ? { paddingTop: heroSectionStyle.paddingTop } : {}),
          ...(heroSectionStyle.paddingBottom ? { paddingBottom: heroSectionStyle.paddingBottom } : {}),
        }}
      >
        <img fetchPriority="high" src={hero.image || "https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1600"} alt="A craftsman planing a wooden board in natural light." width="1600" height="900" />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">{hero.eyebrow || 'Studio'}</span>
          <h1>{hero.title || 'Why we work in solid wood, and why it takes as long as it does.'}</h1>
          <p>{hero.subtitle || 'The materials, the process, and the workshop behind every Teakle piece.'}</p>
        </div>
      </section>
      )}

      {/* ── Origin Section (CMS-backed, variant-aware) ── */}
      {!originDisabled && (
      <section
        className={`origin ${getVariantClass('origin', originVariant?.id)}`}
        style={{
          ...(originSectionStyle.backgroundPreset ? { backgroundColor: originSectionStyle.backgroundPreset } : {}),
        }}
      >
        <div className="origin-grid">
          <div className="origin-image reveal" suppressHydrationWarning>
            <img loading="lazy" src={origin.image || "https://images.pexels.com/photos/5973919/pexels-photo-5973919.jpeg?auto=compress&cs=tinysrgb&w=900"} alt="An older craftsman examining a piece of raw timber in a workshop." width="900" height="1125" />
          </div>
          <div className="origin-text">
            <span className="eyebrow reveal">{origin.eyebrow || 'Where We Started'}</span>
            <h2 className="reveal">{origin.title || 'A carpentry practice that became a workshop, over three generations.'}</h2>
            {(origin.body ? origin.body.split('\n').filter(Boolean) : [
              'Teakle began as a small carpentry practice in India, taking on furniture repair and custom joinery for houses in the area. Over three generations, the same practice narrowed into something more deliberate — fewer commissions, more time per piece, and a refusal to use materials that would not hold up over decades.',
              'We still work the way the workshop always has. A piece is planned by hand, built by hand, and finished by hand. Nothing here is automated because nothing here needed to be.'
            ]).map((p, i) => <p key={i} className="reveal">{p}</p>)}
          </div>
        </div>
      </section>
      )}

      {/* ── Materials Section (CMS-backed, variant-aware) ── */}
      {!materialsDisabled && materialItems.length > 0 && (
      <section
        className={`materials ${getVariantClass('materials', materialsVariant?.id)}`}
        style={{
          ...(materialsSectionStyle.backgroundPreset ? { backgroundColor: materialsSectionStyle.backgroundPreset } : {}),
        }}
      >
        <div className="container">
          <div className="materials-header">
            <span className="eyebrow reveal">{materials.eyebrow || 'Materials'}</span>
            <h2 className="reveal">{materials.title || "Solid wood, and why we don't use anything else."}</h2>
          </div>
          <div className="materials-grid">
            {materialItems.map((item, i) => (
              <div key={i} className="material-item reveal">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Process Section (hardcoded, not CMS-backed) ── */}
      <section className="process">
        <div className="container">
          <div className="process-header">
            <span className="eyebrow reveal">The Journey</span>
            <h2 className="reveal">From timber to finished object.</h2>
          </div>
          <div className="process-roadmap" id="processRoadmap">
            <div className="process-path-track"></div>
            <div className="process-path-fill" id="processPathFill"></div>

            <div className="process-milestone" data-milestone="">
              <div className="process-content process-content-left">
                <div className="process-content-inner">
                  <svg className="process-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 28c6.627 0 12-2.686 12-6V8c0-3.314-5.373-6-12-6S4 4.686 4 8v14c0 3.314 5.373 6 12 6z"/><path d="M4 8c0 3.314 5.373 6 12 6s12-2.686 12-6"/><path d="M16 14c6.627 0 12-2.686 12-6"/></svg>
                  <span className="process-duration">2 – 3 Weeks</span>
                  <h3 className="process-title">Selection</h3>
                  <p className="process-desc">A single block is chosen for grain and density, then left to dry and settle before any cutting begins.</p>
                </div>
              </div>
              <div className="process-marker"><div className="process-marker-dot"></div></div>
              <div className="process-content process-content-right"></div>
            </div>

            <div className="process-milestone" data-milestone="">
              <div className="process-content process-content-left"></div>
              <div className="process-marker"><div className="process-marker-dot"></div></div>
              <div className="process-content process-content-right">
                <div className="process-content-inner">
                  <svg className="process-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="14" width="20" height="3" rx="1"/><path d="M13 14V6a1 1 0 011-1h4a1 1 0 011 1v8"/><path d="M10 17l-2 9h16l-2-9"/><path d="M12 26h8"/></svg>
                  <span className="process-duration">6 – 8 Hours</span>
                  <h3 className="process-title">Joinery</h3>
                  <p className="process-desc">Joints are cut and dry-fitted by hand, checked, and adjusted before any glue or fastener is used.</p>
                </div>
              </div>
            </div>

            <div className="process-milestone" data-milestone="">
              <div className="process-content process-content-left">
                <div className="process-content-inner">
                  <svg className="process-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 27l7-7"/><path d="M12 20l8-8"/><path d="M20 12l5-5"/><circle cx="25" cy="7" r="2"/><path d="M10 24l12-12"/></svg>
                  <span className="process-duration">5 – 6 Hours</span>
                  <h3 className="process-title">Shaping</h3>
                  <p className="process-desc">Edges and surfaces are shaped and smoothed in stages, by hand, until the proportions feel right in person, not just on paper.</p>
                </div>
              </div>
              <div className="process-marker"><div className="process-marker-dot"></div></div>
              <div className="process-content process-content-right"></div>
            </div>

            <div className="process-milestone" data-milestone="">
              <div className="process-content process-content-left"></div>
              <div className="process-marker"><div className="process-marker-dot"></div></div>
              <div className="process-content process-content-right">
                <div className="process-content-inner">
                  <svg className="process-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4v4"/><path d="M8 8l2 3"/><path d="M24 8l-2 3"/><rect x="8" y="14" width="16" height="14" rx="2"/><path d="M12 14V10a4 4 0 018 0v4"/></svg>
                  <span className="process-duration">4 – 5 Hours</span>
                  <h3 className="process-title">Finishing</h3>
                  <p className="process-desc">Several thin coats of food-safe oil are worked into the grain by hand and left to cure between applications.</p>
                </div>
              </div>
            </div>

            <div className="process-milestone" data-milestone="">
              <div className="process-content process-content-left">
                <div className="process-content-inner">
                  <svg className="process-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="16" r="11"/><path d="M11 16l3 3 7-7"/></svg>
                  <span className="process-duration">1 Hour</span>
                  <h3 className="process-title">Inspection</h3>
                  <p className="process-desc">The piece is checked by hand for balance, joint tension, and surface consistency before it leaves the workshop.</p>
                </div>
              </div>
              <div className="process-marker"><div className="process-marker-dot"></div></div>
              <div className="process-content process-content-right"></div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Gallery Section (CMS-backed, variant-aware) ── */}
      {!galleryDisabled && (
      <section
        className={`gallery ${getVariantClass('gallery', galleryVariant?.id)}`}
        style={{
          ...(gallerySectionStyle.backgroundPreset ? { backgroundColor: gallerySectionStyle.backgroundPreset } : {}),
        }}
      >
        <div className="container">
          <div className="gallery-header">
            <span className="eyebrow reveal">{gallery.eyebrow || 'The Workshop'}</span>
            <h2 className="reveal">{gallery.title || 'The people and tools behind every piece.'}</h2>
          </div>
          <div className="gallery-grid">
            <div className="gallery-item img-zoom reveal">
              <img loading="lazy" src={gallery.image || "https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1000"} alt="A craftsman planing a wooden board in natural light." width="1000" height="667" />
            </div>
            <div className="gallery-item img-zoom reveal">
              <img loading="lazy" src="https://images.pexels.com/photos/5974028/pexels-photo-5974028.jpeg?auto=compress&cs=tinysrgb&w=700" alt="Close-up of hand tools laid out on a workbench." width="700" height="467" />
            </div>
            <div className="gallery-item img-zoom reveal">
              <img loading="lazy" src="https://images.pexels.com/photos/5974251/pexels-photo-5974251.jpeg?auto=compress&cs=tinysrgb&w=700" alt="Wood shavings and dust on a workshop floor." width="700" height="467" />
            </div>
          </div>
        </div>
      </section>
      )}
    </>
  )
}

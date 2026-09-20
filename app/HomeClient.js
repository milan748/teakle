'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { PRODUCTS } from './data/products'
import { resolvePageDesign, resolveVariant, parseStyleOverrides, parseSectionOverrides, resolveSectionStyle, resolveElementStyle, resolveTypography, getVariantClass, resolveFocalPoint, focalPointToObjectPosition } from '@/lib/designResolution'
import './homepage.css'

/* Critical CSS for Atelier Stories (injected at runtime to bypass build-time stripping) */
const atelierCriticalCSS = `
  /* Wrapper — clean container */
  .v2-atelier-wrapper { position: relative !important; padding-top: 0 !important; }
  /* Title block — centered, increased gap to content */
  .v2-atelier-title { text-align: center !important; padding: 0 20px 56px !important; scroll-margin-top: 80px; }
  .v2-atelier-title h2 { font-size: clamp(2rem, 4vw, 3.25rem) !important; font-weight: 400 !important; letter-spacing: 0.24em !important; text-transform: uppercase !important; color: #f5f0eb !important; margin: 0 0 8px !important; }
  .v2-atelier-subtitle { display: block !important; font-size: clamp(0.55rem, 0.7vw, 0.7rem) !important; font-weight: 400 !important; font-style: italic !important; letter-spacing: 0.14em !important; text-transform: uppercase !important; color: rgba(245,240,235,0.55) !important; margin-top: 6px !important; margin-bottom: 0 !important; }
  /* Editorial container */
  .v2-sig-editorial { background: transparent !important; padding: 0 0 15px !important; overflow: visible !important; scroll-margin-top: 80px; }
  .v2-sig-editorial-inner { width: 100%; padding: 0; max-width: none; margin: 0; display: block; border-radius: 0; border: none; box-shadow: none; }
  .v2-sig-editorial-inner::before { display: none; }
  /* Grid — 2 columns: left (image + thumbs), right (content) */
  .v2-sig-editorial-grid {
    position: static !important;
    display: grid !important;
    grid-template-columns: 590px 1fr !important;
    gap: 56px !important;
    align-items: start !important;
    justify-items: start !important;
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
  }
  /* Left column — image stack (main image + thumbnails as one visual unit) */
  .v2-sig-editorial-img {
    position: static !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
  }
  .v2-sig-editorial-img > img {
    width: 100% !important;
    aspect-ratio: 4/5 !important;
    object-fit: cover !important;
    display: block !important;
  }
  /* Thumbnails — aligned under main image, same width */
  .v2-sig-editorial-gallery { margin-top: 0 !important; }
  .v2-sig-editorial-thumbs {
    display: flex !important;
    gap: 12px !important;
    width: 100% !important;
  }
  .v2-sig-editorial-thumb {
    flex: 1 !important;
    aspect-ratio: 1/1 !important;
    border: 2px solid transparent !important;
    background: none !important;
    cursor: pointer !important;
    overflow: hidden !important;
    opacity: 0.5 !important;
    transition: opacity 0.2s, border-color 0.2s !important;
    padding: 0 !important;
  }
  .v2-sig-editorial-thumb.is-active { border-color: #f5f0eb !important; opacity: 1 !important; }
  .v2-sig-editorial-thumb:hover { opacity: 0.8 !important; }
  .v2-sig-editorial-thumb img { width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important; }
  /* Right column — product content, vertically balanced */
  .v2-sig-editorial-text {
    position: static !important;
    width: auto !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
  }
  /* Content stack with consistent rhythm */
  .v2-sig-editorial-text h2 {
    font-family: var(--font-heading) !important;
    font-size: clamp(28px, 2.5vw, 40px) !important;
    font-weight: 600 !important;
    letter-spacing: 0.18em !important;
    color: #f5f0eb !important;
    margin: 0 0 12px !important;
    text-transform: uppercase !important;
    line-height: 1.1 !important;
  }
  .v2-sig-editorial-subtitle {
    font-family: var(--font-heading) !important;
    font-size: clamp(14px, 1.1vw, 17px) !important;
    font-weight: 400 !important;
    color: rgba(245,240,235,0.7) !important;
    margin-bottom: 20px !important;
    font-style: italic !important;
    line-height: 1.25 !important;
  }
  .v2-sig-editorial-text > p {
    font-family: var(--font-body) !important;
    font-size: clamp(14px, 1vw, 16px) !important;
    line-height: 1.7 !important;
    color: rgba(245,240,235,0.65) !important;
    margin: 0 0 24px !important;
    max-width: 674px !important;
  }
  /* Metadata row — hidden on desktop (shown inline in features) */
  .v2-sig-editorial-meta-line { display: none !important; }
  .v2-sig-meta-sep { display: none !important; }
  /* Feature blocks with icons — consistent gap */
  .v2-sig-editorial-features {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 16px 24px !important;
    margin-bottom: 28px !important;
  }
  .v2-sig-feature { display: flex !important; align-items: center !important; gap: 10px !important; }
  .v2-sig-feature-icon { width: 18px !important; height: 18px !important; flex-shrink: 0 !important; color: rgba(245,240,235,0.6) !important; }
  .v2-sig-feature-label {
    font-family: var(--font-body) !important;
    font-size: 13px !important;
    letter-spacing: 0.06em !important;
    color: rgba(245,240,235,0.8) !important;
    line-height: 1.2 !important;
  }
  /* Price */
  .v2-sig-editorial-price { margin-bottom: 28px !important; }
  .v2-sig-editorial-price-amount {
    font-family: var(--font-heading) !important;
    font-size: clamp(24px, 2vw, 32px) !important;
    font-weight: 600 !important;
    color: #f5f0eb !important;
    line-height: 1.1 !important;
  }
  .v2-sig-editorial-price-note {
    font-family: var(--font-body) !important;
    font-size: 12px !important;
    color: rgba(245,240,235,0.5) !important;
    letter-spacing: 0.04em !important;
    margin-top: 6px !important;
  }
  /* CTAs — equal width, aligned */
  .v2-sig-editorial-actions {
    display: flex !important;
    gap: 16px !important;
    margin-bottom: 24px !important;
    max-width: 674px !important;
  }
  .v2-sig-btn-primary, .v2-sig-btn-outline {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 14px 32px !important;
    font-family: var(--font-body) !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    text-decoration: none !important;
    transition: all 0.3s ease !important;
    text-align: center !important;
    flex: 1 !important;
    min-height: 48px !important;
  }
  .v2-sig-btn-primary { background: #f5f0eb !important; color: #1a1714 !important; border: 1px solid #f5f0eb !important; }
  .v2-sig-btn-primary:hover { background: #e8e0d5 !important; border-color: #e8e0d5 !important; }
  .v2-sig-btn-outline { background: transparent !important; color: #f5f0eb !important; border: 1px solid rgba(245,240,235,0.4) !important; }
  .v2-sig-btn-outline:hover { border-color: #f5f0eb !important; }
  /* Past editions link */
  .v2-sig-editorial-past {
    font-family: var(--font-body) !important;
    font-size: 13px !important;
    color: rgba(245,240,235,0.5) !important;
    line-height: 1.4 !important;
  }
  .v2-sig-editorial-past a { color: rgba(245,240,235,0.8) !important; text-decoration: underline !important; text-underline-offset: 3px !important; }
  .v2-sig-editorial-past a:hover { color: rgba(245,240,235,1) !important; }
  /* Sculpture label (floating on image) — hidden in grid mode */
  .v2-sig-sculpture-label { display: none !important; }
  /* Trust badges removed */
  .v2-sig-trust { display: none !important; }
  /* Studio visit tab */
  .v2-sig-studio-tab { position: fixed; right: 0; top: 50%; transform: translateY(-50%); writing-mode: vertical-rl; text-orientation: mixed; background: #1a1714; color: #f5f0eb; padding: 20px 12px; font-family: var(--font-body); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; display: flex; align-items: center; gap: 10px; z-index: 50; transition: background 0.3s; }
  .v2-sig-studio-tab:hover { background: #2a2520; }
  .v2-sig-studio-tab svg { width: 16px; height: 16px; transform: rotate(-90deg); }
  /* Responsive */
  @media (max-width: 1024px) {
    .v2-sig-editorial-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .v2-sig-editorial-text { justify-content: flex-start !important; }
    .v2-sig-sculpture-label { display: block !important; left: 12px; }
  }
  @media (max-width: 768px) {
    .v2-atelier-title { padding: 0 16px 40px !important; }
    .v2-sig-editorial-grid { gap: 32px !important; }
    .v2-sig-editorial-thumbs { gap: 8px !important; }
    .v2-sig-editorial-features { gap: 12px 16px !important; }
    .v2-sig-editorial-actions { flex-direction: column !important; }
    .v2-sig-btn-primary, .v2-sig-btn-outline { min-height: 44px !important; width: 100% !important; }
    .v2-sig-studio-tab { display: none; }
    .v2-sig-sculpture-label { display: none; }
  }
`;

/* Check if viewport is mobile-sized */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

/* JSON body parsers for array-based CMS sections */
function parseTrustItems(body) {
  try {
    const parsed = JSON.parse(body || '{}')
    return parsed.items || [
      { icon: 'shield', text: 'Handcrafted in India' },
      { icon: 'check', text: 'Solid Timber, Never Veneer' },
      { icon: 'truck', text: 'White-Glove Delivery' },
      { icon: 'heart', text: 'Sustainably Sourced' },
    ]
  } catch { return [] }
}

function parseProductIds(body) {
  try {
    const parsed = JSON.parse(body || '{}')
    return parsed.productIds || []
  } catch { return [] }
}

function resolveProducts(ids) {
  return ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean)
}

const TRUST_ICONS = {
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>,
  truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
}

export default function HomeClient({ cms = {}, cmsKeys = new Set(), heroProduct = null, pageDesign = {} }) {
  const heroRef = useRef(null)
  const sigSectionRef = useRef(null)
  const carouselTrackRef = useRef(null)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const isMobile = useIsMobile()

  const hero = cms.hero || {}
  const philosophy = cms.philosophy || {}
  const signature = cms.signature || {}
  const craftsmanship = cms.craftsmanship || {}
  const workshopStory = cms['workshop-story'] || {}
  const processStory = cms['process-story'] || {}
  const trustBar = cms['trust-bar'] || {}
  const collectionCarousel = cms['collection-carousel'] || {}
  const productGrid = cms['product-grid'] || {}

  /* Resolve page design settings */
  const pd = resolvePageDesign(pageDesign, isMobile)

  /* Parse style overrides for each section */
  const heroOver = parseStyleOverrides(cms.hero?.styleOverrides)
  const philOver = parseStyleOverrides(cms.philosophy?.styleOverrides)
  const sigOver = parseStyleOverrides(cms.signature?.styleOverrides)
  const craftOver = parseStyleOverrides(cms.craftsmanship?.styleOverrides)
  const workshopOver = parseStyleOverrides(cms['workshop-story']?.styleOverrides)
  const processOver = parseStyleOverrides(cms['process-story']?.styleOverrides)
  const trustOver = parseStyleOverrides(cms['trust-bar']?.styleOverrides)
  const carouselOver = parseStyleOverrides(cms['collection-carousel']?.styleOverrides)
  const gridOver = parseStyleOverrides(cms['product-grid']?.styleOverrides)

  /* Parse section-level overrides for each section */
  const heroSectionOver = parseSectionOverrides(cms.hero?.sectionStyleOverrides)
  const philSectionOver = parseSectionOverrides(cms.philosophy?.sectionStyleOverrides)
  const sigSectionOver = parseSectionOverrides(cms.signature?.sectionStyleOverrides)
  const craftSectionOver = parseSectionOverrides(cms.craftsmanship?.sectionStyleOverrides)

  /* Resolve active variants */
  const heroVariant = resolveVariant('hero', cms.hero?.variant)
  const philVariant = resolveVariant('philosophy', cms.philosophy?.variant)
  const sigVariant = resolveVariant('signature', cms.signature?.variant)
  const craftVariant = resolveVariant('craftsmanship', cms.craftsmanship?.variant)

  /* Resolve section styles (section overrides > page design defaults) */
  const heroSectionStyle = resolveSectionStyle(heroSectionOver, pd, isMobile)
  const philSectionStyle = resolveSectionStyle(philSectionOver, pd, isMobile)
  const sigSectionStyle = resolveSectionStyle(sigSectionOver, pd, isMobile)
  const craftSectionStyle = resolveSectionStyle(craftSectionOver, pd, isMobile)

  const heroDisabled = cmsKeys.has('hero') && !cms.hero
  const philosophyDisabled = cmsKeys.has('philosophy') && !cms.philosophy
  const signatureDisabled = cmsKeys.has('signature') && !cms.signature
  const craftsmanshipDisabled = cmsKeys.has('craftsmanship') && !cms.craftsmanship
  const workshopDisabled = cmsKeys.has('workshop-story') && !cms['workshop-story']
  const processDisabled = cmsKeys.has('process-story') && !cms['process-story']
  const trustBarDisabled = cmsKeys.has('trust-bar') && !cms['trust-bar']
  const carouselDisabled = cmsKeys.has('collection-carousel') && !cms['collection-carousel']
  const productGridDisabled = cmsKeys.has('product-grid') && !cms['product-grid']

  /* Inject critical CSS for Atelier Stories (bypasses build-time stripping) */
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = atelierCriticalCSS
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  /* Editorial carousel */
  useEffect(() => {
    const track = carouselTrackRef.current
    if (!track) return

    const prev = track.parentElement.querySelector('.v2-cprev')
    const next = track.parentElement.querySelector('.v2-cnext')
    const items = track.querySelectorAll('.v2-citem')
    const dots = track.parentElement.querySelectorAll('.v2cdot')
    if (!items.length) return

    let idx = 0, hovered = false, userPause = false, pauseTimer = null

    function updateDots(i) {
      dots.forEach((d, j) => { d.classList.toggle('active', j === i) })
    }

    function go(i) {
      const w = items[0].offsetWidth + 32
      track.scrollTo({ left: i * w, behavior: 'smooth' })
      idx = i
      updateDots(i)
    }

    function tick() {
      if (hovered || userPause) return
      idx = idx >= items.length - 1 ? 0 : idx + 1
      go(idx)
    }

    function userInteract() {
      userPause = true
      clearTimeout(pauseTimer)
      pauseTimer = setTimeout(() => { userPause = false }, 14000)
    }

    const timer = setInterval(tick, 8000)

    track.addEventListener('mouseenter', () => { hovered = true })
    track.addEventListener('mouseleave', () => { hovered = false })

    const onPrev = () => { userInteract(); go(idx <= 0 ? items.length - 1 : idx - 1) }
    const onNext = () => { userInteract(); go(idx >= items.length - 1 ? 0 : idx + 1) }
    if (prev) prev.addEventListener('click', onPrev)
    if (next) next.addEventListener('click', onNext)

    let sx = 0, dragging = false
    const ts = (e) => { sx = e.touches[0].clientX; dragging = true }
    const tm = (e) => { if (dragging && Math.abs(sx - e.touches[0].clientX) > 5) e.preventDefault() }
    const te = (e) => {
      if (!dragging) return; dragging = false
      userInteract()
      const d = sx - e.changedTouches[0].clientX
      if (d > 50) go(Math.min(idx + 1, items.length - 1))
      else if (d < -50) go(Math.max(idx - 1, 0))
    }

    track.addEventListener('touchstart', ts)
    track.addEventListener('touchmove', tm, { passive: false })
    track.addEventListener('touchend', te)

    function onScroll() {
      const w = items[0].offsetWidth + 32
      const si = Math.round(track.scrollLeft / w)
      if (si !== idx && si >= 0 && si < items.length) {
        idx = si
        updateDots(idx)
      }
    }
    track.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      clearInterval(timer)
      clearTimeout(pauseTimer)
      if (prev) prev.removeEventListener('click', onPrev)
      if (next) next.removeEventListener('click', onNext)
      track.removeEventListener('touchstart', ts)
      track.removeEventListener('touchmove', tm)
      track.removeEventListener('touchend', te)
      track.removeEventListener('scroll', onScroll)
    }
  }, [])

  const sigImages = heroProduct?.images || []
  const sigThumbs = heroProduct?.thumbnails || sigImages
  const hasGallery = sigImages.length > 1

  const sigPrev = useCallback(() => {
    setGalleryIdx(i => (i <= 0 ? sigImages.length - 1 : i - 1))
  }, [sigImages.length])

  const sigNext = useCallback(() => {
    setGalleryIdx(i => (i >= sigImages.length - 1 ? 0 : i + 1))
  }, [sigImages.length])

  return (
    <div>
      {/* 1. Hero */}
      {!heroDisabled && (
        <section
          className={`v2-hero ${getVariantClass('v2-hero', heroVariant?.id)}`}
          ref={heroRef}
          style={{
            ...(heroSectionStyle.paddingTop ? { paddingTop: heroSectionStyle.paddingTop } : {}),
            ...(heroSectionStyle.paddingBottom ? { paddingBottom: heroSectionStyle.paddingBottom } : {}),
          }}
        >
          {heroVariant?.id === 'split' ? (
            /* Split variant: image on one side, text on the other */
            <div className="v2-hero-split">
              <div className="v2-hero-split-text">
                <span className="eyebrow eyebrow-light v2-hero-eyebrow" style={resolveTypography('eyebrow', {}, heroOver, isMobile)}>{hero.eyebrow || 'An Indian Workshop'}</span>
                <h1 style={resolveTypography('title', {}, heroOver, isMobile)}>{(hero.title || 'Where wood becomes<br />timeless art.').split('<br').length > 1
                  ? <>{hero.title?.split('<br />')[0] || 'Where wood becomes'}<br />{hero.title?.split('<br />')[1] || 'timeless art.'}</>
                  : hero.title || <>{'Where wood becomes'}<br />{'timeless art.'}</>
                }</h1>
                <div className="v2-hero-actions">
                  <Link href={hero.buttonUrl || '/gallery'} className="btn-primary" style={resolveTypography('button', {}, heroOver, isMobile)}>{hero.buttonLabel || 'View the Collection'}</Link>
                  <Link href="/studio" className="link-quiet">Our Studio</Link>
                </div>
              </div>
              <div className="v2-hero-split-image">
                <img src={hero.image || '/assets/hero-luxury-entryway.png'} alt="A woodworker's hands finishing the grain of a solid timber surface in natural light." width="1200" height="800" fetchPriority="high" style={{ ...resolveElementStyle('image', {}, heroOver, isMobile), objectPosition: focalPointToObjectPosition(resolveFocalPoint(heroOver, 'image', isMobile)) }} />
              </div>
            </div>
          ) : heroVariant?.id === 'minimal' ? (
            /* Minimal variant: text-focused, no image */
            <div className="v2-hero-minimal">
              <span className="eyebrow eyebrow-light v2-hero-eyebrow" style={resolveTypography('eyebrow', {}, heroOver, isMobile)}>{hero.eyebrow || 'An Indian Workshop'}</span>
              <h1 style={resolveTypography('title', {}, heroOver, isMobile)}>{(hero.title || 'Where wood becomes<br />timeless art.').split('<br').length > 1
                ? <>{hero.title?.split('<br />')[0] || 'Where wood becomes'}<br />{hero.title?.split('<br />')[1] || 'timeless art.'}</>
                : hero.title || <>{'Where wood becomes'}<br />{'timeless art.'}</>
              }</h1>
              <div className="v2-hero-actions">
                <Link href={hero.buttonUrl || '/gallery'} className="btn-primary" style={resolveTypography('button', {}, heroOver, isMobile)}>{hero.buttonLabel || 'View the Collection'}</Link>
                <Link href="/studio" className="link-quiet">Our Studio</Link>
              </div>
            </div>
          ) : (
            /* Full variant (default): full-width background image with text overlay */
            <>
              <picture>
                <source srcSet="/assets/hero-luxury-entryway.avif" type="image/avif" />
                <source srcSet="/assets/hero-luxury-entryway.webp" type="image/webp" />
                <img className="v2-hero-img" src={hero.image || '/assets/hero-luxury-entryway.png'} alt="A woodworker's hands finishing the grain of a solid timber surface in natural light." width="1200" height="800" fetchPriority="high" style={{ ...resolveElementStyle('image', {}, heroOver, isMobile), objectPosition: focalPointToObjectPosition(resolveFocalPoint(heroOver, 'image', isMobile)) }} />
              </picture>
              <div className="v2-hero-content">
                <span className="eyebrow eyebrow-light v2-hero-eyebrow" style={resolveTypography('eyebrow', {}, heroOver, isMobile)}>{hero.eyebrow || 'An Indian Workshop'}</span>
                <h1 style={resolveTypography('title', {}, heroOver, isMobile)}>{(hero.title || 'Where wood becomes<br />timeless art.').split('<br').length > 1
                  ? <>{hero.title?.split('<br />')[0] || 'Where wood becomes'}<br />{hero.title?.split('<br />')[1] || 'timeless art.'}</>
                  : hero.title || <>{'Where wood becomes'}<br />{'timeless art.'}</>
                }</h1>
                <div className="v2-hero-actions">
                  <Link href={hero.buttonUrl || '/gallery'} className="btn-primary" style={resolveTypography('button', {}, heroOver, isMobile)}>{hero.buttonLabel || 'View the Collection'}</Link>
                  <Link href="/studio" className="link-quiet">Our Studio</Link>
                </div>
              </div>
              <a href="#philosophy" className="v2-scroll" aria-label="Scroll to explore">
                <span>Scroll</span>
                <span className="v2-scroll-line"></span>
              </a>
            </>
          )}
        </section>
      )}

      {/* 2. Trust Bar */}
      {!trustBarDisabled && (
        <section className="v2-trust">
          <div className="container">
            <div className="v2-trust-inner">
              {parseTrustItems(trustBar.body).map((item, i) => (
                <div key={i} className="v2-trust-item">
                  {TRUST_ICONS[item.icon] || TRUST_ICONS.shield}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Philosophy */}
      {!philosophyDisabled && (
        <section
          className={`v2-philosophy ${getVariantClass('v2-philosophy', philVariant?.id)}`}
          id="philosophy"
          style={{
            ...(philSectionStyle.contentWidth ? { maxWidth: philSectionStyle.contentWidth, margin: '0 auto' } : {}),
            ...(philSectionStyle.paddingTop ? { paddingTop: philSectionStyle.paddingTop } : {}),
            ...(philSectionStyle.paddingBottom ? { paddingBottom: philSectionStyle.paddingBottom } : {}),
          }}
        >
          <div className="v2-philosophy-inner">
            <span className="eyebrow" style={resolveTypography('eyebrow', {}, philOver, isMobile)}>{philosophy.eyebrow || 'Why We Exist'}</span>
            <h2 style={resolveTypography('title', {}, philOver, isMobile)}>{philosophy.title || 'We make objects that are not finished when they leave the workshop.'}</h2>
            {(philosophy.body || 'A piece of solid teak keeps changing long after it reaches your home \u2014 the grain deepens, the surface catches light differently with each year of use. We build for that slow change, not against it.\n\nThis is a small family workshop in India, run by the same hands for three generations. We make fewer things, more carefully, and we are in no hurry to make more.').split('\n\n').map((p, i) => (
              <p key={i} style={resolveTypography('body', {}, philOver, isMobile)}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* 4. Signature Edition */}
      {!signatureDisabled && (
        <div className="v2-atelier-wrapper">
          <div className="v2-atelier-title">
            <h2>ATELIER STORIES</h2>
            <span className="v2-atelier-subtitle">ONE OF ONE - SIGNATURE PIECES</span>
          </div>
          <section
            className={`v2-sig-editorial ${getVariantClass('v2-sig-editorial', sigVariant?.id)}`}
            ref={sigSectionRef}
            style={{
              ...(sigSectionStyle.paddingTop ? { paddingTop: sigSectionStyle.paddingTop } : {}),
              ...(sigSectionStyle.paddingBottom ? { paddingBottom: sigSectionStyle.paddingBottom } : {}),
            }}
          >
            <div className="v2-sig-editorial-inner">
              <div className="v2-sig-editorial-grid">
                {/* Left: Product media */}
                <div className="v2-sig-editorial-img" style={{ gridColumn: 1 }}>
                  <div className="v2-sig-sculpture-label">
                    <span className="v2-sig-sculpture-label-title">Teak Wood<br/>Sculpture</span>
                    <span className="v2-sig-sculpture-label-line"></span>
                    <span className="v2-sig-sculpture-label-desc">Handcrafted from a<br/>solid block of premium<br/>teak wood.</span>
                  </div>
                  <img
                    src={sigImages[galleryIdx] || heroProduct?.images?.[0] || signature.image || 'https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                    alt={`${heroProduct?.name || 'Teakle furniture'}, handcrafted teak dining table`}
                    width="960" height="1200" loading="lazy"
                    style={resolveElementStyle('image', {}, sigOver, isMobile)}
                  />
                  {hasGallery && (
                    <div className="v2-sig-editorial-gallery">
                      <div className="v2-sig-editorial-thumbs" role="radiogroup" aria-label="Product images">
                        {sigThumbs.map((thumb, i) => (
                          <button key={i} className={`v2-sig-editorial-thumb${i === galleryIdx ? ' is-active' : ''}`} onClick={() => setGalleryIdx(i)} aria-label={`View image ${i + 1}`} role="radio" aria-checked={i === galleryIdx}>
                            <img src={thumb} alt="" width="72" height="72" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Product information */}
                <div className="v2-sig-editorial-text">
                  <h2 style={resolveTypography('title', {}, sigOver, isMobile)}>THE MAFDET.</h2>
                  <div className="v2-sig-editorial-subtitle">Solid Teak, Timeless Form.</div>
                  <p>{heroProduct?.shortDescription ? `${heroProduct.shortDescription} Never restocked. Never repeated.` : signature.body || 'One sculptural centrepiece, carved from a single reclaimed timber block. It is never restocked and never discounted \u2014 once it\u2019s gone, the next edition begins.'}</p>

                  {/* Metadata with icons */}
                  <div className="v2-sig-editorial-features">
                    <div className="v2-sig-feature">
                      <svg className="v2-sig-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      <span className="v2-sig-feature-label">{heroProduct?.buildTime || '~18 Hours'}</span>
                    </div>
                    <div className="v2-sig-feature">
                      <svg className="v2-sig-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className="v2-sig-feature-label">Master Crafted</span>
                    </div>
                    <div className="v2-sig-feature">
                      <svg className="v2-sig-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                      <span className="v2-sig-feature-label">{heroProduct?.material || 'Solid Teak'}</span>
                    </div>
                    <div className="v2-sig-feature">
                      <svg className="v2-sig-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                      <span className="v2-sig-feature-label">One of One</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="v2-sig-editorial-price">
                    <div className="v2-sig-editorial-price-amount">{heroProduct?.priceFormatted || '\u20B91,85,000'}</div>
                    <div className="v2-sig-editorial-price-note">One of One &middot; Never to be recreated</div>
                  </div>

                  {/* CTAs */}
                  <div className="v2-sig-editorial-actions">
                    <Link href={`/shop/${heroProduct?.id || 'anchor-table'}`} className="v2-sig-btn-primary">INQUIRE TO OWN</Link>
                    <Link href={`/process/${heroProduct?.id || 'anchor-table'}`} className="v2-sig-btn-outline">WATCH THE PROCESS</Link>
                  </div>

                  <p className="v2-sig-editorial-past">Looking for something from a past season? <Link href="/archive">See past editions</Link></p>
                </div>
              </div>
            </div>

            {/* Studio Visit vertical tab */}
            <a href="/studio" className="v2-sig-studio-tab" aria-label="Book a studio visit">
              Book a Studio Visit
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </a>
          </section>
        </div>
      )}

      {/* 5. Craftsmanship */}
      {!craftsmanshipDisabled && (
        <section
          className={`v2-craft ${getVariantClass('v2-craft', craftVariant?.id)}`}
          style={{
            ...(craftSectionStyle.contentWidth ? { maxWidth: craftSectionStyle.contentWidth, margin: '0 auto' } : {}),
            ...(craftSectionStyle.paddingTop ? { paddingTop: craftSectionStyle.paddingTop } : {}),
            ...(craftSectionStyle.paddingBottom ? { paddingBottom: craftSectionStyle.paddingBottom } : {}),
          }}
        >
          <div className="v2-craft-grid">
            <div className="v2-craft-img">
              <img src={craftsmanship.image || 'https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=1200'} alt="Close-up of hand-cut joinery on a solid teak furniture piece." width="1200" height="1500" loading="lazy" style={{ ...resolveElementStyle('image', {}, craftOver, isMobile), objectPosition: focalPointToObjectPosition(resolveFocalPoint(craftOver, 'image', isMobile)) }} />
            </div>
            <div className="v2-craft-text">
              <span className="eyebrow" style={resolveTypography('eyebrow', {}, craftOver, isMobile)}>{craftsmanship.eyebrow || 'Craftsmanship'}</span>
              <h2 style={resolveTypography('title', {}, craftOver, isMobile)}>{craftsmanship.title || 'Every piece passes through one pair of hands, start to finish.'}</h2>
              {(craftsmanship.body || 'We work in solid timber, never veneer or particleboard. A single block is selected, dried, and left to settle before a tool ever touches it \u2014 rushing this step is the most common way a piece fails early.\n\nJoints are cut by hand and fitted dry before any finish is applied. The oil we use is food-safe and reapplied over the piece\u2019s life, not sealed under lacquer that traps moisture and cracks.').split('\n\n').map((p, i) => (
                <p key={i} style={resolveTypography('body', {}, craftOver, isMobile)}>{p}</p>
              ))}
              <Link href={craftsmanship.buttonUrl || '/studio'} className="link-quiet">{craftsmanship.buttonLabel || 'Visit the Studio'}</Link>
            </div>
          </div>
        </section>
      )}

      {/* 6. Collection Carousel */}
      {!carouselDisabled && (() => {
        const carouselIds = parseProductIds(collectionCarousel.body)
        const carouselProducts = resolveProducts(carouselIds)
        return carouselProducts.length > 0 && (
          <section className="v2-carousel">
            <button className="v2-cprev" aria-label="Previous">&#8592;</button>
            <button className="v2-cnext" aria-label="Next">&#8594;</button>
            <div className="v2-ctrack" ref={carouselTrackRef}>
              {carouselProducts.map((p) => (
                <Link key={p.id} href={`/shop/${p.id}`} className="v2-citem">
                  <div className="v2-cimage"><img src={p.images?.[0] || ''} alt={p.name} loading="lazy" width="600" height="400" /></div>
                  <span className="v2-clabel">{p.name}</span>
                  <span className="v2-cbtn">Discover</span>
                </Link>
              ))}
            </div>
            <div className="v2-cdots">
              {carouselProducts.map((_, i) => (
                <span key={i} className={`v2cdot${i === 0 ? ' active' : ''}`}></span>
              ))}
            </div>
          </section>
        )
      })()}

      {/* 7. Product Grid */}
      {!productGridDisabled && (() => {
        const gridIds = parseProductIds(productGrid.body)
        const gridProducts = resolveProducts(gridIds)
        return gridProducts.length > 0 && (
          <section className="v2-products">
            <div className="container">
              <div className="v2-products-head">
                <span className="eyebrow">{productGrid.eyebrow || 'From the Collection'}</span>
                <h2>{productGrid.title || 'Pieces Built to Last'}</h2>
              </div>
              <div className="v2-pgrid">
                {gridProducts.map((p) => (
                  <Link key={p.id} href={`/shop/${p.id}`} className="v2-pcard">
                    <div className="v2-pimg"><img src={p.images?.[0] || ''} alt={p.name} loading="lazy" width="600" height="400" /></div>
                    <div className="v2-pinfo">
                      <div>
                        <h3>{p.name}</h3>
                        <div className="v2-pmeta">
                          <span className="v2-pcat">{p.categoryName || p.category}</span>
                          <span className="v2-pprice">{p.priceFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="v2-pcta">
                <Link href={productGrid.buttonUrl || '/gallery'} className="btn-primary">{productGrid.buttonLabel || 'Explore the Full Collection'}</Link>
              </div>
            </div>
          </section>
        )
      })()}

      {/* 8. Story Block - Workshop */}
      {!workshopDisabled && (
        <section className="v2-lifestyle">
          <img className="v2-lifestyle-bg" src={workshopStory.image || 'https://images.pexels.com/photos/5974417/pexels-photo-5974417.jpeg?auto=compress&cs=tinysrgb&w=1600'} alt="A craftsman's weathered hands sanding a wooden surface in the workshop." width="1600" height="1067" loading="lazy" style={{ ...resolveElementStyle('image', {}, workshopOver, isMobile), objectPosition: focalPointToObjectPosition(resolveFocalPoint(workshopOver, 'image', isMobile)) }} />
          <div className="v2-lifestyle-content">
            <span className="eyebrow eyebrow-light" style={resolveTypography('eyebrow', {}, workshopOver, isMobile)}>{workshopStory.eyebrow || 'The Workshop'}</span>
            <h2 style={resolveTypography('title', {}, workshopOver, isMobile)}>{workshopStory.title || 'A family workshop, unchanged in method for three generations.'}</h2>
            <p style={resolveTypography('body', {}, workshopOver, isMobile)}>{workshopStory.body || 'The tools are old. The hands are patient. Nothing here is made to a deadline \u2014 a piece is finished when it is ready, and not before.'}</p>
            <Link href={workshopStory.buttonUrl || '/studio'} className="link-quiet" style={resolveTypography('button', {}, workshopOver, isMobile)}>{workshopStory.buttonLabel || 'Read About Our Process'}</Link>
          </div>
        </section>
      )}

      {/* 9. Story Block - Watch It Made */}
      {!processDisabled && (
        <section className="v2-lifestyle">
          <img className="v2-lifestyle-bg" src={processStory.image || 'https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1600'} alt="Timber being shaped by hand, filmed for a process video." width="1600" height="1067" loading="lazy" style={{ ...resolveElementStyle('image', {}, processOver, isMobile), objectPosition: focalPointToObjectPosition(resolveFocalPoint(processOver, 'image', isMobile)) }} />
          <div className="v2-lifestyle-content">
            <span className="eyebrow eyebrow-light" style={resolveTypography('eyebrow', {}, processOver, isMobile)}>{processStory.eyebrow || 'Watch It Made'}</span>
            <h2 style={resolveTypography('title', {}, processOver, isMobile)}>{processStory.title || 'Every piece is documented from timber to finish.'}</h2>
            <p style={resolveTypography('body', {}, processOver, isMobile)}>{processStory.body || 'We don\u2019t ask you to imagine the process \u2014 we film it. Wood selection, joinery, finishing, and the hours each one takes, so you know exactly what you\u2019re buying before you buy it.'}</p>
            <Link href={`/process/${heroProduct?.id || 'anchor-table'}`} className="link-quiet" style={resolveTypography('button', {}, processOver, isMobile)}>{processStory.buttonLabel || 'Watch the Process'}</Link>
          </div>
        </section>
      )}

    </div>
  )
}

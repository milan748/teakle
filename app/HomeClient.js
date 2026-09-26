'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { PRODUCTS } from './data/products'
import { resolvePageDesign, resolveVariant, parseStyleOverrides, parseSectionOverrides, resolveSectionStyle, resolveElementStyle, resolveTypography, getVariantClass, resolveFocalPoint, focalPointToObjectPosition, hasExplicitFocal } from '@/lib/designResolution'
import RevealOnMount from './components/RevealOnMount'
import './homepage.css'

/* Critical CSS for Atelier Stories — object-study editorial (single-product gallery only) */
const atelierCriticalCSS = `
  .v2-atelier-wrapper { background: var(--cin-dark-deep) !important; padding: clamp(4rem, 8vw, 7rem) var(--cin-gutter-wide) !important; }
  .v2-atelier-title { max-width: var(--container-wide); margin: 0 auto; padding: 0 0 3.5rem !important; text-align: left !important; }
  .v2-atelier-title h2 { font-size: var(--cin-display) !important; font-weight: 400 !important; letter-spacing: 0.24em !important; text-transform: uppercase !important; color: var(--cin-white) !important; margin: 0 0 0.75rem !important; line-height: var(--lh-display) !important; }
  .v2-atelier-subtitle { display: block !important; font-size: var(--cin-caption) !important; font-weight: 400 !important; font-style: italic !important; letter-spacing: 0.14em !important; text-transform: uppercase !important; color: var(--cin-bronze-light) !important; margin-top: 6px !important; margin-bottom: 0 !important; line-height: var(--lh-tight) !important; }
  .v2-atelier-title::after { content: "" !important; display: block !important; height: 1px !important; background: rgba(245,240,235,0.2) !important; margin-top: 2.5rem !important; }
  .v2-sig-editorial { background: transparent !important; padding: 0 0 1rem !important; overflow: visible !important; }
  .v2-sig-editorial-grid { display: grid !important; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr) !important; gap: clamp(2.5rem, 5vw, 5rem) !important; align-items: start !important; justify-items: start !important; max-width: var(--container-wide) !important; margin: 0 auto !important; }
  .v2-sig-mobile-head { display: none !important; }
  .v2-sig-editorial-img { width: 100% !important; display: flex !important; flex-direction: column !important; gap: 16px !important; min-width: 0 !important; }
  .v2-sig-editorial-img > img { width: 100% !important; aspect-ratio: 3/2 !important; object-fit: cover !important; object-position: 50% 100% !important; display: block !important; border-radius: 0 !important; box-shadow: none !important; transition: transform 1.2s var(--ease-luxury) !important; }
  .v2-sig-editorial-img:hover > img { transform: scale(1.02) !important; }
  .v2-sig-editorial-supporting { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 12px !important; margin-top: 4px !important; }
  .v2-sig-editorial-thumb { aspect-ratio: 1/1 !important; border: 2px solid transparent !important; background: none !important; cursor: pointer !important; overflow: hidden !important; opacity: 0.5 !important; transition: opacity 0.2s, border-color 0.2s !important; padding: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
  .v2-sig-editorial-thumb.is-active { border-color: #f5f0eb !important; opacity: 1 !important; }
  .v2-sig-editorial-thumb:hover { opacity: 0.8 !important; }
  .v2-sig-editorial-thumb img { width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important; }
  .v2-sig-story-note { margin-top: 12px !important; padding-top: 20px !important; border-top: 1px solid rgba(245,240,235,0.22) !important; }
  .v2-sig-story-label { display: block !important; font-family: var(--font-body) !important; font-size: var(--cin-label) !important; letter-spacing: 0.14em !important; text-transform: uppercase !important; color: var(--cin-bronze-light) !important; line-height: var(--lh-tight) !important; margin-bottom: 10px !important; }
  .v2-sig-story-note p { font-family: var(--font-body) !important; font-size: var(--cin-body) !important; line-height: var(--lh-body) !important; color: rgba(245,240,235,0.65) !important; margin: 0 !important; max-width: 62ch !important; }
  .v2-sig-editorial-text { width: auto !important; padding: clamp(4px, 1.5vw, 28px) 0 0 !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; min-width: 0 !important; }
  .v2-sig-editorial-text h2 { font-family: var(--font-display) !important; font-size: var(--cin-display-sm) !important; font-weight: 500 !important; letter-spacing: 0.18em !important; color: var(--cin-white) !important; margin: 0 0 12px !important; text-transform: uppercase !important; line-height: var(--lh-display) !important; }
  .v2-sig-edition-line { display: block !important; font-family: var(--font-body) !important; font-size: var(--cin-caption) !important; font-weight: 500 !important; letter-spacing: 0.22em !important; text-transform: uppercase !important; color: var(--cin-bronze-light) !important; margin: 0 0 14px !important; line-height: var(--lh-tight) !important; }
  .v2-sig-editorial-text > p { font-family: var(--font-body) !important; font-size: var(--cin-body-lg) !important; line-height: var(--lh-body) !important; color: rgba(245,240,235,0.65) !important; margin: 0 0 24px !important; max-width: 674px !important; }
  .v2-sig-editorial-features { display: flex !important; flex-wrap: wrap !important; row-gap: 8px !important; margin-bottom: 28px !important; padding: 14px 0 !important; border-top: 1px solid rgba(245,240,235,0.22) !important; border-bottom: 1px solid rgba(245,240,235,0.22) !important; }
  .v2-sig-feature { display: flex !important; align-items: baseline !important; gap: 0 !important; }
  .v2-sig-feature-icon { display: none !important; }
  .v2-sig-feature + .v2-sig-feature::before { content: "·" !important; color: rgba(245,240,235,0.45) !important; margin: 0 12px !important; }
  .v2-sig-feature-label { font-family: var(--font-body) !important; font-size: var(--cin-label) !important; letter-spacing: 0.14em !important; text-transform: uppercase !important; color: rgba(245,240,235,0.8) !important; line-height: var(--lh-tight) !important; }
  .v2-sig-editorial-price { margin-bottom: 28px !important; }
  .v2-sig-editorial-price-amount { font-family: var(--font-display) !important; font-size: var(--cin-h2) !important; font-weight: 500 !important; color: var(--cin-white) !important; line-height: var(--lh-heading) !important; }
  .v2-sig-editorial-price-note { font-family: var(--font-body) !important; font-size: var(--cin-caption) !important; color: rgba(245,240,235,0.5) !important; letter-spacing: 0.04em !important; margin-top: 6px !important; line-height: var(--lh-tight) !important; }
  .v2-sig-editorial-actions { display: flex !important; flex-wrap: wrap !important; align-items: center !important; gap: 12px 28px !important; margin-bottom: 24px !important; max-width: 674px !important; }
  .v2-sig-btn-primary, .v2-sig-btn-outline { display: inline-flex !important; align-items: center !important; justify-content: center !important; padding: 14px 34px !important; font-family: var(--font-body) !important; font-size: var(--cin-caption) !important; font-weight: 600 !important; letter-spacing: 0.14em !important; text-transform: uppercase !important; text-decoration: none !important; transition: all 0.3s ease !important; text-align: center !important; flex: 0 1 auto !important; min-width: 220px !important; min-height: 48px !important; border-radius: 0 !important; box-shadow: none !important; }
  .v2-sig-btn-primary { background: #f5f0eb !important; color: #1a1714 !important; border: 1px solid #f5f0eb !important; }
  .v2-sig-btn-primary:hover { background: #e8e0d5 !important; border-color: #e8e0d5 !important; }
  .v2-sig-btn-outline { background: transparent !important; color: #f5f0eb !important; border: 1px solid rgba(245,240,235,0.4) !important; }
  .v2-sig-btn-outline:hover { border-color: #f5f0eb !important; }
  .v2-sig-editorial-past { font-family: var(--font-body) !important; font-size: var(--cin-body) !important; color: rgba(245,240,235,0.5) !important; line-height: var(--lh-body) !important; }
  .v2-sig-editorial-past a { color: rgba(245,240,235,0.8) !important; text-decoration: underline !important; text-underline-offset: 3px !important; }
  .v2-sig-editorial-past a:hover { color: rgba(245,240,235,1) !important; }
  .v2-sig-archive-foot { max-width: var(--container-wide) !important; margin: 2.5rem auto 0 !important; padding-top: 20px !important; border-top: 1px solid rgba(245,240,235,0.22) !important; display: flex !important; flex-wrap: wrap !important; gap: 8px 16px !important; align-items: baseline !important; }
  .v2-sig-archive-label { font-family: var(--font-body) !important; font-size: var(--cin-label) !important; letter-spacing: 0.14em !important; text-transform: uppercase !important; color: var(--cin-bronze-light) !important; line-height: var(--lh-tight) !important; }
  .v2-sig-archive-link { font-family: var(--font-body) !important; font-size: var(--cin-body) !important; color: rgba(245,240,235,0.8) !important; text-decoration: underline !important; text-underline-offset: 3px !important; line-height: var(--lh-body) !important; }
  .v2-sig-wishlist { display: inline-flex !important; align-items: center !important; align-self: flex-start !important; gap: 10px !important; background: transparent !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; padding: 12px 0 !important; margin: 0 0 20px !important; min-height: 44px !important; font-family: var(--font-body) !important; font-size: var(--cin-label) !important; font-weight: 500 !important; letter-spacing: 0.14em !important; text-transform: uppercase !important; color: rgba(245,240,235,0.65) !important; text-decoration: underline !important; text-underline-offset: 4px !important; text-decoration-color: rgba(245,240,235,0.35) !important; cursor: pointer !important; }
  .v2-sig-wishlist:hover { color: #f5f0eb !important; text-decoration-color: #f5f0eb !important; }
  .v2-sig-wishlist svg { width: 14px !important; height: 14px !important; flex-shrink: 0 !important; }
  .v2-sig-wishlist.is-active svg { fill: currentColor !important; }
  .v2-sig-studio-tab { display: none !important; }
  @media (max-width: 860px) {
    .v2-sig-editorial-grid { grid-template-columns: 1fr !important; gap: var(--space-sm) !important; }
    .v2-sig-mobile-head { display: block !important; max-width: var(--container-wide) !important; margin: 0 auto 16px !important; }
    .v2-sig-mobile-head h2 { font-family: var(--font-display) !important; font-size: var(--cin-display-sm) !important; font-weight: 500 !important; letter-spacing: 0.18em !important; text-transform: uppercase !important; color: var(--cin-white) !important; margin: 0 0 8px !important; line-height: var(--lh-heading) !important; }
    .v2-sig-title-desktop { display: none !important; }
    .v2-sig-edition-line-desktop { display: none !important; }
    .v2-sig-editorial-img > img { aspect-ratio: 3/2 !important; }
    .v2-sig-editorial-supporting { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
    .v2-sig-story-note { margin-top: 4px !important; padding-top: 16px !important; }
    .v2-sig-story-note p { max-width: 60ch !important; }
    .v2-sig-editorial-text { padding: var(--space-sm) !important; }
    .v2-sig-editorial-text > p { font-size: var(--cin-body) !important; max-width: 50ch !important; margin-bottom: var(--space-sm) !important; line-height: var(--lh-body) !important; }
    .v2-sig-editorial-features { display: flex !important; flex-wrap: wrap !important; row-gap: 8px !important; margin-bottom: var(--space-sm) !important; padding: 12px 0 !important; }
    .v2-sig-feature-icon { display: none !important; }
    .v2-sig-editorial-actions { flex-direction: column !important; align-items: stretch !important; gap: var(--space-sm) !important; margin-bottom: var(--space-md) !important; }
    .v2-sig-editorial-actions .v2-sig-btn-primary, .v2-sig-editorial-actions .v2-sig-btn-outline { text-align: center !important; padding: var(--space-sm) var(--space-lg) !important; font-size: var(--cin-button) !important; min-height: 44px !important; display: flex !important; align-items: center !important; justify-content: center !important; width: 100% !important; }
    .v2-sig-archive-foot { margin-top: 20px !important; }
    .v2-sig-sculpture-label { display: none !important; }
    .v2-sig-studio-tab { display: none !important; }
  }
  @media (max-width: 768px) {
    .v2-sig-editorial-text { padding: 0 var(--space-md) !important; }
    .v2-sig-editorial-actions { flex-direction: column !important; align-items: stretch !important; gap: var(--space-sm) !important; }
    .v2-sig-editorial-actions .v2-sig-btn-primary, .v2-sig-editorial-actions .v2-sig-btn-outline { width: 100% !important; }
    .v2-sig-sculpture-label { display: none !important; }
    .v2-sig-studio-tab { display: none !important; }
  }
  @media (max-width: 560px) {
    .v2-sig-wishlist { align-self: flex-start !important; min-height: 44px !important; }
    .v2-sig-editorial-features { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: var(--space-2xs) var(--space-xs) !important; }
    .v2-sig-feature + .v2-sig-feature::before { display: none !important; }
    .v2-sig-editorial-actions .btn-primary, .v2-sig-editorial-actions .link-quiet { font-size: var(--cin-button) !important; padding: var(--space-xs) var(--space-sm) !important; min-height: 44px !important; display: flex !important; align-items: center !important; justify-content: center !important; flex: 1 !important; }
  }
`

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
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>,
  truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
}

export default function HomeClient({ cms = {}, cmsKeys = new Set(), heroProduct = null, pageDesign = {} }) {
  const heroRef = useRef(null)
  const sigSectionRef = useRef(null)
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

  /* T04: homepage product presentation is a static two-group editorial
     layout (3 + 3). No carousel behavior remains here. */

  const sigImages = heroProduct?.images || []
  const sigThumbs = heroProduct?.thumbnails || sigImages
  /* Object-study strip: SAME featured product only. Every entry is an
     authentic heroProduct view; show all 4 thumbnails so user can switch
     between views. Workshop, maker, process, and unrelated product
     imagery never enters this list — those stories live in the dedicated
     craftsmanship / process sections further down the homepage. */
  const sigPrimarySrc = sigImages[galleryIdx] || heroProduct?.images?.[0]
  /* Thumbnails carry different size params for the same photo, so compare
     by photo identity (Pexels photo id, else URL without query). */
  const sigPhotoKey = (u) => {
    const m = String(u || '').match(/photos\/(\d+)\//)
    return m ? m[1] : String(u || '').split('?')[0]
  }
  const sigPrimaryKey = sigPhotoKey(sigPrimarySrc)
  const sigSupporting = sigThumbs.map((t, i) => ({
    src: t,
    idx: sigImages.findIndex((s) => sigPhotoKey(s) === sigPhotoKey(t))
  }))

  /* Featured-product wishlist — same store API as the product page */
  const [sigWishlisted, setSigWishlisted] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !heroProduct) return
    try {
      if (window.Teakle && window.Teakle.isInWishlist) {
        setSigWishlisted(window.Teakle.isInWishlist(heroProduct.id))
      }
    } catch {}
  }, [heroProduct])
  const handleSigWishlist = useCallback(() => {
    if (!heroProduct || typeof window === 'undefined') return
    if (window.Teakle && window.Teakle.requireAuth && !window.Teakle.requireAuth()) return
    if (window.Teakle && window.Teakle.toggleWishlist) {
      const result = window.Teakle.toggleWishlist({
        id: heroProduct.id,
        name: heroProduct.name,
        price: heroProduct.priceFormatted,
        image: heroProduct.images?.[0],
      })
      setSigWishlisted(!!result.added)
    }
  }, [heroProduct])

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
                <img src={hero.image || '/assets/hero-luxury-entryway.png'} alt="Warmly lit entryway with dark timber furniture, sculptural wood decor and soft directional light." width="1200" height="800" fetchPriority="high" style={{ ...resolveElementStyle('image', {}, heroOver, isMobile), ...(hasExplicitFocal(heroOver, 'image', isMobile) ? { objectPosition: focalPointToObjectPosition(resolveFocalPoint(heroOver, 'image', isMobile)) } : {}) }} />
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
                <img className="v2-hero-img" src={hero.image || '/assets/hero-luxury-entryway.png'} alt="Warmly lit entryway with dark timber furniture, sculptural wood decor and soft directional light." width="1200" height="800" fetchPriority="high" style={{ ...resolveElementStyle('image', {}, heroOver, isMobile), ...(hasExplicitFocal(heroOver, 'image', isMobile) ? { objectPosition: focalPointToObjectPosition(resolveFocalPoint(heroOver, 'image', isMobile)) } : {}) }} />
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
        <RevealOnMount threshold={0.15} className="reveal-section">
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
              <div className="v2-philosophy-statement">
                <span className="eyebrow" style={resolveTypography('eyebrow', {}, philOver, isMobile)}>{philosophy.eyebrow || 'Why We Exist'}</span>
                <h2 style={resolveTypography('title', {}, philOver, isMobile)}>{philosophy.title || 'We make objects that are not finished when they leave the workshop.'}</h2>
              </div>
              <div className="v2-philosophy-body">
                {(philosophy.body || 'A piece of solid teak keeps changing long after it reaches your home \u2014 the grain deepens, the surface catches light differently with each year of use. We build for that slow change, not against it.\n\nThis is a small family workshop in India, run by the same hands for three generations. We make fewer things, more carefully, and we are in no hurry to make more.').split('\n\n').map((p, i) => (
                  <p key={i} style={resolveTypography('body', {}, philOver, isMobile)}>{p}</p>
                ))}
              </div>
            </div>
          </section>
        </RevealOnMount>
      )}

      {/* 4. Atelier Stories — object-study editorial (one object, same-product views, story, ownership) */}
      {!signatureDisabled && (
        <RevealOnMount threshold={0.15} className="reveal-section">
          <div className="v2-atelier-wrapper">
            <div className="v2-atelier-title">
              <h2>ATELIER STORIES</h2>
              <span className="v2-atelier-subtitle">ONE OF ONE - SIGNATURE PIECES</span>
            </div>
            <section
              className={`v2-sig-editorial ${getVariantClass('v2-sig-editorial', sigVariant?.id)}`}
              ref={sigSectionRef}
              aria-label={`Atelier Stories: ${heroProduct?.name || 'signature piece'}`}
              style={{
                ...(sigSectionStyle.paddingTop ? { paddingTop: sigSectionStyle.paddingTop } : {}),
                ...(sigSectionStyle.paddingBottom ? { paddingBottom: sigSectionStyle.paddingBottom } : {}),
              }}
            >
              {/* Mobile recomposition: object name leads, image follows. Desktop
                  keeps the name in the annotation column; this head shows on
                  mobile only. */}
              <div className="v2-sig-mobile-head">
                {heroProduct?.availabilityNote && (
                  <span className="v2-sig-edition-line">{heroProduct.availabilityNote}</span>
                )}
                <h2>{heroProduct?.name ? `${heroProduct.name.toUpperCase()}.` : 'TEAKLE ATELIER.'}</h2>
              </div>
              <div className="v2-sig-editorial-inner">
                <div className="v2-sig-editorial-grid">
                  {/* Left: the object — dominant primary plate + same-product study strip.
                      Strip renders ONLY authentic heroProduct views (active primary
                      filtered out). Single-image products render no strip rather
                      than a duplicate; workshop/process/maker imagery never appears
                      here — it lives in the craftsmanship/process sections below. */}
                  <div className="v2-sig-editorial-img">
                    <img
                      src={sigPrimarySrc || signature.image || 'https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                      alt={`${heroProduct?.name || signature.title || 'Teakle Atelier signature piece'}, handcrafted solid teak`}
                      width="1200" height="800" loading="lazy"
                      style={resolveElementStyle('image', {}, sigOver, isMobile)}
                    />
                    {sigSupporting.length > 0 && (
                      <div className="v2-sig-editorial-supporting" role="radiogroup" aria-label="More views">
                        {sigSupporting.slice(0, 4).map((t, i) => (
                          <button key={i} type="button" className={`v2-sig-editorial-thumb${(t.idx >= 0 ? t.idx : i) === galleryIdx ? ' is-active' : ''}`} onClick={() => { if (t.idx >= 0) setGalleryIdx(t.idx) }} role="radio" aria-checked={(t.idx >= 0 ? t.idx : i) === galleryIdx} aria-label={`View image ${i + 1}`}>
                            <img src={t.src} alt="" width="300" height="300" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Concise editorial footnote — verified product copy only. */}
                  </div>

                  {/* Right: annotation column — product info, price, CTAs, then THE STORY. */}
                  <div className="v2-sig-editorial-text">
                    {heroProduct?.availabilityNote && (
                      <span className="v2-sig-edition-line v2-sig-edition-line-desktop">{heroProduct.availabilityNote}</span>
                    )}
                    <h2 className="v2-sig-title-desktop" style={resolveTypography('title', {}, sigOver, isMobile)}>{heroProduct?.name ? `${heroProduct.name.toUpperCase()}.` : 'TEAKLE ATELIER.'}</h2>
                    <p>{heroProduct?.shortDescription || signature.body || 'A signature teak piece from the Teakle workshop.'}</p>

                    {/* Metadata — preserved as quiet hairline rule */}
                    <div className="v2-sig-editorial-features">
                      <div className="v2-sig-feature">
                        <svg className="v2-sig-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        <span className="v2-sig-feature-label">{heroProduct?.buildTime || '~18 Hours'}</span>
                      </div>
                      <div className="v2-sig-feature">
                        <svg className="v2-sig-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span className="v2-sig-feature-label">Master Crafted</span>
                      </div>
                      <div className="v2-sig-feature">
                        <svg className="v2-sig-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        <span className="v2-sig-feature-label">{heroProduct?.material || 'Solid Teak'}</span>
                      </div>
                      <div className="v2-sig-feature">
                        <svg className="v2-sig-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        <span className="v2-sig-feature-label">One of One</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="v2-sig-editorial-price">
                      <div className="v2-sig-editorial-price-amount">{heroProduct?.priceFormatted || '\u20B91,85,000'}</div>
                      {(heroProduct?.availabilityNote || heroProduct?.dimensions) && (
                        <div className="v2-sig-editorial-price-note">{[heroProduct?.availabilityNote, heroProduct?.dimensions].filter(Boolean).join(' \u00B7 ')}</div>
                      )}
                    </div>

                    {/* CTAs — ownership + process. Watch the Process links to the existing
                        dedicated process page for this exact piece. */}
                    <div className="v2-sig-editorial-actions">
                      <Link href={`/shop/${heroProduct?.id || 'anchor-table'}`} className="v2-sig-btn-primary">INQUIRE TO OWN</Link>
                      <Link href={`/process/${heroProduct?.id || 'anchor-table'}`} className="v2-sig-btn-outline">WATCH THE PROCESS</Link>
                    </div>

                    <button
                      type="button"
                      className={`v2-sig-wishlist${sigWishlisted ? ' is-active' : ''}`}
                      onClick={handleSigWishlist}
                      aria-pressed={sigWishlisted}
                      aria-label={sigWishlisted ? `Remove ${heroProduct?.name || 'this piece'} from wishlist` : `Save ${heroProduct?.name || 'this piece'} to wishlist`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                      {sigWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                    </button>

                    <p className="v2-sig-editorial-past">Looking for something from a past season? <Link href="/archive">See past editions</Link></p>

                    {/* THE STORY — moved to right side, under product info/CTAs */}
                    {heroProduct?.story && (
                      <div className="v2-sig-story-note">
                        <span className="v2-sig-story-label">The story</span>
                        <p>{heroProduct.story}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </RevealOnMount>
      )}

      {/* 5. Craftsmanship */}
      {!craftsmanshipDisabled && (
        <RevealOnMount threshold={0.15} className="reveal-section">
          <section
            className={`v2-craft ${getVariantClass('v2-craft', craftVariant?.id)}`}
            style={{
              ...(craftSectionStyle.contentWidth ? { maxWidth: craftSectionStyle.contentWidth, margin: '0 auto' } : {}),
              ...(craftSectionStyle.paddingTop ? { paddingTop: craftSectionStyle.paddingTop } : {}),
              ...(craftSectionStyle.paddingBottom ? { paddingBottom: craftSectionStyle.paddingBottom } : {}),
            }}
          >
            <div className="v2-craft-grid">
              <div className="v2-craft-text">
                <span className="eyebrow" style={resolveTypography('eyebrow', {}, craftOver, isMobile)}>{craftsmanship.eyebrow || 'Craftsmanship'}</span>
                <h2 style={resolveTypography('title', {}, craftOver, isMobile)}>{craftsmanship.title || 'Every piece passes through one pair of hands, start to finish.'}</h2>
                {(craftsmanship.body || 'We work in solid timber, never veneer or particleboard. A single block is selected, dried, and left to settle before a tool ever touches it \u2014 rushing this step is the most common way a piece fails early.\n\nJoints are cut by hand and fitted dry before any finish is applied. The oil we use is food-safe and reapplied over the piece\u2019s life, not sealed under lacquer that traps moisture and cracks.').split('\n\n').map((p, i) => (
                  <p key={i} style={resolveTypography('body', {}, craftOver, isMobile)}>{p}</p>
                ))}
                <Link href={craftsmanship.buttonUrl || '/studio'} className="link-quiet">{craftsmanship.buttonLabel || 'Visit the Studio'}</Link>
              </div>
              <div className="v2-craft-img">
                <img src={craftsmanship.image || 'https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=1200'} alt="Close-up of hand-cut joinery on a solid teak furniture piece." width="1200" height="1500" loading="lazy" style={{ ...resolveElementStyle('image', {}, craftOver, isMobile), ...(hasExplicitFocal(craftOver, 'image', isMobile) ? { objectPosition: focalPointToObjectPosition(resolveFocalPoint(craftOver, 'image', isMobile)) } : {}) }} />
              </div>
            </div>
          </section>
        </RevealOnMount>
      )}

      {/* 6+7. Editorial product presentation — T04 static 3 + 3.
          No carousel: two distinct groups of exactly three authentic
          products each. Group 1 honours the collection-carousel CMS
          selection; Group 2 honours the product-grid CMS selection,
          backfilled from the authoritative product dataset so the two
          groups stay distinct (no invented products). */}
      {(!carouselDisabled || !productGridDisabled) && (() => {
        const FALLBACK_IDS = ['anchor-table', 'bearing-chair', 'circle-table', 'hollow-bench', 'drift-sculpture', 'hourglass-vase']
        const carouselIds = parseProductIds(collectionCarousel.body)
        const gridIds = parseProductIds(productGrid.body)
        const seen = new Set()
        const orderedIds = []
        for (const id of [...carouselIds, ...gridIds, ...FALLBACK_IDS]) {
          if (!seen.has(id)) { seen.add(id); orderedIds.push(id) }
        }
        const six = resolveProducts(orderedIds).slice(0, 6)
        if (six.length < 6) return null
        const group1 = six.slice(0, 3)
        const group2 = six.slice(3, 6)
        const renderCard = (p) => (
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
        )
        return (
          <section className="v2-edit-groups" aria-label="Featured products">
            <div className="v2-edit-group" data-group="1">
              <div className="v2-products-head">
                <span className="eyebrow">{collectionCarousel.eyebrow || 'The Collection'}</span>
                <h2>{collectionCarousel.title || 'Select Pieces'}</h2>
              </div>
              <div className="v2-edit-grid">
                {group1.map(renderCard)}
              </div>
            </div>
            <div className="v2-edit-group v2-edit-group--second" data-group="2">
              <div className="v2-products-head">
                <span className="eyebrow">{productGrid.eyebrow || 'From the Collection'}</span>
                <h2>{productGrid.title || 'Pieces Built to Last'}</h2>
              </div>
              <div className="v2-edit-grid">
                {group2.map(renderCard)}
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
        <RevealOnMount threshold={0.15} className="reveal-section">
          <section className="v2-lifestyle">
            <img className="v2-lifestyle-bg" src={workshopStory.image || 'https://images.pexels.com/photos/5974417/pexels-photo-5974417.jpeg?auto=compress&cs=tinysrgb&w=1600'} alt="Close-up of a craftsman's hand guiding a chisel in the workshop." width="1600" height="1067" loading="lazy" style={{ ...resolveElementStyle('image', {}, workshopOver, isMobile), ...(hasExplicitFocal(workshopOver, 'image', isMobile) ? { objectPosition: focalPointToObjectPosition(resolveFocalPoint(workshopOver, 'image', isMobile)) } : {}) }} />
            <div className="v2-lifestyle-content">
              <span className="eyebrow eyebrow-light" style={resolveTypography('eyebrow', {}, workshopOver, isMobile)}>{workshopStory.eyebrow || 'The Workshop'}</span>
              <h2 style={resolveTypography('title', {}, workshopOver, isMobile)}>{workshopStory.title || 'A family workshop, unchanged in method for three generations.'}</h2>
              <p style={resolveTypography('body', {}, workshopOver, isMobile)}>{workshopStory.body || 'The tools are old. The hands are patient. Nothing here is made to a deadline \u2014 a piece is finished when it is ready, and not before.'}</p>
              <Link href={workshopStory.buttonUrl || '/studio'} className="link-quiet" style={resolveTypography('button', {}, workshopOver, isMobile)}>{workshopStory.buttonLabel || 'Read About Our Process'}</Link>
            </div>
          </section>
        </RevealOnMount>
      )}

      {/* 9. Story Block - Watch It Made */}
      {!processDisabled && (
        <RevealOnMount threshold={0.15} className="reveal-section">
          <section className="v2-lifestyle v2-lifestyle--alt">
            <img className="v2-lifestyle-bg" src={processStory.image || 'https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1600'} alt="Timber being shaped by hand, filmed for a process video." width="1600" height="1067" loading="lazy" style={{ ...resolveElementStyle('image', {}, processOver, isMobile), ...(hasExplicitFocal(processOver, 'image', isMobile) ? { objectPosition: focalPointToObjectPosition(resolveFocalPoint(processOver, 'image', isMobile)) } : {}) }} />
            <div className="v2-lifestyle-content">
              <span className="eyebrow eyebrow-light" style={resolveTypography('eyebrow', {}, processOver, isMobile)}>{processStory.eyebrow || 'Watch It Made'}</span>
              <h2 style={resolveTypography('title', {}, processOver, isMobile)}>{processStory.title || 'Every piece is documented from timber to finish.'}</h2>
              <p style={resolveTypography('body', {}, processOver, isMobile)}>{processStory.body || 'We don\u2019t ask you to imagine the process \u2014 we film it. Wood selection, joinery, finishing, and the hours each one takes, so you know exactly what you\u2019re buying before you buy it.'}</p>
              <Link href={`/process/${heroProduct?.id || 'anchor-table'}`} className="link-quiet" style={resolveTypography('button', {}, processOver, isMobile)}>{processStory.buttonLabel || 'Watch the Process'}</Link>
            </div>
          </section>
        </RevealOnMount>
      )}

    </div>
  )
}

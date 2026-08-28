'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import './homepage.css'

export default function HomeClient({ cms = {}, cmsKeys = new Set(), heroProduct = null }) {
  const heroRef = useRef(null)
  const sigSectionRef = useRef(null)
  const carouselTrackRef = useRef(null)
  const [revealStage, setRevealStage] = useState(0)
  const [galleryIdx, setGalleryIdx] = useState(0)

  const hero = cms.hero || {}
  const philosophy = cms.philosophy || {}
  const signature = cms.signature || {}
  const craftsmanship = cms.craftsmanship || {}
  const workshopStory = cms['workshop-story'] || {}
  const processStory = cms['process-story'] || {}

  const heroDisabled = cmsKeys.has('hero') && !cms.hero
  const philosophyDisabled = cmsKeys.has('philosophy') && !cms.philosophy
  const signatureDisabled = cmsKeys.has('signature') && !cms.signature
  const craftsmanshipDisabled = cmsKeys.has('craftsmanship') && !cms.craftsmanship
  const workshopDisabled = cmsKeys.has('workshop-story') && !cms['workshop-story']
  const processDisabled = cmsKeys.has('process-story') && !cms['process-story']

  /* ---- Hero parallax on scroll ---- */
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const img = hero.querySelector('.v2-hero-img')
    if (!img) return

    const heroHeight = hero.offsetHeight
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY
          if (y < heroHeight) {
            const p = y / heroHeight
            img.style.transform = `scale(${1.12 - p * 0.08}) translateY(${y * 0.25}px)`
            img.style.opacity = String(0.9 - p * 0.35)
          }
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ---- Editorial carousel ---- */
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

  /* ---- Signature section one-shot cinematic reveal ---- */
  useEffect(() => {
    const section = sigSectionRef.current
    if (!section) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealStage(4)
      return
    }

    let stage = 0
    let completed = false
    let ticking = false
    let lastTouchY = null

    const interactiveRe = /^(INPUT|TEXTAREA|SELECT|BUTTON)$/

    function isInteractive(el) {
      if (!el || el === document.body || el === document.documentElement) return false
      if (interactiveRe.test(el.tagName)) return true
      if (el.isContentEditable) return true
      if (el.getAttribute && el.getAttribute('role') === 'button') return true
      if (el.closest && (el.closest('a') || el.closest('button'))) return true
      return false
    }

    function sectionInView() {
      const rect = section.getBoundingClientRect()
      return rect.bottom >= 0 && rect.top <= window.innerHeight
    }

    function finalize() {
      completed = true
      const rect = section.getBoundingClientRect()
      const sectionAbsTop = window.scrollY + rect.top
      section.classList.add('is-reveal-done')
      const collapsedH = section.offsetHeight
      const target = Math.max(0, sectionAbsTop + collapsedH - window.innerHeight)
      window.scrollTo(0, target)
      setRevealStage(4)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }

    function advance() {
      if (completed) return
      if (stage >= 4) { finalize(); return }
      stage++
      setRevealStage(stage)
      if (stage >= 4) finalize()
    }

    function onWheel(e) {
      if (completed) return
      if (e.deltaY <= 0) return
      if (!sectionInView()) return
      e.preventDefault()
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { ticking = false; advance() })
    }

    function onKeyDown(e) {
      if (completed) return
      if (isInteractive(document.activeElement)) return
      const key = e.key
      if (key !== 'ArrowDown' && key !== 'PageDown' && !(key === ' ' && !e.shiftKey)) return
      if (!sectionInView()) return
      e.preventDefault()
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { ticking = false; advance() })
    }

    function onTouchStart(e) {
      lastTouchY = e.touches[0].clientY
    }

    function onTouchMove(e) {
      if (completed || lastTouchY === null) return
      const dy = e.touches[0].clientY - lastTouchY
      lastTouchY = e.touches[0].clientY
      if (dy >= 0) return
      if (!sectionInView()) return
      e.preventDefault()
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { ticking = false; advance() })
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const sigImages = heroProduct?.images || []
  const sigThumbs = heroProduct?.thumbnails || sigImages
  const hasGallery = sigImages.length > 1
  const isComplete = revealStage >= 4

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
        <section className="v2-hero" ref={heroRef}>
          <picture>
            <source srcSet="/assets/hero-luxury-entryway.avif" type="image/avif" />
            <source srcSet="/assets/hero-luxury-entryway.webp" type="image/webp" />
            <img className="v2-hero-img" src={hero.image || '/assets/hero-luxury-entryway.png'} alt="A woodworker's hands finishing the grain of a solid timber surface in natural light." width="1200" height="800" fetchPriority="high" />
          </picture>
          <div className="v2-hero-content">
            <span className="eyebrow eyebrow-light v2-hero-eyebrow">{hero.eyebrow || 'An Indian Workshop'}</span>
            <h1>{(hero.title || 'Where wood becomes<br />timeless art.').split('<br').length > 1
              ? <>{hero.title?.split('<br />')[0] || 'Where wood becomes'}<br />{hero.title?.split('<br />')[1] || 'timeless art.'}</>
              : hero.title || <>{'Where wood becomes'}<br />{'timeless art.'}</>
            }</h1>
            <div className="v2-hero-actions">
              <Link href={hero.buttonUrl || '/gallery'} className="btn-primary">{hero.buttonLabel || 'View the Collection'}</Link>
              <Link href="/studio" className="link-quiet">Our Studio</Link>
            </div>
          </div>
          <a href="#philosophy" className="v2-scroll" aria-label="Scroll to explore">
            <span>Scroll</span>
            <span className="v2-scroll-line"></span>
          </a>
        </section>
        )}

        {/* 2. Trust Bar */}
        <section className="v2-trust">
          <div className="container">
            <div className="v2-trust-inner">
              <div className="v2-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Handcrafted in India</span>
              </div>
              <div className="v2-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Solid Timber, Never Veneer</span>
              </div>
              <div className="v2-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span>White-Glove Delivery</span>
              </div>
              <div className="v2-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <span>Sustainably Sourced</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Philosophy */}
        {!philosophyDisabled && (
        <section className="v2-philosophy" id="philosophy">
          <div className="v2-philosophy-inner">
            <span className="eyebrow reveal">{philosophy.eyebrow || 'Why We Exist'}</span>
            <h2 className="reveal">{philosophy.title || 'We make objects that are not finished when they leave the workshop.'}</h2>
            {(philosophy.body || 'A piece of solid teak keeps changing long after it reaches your home \u2014 the grain deepens, the surface catches light differently with each year of use. We build for that slow change, not against it.\n\nThis is a small family workshop in India, run by the same hands for three generations. We make fewer things, more carefully, and we are in no hurry to make more.').split('\n\n').map((p, i) => (
              <p key={i} className="reveal">{p}</p>
            ))}
          </div>
        </section>
        )}

        {/* 4. Signature Collection */}
        {!signatureDisabled && (
        <section className={`v2-signature${isComplete ? ' is-reveal-done' : ''}`} ref={sigSectionRef}>
          <div className="v2-sig-cinema">
            <div className="v2-sig-grid">
              <div className="v2-sig-img">
                <div className={`v2-sig-img-wrap${revealStage >= 1 ? ' is-stage-1' : ''}`}>
                  <img className="v2-sig-img-main" src={sigImages[galleryIdx] || heroProduct?.images?.[0] || signature.image || 'https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=1200'} alt={`${heroProduct?.name || 'Teakle furniture'}, handcrafted teak dining table`} width="960" height="1200" />
                </div>
                {hasGallery && (
                  <>
                    <div className="v2-sig-gallery" role="radiogroup" aria-label="Product images">
                      {sigThumbs.map((thumb, i) => (
                        <button key={i} className={`v2-sig-thumb${i === galleryIdx ? ' is-active' : ''}`} onClick={() => setGalleryIdx(i)} aria-label={`View image ${i + 1}`} role="radio" aria-checked={i === galleryIdx}>
                          <img src={thumb} alt="" width="56" height="56" loading="lazy" />
                        </button>
                      ))}
                    </div>
                    <div className="v2-sig-nav">
                      <button className="v2-sig-nav-btn" onClick={sigPrev} aria-label="Previous image">&#8592;</button>
                      <button className="v2-sig-nav-btn" onClick={sigNext} aria-label="Next image">&#8594;</button>
                    </div>
                  </>
                )}
              </div>
              <div className="v2-sig-text">
                <span className={`v2-sig-tag v2-sig-reveal${revealStage >= 2 ? ' is-stage-2' : ''}`}>{heroProduct?.name || 'The Hero Edition'}</span>
                <span className={`eyebrow eyebrow-light v2-sig-reveal${revealStage >= 2 ? ' is-stage-2' : ''}`}>One of One · Hero Edition</span>
                <h2 className={`v2-sig-reveal${revealStage >= 2 ? ' is-stage-2' : ''}`}>{signature.title || 'This season\u2019s hero.'}</h2>
                <p className={`v2-sig-reveal${revealStage >= 3 ? ' is-stage-3' : ''}`}>{heroProduct?.shortDescription ? `${heroProduct.shortDescription} Never restocked. Never repeated.` : signature.body || 'One sculptural centrepiece, carved from a single reclaimed timber block. It is never restocked and never discounted \u2014 once it\u2019s gone, the next edition begins.'}</p>
                <div className={`v2-sig-actions v2-sig-reveal${revealStage >= 4 ? ' is-stage-4' : ''}`}>
                  <Link href={`/shop/${heroProduct?.id || 'anchor-table'}`} className="btn-primary">View This Piece</Link>
                  <Link href={`/process/${heroProduct?.id || 'anchor-table'}`} className="link-quiet">Watch the Process</Link>
                </div>
                <p className={`v2-sig-past v2-sig-reveal${revealStage >= 4 ? ' is-stage-4' : ''}`}>Looking for something from a past season? <Link href="/archive">See past editions</Link>.</p>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* 5. Craftsmanship */}
        {!craftsmanshipDisabled && (
        <section className="v2-craft">
          <div className="v2-craft-grid">
            <div className="v2-craft-img reveal">
              <img src={craftsmanship.image || 'https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=1200'} alt="Close-up of hand-cut joinery on a solid teak furniture piece." width="1200" height="1500" loading="lazy" />
            </div>
            <div className="v2-craft-text">
              <span className="eyebrow reveal">{craftsmanship.eyebrow || 'Craftsmanship'}</span>
              <h2 className="reveal">{craftsmanship.title || 'Every piece passes through one pair of hands, start to finish.'}</h2>
              {(craftsmanship.body || 'We work in solid timber, never veneer or particleboard. A single block is selected, dried, and left to settle before a tool ever touches it \u2014 rushing this step is the most common way a piece fails early.\n\nJoints are cut by hand and fitted dry before any finish is applied. The oil we use is food-safe and reapplied over the piece\u2019s life, not sealed under lacquer that traps moisture and cracks.').split('\n\n').map((p, i) => (
                <p key={i} className="reveal">{p}</p>
              ))}
              <Link href={craftsmanship.buttonUrl || '/studio'} className="link-quiet reveal">{craftsmanship.buttonLabel || 'Visit the Studio'}</Link>
            </div>
          </div>
        </section>
        )}

        {/* 6. Collection Carousel */}
        <section className="v2-carousel">
          <button className="v2-cprev" aria-label="Previous">&#8592;</button>
          <button className="v2-cnext" aria-label="Next">&#8594;</button>
          <div className="v2-ctrack" ref={carouselTrackRef}>
            <Link href="/shop/anchor-table" className="v2-citem reveal">
              <div className="v2-cimage"><img src="https://images.pexels.com/photos/11112739/pexels-photo-11112739.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Anchor Table" loading="lazy" width="600" height="400" /></div>
              <span className="v2-clabel">The Anchor Table</span>
              <span className="v2-cbtn">Discover</span>
            </Link>
            <Link href="/shop/bearing-chair" className="v2-citem reveal">
              <div className="v2-cimage"><img src="https://images.pexels.com/photos/29546532/pexels-photo-29546532.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Bearing Chair" loading="lazy" width="600" height="400" /></div>
              <span className="v2-clabel">The Bearing Chair</span>
              <span className="v2-cbtn">Discover</span>
            </Link>
            <Link href="/shop/serving-plank" className="v2-citem reveal">
              <div className="v2-cimage"><img src="https://images.pexels.com/photos/6910978/pexels-photo-6910978.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Teak Serving Board" loading="lazy" width="600" height="400" /></div>
              <span className="v2-clabel">Teak Serving Board</span>
              <span className="v2-cbtn">Discover</span>
            </Link>
            <Link href="/shop/carving-board" className="v2-citem reveal">
              <div className="v2-cimage"><img src="https://images.pexels.com/photos/7123134/pexels-photo-7123134.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Carving Board" loading="lazy" width="600" height="400" /></div>
              <span className="v2-clabel">Carving Board</span>
              <span className="v2-cbtn">Discover</span>
            </Link>
            <Link href="/shop/spice-rack" className="v2-citem reveal">
              <div className="v2-cimage"><img src="https://images.pexels.com/photos/34942955/pexels-photo-34942955.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Spice Rack" loading="lazy" width="600" height="400" /></div>
              <span className="v2-clabel">Spice Rack</span>
              <span className="v2-cbtn">Discover</span>
            </Link>
            <Link href="/shop/drift-sculpture" className="v2-citem reveal">
              <div className="v2-cimage"><img src="https://images.pexels.com/photos/4612501/pexels-photo-4612501.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Drift Sculpture" loading="lazy" width="600" height="400" /></div>
              <span className="v2-clabel">Drift Sculpture</span>
              <span className="v2-cbtn">Discover</span>
            </Link>
            <Link href="/shop/hourglass-vase" className="v2-citem reveal">
              <div className="v2-cimage"><img src="https://images.pexels.com/photos/10677815/pexels-photo-10677815.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Hourglass Vase" loading="lazy" width="600" height="400" /></div>
              <span className="v2-clabel">Hourglass Vase</span>
              <span className="v2-cbtn">Discover</span>
            </Link>
          </div>
          <div className="v2-cdots">
            <span className="v2cdot active"></span>
            <span className="v2cdot"></span>
            <span className="v2cdot"></span>
            <span className="v2cdot"></span>
            <span className="v2cdot"></span>
            <span className="v2cdot"></span>
            <span className="v2cdot"></span>
          </div>
        </section>

        {/* 7. Explore Products */}
        <section className="v2-products">
          <div className="container">
            <div className="v2-products-head reveal">
              <span className="eyebrow">From the Collection</span>
              <h2>Pieces Built to Last</h2>
            </div>
            <div className="v2-pgrid">
              <Link href="/shop/anchor-table" className="v2-pcard reveal">
                <div className="v2-pimg"><img src="https://images.pexels.com/photos/11112739/pexels-photo-11112739.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Anchor Table" loading="lazy" width="600" height="400" /></div>
                <div className="v2-pinfo">
                  <div>
                    <h3>The Anchor Table</h3>
                    <div className="v2-pmeta">
                      <span className="v2-pcat">Dining</span>
                      <span className="v2-pprice">{'\u20B9'}1,85,000</span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/shop/bearing-chair" className="v2-pcard reveal">
                <div className="v2-pimg"><img src="https://images.pexels.com/photos/29546532/pexels-photo-29546532.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Bearing Chair" loading="lazy" width="600" height="400" /></div>
                <div className="v2-pinfo">
                  <div>
                    <h3>The Bearing Chair</h3>
                    <div className="v2-pmeta">
                      <span className="v2-pcat">Dining</span>
                      <span className="v2-pprice">{'\u20B9'}68,000</span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/shop/serving-plank" className="v2-pcard reveal">
                <div className="v2-pimg"><img src="https://images.pexels.com/photos/6910978/pexels-photo-6910978.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Teak Serving Board" loading="lazy" width="600" height="400" /></div>
                <div className="v2-pinfo">
                  <div>
                    <h3>Teak Serving Board</h3>
                    <div className="v2-pmeta">
                      <span className="v2-pcat">Kitchen</span>
                      <span className="v2-pprice">{'\u20B9'}7,000</span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/shop/spice-rack" className="v2-pcard reveal">
                <div className="v2-pimg"><img src="https://images.pexels.com/photos/34942955/pexels-photo-34942955.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Spice Rack" loading="lazy" width="600" height="400" /></div>
                <div className="v2-pinfo">
                  <div>
                    <h3>Spice Rack</h3>
                    <div className="v2-pmeta">
                      <span className="v2-pcat">Kitchen</span>
                      <span className="v2-pprice">{'\u20B9'}9,500</span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/shop/drift-sculpture" className="v2-pcard reveal">
                <div className="v2-pimg"><img src="https://images.pexels.com/photos/4612501/pexels-photo-4612501.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Drift Sculpture" loading="lazy" width="600" height="400" /></div>
                <div className="v2-pinfo">
                  <div>
                    <h3>Drift Sculpture</h3>
                    <div className="v2-pmeta">
                      <span className="v2-pcat">Living</span>
                      <span className="v2-pprice">{'\u20B9'}24,000</span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/shop/hourglass-vase" className="v2-pcard reveal">
                <div className="v2-pimg"><img src="https://images.pexels.com/photos/10677815/pexels-photo-10677815.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Hourglass Vase" loading="lazy" width="600" height="400" /></div>
                <div className="v2-pinfo">
                  <div>
                    <h3>Hourglass Vase</h3>
                    <div className="v2-pmeta">
                      <span className="v2-pcat">Living</span>
                      <span className="v2-pprice">{'\u20B9'}9,500</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="v2-pcta reveal">
              <Link href="/gallery" className="btn-primary">Explore the Full Collection</Link>
            </div>
          </div>
        </section>

        {/* 8. Story Block — Workshop */}
        {!workshopDisabled && (
        <section className="v2-lifestyle">
          <img className="v2-lifestyle-bg" src={workshopStory.image || 'https://images.pexels.com/photos/5974417/pexels-photo-5974417.jpeg?auto=compress&cs=tinysrgb&w=1600'} alt="A craftsman's weathered hands sanding a wooden surface in the workshop." width="1600" height="1067" loading="lazy" />
          <div className="v2-lifestyle-content">
            <span className="eyebrow eyebrow-light reveal">{workshopStory.eyebrow || 'The Workshop'}</span>
            <h2 className="reveal">{workshopStory.title || 'A family workshop, unchanged in method for three generations.'}</h2>
            <p className="reveal">{workshopStory.body || 'The tools are old. The hands are patient. Nothing here is made to a deadline \u2014 a piece is finished when it is ready, and not before.'}</p>
            <Link href={workshopStory.buttonUrl || '/studio'} className="link-quiet reveal">{workshopStory.buttonLabel || 'Read About Our Process'}</Link>
          </div>
        </section>
        )}

        {/* 9. Story Block — Watch It Made */}
        {!processDisabled && (
        <section className="v2-lifestyle">
          <img className="v2-lifestyle-bg" src={processStory.image || 'https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1600'} alt="Timber being shaped by hand, filmed for a process video." width="1600" height="1067" loading="lazy" />
          <div className="v2-lifestyle-content">
            <span className="eyebrow eyebrow-light reveal">{processStory.eyebrow || 'Watch It Made'}</span>
            <h2 className="reveal">{processStory.title || 'Every piece is documented from timber to finish.'}</h2>
            <p className="reveal">{processStory.body || 'We don\u2019t ask you to imagine the process \u2014 we film it. Wood selection, joinery, finishing, and the hours each one takes, so you know exactly what you\u2019re buying before you buy it.'}</p>
            <Link href={`/process/${heroProduct?.id || 'anchor-table'}`} className="link-quiet reveal">{processStory.buttonLabel || 'Watch the Process'}</Link>
          </div>
        </section>
        )}

      </div>
  )
}

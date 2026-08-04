'use client'

import { useEffect, useRef } from 'react'

export default function Home() {
  const heroRef = useRef(null)
  const carouselTrackRef = useRef(null)
  const autoScrollTimer = useRef(null)

  /* ---- Hero parallax on scroll ---- */
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const img = hero.querySelector('.hero-image')
    if (!img) return

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const heroH = hero.offsetHeight
          if (scrollY < heroH) {
            const pct = scrollY / heroH
            img.style.transform = `scale(${1.08 - pct * 0.06}) translateY(${scrollY * 0.3}px)`
            img.style.opacity = 0.88 - pct * 0.3
          }
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ---- Editorial carousel: auto-scroll, pause on hover, manual + swipe ---- */
  useEffect(() => {
    const track = carouselTrackRef.current
    if (!track) return

    const prevBtn = track.parentElement.querySelector('.ecarousel-prev')
    const nextBtn = track.parentElement.querySelector('.ecarousel-next')
    const items = track.querySelectorAll('.ecarousel-item')
    if (!items.length) return

    let currentIndex = 0
    let isHovered = false
    let userInteracted = false
    let pauseTimer = null

    function scrollToIndex(i) {
      const w = items[0].offsetWidth + 40
      track.scrollTo({ left: i * w, behavior: 'smooth' })
      currentIndex = i
    }

    function autoScroll() {
      if (isHovered || userInteracted) return
      const maxIndex = items.length - 1
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1
      scrollToIndex(currentIndex)
    }

    function onUserInteract() {
      userInteracted = true
      clearTimeout(pauseTimer)
      pauseTimer = setTimeout(() => { userInteracted = false }, 12000)
    }

    autoScrollTimer.current = setInterval(autoScroll, 7500)

    track.addEventListener('mouseenter', () => { isHovered = true })
    track.addEventListener('mouseleave', () => { isHovered = false })

    const onPrev = () => { onUserInteract(); currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1; scrollToIndex(currentIndex) }
    const onNext = () => { onUserInteract(); currentIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1; scrollToIndex(currentIndex) }

    if (prevBtn) prevBtn.addEventListener('click', onPrev)
    if (nextBtn) nextBtn.addEventListener('click', onNext)

    let startX = 0, dragging = false
    const onTouchStart = (e) => { startX = e.touches[0].clientX; dragging = true }
    const onTouchMove = (e) => { if (dragging && Math.abs(startX - e.touches[0].clientX) > 5) e.preventDefault() }
    const onTouchEnd = (e) => {
      if (!dragging) return; dragging = false
      onUserInteract()
      const diff = startX - e.changedTouches[0].clientX
      if (diff > 50) { currentIndex = Math.min(currentIndex + 1, items.length - 1); scrollToIndex(currentIndex) }
      else if (diff < -50) { currentIndex = Math.max(currentIndex - 1, 0); scrollToIndex(currentIndex) }
    }

    track.addEventListener('touchstart', onTouchStart)
    track.addEventListener('touchmove', onTouchMove, { passive: false })
    track.addEventListener('touchend', onTouchEnd)

    return () => {
      clearInterval(autoScrollTimer.current)
      clearTimeout(pauseTimer)
      if (prevBtn) prevBtn.removeEventListener('click', onPrev)
      if (nextBtn) nextBtn.removeEventListener('click', onNext)
      track.removeEventListener('touchstart', onTouchStart)
      track.removeEventListener('touchmove', onTouchMove)
      track.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <>
      <style>{`
  /* ---- Hero ---- */
  .hero {
    position: relative;
    height: 100vh;
    height: 100dvh;
    min-height: 700px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    background: var(--walnut);
  }
  .hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 120%;
    object-fit: cover;
    opacity: 0.88;
    will-change: transform, opacity;
    transform: scale(1.08);
    animation: heroZoomOut 10s var(--ease) forwards;
  }
  @keyframes heroZoomOut {
    from { transform: scale(1.08); }
    to { transform: scale(1); }
  }
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(43,34,27,0.08) 0%, rgba(43,34,27,0.22) 40%, rgba(43,34,27,0.82) 100%);
    z-index: 1;
  }
  .hero-content {
    position: relative;
    z-index: 2;
    padding: 0 var(--space-md) var(--space-2xl);
    max-width: 920px;
    margin-top: -8vh;
    margin-left: 4vw;
  }
  .hero-eyebrow {
    margin-bottom: var(--space-md);
    letter-spacing: 0.22em;
    opacity: 0;
    animation: fadeUp var(--dur-slow) var(--ease) 200ms forwards;
  }
  .hero h1 {
    font-size: clamp(2.75rem, 7vw, var(--text-h1));
    color: var(--bg-primary);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.01em;
    margin-bottom: var(--space-sm);
    opacity: 0;
    animation: fadeUp var(--dur-slow) var(--ease) 400ms forwards;
    font-style: italic;
  }
  .hero-sub {
    color: var(--stone);
    font-size: var(--text-lede);
    max-width: 52ch;
    margin-bottom: var(--space-lg);
    line-height: var(--lh-relaxed);
    opacity: 0;
    animation: fadeUp var(--dur-slow) var(--ease) 550ms forwards;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    opacity: 0;
    animation: fadeUp var(--dur-slow) var(--ease) 700ms forwards;
    flex-wrap: wrap;
  }
  .hero-actions .link-quiet {
    color: var(--bg-primary);
    border-color: rgba(247,244,238,0.4);
  }
  .hero-actions .link-quiet:hover {
    color: var(--bronze);
    border-color: var(--bronze);
  }
  .hero-scroll-cue {
    position: absolute;
    left: 0; right: 0;
    bottom: var(--space-md);
    z-index: 3;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    color: var(--stone);
    opacity: 0;
    animation: fadeUp var(--dur-slow) var(--ease) 1100ms forwards;
  }
  .hero-scroll-cue span {
    font-size: var(--text-caption);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .hero-scroll-cue .line {
    width: 1px;
    height: 34px;
    background: linear-gradient(180deg, var(--bronze), transparent);
    animation: scrollLine 2.2s var(--ease) infinite;
  }
  @keyframes scrollLine {
    0% { transform: scaleY(0); transform-origin: top; opacity: 1; }
    50% { transform: scaleY(1); transform-origin: top; opacity: 1; }
    51% { transform-origin: bottom; }
    100% { transform: scaleY(0); transform-origin: bottom; opacity: 0.4; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ---- Trust Bar ---- */
  .trust-bar {
    background: var(--bg-secondary);
    padding: var(--space-md) 0;
    border-bottom: var(--border-subtle);
  }
  .trust-bar-inner {
    display: flex;
    justify-content: center;
    gap: var(--space-xl);
    flex-wrap: wrap;
  }
  .trust-bar .trust-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
    opacity: 0;
    animation: fadeUp var(--dur-slow) var(--ease) forwards;
  }
  .trust-bar .trust-item:nth-child(1) { animation-delay: 100ms; }
  .trust-bar .trust-item:nth-child(2) { animation-delay: 200ms; }
  .trust-bar .trust-item:nth-child(3) { animation-delay: 300ms; }
  .trust-bar .trust-item:nth-child(4) { animation-delay: 400ms; }
  .trust-bar .trust-item svg {
    width: 16px;
    height: 16px;
    color: var(--bronze);
    flex-shrink: 0;
  }

  /* ---- Philosophy ---- */
  .philosophy {
    background: var(--bg-primary);
    padding: var(--space-2xl) 0;
  }
  .philosophy-inner {
    max-width: var(--container);
    margin: 0 auto;
    text-align: left;
    padding: 0 var(--space-md);
  }
  .philosophy .eyebrow {
    margin-bottom: var(--space-md);
  }
  .philosophy h2 {
    font-size: clamp(1.75rem, 3.4vw, var(--text-h2));
    margin-bottom: var(--space-md);
    max-width: none;
  }
  .philosophy p {
    max-width: none;
    font-size: var(--text-body);
    color: var(--text-secondary);
    line-height: var(--lh-relaxed);
  }
  .philosophy p + p {
    margin-top: var(--space-sm);
  }

  /* ---- Signature Collection ---- */
  .signature {
    background: var(--walnut);
    padding: var(--space-2xl) 0;
    overflow: hidden;
  }
  .signature-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: calc(var(--space-2xl) + var(--space-md));
    align-items: center;
  }
  .signature-image {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
  }
  .signature-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.4s var(--ease);
  }
  .signature-image:hover img { transform: scale(1.04); }
  .signature-tag {
    display: inline-block;
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    color: var(--bronze);
    border: 1px solid color-mix(in srgb, var(--bronze), transparent 60%);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-md);
  }
  .signature .eyebrow { color: var(--stone); }
  .signature h2 {
    color: var(--bg-primary);
    font-size: clamp(2rem, 4.2vw, var(--text-h1));
    margin: var(--space-sm) 0 var(--space-md);
    max-width: none;
    line-height: 1.15;
  }
  .signature p {
    color: var(--stone);
    font-size: var(--text-body);
    max-width: 42ch;
    margin-bottom: var(--space-lg);
    line-height: var(--lh-relaxed);
  }
  .signature-actions {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    flex-wrap: wrap;
  }
  .signature-actions .link-quiet {
    color: var(--bg-primary);
    border-color: rgba(247,244,238,0.4);
  }
  .signature-actions .link-quiet:hover {
    color: var(--bronze);
    border-color: var(--bronze);
  }

  /* ---- Craftsmanship ---- */
  .craft {
    background: var(--bg-primary);
    padding: var(--space-2xl) 0;
  }
  .craft-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
    align-items: center;
  }
  .craft-image {
    overflow: hidden;
  }
  .craft-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    aspect-ratio: 4 / 5;
    transition: transform 1.2s var(--ease);
  }
  .craft-image:hover img { transform: scale(1.04); }
  .craft-text {
    max-width: none;
    text-align: left;
    padding: 0;
  }
  .craft-text .eyebrow {
    margin-bottom: var(--space-md);
    justify-content: flex-start;
  }
  .craft-text h2 {
    font-size: clamp(1.75rem, 3.4vw, var(--text-h2));
    margin-bottom: var(--space-md);
    max-width: none;
  }
  .craft-text p {
    max-width: none;
    font-size: var(--text-body);
    color: var(--text-secondary);
    line-height: var(--lh-relaxed);
  }
  .craft-text p + p {
    margin-top: var(--space-sm);
  }
  .craft-text .link-quiet {
    display: inline-block;
    margin-top: var(--space-md);
  }

  /* ---- Editorial Carousel ---- */
  .editorial-carousel {
    background: var(--walnut);
    padding: var(--space-2xl) 0;
    overflow: hidden;
  }
  .ecarousel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    max-width: var(--container);
    margin: 0 auto var(--space-lg);
    padding: 0 var(--space-md);
  }
  .ecarousel-header h2 {
    color: var(--bg-primary);
    font-size: clamp(1.5rem, 3vw, var(--text-h2));
    max-width: none;
  }
  .ecarousel-header .eyebrow { color: var(--stone); }
  .ecarousel-controls {
    display: flex;
    gap: var(--space-sm);
  }
  .ecarousel-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(247,244,238,0.3);
    background: transparent;
    color: var(--bg-primary);
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }
  .ecarousel-btn:hover {
    background: rgba(247,244,238,0.1);
    border-color: var(--bg-primary);
  }
  .ecarousel-track {
    display: flex;
    gap: var(--space-md);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    padding: 0 var(--space-md);
    -webkit-overflow-scrolling: touch;
  }
  .ecarousel-track::-webkit-scrollbar { display: none; }
  .ecarousel-item {
    flex: 0 0 70vw;
    max-width: 900px;
    scroll-snap-align: center;
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--forest);
  }
  .ecarousel-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.88;
    transition: transform 1.2s var(--ease), opacity 0.6s var(--ease);
  }
  .ecarousel-item:hover img {
    transform: scale(1.03);
    opacity: 1;
  }
  .ecarousel-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(43,34,27,0.7) 0%, rgba(43,34,27,0.05) 50%, transparent 100%);
    transition: background var(--dur-fast) var(--ease);
  }
  .ecarousel-item:hover::after {
    background: linear-gradient(0deg, rgba(43,34,27,0.78) 0%, rgba(43,34,27,0.1) 50%, transparent 100%);
  }
  .ecarousel-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: var(--space-lg) var(--space-xl);
  }
  .ecarousel-caption .eyebrow { color: var(--stone); margin-bottom: var(--space-xs); }
  .ecarousel-caption h3 {
    color: var(--bg-primary);
    font-size: clamp(1.25rem, 2.5vw, var(--text-h2));
    font-weight: 600;
    max-width: none;
    margin-bottom: var(--space-xs);
  }
  .ecarousel-caption p {
    color: var(--stone);
    font-size: var(--text-body);
    max-width: 40ch;
    line-height: var(--lh-relaxed);
  }

  /* ---- Story Block (full-bleed editorial) ---- */
  .story-block {
    position: relative;
    height: 88vh;
    min-height: 560px;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
  }
  .story-block img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.2s var(--ease);
    will-change: transform;
  }
  .story-block:hover img { transform: scale(1.04); }
  .story-block::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(43,34,27,0.72) 0%, rgba(43,34,27,0.1) 55%, transparent 100%);
  }
  .story-block-content {
    position: relative;
    z-index: 2;
    padding: var(--space-xl) var(--space-md);
    max-width: 640px;
  }
  .story-block .eyebrow { color: var(--stone); margin-bottom: var(--space-sm); }
  .story-block h2 {
    color: var(--bg-primary);
    font-size: clamp(2rem, 4vw, var(--text-h1));
    margin-bottom: var(--space-sm);
    max-width: none;
  }
  .story-block p {
    color: var(--stone);
    font-size: var(--text-body);
    max-width: 48ch;
    margin-bottom: var(--space-md);
    line-height: var(--lh-relaxed);
  }
  .story-block .link-quiet { color: var(--bg-primary); border-color: rgba(247,244,238,0.4); }
  .story-block .link-quiet:hover { color: var(--bronze); border-color: var(--bronze); }

  /* ---- Featured Products ---- */
  .featured-products {
    background: var(--bg-primary);
    padding: var(--space-2xl) 0 var(--space-xl);
  }
  .featured-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--space-lg);
  }
  .featured-header h2 {
    font-size: clamp(1.5rem, 3vw, var(--text-h2));
    max-width: none;
  }
  .featured-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
  }
  .fp-card {
    display: block;
    background: var(--bg-primary);
    transition: transform 0.4s var(--ease);
  }
  .fp-card:hover { transform: translateY(-6px); }
  .fp-image {
    position: relative;
    aspect-ratio: 4 / 5;
    background: var(--stone);
    overflow: hidden;
    margin-bottom: var(--space-sm);
  }
  .fp-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s var(--ease);
  }
  .fp-card:hover .fp-image img { transform: scale(1.05); }
  .fp-quick {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--space-sm);
    background: linear-gradient(0deg, rgba(43,34,27,0.7) 0%, transparent 100%);
    display: flex;
    justify-content: center;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.4s var(--ease), transform 0.4s var(--ease);
  }
  .fp-card:hover .fp-quick {
    opacity: 1;
    transform: translateY(0);
  }
  .fp-quick span {
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--bg-primary);
    border-bottom: 1px solid rgba(247,244,238,0.5);
    padding-bottom: 1px;
  }
  .fp-info h3 {
    font-size: var(--text-subhead);
    font-weight: 600;
    margin-bottom: 2px;
    max-width: none;
    line-height: 1.3;
    transition: color var(--dur-fast) var(--ease);
  }
  .fp-card:hover .fp-info h3 { color: var(--bronze); }
  .fp-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  .fp-category {
    font-size: var(--text-caption);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .fp-price {
    font-size: var(--text-caption);
    color: var(--text-secondary);
  }

  /* ---- Journal Preview ---- */
  .journal-preview {
    background: var(--bg-secondary);
    padding: var(--space-2xl) 0;
  }
  .journal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--space-lg);
  }
  .journal-header h2 {
    font-size: clamp(1.5rem, 3vw, var(--text-h2));
    max-width: none;
  }
  .journal-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: var(--space-md);
  }
  .journal-card {
    display: block;
  }
  .journal-image {
    position: relative;
    aspect-ratio: 16 / 11;
    overflow: hidden;
    margin-bottom: var(--space-sm);
    background: var(--stone);
  }
  .journal-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s var(--ease);
  }
  .journal-card:hover .journal-image img { transform: scale(1.05); }
  .journal-card .eyebrow { display: block; margin-bottom: var(--space-xs); }
  .journal-card h3 {
    font-size: var(--text-subhead);
    font-weight: 600;
    margin-bottom: var(--space-xs);
    max-width: none;
    line-height: 1.3;
    transition: color var(--dur-fast) var(--ease);
  }
  .journal-card:hover h3 { color: var(--bronze); }
  .journal-card p {
    font-size: var(--text-body);
    color: var(--text-secondary);
    line-height: var(--lh-relaxed);
    max-width: 42ch;
  }
  .journal-date {
    display: block;
    font-size: var(--text-caption);
    color: var(--text-secondary);
    letter-spacing: 0.04em;
    margin-top: var(--space-xs);
  }

  /* ---- Responsive ---- */
  @media (max-width: 860px) {
    .hero { min-height: 0; height: 65vh; }
    .hero-content { padding: 0 var(--space-lg) var(--space-lg); padding-bottom: calc(var(--space-lg) + 56px); margin-left: 0; margin-top: 0; max-width: 100%; }
    .hero h1 { font-size: var(--text-h1); margin-bottom: var(--space-sm); line-height: 1.1; }
    .hero-sub { font-size: var(--text-body); }
    .hero-actions { gap: var(--space-md); }
    .hero-actions .btn-primary { min-height: 50px; padding: 0.85rem calc(var(--space-lg) + var(--space-sm)); font-size: var(--text-caption); letter-spacing: 0.12em; }
    .hero-scroll-cue { display: none; }

    .trust-bar-inner { gap: var(--space-md); }
    .trust-bar .trust-item { font-size: 0.65rem; }

    .philosophy { padding: var(--space-xl) 0; }
    .philosophy-inner { padding: 0 calc(var(--space-lg) + var(--space-sm)); max-width: 100%; text-align: center; }
    .philosophy .eyebrow { justify-content: center; margin-bottom: var(--space-md); }
    .philosophy h2 { font-size: var(--text-h2); margin-bottom: var(--space-md); line-height: 1.3; max-width: none; }
    .philosophy-inner p { font-size: var(--text-body); line-height: var(--lh-relaxed); max-width: 52ch; margin-left: auto; margin-right: auto; }

    .signature-grid { grid-template-columns: 1fr; gap: var(--space-lg); }
    .signature-image { max-height: 480px; }
    .signature p { font-size: var(--text-body); }

    .craft { padding: var(--space-xl) 0; }
    .craft-grid { grid-template-columns: 1fr; gap: var(--space-lg); }
    .craft-image img { aspect-ratio: 16 / 9; }

    .ecarousel-item { flex: 0 0 85vw; }
    .ecarousel-caption { padding: var(--space-md); }

    .story-block {
      display: block;
      height: auto;
      min-height: 0;
      background: var(--bg-primary);
      overflow: hidden;
    }
    .story-block + .story-block { margin-top: var(--space-xl); }
    .story-block img {
      position: relative;
      width: 100%;
      height: 340px;
      object-fit: cover;
      transform: none;
    }
    .story-block:hover img { transform: none; }
    .story-block::after { display: none; }
    .story-block-content {
      position: relative;
      z-index: 2;
      padding: var(--space-lg) var(--space-lg);
      max-width: 100%;
    }
    .story-block .eyebrow { color: var(--bronze); margin-bottom: var(--space-sm); font-size: var(--text-caption); }
    .story-block h2 {
      color: var(--text-primary);
      font-size: var(--text-h2);
      margin-bottom: var(--space-md);
      line-height: 1.25;
    }
    .story-block p {
      color: var(--text-secondary);
      font-size: var(--text-body);
      line-height: var(--lh-relaxed);
      max-width: none;
      margin-bottom: var(--space-md);
    }
    .story-block .link-quiet { color: var(--bronze); border-color: var(--bronze); font-size: var(--text-caption); }

    .featured-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
    .fp-card { padding-bottom: 0; }
    .fp-image { margin-bottom: var(--space-xs); }
    .fp-info { display: flex; flex-direction: column; gap: 2px; }

    .journal-grid { grid-template-columns: 1fr 1fr; }
    .journal-card:first-child { grid-column: 1 / -1; }
    .journal-card:first-child .journal-image { aspect-ratio: 16 / 7; }
  }

  @media (max-width: 560px) {
    .hero { height: 62vh; min-height: 380px; }
    .hero-content { padding: 0 var(--space-lg) var(--space-md); padding-bottom: calc(var(--space-md) + 54px); }
    .hero h1 { font-size: var(--text-h2); margin-bottom: var(--space-sm); letter-spacing: -0.02em; line-height: 1.1; }
    .hero-actions { flex-direction: column; gap: var(--space-sm); width: 100%; }
    .hero-actions .btn-primary { width: 100%; min-height: 48px; font-size: var(--text-caption); }
    .hero-actions .link-quiet { align-self: center; font-size: var(--text-caption); }

    .philosophy { padding: var(--space-lg) 0; }
    .philosophy-inner { padding: 0 var(--space-lg); }
    .philosophy h2 { font-size: var(--text-h2); margin-bottom: var(--space-sm); }
    .philosophy-inner p { font-size: var(--text-body); line-height: var(--lh-relaxed); }

    .signature { padding: var(--space-xl) 0; }
    .signature-grid { gap: var(--space-md); }
    .signature-image { aspect-ratio: 4/5; max-height: 380px; }
    .signature h2 { font-size: var(--text-h2); }

    .craft { padding: var(--space-xl) 0; }
    .craft-grid { gap: var(--space-lg); }

    .editorial-carousel { padding: var(--space-xl) 0; }
    .ecarousel-item { flex: 0 0 90vw; aspect-ratio: 4 / 3; }
    .ecarousel-header { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }

    .story-block img { height: 280px; }
    .story-block + .story-block { margin-top: var(--space-xl); }
    .story-block-content { padding: var(--space-lg) var(--space-lg); }
    .story-block h2 { font-size: var(--text-h2); margin-bottom: var(--space-sm); }
    .story-block p { font-size: var(--text-body); line-height: var(--lh-relaxed); }

    .featured-products { padding: var(--space-xl) 0; }
    .featured-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
    .fp-image { aspect-ratio: 4 / 5; }
    .fp-info { gap: 2px; }
    .fp-info h3 { font-size: var(--text-subhead); }
    .fp-category { font-size: var(--text-caption); }

    .journal-preview { padding: var(--space-xl) 0; }
    .journal-grid { grid-template-columns: 1fr; }
    .journal-card:first-child .journal-image { aspect-ratio: 4 / 3; }
    .journal-image { aspect-ratio: 4 / 3; }
  }

  @media (max-width: 430px) {
    .hero h1 { font-size: var(--text-h2); margin-bottom: var(--space-md); }
    .hero-content { padding: 0 var(--space-md) var(--space-md); padding-bottom: calc(var(--space-md) + 52px); }
    .hero-actions .btn-primary { min-height: 44px; font-size: var(--text-caption); }
    .hero-actions .link-quiet { font-size: var(--text-caption); }
    .featured-grid { gap: var(--space-sm); }
    .fp-info h3 { font-size: var(--text-body); }
    .story-block img { height: 240px; }
    .story-block h2 { font-size: var(--text-subhead); }
    .story-block p { font-size: var(--text-caption); }
    .philosophy h2 { font-size: var(--text-subhead); }
    .philosophy-inner p { font-size: var(--text-caption); }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-image { animation: none; transform: scale(1); }
    .hero-eyebrow, .hero h1, .hero-sub, .hero-actions, .hero-scroll-cue,
    .trust-bar .trust-item { animation: none; opacity: 1; transform: none; }
  }
      `}</style>

      <main id="main-content">
        {/* 1. Hero — parallax, cinematic entrance */}
        <section className="hero" ref={heroRef}>
          <img className="hero-image" src="/assets/hero-luxury-entryway.png" alt="A handcrafted wooden console table with sculptural decor, warm lighting, and abstract artwork in a modern entryway." />
          <div className="hero-content">
            <span className="eyebrow eyebrow-light hero-eyebrow">Handcrafted in India</span>
            <h1>Wooden essentials, shaped by hand.</h1>
            <p className="hero-sub">Solid teak furniture and everyday objects, crafted by artisans in a small workshop. No veneer. No mass production. Just honest wood, finished by hand.</p>
            <div className="hero-actions">
              <a href="/gallery" className="btn-primary">Explore the Collection</a>
              <a href="/studio" className="link-quiet">Our Process</a>
            </div>
          </div>
          <a href="#philosophy" className="hero-scroll-cue" aria-label="Scroll to explore">
            <span>Scroll</span>
            <span className="line"></span>
          </a>
        </section>

        {/* 2. Trust Bar — staggered entrance */}
        <section className="trust-bar" id="trust">
          <div className="container">
            <div className="trust-bar-inner">
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span>Handcrafted in India</span>
              </div>
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12" /></svg>
                <span>Solid Teak, Never Veneer</span>
              </div>
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span>Built to Last Decades</span>
              </div>
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                <span>Food-Safe Oil Finish</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Philosophy — brand grounding */}
        <section className="philosophy" id="philosophy">
          <div className="philosophy-inner">
            <span className="eyebrow reveal">Why We Exist</span>
            <h2 className="reveal">We make objects that are not finished when they leave the workshop.</h2>
            <p className="reveal">A piece of solid teak keeps changing long after it reaches your home &mdash; the grain deepens, the surface catches light differently with each year of use. We build for that slow change, not against it.</p>
            <p className="reveal">This is a small family workshop in India, run by the same hands for three generations. We make fewer things, more carefully, and we are in no hurry to make more.</p>
          </div>
        </section>

        {/* 4. Signature Collection — emotional centrepiece */}
        <section className="signature" id="signature">
          <div className="container signature-grid">
            <div className="signature-image reveal">
              <img src="https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="A single hand-shaped wooden stool, photographed on a plain neutral floor." />
            </div>
            <div className="signature-text">
              <span className="signature-tag reveal">{'Piece N\u00B0 04 \u2014 This Season'}</span>
              <span className="eyebrow eyebrow-light reveal">The Signature Collection</span>
              <h2 className="reveal">This season&apos;s signature piece.</h2>
              <p className="reveal">One sculptural centrepiece, hand-carved from a single reclaimed timber block. Each edition is numbered and signed by the maker &mdash; once it finds its home, the next edition begins.</p>
              <div className="signature-actions reveal">
                <a href="/shop-detail" className="btn-primary">View This Piece</a>
                <a href="/journal" className="link-quiet">Watch It Being Made</a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Craftsmanship — image + editorial text */}
        <section className="craft">
          <div className="container">
            <div className="craft-grid">
              <div className="craft-image reveal">
                <img src="https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Close-up of hand-cut joinery on a solid teak furniture piece." loading="lazy" />
              </div>
              <div className="craft-text">
                <span className="eyebrow reveal">Craftsmanship</span>
                <h2 className="reveal">Every piece passes through one pair of hands, start to finish.</h2>
                <p className="reveal">We work in solid timber, never veneer or particleboard. A single block is selected, dried, and left to settle before a tool ever touches it &mdash; rushing this step is the most common way a piece fails early.</p>
                <p className="reveal">Joints are cut by hand and fitted dry before any finish is applied. The oil we use is food-safe and reapplied over the piece&apos;s life, not sealed under lacquer that traps moisture and cracks.</p>
                <a href="/studio" className="link-quiet reveal">Visit the Studio</a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Editorial Carousel — auto-scrolling, editorial, premium */}
        <section className="editorial-carousel">
          <div className="ecarousel-header">
            <div>
              <span className="eyebrow reveal">Featured</span>
              <h2 className="reveal">Stories &amp; collections.</h2>
            </div>
            <div className="ecarousel-controls">
              <button className="ecarousel-btn ecarousel-prev" aria-label="Previous">&larr;</button>
              <button className="ecarousel-btn ecarousel-next" aria-label="Next">&rarr;</button>
            </div>
          </div>
          <div className="ecarousel-track" ref={carouselTrackRef}>
            <a href="/shop-detail" className="ecarousel-item">
              <img src="https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="Signature Collection" loading="lazy" />
              <div className="ecarousel-caption">
                <span className="eyebrow">Signature Collection</span>
                <h3>Piece N&deg; 04 &mdash; This Season</h3>
                <p>One sculptural centrepiece, hand-carved from a single reclaimed timber block.</p>
              </div>
            </a>
            <a href="/subcategory?cat=kitchen" className="ecarousel-item">
              <img src="https://images.pexels.com/photos/4805236/pexels-photo-4805236.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="Kitchen Collection" loading="lazy" />
              <div className="ecarousel-caption">
                <span className="eyebrow">Kitchen &amp; Dining</span>
                <h3>Boards, racks &amp; tableware</h3>
                <p>Handcrafted essentials for the heart of the home.</p>
              </div>
            </a>
            <a href="/subcategory?cat=living" className="ecarousel-item">
              <img src="https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="Home Decor Collection" loading="lazy" />
              <div className="ecarousel-caption">
                <span className="eyebrow">Home D&eacute;cor</span>
                <h3>Sculptures, vases &amp; accents</h3>
                <p>Objects that bring warmth and character to any room.</p>
              </div>
            </a>
            <a href="/studio" className="ecarousel-item">
              <img src="https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="Craftsmanship Story" loading="lazy" />
              <div className="ecarousel-caption">
                <span className="eyebrow">The Workshop</span>
                <h3>Every joint, cut by hand</h3>
                <p>Mortise and tenon joinery, no metal fasteners, no shortcuts.</p>
              </div>
            </a>
          </div>
        </section>

        {/* 7. Story Block — immersive craftsmanship story */}
        <section className="story-block reveal">
          <img src="https://images.pexels.com/photos/5974417/pexels-photo-5974417.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="A craftsman's weathered hands sanding a wooden surface in the workshop." loading="lazy" />
          <div className="story-block-content">
            <span className="eyebrow eyebrow-light">The Workshop</span>
            <h2>A family workshop, unchanged in method for three generations.</h2>
            <p>The tools are old. The hands are patient. Nothing here is made to a deadline &mdash; a piece is finished when it is ready, and not before.</p>
            <a href="/studio" className="link-quiet">Read About Our Process</a>
          </div>
        </section>

        {/* 8. Story Block — documentation story */}
        <section className="story-block reveal">
          <img src="https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Timber being shaped by hand, filmed for a process video." loading="lazy" />
          <div className="story-block-content">
            <span className="eyebrow eyebrow-light">Watch It Made</span>
            <h2>Every piece is documented from timber to finish.</h2>
            <p>We don&apos;t ask you to imagine the process &mdash; we film it. Wood selection, joinery, finishing, and the hours each one takes, so you know exactly what you&apos;re buying before you buy it.</p>
            <a href="/journal" className="link-quiet">Watch the Process</a>
          </div>
        </section>

        {/* 9. Featured Products */}
        <section className="featured-products">
          <div className="container">
            <div className="featured-header">
              <div>
                <span className="eyebrow reveal">From the Collection</span>
                <h2 className="reveal">Handpicked favourites.</h2>
              </div>
              <a href="/gallery" className="link-quiet reveal" style={{ whiteSpace: 'nowrap' }}>View All &rarr;</a>
            </div>
            <div className="featured-grid">
              <a href="/shop-detail?id=anchor-table" className="fp-card reveal">
                <div className="fp-image">
                  <img src="https://images.pexels.com/photos/11112739/pexels-photo-11112739.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Anchor Table" loading="lazy" />
                  <div className="fp-quick"><span>View Piece</span></div>
                </div>
                <div className="fp-info">
                  <h3>The Anchor Table</h3>
                  <div className="fp-meta">
                    <span className="fp-category">Dining</span>
                    <span className="fp-price">{'\u20B9'}1,85,000</span>
                  </div>
                </div>
              </a>
              <a href="/shop-detail?id=bearing-chair" className="fp-card reveal">
                <div className="fp-image">
                  <img src="https://images.pexels.com/photos/29546532/pexels-photo-29546532.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Bearing Chair" loading="lazy" />
                  <div className="fp-quick"><span>View Piece</span></div>
                </div>
                <div className="fp-info">
                  <h3>The Bearing Chair</h3>
                  <div className="fp-meta">
                    <span className="fp-category">Dining</span>
                    <span className="fp-price">{'\u20B9'}68,000</span>
                  </div>
                </div>
              </a>
              <a href="/shop-detail?id=teak-serving-board" className="fp-card reveal">
                <div className="fp-image">
                  <img src="https://images.pexels.com/photos/6910978/pexels-photo-6910978.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Teak Serving Board" loading="lazy" />
                  <div className="fp-quick"><span>View Piece</span></div>
                </div>
                <div className="fp-info">
                  <h3>Teak Serving Board</h3>
                  <div className="fp-meta">
                    <span className="fp-category">Kitchen</span>
                    <span className="fp-price">{'\u20B9'}7,000</span>
                  </div>
                </div>
              </a>
              <a href="/shop-detail?id=spice-rack" className="fp-card reveal">
                <div className="fp-image">
                  <img src="https://images.pexels.com/photos/34942955/pexels-photo-34942955.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Spice Rack" loading="lazy" />
                  <div className="fp-quick"><span>View Piece</span></div>
                </div>
                <div className="fp-info">
                  <h3>Spice Rack</h3>
                  <div className="fp-meta">
                    <span className="fp-category">Kitchen</span>
                    <span className="fp-price">{'\u20B9'}9,500</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* 10. Journal Preview */}
        <section className="journal-preview">
          <div className="container">
            <div className="journal-header">
              <div>
                <span className="eyebrow reveal">From the Journal</span>
                <h2 className="reveal">Stories from the workshop.</h2>
              </div>
              <a href="/journal" className="link-quiet reveal" style={{ whiteSpace: 'nowrap' }}>Read All &rarr;</a>
            </div>
            <div className="journal-grid">
              <a href="/journal" className="journal-card reveal">
                <div className="journal-image">
                  <img src="https://images.pexels.com/photos/8465898/pexels-photo-8465898.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Close-up of wood grain on a finished tabletop." loading="lazy" />
                </div>
                <span className="eyebrow">Wood Facts</span>
                <h3>What &quot;solid wood&quot; actually means, and why the label is used loosely</h3>
                <p>Most furniture described as solid wood is a thin veneer over particleboard. Here&apos;s how to tell the difference.</p>
                <span className="journal-date">March 2026</span>
              </a>
              <a href="/journal" className="journal-card reveal">
                <div className="journal-image">
                  <img src="https://images.pexels.com/photos/7234682/pexels-photo-7234682.jpeg?auto=compress&cs=tinysrgb&w=700" alt="A hand rubbing oil finish into a wooden surface." loading="lazy" />
                </div>
                <span className="eyebrow">Details</span>
                <h3>Why we never seal wood with lacquer</h3>
                <span className="journal-date">February 2026</span>
              </a>
              <a href="/journal" className="journal-card reveal">
                <div className="journal-image">
                  <img src="https://images.pexels.com/photos/5599172/pexels-photo-5599172.jpeg?auto=compress&cs=tinysrgb&w=700" alt="Stacked timber boards drying in a workshop." loading="lazy" />
                </div>
                <span className="eyebrow">Wood Facts</span>
                <h3>How long wood needs to dry before it&apos;s usable</h3>
                <span className="journal-date">January 2026</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

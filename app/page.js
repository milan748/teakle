'use client'

import { useEffect } from 'react'

export default function Home() {

  useEffect(() => {
    const track = document.querySelector('.carousel-track')
    const prevBtn = document.querySelector('.carousel-prev')
    const nextBtn = document.querySelector('.carousel-next')
    const dots = document.querySelectorAll('.carousel-dots .dot')
    if (!track || !prevBtn || !nextBtn) return

    const scrollAmount = 240
    let currentIndex = 0
    const items = track.querySelectorAll('.carousel-item')
    const totalItems = items.length

    function updateDots() {
      const scrollLeft = track.scrollLeft
      const maxScroll = track.scrollWidth - track.clientWidth
      const itemWidth = items[0].offsetWidth + 32
      currentIndex = Math.round(scrollLeft / itemWidth)
      dots.forEach((dot, i) => {
        const active = i === currentIndex
        dot.classList.toggle('active', active)
        dot.setAttribute('aria-selected', active)
        dot.setAttribute('tabindex', active ? '0' : '-1')
      })
      prevBtn.style.opacity = scrollLeft < 5 ? '0' : '1'
      prevBtn.style.pointerEvents = scrollLeft < 5 ? 'none' : 'auto'
      nextBtn.style.opacity = scrollLeft >= maxScroll - 5 ? '0' : '1'
      nextBtn.style.pointerEvents = scrollLeft >= maxScroll - 5 ? 'none' : 'auto'
    }

    const onPrevClick = () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }

    const onNextClick = () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }

    prevBtn.addEventListener('click', onPrevClick)
    nextBtn.addEventListener('click', onNextClick)
    track.addEventListener('scroll', updateDots)
    updateDots()

    const dotClickHandlers = []
    dots.forEach((dot, i) => {
      const clickHandler = () => {
        const itemWidth = items[0].offsetWidth + 32
        track.scrollTo({ left: i * itemWidth, behavior: 'smooth' })
      }
      const keydownHandler = (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault()
          const dir = e.key === 'ArrowRight' ? 1 : -1
          const next = (i + dir + dots.length) % dots.length
          dots[next].focus()
          dots[next].click()
        }
      }
      dotClickHandlers.push({ clickHandler, keydownHandler })
      dot.addEventListener('click', clickHandler)
      dot.addEventListener('keydown', keydownHandler)
    })

    let startX, isDragging = false
    const onTouchStart = (e) => {
      startX = e.touches[0].clientX
      isDragging = true
    }
    const onTouchMove = (e) => {
      if (!isDragging) return
      const diff = startX - e.touches[0].clientX
      if (Math.abs(diff) > 5) e.preventDefault()
    }
    const onTouchEnd = (e) => {
      if (!isDragging) return
      isDragging = false
      const diff = startX - e.changedTouches[0].clientX
      if (diff > 50) track.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      else if (diff < -50) track.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }

    track.addEventListener('touchstart', onTouchStart)
    track.addEventListener('touchmove', onTouchMove, { passive: false })
    track.addEventListener('touchend', onTouchEnd)

    return () => {
      prevBtn.removeEventListener('click', onPrevClick)
      nextBtn.removeEventListener('click', onNextClick)
      track.removeEventListener('scroll', updateDots)
      dotClickHandlers.forEach(({ clickHandler, keydownHandler }, i) => {
        dots[i].removeEventListener('click', clickHandler)
        dots[i].removeEventListener('keydown', keydownHandler)
      })
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
    height: 100%;
    object-fit: cover;
    opacity: 0.88;
    transform: scale(1.08);
    animation: heroZoomOut 8s var(--ease) forwards;
  }
  @keyframes heroZoomOut {
    from { transform: scale(1.08); }
    to { transform: scale(1); }
  }
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(43,34,27,0.12) 0%, rgba(43,34,27,0.25) 45%, rgba(43,34,27,0.78) 100%);
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
    margin-bottom: var(--space-lg);
    opacity: 0;
    animation: fadeUp var(--dur-slow) var(--ease) 400ms forwards;
    font-style: italic;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    opacity: 0;
    animation: fadeUp var(--dur-slow) var(--ease) 650ms forwards;
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
    z-index: 2;
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
  }
  .trust-bar .trust-item svg {
    width: 16px;
    height: 16px;
    color: var(--bronze);
    flex-shrink: 0;
  }

  @media (max-width: 860px) {
    .hero { min-height: 0; height: 65vh; }
    .hero-content { padding: 0 var(--space-lg) var(--space-lg); padding-bottom: calc(var(--space-lg) + 56px); margin-left: 0; margin-top: 0; max-width: 100%; }
    .hero h1 { font-size: var(--text-h1); margin-bottom: var(--space-md); line-height: 1.1; }
    .hero-actions { gap: var(--space-md); }
    .hero-actions .btn-primary { min-height: 50px; padding: 0.85rem calc(var(--space-lg) + var(--space-sm)); font-size: var(--text-caption); letter-spacing: 0.12em; }
    .hero-scroll-cue { display: none; }
    .hero-edition { padding: var(--space-xl) 0; }
    .edition-grid { gap: var(--space-md); }
    .edition-image { max-height: 420px; }
    .edition-text p { font-size: var(--text-body); line-height: var(--lh-relaxed); }
    .products-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
    .carousel-item { flex: 0 0 150px; }
  }

  /* ---- Hero Edition (seasonal signature piece) ---- */
  .hero-edition {
    background: var(--walnut);
    padding: var(--space-2xl) 0;
    overflow: hidden;
  }
  .edition-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2xl);
    align-items: center;
  }
  .edition-image {
    position: relative;
    aspect-ratio: 4 / 5;
  }
  .edition-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.2s var(--ease);
  }
  .edition-image:hover img { transform: scale(1.04); }
  .edition-tag {
    display: inline-block;
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    color: var(--bronze);
    border: 1px solid color-mix(in srgb, var(--bronze), transparent 60%);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-md);
  }
  .hero-edition .eyebrow { color: var(--stone); }
  .hero-edition h2 {
    color: var(--bg-primary);
    font-size: clamp(2rem, 4vw, var(--text-h1));
    margin: var(--space-sm) 0 var(--space-md);
    max-width: none;
  }
  .hero-edition p {
    color: var(--stone);
    font-size: var(--text-body);
    max-width: 46ch;
    margin-bottom: var(--space-lg);
  }
  .edition-actions {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    flex-wrap: wrap;
    margin-bottom: var(--space-md);
  }
  .edition-actions .link-quiet {
    color: var(--bg-primary);
    border-color: rgba(247,244,238,0.4);
  }
  .edition-actions .link-quiet:hover {
    color: var(--bronze);
    border-color: var(--bronze);
  }
  .edition-past {
    font-size: var(--text-caption);
    letter-spacing: 0.04em;
    color: var(--stone);
    opacity: 0.8;
  }
  .edition-past a { color: var(--bronze); border-bottom: 1px solid color-mix(in srgb, var(--bronze), transparent 60%); }
  .edition-past a:hover { border-color: var(--bronze); }

  @media (max-width: 860px) {
    .edition-grid { grid-template-columns: 1fr; gap: var(--space-md); }
  }

  /* ---- Story Block (Poliform-style full-bleed editorial section) ---- */
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
  }
  .story-block .link-quiet { color: var(--bg-primary); border-color: rgba(247,244,238,0.4); }
  .story-block .link-quiet:hover { color: var(--bronze); border-color: var(--bronze); }

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

  /* ---- Collection Carousel ---- */
  .collection-carousel {
    background: var(--bg-primary);
    padding: var(--space-lg) var(--space-md) var(--space-md);
    overflow: hidden;
    position: relative;
  }
  .carousel-arrow {
    position: absolute;
    top: 40%;
    transform: translateY(-50%);
    z-index: 5;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--text-primary);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
    line-height: 1;
  }
  .carousel-arrow:active { transform: translateY(-50%) scale(0.92); }
  .carousel-arrow:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
  .carousel-arrow:hover {
    background: var(--text-primary);
    color: var(--bg-primary);
  }
  .carousel-prev { left: var(--space-md); }
  .carousel-next { right: var(--space-md); }
  .carousel-track {
    display: flex;
    gap: var(--space-md);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .carousel-track::-webkit-scrollbar { display: none; }
  .carousel-item {
    flex: 0 0 220px;
    scroll-snap-align: start;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }
  .carousel-image {
    width: 100%;
    aspect-ratio: 4 / 5;
    background: var(--stone);
    overflow: hidden;
  }
  .carousel-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .carousel-label {
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-primary);
  }
  .btn-outline-sm {
    display: inline-block;
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid var(--text-primary);
    padding: 0.4em 1.4em;
    color: var(--text-primary);
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
  }
  .btn-outline-sm:hover {
    background: var(--text-primary);
    color: var(--bg-primary);
  }
  .btn-outline-sm:active { transform: scale(0.97); }
  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-md) 0 var(--space-xs);
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--stone);
    border: none;
    padding: 12px;
    margin: -12px;
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease);
  }
  .dot:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
  .dot.active { background: var(--text-primary); }

  /* ---- Explore Our Products ---- */
  .explore-products {
    background: var(--bg-primary);
    padding: var(--space-xl) 0 var(--space-lg);
  }
  .explore-header {
    margin-bottom: var(--space-lg);
  }
  .explore-header h2 {
    font-size: clamp(1.5rem, 3vw, var(--text-h2));
    max-width: none;
    margin-top: var(--space-xs);
  }
  .products-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
  }
  .product-card {
    display: block;
    background: var(--bg-primary);
    padding-bottom: var(--space-sm);
  }
  .product-image {
    aspect-ratio: 4 / 5;
    background: var(--stone);
    overflow: hidden;
    margin-bottom: var(--space-md);
    border-radius: var(--radius-sm);
  }
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--dur-slow) var(--ease);
  }
  .product-card:hover .product-image img { transform: scale(1.04); }
  .product-card:hover { box-shadow: var(--shadow-card-hover); }
  .product-card:active .product-image img { transform: scale(0.98); }
  .product-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  .product-info h3 {
    font-size: var(--text-subhead);
    font-weight: 600;
    margin-bottom: 2px;
    max-width: none;
    line-height: 1.3;
    transition: color var(--dur-fast) var(--ease);
  }
  .product-card:hover .product-info h3 { color: var(--bronze); }
  .product-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  .product-price {
    font-size: var(--text-caption);
    color: var(--text-secondary);
    letter-spacing: 0.02em;
  }
  .product-category {
    font-size: var(--text-caption);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-secondary);
    line-height: 1.3;
  }
  .explore-cta {
    text-align: center;
    margin-top: var(--space-sm);
  }

  /* ---- Craftsmanship ---- */
  .craft {
    background: var(--bg-primary);
    padding: var(--space-xl) 0;
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
  }
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

  @media (max-width: 860px) {
    .products-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
    .product-card { padding-bottom: 0; }
    .product-image { aspect-ratio: 4 / 5; margin-bottom: var(--space-sm); }
    .product-info { flex-direction: column; align-items: flex-start; gap: var(--space-xs); }
    .product-info h3 { font-size: var(--text-subhead); }
    .product-category { font-size: var(--text-caption); }
    .carousel-item { flex: 0 0 150px; }

    .hero-edition { padding: var(--space-xl) 0; }
    .collection-carousel { padding: var(--space-xl) var(--space-md) var(--space-md); }
    .explore-products { padding: var(--space-xl) 0; }
    .explore-header { margin-bottom: var(--space-lg); }
    .craft { padding: var(--space-xl) 0; }
    .craft-grid { grid-template-columns: 1fr; gap: var(--space-lg); }
    .craft-image img { aspect-ratio: 16 / 9; }
    .trust-bar-inner { gap: var(--space-md); }
    .trust-bar .trust-item { font-size: 0.65rem; }

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

    .philosophy { padding: var(--space-xl) 0; }
    .philosophy-inner { padding: 0 calc(var(--space-lg) + var(--space-sm)); max-width: 100%; text-align: center; }
    .philosophy .eyebrow { justify-content: center; margin-bottom: var(--space-md); }
    .philosophy h2 { font-size: var(--text-h2); margin-bottom: var(--space-md); line-height: 1.3; max-width: none; }
    .philosophy-inner p { font-size: var(--text-body); line-height: var(--lh-relaxed); max-width: 52ch; margin-left: auto; margin-right: auto; }
  }

  @media (max-width: 560px) {
    .hero { height: 62vh; min-height: 380px; }
    .hero-content { padding: 0 var(--space-lg) var(--space-md); padding-bottom: calc(var(--space-md) + 54px); }
    .hero h1 { font-size: var(--text-h2); margin-bottom: var(--space-sm); letter-spacing: -0.02em; line-height: 1.1; }
    .hero-actions { flex-direction: column; gap: var(--space-sm); width: 100%; }
    .hero-actions .btn-primary { width: 100%; min-height: 48px; font-size: var(--text-caption); }
    .hero-actions .link-quiet { align-self: center; font-size: var(--text-caption); }
    .hero-edition { padding: var(--space-xl) 0; }
    .edition-grid { gap: var(--space-md); }
    .edition-image { aspect-ratio: 4/5; max-height: 380px; }
    .edition-text { padding: var(--space-md) 0 0; }
    .edition-text .eyebrow { font-size: var(--text-caption); }
    .edition-text p { font-size: var(--text-body); }
    .collection-carousel { padding: var(--space-xl) var(--space-sm) var(--space-md); }
    .carousel-item { min-height: 44px; }
    .story-block img { height: 280px; }
    .story-block + .story-block { margin-top: var(--space-xl); }
    .story-block-content { padding: var(--space-lg) var(--space-lg); }
    .story-block h2 { font-size: var(--text-h2); margin-bottom: var(--space-sm); }
    .story-block p { font-size: var(--text-body); line-height: var(--lh-relaxed); }
    .philosophy { padding: var(--space-lg) 0; }
    .philosophy-inner { padding: 0 var(--space-lg); }
    .philosophy h2 { font-size: var(--text-h2); margin-bottom: var(--space-sm); }
    .philosophy-inner p { font-size: var(--text-body); line-height: var(--lh-relaxed); }
    .products-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
    .product-image { aspect-ratio: 4 / 5; margin-bottom: var(--space-sm); }
    .product-info { gap: 2px; }
    .product-info h3 { font-size: var(--text-subhead); }
    .product-category { font-size: var(--text-caption); }
    .carousel-item { flex: 0 0 130px; }
  }

  @media (max-width: 430px) {
    .hero h1 { font-size: var(--text-h2); margin-bottom: var(--space-md); }
    .hero-content { padding: 0 var(--space-md) var(--space-md); padding-bottom: calc(var(--space-md) + 52px); }
    .hero-actions .btn-primary { min-height: 44px; font-size: var(--text-caption); }
    .hero-actions .link-quiet { font-size: var(--text-caption); }
    .edition-text p { font-size: var(--text-body); }
    .products-grid { gap: var(--space-sm); }
    .product-info h3 { font-size: var(--text-body); }
    .story-block img { height: 240px; }
    .story-block h2 { font-size: var(--text-subhead); }
    .story-block p { font-size: var(--text-caption); }
    .philosophy h2 { font-size: var(--text-subhead); }
    .philosophy-inner p { font-size: var(--text-caption); }
    .carousel-item { flex: 0 0 110px; }
  }
      `}</style>

      <main id="main-content">
        <section className="hero">
          <img className="hero-image" src="/assets/hero-luxury-entryway.png" alt="A luxury entryway featuring a handcrafted wooden console table with sculptural decor, warm ambient lighting, and abstract artwork." />
          <div className="hero-content">
            <span className="eyebrow eyebrow-light hero-eyebrow">An Indian Workshop</span>
            <h1>Where wood becomes timeless art.</h1>
            <div className="hero-actions">
              <a href="/gallery" className="btn-primary">View the Gallery</a>
              <a href="/studio" className="link-quiet">Our Studio</a>
            </div>
          </div>
          <a href="#philosophy" className="hero-scroll-cue" aria-label="Scroll to explore">
            <span>Scroll</span>
            <span className="line"></span>
          </a>
        </section>

        <section className="trust-bar">
          <div className="container">
            <div className="trust-bar-inner">
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span>Handcrafted in India</span>
              </div>
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12" /></svg>
                <span>Solid Timber, Never Veneer</span>
              </div>
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                <span>White-Glove Delivery</span>
              </div>
              <div className="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                <span>Made to Order</span>
              </div>
            </div>
          </div>
        </section>

        <section className="philosophy" id="philosophy">
          <div className="philosophy-inner">
            <span className="eyebrow reveal">Why We Exist</span>
            <h2 className="reveal">We make objects that are not finished when they leave the workshop.</h2>
            <p className="reveal">A piece of solid teak keeps changing long after it reaches your home — the grain deepens, the surface catches light differently with each year of use. We build for that slow change, not against it.</p>
            <p className="reveal">This is a small family workshop in India, run by the same hands for three generations. We make fewer things, more carefully, and we are in no hurry to make more.</p>
          </div>
        </section>

        <section className="hero-edition">
          <div className="container edition-grid">
            <div className="edition-image reveal">
              <img src="https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="A single hand-shaped wooden stool, photographed on a plain neutral floor." />
            </div>
            <div className="edition-text">
              <span className="edition-tag reveal">Piece N° 04 — This Season</span>
              <span className="eyebrow eyebrow-light reveal">The Hero Edition</span>
              <h2 className="reveal">This season&apos;s hero.</h2>
              <p className="reveal">One sculptural centrepiece, carved from a single reclaimed timber block. It is never restocked and never discounted — once it&apos;s gone, the next edition begins.</p>
              <div className="edition-actions reveal">
                <a href="/shop-detail" className="btn-primary">View This Piece</a>
                <a href="/journal" className="link-quiet">Watch It Being Made</a>
              </div>
              <p className="edition-past reveal">Looking for something from a past season? <a href="/archive">See past editions</a>.</p>
            </div>
          </div>
        </section>

        <section className="collection-carousel">
          <button className="carousel-arrow carousel-prev" aria-label="Previous">&#8592;</button>
          <button className="carousel-arrow carousel-next" aria-label="Next">&#8594;</button>
          <div className="carousel-track">
            <a href="/shop-detail?id=anchor-table" className="carousel-item reveal">
              <div className="carousel-image"><img src="https://images.pexels.com/photos/11112739/pexels-photo-11112739.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Anchor Table" /></div>
              <span className="carousel-label">The Anchor Table</span>
              <span className="btn-outline-sm">Discover</span>
            </a>
            <a href="/shop-detail?id=bearing-chair" className="carousel-item reveal">
              <div className="carousel-image"><img src="https://images.pexels.com/photos/29546532/pexels-photo-29546532.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Bearing Chair" /></div>
              <span className="carousel-label">The Bearing Chair</span>
              <span className="btn-outline-sm">Discover</span>
            </a>
            <a href="/shop-detail?id=teak-serving-board" className="carousel-item reveal">
              <div className="carousel-image"><img src="https://images.pexels.com/photos/6910978/pexels-photo-6910978.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Teak Serving Board" /></div>
              <span className="carousel-label">Teak Serving Board</span>
              <span className="btn-outline-sm">Discover</span>
            </a>
            <a href="/shop-detail?id=carving-board" className="carousel-item reveal">
              <div className="carousel-image"><img src="https://images.pexels.com/photos/7123134/pexels-photo-7123134.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Carving Board" /></div>
              <span className="carousel-label">Carving Board</span>
              <span className="btn-outline-sm">Discover</span>
            </a>
            <a href="/shop-detail?id=spice-rack" className="carousel-item reveal">
              <div className="carousel-image"><img src="https://images.pexels.com/photos/34942955/pexels-photo-34942955.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Spice Rack" /></div>
              <span className="carousel-label">Spice Rack</span>
              <span className="btn-outline-sm">Discover</span>
            </a>
            <a href="/shop-detail?id=drift-sculpture" className="carousel-item reveal">
              <div className="carousel-image"><img src="https://images.pexels.com/photos/4612501/pexels-photo-4612501.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Drift Sculpture" /></div>
              <span className="carousel-label">Drift Sculpture</span>
              <span className="btn-outline-sm">Discover</span>
            </a>
            <a href="/shop-detail?id=hourglass-vase" className="carousel-item reveal">
              <div className="carousel-image"><img src="https://images.pexels.com/photos/10677815/pexels-photo-10677815.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Hourglass Vase" /></div>
              <span className="carousel-label">Hourglass Vase</span>
              <span className="btn-outline-sm">Discover</span>
            </a>
          </div>
          <div className="carousel-dots" role="tablist" aria-label="Carousel slides">
            <button className="dot active" role="tab" aria-selected="true" aria-label="Slide 1" tabIndex="0"></button>
            <button className="dot" role="tab" aria-selected="false" aria-label="Slide 2" tabIndex="-1"></button>
            <button className="dot" role="tab" aria-selected="false" aria-label="Slide 3" tabIndex="-1"></button>
            <button className="dot" role="tab" aria-selected="false" aria-label="Slide 4" tabIndex="-1"></button>
            <button className="dot" role="tab" aria-selected="false" aria-label="Slide 5" tabIndex="-1"></button>
            <button className="dot" role="tab" aria-selected="false" aria-label="Slide 6" tabIndex="-1"></button>
            <button className="dot" role="tab" aria-selected="false" aria-label="Slide 7" tabIndex="-1"></button>
          </div>
        </section>

        <section className="explore-products">
          <div className="container">
            <div className="explore-header reveal">
              <span className="eyebrow">From the Collection</span>
              <h2>Pieces Built to Last</h2>
            </div>
            <div className="products-grid">
              <a href="/shop-detail?id=anchor-table" className="product-card reveal">
                <div className="product-image"><img src="https://images.pexels.com/photos/11112739/pexels-photo-11112739.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Anchor Table" loading="lazy" /></div>
                <div className="product-info">
                  <div>
                    <h3>The Anchor Table</h3>
                    <div className="product-meta">
                      <span className="product-category">Dining</span>
                      <span className="product-price">₹1,85,000</span>
                    </div>
                  </div>
                </div>
              </a>
              <a href="/shop-detail?id=bearing-chair" className="product-card reveal">
                <div className="product-image"><img src="https://images.pexels.com/photos/29546532/pexels-photo-29546532.jpeg?auto=compress&cs=tinysrgb&w=600" alt="The Bearing Chair" loading="lazy" /></div>
                <div className="product-info">
                  <div>
                    <h3>The Bearing Chair</h3>
                    <div className="product-meta">
                      <span className="product-category">Dining</span>
                      <span className="product-price">₹68,000</span>
                    </div>
                  </div>
                </div>
              </a>
              <a href="/shop-detail?id=teak-serving-board" className="product-card reveal">
                <div className="product-image"><img src="https://images.pexels.com/photos/6910978/pexels-photo-6910978.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Teak Serving Board" loading="lazy" /></div>
                <div className="product-info">
                  <div>
                    <h3>Teak Serving Board</h3>
                    <div className="product-meta">
                      <span className="product-category">Kitchen</span>
                      <span className="product-price">₹7,000</span>
                    </div>
                  </div>
                </div>
              </a>
              <a href="/shop-detail?id=spice-rack" className="product-card reveal">
                <div className="product-image"><img src="https://images.pexels.com/photos/34942955/pexels-photo-34942955.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Spice Rack" loading="lazy" /></div>
                <div className="product-info">
                  <div>
                    <h3>Spice Rack</h3>
                    <div className="product-meta">
                      <span className="product-category">Kitchen</span>
                      <span className="product-price">₹9,500</span>
                    </div>
                  </div>
                </div>
              </a>
              <a href="/shop-detail?id=drift-sculpture" className="product-card reveal">
                <div className="product-image"><img src="https://images.pexels.com/photos/4612501/pexels-photo-4612501.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Drift Sculpture" loading="lazy" /></div>
                <div className="product-info">
                  <div>
                    <h3>Drift Sculpture</h3>
                    <div className="product-meta">
                      <span className="product-category">Living</span>
                      <span className="product-price">₹24,000</span>
                    </div>
                  </div>
                </div>
              </a>
              <a href="/shop-detail?id=hourglass-vase" className="product-card reveal">
                <div className="product-image"><img src="https://images.pexels.com/photos/10677815/pexels-photo-10677815.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Hourglass Vase" loading="lazy" /></div>
                <div className="product-info">
                  <div>
                    <h3>Hourglass Vase</h3>
                    <div className="product-meta">
                      <span className="product-category">Living</span>
                      <span className="product-price">₹9,500</span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
            <div className="explore-cta reveal">
              <a href="/gallery" className="btn-primary">Explore the Full Collection</a>
            </div>
          </div>
        </section>

        <section className="craft">
          <div className="container">
            <div className="craft-grid">
              <div className="craft-image reveal">
                <img src="https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Close-up of hand-cut joinery on a solid teak furniture piece." loading="lazy" />
              </div>
              <div className="craft-text">
                <span className="eyebrow reveal">Craftsmanship</span>
                <h2 className="reveal">Every piece passes through one pair of hands, start to finish.</h2>
                <p className="reveal">We work in solid timber, never veneer or particleboard. A single block is selected, dried, and left to settle before a tool ever touches it — rushing this step is the most common way a piece fails early.</p>
                <p className="reveal">Joints are cut by hand and fitted dry before any finish is applied. The oil we use is food-safe and reapplied over the piece&apos;s life, not sealed under lacquer that traps moisture and cracks.</p>
                <a href="/studio" className="link-quiet reveal">Visit the Studio</a>
              </div>
            </div>
          </div>
        </section>

        <section className="story-block reveal">
          <img src="https://images.pexels.com/photos/5974417/pexels-photo-5974417.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="A craftsman's weathered hands sanding a wooden surface in the workshop." loading="lazy" />
          <div className="story-block-content">
            <span className="eyebrow eyebrow-light">The Workshop</span>
            <h2>A family workshop, unchanged in method for three generations.</h2>
            <p>The tools are old. The hands are patient. Nothing here is made to a deadline — a piece is finished when it is ready, and not before.</p>
            <a href="/studio" className="link-quiet">Read About Our Process</a>
          </div>
        </section>

        <section className="story-block reveal">
          <img src="https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Timber being shaped by hand, filmed for a process video." loading="lazy" />
          <div className="story-block-content">
            <span className="eyebrow eyebrow-light">Watch It Made</span>
            <h2>Every piece is documented from timber to finish.</h2>
            <p>We don&apos;t ask you to imagine the process — we film it. Wood selection, joinery, finishing, and the hours each one takes, so you know exactly what you&apos;re buying before you buy it.</p>
            <a href="/journal" className="link-quiet">Watch the Process</a>
          </div>
        </section>
      </main>
    </>
  )
}

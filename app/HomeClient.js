'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function HomeClient() {
  const heroRef = useRef(null)
  const carouselTrackRef = useRef(null)

  /* ---- Hero parallax on scroll ---- */
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const img = hero.querySelector('.v2-hero-img')
    if (!img) return

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY
          const h = hero.offsetHeight
          if (y < h) {
            const p = y / h
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
    if (!items.length) return

    let idx = 0, hovered = false, userPause = false, pauseTimer = null

    function go(i) {
      const w = items[0].offsetWidth + 32
      track.scrollTo({ left: i * w, behavior: 'smooth' })
      idx = i
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

    return () => {
      clearInterval(timer)
      clearTimeout(pauseTimer)
      if (prev) prev.removeEventListener('click', onPrev)
      if (next) next.removeEventListener('click', onNext)
      track.removeEventListener('touchstart', ts)
      track.removeEventListener('touchmove', tm)
      track.removeEventListener('touchend', te)
    }
  }, [])

  return (
    <>
      <style>{`
  /* ================================================================
     HOMEPAGE V2 — Premium Editorial
     ================================================================ */

  /* ---- Hero ---- */
  .v2-hero {
    position: relative;
    height: 100vh;
    height: 100dvh;
    min-height: 680px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    background: var(--walnut);
  }
  .v2-hero-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 120%;
    object-fit: cover;
    opacity: 0.9;
    will-change: transform, opacity;
    transform: scale(1.12);
    animation: v2heroZoom 14s var(--ease) forwards;
  }
  @keyframes v2heroZoom {
    from { transform: scale(1.12); }
    to { transform: scale(1); }
  }
  .v2-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
      rgba(51,38,29,0.10) 0%,
      rgba(51,38,29,0.25) 40%,
      rgba(51,38,29,0.70) 75%,
      rgba(51,38,29,0.88) 100%);
    z-index: 1;
  }
  .v2-hero-content {
    position: relative;
    z-index: 2;
    padding: 0 var(--space-md) var(--space-2xl);
    max-width: 920px;
    margin-left: 4vw;
  }
  .v2-hero-eyebrow {
    font-size: var(--text-label);
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--stone);
    margin-bottom: var(--space-md);
    opacity: 0;
    animation: v2fadeUp 800ms var(--ease) 200ms forwards;
  }
  .v2-hero h1 {
    font-size: clamp(2.75rem, 7vw, var(--text-hero));
    font-weight: 600;
    font-style: italic;
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--bg-primary);
    margin-bottom: var(--space-lg);
    opacity: 0;
    animation: v2fadeUp 900ms var(--ease) 400ms forwards;
  }
  .v2-hero-actions {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    flex-wrap: wrap;
    opacity: 0;
    animation: v2fadeUp 800ms var(--ease) 650ms forwards;
  }
  .v2-hero-actions .link-quiet {
    color: var(--bg-primary);
    border-color: rgba(247,244,238,0.4);
  }
  .v2-hero-actions .link-quiet:hover {
    color: var(--bronze);
    border-color: var(--bronze);
  }

  .v2-scroll {
    position: absolute;
    left: 50%;
    bottom: var(--space-md);
    transform: translateX(-50%);
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    color: var(--stone);
    opacity: 0;
    animation: v2fadeUp 600ms var(--ease) 1100ms forwards;
  }
  .v2-scroll span {
    font-size: var(--text-caption);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .v2-scroll-line {
    width: 1px;
    height: 34px;
    background: linear-gradient(180deg, var(--bronze), transparent);
    animation: v2scrollPulse 2.2s var(--ease) infinite;
  }
  @keyframes v2scrollPulse {
    0% { transform: scaleY(0); transform-origin: top; opacity: 1; }
    50% { transform: scaleY(1); transform-origin: top; opacity: 1; }
    51% { transform-origin: bottom; }
    100% { transform: scaleY(0); transform-origin: bottom; opacity: 0.4; }
  }

  @keyframes v2fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ---- Trust Bar ---- */
  .v2-trust {
    background: var(--bg-secondary);
    padding: var(--space-md) 0;
    border-bottom: var(--border-subtle);
  }
  .v2-trust-inner {
    display: flex;
    justify-content: center;
    gap: var(--space-xl);
    flex-wrap: wrap;
  }
  .v2-trust-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .v2-trust-item svg {
    width: 16px;
    height: 16px;
    color: var(--bronze);
    flex-shrink: 0;
  }

  /* ---- Philosophy ---- */
  .v2-philosophy {
    background: var(--bg-primary);
    padding: var(--space-2xl) 0;
  }
  .v2-philosophy-inner {
    max-width: 90%;
    margin: 0 auto;
    text-align: left;
    padding: 0 var(--space-md);
  }
  .v2-philosophy .eyebrow {
    margin-bottom: var(--space-md);
  }
  .v2-philosophy h2 {
    font-size: clamp(1.75rem, 3.4vw, var(--text-h2));
    margin-bottom: var(--space-md);
    max-width: none;
  }
  .v2-philosophy p {
    max-width: none;
    font-size: var(--text-body);
    color: var(--text-secondary);
    line-height: var(--lh-relaxed);
  }
  .v2-philosophy p + p {
    margin-top: var(--space-sm);
  }

  /* ---- Signature Collection ---- */
  .v2-signature {
    background: var(--walnut);
    padding: var(--space-2xl) 0;
    overflow: hidden;
  }
  .v2-sig-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2xl);
    align-items: center;
    max-width: var(--container);
    margin: 0 auto;
    padding: 0 var(--space-md);
  }
  .v2-sig-img {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
  }
  .v2-sig-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.4s var(--ease);
  }
  .v2-sig-img:hover img { transform: scale(1.03); }
  .v2-sig-tag {
    display: inline-block;
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    color: var(--bronze);
    border: 1px solid color-mix(in srgb, var(--bronze), transparent 60%);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-md);
  }
  .v2-sig-text .eyebrow { color: var(--stone); }
  .v2-sig-text h2 {
    color: var(--bg-primary);
    font-size: clamp(2rem, 4vw, var(--text-h1));
    margin: var(--space-sm) 0 var(--space-md);
    max-width: none;
  }
  .v2-sig-text p {
    color: var(--stone);
    font-size: var(--text-body);
    max-width: 46ch;
    margin-bottom: var(--space-lg);
    line-height: var(--lh-relaxed);
  }
  .v2-sig-actions {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    flex-wrap: wrap;
    margin-bottom: var(--space-md);
  }
  .v2-sig-actions .link-quiet {
    color: var(--bg-primary);
    border-color: rgba(247,244,238,0.4);
  }
  .v2-sig-actions .link-quiet:hover {
    color: var(--bronze);
    border-color: var(--bronze);
  }
  .v2-sig-past {
    font-size: var(--text-caption);
    letter-spacing: 0.04em;
    color: var(--stone);
    opacity: 0.8;
  }
  .v2-sig-past a { color: var(--bronze); border-bottom: 1px solid color-mix(in srgb, var(--bronze), transparent 60%); }
  .v2-sig-past a:hover { border-color: var(--bronze); }

  /* ---- Craftsmanship ---- */
  .v2-craft {
    background: var(--bg-primary);
    padding: var(--space-2xl) 0;
  }
  .v2-craft-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
    align-items: center;
    max-width: var(--container);
    margin: 0 auto;
    padding: 0 var(--space-md);
  }
  .v2-craft-img {
    position: relative;
    overflow: hidden;
  }
  .v2-craft-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    aspect-ratio: 4 / 5;
    transition: transform 1.2s var(--ease);
  }
  .v2-craft-img:hover img { transform: scale(1.03); }
  .v2-craft-text h2 {
    font-size: clamp(1.75rem, 3.4vw, var(--text-h2));
    margin-bottom: var(--space-md);
    max-width: none;
  }
  .v2-craft-text p {
    max-width: none;
    font-size: var(--text-body);
    color: var(--text-secondary);
    line-height: var(--lh-relaxed);
  }
  .v2-craft-text p + p {
    margin-top: var(--space-sm);
  }
  .v2-craft-text .link-quiet {
    display: inline-block;
    margin-top: var(--space-md);
  }

  /* ---- Editorial Carousel ---- */
  .v2-carousel {
    background: var(--bg-primary);
    padding: var(--space-lg) var(--space-md) var(--space-md);
    overflow: hidden;
    position: relative;
  }
  .v2-cprev, .v2-cnext {
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
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), opacity var(--dur-fast) var(--ease);
    line-height: 1;
  }
  .v2-cprev:hover, .v2-cnext:hover {
    background: var(--text-primary);
    color: var(--bg-primary);
  }
  .v2-cprev { left: var(--space-md); }
  .v2-cnext { right: var(--space-md); }
  .v2-ctrack {
    display: flex;
    gap: var(--space-md);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .v2-ctrack::-webkit-scrollbar { display: none; }
  .v2-citem {
    flex: 0 0 220px;
    scroll-snap-align: start;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }
  .v2-cimage {
    width: 100%;
    aspect-ratio: 4 / 5;
    background: var(--stone);
    overflow: hidden;
  }
  .v2-cimage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--dur-slow) var(--ease);
  }
  .v2-citem:hover .v2-cimage img { transform: scale(1.04); }
  .v2-clabel {
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-primary);
  }
  .v2-cbtn {
    display: inline-block;
    font-size: var(--text-caption);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid var(--text-primary);
    padding: 0.4em 1.4em;
    color: var(--text-primary);
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }
  .v2-cbtn:hover {
    background: var(--text-primary);
    color: var(--bg-primary);
  }
  .v2-cdots {
    display: flex;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-md) 0 var(--space-xs);
  }
  .v2cdot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--stone);
    transition: background var(--dur-fast) var(--ease);
  }
  .v2cdot.active { background: var(--text-primary); }

  /* ---- Products ---- */
  .v2-products {
    background: var(--bg-primary);
    padding: var(--space-xl) 0 var(--space-lg);
  }
  .v2-products-head {
    margin-bottom: var(--space-lg);
  }
  .v2-products-head h2 {
    font-size: clamp(1.5rem, 3vw, var(--text-h2));
    max-width: none;
    margin-top: var(--space-xs);
  }
  .v2-pgrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
  }
  .v2-pcard {
    display: block;
    background: var(--bg-primary);
    padding-bottom: var(--space-sm);
  }
  .v2-pimg {
    aspect-ratio: 4 / 5;
    background: var(--stone);
    overflow: hidden;
    margin-bottom: var(--space-md);
    border-radius: var(--radius-sm);
  }
  .v2-pimg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--dur-slow) var(--ease);
  }
  .v2-pcard:hover .v2-pimg img { transform: scale(1.03); }
  .v2-pinfo {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  .v2-pinfo h3 {
    font-size: var(--text-subhead);
    font-weight: 600;
    margin-bottom: 2px;
    max-width: none;
    line-height: 1.3;
  }
  .v2-pmeta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  .v2-pcat {
    font-size: var(--text-caption);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-secondary);
    line-height: 1.3;
  }
  .v2-pprice {
    font-size: var(--text-caption);
    color: var(--text-secondary);
    letter-spacing: 0.02em;
  }
  .v2-pcta {
    text-align: center;
    margin-top: var(--space-sm);
  }

  /* ---- Lifestyle (Story Block) ---- */
  .v2-lifestyle {
    position: relative;
    height: 88vh;
    min-height: 560px;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
  }
  .v2-lifestyle-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.2s var(--ease);
  }
  .v2-lifestyle:hover .v2-lifestyle-bg { transform: scale(1.03); }
  .v2-lifestyle::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(51,38,29,0.72) 0%, rgba(51,38,29,0.1) 55%, transparent 100%);
  }
  .v2-lifestyle-content {
    position: relative;
    z-index: 2;
    padding: var(--space-xl) var(--space-md);
    max-width: 640px;
  }
  .v2-lifestyle .eyebrow { color: var(--stone); margin-bottom: var(--space-sm); }
  .v2-lifestyle h2 {
    color: var(--bg-primary);
    font-size: clamp(2rem, 4vw, var(--text-h1));
    margin-bottom: var(--space-sm);
    max-width: none;
  }
  .v2-lifestyle p {
    color: var(--stone);
    font-size: var(--text-body);
    max-width: 48ch;
    margin-bottom: var(--space-md);
    line-height: var(--lh-relaxed);
  }
  .v2-lifestyle .link-quiet { color: var(--bg-primary); border-color: rgba(247,244,238,0.4); }
  .v2-lifestyle .link-quiet:hover { color: var(--bronze); border-color: var(--bronze); }

  /* ================================================================
     RESPONSIVE
     ================================================================ */

  @media (max-width: 860px) {
    .v2-hero { min-height: 0; height: 65vh; }
    .v2-hero-content { padding: 0 var(--space-lg) var(--space-lg); padding-bottom: calc(var(--space-lg) + 56px); margin-left: 0; margin-top: 0; max-width: 100%; }
    .v2-hero h1 { font-size: var(--text-h1); margin-bottom: var(--space-md); line-height: 1.1; }
    .v2-hero-actions { gap: var(--space-md); }
    .v2-hero-actions .btn-primary { min-height: 50px; padding: 0.85rem calc(var(--space-lg) + var(--space-sm)); font-size: var(--text-caption); letter-spacing: 0.12em; }
    .v2-scroll { display: none; }

    .v2-trust-inner { gap: var(--space-md); }
    .v2-trust-item { font-size: 0.65rem; }

    .v2-signature { padding: var(--space-xl) 0; }
    .v2-sig-grid { grid-template-columns: 1fr; gap: var(--space-md); }
    .v2-sig-img { max-height: 420px; }

    .v2-craft { padding: var(--space-xl) 0; }
    .v2-craft-grid { grid-template-columns: 1fr; gap: var(--space-lg); }
    .v2-craft-img img { aspect-ratio: 16 / 9; }

    .v2-citem { flex: 0 0 150px; }

    .v2-lifestyle {
      display: block;
      height: auto;
      min-height: 0;
      background: var(--bg-primary);
      overflow: hidden;
    }
    .v2-lifestyle + .v2-lifestyle { margin-top: var(--space-xl); }
    .v2-lifestyle-bg {
      position: relative;
      width: 100%;
      height: 380px;
      object-fit: cover;
      transform: none;
    }
    .v2-lifestyle:hover .v2-lifestyle-bg { transform: none; }
    .v2-lifestyle::after { display: none; }
    .v2-lifestyle-content {
      position: relative;
      z-index: 2;
      padding: var(--space-lg);
      max-width: 100%;
    }
    .v2-lifestyle .eyebrow { color: var(--bronze); font-size: var(--text-caption); }
    .v2-lifestyle h2 { color: var(--text-primary); font-size: var(--text-h2); line-height: 1.25; }
    .v2-lifestyle p { color: var(--text-secondary); max-width: none; }
    .v2-lifestyle .link-quiet { color: var(--bronze); border-color: var(--bronze); font-size: var(--text-caption); }

    .v2-pgrid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
    .v2-pcard { padding-bottom: 0; }
    .v2-pimg { margin-bottom: var(--space-sm); }
    .v2-pinfo { flex-direction: column; align-items: flex-start; gap: var(--space-xs); }

    .v2-philosophy { padding: var(--space-xl) 0; }
    .v2-philosophy-inner { padding: 0 calc(var(--space-lg) + var(--space-sm)); max-width: 100%; text-align: center; }
    .v2-philosophy .eyebrow { justify-content: center; margin-bottom: var(--space-md); }
    .v2-philosophy h2 { font-size: var(--text-h2); margin-bottom: var(--space-md); line-height: 1.3; max-width: none; }
    .v2-philosophy p { font-size: var(--text-body); line-height: var(--lh-relaxed); max-width: 52ch; margin-left: auto; margin-right: auto; }
  }

  @media (max-width: 560px) {
    .v2-hero { height: 62vh; min-height: 380px; }
    .v2-hero-content { padding: 0 var(--space-lg) var(--space-md); padding-bottom: calc(var(--space-md) + 52px); }
    .v2-hero h1 { font-size: var(--text-h2); margin-bottom: var(--space-sm); letter-spacing: -0.02em; line-height: 1.1; }
    .v2-hero-actions { flex-direction: column; gap: var(--space-sm); width: 100%; }
    .v2-hero-actions .btn-primary { width: 100%; min-height: 50px; font-size: var(--text-caption); }
    .v2-hero-actions .link-quiet { align-self: center; font-size: var(--text-caption); }

    .v2-signature { padding: var(--space-xl) 0; }
    .v2-sig-img { max-height: 380px; }
    .v2-sig-text { padding: var(--space-md) 0 0; }

    .v2-craft { padding: var(--space-xl) 0; }

    .v2-carousel { padding: var(--space-xl) var(--space-sm) var(--space-md); }
    .v2-citem { flex: 0 0 130px; }

    .v2-lifestyle-bg { height: 320px; }
    .v2-lifestyle-content { padding: var(--space-lg); }
    .v2-lifestyle h2 { font-size: var(--text-h2); margin-bottom: var(--space-sm); }

    .v2-products { padding: var(--space-xl) 0; }
    .v2-pgrid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
    .v2-pimg { aspect-ratio: 4 / 5; margin-bottom: var(--space-sm); }
    .v2-pinfo { gap: 2px; }
    .v2-pinfo h3 { font-size: var(--text-subhead); }
    .v2-pcat { font-size: var(--text-caption); }

    .v2-philosophy { padding: var(--space-lg) 0; }
    .v2-philosophy-inner { padding: 0 var(--space-lg); }
    .v2-philosophy h2 { font-size: var(--text-h2); margin-bottom: var(--space-sm); }
  }

  @media (max-width: 430px) {
    .v2-hero h1 { font-size: var(--text-h2); margin-bottom: var(--space-md); }
    .v2-hero-content { padding: 0 var(--space-md) var(--space-md); padding-bottom: calc(var(--space-md) + 48px); }
    .v2-hero-actions .btn-primary { min-height: 44px; font-size: var(--text-caption); }
    .v2-hero-actions .link-quiet { font-size: var(--text-caption); }
    .v2-pgrid { gap: var(--space-sm); }
    .v2-pinfo h3 { font-size: var(--text-body); }
    .v2-lifestyle h2 { font-size: var(--text-subhead); }
    .v2-lifestyle p { font-size: var(--text-caption); }
    .v2-philosophy h2 { font-size: var(--text-subhead); }
    .v2-philosophy p { font-size: var(--text-caption); }
    .v2-citem { flex: 0 0 110px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .v2-hero-img { animation: none; transform: scale(1); }
    .v2-hero-eyebrow, .v2-hero h1, .v2-hero-actions, .v2-scroll { animation: none; opacity: 1; transform: none; }
  }
      `}</style>

      <main id="main-content">

        {/* 1. Hero */}
        <section className="v2-hero" ref={heroRef}>
          <picture>
            <source srcSet="/assets/hero-luxury-entryway.avif" type="image/avif" />
            <source srcSet="/assets/hero-luxury-entryway.webp" type="image/webp" />
            <img className="v2-hero-img" src="/assets/hero-luxury-entryway.png" alt="A woodworker's hands finishing the grain of a solid timber surface in natural light." width="1200" height="800" fetchPriority="high" />
          </picture>
          <div className="v2-hero-content">
            <span className="eyebrow eyebrow-light v2-hero-eyebrow">An Indian Workshop</span>
            <h1>Where wood becomes<br />timeless art.</h1>
            <div className="v2-hero-actions">
              <Link href="/gallery" className="btn-primary">View the Collection</Link>
              <Link href="/studio" className="link-quiet">Our Studio</Link>
            </div>
          </div>
          <a href="#philosophy" className="v2-scroll" aria-label="Scroll to explore">
            <span>Scroll</span>
            <span className="v2-scroll-line"></span>
          </a>
        </section>

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
        <section className="v2-philosophy" id="philosophy">
          <div className="v2-philosophy-inner">
            <span className="eyebrow reveal">Why We Exist</span>
            <h2 className="reveal">We make objects that are not finished when they leave the workshop.</h2>
            <p className="reveal">A piece of solid teak keeps changing long after it reaches your home &mdash; the grain deepens, the surface catches light differently with each year of use. We build for that slow change, not against it.</p>
            <p className="reveal">This is a small family workshop in India, run by the same hands for three generations. We make fewer things, more carefully, and we are in no hurry to make more.</p>
          </div>
        </section>

        {/* 4. Signature Collection */}
        <section className="v2-signature">
          <div className="v2-sig-grid">
            <div className="v2-sig-img reveal">
              <img src="https://images.pexels.com/photos/31817693/pexels-photo-31817693.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="A single hand-shaped wooden stool, photographed on a plain neutral floor." loading="lazy" width="1200" height="800" />
            </div>
            <div className="v2-sig-text">
              <span className="v2-sig-tag reveal">{'Piece N\u00B0 04 \u2014 This Season'}</span>
              <span className="eyebrow eyebrow-light reveal">The Hero Edition</span>
              <h2 className="reveal">This season&apos;s hero.</h2>
              <p className="reveal">One sculptural centrepiece, carved from a single reclaimed timber block. It is never restocked and never discounted &mdash; once it&apos;s gone, the next edition begins.</p>
              <div className="v2-sig-actions reveal">
                <Link href="/shop/anchor-table" className="btn-primary">View This Piece</Link>
                <Link href="/journal" className="link-quiet">Watch It Being Made</Link>
              </div>
              <p className="v2-sig-past reveal">Looking for something from a past season? <Link href="/archive">See past editions</Link>.</p>
            </div>
          </div>
        </section>

        {/* 5. Craftsmanship */}
        <section className="v2-craft">
          <div className="v2-craft-grid">
            <div className="v2-craft-img reveal">
              <img src="https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Close-up of hand-cut joinery on a solid teak furniture piece." loading="lazy" />
            </div>
            <div className="v2-craft-text">
              <span className="eyebrow reveal">Craftsmanship</span>
              <h2 className="reveal">Every piece passes through one pair of hands, start to finish.</h2>
              <p className="reveal">We work in solid timber, never veneer or particleboard. A single block is selected, dried, and left to settle before a tool ever touches it &mdash; rushing this step is the most common way a piece fails early.</p>
              <p className="reveal">Joints are cut by hand and fitted dry before any finish is applied. The oil we use is food-safe and reapplied over the piece&apos;s life, not sealed under lacquer that traps moisture and cracks.</p>
              <Link href="/studio" className="link-quiet reveal">Visit the Studio</Link>
            </div>
          </div>
        </section>

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
        <section className="v2-lifestyle">
          <img className="v2-lifestyle-bg" src="https://images.pexels.com/photos/5974417/pexels-photo-5974417.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="A craftsman's weathered hands sanding a wooden surface in the workshop." loading="lazy" />
          <div className="v2-lifestyle-content">
            <span className="eyebrow eyebrow-light reveal">The Workshop</span>
            <h2 className="reveal">A family workshop, unchanged in method for three generations.</h2>
            <p className="reveal">The tools are old. The hands are patient. Nothing here is made to a deadline &mdash; a piece is finished when it is ready, and not before.</p>
            <Link href="/studio" className="link-quiet reveal">Read About Our Process</Link>
          </div>
        </section>

        {/* 9. Story Block — Watch It Made */}
        <section className="v2-lifestyle">
          <img className="v2-lifestyle-bg" src="https://images.pexels.com/photos/5710742/pexels-photo-5710742.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Timber being shaped by hand, filmed for a process video." loading="lazy" />
          <div className="v2-lifestyle-content">
            <span className="eyebrow eyebrow-light reveal">Watch It Made</span>
            <h2 className="reveal">Every piece is documented from timber to finish.</h2>
            <p className="reveal">We don&apos;t ask you to imagine the process &mdash; we film it. Wood selection, joinery, finishing, and the hours each one takes, so you know exactly what you&apos;re buying before you buy it.</p>
            <Link href="/journal" className="link-quiet reveal">Watch the Process</Link>
          </div>
        </section>

      </main>
    </>
  )
}

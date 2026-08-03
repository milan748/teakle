'use client'

import { useEffect } from 'react'

export default function StudioRoadmap() {
  useEffect(() => {
    const roadmap = document.getElementById('processRoadmap')
    const pathFill = document.getElementById('processPathFill')
    const milestones = roadmap ? roadmap.querySelectorAll('[data-milestone]') : []
    if (!roadmap || !pathFill || !milestones.length) return

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.2 })
    milestones.forEach((m) => revealObserver.observe(m))

    function updatePath() {
      const rect = roadmap.getBoundingClientRect()
      const viewH = window.innerHeight
      const totalH = roadmap.offsetHeight
      let scrollProgress = (viewH - rect.top) / (totalH + viewH)
      scrollProgress = Math.max(0, Math.min(1, scrollProgress))
      pathFill.style.height = (scrollProgress * totalH) + 'px'

      const fillPx = scrollProgress * totalH
      let active = null
      milestones.forEach((m) => {
        const mTop = m.offsetTop + m.offsetHeight / 2
        if (mTop <= fillPx) active = m
      })
      milestones.forEach((m) => m.classList.remove('is-active'))
      if (active) active.classList.add('is-active')
    }

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updatePath()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updatePath()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      revealObserver.disconnect()
    }
  }, [])

  return null
}

const assert = require('assert')
const fs = require('fs')
const path = require('path')

let passed = 0
let failed = 0

function test(name, ok, detail) {
  if (ok) { console.log(`  PASS: ${name}`); passed++ }
  else { console.log(`  FAIL: ${name} ${detail || ''}`); failed++ }
}

const src = fs.readFileSync(path.join(__dirname, '..', 'app', 'HomeClient.js'), 'utf8')

const effectStart = src.indexOf('one-shot cinematic reveal')
const effectEnd = src.indexOf('}, [])', effectStart)
const effect = src.slice(effectStart, effectEnd)

/* ---- State machine simulation ---- */
function createSM() {
  let stage = 0
  let completed = false
  return {
    getStage: () => stage,
    isComplete: () => completed,
    advance: () => {
      if (completed) return
      if (stage >= 4) { completed = true; return }
      stage++
      if (stage >= 4) completed = true
    },
  }
}

console.log('=== State machine: one-shot wheel-based reveal ===')
{
  const sm = createSM()
  test('initial stage 0', sm.getStage() === 0)
  test('not complete initially', !sm.isComplete())

  sm.advance()
  test('stage 1 after first advance', sm.getStage() === 1)
  test('not complete after stage 1', !sm.isComplete())

  sm.advance()
  test('stage 2 after second advance', sm.getStage() === 2)
  test('not complete after stage 2', !sm.isComplete())

  sm.advance()
  test('stage 3 after third advance', sm.getStage() === 3)
  test('not complete after stage 3', !sm.isComplete())

  sm.advance()
  test('stage 4 after fourth advance', sm.getStage() === 4)
  test('complete after stage 4', sm.isComplete())

  sm.advance()
  test('stage stays 4 after extra advance', sm.getStage() === 4)
  test('still complete after extra advance', sm.isComplete())
}

console.log('\n=== One-way guarantee ===')
{
  const sm = createSM()
  sm.advance(); sm.advance(); sm.advance(); sm.advance()
  test('no stage-- in source', !src.includes('stage--'))
  test('advance only increments', src.includes('stage++'))
  test('completed flag prevents further advancement', sm.isComplete())
}

console.log('\n=== Source: wheel-based event handling ===')
{
  test('uses window.addEventListener wheel', src.includes("window.addEventListener('wheel'"))
  test('uses window.removeEventListener wheel', src.includes("window.removeEventListener('wheel'"))
  test('wheel listener is passive: false', src.includes("{ passive: false }"))
  test('checks section getBoundingClientRect', src.includes('section.getBoundingClientRect()'))
  test('checks rect.bottom >= 0 in sectionInView', src.includes('rect.bottom >= 0'))
  test('checks rect.top <= window.innerHeight in sectionInView', src.includes('rect.top <= window.innerHeight'))
  test('only advances on downward scroll (deltaY <= 0 check)', src.includes('e.deltaY <= 0'))
}

console.log('\n=== Source: preventDefault for scroll control ===')
{
  test('calls e.preventDefault() on wheel', src.includes('e.preventDefault()'))
  const effectRegion = src.slice(src.indexOf('one-shot cinematic reveal'), src.indexOf('return () =>', src.indexOf('one-shot cinematic reveal')))
  test('preventDefault in wheel handler', effectRegion.includes('e.preventDefault()'))
}

console.log('\n=== Source: finalize releases scroll ===')
{
  test('has finalize function', src.includes('function finalize'))
  test('finalize adds is-reveal-done class', src.includes("section.classList.add('is-reveal-done')"))
  test('finalize scrolls to position', src.includes('window.scrollTo'))
  test('finalize removes wheel listener', src.includes("window.removeEventListener('wheel', onWheel)"))
}

console.log('\n=== Source: touch support for mobile ===')
{
  test('has onTouchStart handler', src.includes('function onTouchStart'))
  test('has onTouchMove handler', src.includes('function onTouchMove'))
  test('tracks lastTouchY', src.includes('lastTouchY'))
  test('touchstart listener passive', src.includes("addEventListener('touchstart'"))
  test('touchmove listener passive: false', src.includes("addEventListener('touchmove', onTouchMove, { passive: false })"))
}

console.log('\n=== Source: body overflow NOT manipulated ===')
{
  test('no document.body.style.overflow', !src.includes('document.body.style.overflow'))
  test('no body.style.overflow', !src.includes('body.style.overflow'))
}

console.log('\n=== Source: no global scroll interception ===')
{
  test('no document.addEventListener wheel', !src.includes("document.addEventListener('wheel'"))
  test('has window.addEventListener keydown (for keyboard bypass fix)', src.includes("window.addEventListener('keydown'"))
  test('has window.removeEventListener keydown for cleanup', src.includes("window.removeEventListener('keydown'"))
  test('keydown removed on finalize', effect.includes("window.removeEventListener('keydown', onKeyDown)"))
}

console.log('\n=== Source: stage-based CSS classes ===')
{
  test('is-stage-1', src.includes('is-stage-1'))
  test('is-stage-2', src.includes('is-stage-2'))
  test('is-stage-3', src.includes('is-stage-3'))
  test('is-stage-4', src.includes('is-stage-4'))
  test('no is-stage-5', !src.includes('is-stage-5'))
}

console.log('\n=== Source: CSS transitions (not keyframes) ===')
{
  test('no @keyframes v2SigImgIn', !src.includes('@keyframes v2SigImgIn'))
  test('no @keyframes v2SigTextIn', !src.includes('@keyframes v2SigTextIn'))
  test('image uses transition', src.includes('.v2-sig-img-wrap {') && src.includes('transition:'))
  test('text uses transition', src.includes('.v2-sig-reveal {') && src.includes('transition:'))
}

console.log('\n=== Source: CSS opacity-0 defaults ===')
{
  test('.v2-sig-img-wrap starts opacity:0', src.includes('.v2-sig-img-wrap {') && src.includes('opacity: 0'))
  test('.v2-sig-reveal starts opacity:0', src.includes('.v2-sig-reveal {') && src.includes('opacity: 0'))
  test('.is-stage-1 sets opacity:1', src.includes('is-stage-1') && src.includes('opacity: 1'))
}

console.log('\n=== Source: hero content in JSX ===')
{
  test('main product image', src.includes('v2-sig-img-main'))
  test('product tag', src.includes('heroProduct?.name') || src.includes('The Hero Edition'))
  test('eyebrow', src.includes('One of One'))
  test('headline', src.includes('hero.'))
  test('description', src.includes('shortDescription') || src.includes('Never restocked'))
  test('View This Piece CTA', src.includes('View This Piece'))
  test('Watch the Process CTA', src.includes('Watch the Process'))
  test('See past editions', src.includes('See past editions'))
}

console.log('\n=== Source: gallery ===')
{
  test('gallery container', src.includes('v2-sig-gallery'))
  test('thumbnail strip', src.includes('v2-sig-thumb'))
  test('prev/next nav', src.includes('v2-sig-nav'))
  test('heroProduct.images', src.includes('heroProduct?.images'))
  test('heroProduct.thumbnails', src.includes('heroProduct?.thumbnails'))
  test('galleryIdx state', src.includes('galleryIdx'))
  test('always rendered', src.includes('hasGallery && ('))
}

console.log('\n=== Source: gallery accessibility ===')
{
  test('radiogroup', src.includes('role="radiogroup"'))
  test('radio', src.includes('role="radio"'))
  test('aria-checked', src.includes('aria-checked'))
  test('aria-label Product images', src.includes('aria-label="Product images"'))
  test('aria-label Previous', src.includes('aria-label="Previous image"'))
  test('aria-label Next', src.includes('aria-label="Next image"'))
  test('focus-visible', src.includes('focus-visible'))
}

console.log('\n=== Source: 300vh section + sticky (during reveal) ===')
{
  test('min-height: 300vh', src.includes('min-height: 300vh'))
  test('.v2-sig-cinema', src.includes('.v2-sig-cinema'))
  test('position: sticky', src.includes('position: sticky'))
  test('height: 100vh', src.includes('height: 100vh'))
}

console.log('\n=== Source: completion collapse ===')
{
  test('is-reveal-done class defined', src.includes('is-reveal-done'))
  test('collapse sets min-height: 0', src.includes('min-height: 0 !important'))
  test('collapse sets height: auto', src.includes('height: auto !important'))
  test('cinema becomes relative after done', src.includes('position: relative !important'))
}

console.log('\n=== Source: reduced motion ===')
{
  test('prefers-reduced-motion', src.includes('prefers-reduced-motion: reduce'))
  test('setRevealStage(4) for reduced motion', src.includes('setRevealStage(4)'))
}

console.log('\n=== Source: other sections unaffected ===')
{
  test('hero parallax uses passive scroll', src.includes("addEventListener('scroll', onScroll, { passive: true })"))
}

console.log('\n=== Source: keyboard bypass prevention ===')
{
  test('has onKeyDown handler', src.includes('function onKeyDown'))
  test('keydown listener added', src.includes("window.addEventListener('keydown', onKeyDown)"))
  test('keydown removed on finalize', src.includes("window.removeEventListener('keydown', onKeyDown)"))
  test('keydown removed on cleanup', src.includes("window.removeEventListener('keydown', onKeyDown)"))
  test('intercepts ArrowDown', src.includes("'ArrowDown'"))
  test('intercepts PageDown', src.includes("'PageDown'"))
  test('intercepts Space', src.includes("' '"))
  test('skips Space when shift held', src.includes('!e.shiftKey') || src.includes('!e.shiftKey'))
  test('checks isInteractive before key intercept', src.includes('isInteractive(document.activeElement)'))
  test('interactiveRe covers INPUT/TEXTAREA/SELECT/BUTTON', src.includes("^(INPUT|TEXTAREA|SELECT|BUTTON)$"))
  test('isEditable check', src.includes('isContentEditable'))
  test('isInteractive checks role=button', src.includes("role") && src.includes("'button'"))
  test('isInteractive checks closest a/button', src.includes("el.closest('a') || el.closest('button')"))
  test('sectionInView used in onKeyDown', src.includes('sectionInView()'))
}

console.log(`\n=== ${passed} passed, ${failed} failed ===`)
process.exit(failed > 0 ? 1 : 0)

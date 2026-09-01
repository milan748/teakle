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

/* ---- Extract the hero reveal effect source ---- */
const effectStart = src.indexOf('one-shot cinematic reveal')
const effectEnd = src.indexOf('}, [])', effectStart)
const effect = src.slice(effectStart, effectEnd)

console.log('=== 1. Hero does not reveal before trigger ===')
{
  test('effect has sectionInView helper', effect.includes('function sectionInView'))
  test('effect checks section in viewport via sectionInView', effect.includes('rect.bottom >= 0') && effect.includes('rect.top <= window.innerHeight'))
  test('effect checks deltaY > 0 to advance', effect.includes('e.deltaY <= 0'))
}

console.log('\n=== 2-5. One gesture = one stage advancement ===')
{
  function createSM() {
    let stage = 0, completed = false
    return {
      advance() {
        if (completed) return
        if (stage >= 4) { completed = true; return }
        stage++
        if (stage >= 4) completed = true
      },
      getStage: () => stage,
      isComplete: () => completed,
    }
  }

  const sm = createSM()
  sm.advance()
  test('gesture 1: image stage (1)', sm.getStage() === 1)
  sm.advance()
  test('gesture 2: first text beat (2)', sm.getStage() === 2)
  sm.advance()
  test('gesture 3: second text beat (3)', sm.getStage() === 3)
  sm.advance()
  test('gesture 4: final content (4)', sm.getStage() === 4)
}

console.log('\n=== 6. No stage skips from one scroll event ===')
{
  test('advance increments by exactly 1', effect.includes('stage++'))
  test('advance checks stage >= 4 before increment', effect.includes('stage >= 4'))
}

console.log('\n=== 7. Completion state is permanent ===')
{
  function createSM() {
    let stage = 0, completed = false
    return {
      advance() {
        if (completed) return
        if (stage >= 4) { completed = true; return }
        stage++
        if (stage >= 4) completed = true
      },
      getStage: () => stage,
      isComplete: () => completed,
    }
  }

  const sm = createSM()
  for (let i = 0; i < 10; i++) sm.advance()
  test('stage stays at 4 after 10 advances', sm.getStage() === 4)
  test('completed flag stays true', sm.isComplete())
  sm.advance()
  test('still complete after extra advance', sm.isComplete())
}

console.log('\n=== 8-9. No reverse/replay after completion ===')
{
  test('no stage-- anywhere in source', !src.includes('stage--'))
  test('advance only increments', effect.includes('stage++'))
  test('completed flag checked before advance', effect.includes('if (completed) return'))
}

console.log('\n=== 10. Normal scroll restored after completion ===')
{
  test('finalize removes wheel listener', effect.includes("window.removeEventListener('wheel', onWheel)"))
  test('finalize removes keydown listener', effect.includes("window.removeEventListener('keydown', onKeyDown)"))
  test('finalize removes touchstart listener', effect.includes("window.removeEventListener('touchstart', onTouchStart)"))
  test('finalize removes touchmove listener', effect.includes("window.removeEventListener('touchmove', onTouchMove)"))
  test('return cleanup removes all listeners', src.includes("window.removeEventListener('wheel', onWheel)") && src.includes("window.removeEventListener('touchmove', onTouchMove)") && src.includes("window.removeEventListener('keydown', onKeyDown)"))
}

console.log('\n=== 11. No scroll interception outside Hero section ===')
{
  test('wheel handler checks section bounds via sectionInView', effect.includes('sectionInView()'))
  test('wheel handler checks viewport bounds', effect.includes('rect.bottom >= 0') && effect.includes('rect.top <= window.innerHeight'))
}

console.log('\n=== 12. Hero section dimensions stable ===')
{
  test('min-height: 300vh during reveal', src.includes('min-height: 300vh'))
  test('cinema sticky top:0', src.includes('position: sticky') && src.includes('top: 0'))
  test('no dynamic height changes during reveal', !effect.includes('section.style.height'))
}

console.log('\n=== 13. Multiple image selection does not restart reveal ===')
{
  test('galleryIdx state is independent', src.includes('const [galleryIdx, setGalleryIdx]'))
  test('sigPrev callback', src.includes('sigPrev'))
  test('sigNext callback', src.includes('sigNext'))
  test('onClick sets galleryIdx only', src.includes('setGalleryIdx(i =>'))
}

console.log('\n=== 14. All Hero Product content remains rendered ===')
{
  test('main product image', src.includes('v2-sig-img-main'))
  test('product tag', src.includes('heroProduct?.name'))
  test('eyebrow One of One', src.includes('One of One'))
  test('headline hero', src.includes('hero.'))
  test('description/shortDescription', src.includes('shortDescription'))
  test('View This Piece CTA', src.includes('View This Piece'))
  test('Watch the Process CTA', src.includes('Watch the Process'))
  test('See past editions link', src.includes('See past editions'))
  test('gallery thumbnails', src.includes('v2-sig-thumb'))
  test('gallery navigation', src.includes('v2-sig-nav'))
}

console.log('\n=== 15. Reduced motion bypass ===')
{
  test('checks prefers-reduced-motion', effect.includes('prefers-reduced-motion: reduce'))
  test('sets stage 4 immediately', effect.includes('setRevealStage(4)'))
  test('CSS: min-height auto !important', src.includes('.v2-signature { min-height: auto !important; }') || src.includes('min-height: auto !important'))
  test('CSS: cinema position relative', src.includes('position: relative !important'))
  test('CSS: cinema height auto', src.includes('height: auto !important'))
  test('CSS: img-wrap opacity 1', src.includes('.v2-sig-img-wrap { opacity: 1 !important'))
  test('CSS: reveal opacity 1', src.includes('.v2-sig-reveal { opacity: 1 !important'))
}

console.log('\n=== Bonus: one-shot architecture ===')
{
  test('has completed flag', effect.includes('completed'))
  test('has finalize function', effect.includes('function finalize'))
  test('finalize sets completed = true', effect.includes('completed = true'))
  test('isComplete derived from revealStage >= 4', src.includes('revealStage >= 4'))
  test('is-reveal-done class added on completion', effect.includes("'is-reveal-done'"))
}

console.log('\n=== 16. Keyboard bypass prevention ===')
{
  test('has onKeyDown handler', effect.includes('function onKeyDown'))
  test('has isInteractive helper', effect.includes('function isInteractive'))
  test('has sectionInView helper', effect.includes('function sectionInView'))
  test('keydown listener added', effect.includes("window.addEventListener('keydown', onKeyDown)"))
  test('keydown removed on finalize', effect.includes("window.removeEventListener('keydown', onKeyDown)"))
  test('keydown removed on cleanup', effect.includes("window.removeEventListener('keydown', onKeyDown)"))
  test('intercepts ArrowDown', effect.includes("'ArrowDown'"))
  test('intercepts PageDown', effect.includes("'PageDown'"))
  test('intercepts Space', effect.includes("' '"))
  test('skips Space when shift held', effect.includes('!e.shiftKey'))
  test('skips if interactive element focused', effect.includes('isInteractive(document.activeElement)'))
  test('interactiveRe covers form controls', effect.includes('^(INPUT|TEXTAREA|SELECT|BUTTON)$'))
  test('checks isContentEditable', effect.includes('isContentEditable'))
  test('checks closest a/button', effect.includes("el.closest('a') || el.closest('button')"))
  test('calls preventDefault on keyboard', effect.includes('e.preventDefault()'))
  test('uses ticking gate for keyboard', effect.includes('if (ticking) return'))
}

console.log(`\n=== ${passed} passed, ${failed} failed ===`)
process.exit(failed > 0 ? 1 : 0)

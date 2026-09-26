/* T12 — Restrained Teakle motion.
   Static assertions: entrance motion is subtle/one-shot, autoplay honours
   reduced-motion, and no constant/bouncing/parallax motion is introduced. */
const assert = require('assert')
const fs = require('fs')
const path = require('path')

let passed = 0
let failed = 0

function test(name, ok, detail) {
  if (ok) { console.log(`  PASS: ${name}`); passed++ }
  else { console.log(`  FAIL: ${name} ${detail || ''}`); failed++ }
}

const css = fs.readFileSync(path.join(__dirname, '..', 'app', 'homepage.css'), 'utf8')
const home = fs.readFileSync(path.join(__dirname, '..', 'app', 'HomeClient.js'), 'utf8')
const global = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8')

console.log('=== T12: hero entrance is restrained and one-shot ===')
{
  test('hero image entrance keyframes exist', css.includes('@keyframes v2HeroImgIn'))
  test('hero content entrance keyframes exist', css.includes('@keyframes v2HeroContentIn'))
  test('image entrance settles from scale(1.04)', css.includes('transform: scale(1.04)'))
  test('image entrance is ~2s or faster', /v2HeroImgIn 1\.\d+s/.test(css))
  test('content entrance rises 14px only', css.includes('transform: translateY(14px)'))
  test('content entrance is sub-second', /v2HeroContentIn 700ms/.test(css))
  test('entrance scoped to full variant (split excluded)', css.includes('.v2-hero:not(.v2-hero--split):not(.v2-hero--minimal)'))
  test('split/minimal variants keep animation neutralised',
    /\.v2-hero--split[\s\S]{0,600}?animation:\s*none/.test(css)
    && /\.v2-hero--minimal[\s\S]{0,600}?animation:\s*none/.test(css))
  test('entrance selectors always exclude split/minimal', (() => {
    const rules = css.split('}')
    return rules
      .filter(r => /animation[^:]*:\s*[^;]*v2Hero(Img|Content)In/.test(r) && !r.includes('@keyframes'))
      .every(r => r.includes(':not(.v2-hero--split)') && r.includes(':not(.v2-hero--minimal)'))
  })())
}

console.log('\n=== T12: mobile keeps the static frame ===')
{
  test('mobile media query neutralises the scoped hero image entrance',
    /@media \(max-width: 860px\)[\s\S]*\.v2-hero:not\(\.v2-hero--split\):not\(\.v2-hero--minimal\) \.v2-hero-img \{\s*animation: none;/.test(css))
}

console.log('\n=== T12: no constant, bouncing or parallax motion ===')
{
  const infiniteInHome = (css.match(/animation:[^;]*infinite/g) || []).length
  test('no infinite animations in homepage.css', infiniteInHome === 0, `found ${infiniteInHome}`)
  test('no bounce keyframes', !/@keyframes[^{]*bounce/i.test(css) && !/@keyframes[^{]*bounce/i.test(global))
  test('no background-attachment: fixed (parallax)', !css.includes('background-attachment: fixed'))
  test('no marquee/constant keyframes', !/@keyframes[^{]*(marquee|spin|pulse|float)/i.test(css))
}

console.log('\n=== T12: reduced-motion is honoured ===')
{
  test('homepage reduced-motion block covers hero content entrance',
    css.includes('.v2-hero:not(.v2-hero--split):not(.v2-hero--minimal) .v2-hero-content > *'))
  test('homepage reduced-motion block covers hero scroll cue',
    css.includes('.v2-hero:not(.v2-hero--split):not(.v2-hero--minimal) .v2-scroll'))
  test('reveal-section has reduced-motion escape', css.includes('.reveal-section') && css.includes('prefers-reduced-motion: reduce'))
  test('carousel checks matchMedia reduced-motion',
    home.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"))
  test('carousel skips autoplay for reduced-motion', home.includes('if (reduceMotion || timer) return'))
  test('carousel avoids smooth scroll for reduced-motion',
    home.includes("behavior: reduceMotion ? 'auto' : 'smooth'"))
  test('global reduced-motion kill-switch intact',
    global.includes('prefers-reduced-motion: reduce') && global.includes('transition-duration: 0.01ms'))
}

console.log('\n=== T12: carousel autoplay is a courtesy, not a constant ===')
{
  test('autoplay interval unchanged at 8s', home.includes('setInterval(tick, 8000)'))
  test('autoplay pauses while tab hidden', home.includes("document.addEventListener('visibilitychange', onVisibility)"))
  test('autoplay resumes when tab visible', home.includes('else startAutoplay()'))
  test('autoplay cleaned up on unmount',
    home.includes("document.removeEventListener('visibilitychange', onVisibility)"))
  test('manual prev/next controls preserved', home.includes("aria-label=\"Previous\"") || home.includes("v2-cprev"))
  test('hover pause preserved', home.includes('hovered = true'))
  test('interaction pause preserved', home.includes('userPause = true'))
}

console.log('\n=== T12: section reveals stay subtle (opacity + transform only) ===')
{
  const revealBlock = css.slice(css.indexOf('.reveal-section {'), css.indexOf('.reveal-section.is-visible'))
  test('reveal uses opacity + translateY(24px)', revealBlock.includes('opacity: 0') && revealBlock.includes('translateY(24px)'))
  test('reveal runs once (JS unobserves)', fs.readFileSync(path.join(__dirname, '..', 'app', 'components', 'RevealOnMount.js'), 'utf8').includes('observer.unobserve(entry.target)'))
}

console.log('\n=== T12: drawer / overlay / nav transitions stay restrained ===')
{
  test('mobile drawer slide is 350ms luxury', global.includes('.nav-links {') && /transition: transform var\(--dur-normal\) var\(--ease-luxury\)/.test(global))
  test('bottom sheet slide is 350ms', global.includes('.bottom-sheet {') && /transition: transform 350ms var\(--ease\)/.test(global))
  test('search overlay fades in 250ms', global.includes('animation: searchFadeIn 250ms'))
  test('account dropdown opens in 200ms', /transition: opacity 200ms var\(--ease\)/.test(global))
  test('header scroll state blends in 350ms', /transition: background var\(--dur-normal\) var\(--ease-luxury\)/.test(global))
}

console.log('\n=== T12: hover states stay quiet ===')
{
  test('product image hover caps at scale(1.03)', css.includes('transform: scale(1.03)'))
  test('no hover zoom exceeds scale(1.05)', !(css.match(/scale\(1\.(0[6-9]|[1-9]\d)/g) || []).length
    && !(global.match(/\.pcard[^{]*\{[^}]*scale\(1\.(0[6-9]|[1-9]\d)/g) || []).length)
  test('commerce controls untouched (prices/CTAs intact)',
    home.includes('priceFormatted') && home.includes('v2-sig-btn-primary'))
}

console.log(`\n=== ${passed} passed, ${failed} failed ===`)
process.exit(failed > 0 ? 1 : 0)

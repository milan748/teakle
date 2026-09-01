"""Root-cause diagnostic for Signature Edition scroll reveal."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    errors = []
    page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errors.append(f"uncaught: {e}"))
    
    page.goto("http://localhost:3001", wait_until="networkidle")
    page.wait_for_timeout(3000)
    
    print("=" * 70)
    print("  PHASE 1: Does the section exist?")
    print("=" * 70)
    
    exists = page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        if (!sec) return { exists: false };
        const inner = sec.querySelector('.v2-sig-editorial-inner');
        const grid = sec.querySelector('.v2-sig-editorial-grid');
        const img = sec.querySelector('.v2-sig-editorial-img');
        const h2 = sec.querySelector('.v2-sig-editorial-text h2');
        const meta = sec.querySelector('.v2-sig-editorial-meta');
        const actions = sec.querySelector('.v2-sig-editorial-actions');
        const past = sec.querySelector('.v2-sig-editorial-past');
        const rect = sec.getBoundingClientRect();
        const innerRect = inner ? inner.getBoundingClientRect() : null;
        const cs = getComputedStyle(sec);
        const innerCs = inner ? getComputedStyle(inner) : null;
        return {
            exists: true,
            className: sec.className,
            offsetTop: sec.offsetTop,
            offsetHeight: sec.offsetHeight,
            clientHeight: sec.clientHeight,
            rectTop: rect.top,
            rectHeight: rect.height,
            computedMinHeight: cs.minHeight,
            computedPosition: cs.position,
            innerPosition: innerCs?.position,
            innerTop: innerCs?.top,
            innerHeight: innerCs?.height,
            innerDisplay: innerCs?.display,
            innerOverflow: innerCs?.overflow,
            innerRectTop: innerRect?.top,
            innerRectHeight: innerRect?.height,
            imgOpacity: img ? getComputedStyle(img).opacity : 'N/A',
            h2Text: h2?.textContent?.trim() || 'N/A',
            h2Opacity: h2 ? getComputedStyle(h2).opacity : 'N/A',
            metaOpacity: meta ? getComputedStyle(meta).opacity : 'N/A',
            metaHTML: meta?.innerHTML?.substring(0, 200) || 'N/A',
            actionsOpacity: actions ? getComputedStyle(actions).opacity : 'N/A',
            pastOpacity: past ? getComputedStyle(past).opacity : 'N/A',
            sigProgressStyle: sec.style.getPropertyValue('--sig-progress'),
            sigProgressComputed: getComputedStyle(sec).getPropertyValue('--sig-progress'),
        };
    }""")
    for k, v in exists.items():
        print(f"  {k}: {v}")
    
    print()
    print("=" * 70)
    print("  PHASE 2: Is --sig-progress actually being set by JS?")
    print("=" * 70)
    
    progress_check = page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        if (!sec) return { error: 'no section' };
        return {
            inlineStyle: sec.style.cssText,
            inlineProgress: sec.style.getPropertyValue('--sig-progress'),
            computedProgress: getComputedStyle(sec).getPropertyValue('--sig-progress'),
            imgComputedOpacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-img')).opacity,
        };
    }""")
    for k, v in progress_check.items():
        print(f"  {k}: {v}")
    
    print()
    print("=" * 70)
    print("  PHASE 3: Scroll to section and check progress")
    print("=" * 70)
    
    # Scroll to just above the signature section
    scroll_result = page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        if (!sec) return { error: 'no section' };
        
        // First, scroll to top
        window.scrollTo(0, 0);
        
        const beforeProgress = sec.style.getPropertyValue('--sig-progress');
        const beforeImgOpacity = getComputedStyle(sec.querySelector('.v2-sig-editorial-img')).opacity;
        
        // Now scroll to just enter the section (section top at viewport bottom)
        window.scrollTo(0, sec.offsetTop - window.innerHeight + 200);
        
        return {
            sectionOffsetTop: sec.offsetTop,
            scrollY_before: 0,
            progress_before: beforeProgress,
            imgOpacity_before: beforeImgOpacity,
            scrollTo: sec.offsetTop - window.innerHeight + 200,
        };
    }""")
    for k, v in scroll_result.items():
        print(f"  {k}: {v}")
    
    page.wait_for_timeout(500)
    
    after_scroll = page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        return {
            scrollY: window.scrollY,
            progress: sec.style.getPropertyValue('--sig-progress'),
            computedProgress: getComputedStyle(sec).getPropertyValue('--sig-progress'),
            imgOpacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-img')).opacity,
            rectTop: sec.getBoundingClientRect().top,
        };
    }""")
    print("  After scrolling to section entry:")
    for k, v in after_scroll.items():
        print(f"    {k}: {v}")
    
    # Scroll to 50% through section
    page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        const scrollable = sec.offsetHeight - window.innerHeight;
        window.scrollTo(0, sec.offsetTop + scrollable * 0.5);
    }""")
    page.wait_for_timeout(500)
    
    mid = page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        return {
            scrollY: window.scrollY,
            progress: sec.style.getPropertyValue('--sig-progress'),
            computedProgress: getComputedStyle(sec).getPropertyValue('--sig-progress'),
            imgOpacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-img')).opacity,
            h2Opacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-text h2')).opacity,
            metaOpacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-meta')).opacity,
            actionsOpacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-actions')).opacity,
        };
    }""")
    print("  At 50% scroll:")
    for k, v in mid.items():
        print(f"    {k}: {v}")
    
    # Scroll to 100%
    page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        const scrollable = sec.offsetHeight - window.innerHeight;
        window.scrollTo(0, sec.offsetTop + scrollable);
    }""")
    page.wait_for_timeout(500)
    
    full = page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        return {
            scrollY: window.scrollY,
            progress: sec.style.getPropertyValue('--sig-progress'),
            computedProgress: getComputedStyle(sec).getPropertyValue('--sig-progress'),
            imgOpacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-img')).opacity,
            h2Opacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-text h2')).opacity,
            metaOpacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-meta')).opacity,
            actionsOpacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-actions')).opacity,
            pastOpacity: getComputedStyle(sec.querySelector('.v2-sig-editorial-past')).opacity,
        };
    }""")
    print("  At 100% scroll:")
    for k, v in full.items():
        print(f"    {k}: {v}")
    
    print()
    print("=" * 70)
    print("  PHASE 4: Check for CSS overrides / specificity issues")
    print("=" * 70)
    
    css_check = page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        const img = sec.querySelector('.v2-sig-editorial-img');
        const h2 = sec.querySelector('.v2-sig-editorial-text h2');
        
        // Check matched CSS rules for the image
        const imgRules = [];
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText && img.matches(rule.selectorText)) {
                        if (rule.style.opacity !== '' || rule.style.transition !== '') {
                            imgRules.push({
                                selector: rule.selectorText,
                                opacity: rule.style.opacity,
                                transition: rule.style.transition,
                            });
                        }
                    }
                }
            } catch(e) {} // cross-origin
        }
        
        // Check if there's a .reveal class on any sig-editorial child
        const hasRevealClass = sec.querySelector('.reveal') !== null;
        const hasRevealStagger = sec.querySelector('.reveal-stagger') !== null;
        
        // Check all element opacities in the section
        const allOpacities = {};
        sec.querySelectorAll('*').forEach(el => {
            const op = getComputedStyle(el).opacity;
            if (op !== '1') {
                const cls = el.className?.toString()?.substring(0, 50) || el.tagName;
                allOpacities[cls] = op;
            }
        });
        
        return {
            imgRulesCount: imgRules.length,
            imgRules: imgRules.slice(0, 5),
            hasRevealClass,
            hasRevealStagger,
            nonZeroOpacities: allOpacities,
        };
    }""")
    for k, v in css_check.items():
        print(f"  {k}: {v}")
    
    print()
    print("=" * 70)
    print("  PHASE 5: Check page layout / section geometry")
    print("=" * 70)
    
    layout = page.evaluate("""() => {
        const sections = document.querySelectorAll('section');
        const layout = [];
        sections.forEach((sec, i) => {
            const cs = getComputedStyle(sec);
            layout.push({
                index: i,
                className: sec.className.substring(0, 40),
                offsetTop: sec.offsetTop,
                offsetHeight: sec.offsetHeight,
                minHeight: cs.minHeight,
                position: cs.position,
            });
        });
        return {
            totalSections: sections.length,
            sections: layout,
            bodyScrollHeight: document.body.scrollHeight,
            windowHeight: window.innerHeight,
        };
    }""")
    print(f"  Total sections: {layout['totalSections']}")
    print(f"  Body scroll height: {layout['bodyScrollHeight']}")
    print(f"  Window height: {layout['windowHeight']}")
    for s in layout['sections']:
        print(f"  [{s['index']}] {s['className']} top={s['offsetTop']} h={s['offsetHeight']} minH={s['minHeight']} pos={s['position']}")
    
    print()
    print("=" * 70)
    print("  PHASE 6: Console errors")
    print("=" * 70)
    real_errors = [e for e in errors if 'hydration' not in e.lower() and 'RSC payload' not in e]
    print(f"  Errors: {len(real_errors)}")
    for e in real_errors[:10]:
        print(f"    {e[:120]}")
    
    # Take screenshots
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(300)
    page.screenshot(path="debug-sig-top.png")
    
    page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        window.scrollTo(0, sec.offsetTop);
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path="debug-sig-entry.png")
    
    page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        const scrollable = sec.offsetHeight - window.innerHeight;
        window.scrollTo(0, sec.offsetTop + scrollable * 0.3);
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path="debug-sig-30pct.png")
    
    page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        const scrollable = sec.offsetHeight - window.innerHeight;
        window.scrollTo(0, sec.offsetTop + scrollable * 0.6);
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path="debug-sig-60pct.png")
    
    page.evaluate("""() => {
        const sec = document.querySelector('.v2-sig-editorial');
        const scrollable = sec.offsetHeight - window.innerHeight;
        window.scrollTo(0, sec.offsetTop + scrollable);
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path="debug-sig-100pct.png")
    
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(200)
    
    browser.close()
    print("\nDone. Screenshots saved: debug-sig-*.png")

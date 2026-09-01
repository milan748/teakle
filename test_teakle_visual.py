from playwright.sync_api import sync_playwright
import os

OUTPUT_DIR = r"C:\Users\Milan\Desktop\code v4(inspired)\teakle_screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    viewports = [
        ("desktop", 1536, 900),
        ("tablet", 768, 1024),
        ("mobile", 390, 844),
    ]
    
    for name, w, h in viewports:
        print(f"\n{'='*60}")
        print(f"CAPTURING: {name.upper()} ({w}x{h})")
        print(f"{'='*60}")
        
        context = browser.new_context(
            viewport={"width": w, "height": h},
            device_scale_factor=2,
            reduced_motion="reduce"
        )
        page = context.new_page()
        
        errors = []
        warnings = []
        page.on("console", lambda m: (errors.append(m.text) if m.type == "error" else 
                                       warnings.append(m.text) if m.type == "warning" else None))
        page.on("pageerror", lambda e: errors.append(f"uncaught: {e}"))
        
        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(2000)
        
        # Full page screenshot
        page.screenshot(
            path=f"{OUTPUT_DIR}/{name}_full.png",
            full_page=True,
            animations="disabled",
            caret="hide"
        )
        print(f"  Saved: {name}_full.png")
        
        # Accessibility snapshot - use page.evaluate to query DOM directly
        headings = page.evaluate("""() => {
            const results = [];
            document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
                results.push({
                    level: parseInt(h.tagName[1]),
                    text: h.textContent?.trim().substring(0, 60),
                });
            });
            return results;
        }""")
        
        print(f"\n  Headings found:")
        for h in headings:
            text_clean = h['text'].encode('ascii', 'replace').decode('ascii')
            print(f"    H{h['level']}: {text_clean}")
        
        h1s = [h for h in headings if h["level"] == 1]
        h2s = [h for h in headings if h["level"] == 2]
        print(f"\n  H1 count: {len(h1s)} (expected: 1)")
        print(f"  H2 count: {len(h2s)}")
        
        # Check for overflow
        overflow = page.evaluate("""() => [...document.querySelectorAll('*')]
            .filter(e => {
                const r = e.getBoundingClientRect();
                return r.right > document.documentElement.clientWidth + 1 && 
                       getComputedStyle(e).overflow !== 'hidden' &&
                       getComputedStyle(e).overflowX !== 'hidden';
            })
            .slice(0, 10)
            .map(e => ({tag: e.tagName, class: e.className?.substring(0, 50), 
                        right: Math.round(e.getBoundingClientRect().right),
                        viewport: document.documentElement.clientWidth}))""")
        
        if overflow:
            print(f"\n  OVERFLOW ISSUES:")
            for o in overflow:
                print(f"    {o['tag']}.{o['class']} - right: {o['right']} (viewport: {o['viewport']})")
        else:
            print(f"\n  No horizontal overflow detected")
        
        # Check font sizes and spacing
        typography = page.evaluate("""() => {
            const results = [];
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(h => {
                const s = getComputedStyle(h);
                results.push({
                    tag: h.tagName,
                    text: h.textContent?.trim().substring(0, 40),
                    fontSize: s.fontSize,
                    fontWeight: s.fontWeight,
                    lineHeight: s.lineHeight,
                    letterSpacing: s.letterSpacing,
                    fontFamily: s.fontFamily.substring(0, 40),
                });
            });
            return results;
        }""")
        
        print(f"\n  Typography:")
        for t in typography:
            text_clean = t['text'].encode('ascii', 'replace').decode('ascii')
            print(f"    {t['tag']}: {text_clean} - {t['fontSize']}, weight:{t['fontWeight']}, lh:{t['lineHeight']}, ls:{t['letterSpacing']}")
        
        # Check section padding
        sections = page.evaluate("""() => {
            const results = [];
            const els = document.querySelectorAll('section, [class*="section"], footer, header, nav');
            els.forEach(el => {
                const s = getComputedStyle(el);
                results.push({
                    tag: el.tagName,
                    class: el.className?.substring(0, 50),
                    paddingTop: s.paddingTop,
                    paddingBottom: s.paddingBottom,
                    height: Math.round(el.getBoundingClientRect().height),
                });
            });
            return results;
        }""")
        
        print(f"\n  Section Spacing:")
        for s in sections:
            print(f"    {s['tag']}.{s['class']} - pt:{s['paddingTop']}, pb:{s['paddingBottom']}, h:{s['height']}px")
        
        # Check images
        images = page.evaluate("""() => {
            const results = [];
            const imgs = document.querySelectorAll('img');
            imgs.forEach(img => {
                const r = img.getBoundingClientRect();
                const s = getComputedStyle(img);
                results.push({
                    src: img.src?.substring(img.src.lastIndexOf('/') + 1, img.src.lastIndexOf('/') + 40),
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                    objectFit: s.objectFit,
                    naturalW: img.naturalWidth,
                    naturalH: img.naturalHeight,
                    loaded: img.complete && img.naturalWidth > 0,
                    alt: img.alt?.substring(0, 30),
                });
            });
            return results;
        }""")
        
        print(f"\n  Images:")
        for img in images:
            status = "OK" if img['loaded'] else "NOT LOADED"
            print(f"    {img['src'][:35]} - {img['width']}x{img['height']} (natural:{img['naturalW']}x{img['naturalH']}) fit:{img['objectFit']} {status}")
        
        # CTA buttons
        ctas = page.evaluate("""() => {
            const results = [];
            const buttons = document.querySelectorAll('button, a[class*="btn"], a[class*="button"], [role="button"]');
            buttons.forEach(btn => {
                const s = getComputedStyle(btn);
                const r = btn.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) {
                    results.push({
                        text: btn.textContent?.trim().substring(0, 30),
                        tag: btn.tagName,
                        bg: s.backgroundColor,
                        color: s.color,
                        fontSize: s.fontSize,
                        padding: s.padding,
                        width: Math.round(r.width),
                        height: Math.round(r.height),
                    });
                }
            });
            return results;
        }""")
        
        print(f"\n  CTAs / Buttons:")
        for c in ctas:
            text_clean = c['text'].encode('ascii', 'replace').decode('ascii')
            print(f"    \"{text_clean}\" - {c['bg']}, {c['color']}, {c['fontSize']}, {c['width']}x{c['height']}")
        
        if errors:
            print(f"\n  CONSOLE ERRORS:")
            for e in errors:
                print(f"    {e[:100]}")
        else:
            print(f"\n  No console errors")
        
        context.close()
    
    # Mobile hamburger menu test
    print(f"\n{'='*60}")
    print(f"MOBILE HAMBURGER MENU TEST")
    print(f"{'='*60}")
    
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        device_scale_factor=2,
        reduced_motion="reduce"
    )
    page = context.new_page()
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(2000)
    
    # Try to find and click hamburger menu
    hamburger = None
    for selector in [
        'button[aria-label*="menu" i]',
        'button[aria-label*="Menu" i]',
        'button[aria-label*="navigation" i]',
        'button[aria-label*="Navigation" i]',
        '[class*="hamburger"]',
        '[class*="menu-toggle"]',
        '[class*="mobile-menu"]',
        'button:has(svg)',
        'nav button',
    ]:
        el = page.query_selector(selector)
        if el:
            bbox = el.bounding_box()
            if bbox and bbox['width'] > 0 and bbox['height'] > 0:
                hamburger = el
                print(f"  Found hamburger with selector: {selector}")
                break
    
    if hamburger:
        hamburger.click()
        page.wait_for_timeout(800)
        page.screenshot(
            path=f"{OUTPUT_DIR}/mobile_menu_open.png",
            full_page=False,
            animations="disabled",
            caret="hide"
        )
        print(f"  Saved: mobile_menu_open.png")
        
        # Check menu interactive elements
        menu_items = page.evaluate("""() => {
            const results = [];
            document.querySelectorAll('nav a, nav button, [role="menuitem"], [role="navigation"] a').forEach(el => {
                results.push({
                    role: el.getAttribute('role') || el.tagName.toLowerCase(),
                    text: el.textContent?.trim().substring(0, 40),
                });
            });
            return results;
        }""")
        
        print(f"\n  Interactive elements in mobile menu:")
        for item in menu_items:
            text_clean = item['text'].encode('ascii', 'replace').decode('ascii')
            print(f"    {item['role']}: {text_clean}")
        
        # Check if menu is visible and covers viewport
        menu_overlay = page.evaluate("""() => {
            const nav = document.querySelector('nav, [class*="menu"], [class*="drawer"], [class*="overlay"]');
            if (!nav) return null;
            const s = getComputedStyle(nav);
            const r = nav.getBoundingClientRect();
            return {
                width: Math.round(r.width),
                height: Math.round(r.height),
                top: Math.round(r.top),
                left: Math.round(r.left),
                position: s.position,
                zIndex: s.zIndex,
                bg: s.backgroundColor,
            };
        }""")
        if menu_overlay:
            print(f"\n  Menu overlay: {menu_overlay['width']}x{menu_overlay['height']} at ({menu_overlay['left']},{menu_overlay['top']})")
            print(f"    position:{menu_overlay['position']}, z:{menu_overlay['zIndex']}, bg:{menu_overlay['bg']}")
    else:
        print("  WARNING: Could not find hamburger menu button")
        # List all buttons for debugging
        buttons = page.evaluate("""() => [...document.querySelectorAll('button')]
            .map(b => ({text: b.textContent?.trim().substring(0,30), 
                        aria: b.getAttribute('aria-label'),
                        class: b.className?.substring(0,40),
                        bbox: b.getBoundingClientRect()}))
            .filter(b => b.bbox.width > 0)""")
        print("  All visible buttons:")
        for b in buttons:
            print(f"    \"{b['text']}\" aria={b['aria']} class={b['class']}")
    
    context.close()
    
    # Scroll to specific sections and screenshot
    print(f"\n{'='*60}")
    print(f"SECTION-BY-SECTION SCROLL CAPTURES (Desktop)")
    print(f"{'='*60}")
    
    context = browser.new_context(
        viewport={"width": 1536, "height": 900},
        device_scale_factor=2,
        reduced_motion="reduce"
    )
    page = context.new_page()
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(2000)
    
    section_selectors = [
        ("hero", "section:first-of-type, [class*='hero'], header + section"),
        ("trust_bar", "[class*='trust'], [class*='marquee'], [class*='ticker']"),
        ("philosophy", "[class*='philosophy'], [class*='about']"),
        ("product_reveal", "[class*='signature'], [class*='reveal'], [class*='product']"),
        ("craftsmanship", "[class*='craft'], [class*='artisan'], [class*='process']"),
        ("carousel", "[class*='carousel'], [class*='slider'], [class*='swiper']"),
        ("product_grid", "[class*='grid'], [class*='collection'], [class*='products']"),
        ("workshop", "[class*='workshop'], [class*='making']"),
        ("footer", "footer"),
    ]
    
    for section_name, selector_str in section_selectors:
        try:
            el = page.query_selector(selector_str)
            if el:
                el.scroll_into_view_if_needed()
                page.wait_for_timeout(500)
                page.screenshot(
                    path=f"{OUTPUT_DIR}/section_{section_name}.png",
                    animations="disabled",
                    caret="hide"
                )
                print(f"  Captured: section_{section_name}.png")
            else:
                print(f"  SKIP: Could not find section '{section_name}' ({selector_str})")
        except Exception as e:
            print(f"  ERROR: {section_name} - {e}")
    
    context.close()
    browser.close()

print(f"\n{'='*60}")
print(f"ALL CAPTURES COMPLETE - Saved to: {OUTPUT_DIR}")
print(f"{'='*60}")

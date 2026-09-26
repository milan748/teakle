from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1366, "height": 768})
    page.goto("http://localhost:3099/", timeout=30000)
    page.wait_for_load_state("networkidle", timeout=30000)
    page.evaluate("""() => {
        const wrapper = document.querySelector('.v2-atelier-wrapper');
        if (wrapper) window.scrollTo(0, wrapper.offsetTop - 80);
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path="C:/Users/Milan/Desktop/TEAKLE/.opencode/atelier-check.png")
    result = page.evaluate("""() => {
        const wrapper = document.querySelector('.v2-atelier-wrapper');
        const title = document.querySelector('.v2-atelier-title h2');
        const titleRect = title ? title.getBoundingClientRect() : null;
        return {
            wrapperH: wrapper ? wrapper.offsetHeight : 0,
            titleTop: titleRect ? titleRect.top : 0,
            titleBottom: titleRect ? titleRect.bottom : 0,
            titleFontSize: title ? getComputedStyle(title).fontSize : 'n/a',
            titleFontWeight: title ? getComputedStyle(title).fontWeight : 'n/a',
            viewportH: window.innerHeight,
            wrapperBottom: wrapper ? wrapper.getBoundingClientRect().bottom : 0
        };
    }""")
    print(result)
    browser.close()

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    # Desktop homepage
    page.goto('http://localhost:3099')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/desktop-header.png')
    
    # Scroll to footer
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/desktop-footer.png')
    
    # Mobile
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto('http://localhost:3099')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/mobile-header.png')
    
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/mobile-footer.png')
    
    browser.close()
    print("Screenshots saved to /tmp/")

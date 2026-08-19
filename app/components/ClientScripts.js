'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientScripts() {
  const pathname = usePathname();

  /* ---- Scroll reveal — re-initializes on every route change ---- */
  useEffect(() => {
    let observer;
    let safetyTimeout;
    let frameId;
    let mutationObserver;

    function initReveals(root) {
      const reveals = (root || document).querySelectorAll('.reveal:not(.is-visible), .reveal-stagger:not(.is-visible), .piece-card:not(.is-visible), .product-card:not(.is-visible)');
      if (!reveals.length) return;
      if ('IntersectionObserver' in window) {
        if (!observer) {
          observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        }
        reveals.forEach((el) => observer.observe(el));
      } else {
        reveals.forEach((el) => el.classList.add('is-visible'));
      }
    }

    /* Single rAF — defer past React 19 hydration commit */
    frameId = requestAnimationFrame(() => {
      initReveals();

      /* Safety net: force all reveals visible after 500ms */
      safetyTimeout = setTimeout(() => {
        document.querySelectorAll('.reveal:not(.is-visible), .reveal-stagger:not(.is-visible), .piece-card:not(.is-visible), .product-card:not(.is-visible)').forEach((el) => {
          el.classList.add('is-visible');
        });
      }, 500);

      /* MutationObserver catches dynamically added .reveal elements */
      if ('MutationObserver' in window) {
        mutationObserver = new MutationObserver((mutations) => {
          for (const m of mutations) {
            for (const node of m.addedNodes) {
              if (node.nodeType === 1) {
                if (node.classList && (node.classList.contains('reveal') || node.classList.contains('reveal-stagger') || node.classList.contains('piece-card') || node.classList.contains('product-card'))) {
                  initReveals(node.parentElement || document);
                }
                if (node.querySelectorAll) {
                  const inner = node.querySelectorAll('.reveal:not(.is-visible), .reveal-stagger:not(.is-visible), .piece-card:not(.is-visible), .product-card:not(.is-visible)');
                  if (inner.length) initReveals(node.parentElement || document);
                }
              }
            }
          }
        });
        mutationObserver.observe(document.body, { childList: true, subtree: true });
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(safetyTimeout);
      if (observer) { observer.disconnect(); observer = null; }
      if (mutationObserver) { mutationObserver.disconnect(); mutationObserver = null; }
    };
  }, [pathname]);

  /* ---- One-time initialization (nav, badges, Teakle, newsletter) ---- */
  useEffect(() => {
    /* Mobile nav toggle */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    let backdrop;
    if (navToggle && navLinks) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);

      function closeNav() {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        if (backdrop) backdrop.classList.remove('is-visible');
        document.body.classList.remove('nav-drawer-open');
        window.dispatchEvent(new CustomEvent('teakle-nav-closed'));
      }

      navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('is-open');
        navToggle.classList.toggle('is-open', navLinks.classList.contains('is-open'));
        navToggle.setAttribute('aria-expanded', navLinks.classList.contains('is-open'));
        navToggle.setAttribute('aria-label', navLinks.classList.contains('is-open') ? 'Close menu' : 'Open menu');
        backdrop.classList.toggle('is-visible', navLinks.classList.contains('is-open'));
        document.body.classList.toggle('nav-drawer-open', navLinks.classList.contains('is-open'));
      });

      backdrop.addEventListener('click', closeNav);
    }

    /* Bottom nav badge sync */
    function syncBottomBadges() {
      try {
        const cart = JSON.parse(localStorage.getItem('teakle_cart') || '[]');
        const wish = JSON.parse(localStorage.getItem('teakle_wishlist') || '[]');
        const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0);
        const wishCount = wish.length;
        const bc = document.getElementById('bottomCartCount');
        const bw = document.getElementById('bottomWishlistCount');
        const hc = document.getElementById('cartCount');
        const hw = document.getElementById('wishlistCount');
        if (bc) { bc.textContent = cartCount; bc.style.display = cartCount > 0 ? '' : 'none'; }
        if (bw) { bw.textContent = wishCount; bw.style.display = wishCount > 0 ? '' : 'none'; }
        if (hc) { hc.textContent = cartCount; hc.style.display = cartCount > 0 ? '' : 'none'; }
        if (hw) { hw.textContent = wishCount; hw.style.display = wishCount > 0 ? '' : 'none'; }
      } catch (e) {}
    }

    syncBottomBadges();
    window.addEventListener('storage', syncBottomBadges);
    const origSetItem = localStorage.setItem;
    localStorage.setItem = function () {
      origSetItem.apply(this, arguments);
      syncBottomBadges();
    };

    /* Teakle module init (from app.js) — retry if scripts load late */
    function initTeakle() {
      if (typeof window !== 'undefined' && window.Teakle) {
        window.Teakle.init();
        return true;
      }
      return false;
    }
    if (!initTeakle()) {
      const retryTimer = setTimeout(initTeakle, 200);
      const retryTimer2 = setTimeout(initTeakle, 600);
      var _teakleCleanup = () => { clearTimeout(retryTimer); clearTimeout(retryTimer2); };
    }

    /* Footer newsletter form */
    const footerForm = document.getElementById('footerNewsletterForm');
    if (footerForm) {
      footerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Demo Only';
        btn.disabled = true;
        this.querySelector('input').value = '';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 3000);
      });
    }

    return () => {
      if (typeof _teakleCleanup === 'function') _teakleCleanup();
    };
  }, []);

  return null;
}

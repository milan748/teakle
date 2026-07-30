/* Main.js — scroll reveal + header + mobile nav + bottom nav active + badges */
document.addEventListener('DOMContentLoaded', function () {
  /* Scroll reveal with Intersection Observer */
  var reveals = document.querySelectorAll('.reveal, .piece-card, .product-card');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Mobile nav toggle */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    var backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    function closeNav() {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('is-visible');
      navLinks.querySelectorAll('.nav-dropdown.is-open, .nav-subdropdown.is-open').forEach(function(el) {
        el.classList.remove('is-open');
      });
    }

    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open);
      backdrop.classList.toggle('is-visible', open);
    });

    backdrop.addEventListener('click', closeNav);

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    /* Gallery dropdown toggles */
    navLinks.querySelectorAll('.nav-dropdown-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dropdown = btn.closest('.nav-dropdown');
        dropdown.classList.toggle('is-open');
      });
    });
    navLinks.querySelectorAll('.nav-subdropdown-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var sub = btn.closest('.nav-subdropdown');
        sub.classList.toggle('is-open');
      });
    });
  }

  /* Bottom nav — active state + badge sync */
  var bottomNav = document.getElementById('bottomNav');
  if (bottomNav) {
    var currentPage = location.pathname.split('/').pop() || 'index.html';
    var links = bottomNav.querySelectorAll('.bottom-nav-link');

    links.forEach(function (link) {
      link.classList.remove('active');
      var href = link.getAttribute('href');
      if (href && href === currentPage) {
        link.classList.add('active');
      }
    });

    function syncBottomBadges() {
      try {
        var cart = JSON.parse(localStorage.getItem('teakle_cart') || '[]');
        var wish = JSON.parse(localStorage.getItem('teakle_wishlist') || '[]');
        var cartCount = cart.reduce(function (s, i) { return s + (i.qty || 1); }, 0);
        var wishCount = wish.length;
        var bc = document.getElementById('bottomCartCount');
        var bw = document.getElementById('bottomWishlistCount');
        if (bc) { bc.textContent = cartCount; bc.style.display = cartCount > 0 ? '' : 'none'; }
        if (bw) { bw.textContent = wishCount; bw.style.display = wishCount > 0 ? '' : 'none'; }
      } catch (e) {}
    }

    syncBottomBadges();
    window.addEventListener('storage', syncBottomBadges);
    var origSetItem = localStorage.setItem;
    localStorage.setItem = function () {
      origSetItem.apply(this, arguments);
      syncBottomBadges();
    };
  }
});
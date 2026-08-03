'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function BottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    function checkAuth() {
      const t = window.Teakle;
      if (t && t.isLoggedIn()) {
        setIsLoggedIn(true);
        setUser(t.getCurrentUser());
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    }
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => {
    if (!sheetOpen) return;

    // Lock body scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Focus trap
    const sheet = sheetRef.current;
    if (sheet) {
      const focusable = sheet.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (focusable.length > 0) focusable[0].focus();

      function handleTab(e) {
        if (e.key !== 'Tab') return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }

      function handleEscape(e) {
        if (e.key === 'Escape') closeSheet();
      }

      document.addEventListener('keydown', handleTab);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleTab);
        document.removeEventListener('keydown', handleEscape);
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }

    function handleEscape(e) {
      if (e.key === 'Escape') closeSheet();
    }
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [sheetOpen, closeSheet]);

  function handleLogout() {
    closeSheet();
    window.Teakle.logout();
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  }

  function isActive(href) {
    if (href === '/') return pathname === '/';
    if (href === '/gallery') return pathname.startsWith('/gallery') || pathname.startsWith('/subcategory');
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav className="bottom-nav" id="bottomNav" aria-label="Mobile navigation">
        <Link href="/" className={`bottom-nav-link${isActive('/') ? ' active' : ''}`} data-page="index">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Home</span>
        </Link>
        <Link href="/gallery" className={`bottom-nav-link${isActive('/gallery') ? ' active' : ''}`} data-page="gallery">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>Gallery</span>
        </Link>
        <Link href="/wishlist" className={`bottom-nav-link${isActive('/wishlist') ? ' active' : ''}`} data-page="wishlist">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <span>Wishlist</span>
          <span className="bottom-nav-badge" id="bottomWishlistCount" style={{display:'none'}}>0</span>
        </Link>
        <Link href="/cart" className={`bottom-nav-link${isActive('/cart') ? ' active' : ''}`} data-page="cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <span>Cart</span>
          <span className="bottom-nav-badge" id="bottomCartCount" style={{display:'none'}}>0</span>
        </Link>
        <button
          className={`bottom-nav-link${isActive('/login') || isActive('/account') ? ' active' : ''}`}
          data-page="account"
          onClick={(e) => { e.preventDefault(); setSheetOpen(true); }}
          aria-label="Account"
        >
          {isLoggedIn && user ? (
            <span className="bottom-nav-avatar">{getInitials(user.name)}</span>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          )}
          <span>Account</span>
        </button>
      </nav>

      {/* Mobile Bottom Sheet */}
      <div className={`bottom-sheet-overlay ${sheetOpen ? 'is-open' : ''}`} onClick={closeSheet}></div>
      <div className={`bottom-sheet ${sheetOpen ? 'is-open' : ''}`} ref={sheetRef} role="dialog" aria-label="Account menu">
        <div className="bottom-sheet-handle"></div>
        <div className="bottom-sheet-content">
          {!isLoggedIn ? (
            <>
              <div className="bottom-sheet-guest">
                <p className="bottom-sheet-welcome">Welcome</p>
                <p className="bottom-sheet-sub">Sign in to access your collection.</p>
              </div>
              <div className="bottom-sheet-divider"></div>
              <Link href="/login" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Sign In
              </Link>
              <Link href="/login" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Create Account
              </Link>
              <div className="bottom-sheet-divider"></div>
              <Link href="/subcategory" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Track Order
              </Link>
              <Link href="/wishlist" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                Wishlist
              </Link>
              <Link href="/contact" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Support
              </Link>
            </>
          ) : (
            <>
              <div className="bottom-sheet-user">
                <div className="bottom-sheet-avatar">{getInitials(user?.name)}</div>
                <div className="bottom-sheet-user-info">
                  <p className="bottom-sheet-name">{user?.name}</p>
                  <p className="bottom-sheet-email">{user?.email}</p>
                </div>
              </div>
              <div className="bottom-sheet-divider"></div>
              <Link href="/account" className="bottom-sheet-item bottom-sheet-item--primary" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                My Account
              </Link>
              <Link href="/account" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                My Orders
              </Link>
              <Link href="/wishlist" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                Wishlist
              </Link>
              <Link href="/account" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Recently Viewed
              </Link>
              <Link href="/account" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Saved Addresses
              </Link>
              <Link href="/contact" className="bottom-sheet-item" onClick={closeSheet}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Support
              </Link>
              <div className="bottom-sheet-divider"></div>
              <button className="bottom-sheet-item bottom-sheet-item--logout" onClick={handleLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

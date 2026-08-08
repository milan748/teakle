'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const galleryDropdown = [
  { label: 'Kitchen', items: [
    { label: 'Countertop Essentials', href: '/subcategory?cat=kitchen&sub=countertop-essentials' },
    { label: 'Coffee & Tea Station', href: '/subcategory?cat=kitchen&sub=coffee-tea-station' },
    { label: 'Cooking Essentials', href: '/subcategory?cat=kitchen&sub=cooking-essentials' },
    { label: 'Dining & Serving', href: '/subcategory?cat=kitchen&sub=dining-serving' },
    { label: 'Storage & Organization', href: '/subcategory?cat=kitchen&sub=storage-organization' },
  ]},
  { label: 'Living Room', items: [
    { label: 'Coffee Table Decor', href: '/subcategory?cat=living&sub=coffee-table-decor' },
    { label: 'Sculptures', href: '/subcategory?cat=living&sub=sculptures' },
    { label: 'Vases', href: '/subcategory?cat=living&sub=vases' },
    { label: 'Storage', href: '/subcategory?cat=living&sub=storage-boxes' },
  ]},
  { label: 'Bedroom', items: [
    { label: 'Nightstand Essentials', href: '/subcategory?cat=bedroom&sub=nightstand-essentials' },
    { label: 'Organizers', href: '/subcategory?cat=bedroom&sub=organizers' },
    { label: 'Mirrors', href: '/subcategory?cat=bedroom&sub=mirrors' },
  ]},
  { label: 'Office', items: [
    { label: 'Desk Organization', href: '/subcategory?cat=office&sub=desk-organization' },
    { label: 'Pen Holders', href: '/subcategory?cat=office&sub=pen-holders' },
    { label: 'Laptop Stands', href: '/subcategory?cat=office&sub=laptop-stands' },
  ]},
  { label: 'Bathroom', items: [
    { label: 'Vanity Organizers', href: '/subcategory?cat=bathroom&sub=vanity-organizers' },
    { label: 'Soap Dispensers', href: '/subcategory?cat=bathroom&sub=soap-dispensers' },
    { label: 'Toothbrush Holders', href: '/subcategory?cat=bathroom&sub=toothbrush-holders' },
  ]},
  { label: 'Outdoor', items: [
    { label: 'Planters', href: '/subcategory?cat=outdoor&sub=planters' },
    { label: 'Garden Decor', href: '/subcategory?cat=outdoor&sub=garden-decor' },
    { label: 'Outdoor Serving', href: '/subcategory?cat=outdoor&sub=outdoor-serving' },
  ]},
  { label: 'Seasonal', items: [
    { label: 'Festive Decor', href: '/subcategory?cat=seasonal&sub=festive-decor' },
    { label: 'Limited Editions', href: '/subcategory?cat=seasonal&sub=limited-editions' },
    { label: "Collector's Series", href: '/subcategory?cat=seasonal&sub=collectors-series' },
  ]},
  { label: 'Dining', items: [
    { label: 'Serving Boards', href: '/subcategory?cat=dining&sub=serving-boards' },
    { label: 'Trays', href: '/subcategory?cat=dining&sub=trays' },
    { label: 'Bowls', href: '/subcategory?cat=dining&sub=bowls' },
  ]},
];

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const HERO_PATHS = new Set([
  '/',
  '/gallery',
  '/archive',
  '/studio',
  '/journal',
  '/trade',
  '/custom',
  '/contact',
]);

function checkHasHero(pathname) {
  if (HERO_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/subcategory')) return true;
  if (pathname.startsWith('/collection/')) return true;
  if (pathname.startsWith('/shop/')) return true;
  return false;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [logoSrc, setLogoSrc] = useState('/assets/logo-black.png');
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchOverlayRef = useRef(null);

  const hasHero = checkHasHero(pathname);

  useEffect(() => {
    document.body.toggleAttribute('data-page-has-hero', hasHero);
  }, [hasHero]);

  useEffect(() => {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    function onScroll() {
      const scrolled = window.scrollY > 60;
      header.classList.toggle('is-scrolled', scrolled);
      if (hasHero) {
        setLogoSrc(scrolled ? '/assets/logo-black.png' : '/assets/logo-white.png');
      } else {
        setLogoSrc('/assets/logo-black.png');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasHero]);

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

  const closeDropdown = useCallback(() => {
    setAccountOpen(false);
  }, []);

  /* Search */
  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    if (!q || q.length < 2) { setSearchResults([]); return; }
    if (typeof window === 'undefined' || !window.TEAKLE_PRODUCTS) return;
    const lower = q.toLowerCase();
    const results = window.TEAKLE_PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(lower) || p.material?.toLowerCase().includes(lower) || p.category?.toLowerCase().includes(lower) || p.shortDescription?.toLowerCase().includes(lower)
    ).slice(0, 6);
    setSearchResults(results);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery) {
      closeSearch();
      router.push(`/subcategory?cat=kitchen&sub=dining-serving&q=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, closeSearch, router]);

  const handleSearchResultClick = useCallback((productId) => {
    closeSearch();
    router.push(`/shop/${productId}`);
  }, [closeSearch, router]);

  useEffect(() => {
    if (!searchOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') closeSearch();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    if (!accountOpen) return;

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        closeDropdown();
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') closeDropdown();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [accountOpen, closeDropdown]);

  function handleLogout() {
    closeDropdown();
    window.Teakle.logout();
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  }

  function toggleAccount() {
    setAccountOpen(prev => !prev);
  }

  return (
    <header className={`site-header${hasHero ? '' : ' is-solid'}`} id="siteHeader">
      <div className="header-inner">
        <Link href="/" className="logo">
          <img src={logoSrc} alt="Teakle" />
        </Link>
        <ul className="nav-links" id="navLinks">
          <li className="nav-dropdown">
            <Link href="/gallery" className="nav-dropdown-desktop-link">Gallery</Link>
            <button className="nav-dropdown-toggle">Gallery</button>
            <ul className="nav-dropdown-menu">
              {galleryDropdown.map((cat) => (
                <li key={cat.label} className="nav-subdropdown">
                  <button className="nav-subdropdown-toggle">{cat.label}</button>
                  <ul className="nav-subdropdown-menu">
                    {cat.items.map((item) => (
                      <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
          <li><Link href="/archive">Archive</Link></li>
          <li><Link href="/studio">Studio</Link></li>
          <li><Link href="/journal">Journal</Link></li>
          <li><Link href="/custom">Customize</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <div className="header-actions">
          <button className="header-icon" aria-label="Search" onClick={openSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <Link href="/wishlist" className="header-icon" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span className="icon-badge" id="wishlistCount" style={{display:'none'}}>0</span>
          </Link>
          <Link href="/cart" className="header-icon" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span className="icon-badge" id="cartCount" style={{display:'none'}}>0</span>
          </Link>

          {/* Account Dropdown Trigger */}
          <div className="account-trigger-wrap" ref={dropdownRef}>
            <button
              ref={buttonRef}
              className={`header-icon account-trigger ${accountOpen ? 'is-open' : ''}`}
              aria-label="Account"
              aria-expanded={accountOpen}
              onClick={toggleAccount}
            >
              {isLoggedIn && user ? (
                <span className="account-avatar-sm">{getInitials(user.name)}</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
            </button>

            {/* Desktop Dropdown */}
            <div className={`acct-dropdown ${accountOpen ? 'is-open' : ''}`}>
              {!isLoggedIn ? (
                /* Guest Dropdown */
                <>
                  <div className="acct-dropdown-guest">
                    <p className="acct-dropdown-welcome">Welcome</p>
                    <p className="acct-dropdown-sub">Sign in to access your collection.</p>
                  </div>
                  <div className="acct-dropdown-divider"></div>
                  <Link href="/login" className="acct-dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    Sign In
                  </Link>
                  <Link href="/login" className="acct-dropdown-item" onClick={closeDropdown} shallow>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    Create Account
                  </Link>
                  <div className="acct-dropdown-divider"></div>
                  <Link href="/subcategory" className="acct-dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Track Order
                  </Link>
                  <Link href="/wishlist" className="acct-dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    Wishlist
                  </Link>
                  <Link href="/contact" className="acct-dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    Support
                  </Link>
                </>
              ) : (
                /* Logged-in Dropdown */
                <>
                  <div className="acct-dropdown-user">
                    <div className="acct-dropdown-avatar">{getInitials(user?.name)}</div>
                    <div className="acct-dropdown-user-info">
                      <p className="acct-dropdown-name">{user?.name}</p>
                      <p className="acct-dropdown-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="acct-dropdown-divider"></div>
                  <Link href="/account" className="acct-dropdown-item acct-dropdown-item--primary" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    My Account
                  </Link>
                  <Link href="/account" className="acct-dropdown-item" onClick={closeDropdown} shallow>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    My Orders
                  </Link>
                  <Link href="/wishlist" className="acct-dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    Wishlist
                  </Link>
                  <Link href="/account" className="acct-dropdown-item" onClick={closeDropdown} shallow>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    Recently Viewed
                  </Link>
                  <Link href="/account" className="acct-dropdown-item" onClick={closeDropdown} shallow>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Saved Addresses
                  </Link>
                  <Link href="/contact" className="acct-dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    Support
                  </Link>
                  <div className="acct-dropdown-divider"></div>
                  <button className="acct-dropdown-item acct-dropdown-item--logout" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          ref={searchOverlayRef}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(43,34,27,0.92)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '15vh', opacity: 1,
            transition: 'opacity 300ms var(--ease)',
          }}
          onClick={(e) => { if (e.target === searchOverlayRef.current) closeSearch(); }}
        >
          <div style={{ width: '100%', maxWidth: 560, padding: '0 var(--space-md)' }}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for pieces, materials, rooms..."
                style={{
                  width: '100%', padding: '1rem 3rem 1rem 1rem',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)',
                  background: 'rgba(255,255,255,0.95)', border: 'none',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              />
              <button type="button" onClick={closeSearch} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </form>
            {searchResults.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.95)', maxHeight: '50vh', overflowY: 'auto' }}>
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSearchResultClick(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                      width: '100%', padding: '0.75rem var(--space-sm)',
                      background: 'none', border: 'none', borderBottom: 'var(--border-subtle)',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
                    }}
                  >
                    <img src={p.images[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover' }} />
                    <div>
                      <p style={{ fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', margin: 0 }}>{p.priceFormatted}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div style={{ background: 'rgba(255,255,255,0.95)', padding: 'var(--space-lg)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', margin: 0 }}>No pieces found for &ldquo;{searchQuery}&rdquo;</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-caption)', marginTop: '0.5rem' }}>Try searching for a material or room type.</p>
              </div>
            )}
            {searchQuery.length < 2 && (
              <div style={{ background: 'rgba(255,255,255,0.95)', padding: 'var(--space-lg)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', margin: 0 }}>Start typing to search the collection.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

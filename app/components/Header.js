'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const galleryDropdown = [
  { label: 'Kitchen & Dining', items: [
    { label: 'Countertop Essentials', href: '/subcategory?cat=kitchen&sub=countertop-essentials' },
    { label: 'Cooking Essentials', href: '/subcategory?cat=kitchen&sub=cooking-essentials' },
    { label: 'Baking Essentials', href: '/subcategory?cat=kitchen&sub=baking-essentials' },
    { label: 'Dining & Serving', href: '/subcategory?cat=kitchen&sub=dining-serving' },
    { label: 'Serving Boards', href: '/subcategory?cat=dining&sub=serving-boards' },
    { label: 'Bowls', href: '/subcategory?cat=dining&sub=bowls' },
    { label: 'Trays', href: '/subcategory?cat=dining&sub=trays' },
  ]},
  { label: 'Coffee & Tea', items: [
    { label: 'Coffee & Tea Station', href: '/subcategory?cat=kitchen&sub=coffee-tea-station' },
    { label: 'Pantry Organization', href: '/subcategory?cat=kitchen&sub=pantry-organization' },
  ]},
  { label: 'Storage & Organization', items: [
    { label: 'Kitchen Storage', href: '/subcategory?cat=kitchen&sub=storage-organization' },
    { label: 'Desk Organization', href: '/subcategory?cat=office&sub=desk-organization' },
    { label: 'Document Storage', href: '/subcategory?cat=office&sub=document-storage' },
    { label: 'Pen Holders', href: '/subcategory?cat=office&sub=pen-holders' },
    { label: 'Laptop Stands', href: '/subcategory?cat=office&sub=laptop-stands' },
    { label: 'Shelving', href: '/subcategory?cat=living&sub=shelving-decor' },
  ]},
  { label: 'Home Décor', items: [
    { label: 'Sculptures', href: '/subcategory?cat=living&sub=sculptures' },
    { label: 'Vases', href: '/subcategory?cat=living&sub=vases' },
    { label: 'Coffee Table Decor', href: '/subcategory?cat=living&sub=coffee-table-decor' },
    { label: 'Candle Holders', href: '/subcategory?cat=living&sub=candle-holders' },
    { label: 'Decorative Objects', href: '/subcategory?cat=living&sub=decorative-objects' },
    { label: 'Mirrors', href: '/subcategory?cat=bedroom&sub=mirrors' },
  ]},
  { label: 'Bathroom', items: [
    { label: 'Vanity Organizers', href: '/subcategory?cat=bathroom&sub=vanity-organizers' },
    { label: 'Soap Dispensers', href: '/subcategory?cat=bathroom&sub=soap-dispensers' },
    { label: 'Toothbrush Holders', href: '/subcategory?cat=bathroom&sub=toothbrush-holders' },
  ]},
  { label: 'Everyday Living', items: [
    { label: 'Planters', href: '/subcategory?cat=outdoor&sub=planters' },
    { label: 'Garden Decor', href: '/subcategory?cat=outdoor&sub=garden-decor' },
    { label: 'Outdoor Serving', href: '/subcategory?cat=outdoor&sub=outdoor-serving' },
    { label: 'Festive Decor', href: '/subcategory?cat=seasonal&sub=festive-decor' },
    { label: "Collector's Series", href: '/subcategory?cat=seasonal&sub=collectors-series' },
    { label: 'Limited Editions', href: '/subcategory?cat=seasonal&sub=limited-editions' },
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
        const newSrc = scrolled ? '/assets/logo-black.png' : '/assets/logo-white.png';
        setLogoSrc((prev) => prev === newSrc ? prev : newSrc);
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeResultIdx, setActiveResultIdx] = useState(-1);
  const resultRefs = useRef([]);
  const searchDebounceRef = useRef(null);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setActiveResultIdx(-1);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setActiveResultIdx(-1);
    setSearchFocused(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setActiveResultIdx(-1);
    searchInputRef.current?.focus();
  }, []);

  const searchFields = useCallback((q) => {
    if (!q || q.length < 2) { setSearchResults([]); return; }
    if (typeof window === 'undefined' || !window.TEAKLE_PRODUCTS) return;
    const lower = q.toLowerCase().trim();
    const results = window.TEAKLE_PRODUCTS.filter((p) => {
      const haystack = [
        p.name, p.material, p.category, p.categoryName,
        p.subcategory, p.subcategoryName, p.shortDescription,
        p.description, p.availability,
        ...(Array.isArray(p.tags) ? p.tags : []),
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(lower);
    }).slice(0, 8);
    setSearchResults(results);
    setActiveResultIdx(-1);
  }, []);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => searchFields(q), 200);
  }, [searchFields]);

  const closeDrawer = useCallback(() => {
    const navLinks = document.getElementById('navLinks');
    const navToggle = document.getElementById('navToggle');
    if (navLinks) navLinks.classList.remove('is-open');
    if (navToggle) {
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('nav-drawer-open');
    const backdrop = document.querySelector('.nav-backdrop');
    if (backdrop) backdrop.classList.remove('is-visible');
  }, []);

  const navigateToSearchPage = useCallback(() => {
    if (searchQuery && searchQuery.trim().length >= 2) {
      closeSearch();
      closeDrawer();
      router.push(`/gallery?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, closeSearch, closeDrawer, router]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    navigateToSearchPage();
  }, [navigateToSearchPage]);

  const handleSearchResultClick = useCallback((productId) => {
    closeSearch();
    router.push(`/shop/${productId}`);
  }, [closeSearch, router]);

  const handleSearchKeyDown = useCallback((e) => {
    if (!searchResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveResultIdx((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveResultIdx((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter' && activeResultIdx >= 0 && searchResults[activeResultIdx]) {
      e.preventDefault();
      handleSearchResultClick(searchResults[activeResultIdx].id);
    }
  }, [searchResults, activeResultIdx, handleSearchResultClick]);

  useEffect(() => {
    if (!searchOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') closeSearch();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    if (activeResultIdx >= 0 && resultRefs.current[activeResultIdx]) {
      resultRefs.current[activeResultIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [activeResultIdx]);

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
        <Link href="/" className="logo" aria-label="Teakle Home">
          <img src={logoSrc} alt="Teakle" />
        </Link>
        <ul className="nav-links" id="navLinks">
          <li className="nav-mobile-search-bar">
            <form className="nav-mobile-search-form" onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim().length >= 2) { closeDrawer(); setSearchQuery(''); setSearchResults([]); router.push(`/gallery?search=${encodeURIComponent(searchQuery.trim())}`); } }}>
              <input
                type="text"
                className="nav-mobile-search-input"
                placeholder="Search pieces, materials..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                aria-label="Search products"
                autoComplete="off"
              />
              <button type="submit" className="nav-mobile-search-submit" aria-label="Submit search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </form>
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div className="nav-mobile-search-results">
                {searchResults.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    className="nav-mobile-search-result-item"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); closeDrawer(); router.push(`/shop/${p.id}`); }}
                  >
                    <img className="nav-mobile-search-result-img" src={p.images?.[0]} alt="" loading="lazy" />
                    <div className="nav-mobile-search-result-info">
                      <span className="nav-mobile-search-result-name">{p.name}</span>
                      <span className="nav-mobile-search-result-meta">{p.priceFormatted}</span>
                    </div>
                  </button>
                ))}
                <button className="nav-mobile-search-view-all" onClick={() => { const q = searchQuery.trim(); setSearchQuery(''); setSearchResults([]); closeDrawer(); router.push(`/gallery?search=${encodeURIComponent(q)}`); }}>
                  View all {searchResults.length} results for &ldquo;{searchQuery}&rdquo;
                </button>
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="nav-mobile-search-results">
                <p className="nav-mobile-search-empty">No pieces matched &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </li>
          <li className="nav-dropdown">
            <div className="nav-mobile-link-row">
              <Link href="/gallery" className="nav-dropdown-desktop-link">Gallery</Link>
              <button className="nav-dropdown-toggle" aria-label="Show Gallery categories" aria-expanded="false" aria-controls="gallery-dropdown-menu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <ul className="nav-dropdown-menu" id="gallery-dropdown-menu">
              {galleryDropdown.map((cat) => {
                const subId = `subdropdown-${cat.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                return (
                <li key={cat.label} className="nav-subdropdown">
                  <button className="nav-subdropdown-toggle" aria-label={`${cat.label} categories`} aria-expanded="false" aria-controls={subId}>
                    {cat.label}
                  </button>
                  <ul className="nav-subdropdown-menu" id={subId}>
                    {cat.items.map((item) => (
                      <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
                    ))}
                  </ul>
                </li>
                );
              })}
            </ul>
          </li>
          <li><Link href="/archive">Archive</Link></li>
          <li><Link href="/studio">Studio</Link></li>
          <li><Link href="/journal">Journal</Link></li>
          <li><Link href="/custom">Customize</Link></li>
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
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
          onClick={(e) => { if (e.target === searchOverlayRef.current) closeSearch(); }}
        >
          <div className="search-panel">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-wrap">
                <svg className="search-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Search for pieces, materials, rooms..."
                  role="combobox"
                  aria-expanded={searchResults.length > 0}
                  aria-haspopup="listbox"
                  aria-autocomplete="list"
                  aria-controls="search-results-list"
                  aria-activedescendant={activeResultIdx >= 0 ? `search-result-${activeResultIdx}` : undefined}
                  autoComplete="off"
                />
                {searchQuery.length > 0 && (
                  <button type="button" className="search-clear-btn" onClick={clearSearch} aria-label="Clear search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
              <button type="button" className="search-close-btn" onClick={closeSearch} aria-label="Close search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span className="search-close-label">ESC</span>
              </button>
            </form>

            {/* Results */}
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div className="search-results" id="search-results-list" role="listbox" aria-label="Search results">
                {searchResults.map((p, idx) => (
                  <button
                    key={p.id}
                    ref={(el) => { resultRefs.current[idx] = el; }}
                    id={`search-result-${idx}`}
                    className={`search-result-item${idx === activeResultIdx ? ' is-active' : ''}`}
                    role="option"
                    aria-selected={idx === activeResultIdx}
                    onClick={() => handleSearchResultClick(p.id)}
                    onMouseEnter={() => setActiveResultIdx(idx)}
                  >
                    <img className="search-result-img" src={p.images?.[0]} alt="" loading="lazy" />
                    <div className="search-result-info">
                      <span className="search-result-name">{p.name}</span>
                      <span className="search-result-meta">{p.priceFormatted}{p.categoryName ? ` \u00B7 ${p.categoryName}` : ''}</span>
                    </div>
                  </button>
                ))}
                <button className="search-view-all" onClick={navigateToSearchPage}>
                  View all results for &ldquo;{searchQuery}&rdquo;
                </button>
              </div>
            )}

            {/* No Results */}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="search-empty">
                <p className="search-empty-title">No pieces matched &ldquo;{searchQuery}&rdquo;</p>
                <p className="search-empty-sub">Try a different material, room, or product name.</p>
                <div className="search-empty-actions">
                  <button className="search-empty-btn" onClick={clearSearch}>Clear search</button>
                  <Link href="/gallery" className="search-empty-btn search-empty-btn--primary" onClick={closeSearch}>Browse Gallery</Link>
                </div>
              </div>
            )}

            {/* Empty / Initial State */}
            {searchQuery.length < 2 && (
              <div className="search-hints">
                <p className="search-hints-label">Popular searches</p>
                <div className="search-hints-list">
                  {['Teak', 'Table', 'Bowl', 'Tray', 'Planter'].map((term) => (
                    <button key={term} className="search-hint-pill" onMouseDown={(e) => { e.preventDefault(); setSearchQuery(term); searchFields(term); }}>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

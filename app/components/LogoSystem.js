'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  LOGO_VARIANTS,
  getLogoSrc,
  getFallbackSrc,
  getLogoAlt,
} from '../lib/logo-config';

/**
 * TEAKLE Logo System — Client Components
 *
 * All logo artwork is used as-supplied (no recolor / invert / trace).
 * Dark/light selection is always based on the actual background colour.
 *
 * Component hierarchy:
 *   <Logo>              — low-level, accepts any variant + theme
 *   SecondaryHorizontal — convenience wrapper (main header / footer / bottom nav)
 *   SecondaryVertical   — convenience wrapper (compact / mobile / vertical brand)
 *   Wordmark            — convenience wrapper (minimal text-only: auth pages)
 *   Brandmark           — convenience wrapper (small icon / brandmark-only)
 *   MakersMark          — convenience wrapper (atelier / craft / editorial)
 *   Monogram            — convenience wrapper (compact decorative / utility)
 *   SealStamp           — convenience wrapper (editorial / studio / brand-story)
 *   HeaderLogo          — header-aware: auto theme-switches on scroll
 *   FooterLogo          — footer-aware: always dark theme
 *   AuthLogo            — auth-page logo: wordmark, always dark theme
 */

/* ── Base <Logo> ─────────────────────────────────────────── */

export function Logo({
  variant = 'secondaryHorizontal',
  theme = 'auto',
  size = 'default',
  className = '',
  alt,
  href = '/',
  onError,
} = {}) {
  const [imgError, setImgError] = React.useState(false);

  const resolvedAlt = alt || getLogoAlt(variant);

  const src = useMemo(() => {
    if (imgError) return getFallbackSrc(theme === 'auto' ? 'dark' : theme);
    return getLogoSrc(variant, theme === 'auto' ? 'dark' : theme);
  }, [variant, theme, imgError]);

  const handleError = (e) => {
    if (!imgError) setImgError(true);
    onError?.(e);
  };

  /* Height scale — these are CSS class names applied via Tailwind-style utilities.
     The actual heights live in styles.css under .logo img overrides per size class. */
  const sizeClasses = {
    sm: 'logo-size-sm',          // ~18px — compact placements (bottom nav brand)
    default: 'logo-size-default', // ~28px — general purpose
    lg: 'logo-size-lg',           // ~36px — account sidebar / auth pages
    xl: 'logo-size-xl',           // ~48px — login page hero brand
    xxl: 'logo-size-xxl',         // ~64px — large editorial placements
    header: 'logo-size-header',   // ~60px — main site header
  };

  const content = (
    <img
      src={src}
      alt={resolvedAlt}
      className={`${sizeClasses[size] || sizeClasses.default} ${className}`}
      onError={handleError}
    />
  );

  return href ? (
    <Link href={href} className="logo" aria-label={resolvedAlt}>
      {content}
    </Link>
  ) : content;
}

/* ── Convenience wrappers ────────────────────────────────── */

export const SecondaryHorizontal = (props) => <Logo variant="secondaryHorizontal" {...props} />;
export const SecondaryVertical   = (props) => <Logo variant="secondaryVertical" {...props} />;
export const Wordmark            = (props) => <Logo variant="wordmark" {...props} />;
export const Brandmark           = (props) => <Logo variant="brandmark" {...props} />;
export const MakersMark          = (props) => <Logo variant="makersMark" {...props} />;
export const Monogram            = (props) => <Logo variant="monogram" {...props} />;
export const SealStamp           = (props) => <Logo variant="sealStamp" {...props} />;

/* ── Context-aware wrappers ──────────────────────────────── */

/**
 * Header logo — auto-switches theme on scroll.
 * For hero pages: light at top → dark when scrolled (solid header).
 * For non-hero pages: always dark (solid header).
 */
export function HeaderLogo({ size = 'header', className = '', forceTheme, ...props }) {
  const [scrolled, setScrolled] = React.useState(false);

  const theme = forceTheme || (scrolled ? 'dark' : 'light');

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <SecondaryHorizontal theme={theme} size={size} className={className} {...props} />;
}

/** Footer logo — always dark (footer has light background). */
export function FooterLogo({ size = 'default', className = '', ...props }) {
  return <SecondaryHorizontal theme="dark" size={size} className={className} {...props} />;
}

/** Auth-page logo — wordmark, always dark (auth pages have light backgrounds). */
export function AuthLogo({ size = 'lg', className = '', ...props }) {
  return <Wordmark theme="dark" size={size} className={className} {...props} />;
}

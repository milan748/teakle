/**
 * TEAKLE Logo Configuration
 * Shared constants for logo paths - usable in both server and client components
 *
 * Logo variant mapping — files in /public/assets/logos/:
 *   {base}-dark.png  → for use on light backgrounds
 *   {base}-light.png → for use on dark backgrounds
 *
 * Variants:
 *   secondaryHorizontal → secondary-horizontal  (main header + footer + bottom nav)
 *   secondaryVertical   → secondary-vertical    (compact/mobile/vertical brand)
 *   wordmark            → wordmark              (minimal text-only: auth pages)
 *   brandmark           → brandmark             (small icon/brandmark: favicon, small UI)
 *   makersMark          → makers-mark           (atelier/craft/editorial)
 *   monogram            → monogram              (compact decorative/utility)
 *   sealStamp           → seal-stamp-mark       (editorial/studio/brand-story)
 */

export const LOGO_VARIANTS = {
  secondaryHorizontal: 'secondary_horizontal',
  secondaryVertical: 'secondary_vertical',
  wordmark: 'wordmark',
  brandmark: 'brandmark',
  makersMark: 'makers_mark',
  monogram: 'monogram',
  sealStamp: 'seal_stamp_mark',
};

export const FALLBACK_LOGO = {
  light: '/assets/logo-white.webp',
  dark: '/assets/logo-black.webp',
};

/**
 * Get logo source URL by variant and theme.
 * Returns a path relative to /public, e.g. /assets/logos/secondary-horizontal-dark.png
 */
export function getLogoSrc(variant, theme) {
  const base = LOGO_VARIANTS[variant];
  if (!base) return getFallbackSrc(theme);
  const suffix = theme === 'dark' ? '_dark' : '_light';
  return `/assets/logos/${base}${suffix}.png`;
}

export function getFallbackSrc(theme) {
  return theme === 'dark' ? FALLBACK_LOGO.dark : FALLBACK_LOGO.light;
}

/** Full absolute URL for OpenGraph / social meta */
export function getLogoUrl(theme = 'dark') {
  return `https://teakle.in${getLogoSrc('secondaryHorizontal', theme)}`;
}

export function getLogoAlt(variant) {
  const alts = {
    secondaryHorizontal: 'Teakle',
    secondaryVertical: 'Teakle',
    wordmark: 'Teakle',
    brandmark: 'Teakle',
    makersMark: "Teakle Maker's Mark",
    monogram: 'Teakle',
    sealStamp: 'Teakle Seal',
  };
  return alts[variant] || 'Teakle';
}
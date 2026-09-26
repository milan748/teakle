// Section Variants — shared pure data.
//
// Variants define different visual layouts/compositions for the same section type.
// Each variant should change layout, spacing, or composition — NOT arbitrary CSS.
//
// Lives here (not in the admin editor registry) so public rendering code
// (`lib/designResolution.js`, imported by public pages) does not pull the
// admin editor component registry — and its component graph — into the
// public client bundle. Importing the registry from public code created a
// circular module dependency (registry -> section components ->
// designResolution -> registry) that threw
// "Cannot access '__WEBPACK_DEFAULT_EXPORT__' before initialization" on /studio.

export const SECTION_VARIANTS = {
  hero: [
    { id: 'full', label: 'Full Image', description: 'Full-width background image with text overlay' },
    { id: 'split', label: 'Split Editorial', description: 'Image on one side, text on the other' },
    { id: 'minimal', label: 'Minimal', description: 'Clean text-focused layout without image' },
  ],
  philosophy: [
    { id: 'standard', label: 'Standard', description: 'Image with text alongside' },
    { id: 'centered', label: 'Centered', description: 'Centered text with image below' },
  ],
  signature: [
    { id: 'standard', label: 'Standard', description: 'Image with text alongside' },
    { id: 'gallery', label: 'Gallery', description: 'Featured image with text overlay' },
  ],
  craftsmanship: [
    { id: 'standard', label: 'Standard', description: 'Image with text alongside' },
    { id: 'process', label: 'Process', description: 'Step-by-step process layout' },
  ],
  // ── Studio section variants ──
  origin: [
    { id: 'standard', label: 'Standard', description: 'Image on left, text on right' },
    { id: 'centered', label: 'Centered', description: 'Text centered with image above' },
  ],
  materials: [
    { id: 'standard', label: 'Standard Grid', description: '3-column grid layout' },
    { id: 'compact', label: 'Compact', description: 'Single-column list layout' },
  ],
  gallery: [
    { id: 'standard', label: 'Standard Grid', description: '2-column asymmetric grid' },
    { id: 'full', label: 'Full Width', description: 'Full-width mosaic layout' },
  ],
}

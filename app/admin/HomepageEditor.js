'use client';

import PageEditor from './PageEditor';

const SECTION_LABELS = {
  hero: 'Hero',
  philosophy: 'Philosophy',
  signature: 'Signature Collection',
  craftsmanship: 'Craftsmanship',
  'workshop-story': 'Workshop Story',
  'process-story': 'Process Story',
};

export default function HomepageEditor() {
  return <PageEditor page="home" sectionLabels={SECTION_LABELS} backLabel="Homepage" />;
}

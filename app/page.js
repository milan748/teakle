import HomeClient from './HomeClient';
import { getPublishedPageSections } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Handcrafted Teak Furniture',
  description: 'Solid teak furniture and objects, handcrafted in India. Every piece is unique \u2014 shaped by the grain, finished by hand.',
  openGraph: { title: 'Teakle \u2014 Handcrafted Teak Furniture', description: 'Solid teak furniture and objects, handcrafted in India.', images: [{ url: 'https://teakle.in/assets/hero-luxury-entryway.png', width: 1200, height: 630, alt: 'Teakle handcrafted wooden furniture' }] },
  alternates: { canonical: 'https://teakle.in' },
};

export default function HomePage() {
  let sections = [];
  try {
    sections = getPublishedPageSections('home');
  } catch {
    // CMS unavailable — use hardcoded fallback
  }

  const cms = {};
  const cmsKeys = new Set();
  for (const s of sections) {
    cmsKeys.add(s.sectionKey);
    if (s.enabled) {
      cms[s.sectionKey] = s;
    }
  }

  return <HomeClient cms={cms} cmsKeys={cmsKeys} />;
}

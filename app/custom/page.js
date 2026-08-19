import CustomClient from './CustomClient';
import { getPublishedPageSections } from '@/lib/cms'

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Custom Orders',
  description: 'Commission a custom teak piece. Tell us what you need and we\'ll build it by hand in solid teak.',
  openGraph: { title: 'Custom Orders \u2014 Teakle', description: 'Commission a custom teak piece. Tell us what you need and we\'ll build it by hand in solid teak.' },
  alternates: { canonical: 'https://teakle.in/custom' },
};

export default function CustomPage() {
  let sections = [];
  try { sections = getPublishedPageSections('custom'); } catch {}
  const cms = {};
  for (const s of sections) { if (s.enabled) cms[s.sectionKey] = s; }
  const cmsKeys = Array.from(new Set(sections.map(s => s.sectionKey)));
  return <CustomClient cms={cms} cmsKeys={cmsKeys} />;
}

import TradeClient from './TradeClient';
import { getPublishedPageSections } from '@/lib/cms'

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Trade & Wholesale',
  description: 'Trade pricing for interior designers, architects, and retailers. Teakle handcrafted teak furniture at wholesale rates.',
  openGraph: { title: 'Trade & Wholesale \u2014 Teakle', description: 'Trade pricing for interior designers, architects, and retailers. Teakle handcrafted teak furniture at wholesale rates.' },
  alternates: { canonical: 'https://teakle.in/trade' },
};

export default function TradePage() {
  let sections = [];
  try { sections = getPublishedPageSections('trade'); } catch {}
  const cms = {};
  for (const s of sections) { if (s.enabled) cms[s.sectionKey] = s; }
  const cmsKeys = Array.from(new Set(sections.map(s => s.sectionKey)));
  return <TradeClient cms={cms} cmsKeys={cmsKeys} />;
}

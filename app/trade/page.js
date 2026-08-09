import TradeClient from './TradeClient';

export const metadata = {
  title: 'Trade & Wholesale',
  description: 'Trade pricing for interior designers, architects, and retailers. Teakle handcrafted teak furniture at wholesale rates.',
  openGraph: { title: 'Trade & Wholesale \u2014 Teakle', description: 'Trade pricing for interior designers, architects, and retailers. Teakle handcrafted teak furniture at wholesale rates.' },
  alternates: { canonical: 'https://teakle.in/trade' },
};

export default function TradePage() {
  return <TradeClient />;
}

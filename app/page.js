import HomeClient from './HomeClient';

export const metadata = {
  title: 'Handcrafted Teak Furniture',
  description: 'Solid teak furniture and objects, handcrafted in India. Every piece is unique \u2014 shaped by the grain, finished by hand.',
  openGraph: { title: 'Teakle \u2014 Handcrafted Teak Furniture', description: 'Solid teak furniture and objects, handcrafted in India.' },
  alternates: { canonical: 'https://teakle.in' },
};

export default function HomePage() {
  return <HomeClient />;
}

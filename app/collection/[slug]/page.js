import CollectionClient from './CollectionClient';

export const metadata = {
  title: 'Collection',
  description: 'Curated collections of solid teak furniture and objects for specific rooms and uses.',
  openGraph: { title: 'Collection \u2014 Teakle', description: 'Curated collections of solid teak furniture and objects.' },
  alternates: { canonical: 'https://teakle.in/collection' },
};

export default function CollectionPage() {
  return <CollectionClient />;
}

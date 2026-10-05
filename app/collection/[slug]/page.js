import { notFound } from 'next/navigation';
import CollectionClient from './CollectionClient';
/* Standard catalogue only — the Atelier hero is excluded by design. */
import { getCatalogueProducts } from '../../data/products';

export const dynamicParams = false;

const COLLECTIONS = {
  'kitchen-dining': { name: 'Kitchen & Dining', description: 'Handcrafted boards, bowls, and serving pieces designed for daily use in solid teak.', image: '/temporary-images/collection-kitchen-dining-01.jpg' },
  'home-decor': { name: 'Home Décor', description: 'Sculptural objects, vases, and candle holders crafted to bring warmth and character to any space.', image: '/temporary-images/collection-home-decor-01.jpg' },
  'everyday-living': { name: 'Everyday Living', description: 'Trays, boxes, and organisers shaped by hand for the small rituals that make a home.', image: '/temporary-images/collection-everyday-living-01.jpg' },
  'storage': { name: 'Storage', description: 'Pen holders, desk trays, vanity organisers, and storage boxes handcrafted from solid timber.', image: '/temporary-images/collection-storage-01.jpg' },
};

export function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const col = COLLECTIONS[slug];
  if (!col) return { title: 'Collection Not Found' };

  return {
    title: col.name,
    description: col.description,
    openGraph: { title: `${col.name} — Teakle`, description: col.description, url: `https://teakle.in/collection/${slug}`, images: [{ url: col.image, width: 1200, height: 630, alt: col.name }] },
    alternates: { canonical: `https://teakle.in/collection/${slug}` },
  };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  if (!COLLECTIONS[slug]) notFound();

  return <CollectionClient products={getCatalogueProducts()} />;
}

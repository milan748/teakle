import { notFound } from 'next/navigation';
import CollectionClient from './CollectionClient';
import { PRODUCTS } from '../../data/products';

export const dynamicParams = false;

const COLLECTIONS = {
  'kitchen-dining': { name: 'Kitchen & Dining', description: 'Handcrafted boards, bowls, and serving pieces designed for daily use in solid teak.', image: 'https://images.pexels.com/photos/6910978/pexels-photo-6910978.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  'home-decor': { name: 'Home Décor', description: 'Sculptural objects, vases, and candle holders crafted to bring warmth and character to any space.', image: 'https://images.pexels.com/photos/4612501/pexels-photo-4612501.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  'everyday-living': { name: 'Everyday Living', description: 'Trays, boxes, and organisers shaped by hand for the small rituals that make a home.', image: 'https://images.pexels.com/photos/33395641/pexels-photo-33395641.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  'storage': { name: 'Storage', description: 'Pen holders, desk trays, vanity organisers, and storage boxes handcrafted from solid timber.', image: 'https://images.pexels.com/photos/6340708/pexels-photo-6340708.jpeg?auto=compress&cs=tinysrgb&w=1200' },
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
    openGraph: { title: `${col.name} — Teakle`, description: col.description, images: [{ url: col.image, width: 1200, height: 630, alt: col.name }] },
    alternates: { canonical: `https://teakle.in/collection/${slug}` },
  };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  if (!COLLECTIONS[slug]) notFound();

  return <CollectionClient products={PRODUCTS} />;
}

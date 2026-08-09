import { Suspense } from 'react';
import GalleryClient from './GalleryClient';
import { PRODUCTS } from '../data/products';

export const metadata = {
  title: 'Gallery',
  description: 'Browse the full Teakle collection. Solid teak furniture and objects for kitchen, living, bedroom, office, and outdoor spaces.',
  openGraph: { title: 'Gallery — Teakle', description: 'Browse the full Teakle collection.' },
  alternates: { canonical: 'https://teakle.in/gallery' },
};

export default function GalleryPage() {
  return (
    <Suspense>
      <GalleryClient products={PRODUCTS} />
    </Suspense>
  );
}

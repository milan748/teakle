import { Suspense } from 'react';
import GalleryClient from './GalleryClient';
/* Standard catalogue only — the Atelier hero is excluded by design
   (discovered via Homepage → Atelier Stories, never via browsing). */
import { getCatalogueProducts } from '../data/products';

export const metadata = {
  title: 'Gallery',
  description: 'Browse the full Teakle collection. Solid teak furniture and objects for kitchen, living, bedroom, office, and outdoor spaces.',
  openGraph: { title: 'Gallery — Teakle', description: 'Browse the full Teakle collection.', url: 'https://teakle.in/gallery' },
  alternates: { canonical: 'https://teakle.in/gallery' },
};

export default function GalleryPage() {
  return (
    <Suspense>
      <GalleryClient products={getCatalogueProducts()} />
    </Suspense>
  );
}

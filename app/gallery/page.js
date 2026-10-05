import { Suspense } from 'react';
import GalleryClient from './GalleryClient';
/* Standard catalogue only — the Atelier hero is excluded by design
   (discovered via Homepage → Atelier Stories, never via browsing). */
import { getGalleryProducts } from '../data/products';

export const metadata = {
  title: 'Gallery',
  description: 'Browse the first Teakle production. Solid teak flower vases, fruit bowls, chopping boards, serving trays, and coasters.',
  openGraph: { title: 'Gallery — Teakle', description: 'Browse the first Teakle production.', url: 'https://teakle.in/gallery' },
  alternates: { canonical: 'https://teakle.in/gallery' },
};

export default function GalleryPage() {
  return (
    <Suspense>
      <GalleryClient products={getGalleryProducts()} />
    </Suspense>
  );
}

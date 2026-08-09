import { notFound } from 'next/navigation';
import { getProductById, getAllProductIds } from '../../data/products';
import ShopDetailClient from './ShopDetailClient';

export async function generateStaticParams() {
  return getAllProductIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: 'Product Not Found \u2014 Teakle' };

  return {
    title: `${product.name} \u2014 Teakle`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} \u2014 Teakle`,
      description: product.shortDescription,
      images: [{ url: product.images[0], width: 1200, height: 630, alt: product.name }],
      type: 'website',
      siteName: 'Teakle',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} \u2014 Teakle`,
      description: product.shortDescription,
      images: [product.images[0]],
    },
    alternates: {
      canonical: `https://teakle.in/shop/${product.id}`,
    },
  };
}

export default async function ShopDetailPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return <ShopDetailClient product={product} productId={id} />;
}

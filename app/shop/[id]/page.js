import { notFound } from 'next/navigation';
import { getProductById, getAllProductIds } from '../../data/products';
import ShopDetailClient from './ShopDetailClient';
import StructuredData from '../../components/StructuredData';

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

function buildProductSchema(product) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription,
    image: product.images?.[0],
    brand: {
      '@type': 'Brand',
      name: 'Teakle',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'INR',
      url: `https://teakle.in/shop/${product.id}`,
      seller: {
        '@type': 'Organization',
        name: 'Teakle',
      },
    },
  };

  if (product.availability === 'In Stock') {
    schema.offers.availability = 'https://schema.org/InStock';
  } else if (product.availability === 'Limited Edition') {
    schema.offers.availability = 'https://schema.org/InStock';
  }

  return schema;
}

export default async function ShopDetailPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const productSchema = buildProductSchema(product);

  return (
    <>
      <StructuredData data={productSchema} />
      <ShopDetailClient product={product} productId={id} />
    </>
  );
}

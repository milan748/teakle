import { notFound } from 'next/navigation';
import { PRODUCTS, getProductById, isProductSold } from '../../data/products';
import { getProcessBySlug } from '../../data/process';
import InquireClient from './InquireClient';
import StructuredData from '../../components/StructuredData';

export const dynamicParams = false;

/* Dedicated inquiry experience exists for the hero Atelier Stories piece.
   Keyed by product id so WordPress/WooCommerce can later supply the
   product reference while the theme keeps the presentation. */
export async function generateStaticParams() {
  return PRODUCTS.filter((p) => p.isHero).map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product || !product.isHero) return { title: 'Inquiry Not Found' };

  const description = `Begin an ownership inquiry for ${product.name} — ${product.shortDescription}`;

  return {
    title: `${product.name}: Inquire to Own`,
    description,
    openGraph: {
      title: `${product.name}: Inquire to Own — Teakle`,
      description,
      url: `https://teakle.in/inquire/${slug}`,
      images: product.images?.[0]
        ? [{ url: product.images[0], alt: product.name }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name}: Inquire to Own — Teakle`,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    alternates: {
      canonical: `https://teakle.in/inquire/${slug}`,
    },
  };
}

export default async function InquirePage({ params }) {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product || !product.isHero) notFound();

  const processEntry = getProcessBySlug(slug);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription,
    image: product.images?.[0],
    brand: { '@type': 'Brand', name: 'Teakle' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'INR',
      url: `https://teakle.in/inquire/${product.id}`,
      availability: isProductSold(product)
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Teakle' },
    },
  };

  return (
    <>
      <StructuredData data={productSchema} />
      <InquireClient
        product={product}
        processSlug={processEntry ? processEntry.slug : null}
      />
    </>
  );
}

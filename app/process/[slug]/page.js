import { notFound } from 'next/navigation';
import { getProcessBySlug, getAllProcessSlugs } from '../../data/process';
import { getProductById } from '../../data/products';
import ProcessPageClient from './ProcessPageClient';
import StructuredData from '../../components/StructuredData';

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllProcessSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const process = getProcessBySlug(slug);
  if (!process) return { title: 'Process Not Found' };

  const product = getProductById(process.productId);
  const description = process.intro || `The complete making process of ${product?.name || 'a Teakle piece'}.`;

  return {
    title: process.title,
    description,
    openGraph: {
      title: `${process.title} — Teakle`,
      description,
      images: process.heroImage ? [{ url: process.heroImage, width: 1600, height: 900, alt: process.heroImageAlt }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${process.title} — Teakle`,
      description,
      images: process.heroImage ? [process.heroImage] : [],
    },
    alternates: {
      canonical: `https://teakle.in/process/${slug}`,
    },
  };
}

function buildProcessSchema(process, product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: process.title,
    description: process.intro,
    image: process.heroImage || undefined,
    author: {
      '@type': 'Organization',
      name: 'Teakle',
      url: 'https://teakle.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Teakle',
      url: 'https://teakle.in',
    },
    about: product
      ? {
          '@type': 'Product',
          name: product.name,
          description: product.shortDescription,
          image: product.images?.[0] || undefined,
        }
      : undefined,
  };
}

export default async function ProcessPage({ params }) {
  const { slug } = await params;
  const process = getProcessBySlug(slug);
  if (!process) notFound();

  const product = getProductById(process.productId);

  return (
    <>
      <StructuredData data={buildProcessSchema(process, product)} />
      <ProcessPageClient process={process} product={product} />
    </>
  );
}

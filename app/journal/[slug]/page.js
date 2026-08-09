import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllArticleSlugs } from '../../data/journal';
import JournalArticleClient from './JournalArticleClient';
import StructuredData from '../../components/StructuredData';

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found \u2014 Teakle' };

  return {
    title: `${article.title} \u2014 Teakle Journal`,
    description: article.excerpt,
    openGraph: {
      title: `${article.title} \u2014 Teakle Journal`,
      description: article.excerpt,
      images: [{ url: article.image, width: 1200, height: 630, alt: article.imageAlt }],
      type: 'article',
      publishedTime: article.dateISO,
      siteName: 'Teakle',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} \u2014 Teakle Journal`,
      description: article.excerpt,
      images: [article.image],
    },
    alternates: {
      canonical: `https://teakle.in/journal/${article.slug}`,
    },
  };
}

function buildArticleSchema(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.dateISO,
    publisher: {
      '@type': 'Organization',
      name: 'Teakle',
      logo: {
        '@type': 'ImageObject',
        url: 'https://teakle.in/assets/logo-black.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://teakle.in/journal/${article.slug}`,
    },
  };
}

export default async function JournalArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const articleSchema = buildArticleSchema(article);

  return (
    <>
      <StructuredData data={articleSchema} />
      <JournalArticleClient article={article} />
    </>
  );
}

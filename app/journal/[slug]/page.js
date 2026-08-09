import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllArticleSlugs } from '../../data/journal';
import JournalArticleClient from './JournalArticleClient';

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found — Teakle' };

  return {
    title: `${article.title} — Teakle Journal`,
    description: article.excerpt,
    openGraph: {
      title: `${article.title} — Teakle Journal`,
      description: article.excerpt,
      images: [{ url: article.image, width: 1200, height: 630, alt: article.imageAlt }],
      type: 'article',
      publishedTime: article.dateISO,
      siteName: 'Teakle',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} — Teakle Journal`,
      description: article.excerpt,
      images: [article.image],
    },
    alternates: {
      canonical: `https://teakle.in/journal/${article.slug}`,
    },
  };
}

export default async function JournalArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return <JournalArticleClient article={article} />;
}

export default function sitemap() {
  const base = 'https://teakle.in';

  const staticPages = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/studio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/journal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/archive`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/trade`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/custom`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const collections = ['kitchen-dining', 'home-decor', 'everyday-living', 'storage'];
  const collectionPages = collections.map((slug) => ({
    url: `${base}/collection/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...collectionPages];
}

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account', '/checkout', '/cart'],
      },
    ],
    sitemap: 'https://teakle.in/sitemap.xml',
  };
}

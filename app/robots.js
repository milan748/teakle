export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account', '/checkout', '/cart', '/login', '/wishlist', '/admin', '/api'],
      },
    ],
    sitemap: 'https://teakle.in/sitemap.xml',
  };
}

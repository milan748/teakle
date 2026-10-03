import './globals.css';
import Script from 'next/script';
import { headers } from 'next/headers';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollTopBtn from './components/ScrollTopBtn';
import ClientScripts from './components/ClientScripts';
import CookieConsent from './components/CookieConsent';
import StructuredData from './components/StructuredData';
import { getLogoUrl } from './lib/logo-config';

export const metadata = {
  title: {
    default: 'Teakle — Objects for a Permanent Home',
    template: '%s — Teakle',
  },
  description: 'An Indian workshop making solid wood objects, one piece at a time. Handcrafted walnut and teak furniture, kitchenware, and home decor.',
  keywords: ['handcrafted wood', 'solid wood furniture', 'walnut wood', 'teak wood', 'Indian craft', 'artisan furniture', 'wooden home decor'],
  authors: [{ name: 'Teakle' }],
  creator: 'Teakle',
  publisher: 'Teakle',
  metadataBase: new URL('https://teakle.in'),
  icons: {
    icon: '/assets/logos/brandmark_dark.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://teakle.in',
    siteName: 'Teakle',
    title: 'Teakle — Objects for a Permanent Home',
    description: 'An Indian workshop making solid wood objects, one piece at a time.',
    images: [
      {
        url: 'https://teakle.in/assets/hero-luxury-entryway.png',
        width: 1200,
        height: 630,
        alt: 'Teakle handcrafted wooden furniture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teakle — Objects for a Permanent Home',
    description: 'An Indian workshop making solid wood objects, one piece at a time.',
    images: ['https://teakle.in/assets/hero-luxury-entryway.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Teakle',
  url: 'https://teakle.in',
  logo: getLogoUrl('dark'),
  sameAs: ['https://www.instagram.com/teaklestudio'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'hello@teakle.in',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Teakle',
  url: 'https://teakle.in',
};

export default async function RootLayout({ children }) {
  const h = await headers();
  const isEditor = h.get('x-editor-route') === '1';

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#F7F4EE" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/assets/logos/brandmark_dark.png" />
        <link rel="apple-touch-icon" href="/assets/logos/brandmark_dark.png" />
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" as="style" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" />
        <link rel="preload" href="/assets/hero-luxury-entryway.avif" as="image" type="image/avif" />
        <link rel="preload" href="/assets/logos/brandmark_dark.png" as="image" />
        <noscript dangerouslySetInnerHTML={{__html: '<style>.reveal{opacity:1!important;transform:none!important;}</style>'}} />
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
      </head>
      <body>
        {!isEditor && <a href="#main-content" className="skip-link">Skip to content</a>}
        {!isEditor && <Header />}
        {isEditor ? children : (
          <main id="main-content">
            {children}
          </main>
        )}
        {!isEditor && <Footer />}
        {!isEditor && <ScrollTopBtn />}
        {!isEditor && <ClientScripts />}
        {!isEditor && <CookieConsent />}
        <Script src="/app.js" strategy="beforeInteractive" />
        <Script src="/products-browser.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

import './globals.css';
import Script from 'next/script';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ScrollTopBtn from './components/ScrollTopBtn';
import ClientScripts from './components/ClientScripts';
import StructuredData from './components/StructuredData';

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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://teakle.in',
    siteName: 'Teakle',
    title: 'Teakle — Objects for a Permanent Home',
    description: 'An Indian workshop making solid wood objects, one piece at a time.',
    images: [
      {
        url: '/assets/hero-luxury-entryway.png',
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
    images: ['/assets/hero-luxury-entryway.png'],
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
  logo: 'https://teakle.in/assets/logo-black.png',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#F7F4EE" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/assets/logo-black.png" />
        <link rel="apple-touch-icon" href="/assets/logo-black.png" />
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/logo-black.png" as="image" />
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <main id="main-content">
          {children}
        </main>
        <Footer />
        <ScrollTopBtn />
        <BottomNav />
        <ClientScripts />
        <Script src="/app.js" strategy="beforeInteractive" />
        <Script src="/products.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}

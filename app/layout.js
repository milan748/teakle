import './globals.css';
import Script from 'next/script';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ScrollTopBtn from './components/ScrollTopBtn';
import ClientScripts from './components/ClientScripts';

export const metadata = {
  title: {
    default: 'Teakle — Objects for a Permanent Home',
    template: '%s — Teakle',
  },
  description: 'An Indian workshop making solid wood objects, one piece at a time.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/logo-black.png" as="image" />
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

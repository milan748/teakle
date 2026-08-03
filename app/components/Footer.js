import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo"><img src="/assets/logo-black.png" alt="Teakle" /></Link>
            <p>Made by hand in India, one piece at a time.</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/teaklestudio" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="#" aria-label="Pinterest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.78 1.2-5.08 1.2-5.08s-.31-.61-.31-1.51c0-1.42.82-2.48 1.84-2.48.87 0 1.29.65 1.29 1.43 0 .87-.56 2.18-.84 3.39-.24 1.01.51.83 1.49 1.83 1.79 0 3.17-1.89 3.17-4.61 0-2.41-1.73-4.1-4.21-4.1-2.87 0-4.55 2.15-4.55 4.37 0 .87.33 1.79.75 2.3.08.1.09.19.07.29-.08.31-.25 1.01-.28 1.15-.05.19-.15.23-.35.14-1.31-.61-2.13-2.53-2.13-4.07 0-3.31 2.41-6.36 6.94-6.36 3.65 0 6.48 2.6 6.48 6.07 0 3.62-2.28 6.54-5.45 6.54-1.06 0-2.07-.55-2.41-1.21l-.66 2.5c-.24.91-.88 2.06-1.31 2.76.99.31 2.03.47 3.12.47 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
              </a>
              <a href="mailto:hello@teakle.in" aria-label="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/archive">Archive</Link></li>
              <li><Link href="/studio">Studio</Link></li>
              <li><Link href="/journal">Journal</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Studio</h4>
            <ul>
              <li><Link href="/trade">Trade &amp; Bulk Inquiries</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/custom">Custom Orders</Link></li>
            </ul>
          </div>
          <div className="footer-col footer-newsletter">
            <h4>From the Workshop</h4>
            <p>Receive occasional notes from the workshop. No spam. No offers. Only stories.</p>
            <form className="footer-newsletter-form" id="footerNewsletterForm">
              <input type="email" name="email" placeholder="Your email" required aria-label="Email address for newsletter" />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Teakle. All pieces made to order.</span>
          <span>India</span>
        </div>
      </div>
    </footer>
  );
}

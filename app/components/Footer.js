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
            <h4>Services</h4>
            <ul>
              <li><Link href="/trade">Trade &amp; Bulk Inquiries</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/custom">Custom Orders</Link></li>
            </ul>
          </div>
          <div className="footer-col footer-newsletter">
            <h4>From the Workshop</h4>
            <p>Receive occasional notes from the workshop. No spam. No offers. Only stories.</p>
            <form className="footer-newsletter-form" id="footerNewsletterForm" aria-label="Newsletter signup">
              <label htmlFor="footer-email" className="visually-hidden">Email address for newsletter</label>
              <input type="email" id="footer-email" name="email" placeholder="Your email" required aria-label="Email address for newsletter" />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Teakle. Handcrafted in India.</span>
          <div className="footer-legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns-and-refunds">Returns &amp; Refunds</Link>
            <Link href="/cancellation">Cancellation</Link>
            <Link href="/warranty">Warranty</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

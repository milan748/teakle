import Link from 'next/link';
import { getSiteSettings } from '@/lib/cms';
import { SecondaryHorizontal } from './LogoSystem';

function getSetting(settings, key, fallback) {
  const row = settings.find(s => s.key === key);
  return row && row.value ? row.value : fallback;
}

export default function Footer() {
  let settings = [];
  try {
    settings = getSiteSettings();
  } catch {
    // CMS unavailable — use hardcoded fallback
  }

  const footerDescription = getSetting(settings, 'footerDescription', 'Made by hand in India, one piece at a time.');
  const contactEmail = getSetting(settings, 'contactEmail', 'hello@teakle.in');
  const instagramUrl = getSetting(settings, 'instagramUrl', 'https://www.instagram.com/teaklestudio');
  const workshopLocation = getSetting(settings, 'workshopLocation', 'India — visits by appointment only');
  const newsletterHeading = getSetting(settings, 'newsletterHeading', 'From the Workshop');
  const newsletterDescription = getSetting(settings, 'newsletterDescription', 'Receive occasional notes from the workshop. No spam. No offers. Only stories.');

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" aria-label="Teakle home" className="logo">
              <SecondaryHorizontal theme="dark" />
            </Link>
            <p>{footerDescription}</p>
            <div className="footer-social">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>

              <a href={`mailto:${contactEmail}`} aria-label="Email Teakle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h3>Explore</h3>
            <nav aria-label="Explore">
            <ul>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/archive">Archive</Link></li>
              <li><Link href="/studio">Studio</Link></li>
              <li><Link href="/journal">Journal</Link></li>
            </ul>
            </nav>
          </div>
          <div className="footer-col">
            <h3>Services</h3>
            <nav aria-label="Services">
            <ul>
              <li><Link href="/trade">Trade &amp; Bulk Inquiries</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/custom">Commission</Link></li>
            </ul>
            </nav>
          </div>
          <div className="footer-col footer-newsletter">
            <h3>{newsletterHeading}</h3>
            <p>{newsletterDescription}</p>
            <form className="footer-newsletter-form" id="footerNewsletterForm" aria-label="Newsletter signup">
              <label htmlFor="footer-email" className="visually-hidden">Email address for newsletter</label>
              <input type="email" id="footer-email" name="email" placeholder="Your email" required aria-label="Email address for newsletter" />
              <button type="submit">Send</button>
              <label className="newsletter-consent" htmlFor="footer-newsletter-consent">
                <input type="checkbox" id="footer-newsletter-consent" name="marketingConsent" defaultChecked />
                <span>Yes, send me workshop stories by email.</span>
              </label>
              <p className="newsletter-hint" id="footerNewsletterHint" role="status">Please tick the box above to receive workshop stories.</p>
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
            <Link href="/grievance">Grievance</Link>
            <button type="button" className="footer-legal-btn" data-open-cookie-prefs>Cookie Preferences</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

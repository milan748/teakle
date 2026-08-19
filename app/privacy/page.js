import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Teakle collects, uses, and protects your personal information.',
  alternates: { canonical: 'https://teakle.in/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <div className="page-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: August 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>1. Information We Collect</h2>
          <p>When you use the Teakle website, we may collect the following types of information:</p>
          <ul>
            <li><strong>Contact information:</strong> Name, email address, phone number — when you submit a contact form, trade inquiry, custom order request, or create an account.</li>
            <li><strong>Account information:</strong> Name, email, password, phone, date of birth — when you register an account. <em>Note: Currently stored locally in your browser. Production implementation will use secure server-side storage.</em></li>
            <li><strong>Order information:</strong> Shipping address, billing address, payment details — when you place an order. <em>Note: No payment data is currently processed. Production checkout will use Shopify.</em></li>
            <li><strong>Custom order submissions:</strong> Description, reference images, dimensions, and preferences — when you submit a custom order request.</li>
            <li><strong>Browsing data:</strong> Pages viewed, products viewed, search queries — stored locally as recently viewed items.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To respond to your inquiries and custom order requests</li>
            <li>To process and fulfill orders (future production)</li>
            <li>To create and manage your account</li>
            <li>To improve our website and product offerings</li>
            <li>To communicate about your orders, inquiries, or account</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>3. Data Storage &amp; Security</h2>
          <p><strong>Current demo site:</strong> Account data, cart, and wishlist are stored in your browser&apos;s localStorage. This data is not transmitted to any server and is only accessible on your device.</p>
          <p><strong>Production site (future):</strong> Customer data will be stored securely through Shopify Customer Accounts and Shopify&apos;s infrastructure. Payment processing will be handled by Shopify Payments or approved payment providers.</p>
          <p>We implement reasonable security measures to protect your personal information. However, no method of electronic transmission or storage is completely secure.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>4. Third-Party Services</h2>
          <ul>
            <li><strong>Shopify</strong> (future) — E-commerce platform, payment processing, order management</li>
            <li><strong>Pexels</strong> — Product and editorial imagery (no personal data shared)</li>
            <li><strong>Google Fonts</strong> — Font delivery (no personal data shared)</li>
          </ul>
          <p>We do not currently use analytics, advertising, or tracking scripts.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>5. Cookies &amp; Local Storage</h2>
          <p>We do not use cookies. We use browser localStorage for the following purposes:</p>
          <ul>
            <li><code>teakle_cart</code> — Shopping cart contents</li>
            <li><code>teakle_wishlist</code> — Saved wishlist items</li>
            <li><code>teakle_users</code> — Account information (demo)</li>
            <li><code>teakle_currentUser</code> — Current login session (demo)</li>
            <li><code>teakle_recently_viewed</code> — Recently viewed products</li>
            <li><code>teakle_addresses</code> — Saved addresses</li>
            <li><code>teakle_notifications</code> — Account notifications</li>
          </ul>
          <p>localStorage data remains on your device and is not transmitted to our servers.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>6. Data Retention</h2>
          <p><strong>Current demo:</strong> Data is retained in your browser localStorage until you manually clear it or delete your account.</p>
          <p><strong>Production (future):</strong> Account data will be retained as long as your account is active. Order data will be retained for [INSUFFICIENT DATA — BUSINESS DECISION REQUIRED] years for legal and tax compliance.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> the personal data we hold about you</li>
            <li><strong>Correct</strong> inaccurate personal data</li>
            <li><strong>Delete</strong> your personal data and account</li>
            <li><strong>Export</strong> your data in a portable format</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:hello@teakle.in">hello@teakle.in</a>.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>8. Children&apos;s Privacy</h2>
          <p>Our website is not intended for children under 18. We do not knowingly collect personal information from children.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>9. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>10. Contact Us</h2>
          <p>For questions about this privacy policy or your personal data:</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Website: <a href="https://teakle.in">teakle.in</a></li>
            <li>Instagram: <a href="https://www.instagram.com/teaklestudio" target="_blank" rel="noopener noreferrer">@teaklestudio</a></li>
          </ul>
          <p><em>INSUFFICIENT DATA — Physical address, phone number, and legal entity name to be provided before launch.</em></p>
        </section>
      </div>
    </>
  );
}

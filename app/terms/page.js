import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms governing the use of the Teakle website and purchase of products.',
  alternates: { canonical: 'https://teakle.in/terms' },
};

export default function TermsPage() {
  return (
    <>
      <div className="page-header">
        <h1>Terms &amp; Conditions</h1>
        <p>Last updated: August 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using the Teakle website (teakle.in), you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use this website.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>2. Eligibility</h2>
          <p>You must be at least 18 years old to use this website and place orders. By using this site, you represent that you meet this requirement.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>3. Products</h2>
          <p>All Teakle products are handcrafted from solid wood. Due to the natural material, variations in grain, colour, and texture are inherent and are not defects.</p>
          <ul>
            <li><strong>Standard products</strong> are existing physical inventory, available for immediate dispatch.</li>
            <li><strong>Hero products</strong> are unique one-of-one pieces. Once sold, they are not restocked.</li>
            <li><strong>Custom orders</strong> are made-to-order pieces crafted to your specifications.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>4. Pricing</h2>
          <p>All prices are displayed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</p>
          <p><em>INSUFFICIENT DATA — GSTIN and tax breakdown details to be finalized before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>5. Product Availability</h2>
          <p>Product availability is as shown on the website. Standard products are subject to stock availability. Hero products are limited to one unit. Custom orders are subject to workshop capacity and material availability.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>6. Orders</h2>
          <p>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order. Orders are subject to availability and our acceptance.</p>
          <p><strong>Note:</strong> The current website operates in demo mode. Orders placed on the demo site are not processed and no payment is collected.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>7. Payment</h2>
          <p><em>INSUFFICIENT DATA — Payment methods, processing provider, and payment terms to be finalized before launch. Production checkout will use Shopify Payments.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>8. Shipping &amp; Delivery</h2>
          <p>Shipping terms are governed by our <Link href="/shipping">Shipping Policy</Link>. Please review it for details on processing times, delivery estimates, and shipping charges.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>9. Returns &amp; Refunds</h2>
          <p>Return and refund terms are governed by our <Link href="/returns-and-refunds">Returns &amp; Refunds Policy</Link>.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>10. Cancellations</h2>
          <p>Cancellation terms are governed by our <Link href="/cancellation">Cancellation Policy</Link>.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>11. Custom Orders</h2>
          <p>Custom orders are made-to-order and subject to additional terms. Please review our <Link href="/custom">Custom Orders</Link> page for details.</p>
          <p><em>INSUFFICIENT DATA — Custom order payment terms, cancellation terms, and production timeline details to be finalized before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>12. Intellectual Property</h2>
          <p>All content on this website — including text, images, logos, designs, and product descriptions — is the property of Teakle and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without written permission.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>13. Website Usage</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the website for any unlawful purpose</li>
            <li>Attempt to gain unauthorised access to any part of the website</li>
            <li>Interfere with or disrupt the website&apos;s functionality</li>
            <li>Use automated systems to access the website without written permission</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>14. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Teakle shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this website or purchase of our products.</p>
          <p><em>INSUFFICIENT DATA — Governing law jurisdiction and specific liability limitations to be finalized with legal counsel before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>15. Governing Law</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Governing law and jurisdiction to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>16. Dispute Resolution</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Dispute resolution mechanism (arbitration, mediation, or court jurisdiction) to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>17. Changes to These Terms</h2>
          <p>We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>18. Contact</h2>
          <p>For questions about these terms:</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Website: <a href="https://teakle.in">teakle.in</a></li>
          </ul>
          <p><em>INSUFFICIENT DATA — Physical address and legal entity name to be provided before launch.</em></p>
        </section>
      </div>
    </>
  );
}

import Link from 'next/link';

export const metadata = {
  title: 'Shipping Policy',
  description: 'Shipping information for Teakle handcrafted wooden products.',
  alternates: { canonical: 'https://teakle.in/shipping' },
};

export default function ShippingPage() {
  return (
    <>
      <div className="page-header">
        <h1>Shipping Policy</h1>
        <p>Last updated: August 2026</p>
      </div>
      <main className="container" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>1. Shipping Regions</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Shipping regions (domestic only, or domestic + international) to be finalized before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>2. Processing &amp; Dispatch</h2>
          <p>Standard products are dispatched from our workshop within [INSUFFICIENT DATA — BUSINESS DECISION REQUIRED] business days of order confirmation.</p>
          <p>Custom orders require production time before dispatch. Estimated production timelines are provided during the custom order process.</p>
          <p><strong>Note:</strong> Individual product pages may list approximate shipping timelines. These are estimates, not guarantees, and are subject to change.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>3. Estimated Delivery</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Estimated delivery timeframes for domestic and international shipping to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>4. Shipping Charges</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Shipping charges, free-shipping threshold, and remote-area surcharges to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>5. Large-Item &amp; White-Glove Delivery</h2>
          <p>For large furniture items such as the Anchor Table, special delivery arrangements may apply.</p>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — White-glove delivery availability, charges, and terms to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>6. Tracking</h2>
          <p><em>INSUFFICIENT DATA — Tracking provider and notification method to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>7. Damaged Shipments</h2>
          <p>If your order arrives damaged, please contact us within [INSUFFICIENT DATA — BUSINESS DECISION REQUIRED] days of delivery with photographs of the damage. We will arrange a replacement or refund.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>8. Failed Delivery</h2>
          <p><em>INSUFFICIENT DATA — Failed delivery procedure and re-shipping charges to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>9. Address Changes</h2>
          <p><em>INSUFFICIENT DATA — Address change policy and cut-off times to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>10. Contact</h2>
          <p>For shipping questions:</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Instagram: <a href="https://www.instagram.com/teaklestudio" target="_blank" rel="noopener noreferrer">@teaklestudio</a></li>
          </ul>
        </section>
      </main>
    </>
  );
}

import Link from 'next/link';

export const metadata = {
  title: 'Cancellation Policy',
  description: 'Cancellation terms for Teakle standard products and custom orders.',
  alternates: { canonical: 'https://teakle.in/cancellation' },
};

export default function CancellationPage() {
  return (
    <>
      <div className="page-header">
        <h1>Cancellation Policy</h1>
        <p>Last updated: August 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>Standard Products</h2>

          <h3>Before Dispatch</h3>
          <p>You may cancel your order for a standard product before it has been dispatched. Contact us at <a href="mailto:hello@teakle.in">hello@teakle.in</a> with your order number.</p>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Refund timing for pre-dispatch cancellations to be determined.</em></p>

          <h3>After Dispatch</h3>
          <p>Once a standard product has been dispatched, cancellation is no longer possible. You may initiate a return under our <Link href="/returns-and-refunds">Returns &amp; Refunds Policy</Link> upon delivery.</p>

          <h3>After Delivery</h3>
          <p>After delivery, cancellation is not available. Please refer to our <Link href="/returns-and-refunds">Returns &amp; Refunds Policy</Link>.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>Custom Orders</h2>
          <p>Custom orders follow a separate cancellation process due to their made-to-order nature:</p>

          <h3>Before Work Begins</h3>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Cancellation terms before production begins to be determined.</em></p>

          <h3>After Approval</h3>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Cancellation terms after design approval to be determined.</em></p>

          <h3>After Production Begins</h3>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Cancellation terms once production has started to be determined. Note: Materials may have been purchased and labour committed.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>Contact</h2>
          <p>To cancel an order:</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Instagram: <a href="https://www.instagram.com/teaklestudio" target="_blank" rel="noopener noreferrer">@teaklestudio</a></li>
          </ul>
        </section>
      </div>
    </>
  );
}

import Link from 'next/link';

export const metadata = {
  title: 'Cancellation Policy',
  description: 'Cancellation terms for Teakle standard products and custom orders.',
  openGraph: {
    title: 'Cancellation Policy — Teakle',
    description: 'Cancellation terms for Teakle standard products and custom orders.',
    url: 'https://teakle.in/cancellation',
  },
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
          <h2 id="cancellation-requests">Cancellation Requests</h2>
          <p>Cancellation requests should be submitted as early as possible after placing an order. An order may no longer be cancellable once processing, production, packing or dispatch has begun.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="custom-products">Custom / Commissioned / Made-to-Order</h2>
          <p>Custom, commissioned and made-to-order products cannot ordinarily be cancelled once production or preparation has begun.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="after-dispatch">After Dispatch</h2>
          <p>Orders that have already been dispatched cannot ordinarily be cancelled through the website.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="confirmation">Cancellation Confirmation</h2>
          <p>If TEAKLE approves a cancellation, the applicable resolution will be communicated to the customer.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="contact">Contact</h2>
          <p>To cancel an order, email <a href="mailto:hello@teakle.in">hello@teakle.in</a> with your order number. Also see our <Link href="/returns-and-refunds">Returns &amp; Refunds Policy</Link>.</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Instagram: <a href="https://www.instagram.com/teaklestudio" target="_blank" rel="noopener noreferrer">@teaklestudio</a></li>
          </ul>
        </section>
      </div>
    </>
  );
}

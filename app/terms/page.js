import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms governing the use of the Teakle website and purchase of products.',
  openGraph: {
    title: 'Terms & Conditions — Teakle',
    description: 'Terms governing the use of the Teakle website and purchase of products.',
    url: 'https://teakle.in/terms',
  },
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
          <h2 id="orders">Orders</h2>
          <p>An order placed through the TEAKLE website is subject to successful payment, product availability and order confirmation. TEAKLE may contact the customer if additional information is required to fulfil an order.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="product-information">Product Information</h2>
          <p>TEAKLE makes reasonable efforts to present products, photographs, dimensions and descriptions accurately. Products made from natural materials may have individual variations in grain, colour, texture and character.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="final-sale">Final Sale</h2>
          <p>All TEAKLE purchases are final. We do not ordinarily accept returns or exchanges due to change of mind, personal preference, incorrect selection or similar customer preference.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="custom-products">Custom, Commissioned &amp; Made-to-Order Products</h2>
          <p>Custom, commissioned and made-to-order products cannot ordinarily be cancelled or returned due to change of mind once production or preparation has begun. Product-condition and fulfilment issues remain subject to the applicable claim process described in these policies.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="payment">Payment</h2>
          <p>Orders must be paid using the payment methods made available at checkout. Prices displayed at checkout are the prices applicable to the order at the time of purchase.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="intellectual-property">Intellectual Property</h2>
          <p>TEAKLE&apos;s name, logo, product photography, designs, written content and other website materials may not be copied, reproduced, modified or used commercially without permission.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="policy-updates">Policy Updates</h2>
          <p>TEAKLE may update these website policies from time to time. The version applicable to an order is the version displayed and applicable at the time the order is placed.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="related-policies">Related Policies</h2>
          <ul>
            <li><Link href="/shipping">Shipping &amp; Delivery</Link></li>
            <li><Link href="/returns-and-refunds">Returns, Refunds &amp; Credit Notes</Link></li>
            <li><Link href="/cancellation">Cancellation Policy</Link></li>
            <li><Link href="/warranty">Warranty &amp; Product Care</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/grievance">Grievance Redressal</Link></li>
          </ul>
          <p>These policies describe TEAKLE&apos;s standard customer-facing practices and claim procedures. Nothing in these policies is intended to remove or restrict any customer right or remedy that cannot be excluded under applicable requirements.</p>
        </section>
      </div>
    </>
  );
}

import Link from 'next/link';

export const metadata = {
  title: 'Returns & Refunds',
  description: 'Return and refund policy for Teakle handcrafted wooden products.',
  alternates: { canonical: 'https://teakle.in/returns-and-refunds' },
};

export default function ReturnsPage() {
  return (
    <>
      <div className="page-header">
        <h1>Returns &amp; Refunds</h1>
        <p>Last updated: August 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>1. Standard Products</h2>
          <p>We want you to be satisfied with your purchase. If you are not happy with a standard product, you may request a return under the following conditions:</p>
          <ul>
            <li>The item is unused and in its original condition</li>
            <li>The return request is made within [INSUFFICIENT DATA — BUSINESS DECISION REQUIRED] days of delivery</li>
            <li>The item is in its original packaging</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>2. Damaged or Incorrect Products</h2>
          <p>If your order arrives damaged or incorrect, please contact us within [INSUFFICIENT DATA — BUSINESS DECISION REQUIRED] days of delivery with:</p>
          <ul>
            <li>Photographs of the damage or incorrect item</li>
            <li>Your order number</li>
            <li>A description of the issue</li>
          </ul>
          <p>We will arrange a replacement or full refund at no cost to you.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>3. Return Exclusions</h2>
          <p>The following items are not eligible for return:</p>
          <ul>
            <li>Custom orders (made-to-order pieces crafted to your specifications)</li>
            <li>Items that have been used, altered, or damaged after delivery</li>
            <li>Items without original packaging</li>
            <li>Gift cards</li>
          </ul>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Custom order return policy to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>4. Return Process</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Return shipping responsibility, return address, and return process steps to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>5. Refunds</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Refund method (original payment method, store credit, etc.) and refund timing to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>6. Exchanges</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Exchange policy and process to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>7. Custom Orders</h2>
          <p>Custom orders are made-to-order pieces crafted to your specifications. Due to the personalised nature of these items:</p>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Custom order return/refund terms to be determined before launch. Do not assume custom orders are non-refundable without explicit business decision.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>8. Contact</h2>
          <p>For return and refund questions:</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Instagram: <a href="https://www.instagram.com/teaklestudio" target="_blank" rel="noopener noreferrer">@teaklestudio</a></li>
          </ul>
        </section>
      </div>
    </>
  );
}

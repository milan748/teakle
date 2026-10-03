export const metadata = {
  title: 'Shipping Policy',
  description: 'Shipping information for Teakle handcrafted wooden products.',
  openGraph: {
    title: 'Shipping Policy — Teakle',
    description: 'Shipping information for Teakle handcrafted wooden products.',
    url: 'https://teakle.in/shipping',
  },
  alternates: { canonical: 'https://teakle.in/shipping' },
};

export default function ShippingPage() {
  return (
    <>
      <div className="page-header">
        <h1>Shipping Policy</h1>
        <p>Last updated: August 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="order-processing">Order Processing</h2>
          <p>Orders are processed after successful payment and confirmation. Processing time may vary depending on product availability and the nature of the order.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="delivery">Delivery</h2>
          <p>Delivery timelines and shipping charges, where applicable, are displayed or communicated during the purchase process. Delivery timelines may vary by location and circumstances outside TEAKLE&apos;s direct control.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="delivery-address">Delivery Address</h2>
          <p>Customers are responsible for providing a complete and accurate delivery address and contact details. Delays or additional delivery arrangements resulting from an incorrect or incomplete address may be the customer&apos;s responsibility.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="inspect-your-package">Inspect Your Package</h2>
          <p>Please inspect the outer package when it arrives. If you notice damage or believe the contents may be affected, please record a continuous, unedited unboxing video before opening and throughout the complete unpacking process.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="transit-damage">Transit Damage — Unboxing Video Required</h2>
          <p><strong>A clear, continuous and unedited unboxing video is required to raise a transit-damage claim. The video should show the sealed package, shipping label, outer condition, opening of the package, protective materials and the product inside.</strong></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="contact">Contact</h2>
          <p>For shipping questions:</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Instagram: <a href="https://www.instagram.com/teaklestudio" target="_blank" rel="noopener noreferrer">@teaklestudio</a></li>
          </ul>
        </section>
      </div>
    </>
  );
}

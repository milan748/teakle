export const metadata = {
  title: 'Warranty Policy',
  description: 'Warranty coverage for Teakle handcrafted wooden products.',
  openGraph: {
    title: 'Warranty Policy — Teakle',
    description: 'Warranty coverage for Teakle handcrafted wooden products.',
    url: 'https://teakle.in/warranty',
  },
  alternates: { canonical: 'https://teakle.in/warranty' },
};

export default function WarrantyPage() {
  return (
    <>
      <div className="page-header">
        <h1>Warranty Policy</h1>
        <p>Last updated: August 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="manufacturing-issues">Manufacturing Issues</h2>
          <p>If you identify a manufacturing issue, contact TEAKLE with photographs and details of the problem. Where the issue is identifiable upon opening or unpacking, the continuous unboxing video is required as supporting proof of the condition in which the product was received.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="natural-materials">Natural Materials</h2>
          <p>TEAKLE products may be made from natural wood and other natural materials. Variations in grain, colour, texture, knots and other natural characteristics are part of the character of the material and are not ordinarily treated as defects.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="care-use">Care &amp; Use</h2>
          <p>Customers should follow the care instructions supplied with the product. Damage caused by misuse, unsuitable cleaning products, excessive moisture, impact, alterations, improper installation or normal wear is not ordinarily treated as a manufacturing defect.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="warranty-period">Warranty Period</h2>
          <p>The applicable warranty period and coverage for each product, where offered, will be stated on the product page, order documentation or accompanying product information.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="contact">Contact</h2>
          <p>For warranty questions:</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Instagram: <a href="https://www.instagram.com/teaklestudio" target="_blank" rel="noopener noreferrer">@teaklestudio</a></li>
          </ul>
        </section>
      </div>
    </>
  );
}

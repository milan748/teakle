import Link from 'next/link';

export const metadata = {
  title: 'Warranty Policy',
  description: 'Warranty coverage for Teakle handcrafted wooden products.',
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
          <h2>1. Warranty Duration</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Warranty duration to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>2. What Is Covered</h2>
          <p>Our warranty covers:</p>
          <ul>
            <li><strong>Structural defects:</strong> Issues affecting the structural integrity of the product (joint failure, leg instability, etc.)</li>
            <li><strong>Workmanship defects:</strong> Issues arising from manufacturing or crafting errors (uneven finish, rough surfaces, misaligned parts)</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>3. What Is Not Covered</h2>
          <p>The following are not covered under warranty:</p>
          <ul>
            <li><strong>Natural wood characteristics:</strong> Variations in grain, colour, knots, and natural markings are inherent to solid wood and are not defects</li>
            <li><strong>Finish variation:</strong> Slight differences in tone or finish between products or between product images and the actual item</li>
            <li><strong>Cracking or warping</strong> caused by improper environmental conditions (excessive dryness, direct heat, prolonged moisture exposure)</li>
            <li><strong>Misuse or neglect:</strong> Damage from improper use, overloading, or failure to follow care instructions</li>
            <li><strong>Environmental damage:</strong> Damage from water, humidity, extreme temperatures, or direct sunlight</li>
            <li><strong>Unauthorized modification:</strong> Damage from repairs, alterations, or modifications not performed by Teakle</li>
            <li><strong>Normal wear and tear:</strong> Gradual deterioration from regular use over time</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>4. Wood Care</h2>
          <p>Solid teak and walnut products are built to last generations with proper care. To maintain your product:</p>
          <ul>
            <li>Wipe with a soft, dry cloth for regular cleaning</li>
            <li>Apply teak oil or wood conditioner periodically as needed</li>
            <li>Avoid placing hot items directly on the surface</li>
            <li>Keep away from direct heat sources and prolonged moisture</li>
            <li>Use coasters and trivets for drinks and hot dishes</li>
          </ul>
          <p>Refer to the care instructions included with your product for specific guidance.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>5. Claim Procedure</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Warranty claim procedure (contact method, required documentation, inspection process) to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>6. Remedy</h2>
          <p><em>INSUFFICIENT DATA — BUSINESS DECISION REQUIRED — Warranty remedy options (repair, replacement, or refund) and their conditions to be determined before launch.</em></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>7. Contact</h2>
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

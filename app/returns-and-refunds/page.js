export const metadata = {
  title: 'Returns & Refunds',
  description: 'Return and refund policy for Teakle handcrafted wooden products.',
  openGraph: {
    title: 'Returns & Refunds — Teakle',
    description: 'Return and refund policy for Teakle handcrafted wooden products.',
    url: 'https://teakle.in/returns-and-refunds',
  },
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
          <h2 id="final-sale">Final Sale</h2>
          <p>All TEAKLE purchases are final. We do not ordinarily accept returns or exchanges for change of mind, personal preference, incorrect selection, size preference or similar reasons.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="claims-we-can-review">Claims We Can Review</h2>
          <p>TEAKLE may review claims involving transit damage, a damaged product, an incorrect product, a missing component, a manufacturing defect or a material mismatch with the confirmed order.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="unboxing-video">Unboxing Video Required for Claims</h2>
          <p><strong>A clear, continuous and unedited unboxing video is required for claims relating to transit damage, damaged products, incorrect products, missing components or other issues that could reasonably be identified during unpacking.</strong></p>
          <p>The video should begin before the package is opened and should clearly show the outer packaging, shipping label, seals, package opening, protective materials and the product inside. The recording should not be paused, cut or edited.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="how-to-submit">How to Submit a Claim</h2>
          <p>Please contact TEAKLE as soon as possible after delivery with your order details, clear photographs and the required unboxing video. Additional information may be requested where necessary to assess the claim.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="incorrect-or-missing">Incorrect Product / Missing Component</h2>
          <p><strong>A continuous unboxing video is required to raise a claim for an incorrect product or missing component. Please include photographs and order details with the video.</strong></p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="manufacturing-defect">Manufacturing Defect</h2>
          <p>If you believe your product has a manufacturing defect, contact TEAKLE with clear photographs and details of the issue. Where the issue is identifiable upon opening or unpacking, the continuous unboxing video is required as supporting proof of the condition in which the product was received.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="review-resolution">Review &amp; Resolution</h2>
          <p>After reviewing the submitted information, TEAKLE may provide a repair, replacement, exchange, Credit Note or another appropriate resolution depending on the nature of the issue and product availability.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="return-shipping">Return Shipping</h2>
          <p>For a confirmed transit-damage, manufacturing-defect, incorrect-product or other TEAKLE-side fulfilment issue, TEAKLE will arrange or bear the applicable return or replacement shipping cost. For a separately approved customer-requested return, return shipping is ordinarily borne by the customer.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="credit-notes">Credit Notes</h2>
          <p>Credit Notes issued by TEAKLE are valid for <strong>6 months</strong> from the date of issue and may be used toward a future TEAKLE purchase.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="refunds">Refunds</h2>
          <p>TEAKLE primarily resolves approved product claims through repair, replacement, exchange or Credit Note. Where a monetary refund is applicable to an approved claim, TEAKLE will communicate the applicable amount and method after review.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="contact">Contact</h2>
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

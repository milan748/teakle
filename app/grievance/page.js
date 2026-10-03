import Link from 'next/link';

export const metadata = {
  title: 'Grievance Redressal',
  description: 'How to raise a complaint or grievance with Teakle and how it will be handled.',
  openGraph: {
    title: 'Grievance Redressal — Teakle',
    description: 'How to raise a complaint or grievance with Teakle and how it will be handled.',
    url: 'https://teakle.in/grievance',
  },
  alternates: { canonical: 'https://teakle.in/grievance' },
};

const manualFieldStyle = {
  background: 'rgba(167, 134, 89, 0.12)',
  borderBottom: '1px dashed var(--bronze)',
  padding: '0 4px',
  whiteSpace: 'nowrap',
};

export default function GrievancePage() {
  return (
    <>
      <div className="page-header">
        <h1>Grievance Redressal</h1>
        <p>Last updated: August 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="customer-support">Customer Support</h2>
          <p>For questions, complaints or order-related concerns, customers may contact TEAKLE using the customer-care details displayed on the website.</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Contact page: <Link href="/contact">teakle.in/contact</Link></li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="grievance-contact">Grievance Contact</h2>
          <ul>
            <li>Grievance Officer: <strong style={manualFieldStyle}>[To be confirmed — officer name]</strong></li>
            <li>Designation: <strong style={manualFieldStyle}>[To be confirmed — designation]</strong></li>
            <li>Email: <strong style={manualFieldStyle}>[To be confirmed — grievance email]</strong></li>
            <li>Phone: <strong style={manualFieldStyle}>[To be confirmed — grievance phone]</strong></li>
            <li>Address: <strong style={manualFieldStyle}>[To be confirmed — grievance / business address]</strong></li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="submitting-a-complaint">Submitting a Complaint</h2>
          <p>Please include your order number, registered contact details and a clear description of the issue. For product-condition claims, include the required continuous unboxing video and supporting photographs.</p>
          <p>Complaints may be submitted through the <Link href="/contact">contact page</Link> or by emailing <a href="mailto:hello@teakle.in">hello@teakle.in</a> with the details above.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="complaint-handling">Complaint Handling</h2>
          <p>TEAKLE will acknowledge and review customer complaints and communicate the next steps through the contact details provided.</p>
        </section>
      </div>
    </>
  );
}

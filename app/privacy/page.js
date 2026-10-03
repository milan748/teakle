export const metadata = {
  title: 'Privacy Policy',
  description: 'How Teakle collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy — Teakle',
    description: 'How Teakle collects, uses, and protects your personal information.',
    url: 'https://teakle.in/privacy',
  },
  alternates: { canonical: 'https://teakle.in/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <div className="page-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: August 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <p>TEAKLE collects information needed to process orders, deliver products, provide customer support, communicate with customers and operate and improve the website.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="information-we-may-collect">Information We May Collect</h2>
          <p>This may include your name, email address, phone number, billing and delivery address, order details, payment-related information handled through our payment providers, customer communications and technical information generated when you use the website.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="how-we-use-information">How We Use Information</h2>
          <p>We use customer information to process and fulfil orders, arrange delivery, provide support, respond to enquiries, maintain business records, improve our website and communicate service-related information.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="service-providers">Service Providers</h2>
          <p>Where required to operate TEAKLE, information may be handled by service providers such as payment processors, hosting providers, delivery partners, email services, analytics providers and other operational partners.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="cookies">Cookies &amp; Similar Technologies</h2>
          <p>The website may use cookies and similar technologies for essential website functions, preferences, analytics and other features implemented by TEAKLE.</p>
        </section>

        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 id="contact">Contact</h2>
          <p>For privacy-related questions or requests, customers may contact TEAKLE through the customer-care contact details displayed on the website.</p>
          <ul>
            <li>Email: <a href="mailto:hello@teakle.in">hello@teakle.in</a></li>
            <li>Contact page: <a href="/contact">teakle.in/contact</a></li>
          </ul>
        </section>
      </div>
    </>
  );
}

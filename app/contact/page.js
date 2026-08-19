import ContactForm from '../components/ContactForm';
import { getPublishedPageSections } from '@/lib/cms'

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact',
  description: 'Questions before you order are always welcome. Get in touch with the Teakle workshop.',
  openGraph: { title: 'Contact — Teakle', description: 'Questions before you order are always welcome.' },
};

export default function ContactPage() {
  let sections = [];
  try { sections = getPublishedPageSections('contact'); } catch {}
  const cms = {};
  for (const s of sections) { if (s.enabled) cms[s.sectionKey] = s; }
  const cmsKeys = new Set(sections.map(s => s.sectionKey));

  const hero = cms.hero || {};
  const intro = cms.introduction || {};
  const heroDisabled = cmsKeys.has('hero') && !cms.hero;
  const introDisabled = cmsKeys.has('introduction') && !cms.introduction;
  return (
    <>
      <style>{`
        .contact-section {
          background: var(--bg-primary);
          padding: var(--space-lg) 0 6rem;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 4rem;
          align-items: start;
        }

        .contact-info-block { border-top: var(--border-hair); padding-top: 0.75rem; margin-bottom: 1.5rem; }
        .contact-info-block h3 {
          font-size: var(--text-caption);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: var(--font-body);
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.35rem;
        }
        .contact-info-block p, .contact-info-block a {
          font-size: var(--text-body);
          line-height: var(--lh-relaxed);
          color: var(--text-primary);
        }
        .contact-info-block a { transition: color var(--dur-fast) var(--ease); }
        .contact-info-block a:hover { color: var(--bronze); }

        .contact-form {
          background: var(--bg-secondary);
          padding: 1.75rem;
        }
        .form-row { margin-bottom: 1.15rem; }
        .form-row label {
          display: block;
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }
        .form-row input,
        .form-row textarea {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--stone);
          padding: 0.55rem 0.25rem;
          font-family: var(--font-body);
          font-size: var(--text-body);
          color: var(--text-primary);
          transition: border-color var(--dur-fast) var(--ease);
        }
        .form-row textarea { resize: vertical; min-height: 100px; font-family: var(--font-body); }
        .form-row input:focus,
        .form-row textarea:focus {
          outline: none;
          border-color: var(--bronze);
        }
        .form-row input[aria-invalid="true"],
        .form-row textarea[aria-invalid="true"] {
          border-color: #c0392b;
        }
        .form-error {
          display: block;
          font-size: 12px;
          color: #c0392b;
          margin-top: 0.3rem;
        }
        .required { color: #c0392b; }
        .form-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; }
        .contact-submit { margin-top: 0.5rem; }
        .contact-submit:active { transform: scale(0.97); }
        .contact-submit:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
        .contact-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .contact-form-status {
          font-size: var(--text-caption);
          color: var(--forest);
          margin-top: 0.5rem;
          min-height: 1.2em;
          opacity: 0;
          transition: opacity var(--dur-fast) var(--ease);
        }
        .contact-form-status.is-visible { opacity: 1; }

        @media (max-width: 860px) {
          .contact-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .form-two-col { grid-template-columns: 1fr; }
          .form-row input, .form-row textarea { min-height: 44px; font-size: var(--text-body); line-height: var(--lh-relaxed); }
          .contact-form { padding: 1.25rem; }
        }
      `}</style>

      {!heroDisabled && (
      <section className="page-hero">
        <img src={hero.image || "https://images.pexels.com/photos/7234682/pexels-photo-7234682.jpeg?auto=compress&cs=tinysrgb&w=1600"} alt="A hand rubbing oil finish into a wooden surface." />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">{hero.eyebrow || 'Contact'}</span>
          <h1>{hero.title || 'Questions before you order are always welcome.'}</h1>
          <p>{hero.subtitle || "Whether it\u2019s about a piece, timelines, or something you\u2019re not sure exists yet \u2014 write to us directly."}</p>
        </div>
      </section>
      )}

      {!introDisabled && (
      <section className="contact-section">
        <div className="container contact-grid">
          <div className="contact-details">
            <div className="contact-info-block reveal">
              <h3>Email</h3>
              <p><a href="mailto:hello@teakle.in">hello@teakle.in</a></p>
            </div>
            <div className="contact-info-block reveal">
              <h3>Response Time</h3>
              <p>{intro.subtitle || 'Within two working days'}</p>
            </div>
            <div className="contact-info-block reveal">
              <h3>Workshop</h3>
              <p>India — visits by appointment only</p>
            </div>
            <div className="contact-info-block reveal">
              <h3>For Trade &amp; Bulk Projects</h3>
              <p><a href="/trade" className="link-quiet" style={{ fontSize: 'var(--text-caption)' }}>Use the Trade Inquiry Form</a></p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
      )}
    </>
  );
}

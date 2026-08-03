'use client';

import { useEffect, useRef } from 'react';

export default function ContactPage() {
  const formRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const form = formRef.current;
    const status = statusRef.current;
    if (!form || !status) return;

    function handleSubmit(e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      setTimeout(() => {
        status.textContent = 'Message received. We will reply within two working days.';
        status.classList.add('is-visible');
        form.reset();
        btn.textContent = originalText;
        btn.disabled = false;
        setTimeout(() => status.classList.remove('is-visible'), 5000);
      }, 1000);
    }

    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, []);

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
        .form-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; }
        .contact-submit { margin-top: 0.5rem; }
        .contact-submit:active { transform: scale(0.97); }
        .contact-submit:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
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

      <section className="page-hero">
        <img src="https://images.pexels.com/photos/7234682/pexels-photo-7234682.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="A hand rubbing oil finish into a wooden surface." />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">Contact</span>
          <h1>Questions before you order are always welcome.</h1>
          <p>Whether it&apos;s about a piece, timelines, or something you&apos;re not sure exists yet — write to us directly.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container contact-grid">
          <div className="contact-details">
            <div className="contact-info-block reveal">
              <h3>Email</h3>
              <p><a href="mailto:hello@teakle.in">hello@teakle.in</a></p>
            </div>
            <div className="contact-info-block reveal">
              <h3>Response Time</h3>
              <p>Within two working days</p>
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

          <form ref={formRef} className="contact-form reveal" id="contactForm">
            <div className="form-two-col">
              <div className="form-row">
                <label htmlFor="contactName">Name</label>
                <input type="text" id="contactName" name="name" required />
              </div>
              <div className="form-row">
                <label htmlFor="contactEmail">Email</label>
                <input type="email" id="contactEmail" name="email" required />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="contactSubject">Subject</label>
              <input type="text" id="contactSubject" name="subject" required />
            </div>
            <div className="form-row">
              <label htmlFor="contactMessage">Message</label>
              <textarea id="contactMessage" name="message" required></textarea>
            </div>
            <button type="submit" className="btn-primary contact-submit">Send Message</button>
            <p ref={statusRef} className="contact-form-status" id="contactFormStatus" role="status"></p>
          </form>
        </div>
      </section>
    </>
  );
}

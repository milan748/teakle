'use client';

import { useEffect, useRef } from 'react';

export default function TradeClient({ cms = {}, cmsKeys = [] }) {
  const formRef = useRef(null);
  const statusRef = useRef(null);
  const hero = cms.hero || {};
  const intro = cms.introduction || {};
  const heroDisabled = cmsKeys.includes('hero') && !cms.hero;
  const introDisabled = cmsKeys.includes('introduction') && !cms.introduction;

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
        status.textContent = 'Received. We will reply within a few days. (Demo mode — backend integration required.)';
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
        .trade-section {
          background: var(--bg-primary);
          padding: var(--space-lg) 0 6rem;
        }
        .trade-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        .trade-text p { color: var(--text-secondary); margin-bottom: var(--space-sm); line-height: var(--lh-relaxed); }
        .trade-list { border-top: var(--border-hair); margin-top: var(--space-md); }
        .trade-list-item {
          padding: 0.65rem 0;
          border-bottom: var(--border-hair);
          font-size: var(--text-body);
          color: var(--text-secondary);
          line-height: var(--lh-relaxed);
        }
        .trade-list-item strong { color: var(--text-primary); font-weight: 500; }

        .inquiry-form {
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
        .form-row select,
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
        .form-row textarea { resize: vertical; min-height: 80px; font-family: var(--font-body); }
        .form-row input:focus,
        .form-row select:focus,
        .form-row textarea:focus {
          outline: none;
          border-color: var(--bronze);
        }
        .form-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; }
        .inquiry-submit { margin-top: 0.5rem; }
        .inquiry-submit:active { transform: scale(0.97); }
        .inquiry-submit:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
        .trade-form-status {
          font-size: var(--text-caption);
          color: var(--forest);
          margin-top: 0.5rem;
          min-height: 1.2em;
          opacity: 0;
          transition: opacity var(--dur-fast) var(--ease);
        }
        .trade-form-status.is-visible { opacity: 1; }

        @media (max-width: 860px) {
          .trade-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .form-two-col { grid-template-columns: 1fr; }
          .form-row input, .form-row select, .form-row textarea { min-height: 44px; font-size: var(--text-body); line-height: var(--lh-relaxed); }
          .inquiry-form { padding: 1.25rem; }
        }
      `}</style>

      {!heroDisabled && (
      <section className="page-hero">
        <img src={hero.image || "https://images.pexels.com/photos/12278576/pexels-photo-12278576.jpeg?auto=compress&cs=tinysrgb&w=1600"} alt="Stacked timber boards drying in a workshop." />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">{hero.eyebrow || 'Trade & Bulk Inquiries'}</span>
          <h1>{hero.title || 'For projects that need more than one piece.'}</h1>
          <p>{hero.subtitle || "If you\u2019re furnishing a project \u2014 a home, a studio, a hospitality space \u2014 and need multiple pieces or something built to a specific size, tell us about it below."}</p>
        </div>
      </section>
      )}

      {!introDisabled && (
      <section className="trade-section">
        <div className="container trade-grid">
          <div className="trade-text">
            <span className="eyebrow reveal">{intro.eyebrow || 'How It Works'}</span>
            <h2 className="reveal" style={{ fontSize: 'clamp(1.5rem, 2.6vw, var(--text-h2))', margin: '0.5rem 0 var(--space-sm)', maxWidth: 'none' }}>{intro.title || 'A short conversation before anything is quoted.'}</h2>
            {(intro.body ? intro.body.split('\n').filter(Boolean) : [
              "Every custom or bulk piece starts with understanding the space it\u2019s going into \u2014 dimensions, use, and timeline. We\u2019ll reply with what\u2019s realistic before any commitment is made on either side.",
              'We take on a limited number of these projects at a time, since each one is still built by the same small team.'
            ]).map((p, i) => <p key={i} className="reveal">{p}</p>)}
            <div className="trade-list reveal">
              <div className="trade-list-item"><strong>Architects &amp; Interior Designers</strong> — custom sizing, finish matching, and trade-friendly timelines.</div>
              <div className="trade-list-item"><strong>Hospitality</strong> — consistent pieces across multiple units, built in batches.</div>
              <div className="trade-list-item"><strong>Bulk &amp; Repeat Orders</strong> — for homes or spaces needing several pieces at once.</div>
            </div>
          </div>

          <form ref={formRef} className="inquiry-form reveal" id="tradeForm">
            <div className="form-two-col">
              <div className="form-row">
                <label htmlFor="tradeName">Name</label>
                <input type="text" id="tradeName" name="name" required />
              </div>
              <div className="form-row">
                <label htmlFor="tradeEmail">Email</label>
                <input type="email" id="tradeEmail" name="email" required />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="tradeType">Project Type</label>
              <select id="tradeType" name="type" required defaultValue="">
                <option value="" disabled>Select one</option>
                <option value="residential">Residential / Home</option>
                <option value="architecture-design">Architecture / Interior Design</option>
                <option value="hospitality">Hospitality</option>
                <option value="bulk">Bulk / Repeat Order</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="tradeDetails">Tell us about the project</label>
              <textarea id="tradeDetails" name="details" placeholder="Number of pieces, timeline, and any sizing needs." required></textarea>
            </div>
            <button type="submit" className="btn-primary inquiry-submit">Send Inquiry</button>
            <p ref={statusRef} className="trade-form-status" id="tradeFormStatus" role="status"></p>
          </form>
        </div>
      </section>
      )}
    </>
  );
}

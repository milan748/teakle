'use client';

export default function GlobalError({ error, reset }) {
  return (
    <>
      <style>{`
        .err-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: var(--space-lg);
        }
        .err-inner { text-align: center; max-width: 480px; }
        .err-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto var(--space-md);
          color: var(--bronze);
          opacity: 0.35;
        }
        .err-title {
          font-family: var(--font-display);
          font-size: var(--text-h2);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--space-sm);
        }
        .err-desc {
          font-size: var(--text-body);
          color: var(--text-secondary);
          margin: 0 0 var(--space-md);
          line-height: var(--lh-relaxed);
        }
        .err-btn {
          display: inline-block;
          font-family: var(--font-body);
          font-size: var(--text-label);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--bg-primary);
          background: var(--walnut);
          border: 1px solid var(--walnut);
          padding: 0.75rem 1.75rem;
          cursor: pointer;
          transition: background 200ms var(--ease);
        }
        .err-btn:hover { background: var(--forest); }
        .err-btn:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
      `}</style>

      <section className="err-page">
        <div className="err-inner">
          <svg className="err-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h1 className="err-title">Something went wrong</h1>
          <p className="err-desc">
            An unexpected error occurred. Please try again.
          </p>
          <button className="err-btn" onClick={() => reset()}>
            Try Again
          </button>
        </div>
      </section>
    </>
  );
}

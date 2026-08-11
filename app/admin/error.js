'use client';

export default function AdminError({ error, reset }) {
  return (
    <>
      <style>{`
        .adm-err {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
        }
        .adm-err-box { text-align: center; max-width: 480px; }
        .adm-err-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto var(--space-md);
          color: var(--bronze);
          opacity: 0.35;
        }
        .adm-err-title {
          font-family: var(--font-display);
          font-size: var(--text-h3);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--space-sm);
        }
        .adm-err-desc {
          font-size: var(--text-body);
          color: var(--text-secondary);
          margin: 0 0 var(--space-md);
          line-height: var(--lh-relaxed);
        }
        .adm-err-code {
          font-family: monospace;
          font-size: 12px;
          color: var(--text-secondary);
          opacity: 0.7;
          margin-bottom: var(--space-md);
          word-break: break-all;
        }
        .adm-err-btn {
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
        .adm-err-btn:hover { background: var(--forest); }
      `}</style>

      <section className="adm-err">
        <div className="adm-err-box">
          <svg className="adm-err-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h1 className="adm-err-title">Admin Panel Error</h1>
          <p className="adm-err-desc">
            An error occurred in the admin panel. Please try again.
          </p>
          {error?.message && (
            <p className="adm-err-code">{error.message}</p>
          )}
          <button className="adm-err-btn" onClick={() => reset()}>
            Try Again
          </button>
        </div>
      </section>
    </>
  );
}
